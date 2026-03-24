---
title: "Automate your Dev.to presence with the Forem API"
date: 2026-03-23
categories:
    - ai
tags:
    - devto
    - typescript
    - cli
    - automation
summary: Build scripts that track your Dev.to analytics, surface unanswered comments, monitor follower growth, and engage with your community automatically.
slug: devto-community-automation
draft: false
devto: true
---

Ahnii!

[Dev.to](https://dev.to) has a surprisingly capable API that most developers never touch beyond publishing articles. This post covers six automations built on the [Forem API](https://developers.forem.com/api/v1) that track performance, surface engagement opportunities, and grow your presence without manual effort.

## What the API Offers Beyond Article CRUD

The Forem API has endpoints for comments, followers, reactions, listings (classifieds), and tags. Most are public or require only an API key. The useful ones for brand building:

| Endpoint | Auth | What it gives you |
|----------|------|------------------|
| `GET /api/articles/me/all` | API key | `page_views_count` (not available publicly) |
| `GET /api/comments?a_id={id}` | None | Threaded comments on any article |
| `GET /api/followers/users` | API key | Your followers with timestamps |
| `POST /api/reactions` | API key | Like/unicorn/fire any article |
| `POST /api/listings` | API key | Create classifieds in 10 categories |
| `GET /api/tags` | None | Full tag registry with metadata |

Every example below uses a shared helper for authenticated requests:

```typescript
const API_KEY = process.env.DEVTO_API_KEY!;
const BASE = "https://dev.to/api";

async function devto(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Dev.to API ${res.status}: ${await res.text()}`);
  return res.json();
}
```

This wraps `fetch` with your API key header. Every call below uses it.

## Analytics: Find Your Top Performers

The public article endpoint doesn't include view counts. The authenticated `/api/articles/me/all` endpoint does. This is the most useful field Dev.to hides from you.

```typescript
interface Article {
  id: number;
  title: string;
  published: boolean;
  page_views_count: number;
  positive_reactions_count: number;
  comments_count: number;
}

async function getAnalytics() {
  const articles: Article[] = [];
  for (let page = 1; ; page++) {
    const batch = await devto(`/articles/me/all?page=${page}&per_page=30`);
    if (batch.length === 0) break;
    articles.push(...batch);
  }

  return articles
    .filter((a) => a.published)
    .sort((a, b) => b.page_views_count - a.page_views_count)
    .map((a) => ({
      title: a.title,
      views: a.page_views_count,
      reactions: a.positive_reactions_count,
      comments: a.comments_count,
      ratio: a.page_views_count > 0
        ? ((a.positive_reactions_count / a.page_views_count) * 100).toFixed(1) + "%"
        : "0%",
    }));
}
```

The `page_views_count`, `positive_reactions_count`, and `comments_count` fields are only populated when you use your API key. Public requests return zeros.

The engagement ratio (reactions divided by views) tells you more than raw numbers. A post with 500 views and 10 reactions (2%) is engaging more effectively than one with 5,000 views and 15 reactions (0.3%). Here's what it looks like on real data:

```
VIEWS  REACTIONS  COMMENTS  RATIO  TITLE
-----  ---------  --------  -----  -----
27816  21         10        0.1%   Install composer in custom Docker image
2387   5          2         0.2%   Add a Google Font to Tailwind CSS
1638   4          0         0.2%   RTK Query Data Fetching
562    1          0         0.2%   PSR-1: Basic Coding Standard in PHP
```

The composer post has 27,000 views because it solves a specific problem people search for. The PSR post has fewer views but the same ratio because the audience is more targeted. Both are worth writing more of.

## Comments: Never Miss an Unanswered Question

The comments endpoint is public and returns threaded data. You don't need authentication to read them.

```typescript
interface Comment {
  id_code: string;
  body_html: string;
  user: { username: string };
  created_at: string;
  children: Comment[];
}

async function getUnansweredComments(myUsername: string) {
  const articles = await devto("/articles/me/all?per_page=100");
  const unanswered = [];

  for (const article of articles) {
    if (!article.published || article.comments_count === 0) continue;

    const comments: Comment[] = await devto(`/comments?a_id=${article.id}`);

    for (const comment of comments) {
      if (comment.user.username === myUsername) continue;
      const hasReply = comment.children.some(
        (c) => c.user.username === myUsername
      );
      if (!hasReply) {
        unanswered.push({
          article: article.title,
          commenter: comment.user.username,
          date: comment.created_at.slice(0, 10),
          preview: comment.body_html.replace(/<[^>]*>/g, "").slice(0, 60),
        });
      }
    }
  }

  return unanswered;
}
```

This fetches your articles, checks each one for comments, then filters to top-level comments that aren't by you and have no reply from you. The result is a digest of conversations you should respond to.

Fast replies on Dev.to signal authority and boost article visibility in the algorithm. A post with active discussion ranks higher than one with the same reaction count but no comments.

## Followers: Track Audience Growth Over Time

The followers endpoint returns your followers sorted by newest first, with up to 1,000 per page.

```typescript
interface Follower {
  id: number;
  username: string;
  name: string;
  created_at: string;
}

async function trackFollowers() {
  const followers: Follower[] = [];
  for (let page = 1; ; page++) {
    const batch = await devto(
      `/followers/users?page=${page}&per_page=1000&sort=-created_at`
    );
    if (batch.length === 0) break;
    followers.push(...batch);
  }

  // Load previous snapshot
  const historyPath = "./follower-history.json";
  let history: { count: number; date: string }[] = [];
  try {
    history = JSON.parse(await Bun.file(historyPath).text());
  } catch {}

  const last = history.at(-1);
  const diff = last ? followers.length - last.count : 0;

  console.log(`Followers: ${followers.length} (${diff >= 0 ? "+" : ""}${diff})`);

  // Save snapshot
  history.push({ count: followers.length, date: new Date().toISOString() });
  await Bun.write(historyPath, JSON.stringify(history.slice(-52), null, 2));
}
```

The API returns a total count and usernames, but no time-series data. Saving snapshots locally and diffing them builds a growth history over time. Run it weekly, keep the last 52 snapshots (one year), and correlate spikes with specific posts to learn what content drives follows.

## Engage: Like Articles in Tags You Follow

The reactions endpoint is idempotent. Calling it twice on the same article returns the existing reaction instead of creating a duplicate. This makes it safe to run repeatedly.

```typescript
async function engageWithCommunity(limit = 10, days = 7) {
  // Get tags you follow
  const followedTags = await devto("/follows/tags");

  // Get your article IDs to skip
  const myArticles = await devto("/articles/me/all?per_page=100");
  const myIds = new Set(myArticles.map((a: Article) => a.id));

  let liked = 0;

  for (const tag of followedTags) {
    if (liked >= limit) break;

    const articles = await devto(
      `/articles?tag=${tag.name}&top=${days}&per_page=10`
    );

    for (const article of articles) {
      if (liked >= limit || myIds.has(article.id)) continue;

      const result = await devto("/reactions", {
        method: "POST",
        body: JSON.stringify({
          category: "like",
          reactable_id: article.id,
          reactable_type: "Article",
        }),
      });

      if (result.result === "created") {
        console.log(`Liked: "${article.title}" by @${article.user.username}`);
        liked++;
      }
    }
  }

  console.log(`\nReacted to ${liked} article(s)`);
}
```

This fetches your followed tags, finds recent articles in each, skips your own posts, and likes the rest up to the limit. When you like someone's article, your profile shows up in their notifications. This drives profile visits and reciprocal follows.

Use this with a capped limit. Liking 10 articles a day in your niche is community participation. Liking 500 is spam.

## Listings: Promote Your Work With Classifieds

Dev.to has a classifieds section that almost nobody uses. You can create listings in categories like `education`, `collabs`, `mentors`, and `events`.

```typescript
async function createListing(
  title: string,
  body: string,
  category: string,
  tags: string[] = []
) {
  return devto("/listings", {
    method: "POST",
    body: JSON.stringify({
      listing: {
        title,
        body_markdown: body,
        category, // education, collabs, mentors, events, cfp, etc.
        tags,
        contact_via_connect: true,
      },
    }),
  });
}

// Promote a tutorial series
await createListing(
  "PSR Standards Guide — 14 free tutorials",
  "A practical series covering all accepted PHP-FIG standards...",
  "education",
  ["php", "psr"]
);
```

An `education` listing promoting your tutorial series shows up for people actively browsing for learning resources. A `collabs` listing for your open-source project reaches developers looking for something to contribute to. A `mentors` listing puts your name in front of people who want guidance in your stack.

## Tags: Check Your Posts Against the Registry

Dev.to rejects hyphens in tags when you create or update articles via the API. If your blog uses `psr-6` as a tag, you need to strip it to `psr6` before pushing. Tags created on first use get zero algorithmic discovery if nobody else uses them, so `psr6` is effectively invisible in feeds.

```typescript
async function checkTags(myArticles: Article[]) {
  // Fetch top 500 tags
  const knownTags = new Set<string>();
  for (let page = 1; page <= 5; page++) {
    const batch = await devto(`/tags?page=${page}&per_page=100`);
    if (batch.length === 0) break;
    batch.forEach((t: { name: string }) => knownTags.add(t.name.toLowerCase()));
  }

  const issues = [];
  for (const article of myArticles) {
    for (const tag of article.tag_list ?? []) {
      const sanitized = tag.toLowerCase().replace(/-/g, "");
      if (!knownTags.has(sanitized)) {
        issues.push({ article: article.title, tag: sanitized });
      }
    }
  }

  return issues;
}
```

This fetches the top 500 tags and checks each of your posts. Tags not in the registry are likely getting zero discovery:

```
POST                       TAG        STATUS
----                       ---        ------
psr-6-caching-interface    phpfig     NOT FOUND on Dev.to
psr-7-http-message-inter   psr7       NOT FOUND on Dev.to

154 tag(s) not found in Dev.to's top 500 tags.
```

Swap niche tags for broader alternatives (`php`, `webdev`) to get into more feeds.

## Rate Limiting: Respect the API

Dev.to's documented rate limits are generous (10 requests per 30 seconds) but the actual limits are stricter, especially for write operations. In practice, keep to 3 writes per 30 seconds and 10 reads per 30 seconds. Add a simple delay between requests:

```typescript
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function rateLimitedDevto(path: string, options?: RequestInit) {
  await sleep(options?.method === "POST" ? 10_000 : 3_000);
  return devto(path, options);
}
```

This is a basic approach. A proper implementation uses a token bucket that refills over time, so bursts are allowed but sustained throughput stays under the limit. The important thing is that every request to Dev.to goes through the limiter.

## What's Missing From the API

Not everything can be automated. Dev.to has no endpoint for creating comments (you must reply manually), no webhooks for real-time notifications, no follow/unfollow API, and no time-series analytics. View counts are lifetime totals, not daily breakdowns.

The most impactful gap is comment creation. You can monitor for unanswered comments programmatically, but replying still requires the browser. That's probably by design.

Baamaapii
