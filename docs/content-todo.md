# Content TODO

Posts listed here are outdated or deprecated. Prefer the linked action: **update** (refresh in place), **replace + 301** (new post with `aliases: ["/old-slug/"]` on the new post, then archive or remove the old one), or **archive** (add `archived: true` + `sitemap.disable: true` + `robotsNoIndex: true` to frontmatter).

| Slug | Title | Status | Action | Reason | Notes |
|------|--------|--------|--------|--------|-------|
| a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection | Testing Cobra CLI Apps in Go: A DI Approach | review | review | freshness-review | Check freshness |
| debugging-bubbletea-commands | Debugging Bubbletea Command Comparisons: A Learning Experience | review | review | freshness-review | Check freshness |
| python-virtual-environments-for-beginners | Python Virtual Environments for Beginners | review | review | freshness-review | Check freshness |
| setting-up-devcontainer-in-vscode | Setting Up a Dev Container in VS Code | review | review | freshness-review | Check freshness |
| suspend-and-resume-processes-in-linux | Suspend and Resume Processes in Linux | review | review | freshness-review | Check freshness |
| understanding-go-interfaces | Understanding Go Interfaces: A Practical Guide | review | review | freshness-review | Check freshness |

### New posts to create

| Suggested title | Suggested slug | Replaces (slug) | Reason |
|-----------------|-----------------|------------------|--------|
| Start Developing with Laravel on Ubuntu 24.04 LTS | start-developing-with-laravel-in-ubuntu-24-04 | start-developing-with-laravel-in-ubuntu-20.04 | Version-specific; Ubuntu 20.04 → current LTS |

**Conventions**

- **Archived posts:** Add frontmatter `archived: true`, optional `archived_date: YYYY-MM-DD`, `sitemap.disable: true`, `robotsNoIndex: true`. They stay at the same URL but are excluded from home, /posts/, archives, RSS, and sitemap. Listed at [/archived/](/archived/).
- **Replacing a post:** Publish the new post, then on the **new** post add `aliases: ["/old-slug/"]` so the old URL redirects. Then archive or delete the old post and add a row here with action "replaced by /new-slug/".
- **Optional on-post notice:** Add `content_status: deprecated` and `content_todo: "Brief note."` to show a banner on the post (if the partial is enabled).
