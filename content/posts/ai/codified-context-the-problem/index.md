---
title: "Why AI agents lose their minds in complex codebases"
date: 2026-03-10
categories: [ai]
tags: [claude-code, codified-context, ai-agents]
series: ["codified-context"]
summary: "Token limits aren't the real problem with AI in large codebases — inconsistent context is. Here's what breaks and why a three-tier architecture fixes it."
slug: "codified-context-the-problem"
draft: false
---

Ahnii!

If you've worked with AI coding tools long enough, you've hit a specific kind of frustration. The model is capable. You've seen it write good code. But in your codebase, it keeps making the same mistakes — wrong patterns, cross-module violations, code that fails your linter on the first run. Each new session feels like onboarding a developer who forgot everything from last week.

This post breaks down the failure modes and introduces the three-tier architecture from ["Codified Context: Infrastructure for AI Agents in a Complex Codebase"](https://arxiv.org/abs/2602.20478) by Vasilopoulos that fixes them.

## The Token Math Doesn't Scale

A large Claude Code context window holds roughly 200,000 tokens — about 150,000 words, or a long novel. That sounds generous until you look at what a real production codebase contains.

[north-cloud](https://github.com/jonesrussell/north-cloud) is a Go microservices monorepo with seventeen services: crawler, classifier, publisher, search, index-manager, source-manager, auth, dashboard, pipeline, social-publisher, rfp-ingestor, mcp-north-cloud, click-tracker, nc-http-proxy, ai-observer, render-worker, and search-frontend. Each service has its own database, API, internal packages, and conventions.

Loading everything into context every session is not a viable approach. Even if it were, throwing 50,000 lines of Go at an AI and asking it to "understand the system" doesn't produce good results. Signal drowns in noise.

And context windows reset. Every new session starts fresh. The AI has no memory of the linting rules you explained last Tuesday, the cross-service import constraint you corrected three times, or the Elasticsearch mapping gotcha that cost you two hours to debug.

## What Actually Breaks

The failure modes are consistent across projects. Here's what they look like in a Go microservices codebase without structured context:

**Wrong language patterns.** Go 1.18+ introduced `any` as an alias for `interface{}`. North-cloud's linter (`golangci-lint`) is configured to flag `interface{}` as an error — not a warning, an error. Without knowing this, every AI-generated function signature uses the old form. The code looks right. It fails CI.

**Cross-service imports.** North-cloud enforces a hard rule: services import only from the shared `infrastructure/` package, never from each other. This is an architectural invariant, not a preference. An AI that doesn't know this constraint will suggest cross-service imports that look perfectly reasonable in isolation and silently corrupt the architecture.

**Field type mistakes.** The Elasticsearch `content_type` field must be mapped as `text`, not `keyword`. The search service queries `content_type.keyword`, a sub-field that only exists on `text` fields — not on `keyword` fields. Get this wrong and search returns nothing. This is exactly the kind of hard-won, non-obvious knowledge that evaporates between sessions.

**Missing test conventions.** Every test helper function in north-cloud must start with `t.Helper()`. The linter enforces this. Without knowing it, the AI generates helper functions that fail lint checks and produce confusing test output when they fail.

These aren't model failures. The model is capable of following all these rules when it knows them. The problem is delivery: how do you reliably get the right knowledge into the right session without loading your entire codebase every time?

## What the Paper Says

Vasilopoulos frames this as an infrastructure problem, not a prompting problem. Clever prompts don't scale. What scales is treating AI context as a system to be architected — with the same care you'd give to any other critical infrastructure.

The paper proposes three tiers of codified knowledge, each with a different delivery mechanism:

**Tier 1 — Constitution.** A project-level file loaded automatically at the start of every session. Small enough to fit in hot memory (under 200 lines). Contains the orchestration logic that tells the AI where to look for deeper knowledge.

**Tier 2 — Specialist skills.** Domain-specific agents loaded on demand. Each covers one logical subsystem — the entity system, the access control layer, the search API. They carry the deep domain knowledge that would bloat the constitution if included directly.

**Tier 3 — Subsystem specs.** Long-form architectural documentation retrieved via MCP tools when needed. Cold memory: not loaded by default, pulled when a session needs deep context on a specific subsystem.

The key insight is that not all knowledge needs to be in every session. Crawler-specific knowledge doesn't help a session that's only touching the publisher. Loading everything is wasteful; loading nothing is broken. The three-tier architecture loads the right knowledge at the right time.

## What This Series Covers

This architecture has been applied to two codebases:

- **north-cloud** — a Go microservices monorepo with seventeen services, ML sidecars, and an Elasticsearch-backed search pipeline
- **waaseyaa/framework** — a 29-package PHP CMS framework, Drupal-inspired, with a Nuxt 3 admin SPA

Both are production systems. Both had the failure modes described above before structured context was added. Both work substantially better now.

Over the next four posts:

[Part 2: The constitution]({{< relref "codified-context-constitution" >}}) — writing a project constitution that actually works. What the north-cloud CLAUDE.md contains, why the orchestration trigger table matters, and how waaseyaa scales the same pattern to 29 packages.

[Part 3: Specialist skills]({{< relref "codified-context-specialist-skills" >}}) — domain specialist skills. What separates a good skill from a list of instructions. How waaseyaa's orchestration table and north-cloud's service CLAUDE.mds take different approaches to the same problem.

[Part 4: Cold memory]({{< relref "codified-context-cold-memory" >}}) — specs and MCP retrieval. How waaseyaa's thirty-four framework specs pair with a custom MCP server, and how north-cloud layers a Go-based operational MCP server on top of the same spec-retrieval pattern.

[Part 5: The skills]({{< relref "codified-context-skills" >}}) — two skills you can use to apply this to your own codebase. One for setting up the three-tier architecture from scratch, one for maintaining it as the codebase evolves.

The failure modes are fixable. The fix requires treating context as infrastructure — designed deliberately, maintained actively, and structured to match how a codebase is actually organized.

Baamaapii
