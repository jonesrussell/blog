---
title: "Building a Codebase Cleanup Skill for Claude Code"
date: 2026-02-13
categories: [ai, tools]
tags: [claude-code, skills, code-quality]
summary: "How to write reusable Claude Code skills, featuring a codebase cleanup skill I built and ran on this very blog."
slug: "building-codebase-cleanup-skill-claude-code"
draft: true
---

Ahnii!

I've been using Claude Code for a while now, and the feature that changed how I work most isn't the code generation — it's **skills**. Skills are reusable markdown playbooks that teach Claude how to approach specific types of work. Instead of explaining your process every time, you write it once and invoke it whenever you need it.

I built a codebase cleanup skill that systematically audits projects for dead code, scope creep, and architectural drift. Then I ran it on this very blog to see what it would find. The results were genuinely useful — and the process of building the skill taught me more about what makes a good one.

Here's the full walkthrough: what skills are, the cleanup skill itself (ready to copy), and the real findings from running it on a live project.

## What Are Claude Code Skills?

Skills are markdown files that live in `~/.claude/skills/` as `SKILL.md` files inside named directories. Each one contains structured instructions that Claude Code follows when the skill is invoked.

```
~/.claude/skills/
  cleaning-up-codebases/
    SKILL.md
  my-other-skill/
    SKILL.md
```

You invoke them with `/skill-name` in your Claude Code session. When triggered, Claude reads the skill file and follows its process — asking the right questions, running the right scans, making decisions in the right order.

Think of skills as **playbooks, not scripts**. They don't automate actions mechanically — they encode expertise and decision-making frameworks. A good skill captures how an experienced developer approaches a problem: what to check first, what questions to ask, what red flags to watch for, and when to stop.

### Why Not Just Prompt Each Time?

You could describe your process in every conversation. But skills give you:

- **Consistency** — the same thorough process every time, no steps forgotten
- **Iteration** — you improve the skill over time as you learn what works
- **Shareability** — hand the skill to a teammate and they get your process instantly

## The Cleaning-Up-Codebases Skill

This skill started life focused on Rust projects — full of `unwrap()` counts and `Cargo.toml` references. I generalized it to work with any codebase: JavaScript, Python, Go, Hugo, whatever you throw at it.

The core philosophy: **ask "should this exist?" before "how can I improve this?"** The biggest mistake in cleanup work is refactoring code that should be deleted, or adding new abstractions to an already over-abstracted mess.

### Key Design Decisions

**Tiered findings.** Not all issues are equal. The skill classifies everything into four tiers:

| Tier | What it is | Effort |
|------|-----------|--------|
| T1: Safe deletes | Dead code, unused files | Minutes |
| T2: Quick fixes | Isolated improvements | Hours |
| T3: Focused refactors | Targeted module improvements | Days |
| T4: Architectural changes | Structural changes | Weeks |

You always execute T1 before T2 before T3. This prevents the classic mistake of spending a week refactoring a module that should have been deleted in the first five minutes.

**Owner negotiation.** The skill explicitly requires presenting findings to the project owner before making changes. Never assume what someone values — a "questionable" feature might be their favorite part of the codebase.

**Verify before and after.** Build and test before you start. Build and test after every change. If something breaks, revert and investigate. This seems obvious but it's the step most people skip.

**Macro and micro evaluation.** Don't just scan for dead code — evaluate at the project level (does the directory structure match the architecture? are config files stale?) and at the file level (are tests testing behavior or just chasing coverage numbers?).

### The Full Skill

Here's the complete skill file. Create `~/.claude/skills/cleaning-up-codebases/SKILL.md` and paste this in:

````markdown
---
name: cleaning-up-codebases
description: Use when reviewing or cleaning a codebase for cruft, dead code, anti-patterns, scope creep, or architectural drift - especially vibe-coded or rapidly developed projects
---

# Cleaning Up Codebases

## Overview

Systematic codebase cleanup that asks "should this exist?" before "how can I improve this?" The core failure mode in cleanup is refactoring code that should be deleted, or adding new abstractions to an already over-abstracted mess.

**Core principle:** Removal over refactoring. Simplification over restructuring. Verify before and after every change.

## When to Use

- Vibe-coded project that has grown organically
- Codebase with suspected dead code, half-finished features, or scope creep
- Project where code has drifted from documented architecture
- Pre-refactor audit to identify what's worth keeping
- New-to-you codebase that needs understanding before modification

**When NOT to use:**
- Greenfield project (nothing to clean)
- Single targeted bug fix (too narrow for full audit)
- Performance optimization (different skill, different methodology)

## Process

### Step 1: Understand Project Intent

**Before touching code, understand what the project is SUPPOSED to be.**

Read in this order:
1. README.md / CLAUDE.md - stated purpose and architecture
2. Design docs / planning docs - original vision
3. Git log (recent commits) - what's actively being worked on
4. Dependency manifest (`package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, etc.) — actual scope

**What you're looking for:** The gap between stated intent and actual code. Features that exist in code but aren't mentioned in docs are candidates for removal.

### Step 2: Survey with Automated Scans

Run systematic searches. Don't rely on reading files one by one. **Count what you find** — concrete numbers ("23 TODO comments, 4 unused files") are more actionable than vague impressions ("lots of dead code").

**Dead code signals:**
- Unused imports/modules (compiler warnings, `grep` for module declarations vs. uses)
- Functions/types defined but never called (search for definition, then search for usages)
- Files that nothing imports
- Feature flags or "coming soon" placeholders
- Commented-out code blocks
- Alternate implementations (e.g., `app_v2.js` alongside `app.js`, or `layout_old.html`)

**Code quality signals:**
- Unhandled errors — bare exception catches, empty `catch {}`, `except: pass`, `.unwrap()` in non-test code
- `TODO` / `FIXME` / `HACK` / `XXX` comments
- Functions over 100 lines
- Files over 500 lines
- Duplicated logic across files

**Scope creep signals:**
- Features unrelated to the project's stated purpose
- Entire modules or packages that could be separate projects
- Dependencies pulled in for a single non-core feature

**Language-specific signals (adapt to your stack):**
- **JavaScript/TypeScript:** `console.log` left in production, `any` type overuse, unused dependencies in `package.json`
- **Python:** bare `except:` clauses, unused imports (`ruff` or `flake8`), `# type: ignore` without explanation
- **Go:** unchecked errors (`_ = someFunc()`), unused variables, empty `if err != nil` blocks
- **Rust:** `unwrap()` / `expect()` in non-test code, unused `use` declarations
- **HTML/CSS/Static sites:** orphaned images/assets, dead internal links, unused CSS rules, commented-out markup

### Step 2b: Establish a Clean Baseline (Lint, Test, Build)

**Before you can evaluate the code, make sure the toolchain is healthy.**

Run every standard check the project supports and record the results:
1. **Linter** — `eslint .`, `ruff check .`, `golangci-lint run`, `clippy`, etc. Record warning/error count.
2. **Tests** — `npm test`, `pytest`, `go test ./...`, etc. Record pass/fail count.
3. **Build** — `npm run build`, `go build`, `cargo build`, `hugo build`, etc. Record warnings.

**What you're looking for:**
- **Linter warnings nobody fixed** — these reveal patterns the team stopped caring about
- **Failing or skipped tests** — dead tests are worse than no tests (false confidence)
- **Build warnings** — deprecation notices, unused variable warnings, type mismatches

If any of these are broken, **that's your first finding**. A codebase that doesn't pass its own checks has a foundation problem.

### Step 2c: Evaluate at Macro and Micro Levels

**Macro (project-level):**
- Does the directory structure match the project's architecture? Or has it drifted?
- Are there modules/folders that overlap in responsibility?
- Do config files (CI, linter rules, editor configs) reflect current practices or are they stale?
- Are linter/formatter rules actually enforced, or are they ignored with `// nolint`, `// eslint-disable`, `# noqa`?

**Micro (file/function-level):**
- Are tests testing behavior or just chasing coverage numbers?
- Are there tests that always pass regardless of implementation (useless tests)?
- Do test names describe what they verify, or are they `test1`, `test2`?
- Are there god files — one file doing 5 unrelated things?
- Is there copy-paste code that should be a shared function (or vice versa — premature abstractions)?

**Rules and config evaluation:**
- Are there linter rules that are disabled project-wide? Why?
- Are there CI steps that are skipped or `allow_failure`?
- Do `.gitignore`, `.dockerignore`, editor configs match reality?
- Are there config files for tools the project no longer uses?

### Step 3: Question Feature Existence

For EVERY major feature or module, ask:

1. **Does this align with the project's stated purpose?** If not, it's a removal candidate.
2. **Is this actively used?** Trace call paths from entry points.
3. **Could this be a separate project/library?** If yes, consider extraction or removal.
4. **Was this fully implemented?** Half-finished = remove unless owner wants to complete it.

**NEVER default to "refactor this to be better." The first question is always "should this exist at all?"**

### Step 4: Classify Findings

Separate findings into tiers. Do NOT mix quick wins with multi-week projects.

| Tier | Description | Examples | Typical effort |
|------|-------------|----------|----------------|
| **T1: Safe deletes** | Dead code, unused files, abandoned experiments | Unused plugin system, alternate UI files | Minutes |
| **T2: Quick fixes** | Isolated improvements, no architectural impact | Add missing error handling, remove stale TODOs, fix linter warnings | Hours |
| **T3: Focused refactors** | Targeted improvements to specific modules | Extract god object, consolidate duplicated logic | Days |
| **T4: Architectural changes** | Structural changes affecting multiple modules | Change state management pattern, redesign module boundaries | Weeks |

### Step 5: Negotiate Scope with Owner

**Present findings to the user before creating any plan.** Ask:

- "I found X features that seem outside the project's core purpose. Which do you want to keep?"
- "Here are N things I can safely delete right now. Should I proceed?"
- "These T3/T4 items need your input on direction. Which matter to you?"

**Never assume what the owner values.** A "questionable" feature might be their favorite part.

### Step 6: Verify Baseline

Before ANY changes:
1. Does it build? (run the project's build command — `npm run build`, `go build`, `cargo build`, `hugo build`, etc.)
2. Do tests pass? (run the project's test command — `npm test`, `go test ./...`, `cargo test`, `pytest`, etc.)
3. Record current state (warnings count, test count, build time)

**If it doesn't build now, fix that first.** Don't add cleanup on top of a broken build.

### Step 7: Execute Safe-to-Dangerous

**Order of operations:**
1. **T1 first:** Delete dead code, unused files, abandoned experiments
2. **T2 next:** Quick isolated fixes
3. **T3 then:** Focused refactors with tests
4. **T4 last:** Architectural changes (may deserve their own branch)

**After each change:** Build and test. If broken, revert and investigate.

### Step 8: Verify After Each Change

Not "at the end." After EACH significant change:
- Build passes
- Tests pass
- No new warnings introduced
- Commit the working state

## Common Mistakes

| Mistake | What to do instead |
|---------|-------------------|
| Refactoring code that should be deleted | Ask "should this exist?" first |
| Adding new abstractions during cleanup | Cleanup means LESS code, not different code |
| Planning a 5-phase multi-week cleanup | Start with T1 deletes. Reassess after. |
| Suggesting removal without checking dependencies | `grep` for all usages before flagging as dead |
| Treating all issues as equal priority | Use the tier system. T1 before T2 before T3. |
| Skipping baseline verification | Always know if it builds before you start |
| Not involving the owner in scope decisions | Present findings, don't prescribe solutions |
| Going file-by-file instead of scanning | Use grep/glob for patterns across the whole codebase |

## Red Flags - You're Doing Cleanup Wrong

- You're writing MORE code than you're deleting
- You're creating new files during a cleanup
- You suggested an "event bus" or "registry pattern" during a dead code removal
- Your cleanup plan has 5+ phases spanning weeks
- You haven't asked the owner what they want to keep
- You haven't verified the build passes yet
````

## Running It on This Blog: A Real Demo

I ran this skill on the Hugo blog you're reading right now. Here's what it found — concrete numbers, not hand-waving.

### The Setup

This is a Hugo static site with the PaperMod theme, 44 markdown posts (including a 14-post PSR series), custom CSS, a few layout overrides, and some static images. Not a massive codebase, but enough to accumulate cruft.

**Baseline:** `task build` passes cleanly. 228 pages generated, 0 warnings.

### What the Scan Found

**T1: Safe Deletes**

The biggest win: **12 out of 16 images in `static/images/` were orphaned.** They existed on disk but no markdown file referenced them. Files like `grape.png`, `koreaSunset.jpg`, `portfolio.png` — relics of posts that were rewritten or removed, but the images stayed behind.

This is the kind of cruft that accumulates invisibly. No build tool warns you. No linter catches it. You only find it by cross-referencing what's on disk with what's actually used.

**T2: Quick Fixes**

The CSS audit found three issues:

1. **Dead CSS rule.** `.home-info .entry-hint-about` was styled with a gradient text effect — but that class doesn't exist anywhere in the PaperMod theme's HTML. The selector `.first-entry .entry-header h1` on the same rule was valid, but the companion selector was dead weight. Removed.

2. **15 unnecessary `!important` flags.** The custom CSS was written defensively with `!important` scattered across `.copy-code`, `.top-link`, and nav link styles. Since the custom stylesheet loads after the theme, cascade order already wins — the `!important` declarations were unnecessary and made the CSS harder to maintain. Removed 12 of them (kept 3 that genuinely needed to override theme `calc()` values).

3. **Draft post audit.** 12 posts marked as drafts. 5 had substantial content and were genuinely in progress. 7 were stale — skeleton posts from 2024 with minimal content, missing dates, or abandoned series starts. These are candidates for cleanup (pending owner review).

**Clean Bill of Health**

Not everything was a problem. The audit also confirmed:
- **0 TODO/FIXME/HACK comments** in active code
- **0 commented-out code blocks** in layouts or CSS
- **0 broken internal links** — all 44 cross-references between posts resolve correctly
- All 4 layout overrides serve a legitimate purpose

### The Fixes

After the owner (me) approved the scope:

- Deleted 12 orphaned images → static files dropped from 17 to 5
- Removed the dead `.entry-hint-about` CSS rule
- Removed 12 unnecessary `!important` flags from `custom.css`
- Build verified after each change: 228 pages, 0 warnings, same as baseline

Total time: about 10 minutes of actual changes. The audit itself took longer, but that's the point — the skill front-loads the thinking so the changes are safe and targeted.

## Writing Your Own Skills

If you want to build skills for your own workflows, here's what I've learned:

### File Structure

```
~/.claude/skills/
  your-skill-name/
    SKILL.md
```

The `SKILL.md` file needs YAML frontmatter with `name` and `description`:

```yaml
---
name: your-skill-name
description: When to use this skill — be specific so Claude invokes it at the right time
---
```

### What Makes a Good Skill

**Encode decisions, not just steps.** "Run eslint" is a command. "If linter warnings exceed 50, that's a T2 finding" is a decision. Skills should capture the judgment calls that experienced developers make automatically.

**Include anti-patterns and red flags.** Tell Claude what NOT to do. The cleanup skill's "Red Flags" section prevents over-engineering during what should be a simplification pass. Without it, Claude might suggest adding an "event bus" while you're trying to delete dead code.

**Use concrete examples.** "Check for dead code" is vague. "Search for function definitions, then search for usages of each function — if a function is defined but never called, it's dead" is actionable.

**Build in verification checkpoints.** Don't just say "make changes." Say "make changes, then build, then test, then commit. If the build breaks, revert." This prevents Claude from making five changes and only discovering the first one broke things.

**Start specific, generalize later.** My cleanup skill started Rust-specific. That was fine — it captured real patterns from real work. I generalized it later once I understood what was language-specific and what was universal.

Baamaapii 👋
