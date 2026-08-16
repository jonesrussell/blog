---
categories:
    - ai
date: 2026-08-16T00:00:00Z
devto_id: 4412289
draft: false
series: []
slug: content-autopilot
summary: How this blog's GitHub Actions workflow mines activity, drafts posts with Claude, and publishes with zero human review.
tags:
    - github-actions
    - claude
    - automation
    - hugo
title: The pipeline that writes this blog
---

Ahnii!

This post is a little unusual: it was drafted by the same pipeline it describes. This blog runs a GitHub Actions workflow, [Content Autopilot](https://github.com/jonesrussell/blog/blob/main/.github/workflows/content-autopilot.yml), that mines project activity, curates it with [Claude Code](https://claude.com/product/claude-code) running headless in CI, writes a Hugo post, and publishes it to `main` without a human in the loop. This post covers how the throttle, the curation gate, and the publish flow fit together.

## The throttle: Buffer queue depth

Zero-touch pipelines need a rate limiter or they'll flood every channel the moment there's something to say. Instead of a fixed schedule, this one throttles on distribution capacity: Buffer's free tier caps a channel at 10 scheduled posts, so `scripts/buffer-queue-depth.mjs` checks each channel's queue depth before anything else runs.

```javascript
const CAP = Number(process.argv[2] || 9);
// ...
const near = hasNext || count >= CAP;
if (near) atCap = true;
```

If any channel is at or near the cap, the script exits non-zero and the workflow stops before spending a single Claude token. Quiet weeks produce less; weeks where Buffer drains fast produce more. The queue itself decides the pace.

## The gate: an LLM judging its own inputs

Once there's room to publish, the workflow pulls open `stage:mined` issues from a separate tracking repo — one issue per interesting thing that happened across other projects. Not every mined item is worth a post. A lot of them are per-directory scaffolding noise.

Rather than hand-curate, the workflow hands the candidate list to Claude with an explicit bar to clear:

```
STEP 1 - CURATE (be ruthless). Pick AT MOST ONE candidate that would make
a genuinely useful, self-contained post a reader would value. Reject thin
per-directory dev-scaffolding items (e.g. "packages/field work"). If
NOTHING clears that bar, write {"status":"NONE","reason":"..."} to
autopilot-result.json and STOP.
```

If nothing qualifies, the run ends with no post and no distribution. The gate is "good enough to publish," not "something to publish" — a distinction that matters once nobody is reading the draft before it goes live.

## Verify before you invent

The riskiest part of an unsupervised pipeline is a model confidently inventing a function signature or a config flag that doesn't exist. The prompt closes that door explicitly:

```
STEP 2 - VERIFY. If the post would contain code, config, or interface
signatures, verify each against the real source repo using:
gh api repos/<owner>/<repo>/contents/<path> (GH_TOKEN is set). If you
cannot verify a snippet, DO NOT invent it. Either write the post without
it, or if the post depends on it write
{"status":"HOLD","issue":N,"reason":"unverifiable code"} to
autopilot-result.json and STOP.
```

Claude reads the actual source file through the GitHub API before quoting it. If it can't verify something the post depends on, it holds rather than guesses. This is the same rule the project's `CLAUDE.md` already enforces for human-written posts — the autopilot just has to follow it without anyone checking its homework afterward.

## Build gate, then publish

Once Claude writes the post and a companion `docs/social/<slug>.md` file, the workflow runs `hugo --gc --minify`. If the build fails, the post never gets committed — a broken page bundle or bad frontmatter simply stops the run. Only after a clean build does the workflow commit, `git pull --rebase`, and push to `main`, which triggers the existing deploy workflow.

```yaml
- name: Build gate
  if: steps.result.outputs.status == 'PUBLISH'
  run: hugo --gc --minify

- name: Publish
  if: steps.result.outputs.status == 'PUBLISH' && github.event.inputs.dry_run != 'true'
  run: |
    git add "${{ steps.result.outputs.post_path }}" "${{ steps.result.outputs.social_path }}" data/autopilot-ledger.json
    git commit -m "content: autopilot publish ${{ steps.result.outputs.slug }} (queue #${{ steps.result.outputs.issue }})"
    git pull --rebase origin main
    git push origin main
```

A JSON ledger (`data/autopilot-ledger.json`) records which mined issue numbers have already been processed, so a rerun never republishes the same source.

## Distribute, then close the loop

The last step reads the same `docs/social/<slug>.md` file and queues one post per platform through Buffer's GraphQL API:

```javascript
// Parse "## Platform" sections out of the markdown.
const parsed = {};
for (const part of md.split(/^##[ \t]+/m).slice(1)) {
  const nl = part.indexOf("\n");
  const name = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase();
  parsed[name] = (nl === -1 ? "" : part.slice(nl + 1)).trim();
}
```

Each platform's body is queued with `createPost`, and Bluesky posts over 300 characters are rejected before they ever reach the API. The originating tracking issue is then closed, so the same idea can't get mined and drafted twice.

## What keeps it honest

Nothing here is exotic on its own — a cron trigger, an LLM call, a build step, a git push. What makes it safe to run unsupervised is that every stage can say no: the throttle can refuse to run, the curator can refuse to pick anything, the verifier can refuse to invent code, and the build gate can refuse a broken post. Zero-touch doesn't mean zero judgment; it means the judgment has to be encoded into the pipeline instead of applied by a person reading a draft.

Baamaapii
