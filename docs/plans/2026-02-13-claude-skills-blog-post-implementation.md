# Claude Skills Blog Post — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a draft blog post about building Claude Code skills, featuring an improved (language-agnostic) codebase cleanup skill and a real audit of this Hugo blog.

**Architecture:** Four sequential tasks — improve skill, run audit, fix findings, write post. Tasks 2-4 depend on prior results.

**Tech Stack:** Hugo blog, Claude Code skills (markdown), Task runner

---

### Task 1: Generalize the Cleaning-Up-Codebases Skill

**Files:**
- Modify: `~/.claude/skills/cleaning-up-codebases/SKILL.md`

**Step 1: Replace Rust-specific examples with language-agnostic equivalents**

Changes to make in `SKILL.md`:

1. **Line 84** — Change `"117 unwrap() calls"` example to `"23 TODO comments, 4 unused files"` (universally understandable)

2. **Line 92** — Change `Main.qml` and `Main-kirigami.qml` to generic: `app_v2.js` and `app_old.js`

3. **Lines 95** — Replace Rust-specific code quality signals:
   - OLD: `unwrap()` / `expect()` / bare `.unwrap()` count in production code
   - NEW: Unhandled errors, bare exception catches, missing error handling (e.g., empty `catch {}`, `except: pass`, `.unwrap()`)

4. **Line 103** — Replace `modules/crates`:
   - OLD: Entire modules/crates that could be separate projects
   - NEW: Entire modules or packages that could be separate projects

5. **Line 125** — Replace Rust-specific T2 example:
   - OLD: Replace `unwrap()` with `?`, remove TODO comments
   - NEW: Add missing error handling, remove stale TODO comments, fix linter warnings

6. **Line 141** — Already has `npm run build` etc., but leads with `cargo build`. Make it generic-first:
   - OLD: Does it build? (`cargo build`, `npm run build`, etc.)
   - NEW: Does it build? (run the project's build command — `npm run build`, `go build`, `cargo build`, `hugo build`, etc.)
   - Same for tests line

**Step 2: Add language-specific scan examples section**

After the existing "Scope creep signals" block, add a new subsection:

```markdown
**Language-specific signals (adapt to your stack):**
- **JavaScript/TypeScript:** `console.log` left in production, `any` type overuse, unused `node_modules` dependencies
- **Python:** bare `except:` clauses, unused imports (run `ruff` or `flake8`), `# type: ignore` without explanation
- **Go:** unchecked errors (`_ = someFunc()`), unused variables, empty `if err != nil` blocks
- **Rust:** `unwrap()` / `expect()` in non-test code, unused `use` declarations
- **HTML/CSS/Static sites:** orphaned images/assets, dead internal links, unused CSS rules, commented-out markup
```

**Step 3: Verify skill loads correctly**

Run: invoke `/cleaning-up-codebases` in a test to confirm no syntax issues.

**Step 4: Save (no commit yet — will batch at the end)**

---

### Task 2: Run the Cleanup Skill on This Blog

**Files:**
- Read-only scan of entire `/home/fsd42/dev/blog/`

Follow the skill's own process (Steps 1-5) against this Hugo blog:

**Step 1: Understand project intent**
- Read CLAUDE.md, hugo.toml, recent git log
- Note: Hugo blog with PaperMod theme, 44 posts, PSR series, custom CSS

**Step 2: Automated scans**
Run these searches and record counts:
- `grep -r "TODO\|FIXME\|HACK\|XXX"` across content and layouts
- `grep -r "draft: true"` to count drafts
- Check for orphaned images in `static/images/` not referenced by any post
- Check for unused CSS rules in `custom.css`
- Look for commented-out code in layouts/templates
- Check for dead internal links (slugs that don't resolve)
- Look for duplicate/redundant content

**Step 3: Question feature existence**
- Is every layout override necessary?
- Is the RSS override needed or can it use the theme default?
- Are all static images still referenced?
- Are draft posts still relevant or abandoned?

**Step 4: Classify findings into T1-T4**

**Step 5: Present findings to user (negotiation)**
Document all findings with concrete numbers.

---

### Task 3: Fix Approved Findings

**Step 1: Verify baseline**
Run: `task build` — confirm it builds cleanly, record warning count.

**Step 2: Apply T1 fixes (safe deletes)**
Delete orphaned files, remove dead references.

**Step 3: Verify after T1**
Run: `task build` — confirm still builds.

**Step 4: Apply T2 fixes (quick improvements)**
Fix minor issues found in scan.

**Step 5: Verify after T2**
Run: `task build` — confirm still builds.

**Step 6: Commit all fixes**
```bash
git add <specific files>
git commit -m "chore: codebase cleanup — remove dead code and fix minor issues"
```

---

### Task 4: Write the Blog Post

**Files:**
- Create: `content/posts/building-codebase-cleanup-skill-claude-code.md`

**Step 1: Create draft post with frontmatter**

```yaml
---
title: "Building a Codebase Cleanup Skill for Claude Code"
date: 2026-02-13
categories: [AI, Developer Tools]
tags: [claude-code, skills, code-quality]
summary: "How to write reusable Claude Code skills, featuring a codebase cleanup skill I built and ran on this very blog."
slug: "building-codebase-cleanup-skill-claude-code"
draft: true
---
```

**Step 2: Write Section 1 — What Are Claude Code Skills?**
Brief intro for newcomers. What they are, where they live, how to invoke.

**Step 3: Write Section 2 — The Cleaning-Up-Codebases Skill**
Design decisions, the tier system, full skill embedded in a code block.

**Step 4: Write Section 3 — Real Demo on This Blog**
Use actual findings from Task 2. Before/after examples. Concrete numbers.

**Step 5: Write Section 4 — How to Write Your Own Skills**
File structure, key principles, practical tips.

**Step 6: Verify post renders**
Run: `task build:drafts` — confirm no errors.

**Step 7: Commit**
```bash
git add content/posts/building-codebase-cleanup-skill-claude-code.md
git commit -m "feat: add draft post on building Claude Code skills"
```
