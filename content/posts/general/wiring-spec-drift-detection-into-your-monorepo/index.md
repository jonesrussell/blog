---
categories:
    - devops
    - tools
date: 2026-03-18T00:00:00Z
devto_id: 3386569
draft: false
slug: wiring-spec-drift-detection-into-your-monorepo
summary: How to turn a spec drift detector from a script nobody runs into a hard gate across your task runner, git hooks, and CI pipeline.
tags:
    - monorepo
    - ci-cd
    - documentation
    - automation
title: Wiring Spec Drift Detection Into Your Monorepo
---

Ahnii!

This post walks through wiring a spec drift detector into three enforcement surfaces so stale documentation blocks merges instead of rotting silently.

## Prerequisites

- A monorepo with service directories mapped to spec files
- A drift detector script (bash) that exits non-zero on stale specs
- [Taskfile](https://taskfile.dev/) as your task runner
- [lefthook](https://github.com/evilmartians/lefthook) for git hooks
- GitHub Actions for CI

## The Problem With Unforced Specs

Every monorepo has documentation that maps services to specs. The mapping exists. The specs exist. Nobody checks if they're current.

You write a spec for the crawler service. Three months later, someone rewrites the fetcher logic. The spec still describes the old architecture. The next developer reads it, trusts it, and builds on wrong assumptions.

The fix isn't better specs. It's enforcement. If your drift detector only runs when someone remembers to run it, your specs will drift.

## What a Drift Detector Does

A drift detector compares git timestamps. For each service directory that changed in the last N commits, it checks whether the corresponding spec file was updated more recently than the service code. If the spec is older, it's stale.

Here's the core logic in bash:

```bash
spec_last_commit=$(git log -1 --format=%ct -- "$spec")
service_last_commit=$(git log -1 --format=%ct -- "$pattern")

if [ "$spec_last_commit" -lt "$service_last_commit" ]; then
  echo "  STALE: $spec"
  echo "    Fix: Review and update this spec to reflect recent service changes"
fi
```

The script maps file patterns to spec files using an associative array. `crawler/` maps to `docs/specs/content-acquisition.md`, `publisher/` maps to `docs/specs/content-routing.md`, and so on. It exits non-zero if any spec is stale.

That exit code is the key. It turns a reporting tool into a gate.

## Three Enforcement Surfaces

A single script, three places it runs. Each catches drift at a different point in the development cycle.

### Taskfile: First Step in CI Tasks

Add a dedicated task that wraps the detector:

```yaml
drift:check:
  desc: "Check for spec drift (stale specs vs recent service changes)"
  cmds:
    - tools/drift-detector.sh {{.CLI_ARGS | default "5"}}
```

Then wire it as the **first step** in your CI composite tasks:

```yaml
ci:
  cmds:
    - task: drift:check
    - task: lint
    - task: test
    - task: vuln
```

First position matters. Drift detection is fast (under a second). Linting and testing can take minutes. If specs are stale, you want to know immediately, not after waiting for the full pipeline to grind through.

Apply this to all CI variants. `ci:changed`, `ci:force`, whatever you have.

### lefthook: Pre-Push Hook

Add the check to your pre-push hook. Not pre-commit. The detector needs git history for timestamp comparisons, and you don't want it slowing down every commit.

```yaml
pre-push:
  parallel: true
  commands:
    spec-drift:
      run: tools/drift-detector.sh 5
```

Call the script directly rather than going through the task runner. Hooks should be fast and dependency-free.

When you push, the output looks like this:

```text
spec-drift ❯
=== Drift Detector ===
Checking last 5 commits for spec drift...

No specs affected by recent changes.

summary: (done in 0.09 seconds)
```

### GitHub Actions: Parallel CI Job

Add a standalone job that runs alongside lint, test, and vulnerability checks:

```yaml
spec-drift:
  name: Spec Drift Check
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Check spec drift
      run: tools/drift-detector.sh 20
```

Two details that matter here. `fetch-depth: 0` gives the detector full git history for accurate timestamp comparisons. A shallow clone breaks the `git log` calls. The commit count is 20 instead of 5 because CI covers the full scope of a PR, not just local changes.

No `needs:` dependency on other jobs. The spec drift check runs in parallel with everything else, keeping your pipeline's critical path unchanged. It gates merges through branch protection required status checks.

## Better Output for Better Compliance

The original detector output looked like this:

```text
WARNING: docs/specs/content-acquisition.md may be stale (service code updated more recently)
```

That tells you something is wrong but not what to do about it. Developers skim CI output. Vague warnings get ignored.

The improved output:

```text
STALE: docs/specs/content-acquisition.md
  Fix: Review and update this spec to reflect recent service changes
  Changed files:
    render-worker/Dockerfile
```

Three improvements: `STALE` is a clearer status than `WARNING`. The `Fix:` line tells you exactly what to do. The `Changed files:` section shows which files triggered the alert so you know what changed.

The summary line also got more direct:

```text
1 spec(s) need review. Update specs before merging.
```

## Document the Drift Check for Your Team

Update your project's developer docs in three places. Future contributors (and future AI sessions) need to know the gate exists.

In the commands reference:

> `task drift:check` checks for stale specs. Runs as first step of CI tasks.

In the pre-flight checklist:

> Run `task drift:check`. If a spec is STALE, update it before or alongside your code changes.

In the git hooks section:

> pre-push runs `spec-drift` (drift-detector check)

## How the Three Enforcement Layers Work Together

Here's how the enforcement surfaces layer:

1. **Local development**: `task ci:changed` runs drift check first, before lint and test
2. **Pre-push**: lefthook runs the detector, blocking push if specs are stale
3. **CI**: GitHub Actions job runs in parallel, blocking merge via branch protection

A developer with stale specs hits the gate at every level. The earliest catch is `task drift:check` during local development. The latest is the CI job blocking a merge. No gap in enforcement means no gap in spec freshness.

The entire setup took one commit across five files. The detector already existed. Wiring it in was the easy part.

The hard part was not having done it sooner.

Baamaapii
