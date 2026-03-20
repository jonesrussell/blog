# Blog Modernization (Phases 1-2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Hugo blog from PaperMod to Blowfish theme via Hugo Modules, adopt modern Hugo features, and implement OG/SEO/accessibility infrastructure.

**Architecture:** Replace PaperMod git submodule with Blowfish via Hugo Modules. Restructure flat `hugo.toml` into `config/_default/` directory. Migrate all custom layouts, CSS, analytics, fonts, and structured data to Blowfish equivalents or custom overrides. Add cascade frontmatter, enhanced code blocks, Mermaid diagrams, and OG/SEO/accessibility baseline.

**Tech Stack:** Hugo v0.157.0+ (extended), Blowfish v2 theme, Hugo Modules (Go), GitHub Pages, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-03-19-blog-modernization-design.md`

**Scope:** Phases 1 (Theme Foundation) and 2 (Hugo Features) only. Phase 3 (Content Review & Polish of 68 posts) will be a separate plan after the theme is live.

**Rollback:** Every task commits independently. To roll back any task: `git revert <commit-sha>`. To abandon the entire migration: `git checkout main`.

---

## File Structure

### New Files (Phase 1)
| File | Responsibility |
|---|---|
| `go.mod` | Hugo Module definition |
| `go.sum` | Module dependency checksums |
| `config/_default/hugo.toml` | Base Hugo config (baseURL, title, language) |
| `config/_default/module.toml` | Blowfish module import (pinned version) |
| `config/_default/params.toml` | Theme params (layout, colors, analytics, comments, search, sharing) |
| `config/_default/languages.en.toml` | Author info, social icons |
| `config/_default/menus.en.toml` | Navigation menu items |
| `config/_default/markup.toml` | Syntax highlighting, Goldmark settings |
| `layouts/partials/custom/head.html` | Google Fonts, JSON-LD structured data |
| `layouts/partials/custom/footer.html` | Any custom footer scripts |
| `assets/css/custom.css` | Migrated brand styles (accent colors, noise texture) |
| `assets/css/schemes/blog-dark.css` | Custom Blowfish color scheme |

### New Files (Phase 2)
| File | Responsibility |
|---|---|
| `content/posts/_index.md` | Root posts section listing |
| `content/posts/{ai,docker,devops,general,go,laravel,psr,cursor}/_index.md` | Section cascade defaults |

### Modified Files
| File | Changes |
|---|---|
| `.github/workflows/hugo.yml` | Add Go setup, `hugo mod get`, remove submodule checkout |
| `Taskfile.yml` | Fix `new-post` task for page bundles |
| `CLAUDE.md` | Update theme, config paths, shortcodes |

### Removed Files
| File | Reason |
|---|---|
| `themes/PaperMod/` | Replaced by Hugo Module |
| `.gitmodules` | No more git submodules |
| `hugo.toml` | Replaced by `config/_default/` |
| `layouts/shortcodes/{img,tabs,tab,callout}.html` | Unused (0 references) |
| `static/css/shortcodes.css` | Unused shortcode CSS |
| `layouts/partials/extend_head.html` | Replaced by `custom/head.html` |
| `layouts/partials/extend_footer.html` | Replaced by `custom/footer.html` |
| `layouts/partials/post_nav_links.html` | Blowfish built-in |
| `layouts/partials/related-posts.html` | Blowfish built-in |
| `layouts/partials/comments.html` | Blowfish native Giscus |
| `layouts/_default/single.html` | Blowfish built-in |
| `layouts/_default/list.html` | Blowfish built-in |
| `assets/css/extended/custom.css` | Replaced by `assets/css/custom.css` |

---

## Phase 1: Theme Foundation

### Task 1: Create feature branch + capture baseline

**Files:** None created/modified (baseline capture only)

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feature/blowfish-migration
```

- [ ] **Step 2: Build current site and capture baseline URLs**

```bash
hugo --gc --minify
find public -name '*.html' | sort > /tmp/urls-before.txt
wc -l /tmp/urls-before.txt
```

Record the line count — this is how many HTML pages must exist after migration.

- [ ] **Step 3: Capture current RSS feed**

```bash
ls -la public/feed.xml public/tags/*/feed.xml public/categories/*/feed.xml 2>/dev/null | head -20
```

- [ ] **Step 4: Clean build output**

```bash
rm -rf public/ resources/_gen/ .hugo_build.lock
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: start blowfish migration branch"
```

---

### Task 2: Remove PaperMod submodule

**Files:**
- Remove: `themes/PaperMod/` (submodule)
- Remove: `.gitmodules`

- [ ] **Step 1: Deinitialize and remove submodule**

```bash
git submodule deinit -f themes/PaperMod
git rm -f themes/PaperMod
rm -rf .git/modules/themes/PaperMod
```

- [ ] **Step 2: Remove .gitmodules if now empty**

```bash
cat .gitmodules 2>/dev/null
# If empty or only contained PaperMod:
git rm .gitmodules 2>/dev/null || true
```

- [ ] **Step 3: Remove themes directory if empty**

```bash
rmdir themes 2>/dev/null || true
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: remove PaperMod submodule"
```

---

### Task 3: Initialize Hugo Modules + add Blowfish

**Files:**
- Create: `go.mod`, `go.sum`
- Create: `config/_default/module.toml`

- [ ] **Step 1: Initialize Hugo Module**

```bash
hugo mod init github.com/jonesrussell/blog
```

- [ ] **Step 2: Verify Blowfish GitHub username and pin version**

Check the Blowfish GitHub repo to confirm the exact username (`nunocoracao` vs `nunocorrea`). Then pin to a specific release:

```bash
hugo mod get github.com/nunocoracao/blowfish/v2@v2.100.0
```

Adjust username and version as needed based on what you find.

- [ ] **Step 3: Create config directory**

```bash
mkdir -p config/_default
```

- [ ] **Step 4: Create module.toml with pinned version**

Write `config/_default/module.toml`:

```toml
[hugoVersion]
  extended = true
  min = "0.141.0"

[[imports]]
  path = "github.com/nunocoracao/blowfish/v2"
```

Note: Adjust GitHub username if Step 2 found a different one.

- [ ] **Step 5: Verify module downloads**

```bash
hugo mod get
hugo mod graph
```

Expected: Blowfish module appears in graph output.

- [ ] **Step 6: Examine Blowfish's built-in scheme files for CSS variable naming**

```bash
# Find the module cache path
hugo mod graph | head -1
# Then inspect a built-in color scheme to learn the variable naming:
find $(go env GOMODCACHE) -path '*/blowfish*' -name '*.css' -path '*/schemes/*' 2>/dev/null | head -5
```

Save this output — you'll need it for Task 9.

- [ ] **Step 7: Examine Blowfish's custom partial naming convention**

```bash
# Check if Blowfish expects custom/head.html or extend-head.html
find $(go env GOMODCACHE) -path '*/blowfish*' -name '*.html' | grep -E '(custom|extend)' | head -10
```

Confirm the correct partial path before creating custom partials in Task 8.

- [ ] **Step 8: Commit**

```bash
git add go.mod go.sum config/_default/module.toml
git commit -m "feat: add Blowfish theme via Hugo Modules (pinned version)"
```

---

### Task 4: Create base config (hugo.toml)

**Files:**
- Create: `config/_default/hugo.toml`

Note: The root `hugo.toml` is NOT removed yet — it stays as a fallback until all new config files are created (Task 11).

- [ ] **Step 1: Create config/_default/hugo.toml**

```toml
baseURL = 'https://jonesrussell.github.io/blog/'
languageCode = 'en-us'
title = 'Web Developer Blog'
enableRobotsTXT = true

[pagination]
  pagerSize = 10

[taxonomies]
  category = 'categories'
  tag = 'tags'
  series = 'series'

[permalinks]
  [permalinks.page]
    posts = '/:slug/'
  [permalinks.section]
    posts = '/:slug/'

[outputFormats]
  [outputFormats.RSS]
    baseName = "feed"

[outputs]
  home = ['HTML', 'RSS', 'JSON']
  taxonomy = ['HTML', 'RSS', 'JSON']

[imaging]
  quality = 85
  resampleFilter = 'Lanczos'

[related]
  includeNewer = true
  threshold = 80
  toLower = true
  [[related.indices]]
    name = 'tags'
    weight = 100
  [[related.indices]]
    name = 'categories'
    weight = 80
  [[related.indices]]
    name = 'series'
    weight = 120
  [[related.indices]]
    name = 'date'
    weight = 10
```

- [ ] **Step 2: Commit**

```bash
git add config/_default/hugo.toml
git commit -m "feat: add base Hugo config for Blowfish"
```

---

### Task 5: Create params.toml

**Files:**
- Create: `config/_default/params.toml`

- [ ] **Step 1: Check Blowfish documentation for exact param names**

Reference Blowfish docs to verify parameter names. Key areas: homepage layout, article settings, search, analytics, comments.

- [ ] **Step 2: Create config/_default/params.toml**

```toml
# Appearance
colorScheme = "blog-dark"
defaultAppearance = "dark"
autoSwitchAppearance = true

# Global
mainSections = ["posts"]
description = "A resource for web developers, I use modern technologies, best practices, and personal experiences. Explore guides on Laravel, Golang, Docker, and more."
enableSearch = true
enableCodeCopy = true

# Homepage
[homepage]
  layout = "hero"
  homepageImage = "images/og-default.png"
  showRecent = true
  showRecentItems = 10
  showMoreLink = true
  showMoreLinkDest = "/posts"

# Article defaults
[article]
  showBreadcrumbs = true
  showReadingTime = true
  showTableOfContents = true
  showTaxonomies = true
  showWordCount = false
  showComments = true
  sharingLinks = ["facebook", "x-twitter", "linkedin"]

# List defaults
[list]
  showBreadcrumbs = true
  showTableOfContents = false

# Fuse.js search
[fuse]
  isCaseSensitive = false
  shouldSort = true
  location = 0
  distance = 1000
  threshold = 0.4
  minMatchCharLength = 0
  keys = ["title", "permalink", "summary", "content"]

# Twitter / OG
[twitter]
  card = "summary_large_image"
  site = "@jonesrussell42"
  creator = "@jonesrussell42"

# Default OG image
images = ["images/og-default.png"]

# Assets
[assets]
  favicon = "/favicon.ico"

# Analytics — migrated from extend_head.html gtag.js snippet
[analytics.google]
  siteTag = "G-LM50CCHND9"
```

Note: Verify exact param names against Blowfish docs. Some names may differ slightly between Blowfish versions.

- [ ] **Step 3: Commit**

```bash
git add config/_default/params.toml
git commit -m "feat: add Blowfish theme params config"
```

---

### Task 6: Create languages.en.toml + menus.en.toml

**Files:**
- Create: `config/_default/languages.en.toml`
- Create: `config/_default/menus.en.toml`

- [ ] **Step 1: Create languages.en.toml**

```toml
languageName = "English"
weight = 1
title = "Web Developer Blog"

[params]
  displayName = "EN"
  isoCode = "en"

[params.author]
  name = "Russell"
  image = "images/og-default.png"
  headline = "Web Developer"
  links = [
    { github = "https://github.com/jonesrussell" },
    { x-twitter = "https://x.com/jonesrussell42" },
    { linkedin = "https://www.linkedin.com/in/jonesrussell42" },
    { stackoverflow = "https://stackoverflow.com/users/437654/russell" },
    { dev = "https://dev.to/jonesrussell" },
    { youtube = "https://www.youtube.com/@fullstackdev42" },
    { rss = "/blog/feed.xml" },
  ]
```

Note: Verify Blowfish's exact author/social link format against docs. The `[params.author]` structure is used by Task 8's JSON-LD template — the `author.name` field must match.

- [ ] **Step 2: Create menus.en.toml**

```toml
[[main]]
  name = "Posts"
  pageRef = "posts"
  weight = 1

[[main]]
  name = "Search"
  pageRef = "search"
  weight = 2

[[main]]
  name = "Topics"
  pageRef = "topics"
  weight = 3

[[main]]
  name = "Archived"
  pageRef = "archived"
  weight = 4

[[main]]
  name = "About"
  pageRef = "about"
  weight = 5
```

- [ ] **Step 3: Commit**

```bash
git add config/_default/languages.en.toml config/_default/menus.en.toml
git commit -m "feat: add language and menu config for Blowfish"
```

---

### Task 7: Create markup.toml

**Files:**
- Create: `config/_default/markup.toml`

- [ ] **Step 1: Check if Blowfish requires noClasses = true**

Blowfish may ship its own syntax highlighting CSS. Check:

```bash
find $(go env GOMODCACHE) -path '*/blowfish*' -name '*.css' | xargs grep -l 'chroma' 2>/dev/null | head -5
```

If Blowfish ships Chroma CSS classes, use `noClasses = false`. If not, use `noClasses = true` (inline styles).

- [ ] **Step 2: Create markup.toml**

```toml
[highlight]
  style = 'monokai'
  lineNos = false
  codeFences = true
  guessSyntax = true
  noClasses = false
  lineNumbersInTable = true

[goldmark]
  [goldmark.renderer]
    unsafe = true
```

Adjust `noClasses` based on Step 1 findings.

- [ ] **Step 3: Commit**

```bash
git add config/_default/markup.toml
git commit -m "feat: add markup config for Blowfish"
```

---

### Task 8: Create custom/head.html (Google Fonts + JSON-LD)

**Dependency:** Task 6 must be complete (JSON-LD references `author.name` from languages config).

**Files:**
- Create: `layouts/partials/custom/head.html`

- [ ] **Step 1: Confirm Blowfish's custom partial path**

Use findings from Task 3, Step 7. The path is likely `layouts/partials/custom/head.html` but could be `layouts/partials/extend-head.html`. Create in whichever location Blowfish expects.

- [ ] **Step 2: Create directory**

```bash
mkdir -p layouts/partials/custom
```

- [ ] **Step 3: Create custom/head.html**

```html
<!-- Google Fonts: Bricolage Grotesque (headings), Instrument Sans (body), JetBrains Mono (code) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- JSON-LD Structured Data -->
{{ if .IsPage }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {{ .Title | jsonify }},
  "datePublished": {{ .Date.Format "2006-01-02T15:04:05Z07:00" | jsonify }},
  "dateModified": {{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" | jsonify }},
  "description": {{ with .Params.summary }}{{ . | jsonify }}{{ else }}{{ .Summary | plainify | jsonify }}{{ end }},
  "url": {{ .Permalink | jsonify }},
  "author": {
    "@type": "Person",
    "name": {{ site.Params.author.name | default "Russell" | jsonify }}
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ .Site.Title | jsonify }},
    "url": {{ .Site.BaseURL | jsonify }}
  }
}
</script>
{{ end }}

<!-- Content status notice styles -->
<style>
.content-status-notice { margin: 0.75rem 0; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 4px; }
.content-status-notice p { margin: 0; font-size: 0.9rem; }
</style>
```

Note: Check if Blowfish has built-in JSON-LD. If yes, compare fields and remove the custom block to avoid duplicates. The `site.Params.author.name` reference depends on the `[params.author]` config from Task 6 — verify this path matches Blowfish's conventions.

- [ ] **Step 4: Commit**

```bash
git add layouts/partials/custom/head.html
git commit -m "feat: add Google Fonts + JSON-LD to custom head partial"
```

---

### Task 9: Create custom color scheme

**Files:**
- Create: `assets/css/schemes/blog-dark.css`

- [ ] **Step 1: Examine Blowfish's built-in scheme for variable names**

Use the scheme file found in Task 3, Step 6. Copy a built-in scheme (e.g., `blowfish.css`) as a starting point.

- [ ] **Step 2: Create schemes directory**

```bash
mkdir -p assets/css/schemes
```

- [ ] **Step 3: Create blog-dark.css**

Base on the built-in scheme structure, adapting colors to match current dark theme (`#0a0a0f` background). The exact CSS variable names come from Step 1 — do not guess.

```css
/* Custom dark color scheme for blog */
/* Copy variable structure from Blowfish's built-in scheme, */
/* then adjust values to match current theme colors:        */
/* Background: #0a0a0f                                      */
/* Accent 1: from current --accent-1 CSS variable           */
/* Accent 2: from current --accent-2 CSS variable           */
```

- [ ] **Step 4: Verify scheme name matches params.toml**

Confirm `config/_default/params.toml` has `colorScheme = "blog-dark"` (matching the filename without `.css`).

- [ ] **Step 5: Commit**

```bash
git add assets/css/schemes/blog-dark.css
git commit -m "feat: add custom blog-dark color scheme for Blowfish"
```

---

### Task 10: Custom CSS migration

**Files:**
- Create: `assets/css/custom.css`

- [ ] **Step 1: Inventory current custom.css**

Read `assets/css/extended/custom.css` and categorize each block:

| CSS Block | Action | Reason |
|---|---|---|
| Accent color variables | **Move to** color scheme | Handled by blog-dark.css |
| Noise texture overlay | **Migrate** | Brand identity |
| Gradient effects | **Evaluate** | May conflict with Blowfish |
| Custom scrollbar | **Evaluate** | Blowfish may have its own |
| Header scroll animation | **Remove** | Blowfish handles header |
| Post entry hover effects | **Evaluate** | Blowfish cards may supersede |
| Blockquote styling | **Migrate** if needed | Check Blowfish default first |
| Search box styling | **Remove** | Blowfish modal search replaces |
| Breadcrumb transitions | **Remove** | Blowfish built-in breadcrumbs |
| List layout fixes | **Remove** | PaperMod-specific |

- [ ] **Step 2: Create custom.css with migrated styles**

```css
/* Typography overrides — match Google Fonts loaded in custom/head.html */
body {
  font-family: 'Instrument Sans', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Bricolage Grotesque', sans-serif;
}

code, pre, .code {
  font-family: 'JetBrains Mono', monospace;
}

/* Noise texture overlay — brand identity */
/* Copy from current custom.css ::before pseudo-element if still desired */
```

Add other "Migrate" items from the inventory.

- [ ] **Step 3: Commit (do NOT remove old CSS yet — that happens in Task 11)**

```bash
git add assets/css/custom.css
git commit -m "feat: create Blowfish custom CSS with migrated brand styles"
```

---

### Task 11: Remove old config + old partials (atomic swap)

**Prerequisite:** Tasks 4-10 must ALL be complete. This is the cutover — old PaperMod files are removed and new Blowfish files take over.

**Files:**
- Remove: `hugo.toml` (root)
- Remove: `layouts/partials/extend_head.html`
- Remove: `layouts/partials/extend_footer.html`
- Remove: `assets/css/extended/custom.css`
- Remove: `static/css/shortcodes.css`

- [ ] **Step 1: Remove old files**

```bash
git rm hugo.toml
git rm layouts/partials/extend_head.html
git rm layouts/partials/extend_footer.html
git rm assets/css/extended/custom.css
git rm static/css/shortcodes.css
rmdir assets/css/extended 2>/dev/null || true
```

- [ ] **Step 2: First build test with Blowfish**

```bash
hugo --gc --minify 2>&1 | head -30
```

Expected: Site builds. There may be warnings about missing layouts (custom layouts not yet migrated) — that's expected. Errors about missing config or theme are blockers.

- [ ] **Step 3: Check page count**

```bash
find public -name '*.html' | wc -l
```

Compare against baseline from Task 1. Note any missing pages — they'll be addressed in subsequent tasks.

- [ ] **Step 4: Quick visual check**

```bash
hugo server --gc --minify &
# Open http://localhost:1313/blog/ — verify:
# - Homepage renders (even if layout isn't final)
# - Google Fonts load (check headings)
# - Dark theme applies
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: switch to Blowfish config, remove PaperMod partials"
```

**Rollback:** If build fails catastrophically, `git revert HEAD` restores old files.

---

### Task 12: Delete unused shortcodes

**Files:**
- Remove: `layouts/shortcodes/img.html`
- Remove: `layouts/shortcodes/tabs.html`
- Remove: `layouts/shortcodes/tab.html`
- Remove: `layouts/shortcodes/callout.html`

- [ ] **Step 1: Verify zero usage (double-check)**

```bash
grep -r '{{<\s*tabs' content/ || echo "No tabs usage"
grep -r '{{<\s*callout' content/ || echo "No callout usage"
grep -r '{{<\s*img' content/ || echo "No img shortcode usage"
```

All should return "No ... usage".

- [ ] **Step 2: Remove shortcodes**

```bash
git rm layouts/shortcodes/img.html layouts/shortcodes/tabs.html layouts/shortcodes/tab.html layouts/shortcodes/callout.html
rmdir layouts/shortcodes 2>/dev/null || true
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove unused custom shortcodes"
```

---

### Task 13: Keep + adapt RSS template

The custom `layouts/_default/rss.xml` has two critical customizations that Blowfish almost certainly lacks:
1. **Archived post exclusion** (`where $pages "Params.archived" "!=" true`)
2. **Full content** via `content:encoded`

**Files:**
- Modify: `layouts/_default/rss.xml`

- [ ] **Step 1: Verify Blowfish's RSS template lacks these features**

```bash
find $(go env GOMODCACHE) -path '*/blowfish*' -name 'rss.xml' -exec grep -l 'archived' {} \;
```

Expected: no results (Blowfish doesn't know about archived posts).

- [ ] **Step 2: Keep the custom RSS template**

The existing `layouts/_default/rss.xml` overrides Blowfish's default. Verify it still works:

```bash
hugo --gc --minify
test -f public/feed.xml && echo "RSS OK" || echo "MISSING"
# Check archived posts are excluded
grep -c '<item>' public/feed.xml
```

- [ ] **Step 3: If the template references PaperMod-specific variables, adapt them**

Read the RSS template and check for any PaperMod-specific Hugo template calls. Replace with Blowfish equivalents or standard Hugo functions.

- [ ] **Step 4: Commit if changes were needed**

```bash
git add -A && git commit -m "feat: adapt RSS template for Blowfish compatibility"
```

---

### Task 14: Migrate archived-list layout

**Files:**
- Modify: `layouts/_default/archived-list.html`
- Evaluate: `layouts/_default/archives.html`

- [ ] **Step 1: Understand Blowfish's base template**

Check Blowfish's base template name and block structure:

```bash
find $(go env GOMODCACHE) -path '*/blowfish*' -name 'baseof.html' -exec head -30 {} \;
```

Note the `{{ define "main" }}` block structure.

- [ ] **Step 2: Rewrite archived-list.html using Blowfish conventions**

```html
{{ define "main" }}
<header>
  <h1>{{ .Title }}</h1>
  {{ with .Content }}
  <div>{{ . }}</div>
  {{ end }}
</header>

<section>
  {{ $archived := where site.RegularPages "Params.archived" true }}
  {{ if $archived }}
  <ul>
    {{ range $archived.ByDate.Reverse }}
    <li>
      <a href="{{ .Permalink }}">{{ .Title }}</a>
      <time datetime="{{ .Date.Format "2006-01-02" }}">
        {{ .Date.Format "January 2, 2006" }}
      </time>
      {{ with .Params.archived_date }}
      <span>(archived {{ . }})</span>
      {{ end }}
    </li>
    {{ end }}
  </ul>
  {{ else }}
  <p>No archived posts.</p>
  {{ end }}
</section>
{{ end }}
```

Adapt to match Blowfish's CSS classes and template conventions found in Step 1.

- [ ] **Step 3: Evaluate archives.html**

```bash
# Check if archives.html is used by any content page
grep -r 'layout.*archives' content/ || echo "Not referenced in content"
```

If redundant with archived-list, remove it:

```bash
git rm layouts/_default/archives.html 2>/dev/null || true
```

- [ ] **Step 4: Ensure content/archived/_index.md exists and uses correct layout**

```bash
cat content/archived/_index.md 2>/dev/null || echo "Missing"
```

If missing, create it with `layout: "archived-list"` in frontmatter.

- [ ] **Step 5: Test**

```bash
hugo --gc --minify
test -f public/archived/index.html && echo "OK" || echo "MISSING"
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: migrate archived list layout to Blowfish"
```

---

### Task 15: Migrate topics layout

**Files:**
- Evaluate: `layouts/section/topics.html`

- [ ] **Step 1: Check Blowfish's taxonomy templates**

```bash
find $(go env GOMODCACHE) -path '*/blowfish*' -name '*.html' -path '*/taxonomy/*' | head -10
find $(go env GOMODCACHE) -path '*/blowfish*' -name 'terms.html' | head -5
```

- [ ] **Step 2: Check if content/topics/_index.md needs updating**

The topics page combines tags and categories. Check if Blowfish's default taxonomy listing handles this, or if the custom layout is still needed.

- [ ] **Step 3: Adapt or remove topics.html**

If Blowfish handles it, remove the custom layout. Otherwise, rewrite to extend Blowfish's base template (same approach as Task 14).

- [ ] **Step 4: Test**

```bash
hugo --gc --minify
test -f public/topics/index.html && echo "OK" || echo "MISSING"
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate topics layout to Blowfish"
```

---

### Task 16: Configure Giscus comments

**Files:**
- Modify: `config/_default/params.toml`
- Remove: `layouts/partials/comments.html`

- [ ] **Step 1: Obtain Giscus IDs**

Go to [giscus.app](https://giscus.app/) and configure for repository `jonesrussell/blog`:
- Mapping: `pathname`
- Category: select or create a "Comments" discussion category
- Record: `repo-id` and `category-id`

- [ ] **Step 2: Add Giscus config to params.toml**

Check Blowfish docs for exact Giscus param structure, then add to `config/_default/params.toml`. Likely:

```toml
[comments]
  provider = "giscus"

[comments.giscus]
  repo = "jonesrussell/blog"
  repoId = "<obtained-repo-id>"
  category = "Comments"
  categoryId = "<obtained-category-id>"
  mapping = "pathname"
  reactionsEnabled = true
  emitMetadata = false
  inputPosition = "bottom"
  theme = "dark"
  lang = "en"
```

- [ ] **Step 3: Remove custom comments partial**

```bash
git rm layouts/partials/comments.html
```

- [ ] **Step 4: Test**

```bash
hugo --gc --minify
grep -l 'giscus' public/*/index.html | head -3
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: configure Giscus comments via Blowfish native support"
```

---

### Task 17: Remove remaining PaperMod layouts + migrate content_status_notice

**Files:**
- Remove: `layouts/partials/post_nav_links.html`
- Remove: `layouts/partials/related-posts.html`
- Remove: `layouts/_default/single.html`
- Remove: `layouts/_default/list.html`
- Evaluate: `layouts/partials/content_status_notice.html`
- Evaluate: `layouts/robots.txt`
- Evaluate: `layouts/series/list.json`

- [ ] **Step 1: Handle content_status_notice**

This partial renders archived/draft/deprecated status banners on posts. It must continue working after migration.

**Option A:** If Blowfish's `single.html` template includes a hook where custom partials can be injected (check for `partial "custom/..."` or similar), create a Blowfish-compatible override.

**Option B:** Override Blowfish's `single.html` to include the `content_status_notice` partial call. Copy Blowfish's `single.html` to `layouts/_default/single.html` and add:

```html
{{- partial "content_status_notice.html" . }}
```

after the header section. This is the nuclear option — it means tracking Blowfish's single.html for updates.

**Option C (preferred):** Use Blowfish's `alert` shortcode in the content itself instead of a template-level partial. Add a render hook or use `cascade` frontmatter to automatically insert an alert for archived posts. Investigate feasibility during implementation.

- [ ] **Step 2: Evaluate robots.txt**

```bash
cat layouts/robots.txt
```

If standard directives only, remove. If customized, keep.

- [ ] **Step 3: Evaluate series/list.json**

Check if any external consumer uses this endpoint:

```bash
# Check if referenced anywhere
grep -r 'series.*json\|list\.json' content/ layouts/ config/ assets/ static/ 2>/dev/null
```

If not used externally, remove. If used, keep as layout override.

- [ ] **Step 4: Remove PaperMod layouts**

```bash
git rm layouts/partials/post_nav_links.html
git rm layouts/partials/related-posts.html
# Only remove single.html if NOT overriding for content_status_notice (Option B)
git rm layouts/_default/single.html 2>/dev/null || true
git rm layouts/_default/list.html
```

- [ ] **Step 5: Test build**

```bash
hugo --gc --minify 2>&1 | tail -10
find public -name '*.html' | wc -l
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: remove PaperMod layouts, handle content_status_notice for Blowfish"
```

---

### Task 18: Verify series taxonomy

**Files:** None (verification + possible fixes)

- [ ] **Step 1: Check series pages render**

```bash
hugo --gc --minify
# Check series listing exists
test -f public/series/index.html && echo "Series index OK" || echo "MISSING"
# Check individual series pages
ls public/series/*/index.html 2>/dev/null | head -10
```

- [ ] **Step 2: Verify series navigation on a PSR post**

```bash
# Check a PSR post has series links
grep -i 'series\|php-fig' public/psr-1-basic-coding-standard/index.html | head -10
```

- [ ] **Step 3: Check series/list.json (if kept)**

```bash
test -f public/series/index.json && echo "Series JSON OK" || echo "Not generated"
```

- [ ] **Step 4: Verify series _index.md files**

```bash
ls content/series/*/index.md content/series/*/_index.md 2>/dev/null
```

Ensure existing series `_index.md` files work with Blowfish.

- [ ] **Step 5: Fix any series issues**

If series pages are broken, check Blowfish's taxonomy/terms template structure and create necessary overrides.

- [ ] **Step 6: Commit if fixes needed**

```bash
git add -A && git commit -m "fix: ensure series taxonomy works with Blowfish"
```

---

### Task 19: Audit shared images

**Files:**
- Evaluate: `assets/images/*`, `static/images/*`

- [ ] **Step 1: Find referenced images**

```bash
for img in assets/images/*; do
  basename="$(basename "$img")"
  if grep -rq "$basename" content/ layouts/ config/ 2>/dev/null; then
    echo "USED: $img"
  else
    echo "ORPHANED: $img"
  fi
done
```

- [ ] **Step 2: Same for static/images/**

```bash
for img in static/images/* static/images/**/*; do
  basename="$(basename "$img")"
  if grep -rq "$basename" content/ layouts/ config/ 2>/dev/null; then
    echo "USED: $img"
  else
    echo "ORPHANED: $img"
  fi
done
```

- [ ] **Step 3: Remove orphaned images**

```bash
git rm <orphaned-image-paths>
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: remove orphaned images"
```

---

### Task 20: Update GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/hugo.yml`

- [ ] **Step 1: Read current workflow**

Read `.github/workflows/hugo.yml`.

- [ ] **Step 2: Add Go setup before Hugo setup**

```yaml
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: 'stable'
```

- [ ] **Step 3: Add module download after Hugo setup**

```yaml
      - name: Download Hugo Modules
        run: hugo mod get
```

- [ ] **Step 4: Remove submodule checkout flag**

Change:
```yaml
        with:
          submodules: recursive
          fetch-depth: 0
```
To:
```yaml
        with:
          fetch-depth: 0
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/hugo.yml
git commit -m "feat: update GitHub Actions for Hugo Modules (add Go, remove submodules)"
```

---

### Task 21: Full smoke test + URL comparison

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

```bash
rm -rf public/ resources/_gen/ .hugo_build.lock
hugo --gc --minify
```

- [ ] **Step 2: Compare URLs against baseline**

```bash
find public -name '*.html' | sort > /tmp/urls-after.txt
diff /tmp/urls-before.txt /tmp/urls-after.txt
```

Missing pages are **blockers** — investigate and fix. New pages (Blowfish features) are expected.

- [ ] **Step 3: Verify critical pages**

```bash
for page in index.html posts/index.html search/index.html topics/index.html archived/index.html about/index.html feed.xml sitemap.xml; do
  test -f "public/$page" && echo "OK: $page" || echo "MISSING: $page"
done
```

- [ ] **Step 4: Verify RSS feed excludes archived posts**

```bash
test -f public/feed.xml && echo "feed.xml exists" || echo "MISSING"
grep -c '<item>' public/feed.xml
```

- [ ] **Step 5: Verify a sample post**

```bash
test -f public/laravel-boost-ddev/index.html && echo "OK" || echo "MISSING"
```

- [ ] **Step 6: Visual inspection**

```bash
hugo server --gc --minify
```

Check in browser:
- Homepage hero layout with card grid
- Post renders with content, code highlighting, TOC
- Dark mode toggle works
- Search modal opens and works
- Google Fonts loading (Bricolage Grotesque, Instrument Sans, JetBrains Mono)
- Navigation works (Posts, Search, Topics, Archived, About)
- Series navigation (check a PSR post)
- Comments section visible (Giscus)
- Archived page lists archived posts
- RSS at `/blog/feed.xml`

- [ ] **Step 7: Document any issues for follow-up**

Create a list of visual or functional issues found. These may be addressed in Phase 2 tasks or as bug fixes.

---

## Phase 2: Hugo Feature Adoption

### Task 22: Create section _index.md files with cascade frontmatter

**Files:**
- Create: `content/posts/_index.md` + 8 section `_index.md` files

- [ ] **Step 1: Verify no slug collisions**

```bash
for section in ai docker devops general go laravel psr cursor; do
  grep -rl "slug: \"$section\"" content/posts/ && echo "COLLISION: $section" || true
done
```

- [ ] **Step 2: Create root posts _index.md**

```yaml
---
title: "Posts"
description: "All blog posts"
---
```

- [ ] **Step 3: Create section _index.md files**

Example for `content/posts/ai/_index.md`:

```yaml
---
title: "AI"
description: "Posts about artificial intelligence, Claude Code, and AI-assisted development"
cascade:
  categories: ["AI"]
  showAuthor: true
  showDate: true
  showReadingTime: true
  showTableOfContents: true
---
```

Create for all sections with appropriate titles and categories:
- `docker` → categories: ["Docker"]
- `devops` → categories: ["DevOps"]
- `general` → categories: ["General"]
- `go` → categories: ["Go"]
- `laravel` → categories: ["Laravel"]
- `psr` → categories: ["PHP", "PSR"]
- `cursor` → categories: ["Cursor"]

- [ ] **Step 4: Test build + verify page count**

```bash
hugo --gc --minify
find public -name '*.html' | wc -l
```

- [ ] **Step 5: Commit**

```bash
git add content/posts/*/_index.md content/posts/_index.md
git commit -m "feat: add section _index.md files with cascade frontmatter"
```

---

### Task 23: Verify Hugo image processing

**Files:** None (verification + config adjustment)

- [ ] **Step 1: Verify Blowfish's feature image conventions**

Check Blowfish docs for how feature images work. Typically: a file named `feature*` (e.g., `feature.jpg`, `feature.png`) in the page bundle.

- [ ] **Step 2: Test with a sample post**

Find a post that has an image in its bundle, or add a test image:

```bash
# Check if any posts already have feature images
find content/posts -name 'feature*' | head -10
```

If none exist, copy a test image into a post bundle:

```bash
cp assets/images/home.png content/posts/laravel/laravel-boost-ddev/feature.png
```

- [ ] **Step 3: Build and verify**

```bash
hugo --gc --minify
# Check if the image was processed (look for resized versions)
find public -path '*/laravel-boost-ddev/*' -name '*.png' -o -name '*.jpg' -o -name '*.webp' | head -10
```

- [ ] **Step 4: Remove test image if added**

```bash
rm content/posts/laravel/laravel-boost-ddev/feature.png 2>/dev/null
```

- [ ] **Step 5: Document findings for Phase 3**

Note how Blowfish handles feature images so Phase 3 (content review) knows the exact convention.

---

### Task 24: Verify OG tags + social meta

**Files:** None (verification + possible fixes)

- [ ] **Step 1: Check OG tags on a post**

```bash
hugo --gc --minify
grep -E 'og:|twitter:' public/laravel-boost-ddev/index.html | head -20
```

Expected: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`, `twitter:site`, `twitter:creator`

- [ ] **Step 2: Check OG image fallback**

```bash
grep 'og:image' public/laravel-boost-ddev/index.html
```

Should reference `images/og-default.png` or equivalent.

- [ ] **Step 3: Fix any missing OG tags**

If Blowfish doesn't generate all required tags, add them to `layouts/partials/custom/head.html`.

- [ ] **Step 4: Commit if changes needed**

```bash
git add -A && git commit -m "fix: ensure complete OG and Twitter Card meta tags"
```

---

### Task 25: SEO infrastructure (structured data + canonical URLs)

**Files:**
- Modify: `layouts/partials/custom/head.html`

- [ ] **Step 1: Check canonical URLs**

```bash
hugo --gc --minify
grep 'rel="canonical"' public/laravel-boost-ddev/index.html
```

If Blowfish doesn't generate canonicals, add to `custom/head.html`.

- [ ] **Step 2: Check sitemap excludes archived posts**

```bash
test -f public/sitemap.xml && echo "OK" || echo "MISSING"
```

- [ ] **Step 3: Add BreadcrumbList + WebSite schemas**

Add to `layouts/partials/custom/head.html`:

```html
{{ if .IsPage }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": {{ .Site.BaseURL | jsonify }} },
    { "@type": "ListItem", "position": 2, "name": "Posts", "item": {{ (print .Site.BaseURL "posts/") | jsonify }} },
    { "@type": "ListItem", "position": 3, "name": {{ .Title | jsonify }}, "item": {{ .Permalink | jsonify }} }
  ]
}
</script>
{{ end }}
{{ if .IsHome }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": {{ .Site.Title | jsonify }},
  "url": {{ .Site.BaseURL | jsonify }},
  "potentialAction": {
    "@type": "SearchAction",
    "target": {{ (print .Site.BaseURL "search/?q={search_term_string}") | jsonify }},
    "query-input": "required name=search_term_string"
  }
}
</script>
{{ end }}
```

- [ ] **Step 4: Test**

```bash
hugo --gc --minify
grep -c 'BreadcrumbList' public/laravel-boost-ddev/index.html
grep -c 'WebSite' public/index.html
```

- [ ] **Step 5: Commit**

```bash
git add layouts/partials/custom/head.html
git commit -m "feat: add BreadcrumbList and WebSite JSON-LD schemas"
```

---

### Task 26: Accessibility theme-level audit

**Files:** None (audit — fixes applied as needed)

- [ ] **Step 1: Check skip-to-content link**

```bash
hugo --gc --minify
grep -i 'skip' public/index.html | head -5
```

- [ ] **Step 2: Check semantic landmarks**

```bash
for tag in '<nav' '<main' '<article' '<footer'; do
  count=$(grep -c "$tag" public/laravel-boost-ddev/index.html)
  echo "$tag: $count"
done
```

- [ ] **Step 3: Check ARIA labels**

```bash
grep -c 'aria-label' public/index.html
```

- [ ] **Step 4: Run Lighthouse audit**

```bash
hugo server --gc --minify &
```

Open in Chrome, run Lighthouse. Target: 90+ Performance, Accessibility, SEO, Best Practices.

```bash
kill %1
```

- [ ] **Step 5: Check color contrast**

Verify with a contrast checker:
- Body text on dark background: must meet WCAG 2.1 AA (4.5:1)
- Accent colors on dark background
- Code block text
- Link colors (default + hover)

- [ ] **Step 6: Fix issues and commit**

```bash
git add -A && git commit -m "fix: accessibility improvements from theme audit"
```

---

### Task 27: Enable Mermaid diagrams

**Files:**
- Modify: `config/_default/params.toml` (if needed)

- [ ] **Step 1: Check if Mermaid works by default in Blowfish**

Blowfish may auto-enable Mermaid for fenced code blocks with language `mermaid`. Test:

```bash
# Create a temp test in a draft post
echo '```mermaid
graph LR
    A[Start] --> B[End]
```' >> /tmp/mermaid-test.md
```

- [ ] **Step 2: Enable in config if needed**

Add to `params.toml` if required by Blowfish docs.

- [ ] **Step 3: Test build and verify rendering**

- [ ] **Step 4: Commit**

```bash
git add config/_default/params.toml
git commit -m "feat: enable Mermaid diagram support"
```

---

### Task 28: Configure enhanced code blocks

**Files:**
- Possibly modify: `config/_default/markup.toml`

- [ ] **Step 1: Verify code copy button works**

Already configured via `enableCodeCopy = true` in params.toml.

- [ ] **Step 2: Test code block features**

```bash
hugo server --gc --minify
```

Open a code-heavy post and verify: syntax highlighting, copy button, line numbers with `{linenos=true}`.

- [ ] **Step 3: Commit if changes needed**

```bash
git add -A && git commit -m "feat: configure enhanced code block features"
```

---

### Task 29: Verify search functionality

**Files:** None (verification + possible fixes)

- [ ] **Step 1: Verify search index generates**

```bash
hugo --gc --minify
test -f public/index.json && echo "Search index OK" || echo "MISSING"
# Check index has entries
python3 -c "import json; d=json.load(open('public/index.json')); print(f'{len(d)} entries')" 2>/dev/null || \
  wc -c public/index.json
```

- [ ] **Step 2: Verify search page exists**

```bash
test -f public/search/index.html && echo "Search page OK" || echo "MISSING"
```

If missing, create `content/search/_index.md`:

```yaml
---
title: "Search"
layout: "search"
---
```

- [ ] **Step 3: Test search in browser**

```bash
hugo server --gc --minify
```

Open site, click Search, type a query. Verify results appear.

- [ ] **Step 4: Commit if changes needed**

```bash
git add -A && git commit -m "fix: ensure search functionality works with Blowfish"
```

---

### Task 30: Update Taskfile

**Files:**
- Modify: `Taskfile.yml`

- [ ] **Step 1: Read current Taskfile**

- [ ] **Step 2: Fix new-post task for page bundles**

```yaml
  new-post:
    desc: Create a new blog post as a page bundle
    cmds:
      - hugo new content/posts/{{ .CATEGORY }}/{{ .CLI_ARGS }}/index.md
    vars:
      CATEGORY: '{{ default "general" .CATEGORY }}'
    requires:
      vars: [CLI_ARGS]
```

Usage: `task new-post -- my-post-title` or `CATEGORY=ai task new-post -- my-ai-post`

Note: Test the exact Taskfile variable interpolation syntax — Hugo template delimiters and Taskfile delimiters both use `{{ }}`. If there's a conflict, use Taskfile's `sh:` dynamic variable syntax instead:

```yaml
  new-post:
    desc: Create a new blog post as a page bundle
    vars:
      CATEGORY:
        sh: echo "${CATEGORY:-general}"
    cmds:
      - hugo new content/posts/{{.CATEGORY}}/{{.CLI_ARGS}}/index.md
```

- [ ] **Step 3: Test**

```bash
task new-post -- test-post-delete-me
ls content/posts/general/test-post-delete-me/
rm -rf content/posts/general/test-post-delete-me
```

- [ ] **Step 4: Update theme:update task**

```yaml
  theme:update:
    desc: Update Blowfish theme to latest version
    cmds:
      - hugo mod get -u github.com/nunocoracao/blowfish/v2
      - hugo mod tidy
```

- [ ] **Step 5: Commit**

```bash
git add Taskfile.yml
git commit -m "fix: update Taskfile for page bundles and Hugo Modules"
```

---

### Task 31: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update theme references**

PaperMod → Blowfish. Git submodule → Hugo Modules.

- [ ] **Step 2: Update config references**

`hugo.toml` → `config/_default/` directory structure. List new config files.

- [ ] **Step 3: Update shortcode references**

Remove custom shortcode docs. Add Blowfish built-ins: `alert`, `badge`, `button`, `chart`, `figure`, `mermaid`, `tabs`.

- [ ] **Step 4: Fix PSR post paths**

`content/posts/psr-*.md` → `content/posts/psr/<slug>/index.md`

- [ ] **Step 5: Update submodule gotcha**

Change "Run `git submodule update --init`" to "Run `hugo mod get` if theme not found".

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Blowfish theme and Hugo Modules"
```

---

### Task 32: Final Phase 2 verification

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

```bash
rm -rf public/ resources/_gen/ .hugo_build.lock
hugo --gc --minify
```

- [ ] **Step 2: Full URL comparison**

```bash
find public -name '*.html' | sort > /tmp/urls-final.txt
diff /tmp/urls-before.txt /tmp/urls-final.txt
```

- [ ] **Step 3: Verify all features**

```bash
for page in index.html posts/index.html search/index.html topics/index.html archived/index.html about/index.html feed.xml sitemap.xml; do
  test -f "public/$page" && echo "OK: $page" || echo "MISSING: $page"
done

# OG tags
grep -c 'og:title' public/laravel-boost-ddev/index.html

# JSON-LD
grep -c 'BlogPosting' public/laravel-boost-ddev/index.html
grep -c 'BreadcrumbList' public/laravel-boost-ddev/index.html
grep -c 'WebSite' public/index.html

# RSS + Sitemap
test -f public/feed.xml && echo "RSS OK"
test -f public/sitemap.xml && echo "Sitemap OK"

# Search index
test -f public/index.json && echo "Search index OK"

# Series
test -f public/series/index.html && echo "Series OK"
```

- [ ] **Step 4: Lighthouse audit**

Run on homepage + a sample post + topics page. Target: 90+ across all four scores.

- [ ] **Step 5: Visual inspection checklist**

```bash
hugo server --gc --minify
```

- [ ] Homepage hero layout with card grid
- [ ] Post: TOC, code highlighting, breadcrumbs, reading time
- [ ] Dark/light mode toggle
- [ ] Search modal (keyboard navigation)
- [ ] Giscus comments
- [ ] Google Fonts (headings, body, code)
- [ ] Social sharing buttons
- [ ] Related posts
- [ ] Series navigation (PSR post)
- [ ] Archived page
- [ ] Topics page

- [ ] **Step 6: Push and verify CI**

```bash
git push -u origin feature/blowfish-migration
```

Verify GitHub Actions workflow runs successfully.

---

## Summary

| Phase | Tasks | Description |
|---|---|---|
| Phase 1 | Tasks 1-21 | Theme swap: PaperMod → Blowfish via Hugo Modules |
| Phase 2 | Tasks 22-32 | Feature adoption: cascade, OG, SEO, accessibility, Mermaid, search |

**Next:** After this plan is complete and deployed, create Phase 3 plan (Content Review & Polish of 68 posts).
