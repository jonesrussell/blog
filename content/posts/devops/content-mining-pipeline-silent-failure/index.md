---
categories:
    - devops
date: 2026-09-02T00:00:00Z
devto_id: 4565370
draft: false
slug: content-mining-pipeline-silent-failure
summary: A missing npm ci let schema validation crash on every mined candidate, filing zero content-queue issues for a week — the fix layers a loud fail-open guard over the actual root-cause patch.
tags:
    - github-actions
    - automation
    - bash
    - ci
title: A missing npm ci silently starved the content-mining pipeline for a week
---

Ahnii!

Earlier posts covered [building]({{< relref "automated-content-pipeline-github-actions" >}}) and [refining]({{< relref "refining-content-pipeline-github-actions" >}}) the automated content pipeline: a scheduled job scans recent commits, groups them by theme, and files GitHub issues as raw material for future posts. Every mined candidate gets validated against a JSON schema before the workflow files an issue for it — that's the guardrail that keeps malformed seeds out of the queue. For about a week, that guardrail silently dropped every candidate instead of filing a single one.

## What Broke

The mining script, `scripts/mine-git-activity.sh`, builds a seed for each commit group and validates it with `schemas/validate.js`, which loads the [ajv](https://ajv.js.org/) JSON Schema validator:

```js
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
```

`ajv` and `ajv-formats` are `devDependencies` in `package.json`, so they only exist after `npm ci` runs. The `content-mine.yml` workflow checked out the blog repo and ran the mining script directly — it never installed Node dependencies first. Every call to the validator hit `Cannot find module 'ajv'` and exited non-zero.

The script treated that crash the same as a real validation failure: reject the candidate, move on. No error surfaced anywhere. The workflow itself finished green, because the script's own exit code was still `0` — it just never filed anything. Net result: **zero issues created, for about a week**, and nothing in the logs said so unless you went looking.

## Fix 1: Fail Open, Warn Loud

The first patch, in the blog repo, doesn't wait for CI to be fixed — it makes the script defend itself. Before validating anything, it checks whether the validator's dependencies actually resolve:

```bash
VALIDATOR_OK=1
if ! node -e "require('ajv'); require('ajv-formats')" >/dev/null 2>&1; then
  echo "WARN: schema-validator deps (ajv) not installed — creating issues WITHOUT seed validation. Add 'npm ci' to the mining workflow to restore validation." >&2
  VALIDATOR_OK=0
fi
```

Downstream, the validation gate becomes an *or*: skip validation and file the issue anyway if the deps aren't there, instead of letting the crash masquerade as "this candidate is invalid":

```bash
if [[ "$VALIDATOR_OK" == "0" ]] || $VALIDATOR mined-seed "$SEED_FILE" > /dev/null 2>&1; then
  # ...build and create the issue...
```

That's a deliberate trade: an unvalidated issue is a minor cleanup problem for a human curator. A silently starved queue is a week of lost content ideas nobody knew to chase. Given the choice, fail open and be loud about it.

## Fix 2: Actually Install the Dependency

The warning fixes the symptom. The root cause was still the missing install step, patched separately in the `content-mine.yml` workflow (in `jonesrussell/jonesrussell`, the repo that owns the queue):

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 'lts/*'
    cache: 'npm'

- name: Install dependencies (ajv for seed validation)
  run: npm ci
```

With that in place, validation runs for real again — the fail-open guard in fix 1 becomes a safety net for the next unrelated dependency gap, not a permanent workaround for this one.

## What Changed, at a Glance

| | Before | After |
| --- | --- | --- |
| Missing `ajv` | Validator crashes, treated as "invalid," issue silently dropped | Absence detected up front, logs a `WARN`, issue still filed |
| Node deps in CI | Never installed | `actions/setup-node` + `npm ci` before the script runs |
| Failure visibility | None — 0 issues/week, workflow exits `0` | Explicit warning line in job logs |

## The Lesson

A script that "succeeds" by doing nothing is worse than one that fails loudly, because nothing pages you for it. The mining workflow's exit code was never wrong; it was just measuring the wrong thing. The mining job [runs daily]({{< relref "automated-content-pipeline-github-actions" >}}), so this wasn't one bad run — it was seven straight silent failures before the empty queue was noticeable on its own. Exit code isn't the metric that would have caught it. Throughput is: issues filed per run, checked against zero. That's the check I was missing.

Baamaapii
