---
name: blog-reviewing
description: Use when reviewing, auditing, or preparing blog posts for publication. Triggers include checking post consistency, reviewing drafts, or auditing all posts against blog standards.
---

# Blog Reviewing

## Overview

Systematically audit blog posts against the canonical style rules defined in the blog-writing skill. Every review follows the same checklist — no ad-hoc exploration.

**Canonical authority:** The style rules in `.claude/skills/blog-writing/SKILL.md` are the source of truth. Read it before reviewing.

## Review Process

1. Read the blog-writing skill to load current style rules
2. Identify the post type (series or general) from frontmatter `series` field
3. Run through the checklist below in order
4. Report findings using the standard format

## Checklist

Run every check. Do not skip items.

### Frontmatter

- [ ] `title` present and in quotes
- [ ] `date` in YYYY-MM-DD format
- [ ] `categories` present, lowercase, hyphenated for multi-word
- [ ] `tags` present, **max 4**
- [ ] `summary` field used (not `description`)
- [ ] `slug` present, lowercase, hyphenated
- [ ] `draft` field present
- [ ] **Series posts only:** `series` field present with correct series name

### Structure

- [ ] Opens with "Ahnii!" (exclamation mark, own paragraph)
- [ ] Closes with "Baamaapii 👋" (with wave emoji, own paragraph)
- [ ] No "Wrapping Up" or "Conclusion" heading
- [ ] No time estimates in section headings
- [ ] Heading hierarchy: H2 → H3, no jumps (no H4, no H1 in body)
- [ ] Engagement prompt present before farewell (question or call-to-action)

### Series Post Structure (only if `series` field exists)

- [ ] Prerequisites blockquote after greeting
- [ ] Problem statement section with real-world analogy
- [ ] Core concepts/interfaces section with code
- [ ] Real-world implementation section
- [ ] Common mistakes section with bad/good code pairs
- [ ] Framework integration section
- [ ] Try it yourself section with companion repo commands
- [ ] What's next section linking to next post in series

### Content

- [ ] All code blocks have language tags
- [ ] Internal links use root-relative format with trailing slash: `/slug/`
- [ ] External links use full HTTPS URLs with descriptive text
- [ ] At least one real-world analogy for technical concepts
- [ ] Tone is conversational, first-person, uses contractions

## Findings Format

Report each finding as:

```
**[CATEGORY]** Line N: description
  Fix: exact correction
```

**Categories:**
- **MISSING** — Required element is absent
- **INCORRECT** — Element exists but violates a rule
- **SUGGESTION** — Not a rule violation, but would improve the post

Always include the line number and a specific fix. Do not report findings without both.

**Example:**
```
**MISSING** Line 50: No farewell. Post ends without "Baamaapii 👋"
  Fix: Add "Baamaapii 👋" as the final line, on its own paragraph

**INCORRECT** Line 13: Greeting uses comma ("Ahnii,") instead of exclamation mark
  Fix: Change "Ahnii," to "Ahnii!"

**SUGGESTION** Line 4: Category "writing" is only used by this one post
  Fix: Consider using a more common category like "career" or "meta"
```

## Batch Mode

When asked to review multiple posts:

1. List all target posts (e.g., all drafts: `grep -l "draft: true" content/posts/*.md`)
2. Identify each post's type (series vs general)
3. Review each post against the checklist
4. Group findings by post with a summary count

**Output format for batch:**
```
## [post-slug.md] — [N findings: X missing, Y incorrect, Z suggestions]
[findings]

## [post-slug.md] — [N findings: ...]
[findings]
```
