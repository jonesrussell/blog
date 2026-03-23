---
categories:
    - ai
date: 2026-03-16T00:00:00Z
devto_id: 3386547
draft: false
slug: claude-code-skill-gen-plugin
summary: Use the skill-gen plugin to turn any library's documentation into a reusable Claude Code skill in seconds.
tags:
    - claude-code
    - skills
    - plugins
title: Generate Claude Code skills from any documentation URL
---

Ahnii!

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills are markdown playbooks that teach Claude how to approach specific types of work. Writing them by hand works, but it's slow. The [Firecrawl](https://www.firecrawl.dev/) plugin includes a skill-gen command that scrapes a documentation URL and generates a complete skill file from it. This post covers how to install the plugin, generate your first skill, and refine it into something worth keeping.

## Prerequisites

- Claude Code installed and working
- A documentation URL you want to turn into a skill

## Install the Firecrawl Plugin

```bash
/install-plugin firecrawl
```

The plugin adds several tools. The one you want is `skill-gen`.

## Generate a Skill

Point `skill-gen` at any documentation URL. For example, to generate a skill for [Taskfile](https://taskfile.dev/):

```bash
/firecrawl:skill-gen https://taskfile.dev/usage/
```

Firecrawl scrapes the page, extracts the key concepts, and writes a complete `SKILL.md` with frontmatter, usage guidelines, common patterns, and anti-patterns. The output lands in `~/.claude/skills/<skill-name>/SKILL.md`.

## What You Get

The generated skill follows the standard structure:

```yaml
---
name: taskfile
description: Use when working with Taskfile.yml task definitions...
---
```

Below the frontmatter you get sections covering when to use the skill, core patterns from the documentation, common mistakes, and verification steps. It's a solid first draft, not a finished product.

## Refine the Output

Generated skills are good starting points but they need editing. Here's what to look for:

**Trim the scope.** Skill-gen pulls everything it finds. A skill works better when it's focused. If you generated a skill from React's docs, you'd want to narrow it to the specific patterns your project uses, not all of React.

**Add your project's conventions.** The generated skill knows the library. It doesn't know your codebase. Add your naming conventions, directory structure, and testing patterns.

**Encode decisions, not just facts.** Documentation tells you what an API does. A good skill tells Claude when to use it and when not to. Add judgment calls: "Prefer X over Y when Z" or "Never use this pattern in production code because..."

**Add red flags.** What should Claude avoid? What are the common mistakes your team has hit? These anti-patterns are the most valuable part of a skill and they won't come from documentation alone.

## When to Generate vs Write From Scratch

Skill-gen works best for library-specific skills where the documentation is the source of truth. If you're working with a new framework or API and want Claude to have accurate, current knowledge of it, generate a skill and refine it.

Write from scratch when the skill captures a process or workflow that doesn't live in any documentation. Code review checklists, deployment procedures, debugging playbooks. These encode your team's expertise, not a library's API surface.

## The Skill File Structure

Whether generated or hand-written, skills follow the same layout:

```text
~/.claude/skills/
  your-skill-name/
    SKILL.md
```

The `description` field in the frontmatter determines when Claude invokes the skill. Be specific. "Use when working with Go projects" is too broad. "Use when modifying Taskfile.yml task definitions or adding new task runner commands" tells Claude exactly when to activate.

Baamaapii
