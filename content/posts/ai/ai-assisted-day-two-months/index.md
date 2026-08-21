---
categories:
    - ai
date: 2026-08-21T00:00:00Z
devto: true
devto_id: 4449474
draft: false
slug: ai-assisted-day-two-months
summary: A single coordinated day moved 14 pull requests, a 358-site audit, and a pile of latent defects — roughly two months of conventional senior work.
tags:
    - ai-assisted-development
    - build-in-public
    - waaseyaa
    - engineering-velocity
title: One AI-assisted day, two months of senior engineering
---

Ahnii!

In about 24 hours, a stacked backlog of conflicting and half-validated pull requests across the Waaseyaa Framework and Sheg turned into a clean landing sequence. This is the receipt, and the honest comparison to how long it takes a person.

## What actually landed

Fourteen pull requests merged: twelve in the Framework, two in Sheg.

The Framework dozen was not cosmetic. SQLite schema authority and migration safety. Admin Surface serialization and filtered destinations. Safe embed lifecycle and workflow transitions. Save-advisory contracts. Entity revision recovery and authorization. Canonical sitemap URLs. Upgrade deadlock and timeout protection. The two Sheg merges hardened local-acceptance diagnostics and fixed a Python test-wrapper that was reporting the wrong outcome.

Every one of those landed on a `main` that kept moving, which meant rebasing and repairing stacked branches as they went.

## The part the merge count hides

Merges are the visible number. The real work was the defects that survived their own original implementations and only surfaced on the second pass.

I caught duplicate embed protocol messages, missing workflow refresh signals, and two authorization holes that mattered: a historical-revision gap and a restore-field bypass. Advisory exceptions were leaking across abstraction layers. Acceptance-test failures were being swallowed — a green check on a red result, the worst kind. A Composer subprocess was deadlocking on a pipe. The candidate-build cache was unsafe.

None of these were in the "write the feature" budget. They are the tax you only pay when someone reviews the work adversarially instead of rubber-stamping it, and each one was wired shut with regression, integration, and transport coverage so it stays shut.

Underneath all of it: a 358-site SQLite coupling inventory across 108 files. That is the real map of what PostgreSQL and MySQL support will cost, and it did not exist before.

## What I chose not to do

No tag. No package release. No deployment. No production mutation.

I held the release line on purpose. Velocity is only worth anything if it does not quietly ship a bad alpha, so the coordinated Framework and Sheg candidates wait until the CI lane and the advisory integration are finished. Anokii got compatibility and installation-contract testing but no direct change — it was protected, not touched.

## The comparison, owned

Hand this work to one experienced senior developer at the same starting point and carry it through the same PRs. My estimate:

- **Best estimate:** about **8 full-time weeks**
- **Range:** **6 to 10 weeks**
- **Effort:** roughly **240 to 400 hours**, midpoint around **320**

Two seniors might compress the calendar to three to five weeks, but the total labor barely moves.

So the comparison is not 24 hours versus building everything from scratch. It is one AI-assisted day against roughly two months of conventional senior engineering: review, remediation, rebasing, testing, integration, documentation, and merge governance, compressed into a single execution window.

The receipts are above. That is the claim.

Baamaapii
