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
| Code blocks | Always specify language tag. After each block, add 1-2 sentences explaining what it does or why. |
| Links | Link first mention of products, tools, or projects. Internal: root-relative with trailing slash `/slug/`. External: full HTTPS URLs. |
| Headings | H2 for main sections, H3 for variants/subsections. No time estimates. No "Wrapping Up" or "Conclusion". |

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

## Post Type: Series

Use for posts in a multi-part series (e.g., PSR php-fig-standards series).

```
Ahnii!

> **Prerequisites:** [requirements]. **Recommended:** Read [Link](/slug/) first. **Pairs with:** [related posts].

[Intro: what this standard/topic is + one sentence on scope]

## What Problem Does [Topic] Solve?

[Why this matters — the "before" pain point]

## Core Interfaces / Core Concepts

### 1. [First Concept]
[Code with inline comments]
[1-2 sentences explaining the code]

### 2. [Second Concept]
[Code with inline comments]
[1-2 sentences explaining the code]

## Real-World Implementation

[Working code example — practical, not theoretical]
[Explanation of what the code does]

## Common Mistakes and Fixes

### 1. [Mistake]
[Bad code → Good code with comments explaining why]

### 2. [Mistake]
[Bad code → Good code]

## Framework Integration

### [Framework 1]
[Code example + explanation]

### [Framework 2]
[Code example + explanation]

## Try It Yourself

[Commands to run from companion repo or hands-on steps]

## What's Next

[Link to next post in series with brief description]

Baamaapii
```

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
