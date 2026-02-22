# Content TODO

Posts listed here are outdated or deprecated. Prefer the linked action: **update** (refresh in place), **replace + 301** (new post with `aliases: ["/old-slug/"]` on the new post, then archive or remove the old one), or **archive** (add `archived: true` + `sitemap.disable: true` + `robotsNoIndex: true` to frontmatter).

| Slug | Title | Status | Action | Notes |
|------|--------|--------|--------|--------|
| *(add rows as you classify posts)* | | | | |

**Conventions**

- **Archived posts:** Add frontmatter `archived: true`, optional `archived_date: YYYY-MM-DD`, `sitemap.disable: true`, `robotsNoIndex: true`. They stay at the same URL but are excluded from home, /posts/, archives, RSS, and sitemap. Listed at [/archived/](/archived/).
- **Replacing a post:** Publish the new post, then on the **new** post add `aliases: ["/old-slug/"]` so the old URL redirects. Then archive or delete the old post and add a row here with action "replaced by /new-slug/".
- **Optional on-post notice:** Add `content_status: deprecated` and `content_todo: "Brief note."` to show a banner on the post (if the partial is enabled).
