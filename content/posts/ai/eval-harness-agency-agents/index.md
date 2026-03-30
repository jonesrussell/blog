---
categories:
    - ai
date: 2026-03-30T00:00:00Z
devto: true
devto_id: 3432081
draft: false
slug: eval-harness-agency-agents
summary: How to build an LLM-as-judge eval system that scores AI agent prompts on quality, identity, and safety.
tags:
    - promptfoo
    - evals
    - ai-agents
    - llm
title: Build an eval harness for 184 AI agent prompts with promptfoo
---

Ahnii!

[Agency-agents](https://github.com/msitarzewski/agency-agents) is an open-source collection of 184 specialist AI agent prompts ([my fork with the eval harness](https://github.com/jonesrussell/agency-agents/tree/feat/eval-harness-clean)). Backend architects, UX designers, historians, game developers. Each prompt is a detailed markdown file with identity, workflows, deliverable templates, and success metrics. But there's no way to know if any of them actually produce good output. You can build a [promptfoo](https://www.promptfoo.dev/)-based eval harness that scores them automatically using LLM-as-judge, and the first run already found a real quality gap.

## Why Agent Prompts Need Evals

You can read an agent prompt and think it looks good. That doesn't scale to 184 agents, and it doesn't catch regressions when someone edits a prompt. You need a system that answers five questions every time:

1. Did the agent complete the task?
2. Did it follow its own defined workflow?
3. Did it stay in character?
4. Is the output actually useful?
5. Is it safe and unbiased?

That's the **eval flywheel**. Define scoring criteria, run agents against representative tasks, judge the outputs automatically, and turn failures into regression tests. The collection can only improve because every failure becomes a test case.

The existing CI for agency-agents is a bash linter that checks if frontmatter fields exist. It can tell you an agent has a `name` and `description`. It can't tell you the agent produces garbage output. What would it look like if it could?

## The Eval Architecture

The eval harness lives in an `evals/` directory at the repo root, self-contained with its own `package.json`. It uses promptfoo to orchestrate three steps per test:

1. Load an agent's markdown file as the system prompt
2. Send it a task from a per-category YAML file
3. Score the output with a separate LLM acting as judge

The judge scores on five criteria, each rated 1-5. An agent passes if the average is 3.5 or higher.

```
evals/
  promptfooconfig.yaml          # main config
  rubrics/
    universal.yaml              # 5 scoring criteria with anchors
  tasks/
    engineering.yaml            # tasks per category
    design.yaml
    academic.yaml
  scripts/
    extract-metrics.ts          # parse agent markdown into structured data
```

The harness doesn't modify any agent files. But it does need to understand them, which means parsing their markdown structure.

## Extract Success Metrics from Agent Prompts

Each agent markdown file has a "Success Metrics" section with criteria like "API response times under 200ms" or "every historical claim includes a confidence level." These feed into the judge's rubric so it knows what good output looks like for each specific agent.

The `extract-metrics.ts` script parses agent files and pulls out three sections: success metrics, critical rules, and deliverable templates.

```typescript
export function parseAgentFile(filePath: string): AgentMetrics {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);
  const category = path.basename(path.dirname(filePath));

  return {
    name: frontmatter.name || path.basename(filePath, ".md"),
    description: frontmatter.description || "",
    category,
    filePath,
    successMetrics: extractSection(content, "Success Metrics"),
    criticalRules: extractSection(content, "Critical Rules"),
    deliverableFormat: extractRawSection(content, "Technical Deliverables"),
  };
}
```

The section extraction handles emoji-prefixed headings (`## 🎯 Your Success Metrics`) and nested sub-headings. It matches case-insensitively on the key phrase, not the exact heading text.

Agent files are inconsistent in ways that matter here. Engineering agents have measurable KPIs ("zero critical vulnerabilities"). Design agents have vague ones ("CSS remains maintainable"). The eval system surfaces this inconsistency, which turns out to be useful feedback for prompt authors even before you look at scores.

## Define the Scoring Rubric

The universal rubric defines five criteria. Each one gets explicit anchor descriptions so the judge knows what a 1 versus a 5 looks like.

```yaml
criteria:
  task_completion:
    name: Task Completion
    rubric: |
      5 - Fully completed with all requested deliverables present and thorough
      4 - Completed with minor gaps
      3 - Partially completed; key elements missing
      2 - Attempted but incomplete or off-target
      1 - Did not attempt or completely failed

  instruction_adherence:
    name: Instruction Adherence
    rubric: |
      The agent defines specific workflows and deliverable templates.
      Score how well the output follows these defined processes.
      5 - Closely follows defined workflow and templates
      4 - Mostly follows with minor deviations
      3 - Partially follows; some structure present but loosely applied
      2 - Shows awareness but largely ignores defined formats
      1 - Completely ignores the agent's defined workflow
```

The remaining three criteria (`identity_consistency`, `deliverable_quality`, `safety`) follow the same pattern. Each rubric can also include agent-specific context from the extracted metrics, so the judge evaluates against the agent's own standards. The question is whether the rubric actually produces meaningful differentiation in practice.

## Write Category Tasks

Each category gets a YAML file with representative tasks at different difficulty levels. Here's the academic category testing the Historian agent:

```yaml
- id: acad-period-check
  description: "Verify historical accuracy of a passage"
  prompt: |
    I'm writing a novel set in 1347 Florence, just before the Black Death.
    Here's a passage I need you to check for historical accuracy:

    "Marco adjusted his cotton shirt and leather boots as he walked
    through the cobblestone streets to the bank. He pulled out a few
    paper bills to pay for a loaf of white bread and a cup of coffee
    at the market stall."

    Please identify any anachronisms and suggest corrections.
```

That passage has at least five anachronisms (paper bills, coffee, cotton availability, white bread, the banking details). A good historian agent should catch them all with source citations. A bad one will miss the subtle ones.

The second task per category is harder: it requires the agent to use its full workflow, not just answer a question. That's where you find out if the prompt's workflow definition actually influences behavior.

## Wire Up promptfoo

The config connects agents, tasks, and rubrics. Each test case loads an agent markdown file via `file://`, sends a task prompt, and runs five LLM-as-judge assertions.

```yaml
providers:
  - id: anthropic:messages:claude-haiku-4-5-20251001
    config:
      max_tokens: 4096
      temperature: 0

defaultTest:
  options:
    provider: anthropic:messages:claude-haiku-4-5-20251001

tests:
  - description: "backend-architect / REST endpoint design"
    vars:
      agent_prompt: file://../engineering/engineering-backend-architect.md
      task: |
        Design a user registration endpoint for Node.js Express
        with PostgreSQL. Include schema, route, and validation.
    assert:
      - type: llm-rubric
        value: |
          TASK COMPLETION: Did the agent produce a REST endpoint design
          with database schema, API route, and validation?
          5 - Fully completed with schema, route, validation, security
          4 - Completed with minor gaps
          3 - Partially completed; key elements missing
          2 - Attempted but incomplete
          1 - Did not address the task
```

Both the agent model and the judge model use Haiku. Using the same model family for both is a trade-off: it's cheap but introduces potential self-preference bias. For a proof-of-concept, the cost savings win. For production evals, you'd want the judge on a different model family.

## Score Tables: 5 Out of 6 Passed

Three agents, two tasks each, five criteria per task. Here are the actual scores from the first run.

### Backend Architect

| Criterion | REST Endpoint | Scaling Review |
|---|---|---|
| Task Completion | 5.0 | 5.0 |
| Instruction Adherence | 4.8 | 5.0 |
| Identity Consistency | 4.7 | 5.0 |
| Deliverable Quality | 4.8 | 4.8 |
| Safety | 5.0 | 5.0 |
| **Result** | **PASS** | **PASS** |

Near-perfect across the board. The scaling review scored a perfect 5.0 on instruction adherence because it followed the agent's System Architecture Specification template exactly.

### Historian

| Criterion | Florence 1347 | Mali Empire |
|---|---|---|
| Task Completion | 5.0 | 5.0 |
| Instruction Adherence | 5.0 | 4.8 |
| Identity Consistency | 4.8 | 4.8 |
| Deliverable Quality | 4.8 | 5.0 |
| Safety | 5.0 | 5.0 |
| **Result** | **PASS** | **PASS** |

The Mali Empire reconstruction earned a perfect 5.0 on deliverable quality for grounding trade goods, currency, and daily life in evidence while clearly marking where it was extrapolating.

### UX Architect

| Criterion | Landing Page | Responsive Audit |
|---|---|---|
| Task Completion | 3.5 | 5.0 |
| Instruction Adherence | 4.5 | 4.8 |
| Identity Consistency | 4.5 | 3.5 |
| Deliverable Quality | 4.5 | 4.5 |
| Safety | 5.0 | 4.5 |
| **Result** | **FAIL** | **PASS** |

Two different problems in one agent. The landing page failed on task completion. The responsive audit passed overall but scored 3.5 on identity consistency: it solved the problem competently but didn't sound like "ArchitectUX." Numbers tell you something is wrong. You need the actual outputs to understand what.

## What the Agents Actually Produced

Here's what the Historian produced when asked to check the 1347 Florence passage:

> **Agent output (excerpt):**
>
> | Anachronism | Why It's Wrong | What's Accurate |
> |---|---|---|
> | **Paper bills** | Paper money didn't circulate in Florence until the 15th-16th centuries. Florence in 1347 used **gold florins** and **silver denari**, plus credit instruments like bills of exchange for large transactions. | Marco would carry a **leather purse with gold or silver coins**. |
> | **Coffee** | Coffee was unknown in Europe until the 16th-17th century. It was an Ottoman/Arab beverage. | Marco would drink **wine** (even at breakfast), **ale**, or **small beer**. |
> | **Cotton shirt** | Cotton was rare and expensive in 1347 Florence. Imported from the Levant and Egypt via Venice. Only the wealthy wore it. | Marco would wear **linen** (if middle-class) or **wool**. |
> | **White bread** | Affordable white bread is a post-industrial product. In 1347, white bread was a **luxury** requiring expensive sifting. | Marco would eat **dark rye or barley bread**, or if prosperous, **mixed grain bread**. |

The judge's reasoning for scoring task completion at 5.0:

> *"The output comprehensively identifies all major anachronisms (paper bills, coffee, white bread, cotton shirt, horse-drawn carriages) with detailed explanations. It provides historically accurate alternatives for each item (gold florins/silver denari, wine/ale, dark bread, linen, pack animals). The response goes beyond the basic requirement by including a period authenticity report, sensory details, and a before/after revision example."*

Now compare that to the UX Architect's failed test. The task asked for a CSS design system foundation for a SaaS landing page. The agent started strong:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  /* ... full typography scale, spacing, shadows ... */
}
```

But the output hit the token limit and cut off mid-sentence in the button styling section. The hero section, features grid, pricing table, and footer layouts were never delivered. The judge caught it:

> *"The agent delivered approximately 60-70% of the requested deliverables. It cuts off mid-sentence in the button styling section and does not include the promised layout structure for hero, features grid, pricing table, and footer sections."*

That's a 3.5 on task completion, right at the pass threshold. It pulled the average below 3.5 for a FAIL. The fix is straightforward: either increase the token limit for design agents that produce verbose CSS, or tune the prompt to prioritize layout structure over exhaustive variable definitions.

## Score Spread Tells You Where to Focus

A Backend Architect scoring 4.7-5.0 across everything means the prompt is well-calibrated. A UX Architect bouncing between 3.5 and 5.0 means the prompt works for some tasks but breaks down on others. That's exactly the kind of signal prompt authors need.

Total cost for this run: 166K tokens, roughly $0.05 at Haiku pricing.

## Run It Yourself

```bash
git clone -b feat/eval-harness-clean https://github.com/jonesrussell/agency-agents.git
cd agency-agents/evals
npm install
export ANTHROPIC_API_KEY=your-key
npx promptfoo eval
```

The eval takes about two minutes. After it finishes, open the interactive results viewer:

```bash
npx promptfoo view
```

You get a browser UI showing each test case, the agent's full output, and the judge's reasoning for every score.

## What Comes Next

This proof-of-concept covers 3 of 184 agents. The eval harness lives on [my fork](https://github.com/jonesrussell/agency-agents/tree/feat/eval-harness-clean) with an [upstream PR](https://github.com/msitarzewski/agency-agents/pull/371) pending. The roadmap has three milestones:

- **M1 (submitted):** Eval harness with 3 proof-of-concept agents
- **M2:** Benchmark dataset covering all 184 agents with baseline scores
- **M3:** CI quality gate so PRs that degrade an agent are automatically flagged

The full 184-agent suite would cost about $1.50 per run. Run it nightly and you have a quality trendline. Run it on PRs and you have a regression gate. The collection can only get better.

Baamaapii
