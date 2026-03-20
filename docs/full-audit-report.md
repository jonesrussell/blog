# Full Blog Audit Report — 2026-03-19

**68 posts audited | ~290 total findings**

---

## Executive Summary

| Category | Posts | Passed | Findings |
|----------|-------|--------|----------|
| AI | 23 | 7 | 39 |
| PSR | 15 | 0 | 83 |
| Docker | 7 | 0 | 23 |
| DevOps | 7 | 0 | 44 |
| General | 9 | 1 | ~30 |
| Go | 5 | 0 | ~25 |
| Laravel | 5 | 0 | ~10 |
| Cursor | 3 | 0 | ~6 |
| **Total** | **68** | **8** | **~290** |

## Top Issues by Frequency

| # | Issue | Posts Affected | Severity |
|---|-------|---------------|----------|
| 1 | **Missing social media companion file** (`docs/social/{slug}.md`) | ~51 posts | MISSING |
| 2 | **First-person voice** ("I"/"we"/"my" instead of "you"/"your") | ~20 posts | INCORRECT |
| 3 | **Missing `draft` field** in frontmatter | ~21 posts | MISSING |
| 4 | **Emoji after "Baamaapii"** (wave emoji appended) | ~10 posts | INCORRECT |
| 5 | **Time estimates in headings** (e.g., "(5 minutes)") | ~12 posts | INCORRECT |
| 6 | **Missing code block explanations** (no follow-up sentence) | ~10 posts | MISSING |
| 7 | **"Wrapping Up" or "Conclusion" heading** | ~7 posts | INCORRECT |
| 8 | **"Ahnii!" formatting wrong** (comma, missing, or inline) | ~8 posts | INCORRECT |
| 9 | **Missing "Baamaapii" closing** | ~5 posts | MISSING |
| 10 | **First mentions of tools/products not linked** | ~12 posts | INCORRECT |

---

## Posts That PASSED All Checks (8)

1. `ai/codified-context-specialist-skills`
2. `ai/waaseyaa-api-layer`
3. `ai/waaseyaa-i18n`
4. `ai/waaseyaa-testing`
5. `ai/waaseyaa-deployment`
6. `ai/waaseyaa-ai-packages`
7. `ai/waaseyaa-packagist`
8. `general/wiring-spec-drift-detection-into-your-monorepo`

---

## Category: AI (23 posts)

### Critical Issues
- **laravel-to-waaseyaa-one-session**: Missing "Ahnii!", missing "Baamaapii", 6 tags (max 4), first-person voice throughout, no scoped intro
- **Waaseyaa series ordering conflicts**: `series_order: 2` claimed by both `co-development-skill-set` and `waaseyaa-entity-system`; `series_order: 3` claimed by both `claudriel-temporal-layer` and `waaseyaa-access-control`
- **2 page bundle violations**: `claude-code-skill-gen-plugin.md` and `git-hooks-ai-agents.md` are flat files, not `slug/index.md` bundles
- **Voice violations**: `claudia-ai-chief-of-staff`, `minoo-community-platform`, `laravel-to-waaseyaa-one-session` use first-person extensively
- **Duplicate sentence** in `flag-untriaged-issues-claude-code-hooks` at lines 49-50

### Missing Social Files (10)
flag-untriaged-issues-claude-code-hooks, codified-context-specialist-skills, waaseyaa-entity-system, waaseyaa-api-layer, waaseyaa-dbal-migration, waaseyaa-i18n, waaseyaa-testing, waaseyaa-deployment, waaseyaa-ai-packages, laravel-to-waaseyaa-one-session

---

## Category: PSR Series (15 posts)

### Critical Issues
- **All 15 posts** missing social media companion files
- **11 posts** missing `draft` field
- **Older posts (PSR-1, PSR-3, PSR-4)** have time estimates in headings, first-person voice, and missing "Try It Yourself" sections
- **PSR-12** incorrectly describes PSR-13 as "HTTP message interfaces" (should be "hypermedia links")
- **6 posts** have prerequisites blockquote placed after intro instead of immediately after "Ahnii!"
- **PSR-14, PSR-15** use `--` (double hyphens) instead of em dashes

### Priority Fixes
1. Add social media companion files for all 15 posts
2. Remove time estimates from headings (PSR-1, PSR-3, PSR-4, PSR-6, PSR-13)
3. Fix first-person voice (PSR-1, PSR-3, PSR-4, index post)

---

## Category: Docker (7 posts)

### Critical Issues
- **whalebrew** (8 findings): missing `draft`, "Ahnii," (comma), emoji on "Baamaapii", 3 time estimates in headings, "Wrapping Up" heading, unlinked first mentions
- **docker-for-legacy-drupal-development** (10 findings): missing `draft`, "Ahnii," (comma), emoji on "Baamaapii", 3 time estimates in headings, "Wrapping Up" heading, first-person voice, unlinked Drupal, missing code language tag
- **5 series posts** (advanced-patterns, build-performance, security-users, dockerfile-fundamentals, multi-stage-builds) are in excellent shape — only missing social files

### Missing Social Files: All 7

---

## Category: DevOps (7 posts)

### Critical Issues
- **python-virtual-environments-for-beginners** (11 findings): missing `draft`, no "Ahnii!", no "Baamaapii", "Wrapping Up" heading, multi-sentence summary, first mentions not linked
- **setting-up-devcontainer-in-vscode** (10 findings): "Ahnii," (comma), "Wrapping Up", emoji on closing, 2 time estimates, first-person voice, unlinked tools
- **suspend-and-resume-processes-in-linux** (9 findings): no "Ahnii!", no "Baamaapii", missing `draft`, `sh` language tags (should be `bash`)
- **cors-fix-cross-origin-issues** (8 findings): missing `draft`, tags not lowercase, emoji on closing, H3 used for main sections
- **harden-linux-vps-caddy-docker**: PASS (only missing social file, is a draft)
- **ansible-manage-digitalocean-laravel-infrastructure** (3 findings): first-person voice in summary and body

### Missing Social Files: 6 of 7 (ansible has one)

---

## Category: General (9 posts)

### Critical Issues
- **imposter-syndrome**: First-person voice, "Wrapping Up" heading, emoji on closing, missing `draft`
- **scaffold-and-deploy-a-jekyll-github-pages-blog-in-5-minutes**: Time estimate in title/slug, no "Ahnii!", no "Baamaapii", first-person voice
- **quickly-view-project-dependencies-on-the-cli**: No "Ahnii!", no "Baamaapii", missing `draft`
- **quickly-view-nodejs-project-scripts-on-the-cli**: No "Ahnii!", no "Baamaapii", missing `draft`
- **wiring-spec-drift-detection-into-your-monorepo**: PASS

### Missing Social Files: 6 of 9

---

## Category: Go (5 posts)

### Critical Issues
- **a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection**: First-person voice, "Wrapping Up", emoji on closing, missing `draft`
- **debugging-bubbletea-commands**: First-person voice, "Conclusion" heading
- **understanding-go-interfaces**: First-person voice, emoji on closing
- **golangci-lint**: Near-pass, minor issues only
- **understanding-struct-field-alignment-in-go**: Near-pass, minor issues only

### Missing Social Files: All 5

---

## Category: Laravel (5 posts)

### Critical Issues
- **start-developing-with-laravel-in-ubuntu-20.04**: Oldest post, first-person voice, missing `draft`
- **use-ddev-to-locally-develop-with-drupal**: First-person voice, time estimates
- **laravel-boost-ddev**: REFERENCE POST — near-pass (only missing social file)

### Missing Social Files: All 5

---

## Category: Cursor (3 posts)

### Critical Issues
- **cursor-ai-tools**: First-person voice, emoji on closing
- **drift-in-cursor-ai-rules**: Minor issues
- **cursor-pin-agent-chats**: Near-pass (only missing social file)

### Missing Social Files: All 3

---

## Recommended Fix Priority

### P0 — Structural / Data Issues
1. Fix Waaseyaa `series_order` conflicts (2 duplicates)
2. Move 2 flat AI post files to page bundles (`slug/index.md`)
3. Fix `laravel-to-waaseyaa-one-session` (missing greeting/closing, too many tags, wrong voice)

### P1 — Consistency Across Published Posts
4. Add `draft: false` to ~21 posts missing the field
5. Remove emoji from "Baamaapii" in ~10 posts
6. Fix "Ahnii!" punctuation (comma → exclamation) in ~8 posts
7. Remove "Wrapping Up"/"Conclusion" headings in ~7 posts
8. Remove time estimates from headings in ~12 posts

### P2 — Content Quality
9. Rewrite first-person voice to second person in ~20 posts
10. Add missing code block follow-up explanations in ~10 posts
11. Link first mentions of tools/products in ~12 posts
12. Fix PSR-12's incorrect description of PSR-13

### P3 — Social Media
13. Create `docs/social/{slug}.md` for ~51 posts missing them
