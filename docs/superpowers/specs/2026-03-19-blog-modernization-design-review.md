# Design Review: Blog Modernization Spec

**Reviewer:** Senior Code Reviewer (Claude)
**Date:** 2026-03-19
**Spec:** `docs/superpowers/specs/2026-03-19-blog-modernization-design.md`

---

## Overall Assessment

The spec is well-structured with a sensible three-phase approach. The layout migration tables and shortcode mapping are thorough. However, there are several gaps, technical risks, and inaccuracies that should be addressed before implementation begins.

---

## Critical Issues (Must Fix)

### C1. JSON-LD already exists -- spec treats it as new (Phase 2.3)

The spec says "Add Article schema via Blowfish's `custom/head.html` partial" as if this is a new feature. However, `layouts/partials/extend_head.html` already contains a full `BlogPosting` JSON-LD block. The spec should say **migrate** the existing JSON-LD, not add it. Additionally, verify whether Blowfish has its own built-in JSON-LD support -- if so, you may get duplicate structured data unless you remove one.

### C2. Google Analytics migration is unaddressed

`extend_head.html` includes Google Analytics (gtag.js, ID `G-LM50CCHND9`). The spec does not mention migrating this. Blowfish has native analytics support via `params.toml` (`analytics.google.siteTag`), but this must be explicitly called out or GA tracking will silently break on deploy.

### C3. Google Fonts migration is unaddressed

`extend_head.html` loads three Google Fonts: Bricolage Grotesque (headings), Instrument Sans (body), JetBrains Mono (code). The spec mentions creating a custom color scheme (1.6) but says nothing about typography. Blowfish uses its own font stack. If you want to keep these fonts, you need to override Blowfish's font configuration or include them in `custom/head.html`. This is a significant visual regression risk.

### C4. Giscus comments are half-configured

`layouts/partials/comments.html` has Giscus set up but `data-repo-id` and `data-category-id` are empty strings. The spec says "Use Blowfish's native comment integration (Giscus or Utterances)" but does not mention that the current setup is incomplete. The migration step should include obtaining the actual Giscus IDs, or the comments feature will remain broken post-migration.

### C5. Custom footer JavaScript will be lost

`extend_footer.html` contains two meaningful scripts:
1. **Header scroll detection** (adds `.scrolled` class for scroll-aware header styling)
2. **Tabs shortcode runtime** (JavaScript that builds tab navigation from `data-tab-title` attributes)

The spec's shortcode mapping says tabs map to "Blowfish's built-in `tabs` shortcode," but the current tabs shortcode is entirely custom (HTML structure + JS in footer). The spec needs to verify that no content actually uses the current tabs shortcode before removing the JS. **My investigation shows zero posts currently use `{{< tabs` or `{{< callout` or `{{< img`** -- all three custom shortcodes are unused. This simplifies migration (just delete them) but the spec should state this finding explicitly.

### C6. RSS feed customization needs explicit handling

The custom `rss.xml` has two non-trivial customizations:
1. **Archived posts are excluded** from the feed (`where $pages "Params.archived" "!=" true`)
2. **Full content** is included via `content:encoded` when `ShowFullTextinRSS` is true

The spec says "Evaluate if customizations are still needed" -- this is too vague. The archived-post exclusion **must** be preserved. Verify whether Blowfish's RSS template respects a similar mechanism, or carry forward the custom RSS template.

---

## Important Issues (Should Fix)

### I1. No `_index.md` files exist under `content/posts/`

The spec (2.1) says to add `_index.md` files to each content section with cascade frontmatter. Currently `_index.md` files exist only under `content/series/` and `content/topics/`. There are **zero** `_index.md` files under `content/posts/` or its subdirectories (`ai/`, `cursor/`, `devops/`, `docker/`, `general/`, `go/`, `laravel/`, `psr/`). The spec correctly identifies the sections to create but should note that the `content/posts/` root itself also needs an `_index.md` for Blowfish to render the section listing correctly.

### I2. CLAUDE.md says PSR posts live at `content/posts/psr-*.md` -- this is wrong

The CLAUDE.md says "Posts live in `content/posts/psr-*.md`" but they actually live in `content/posts/psr/<slug>/index.md` (page bundles). This is not a spec issue per se, but after migration the CLAUDE.md must be updated to reflect both the new theme and correct paths. The spec should include a "Update project documentation" step.

### I3. Custom CSS is extensive (~400 lines) and migration is hand-waved

`assets/css/extended/custom.css` contains substantial customizations: CSS variables for accent colors, gradient effects, noise texture overlay, custom scrollbar, header scroll animations, post entry hover effects, blockquote styling, search box styling, breadcrumb transitions, and list layout fixes. The spec says "Evaluate; migrate needed styles to Blowfish custom CSS" -- this needs to be a dedicated subtask with an inventory of which styles map to Blowfish features and which need to be carried forward. At minimum, the accent color scheme (`--accent-1`, `--accent-2`, `--accent-glow`) and the noise texture are brand-differentiating and should be explicitly preserved.

### I4. `archives.html` layout not mentioned in migration table

The spec's layout migration table lists `archived-list.html` but there is also a separate `layouts/_default/archives.html` file. Both need migration or removal.

### I5. The `robots.txt` layout override is not mentioned

`layouts/robots.txt` exists as a custom layout. The spec does not address whether this should be kept, migrated, or removed.

### I6. Images in `assets/images/` need migration plan

There are ~17 images in `assets/images/` plus ~8 in `static/images/`. The spec addresses feature images for page bundles but does not mention migrating these existing shared images. Some may be orphaned (the blog itself has a post about finding 12 orphaned images), but any still-referenced images need to be preserved.

### I7. Section permalink collision risk

The permalink config has `[permalinks.section] posts = "/:slug/"`. With Blowfish, verify that section `_index.md` pages do not generate URLs that collide with post slugs. For example, if `content/posts/ai/_index.md` has no slug, Hugo may generate `/ai/` which could conflict.

### I8. The `new-post` task in Taskfile creates flat files, not page bundles

The Taskfile's `new-post` task runs `hugo new posts/{{.CLI_ARGS}}.md` which creates a flat markdown file, not a page bundle (`posts/<slug>/index.md`). This contradicts the page bundle convention. The spec should include updating the Taskfile to match the page bundle structure. This is a pre-existing issue but the migration is a good time to fix it.

---

## Suggestions (Nice to Have)

### S1. Add a smoke test step after Phase 1

Beyond "verify all pages render," consider adding a concrete automated check: run `hugo --gc --minify` and compare the list of output files against the current build. A simple `find public -name '*.html' | sort > urls.txt` before and after, then `diff`, would catch missing pages.

### S2. Consider keeping `baseURL` with trailing slash consistency

The current config uses `baseURL = 'https://jonesrussell.github.io/blog/'` (with trailing slash). Blowfish documentation examples sometimes omit it. Be explicit about preserving this in the new `config/_default/hugo.toml`.

### S3. Specify Blowfish version to pin

The spec says "Hugo Modules pin to version" in risk mitigation, but does not specify which Blowfish version to use. Pin to a specific release tag (e.g., `github.com/nunocorrea/blowfish/v2 v2.x.x`) rather than using `@latest`.

### S4. Add a "Feature image" generation strategy

The spec describes a "branded graphics" approach for feature images but does not specify tooling. Consider mentioning a tool (e.g., `og-image` generator, Figma template, ImageMagick script) to make this actionable.

### S5. Phase 3 content triage should reference existing `content-todo.md`

The spec says to output "Updated `docs/content-todo.md`" but does not mention that this file already exists with 6 posts flagged for review. The triage should build on existing work, not start from scratch.

### S6. The `series` taxonomy handling needs attention

Blowfish handles series differently than PaperMod. The current site has `content/series/` with `_index.md` files for each series. Verify that Blowfish's series support is compatible or document the mapping.

### S7. RSS `baseName` customization

The current config has `[outputFormats.RSS] baseName = "feed"` which means the RSS feed is at `/feed.xml` instead of the default `/index.xml`. Ensure this is preserved in the new config.

---

## Phasing Assessment

The three-phase approach is sound:
- **Phase 1 (Theme Foundation)** is correctly scoped as the riskiest phase and the one that must be fully complete before proceeding.
- **Phase 2 (Hugo Features)** is appropriately additive and low-risk.
- **Phase 3 (Content Polish)** is independent of the theme and could theoretically start in parallel for non-visual tasks (triage, frontmatter normalization).

One ordering concern: **Phase 2.1 (cascade frontmatter) should happen before Phase 3.2 (frontmatter normalization)**. The spec already implies this sequence, but making it explicit would prevent wasted effort normalizing frontmatter that cascade will later make redundant.

---

## Summary

| Category | Count |
|----------|-------|
| Critical | 6 |
| Important | 8 |
| Suggestions | 7 |

The spec provides a solid foundation for the migration. The critical issues are mostly about things that exist today but are invisible in the spec: Google Analytics, Google Fonts, extensive custom CSS, the already-implemented JSON-LD, and the half-configured Giscus. Addressing these before starting implementation will prevent surprises mid-migration.
