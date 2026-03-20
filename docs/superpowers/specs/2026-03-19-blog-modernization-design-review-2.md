# Design Review Pass 2: Blog Modernization Spec

**Reviewer:** Senior Code Reviewer (Claude)
**Date:** 2026-03-19
**Spec:** `docs/superpowers/specs/2026-03-19-blog-modernization-design.md`
**Previous Review:** `docs/superpowers/specs/2026-03-19-blog-modernization-design-review.md`

---

## Review Summary

The first review identified 6 critical, 8 important, and 7 suggestion issues. This pass verifies each has been addressed in the updated spec.

---

## Critical Issues

### C1. JSON-LD already exists -- should be "migrate" not "add"
**Status: FIXED**

Section 1.9 now explicitly states: "This is **not new** -- it needs to be **migrated**, not added." It correctly instructs checking whether Blowfish has built-in JSON-LD to avoid duplicates. Phase 2.3 is now positioned as an enhancement step for the migrated JSON-LD, not an initial addition.

### C2. Google Analytics (gtag.js G-LM50CCHND9) migration
**Status: FIXED**

New section 1.3 ("Google Analytics Migration") addresses this with the exact config snippet (`[analytics.google] siteTag = "G-LM50CCHND9"`) and instructions to remove the manual gtag.js snippet. Risk mitigation also references this: "Analytics gap: GA migrated to Blowfish config (1.3) in same deploy as theme swap."

### C3. Google Fonts (Bricolage Grotesque, Instrument Sans, JetBrains Mono) migration
**Status: FIXED**

New section 1.4 ("Typography Migration") lists all three fonts, states they are "brand-differentiating and must be preserved," and provides CSS variable overrides for Blowfish's font stack. Risk mitigation includes: "Typography regression: Google Fonts migrated early (1.4) to prevent visual breakage."

### C4. Giscus comments half-configured (empty repo-id/category-id)
**Status: FIXED**

New section 1.8 ("Comments (Giscus)") explicitly acknowledges the empty IDs, states comments are "currently non-functional," and prescribes obtaining actual IDs from giscus.app during migration.

### C5. Custom shortcodes are unused -- should note and simplify
**Status: FIXED**

Section 1.7 now explicitly states: "Zero posts currently use any of the custom shortcodes... All three are unused." The action is to delete them and their supporting CSS/JS. No content migration needed. Clear and correct.

### C6. RSS archived-post exclusion must be preserved
**Status: FIXED**

The layout migration table (1.6) for `rss.xml` now explicitly says: "Preserve archived-post exclusion (`where $pages "Params.archived" "!=" true`) and `content:encoded` full-text." No longer vague.

---

## Important Issues

### I1. No _index.md files under content/posts/
**Status: FIXED**

Section 2.1 now lists `content/posts/` (root) explicitly in the sections needing `_index.md`, with the comment "(root -- required for Blowfish section listing)." All 8 subdirectory sections are also listed.

### I2. CLAUDE.md has wrong PSR paths
**Status: FIXED**

Section 2.8 ("Update Project Documentation") explicitly includes: "Correct PSR post paths (`content/posts/psr/<slug>/index.md`, not `content/posts/psr-*.md`)."

### I3. Custom CSS ~400 lines needs inventory
**Status: FIXED**

New section 1.10 ("Custom CSS Migration") provides a detailed inventory table with 9 categories, each with specific actions (Preserve, Evaluate, Migrate, Remove). Includes a subtask: "Create an explicit inventory mapping each CSS block to: keep, adapt, or remove." Risk mitigation also references this: "CSS regression: Explicit inventory of custom CSS (1.10) before removing anything."

### I4. archives.html missing from migration table
**Status: FIXED**

The layout migration table (1.6) now includes `layouts/_default/archives.html` with action: "Evaluate if still needed alongside archived-list; migrate or remove."

### I5. robots.txt override not mentioned
**Status: FIXED**

The layout migration table (1.6) now includes `layouts/robots.txt` with action: "Evaluate customizations; migrate or remove."

### I6. Images in assets/images/ and static/images/ need migration plan
**Status: FIXED**

New section 1.12 ("Shared Image Assets") acknowledges both directories, prescribes an audit of referenced vs. orphaned images, and states that referenced images should be preserved in their current locations.

### I7. Section permalink collision risk
**Status: FIXED**

Section 1.13 ("Permalink Preservation") now includes a risk callout: "Verify that section `_index.md` pages... do not generate URLs that collide with post slugs." Provides the concrete example (`/ai/` collision). Also referenced in Risk Mitigation: "Section URL collisions: Verify no post slug matches a section name (1.13)."

### I8. Taskfile new-post creates flat files not page bundles
**Status: FIXED**

New section 2.7 ("Update Taskfile") explicitly shows the broken current command and the fix to create page bundles. Also reflected in the Modified Files list and in section 2.8.

---

## Suggestions

### S1. Smoke test step
**Status: FIXED**

New section 1.16 ("Smoke Test") provides the exact `find`/`diff` commands from the suggestion. States: "Any missing pages are a blocker."

### S2. baseURL trailing slash
**Status: FIXED**

The Constraints section now explicitly states: "`baseURL` must retain trailing slash: `https://jonesrussell.github.io/blog/`". Section 1.2 config migration table reiterates "(with trailing slash)." Also reflected in the Files Created list.

### S3. Pin Blowfish version
**Status: FIXED**

Section 1.1 now specifies: "pinned to a specific release tag (e.g., `github.com/nunocoracao/blowfish/v2 v2.100.0`)." The example uses a concrete version number. Also mentioned in section 1.2 config migration table.

### S4. Feature image generation strategy
**Status: PARTIALLY FIXED**

Section 3.3 mentions "Tool TBD (ImageMagick script, Figma template, or similar)" which is better than nothing, but the tool is still not specified. This is acceptable for a design spec -- the tooling decision can be deferred to implementation.

### S5. Reference existing content-todo.md
**Status: FIXED**

Section 3.1 now states: "Build on the 6 posts already flagged in the existing file, not from scratch."

### S6. Series taxonomy handling
**Status: FIXED**

New section 1.14 ("Series Taxonomy") addresses compatibility verification between the current `content/series/` structure and Blowfish's series support.

### S7. RSS baseName preservation
**Status: FIXED**

Section 1.2 now explicitly states: "Preserve RSS `baseName = "feed"` so the feed URL stays at `/feed.xml`."

---

## New Issues Introduced

### N1. Blowfish module path typo (Minor)

Section 1.1 uses `github.com/nunocoracao/blowfish/v2` but the actual Blowfish repository is at `github.com/nunocorrea/blowfish`. Verify the correct GitHub username (nunocorrea vs nunocoracao) before implementation. Using the wrong path will cause `hugo mod get` to fail.

### N2. Phase ordering dependency could be more explicit

Section 2.1 states "This step must complete before Phase 3.2" which is good. However, the Phase 2/Phase 3 boundary suggests these are sequential, yet section 3.1 (Triage) could start during Phase 2. The first review's phasing assessment noted Phase 3 triage could run in parallel -- the spec still does not explicitly call out which Phase 3 substeps can overlap with Phase 2.

### N3. No mention of Blowfish's `custom/footer.html` partial

Section 1.6 addresses `extend_footer.html` and says to evaluate if Blowfish handles header scroll natively. However, if the scroll detection JS is needed, the spec does not specify where it would go. Blowfish uses `custom/footer.html` (not `extend_footer.html`) for custom footer scripts. This should be noted.

---

## Verdict

| Category | First Review | Second Review | Resolution Rate |
|----------|-------------|---------------|-----------------|
| Critical (6) | 6 open | 0 open | 100% |
| Important (8) | 8 open | 0 open | 100% |
| Suggestions (7) | 7 open | 0 open (1 partial) | 100% |
| New Issues | -- | 3 (all minor) | -- |

**All 21 issues from the first review have been addressed.** The 6 critical issues are fully resolved. The 8 important issues are fully resolved. All 7 suggestions are addressed (S4 is partially fixed but acceptably so for a design spec).

The 3 new issues are minor and none are blockers. N1 (module path) should be verified before implementation. N2 and N3 are informational.

**The spec is ready for implementation.**
