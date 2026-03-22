# Dev.to Bidirectional Sync — Design Spec

**Date:** 2026-03-22
**Status:** Draft
**Scope:** Go CLI tool + GitHub Actions workflow for bidirectional sync between Hugo blog and Dev.to

## 1. Goals

- Full bidirectional sync between the Hugo blog (canonical) and Dev.to (distribution)
- Import all 49 Dev.to-only published posts into the blog
- Reconcile all 48 existing matched posts with `canonical_url` and `devto_id`
- Triage imported posts: keep, update, or replace + archive
- Automate ongoing sync via GitHub Actions on merge to main
- Store Dev.to API key in Ansible vault

## 2. Principles

- **Blog is always canonical.** Every Dev.to post gets `canonical_url` pointing to the Hugo blog.
- **No external state.** Sync mapping lives in Hugo frontmatter (`devto_id`), not in a database or JSON manifest.
- **Blog wins on conflict.** Push overwrites Dev.to entirely; no merge logic.
- **Minimal dependencies.** Standard library + cobra + YAML parser. No DI framework.

## 3. Frontmatter Changes

Two optional fields added to post frontmatter:

```yaml
devto_id: 1234567        # Dev.to article ID, written after first sync
devto_published: true     # Controls published state on Dev.to (default: true)
```

`canonical_url` is always computed from `baseURL` + `slug` — never stored in frontmatter.

Posts without `devto_id` are treated as new when pushed. Posts with `devto_published: false` are pushed as drafts.

## 4. Go CLI Tool

### 4.1 Location

`tools/devto-sync/` within the blog repo.

### 4.2 Subcommands

| Command | Purpose |
|---|---|
| `devto-sync push [--all \| --slug <slug>]` | Blog → Dev.to (create or update) |
| `devto-sync pull [--all \| --id <id>]` | Dev.to → Blog (import as page bundle) |
| `devto-sync status` | Show sync state across all posts |
| `devto-sync triage` | Propose archive/update/replace for outdated imports |

### 4.3 Project Structure

```
tools/devto-sync/
├── main.go
├── cmd/
│   ├── push.go
│   ├── pull.go
│   ├── status.go
│   └── triage.go
├── internal/
│   ├── devto/          # Dev.to API client
│   │   └── client.go
│   ├── hugo/           # Hugo content reader/writer (frontmatter + markdown)
│   │   └── content.go
│   └── sync/           # Sync logic (diff, merge, conflict detection)
│       └── engine.go
├── go.mod
└── go.sum
```

### 4.4 Dependencies

- `cobra` — CLI framework
- `gopkg.in/yaml.v3` — Frontmatter parsing
- Standard library for HTTP, JSON, rate limiting

No Uber FX. This is a CLI tool, not a long-running service.

## 5. Dev.to API Integration

### 5.1 Endpoints

| Operation | Endpoint | Method |
|---|---|---|
| List my articles | `/api/articles/me/all` | GET |
| Get article by ID | `/api/articles/{id}` | GET |
| Create article | `/api/articles` | POST |
| Update article | `/api/articles/{id}` | PUT |

Authentication: `api-key` header with the value from `DEVTO_API_KEY` env var.

### 5.2 Field Mapping (Hugo → Dev.to)

| Hugo frontmatter | Dev.to API field |
|---|---|
| `title` | `article.title` |
| `tags` (max 4) | `article.tags` |
| `summary` | `article.description` |
| `series` | `article.series` |
| `devto_published` | `article.published` |
| computed from `baseURL` + `slug` | `article.canonical_url` |
| markdown body | `article.body_markdown` |

### 5.3 Content Transformation (Push: Blog → Dev.to)

- `{{< relref "slug" >}}` → `https://jonesrussell.github.io/blog/slug/`
- `{{< figure src="image.png" >}}` → `![alt](https://jonesrussell.github.io/blog/<post-path>/image.png)`
- Other Hugo shortcodes converted to standard markdown/HTML equivalents
- Relative image paths resolved to GitHub Pages URLs (images deploy with the blog)

### 5.4 Content Transformation (Pull: Dev.to → Blog)

- Dev.to markdown imported as-is
- Image URLs kept absolute (Dev.to CDN)
- Links to own Dev.to posts converted to `{{< relref "slug" >}}` where a matching blog post exists
- Page bundle created at `content/posts/<category>/<slug>/index.md`

### 5.5 Rate Limiting

Dev.to API limit: 30 requests per 30 seconds. The client includes a token-bucket rate limiter for bulk operations (`--all` flag).

## 6. GitHub Actions Workflow

### 6.1 Trigger

```yaml
# .github/workflows/devto-sync.yml
name: Sync to Dev.to

on:
  workflow_run:
    workflows: ["Deploy Hugo site to Pages"]
    types: [completed]
    branches: [main]
```

Runs only after the Hugo deploy succeeds.

### 6.2 Flow

1. Check out repo, build `devto-sync` binary
2. `git diff` between current and previous commit to find changed `content/posts/**/index.md` files
3. Run `devto-sync push --slug <slug>` for each changed post
4. If no post files changed, exit early (no API calls)

### 6.3 `devto_id` Writeback

When a new post is pushed to Dev.to for the first time, the API returns the article ID. The workflow:

1. Commits the updated frontmatter (with new `devto_id`) to a branch `devto-sync/writeback-<sha>`
2. Opens a PR with the frontmatter change
3. You merge the PR to keep main clean

This avoids the workflow pushing directly to main.

### 6.4 Secrets

`DEVTO_API_KEY` stored as a GitHub Actions repository secret.

## 7. Secret Management

| Context | How the key is accessed |
|---|---|
| **Local dev** | `ansible-vault decrypt` → exported as `DEVTO_API_KEY` env var |
| **GitHub Actions** | Repository secret `DEVTO_API_KEY` (set once from vault) |
| **Rotation** | Update vault → update GitHub secret (two steps) |

A Taskfile task `devto:env` decrypts the key and exports it for the current shell session.

No secrets in the repo, no `.env` files. The tool reads `DEVTO_API_KEY` from the environment and fails with a clear error if missing.

## 8. Content Triage

### 8.1 The `triage` Subcommand

Analyzes imported Dev.to posts and proposes one of three actions per post:

| Action | When | What Happens |
|---|---|---|
| **Keep** | Topic is current, content is accurate | Publish on blog as-is |
| **Update** | Topic is relevant but steps/versions outdated | Update content in place (e.g., refresh Docker install for current versions) |
| **Replace + Archive** | Approach fundamentally changed, or post was low-effort | Archive with `archived: true`, create new post with `aliases` redirect from old slug |

### 8.2 Scoring Criteria

- **Age:** Years since publish date
- **Topic relevance:** Matches current blog categories (Go, Laravel, Docker, AI tooling, PHP)?
- **Content quality:** Length, presence of code blocks, structural depth

### 8.3 Output Format

Advisory-only markdown table:

```
| Slug                        | Published  | Action  | Reason                                          |
|-----------------------------|------------|---------|--------------------------------------------------|
| install-docker-ubuntu       | 2023-01-08 | update  | Docker install is evergreen, steps need refresh  |
| html-dom-loves-javascript   | 2023-01-23 | archive | Short post, emoji-heavy, not aligned with voice  |
| install-drupal-10-tailwind  | 2023-02-05 | replace | Drupal focus deprecated, but Tailwind part useful |
```

The command does not modify anything. You review the table, then act manually.

## 9. Reconciliation of Existing 48 Matched Posts

### 9.1 One-Time Reconciliation

1. Run `devto-sync status` to compare each matched pair
2. Update Dev.to copies with `canonical_url` (many likely lack this from RSS import era)
3. Write `devto_id` into Hugo frontmatter for posts that don't have it
4. Flag content drift for manual review

### 9.2 Manual Pairing

The two fuzzy matches from the audit ("Imposter Syndrome" duplicate, "Whalebrew" title mismatch) require manual pairing — you decide which `devto_id` maps to which blog post.

### 9.3 Ongoing Behavior

- Blog is authoritative — push overwrites Dev.to entirely
- `status` command shows drift so you can spot direct Dev.to edits
- No merge logic, no conflict resolution

## 10. Taskfile Integration

New tasks added to the blog's `Taskfile.yml`:

```yaml
devto:push:       # Push all or specific post to Dev.to
devto:pull:       # Import from Dev.to
devto:status:     # Show sync state
devto:triage:     # Propose archive/update/replace
devto:env:        # Decrypt API key from Ansible vault for local use
devto:build:      # Build the sync tool
```

## 11. What This Design Does NOT Include

- **Two-way merge or conflict resolution.** Blog always wins.
- **Image upload to Dev.to.** Images are served from GitHub Pages URLs.
- **Dev.to comment sync.** Comments stay on Dev.to.
- **Scheduled sync.** Only on merge to main or manual trigger.
- **Dev.to draft management.** The 32 existing Dev.to drafts are not automatically cleaned up; handle manually.
