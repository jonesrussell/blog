# Claude Code Plugins Blog Series — Design Spec

## Overview

A 6-post daily series (March 15–20, 2026) covering five Claude Code plugins through the lens of a real feature build: refactoring the resources page on jonesrussell.github.io/me/ (SvelteKit 5 + Svelte runes).

**Series slug:** `claude-code-plugins`
**Tagline:** "The plugin stack that replaced half my dev workflow"
**Audience:** Developers already using Claude Code who want to level up with plugins.

## Narrative Structure

The series follows a "Dev Cycle Narrative" — each post covers one plugin by showing how it contributed to a specific stage of the resources page refactor. Readers follow along as hardcoded resource cards become a filterable, searchable, properly designed page.

The refactor is real work on the `jonesrussell/me` repo. Posts tell the story of that work, not a hypothetical exercise.

## Plugin Reference

| Informal Name | Marketplace Name | Install Command |
|---------------|-----------------|-----------------|
| Superpowers | Superpowers | `/install-plugin superpowers` |
| Context7 | Context7 | `/install-plugin context7` |
| Frontend Design | Frontend Design | `/install-plugin frontend-design` |
| Code Review | Code Review | `/install-plugin code-review` |
| GitHub | GitHub | `/install-plugin github` |

## Schedule

Dates are targets. Posts publish as they're ready; the refactor and capture work may shift dates.

| # | Date (Target) | Plugin | Dev Stage | Post Title (Working) |
|---|---------------|--------|-----------|---------------------|
| 1 | Mar 15 (Sun) | Intro | — | The plugin stack that replaced half my dev workflow |
| 2 | Mar 16 (Mon) | Superpowers | Brainstorming & planning | Designing a feature before writing a line of code |
| 3 | Mar 17 (Tue) | Context7 | Research | Pulling live docs into your context window |
| 4 | Mar 18 (Wed) | Frontend Design | Implementation | Building UI that doesn't look AI-generated |
| 5 | Mar 19 (Thu) | Code Review | Quality | Catching what you missed with specialized review agents |
| 6 | Mar 20 (Fri) | GitHub | Shipping | From branch to merged PR without leaving the terminal |

## Post Template

Each post follows blog conventions (see `docs/blog-style.md`):

**Opening:** "Ahnii!" + one paragraph connecting to the series narrative.

**Body:**
- Brief context on where we are in the refactor
- Introduce the plugin — what it does, how to install it
- Live walkthrough — show the plugin in action on the resources page refactor
- Key takeaways — 2-3 things the reader should remember

**Closing:** Tease the next post + "Baamaapii"

**Frontmatter:**
```yaml
title: "Post Title"
date: YYYY-MM-DD
categories: ["Developer Tools"]
tags: ["claude-code", "ai", "<plugin-specific>", "svelte"]
series: ["claude-code-plugins"]
summary: "One sentence"
slug: "kebab-case"
draft: true
```

## Post Details

### Post 1: Intro (Mar 15)

**Purpose:** Hook readers, explain the plugin system, set up the refactor narrative.

**Content:**
- Open with the bold claim ("replaced half my dev workflow"), then earn it with a quick overview
- Educate: what Claude Code plugins are, how the marketplace works, installation
- Show the current resources page — hardcoded data in `+page.ts`, basic cards, no filtering, single featured video, stubbed AI category
- Preview each plugin and its role in the refactor
- Include series table of contents (update with links as posts publish)
- No code changes — this is the "before" photo

**Capture needs:** Screenshot of current resources page. Screenshot of plugin marketplace.

### Post 2: Superpowers (Mar 16)

**Purpose:** Deep dive into the orchestration plugin. The flagship post.

**Content:**
- Show the brainstorming skill — clarifying questions, approach proposals, design sections
- Walk through writing-plans — spec-to-plan pipeline
- Real terminal output from the resources page brainstorming session
- Cover key skills: brainstorming, writing-plans, executing-plans, TDD, systematic-debugging
- Deepest post in the series — full orchestration philosophy

**Capture needs:** asciinema recordings of brainstorming session, plan output.

### Post 3: Context7 (Mar 17)

**Purpose:** Show how live docs solve the training cutoff problem.

**Content:**
- Problem: LLM training cutoffs mean stale API knowledge
- Show `resolve-library-id` for SvelteKit, then `query-docs` pulling current Svelte 5 runes docs
- Demonstrate how accurate, version-specific examples feed into implementation
- Quick comparison: with vs without Context7

**Capture needs:** asciinema of Context7 resolving library IDs and pulling docs.

### Post 4: Frontend Design (Mar 18)

**Purpose:** Show the plugin building distinctive UI.

**Content:**
- Show the skill generating new resources page components
- Highlight how it avoids generic AI aesthetics — distinctive design choices
- Real before/after of the resources page UI
- How it works with existing CSS layers and design tokens in the `me` project

**Capture needs:** OBS recording or screenshots showing before/after UI. asciinema of the skill in action.

### Post 5: Code Review (Mar 19)

**Purpose:** Show specialized review agents catching real issues.

**Content:**
- Run the code review plugin against the resources page changes
- Show specialized agents: code-reviewer, silent-failure-hunter, type-design-analyzer
- Highlight real issues caught (or confirmed clean)
- Confidence-based filtering — why it doesn't flood you with noise

**Capture needs:** asciinema of review agents running. Screenshots of findings.

### Post 6: GitHub (Mar 20)

**Purpose:** Ship the feature and wrap the series.

**Content:**
- Create the PR, manage reviews, merge — all through the plugin
- Full PR lifecycle for the resources page refactor
- Series wrap-up: brainstormed, researched, built, reviewed, shipped — all with plugins
- The compound effect of the full stack working together

**Capture needs:** asciinema of PR creation and merge. Screenshot of final merged PR.

## Cross-Cutting Concerns

### Media Capture
- **asciinema** for terminal recordings (lightweight, embeddable, text-selectable) — used for most plugin walkthroughs
- **OBS** for broader screen captures — used when visual before/after matters (Frontend Design post)

### Code Repo
The refactor lives in `jonesrussell/me` on a feature branch. Readers can follow along via the PR and commit history.

### Execution Order
The refactor must be done before (or alongside) writing the posts. The series tells the story of real work:
1. Do the refactor on `me`, capturing terminal sessions and screenshots at each stage
2. Write the posts from that captured experience

### Cross-References
Light linking between posts — each references the previous one and the intro. No post requires reading another to be understood standalone.

### Social Posts
Each published post gets LinkedIn, Facebook, and X social copy (per author preference).

### Series Navigation
The intro post serves as the series landing page. No separate index post needed.

## The Resources Page Refactor (Subject Matter)

**Current state** (jonesrussell/me):
- Hardcoded TypeScript array of `Resource` objects in `+page.ts`
- Categories: Essential Tools, Documentation, Go, Web Dev, DevOps, Tools, Learning, AI (stubbed)
- Basic `ResourceCard` and `ResourceSection` components
- Container query responsive layout (1/2/3 columns)
- Single featured video
- No filtering, no search, no dynamic data source

**Target state** (to be designed in Post 2 via Superpowers brainstorming):
- Externalized data (JSON file or similar)
- Filtering by category and tags
- Search functionality
- Improved card design with the site's CSS layers/design tokens
- Populated AI category (Claude Code plugins and tools)
- Better featured content section

The exact target design emerges from the Superpowers brainstorming session — that's the point of Post 2.

## Success Criteria

- All 6 posts published on schedule (Mar 15–20)
- Each post demonstrates a real plugin contribution to the refactor
- The resources page refactor is merged and live
- Terminal recordings or screen captures for at least Posts 2, 3, 4, 5, 6
- Social posts generated for each published post
