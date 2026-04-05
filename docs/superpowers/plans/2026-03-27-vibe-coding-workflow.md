# Vibe Coding Workflow Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a blog post arguing that vibe coding's problems are a workflow failure, not a tooling failure.

**Architecture:** Opinion post. No code blocks. Five sections: rebuttal of the false premise → diagnosis of bad workflow → philosophical hinge (responsibility didn't change) → practical workflow habits. Stand-alone piece; does not reference other posts.

**Tech Stack:** Hugo, PaperMod theme, markdown. `task new-post` to scaffold, `task serve` to preview.

**Spec:** `docs/superpowers/specs/2026-03-27-vibe-coding-workflow-design.md`

---

### Task 1: Scaffold the post

**Files:**
- Create: `content/posts/ai/vibe-coding-workflow/index.md`

- [ ] **Step 1: Create the post file**

```bash
task new-post -- vibe-coding-workflow
```

Hugo creates `content/posts/vibe-coding-workflow/index.md`. Move it:

```bash
mkdir -p content/posts/ai/vibe-coding-workflow
mv content/posts/vibe-coding-workflow/index.md content/posts/ai/vibe-coding-workflow/index.md
rmdir content/posts/vibe-coding-workflow
```

- [ ] **Step 2: Replace frontmatter**

Open `content/posts/ai/vibe-coding-workflow/index.md` and replace the generated frontmatter with:

```yaml
---
title: "Vibe coding isn't the problem. Your workflow is."
date: 2026-03-27
categories:
    - ai
tags:
    - ai
    - opinion
    - tools
    - workflow
summary: "The critics of vibe coding aren't wrong about the symptoms — they're wrong about the cause."
slug: vibe-coding-workflow
draft: true
devto: true
---
```

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "chore: scaffold vibe-coding-workflow post"
```

---

### Task 2: Write the intro and rebuttal section

**Files:**
- Modify: `content/posts/ai/vibe-coding-workflow/index.md`

- [ ] **Step 1: Write the intro**

After the frontmatter, add:

```markdown
Ahnii!

The criticism of vibe coding isn't baseless. Developers are shipping AI-generated code they don't understand, and users are finding the bugs. But the critics keep pointing at the tool. Vibe coding isn't the problem. Using it without discipline is.
```

One paragraph. State the position immediately. No hedging.

- [ ] **Step 2: Write the rebuttal section**

```markdown
## "You Can't Debug What You Didn't Write" Is a Myth

This claim gets passed around like it's profound. It isn't.

Every developer who has traced a bug into a third-party library has debugged code they didn't write. Every developer who has read a Laravel stack trace, stepped through a webpack bundle, or dug into a Go runtime panic has debugged code they didn't write. The claim is empirically false, and most working developers have disproved it personally.

The true version of the concern is narrower: you can't debug code you don't *understand*. That's real. But it's also a different problem — and it predates AI by decades.
```

- [ ] **Step 3: Style check**

Verify:
- Opens with "Ahnii!" on its own line
- Intro is one paragraph, states position directly
- No em dashes (replace any "—" with period or colon)
- No filler phrases ("it's worth noting", "at the end of the day")
- H2 is keyword-rich and specific
- Section ends with tension that pulls into the next section

- [ ] **Step 4: Preview**

```bash
task serve
```

Check `http://localhost:1313/blog/vibe-coding-workflow/` renders correctly.

- [ ] **Step 5: Commit**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "draft: intro and rebuttal section for vibe-coding-workflow"
```

---

### Task 3: Write the bad workflow diagnosis section

**Files:**
- Modify: `content/posts/ai/vibe-coding-workflow/index.md`

- [ ] **Step 1: Write the section**

```markdown
## What Bad Workflow Actually Looks Like

The critics are observing something real. The pattern they're seeing: prompt, accept, paste, ship. No review. No tests. No mental model of what the code actually does. When it breaks in production, the developer can't debug it because they never understood it.

That's a real problem. But it's not a vibe coding problem. It's a workflow problem.

The same failure mode existed before AI. Copying code from Stack Overflow without understanding it was the prior incarnation. The mechanism changed. The mistake is the same: shipping code you haven't internalized as your own responsibility.
```

- [ ] **Step 2: Style check**

Verify:
- Section doesn't re-explain the intro's setup — it moves forward
- "That's a real problem. But it's not a vibe coding problem." lands as a clean pivot
- Stack Overflow comparison is one sentence — don't over-explain
- Section ends with a pull-through into the next section (the "same mistake" line sets up the responsibility argument)

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "draft: bad workflow section for vibe-coding-workflow"
```

---

### Task 4: Write the hinge section (responsibility didn't change)

**Files:**
- Modify: `content/posts/ai/vibe-coding-workflow/index.md`

This is the pivot of the post. Everything before is diagnosis. Everything after is prescription. Keep it tight.

- [ ] **Step 1: Write the section**

```markdown
## The Responsibility Didn't Change

You have always been responsible for code you ship. Your own code. A teammate's PR you approved. A library you pulled in without reading the changelog. The review contract has always been the same: understand what you're merging before you merge it.

AI didn't introduce a new kind of responsibility. It made it easier to skip the old one.

Treating AI as an autopilot is the mistake. Treating it as a contributor — one whose output you review before it ships — is the workflow.
```

- [ ] **Step 2: Style check**

Verify:
- This is the shortest section. That's intentional. Don't pad it.
- "AI didn't introduce a new kind of responsibility. It made it easier to skip the old one." is the quotable line — don't soften or expand it
- Section transitions directly into the practical section

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "draft: responsibility hinge section for vibe-coding-workflow"
```

---

### Task 5: Write the practical workflow section and close

**Files:**
- Modify: `content/posts/ai/vibe-coding-workflow/index.md`

- [ ] **Step 1: Write the workflow section**

```markdown
## What a Better Workflow Looks Like

Treat AI output like a PR from a junior developer. Read every line before you merge. If a block of code does something you can't explain, that's a review comment, not a ship.

Build a mental model as you go. You should be able to describe what each piece does and why it's there. If you can't, you don't own it yet. Keep working until you do.

Review in chunks, not all at once. A 300-line AI response reviewed as a unit is a 300-line PR approved without reading. Break it into pieces and review each one.

Test before you ship. Not as a formality — as verification. If you don't know what the code is supposed to do, you can't write a test that proves it works.

None of these habits are new. They're the same ones good developers applied before AI existed. The tool changed. The workflow didn't have to.
```

- [ ] **Step 2: Write the closing**

```markdown
Baamaapii
```

- [ ] **Step 3: Style check**

Verify:
- Four concrete habits, each one paragraph
- No bulleted list — the post has been prose throughout, keep it consistent
- "None of these habits are new" lands as the closing argument without needing a header
- Transitions naturally to Baamaapii — no "Wrapping Up" or summary header
- "Baamaapii" is on its own line, no emoji

- [ ] **Step 4: Full post read-through**

Read the complete post top to bottom. Check:
- Voice is second person throughout ("you", "your") — no first person slipping in
- No em dashes used more than once (ideally zero)
- No casual/clickbait phrases
- Each section ends with a reason to read the next
- Word count feels right for an opinion piece (target: 400-600 words in body)

- [ ] **Step 5: Commit**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "draft: complete vibe-coding-workflow post"
```

---

### Task 6: Generate OG image

**Files:**
- Create: `static/images/og/vibe-coding-workflow.png`

- [ ] **Step 1: Generate the image**

```bash
task og:generate
```

- [ ] **Step 2: Verify filename**

```bash
ls static/images/og/ | grep vibe
```

Expected: `vibe-coding-workflow.png`. If the filename has curly quotes or differs from the slug, rename it:

```bash
mv "static/images/og/<wrong-name>.png" static/images/og/vibe-coding-workflow.png
```

- [ ] **Step 3: Commit**

```bash
git add static/images/og/vibe-coding-workflow.png
git commit -m "chore: add OG image for vibe-coding-workflow"
```

---

### Task 7: Write social copy

**Files:**
- Create: `docs/social/vibe-coding-workflow.md`

- [ ] **Step 1: Write the social file**

Create `docs/social/vibe-coding-workflow.md`:

```markdown
# Social copy: Vibe coding isn't the problem. Your workflow is.

**Canonical URL:** https://jonesrussell.github.io/blog/vibe-coding-workflow/

## Facebook

"You can't debug what you didn't write." People keep saying this like it's profound. I debug library code I didn't write every week. The real problem is shipping code you don't understand — and that predates AI by decades. New post on what the actual failure is and what a better workflow looks like.

https://jonesrussell.github.io/blog/vibe-coding-workflow/

#vibecoding #ai #devworkflow #programming

## X (Twitter)

"You can't debug what you didn't write" is false. You've debugged library code you didn't write. The real failure is shipping code you don't understand. That problem predates AI. https://jonesrussell.github.io/blog/vibe-coding-workflow/

## LinkedIn

The criticism of vibe coding describes a real symptom and misses the cause. The problem isn't AI-assisted development. It's shipping code without reviewing it. New post on the workflow that actually changes the outcome.

https://jonesrussell.github.io/blog/vibe-coding-workflow/
```

- [ ] **Step 2: Commit**

```bash
git add docs/social/vibe-coding-workflow.md
git commit -m "chore: social copy for vibe-coding-workflow"
```

---

### Task 8: Publish

- [ ] **Step 1: Set draft to false**

In `content/posts/ai/vibe-coding-workflow/index.md`, change:

```yaml
draft: true
```

to:

```yaml
draft: false
```

- [ ] **Step 2: Final preview**

```bash
task serve:prod
```

Check `http://localhost:1313/blog/vibe-coding-workflow/` — post appears, OG image meta tag is present, no broken links.

- [ ] **Step 3: Commit and push**

```bash
git add content/posts/ai/vibe-coding-workflow/index.md
git commit -m "publish: vibe-coding-workflow"
git push origin main
```

GitHub Actions deploys automatically. Dev.to sync runs after deploy.
