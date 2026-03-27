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

Ahnii!

The criticism of vibe coding isn't baseless. You've seen it: AI-generated code shipped without review, bugs found by users instead of you. But the critics keep pointing at the tool. Vibe coding isn't the problem. Using it without discipline is. This post covers where the critics go wrong, what bad workflow actually looks like, and what a better workflow looks like instead.

## "You Can't Debug What You Didn't Write" Is a Myth

This claim gets passed around like it's profound. It isn't.

If you've ever traced a bug into a third-party library, you've debugged code you didn't write. If you've read a Laravel stack trace, stepped through a webpack bundle, or dug into a Go runtime panic, you've debugged code you didn't write. The claim is empirically false, and you've probably already disproved it yourself.

The true version of the concern is narrower: you can't debug code you don't *understand*. That's real. But it's a different problem, and it predates AI by decades. What AI changed is the speed at which that debt accumulates. The question is what kind of workflow you have when it does.

## What Bad Workflow Actually Looks Like

You prompt. You accept. You paste. You ship. No review. No tests. No mental model of what the code actually does. When it breaks in production, you can't debug it because you never understood it.

That's the pattern the critics are describing. They're right about what they see. They're wrong about what causes it.

Before AI, copying from Stack Overflow without reading it was the same failure mode. The mechanism changed. The mistake didn't. And if the mistake was always about skipping understanding, then fixing it was always about building understanding back into the process. Not about which tool generated the code.

The question is what that process should look like.

## The Responsibility Didn't Change

You have always been responsible for code you ship. Your own code. A teammate's PR you approved. A library you pulled in without reading the changelog. The review contract has always been the same: understand what you're merging before you merge it.

AI didn't introduce a new kind of responsibility. It made it easier to skip the old one.

Treating AI as an autopilot is the mistake. Treating it as a contributor whose output you review before it ships is the workflow.

## What a Better Workflow Looks Like

Treat AI output like a PR from a junior developer. Read every line before you merge. If a block of code does something you can't explain, that's a review comment, not a ship.

Build a mental model as you go. You should be able to describe what each piece does and why it's there. If you can't, you don't own it yet. Keep working until you do.

Review in chunks, not all at once. A 300-line AI response reviewed as a unit is a 300-line PR approved without reading. Break it into pieces and review each one.

Test before you ship. Not as a formality. As verification. If you don't know what the code is supposed to do, you can't write a test that proves it works.

None of these habits are new. They're the same ones good developers applied before AI existed. The tool changed. The workflow didn't have to.

Baamaapii
