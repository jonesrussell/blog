# From vibe-coded to shippable — social copy

**Blog URL (live after publish):** https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/
**Repo anchor (public):** https://github.com/waaseyaa/oiatc-waaseyaa
**Live site:** https://oiatc.ca

This file holds the launch trio plus a five-post drip series. The drip posts each spotlight one playbook step from the post. All copy follows the no-em-dash, no-markdown, URL-in-body rules.

---

## Long-form master (source)

Most of the bashing of vibe coding is aimed at the wrong target. The MVP you stand up with AI doesn't have to generalize. That's not what it was for. The interesting craft is what you do next to take a prototype from "it works on my laptop" to something a stranger can run, debug, and trust.

I wrote up the six moves I'm currently running on a real public repo, the OIATC application that powers oiatc.ca. The marquee feature is Anokii, an embedded AI chat that grounds its answers in community-resource pages and cites them. It started as a vibe-coded experiment. It's now a RAG pipeline with a relevance gate, per-community variants, and a topic-confidence gate on citations.

Six moves: milestone the roadmap, write the runbook, pin the world, name the graveyard, recon before you build, and layer specs on what's next. Each one points at a real artifact in the repo.

---

## Launch trio

### Bluesky (launch)

The interesting craft isn't vibe coding the first prototype. It's the six moves you make next. Wrote them up with real artifacts from the OIATC repo that powers oiatc.ca. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn (launch)

Most of the bashing of vibe coding is aimed at the wrong target.

The MVP you stand up with AI doesn't have to generalize. That's not what it was for. The interesting craft is what you do next to take a prototype from "it works on my laptop" to something a stranger can run, debug, and trust.

I wrote up the six moves I'm running on a real public repo, the OIATC application that powers oiatc.ca. The marquee feature is Anokii, an embedded AI chat that grounds its answers in community-resource pages and cites them. It started as a vibe-coded experiment. Now it's a RAG pipeline with a relevance gate, per-community variants, and a topic-confidence gate on citations.

The six moves:

1. Milestone the roadmap (phased branch names that close on merge)
2. Write the runbook, including the gotchas (a real CLAUDE.md)
3. Pin the world (composer.lock, db:init contract, framework version discipline)
4. Name the graveyard (a literal docs/archive directory)
5. Recon before you build (a structured upstream-notes log)
6. Layer specs on what's next (specs and plans driving the hard parts)

Each step is illustrated by a real artifact in the repo. No theory.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #vibecoding #softwaredevelopment #buildinpublic #specdriven

### Facebook (launch)

Most of the bashing of vibe coding is aimed at the wrong target. The MVP you stand up with AI doesn't have to generalize. That's not what it was for. The interesting craft is what you do next to take a prototype from "it works on my laptop" to something a stranger can run, debug, and trust.

I wrote up the six moves I'm running on the OIATC repo that powers oiatc.ca, with Anokii (the embedded AI chat) as the worked example. Each step has a real artifact in the public repo.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic #AIassistedDev

---

## Drip 1: Runbook + gotchas

### Bluesky

If your AI-built repo doesn't have a runbook, future-you can't run it. The OIATC repo's CLAUDE.md opens with a strategy-folder pointer, then walks the architecture, DI signatures, queue Job pattern, and an Operations section. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn

If your AI-built repo doesn't have a runbook, future-you can't run it.

The OIATC repo's CLAUDE.md is the operating manual I wish someone had handed me on day one. It opens with a Strategy-folder pointer: a separate workspace maps every live page on oiatc.ca to its canonical Twig source, last-updated date, and analytics. If the two ever disagree, the repo wins.

Below that pointer it documents the architecture, the ServiceProvider DI methods with full signatures, the queue Job pattern, and an Operations section covering deploy, Pi access, and secrets. Dense, because every line was earned.

This is one of the six moves I cover in the playbook post.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #buildinpublic #softwaredevelopment #documentation #specdriven

### Facebook

If your AI-built repo doesn't have a runbook, future-you can't run it. The OIATC repo's CLAUDE.md is the operating manual: strategy-folder pointer, architecture, DI signatures, queue patterns, deploy ops. Every line was earned. From the playbook post:

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic

---

## Drip 2: Pinned world

### Bluesky

Vibe-coded today, irreproducible tomorrow. Pin the world. The OIATC deploy contract is bin/waaseyaa db:init (idempotent) before docker compose up. composer.lock is canonical, framework version is explicit. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn

Vibe-coded today, irreproducible tomorrow. Pin the world.

The OIATC repo pins it three ways. composer.lock is committed and treated as the source of truth. The deploy contract is a docker compose run that calls bin/waaseyaa db:init before bringing the app up. db:init is idempotent: fresh volume gets migrations, current schema is a no-op, safe on every deploy. And the app lives on a specific waaseyaa/framework alpha version. Upgrades are deliberate events with their own branch, not quiet drift.

The payoff: anyone reproducing the build aligns to those pins and gets the same behavior. When upstream cuts a release that breaks something, you have a working baseline to diff against.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #buildinpublic #softwaredevelopment #reproducibility #devops

### Facebook

Vibe-coded today, irreproducible tomorrow. Pin the world. The OIATC repo does it three ways: locked composer.lock, an idempotent db:init step in the deploy contract, and explicit framework-version discipline. From the playbook post:

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic

---

## Drip 3: Named graveyard

### Bluesky

Don't delete failed attempts. Label them and keep them. The OIATC repo has a literal docs/archive/2026-04-20-cut-pages/ directory and a "Path B" merge that quietly remembers Path A. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn

Don't delete your failed attempts. Label them, and keep them.

The OIATC repo has a literal graveyard directory: docs/archive/2026-04-20-cut-pages. It holds Twig templates and design notes for pages that were on oiatc.ca and got cut. Not deleted from git history, not pretended away. Filed under a date and a reason so the next person can read what was tried and why it stopped.

The pattern shows up in the code, too. The keyword-RAG retrieval merge calls itself "Path B." There was a Path A. Its notes are still around. Anyone looking at the current implementation can see the alternative and the trade-offs that drove the decision.

Naming the graveyard is one of the cheapest, most under-used moves in software. Most repos don't do it because it feels embarrassing. Get over that.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #buildinpublic #softwaredevelopment #softwarearchitecture #codereview

### Facebook

Don't delete failed attempts. Label them and keep them. The OIATC repo has a docs/archive/ directory for cut pages and a "Path B" merge that quietly remembers Path A. The next person who has a similar idea gets to see the result first.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic

---

## Drip 4: Recon before you build

### Bluesky

Before you build the hard thing, write what you don't know about it. The OIATC repo's waaseyaa-upstream-notes is 16+ entries in a fixed format: doing, symptom, workaround, likely upstream fix. Keeps app-level hacks out of the consumer code. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn

Before you build the hard thing, write what you don't know about it.

The single most useful artifact in the OIATC repo is a markdown file: docs/waaseyaa-upstream-notes.md. It's a running log of framework quirks, bugs, and missing pieces hit while building the app on an alpha release of the framework. Each entry follows a fixed format: date and framework version, what we were doing, the observable symptom, the workaround, and the likely upstream fix.

There are 16+ entries. Stale VERSION files. Ambiguous class resolution between the metapackage and split mirrors. Lock-file drift after a platform-requirement bump. Each one is recon for the framework itself.

The point of the upstream-notes is not to complain. It's to keep app-level hacks out of consumer code. Every entry is a decision: patch around it here, file the upstream fix now, or wait. Without the log, those decisions get re-litigated every time.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #buildinpublic #specdriven #softwaredevelopment #framework

### Facebook

Before you build the hard thing, write what you don't know about it. The OIATC repo's upstream-notes file is a structured running log of framework quirks: what we were doing, the symptom, the workaround, the likely upstream fix. 16+ entries. Keeps the hacks out of consumer code.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic

---

## Drip 5: Spec layer (handoff)

### Bluesky

Where vibe coding hands the baton to spec-driven. The Anokii relevance gate, topic-confidence gate, and climate-companion variant all run through docs/superpowers/specs in the OIATC repo. Each layer earned the right to the next one. #buildinpublic
https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

### LinkedIn

Where vibe coding hands the baton to spec-driven.

The hardest current work on Anokii (the AI chat on oiatc.ca) doesn't get vibe-coded. The topic-confidence gate that decides whether a citation is worth showing, the relevance gate that filters retrieved passages, the climate-companion variant for the Massey Solar resource cluster, the shared relational-graph instance per community: all of those run through docs/superpowers/specs and docs/superpowers/plans in the OIATC repo.

Why specs and not just commits: a relevance gate that filters citations is the kind of thing where a hallucinated implementation looks fine until a user gets a confidently-wrong answer about something that matters to their community. The spec gives a contract for what the gate is supposed to do. The plan gives reviewers something to evaluate against. The implementation has a referenceable target.

Each layer earned the right to the next layer.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#AIassistedDev #buildinpublic #specdriven #softwarearchitecture #softwaredevelopment

### Facebook

Where vibe coding hands the baton to spec-driven. Anokii's hardest current work (the relevance gate, the topic-confidence gate, the per-community variants) runs through docs/superpowers/specs in the OIATC repo. Each layer earned the right to the next one.

https://jonesrussell.github.io/blog/from-vibe-coded-to-shippable/

#buildinpublic
