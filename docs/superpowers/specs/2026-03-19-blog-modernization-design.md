# Blog Modernization: Blowfish Theme + Hugo Features + Content Polish

**Date:** 2026-03-19
**Status:** Draft
**Scope:** Theme migration, Hugo feature adoption, 68-post content review

## Constraints

- Must stay on Hugo (v0.157.0+)
- Must stay on GitHub Pages deployment
- All existing URLs (`/:slug/`) must be preserved
- Existing content structure (page bundles in `content/posts/<category>/<slug>/index.md`) retained
- `baseURL` must retain trailing slash: `https://jonesrussell.github.io/blog/`

## Phase 1: Theme Foundation

### 1.1 Install Blowfish via Hugo Modules

Remove PaperMod git submodule and adopt Hugo Modules:

- `git submodule deinit -f themes/PaperMod`
- `git rm themes/PaperMod`
- Remove `.gitmodules`
- `hugo mod init github.com/jonesrussell/blog`
- Add Blowfish as module import, pinned to a specific release tag (e.g., `github.com/nunocoracao/blowfish/v2 v2.100.0`) — verify exact GitHub username before implementation

This creates `go.mod` and `go.sum` in the repo root.

### 1.2 Config Migration

Restructure from flat `hugo.toml` to `config/_default/` directory:

| New File | Contents | Source |
|---|---|---|
| `hugo.toml` | baseURL (with trailing slash), title, languageCode, enableRobotsTXT | Current `hugo.toml` top-level |
| `languages.en.toml` | Author info, language-specific params | Current `params.author`, social icons |
| `menus.en.toml` | Navigation items (Posts, Search, Topics, Archived, About) | Current `[menu]` section |
| `params.toml` | Theme config: homepage layout, colors, features, Fuse.js search, TOC, sharing, comments, analytics | Current `[params]` section |
| `markup.toml` | Syntax highlighting (monokai), Goldmark unsafe=true | Current `[markup]` section |
| `module.toml` | Blowfish module import (pinned version) | New |

Preserve RSS `baseName = "feed"` so the feed URL stays at `/feed.xml`.

### 1.3 Google Analytics Migration

The current `extend_head.html` includes Google Analytics (gtag.js, ID `G-LM50CCHND9`). Migrate to Blowfish's native analytics support via `params.toml`:

```toml
[analytics.google]
  siteTag = "G-LM50CCHND9"
```

Remove the manual gtag.js snippet from head partial.

### 1.4 Typography Migration

The current `extend_head.html` loads three Google Fonts:
- **Bricolage Grotesque** (headings)
- **Instrument Sans** (body)
- **JetBrains Mono** (code)

These are brand-differentiating and must be preserved. Migrate to Blowfish's `custom/head.html` partial with the Google Fonts `<link>` tags, and override Blowfish's font stack in custom CSS:

```css
:root {
  --font-family-sans: 'Instrument Sans', sans-serif;
  --font-family-heading: 'Bricolage Grotesque', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
}
```

### 1.5 Homepage Layout

Use Blowfish's `hero` or `background` layout type with card grid for recent posts.

Current `homeInfoParams` content becomes the hero section:
- Title: "Web Developer Blog"
- Content: "A resource for web developers exploring modern technologies, best practices, and practical solutions."

### 1.6 Custom Layout Migration

| Current Layout | Migration Strategy |
|---|---|
| `layouts/_default/archived-list.html` | Recreate using Blowfish's list layout conventions + `where .Pages ".Params.archived" true` |
| `layouts/_default/archives.html` | Evaluate if still needed alongside archived-list; migrate or remove |
| `layouts/section/topics.html` | Map to Blowfish's taxonomy template system |
| `layouts/partials/related-posts.html` | Use Blowfish's built-in related content partial |
| `layouts/partials/comments.html` | Use Blowfish's native Giscus integration (see 1.8) |
| `layouts/partials/content_status_notice.html` | Recreate as Blowfish partial override |
| `layouts/partials/post_nav_links.html` | Use Blowfish's built-in post navigation |
| `layouts/partials/extend_head.html` | Migrate Google Fonts to `custom/head.html`; GA moves to config; JSON-LD — see 1.9 |
| `layouts/partials/extend_footer.html` | Header scroll JS: evaluate if Blowfish handles this natively. Tabs JS: not needed (see 1.7). Blowfish uses `custom/footer.html` for custom scripts |
| `layouts/_default/single.html` | Remove; use Blowfish's default single layout |
| `layouts/_default/list.html` | Remove; use Blowfish's default list layout |
| `layouts/_default/rss.xml` | Preserve archived-post exclusion (`where $pages "Params.archived" "!=" true`) and `content:encoded` full-text. Verify if Blowfish's RSS template supports these; if not, carry forward custom template |
| `layouts/series/list.json` | Recreate as Blowfish layout override |
| `layouts/robots.txt` | Evaluate customizations; migrate or remove |

### 1.7 Shortcode Migration

**Finding:** Zero posts currently use any of the custom shortcodes (`{{< tabs`, `{{< callout`, `{{< img`). All three are unused.

**Action:** Delete all custom shortcodes and their supporting CSS (`static/css/shortcodes.css`) and footer JavaScript (tabs runtime). No content migration needed.

Blowfish's built-in shortcodes (`alert`, `tabs`, `figure`, `badge`, `button`, `chart`, `mermaid`, etc.) will be available for Phase 3 visual upgrades.

### 1.8 Comments (Giscus)

The current `comments.html` has Giscus configured but `data-repo-id` and `data-category-id` are empty strings — comments are currently non-functional.

**Action:** During migration, obtain the actual Giscus IDs from [giscus.app](https://giscus.app/) and configure via Blowfish's native Giscus support in `params.toml`. This will make comments functional for the first time.

### 1.9 JSON-LD Structured Data

The current `extend_head.html` already contains a `BlogPosting` JSON-LD block. This is **not new** — it needs to be **migrated**, not added.

**Action:** Check whether Blowfish has built-in JSON-LD support. If yes, verify it covers the same fields and remove the custom block. If no, migrate the existing JSON-LD to Blowfish's `custom/head.html` partial.

### 1.10 Custom CSS Migration

The current `assets/css/extended/custom.css` contains ~400 lines of substantial customizations:

| Category | Specifics | Action |
|---|---|---|
| **Accent colors** | CSS variables `--accent-1`, `--accent-2`, `--accent-glow` | Preserve — brand-differentiating. Map to Blowfish color scheme |
| **Noise texture overlay** | `::before` pseudo-element with SVG noise | Preserve — distinctive visual identity |
| **Gradient effects** | Header, post entries | Evaluate — may conflict with Blowfish styling |
| **Custom scrollbar** | Styled scrollbar | Evaluate — Blowfish may have its own |
| **Header scroll animation** | `.scrolled` class styling | Evaluate — paired with footer JS |
| **Post entry hover effects** | Transform + glow on hover | Evaluate — Blowfish card layouts may supersede |
| **Blockquote styling** | Custom border + background | Migrate if not covered by Blowfish |
| **Search box styling** | Custom search input | Remove — Blowfish has modal search UI |
| **Breadcrumb transitions** | Animated breadcrumbs | Evaluate — Blowfish has built-in breadcrumbs |

**Subtask:** Create an explicit inventory mapping each CSS block to: keep, adapt, or remove.

### 1.11 Color Scheme

Replicate current dark theme (`#0a0a0f`) as a custom Blowfish color scheme. Incorporate accent colors from custom CSS (`--accent-1`, `--accent-2`).

### 1.12 Shared Image Assets

There are ~17 images in `assets/images/` and ~8 in `static/images/`. Some may be orphaned.

**Action:** Audit which images are still referenced by posts. Preserve referenced images in their current locations (Hugo serves both `assets/` and `static/`). Remove orphaned images.

### 1.13 Permalink Preservation

Blowfish respects Hugo's `[permalinks]` config. Keep:

```toml
[permalinks.page]
  posts = "/:slug/"
[permalinks.section]
  posts = "/:slug/"
```

**Risk:** Verify that section `_index.md` pages (created in Phase 2) do not generate URLs that collide with post slugs. For example, `content/posts/ai/_index.md` would generate `/ai/` — ensure no post has `slug: "ai"`.

### 1.14 Series Taxonomy

The current site has `content/series/` with `_index.md` files and uses `series` as a taxonomy. Verify Blowfish's series support is compatible with this structure. If Blowfish handles series differently, document the mapping and adapt.

### 1.15 Deployment Verification

- Update `.github/workflows/hugo.yml`:
  - Add `actions/setup-go` step (required for Hugo Modules)
  - Add `hugo mod get` before build
- Verify all pages render, no 404s on existing URLs
- Confirm RSS feed (at `/feed.xml`), sitemap, robots.txt, search index all generate correctly

### 1.16 Smoke Test

Before deploying, run an automated comparison:

```bash
# Before migration (on main branch)
hugo --gc --minify && find public -name '*.html' | sort > /tmp/urls-before.txt

# After migration (on feature branch)
hugo --gc --minify && find public -name '*.html' | sort > /tmp/urls-after.txt

# Compare
diff /tmp/urls-before.txt /tmp/urls-after.txt
```

Any missing pages are a blocker. New pages (from Blowfish features) are expected.

### 1.17 Milestone

Site deploys with Blowfish, all 68 posts render, all URLs preserved, feature parity with current PaperMod site. Google Analytics, Google Fonts, comments (now functional), and RSS feed all working.

## Phase 2: Hugo Feature Adoption

### 2.1 Cascade Frontmatter

Add `_index.md` files to each content section with cascade defaults:

```yaml
# content/posts/_index.md (root — required for Blowfish section listing)
title: "Posts"

# content/posts/ai/_index.md
title: "AI"
cascade:
  categories: ["AI"]
  showAuthor: true
  showDate: true
```

Sections needing `_index.md`: `content/posts/` (root), `ai`, `docker`, `devops`, `general`, `go`, `laravel`, `psr`, `cursor`

**Important:** This step must complete before Phase 3.2 (frontmatter normalization) to avoid normalizing frontmatter that cascade will make redundant.

### 2.2 Hugo Image Processing

- Blowfish auto-processes `feature*` named images in page bundles (resize, thumbnails, social cards)
- Existing page bundle structure already supports this
- Posts need a `feature.jpg` or `feature.png` in their bundle directory

### 2.3 JSON-LD Structured Data

If Blowfish lacks built-in JSON-LD (determined in Phase 1.9), enhance the migrated JSON-LD with:
- `dateModified` from git last-modified date
- Feature image as `image` property
- Series membership as `isPartOf`

### 2.4 Mermaid Diagrams

- Enable via Blowfish config (native support)
- Use fenced code blocks with `mermaid` language identifier
- Target posts: architecture posts (Docker series, Go pipeline, Waaseyaa series, spec drift detection)

### 2.5 Enhanced Code Blocks

Configure in `markup.toml`:
- Filename display above code blocks
- Line highlighting for key lines
- Line numbers (toggleable per block)
- Copy button (Blowfish default)

### 2.6 Search Enhancement

- Keep Fuse.js (Blowfish default)
- Benefit from Blowfish's modal search UI with keyboard navigation
- Maintain JSON output format for search index

### 2.7 Open Graph & Social Meta

**Current state:** PaperMod generates basic OG tags internally. `hugo.toml` has `params.twitter` with `card = "summary_large_image"` and creator/site handles. Default OG image is `images/og-default.png`.

**Blowfish migration:**
- Verify Blowfish generates complete OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- Verify Twitter Card meta tags render (`twitter:card`, `twitter:site`, `twitter:creator`, `twitter:image`)
- Configure in `params.toml`: site-level defaults for social sharing image, Twitter handles
- Feature images in page bundles auto-become the OG image for that post
- Posts without feature images fall back to `images/og-default.png` — update this image to match new brand/color scheme

**Validation:**
- Test social sharing previews with Facebook Sharing Debugger, Twitter Card Validator, LinkedIn Post Inspector
- Add social preview validation to Phase 3 content review checklist

### 2.8 SEO Overhaul

**Meta descriptions:**
- Map from `summary` frontmatter field (already required by style guide)
- Ensure every post has a summary (enforced in Phase 3.2 frontmatter normalization)
- Verify Blowfish uses `summary` as `<meta name="description">` — if not, add via `custom/head.html`

**Canonical URLs:**
- Verify Blowfish generates `<link rel="canonical">` on every page
- Ensure canonical URLs use the correct baseURL with trailing slash

**Sitemap optimization:**
- Verify Blowfish generates sitemap.xml with all non-archived pages
- Archived posts must have `sitemap.disable: true` (already in archive frontmatter convention)
- Consider adding `lastmod` from git history for better crawl prioritization

**Robots:**
- Preserve existing `layouts/robots.txt` customizations or migrate to Blowfish equivalent
- Archived posts must have `robotsNoIndex: true` (already in archive convention)

**Performance (Core Web Vitals):**
- Audit LCP, CLS, INP after theme migration using Lighthouse
- Blowfish's image processing (lazy loading, responsive sizes, WebP) should improve LCP
- Google Fonts loading strategy: use `display=swap` (already present) + `preconnect` (already present)
- Verify no layout shift from font loading or image placeholders

**Structured data enhancements (builds on 2.3):**
- Add `BreadcrumbList` schema for navigation breadcrumbs
- Add `WebSite` schema with `SearchAction` for sitelinks search box
- Existing `BlogPosting` schema enhanced with image, series, dateModified

### 2.9 Accessibility Overhaul

**Theme-level (verify Blowfish provides):**
- Skip-to-content link
- Semantic HTML5 landmarks (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- ARIA labels on interactive elements (search toggle, theme toggle, mobile menu)
- Keyboard navigation for all interactive elements (menu, search modal, TOC)
- Focus indicators (visible focus rings, not suppressed)
- Color contrast meeting WCAG 2.1 AA — especially with custom dark theme and accent colors

**Custom work needed:**
- Audit custom color scheme (accent colors, text on dark background) with contrast checker
- Ensure Blowfish's dark/light mode toggle preserves contrast in both modes
- Verify code block contrast (monokai on dark background)
- Test keyboard navigation through: nav menu, search modal, TOC links, post navigation, comment form

**Content-level (added to Phase 3):**
- Alt text audit on all images across 68 posts (see Phase 3.6)
- Heading hierarchy audit: no skipped levels (h1 → h3 without h2)
- Link text audit: no "click here", no bare URLs as link text
- Ensure all code blocks have language specified for screen reader context

### 2.10 Update Taskfile


Fix the `new-post` task to create page bundles instead of flat files:

```yaml
# Current (broken): hugo new posts/{{.CLI_ARGS}}.md
# Fixed: hugo new posts/<category>/{{.CLI_ARGS}}/index.md
```

Update to prompt for category or accept it as a parameter.

### 2.11 Update Project Documentation

Update `CLAUDE.md` to reflect:
- New theme (Blowfish, not PaperMod)
- New config structure (`config/_default/` not `hugo.toml`)
- Hugo Modules (not git submodule)
- Correct PSR post paths (`content/posts/psr/<slug>/index.md`, not `content/posts/psr-*.md`)
- New shortcodes available (Blowfish's built-in set)
- Updated `new-post` task usage

### 2.12 Milestone

Site has modern Hugo features: auto-processed images, structured data, Mermaid diagrams, enhanced code blocks, cascade frontmatter reducing per-post boilerplate. OG/social meta verified, SEO infrastructure in place (canonical URLs, sitemap, structured data), accessibility baseline confirmed at theme level. Taskfile and docs updated.

## Phase 3: Content Review & Polish

### 3.1 Pass 1 — Triage

Audit all 68 posts. Classify each as:

| Classification | Action |
|---|---|
| **Keep** | No content changes needed |
| **Update** | Outdated technical content, fix and modernize |
| **Rewrite** | Substantially rework for current relevance |
| **Merge** | Combine with another post (redirect old URL via `aliases`) |
| **Archive** | Add `archived: true` frontmatter, exclude from feeds |

Output: Updated `docs/content-todo.md` with per-post recommendations. Build on the 6 posts already flagged in the existing file, not from scratch.

### 3.2 Pass 2 — Frontmatter Normalization

**Prerequisite:** Phase 2.1 (cascade frontmatter) must be complete.

- Consistent title casing (sentence case)
- Tag normalization (deduplicate, consistent naming)
- Summaries on every post (one sentence: outcome or audience)
- Verify slugs match current URLs
- Remove frontmatter fields now handled by cascade defaults

### 3.3 Pass 3 — Feature Images

Two-tier approach:

1. **Branded graphics (default):** Consistent template — colored background + title text + category icon. Generated for all posts that lack a standout image. Tool TBD (ImageMagick script, Figma template, or similar).
2. **Real/custom images (standout posts):** Curated photos or illustrations for flagship content (PSR series index, Waaseyaa intro, Docker series, etc.)

Images named `feature.jpg` or `feature.png` in each post's page bundle directory for Blowfish auto-processing.

### 3.4 Pass 4 — Visual Upgrade

- Add Mermaid diagrams where architecture is described in prose
- Convert multi-approach explanations to Blowfish `tabs` shortcode
- Use Blowfish `alert` shortcode for callouts and warnings
- Add filename labels and line highlighting to code blocks
- Add hero/feature images to posts

### 3.5 Pass 5 — Content Polish

- Align all posts to style guide (`docs/blog-style.md`): Ahnii/Baamaapii, second person, consistent structure
- Update outdated technical content (old Laravel versions, deprecated Docker patterns, stale tool versions)
- Fix or remove broken links
- Ensure series posts have proper next/prev navigation
- Verify PSR series index is current and all links work

### 3.6 Pass 6 — Accessibility & SEO Content Audit

**Accessibility per post:**
- Alt text on every image (descriptive, not decorative-only unless truly decorative — use `alt=""` for those)
- Heading hierarchy: no skipped levels within post content (h2 → h3, never h2 → h4)
- Link text: no "click here", "read more", or bare URLs as link text — use descriptive text
- Code blocks: all fenced blocks have a language identifier
- Tables: include header rows for screen reader context

**SEO per post:**
- `summary` field present and meaningful (one sentence: outcome or audience)
- Social sharing preview verified for flagship posts (PSR index, Waaseyaa intro, Docker series)
- Internal links use `relref` where possible for link integrity
- No orphaned posts (every post reachable from at least one navigation path: category, tag, series, or related posts)

### 3.7 Milestone

All posts triaged, frontmatter normalized, feature images added, visual upgrades applied, content polished to style guide standards. Accessibility and SEO audits complete across all posts.

## Files Created/Modified

### New Files
- `go.mod`, `go.sum` — Hugo Modules
- `config/_default/hugo.toml` — Base config (baseURL with trailing slash)
- `config/_default/languages.en.toml` — Language/author config
- `config/_default/menus.en.toml` — Navigation
- `config/_default/params.toml` — Theme params (including GA, Giscus)
- `config/_default/markup.toml` — Markup config
- `config/_default/module.toml` — Module imports (Blowfish pinned version)
- `layouts/partials/custom/head.html` — Google Fonts, JSON-LD (if needed)
- Section `_index.md` files (root + 8 categories) with cascade frontmatter
- Feature images in post page bundles

### Modified Files
- `.github/workflows/hugo.yml` — Add Go setup + `hugo mod get`
- `Taskfile.yml` — Fix `new-post` task for page bundles
- `CLAUDE.md` — Update for new theme, config structure, correct paths
- `docs/content-todo.md` — Updated triage results
- All 68 post `index.md` files — Frontmatter normalization + content polish

### Removed Files
- `themes/PaperMod/` — Git submodule removed
- `.gitmodules` — Submodule config removed
- `hugo.toml` — Replaced by `config/_default/` structure
- Most custom layouts (replaced by Blowfish equivalents)
- `layouts/shortcodes/img.html`, `tabs.html`, `tab.html`, `callout.html` — Unused; deleted
- `static/css/shortcodes.css` — Unused shortcode CSS; deleted
- `assets/css/extended/custom.css` — Replaced by Blowfish custom CSS (after inventory)

## Risk Mitigation

- **URL breakage:** Smoke test (1.16) + link checker before each deploy
- **Theme updates:** Hugo Modules pinned to specific version; update intentionally via `hugo mod get -u`
- **Rollback:** Git branch per phase; can revert to PaperMod at any point during Phase 1
- **Image generation:** Branded graphics can be batch-generated; not a blocker for theme migration
- **GitHub Actions:** Go runtime needed for Hugo Modules; add `actions/setup-go` step
- **Section URL collisions:** Verify no post slug matches a section name (1.13)
- **CSS regression:** Explicit inventory of custom CSS (1.10) before removing anything
- **Typography regression:** Google Fonts migrated early (1.4) to prevent visual breakage
- **Analytics gap:** GA migrated to Blowfish config (1.3) in same deploy as theme swap
- **OG image regression:** Update default OG image to match new brand; verify feature images auto-populate OG tags
- **Accessibility regression:** Audit custom color scheme contrast before deploying; Blowfish's defaults are good but custom accent colors may fail WCAG AA
- **SEO ranking disruption:** Preserve all canonical URLs, meta descriptions, and structured data to avoid search ranking drops during migration
