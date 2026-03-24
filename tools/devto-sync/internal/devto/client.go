package devto

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"
)

const defaultBaseURL = "https://dev.to"

// Client is a Dev.to API client.
type Client struct {
	apiKey  string
	baseURL string
	http    *http.Client

	// Rate limiting: separate buckets for create vs read/update.
	createLimiter *rateLimiter
	readLimiter   *rateLimiter
}

// Option configures the client.
type Option func(*Client)

// WithBaseURL sets a custom base URL (for testing).
func WithBaseURL(url string) Option {
	return func(c *Client) { c.baseURL = url }
}

// NewClient creates a new Dev.to API client.
func NewClient(apiKey string, opts ...Option) *Client {
	c := &Client{
		apiKey:        apiKey,
		baseURL:       defaultBaseURL,
		http:          &http.Client{Timeout: 30 * time.Second},
		createLimiter: newRateLimiter(3, 30*time.Second),
		readLimiter:   newRateLimiter(10, 30*time.Second),
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

// ListMyArticles returns all articles for the authenticated user.
// Handles pagination (Dev.to returns max 30 per page).
func (c *Client) ListMyArticles() ([]Article, error) {
	var all []Article
	page := 1
	for {
		c.readLimiter.wait()
		url := fmt.Sprintf("%s/api/articles/me/all?page=%d&per_page=30", c.baseURL, page)
		body, err := c.doRequest("GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("list articles page %d: %w", page, err)
		}
		var articles []Article
		if err := json.Unmarshal(body, &articles); err != nil {
			return nil, fmt.Errorf("decode articles: %w", err)
		}
		if len(articles) == 0 {
			break
		}
		all = append(all, articles...)
		page++
	}
	return all, nil
}

// GetArticle fetches a single article by ID.
func (c *Client) GetArticle(id int) (*Article, error) {
	c.readLimiter.wait()
	url := fmt.Sprintf("%s/api/articles/%d", c.baseURL, id)
	body, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("get article %d: %w", id, err)
	}
	var article Article
	if err := json.Unmarshal(body, &article); err != nil {
		return nil, fmt.Errorf("decode article: %w", err)
	}
	return &article, nil
}

// CreateArticle creates a new article. Returns the created article.
func (c *Client) CreateArticle(req ArticleCreate) (*Article, error) {
	c.createLimiter.wait()
	url := fmt.Sprintf("%s/api/articles", c.baseURL)
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("encode article: %w", err)
	}
	body, err := c.doRequest("POST", url, payload)
	if err != nil {
		return nil, fmt.Errorf("create article: %w", err)
	}
	var article Article
	if err := json.Unmarshal(body, &article); err != nil {
		return nil, fmt.Errorf("decode created article: %w", err)
	}
	return &article, nil
}

// UpdateArticle updates an existing article by ID. Returns the updated article.
func (c *Client) UpdateArticle(id int, req ArticleCreate) (*Article, error) {
	c.readLimiter.wait()
	url := fmt.Sprintf("%s/api/articles/%d", c.baseURL, id)
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("encode article: %w", err)
	}
	body, err := c.doRequest("PUT", url, payload)
	if err != nil {
		return nil, fmt.Errorf("update article %d: %w", id, err)
	}
	var article Article
	if err := json.Unmarshal(body, &article); err != nil {
		return nil, fmt.Errorf("decode updated article: %w", err)
	}
	return &article, nil
}

// ListComments returns all top-level comments for an article.
func (c *Client) ListComments(articleID int) ([]Comment, error) {
	c.readLimiter.wait()
	url := fmt.Sprintf("%s/api/comments?a_id=%d", c.baseURL, articleID)
	body, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("list comments for article %d: %w", articleID, err)
	}
	var comments []Comment
	if err := json.Unmarshal(body, &comments); err != nil {
		return nil, fmt.Errorf("decode comments: %w", err)
	}
	return comments, nil
}

// DeleteArticle deletes an article by ID.
func (c *Client) DeleteArticle(id int) error {
	c.readLimiter.wait()
	url := fmt.Sprintf("%s/api/articles/%d", c.baseURL, id)
	_, err := c.doRequest("DELETE", url, nil)
	return err
}

// CreateListing creates a new Dev.to listing. Returns the created listing.
func (c *Client) CreateListing(req ListingCreate) (*Listing, error) {
	c.createLimiter.wait()
	url := fmt.Sprintf("%s/api/listings", c.baseURL)
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("encode listing: %w", err)
	}
	body, err := c.doRequest("POST", url, payload)
	if err != nil {
		return nil, fmt.Errorf("create listing: %w", err)
	}
	var listing Listing
	if err := json.Unmarshal(body, &listing); err != nil {
		return nil, fmt.Errorf("decode listing: %w", err)
	}
	return &listing, nil
}

// ListTags returns tags from the Dev.to public tag registry.
func (c *Client) ListTags(page, perPage int) ([]Tag, error) {
	c.readLimiter.wait()
	url := fmt.Sprintf("%s/api/tags?page=%d&per_page=%d", c.baseURL, page, perPage)
	body, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("list tags page %d: %w", page, err)
	}
	var tags []Tag
	if err := json.Unmarshal(body, &tags); err != nil {
		return nil, fmt.Errorf("decode tags: %w", err)
	}
	return tags, nil
}

func (c *Client) doRequest(method, url string, payload []byte) ([]byte, error) {
	return c.doRequestWithRetry(method, url, payload, 1)
}

func (c *Client) doRequestWithRetry(method, url string, payload []byte, retriesLeft int) ([]byte, error) {
	var bodyReader io.Reader
	if payload != nil {
		bodyReader = bytes.NewReader(payload)
	}
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("api-key", c.apiKey)
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.http.Do(req)
	if err != nil {
		// Network error: retry once after 5s (spec 5.6)
		if retriesLeft > 0 {
			time.Sleep(5 * time.Second)
			return c.doRequestWithRetry(method, url, payload, retriesLeft-1)
		}
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	switch {
	case resp.StatusCode == 429:
		if retriesLeft > 0 {
			retryAfter := resp.Header.Get("Retry-After")
			secs, _ := strconv.Atoi(retryAfter)
			if secs == 0 {
				secs = 30
			}
			time.Sleep(time.Duration(secs) * time.Second)
			return c.doRequestWithRetry(method, url, payload, retriesLeft-1)
		}
		return nil, &APIError{StatusCode: resp.StatusCode, Body: string(body)}
	case resp.StatusCode >= 400:
		return nil, &APIError{StatusCode: resp.StatusCode, Body: string(body)}
	}
	return body, nil
}

// APIError represents a non-2xx response from Dev.to.
type APIError struct {
	StatusCode int
	Body       string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("dev.to API error %d: %s", e.StatusCode, e.Body)
}

// rateLimiter implements a simple token bucket.
type rateLimiter struct {
	mu       sync.Mutex
	tokens   int
	max      int
	interval time.Duration
	last     time.Time
}

func newRateLimiter(max int, interval time.Duration) *rateLimiter {
	return &rateLimiter{tokens: max, max: max, interval: interval, last: time.Now()}
}

func (r *rateLimiter) wait() {
	r.mu.Lock()

	now := time.Now()
	elapsed := now.Sub(r.last)
	if elapsed >= r.interval {
		r.tokens = r.max
		r.last = now
	}

	if r.tokens <= 0 {
		sleepTime := r.interval - elapsed
		r.mu.Unlock()
		time.Sleep(sleepTime)
		r.mu.Lock()
		r.tokens = r.max
		r.last = time.Now()
	}
	r.tokens--
	r.mu.Unlock()
}
