---
categories:
    - general
date: 2026-09-13T00:00:00Z
devto_id: 4650483
draft: false
slug: feed-reader-prototype-loopback-proxy
summary: How northway's browser prototype keeps its API key off client JavaScript with a loopback-only Node proxy, before any of it reaches the production Pi build.
tags:
    - northway
    - nodejs
    - security
    - prototyping
title: A loopback-only proxy for prototyping northway's feed reader
---

Ahnii!

[northway](https://github.com/jonesrussell/northway) is a Go service that turns approved sources into small, ranked, source-backed news feeds for AI agents, deployed Pi-first. Before committing that UX to the single-process Go build, I prototyped it in the browser first — a plain HTML/CSS/JS reader backed by a small Node.js proxy. What follows is why that prototype needed its own proxy, and the checks that keep it from becoming anything more than a local UX reference.

## Why a proxy, and why disposable

The prototype had one job: settle the reader's interaction design before any of it went into the Go service. That meant nailing down:

- Five feed tabs — **Mixed**, **Development**, **Entertainment**, **Canada**, **World**
- A compact dark layout
- Honest handling of empty or failed results

Doing that in a browser means calling northway's real API from client-side code, and that creates an immediate problem: the API key can't go anywhere client-side JavaScript can read it.

The fix is a small `node:http` server (`prototype/server.mjs`) that serves the static files and exposes one endpoint, `/api/news`, which holds the key and forwards requests upstream:

```javascript
const apiKey = process.env.NORTHWAY_API_KEY;
```

```javascript
const upstream = await fetch(`${northwayURL}/v1/feed-queries`, {
  method: "POST",
  signal: AbortSignal.timeout(10_000),
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Idempotency-Key": randomUUID(),
  },
  body: JSON.stringify({
    feed_id: selected.id,
    context: { intent: selected.context, technologies: [], focus: [selected.label] },
    max_age_hours: maxAgeHours,
    limit: 10,
  }),
});
```

The browser only ever talks to `/api/news` on the same origin. It never sees the key, the upstream URL, or the feed ID mapping — those live entirely on the proxy side. The `Idempotency-Key` and a 10-second `AbortSignal.timeout` guard against duplicate or hung upstream calls, which matters when every query is a paid AI-provider request.

## Refuse to bind anywhere but loopback

A proxy that holds a live API key is a liability the moment it's reachable from anything but the machine running it. The server checks its own bind address before it does anything else:

```javascript
const host = process.env.HOST ?? "127.0.0.1";
if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
  throw new Error("HOST must be a loopback address; this prototype cannot be exposed.");
}
```

There's no flag to override this — the only way past the check is to not pass a non-loopback `HOST` in the first place. The README spells out the same constraint in plain language: keep it bound to loopback, don't put it on a LAN, don't expose it to the internet.

## Don't trust requests just because they're local

Loopback-only isn't a substitute for validating what shows up on `/api/news`. The handler rejects anything that doesn't look like the reader's own frontend before routing even happens:

| Check | Rejects when | Response |
|---|---|---|
| Host header | Doesn't match `127.0.0.1:<port>`, `localhost:<port>`, or `[::1]:<port>` | 400 |
| Content-Type | Anything other than `application/json` | 415 |
| `Sec-Fetch-Site` | Present and not `same-origin` (blocks other tabs and pages) | 403 |
| Body size | Over **16 KB** | Aborted, never buffered |

Every response also carries a restrictive `Content-Security-Policy` (`default-src 'self'`, locked-down `script-src`/`style-src`, no inline scripts or styles), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`. None of it is exotic, but skipping any row in that table turns "only my machine can reach this" into "anything on my machine can reach this."

## Preserve the last good feed on failure

On the client side, a failed refresh shouldn't blank out a working feed. `app.js` tracks whether a snapshot has ever loaded successfully and falls back to it on error instead of clearing the screen:

```javascript
} catch (error) {
  if (requestNumber !== activeRequest) return;
  if (error.name === "AbortError") return;
  activeFeed = displayedFeed;
  selectFeed(displayedFeed);
  briefingHeading.textContent = feedLabels[displayedFeed];
  briefingMeta.textContent = hasSnapshot
    ? `Refresh failed · showing last available ${feedLabels[displayedFeed]} feed`
    : "Service unavailable";
  ...
}
```

An `activeRequest` counter also discards any response that isn't from the most recent fetch, so clicking between tabs quickly can't let a slow, stale response overwrite a newer one. When a feed genuinely comes back empty, the reader says so directly ("No current stories matched this feed") rather than padding the list. That's the same rule spelled out in `app.js` itself: the empty result is preserved rather than padded.

## What's next

This prototype has clear limits:

- It doesn't deploy northway
- It doesn't poll unattended
- It isn't the Pi runtime — it's explicitly excluded from the production Go image

Its only job was to prove out the interaction design against real, live snapshots (all five feeds, desktop and mobile), so the accepted UX could guide a single-process Go implementation instead of being designed twice.

Baamaapii
