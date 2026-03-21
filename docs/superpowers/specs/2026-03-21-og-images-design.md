# Auto-Generated OG Images — Design Spec

**Date:** 2026-03-21
**Status:** Draft
**Scope:** Build-time OG image generation using Playwright, with per-series gradient branding

## Problem

All blog posts share a single generic `og-default.png`. Social media feeds are indistinguishable — every post looks the same when shared on Facebook, X, or LinkedIn.

## Solution

A Node script generates a customized 1200x630 PNG per post at build time, using Playwright to render an HTML template with the post's title and series-specific gradient branding.

## Visual Design

**Style:** Bold & Graphic — gradient background, geometric circle accents, strong white typography.

**Elements per image:**
- Gradient background (per series)
- Series label badge (top-left, white text on translucent white background, uppercase)
- Post title (white, bold, large, auto-sized to fit)
- Author name "Russell Jones" (bottom-left, subtle white at 70% opacity)
- Two decorative circle outlines (top-right, bottom-left) at low opacity

### Series Color Map

| Series | Gradient (135deg) | Label |
|---|---|---|
| `waaseyaa` | `#667eea → #764ba2` | Waaseyaa |
| `php-fig-standards` | `#0f9b8e → #1a5276` | PHP-FIG Standards |
| `codified-context` | `#f093fb → #f5576c` | Codified Context |
| `production-linux` | TBD | Production Linux |
| (no series) | `#2c3e50 → #4ca1af` | Blog |

New series: add one entry to the map in the generation script.

## Generation Script

**File:** `scripts/generate-og-images.js`

### Behavior

1. Scan `content/posts/**/*.md` for frontmatter (`title`, `slug`, `series`)
2. Read `scripts/og-template.html` and compute SHA-256 hash
3. Compare hash against `static/images/og/.og-template-hash`
4. If hash changed → regenerate all images
5. If hash unchanged → only generate for posts missing a PNG at `static/images/og/{slug}.png`
6. Launch Playwright (chromium), render template at 1200x630 viewport, screenshot each to PNG
7. Write new hash to `static/images/og/.og-template-hash`

### Template Variables

The script injects into the HTML template:

- `{{title}}` — post title from frontmatter
- `{{series}}` — series display name from the color map
- `{{gradient}}` — CSS gradient value from the color map
- `{{author}}` — "Russell Jones"

### Dependencies

- `playwright` (already available as MCP plugin; add as dev dependency for the script)
- Node.js (already in CI for Hugo assets)
- `gray-matter` (npm package for frontmatter parsing)

## HTML Template

**File:** `scripts/og-template.html`

A self-contained HTML file at 1200x630px that renders the OG image. Contains:

- Inline CSS (no external dependencies)
- The gradient, circles, badge, title, and author name
- System font stack (no custom fonts to load)
- Title auto-sizing: starts at a large font size and the template uses CSS `clamp()` or the script adjusts font size based on title length

## Taskfile Integration

```yaml
og:generate:
  desc: Generate OG images for posts missing them (incremental)
  cmds:
    - node scripts/generate-og-images.js

og:regenerate:
  desc: Force regenerate all OG images
  cmds:
    - node scripts/generate-og-images.js --force
```

## Hugo Integration

### Partial Override

Create `layouts/partials/templates/opengraph.html` to override PaperMod's default. The override:

1. Checks if `static/images/og/{slug}.png` exists (using `resources.Get` or `fileExists`)
2. If yes → use it as the `og:image`
3. If no → fall back to the site-level `images` default (`og-default.png`)

No frontmatter changes needed on any post. The partial auto-resolves based on slug.

### Hugo Config

The existing `images = ['images/og-default.png']` in `hugo.toml` remains as the fallback.

## CI Integration

In `.github/workflows/hugo.yml`, add before the Hugo build step:

```yaml
- name: Install Playwright
  run: npx playwright install chromium --with-deps

- name: Generate OG images
  run: node scripts/generate-og-images.js
```

Generated images are committed to `static/images/og/` in the repo, so CI only generates missing ones (incremental). When the template changes, CI regenerates all.

## File Layout

```
scripts/
  generate-og-images.js     # Generation script
  og-template.html           # HTML template (1200x630)
static/images/og/
  .og-template-hash          # SHA-256 of template for change detection
  waaseyaa-dbal-migration.png
  waaseyaa-i18n.png
  ...
layouts/partials/templates/
  opengraph.html             # Override PaperMod's opengraph partial
```

## Out of Scope

- Per-post custom images (cover photos, illustrations)
- Category-level colors (only series-level)
- Dark/light mode variants
- Runtime/serverless generation
- Custom web fonts (uses system font stack)
