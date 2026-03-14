---
title: "Skills for applying codified context to your own codebase"
date: 2026-03-14
categories: [ai]
tags: [claude-code, codified-context, ai-agents]
series: ["codified-context"]
summary: "Two Claude Code skills for applying and maintaining the three-tier codified context architecture — what they do, how they work, and how to get started."
slug: "codified-context-skills"
draft: false
---

Ahnii!

> **Series context:** This is part 5 of a five-part series on [Codified Context](/codified-context-the-problem/). This post assumes you've read the full series — [the problem](/codified-context-the-problem/), [the constitution](/codified-context-constitution/), [specialist skills](/codified-context-specialist-skills/), and [cold memory](/codified-context-cold-memory/).

Over the past four posts, the three-tier architecture has been the theory. This post is the practice: two [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills) you can install and run against your own codebase today. One sets up the architecture from scratch. The other keeps it from degrading.

Both skills are available in the [jonesrussell/skills](https://github.com/jonesrussell/skills/tree/main/skills) repository.

## Installing the Skills

Both skills are available as a [Claude Code plugin](https://docs.anthropic.com/en/docs/claude-code/plugins) from the [jonesrussell/skills](https://github.com/jonesrussell/skills) repository. Install the `code-quality-skills` bundle from the plugin marketplace:

```bash
/plugin marketplace add jonesrussell/skills
/plugin install code-quality-skills@jonesrussell-skills
```

The first command registers the plugin source. The second installs the bundle containing both `codified-context` and `updating-codified-context` (along with a few other code quality skills). Both are now available as slash commands in any Claude Code session.

## What the Three Tiers Changed

Before diving into the skills, here's what actually improved in the codebases that have this architecture.

**The linting failures stopped.** Before structured context, AI-generated Go code in north-cloud would routinely use `interface{}` instead of `any`, skip `t.Helper()` in test helpers, or generate functions with cognitive complexity over 20. Each failed CI. With the linting rules codified in the constitution's critical gotchas section, these violations dropped to nearly zero.

**The cross-service violations stopped.** Without knowing the import rule — services import only from `infrastructure/`, never from each other — AI sessions would suggest importing directly from another service. Architecturally sound-looking code that breaks the design. The constitution makes the rule explicit.

**Sessions pick up mid-feature without re-onboarding.** In waaseyaa, a session working on the search subsystem loads the search skill, calls `waaseyaa_get_spec("search")`, and gets the full interface signatures, DTO structures, caching semantics, and edge cases. Zero re-explanation needed across session boundaries.

None of these improvements required a smarter model. They required treating context as infrastructure.

## The `codified-context` Skill

Run `/codified-context` in any Claude Code session to apply the three-tier architecture to a codebase that doesn't have it. The skill walks through ten steps — let's look at the ones worth understanding before you run it.

### Step 1: The Audit Table

The skill starts by measuring what you already have. The output is a gap analysis table:

| Tier | Current state | Gap |
|------|--------------|-----|
| 1. Constitution | 45-line CLAUDE.md, no orchestration | Need trigger table, checklists |
| 2. Skills | 2 generic skills, no domain skills | Need 4 domain skills |
| 3. Specs | 3 plan docs (session artifacts) | Need reusable specs + retrieval |

This matters because most projects aren't starting from zero. You probably have a CLAUDE.md, maybe some docs. The audit distinguishes session artifacts (one-time implementation plans) from reusable knowledge (interface contracts, data flow patterns, gotchas). Plans describe what was done. Specs describe how the system works now. You mine the former to create the latter.

### Step 4: The Orchestration Table

The most impactful piece the skill creates is the orchestration trigger table in your constitution:

| File pattern | Specialist skill | Cold memory spec |
|---|---|---|
| `src/auth/*, src/middleware/auth*` | `project:auth` | `docs/specs/authentication.md` |
| `src/api/*, src/routes/*` | `project:api` | `docs/specs/api-layer.md` |
| `docs/specs/**, .claude/**, **/CLAUDE.md` | `updating-codified-context` | — |

That last row is the self-trigger — any session touching context files automatically loads the maintenance skill. This is one of the most useful patterns from all three codebases. The sessions most likely to change codified context are the ones that need to know how to change it correctly.

### Step 5: The 50% Domain Knowledge Rule

When the skill creates domain skills, it applies a quality gate: more than 50% of a skill's lines must be domain knowledge (interface signatures, code patterns, data flow), not behavioral instructions ("you should", "make sure to").

An instruction-heavy skill is a TODO list. A knowledge-heavy skill captures the domain expertise that makes AI-generated code consistent. The skill enforces this ratio during creation.

### Step 7: MCP Tool Design

The skill scaffolds a lightweight MCP server for spec retrieval (~100 lines of Node.js). What's worth knowing is the design principles it follows — these apply to any MCP tool you build:

- **Namespace tool names** with your project prefix (`myproject_get_spec`, not `get_spec`) to avoid collisions
- **Return markdown, not JSON** — AI reasons better about structured text than nested objects
- **Cap search results** to prevent flooding the context window
- **Return helpful errors** — on not-found, list available options so the AI can self-correct without a second tool call

Simple substring matching is sufficient for structured specs. The [paper](https://arxiv.org/abs/2602.20478) found this outperformed more complex retrieval methods.

### Step 8: GitHub Workflow Governance

This step wires milestone and issue tracking into codified context. It creates a `bin/check-milestones` script that runs at session start via a hook, flagging untriaged issues and stale milestones. The five workflow rules it codifies:

1. All work begins with an issue
2. Every issue belongs to a milestone
3. Milestones define the roadmap
4. PRs must reference issues
5. Claude reads the drift report before beginning work

This is optional but valuable — it catches the "new feature with no issue" and "issue with no milestone" drift that compounds over time.

### Step 10: Verification

The skill doesn't just set things up — it verifies the result. The verification runs sixteen checks across four categories:

**Constitution quality gate** — line count under 200, orchestration table present, architecture reference present, cross-tier references present.

**Coverage verification** — every spec referenced in the orchestration table exists on disk, every skill reference resolves, no orphan specs floating unreferenced.

**MCP tools verification** — server starts, config is wired, `list_specs` returns results, `get_spec` retrieves content, `search_specs` finds matches, error responses include available options.

**End-to-end smoke test** — pick 2-3 source files from different subsystems and trace each through the full chain: file path → orchestration table → skill → spec via MCP → actionable knowledge.

Every check produces PASS, WARN, or FAIL. All must pass or warn before setup is considered complete.

## The `updating-codified-context` Skill

The second skill is the one that matters more long-term. Most codified context implementations don't fail at setup — they fail at maintenance. Specs go stale. Skills miss new subsystems. The constitution gets extended with content that should live elsewhere.

Run `/updating-codified-context` after any session that changes subsystem interfaces or data flow. The skill addresses five specific failure modes it was built to prevent.

| Failure mode | What happens | What the skill does |
|---|---|---|
| Skip creating new specs | New services get mapped onto existing specs | Creates `docs/specs/{service}.md` for each new service |
| Miss MCP wiring | Specs exist but aren't retrievable | Checks `.claude/settings.json` for spec-retrieval tools |
| Miss self-trigger | Context file changes don't load the maintenance skill | Adds the orchestration table row |
| Work ad-hoc | No tier ordering, missed dependencies | Enforces T1 → T2 → T3 update order |
| Skip verification | Changes aren't validated | Re-runs drift-detector after every update |

The skill runs the drift detector at both the start and end of a maintenance session. The before run establishes what needs updating. The after run confirms nothing regressed. Any verification failure blocks the commit.

### The Maintenance Cadence

The pattern that works across all three codebases:

- **Per session:** Update affected specs when interfaces or data flow change (~5 minutes when needed)
- **Every two weeks:** Run the drift detector across full history, review flagged specs (~30 minutes)
- **Quarterly:** Audit coverage — are new subsystems missing specs entirely?

The quarterly audit catches the most common drift failure: a new subsystem that grew to production significance without ever getting a spec.

## What to Build First

If you're applying this to an existing codebase, start with Tier 1. A well-structured constitution — orchestration table, architecture summary, common operations, critical gotchas — produces immediate value before you've written a single skill or spec.

The pattern that works:

1. Run `/codified-context` to audit your current state and draft the constitution.
2. Work in the codebase for a week with just the constitution in place. Note the questions AI asks that the constitution doesn't answer.
3. Those questions are your Tier 2 backlog — the subsystems that need specialist skills.
4. Write the first skill for the subsystem where inconsistency is most costly.
5. Note the questions the skill still can't answer. Those are your first specs.

The architecture grows from real friction, not from planning. You'll build the right skills and the right specs because you've observed where the gaps are.

## The Knowledge-to-Code Ratio

The [Codified Context paper](https://arxiv.org/abs/2602.20478) proposes a metric: knowledge-to-code ratio, defined as lines of codified context divided by lines of source code. The target is above 5%.

North-cloud is at roughly 3-4% today — the constitution and service-level CLAUDE.md files are solid, the specialist skills are in place, but spec coverage is still growing. Waaseyaa is closer to 6-7%, with thirty-four specs backed by MCP retrieval.

The ratio is useful as a progress indicator, not a target to optimize. A codebase with a 10% ratio of thin, low-quality specs is worse than one at 3% with a tight, accurate constitution and two excellent skills.

What the ratio actually measures: whether you've invested in making your architectural knowledge machine-readable, or whether it exists only in your head and evaporates between sessions.

The investment pays compound returns. Every session that gets the context it needs produces better code. Every better-quality commit reduces the gotchas that need to be codified for the next session. Over months of development, the gap between "codebase with structured context" and "codebase without it" widens noticeably.

Baamaapii
