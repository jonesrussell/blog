# Dev.to Bidirectional Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Go CLI tool (`devto-sync`) that bidirectionally syncs blog posts between a Hugo blog and Dev.to, with automated push on merge to main.

**Architecture:** A Go CLI in `tools/devto-sync/` with four subcommands (push, pull, status, triage). The Hugo blog is always canonical — Dev.to gets `canonical_url` back to the blog. Sync state lives in Hugo frontmatter (`devto_id`), not in external databases. A GitHub Actions workflow replaces the existing bash-based `devto.yml`.

**Tech Stack:** Go 1.26, Cobra CLI, gopkg.in/yaml.v3, standard library HTTP client, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-03-22-devto-sync-design.md`

**Existing code being replaced:** `.github/workflows/devto.yml` (bash-based push sync)

**Blog content categories:** ai, cursor, devops, docker, general, go, laravel, psr

---

## File Map

| File | Responsibility |
|---|---|
| `tools/devto-sync/main.go` | Entrypoint, cobra root command |
| `tools/devto-sync/cmd/root.go` | Root command with global flags (--dry-run, --content-dir) |
| `tools/devto-sync/cmd/push.go` | Push subcommand (blog → Dev.to) |
| `tools/devto-sync/cmd/pull.go` | Pull subcommand (Dev.to → blog) |
| `tools/devto-sync/cmd/status.go` | Status subcommand (sync state comparison) |
| `tools/devto-sync/cmd/triage.go` | Triage subcommand (archive/update/replace proposals) |
| `tools/devto-sync/internal/devto/client.go` | Dev.to API client (CRUD, rate limiting, auth) |
| `tools/devto-sync/internal/devto/client_test.go` | API client tests (httptest server) |
| `tools/devto-sync/internal/devto/types.go` | Dev.to API request/response types |
| `tools/devto-sync/internal/hugo/content.go` | Hugo frontmatter parser + page bundle reader/writer |
| `tools/devto-sync/internal/hugo/content_test.go` | Content parser tests |
| `tools/devto-sync/internal/hugo/transform.go` | Shortcode → markdown transformation |
| `tools/devto-sync/internal/hugo/transform_test.go` | Shortcode transform tests |
| `tools/devto-sync/internal/sync/engine.go` | Sync logic (push/pull/status/triage orchestration) |
| `tools/devto-sync/internal/sync/engine_test.go` | Sync engine tests |
| `tools/devto-sync/go.mod` | Module definition |
| `.github/workflows/devto-sync.yml` | GitHub Actions workflow (replaces devto.yml) |
| `Taskfile.yml` | New devto:* tasks added |

---

## Task 1: Go Module Scaffold + Root Command

**Files:**
- Create: `tools/devto-sync/go.mod`
- Create: `tools/devto-sync/main.go`
- Create: `tools/devto-sync/cmd/root.go`

- [ ] **Step 1: Initialize Go module**

```bash
cd tools/devto-sync
go mod init github.com/jonesrussell/blog/tools/devto-sync
```

- [ ] **Step 2: Add cobra dependency**

```bash
cd tools/devto-sync
go get github.com/spf13/cobra@latest
```

- [ ] **Step 3: Create root command**

Write `tools/devto-sync/cmd/root.go`:

```go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	dryRun     bool
	contentDir string
	baseURL    string
)

var rootCmd = &cobra.Command{
	Use:   "devto-sync",
	Short: "Bidirectional sync between Hugo blog and Dev.to",
	Long:  "Syncs blog posts between a Hugo blog (canonical) and Dev.to. Blog always wins.",
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVar(&dryRun, "dry-run", false, "Log what would happen without making changes")
	rootCmd.PersistentFlags().StringVar(&contentDir, "content-dir", "content/posts", "Path to Hugo content directory")
	rootCmd.PersistentFlags().StringVar(&baseURL, "base-url", "https://jonesrussell.github.io/blog", "Blog base URL for canonical links")
}
```

- [ ] **Step 4: Create main.go entrypoint**

Write `tools/devto-sync/main.go`:

```go
package main

import "github.com/jonesrussell/blog/tools/devto-sync/cmd"

func main() {
	cmd.Execute()
}
```

- [ ] **Step 5: Verify it builds and runs**

```bash
cd tools/devto-sync
go vet ./...
go build -o devto-sync .
./devto-sync --help
```

Expected: `go vet` passes clean, then help text showing "Bidirectional sync between Hugo blog and Dev.to" with `--dry-run`, `--content-dir`, `--base-url` flags.

- [ ] **Step 6: Commit**

```bash
git add tools/devto-sync/
git commit -m "feat(devto-sync): scaffold Go module with root command"
```

---

## Task 2: Dev.to API Types + Client

**Files:**
- Create: `tools/devto-sync/internal/devto/types.go`
- Create: `tools/devto-sync/internal/devto/client.go`
- Create: `tools/devto-sync/internal/devto/client_test.go`

- [ ] **Step 1: Write API types**

Write `tools/devto-sync/internal/devto/types.go`:

```go
package devto

// Article represents a Dev.to article (response).
// Note: Dev.to returns tags differently per endpoint:
//   - List endpoints (/articles/me/all): "tag_list" is a comma-separated string
//   - Single article (/articles/{id}): "tags" is an array
// We use Tags (tag_list) for list responses since that's our primary read path.
// For pull (single article), parse Tags string with splitTags().
type Article struct {
	ID           int    `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Published    bool   `json:"published"`
	URL          string `json:"url"`
	CanonicalURL string `json:"canonical_url"`
	Slug         string `json:"slug"`
	BodyMarkdown string `json:"body_markdown"`
	Tags         string `json:"tag_list"`          // comma-separated string (list endpoints)
	Series       *string `json:"series"`            // nullable
	PublishedAt  string  `json:"published_at"`
}

// ArticleCreate is the request body for creating/updating articles.
type ArticleCreate struct {
	Article ArticleBody `json:"article"`
}

// ArticleBody contains the fields for create/update.
type ArticleBody struct {
	Title        string   `json:"title"`
	BodyMarkdown string   `json:"body_markdown"`
	Published    bool     `json:"published"`
	Tags         []string `json:"tags"`
	Description  string   `json:"description,omitempty"`
	CanonicalURL string   `json:"canonical_url,omitempty"`
	Series       string   `json:"series,omitempty"`
}
```

- [ ] **Step 2: Write failing test for Client.ListMyArticles**

Write `tools/devto-sync/internal/devto/client_test.go`:

```go
package devto_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
)

func TestListMyArticles(t *testing.T) {
	articles := []devto.Article{
		{ID: 1, Title: "Test Post", Published: true},
		{ID: 2, Title: "Draft Post", Published: false},
	}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("api-key") != "test-key" {
			t.Errorf("expected api-key header, got %q", r.Header.Get("api-key"))
		}
		if r.URL.Path != "/api/articles/me/all" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		json.NewEncoder(w).Encode(articles)
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.ListMyArticles()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("expected 2 articles, got %d", len(result))
	}
	if result[0].Title != "Test Post" {
		t.Errorf("expected 'Test Post', got %q", result[0].Title)
	}
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd tools/devto-sync
go test ./internal/devto/ -v -run TestListMyArticles
```

Expected: FAIL — `NewClient` not defined.

- [ ] **Step 4: Implement Client with ListMyArticles, GetArticle, CreateArticle, UpdateArticle**

Write `tools/devto-sync/internal/devto/client.go`:

```go
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
		createLimiter: newRateLimiter(10, 30*time.Second),
		readLimiter:   newRateLimiter(30, 30*time.Second),
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
	defer r.mu.Unlock()

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
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd tools/devto-sync
go test ./internal/devto/ -v -run TestListMyArticles
```

Expected: PASS

- [ ] **Step 6: Write tests for CreateArticle and UpdateArticle**

Add to `client_test.go`:

```go
func TestCreateArticle(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		var req devto.ArticleCreate
		json.NewDecoder(r.Body).Decode(&req)
		resp := devto.Article{
			ID:    42,
			Title: req.Article.Title,
			URL:   "https://dev.to/test/post-42",
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.CreateArticle(devto.ArticleCreate{
		Article: devto.ArticleBody{
			Title:        "New Post",
			BodyMarkdown: "Hello world",
			Published:    true,
			Tags:         []string{"go", "testing"},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 42 {
		t.Errorf("expected ID 42, got %d", result.ID)
	}
}

func TestUpdateArticle(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "PUT" {
			t.Errorf("expected PUT, got %s", r.Method)
		}
		if r.URL.Path != "/api/articles/42" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		resp := devto.Article{ID: 42, Title: "Updated Post"}
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.UpdateArticle(42, devto.ArticleCreate{
		Article: devto.ArticleBody{Title: "Updated Post", BodyMarkdown: "Updated", Published: true},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Title != "Updated Post" {
		t.Errorf("expected 'Updated Post', got %q", result.Title)
	}
}

func TestAPIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(422)
		w.Write([]byte(`{"error":"Title is too short"}`))
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	_, err := client.CreateArticle(devto.ArticleCreate{
		Article: devto.ArticleBody{Title: "X"},
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	apiErr, ok := err.(*devto.APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != 422 {
		t.Errorf("expected 422, got %d", apiErr.StatusCode)
	}
}
```

- [ ] **Step 7: Run all client tests**

```bash
cd tools/devto-sync
go test ./internal/devto/ -v
```

Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add tools/devto-sync/internal/devto/
git commit -m "feat(devto-sync): Dev.to API client with rate limiting and tests"
```

---

## Task 3: Hugo Content Parser + Writer

**Files:**
- Create: `tools/devto-sync/internal/hugo/content.go`
- Create: `tools/devto-sync/internal/hugo/content_test.go`

- [ ] **Step 1: Add yaml.v3 dependency**

```bash
cd tools/devto-sync
go get gopkg.in/yaml.v3
```

- [ ] **Step 2: Write failing test for ParsePost**

Write `tools/devto-sync/internal/hugo/content_test.go`:

```go
package hugo_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
)

func TestParsePost(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "test-post")
	os.MkdirAll(postDir, 0o755)

	content := `---
title: "Test Post"
date: 2026-03-22
tags: ["go", "testing"]
summary: "A test post"
slug: "test-post"
draft: false
devto: true
devto_id: 42
series: ["go-series"]
---

Hello world!
`
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(content), 0o644)

	post, err := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.Title != "Test Post" {
		t.Errorf("expected 'Test Post', got %q", post.Title)
	}
	if post.DevtoID != 42 {
		t.Errorf("expected devto_id 42, got %d", post.DevtoID)
	}
	if !post.Devto {
		t.Error("expected devto=true")
	}
	if post.Draft {
		t.Error("expected draft=false")
	}
	if post.Body != "\nHello world!\n" {
		t.Errorf("unexpected body: %q", post.Body)
	}
	if post.Slug != "test-post" {
		t.Errorf("expected slug 'test-post', got %q", post.Slug)
	}
	if len(post.Series) != 1 || post.Series[0] != "go-series" {
		t.Errorf("unexpected series: %v", post.Series)
	}
	if post.Category != "go" {
		t.Errorf("expected category 'go', got %q", post.Category)
	}
}

func TestParsePostDefaultDevto(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "general", "no-devto")
	os.MkdirAll(postDir, 0o755)

	// No devto field — should default to true
	content := `---
title: "No Devto Field"
slug: "no-devto"
draft: false
---

Content.
`
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(content), 0o644)

	post, err := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !post.Devto {
		t.Error("expected devto=true when field is missing")
	}
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd tools/devto-sync
go test ./internal/hugo/ -v -run TestParsePost
```

Expected: FAIL — `hugo.ParsePost` not defined.

- [ ] **Step 4: Implement content.go**

Write `tools/devto-sync/internal/hugo/content.go`:

```go
package hugo

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// Post represents a parsed Hugo blog post.
type Post struct {
	// Frontmatter fields
	Title    string   `yaml:"title"`
	Date     string   `yaml:"date"`
	Tags     []string `yaml:"tags"`
	Summary  string   `yaml:"summary"`
	Slug     string   `yaml:"slug"`
	Draft    bool     `yaml:"draft"`
	Devto    *bool    `yaml:"devto,omitempty"`
	DevtoID  int      `yaml:"devto_id,omitempty"`
	Series   []string `yaml:"series"`
	Archived bool     `yaml:"archived,omitempty"`

	// Derived fields (not in frontmatter)
	Body     string `yaml:"-"`
	FilePath string `yaml:"-"`
	Category string `yaml:"-"` // derived from directory structure

	// Raw frontmatter for round-tripping unknown fields
	RawFrontmatter map[string]interface{} `yaml:"-"`
}

// ShouldSync returns true if this post should be synced to Dev.to.
func (p *Post) ShouldSync() bool {
	return p.DevtoEnabled() && !p.Archived
}

// DevtoEnabled returns true if devto sync is enabled (defaults to true if field is missing).
func (p *Post) DevtoEnabled() bool {
	if p.Devto == nil {
		return true
	}
	return *p.Devto
}

// ParsePost reads and parses a Hugo page bundle index.md file.
func ParsePost(path string) (*Post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}

	content := string(data)
	parts := strings.SplitN(content, "---\n", 3)
	if len(parts) < 3 {
		return nil, fmt.Errorf("invalid frontmatter in %s: expected --- delimiters", path)
	}

	frontmatterStr := parts[1]
	body := parts[2]

	var post Post
	if err := yaml.Unmarshal([]byte(frontmatterStr), &post); err != nil {
		return nil, fmt.Errorf("parse frontmatter in %s: %w", path, err)
	}

	// Preserve raw frontmatter for round-tripping
	var raw map[string]interface{}
	if err := yaml.Unmarshal([]byte(frontmatterStr), &raw); err != nil {
		return nil, fmt.Errorf("parse raw frontmatter: %w", err)
	}
	post.RawFrontmatter = raw

	post.Body = body
	post.FilePath = path

	// Derive category from directory structure: content/posts/<category>/<slug>/index.md
	dir := filepath.Dir(path)
	parent := filepath.Dir(dir)
	post.Category = filepath.Base(parent)

	return &post, nil
}

// ListPosts finds all index.md files under the given content directory.
func ListPosts(contentDir string) ([]*Post, error) {
	var posts []*Post
	err := filepath.Walk(contentDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == "index.md" && !info.IsDir() {
			post, parseErr := ParsePost(path)
			if parseErr != nil {
				return parseErr
			}
			posts = append(posts, post)
		}
		return nil
	})
	return posts, err
}

// WriteDevtoID writes/updates the devto_id field in a post's frontmatter.
func WriteDevtoID(path string, devtoID int) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}

	content := string(data)
	parts := strings.SplitN(content, "---\n", 3)
	if len(parts) < 3 {
		return fmt.Errorf("invalid frontmatter in %s", path)
	}

	frontmatterStr := parts[1]
	body := parts[2]

	var raw map[string]interface{}
	if err := yaml.Unmarshal([]byte(frontmatterStr), &raw); err != nil {
		return fmt.Errorf("parse frontmatter: %w", err)
	}

	raw["devto_id"] = devtoID

	newFM, err := yaml.Marshal(raw)
	if err != nil {
		return fmt.Errorf("marshal frontmatter: %w", err)
	}

	newContent := "---\n" + string(newFM) + "---\n" + body
	return os.WriteFile(path, []byte(newContent), 0o644)
}

// CreatePageBundle creates a new Hugo page bundle at the given path.
func CreatePageBundle(contentDir, category, slug string, frontmatter map[string]interface{}, body string) (string, error) {
	postDir := filepath.Join(contentDir, category, slug)
	if err := os.MkdirAll(postDir, 0o755); err != nil {
		return "", fmt.Errorf("create directory %s: %w", postDir, err)
	}

	fm, err := yaml.Marshal(frontmatter)
	if err != nil {
		return "", fmt.Errorf("marshal frontmatter: %w", err)
	}

	filePath := filepath.Join(postDir, "index.md")
	content := "---\n" + string(fm) + "---\n" + body
	if err := os.WriteFile(filePath, []byte(content), 0o644); err != nil {
		return "", fmt.Errorf("write %s: %w", filePath, err)
	}
	return filePath, nil
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd tools/devto-sync
go test ./internal/hugo/ -v
```

Expected: All PASS

- [ ] **Step 6: Write test for WriteDevtoID round-tripping**

Add to `content_test.go`:

```go
func TestWriteDevtoID(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "test-post")
	os.MkdirAll(postDir, 0o755)

	content := `---
title: "Test Post"
slug: "test-post"
draft: false
devto: true
---

Body here.
`
	filePath := filepath.Join(postDir, "index.md")
	os.WriteFile(filePath, []byte(content), 0o644)

	err := hugo.WriteDevtoID(filePath, 12345)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	post, err := hugo.ParsePost(filePath)
	if err != nil {
		t.Fatalf("failed to re-parse: %v", err)
	}
	if post.DevtoID != 12345 {
		t.Errorf("expected devto_id 12345, got %d", post.DevtoID)
	}
	if post.Title != "Test Post" {
		t.Errorf("title lost during round-trip: %q", post.Title)
	}
}
```

- [ ] **Step 7: Run all hugo tests**

```bash
cd tools/devto-sync
go test ./internal/hugo/ -v
```

Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add tools/devto-sync/internal/hugo/content.go tools/devto-sync/internal/hugo/content_test.go tools/devto-sync/go.mod tools/devto-sync/go.sum
git commit -m "feat(devto-sync): Hugo content parser with frontmatter round-tripping"
```

---

## Task 4: Shortcode Transformer

**Files:**
- Create: `tools/devto-sync/internal/hugo/transform.go`
- Create: `tools/devto-sync/internal/hugo/transform_test.go`

- [ ] **Step 1: Write failing test for TransformForDevto**

Write `tools/devto-sync/internal/hugo/transform_test.go`:

```go
package hugo_test

import (
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
)

func TestTransformRelref(t *testing.T) {
	input := `Check out {{< relref "my-other-post" >}} for details.`
	expected := `Check out https://jonesrussell.github.io/blog/my-other-post/ for details.`

	result, warnings := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
	if len(warnings) != 0 {
		t.Errorf("unexpected warnings: %v", warnings)
	}
}

func TestTransformRef(t *testing.T) {
	input := `See {{< ref "another-post" >}} here.`
	expected := `See https://jonesrussell.github.io/blog/another-post/ here.`

	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
}

func TestTransformUnknownShortcode(t *testing.T) {
	input := `Before {{< custom-thing arg="val" >}}inner content{{< /custom-thing >}} after.`
	expected := `Before inner content after.`

	result, warnings := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
	if len(warnings) != 1 {
		t.Fatalf("expected 1 warning, got %d", len(warnings))
	}
}

func TestTransformRelativeImages(t *testing.T) {
	input := `![Screenshot](screenshot.png)`
	expected := `![Screenshot](https://jonesrussell.github.io/blog/go/my-post/screenshot.png)`

	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "go/my-post")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
}

func TestTransformAbsoluteImagesUntouched(t *testing.T) {
	input := `![Logo](https://example.com/logo.png)`
	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "go/my-post")
	if result != input {
		t.Errorf("absolute image URL should be untouched, got:\n%s", result)
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd tools/devto-sync
go test ./internal/hugo/ -v -run TestTransform
```

Expected: FAIL — `hugo.TransformForDevto` not defined.

- [ ] **Step 3: Implement transform.go**

Write `tools/devto-sync/internal/hugo/transform.go`:

```go
package hugo

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	// {{< relref "slug" >}} or {{< ref "slug" >}}
	relrefRe = regexp.MustCompile(`\{\{<\s*(?:relref|ref)\s+"([^"]+)"\s*>\}\}`)

	// {{< shortcode >}}...{{< /shortcode >}} (paired)
	pairedShortcodeRe = regexp.MustCompile(`\{\{<\s*(\w[\w-]*)[^>]*>\}\}([\s\S]*?)\{\{<\s*/\1\s*>\}\}`)

	// {{< shortcode >}} (self-closing, no pair)
	selfClosingShortcodeRe = regexp.MustCompile(`\{\{<\s*\w[\w-]*[^>]*>\}\}`)

	// ![alt](relative-path) where path doesn't start with http
	relativeImageRe = regexp.MustCompile(`(!\[[^\]]*\])\((?!https?://)([^)]+)\)`)
)

// TransformForDevto converts Hugo-specific markdown to standard markdown for Dev.to.
// Returns the transformed content and a list of warnings for stripped shortcodes.
// postPath is the relative path from content/posts/ (e.g., "go/my-post") for resolving images.
func TransformForDevto(content, baseURL, postPath string) (string, []string) {
	var warnings []string

	// 1. Transform relref/ref shortcodes to full URLs
	result := relrefRe.ReplaceAllStringFunc(content, func(match string) string {
		submatch := relrefRe.FindStringSubmatch(match)
		slug := submatch[1]
		return fmt.Sprintf("%s/%s/", baseURL, slug)
	})

	// 2. Strip paired unknown shortcodes, keep inner content
	result = pairedShortcodeRe.ReplaceAllStringFunc(result, func(match string) string {
		submatch := pairedShortcodeRe.FindStringSubmatch(match)
		name := submatch[1]
		inner := submatch[2]
		warnings = append(warnings, fmt.Sprintf("stripped paired shortcode: %s", name))
		return inner
	})

	// 3. Strip remaining self-closing unknown shortcodes
	result = selfClosingShortcodeRe.ReplaceAllStringFunc(result, func(match string) string {
		warnings = append(warnings, fmt.Sprintf("stripped self-closing shortcode: %s", match))
		return ""
	})

	// 4. Resolve relative image paths to full URLs
	if postPath != "" {
		result = relativeImageRe.ReplaceAllStringFunc(result, func(match string) string {
			submatch := relativeImageRe.FindStringSubmatch(match)
			altPart := submatch[1]
			relPath := submatch[2]
			return fmt.Sprintf("%s(%s/%s/%s)", altPart, baseURL, postPath, relPath)
		})
	}

	return result, warnings
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd tools/devto-sync
go test ./internal/hugo/ -v -run TestTransform
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add tools/devto-sync/internal/hugo/transform.go tools/devto-sync/internal/hugo/transform_test.go
git commit -m "feat(devto-sync): shortcode transformer for Dev.to markdown"
```

---

## Task 5: Sync Engine

**Files:**
- Create: `tools/devto-sync/internal/sync/engine.go`
- Create: `tools/devto-sync/internal/sync/engine_test.go`

- [ ] **Step 1: Write failing test for PushPost**

Write `tools/devto-sync/internal/sync/engine_test.go`:

```go
package sync_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
)

func TestPushNewPost(t *testing.T) {
	var receivedReq devto.ArticleCreate
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			json.NewDecoder(r.Body).Decode(&receivedReq)
			resp := devto.Article{ID: 99, Title: receivedReq.Article.Title}
			json.NewEncoder(w).Encode(resp)
			return
		}
		w.WriteHeader(404)
	}))
	defer srv.Close()

	// Create a test post
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "new-post")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "New Post"
slug: "new-post"
tags: ["go"]
summary: "A new post"
draft: false
devto: true
---

Hello Dev.to!
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 99 {
		t.Errorf("expected ID 99, got %d", result.ID)
	}
	if receivedReq.Article.CanonicalURL != "https://jonesrussell.github.io/blog/new-post/" {
		t.Errorf("unexpected canonical URL: %s", receivedReq.Article.CanonicalURL)
	}
	if !receivedReq.Article.Published {
		t.Error("expected published=true for non-draft post")
	}
}

func TestPushExistingPost(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" && r.URL.Path == "/api/articles/42" {
			resp := devto.Article{ID: 42, Title: "Updated"}
			json.NewEncoder(w).Encode(resp)
			return
		}
		w.WriteHeader(404)
	}))
	defer srv.Close()

	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "existing")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "Existing Post"
slug: "existing"
draft: false
devto: true
devto_id: 42
---

Updated content.
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 42 {
		t.Errorf("expected ID 42, got %d", result.ID)
	}
}

func TestPushDryRun(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("API should not be called during dry run")
	}))
	defer srv.Close()

	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "dry-run")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "Dry Run Post"
slug: "dry-run"
draft: false
devto: true
---

Content.
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, true) // dry-run=true
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != nil {
		t.Error("expected nil result for dry run")
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd tools/devto-sync
go test ./internal/sync/ -v -run TestPush
```

Expected: FAIL — `sync.NewEngine` not defined.

- [ ] **Step 3: Implement engine.go**

Write `tools/devto-sync/internal/sync/engine.go`:

```go
package sync

import (
	"fmt"
	"log"
	"path/filepath"
	"strings"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
)

// Engine orchestrates sync operations between Hugo and Dev.to.
type Engine struct {
	client  *devto.Client
	baseURL string
}

// NewEngine creates a new sync engine.
func NewEngine(client *devto.Client, baseURL string) *Engine {
	return &Engine{client: client, baseURL: baseURL}
}

// PushPost pushes a single blog post to Dev.to. Creates if no devto_id, updates otherwise.
// Returns nil article for dry-run mode.
func (e *Engine) PushPost(post *hugo.Post, dryRun bool) (*devto.Article, error) {
	if !post.ShouldSync() {
		return nil, fmt.Errorf("post %q is not eligible for sync (devto=%v, archived=%v)", post.Slug, post.DevtoEnabled(), post.Archived)
	}

	// Derive the post path for image resolution (e.g., "go/my-post")
	postPath := filepath.Join(post.Category, post.Slug)

	body, warnings := hugo.TransformForDevto(post.Body, e.baseURL, postPath)
	for _, w := range warnings {
		log.Printf("WARNING [%s]: %s", post.Slug, w)
	}

	canonicalURL := fmt.Sprintf("%s/%s/", e.baseURL, post.Slug)

	var series string
	if len(post.Series) > 0 {
		series = post.Series[0]
	}

	// Cap tags at 4 (Dev.to limit)
	tags := post.Tags
	if len(tags) > 4 {
		tags = tags[:4]
	}

	req := devto.ArticleCreate{
		Article: devto.ArticleBody{
			Title:        post.Title,
			BodyMarkdown: body,
			Published:    !post.Draft,
			Tags:         tags,
			Description:  post.Summary,
			CanonicalURL: canonicalURL,
			Series:       series,
		},
	}

	if dryRun {
		action := "create"
		if post.DevtoID > 0 {
			action = fmt.Sprintf("update (id=%d)", post.DevtoID)
		}
		log.Printf("[DRY RUN] Would %s: %s (canonical: %s)", action, post.Title, canonicalURL)
		return nil, nil
	}

	if post.DevtoID > 0 {
		article, err := e.client.UpdateArticle(post.DevtoID, req)
		if err != nil {
			return nil, fmt.Errorf("update %q (id=%d): %w", post.Slug, post.DevtoID, err)
		}
		log.Printf("Updated: %s (id=%d)", post.Title, article.ID)
		return article, nil
	}

	article, err := e.client.CreateArticle(req)
	if err != nil {
		return nil, fmt.Errorf("create %q: %w", post.Slug, err)
	}
	log.Printf("Created: %s (id=%d, url=%s)", post.Title, article.ID, article.URL)
	return article, nil
}

// StatusResult represents the sync state of a single post.
type StatusResult struct {
	Slug        string
	BlogTitle   string
	DevtoID     int
	DevtoTitle  string
	HasDevtoID  bool
	OnDevto     bool
	Synced      bool
	CanonicalOK bool
	Drift       string // description of content differences, empty if synced
}

// Status compares local posts against Dev.to state.
func (e *Engine) Status(posts []*hugo.Post) ([]StatusResult, error) {
	devtoArticles, err := e.client.ListMyArticles()
	if err != nil {
		return nil, fmt.Errorf("list dev.to articles: %w", err)
	}

	// Index by ID for quick lookup
	byID := make(map[int]devto.Article)
	for _, a := range devtoArticles {
		byID[a.ID] = a
	}

	var results []StatusResult
	for _, post := range posts {
		if !post.ShouldSync() {
			continue
		}

		r := StatusResult{
			Slug:       post.Slug,
			BlogTitle:  post.Title,
			DevtoID:    post.DevtoID,
			HasDevtoID: post.DevtoID > 0,
		}

		if post.DevtoID > 0 {
			if article, ok := byID[post.DevtoID]; ok {
				r.OnDevto = true
				r.DevtoTitle = article.Title
				expectedCanonical := fmt.Sprintf("%s/%s/", e.baseURL, post.Slug)
				r.CanonicalOK = article.CanonicalURL == expectedCanonical

				if article.Title != post.Title {
					r.Drift = fmt.Sprintf("title mismatch: blog=%q devto=%q", post.Title, article.Title)
				} else {
					r.Synced = true
				}
			} else {
				r.Drift = fmt.Sprintf("devto_id=%d not found on Dev.to", post.DevtoID)
			}
		}

		results = append(results, r)
	}
	return results, nil
}

// TriageResult represents a triage recommendation for an imported post.
type TriageResult struct {
	Slug      string
	Title     string
	Published string
	Action    string // "keep", "update", "replace"
	Reason    string
}

// Triage analyzes posts and recommends keep/update/replace actions.
func (e *Engine) Triage(posts []*hugo.Post) []TriageResult {
	var results []TriageResult

	currentTopics := map[string]bool{
		"go": true, "laravel": true, "docker": true, "ai": true,
		"psr": true, "devops": true, "cursor": true,
	}
	adjacentTopics := map[string]bool{
		"general": true,
	}

	now := time.Now()

	for _, post := range posts {
		r := TriageResult{
			Slug:      post.Slug,
			Title:     post.Title,
			Published: post.Date,
		}

		// Score factors
		wordCount := len(strings.Fields(post.Body))
		hasCode := strings.Contains(post.Body, "```")
		isCurrent := currentTopics[post.Category]
		isAdjacent := adjacentTopics[post.Category]

		// Age factor (spec 8.2): < 1y = keep, 1-3y = update, > 3y = replace
		var ageYears float64
		if pubDate, err := time.Parse("2006-01-02", post.Date); err == nil {
			ageYears = now.Sub(pubDate).Hours() / (24 * 365.25)
		}
		isOld := ageYears > 3
		isMidAge := ageYears >= 1 && ageYears <= 3

		// Determine action — multiple factors combine (spec 8.2)
		switch {
		case isCurrent && wordCount > 500 && hasCode && !isOld:
			r.Action = "keep"
			r.Reason = fmt.Sprintf("Current topic (%s), %d words with code, %.1fy old", post.Category, wordCount, ageYears)
		case isCurrent && (wordCount > 300 || hasCode):
			r.Action = "update"
			r.Reason = fmt.Sprintf("Current topic (%s), may need refresh (%d words, %.1fy old)", post.Category, wordCount, ageYears)
		case isAdjacent && wordCount > 300 && !isOld:
			r.Action = "update"
			r.Reason = fmt.Sprintf("Adjacent topic (%s), %d words, %.1fy old", post.Category, wordCount, ageYears)
		case isOld && (wordCount < 300 || !hasCode):
			r.Action = "replace"
			r.Reason = fmt.Sprintf("Old post (%.1fy), %d words, %s", ageYears, wordCount, post.Category)
		case wordCount < 300 && !hasCode:
			r.Action = "replace"
			r.Reason = fmt.Sprintf("Short post (%d words, no code blocks)", wordCount)
		case !isCurrent && !isAdjacent:
			r.Action = "replace"
			r.Reason = fmt.Sprintf("Deprecated topic (%s), %.1fy old", post.Category, ageYears)
		case isMidAge:
			r.Action = "update"
			r.Reason = fmt.Sprintf("%.1fy old, %d words, topic: %s", ageYears, wordCount, post.Category)
		default:
			r.Action = "update"
			r.Reason = fmt.Sprintf("%d words, topic: %s, %.1fy old", wordCount, post.Category, ageYears)
		}

		results = append(results, r)
	}
	return results
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd tools/devto-sync
go test ./internal/sync/ -v
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add tools/devto-sync/internal/sync/
git commit -m "feat(devto-sync): sync engine with push, status, and triage"
```

---

## Task 6: CLI Subcommands (push, pull, status, triage)

**Files:**
- Create: `tools/devto-sync/cmd/push.go`
- Create: `tools/devto-sync/cmd/pull.go`
- Create: `tools/devto-sync/cmd/status.go`
- Create: `tools/devto-sync/cmd/triage.go`
- Modify: `tools/devto-sync/cmd/root.go` (register subcommands)

- [ ] **Step 1: Implement push subcommand**

Write `tools/devto-sync/cmd/push.go`:

```go
package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var pushAll bool
var pushSlug string

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push blog posts to Dev.to",
	Long:  "Push one or all blog posts to Dev.to. Creates new articles or updates existing ones.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)
		engine := devsync.NewEngine(client, baseURL)

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		var targets []*hugo.Post
		if pushSlug != "" {
			for _, p := range posts {
				if p.Slug == pushSlug {
					targets = append(targets, p)
					break
				}
			}
			if len(targets) == 0 {
				return fmt.Errorf("post with slug %q not found", pushSlug)
			}
		} else if pushAll {
			for _, p := range posts {
				if p.ShouldSync() {
					targets = append(targets, p)
				}
			}
		} else {
			return fmt.Errorf("specify --all or --slug <slug>")
		}

		var failed int
		var created []string
		for _, post := range targets {
			result, err := engine.PushPost(post, dryRun)
			if err != nil {
				log.Printf("ERROR [%s]: %v", post.Slug, err)
				failed++
				if pushSlug != "" {
					return err
				}
				continue
			}

			// Write back devto_id for new posts
			if result != nil && post.DevtoID == 0 && !dryRun {
				if err := hugo.WriteDevtoID(post.FilePath, result.ID); err != nil {
					log.Printf("WARNING: failed to write devto_id for %s: %v", post.Slug, err)
				}
				created = append(created, fmt.Sprintf("%s (id=%d)", post.Slug, result.ID))
			}
		}

		fmt.Printf("\nPush complete: %d posts processed", len(targets))
		if failed > 0 {
			fmt.Printf(", %d failed", failed)
		}
		if len(created) > 0 {
			fmt.Printf("\nNew articles created (devto_id written to frontmatter):\n")
			for _, c := range created {
				fmt.Printf("  - %s\n", c)
			}
		}
		fmt.Println()

		if failed > 0 {
			os.Exit(1)
		}
		return nil
	},
}

func init() {
	pushCmd.Flags().BoolVar(&pushAll, "all", false, "Push all eligible posts")
	pushCmd.Flags().StringVar(&pushSlug, "slug", "", "Push a specific post by slug")
	rootCmd.AddCommand(pushCmd)
}
```

- [ ] **Step 2: Implement pull subcommand**

Write `tools/devto-sync/cmd/pull.go`:

```go
package cmd

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var (
	pullAll        bool
	pullID         int
	pullForce      bool
	pullCategory   string
	pullCategoryMap string
)

var pullCmd = &cobra.Command{
	Use:   "pull",
	Short: "Import Dev.to articles into the blog",
	Long:  "Import one or all unmatched Dev.to articles as Hugo page bundles with draft: true.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		// Load existing posts to find which devto_ids we already have
		existingPosts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}
		existingIDs := make(map[int]bool)
		for _, p := range existingPosts {
			if p.DevtoID > 0 {
				existingIDs[p.DevtoID] = true
			}
		}

		// Load category map if provided
		catMap := make(map[int]string)
		if pullCategoryMap != "" {
			f, err := os.Open(pullCategoryMap)
			if err != nil {
				return fmt.Errorf("open category map: %w", err)
			}
			defer f.Close()
			reader := csv.NewReader(f)
			records, err := reader.ReadAll()
			if err != nil {
				return fmt.Errorf("read category map: %w", err)
			}
			for _, rec := range records {
				if len(rec) >= 2 {
					id, _ := strconv.Atoi(rec[0])
					catMap[id] = rec[1]
				}
			}
		}

		if pullID > 0 {
			return pullSingle(client, pullID, existingIDs, catMap)
		}

		if pullAll {
			return pullAllArticles(client, existingIDs, catMap)
		}

		return fmt.Errorf("specify --all or --id <id>")
	},
}

func pullSingle(client *devto.Client, id int, existingIDs map[int]bool, catMap map[int]string) error {
	if existingIDs[id] && !pullForce {
		return fmt.Errorf("article %d already exists in blog (use --force to re-import)", id)
	}

	article, err := client.GetArticle(id)
	if err != nil {
		return fmt.Errorf("get article %d: %w", id, err)
	}

	category := pullCategory
	if c, ok := catMap[id]; ok {
		category = c
	}
	if category == "" {
		return fmt.Errorf("--category required for pull --id")
	}

	return importArticle(article, category)
}

func pullAllArticles(client *devto.Client, existingIDs map[int]bool, catMap map[int]string) error {
	// Check for non-interactive mode
	isTTY := term.IsTerminal(int(os.Stdin.Fd()))
	if !isTTY && len(catMap) == 0 {
		return fmt.Errorf("--category-map required in non-interactive mode")
	}

	articles, err := client.ListMyArticles()
	if err != nil {
		return fmt.Errorf("list articles: %w", err)
	}

	var imported, skipped int
	for _, article := range articles {
		if !article.Published {
			continue
		}
		if existingIDs[article.ID] {
			skipped++
			continue
		}

		category := catMap[article.ID]
		if category == "" && isTTY {
			fmt.Printf("\nArticle: %s (id=%d)\n", article.Title, article.ID)
			fmt.Print("Category [ai/cursor/devops/docker/general/go/laravel/psr]: ")
			fmt.Scanln(&category)
		}
		if category == "" {
			category = "general"
		}

		if dryRun {
			log.Printf("[DRY RUN] Would import: %s → %s/%s", article.Title, category, article.Slug)
			imported++
			continue
		}

		if err := importArticle(&article, category); err != nil {
			log.Printf("ERROR [%d]: %v", article.ID, err)
			continue
		}
		imported++
	}

	fmt.Printf("\nPull complete: %d imported, %d skipped (already exist)\n", imported, skipped)
	return nil
}

func importArticle(article *devto.Article, category string) error {
	var series []interface{}
	if article.Series != nil && *article.Series != "" {
		series = []interface{}{*article.Series}
	}

	fm := map[string]interface{}{
		"title":    article.Title,
		"date":     article.PublishedAt,
		"slug":     article.Slug,
		"summary":  article.Description,
		"draft":    true,
		"devto":    true,
		"devto_id": article.ID,
	}
	if len(series) > 0 {
		fm["series"] = series
	}

	// Parse tags from comma-separated string
	if article.Tags != "" {
		tags := []interface{}{}
		for _, t := range splitTags(article.Tags) {
			tags = append(tags, t)
		}
		fm["tags"] = tags
	}
	fm["categories"] = []interface{}{}

	path, err := hugo.CreatePageBundle(contentDir, category, article.Slug, fm, article.BodyMarkdown)
	if err != nil {
		return err
	}
	log.Printf("Imported: %s → %s", article.Title, path)
	return nil
}

func splitTags(s string) []string {
	var tags []string
	for _, t := range splitCommaOrSpace(s) {
		t = trimSpace(t)
		if t != "" {
			tags = append(tags, t)
		}
	}
	return tags
}

func splitCommaOrSpace(s string) []string {
	result := []string{}
	for _, part := range append([]string{}, splitBy(s, ',')...) {
		result = append(result, splitBy(part, ' ')...)
	}
	return result
}

func splitBy(s string, sep byte) []string {
	var result []string
	start := 0
	for i := range len(s) {
		if s[i] == sep {
			result = append(result, s[start:i])
			start = i + 1
		}
	}
	result = append(result, s[start:])
	return result
}

func trimSpace(s string) string {
	start, end := 0, len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}

func init() {
	pullCmd.Flags().BoolVar(&pullAll, "all", false, "Pull all unmatched articles")
	pullCmd.Flags().IntVar(&pullID, "id", 0, "Pull a specific article by ID")
	pullCmd.Flags().BoolVar(&pullForce, "force", false, "Force re-import even if already matched")
	pullCmd.Flags().StringVar(&pullCategory, "category", "", "Category for the imported post")
	pullCmd.Flags().StringVar(&pullCategoryMap, "category-map", "", "CSV file mapping Dev.to IDs to categories")
	rootCmd.AddCommand(pullCmd)
}
```

- [ ] **Step 3: Implement status subcommand**

Write `tools/devto-sync/cmd/status.go`:

```go
package cmd

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show sync state across all posts",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)
		engine := devsync.NewEngine(client, baseURL)

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		results, err := engine.Status(posts)
		if err != nil {
			return err
		}

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "SLUG\tDEVTO_ID\tSTATUS\tCANONICAL\tNOTES")
		fmt.Fprintln(w, "----\t--------\t------\t---------\t-----")

		var synced, unsynced, missing int
		for _, r := range results {
			status := "unsynced"
			canonical := "-"
			notes := ""

			switch {
			case !r.HasDevtoID:
				status = "no devto_id"
				missing++
			case !r.OnDevto:
				status = "NOT FOUND"
				notes = r.Drift
				unsynced++
			case r.Synced && r.CanonicalOK:
				status = "synced"
				canonical = "ok"
				synced++
			default:
				status = "drift"
				if !r.CanonicalOK {
					canonical = "MISSING"
				}
				notes = r.Drift
				unsynced++
			}

			fmt.Fprintf(w, "%s\t%d\t%s\t%s\t%s\n", r.Slug, r.DevtoID, status, canonical, notes)
		}
		w.Flush()

		fmt.Printf("\nSummary: %d synced, %d drifted, %d missing devto_id\n", synced, unsynced, missing)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)
}
```

- [ ] **Step 4: Implement triage subcommand**

Write `tools/devto-sync/cmd/triage.go`:

```go
package cmd

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var triageCmd = &cobra.Command{
	Use:   "triage",
	Short: "Propose archive/update/replace actions for imported posts",
	Long:  "Analyzes imported Dev.to posts by age, topic, and content quality. Output is advisory only.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)
		engine := devsync.NewEngine(client, baseURL)

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		// Filter to only posts with devto_id (imported or matched)
		var imported []*hugo.Post
		for _, p := range posts {
			if p.DevtoID > 0 {
				imported = append(imported, p)
			}
		}

		results := engine.Triage(imported)

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "SLUG\tPUBLISHED\tACTION\tREASON")
		fmt.Fprintln(w, "----\t---------\t------\t------")

		var keep, update, replace int
		for _, r := range results {
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\n", r.Slug, r.Published, r.Action, r.Reason)
			switch r.Action {
			case "keep":
				keep++
			case "update":
				update++
			case "replace":
				replace++
			}
		}
		w.Flush()

		fmt.Printf("\nSummary: %d keep, %d update, %d replace/archive\n", keep, update, replace)
		fmt.Println("This output is advisory. Review and act manually.")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(triageCmd)
}
```

- [ ] **Step 5: Add golang.org/x/term dependency**

```bash
cd tools/devto-sync
go get golang.org/x/term
```

- [ ] **Step 6: Build and verify all subcommands appear in help**

```bash
cd tools/devto-sync
go build -o devto-sync .
./devto-sync --help
```

Expected: Help output showing `push`, `pull`, `status`, `triage` subcommands plus global flags.

- [ ] **Step 7: Commit**

```bash
git add tools/devto-sync/cmd/ tools/devto-sync/go.mod tools/devto-sync/go.sum
git commit -m "feat(devto-sync): add push, pull, status, and triage subcommands"
```

---

## Task 7: Taskfile Integration

**Files:**
- Modify: `Taskfile.yml`

- [ ] **Step 1: Add devto tasks to Taskfile.yml**

Add to the bottom of `Taskfile.yml`:

```yaml
  devto:build:
    desc: Build the devto-sync tool
    dir: tools/devto-sync
    cmds:
      - go build -o ../../bin/devto-sync .
    sources:
      - "**/*.go"
      - go.mod
    generates:
      - ../../bin/devto-sync

  devto:push:
    desc: Push posts to Dev.to (use SLUG=xxx for single post, or ALL=true for all)
    deps: [devto:build]
    cmds:
      - |
        args=""
        {{ if .SLUG }}args="--slug {{.SLUG}}"{{ end }}
        {{ if .ALL }}args="--all"{{ end }}
        {{ if .DRY_RUN }}args="$args --dry-run"{{ end }}
        ./bin/devto-sync push $args

  devto:pull:
    desc: Import from Dev.to (use ID=xxx or ALL=true with CATEGORY_MAP=file.csv)
    deps: [devto:build]
    cmds:
      - |
        args=""
        {{ if .ID }}args="--id {{.ID}} --category {{.CATEGORY}}"{{ end }}
        {{ if .ALL }}args="--all"{{ end }}
        {{ if .CATEGORY_MAP }}args="$args --category-map {{.CATEGORY_MAP}}"{{ end }}
        {{ if .DRY_RUN }}args="$args --dry-run"{{ end }}
        ./bin/devto-sync pull $args

  devto:status:
    desc: Show sync state between blog and Dev.to
    deps: [devto:build]
    cmds:
      - ./bin/devto-sync status

  devto:triage:
    desc: Propose archive/update/replace for imported posts
    deps: [devto:build]
    cmds:
      - ./bin/devto-sync triage

  devto:env:
    desc: Export DEVTO_API_KEY from Ansible vault (run with 'eval $(task devto:env)')
    cmds:
      - echo "export DEVTO_API_KEY=$(ansible-vault decrypt --output - vault/devto-api-key.yml 2>/dev/null | grep api_key | cut -d' ' -f2)"
    silent: true

  devto:test:
    desc: Run devto-sync tests
    dir: tools/devto-sync
    cmds:
      - go test ./... -v
```

- [ ] **Step 2: Create bin/ directory and add to .gitignore**

```bash
mkdir -p bin
echo "bin/" >> .gitignore
```

- [ ] **Step 3: Verify tasks appear**

```bash
task --list | grep devto
```

Expected: All devto:* tasks listed.

- [ ] **Step 4: Run tests via Taskfile**

```bash
task devto:test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add Taskfile.yml .gitignore
git commit -m "feat(devto-sync): add Taskfile integration for devto-sync commands"
```

---

## Task 8: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/devto-sync.yml`
- Delete: `.github/workflows/devto.yml` (replaced)

- [ ] **Step 1: Write the new workflow**

Write `.github/workflows/devto-sync.yml`:

```yaml
name: Sync to Dev.to

on:
  workflow_run:
    workflows: ["Deploy Hugo blog to Pages"]
    types: [completed]
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  sync:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 2

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.26'

      - name: Build devto-sync
        run: cd tools/devto-sync && go build -o ../../bin/devto-sync .

      - name: Find changed posts
        id: changed
        run: |
          sha="${{ github.event.workflow_run.head_sha }}"
          files=$(git diff --name-only "${sha}^1" "${sha}" -- 'content/posts/**/index.md' 2>/dev/null || true)
          echo "files<<EOF" >> "$GITHUB_OUTPUT"
          echo "$files" >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"
          count=$(echo "$files" | grep -c . || true)
          echo "count=$count" >> "$GITHUB_OUTPUT"

      - name: Push changed posts to Dev.to
        if: steps.changed.outputs.count != '0'
        env:
          DEVTO_API_KEY: ${{ secrets.DEVTO_API_KEY }}
        run: |
          set -euo pipefail
          while IFS= read -r file; do
            [ -z "$file" ] && continue
            [ ! -f "$file" ] && continue
            slug=$(basename "$(dirname "$file")")
            echo "Pushing: $slug"
            ./bin/devto-sync push --slug "$slug" || echo "WARN: failed to push $slug"
          done <<< "${{ steps.changed.outputs.files }}"

      - name: Check for devto_id writebacks
        id: writeback
        run: |
          changes=$(git diff --name-only -- 'content/posts/**/index.md' || true)
          echo "changes<<EOF" >> "$GITHUB_OUTPUT"
          echo "$changes" >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"
          if [ -n "$changes" ]; then
            echo "has_changes=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_changes=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create writeback PR
        if: steps.writeback.outputs.has_changes == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          sha="${{ github.event.workflow_run.head_sha }}"
          branch="devto-sync/writeback-${sha:0:7}"
          git checkout -b "$branch"
          git add content/posts/**/index.md
          git commit -m "chore: write back devto_id from sync run"
          git push origin "$branch"
          gh pr create \
            --title "chore: write back devto_id values" \
            --body "Automated PR from devto-sync workflow. New articles were created on Dev.to and their IDs need to be recorded in frontmatter." \
            --base main \
            --head "$branch"
```

- [ ] **Step 2: Remove the old workflow and commit both changes atomically**

```bash
git rm .github/workflows/devto.yml
git add .github/workflows/devto-sync.yml
git commit -m "feat(devto-sync): replace bash workflow with Go-based devto-sync

Replaces the shell-script-based .github/workflows/devto.yml with a
workflow that builds and uses the devto-sync Go CLI tool. Adds
devto_id writeback via automated PR."
```

---

## Task 9: Run Full Test Suite + Manual Smoke Test

**Files:** None (verification only)

- [ ] **Step 1: Run all Go tests**

```bash
cd tools/devto-sync
go test ./... -v -count=1
```

Expected: All tests pass.

- [ ] **Step 2: Build the binary**

```bash
task devto:build
```

Expected: `bin/devto-sync` created successfully.

- [ ] **Step 3: Verify help for all subcommands**

```bash
./bin/devto-sync --help
./bin/devto-sync push --help
./bin/devto-sync pull --help
./bin/devto-sync status --help
./bin/devto-sync triage --help
```

Expected: All show appropriate help text with flags.

- [ ] **Step 4: Dry-run push a known post**

```bash
DEVTO_API_KEY=dummy ./bin/devto-sync push --slug ai-strips-your-voice-style-layer --dry-run
```

Expected: `[DRY RUN] Would create: ...` (since there's no `devto_id` yet and the dummy key won't hit the API).

Note: Dry-run mode should not make API calls. If it errors on the dummy key, there's a bug in the dry-run gate.

- [ ] **Step 5: Verify the task runner works end to end**

```bash
DRY_RUN=true task devto:push ALL=true
```

Expected: Lists all eligible posts with `[DRY RUN]` prefix, no API calls made.

- [ ] **Step 6: Commit any fixes from smoke testing**

Only if issues were found. Otherwise skip.

---

## Task 10: Documentation Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add devto-sync section to CLAUDE.md**

Add after the existing Commands section:

```markdown
### Dev.to Sync Tool

A Go CLI tool in `tools/devto-sync/` handles bidirectional sync with Dev.to. Blog is always canonical.

```bash
task devto:push SLUG=my-post   # Push single post
task devto:push ALL=true       # Push all eligible posts
task devto:pull ID=123 CATEGORY=go  # Import single article
task devto:status              # Show sync state
task devto:triage              # Propose archive/update/replace
task devto:test                # Run tool tests
```

Posts opt in via `devto: true` in frontmatter (default in archetype). The `devto_id` field is written automatically after first push. Archived posts are excluded from sync.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add devto-sync tool documentation to CLAUDE.md"
```
