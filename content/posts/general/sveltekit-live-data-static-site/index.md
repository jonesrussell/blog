---
title: "Three Tiers of Data Freshness in a SvelteKit Static Site"
date: 2026-03-23
categories:
    - general
tags:
    - sveltekit
    - github-pages
    - static-sites
summary: How to serve live data from a statically deployed SvelteKit site using prerendered pages, cached client-side fetches, and SPA fallback routes.
slug: sveltekit-live-data-static-site
draft: true
devto: true
---

Ahnii!

Static sites are fast and cheap to host, but your data goes stale the moment you deploy. This post shows how a [SvelteKit](https://svelte.dev/docs/kit) portfolio site serves live data from five external sources while still deploying as static HTML to [GitHub Pages](https://pages.github.com/).

## The Setup

The site uses SvelteKit with [`adapter-static`](https://kit.svelte.dev/docs/adapter-static), which prerenders every page to HTML at build time. The output is a directory of `.html` files deployed to GitHub Pages. No server, no edge functions, no serverless runtime.

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html',
      strict: false
    })
  }
};
```

The `fallback: '404.html'` line is the key. GitHub Pages serves this file for any URL that doesn't match a prerendered page, which lets SvelteKit's client-side router take over.

## Three Tiers of Freshness

Not all data needs to be live. The site uses three strategies depending on how fresh the data needs to be.

### Tier 1: Prerendered at Deploy

The homepage fetches articles from the [North Cloud](https://northcloud.biz) API using a `+page.server.ts` loader. This runs only at build time because the page is prerendered.

```typescript
// src/routes/+page.server.ts
export async function load({ fetch }) {
  let northCloudArticles = [];
  try {
    northCloudArticles = await fetchNorthCloudFeed(fetch, 'pipeline', 6);
  } catch {
    // Feed optional on homepage
  }
  return { northCloudArticles };
}
```

The data is baked into the HTML. It updates when you deploy, not when the API changes. This is fine for a homepage showcase where articles from yesterday are still relevant.

### Tier 2: Cached Client-Side

The blog page fetches an external RSS feed at runtime in the browser. The service layer caches results for 30 minutes.

```typescript
// src/lib/services/blog-service.ts
const FEED_URL = 'https://jonesrussell.github.io/blog/feed.xml';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const fetchFeed = async (
  fetchFn: typeof fetch,
  { page = 1, pageSize = 5 } = {}
) => {
  const cacheKey = `blog-feed-cache-${page}-${pageSize}`;
  const cached = feedCache.getCache(cacheKey);

  if (cached) {
    return {
      items: cached.data.slice((page - 1) * pageSize, page * pageSize),
      hasMore: cached.data.length > page * pageSize
    };
  }

  const response = await fetchFn(FEED_URL);
  const posts = parseXMLFeed(await response.text());
  feedCache.updateCache(cacheKey, posts);

  return {
    items: posts.slice((page - 1) * pageSize, page * pageSize),
    hasMore: posts.length > page * pageSize
  };
};
```

The blog page itself has `prerender = false`, so there's no static HTML for it. When you navigate to `/blog`, GitHub Pages serves the SPA fallback, and SvelteKit loads the RSS feed client-side. New blog posts appear within 30 minutes without a redeploy.

### Tier 3: Prerendered With Live Refresh

Series pages combine prerendering with live data. They're statically generated at build time (good for SEO), but on client-side navigation they fetch fresh data from the Hugo JSON endpoint and live source code from GitHub.

```typescript
// src/routes/blog/series/[id]/+page.ts
export const prerender = true;

export async function entries() {
  const response = await fetch(SERIES_JSON_URL);
  const data = await response.json();
  return data.series.map((s) => ({ id: s.id }));
}

export const load: PageLoad = async ({ params }) => {
  const series = await fetchSeries(globalThis.fetch, params.id);
  // Fetches companion code from raw.githubusercontent.com
  const allEntries = series.groups.flatMap((g) => g.entries);
  const codeResults = await Promise.all(
    allEntries.map((entry) =>
      fetchSeriesCode(globalThis.fetch, repoSlug, entry.companionFiles ?? [])
    )
  );
  return { series, codeResults };
};
```

The `entries()` function tells SvelteKit which series IDs exist at build time, so each one gets a prerendered HTML page. The `load` function runs both at build time (for prerendering) and at runtime (on client-side navigation), so the data is always current when you browse.

## The Fetch Injection Pattern

Every service takes `fetchFn: typeof fetch` as its first parameter instead of using the global `fetch` directly.

```typescript
export async function fetchSeries(
  fetchFn: typeof fetch,
  id: string
): Promise<Series | null> {
  const index = await fetchSeriesIndex(fetchFn);
  return index.series.find((s) => s.id === id) ?? null;
}
```

This matters because SvelteKit provides its own `fetch` wrapper during SSR and prerendering that handles cookies, relative URLs, and request deduplication. By accepting fetch as a parameter, the same service works during prerendering (with SvelteKit's fetch) and at runtime (with the browser's fetch). It also makes testing straightforward since you can pass a mock fetch.

One caveat: during prerendering, SvelteKit's fetch wrapper can fail on cross-origin requests. For external APIs, use `globalThis.fetch` in the loader instead.

## What Goes Stale and When

| Data source | Freshness | Updates when |
|---|---|---|
| North Cloud feed | Frozen at deploy | Next GitHub Pages deploy |
| Blog RSS | 30-min cache | Cache expires, page revisited |
| Series JSON | Live on navigation | Every client-side page load |
| GitHub source code | Live on navigation | Every client-side page load |
| Markdown resources | Frozen at deploy | Next GitHub Pages deploy |

The tradeoff is intentional. Homepage data can be a day old. Blog posts need to appear within 30 minutes. Series companion code should always reflect the latest commit.

## Avoiding the 404 Flash

If you use `prerender = false` on a route, GitHub Pages has no HTML file for that URL. It serves a 404 before the SPA fallback kicks in. The page still renders correctly for users, but search engines see the 404 status code, and there's a brief flash of the fallback page.

The fix for any route with known paths: use `prerender = true` with an `entries()` function that returns all valid slugs. This gives you static HTML for the initial load (SEO-friendly, no 404) while still fetching fresh data on client-side navigation.

For routes where the slugs aren't known at build time (like the blog listing), `prerender = false` with SPA fallback is the right choice. Just know the SEO tradeoff.

Baamaapii
