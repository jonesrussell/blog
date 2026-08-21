---
categories:
    - ai
date: 2026-08-21T00:00:00Z
devto: true
devto_id: 4449474
draft: false
slug: ai-assisted-day-two-months
summary: A 36-hour window where an autonomous session opened a stack of PRs and the rest of the time went to landing them cleanly.
tags:
    - ai-assisted-development
    - build-in-public
    - waaseyaa
    - engineering-velocity
title: "Two months of senior engineering in 36 AI-assisted hours"
---

Ahnii!

Over roughly **36 hours**, a large, interconnected set of Waaseyaa Framework and Sheg work went from nothing to a clean landing sequence. The interesting part is how the time split, and what it would have cost the conventional way.

## Two phases, not one

The window had two distinct halves:

- **~10 hours of generation.** An autonomous ChatGPT session pursued a goal and opened a stack of pull requests across both the Framework and Sheg. That stack *was* the backlog. It did not exist beforehand.
- **~26 hours of integration.** The rest went to merging, rebasing, and repairing that stack into a moving `main`, plus the defects that only surface when you land code instead of just writing it.

So this is not a story about inheriting a mess and cleaning it up. The same window created the work and landed it.

## What landed

**14 pull requests merged** — twelve in the Framework, two in Sheg.

The Framework twelve covered:

- SQLite schema authority and migration safety
- Admin Surface serialization and filtered destinations
- Safe embed lifecycle and workflow transitions
- Save-advisory contracts and acknowledgements
- Entity revision recovery and authorization
- Canonical sitemap URLs
- Upgrade deadlock and timeout protection

The two Sheg PRs hardened **secure local-acceptance diagnostics** and fixed a **Python test-wrapper that was reporting the wrong outcome**.

## The defects the merge count hides

Merges are the visible number. The real work was the defects that survived their own original implementations and only surfaced on the second pass:

- Duplicate embed protocol messages
- Missing workflow refresh signals
- A historical-revision **authorization gap** and a restore-field **authorization bypass**
- Advisory exceptions leaking across abstraction layers
- Swallowed acceptance-test failures, a green check on a red result
- A Composer subprocess deadlocking on a pipe
- Unsafe candidate-build caching

Each was wired shut with regression, integration, and transport coverage so it stays shut. Underneath it all sits a **358-site SQLite coupling inventory across 108 files**, the real map of what PostgreSQL and MySQL support will cost.

## What did not happen

No tag. No package release. No deployment. No production mutation.

The release line held on purpose. The coordinated Framework and Sheg candidates wait until the CI lane and the advisory integration are finished. Anokii got compatibility and installation-contract testing but no direct change: protected, not touched.

## The conventional estimate

Hand this to one experienced senior developer, generation and integration both:

- **Best estimate:** about **8 full-time weeks**
- **Range:** **6 to 10 weeks**
- **Effort:** roughly **240 to 400 hours**, midpoint around **320**

Two seniors might compress the calendar to three to five weeks, but the total labor barely moves.

So the comparison is not 36 hours against building from scratch. It is one coordinated AI-assisted window against roughly two months of conventional senior engineering: generation, review, remediation, rebasing, testing, integration, and merge governance.

Baamaapii
