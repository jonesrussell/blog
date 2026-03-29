---
categories:
    - go
date: 2026-03-29T00:00:00Z
devto: true
devto_id: 3426908
draft: false
slug: hugo-devto-sync-engine
summary: How to build a CLI tool in Go that syncs Hugo blog posts to Dev.to via the Forem API, handling canonical URLs, tag sanitization, rate limits, and content transformation.
tags:
    - devto
    - hugo
    - go
    - automation
title: Build a Hugo-to-Dev.to sync engine in Go
---

Ahnii!

Publishing on your own blog and cross-posting to [Dev.to](https://dev.to) means maintaining two copies of every article. This post covers how to build a sync engine in Go that pushes Hugo posts to Dev.to via the [Forem API](https://developers.forem.com/api/v1), keeps canonical URLs pointed at your blog, and handles the API quirks that the documentation doesn't warn you about. The full source is in [`tools/devto-sync/`](https://github.com/jonesrussell/blog/tree/main/tools/devto-sync).

## Prerequisites

- Go 1.21+
- A [Dev.to API key](https://dev.to/settings/extensions) (Settings > Extensions > Generate API Key)
- A Hugo blog with posts using page bundles (`content/posts/category/slug/index.md`)

## How frontmatter drives sync behavior

The sync engine reads Hugo frontmatter to decide what to do with each post. Three fields control everything:

```yaml
---
title: "My Post"
draft: false
devto: true
devto_id: 12345
---
```

| Field | Default | Effect |
|-------|---------|--------|
| `devto` | `true` | Set to `false` to exclude a post from sync entirely |
| `devto_id` | `0` | Links the local post to a Dev.to article. Zero means create, nonzero means update |
| `draft` | `false` | Maps directly to Dev.to's published state: `draft: true` unpublishes the article |

The eligibility check is straightforward:

```go
func (p *Post) ShouldSync() bool {
    return p.DevtoEnabled() && !p.Archived
}

func (p *Post) DevtoEnabled() bool {
    if p.Devto == nil {
        return true
    }
    return *p.Devto
}
```

Posts opt in by default. Setting `devto: false` or `archived: true` excludes them. This means your existing posts start syncing the moment you run the tool, so add `devto: false` to anything you want to keep off Dev.to. ([source: `content.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/internal/hugo/content.go))

## The push flow: create, update, or deduplicate

The core of the engine is a single `PushPost` method that handles all three cases:

```go
func (e *Engine) PushPost(post *hugo.Post, dryRun bool) (*devto.Article, error) {
    canonicalURL := fmt.Sprintf("%s/%s/", e.baseURL, post.Slug)

    req := devto.ArticleCreate{
        Article: devto.ArticleBody{
            Title:        post.Title,
            BodyMarkdown: body,
            Published:    !post.Draft,
            Tags:         sanitizeTags(post.Tags),
            CanonicalURL: canonicalURL,
        },
    }

    // Has a devto_id? Update.
    if post.DevtoID > 0 {
        return e.client.UpdateArticle(post.DevtoID, req)
    }

    // No devto_id, but an article with this canonical URL already exists?
    // Update it instead of creating a duplicate.
    existing, _ := e.client.FindByCanonicalURL(canonicalURL)
    if existing != nil {
        return e.client.UpdateArticle(existing.ID, req)
    }

    // No match anywhere. Create.
    return e.client.CreateArticle(req)
}
```

The canonical URL check prevents duplicates. If a previous push created an article but the `devto_id` writeback PR hasn't merged yet, the next push finds the existing article by its canonical URL and updates it instead of creating a second copy. ([source: `engine.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/internal/sync/engine.go))

## Tag sanitization: hyphens and the 4-tag limit

Dev.to silently rejects tags containing hyphens. The tag `php-fig` fails with no useful error. Strip them before sending:

```go
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
```

`php-fig` becomes `phpfig`, and any post with more than four tags gets truncated. Dev.to enforces the four-tag limit server-side, but trimming locally gives you control over which four survive.

## The FlexTags problem: one field, two formats

The Forem API returns the `tag_list` field as an array of strings on list endpoints (`GET /api/articles/me/all`) but as a comma-separated string on create/update responses. Unmarshalling into `[]string` works for one and breaks on the other.

A custom JSON unmarshaler handles both:

```go
type FlexTags []string

func (ft *FlexTags) UnmarshalJSON(data []byte) error {
    var arr []string
    if err := json.Unmarshal(data, &arr); err == nil {
        *ft = arr
        return nil
    }
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    if s == "" {
        *ft = nil
        return nil
    }
    *ft = strings.Split(s, ", ")
    return nil
}
```

Try the array first. If that fails, split the string on `", "` (comma-space, not just comma). This handles every response the API throws at you without branching in the calling code. ([source: `types.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/internal/devto/types.go))

## Rate limiting: the real numbers

The Forem API docs say 10 requests per 30 seconds. In practice, creates are throttled harder. Three creates per 30 seconds is the safe ceiling. Separate read and write budgets with a token bucket:

```go
type rateLimiter struct {
    max      int
    tokens   int
    interval time.Duration
    last     time.Time
}

func (r *rateLimiter) wait() {
    elapsed := time.Since(r.last)
    if elapsed >= r.interval {
        r.tokens = r.max
        r.last = time.Now()
    }
    if r.tokens <= 0 {
        time.Sleep(r.interval - elapsed)
        r.tokens = r.max
        r.last = time.Now()
    }
    r.tokens--
}
```

The client uses two limiters: one for creates (`3/30s`) and one for reads (`10/30s`). On a 429 response, the client reads the `Retry-After` header and sleeps before retrying once. ([source: `client.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/internal/devto/client.go))

Dev.to also has a separate "title already used in the last 5 minutes" rate limit that fires if you create, delete, and recreate an article with the same title. There is no workaround except waiting.

## Transforming Hugo content for Dev.to

Hugo shortcodes like `{{</* relref "post-slug" */>}}` mean nothing on Dev.to. The transform step converts them to full URLs:

```go
body, warnings := hugo.TransformForDevto(post.Body, e.baseURL, postPath)
```

The transformer resolves `relref` shortcodes to absolute URLs using the blog's base URL, converts relative image paths to absolute URLs, and strips unknown shortcodes with a warning. Each warning is logged so you can fix shortcodes that don't have a Dev.to equivalent. ([source: `transform.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/internal/hugo/transform.go))

## Finding orphan articles with match

Old RSS imports or manual cross-posts can leave articles on Dev.to that hold your canonical URL but have no `devto_id` in your frontmatter. The `match` command finds them:

```bash
bin/devto-sync match
```

It pulls all your Dev.to articles, then runs two passes against your local posts:

1. **Canonical URL match**: compares `article.canonical_url` against the expected `{baseURL}/{slug}/`
2. **Title match (fallback)**: case-insensitive title comparison for articles without canonical URLs

Output is tab-separated for easy scripting:

```
CANONICAL   my-post-slug    12345   My Post Title
TITLE       other-post      67890   Other Post
NONE        new-post        0       no match found
```

Matched IDs can be written back to frontmatter with a force pull, linking the local post to its Dev.to counterpart without creating a duplicate. ([source: `match.go`](https://github.com/jonesrussell/blog/blob/main/tools/devto-sync/cmd/match.go))

## Automated sync with GitHub Actions

The sync runs automatically after every deploy:

```yaml
- name: Push changed posts to Dev.to
  run: bin/devto-sync push --all
  env:
    DEVTO_API_KEY: ${{ secrets.DEVTO_API_KEY }}
```

After creating new articles, the tool writes `devto_id` back into the post frontmatter. A second workflow step opens a PR with those changes so the IDs are tracked in git. The next push uses the IDs for updates instead of creates.

This closes the loop: push to main, deploy triggers, sync runs, IDs come back as a PR. ([source: `devto-sync.yml`](https://github.com/jonesrussell/blog/blob/main/.github/workflows/devto-sync.yml))

Baamaapii
