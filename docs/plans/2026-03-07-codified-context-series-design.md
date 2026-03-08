# Codified Context Blog Series — Design Doc

**Date:** 2026-03-07
**Cadence:** 1 post/day, Mon-Fri (Week 1)
**Directory:** `content/posts/ai/`
**Tag:** `codified-context`

---

## Series Overview

Documenting the application of [Vasilopoulos, 2025 — arxiv.org/abs/2602.20478] to real codebases.
Live examples: north-cloud (Go microservices monorepo) and waaseyaa/minoo (PHP CMS framework).
Deliverable: two reusable skills readers can install.

---

## Source Repos

| Repo | Tier 1 | Tier 2 | Tier 3 |
|------|--------|--------|--------|
| north-cloud | Root CLAUDE.md (orchestration table) + 14 service CLAUDE.md files | nc-crawler, nc-publisher, nc-classifier, nc-infrastructure, nc-search-indexing skills (+ service CLAUDE.mds as T2) | 8 specs in docs/specs/ + tools/spec-retrieval/ MCP server |
| waaseyaa/framework | Root CLAUDE.md (17KB, full orchestration) | 2 skill files (waaseyaa domain + codified-context); waaseyaa:* orchestration table entries route to MCP tools | 31 specs in docs/specs/ + MCP tools |
| waaseyaa/minoo | Root CLAUDE.md (5KB, app-level) | 1 skill in skills/minoo/ | 5 specs + cross-repo MCP (minoo_* + waaseyaa_*) |
| pipelinex | Root CLAUDE.md (99 lines, single-file) | None | None |

---

## Posts

### Post 1 — The Problem (Monday)

**Title:** Why AI agents lose their minds in complex codebases
**Slug:** `codified-context-the-problem`
**Summary:** Token limits don't scale with codebase complexity — here's what breaks and why.
**Angle:** Set up the problem space. Token limits vs. codebase size. What actually breaks (wrong patterns, stale assumptions, cross-service mistakes). Introduce the paper and the three-tier thesis.
**Example:** North-cloud before codified context.
**Length:** ~1200 words

### Post 2 — Tier 1: The Constitution (Tuesday)

**Title:** Writing a CLAUDE.md that actually works
**Slug:** `codified-context-constitution`
**Summary:** What belongs in your project constitution and what doesn't — with north-cloud and waaseyaa as live examples.
**Angle:** The orchestration trigger table pattern. Critical rules that save every session. The <200-line discipline.
**Primary example:** North-cloud root CLAUDE.md — service routing table, content pipeline summary, critical linting rules.
**Secondary example:** Waaseyaa/framework CLAUDE.md — scales to 29 packages while staying scannable.
**Length:** ~1300 words

### Post 3 — Tier 2: Specialist Skills (Wednesday)

**Title:** Domain specialist skills: teaching AI to think like your senior dev
**Slug:** `codified-context-specialist-skills`
**Summary:** What specialist skills are, when to create one, and how they load domain knowledge on demand.
**Angle:** The >50% domain knowledge rule. Loaded on demand vs. always loaded.
**Primary example:** Waaseyaa framework's 8 skills — what each covers, how the orchestration table triggers them.
**Secondary example:** North-cloud's nc-crawler and nc-publisher skills.
**Contrast:** PipelineX with just a CLAUDE.md — when that's enough.
**Length:** ~1300 words

### Post 4 — Tier 3: Cold Memory (Thursday)

**Title:** Cold memory: specs, MCP tools, and on-demand context retrieval
**Slug:** `codified-context-cold-memory`
**Summary:** How subsystem specs and MCP retrieval tools handle architectural knowledge that's too large for hot memory.
**Angle:** Why specs differ from skills. MCP as the retrieval layer. The drift problem.
**Primary example:** Waaseyaa's 30 framework specs + `waaseyaa_get_spec` / `waaseyaa_search_specs`.
**Secondary example:** North-cloud's 7 specs — simpler (no MCP server), accessed by file reference.
**Gotcha:** Stale specs hurt more than no specs. The drift-detector script.
**Length:** ~1300 words

### Post 5 — Try It Yourself (Friday) — BLOCKED

**Title:** The skills to apply this to your own codebase
**Slug:** `codified-context-skills`
**Summary:** Two skills for applying and maintaining codified context in any codebase.
**Status:** BLOCKED — needs `update-codified-context` skill content from laptop.
**Deliverable:** Direct links to both skills + walkthrough.
**Length:** ~1400 words

---

## Skills for Readers

- `codified-context` — `~/.claude/skills/codified-context/SKILL.md` (confirmed present)
- `update-codified-context` — not found on this machine; retrieve from laptop before writing Post 5

---

## Notes

- Post 5 is explicitly blocked until `update-codified-context` skill is retrieved
- Both series use `content/posts/ai/` directory (new, created as part of this implementation)
