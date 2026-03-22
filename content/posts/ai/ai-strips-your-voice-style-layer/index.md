---
title: "AI strips your voice because you haven't taught it what to protect"
date: 2026-03-22
categories: [ai]
tags: [claude-code, ai-tools, writing, content-creation]
summary: "Stop AI from stripping your writing voice. Encode your style rules, review the output, and feed corrections back in."
slug: "ai-strips-your-voice-style-layer"
draft: true
---

Ahnii!

Ruth M. Trucks [posted on LinkedIn](https://www.linkedin.com/in/ruth-m-trucks/) that AI doesn't understand intent. She asked Claude to shorten her content and it stripped the curiosity hooks, conversational rhythm, and direct address that made her writing land. She's right about what happened. But the problem isn't that AI can't preserve voice. It's that she didn't tell it what to protect.

This post shows how to build a style layer that travels with every prompt you send to [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) or any AI writing tool. Encode your rules. Review the output. Feed corrections back in.

## Why AI Strips Your Voice

"Shorten this" gives AI one objective and zero constraints. It optimizes for the goal you stated. Your curiosity hooks aren't tagged as protected. Your conversational rhythm has no weight in the prompt. So they go first. They're the easiest tokens to cut.

This is predictable behavior. You asked for shorter. The model delivered shorter. It had no way to know which parts of your writing carry the weight.

Soren Kai made this point in the LinkedIn thread: the prompt-level fix works. Tell AI what to preserve. Give it examples. Share the constraints. But that approach is session-by-session. Close the terminal and it's gone. You start over next time.

The style layer makes it permanent. You define your voice rules once. They load automatically with every prompt. No copy-pasting. No re-explaining. Your constraints survive across sessions, projects, and tools.

## The Style Layer

Two files do most of the work: a template that locks structure, and a style document that locks voice. Together they form the style layer.

**The template.** Every new post on this blog starts from a Hugo archetype. Before you write a word, the structure is already set.

```yaml
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
categories: []
tags: []
summary: ""
slug: "{{ .Name }}"
draft: true
devto: true
---

Ahnii!

<!-- Intro: what this post is + one sentence on scope. Then Prerequisites
(if needed), main sections, optional Verify/Keeping updated.
Close with Baamaapii. See docs/blog-style.md. -->

Your content here...

Baamaapii
```

This archetype pre-fills frontmatter fields, the greeting, and the closing. Hugo generates it automatically when you run `task new-post -- my-slug`. The AI never has to guess your post structure. It's already there.

**The style rules.** A markdown file tells the AI exactly how your writing should sound. Not "be conversational." Specific, checkable constraints. Here are real rules from this blog's style document:

- Open with "Ahnii!", close with "Baamaapii" (no emoji)
- Second person, direct, instructional. Address the reader as "you"/"your". Not corporate.
- Short sentences. One idea per paragraph. No filler or throat-clearing.
- Always specify a language tag on code blocks. After each block, add 1-2 sentences explaining what it does or why.
- Em dashes used sparingly. Heavy dash usage reads as AI-written. Prefer periods, colons, or commas.
- Max 4 tags.
- No "Wrapping Up" or "Conclusion" headings.
- Link first mention of products, tools, or projects.

Each rule is binary. You can check the output against the list and flag violations. "Did the post open with Ahnii?" Yes or no. "Are there more than two em dashes?" Count them. This is what makes style rules useful. Vague guidance like "match my tone" gives AI nothing to optimize for.

**You don't need Claude Code for this.** Paste a style document into any AI chat before asking it to write. ChatGPT, Gemini, Claude on the web. The principle is the same. Give AI a reference document for your voice before it generates a single word. The tool doesn't matter. The constraint document does.
