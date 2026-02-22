# Content TODO

Posts listed here are outdated or deprecated. Prefer the linked action: **update** (refresh in place), **replace + 301** (new post with `aliases: ["/old-slug/"]` on the new post, then archive or remove the old one), or **archive** (add `archived: true` + `sitemap.disable: true` + `robotsNoIndex: true` to frontmatter). Rows below are from the 2026-02-22 automated audit; review and edit as you act on them.

| Slug | Title | Status | Action | Reason | Notes |
|------|--------|--------|--------|--------|-------|
| a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection | Testing Cobra CLI Apps in Go: A DI Approach | review | review | freshness-review | Check freshness |
| creating-my-style-guide | Meta-Blogging: Creating My Writing Style Guide | outdated | **archived** | draft-stale | Stale draft; archived 2026-02-22 |
| debugging-bubbletea-commands | Debugging Bubbletea Command Comparisons: A Learning Experience | review | review | freshness-review | Check freshness |
| devto-challenge-2025 | Retro'ing and Debugging 2024: A Developer's Journey Through Code and Creativity | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| docker-for-legacy-drupal-development | Docker for Legacy Drupal Development | outdated | **archived** | old-date | Old; archived 2026-02-22 |
| golangci-lint | Golangci-lint: Your GoGuardian Against Code Smells | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| gstchatbot-golang-training | Building an AI Chatbot with Go: Part 1 - The Foundation | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| implementing-light-and-dark-modes | Implementing Light and Dark Modes: A No-Nonsense Guide | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| imposter-syndrome | Dealing with Imposter Syndrome in Tech | outdated | **archived** | old-date | Old; archived 2026-02-22 |
| jsonargsrecommended | Docker ENTRYPOINT Best Practices with JSON Arguments | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| kling-ai-prompt-formula | The Ultimate AI Prompt Formula for Video Generation | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| office-addins-getting-started | Getting Started with Office Add-ins: A Web Developer's Guide | outdated | **archived** | draft-minimal | Draft; minimal content; archived 2026-02-22 |
| python-virtual-environments-for-beginners | Python Virtual Environments for Beginners | review | review | freshness-review | Check freshness |
| quickly-view-nodejs-project-scripts-on-the-cli | Quickly View Node.js Project Scripts on the CLI | outdated | **archived** | old-date | Old; archived 2026-02-22 |
| scaffold-and-deploy-a-jekyll-github-pages-blog-in-5-minutes | Scaffold and Deploy a Jekyll GitHub Pages Blog in 5 Minutes | outdated | **archived** | old-date | Old; archived 2026-02-22 |
| setting-up-devcontainer-in-vscode | Setting Up a Dev Container in VS Code | review | review | freshness-review | Check freshness |
| start-developing-with-laravel-in-ubuntu-20.04 | Start Developing With Laravel in Ubuntu 20.04 | outdated | **archived** | version-specific | Replaced by new post when ready; archived 2026-02-22 |
| suspend-and-resume-processes-in-linux | Suspend and Resume Processes in Linux | review | review | freshness-review | Check freshness |
| understanding-go-interfaces | Understanding Go Interfaces: A Practical Guide | review | review | freshness-review | Check freshness |
| use-ddev-to-locally-develop-with-drupal | Use DDEV to Locally Develop with Drupal | outdated | **archived** | old-date | Old; archived 2026-02-22 |
| whalebrew | Whalebrew: Docker Images as Native Commands | outdated | **archived** | old-date | Old; archived 2026-02-22 |

### New posts to create

| Suggested title | Suggested slug | Replaces (slug) | Reason |
|-----------------|-----------------|------------------|--------|
| Start Developing with Laravel on Ubuntu 24.04 LTS | start-developing-with-laravel-in-ubuntu-24-04 | start-developing-with-laravel-in-ubuntu-20.04 | Version-specific; Ubuntu 20.04 → current LTS |

**Conventions**

- **Archived posts:** Add frontmatter `archived: true`, optional `archived_date: YYYY-MM-DD`, `sitemap.disable: true`, `robotsNoIndex: true`. They stay at the same URL but are excluded from home, /posts/, archives, RSS, and sitemap. Listed at [/archived/](/archived/).
- **Replacing a post:** Publish the new post, then on the **new** post add `aliases: ["/old-slug/"]` so the old URL redirects. Then archive or delete the old post and add a row here with action "replaced by /new-slug/".
- **Optional on-post notice:** Add `content_status: deprecated` and `content_todo: "Brief note."` to show a banner on the post (if the partial is enabled).
