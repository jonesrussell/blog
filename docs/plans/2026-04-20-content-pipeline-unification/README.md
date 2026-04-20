# Content Pipeline Unification — Operator Plan

Initiative: unify all content intakes and outputs around a single universal
envelope (NC-owned) and a single consumer issue shape (blog-owned). Multi-session
effort spanning the blog repo and the north-cloud monorepo.

This directory is the operator surface for the initiative. It is not the
implementation. It is how a future Claude Code or Cowork session (or you)
picks up the work, runs one workstream, and hands off cleanly.

## Directory map

| File | Purpose |
|---|---|
| `00-overview.md` | Goal, scope, success criteria, definition of done |
| `01-adr-universal-consumer-split.md` | The architectural decision record |
| `02-contracts.md` | NC envelope + blog issue shape + wire format + gap list |
| `03-sequencing.md` | Dependency graph, parallelization, deferred items |
| `04-risks.md` | Risk register with mitigations |
| `workstreams/W*.md` | One doc per workstream with a self-contained kickoff prompt |
| `status.json` | Machine-readable state (source of truth) |
| `status.js` | Regenerated from status.json for the dashboard |
| `dashboard.html` | Offline operator dashboard (opens from `file://`) |

## How to run a workstream

1. Open `dashboard.html` in a browser. Filter to a workstream with status
   `not-started` whose dependencies are `done`.
2. Click "Copy kickoff prompt" on a task inside it.
3. Start a fresh CC or Cowork session in `~/dev/blog` and paste the prompt.
4. When the session finishes, edit `status.json` to reflect new state
   (status, assigned_session, updated_at, last_updated).
5. Regenerate `status.js` (see below).
6. Commit the planning-directory update on this branch or merge into `main` per
   your workflow. Implementation work lands on its own branches in the
   relevant repos, not on the planning branch.

## Regenerate status.js

`status.json` is the source of truth. `status.js` is a shim that exposes it to
the dashboard from `file://`, where `fetch()` is blocked. Regenerate whenever
`status.json` changes:

```bash
cd ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification
echo "window.STATUS = $(cat status.json); window.STATUS_GENERATED_AT = \"$(date -Iseconds)\";" > status.js
```

The dashboard prints a visible warning banner if `status.js`'s
`STATUS_GENERATED_AT` is older than `status.json`'s `initiative.last_updated`,
so drift is visible at a glance.

## Rules for future sessions

- Blog is the driver. Plan lives under `~/dev/blog/docs/plans/`. Implementation
  spans repos by reference.
- Each workstream's kickoff prompt is self-contained. Do not modify another
  workstream from inside one session.
- Every session starts with `git pull origin main` on every referenced repo.
- Every session ends with a `status.json` update and `status.js` regeneration.
- If a workstream needs scope change, edit the plan first, then execute.
  Do not expand scope silently.
- Deferred items (see `03-sequencing.md`) stay deferred unless a new consumer
  triggers promotion. Re-litigating deferral is not a v1 task.
