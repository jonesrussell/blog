# Shkoda Blog Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a standalone blog post announcing Shkoda, the first game on minoo.live.

**Architecture:** Create the post using Hugo archetype, capture screenshots with Playwright MCP, write content following blog-writing skill rules, generate social media artifact, review with blog-reviewing skill.

**Tech Stack:** Hugo, Playwright MCP (screenshots), blog-writing/blog-reviewing skills

**Spec:** `docs/superpowers/specs/2026-03-24-shkoda-blog-post-design.md`

---

### Task 1: Scaffold the post

**Files:**
- Create: `content/posts/ai/shkoda-campfire-word-game-ojibwe/index.md`

- [ ] **Step 1: Create the post directory and file**

```bash
task new-post -- shkoda-campfire-word-game-ojibwe
```

Move the generated file into the `ai` category subdirectory:

```bash
mv content/posts/shkoda-campfire-word-game-ojibwe/ content/posts/ai/
```

- [ ] **Step 2: Update frontmatter**

Replace the generated frontmatter with:

```yaml
---
title: "Shkoda: a campfire word game for learning Ojibwe"
date: 2026-03-24
categories:
    - ai
tags:
    - waaseyaa
    - minoo
    - open-source
    - claude-code
summary: "The first game on minoo.live teaches Ojibwe vocabulary through a campfire that burns as long as you keep guessing right."
slug: shkoda-campfire-word-game-ojibwe
draft: true
devto: true
---
```

- [ ] **Step 3: Commit scaffold**

```bash
git add content/posts/ai/shkoda-campfire-word-game-ojibwe/
git commit -m "scaffold: shkoda blog post"
```

---

### Task 2: Capture screenshots

**Files:**
- Create: `static/images/posts/shkoda-campfire-word-game-ojibwe/game-in-progress.png`
- Create: `static/images/posts/shkoda-campfire-word-game-ojibwe/win-state.png`
- Create: `static/images/posts/shkoda-campfire-word-game-ojibwe/loss-state.png`
- Create: `static/images/posts/shkoda-campfire-word-game-ojibwe/share-grid.png`

- [ ] **Step 1: Navigate to the game**

Use Playwright MCP `browser_navigate` to `https://minoo.live/games/shkoda`

- [ ] **Step 2: Capture game in progress**

Play through a few letters to get a mid-game state. Use `browser_take_screenshot` to save to `static/images/posts/shkoda-campfire-word-game-ojibwe/game-in-progress.png`.

- [ ] **Step 3: Capture win state**

Complete a round successfully. Capture the teaching data screen with campfire roaring. Save to `static/images/posts/shkoda-campfire-word-game-ojibwe/win-state.png`.

- [ ] **Step 4: Capture loss state (if achievable)**

If a loss state can be reached in the session, capture it. Otherwise skip. Save to `static/images/posts/shkoda-campfire-word-game-ojibwe/loss-state.png`.

- [ ] **Step 5: Capture share grid**

After completing a round, capture the Wordle-style emoji share output. Save to `static/images/posts/shkoda-campfire-word-game-ojibwe/share-grid.png`.

- [ ] **Step 6: Commit screenshots**

```bash
git add static/images/posts/shkoda-campfire-word-game-ojibwe/
git commit -m "assets: add shkoda game screenshots"
```

---

### Task 3: Write the post content

**Files:**
- Modify: `content/posts/ai/shkoda-campfire-word-game-ojibwe/index.md`

**Reference files (read before writing):**
- Spec: `docs/superpowers/specs/2026-03-24-shkoda-blog-post-design.md`
- Style guide: `docs/blog-style.md`
- Blog-writing skill: `~/.claude/skills/blog-writing/SKILL.md`
- Game source for accuracy: `~/dev/minoo/src/Controller/ShkodaController.php`, `~/dev/minoo/src/Support/ShkodaEngine.php`, `~/dev/minoo/public/js/shkoda.js`

- [ ] **Step 1: Write intro section**

One paragraph after "Ahnii!". Shkoda is live at minoo.live/games/shkoda. Word game teaching Ojibwe vocabulary. Campfire metaphor. Free, no account. Link to the game URL, [Minoo](https://minoo.live), and [Waaseyaa](https://github.com/waaseyaa/framework) on first mention.

- [ ] **Step 2: Write "How Shkoda teaches Ojibwe vocabulary through play"**

Cover three modes, two directions, adaptive difficulty (including daily weekly schedule). Include screenshots. Wordle-style share grid. Keep it player-focused.

- [ ] **Step 3: Write "Every round ends with a teaching"**

After each round (win or lose), player sees definition, part of speech, stem, link to full dictionary entry. The game is a vehicle for the dictionary. **Verify** against `ShkodaController::complete()` which fields are actually returned before writing claims. Note the `example_sentence` field-name bug per spec.

- [ ] **Step 4: Write "A living language, not a frozen one"**

The name correction story: "Ishkode" to "Shkoda," corrected by the author's mother (an elder). Possibly dialect-related. This is the process of learning. Word pool grows with community dictionary. Transition that pulls toward the technical section.

- [ ] **Step 5: Write "How Shkoda is built on the Waaseyaa framework"**

Brief technical section. GameSession and DailyChallenge entities. Hybrid validation (server-validated daily with word never sent to client; base64-obfuscated practice as deliberate tradeoff). Vanilla JS frontend. SVG campfire with CSS state transitions. 5 REST endpoints. Word pool from `dictionary_entry` and `example_sentence` entities (verify both against source).

**Verify all technical claims** against source files before writing.

- [ ] **Step 6: Close with Baamaapii**

No closing header. Transition naturally to farewell.

- [ ] **Step 7: Self-check against style rules**

Before committing, verify:
- No em dashes (or at most 1-2)
- All code blocks have language tags with explanations
- First mentions linked
- Internal links use `relref`
- Second person voice throughout
- Section transitions pull the reader forward
- No redundant explanation after intro

- [ ] **Step 8: Commit content**

```bash
git add content/posts/ai/shkoda-campfire-word-game-ojibwe/index.md
git commit -m "draft: shkoda campfire word game blog post"
```

---

### Task 4: Generate social media artifact

**Files:**
- Create: `docs/social/shkoda-campfire-word-game-ojibwe.md`

- [ ] **Step 1: Write social copy**

Create `docs/social/shkoda-campfire-word-game-ojibwe.md` with:
- Canonical URL: `https://jonesrussell.github.io/blog/shkoda-campfire-word-game-ojibwe/`
- Facebook: 1-3 sentences + hashtags + URL
- X: Under 240 chars including URL
- LinkedIn: Professional tone, no hashtags + URL

- [ ] **Step 2: Commit social artifact**

```bash
git add docs/social/shkoda-campfire-word-game-ojibwe.md
git commit -m "docs: add shkoda social media copy"
```

---

### Task 5: Review with blog-reviewing skill

- [ ] **Step 1: Run blog-reviewing checklist**

Invoke the `blog-reviewing` skill against the post. Run every checklist item.

- [ ] **Step 2: Fix all findings**

Apply fixes for any MISSING or INCORRECT findings. Address SUGGESTION findings at discretion.

- [ ] **Step 3: Commit fixes**

```bash
git add content/posts/ai/shkoda-campfire-word-game-ojibwe/index.md
git commit -m "fix: address blog review findings for shkoda post"
```

---

### Task 6: Generate OG image

- [ ] **Step 1: Generate OG image**

```bash
task og:generate
```

Verify output filename matches slug exactly: `static/images/og/shkoda-campfire-word-game-ojibwe.png`. Watch for curly quote filename issues (see CLAUDE.md gotcha).

- [ ] **Step 2: Commit OG image**

```bash
git add static/images/og/shkoda-campfire-word-game-ojibwe.png
git commit -m "assets: add shkoda OG image"
```

---

### Task 7: Publish

- [ ] **Step 1: Set draft to false**

Change `draft: true` to `draft: false` in frontmatter.

- [ ] **Step 2: Verify local build**

```bash
task serve
```

Check `http://localhost:1313/blog/shkoda-campfire-word-game-ojibwe/` renders correctly. Verify images load, links work, structure looks right.

- [ ] **Step 3: Commit and push**

```bash
git add content/posts/ai/shkoda-campfire-word-game-ojibwe/index.md
git commit -m "publish: shkoda campfire word game for learning Ojibwe"
git push
```

GitHub Actions builds and deploys. Dev.to sync picks up the new post automatically.
