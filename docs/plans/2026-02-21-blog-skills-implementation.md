# Blog Writing & Reviewing Skills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create two skills (blog-writing, blog-reviewing) that enforce consistent blog post style and quality.

**Architecture:** Two SKILL.md files in `.claude/skills/`. blog-writing is the canonical style authority with inline templates. blog-reviewing cross-references it and provides an audit checklist. Both follow TDD for skills: baseline test → write skill → verify → close loopholes.

**Tech Stack:** Markdown skill files, Claude Code subagent testing

---

### Task 1: Create directory structure

**Files:**
- Create: `.claude/skills/blog-writing/` (directory)
- Create: `.claude/skills/blog-reviewing/` (directory)

**Step 1: Create skill directories**

```bash
mkdir -p .claude/skills/blog-writing .claude/skills/blog-reviewing
```

**Step 2: Commit**

```bash
git add .claude/skills/
git commit -m "chore: create blog skill directories"
```

---

### Task 2: RED — Baseline test for blog-writing skill

Run a pressure scenario WITHOUT the skill to document what an agent does wrong when asked to write a blog post. This establishes the baseline behavior to fix.

**Step 1: Run baseline scenario with subagent**

Dispatch a subagent with this prompt (no skill loaded):

> "Write a new blog post about using Docker multi-stage builds for Go applications. The blog is a Hugo site at /home/fsd42/dev/blog/. Read 2-3 existing posts from content/posts/ and the archetype at archetypes/default.md to understand the style, then write the draft post to content/posts/docker-multi-stage-builds-go.md."

**Step 2: Document baseline behavior**

After the subagent completes, read the generated post and document:
- Did it use "Ahnii!" with exclamation mark? Or a variant?
- Did it end with "Baamaapii 👋" (with emoji)?
- Did it include all required frontmatter fields?
- Did it stay under 4 tags?
- Did it use a relatable analogy for the technical concept?
- Did it include an engagement prompt before farewell?
- What template structure did it follow?
- What did it get wrong or miss?

Record findings verbatim in a temporary file: `docs/plans/baseline-blog-writing.md`

**Step 3: Delete the generated post**

```bash
rm content/posts/docker-multi-stage-builds-go.md
```

The baseline post is test data, not real content.

---

### Task 3: GREEN — Write the blog-writing skill

Based on baseline failures from Task 2, write the skill addressing those specific violations.

**Files:**
- Create: `.claude/skills/blog-writing/SKILL.md`

**Step 1: Write the blog-writing SKILL.md**

The skill must contain (refer to design doc for full details):

1. YAML frontmatter with name and description (description starts with "Use when...", no workflow summary)
2. Overview section with core principle
3. Style rules table (canonical authority)
4. Post type decision (series vs general)
5. Series post template (inline, complete structure)
6. General post template (inline, complete structure)
7. Frontmatter rules with all required fields
8. Common mistakes section addressing baseline failures

**Key constraints from writing-skills:**
- Name: only letters, numbers, hyphens
- Description: starts with "Use when...", max 500 chars, no workflow summary
- Under 500 words if possible
- Flowchart only if decision is non-obvious

**Step 2: Verify skill file is valid**

Check:
- YAML frontmatter parses correctly (name + description only)
- Description under 500 characters
- No workflow summary in description
- Templates are complete and accurate

**Step 3: Commit**

```bash
git add .claude/skills/blog-writing/SKILL.md
git commit -m "feat: add blog-writing skill with style rules and templates"
```

---

### Task 4: GREEN — Verify blog-writing skill works

Run the SAME scenario from Task 2, but now WITH the skill loaded.

**Step 1: Run verification scenario with subagent**

Dispatch a subagent with this prompt (skill loaded via @ reference or system context):

> "Using the blog-writing skill at .claude/skills/blog-writing/SKILL.md, write a new blog post about using Docker multi-stage builds for Go applications. Follow the skill exactly. Write the draft to content/posts/docker-multi-stage-builds-go.md."

**Step 2: Compare against baseline**

Read the generated post and verify ALL baseline failures are now fixed:
- Correct greeting: "Ahnii!" ✓/✗
- Correct farewell: "Baamaapii 👋" ✓/✗
- All frontmatter fields present ✓/✗
- Max 4 tags ✓/✗
- Relatable analogy used ✓/✗
- Engagement prompt present ✓/✗
- Correct template structure ✓/✗

Document results in `docs/plans/baseline-blog-writing.md` (append to existing).

**Step 3: Delete the generated post**

```bash
rm content/posts/docker-multi-stage-builds-go.md
```

**Step 4: If failures remain, go back to Task 3 and fix the skill**

---

### Task 5: REFACTOR — Close loopholes in blog-writing skill

Run a DIFFERENT scenario to find new rationalizations or edge cases.

**Step 1: Run edge case scenario with subagent**

Dispatch a subagent with a series post prompt:

> "Using the blog-writing skill at .claude/skills/blog-writing/SKILL.md, write a new PSR series blog post about PSR-17 HTTP Factories. This is part of the php-fig-standards series. Follow the skill exactly. Write to content/posts/psr-17-http-factories.md."

**Step 2: Verify series template compliance**

Check all series-specific requirements:
- Prerequisites blockquote with proper format ✓/✗
- Problem statement with analogy ✓/✗
- Core interfaces section ✓/✗
- Real-world implementation ✓/✗
- Common mistakes with bad/good pairs ✓/✗
- Framework integration section ✓/✗
- Try it yourself with companion repo ✓/✗
- What's next section ✓/✗
- Series field in frontmatter ✓/✗

**Step 3: Fix any new issues in the skill**

Update `.claude/skills/blog-writing/SKILL.md` to address any failures.

**Step 4: Delete the generated post and commit**

```bash
rm content/posts/psr-17-http-factories.md
git add .claude/skills/blog-writing/SKILL.md docs/plans/baseline-blog-writing.md
git commit -m "refactor: close loopholes in blog-writing skill after testing"
```

---

### Task 6: RED — Baseline test for blog-reviewing skill

**Step 1: Run baseline review scenario with subagent**

Dispatch a subagent WITHOUT the reviewing skill:

> "Review the blog post at /home/fsd42/dev/blog/content/posts/creating-my-style-guide.md for consistency with the blog's conventions. Read 2-3 other published posts to understand the style, then report all issues you find."

**Step 2: Document baseline behavior**

Record what the agent catches and misses:
- Did it notice the missing "Baamaapii 👋" farewell?
- Did it check frontmatter completeness?
- Did it flag the missing `summary` field (uses `description` instead)?
- Did it check tag count?
- Did it identify it as a draft that doesn't follow the archetype?
- What format did it report findings in?
- Was the review systematic or ad-hoc?

Record findings in `docs/plans/baseline-blog-reviewing.md`.

---

### Task 7: GREEN — Write the blog-reviewing skill

**Files:**
- Create: `.claude/skills/blog-reviewing/SKILL.md`

**Step 1: Write the blog-reviewing SKILL.md**

The skill must contain:

1. YAML frontmatter (name + description, "Use when..." trigger)
2. Cross-reference to blog-writing as canonical style authority
3. Review checklist (frontmatter → structure → content → links)
4. Findings format (missing / inconsistent / suggestion with line refs)
5. Batch mode instructions
6. Address specific baseline failures from Task 6

**Step 2: Verify skill file structure**

Same checks as Task 3: valid YAML, description constraints, concise.

**Step 3: Commit**

```bash
git add .claude/skills/blog-reviewing/SKILL.md
git commit -m "feat: add blog-reviewing skill with audit checklist"
```

---

### Task 8: GREEN — Verify blog-reviewing skill works

**Step 1: Run verification with the skill loaded**

Dispatch a subagent:

> "Using the blog-reviewing skill at .claude/skills/blog-reviewing/SKILL.md, review the post at /home/fsd42/dev/blog/content/posts/creating-my-style-guide.md. Follow the skill's checklist exactly and report all findings."

**Step 2: Compare against baseline**

Verify all baseline misses are now caught. The review should be systematic, not ad-hoc.

**Step 3: Document results and commit**

```bash
git add docs/plans/baseline-blog-reviewing.md
git commit -m "test: verify blog-reviewing skill catches all style violations"
```

---

### Task 9: REFACTOR — Close loopholes in blog-reviewing skill

**Step 1: Run batch review scenario**

Dispatch a subagent:

> "Using the blog-reviewing skill at .claude/skills/blog-reviewing/SKILL.md, review ALL draft posts in /home/fsd42/dev/blog/content/posts/ (where draft: true). Report findings grouped by post."

**Step 2: Verify batch mode works correctly**

Check:
- Did it find all draft posts?
- Did it apply the correct template expectations (series vs general)?
- Did findings include line references?
- Were fix suggestions specific?

**Step 3: Fix any issues and commit**

```bash
git add .claude/skills/blog-reviewing/SKILL.md docs/plans/baseline-blog-reviewing.md
git commit -m "refactor: close loopholes in blog-reviewing skill after batch testing"
```

---

### Task 10: Clean up and final commit

**Step 1: Remove baseline test files**

The baseline docs served their testing purpose. Remove them:

```bash
rm docs/plans/baseline-blog-writing.md docs/plans/baseline-blog-reviewing.md
```

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete blog-writing and blog-reviewing skills

Two skills for standardizing blog post creation and review:
- blog-writing: canonical style rules, series and general templates
- blog-reviewing: systematic audit checklist with batch mode

Both tested via TDD for skills (baseline → write → verify → refactor)."
```
