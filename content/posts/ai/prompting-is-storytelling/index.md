---
title: "Prompting isn't engineering, it's storytelling"
date: 2026-03-29
categories:
    - ai
tags:
    - prompt-engineering
    - context-engineering
    - ai-tools
summary: "The best prompts don't give instructions. They set a scene the model can reason inside."
slug: "prompting-is-storytelling"
draft: false
devto: true
---

Ahnii!

Everyone keeps framing prompting as a kind of "AI engineering." If you've spent any time doing what people now call [context engineering](https://www.anthropic.com/news/what-is-context-engineering), the pattern becomes obvious: this isn't engineering at all. It's storytelling.

Not storytelling in the "once upon a time" sense. Storytelling in the structural sense: setting the scene so the model knows what world it's stepping into. When you write code, you specify behavior. When you write prompts, you establish a world the model can reason inside. That world matters more than any keyword or formatting trick.

## Large Language Models Improvise Inside Scenes, Not Execute Instructions

The common mental model treats prompting like giving commands:

> "Do X. Produce Y. Follow these steps."

That's not how large language models work. They don't follow instructions like a compiler. They infer the scene, the roles, the relationships, the constraints, and then they improvise the next line that fits.

Give them a thin scene, you get thin results. Give them a rich, coherent world, you get coherent behavior.

This is why the best prompts feel less like configuration and more like [mise en scene](https://en.wikipedia.org/wiki/Mise-en-sc%C3%A8ne): arranging the stage so the actors know how to play the moment. But if the model is reading your scene like stage directions, what exactly should those directions contain?

## Context as Worldbuilding: Five Questions Your Prompt Should Answer

A good prompt answers the same questions a good opening paragraph does:

- **Who are we?** The roles and expertise the model should assume.
- **Where are we?** The project, codebase, domain, or situation.
- **What are the rules?** Constraints, conventions, boundaries.
- **What matters and what doesn't?** Priority signals that shape judgment calls.
- **What tone governs this world?** Formal, casual, terse, exploratory.

You're not telling the model what to do. You're telling it what story it's in. Once that's clear, the rest flows. The model stops guessing and starts collaborating.

That reframe changes how you build prompts entirely.

## Engineering Mindset vs. Storytelling Mindset

If you treat prompting as engineering, you focus on syntax, keywords, and tricks. If you understand it as storytelling, you focus on:

- **Clarity of roles.** Who is the model in this interaction?
- **Coherence of context.** Does everything point the same direction?
- **Constraints that feel natural.** Rules the model can internalize, not fight.
- **Stakes that shape behavior.** What's the cost of getting it wrong?
- **Tone that guides interpretation.** The unspoken rules of the world.

The model stops feeling unpredictable when the scene is clear. It becomes a collaborator who understands the room.

## The Real Skill Behind Effective Prompts

The real skill isn't prompt hacking. It's learning to write the first paragraph so well that the next ten paragraphs practically write themselves.

"Once upon a time, in a land far, far away" isn't childish. It's a pattern: establish the world so the story can unfold. Every detail in that opening line sets expectations. The audience knows they're in a fairy tale. They know the rules. They know the tone.

Your prompts work the same way. Set the scene well enough and the model doesn't need a checklist of instructions. It already knows how to play the part.

Baamaapii
