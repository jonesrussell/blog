---
name: blog-writing
description: Use when creating new blog posts, drafting content, or writing articles for this Hugo blog. Triggers include requests to write, draft, or create a post.
---

# Blog Writing

## Overview

Write blog posts that match this blog's voice: second person, direct, instructional, culturally grounded with Anishinaabemowin greetings. Reference post: `content/posts/laravel-boost-ddev.md`. Full style guide: `docs/blog-style.md`.

## Style Rules (Canonical Authority)

| Element | Rule |
|---------|------|
| Greeting | Always open with "Ahnii!" (exclamation mark, own paragraph) |
| Farewell | Always close with "Baamaapii" (no emoji, own paragraph) |
| Voice | Second person, direct, instructional. Address reader as "you"/"your". Not corporate. |
| Concise | Short sentences. One idea per paragraph. No filler or throat-clearing. |
| Scoped intro | In the intro, state what the post covers in one sentence |
| Code blocks | Always specify language tag. After each block, add 1-2 sentences explaining what it does or why. For error output, reformat for readability — don't carbon-copy terminal noise. |
| Links | Link first mention of products, tools, or projects. Internal: root-relative with trailing slash `/slug/`. External: full HTTPS URLs. |
| Headings | H2 for main sections, H3 for variants/subsections. No time estimates. No "Wrapping Up" or "Conclusion". Use SEO-friendly headings with keywords (e.g., "Fix WSL Browser Hangs With BROWSER=echo" not "The Fix"). |
| Em dashes | Use sparingly. Heavy "—" usage reads as AI-written. Prefer periods (two short sentences), colons, or commas. One or two per post is enough; zero is fine. |

## Frontmatter (Required Fields)

```yaml
---
title: "Post Title"        # sentence case, descriptive
date: YYYY-MM-DD
categories: []              # lowercase, hyphenated for multi-word
tags: []                    # max 4 tags
summary: ""                 # one sentence: outcome or audience
slug: "url-slug"            # kebab-case
draft: true
---
```

For series posts, add: `series: ["series-name"]`

Categories can be a single value or multiple: `categories: [ai, php]`

## Post Type: General

Use for standalone posts (tutorials, tools, project showcases).

```
Ahnii!

[Intro: what the thing is (link first mentions) + one sentence on scope]

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## [Main Section]

[Content with code examples]
[After each code block: 1-2 sentences explaining what it does]

## [Additional Sections as needed]

[Use H3 for variants, e.g. "Standard Setup" / "WSL Setup"]

## [Verify / Follow-up section when relevant]

[e.g. "Verify It Works", "Keeping X Updated"]

Baamaapii
```

## Post Type: Series (Intro Post)

Use for the **first post** of a multi-part series. Announce the series inline in the intro paragraph and close with a "## What This Week Covers" or "## What This Series Covers" section previewing the schedule.

```
Ahnii!

[Intro: what the project/topic is (link first mentions) + one sentence that names the series and its scope]

[Series announcement: "This week is a N-part series covering X. Each post covers..."]

## Why [Topic] Exists

[Motivation — the "before" pain point or design rationale]

## [Core Concept / Architecture]

[Key ideas, optionally with a diagram or code]

## What This Week Covers

**Monday** — [Post 1 topic]

**Tuesday** — [Post 2 topic]

[etc.]

Baamaapii
```

## Post Type: Series (Continuation Post)

Use for **parts 2+ of a series**. Open with a "Series context" blockquote. Section names should match the content — don't force a rigid template. Analytical/essay posts use custom sections; code-heavy posts (e.g., PSR deep-dives) may use Core Concepts / Real-World Implementation / Common Mistakes. Close with an inline teaser paragraph linking to the next part, not a "## What's Next" heading.

```
Ahnii!

> **Series context:** This is part N of a [Series Name](/series-intro-slug/) series. Read [part N-1](/prev-slug/) for [brief context].

[Intro: what this post covers in one sentence]

## [Section Matching the Content]

[Content — analytical, instructional, or code-heavy as appropriate]

## [Additional Sections]

[Inline teaser before farewell: "Tomorrow: X — brief description."]

Baamaapii
```

**For code-heavy series posts** (PSR standards, API deep-dives), these sections work well:

```
## What Problem Does [Topic] Solve?
## Core Interfaces / Core Concepts
### 1. [Concept] / ### 2. [Concept]
## Real-World Implementation
## Common Mistakes and Fixes
## Framework Integration
## Try It Yourself
```

Do not force these sections on analytical or essay-style posts.

## Screenshots

When a post covers UI, web tools, or anything visual, use the Playwright MCP to capture screenshots.

### When to Include Screenshots

- Documentation or dashboard walkthroughs
- Before/after UI changes
- Error messages in browser dev tools
- OAuth flows or login screens
- Any step where "what you should see" helps the reader

### How to Capture

1. Use `browser_navigate` to load the page
2. Use `browser_take_screenshot` to capture:
   - `filename`: Save to `static/images/posts/{slug}/` with descriptive name
   - `fullPage: true` for full-page captures when needed
   - `element` + `ref` to screenshot a specific element (get ref from `browser_snapshot`)

### In the Post

```markdown
![Description of what the screenshot shows](/blog/images/posts/{slug}/screenshot-name.png)
```

Note: The `/blog/` prefix is required because the site's baseURL is `https://jonesrussell.github.io/blog/`. Without it, images break in both local dev and production.

Add a brief caption or follow with 1-2 sentences explaining what the reader should notice.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Adding emoji to farewell | Farewell is "Baamaapii" — no emoji |
| First-person voice | Use second person: "your project", "you can" — not "I found", "my setup" |
| No explanation after code blocks | After every code block, add 1-2 sentences on what it does or why |
| Not linking first mentions | Link products/tools/projects on first mention |
| Generic closing ("Wrapping Up", "Conclusion") | No closing header — transition naturally to farewell |
| Time estimates in headings | Don't add reading time to headings |
| More than 4 tags | Pick the 4 most relevant; fewer is fine |
| Using `description` field | Use `summary` in frontmatter, not `description` |
| Filler in intro | State what the post covers in one sentence. No throat-clearing. |
| Generic headings | Use descriptive, keyword-rich headings. "Why CLI Tools Hang in WSL" not "The Problem". |
| Carbon-copy terminal output | Reformat error output for readability. Break long lines, remove noise, keep the key details. |
| Too narrow scope | If a fix applies broadly, generalize the post. Cover the pattern, not just one tool. |
| Overusing em dashes (—) | Replace with periods (split into two sentences), colons, or commas. Heavy dash use reads as AI slop. |
| "## What's Next" heading in series | Use an inline teaser paragraph before Baamaapii, not a H2 heading. |
| "**Prerequisites:**" blockquote label | Series continuation posts use `> **Series context:** This is part N of...` — not "Prerequisites/Recommended/Pairs with". |
| Forcing PSR template on analytical posts | Section names should fit the content. Essay-style series posts use custom headings, not Core Interfaces / Common Mistakes / Framework Integration. |
