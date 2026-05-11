---
categories:
    - ai
date: 2026-05-11T00:00:00Z
devto_id: 3651352
draft: false
slug: spec-kitty-mission-lifecycle
summary: 'What a full Spec Kitty mission actually looks like end to end: spec, plan, tasks, implement, review, merge.'
tags:
    - spec-kitty
    - giiken
    - waaseyaa
    - ai
title: 'Spec Kitty mission lifecycle: a domain modeling pass through Giiken'
---

Ahnii!

A lot of agent frameworks promise "end to end" workflows. Most of them stop at "generate a plan and hope." Spec Kitty is different. It runs a real mission through a state machine, with artifacts on disk and gates between phases. This post walks one of those missions, `giiken-domain-modeling-01KR2HKT`, from spec to merge.

> **Context:** Giiken is the community knowledge service built on Waaseyaa. The mission did discovery and docs for its domain model. Real commit: [`waaseyaa/giiken@5b2328b`](https://github.com/waaseyaa/giiken/commit/5b2328bf330b73bc1d999999bcc7cae02e2b1b6f).

## What "a mission" actually is

A Spec Kitty mission is a directory under `kitty-specs/`, named with a slug and an ULID. After this mission landed, that directory looked like this:

```
kitty-specs/giiken-domain-modeling-01KR2HKT/
  spec.md
  plan.md
  research.md
  data-model.md
  meta.json
  status.json
  status.events.jsonl
  mission-events.jsonl
  checklists/
    requirements.md
  research/
    evidence-log.csv
    source-register.csv
```

That is not a generated artifact dump. Each file has a role in the state machine. `spec.md` is the contract. `plan.md` is the chosen approach. `research.md` plus the CSVs are the evidence trail. `status.json` and the two `.jsonl` files are the lane state and the audit log. The checklist is a hard gate, not a suggestion.

## The phases

The mission moved through these phases. Each one writes an artifact and emits a status event.

1. **Specify.** Compile a `spec.md` from the mission brief. Requirements get checklisted. Ambiguity gets surfaced before code touches the repo.
2. **Plan.** Choose an approach in `plan.md`. Inputs from spec. Output is the shape of the work.
3. **Tasks.** Break the plan into work packages (WPs). Each WP is independent enough to assign and review on its own.
4. **Implement.** Each WP runs through implement and review until approved. State transitions go through the orchestrator, not by hand.
5. **Review.** Per WP, against the spec. Reviewers can reject with structured feedback.
6. **Merge.** Once every WP is approved, the mission squash-merges and the events log records the terminal state.

The thing that makes this different from a long prompt is that every transition is gated. You can't move a WP to `approved` without a passing review. You can't merge with WPs still in flight. The agent is constrained to the shape of the state machine.

## What this mission actually produced

Beyond the kitty-specs directory, the merge commit added two architecture documents to the Giiken repo:

- `docs/architecture/domain-model.md`
- `docs/architecture/lifecycle.md`

And the implementation work in WP01 and WP02 left the data model migration-aligned, with PHPUnit and Vitest both green at merge time. Thirteen files in one squash commit, all traceable back to the spec.

The point is the trail. A reader six months from now can open `kitty-specs/giiken-domain-modeling-01KR2HKT/` and see: what was asked for, what was chosen, what evidence informed it, what got built, and which checks passed. That is a working memory you can hand to the next agent or the next human.

## Why this matters more than the output

The output of this mission is fine. Useful, even. But the output is replaceable. The trail is not.

If you have been around agent workflows for any length of time, you know the failure mode: an AI session ends, the context evaporates, and the next session has to reconstruct everything from the code. Spec Kitty inverts that. The mission directory **is** the persistent context. The next agent picks up the spec and the checklist, not a chat log.

That is the lifecycle proof: not "an agent shipped code," but "an agent moved through a structured workflow that another agent or human can audit, resume, or extend."

## Try it

If you want to see one of these missions in your own repo, the easiest path is to install Spec Kitty and run `spec-kitty next --agent <name>` on a small scope. Pick something with a clear question, not a vague refactor. Discovery missions like this one are a good first try.

The commit for the mission described here is [`waaseyaa/giiken@5b2328b`](https://github.com/waaseyaa/giiken/commit/5b2328b). The full mission directory is in that repo at `kitty-specs/giiken-domain-modeling-01KR2HKT/`.

Baamaapii
