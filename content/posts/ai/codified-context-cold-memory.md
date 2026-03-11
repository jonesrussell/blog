---
title: "Cold memory: specs, MCP tools, and on-demand context retrieval"
date: 2026-03-13
categories: [ai]
tags: [claude-code, codified-context, ai-agents]
series: ["codified-context"]
summary: "How subsystem specs and MCP retrieval tools handle architectural knowledge too large for hot memory — and why stale specs are worse than no specs."
slug: "codified-context-cold-memory"
draft: true
---

Ahnii!

> **Series context:** This is part 4 of a five-part series on [Codified Context](/codified-context-the-problem/). Catch up on [part 1](/codified-context-the-problem/) (the problem), [part 2](/codified-context-constitution/) (constitution), and [part 3](/codified-context-specialist-skills/) (specialist skills) before reading this.

Your constitution handles the routing. Your specialist skills carry the domain expertise. But some architectural knowledge is too detailed for either — full interface signatures, database schemas, data flow for every operation, edge cases accumulated over months of development.

That's cold memory. Tier 3 in the [Codified Context](https://arxiv.org/abs/2602.20478) architecture: subsystem specs retrieved on demand when a session needs deep context, not loaded by default into every conversation.

## Why Specs Are Different from Skills

Skills and specs solve different problems.

A specialist skill captures *how to think* about a subsystem — the domain vocabulary, key interfaces, common mistakes, testing patterns. It's written for an AI agent navigating the codebase. It loads on demand and stays resident for the session.

A spec captures *how the system works* — the full interface signatures with all parameters and return types, the complete data flow for every operation, the database schema, configuration values, edge cases. It's more granular, more exhaustive, and written for precision rather than navigation.

The distinction matters for size. A useful skill is 200-400 lines. A useful spec can run to 600-1000 lines without being bloated — it's supposed to be comprehensive. Loading a spec for every session that touches a subsystem would waste context. Retrieving it when a session needs deep context is the right model.

## MCP as the Retrieval Layer

Model Context Protocol (MCP) is how Tier 3 retrieval works. An MCP server exposes your specs as tools that any Claude Code session can call:

- `list_specs` — returns the full index of available specs
- `get_spec(name)` — returns the full content of a named spec
- `search_specs(query)` — searches spec content by keyword and returns matching sections

When a session needs deep context on the waaseyaa entity system, it calls `waaseyaa_get_spec("entity-system")` and gets the full specification — interface signatures, data flow, storage schema, edge cases. The skill pointed it here. The MCP tool delivers it.

The [Codified Context paper](https://arxiv.org/abs/2602.20478) notes that simple keyword substring matching is sufficient for spec retrieval — you don't need embeddings, vector databases, or complex retrieval pipelines. The specs are structured documents with explicit section headers. Substring search against those headers finds what sessions need.

A lightweight MCP server for spec retrieval is roughly 200 lines of Node.js. It reads markdown files from `docs/specs/`, implements the three tools, and uses stdio transport. That's the entire infrastructure needed for Tier 3.

## Waaseyaa's 34 Specs

[Waaseyaa/framework](https://github.com/jonesrussell/waaseyaa) has thirty-four framework specs, with additional specs in [waaseyaa/minoo](https://github.com/jonesrussell/waaseyaa-minoo). Each covers one subsystem with enough depth that a fresh session can work on that subsystem without exploring source files.

The search spec illustrates the depth. It covers:

- `SearchProviderInterface` — full method signatures including `search(SearchFilters $filters): SearchResultSet`
- The DTOs: `SearchResult`, `SearchHit`, `SearchFacet`, `SearchFilters` — every field, every type
- The Twig extension — what it exposes, how templates access query parameters and provider results
- Caching semantics — provider-level, 60-second TTL, no invalidation complexity
- The `baseTopics` enforcement — how indigenous-only filtering is applied server-side

The minoo search spec goes further: the `NorthCloudSearchProvider` implementation, the GET-based query builder (and why POST isn't used — a known bug in the upstream NorthCloud API where POST filters are ignored), the indigenous-only filtering contract, and the SSR rendering rules for the search UI.

These details don't belong in the constitution or the search skill. They're too granular. But they're exactly what a session needs when implementing a new search filter or debugging a retrieval issue.

Waaseyaa's MCP tools (`waaseyaa_get_spec` and `waaseyaa_search_specs`) are registered in `.claude/settings.json` and available in every session. The skills point to relevant specs; sessions retrieve them when they need the depth.

## North-Cloud's Layered MCP Approach

North-cloud runs the same `tools/spec-retrieval/` pattern as waaseyaa for its thirteen specs covering fourteen services. But it adds a second MCP server on top: a Go-based operational server (`mcp-north-cloud/`) that exposes 25-36 tools for live interaction with running services — crawling, publishing, classification, search, index management, and Grafana alerts. The spec server handles architectural knowledge; the Go server handles runtime operations.

With thirteen specs, the orchestration table approach still carries significant load. Sessions see a direct mapping: file pattern → service CLAUDE.md → spec file. The MCP tools supplement this for cross-service queries and live API access.

Three services (source-manager, dashboard, pipeline) have service CLAUDE.mds but no Tier 3 spec yet. They appear in the orchestration table with `—` in the spec column. This is the honest representation: those services are covered at T2 depth, not T3 depth. The work exists to write those specs — it's just not done yet.

The decision: if you have fewer than ten specs, direct file references in the constitution may be enough. If you're managing twenty or more specs across multiple subsystems, an MCP retrieval server earns its setup cost. If your codebase also needs live operational access to running services, a second purpose-built MCP server — like north-cloud's Go server — is a separate concern worth separating.

## Contract Specs: A Distinct Spec Type

Waaseyaa's 31 specs include a category that doesn't appear in most implementations: contract specs. These are different from subsystem specs in a specific way — they document the interface agreement between subsystems, not the implementation of any one subsystem.

An example: `authoring-assist-contract.md` defines what the authoring assist feature promises to the rest of the framework and what it requires in return. Sessions working on the ingestion pipeline read the ingestion contracts. Sessions working on the admin dashboard read the dashboard contract. Neither session needs to understand the other's implementation — they only need to understand the contract between them.

This matters when multiple subsystems are under development in parallel. Contract specs let sessions work on adjacent subsystems without coupling — the contract is the shared artifact, not the implementation. A session implementing the ingestion pipeline generates code that satisfies the `ingestion-validator-contract.md`. A session implementing the editorial dashboard generates code that consumes the `ingestion-editorial-dashboard-contract.md`. They can work independently because the contracts are explicit.

For your own codebase: if you find sessions on adjacent subsystems regularly generating incompatible interfaces, contract specs are the tool for that problem.

## The Drift Problem

Stale specs are actively harmful. An outdated spec is worse than no spec.

Here's why: a session that has no spec explores the source files and discovers the current state of the system. A session that has a stale spec trusts the spec and generates code against outdated interfaces, wrong field names, or replaced data flows. The stale spec provides false confidence.

North-cloud's constitution includes a warning on exactly this point: "When refactoring a subsystem, update the relevant service CLAUDE.md and `docs/specs/` file. Stale specs cause sessions to generate code conflicting with recent changes."

Warning the AI isn't enough. You also need tooling.

## The Drift Detector

The [codified-context skill](/codified-context-skills/) includes a drift detection script that maps recent file changes to the specs that cover those files:

```bash
#!/bin/bash
# tools/drift-detector.sh
echo "Files changed in last 5 commits:"
git diff --name-only HEAD~5 HEAD | while read file; do
  case "$file" in
    crawler/*)    echo "  $file -> docs/specs/content-acquisition.md" ;;
    publisher/*)  echo "  $file -> docs/specs/content-routing.md" ;;
    search/*)     echo "  $file -> docs/specs/discovery-querying.md" ;;
    # ... one case per service/spec pair
  esac
done
```

Run this after any session that changes a subsystem's behavior. It outputs a list of specs that may need updating. Not every change requires a spec update — but without the detector, you won't know which changes did.

The maintenance cadence that works:

- **Per session:** Update affected specs when interfaces or data flow changes. Five minutes when you need it; zero cost when you don't.
- **Every two weeks:** Run the drift detector across the full history, review flagged specs.
- **Quarterly:** Audit coverage — are new subsystems missing specs entirely?

The quarterly audit catches the most common drift failure: a new subsystem that grew to production significance without ever getting a spec written.

## What Makes a Good Spec

Specs written for AI retrieval look different from documentation written for humans. The key differences:

**Explicit file paths, not vague descriptions.** "The entity system" is not useful. `src/Entity/ContentEntityBase.php` is.

**Full interface signatures with types.** Not "search returns results." `search(SearchFilters $filters): SearchResultSet` where `SearchResultSet` contains `hits: SearchHit[]`, `total: int`, `facets: SearchFacet[]`.

**Actual code patterns, not pseudocode.** Show how a Twig template accesses search results. Show the exact API call format. Code patterns a session can act on directly.

**Edge cases, not just happy paths.** What happens when `SearchFilters::$query` is empty? When the NorthCloud API returns 0 results vs. an error? The edge cases are where sessions make mistakes when the spec doesn't cover them.

**No project history.** Specs are not design docs. Omit implementation timelines, "we decided to" explanations, phase breakdowns. Include only what's true of the system right now.

Next: [Part 5: The skills](/codified-context-skills/) — two skills you can use to apply this whole architecture to your own codebase. One for setup, one for ongoing maintenance.

Baamaapii
