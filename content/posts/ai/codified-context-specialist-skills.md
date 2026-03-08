---
title: "Domain specialist skills: teaching AI to think like your senior dev"
date: 2026-03-11
categories: [ai]
tags: [claude-code, codified-context, ai-agents]
series: ["codified-context"]
summary: "What specialist skills are, why the 50% domain knowledge rule matters, and how waaseyaa's spec-backed orchestration keeps AI consistent across a 29-package PHP monorepo."
slug: "codified-context-specialist-skills"
draft: true
---

Ahnii!

> **Series context:** This is part 3 of a five-part series on [Codified Context](/codified-context-the-problem/) — a three-tier architecture for reliable AI-assisted development. Catch up on [part 1](/codified-context-the-problem/) (the problem) and [part 2](/codified-context-constitution/) (Tier 1: the constitution) before reading this.

Your project constitution tells AI agents where to look. Specialist skills are what they find when they get there. They're the domain experts loaded on demand — one per subsystem, carrying the deep knowledge that would bloat the constitution if included directly.

This post covers what makes a good specialist skill, when to create one versus extending the constitution, and how waaseyaa's MCP-backed orchestration compares to north-cloud's service-level approach.

## What a Specialist Skill Is

A specialist skill is a markdown file loaded into context when a session touches a specific area of your codebase. Your project constitution's orchestration table maps file patterns to skills — touch a file in `crawler/`, load the crawler skill. Touch a file in `src/entity/`, load the entity system skill.

The skill carries what the constitution can't: interface signatures, data flow patterns, domain-specific gotchas, testing conventions, and pointers to the relevant cold-memory specs.

Unlike the constitution, skills are not always loaded. They're pulled on demand. This means a session working on the publisher doesn't pay the context cost of loading crawler knowledge. Each session gets exactly the domain expertise it needs for the work it's doing.

## The 50% Domain Knowledge Rule

The most common mistake when writing skills is writing instructions instead of knowledge.

An instruction-heavy skill looks like this:

```markdown
## When Adding an Entity
- Make sure to implement EntityInterface
- Always add fields to the field registry
- Don't forget to update the entity factory
- Check that access policies are registered
```

This is a checklist, not a skill. It tells the AI what to do but not what it needs to know. A skill that's mostly "make sure to" and "don't forget" bullets isn't capturing domain expertise — it's just a TODO list.

A knowledge-heavy skill looks like this:

```markdown
## EntityInterface

The base contract for all entities. Required methods:

- `getId(): EntityId` — returns a value object, never a scalar
- `getFields(): FieldCollection` — returns all fields registered for this entity type
- `getField(string $name): FieldInterface|null` — returns null for unregistered fields, never throws
- `toArray(): array` — used by ResourceSerializer; must return flat key-value with field names as keys

ContentEntityBase provides the default implementation. Custom entities extend this, not EntityInterface directly.
```

The test: count the lines that carry domain knowledge (interface signatures, code patterns, data flow, invariants) versus lines that are behavioral instructions ("you should", "make sure to", "always"). Target over 50% domain knowledge. If you're under that, the skill is mostly instructions and will produce mediocre results.

## When to Create a Skill vs. Extend the Constitution

The rule of thumb: create a skill when a subsystem is large enough that its context would crowd out everything else in the constitution.

Some heuristics:

- **More than 1,000 lines of source code** in the subsystem suggests enough complexity to warrant a skill.
- **Recurring patterns within the subsystem** — a skill is the right place for "here's how routing works in the publisher" or "here's the standard testing setup for crawler jobs."
- **Distinct domain vocabulary** — if the subsystem has its own concepts (entity, field, access policy) that don't map cleanly to the rest of the codebase, a skill captures that vocabulary once instead of repeating it everywhere.

The inverse is also true: if a rule applies everywhere and someone working anywhere in the codebase needs to know it, it belongs in the constitution, not a skill. The linting rules in north-cloud's CLAUDE.md are a good example — they're project-wide invariants, not crawler-specific knowledge.

## Waaseyaa's Skill Architecture

[Waaseyaa/framework](https://github.com/jonesrussell/waaseyaa) is a 29-package PHP CMS framework with seven architectural layers. Its orchestration table maps eight package groups to `waaseyaa:*` entries — entity-system, access-control, api-layer, node-system, taxonomy, search, plugin-system, versioning.

An important distinction: the `waaseyaa:*` entries in the orchestration table are conceptual labels, not direct Skill tool invocations. When the orchestration table routes a session to `waaseyaa:entity-system`, it means "use the `waaseyaa_get_spec` MCP tool to retrieve the entity-system spec." The framework's T2 knowledge lives primarily in its 31 subsystem specs, retrieved via MCP tools, rather than in standalone skill files.

This is a deliberate architectural choice. Waaseyaa's subsystem specs are comprehensive enough that they serve both the T2 (domain expertise on demand) and T3 (deep cold memory) roles. Two skill files exist in `skills/`: the main `waaseyaa` domain skill and the `codified-context` skill that lives there as its home repo.

What makes this work at 29 packages: any session touching the entity system retrieves the entity-system spec via `waaseyaa_get_spec("entity-system")`. A session adding API endpoints retrieves the api-layer spec. The MCP tools are the retrieval mechanism; the specs are the knowledge. The orchestration table maps file patterns to which spec to retrieve.

## North-Cloud: Service CLAUDE.mds as T2

North-cloud takes a different approach entirely: it uses service-level `CLAUDE.md` files as its Tier 2, skipping the Skill tool overhead entirely. Fourteen services, fourteen service-level CLAUDE.mds — one per service — each covering quick reference commands, internal architecture, common patterns, and service-specific gotchas.

This is a valid architectural tradeoff. A 14-service Go monorepo doesn't benefit much from Skill tool invocation. Sessions working on the crawler open `crawler/CLAUDE.md` directly via the orchestration table pointer. The file is the skill.

North-cloud does have standalone specialist skills for the areas where cross-service consistency matters most: `nc-crawler`, `nc-publisher`, `nc-classifier`, `nc-infrastructure`, `nc-search-indexing`. These exist for the more complex subsystems where a service CLAUDE.md alone isn't enough depth.

## PipelineX: When a CLAUDE.md Is Enough

Not every codebase needs specialist skills. [PipelineX](https://github.com/jonesrussell/pipelinex) is a single-file Go service — 99 lines in its CLAUDE.md, no service-level files, no skills, no specs.

At this scale, the constitution is sufficient. There's no cross-service complexity to manage, no distinct subsystems with their own vocabularies, no deep domain knowledge that would crowd out everything else if included at the top level.

The decision point is roughly: does your codebase have multiple logical subsystems, each with enough complexity that a session touching one doesn't need to understand the others? If yes, specialist skills are worth the setup cost. If no, a well-maintained constitution is probably enough.

## Writing a Specialist Skill

The structure that works, from the [codified-context skill](/codified-context-skills/):

```markdown
## Scope
Packages: [list]
Key files: [list of entry points]

## Key Interfaces
[Interface name]
- [Method signature with parameter types and return type]
- [Behavioral contract: what callers must know]

## Architecture
[Data flow with inline code patterns]

## Common Mistakes
- [Mistake]: [why it happens] → [correct pattern]

## Testing Patterns
- [In-memory substitute]: use [class] instead of [real class]
- [What to assert]: [key assertions for this domain]

## Related Specs
- docs/specs/[spec].md — [what it covers]
```

The "Related Specs" section is the link to Tier 3. When a session loads a skill and needs deeper context on a specific subsystem, the skill points it to the right spec.

Tomorrow: cold memory — how specs and MCP retrieval handle the architectural knowledge that's too large for either the constitution or a skill.

Baamaapii
