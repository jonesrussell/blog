---
categories:
    - ai
    - php
date: 2026-03-15T00:00:00Z
devto_id: 3386549
draft: false
series:
    - waaseyaa
series_group: Main
series_order: 2
slug: co-development-skill-set
summary: 'A skill set that governs framework-app co-development across three repos: enforcing patterns, auditing divergence, and extracting shared code.'
tags:
    - claude-code
    - waaseyaa
    - codified-context
    - skills
title: Three skills for governing multi-repo co-development with Claude Code
---

Ahnii!

> **Series context:** This post builds on the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). It assumes familiarity with [codified context architecture]({{< relref "codified-context-the-problem" >}}), but you can follow the design without that background.

When you develop a framework and two applications together, the AI assistant working in one repo has no awareness of the other two. It doesn't know that the framework already provides the capability you're about to build from scratch. It doesn't know that the other app solved the same problem last week with a different pattern. And nobody is measuring whether the apps are drifting apart.

This post covers a three-skill system that closes those gaps for [Waaseyaa](https://github.com/waaseyaa/framework) (framework), [Minoo](https://github.com/waaseyaa/minoo) (Indigenous knowledge platform), and [Claudriel](https://github.com/jonesrussell/claudriel) (AI personal operations). The cycle is: develop with guardrails, measure divergence, extract shared patterns, repeat.

## The Problem With Multi-Repo AI Development

All three repos use [codified context]({{< relref "codified-context-the-problem" >}}): a CLAUDE.md constitution at the top, Tier 2 skills for subsystem governance, and Tier 3 specs retrievable via MCP. Each repo is well-governed in isolation.

The problems show up at the boundaries.

**Context switching.** Claude starts a session in Minoo to build an ingestion adapter. It has Minoo's specs, Minoo's skills, Minoo's CLAUDE.md. It has no idea that Waaseyaa already ships an ingestion adapter interface, or that Claudriel solved the same mapping problem two weeks ago. So it builds from scratch, creating a third implementation of something that should exist once.

**Pattern divergence.** Both apps register entity types, wire service providers, define access policies, and structure controllers. Without shared governance, each app develops its own conventions. The divergence is invisible until you try to extract a framework feature and discover the two implementations are incompatible.

**No measurement.** You can't fix what you can't see. There's no audit trail showing which patterns match, which have drifted, or which app code should have been framework code all along.

## Skill 1: App Development Governance

The first skill, `waaseyaa-app-development`, lives in the framework repo and gets symlinked into each app:

```bash
# In minoo's skills directory
ln -s ../../waaseyaa/skills/waaseyaa/app-development skills/waaseyaa-app-development

# In claudriel's skills directory
ln -s ../../waaseyaa/skills/waaseyaa/app-development skills/waaseyaa-app-development
```

Symlinks mean both apps always reference the current version. When the framework updates the skill, both apps get the update without copying files.

The skill triggers whenever Claude works on entities, service providers, controllers, access policies, or ingestion pipelines. It does three things.

### Framework-or-App Decision Criteria

Before writing code, the skill forces a classification:

- If two apps need it, it belongs in the framework.
- If it extends a framework extension point (custom entity type, access policy), it belongs in the app.
- If it's domain-specific business logic with no reuse potential, it belongs in the app.
- If it's infrastructure (caching strategy, deployment pattern, middleware), it's a framework candidate.

These aren't guidelines. They're decision gates. The skill won't let Claude proceed until the classification is made.

### Pattern Catalog

The skill carries the canonical way to do each common task on Waaseyaa:

- **Entity registration:** EntityType definition, entity class, provider, storage schema, access policy.
- **Service providers:** `register()` vs `boot()` separation, event subscriptions, route registration.
- **Controllers:** JsonApiController CRUD, route access options, ResourceSerializer usage.
- **Access policies:** PolicyAttribute annotations, intersection types for field access, entity vs field semantics.
- **Ingestion adapters:** Source adapter interface, envelope validation, mapper registration.

When Claude builds an entity in Minoo, it follows the same pattern it would follow in Claudriel. Not because someone remembered to check, but because the skill enforces it.

### Anti-Duplication Check

Before implementing any capability, the skill instructs Claude to:

1. Search Waaseyaa's specs for existing framework support.
2. Search the other app's specs and codebase for prior art.
3. If prior art exists: follow the existing pattern or flag it for framework extraction.

This is the cheapest intervention in the entire system. A grep before you code saves a refactor after you ship.

## Skill 2: Cross-Project Audit

The second skill, `cross-project-audit`, lives in the personal skills directory (`~/.claude/skills/`) because it needs to see across all three repos regardless of which one the session started in.

It runs in two modes.

### Full Audit

A comprehensive scan that compares patterns across all three codebases using file-based searching (grep and glob across the known repo paths). MCP tools are project-scoped, so they may not all be available in a single session. File-based scanning works regardless.

The audit produces a structured report:

```markdown
## Cross-Project Audit Report

### Pattern Divergence Inventory
| Category            | Minoo Pattern | Claudriel Pattern | Divergence | Action  |
|---------------------|---------------|-------------------|------------|---------|
| Entity registration | ...           | ...               | Low        | OK      |
| Service providers   | ...           | ...               | High       | Extract |

### Framework Candidates
- [ ] Ingestion envelope validation -- found in both apps, identical logic

### Compliance Checklist
| Category | Check                              | Minoo | Claudriel |
|----------|------------------------------------|-------|-----------|
| Entities | Extends correct base class         | Pass  | Pass      |
| Entities | EntityType uses named constructors | Pass  | Fail      |
| Providers| register() vs boot() separation    | Pass  | Pass      |

### Trend (vs previous audit)
| Category  | Previous | Current | Delta |
|-----------|----------|---------|-------|
| Entities  | 85%      | 92%     | +7%   |
```

Reports get saved to `waaseyaa/docs/audits/` so you can track compliance over time. The trend section is the most valuable part. It shows whether your governance is working or just aspirational.

### Quick Check

A lightweight mode for pre-implementation queries. Describe what you're about to build, and the skill scans the other app's codebase for prior art. The response is one of three outcomes: already solved (follow the existing pattern), should be extracted (framework candidate), or app-specific (proceed).

## Skill 3: Framework Extraction

The third skill, `waaseyaa-framework-extraction`, executes on the candidates that Skill 2 identifies. It lives in the framework repo because that's where extracted code lands.

The extraction process follows a fixed sequence:

1. **Scope.** What capability is being extracted? How do the app implementations differ? What's the minimal generic interface that covers both?

2. **Place.** Waaseyaa uses a layered architecture where packages can only import from their own layer or lower. The skill determines which layer the extraction belongs to.

3. **Design the extension point.** Define the interface or abstract class in the framework. Design the registration mechanism apps will use. Ensure apps can customize behavior without forking framework code.

4. **Execute.** Create or modify the framework package, update both apps to use it, remove the duplicated code. Update Composer dependencies if a new package was created.

5. **Verify.** Run tests across all three repos. No extraction ships without green tests in Waaseyaa, Minoo, and Claudriel.

6. **Document.** Update the framework's Tier 3 spec, update both apps' specs, and log the extraction:

```markdown
## Extraction: Ingestion Envelope Validation
- **Date:** 2026-03-16
- **Source:** Minoo, Claudriel
- **Target package:** waaseyaa/ingestion
- **Layer:** 3 (Services)
- **Extension point:** EnvelopeValidatorInterface
- **Why:** Identical validation logic in both apps
- **Apps updated:** Minoo, Claudriel
```

The extraction log becomes the institutional memory of why framework capabilities exist and where they came from.

## The Continuous Cycle

The three skills form a loop:

```text
Develop (Skill 1) ──▶ Measure (Skill 2) ──▶ Extract (Skill 3)
     ▲                                              │
     └──────── pattern catalog updated ◀────────────┘
```

Skill 1 governs daily development, enforcing patterns and checking for prior art. Skill 2 audits the results, scoring compliance and identifying candidates. Skill 3 moves shared code from apps into the framework. After extraction, Skill 1's pattern catalog reflects the new framework capability, and the next audit's compliance scores improve.

The cycle is not automated. Each skill is invoked deliberately. But the handoffs are explicit: audit reports name extraction candidates by file path, extraction logs reference the audit that identified them, and the updated pattern catalog is the proof that the loop closed.

## Why Skills Instead of Documentation

You could write all of this in a wiki. The framework-or-app criteria, the pattern catalog, the extraction checklist. Documentation works when someone reads it.

Skills work because they're active. They trigger when Claude touches the relevant code paths. They enforce checks before code gets written, not after it ships. And they evolve with the codebase because they live in the repos they govern.

The codified context architecture gives each repo self-awareness. This skill set gives the repos awareness of each other.

Next: [The entity system at the heart of Waaseyaa]({{< relref "waaseyaa-entity-system" >}}).

Baamaapii
