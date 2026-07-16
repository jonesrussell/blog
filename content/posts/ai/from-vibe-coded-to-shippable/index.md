---
categories:
    - ai
date: 2026-06-02T00:00:00Z
devto_id: 4160839
draft: false
slug: from-vibe-coded-to-shippable
summary: Six moves that take a vibe-coded prototype to a state where it can be run, debugged, and handed off.
tags:
    - vibe-coding
    - ai-assisted-dev
    - prototyping
    - spec-driven
title: 'From vibe-coded to shippable: a playbook'
---

Ahnii!

There's a lot of energy right now spent bashing vibe coding. I think most of it is aimed at the wrong target. The MVP you stand up with AI doesn't have to generalize. That's not what it was for. The interesting craft is what you do *next* to take that prototype from "it works on my laptop" to something a stranger can run, debug, and trust. That's a craft worth respecting. This post is the playbook I'm currently running on a real public repo, with six specific moves and an artifact for each.

## The wrong fight

The bashing usually goes like this: "Look at this AI-generated MVP, look at how brittle it is, look at how much it cost in tokens to get it half-right." Sure. Now compare it to the alternative: an empty directory and a developer who hasn't started. The point of the prototype isn't to be production code. The point of the prototype is to find out whether the idea works at all. To answer a question. To make something move on a screen that wasn't moving yesterday.

Once it moves, you have new information. You know which parts are load-bearing. You know which gotchas bit you. You know which assumptions held up. You're now in a much better position to do the second pass, and the second pass is where the craft lives. The craft is the set of moves you make to take a working prototype to a state where someone else can run it, debug it, and trust it.

Those moves are not mysterious. They have names. They are the rest of this post.

## The repo on the bench

The worked example is the OIATC application, a public PHP repo I build alongside my own modern PHP framework, [Waaseyaa](https://github.com/waaseyaa/framework):

[https://github.com/waaseyaa/oiatc-waaseyaa](https://github.com/waaseyaa/oiatc-waaseyaa)

It powers [oiatc.ca](https://oiatc.ca). The marquee feature inside it is Anokii, an embedded AI chat that grounds its answers in the site's own community-resource pages and cites them. Anokii started as a vibe-coded chat experiment. It's now a RAG pipeline with a relevance gate, per-community variants, anonymous query-gap logging, and a topic-confidence gate on citations. Every step below points at a specific artifact in that repo.

## Step 1. Milestone the roadmap

The first thing that turned the Anokii work from "a directory of chat hacks" into "a project" was naming the phases. Phase 1 got a chat working at all. Phase 2 introduced RAG grounding, split into stages: Stage 1 was the `doc_chunk` entity and the `app:ingest-docs` CLI that fills it; Stage 2 was the keyword-RAG retrieval over those chunks.

Branches in the repo carry the phase names. `feat/doc-chunk-ingestion` landed Stage 1. `feat/keyword-rag-chat` landed the MVP retrieval. `feat/sagamok-resources` and `feat/data-sovereignty-and-masthead` carried sibling work. Each branch closes with a merge commit that documents what shipped, and only after that does the next phase begin.

Three phases, a handful of branches, every one of them with a concrete definition of done. That's enough structure to know what to work on next, and just as importantly, what *not* to work on right now.

You don't need a wiki or a project board. You need branch names that announce intent and merge commits that close the loop.

## Step 2. Write the runbook, including the gotchas

The repo's [CLAUDE.md](https://github.com/waaseyaa/oiatc-waaseyaa/blob/main/CLAUDE.md) is the runbook. It opens with a Strategy folder pointer: a separate workspace outside the repo tracks every live page on oiatc.ca against its canonical Twig source, last-updated date, and analytics. The CLAUDE.md says, plainly, that if the two disagree, the repo wins.

Below that pointer it documents the architecture (`Access/`, `Controller/`, `Domain/`, `Entity/`, `Provider/`, `Support/`), the ServiceProvider DI methods with full signatures (`singleton`, `bind`, `resolve`, `tag`, `entityType`), the queue Job pattern with `tries`, `timeout`, `retryAfter`, and the frontend template families (site shell vs. longform documents vs. news). An Operations section, added in commit `896ec8f`, covers deploy, Raspberry Pi access, and secrets.

The runbook is the operating manual you wish someone had handed you. The OIATC one is dense because it earned every line. The mistakes that produced those lines aren't generic; they're specific to this app, this framework version, this deployment target. That's exactly what makes them worth writing down.

## Step 3. Pin the world

Vibe-coded prototypes love `composer install` and `git clone main`. That works on Tuesday. It breaks on Friday when upstream cuts a release. The OIATC repo pins the world three different ways.

First, `composer.lock` is committed and treated as the source of truth. Lock-file drift gets its own entry in the upstream-notes (entry 003 walks through a drift caused by a post-hash `php: >=8.5` constraint and the fix). Second, the deploy contract is a `docker compose run` that calls `bin/waaseyaa db:init` before bringing the app up:

```bash
docker compose run --rm oiatc-app bin/waaseyaa db:init
docker compose up -d
```

`db:init` is idempotent. Fresh volume gets migrations. Current schema is a no-op. Safe to invoke on every deploy. That's what makes a deploy step a contract instead of a tradition.

Third, the app lives on a specific `waaseyaa/framework` alpha version (currently alpha.188). Upgrades happen as deliberate events with their own branch and their own entry in the upstream-notes, not as quiet drift. When upstream cuts a release that breaks something, you have a working baseline to compare against.

## Step 4. Name the graveyard

The repo has a literal graveyard directory: [`docs/archive/2026-04-20-cut-pages/`](https://github.com/waaseyaa/oiatc-waaseyaa/tree/main/docs/archive). It holds Twig templates and design notes for pages that were on oiatc.ca and got cut. Not deleted from git history. Not pretended to never have existed. Filed under a date and a reason so the next person can read what we tried and why we stopped.

This pattern shows up in the codebase too. The keyword-RAG retrieval merge commit literally calls itself "Path B." There was a Path A. Path A's notes are still around. Anyone looking at the current Path B implementation can see the alternative that was considered and the trade-offs that drove the decision.

Naming the graveyard is one of the cheapest, most under-used moves in software. Most repos don't do it because it feels embarrassing. The OIATC repo does it because each cut page and each abandoned path represents a hypothesis tested. The next person who has a similar hypothesis deserves to see the result.

## Step 5. Recon before you build

The single most useful artifact in the repo is [`docs/waaseyaa-upstream-notes.md`](https://github.com/waaseyaa/oiatc-waaseyaa/blob/main/docs/waaseyaa-upstream-notes.md). It's a running log of framework quirks, bugs, breakages, and missing pieces hit while building on an alpha release of `waaseyaa/framework`. Each entry uses a fixed format:

```
## NNN — short title

- **Date / version:** YYYY-MM-DD · waaseyaa/framework alpha.NNN
- **Doing:** what we were doing when we hit it
- **Symptom:** the observable problem
- **Workaround:** what we did to get unblocked
- **Likely upstream fix:** the proper change in waaseyaa/framework
```

There are 16+ entries. Stale `VERSION` files. Ambiguous class resolution between the metapackage and split mirrors. Lock-file drift after a platform requirement bump. Hard `ext-sodium` dependency via the OIDC stack. Each one is recon for the framework itself.

The point of the upstream-notes is not to complain. The point is to keep app-level hacks out of the consumer code. Every entry is a decision: do we patch around it here, do we file the upstream fix now, do we wait until the next alpha. Without the log, those decisions get re-litigated every time someone hits the same wall.

This is also the move I think AI tooling makes most useful. When you hit a quirk, write the entry first. The structured shape forces you to articulate what you actually saw, what you're guessing, and what would fix it upstream. That writing is exactly the input the model needs to either help you work around it cleanly or propose an upstream change.

## Step 6. Layer specs on what's next

The hardest current work on Anokii doesn't get vibe-coded. The topic-confidence gate that decides whether a citation is worth showing (`65de562`), the relevance gate that ensures only genuinely relevant passages are cited (`8359e37`), the climate-companion variant for the Massey Solar resource cluster (`c8956f6`), the shared relational-graph instance per community (`928191d`) — all of those run through [`docs/superpowers/specs`](https://github.com/waaseyaa/oiatc-waaseyaa/tree/main/docs/superpowers) and `docs/superpowers/plans`. Each change has a spec articulating the intent, a plan decomposing the work, and reviewable PRs landing the implementation.

Why specs and not just commits: a relevance gate that filters citations is the kind of thing where a hallucinated implementation looks fine until a user gets a confidently-wrong answer. The spec gives you a contract for what the gate is supposed to do. The plan gives reviewers something to evaluate against. The implementation has a referenceable target.

This is the handoff move. Vibe coding got the chat answering. The runbook captured the patterns. The pinned world made the deploys reproducible. The graveyard remembered the dead ends. The upstream-notes captured what the framework still owes us. And now spec-driven work takes over for the parts that are too big or too risky to vibe through. Each layer earned the right to the next layer.

## What this looks like together

The OIATC repo is not a clean codebase. It's a layered one. Some Anokii code still reads like the experiment it started as, because it still works and the cost of replacing it is higher than the cost of keeping it. The newer pieces — the keyword-RAG retrieval, the relevance gate, the topic-confidence gate — were built with specs and reviewed PRs because each of them is a place where a quiet bug becomes a confidently-wrong answer to a real person looking for real community resources.

Vibe coding was the first move. The six moves above are the second, third, fourth, fifth, sixth, and seventh. None of them are mysterious. None of them are expensive. They are the boring craft that turns a working prototype into something a stranger can run, debug, and trust.

If you've been bashing vibe coding, you're aiming at the start of a process and ignoring the rest of it. If you've been vibe-coding without any of the rest, you're going to keep losing days to the same gotchas, and the next person who touches your prototype is going to lose them too.

There's no shame in vibe coding. There's a lot of value in what comes next.

Baamaapii
