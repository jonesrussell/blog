package sync

import (
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"time"

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

	// Cap tags at 4 (Dev.to limit) and sanitize for Dev.to (no hyphens allowed)
	tags := make([]string, 0, len(post.Tags))
	for _, t := range post.Tags {
		sanitized := strings.ReplaceAll(t, "-", "")
		if sanitized != "" {
			tags = append(tags, sanitized)
		}
	}
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
// This is a package-level function that does not require a Dev.to client.
func Triage(posts []*hugo.Post) []TriageResult {
	return (&Engine{}).Triage(posts)
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
