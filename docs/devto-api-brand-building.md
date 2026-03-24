# Dev.to (Forem) API — Brand-Building Features Beyond Article CRUD

Research date: 2026-03-23. Sources: Forem API V1 + V0 docs at developers.forem.com.

---

## 1. Reactions API (V1) — Engagement Automation

**Endpoints:**
- `POST /api/reactions/toggle` — toggle a reaction (idempotent on/off)
- `POST /api/reactions` — create a reaction (idempotent, returns existing if duplicate)

**Auth:** API key required.

**Parameters:** `category` (enum: `like`, `unicorn`, `exploding_head`, `raised_hands`, `fire`), `reactable_id`, `reactable_type` (`Article`, `Comment`, `User`).

**Brand idea:** Build a "community engagement bot" that reacts to articles in tags you follow (e.g., `go`, `laravel`, `php`). Liking and unicorning articles from peers puts your profile in their notifications, driving profile visits. You can also react to *users* directly, not just content.

---

## 2. Comments API (V1) — Read-Only Thread Monitoring

**Endpoints:**
- `GET /api/comments?a_id={article_id}` — all comments on an article (threaded)
- `GET /api/comments?p_id={podcast_episode_id}` — comments on podcast episodes
- `GET /api/comments/{id}` — single comment + descendants

**Auth:** None required (public).

**Brand idea:** Monitor comments on your own articles for unanswered questions. Build a daily digest of new comments across all your posts so you never miss engagement. Fast replies signal authority and boost article visibility in the algorithm.

**Limitation:** No POST endpoint for comments in the public API — comments must be created through the web UI or undocumented endpoints.

---

## 3. Followers API (V1) — Audience Analytics

**Endpoint:** `GET /api/followers/users`

**Auth:** API key required.

**Parameters:** `page`, `per_page` (30–1000), `sort` (`created_at` or `-created_at` for newest first).

**Response fields:** `type_of`, `id`, `created_at`, `user_id`, `name`, `path`, `username`, `profile_image`.

**Brand idea:** Track follower growth over time. Export follower list weekly and diff it to see net gains/losses. Correlate follower spikes with specific posts to identify what content resonates. Build a "follower milestone" tracker that alerts you at round numbers (100, 250, 500, etc.).

---

## 4. Followed Tags API (V1) — Content Strategy Intelligence

**Endpoint:** `GET /api/follows/tags` (also `GET /api/followers/tags`)

**Auth:** API key required.

**Brand idea:** Export your followed tags to ensure your devto-sync tool is tagging articles with tags you actually follow. Cross-reference with trending tags to find gaps in your content coverage.

---

## 5. Tags API (V1) — Discovery & Trend Analysis

**Endpoint:** `GET /api/tags`

**Auth:** None required.

**Parameters:** `page`, `per_page`.

**Brand idea:** Periodically scrape the full tag list to identify trending or underserved tags. Find niche tags with decent followers but low competition. Your devto-sync tool could suggest optimal tags for each post based on tag popularity data.

---

## 6. Listings / Classifieds API (V0) — Underused Visibility Channel

**Endpoints:**
- `GET /api/listings` — all published listings
- `POST /api/listings` — create a listing
- `GET /api/listings/category/{category}` — by category
- `GET /api/listings/{id}` — single listing
- `PUT /api/listings/{id}` — update (actions: `bump`, `publish`, `unpublish`)
- `GET /api/organizations/{username}/listings` — org's listings

**Auth:** API key for create/update.

**Categories:** `cfp`, `forhire`, `collabs`, `education`, `jobs`, `mentors`, `mentees`, `forsale`, `events`, `misc`.

**Fields:** `title`, `body_markdown`, `category`, `tags`, `contact_via_connect`, `location`, `organization_id`, `action`.

**Brand ideas:**
- **`education` listings** — promote your PSR blog series, PHP-FIG guide repo, or any tutorial series as a free resource.
- **`collabs` listings** — find co-contributors for open-source projects (north-cloud, goforms).
- **`mentors` listings** — offer mentoring in Go/Laravel/DevOps to build authority.
- **`events` listings** — promote any talks or workshops.
- **`cfp` listings** — share call-for-papers for community events you organize.
- Listings can be **bumped** via API to stay fresh — automate weekly bumps.

---

## 7. Article Analytics (V0 Authenticated) — Performance Tracking

**Endpoint:** `GET /api/articles/me/all`

**Auth:** API key required.

**Key response fields not in public article responses:**
- `page_views_count` — actual page views (only visible to article owner)
- `positive_reactions_count` — total positive reactions
- `public_reactions_count` — public reaction count
- `comments_count`
- `published` — boolean
- `body_markdown` — full source

**Brand idea:** Build an analytics dashboard or CLI report (`task devto:analytics`). Track page views, reactions, and comments over time per article. Identify your top performers. Calculate a "views-to-reaction" ratio to gauge content quality. Compare performance of cross-posted articles vs. Dev.to originals.

---

## 8. Organization Pages API (V1 & V0) — Team Branding

**Endpoints:**
- `GET /api/organizations/{username}` — org details
- `GET /api/organizations/{username}/users` — org members
- `GET /api/organizations/{username}/articles` — org's articles
- `GET /api/organizations/{username}/listings` — org's listings (V0)

**Auth:** None for reads.

**Brand idea:** Create a Dev.to organization for your brand (e.g., "North Cloud" or your consulting identity). Publish articles under the org to build a branded content hub. Org pages get their own profile, logo, and aggregated article feed. The `organization_id` field in article create/update lets you associate any article with your org via the API — your devto-sync tool could add this automatically.

---

## 9. Article Series (via `series` field) — Content Grouping

**Field:** `series` (string) in article create/update body.

**Brand idea:** Your devto-sync tool already pushes articles, but may not be setting the `series` field. Map your Hugo `series` frontmatter (e.g., `php-fig-standards`) to the Dev.to `series` field so articles appear as a connected collection on Dev.to. Series get their own navigation UI on each article, encouraging binge-reading.

---

## 10. Pages API (V1) — Custom Landing Pages (Admin Only)

**Endpoints:**
- `GET /api/pages` — list all pages
- `POST /api/pages` — create a page
- `GET /api/pages/{id}` — single page
- `PUT /api/pages/{id}` — update
- `DELETE /api/pages/{id}` — delete

**Templates:** `contained`, `full_within_layout`, `nav_bar_included`, `json`.

**Special:** `is_top_level_path: true` makes page available at `/{slug}` instead of `/page/{slug}`.

**Auth:** API key required (admin role).

**Note:** This is an admin-only feature for Forem instance operators, not regular Dev.to users. Only relevant if you run your own Forem instance.

---

## 11. Profile Images API (V1) — Brand Consistency Checks

**Endpoint:** `GET /api/profile_images/{username}`

**Auth:** API key required.

**Brand idea:** Automate a check that your Dev.to profile image matches your blog/GitHub avatar. Ensure brand consistency across platforms.

---

## 12. Reading List API (V1) — Content Curation

**Endpoint:** `GET /api/readinglist`

**Auth:** API key required.

**Parameters:** `page`, `per_page` (30 default).

**Brand idea:** Export your reading list to create curated "best of" roundup posts. "10 articles I bookmarked this month on Go concurrency" — positions you as a curator, not just a creator.

---

## 13. Videos & Podcast Episodes (V1) — Multimedia Discovery

**Endpoints:**
- `GET /api/videos` — articles with video (public, paginated, sorted by popularity)
- `GET /api/podcast_episodes` — podcast episodes (filterable by `username`)

**Auth:** None required.

**Brand idea:** If you create video content or podcast episodes, these endpoints surface your multimedia. Monitor trending video articles in your niche for content ideas.

---

## 14. Display Ads API (V1) — Sponsored Visibility (Admin Only)

**Endpoints:** Full CRUD at `/api/display_ads`.

**Fields:** `body_markdown`, `placement_area` (sidebar_left, sidebar_right, post_sidebar, post_comments), `display_to`, `tag_list`, `approved`, `organization_id`.

**Tracks:** `clicks_count`, `impressions_count`.

**Note:** Admin-only feature for Forem operators. Not usable on dev.to unless you're a paying sponsor through their official channels.

---

## 15. User Invite API (V1) — Community Growth

**Endpoint:** `POST /api/admin/users`

**Auth:** API key (admin role).

**Brand idea:** If running your own Forem, automate inviting contributors to your community.

---

## Priority Automation Opportunities for devto-sync

Ranked by effort vs. brand impact:

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | **Analytics dashboard** (`/articles/me/all` → page_views_count) | Low | High |
| 2 | **Series field sync** (Hugo series → Dev.to series) | Low | Medium |
| 3 | **Organization articles** (set organization_id on push) | Low | Medium |
| 4 | **Comment monitoring** (daily digest of new comments) | Medium | High |
| 5 | **Follower tracking** (weekly growth report) | Low | Medium |
| 6 | **Listings automation** (education/mentors/collabs) | Medium | Medium |
| 7 | **Reaction engagement** (like peers' articles in your tags) | Low | Medium |
| 8 | **Tag intelligence** (trending tags → content suggestions) | Medium | Medium |
| 9 | **Reading list curation** (export → roundup posts) | Medium | Low |

---

## API Gaps / Missing Features

- **No comment creation** via public API — you cannot automate replies.
- **No webhook/event system** — no way to get push notifications for new followers, comments, or reactions.
- **No OAuth app registration** via API — must use web UI.
- **No article pinning** via API — pinned articles are set through the web dashboard.
- **No analytics time-series** — `page_views_count` is a lifetime total, not daily/weekly breakdowns.
- **No follower/following management** — can read followers but cannot follow/unfollow users via API.
- **No article scheduling** — cannot set a future publish date via API.
- **No notification API** — cannot read or manage notifications programmatically.
