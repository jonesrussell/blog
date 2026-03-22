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

## Review the Output

Style rules only work if you check whether they were followed. A review checklist catches drift before you publish. Not "does this sound like me?" but specific, binary checks you can run against the text.

This blog uses a reviewing skill that runs the same checklist on every post. Here's a subset of the actual checks:

- Does the post open with "Ahnii!" (exclamation mark, own paragraph)?
- Does it close with "Baamaapii" (no emoji, own paragraph)?
- Is the voice second person throughout ("you"/"your", not "I"/"my")?
- Do all code blocks have language tags?
- After each code block, are there 1-2 sentences explaining what it does?
- Is the first mention of each product or tool linked?
- Are headings keyword-rich, not generic like "The Problem" or "The Full Picture"?
- Are em dashes used sparingly (one or two per post max)?
- Do internal links use `relref` shortcodes, not root-relative paths?
- Are tags capped at four, and does each tag appear in the body?

Every item is yes or no. You don't interpret. You check.

The skill produces structured findings in a fixed format:

```text
**[CATEGORY]** Line N: description
  Fix: exact correction
```

Three categories. **MISSING** means a required element is absent. **INCORRECT** means an element exists but violates a rule. **SUGGESTION** means it's not a violation but would improve the post.

Here's what a real finding looks like:

```text
**INCORRECT** Line 13: Greeting uses comma ("Ahnii,") instead of exclamation mark
  Fix: Change "Ahnii," to "Ahnii!"
```

Line number. Problem description. Exact fix. No ambiguity.

This is auditable. You can see exactly what was caught, on which line, and what the correction was. You can verify the fix was applied. Compare that to "I reviewed it and it looks good." One is checkable. The other is a guess.

## Teach It Your Domain

Voice is half the problem. The other half is substance. AI writes confidently about things that are wrong.

A post on this blog about [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) hooks used the `--no-milestone` flag for the GitHub CLI. The prose was clean. The structure followed every style rule. The flag doesn't exist. It was caught because the actual command was run before publishing. Without that step, a fabricated flag ships to readers who will try to use it.

The review checklist for this blog requires verifying code against real repos. Interface signatures, method names, class names, parameter order. AI hallucinates these constantly. The checklist catches it because "does this flag exist?" is a binary check, just like "did the post open with Ahnii?"

Your domain expertise looks different. Product knowledge, industry terminology, competitive landscape, pricing details. The principle is the same. Give AI verified reference material before asking it to write. Real data. Checked facts. Source documents. Not just "write about X." The style layer protects your voice. The domain layer protects your credibility.

## Feed Corrections Back In

Every correction you make sharpens the next session. Two real examples from this blog.

While brainstorming this post, Claude drafted a summary that used em dashes to set off a clause. The author caught it. That correction became a rule: em dashes signal AI-generated writing, so don't use them. The rule now fires on every future draft before a word reaches the page.

In a past session, Claude suggested a blog title: "Testing 48 packages without losing your mind." The author flagged the casual, clickbait phrasing. That correction became a persistent feedback memory: "Use direct, professional language. No casual or clickbait phrasing." The memory loads automatically in every future session across every project. No one has to remember to paste it in.

Each correction is permanent. Not a sticky note you forget. A rule that fires every time. The system gets sharper with use.
