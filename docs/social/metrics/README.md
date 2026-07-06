# Social metrics tracking

Bluesky engagement is tracked via the public AppView API (no auth). Run weekly:

```bash
task metrics:bluesky
```

- `snapshots.csv` — one row per run: followers, following, total posts, and engagement totals across the 50 most recent original posts.
- `posts.csv` — cumulative per-post counts (rewritten each run; counts only go up, so the latest run is authoritative).

Facebook and LinkedIn have no free API for organic metrics — record notable numbers here manually if worth keeping.

## Baseline — 2026-07-06

| Metric | Value |
|---|---|
| Followers | 31 |
| Following | 35 |
| Total posts | 135 |
| Likes, last 50 posts | 212 (avg 4.24) |
| Reposts, last 50 posts | **0** |
| Replies received, last 50 posts | 19 |
| Quotes, last 50 posts | 1 |

Diagnosis at baseline:

- **Zero reposts in 50 posts** is the headline. Likes come from a small recurring circle (several of them AI-agent accounts: Luna Nova, PubPilot, Spinov), but nobody amplifies. Nothing is crossing out of the existing follower graph.
- **Cadence outruns audience**: ~2.4 posts/day into 31 followers. Volume without reach.
- **Format monoculture**: most posts are changelog-shaped ("Waaseyaa's X now does Y + repo link"). The posts that drew replies were bug stories, the Bimaaji agent-DSL post, and the mission-driven Minoo/rhtcircle posts.
- **One-way broadcast**: substantive replies (e.g. Luna Nova's checkpoint-pruning question) went unanswered; no visible engagement on other people's posts.

## Goals (review monthly)

| Metric | Baseline | 2026-08-06 target | 2026-10-06 target |
|---|---|---|---|
| Followers | 31 | 60 | 150 |
| Avg likes / post | 4.2 | 8 | 15 |
| Reposts / 50 posts | 0 | 5 | 25 |
| Replies answered | ~0% | 100% | 100% |
