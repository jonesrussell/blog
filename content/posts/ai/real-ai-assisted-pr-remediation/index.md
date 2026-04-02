---
categories:
    - ai
date: 2026-04-02T00:00:00Z
devto_id: 3446271
draft: false
slug: real-ai-assisted-pr-remediation
summary: PR
tags:
    - ai
    - workflow
    - governance
    - building-in-public
    - waaseyaa
title: What a real AI-assisted PR looks like
---

Ahnii!

A lot of AI coding content ends too early.

The model writes a patch. The patch looks plausible. A few tests pass. Someone posts a screenshot and calls it proof.

That is not the part I care about.

What I want to know is whether an AI-assisted change can survive the whole engineering process: audit, review, CI, static analysis, contract repair, docs drift, and merge.

PR [#1022](https://github.com/waaseyaa/framework/pull/1022) was the first pull request in [Waaseyaa](https://github.com/waaseyaa/framework) where that full chain played out end to end.

## The Invariant

The bug looked small: pipeline navigation in the admin SPA was non-deterministic.

Whether the pipeline link showed up depended on whether a mount-time request happened to succeed. If a `board-config` request failed for incidental reasons, the UI could act like the entity type had no pipeline at all.

That is not just a UI bug. That is a contract problem.

The invariant was simple:

> Pipeline navigation visibility must be a pure function of `runtime.catalog` actions.

If the catalog entry declares `board-config`, show pipeline navigation. If it does not, do not. Request failures do not get to define capability truth.

## The Workflow

The first step was not refactoring. It was audit.

I had the model inspect only the affected surfaces, identify exactly where visibility depended on incidental request failure, state the minimal deterministic invariant, and identify the contract boundary that had to be restored.

That exposed the real issue quickly: the problem was not only in the component. The admin runtime was also dropping `actions` when it built the runtime catalog. Once that contract data disappeared, the UI fell back to probing with `runAction()`.

After that, the first patch was straightforward:

- remove mount-time probing from `NavBuilder.vue`
- preserve `actions` in the runtime catalog
- add tests proving visibility comes from declared catalog actions

If this were a typical AI coding story, that would have been the end.

It was not.

## Where The PR Got Interesting

Review found another component, `EntityViewNav.vue`, still violating the same invariant. So the first fix was only partial.

Then CI started surfacing deeper inconsistencies:

- `nuxi typecheck` exposed an admin catalog type surface that no longer matched runtime reality
- `build:contracts` failed because the admin contract build crossed a package boundary it should not have crossed
- PHPStan failed on a dispatcher contract mismatch elsewhere in the repo
- spec drift failed because the architecture docs now lagged behind the code

This is the part I think people miss about AI-assisted development.

The value is not that the model gets you to the first patch faster. The value is whether you can keep following the consequences after that patch lands.

A serious workflow does not treat those as annoying side failures. It treats them as the remediation chain.

## What Merged

By the time PR #1022 merged, it had gone through:

- invariant audit
- deterministic refactor plan
- initial implementation
- review-discovered residual drift
- follow-up invariant enforcement
- runtime contract restoration
- type-surface repair
- contract build repair
- PHPStan repair
- spec drift repair
- merge

That is why this PR matters to me.

It is the first one in this workflow that exercised the whole model instead of just one slice of it.

The model is not “AI writes code and I tidy it up.”

The model is:

- define the invariant
- constrain the agent to the governed surface
- audit before refactor
- keep the refactor minimal
- review adversarially for drift
- treat CI failures as evidence
- repair every broken surface the change exposes
- merge only when the whole chain is green

## What I’m Learning

The biggest lesson is that the first answer is rarely the interesting one.

The interesting part is whether the system can keep reasoning correctly after the easy fix is in. Can it preserve the invariant through review? Can it repair the contract without weakening it? Can it follow the consequences into docs and verification instead of pretending those are separate tasks?

That is where trust gets built.

AI is awesome. More awesome than a lot of people realize. But not because it can one-shot production code from a prompt.

It is awesome when you put it inside a disciplined engineering model and it helps you push a real change all the way through the system without losing the thread.

That is what I am trying to build in public right now.

Not a demo.

An operating model.

Baamaapii
