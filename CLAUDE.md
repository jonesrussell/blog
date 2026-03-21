# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hugo static blog using the PaperMod theme, deployed to GitHub Pages at `https://jonesrussell.github.io/blog/`. The theme is a git submodule under `themes/PaperMod/`.

## Commands

This project uses [Task](https://taskfile.dev/) (Go Task) as its task runner. All tasks are defined in `Taskfile.yml`.

```bash
task serve            # Dev server with drafts and live reload
task serve:prod       # Production server (no drafts)
task build            # Production build (hugo --gc --minify)
task build:drafts     # Build including drafts
task clean            # Remove public/, resources/_gen/, .hugo_build.lock
task new-post -- slug # Create new post (e.g., task new-post -- my-post-title)
task check            # Check for warnings
task theme:update     # Pull latest PaperMod from master
task deploy           # Clean + production build
```

## Configuration

- `hugo.toml` — all Hugo and theme configuration (TOML format)
- Permalinks use `/:slug/` for posts
- Output formats: HTML, RSS, JSON (JSON enables Fuse.js client-side search)
- Taxonomies: categories, tags, series
- Goldmark renderer has `unsafe = true` enabled (allows raw HTML in markdown)

## Content Conventions

**Style baseline:** `content/posts/laravel/laravel-boost-ddev/index.md` is the reference for voice, structure, and tone. See `docs/blog-style.md` for the full style guide.

### Post Frontmatter

```yaml
---
title: "Post Title"     # Sentence case, descriptive
date: YYYY-MM-DD
categories: []
tags: []                # max 4 tags
series: []              # e.g., ["php-fig-standards"]
summary: ""             # One sentence: outcome or audience
slug: "url-slug"        # kebab-case
draft: true
---
```

### Writing Style

- **Greeting/closing:** Open with "Ahnii!" and close with "Baamaapii" (no emoji).
- **Voice:** Second person, direct, instructional. Reader-focused ("your project", "you can").
- **Intro:** One short paragraph: what the post is about + one sentence on scope (e.g. "This post covers the standard setup and the extra step for WSL.").
- **Structure:** Prerequisites (bullet list) when relevant → main sections (clear H2s) → optional "Verify it works" or "Keeping X updated" → Baamaapii. Use H3 for variants (e.g. Standard vs WSL).
- **Links:** Link the first mention of products or projects (e.g. [DDEV](url), [Laravel Boost](url)).
- **Code:** After a code block, add one or two sentences explaining what it does or why.
- The archetype in `archetypes/default.md` provides the template.

## Content curation (archiving and deprecated posts)

- **Deprecated/outdated posts** are tracked in `docs/content-todo.md` with recommended action (update, replace + 301, archive). Add or edit rows as you classify posts.
- **Archiving:** Add to a post's frontmatter: `archived: true`, optional `archived_date: YYYY-MM-DD`, `sitemap.disable: true`, `robotsNoIndex: true`. Archived posts are excluded from home, /posts/, chronological archives, RSS, and sitemap; they remain at the same URL and are listed at [/archived/](/archived/).
- **Replacing a post:** On the **new** post add `aliases: ["/old-slug/"]` so the old URL redirects; then archive or remove the old post.

## Gotchas

- Theme submodule may not be checked out after clone/branch switch. Run `git submodule update --init` if you see "found no layout file" warnings during build.
- Hugo `relref` fails for future-dated posts unless built with `--buildFuture`. The workflow does NOT use `--buildFuture`, so future posts stay unpublished until their date. Use plain text for "Next" links to future posts and re-link them with `relref` on publish day.
- Posts use page bundles in subdirectories (e.g., `content/posts/ai/post-name/index.md`), not flat files in `content/posts/`. Glob with `content/posts/**/*.md` to find all posts.
- Internal links must use `relref` (e.g., `{{< relref "post-slug" >}}`), not root-relative paths (e.g., `/post-slug/`). Root-relative paths don't account for the `/blog/` base path in `baseURL` and produce 404s.
- Always verify localhost URLs before presenting them. The `baseURL` includes `/blog/`, so local dev URLs are `http://localhost:1313/blog/slug/`, not `http://localhost:1313/slug/`.
- AI-generated blog posts containing code snippets MUST be verified against the actual repos before publishing. Interface signatures, method parameters, and class names are frequently hallucinated. Use `~/dev/` repos as the source of truth.

## PSR Blog Series

14-post series covering all accepted PHP-FIG standards (`series: ["php-fig-standards"]`).
- Posts live in `content/posts/psr/*/index.md` with an index at `content/posts/psr/psr-standards-in-php-practical-guide-for-developers/index.md`
- Each post follows a template: Ahnii → prerequisites one-liner → What Problem → Core Interfaces → Real-World Implementation → Common Mistakes → Framework Integration → Try It Yourself → What's Next → Baamaapii
- Companion code repo: `jonesrussell/php-fig-guide` (blog API demonstrating all 14 PSRs)
- Design docs in `docs/plans/`

## Deployment

Automated via GitHub Actions (`.github/workflows/hugo.yml`). Pushes to `main` trigger a build with Hugo extended and deploy to GitHub Pages. Future-dated posts are excluded until their date. No manual deployment needed — just merge to main.
