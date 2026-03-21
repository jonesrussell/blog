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
| `production-linux` | `#e65100 → #bf360c` | Production Linux |
| (no series) | `#2c3e50 → #4ca1af` | Blog |

New series: add one entry to the map in the generation script.

## Generation Script

**File:** `scripts/generate-og-images.js`

### Behavior

1. Scan `content/posts/**/index.md` for frontmatter (`title`, `slug`, `series`)
2. Read `scripts/og-template.html` and compute SHA-256 hash
3. Compare hash against `static/images/og/.og-template-hash`
4. If hash changed → regenerate all images
5. If hash unchanged → only generate for posts missing a PNG at `static/images/og/{slug}.png`
6. Launch Playwright (chromium), render template at 1200x630 viewport, screenshot each to PNG
7. Write new hash to `static/images/og/.og-template-hash`

### Multi-Series Posts

If a post belongs to multiple series (`series: ["a", "b"]`), use the first series in the array for the gradient.

### Template Variables

The script injects into the HTML template:

- `{{title}}` — post title from frontmatter
- `{{series}}` — series display name from the color map
- `{{gradient}}` — CSS gradient value from the color map
- `{{author}}` — "Russell Jones"

### Title Font Sizing

The script sets font size based on title character count:

- **< 40 chars** — 64px
- **40–80 chars** — 48px
- **> 80 chars** — 36px

This is done by the script before rendering, not by CSS alone, to ensure consistent results in the fixed 1200x630 viewport.

### Dependencies

- `playwright` — dev dependency for screenshot rendering
- `gray-matter` — npm package for frontmatter parsing

### Project Setup

The project has no `package.json`. Implementation must:

1. Run `npm init -y` to create `package.json`
2. Run `npm install --save-dev playwright gray-matter`
3. Add `node_modules/` to `.gitignore` (if not already present)

## HTML Template

**File:** `scripts/og-template.html`

A self-contained HTML file at 1200x630px that renders the OG image. Contains:

- Inline CSS (no external dependencies)
- The gradient, circles, badge, title, and author name
- System font stack (no custom fonts to load)
- Font size set by the script via template variable `{{fontSize}}`

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

1. Uses `fileExists` to check for `static/images/og/{slug}.png` (not `resources.Get`, which only works for `assets/`)
2. If the file exists → set `og:image` to `{{ printf "images/og/%s.png" .Page.Slug | absURL }}`
3. If not → fall back to the site-level `images` default (`og-default.png`)

The `og:image` value must be an absolute URL (e.g., `https://jonesrussell.github.io/blog/images/og/waaseyaa-dbal-migration.png`). Use Hugo's `absURL` function to ensure this.

No frontmatter changes needed on any post. The partial auto-resolves based on slug.

### Hugo Config

The existing `images = ['images/og-default.png']` in `hugo.toml` remains as the fallback.

## Workflow: Local Generation, Committed to Repo

OG images are generated locally by the developer and committed to `static/images/og/`. They are **not** generated in CI.

**Rationale:** The blog deploys via GitHub Pages with `contents: read` permissions. CI cannot commit generated files back. Generating locally and committing keeps the workflow simple and the images available for Hugo to reference at build time.

**Developer workflow:**
1. Write or update a post
2. Run `task og:generate` (generates only missing images)
3. Commit the new PNGs alongside the post
4. Push — CI builds Hugo normally, images are already in `static/`

**Template changes:**
1. Edit `scripts/og-template.html`
2. Run `task og:regenerate` (regenerates all images)
3. Commit all updated PNGs
4. Push

The `.og-template-hash` file is tracked in git alongside the PNGs.

## File Layout

```
package.json                  # New — dev dependencies
scripts/
  generate-og-images.js       # Generation script
  og-template.html            # HTML template (1200x630)
static/images/og/
  .og-template-hash           # SHA-256 of template (tracked in git)
  waaseyaa-dbal-migration.png
  waaseyaa-i18n.png
  ...
layouts/partials/templates/
  opengraph.html              # Override PaperMod's opengraph partial
```

## Out of Scope

- Per-post custom images (cover photos, illustrations)
- Category-level colors (only series-level)
- Dark/light mode variants
- Runtime/serverless generation
- Custom web fonts (uses system font stack)
- CI-based image generation
