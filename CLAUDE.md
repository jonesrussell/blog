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

**Style baseline:** `content/posts/laravel-boost-ddev.md` is the reference for voice, structure, and tone. See `docs/blog-style.md` for the full style guide.

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

## Gotchas

- Theme submodule may not be checked out after clone/branch switch. Run `git submodule update --init` if you see "found no layout file" warnings during build.

## PSR Blog Series

14-post series covering all accepted PHP-FIG standards (`series: ["php-fig-standards"]`).
- Posts live in `content/posts/psr-*.md` with an index at `psr-standards-in-php-practical-guide-for-developers.md`
- Each post follows a template: Ahnii → prerequisites one-liner → What Problem → Core Interfaces → Real-World Implementation → Common Mistakes → Framework Integration → Try It Yourself → What's Next → Baamaapii
- Companion code repo: `jonesrussell/php-fig-guide` (blog API demonstrating all 14 PSRs)
- Design docs in `docs/plans/`

## Deployment

Automated via GitHub Actions (`.github/workflows/hugo.yml`). Pushes to `main` trigger a build with Hugo extended and deploy to GitHub Pages. No manual deployment needed — just merge to main.
