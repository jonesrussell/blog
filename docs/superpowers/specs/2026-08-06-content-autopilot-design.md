# Content Autopilot — zero-touch mine→publish→distribute

**Date:** 2026-08-06
**Status:** shipped (validating)

## Goal

Close the content pipeline into a fully autonomous loop. No human runs any slash
command. Mined git activity becomes published blog posts and queued social copy
without a manual step.

## Throttle & gate

- **Throttle = Buffer queue depth.** Buffer free tier caps at 10 scheduled posts
  per channel. That cap is the natural rate limiter: the pipeline only produces
  when the queue has room. Fast-publishing weeks produce more; quiet weeks less.
- **Gate = usefulness, judged by an LLM.** With no human curator, Claude scores
  mined items and rejects thin dev-scaffolding. Nothing good enough → no post.

## Flow (`.github/workflows/content-autopilot.yml`, daily cron)

1. **Backpressure** — `scripts/buffer-queue-depth.mjs 9`; any channel ≥9/10 → stop.
2. **Candidates** — pull open `stage:mined` issues from `jonesrussell/jonesrussell`.
3. **Curate + Produce** — `anthropics/claude-code-action@v1` picks the single most
   useful item, verifies any code against source repos via `gh api`, writes a Hugo
   post (`draft: false`) + `docs/social/<slug>.md`, and emits `autopilot-result.json`.
   If nothing qualifies → `NONE`; if code is unverifiable → `HOLD`. Either stops the run.
4. **Build gate** — `hugo --gc --minify` must pass or the post is discarded.
5. **Publish** — commit post + social copy, push to main (existing `hugo.yml` deploys).
6. **Distribute** — `scripts/buffer-distribute.mjs <social> addToQueue` → FB/LinkedIn/Bluesky.
7. **Close** — mark the queue issue `stage:distributed` and close it.

`workflow_dispatch` inputs: `dry_run` (produce+gate only, no publish/distribute) and
`force` (bypass backpressure). Scheduled runs use neither → full zero-touch.

## Credentials

All from the waaseyaa-infra Ansible vault, mirrored to `jonesrussell/blog` Actions
secrets: `ANTHROPIC_API_KEY`, `BUFFER_API_KEY`, `BUFFER_CHANNEL_{FACEBOOK,LINKEDIN,BLUESKY}`,
`CROSS_REPO_TOKEN` (reads/closes queue issues + reads source repos for verification).

## Safety nets

- LLM verify step holds posts with unverifiable code (honors CLAUDE.md rule).
- Hugo build must pass before publish.
- Buffer backpressure prevents flooding social channels.
- `dry_run` dispatch validates produce+gate without going live.

## Fast-follow (not blocking)

- Improve mining to surface releases / notable PRs instead of per-directory stubs.
- Optional Slack/email ping on PUBLISH/HOLD for visibility.
