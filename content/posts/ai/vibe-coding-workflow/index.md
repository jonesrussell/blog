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

The criticism of vibe coding isn't baseless. Developers are shipping AI-generated code they don't understand, and users are finding the bugs. But the critics keep pointing at the tool. Vibe coding isn't the problem. Using it without discipline is. This post covers where the critics go wrong, what bad workflow actually looks like, and what a better workflow looks like instead.

## "You Can't Debug What You Didn't Write" Is a Myth

This claim gets passed around like it's profound. It isn't.

If you've ever traced a bug into a third-party library, you've debugged code you didn't write. If you've read a Laravel stack trace, stepped through a webpack bundle, or dug into a Go runtime panic, you've debugged code you didn't write. The claim is empirically false, and you've probably already disproved it yourself.

The true version of the concern is narrower: you can't debug code you don't *understand*. That's real. But it's a different problem, and it predates AI by decades. What AI changed is the speed at which that debt accumulates. The question is what kind of workflow you have when it does.

## What Bad Workflow Actually Looks Like

You prompt. You accept. You paste. You ship. No review. No tests. No mental model of what the code actually does. When it breaks in production, you can't debug it because you never understood it.

That's the pattern the critics are describing. They're right about what they see. They're wrong about what causes it.

Before AI, copying from Stack Overflow without reading it was the same failure mode. The mechanism changed. The mistake didn't. And if the mistake was always about skipping understanding, then fixing it was always about building understanding back into the process -- not about which tool generated the code.

The question is what that process should look like.
