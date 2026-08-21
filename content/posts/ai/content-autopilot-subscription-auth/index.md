---
categories:
    - ai
date: 2026-08-21T00:00:00Z
devto_id: 4457207
draft: false
slug: content-autopilot-subscription-auth
summary: How this blog's unsupervised publishing pipeline moved off pay-per-token API credit, survived a silent auth revocation, and added a deterministic gate so an unreviewed draft can't ship as slop.
tags:
    - claude
    - github-actions
    - automation
    - hugo
title: Running the blog's content autopilot on a Claude subscription, not API credit
---

Ahnii!

{{< relref "content-autopilot" >}} covers how this blog's [Content Autopilot](https://github.com/jonesrussell/blog/blob/main/.github/workflows/content-autopilot.yml) workflow mines, curates, and publishes without a human reading the draft first. Three things broke or needed hardening after that pipeline went live: how it pays for Claude, why the auth silently died, and the two gates bolted on afterward to catch a bad draft before it ships.

## Switching off pay-per-token API credit

The produce step originally authenticated with `ANTHROPIC_API_KEY`, a pay-as-you-go API account billed per token. That account ran dry, and the daily cron started failing on the very first Claude call. Swapping to `CLAUDE_CODE_OAUTH_TOKEN` fixed it in one line: this env var runs the headless CLI against a Claude subscription instead.

```yaml
env:
  # Subscription auth (no per-token API billing). See CLAUDE_CODE_OAUTH_TOKEN secret.
  CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
```

`claude setup-token` mints this token locally. It's a short-lived credential meant for one CLI session, not a service account, and that mismatch is exactly what caused the next failure.

## A revoked token, four silent failures

Subscription tokens rotate. This one got revoked, and the workflow had no step watching for a `failure()` outcome. Four daily runs failed in a row before anyone noticed, because a cron job with no output channel just... stops. Nobody was checking the Actions tab every morning.

The fix wasn't a longer-lived token. It was making failure loud:

```yaml
- name: Alert on failure
  if: failure()
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    REPO: ${{ github.repository }}
    RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  run: |
    gh label create autopilot-failure --repo "$REPO" --color d73a4a \
      --description "Content Autopilot run failed" 2>/dev/null || true
    body=$(printf 'Content Autopilot run failed: %s\n\nMost common cause: CLAUDE_CODE_OAUTH_TOKEN expired or was revoked (subscription tokens rotate). Re-sync the secret from a fresh token, or run `claude setup-token` for a long-lived one.\n\n@jonesrussell' "$RUN_URL")
    existing=$(gh issue list --repo "$REPO" --label autopilot-failure --state open --json number --jq '.[0].number // empty')
    if [ -n "$existing" ]; then
      gh issue comment "$existing" --repo "$REPO" --body "$body"
    else
      gh issue create --repo "$REPO" --title "Content Autopilot is failing" \
        --label autopilot-failure --body "$body"
    fi
```

This runs on any step failure in the job, not just the auth step. It opens one issue, reuses it on repeat failures instead of spamming a new one per day, and GitHub's default notification settings turn that issue into an email. The `permissions` block needed `issues: write` added alongside the existing `contents: write` and `id-token: write` for this to work.

## Self-Refine: one critique pass before publish

Auth failures are loud and easy to fix. A boring, over-hedged, cliche-riddled post is a quieter failure, and nothing upstream of publish was checking for it. The next addition borrows the Self-Refine technique from the AI-writing research: have the model critique its own output once, then revise, before anything ships.

```
Critique and then revise the blog post at <path> and its social copy.
Rubric: (1) voice matches docs/blog-style.md and the essay reference;
(2) every claim is backed by a concrete fact, number, or reference;
(3) sentence lengths vary (no runs of same-length sentences);
(4) zero phrases from the site's banned AI-cliche list;
(5) intro scope line is not the phrase 'This post covers'.
```

The step is `continue-on-error: true`. If the critique call itself fails or times out, the workflow falls back to publishing the un-refined first draft rather than blocking the whole run over a quality pass.

## The slop gate: a linter, not a model

A revise pass helps, but it's still the same model marking its own homework. The step after it is deliberately dumb: `scripts/slop-check.mjs` runs no API call at all. It strips frontmatter, code fences, and markdown syntax, splits what's left into sentences, and scores three signals.

```javascript
const mean = totalWords / lens.length;
const variance = lens.reduce((a, n) => a + (n - mean) ** 2, 0) / lens.length;
const stdev = Math.sqrt(variance);
const burstiness = stdev / mean; // human ~0.6-1.2, AI slop < 0.4
```

Human writing varies sentence length a lot; AI writing tends to cluster around one length. The script also counts em dashes per thousand words (over 20 reads as machine-written) and matches a growing list of stock corporate-blog phrases pulled straight from the site's own style guide. It fails the draft on a hard burstiness floor of 0.32. Three or more banned-phrase hits alone are enough too, and so is any two of the three signals firing together. A failed check holds the draft: nothing gets committed, and the source issue stays open for the next day's run to try again.

Build order matters here. The slop gate runs before the Hugo build gate, so a flagged draft never even reaches `hugo --gc --minify`, let alone `git push`.

## What actually changed

Two posts have shipped through this pipeline since it went live, tracked by issue number in `data/autopilot-ledger.json`. None of the hardening above came from planning ahead. Each piece exists because a specific run failed in a specific way: out-of-balance API credit, then a revoked token nobody caught, then no evidence-based reason to trust an unreviewed draft's prose. Unsupervised doesn't mean untested. It means every failure mode has to turn into a gate before the same thing is allowed to happen twice.

Baamaapii
