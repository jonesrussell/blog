# Blog Writing & Reviewing Skills Design

**Date:** 2026-02-21
**Status:** Approved

## Problem

The blog has evolved organically over time with consistent but undocumented writing patterns. Style rules live in CLAUDE.md, the archetype, the meta style-guide post, and tribal knowledge. There's no single enforceable authority that Claude can follow when writing or reviewing posts.

## Goals

1. Standardize blog post creation with enforceable templates
2. Enable systematic review of existing posts for consistency
3. Preserve the blog's distinctive cultural voice (Anishinaabemowin greetings, conversational tone, analogy-driven explanations)

## Research

Analyzed 15+ posts spanning the full git history (pre-Hugo migration through current), the archetype template, CLAUDE.md, hugo.toml, and the author's own style-guide meta-post.

### Key Patterns Identified

- **Cultural identity:** "Ahnii!" greeting and "Baamaapii 👋" farewell are non-negotiable brand elements
- **Two distinct post types:** Series posts (rigid structure) vs general posts (flexible structure)
- **5 style pillars:** Friendly conversational tone, concise & practical content, clear structure, tutorial-friendly format, engagement elements
- **Consistent frontmatter:** title, date, categories, tags (max 4), summary, slug, draft
- **Signature technique:** Real-world analogies to explain technical concepts

## Design

### Two Skills

**Rationale:** Writing and reviewing are distinct workflows with different triggers. Splitting them keeps each skill focused and short.

### Skill 1: blog-writing

**Location:** `.claude/skills/blog-writing/SKILL.md`
**Triggers:** Creating new blog posts, drafting content

**Contains:**
1. **Canonical style rules** — the authoritative source of all writing standards
2. **Post type selection** — series vs general
3. **Series post template:**
   - Ahnii! greeting
   - Prerequisites blockquote (`**Prerequisites:** ... **Recommended:** ... **Pairs with:** ...`)
   - Problem statement with relatable analogy
   - Core concepts/interfaces with code
   - Real-world implementation
   - Common mistakes (bad/good code pairs)
   - Framework integration (Laravel, Symfony, Slim)
   - Try it yourself (companion repo commands)
   - What's next (link to next post)
   - Engagement prompt
   - Baamaapii 👋
4. **General post template:**
   - Ahnii! greeting
   - Hook paragraph (question, story, or relatable scenario)
   - 2-4 content sections with H2 headings
   - Code examples with language tags (when applicable)
   - Practical takeaway
   - Engagement prompt
   - Baamaapii 👋
5. **Frontmatter rules** — all required fields, formatting, constraints
6. **Common writing mistakes** — things that violate the blog's style

### Skill 2: blog-reviewing

**Location:** `.claude/skills/blog-reviewing/SKILL.md`
**Triggers:** Reviewing/auditing existing posts, checking consistency, preparing for publication

**Contains:**
1. **Cross-reference** to blog-writing as canonical style authority
2. **Review checklist:**
   - Frontmatter audit (required fields, max 4 tags, slug format, categories lowercase)
   - Structure audit (greeting/farewell present, correct template adherence, heading hierarchy)
   - Content audit (tone, code block language tags, link formats, engagement element)
3. **Findings format:** missing / inconsistent / suggestion categories with line references
4. **Batch mode:** can audit all posts, all drafts, or all series posts
5. **Fix suggestions:** not just problems, but specific corrections

### Shared Style Rules

| Element | Rule |
|---------|------|
| Greeting | Always "Ahnii!" (exclamation mark) |
| Farewell | Always "Baamaapii 👋" (with wave emoji) |
| Tone | Conversational, first-person, contractions, addresses reader directly |
| Analogies | Technical concepts get a relatable real-world analogy |
| Code blocks | Always specify language tag |
| Internal links | Root-relative with trailing slash: `[Text](/slug/)` |
| External links | Full HTTPS URLs, descriptive text |
| Frontmatter | Required: title, date, categories, tags, summary, slug, draft |
| Categories | Lowercase, hyphenated for multi-word |
| Tags | Max 4 per post |
| Engagement | End with question or call-to-action before farewell |

### File Layout

```
blog/
  .claude/
    skills/
      blog-writing/
        SKILL.md
      blog-reviewing/
        SKILL.md
```

## Implementation Notes

- Skills follow TDD approach: baseline test (agent without skill), write skill, verify compliance, close loopholes
- blog-writing is the canonical style authority; blog-reviewing references it
- Both skills should be concise — under 500 words each where possible
- Templates are inline in SKILL.md, not separate files
