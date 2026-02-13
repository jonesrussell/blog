# Design: Building a Codebase Cleanup Skill for Claude Code

## Goal

Draft blog post that teaches readers how to create Claude Code skills, using a real codebase cleanup skill as the centerpiece. The skill is generalized from a Rust-specific version to work with any codebase. The post includes a live demo of running the skill on this Hugo blog.

## Target Audience

Layered: brief intro for Claude Code newcomers, depth for experienced users.

## Post Structure (Approach A: Tutorial-first)

### Section 1: What Are Claude Code Skills?
- Skills = reusable markdown playbooks in `~/.claude/skills/`
- Invoked with `/skill-name` or auto-triggered
- Not code — structured expertise that guides Claude's approach

### Section 2: The Cleaning-Up-Codebases Skill
- Purpose: systematic audit asking "should this exist?" before "how to improve?"
- Origin: started Rust-focused, generalized for any project
- Design decisions: tiered findings (T1-T4), owner negotiation, verify-before-after
- Full skill embedded as copyable markdown code block

### Section 3: Real-World Demo — Running It On This Blog
- Actual findings from auditing this Hugo blog
- Before/after examples of fixes applied
- Concrete proof the skill works

### Section 4: How to Write Your Own Skills
- File structure and naming conventions
- Key principles: specificity, red flags, anti-patterns, checklists
- Brief mention of Claude Code docs

## Frontmatter
```yaml
title: "Building a Codebase Cleanup Skill for Claude Code"
date: 2026-02-13
categories: [AI, Developer Tools]
tags: [claude-code, skills, code-quality]
slug: "building-codebase-cleanup-skill-claude-code"
draft: true
```

## Deliverables
1. Improve the cleaning-up-codebases skill (generalize from Rust)
2. Run the skill on this blog, capture findings
3. Fix actual issues found
4. Write the blog post with real demo results

## Decisions
- Audience: layered (newcomers + experienced)
- Demo: real audit on this blog (not hypothetical)
- Structure: tutorial-first (intro → skill → demo → teach)
