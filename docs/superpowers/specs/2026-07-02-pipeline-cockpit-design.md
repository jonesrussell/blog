# Pipeline Cockpit — read-only content-pipeline dashboard on the Pi

**Date:** 2026-07-02
**Status:** Approved (brainstormed 2026-07-01, user approved 2026-07-02)
**Working name:** `pipeline-cockpit` (rename welcome; Anishinaabemowin name TBD by user)

## Problem

The content pipeline's state is spread across three surfaces: GitHub issues in `jonesrussell/jonesrussell` (stage labels), GitHub Actions (mining + hygiene runs), and Buffer (scheduled social posts). Visibility currently requires a Claude Code session (`/content-status`). The user wants a hosted, glanceable-anytime dashboard, and — after the northcloud.one droplet was decommissioned — nothing about the pipeline may depend on the dev machine. The Pi (managed from `waaseyaa-infra`) is the pipeline's operational home.

## Decisions made during brainstorming

- **Hosted on the Pi**, behind Caddy basic auth on the existing Cloudflare Tunnel (same pattern as the rhtcircle cockpit).
- **Read-only.** No curation buttons; curation stays in Claude Code sessions where the human-angle gate lives. Structure allows a `/distribute` endpoint to bolt on later without a rewrite.
- **Go single-binary service** (not GitHub-Actions-rendered static HTML, not cron+bash).
- **All four panels:** queue funnel + ages, Buffer headroom, mining health, recently shipped.
- **No ledger, no sync.** Buffer's GraphQL `posts(status: scheduled)` query works on the free-tier token (verified 2026-07-01 by introspection + live test), so the Buffer panel queries the real queue directly, including dashboard-created posts. This removed the original ledger-sync design.
- **Distribution stays a thin script** (`buffer-post.sh`). Buffer holds the queue state, so posting is stateless; any machine with the vault can run it. Full execution residency on the Pi is a possible later iteration, not v1.

## Architecture

One Go binary, three in-process pollers writing to a single in-memory snapshot behind a mutex, one HTTP server rendering it.

```
GitHub Issues API ──(poll ~2m)──┐
GitHub Actions API ─(poll ~10m)─┼──▶ Snapshot (in-memory) ──▶ HTTP server
Buffer GraphQL ────(poll ~5m)───┘         │                    ├── GET /            HTML dashboard
                                          └ per-source:        ├── GET /api/state.json
                                            fetchedAt, lastErr └── GET /healthz
```

### Pollers

1. **Issues poller** (~2 min): fetches all `content-queue` issues (open, plus recently closed for the shipped panel; paginate, limit 300).
   Derives:
   - Stage funnel: counts for `stage:mined`, `stage:curated`, `stage:in_production`, `stage:ready`.
   - Per-item age (days since created), stuck flag (>7 days in `stage:curated`/`stage:in_production`/`stage:ready`).
   - `curate:keep` shortlist (number, title, confidence parsed from `**Confidence:**` in body, age).
   - Recently shipped: last 10 closed issues with `stage:distributed` — title, closed date, blog URL if present in the issue body/comments (best effort), channels if recorded.
2. **Actions poller** (~10 min): latest run of `content-mine.yml` and `content-queue-hygiene.yml` — conclusion, started-at, duration, HTML link. v1 does NOT parse run logs for created-vs-capped counts (deferred).
3. **Buffer poller** (~5 min): GraphQL `posts(input: {organizationId, filter: {channelIds: [...], status: scheduled}})` per channel (facebook, bluesky, linkedin) — pending count, list of `dueAt` times, headroom vs the free-tier cap of 10. Organization ID resolved once at startup via `Query.channel`.

Poller failures never crash the service: each source keeps its last good data plus `lastError`/`fetchedAt`; panels render stale data with an "as of \<time\>, error: …" note.

### HTTP server

- `GET /` — server-rendered `html/template`, one page, four panels, `<meta http-equiv="refresh" content="60">`. No JS build step, no SPA. Dark, minimal; renders fine on a phone.
- `GET /api/state.json` — the raw snapshot (so `/content-status` or future tooling can consume it).
- `GET /healthz` — 200 when the process is up; includes per-source staleness booleans.
- Listens on an internal port; auth is Caddy's job (basic auth), not the app's.

## Configuration (env vars)

| Var | Purpose |
|---|---|
| `GITHUB_TOKEN` | Fine-grained PAT, **read-only**: Issues (read) + Actions (read) on `jonesrussell/jonesrussell` |
| `BUFFER_API_KEY` | Existing key from the waaseyaa-infra vault |
| `BUFFER_CHANNEL_FACEBOOK` / `_BLUESKY` / `_LINKEDIN` | Channel IDs from the vault |
| `LISTEN_ADDR` | Default `:8090` |
| `DEMO` | `1` serves bundled fixture data, no tokens needed (for local eyeballing and screenshots) |

New vault keys in `waaseyaa-infra/ansible/group_vars/all/vault.yml`: `vault_pipeline_cockpit_github_token`, `vault_pipeline_cockpit_basicauth_hash` (Caddy `basic_auth` bcrypt).

## Deployment

- **Repo:** new `jonesrussell/pipeline-cockpit` (private). Go 1.24+, Taskfile, testify, golangci-lint per workspace Go conventions. **No Uber FX** — deliberate deviation: one binary, three goroutines; FX ceremony isn't earned here.
- **CI:** GitHub Actions builds a multi-arch (linux/arm64 + amd64) image to GHCR on push to main.
- **Pi:** compose service in `waaseyaa-infra/compose/`, env templated by Ansible from the vault; Caddy route (path or subdomain — decided at implementation per existing Caddy layout) with basic auth; exposure via the existing Cloudflare Tunnel. Runbook added under `waaseyaa-infra/runbooks/`.

## Testing

- Unit tests with recorded JSON fixtures for: GitHub issue parsing (stage extraction, confidence parsing, age/stuck logic, malformed bodies), Actions run parsing, Buffer response parsing (including pagination `hasNextPage` → "10+"), and funnel derivation.
- Template smoke test: render the page from fixture snapshot, assert panel markers present.
- `DEMO=1` manual check before first deploy.

## Non-goals (v1)

- No write operations of any kind (no curation actions, no distribute endpoint).
- No mining-log parsing (created vs capped counts).
- No historical trends/persistence — snapshot only; the process is stateless and restarts clean.
- No auth inside the app (Caddy owns it).

## Later iterations (explicitly out of scope, structure permits)

- `POST /distribute` endpoint moving Buffer posting fully onto the Pi.
- Trend history (SQLite) and post-performance feedback loop (spec Phase 3 analytics).
- Mining-run detail (parse logs or have the mining script emit a JSON summary artifact).
