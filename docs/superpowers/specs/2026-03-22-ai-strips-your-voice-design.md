# Design: AI strips your voice because you haven't taught it what to protect

## Context

Responding to Ruth M. Trucks' LinkedIn post claiming "AI does not understand intent" after Claude stripped her voice when shortening content. Building on her observation (not arguing against it) to show that the fix is a persistent style layer, not a human editor.

Soren Kai's comment in the thread describes the prompt-level fix: tell AI what to preserve. That's correct but session-bound. This post shows the persistent, self-improving version.

## Post Metadata

- **Title:** "AI strips your voice because you haven't taught it what to protect"
- **Slug:** `ai-strips-your-voice-style-layer`
- **Date:** 2026-03-22
- **Categories:** [ai]
- **Tags:** [claude-code, ai-tools, writing, content-creation]
- **Summary:** "Stop AI from stripping your writing voice. Encode your style rules, review the output, and feed corrections back in."
- **Draft:** true (review before publish)

## Audience

Both non-technical content creators (Ruth's audience) and developer-writers who use Claude Code. Accessible concept layer with technical depth for those who want it.

## Tone

Build on Ruth's point. She's right that AI strips voice by default. The post shows what changes when you encode your voice as persistent context. No arguing, no correcting. Direct, honest, and grounded in real examples from this blog.

## Voice Constraints (from this brainstorming session)

- No em dashes. Use periods, commas, colons.
- No three-item rhythm patterns ("X, Y, and Z" stacked for polish).
- Short declarative sentences.
- State things directly, no hedging.
- When explaining something abstract, follow immediately with a concrete example.
- No filler transitions.

## Structure

### 1. Intro (Ahnii!)

Ruth M. Trucks posted on LinkedIn that AI doesn't understand intent. She asked Claude to shorten her content and it stripped the curiosity hooks, conversational rhythm, and direct address that made her writing land. She's right about what happened. But the problem isn't that AI can't preserve voice. It's that she didn't tell it what to protect.

This post shows how to build a style layer that travels with every prompt. Encode your rules, review the output, feed corrections back in.

### 2. Why AI Strips Your Voice

"Shorten this" gives AI one objective and zero constraints. It optimizes for the goal you gave it. Your curiosity hooks aren't tagged as protected. Your conversational rhythm has no weight in the prompt. So they go first. They're the easiest tokens to cut.

Acknowledge Soren Kai's comment: the prompt-level fix works. Tell AI what to preserve, give it examples, share the constraints. But that's session-by-session. Close the terminal and it's gone. The style layer makes it permanent.

### 3. The Style Layer

Three pieces that work together:

**The template (archetype).** Every new post starts from a template that enforces frontmatter structure. Before you write a word, the format is right. Show the Hugo archetype.

**The style rules (skill).** A markdown document that tells AI your voice. Not vague guidance like "be conversational." Specific, checkable rules. Show real excerpts from the blog-writing skill:
- Open with "Ahnii!", close with "Baamaapii"
- Second person, direct, instructional
- Short sentences, one idea per paragraph
- After every code block, 1-2 sentences explaining what it does
- Em dashes signal AI writing. Use sparingly (one or two per post max, zero is fine). This author prefers zero.
- Max 4 tags

**Key point for non-coders:** This doesn't require Claude Code. You can paste a style document into any AI chat. The principle is the same: give AI a reference document for your voice before asking it to write.

### 4. Review the Output

A review checklist that catches drift before publishing. Not subjective ("does this sound like me?") but specific, checkable items:
- Greeting present?
- Second person voice throughout?
- No em dashes?
- Code blocks have language tags and explanations?
- First mentions linked?
- Headings are keyword-rich, not generic?

Show that the review skill produces structured findings with line numbers and fixes. This is auditable. You can see exactly what was caught and what was fixed.

### 5. Teach It Your Domain

Voice is half the problem. The other half is substance. AI will write confidently about things that are wrong. A blog post about a CLI tool is useless if the flag doesn't exist.

Real example from this blog: a post about Claude Code hooks used the `--no-milestone` flag for the GitHub CLI. It read perfectly. The flag doesn't exist. Caught it by running the actual command before publishing.

The accuracy checklist in the writing skill requires verifying code against real repos. Interface signatures, method names, class names. AI hallucinates these constantly. The review process catches it.

Domain expertise for content creators looks different (product knowledge, industry terminology, competitive landscape) but the principle is the same. Teach AI what's true before asking it to write about it.

### 6. Feed Corrections Back In

Every correction makes the next session better.

Real example from this brainstorming session: while writing this post's summary, Claude used em dashes. The author caught it. That's the feedback loop in action. The correction becomes a rule: "Em dashes signal AI writing. Don't use them."

Another real example from months ago: Claude used clickbait phrasing in a blog title. "Testing 48 packages without losing your mind." The correction became a rule: "Use direct, professional language. No casual or clickbait phrasing."

Each correction is a permanent improvement. Not a note you forget. A rule that fires every session.

### 7. Observe, Measure, Refine

The system isn't finished. Older posts on this blog still have AI tells. That's expected. The process is:

- **Observe:** Read the output. Catch what doesn't sound right.
- **Measure:** Track what needs fixing. Blog revision plans are in GitHub issues, auditable and prioritized.
- **Refine:** Fix the post, update the rule, review the next post against the updated rules.

This loop is manual today. Automating it is next. Mining real work sessions for patterns, flagging drift automatically, feeding corrections back without a human in the loop every time.

The point isn't perfection. It's that each session is better than the last.

### 8. Baamaapii

Close naturally. No "wrapping up" header. The last section's content should flow into the farewell. The reader already has the takeaway: encode your voice, review the output, feed corrections back in. Let it land.

### 9. How This Post Was Made (collapsible or visually distinct block)

A meta disclaimer that proves the post's own thesis. Quick glance says "AI-assisted." Detailed block shows exactly what went into it. Use an HTML `<details>` element or a styled blockquote.

**At a glance:** This post was written with Claude Code using the style layer described above.

**Details (expandable):**
- **Model:** Claude Opus 4.6
- **Style skill:** `blog-writing` (237 lines of voice rules, structure templates, accuracy checks)
- **Review skill:** `blog-reviewing` (157 lines, checklist with structured findings)
- **Brainstorming session:** ~N back-and-forth exchanges to define audience, tone, structure
- **Voice corrections during this session:** Em dash usage caught in summary draft, three-item rhythm pattern flagged as AI tell
- **Domain accuracy checks:** All code snippets and tool references verified against actual repos and documentation before publish
- **Archetype:** Hugo frontmatter template enforced structure from first line
- **Feedback memories applied:** "No clickbait phrasing" (from past session), "No em dashes" (reinforced this session)
- **Review pass:** Automated checklist run before publish
- **OG image:** Auto-generated from post metadata using Playwright + HTML template
- **Social copy:** Generated alongside the post for Facebook, X, LinkedIn

This block is the proof. Every item listed is a real step in the process, not decoration.

### 10. Skills Behind This Post (separate collapsible block)

A second `<details>` block after "How This Post Was Made." Framed as the skills needed to build this pipeline. Works as a subtle portfolio piece. Scannable categories, expandable for detail.

**Categories and items:**

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

Each item is demonstrated somewhere in the blog posts or infrastructure. Not aspirational. Verifiable.

## Real Examples to Include

1. **Em dash catch (this session):** Summary draft used em dashes. Author caught it. Became a rule.
2. **Clickbait catch (past session):** "without losing your mind" in a title. Became a feedback memory.
3. **--no-milestone catch (this session):** gh CLI flag that doesn't exist. Caught by running the command.
4. **Blog-writing skill excerpts:** Real rules from the skill file (greeting, voice, em dashes, code block explanations).
5. **Review findings format:** Show the structured format with line numbers.
6. **Hugo archetype:** Show the frontmatter template.
7. **GitHub issues #2-#9:** Blog audit tickets tracking revision work.

## What's NOT in This Post

- No deep dive into codified context architecture (that's a developer audience, not Ruth's)
- No Claude Code setup instructions (link to docs for readers who want that)
- No claim that the system is complete (honesty about manual process and revision backlog)
- No arguing with Ruth (building on her point)

## Success Criteria

- A content creator who doesn't code can read this and understand the concept
- A Claude Code user can read this and adopt the approach
- The post itself demonstrates the style layer working (consistent voice, verified accuracy)
- Honest about what's manual, what's automated, and what's still in progress
