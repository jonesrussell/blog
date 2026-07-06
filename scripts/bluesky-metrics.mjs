#!/usr/bin/env node
// Snapshot Bluesky engagement via the public AppView API (no auth required).
// - Appends one row per run to docs/social/metrics/snapshots.csv
// - Rewrites docs/social/metrics/posts.csv with cumulative per-post counts
// Run: node scripts/bluesky-metrics.mjs  (or: task metrics:bluesky)

import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ACTOR = "jonesrussell.bsky.social";
const API = "https://public.api.bsky.app/xrpc";
const SAMPLE_SIZE = 50; // most recent original posts to track
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "social", "metrics");

async function getJson(path, params) {
  const url = `${API}/${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

const profile = await getJson("app.bsky.actor.getProfile", { actor: ACTOR });

const posts = [];
let cursor;
while (posts.length < SAMPLE_SIZE) {
  const page = await getJson("app.bsky.feed.getAuthorFeed", {
    actor: ACTOR,
    limit: "50",
    filter: "posts_no_replies",
    ...(cursor ? { cursor } : {}),
  });
  if (!page.feed?.length) break;
  for (const item of page.feed) {
    if (item.reason) continue; // skip reposts of others
    const p = item.post;
    posts.push({
      posted: p.record.createdAt.slice(0, 10),
      uri: p.uri,
      likes: p.likeCount ?? 0,
      reposts: p.repostCount ?? 0,
      replies: p.replyCount ?? 0,
      quotes: p.quoteCount ?? 0,
      text: p.record.text.replace(/\s+/g, " ").slice(0, 100),
    });
  }
  cursor = page.cursor;
  if (!cursor) break;
}
posts.length = Math.min(posts.length, SAMPLE_SIZE);

const totals = posts.reduce(
  (acc, p) => ({
    likes: acc.likes + p.likes,
    reposts: acc.reposts + p.reposts,
    replies: acc.replies + p.replies,
    quotes: acc.quotes + p.quotes,
  }),
  { likes: 0, reposts: 0, replies: 0, quotes: 0 },
);

mkdirSync(OUT_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const snapshotsPath = join(OUT_DIR, "snapshots.csv");
const snapshotHeader =
  "date,followers,following,total_posts,posts_sampled,likes,reposts,replies,quotes,avg_likes\n";
if (!existsSync(snapshotsPath)) writeFileSync(snapshotsPath, snapshotHeader);
const avgLikes = posts.length ? (totals.likes / posts.length).toFixed(2) : "0";
appendFileSync(
  snapshotsPath,
  [
    today,
    profile.followersCount,
    profile.followsCount,
    profile.postsCount,
    posts.length,
    totals.likes,
    totals.reposts,
    totals.replies,
    totals.quotes,
    avgLikes,
  ].join(",") + "\n",
);

const csvEscape = (s) => `"${String(s).replaceAll('"', '""')}"`;
const postsPath = join(OUT_DIR, "posts.csv");
writeFileSync(
  postsPath,
  "posted,likes,reposts,replies,quotes,text,uri\n" +
    posts
      .map((p) =>
        [p.posted, p.likes, p.reposts, p.replies, p.quotes, csvEscape(p.text), p.uri].join(","),
      )
      .join("\n") +
    "\n",
);

console.log(
  `${today}: ${profile.followersCount} followers, ${profile.postsCount} posts. ` +
    `Last ${posts.length} posts: ${totals.likes} likes (avg ${avgLikes}), ` +
    `${totals.reposts} reposts, ${totals.replies} replies, ${totals.quotes} quotes.`,
);
console.log(`Wrote ${snapshotsPath} (+1 row) and ${postsPath}.`);
