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
- Provide `--dry-run` flag on all mutating commands for safe first use

## 2. Principles

- **Blog is always canonical.** Every Dev.to post gets `canonical_url` pointing to the Hugo blog.
- **No external state.** Sync mapping lives in Hugo frontmatter (`devto_id`), not in a database or JSON manifest.
- **Blog wins on conflict.** Push overwrites Dev.to entirely; no merge logic.
- **Minimal dependencies.** Standard library + cobra + YAML parser. No DI framework.

## 3. Frontmatter Changes

Two optional fields added to post frontmatter:

```yaml
devto_id: 1234567        # Dev.to article ID, written after first sync
devto: true               # Controls whether this post syncs to Dev.to (default: true)
```

`canonical_url` is always computed from `baseURL` + `slug` — never stored in frontmatter.

**Push behavior by frontmatter state:**

| `devto` field | `archived` field | Behavior |
|---|---|---|
| `true` (or missing) | `false` (or missing) | Push to Dev.to (create if no `devto_id`, update if present) |
| `true` (or missing) | `true` | Skip — archived posts are not synced to Dev.to |
| `false` | any | Skip — explicitly excluded from sync |

Posts without `devto_id` are treated as new when pushed. Hugo's `draft: true` controls whether the post is pushed as a Dev.to draft (published=false). The `devto` field name matches the existing convention in the archetype and published posts.

## 4. Go CLI Tool

### 4.1 Location

`tools/devto-sync/` within the blog repo.

### 4.2 Subcommands

| Command | Purpose |
|---|---|
| `devto-sync push [--all \| --slug <slug>] [--dry-run]` | Blog → Dev.to (create or update) |
| `devto-sync pull [--all \| --id <id>] [--dry-run] [--force] [--category <cat>] [--category-map <file>]` | Dev.to → Blog (import as page bundle) |
| `devto-sync status` | Show sync state across all posts |
| `devto-sync triage` | Propose archive/update/replace for outdated imports |

All mutating commands (`push`, `pull`) support `--dry-run` which logs what would happen without making API calls or writing files. Essential for the initial reconciliation of 48+49 posts.

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

| Hugo frontmatter | Dev.to API field | Notes |
|---|---|---|
| `title` | `article.title` | |
| `tags` (max 4) | `article.tags` | |
| `summary` | `article.description` | |
| `series[0]` (first element) | `article.series` | Hugo `series` is an array; Dev.to expects a string. Use the first element. Posts in multiple series use the first only. |
| `draft` (inverted) | `article.published` |
| computed from `baseURL` + `slug` | `article.canonical_url` |
| markdown body | `article.body_markdown` |

### 5.3 Content Transformation (Push: Blog → Dev.to)

**Supported shortcodes:**

| Hugo shortcode | Dev.to output |
|---|---|
| `{{< relref "slug" >}}` | `https://jonesrussell.github.io/blog/slug/` |
| `{{< ref "slug" >}}` | `https://jonesrussell.github.io/blog/slug/` |

These are the only shortcodes currently in use across the blog.

- Relative image paths resolved to GitHub Pages URLs (images deploy with the blog)
- **Unrecognized shortcodes:** Log a warning and strip the shortcode tags, leaving inner content. The `push` command prints a summary of stripped shortcodes so the author can review. This covers any future shortcode usage (e.g., `figure`, `highlight`) without pre-building parsers for them.

### 5.4 Content Transformation (Pull: Dev.to → Blog)

- Dev.to markdown imported as-is
- Image URLs kept absolute (Dev.to CDN)
- Links to own Dev.to posts converted to `{{< relref "slug" >}}` where a matching blog post exists
- Page bundle created at `content/posts/<category>/<slug>/index.md`
- **Category assignment:** `pull --id` requires a `--category` flag (e.g., `--category docker`). For `pull --all`, a `--category-map <file>` CSV mapping Dev.to IDs to categories is required. If no `--category-map` is provided and stdin is a TTY, the tool prompts interactively per post. In non-interactive contexts (no TTY, no `--category-map`), the tool fails with an error.
- **Series mapping:** Dev.to `series` string is mapped to Hugo `series: ["<value>"]` array in frontmatter.
- **Draft state:** Pulled posts are created with `draft: true` in Hugo frontmatter. They must be manually reviewed and un-drafted before publishing on the blog.

### 5.5 Rate Limiting

Dev.to API rate limits:

- **Read/Update:** 30 requests per 30 seconds
- **Create:** 10 requests per 30 seconds (stricter)

The client tracks create and read/update budgets independently with separate token buckets. During `push --all`, new articles (no `devto_id`) consume from the create bucket (10/30s) while updates consume from the read/update bucket (30/30s).

### 5.6 Error Handling

**Bulk operations (`--all`):** On failure, log the error and continue to the next post. After all posts are processed, print a summary of successes and failures. Exit code is non-zero if any post failed.

**Single post operations (`--slug`, `--id`):** On failure, print the error and exit non-zero immediately.

**Common failure modes:**

| Error | Behavior |
|---|---|
| 422 Unprocessable Entity | Log the validation error from Dev.to (e.g., body too long, invalid tags). Skip post. |
| 429 Rate Limited | Wait for the retry-after header duration, then retry once. Fail on second 429. |
| Network error | Retry once after 5s. Fail on second attempt. |
| Missing `DEVTO_API_KEY` | Fail immediately with clear error message. |

### 5.7 Pull Scope

`pull --all` only pulls **unmatched** Dev.to articles (those without a corresponding blog post with their `devto_id`). It does not overwrite existing blog posts. To re-import a specific matched post, use `pull --id <id> --force`.

## 6. GitHub Actions Workflow

### 6.1 Trigger

```yaml
# .github/workflows/devto-sync.yml
name: Sync to Dev.to

on:
  workflow_run:
    workflows: ["Deploy Hugo blog to Pages"]
    types: [completed]
    branches: [main]
```

Runs only after the Hugo deploy succeeds.

### 6.2 Flow

1. Check out repo, build `devto-sync` binary
2. Detect changed posts using `git diff --name-only ${{ github.event.workflow_run.head_sha }}^1 ${{ github.event.workflow_run.head_sha }} -- 'content/posts/**/index.md'`. Diffing against the first parent (`^1`) correctly shows what changed on main regardless of merge strategy (regular merge, squash, or fast-forward). Note: `head_sha` comes from the `workflow_run` event and is the push-to-main commit.
3. Run `devto-sync push --slug <slug>` for each changed post
4. If no post files changed, exit early (no API calls)

### 6.3 `devto_id` Writeback

When new posts are pushed to Dev.to for the first time, the API returns article IDs. The workflow batches all writebacks into a single PR per workflow run:

1. Collects all new `devto_id` values from the run
2. Commits all updated frontmatter files to a branch `devto-sync/writeback-<short-sha>`
3. Opens a single PR with all frontmatter changes
4. You merge the PR to keep main clean

One PR per run, not per post. This avoids the workflow pushing directly to main.

### 6.4 Secrets

`DEVTO_API_KEY` stored as a GitHub Actions repository secret.

## 7. Secret Management

| Context | How the key is accessed |
|---|---|
| **Local dev** | `DEVTO_API_KEY` env var — sourced from Ansible vault if available, or password manager |
| **GitHub Actions** | Repository secret `DEVTO_API_KEY` (set via `gh secret set`) |
| **Rotation** | Update source of truth (vault or password manager) → update GitHub secret |

The tool reads `DEVTO_API_KEY` from the environment and fails with a clear error if missing. No secrets in the repo, no `.env` files.

If Ansible vault is already in use for other secrets, a Taskfile task `devto:env` can decrypt and export for the local session. If not, any password manager works — the tool doesn't care where the env var comes from.

## 8. Content Triage

### 8.1 The `triage` Subcommand

Analyzes imported Dev.to posts and proposes one of three actions per post:

| Action | When | What Happens |
|---|---|---|
| **Keep** | Topic is current, content is accurate | Publish on blog as-is |
| **Update** | Topic is relevant but steps/versions outdated | Update content in place (e.g., refresh Docker install for current versions) |
| **Replace + Archive** | Approach fundamentally changed, or post was low-effort | Archive with `archived: true`, create new post with `aliases` redirect from old slug |

### 8.2 Scoring Criteria

Heuristic-based with concrete thresholds:

| Factor | Keep | Update | Replace/Archive |
|---|---|---|---|
| **Age** | < 1 year | 1–3 years | > 3 years |
| **Topic** | Current: Go, Laravel, Docker, AI/Claude Code, PHP, Linux/VPS, DevOps | Adjacent: Node, JavaScript, Python, general dev, career | Deprecated: Drupal, Svelte, ReactJS (no active blog coverage) |
| **Content length** | > 500 words with code blocks | > 300 words | < 300 words or no code |

The triage command applies these thresholds to produce a recommendation, but the output is always advisory. Multiple factors combine: a 2-year-old Docker post with code blocks scores "update", not "archive". Age alone doesn't determine the action.

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
