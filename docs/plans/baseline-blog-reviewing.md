# Baseline Test: blog-reviewing skill (no skill loaded)

## Scenario
Asked subagent to review creating-my-style-guide.md for consistency with blog conventions. Agent was told to read other published posts and report all issues.

## What the agent got RIGHT

The agent was impressively thorough without a skill. It caught:
1. Wrong greeting format ("Ahnii," vs "Ahnii!") — with line reference
2. Missing "Baamaapii 👋" farewell
3. Uses `description` instead of `summary` in frontmatter
4. Non-standard section headings
5. No code blocks (unusual for this blog)
6. Verbose engagement prompt
7. "P.S." closing not used elsewhere
8. Post is too short
9. AI disclaimer is non-standard
10. Even categorized issues by severity

## What the agent got WRONG or MISSED

### 1. False positive: flagged missing `series: []` field
The agent said the post should have `series: []` because CLAUDE.md mentions it. But general posts don't need this field — it's only for series posts. The skill needs to know which fields are truly required vs series-only.

### 2. No formal checklist — ad-hoc review
Despite being thorough, the review was exploratory. Different invocations could miss different things. A structured checklist ensures nothing is skipped.

### 3. Inconsistent severity system
Used "Must fix / Should fix / Minor / Worth reviewing" — four tiers that are made up on the spot. The reviewing skill should use a consistent, predefined categorization.

### 4. Missing specific fix suggestions
Most issues describe what's wrong but don't say exactly what to change. E.g., "greeting is wrong" but doesn't say "change line 13 from `Ahnii,` to `Ahnii!`". Fix suggestions should include exact corrections.

### 5. No line references for all issues
Some issues have line numbers, others don't. Every finding should reference the specific line.

### 6. No batch mode awareness
Reviewed a single post. Didn't mention or attempt reviewing related posts or checking cross-post consistency.

### 7. Didn't distinguish post type
Didn't identify this as a general post vs series post, which affects which template expectations apply.

## Summary

The baseline is actually strong on detection but weak on:
- **Structure** — ad-hoc vs systematic checklist
- **Accuracy** — false positive on series field
- **Actionability** — findings need exact fix suggestions with line refs
- **Consistency** — predefined categories, not made-up severity tiers
- **Scalability** — no batch mode
