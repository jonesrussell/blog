---
title: "Hardening a manual Claude Code review workflow in GitHub Actions"
date: 2026-09-01
categories: [devops]
tags: [github-actions, claude-code, ci, security]
summary: "How a human-triggered '@claude review' workflow got locked down to read-only, bounded-diff, revision-verified reviews after the official tag-mode example turned out to be implementation-capable by default."
slug: "hardening-claude-code-review-workflow-github-actions"
draft: false
---

Ahnii!

[goformx](https://github.com/goformx/goformx) uses a mixed-provider workflow: Codex writes some pull requests, Claude writes others, and each gets reviewed by the other provider on request. The Claude side runs on the official [Claude Code Action](https://github.com/anthropics/claude-code-action), triggered by a maintainer commenting `@claude review` on a PR. That sounds simple to wire up. It wasn't safe to wire up as-is, because the action's default "tag mode" is built for implementation, not read-only review — three gaps in the default, five fixes to close them.

## Why the Default Example Wasn't Enough

The action ships an official [progress-tracked review example](https://github.com/anthropics/claude-code-action/blob/a874e9ecd7bb36efdad65429c6b35815f5a08f10/examples/pr-review-comprehensive.yml) that auto-triggers on every PR event and posts a tracked comment. It's a good starting point, but three things about tag mode don't fit a review-only job:

- **Tag mode is implementation-capable by default.** It's designed for "@claude fix this," not "@claude look but don't touch."
- **GitHub Actions expression matching is case-insensitive.** An `if:` condition comparing a comment body to `@claude review` will also match `@Claude Review`, `@CLAUDE REVIEW`, and anything else GitHub considers equal — not the exact trigger you intended.
- **Tool permissions in the SDK accumulate, they don't replace.** Passing a restricted tool list doesn't override the mode's defaults; both apply, so an allow-list alone can't get you to read-only.

The workflow adapts the official example at a pinned action revision, keeps the manual-only trigger and subscription auth, and layers on the following fixes.

## Fix 1: Enforce the Exact Trigger

The outer `if:` on the job is a first, cheap filter, but because Actions expressions are case-insensitive it can't be the whole check. A trusted `actions/github-script` preflight step re-validates everything in JavaScript before any model call happens:

```js
const comment = context.payload.comment;
if (!context.payload.issue?.pull_request || comment?.body !== '@claude review' ||
    comment.user?.login !== 'jonesrussell' || comment.user?.type !== 'User' ||
    context.actor !== 'jonesrussell') {
  core.setFailed('An exact human maintainer review request is required.');
  return;
}
```

This rejects extra text, trailing newlines, wrong casing, bot comments, and anyone who isn't the maintainer — all before the job spends a single turn talking to Claude. It also checks that the PR is still open, and records `head_sha`/`base_sha` for later verification.

## Fix 2: Bound the Diff, Fail Closed

Tag mode's native changed-file context is a file list, not a diff — Claude would have to reconstruct the actual changes from scratch. Instead, a setup step downloads the real diff to runner-temp storage with a hard size cap:

```js
const {data: diff} = await github.rest.pulls.get({
  ...context.repo, pull_number: context.issue.number, mediaType: {format: 'diff'}
});
if (typeof diff !== 'string' || !diff.trim() || Buffer.byteLength(diff, 'utf8') > 1048576) {
  throw new Error('Review diff is missing, invalid or exceeds the 1 MiB review bound.');
}
require('node:fs').writeFileSync(diffPath, diff, {mode: 0o600, flag: 'wx'});
```

Missing, empty, or oversized diffs fail the job before Claude ever runs. The cap is **1 MiB**; there's no silent fallback to a partial or truncated review.

## Fix 3: Deny Tools Instead of Just Allowing Them

The SDK's argument parser accumulates `allowedTools` rather than replacing the mode defaults, so the workflow can't rely on an allow-list alone. It sets the permission mode explicitly, restricts built-in tools to **Read, Glob, Grep**, and layers an explicit deny list on top:

```yaml
claude_args: >-
  --max-turns 16
  --permission-mode default
  --setting-sources user
  --strict-mcp-config
  --tools "Read,Glob,Grep"
  --disallowedTools "Bash,Edit,Write,NotebookEdit,Agent,Task,mcp__github_ci__*,mcp__github_file_ops__*"
```

Some of those denials cover capabilities that aren't even enabled at the pinned action revision. That's deliberate — defense against future defaults changing underneath the pin.

## Fix 4: Keep Git Metadata Off Limits

Tag mode checks out the PR head and stores its short-lived job token in `.git/config`. A review agent with unrestricted `Read` could read that token straight out of the checkout. The workflow denies it explicitly in the action's settings:

```json
{"disableAllHooks":true,"permissions":{"deny":["Read(./.git)","Read(./.git/**)"]}}
```

Denying reads to `.git` also blocks `Grep`/`Glob` from searching that directory, and hooks are disabled entirely so only user settings and the action's own MCP configuration load.

## Fix 5: Catch Stale or Unverified Reviews

A successful job run isn't proof the review still applies. If the PR gets pushed to while Claude is reviewing it, the findings could describe a revision that no longer exists. A final step re-checks the PR's current `head_sha`/`base_sha` against what the preflight recorded, and confirms the local checkout matches too:

```js
const checkedHead = require('node:child_process').execFileSync(
  'git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}
).trim();
if (pr.state === 'open' && pr.head.sha === process.env.REVIEW_HEAD &&
    pr.base.sha === process.env.REVIEW_BASE && checkedHead === process.env.REVIEW_HEAD) return;
```

If any of those checks fail, the workflow posts a comment marking the review **STALE or UNVERIFIED** with a link to the run, and fails the job. That comment matters as much as the review itself — without it, a stale finding just sits there looking authoritative.

## What Changed, at a Glance

| Risk | Default tag mode | Hardened workflow |
| --- | --- | --- |
| Trigger matching | Case-insensitive `if:` only | JS preflight enforces exact comment, author, PR state |
| Diff visibility | File list only | Downloaded diff, 1 MiB bound, fails closed |
| Tool access | Implementation-capable | `Read,Glob,Grep` only, explicit deny list |
| Git metadata | Job token readable in `.git/config` | `Read` denied for `.git` and its contents |
| Stale results | Not checked | Head/base/checkout re-verified, STALE comment on mismatch |

## Testing Without Spending a Turn

The workflow's own tests don't call the model at all. A separate CI job runs mocked-response tests against the preflight and revision-check logic, plus [actionlint](https://github.com/rhysd/actionlint) against both workflow files:

```bash
node --test .github/scripts/manual-review.test.cjs
go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -shellcheck= -pyflakes= \
  .github/workflows/manual-claude-review.yml .github/workflows/manual-review-tests.yml
```

That proves the guardrails and workflow syntax are correct. It doesn't prove the provider's runtime tool enforcement — a live `@claude review` request against an authorized PR is still the only way to confirm end to end that the final comment gets posted and failures are reported correctly.

## Budget Stays Bounded Too

The job itself is capped three ways: **16 turns**, an **8-minute** limit on the review step, and a **20-minute** ceiling on the whole job. Auth comes from a `CLAUDE_CODE_OAUTH_TOKEN` repository secret tied to a Claude Max subscription. There's no API-key fallback, so a misconfigured secret fails the preflight instead of silently billing somewhere else.

None of this is exotic. It's the same instinct as any other CI hardening: don't trust a string comparison you haven't tested for case sensitivity, don't hand out more filesystem access than the job needs, and don't let a slow job's output outlive the code it described.

Baamaapii
