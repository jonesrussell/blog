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

### Post Frontmatter

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
categories: []
tags: []        # max 4 tags
summary: ""
slug: "url-slug"
draft: true
---
```

### Writing Style

Posts follow a specific cultural style:
- Open with "Ahnii!" greeting
- Close with "Baamaapii" farewell
- The archetype in `archetypes/default.md` provides this template

## Deployment

Automated via GitHub Actions (`.github/workflows/hugo.yml`). Pushes to `main` trigger a build with Hugo extended and deploy to GitHub Pages. No manual deployment needed — just merge to main.
