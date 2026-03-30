# Agency-Agents Eval System Design

**Date:** 2026-03-30
**Repo:** jonesrussell/agency-agents (fork of msitarzewski/agency-agents)
**Goal:** Build a promptfoo-based evaluation harness that measures specialist agent quality and prevents degradation over time. Intended for upstream contribution.

## Context

agency-agents is a collection of 184 markdown files, each defining a specialist AI agent (identity, personality, workflows, deliverables, success metrics). The repo has no code — agents are consumed by copying markdown into AI tools as system prompts.

Existing CI is a bash linter (`scripts/lint-agents.sh`) that validates frontmatter fields (`name`, `description`, `color`) and checks for recommended sections. There is no quality validation — no one knows if these prompts actually produce good output.

Success metrics within agent files are inconsistent: engineering agents have measurable KPIs ("API response times under 200ms"), while design/academic agents use vague qualitative statements ("CSS remains maintainable"). The eval system will surface this inconsistency as a secondary benefit.

## Architecture

A `promptfoo`-based eval harness in an `evals/` directory at the repo root. It:

1. Reads each agent's markdown file as the system prompt
2. Feeds it a task from a per-category YAML test case file
3. Sends both to an LLM
4. Scores the output using LLM-as-judge against a rubric derived from the agent's own success metrics plus universal criteria
5. Reports pass/fail per agent

### Directory Structure

```
evals/
  promptfooconfig.yaml          # main config
  rubrics/
    universal.yaml              # 5 criteria applied to all agents
    engineering.yaml             # category-specific rubric extensions
    design.yaml
    academic.yaml
    marketing.yaml
    ...
  tasks/
    engineering.yaml             # sample tasks per category
    design.yaml
    academic.yaml
    marketing.yaml
    ...
  scripts/
    extract-metrics.ts           # parse agent markdown -> structured rubric input
  results/
    latest.json                  # most recent full-suite results (gitignored except in CI)
```

### Scoring Rubric

5 universal criteria, each scored 1-5 by LLM-as-judge:

| Criterion | What it measures |
|---|---|
| **Task completion** | Did the agent produce the requested deliverable? |
| **Instruction adherence** | Did it follow its own defined workflow/format? |
| **Identity consistency** | Did it stay in character per personality/communication style? |
| **Deliverable quality** | Is the output well-structured, actionable, and domain-appropriate? |
| **Safety** | No harmful, biased, or off-topic content |

Pass threshold: average score >= 3.5 across all criteria.

Category-specific rubrics extend universal criteria with domain expectations (e.g., engineering agents must produce syntactically valid code, design agents must reference visual principles).

### Metrics Extraction

`extract-metrics.ts` parses each agent markdown file and extracts:
- The "Success Metrics" section content
- The "Technical Deliverables" section (for expected output format)
- The "Critical Rules" section (for constraint validation)

These feed into the LLM-as-judge prompt as additional context for scoring. Agents with no parseable success metrics are scored on universal criteria only.

## Milestones

### M1: Eval Harness (First PR)

**Goal:** Working promptfoo config that evaluates 3 agents and produces scores.

**Deliverables:**
- `evals/promptfooconfig.yaml` with provider config and test suite structure
- `evals/rubrics/universal.yaml` with the 5 universal scoring criteria
- `evals/scripts/extract-metrics.ts` to parse agent files
- 1 task file each for engineering, design, academic (2 tasks each = 6 total)
- 3 proof-of-concept agents evaluated: `engineering-backend-architect`, `design-ux-architect`, `academic-historian`
- `evals/package.json` with promptfoo as dependency
- `evals/README.md` with setup and run instructions

**Success criteria:** Running `npx promptfoo eval` produces a score table for 3 agents across 5 criteria. Scores are reasonable (not all 5s, not all 1s).

### M2: Benchmark Dataset

**Goal:** Test cases covering all 15 categories and all 184 agents.

**Deliverables:**
- 5 golden test cases per category (8-10 for categories with 25+ agents)
- ~80-100 total test cases
- Three difficulty tiers per category:
  - Tier 1 (basic): well-defined task any agent in the category handles
  - Tier 2 (intermediate): requires the agent's specific workflow/process
  - Tier 3 (edge case): ambiguous or out-of-scope request — tests boundary behavior
- Category-specific rubric files for all 15 categories
- Updated promptfooconfig.yaml referencing all categories
- Score baseline: full-suite run with results saved

**Success criteria:** All 184 agents evaluated. Baseline scores established. Agents with poor scores identified (these are candidates for prompt improvement).

### M3: CI Gate

**Goal:** Automated quality enforcement via GitHub Actions.

**Deliverables:**
- `.github/workflows/eval-pr.yml` — runs on PR, evaluates only changed agents, posts score comparison comment, blocks merge if score drops below 3.5
- `.github/workflows/eval-nightly.yml` — full suite nightly, stores results as artifact, commits `evals/results/latest.json`
- Cost controls: cheaper model on PR (Haiku-class), stronger model nightly (Sonnet-class), `--max-concurrency 5`, promptfoo response caching
- PR comment template showing markdown table: agent name, each criterion score, delta from baseline, pass/fail

**Success criteria:** A PR that worsens an agent prompt is automatically flagged. Nightly runs build a quality trendline over time.

## GitHub Issues Breakdown

### M1 Issues

1. **Scaffold evals directory and promptfoo config** — Create `evals/` directory, `package.json` with promptfoo, baseline `promptfooconfig.yaml` with provider setup
2. **Define universal scoring rubric** — Write `evals/rubrics/universal.yaml` with 5 criteria, score anchors (1-5 descriptions), and LLM-as-judge prompt template
3. **Build extract-metrics script** — TypeScript script that parses agent markdown, extracts Success Metrics / Technical Deliverables / Critical Rules into structured JSON for rubric input
4. **Create proof-of-concept task files** — Write 2 tasks each for engineering, design, academic categories in `evals/tasks/`
5. **Wire up 3 agents end-to-end** — Connect backend-architect, ux-architect, historian to the harness. Run eval, verify scores are reasonable.
6. **Write evals README** — Setup instructions, how to run, how to add new test cases, how to interpret scores

### M2 Issues

7. **Create engineering task suite** — 8-10 test cases across 3 difficulty tiers for the engineering category (26 agents)
8. **Create marketing task suite** — 8-10 test cases for marketing (29 agents)
9. **Create specialized task suite** — 8-10 test cases for specialized (28 agents)
10. **Create remaining category task suites** — 5 tasks each for: design, academic, strategy, sales, testing, paid-media, project-management, spatial-computing, support, product, game-development
11. **Write category-specific rubrics** — Extend universal rubric for each category with domain expectations
12. **Run full baseline evaluation** — Execute against all 184 agents, save results, identify low-scoring agents
13. **Document baseline findings** — Summary of scores by category, list of agents scoring below threshold, recommendations

### M3 Issues

14. **Create eval-pr GitHub Actions workflow** — Detect changed agent files, run promptfoo against them, post score comment
15. **Create eval-nightly GitHub Actions workflow** — Full suite run, artifact storage, results commit
16. **Implement score diffing for PR comments** — Compare PR scores against baseline, format as markdown table with deltas
17. **Add cost controls and caching** — Configure model tiers, concurrency limits, promptfoo caching
18. **Document CI setup for contributors** — How the gate works, how to run evals locally before pushing, how to interpret failures

## Technical Decisions

- **Framework: promptfoo** — Industry standard for prompt evaluation. YAML-driven, supports LLM-as-judge natively, has CI mode, handles prompt collections via glob patterns.
- **Language: TypeScript** — Matches promptfoo's ecosystem. The extract-metrics script and any custom assertions use TypeScript.
- **Judge model: Claude Sonnet (nightly) / Claude Haiku (PR)** — Different model family from the agent execution model to avoid self-preference bias. If agents are tested with GPT-4, judge with Claude, and vice versa.
- **Pass threshold: 3.5/5.0 average** — Strict enough to catch degradation, lenient enough that imperfect prompts aren't blocked. Can be tuned after baseline data.
- **Score averaging: 3 judge runs per evaluation** — Reduces variance from LLM judge non-determinism. Median score used.

## Out of Scope

- Modifying any existing agent markdown files (that's separate improvement work informed by eval results)
- Building a web dashboard for results (JSON + CI comments are sufficient)
- Multi-model comparison (evaluating agents across GPT-4 vs Claude vs Gemini) — possible future extension
- The REST API and MCP server on the jonesrussell fork (those are separate from the upstream eval contribution)

## Risks

- **LLM-as-judge reliability** — Mitigated by 3-run averaging, explicit rubric anchors, and using a different model family as judge
- **Cost at scale** — 184 agents x 5 tasks x 3 judge runs = ~2,760 LLM calls per full suite. At ~$0.003/call (Haiku) = ~$8/run. Nightly is acceptable. PR runs only evaluate changed files.
- **Upstream acceptance** — The eval system adds a TypeScript dependency to a markdown-only repo. Mitigated by keeping it isolated in `evals/` with its own `package.json`, and making it opt-in (not required to contribute agents).
