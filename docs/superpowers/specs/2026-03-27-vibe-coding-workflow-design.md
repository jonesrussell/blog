# Spec: Vibe Coding Isn't the Problem. Your Workflow Is.

**Date:** 2026-03-27
**Slug:** `vibe-coding-workflow`
**Category:** ai
**Tags:** ai, opinion, tools, workflow
**Summary:** The critics of vibe coding aren't wrong about the symptoms — they're wrong about the cause.

---

## Angle

Rebuttal + constructive. Uses Option B's hook ("your workflow is the problem") as the frame, with Option C's philosophical core ("the responsibility didn't change") as the argument that gives it staying power.

The post agrees that bad outcomes exist. It disagrees on the diagnosis. The critics are describing bad workflow and blaming the tool.

---

## Structure

### 1. Intro

One short paragraph. Acknowledge the criticism exists and has real examples behind it. State the position immediately: vibe coding isn't the problem — using it without discipline is. No hedging.

### 2. "You Can't Debug What You Didn't Write" Is Wrong

Punch a hole in the premise directly. Every developer who has traced a bug into a third-party library, read a framework stack trace, or stepped through vendor code has debugged code they didn't write. The claim is empirically false.

The *true* version of the concern: you can't debug code you don't *understand*. That's a different problem, and it predates AI entirely.

### 3. What Bad Workflow Actually Looks Like

Give the critics their due — they're observing something real. The pattern they're seeing: prompt → accept → paste → ship. No review. No tests. No mental model of what the code does. That's the actual problem. Calling it "vibe coding" names the mechanism but misses the cause.

Note: this pattern existed before AI. Copy-paste from Stack Overflow without understanding was the prior incarnation.

### 4. The Responsibility Didn't Change

The C insight, kept tight. Developers have always been responsible for code they ship: their own, a teammate's PR, a pulled-in library. AI is just another contributor. The review contract is the same — read it, understand it, verify it before it ships.

AI didn't introduce a new kind of responsibility. It made it easier to skip the old one.

This section is the hinge. Everything before it is diagnosis; everything after is prescription.

### 5. What a Better Workflow Looks Like

Practical habits, not a manifesto. Concrete and short:

- Treat AI output like a PR from a junior dev: read every line before you merge
- Build a mental model as you go — if you can't explain what a piece does, you don't own it yet
- Review in chunks, not all at once
- Tests are verification, not an afterthought — write or run them before you ship

Don't over-explain. These habits are the same ones good developers applied before AI existed.

### 6. Baamaapii

---

## Tone Notes

- Direct and confident, not preachy
- Agree with the symptom, dispute the diagnosis
- The "you can't debug what you didn't write" claim gets one clear refutation — don't belabor it
- The workflow section should feel like advice from a peer, not a lecture
- No em dashes; prefer periods and colons
- No clickbait softening ("you won't believe", "without losing your mind") — style guide prohibits it

---

## What This Post Is Not

- Not a takedown of the original tweet or its author
- Not a defense of careless coding
- Not a tutorial (no code blocks needed)
- Not related to "back-to-riding-horses" — stands alone

---

## Frontmatter

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
