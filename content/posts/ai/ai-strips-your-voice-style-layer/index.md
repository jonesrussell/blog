---
categories:
    - ai
date: 2026-03-22T00:00:00Z
devto_id: 3386546
draft: false
slug: ai-strips-your-voice-style-layer
summary: Stop AI from stripping your writing voice. Encode your style rules, review the output, and feed corrections back in.
tags:
    - claude-code
    - ai-tools
    - writing
    - content-creation
title: AI strips your voice because it doesn't know what to protect
---

Ahnii!

Ruth M. Trucks [posted on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7441491723412951040/) that AI doesn't understand intent. She asked Claude to shorten her content and it stripped the curiosity hooks, conversational rhythm, and direct address that made her writing land. She's right. That's exactly what happens by default. AI doesn't know what to protect unless you tell it.

This post shows how to build a style layer that travels with every prompt you send to [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) or any AI writing tool. Encode your rules. Review the output. Feed corrections back in.

## The Fix Is a Constraint Document, Not a Better Prompt

You can tell AI "keep my hooks, preserve the rhythm, don't touch the direct address." That works — once. Close the session and it's gone. Next time you start over, re-explaining the same constraints, hoping you remember them all.

The style layer makes your voice permanent. Two files: a template that locks structure, and a style document that locks voice. They load before AI generates a single word. Every session. Every project. No copy-pasting.

Here's what that looks like in practice. Every new post on this blog starts from a Hugo archetype. Before you write a word, the structure is already set.

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

Hugo generates this automatically when you run `task new-post -- my-slug`. The AI never has to guess your post structure. It's already there.

But structure alone won't save your voice. "Be conversational" gives AI nothing to work with. You need specific, checkable constraints. Here are real rules from this blog's style document:

- Open with "Ahnii!", close with "Baamaapii" (no emoji)
- Second person, direct, instructional. Address the reader as "you"/"your". Not corporate.
- Short sentences. One idea per paragraph. No filler or throat-clearing.
- Always specify a language tag on code blocks. After each block, add 1-2 sentences explaining what it does or why.
- Em dashes used sparingly. Heavy dash usage reads as AI-written. Prefer periods, colons, or commas.
- Max 4 tags.
- No "Wrapping Up" or "Conclusion" headings.
- Link first mention of products, tools, or projects.

Each rule is binary. "Did the post open with Ahnii?" Yes or no. "Are there more than two em dashes?" Count them. Vague guidance like "match my tone" gives AI nothing to optimize for. Binary rules give it everything.

**You don't need Claude Code for this.** Paste a style document into any AI chat before asking it to write. ChatGPT, Gemini, Claude on the web. The tool doesn't matter. The constraint document does.

But rules you never enforce are rules that don't exist. That's the next piece.

## Review the Output

This blog uses a reviewing skill that turns every style rule into a yes-or-no check. Pass or fail. No interpretation. The skill produces structured findings:

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

One is checkable. The other is a guess. And if voice were the only thing AI got wrong, you'd be done here. It's not.

## Teach It Your Domain

AI writes confidently about things that are wrong.

A post on this blog about Claude Code hooks used the `--no-milestone` flag for the GitHub CLI. The prose was clean. The structure followed every style rule. The flag doesn't exist. It was caught because the actual command was run before publishing. Without that step, a fabricated flag ships to readers who will try to use it.

The review checklist for this blog requires verifying code against real repos. Interface signatures, method names, class names, parameter order. AI hallucinates these constantly. The checklist catches it because "does this flag exist?" is a binary check, just like "did the post open with Ahnii?"

Your domain expertise looks different. Product knowledge, industry terminology, competitive landscape, pricing details. The principle is the same. Give AI verified reference material before asking it to write. Real data. Checked facts. Source documents. Not just "write about X." The style layer protects your voice. The domain layer protects your credibility.

## Feed Corrections Back In

Every correction you make sharpens the next session. Two real examples from this blog.

While brainstorming this post, Claude drafted a summary that used em dashes to set off a clause. The author caught it. That correction became a rule: em dashes signal AI-generated writing, so don't use them. The rule now fires on every future draft before a word reaches the page.

In a past session, Claude suggested a blog title: "Testing 48 packages without losing your mind." The author flagged the casual, clickbait phrasing. That correction became a persistent feedback memory: "Use direct, professional language. No casual or clickbait phrasing." The memory loads automatically in every future session across every project. No one has to remember to paste it in.

Each correction is permanent. Not a sticky note you forget. A rule that fires every time. The system gets sharper with use.

## Observe, Measure, Refine

The system isn't finished. Older posts on this blog still have AI tells. Filler transitions, generic headings, em dashes where periods belong. That's expected. A style layer doesn't retroactively fix everything you published before it existed.

The process is straightforward. Read your own output with fresh eyes. Catch what doesn't sound right. Track what needs fixing.

Not a vague sense that "some posts need work." File specific issues:

- These five posts have generic headings.
- Those ten posts lean too hard on em dashes.

Each one is scoped and trackable.

This loop is manual today. I read, I flag, I fix. Automating it is next. I'm working on mining real work sessions for patterns, flagging drift automatically, and feeding corrections back without me in the loop every time. The style rules are already machine-checkable. Connecting them is engineering, not invention.

The point isn't perfection. It's that each session is better than the last. Your voice gets clearer. The rules get tighter. The output gets closer to what you'd write yourself. That's the whole game.

Baamaapii

<details>
<summary>How this post was made</summary>

This post was written with Claude Code using the style layer described above.

- **Model:** Claude Opus 4.6
- **Style skill:** blog-writing (voice rules, structure templates, accuracy checks)
- **Review skill:** blog-reviewing (checklist with structured findings)
- **Brainstorming session:** ~25 back-and-forth exchanges to define audience, tone, and structure
- **Voice corrections during this session:** Em dash usage caught in summary draft, three-item rhythm pattern flagged as AI tell
- **Domain accuracy checks:** All code snippets and tool references verified against actual repos and documentation before publish
- **Archetype:** Hugo frontmatter template enforced structure from first line
- **Feedback memories applied:** "No clickbait phrasing" (from past session), "No em dashes" (reinforced this session)
- **Review pass:** Automated checklist run before publish
- **OG image:** Auto-generated from post metadata using Playwright + HTML template
- **Social copy:** Generated alongside the post for Facebook, X, LinkedIn

</details>

<details>
<summary>Changelog</summary>

- **2026-03-22:** Published
- **2026-03-24:** Revised intro pacing and section flow based on copywriter feedback (Ruth M. Trucks) — tightened the hook, cut redundant explanation, added forward momentum between sections

</details>

<details>
<summary>Skills demonstrated across this blog and its infrastructure</summary>

- **Languages:** Go, PHP, TypeScript, Python, Bash, Markdown, YAML
- **AI and Automation:** Claude Code, Claude API, MCP tools, prompt engineering, skills/knowledge curation for AI agents, OG image generation (Playwright)
- **Web Frameworks:** Laravel 12, Vue 3, Hugo, Tailwind CSS, Inertia.js
- **Backend and Architecture:** Clean Architecture, Uber FX (DI), Redis pub/sub, microservices pipeline, REST API design, PSR standards (1-20)
- **DevOps and Infrastructure:** Docker, GitHub Actions CI/CD, GitHub Pages, Deployer, Caddy, Ansible, DigitalOcean, systemd, UFW/fail2ban
- **Security:** SSH hardening, SSL/TLS, secrets management, kernel hardening, security headers, rate limiting
- **Testing and Quality:** Pest, Vitest, testify, golangci-lint, PHP Pint, TDD, code auditing
- **Tools:** Git, VS Code, Claude Code, DDEV, Task (Taskfile), Playwright, WSL
- **Content and SEO:** Technical writing, static site optimization, OpenGraph, RSS, content curation, multi-platform social copy
- **Project Management:** GitHub Issues, milestone tracking, audit workflows, monorepo maintenance, open-source contribution

</details>
