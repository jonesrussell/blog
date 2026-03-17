# Content Audit — 2026-03-14

## Summary

| Metric | Count |
|---|---|
| Local published posts | 41 |
| Local drafts | 11 |
| Local archived | 8 |
| Dev.to published | 88 |
| Dev.to unpublished drafts | 12 |
| Published locally but NOT on dev.to | 8 |
| On dev.to but NO local match | ~50 (older Drupal/React/misc posts) |

## Dev.to Top Performers (by views)

| Title | Views | Reactions | Comments | Local? |
|---|---|---|---|---|
| Add a Google Font to Tailwind CSS | 2385 | 5 | 2 | no |
| RTK Query Data Fetching | 1637 | 4 | 0 | no |
| Drupal 10: Enable Theme Suggestions | 607 | 0 | 0 | no |
| Drupal 10 Poll Module | 557 | 3 | 0 | no |
| PSR-1: Basic Coding Standard in PHP | 552 | 1 | 0 | yes |
| Generate Drupal 10 sub theme | 477 | 1 | 0 | no |
| Install Drupal 10 & Tailwind CSS | 436 | 0 | 0 | no |
| Start Developing with Laravel in Ubuntu 20.04 | 357 | 6 | 0 | yes (archived) |
| Install DDEV | 328 | 6 | 0 | no |
| Install Drupal 10 in 5 Minutes | 327 | 1 | 0 | no |
| Install Software with Homebrew | 252 | 1 | 0 | no |
| Using Laravel Boost With DDEV | 237 | 1 | 0 | yes |
| ChatGPT created ReactJS Components | 226 | 3 | 0 | no |
| coaudit: AI-Powered Code Audits with GitHub Copilot CLI | 202 | 7 | 0 | yes |
| AJAX Views in Drupal 10 | 186 | 1 | 0 | no |

## Issues Found

### 1. Dev.to unpublished drafts (12) — were these meant to be published?

These exist on dev.to as drafts but were never published:

| Dev.to Title | Canonical URL match |
|---|---|
| Start developing with Laravel on Ubuntu 24.04 LTS | start-developing-with-laravel-in-ubuntu-24-04 |
| How We Got DDEV, Laravel, and a Go API Talking | ddev-laravel-go-sidecar |
| About | about page |
| Testing Cobra CLI Apps in Go: A DI Approach | a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection |
| Start Developing With Laravel in Ubuntu 20.04 | start-developing-with-laravel-in-ubuntu-20.04 (archived locally) |
| Use DDEV to locally develop with Drupal | use-ddev-to-locally-develop-with-drupal (archived locally) |
| Quickly View Project Dependencies on the CLI | quickly-view-project-dependencies-on-the-cli |
| Quickly View NodeJS Project Scripts on the CLI | quickly-view-nodejs-project-scripts-on-the-cli (archived locally) |
| Whalebrew | whalebrew (archived locally) |
| Imposter Syndrome | imposter-syndrome (archived locally) |
| My Up-Arrow key is fried | no local match |
| Unpublished Video ~ 246c | no local match |

### 2. Published locally but NOT on dev.to (8)

These are live on the blog but have no dev.to presence:

| Slug | Date | Title area |
|---|---|---|
| docker-dockerfiles | 2025-03-16 | Docker series |
| docker-multi-stage-builds | 2025-03-23 | Docker series |
| docker-build-performance | 2025-04-06 | Docker series |
| docker-security-users | 2025-04-13 | Docker series |
| docker-advanced-patterns | 2025-05-16 | Docker series |
| harden-linux-vps-caddy-docker | 2025-07-02 | VPS hardening |
| building-codebase-cleanup-skill-claude-code | 2026-02-24 | Claude Code skill |
| drift-in-cursor-ai-rules | 2026-02-27 | Cursor AI rules |

### 3. Posts flagged for freshness review (from content-todo.md)

| Slug | Recommendation |
|---|---|
| a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection | Review freshness |
| debugging-bubbletea-commands | Review freshness |
| python-virtual-environments-for-beginners | Review freshness |
| setting-up-devcontainer-in-vscode | Review freshness |
| suspend-and-resume-processes-in-linux | Review freshness |
| understanding-go-interfaces | Review freshness |

### 4. Dev.to-only posts with no local match (~50)

These are older posts that exist only on dev.to (Drupal 10 tutorials, React posts, misc). Many are the highest-traffic posts. They were written before the Hugo blog existed or were never migrated.

**Top dev.to-only posts worth noting:**
- Add a Google Font to Tailwind CSS (2385 views) — still getting traffic
- RTK Query Data Fetching (1637 views) — still getting traffic
- Drupal 10 series (5+ posts, 2000+ combined views) — aging content
- Install DDEV (328 views, 6 reactions) — could be refreshed
- ChatGPT created ReactJS Components (226 views) — dated

## Recommended Actions

### Immediate (clean up)
- [ ] Delete dev.to drafts for locally archived posts (whalebrew, ubuntu 20.04, imposter-syndrome, quickly-view-nodejs)
- [ ] Delete "About", "My Up-Arrow key", and "Unpublished Video" drafts from dev.to
- [ ] Publish or delete the remaining dev.to drafts (ubuntu 24.04, ddev-laravel-go-sidecar, cobra CLI, quickly-view-deps)

### Cross-post missing posts
- [ ] Add `devto: true` to the 5 Docker series posts and push (high-value technical content)
- [ ] Add `devto: true` to harden-linux-vps-caddy-docker
- [ ] Add `devto: true` to building-codebase-cleanup-skill-claude-code
- [ ] Add `devto: true` to drift-in-cursor-ai-rules

### Freshness review
- [ ] Review and update or archive: cobra CLI, bubbletea, python venvs, devcontainer, suspend/resume, go interfaces
- [ ] Consider whether the 6 freshness-review posts are worth updating or should be archived

### Dev.to-only legacy content
- [ ] Decide: leave Drupal 10 posts on dev.to as-is (they still get traffic) or deprecate
- [ ] Tailwind CSS font post (2385 views) — worth refreshing or leaving as-is?
- [ ] RTK Query post (1637 views) — likely outdated, consider deprecation notice
