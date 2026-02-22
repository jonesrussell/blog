---
name: blog-writing
description: Use when creating new blog posts, drafting content, or writing articles for this Hugo blog. Triggers include requests to write, draft, or create a post.
---

# Blog Writing

## Overview

Write blog posts that match this blog's distinctive voice: conversational, practical, and culturally grounded with Anishinaabemowin greetings. Every technical concept gets a relatable real-world analogy.

## Style Rules (Canonical Authority)

| Element | Rule |
|---------|------|
| Greeting | Always open with "Ahnii!" (exclamation mark, own paragraph) |
| Farewell | Always close with "Baamaapii 👋" (with wave emoji, own paragraph) |
| Tone | Conversational, first-person, contractions, address reader as "you" |
| Analogies | **Every** technical concept gets a relatable real-world analogy before the technical explanation |
| Code blocks | Always specify language tag (`php`, `bash`, `go`, `dockerfile`, etc.) |
| Internal links | Root-relative with trailing slash: `[Text](/slug/)` |
| External links | Full HTTPS URLs, descriptive link text (never "click here") |
| Engagement | End with a question or call-to-action directed at the reader, before farewell |
| Headings | H2 for main sections, H3 for subsections. No time estimates in headings. |
| No "Wrapping Up" | Do not use a "Wrapping Up" or "Conclusion" heading. Transition naturally to engagement + farewell. |

## Frontmatter (Required Fields)

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
categories: []     # lowercase, hyphenated for multi-word
tags: []           # max 4 tags
summary: ""        # one sentence for listings and SEO
slug: "url-slug"   # lowercase, hyphenated
draft: true
---
```

For series posts, add: `series: ["series-name"]`

## Post Type: General

Use for standalone posts (tutorials, opinions, project showcases, tools).

```
Ahnii!

[Hook paragraph: question, story, or relatable scenario that draws the reader in]

## [Problem/Context Section]

[Real-world analogy explaining the concept]
[Technical explanation building on the analogy]

## [2-3 Content Sections with H2 headings]

[Practical content: code examples, steps, comparisons]
[Each technical concept introduced with an analogy or relatable framing]

## [Practical Takeaway Section]

[Actionable steps the reader can try]

[Engagement prompt: question to the reader or call-to-action]

Baamaapii 👋
```

## Post Type: Series

Use for posts in a multi-part series (e.g., PSR php-fig-standards series).

```
Ahnii!

> **Prerequisites:** [requirements]. **Recommended:** Read [Link](/slug/) first. **Pairs with:** [related posts].

[Hook paragraph connecting to reader's problem/experience]

## What Problem Does [Topic] Solve?

[Relatable real-world analogy (restaurants, factories, airports, etc.)]
[Why this matters — the "before" pain point]

## Core Interfaces / Core Concepts

### 1. [First Concept]
[Code with inline comments]

### 2. [Second Concept]
[Code with inline comments]

## Real-World Implementation

[Working code example — practical, not theoretical]

## Common Mistakes and Fixes

### 1. [Mistake]
[Bad code → Good code with comments explaining why]

### 2. [Mistake]
[Bad code → Good code]

## Framework Integration

### [Framework 1]
[Code example]

### [Framework 2]
[Code example]

## Try It Yourself

[Commands to run from companion repo or hands-on steps]

## What's Next

[Link to next post in series with brief description]

[Engagement prompt]

Baamaapii 👋
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping the analogy | Every post needs at least one real-world analogy before technical explanation |
| Generic closing ("Wrapping Up", "Conclusion") | Transition naturally — no closing header, just engagement + farewell |
| Time estimates in headings ("(5 minutes)") | Don't add reading time estimates to section headings |
| Missing engagement prompt | Always ask the reader a question or suggest an action before farewell |
| More than 4 tags | Pick the 4 most relevant; fewer is fine |
| Forgetting wave emoji | Farewell is "Baamaapii 👋" not just "Baamaapii" |
| Using `description` field | Use `summary` field in frontmatter, not `description` |
