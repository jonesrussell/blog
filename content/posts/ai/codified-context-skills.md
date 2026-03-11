---
title: "The skills to apply codified context to your own codebase"
date: 2026-03-14
categories: [ai]
tags: [claude-code, codified-context, ai-agents]
series: ["codified-context"]
summary: "Two Claude Code skills for applying and maintaining the three-tier codified context architecture in any codebase — what changed day-to-day and how to get started."
slug: "codified-context-skills"
draft: true
---

Ahnii!

> **Series context:** This is part 5 of a five-part series on [Codified Context](/codified-context-the-problem/). This post assumes you've read the full series — [the problem](/codified-context-the-problem/), [the constitution](/codified-context-constitution/), [specialist skills](/codified-context-specialist-skills/), and [cold memory](/codified-context-cold-memory/).

Over the past four posts, the three-tier architecture has been the theory. This post is the practice: what actually changed day-to-day in the codebases that have it, and two skills you can use to apply it to yours.

## What the Three Tiers Changed

The clearest way to describe the improvement is in what stopped happening.

**The linting failures stopped.** Before structured context, AI-generated Go code in north-cloud would routinely use `interface{}` instead of `any`, skip `t.Helper()` in test helpers, or generate functions with cognitive complexity over 20. Each of these failed CI. With the linting rules codified in the constitution's critical gotchas section, these violations dropped to nearly zero.

**The cross-service violations stopped.** Without knowing the import rule — services import only from `infrastructure/`, never from each other — AI sessions would suggest importing directly from another service. Architecturally sound-looking code that breaks the design. The constitution makes the rule explicit and links it to the enforcement: the linter catches violations.

**The Elasticsearch mistakes stopped.** The `content_type` must be `text`, not `keyword`. The search service queries `content_type.keyword`, which only exists on `text` fields. This is the kind of non-obvious constraint that evaporates between sessions. It's in the constitution now and hasn't broken search since.

**Sessions pick up mid-feature without re-onboarding.** In waaseyaa, a session working on the search subsystem loads the search skill, calls `waaseyaa_get_spec("search")`, and has the full interface signatures, DTO structures, caching semantics, and edge cases. A new session on the same feature requires zero re-explanation of "how search works" — the specs carry that context across session boundaries.

**The architecture stayed coherent.** Waaseyaa has seven architectural layers with explicit dependency rules. Without codified context, sessions would occasionally add imports that violated layer boundaries. With the layer rules in the constitution and the per-subsystem skills enforcing domain patterns, the architecture drifts less.

None of these improvements required a smarter model. They required treating context as infrastructure.

## The `codified-context` Skill

The first skill applies the three-tier architecture to a codebase that doesn't have it yet. It walks through eight steps:

1. **Audit existing context** — measure what you have: line count in CLAUDE.md, existing docs, any skills or configurations.
2. **Analyze codebase structure** — map the package/module directory structure, identify layer hierarchy and dependency rules, group packages into logical subsystems.
3. **Identify knowledge to codify** — read existing design docs and separate session artifacts (one-time implementation plans) from reusable knowledge (interface contracts, data flow patterns, gotchas).
4. **Expand the constitution** — add the orchestration trigger table, architecture summary, common operations, and critical gotchas.
5. **Create domain skills** — one skill per subsystem, each with scope, key interfaces, architecture, common mistakes, testing patterns, and related spec pointers.
6. **Write subsystem specs** — file maps, full interface signatures, data flow, storage schema, edge cases.
7. **Build MCP retrieval** — a lightweight Node.js server exposing `list_specs`, `get_spec`, and `search_specs`. Optional for smaller codebases; valuable at twenty or more specs.
8. **Set up maintenance** — the drift detection script and a sustainable update cadence.

To install:

```bash
mkdir -p ~/.claude/skills/codified-context
# Copy SKILL.md into ~/.claude/skills/codified-context/SKILL.md
```

Then in any Claude Code session:

```
/codified-context
```

Claude reads the skill and begins the audit. It inventories what you have, maps your codebase structure, and works through each tier systematically. For a medium-sized project (20K-50K lines), the initial setup typically produces a working constitution in the same session, with skills and specs drafted in follow-up sessions.

The skill is available at `~/.claude/skills/codified-context/SKILL.md`.

## The `updating-codified-context` Skill

The second skill is the one that keeps the system from degrading. Most codified context implementations don't fail at setup — they fail at maintenance. Specs go stale. Skills miss new subsystems. The constitution gets extended with content that should live elsewhere.

The `updating-codified-context` skill is the self-maintenance tool. It handles:

- **Constitution updates** — pruning content that has grown too detailed and moving it to the right tier, adding new orchestration entries for new services or subsystems, keeping the critical gotchas current
- **Subsystem spec updates** — updating interface signatures when APIs change, revising data flow documentation when the implementation changes, adding edge cases discovered during development
- **Defaults and versioning rules** — maintaining the version constraints between architectural layers, updating defaults when framework behavior changes
- **Orchestration table synchronization** — keeping the trigger table aligned with the actual directory structure as the codebase grows

The skill runs the drift detector, reviews flagged specs against recent changes, and guides you through updating the ones that need it. The output is a codified context system that stays accurate rather than one that was accurate when you set it up and degraded over six months.

One pattern worth adopting from all three codebases: add a self-trigger row to your orchestration table.

```markdown
| `docs/specs/**`, `.claude/**`, `**/CLAUDE.md` | updating-codified-context | — |
```

This ensures that any session touching context files — specs, skills, CLAUDE.mds — automatically loads the maintenance skill. The sessions most likely to make a codified context change are the ones that need to know how to make it correctly.

To install:

```bash
mkdir -p ~/.claude/skills/updating-codified-context
# Copy SKILL.md into ~/.claude/skills/updating-codified-context/SKILL.md
```

Run it after any session that changes subsystem interfaces or data flow:

```
/updating-codified-context
```

The right cadence: run it per session when you know something changed, and schedule a full review every two weeks using the drift detector output.

## What to Build First

If you're applying this to an existing codebase, start with Tier 1. A well-structured constitution — orchestration table, architecture summary, common operations, critical gotchas — produces immediate value before you've written a single skill or spec.

The pattern that works:

1. Run `/codified-context` to audit your current state and draft the constitution.
2. Work in the codebase for a week with just the constitution in place. Note the questions AI asks that the constitution doesn't answer.
3. Those questions are your Tier 2 backlog — the subsystems that need specialist skills.
4. Write the first skill for the subsystem where inconsistency is most costly.
5. Note the questions the skill still can't answer. Those are your first specs.

The architecture grows from real friction, not from planning. You'll build the right skills and the right specs because you've observed where the gaps are. Starting with a comprehensive upfront plan produces a lot of documents nobody retrieves.

## The Knowledge-to-Code Ratio

The [Codified Context paper](https://arxiv.org/abs/2602.20478) proposes a metric: knowledge-to-code ratio, defined as lines of codified context divided by lines of source code. The target is above 5%.

North-cloud is at roughly 3-4% today — the constitution and service-level CLAUDE.md files are solid, the specialist skills are in place, but spec coverage is still growing. Waaseyaa is closer to 6-7%, with thirty-four specs backed by MCP retrieval.

The ratio is useful as a progress indicator, not a target to optimize. A codebase with a 10% ratio of thin, low-quality specs is worse than one at 3% with a tight, accurate constitution and two excellent skills.

What the ratio actually measures: whether you've invested in making your architectural knowledge machine-readable, or whether it exists only in your head and evaporates between sessions.

The investment pays compound returns. Every session that gets the context it needs produces better code. Every better-quality commit reduces the gotchas that need to be codified for the next session. Over months of development, the gap between "codebase with structured context" and "codebase without it" widens noticeably.

Baamaapii
