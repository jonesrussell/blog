# Plan Review: Blog Modernization Phase 1-2

**Reviewer:** Claude Code (Senior Code Review)
**Date:** 2026-03-19
**Plan:** `docs/superpowers/plans/2026-03-19-blog-modernization-phase1-2.md`
**Spec:** `docs/superpowers/specs/2026-03-19-blog-modernization-design.md`

## Overall Assessment

The plan is well-structured with 29 tasks, proper ordering, and granular steps. It covers the vast majority of the spec and demonstrates strong awareness of migration risks. Below are specific findings organized by review category.

---

## 1. Spec Coverage Gaps

### Critical -- Must address before implementation

**C1. Spec 1.14 (Series Taxonomy) has no plan task.**
The spec explicitly calls out verifying Blowfish's series support is compatible with the existing `content/series/` directory and `series` taxonomy. The plan has zero tasks addressing this. The site has a complex `layouts/series/list.json` template that builds grouped, ordered series data with `series_group`, `series_order`, and `companion_files` params. If Blowfish handles series differently, this JSON endpoint breaks silently.

**Action:** Add a dedicated task (after Task 8, before Task 13) to:
1. Verify Blowfish renders `/series/` taxonomy pages
2. Test `layouts/series/list.json` still works with Blowfish's base templates
3. Verify `content/series/` `_index.md` files render correctly

**C2. Spec 2.2 (Hugo Image Processing) has no plan task.**
The spec describes leveraging Blowfish's auto-processing of `feature*` images in page bundles (resize, thumbnails, social cards). No Phase 2 task covers verifying or configuring this. This is distinct from the OG tag check in Task 22 -- it is about the image pipeline itself.

**Action:** Add a task to verify Blowfish's `feature.jpg`/`feature.png` processing works, and document the naming convention for the implementing agent.

**C3. Spec 2.6 (Search Enhancement) has no plan task.**
The spec mentions keeping Fuse.js and benefiting from Blowfish's modal search UI with keyboard navigation. While params.toml in Task 5 enables search, there is no verification task to confirm the JSON search index generates and the modal works. The current `hugo.toml` outputs JSON on `home` and `taxonomy` -- Task 4 preserves this, but no task verifies end-to-end search functionality.

**Action:** Add a search verification step to Task 20 or Task 29 (smoke tests).

### Important -- Should address

**I1. Spec 1.10 (Custom CSS) mentions `.terms-heading` styles in extend_head.html -- plan misses this.**
The `extend_head.html` contains inline `<style>` with `.terms-heading` styles used by the topics layout. Task 9 (custom/head.html) migrates these partially but the `.terms-heading` style is only relevant if the topics layout uses it. Task 15 evaluates the topics layout but does not cross-reference the CSS dependency.

**Action:** Add a note to Task 15 to check whether `.terms-heading` styles from `extend_head.html` need to migrate alongside the topics layout.

**I2. Spec mentions `noClasses = false` in markup but current config does NOT have this.**
The current `hugo.toml` markup config does not set `noClasses`. Task 7 adds `noClasses = false`, which changes behavior from Hugo's default (`true`). This means syntax highlighting will switch from inline styles to CSS classes, which requires Blowfish to provide the highlight CSS. If Blowfish does not ship the `monokai` class-based stylesheet, code blocks will lose all color.

**Action:** Add a verification step to Task 7 or Task 26 confirming that Blowfish provides syntax highlight CSS when `noClasses = false`. If not, set it to `true` or ensure the chroma CSS is generated and included.

**I3. `extend_head.html` loads `shortcodes.css` via stylesheet link -- plan removes shortcodes.css in Task 11 but does not address the link tag.**
The current `extend_head.html` has `<link rel="stylesheet" href="{{ "css/shortcodes.css" | absURL }}">`. Task 12 removes the shortcode files and Task 17 removes `extend_head.html`. However, between Task 11 (which removes `static/css/shortcodes.css`) and Task 17 (which removes `extend_head.html`), the build will have a broken CSS link. This causes a 404 in dev server.

**Action:** Either move the `extend_head.html` removal earlier (to Task 11/12 timeframe) or note this as an expected transient issue. Better: Task 9 creates `custom/head.html` as the replacement, so `extend_head.html` should be removed in Task 9 or immediately after, not deferred to Task 17.

---

## 2. Task Completeness Issues

### Critical

**C4. Task 9 custom/head.html references `.Site.Params.author.name` but current config uses `.Site.Params.author` (a string, not an object).**
The current `hugo.toml` has `author = 'Russell'` (a plain string under `[params]`). The plan's JSON-LD template uses `.Site.Params.author.name | default .Site.Params.author` which is a reasonable fallback, but the `languages.en.toml` (Task 6) introduces `[params.author] name = "Russell"` as a nested object. The JSON-LD will work only AFTER Task 6 runs before Task 9. The current ordering is correct (Task 6 before Task 9), but this dependency is not documented.

**Action:** Add a note to Task 9 that it depends on the author config structure from Task 6.

**C5. Task 17 removes `layouts/_default/single.html` and `list.html` but does not verify `content_status_notice` is still rendered.**
The current `single.html` calls `{{ partial "content_status_notice.html" . }}`. After removing `single.html`, Blowfish's default single template takes over, and it will NOT call `content_status_notice`. Task 17 Step 1 says "migrate content_status_notice" but provides no concrete approach.

**Action:** Provide a specific migration strategy. Options:
- Override Blowfish's `single.html` to add the partial call (defeats purpose of removing it)
- Convert `content_status_notice` to a shortcode and add it to archived posts' content
- Use Blowfish's `custom/article.html` or hook partial if one exists
- Inject via `custom/head.html` using CSS + JS (fragile)

**C6. Task 14 (archived-list) is vague -- no concrete template code provided.**
The archived list is a critical custom feature. Task 14 says "Recreate using Blowfish conventions" but provides zero template code. The current `archived-list.html` extends PaperMod's `baseof.html` and uses PaperMod-specific classes. The implementing agent needs to know what Blowfish base template to extend and what CSS classes to use.

**Action:** Add concrete guidance: the `content/archived/_index.md` should set `layout: "archived-list"` and the new layout should extend `baseof.html` from Blowfish (typically `{{ define "main" }}`).

### Important

**I4. Task 4 does not address `theme_color` and `msapplication_TileColor` from current config.**
The current `hugo.toml` has `theme_color = '#0a0a0f'` and `msapplication_TileColor = '#0a0a0f'` under `[params.assets]`. Task 5's params.toml only maps `favicon` but drops these two. They affect browser chrome color on mobile.

**Action:** Add `theme_color` and `msapplication_TileColor` to params.toml, or confirm Blowfish handles them differently.

**I5. Task 5 params.toml has `[analytics.google] siteTag` but Blowfish uses a different param path.**
Blowfish v2 uses `[analytics] provider = "google"` with `[analytics.google] id = "G-..."`. The param name might be `id` not `siteTag`. The plan acknowledges "verify exact param names" but this specific difference could cause analytics to silently not load.

**Action:** Pin down the exact Blowfish analytics config before implementation, or add a verification step (check for gtag.js in rendered HTML).

**I6. Task 6 `languages.en.toml` social links format may be wrong.**
Blowfish uses a specific format for author links. The plan shows `links = [{ github = "..." }]` but Blowfish v2 actually expects the format to be more like individual params or a different TOML structure. Incorrect format means social icons silently disappear.

**Action:** Reference Blowfish's example `languages.en.toml` from their documentation or repo during implementation.

**I7. Task 27 new-post Taskfile uses `{{.CATEGORY}}` variable but Taskfile does not support env vars as task vars this way.**
The proposed Taskfile syntax `CATEGORY: '{{default "general" .CATEGORY}}'` with usage `CATEGORY=ai task new-post -- slug` will not work. Taskfile vars are not populated from environment variables by default. The correct approach is to use `{{.CATEGORY | default "general"}}` with explicit `vars` mapping or use Taskfile's `env` support.

**Action:** Fix to use Taskfile-compatible variable passing, e.g., `task new-post CATEGORY=ai -- slug` or use a different mechanism.

---

## 3. Ordering and Dependency Issues

### Critical

**C7. Task 8 (remove hugo.toml + first build test) should happen AFTER Task 9-11, not before.**
The plan removes `hugo.toml` at Task 8, then creates Google Fonts (Task 9), color scheme (Task 10), and custom CSS (Task 11). But between Task 8 and Task 9, the site builds WITHOUT Google Fonts, custom CSS, or the custom color scheme. While the plan acknowledges "warnings expected," the build at Task 8 will produce a site with completely broken styling. More importantly, `extend_head.html` still exists at Task 8 and references PaperMod's `baseof.html` via `extend_head` convention. Blowfish uses `custom/head.html` instead.

The consequence: from Task 8 through Task 16, the PaperMod-specific partial `extend_head.html` is still in `layouts/partials/` but Blowfish does not call it. Google Analytics, Google Fonts, JSON-LD, and CSS are all silently dropped during this window.

**Action:** Restructure so Tasks 9-11 happen BEFORE Task 8 (creating the replacements before removing the old config), or combine Tasks 8-11 into a single atomic task. The ideal order:
1. Create all `config/_default/` files (Tasks 4-7) -- these coexist with `hugo.toml`
2. Create replacement partials and CSS (Tasks 9-11)
3. Remove old files as an atomic step (Tasks 8 + 12 + 17 combined)

**C8. Task 11 removes `assets/css/extended/custom.css` but extend_head.html is not removed until Task 17.**
This is related to C7. Between Task 11 and Task 17, PaperMod's head partial (if somehow invoked) would reference files that no longer exist.

### Important

**I8. Task 17 removes 6 layout files in one step with no intermediate build verification.**
Removing `single.html`, `list.html`, `extend_head.html`, `extend_footer.html`, `post_nav_links.html`, and `related-posts.html` simultaneously makes it hard to diagnose which removal caused a regression. At minimum, build after removing each pair.

**Action:** Split Task 17 into sub-steps with build verification after each removal, or at least after removing `single.html` (most impactful) separately from the others.

---

## 4. Feasibility Issues

### Important

**I9. `hugo mod get github.com/nunocoracao/blowfish/v2` (Task 3 Step 2) without a version tag will get the latest.**
The spec says "pinned to a specific release tag (e.g., `v2.100.0`)" but Task 3 does not pin. The `module.toml` also does not pin a version. This contradicts the spec and risks pulling a broken or incompatible version.

**Action:** Pin the version: `hugo mod get github.com/nunocoracao/blowfish/v2@v2.x.x` and add the version to `module.toml` import path.

**I10. Blowfish's `custom/head.html` and `custom/footer.html` path convention.**
The plan creates `layouts/partials/custom/head.html`. Blowfish expects these at exactly this path, but some Blowfish versions look for `layouts/partials/extend-head.html` instead. This must be verified against the specific Blowfish version being installed.

**Action:** After module install (Task 3), verify the hook partial names by checking Blowfish's `baseof.html` for the partial call.

**I11. Task 19 uses `peaceiris/actions-hugo@v3` but this action may not exist yet.**
The current workflow uses `peaceiris/actions-hugo@v3`. If this is already in use and working, fine. But if Blowfish requires a newer Hugo version than `peaceiris/actions-hugo@v3` supports, the CI will fail. An alternative is `gohugoio/hugo-action`.

**Action:** Verify `peaceiris/actions-hugo@v3` supports the required Hugo version (0.141.0+).

**I12. The `content/archived/_index.md` already exists but the plan does not mention it.**
The codebase has `content/archived/_index.md`. Task 14 discusses the archived layout but does not reference or check this existing file. The layout attribute in this `_index.md` determines which template renders `/archived/`.

**Action:** Read and document the current `content/archived/_index.md` frontmatter in Task 14 to ensure the layout reference matches the new template name.

---

## 5. Risk Issues

### Critical

**C9. No rollback procedure documented per task.**
The spec mentions "Git branch per phase; can revert to PaperMod at any point during Phase 1" but the plan has no specific rollback commands. If the build breaks at Task 8 (hugo.toml removal) and the agent cannot fix it, what is the recovery? `git checkout main -- hugo.toml` would restore the old config but conflict with the new `config/_default/` files.

**Action:** Add a rollback section to the plan: "If the build breaks at any point, run `git stash && git checkout main` to return to the working PaperMod site."

**C10. RSS `content:encoded` and archived exclusion -- Task 13 is too vague on the fallback.**
The custom RSS template has significant custom logic (archived exclusion, `content:encoded`, custom XML namespace `xmlns:blog`). Task 13 Step 3 says "keep custom template" but Blowfish's base template structure is different from PaperMod's. The custom RSS may need to extend Blowfish's RSS template base, not PaperMod's.

**Action:** The RSS template should be treated as "keep and verify" rather than "evaluate and maybe remove." It is almost certain Blowfish's default RSS will NOT have the archived exclusion filter. Plan should default to keeping the custom template and verifying it works with Blowfish's base.

### Important

**I13. No CI validation before merge.**
Task 29 Step 6 pushes the branch and says "Verify GitHub Actions workflow runs successfully" but does not describe what to do if CI fails. There should be a step to open a draft PR and verify the CI build passes before considering the migration complete.

**Action:** Add: create a draft PR, verify CI passes, then mark as ready for review.

---

## 6. What the Plan Does Well

- Baseline URL capture (Task 1) and comparison (Task 20, 29) is excellent risk mitigation
- Granular commits per task allow precise bisection if regressions appear
- CSS inventory approach (Task 11) with keep/adapt/remove classification is thorough
- Correct identification that Giscus IDs are empty and comments are non-functional
- Smart ordering of cascade frontmatter (Task 21) before Phase 3 content normalization
- Proper handling of shortcode deletion with usage verification first (Task 12)

---

## Summary of Required Changes

| ID | Severity | Summary |
|---|---|---|
| C1 | Critical | Add task for Series taxonomy verification (spec 1.14) |
| C2 | Critical | Add task for Hugo image processing verification (spec 2.2) |
| C3 | Critical | Add search verification step (spec 2.6) |
| C4 | Critical | Document Task 9 dependency on Task 6 author config |
| C5 | Critical | Provide concrete content_status_notice migration strategy |
| C6 | Critical | Add concrete template code for archived-list layout |
| C7 | Critical | Reorder Tasks 8-11 so replacements are created before old files removed |
| C8 | Critical | Fix ordering of CSS removal vs head partial removal |
| C9 | Critical | Add rollback procedures |
| C10 | Critical | Default to keeping custom RSS template |
| I1 | Important | Cross-reference .terms-heading CSS with topics layout |
| I2 | Important | Verify noClasses=false works with Blowfish highlight CSS |
| I3 | Important | Fix shortcodes.css link tag removal timing |
| I4 | Important | Preserve theme_color and msapplication_TileColor |
| I5 | Important | Verify Blowfish analytics param names |
| I6 | Important | Verify Blowfish social links format |
| I7 | Important | Fix Taskfile variable syntax |
| I8 | Important | Split Task 17 layout removals with intermediate builds |
| I9 | Important | Pin Blowfish version in module import |
| I10 | Important | Verify Blowfish hook partial names after install |
| I11 | Important | Verify peaceiris/actions-hugo@v3 supports required Hugo version |
| I12 | Important | Check existing content/archived/_index.md |
| I13 | Important | Add draft PR + CI verification step |
