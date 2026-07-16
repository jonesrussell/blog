---
categories:
    - ai
date: 2026-05-24T00:00:00Z
devto: true
devto_id: 4160838
draft: false
slug: ai-spec-timeline-baseline
summary: AI assistants estimate effort using training data from before they existed, then push back when you try to spec faster. Working around it eats hours every week.
tags:
    - claude-code
    - vibe-coding
    - productivity
title: AI keeps speccing my projects on pre-AI timelines
---

Ahnii!

You sit down to spec a new feature with [Claude Code](https://claude.com/claude-code) or whichever assistant. You describe the surface, the constraints, the slices you want it broken into. The plan comes back: "5 work packages, 6 to 8 weeks." You shipped a 5-WP mission in a day yesterday. This post is about that gap and why it eats more time than it should.

## The pattern

Spec mode is where it shows up worst. You ask for a plan. The plan arrives with timelines attached. Those timelines are calibrated to a world that ended around 2023. A "2-week task" inside a modern plan is often something you can ship the same afternoon if the scope is honest.

When you push back, the assistant does not back down quickly. It cites "industry norms," talks about "code review cycles," reminds you about testing time and edge cases. All of which are real concerns. None of which describe what actually happens when you and an AI co-author the work at full session-pace.

You end up in a loop. You spec. It estimates long. You explain that the work is being done with AI. It hedges. You re-spec. You ship in a fraction of the estimate. Next time you do this same dance again, because the assistant has no persistent sense that you ship faster than the baseline it was trained on.

## Why this happens

Almost every public dataset that taught these models how long things take pre-dates widespread AI-assisted development. Stack Overflow threads from 2019 about how long a Laravel package takes to build. Engineering manager blog posts from 2021 about ticket-pointing conventions. Git histories from teams that did not have Claude on the keyboard. The model sees those signals and projects.

The reasoning models are smart enough to know AI assistance changes velocity. They will say so if you ask them directly. The problem is they do not apply that knowledge to estimation by default. You have to invoke it explicitly, every time, and even then they hedge in case you turn out to be slower than you said.

It is the same failure mode as asking an assistant in early 2024 whether you should use React 18 features. It knows React 19 exists. It does not always update its working assumptions to match.

## What this costs

Two things.

First, time. Every spec session has a recalibration tax. You say two weeks; it says six. You push; it says four. You re-explain; it says three. You ship in two days. Multiply across a year of speccing and you are spending real hours arguing with an estimator that is wrong in one direction.

Second, drift. When you accept a long estimate to move on, the WP breakdown that gets generated is shaped by that estimate. Work packages get padded with imagined complexity to justify the duration. Tasks get split that did not need splitting. You end up implementing a plan designed for a slower world and discovering halfway through that half the WPs collapse into one.

The downstream version of this is worse: an assistant reviewing your PR will sometimes flag "is the scope of this change too large for a single WP?" when the change is fine and the WP boundary was the artifact of a stale estimate.

## What to do about it

The fixes are all small and all annoying because you have to repeat them.

State the velocity assumption in your spec prompt explicitly. "This is being done with AI assistance. Estimate WPs in hours, not days, and assume each WP fits inside a single focused session." This is not subtle and it works. You can put it in your project's spec template so you do not have to remember.

Reject the estimate during planning, not after. If the plan comes back with multi-week WPs, push back before generating the WP breakdown. The breakdown is downstream of the duration assumption; if you let it materialize, you inherit its shape.

Cite recent evidence. "I shipped a 5-WP mission yesterday in a day. Use that as the baseline, not pre-2024 industry norms." The model responds to concrete recent counter-evidence more than to abstract argument.

Strip duration estimates from the plan entirely when you can. Half the time you do not need them and they only exist because the spec template asked for them. A plan that says "5 WPs, dependency-ordered" is more honest than a plan that says "5 WPs, 6-8 weeks." You are not running a Gantt chart. You are sequencing work.

## The deeper problem

This will probably get worse before it gets better. Training data for "how long does this take" lags real-world velocity by a couple of years. Right now the gap is roughly 2023 vs 2026, which is about a 3-5x estimation error in many domains. As AI-assisted development accelerates, that gap widens, and the public-corpus signal stays stuck in the past.

The assistants that handle this well will be ones that calibrate against the user's recent shipping pace, not against the corpus average. That requires per-user telemetry the current tools do not have, or explicit user-state that they do not yet persist between sessions. Until then, the workaround is the four-step dance above.

The honest version of the complaint is not "AI is bad at estimates." It is "AI is estimating on a baseline that the existence of AI itself made obsolete." Worth naming so you can stop arguing with it and just override the defaults.

Baamaapii
