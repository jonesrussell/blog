# Blog Visual Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six reusable Hugo shortcodes (callout, steps, pullquote, cta, stats, compare) to the blog with skill updates so future authoring agents discover and use them appropriately.

**Architecture:** Hugo shortcodes in `layouts/shortcodes/` paired with a single CSS file in `assets/css/extended/components.css` that PaperMod auto-bundles. All theme-bound colors come from PaperMod CSS variables (`--theme`, `--entry`, `--primary`, `--secondary`, `--tertiary`, `--content`, `--border`); a small fixed accent palette handles the five callout type colors. Zero JavaScript. Components are validated against a draft preview post that exercises all six, then two of them are applied to the Minoo Elders post as a real-world retrofit.

**Tech Stack:** Hugo (extended), PaperMod theme, vanilla CSS with custom properties, no JavaScript.

**Spec:** `docs/superpowers/specs/2026-04-06-blog-visual-components-design.md`

**Working directory:** `/home/jones/dev/blog`

**Test framework note:** This blog has no shortcode test framework. The "test" pattern for each component task is:
1. Add the shortcode usage to the draft preview post
2. Run `task build` and expect it to fail with "no such shortcode"
3. Create the shortcode template + CSS
4. Run `task build` and expect success
5. Open the dev server, visually verify the component renders correctly in both light and dark mode
6. Commit

This adapts TDD to a Hugo authoring context: the preview post failing is the failing test; the preview post rendering correctly is the passing test.

**Pre-existing dirty state at start:** The repo currently has uncommitted changes from prior work in this session (Mermaid dark-mode fix, OG generation auto-wiring, Minoo Elders post and social copy, the spec file itself). These should be committed as logical units before starting Task 1, OR included in Task 13's final commits — implementation choice. The plan tasks below assume each task creates its own isolated commit.

---

## Task 1: CSS scaffold and accent palette

**Files:**
- Create: `assets/css/extended/components.css`

- [ ] **Step 1: Create the CSS file with the accent palette only (no component styles yet)**

```css
/* Visual components — shared accent palette and base styles.
 * Theme-bound colors use PaperMod CSS variables (--theme, --entry, etc.)
 * for automatic dark mode. Only the accent colors below are component-owned.
 * Spec: docs/superpowers/specs/2026-04-06-blog-visual-components-design.md
 */

:root {
  --component-info: #2196f3;
  --component-info-bg: rgba(33, 150, 243, 0.08);
  --component-warning: #f57c00;
  --component-warning-bg: rgba(245, 124, 0, 0.08);
  --component-tip: #7b1fa2;
  --component-tip-bg: rgba(123, 31, 162, 0.08);
  --component-note: #455a64;
  --component-note-bg: rgba(69, 90, 100, 0.08);
  --component-success: #2e7d32;
  --component-success-bg: rgba(46, 125, 50, 0.08);
}

body.dark {
  --component-info: #64b5f6;
  --component-info-bg: rgba(100, 181, 246, 0.12);
  --component-warning: #ffb74d;
  --component-warning-bg: rgba(255, 183, 77, 0.12);
  --component-tip: #ba68c8;
  --component-tip-bg: rgba(186, 104, 200, 0.12);
  --component-note: #90a4ae;
  --component-note-bg: rgba(144, 164, 174, 0.12);
  --component-success: #81c784;
  --component-success-bg: rgba(129, 199, 132, 0.12);
}
```

- [ ] **Step 2: Run `task build` to verify it loads without errors**

Run: `task build`
Expected: build succeeds. PaperMod automatically bundles anything in `assets/css/extended/`. No new warnings should appear.

- [ ] **Step 3: Commit**

```bash
git add assets/css/extended/components.css
git commit -m "feat(components): add accent palette for visual components"
```

---

## Task 2: Component preview post (skeleton)

**Files:**
- Create: `content/posts/general/component-preview/index.md`

- [ ] **Step 1: Create the preview post bundle directory and skeleton file**

Run: `mkdir -p content/posts/general/component-preview`

Then create `content/posts/general/component-preview/index.md` with:

```markdown
---
title: "Visual Components Preview"
date: 2026-04-06
categories: [general]
tags: [components]
summary: "Internal preview of all visual component shortcodes. Draft only — never publish."
slug: "component-preview"
draft: true
---

Ahnii!

This post is an internal preview of every visual component shortcode available on the blog. It is permanently `draft: true` and exists so future authors and reviewers can see how each component looks in both light and dark mode without spinning up a sandbox.

Components are added to this post as they get implemented in the plan.

Baamaapii
```

- [ ] **Step 2: Run `task serve` and verify the preview post is reachable in the dev server**

Run: `task serve` in one terminal, then open `http://localhost:1313/blog/component-preview/` in a browser. Stop the server with Ctrl+C after verifying.
Expected: page loads, shows the intro paragraph, no errors in the Hugo console.

- [ ] **Step 3: Commit**

```bash
git add content/posts/general/component-preview/
git commit -m "feat(components): add draft preview post skeleton"
```

---

## Task 3: Callout component

**Files:**
- Create: `layouts/shortcodes/callout.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add five callout usages to the preview post (this is the failing test)**

Append before the `Baamaapii` line in `content/posts/general/component-preview/index.md`:

```markdown
## Callout

{{< callout type="info" >}}
This is an info callout. Use it for asides that interrupt the main flow without belonging in it.
{{< /callout >}}

{{< callout type="warning" >}}
This is a warning callout. Use it for gotchas, version-specific notes, or things that will break if ignored.
{{< /callout >}}

{{< callout type="tip" >}}
This is a tip callout. Genuinely supplementary content goes here.
{{< /callout >}}

{{< callout type="note" >}}
This is a note callout. Neutral aside.
{{< /callout >}}

{{< callout type="success" >}}
This is a success callout. Confirmation that something worked.
{{< /callout >}}

```

- [ ] **Step 2: Run `task build` and verify it fails with "no such shortcode"**

Run: `task build`
Expected: build FAILS with an error mentioning `callout` or "shortcode" not found.

- [ ] **Step 3: Create the callout shortcode template**

Create `layouts/shortcodes/callout.html`:

```html
{{- $type := .Get "type" | default "note" -}}
{{- $emoji := dict "info" "💡" "warning" "⚠️" "tip" "✨" "note" "📝" "success" "✅" -}}
<div class="callout callout-{{ $type }}">
  <div class="callout-marker">{{ index $emoji $type }}</div>
  <div class="callout-body">
    {{ .Inner | markdownify }}
  </div>
</div>
```

- [ ] **Step 4: Append callout CSS to `assets/css/extended/components.css`**

```css

/* ----- Callout ----- */
.callout {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  margin: 1.5em 0;
  border-left: 4px solid var(--tertiary);
  background: var(--entry);
  border-radius: 0 6px 6px 0;
}
.callout-marker {
  font-size: 1.2em;
  flex-shrink: 0;
  line-height: 1.4;
}
.callout-body {
  flex: 1;
}
.callout-body > :first-child { margin-top: 0; }
.callout-body > :last-child { margin-bottom: 0; }
.callout-info { border-left-color: var(--component-info); background: var(--component-info-bg); }
.callout-warning { border-left-color: var(--component-warning); background: var(--component-warning-bg); }
.callout-tip { border-left-color: var(--component-tip); background: var(--component-tip-bg); }
.callout-note { border-left-color: var(--component-note); background: var(--component-note-bg); }
.callout-success { border-left-color: var(--component-success); background: var(--component-success-bg); }
```

- [ ] **Step 5: Run `task build` and verify it succeeds**

Run: `task build`
Expected: build succeeds with no errors or new warnings.

- [ ] **Step 6: Visual verification in dev server (light and dark mode)**

Run: `task serve` in one terminal, open `http://localhost:1313/blog/component-preview/`.
Verify:
- All five callout boxes render with correct accent colors and emoji
- Toggle dark mode via PaperMod's theme button — colors invert to the dark palette and remain readable
- Body text inherits PaperMod's `--content` color and is legible in both modes

Stop server with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add layouts/shortcodes/callout.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add callout shortcode with five type variants"
```

---

## Task 4: Steps and step components

**Files:**
- Create: `layouts/shortcodes/steps.html`
- Create: `layouts/shortcodes/step.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add steps usage to the preview post**

Append before `Baamaapii`:

```markdown
## Steps

{{< steps >}}
  {{< step "Submit a request" >}}
  An Elder asks for a ride, groceries, yard work, or a visit.
  {{< /step >}}
  {{< step "Coordinator matches" >}}
  Reviews the request and finds a nearby volunteer.
  {{< /step >}}
  {{< step "Volunteer shows up" >}}
  Reaches out, arranges details, and provides help.
  {{< /step >}}
  {{< step "Coordinator follows up" >}}
  Makes sure everything went well.
  {{< /step >}}
{{< /steps >}}

```

- [ ] **Step 2: Run `task build` and verify it fails**

Run: `task build`
Expected: build FAILS with shortcode-not-found error for `steps` or `step`.

- [ ] **Step 3: Create the steps wrapper template**

Create `layouts/shortcodes/steps.html`:

```html
<div class="steps">
  {{ .Inner }}
</div>
```

- [ ] **Step 4: Create the step item template**

Create `layouts/shortcodes/step.html`:

```html
<div class="step">
  <div class="step-badge"></div>
  <div class="step-body">
    <div class="step-title">{{ .Get 0 }}</div>
    <div class="step-content">{{ .Inner | markdownify }}</div>
  </div>
</div>
```

- [ ] **Step 5: Append steps CSS to `assets/css/extended/components.css`**

```css

/* ----- Steps ----- */
.steps {
  counter-reset: step;
  margin: 1.5em 0;
}
.step {
  counter-increment: step;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 14px 18px;
  margin-bottom: 12px;
  background: var(--entry);
  border-left: 3px solid var(--primary);
  border-radius: 0 6px 6px 0;
}
.step:last-child {
  margin-bottom: 0;
}
.step-badge {
  background: var(--primary);
  color: var(--theme);
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.95em;
  flex-shrink: 0;
}
.step-badge::before {
  content: counter(step);
}
.step-body {
  flex: 1;
}
.step-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--primary);
}
.step-content > :first-child { margin-top: 0; }
.step-content > :last-child { margin-bottom: 0; }
```

- [ ] **Step 6: Run `task build` and verify it succeeds**

Run: `task build`
Expected: build succeeds.

- [ ] **Step 7: Visual verification**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify:
- Four step rows render
- Numbered badges read 1, 2, 3, 4 (CSS counter working)
- Each step has bold title and lighter body text
- Toggle dark mode — backgrounds and badges remain readable
- Stop server with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git add layouts/shortcodes/steps.html layouts/shortcodes/step.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add steps shortcode with auto-numbered badges"
```

---

## Task 5: Pullquote component

**Files:**
- Create: `layouts/shortcodes/pullquote.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add pullquote usage to the preview post**

Append before `Baamaapii`:

```markdown
## Pullquote

{{< pullquote >}}
The coordinator is the system. The software is the leverage.
{{< /pullquote >}}

```

- [ ] **Step 2: Run `task build` and verify it fails**

Run: `task build`
Expected: build FAILS with "no such shortcode pullquote".

- [ ] **Step 3: Create the pullquote shortcode template**

Create `layouts/shortcodes/pullquote.html`:

```html
<blockquote class="pullquote">
  {{ .Inner | markdownify }}
</blockquote>
```

- [ ] **Step 4: Append pullquote CSS**

```css

/* ----- Pullquote ----- */
.pullquote {
  border-left: 4px solid var(--primary);
  padding: 8px 24px;
  margin: 2em 0;
  font-size: 1.4em;
  font-style: italic;
  color: var(--primary);
  line-height: 1.4;
}
.pullquote > :first-child { margin-top: 0; }
.pullquote > :last-child { margin-bottom: 0; }
```

- [ ] **Step 5: Run `task build` and verify it succeeds**

Run: `task build`
Expected: success.

- [ ] **Step 6: Visual verification**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify the pullquote renders larger, italic, with the left accent border, in both modes.
Stop server.

- [ ] **Step 7: Commit**

```bash
git add layouts/shortcodes/pullquote.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add pullquote shortcode"
```

---

## Task 6: CTA component

**Files:**
- Create: `layouts/shortcodes/cta.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add cta usage to the preview post**

Append before `Baamaapii`:

```markdown
## CTA

{{< cta title="Want to try this?" button="Get started" href="https://example.com/" >}}
A short description of what the action does and why the reader should care. One or two sentences.
{{< /cta >}}

```

- [ ] **Step 2: Run `task build` and verify it fails**

Run: `task build`
Expected: build FAILS with "no such shortcode cta".

- [ ] **Step 3: Create the cta shortcode template**

Create `layouts/shortcodes/cta.html`:

```html
{{- $title := .Get "title" -}}
{{- $button := .Get "button" -}}
{{- $href := .Get "href" -}}
<div class="cta">
  <h3 class="cta-title">{{ $title }}</h3>
  <div class="cta-body">{{ .Inner | markdownify }}</div>
  <a class="cta-button" href="{{ $href }}">{{ $button }}</a>
</div>
```

- [ ] **Step 4: Append cta CSS**

```css

/* ----- CTA ----- */
.cta {
  background: var(--entry);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px 28px;
  margin: 2em 0;
  text-align: center;
}
.cta-title {
  margin: 0 0 8px 0;
  font-size: 1.3em;
  color: var(--primary);
}
.cta-body {
  color: var(--secondary);
  margin-bottom: 16px;
}
.cta-body > :first-child { margin-top: 0; }
.cta-body > :last-child { margin-bottom: 0; }
.cta-button {
  display: inline-block;
  padding: 10px 24px;
  background: var(--primary);
  color: var(--theme);
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: opacity 0.2s;
}
.cta-button:hover {
  opacity: 0.85;
  text-decoration: none;
}
```

- [ ] **Step 5: Run `task build` and verify it succeeds**

Run: `task build`
Expected: success.

- [ ] **Step 6: Visual verification**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify:
- CTA box has tinted background, title, body text, and styled button
- Button is visually distinct in both light and dark mode
- Hover state dims the button slightly
- Click does not 404 (it goes to example.com — leave it)
Stop server.

- [ ] **Step 7: Commit**

```bash
git add layouts/shortcodes/cta.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add cta shortcode"
```

---

## Task 7: Stats and stat components

**Files:**
- Create: `layouts/shortcodes/stats.html`
- Create: `layouts/shortcodes/stat.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add stats usage to the preview post**

Append before `Baamaapii`:

```markdown
## Stats

{{< stats >}}
  {{< stat "612" "Pages" >}}
  {{< stat "97%" "Cache hit" >}}
  {{< stat "0" "JS deps" >}}
{{< /stats >}}

```

- [ ] **Step 2: Run `task build` and verify it fails**

Run: `task build`
Expected: build FAILS with "no such shortcode stats" or "stat".

- [ ] **Step 3: Create the stats wrapper template**

Create `layouts/shortcodes/stats.html`:

```html
<div class="stats">
  {{ .Inner }}
</div>
```

- [ ] **Step 4: Create the stat item template**

Create `layouts/shortcodes/stat.html`:

```html
<div class="stat">
  <div class="stat-number">{{ .Get 0 }}</div>
  <div class="stat-label">{{ .Get 1 }}</div>
</div>
```

- [ ] **Step 5: Append stats CSS**

```css

/* ----- Stats ----- */
.stats {
  display: flex;
  gap: 12px;
  margin: 1.5em 0;
  flex-wrap: wrap;
}
.stat {
  flex: 1;
  min-width: 120px;
  text-align: center;
  padding: 18px 14px;
  background: var(--entry);
  border: 1px solid var(--border);
  border-radius: 6px;
}
.stat-number {
  font-size: 2em;
  font-weight: bold;
  color: var(--primary);
  line-height: 1.1;
}
.stat-label {
  font-size: 0.75em;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
```

- [ ] **Step 6: Run `task build` and verify it succeeds**

Run: `task build`
Expected: success.

- [ ] **Step 7: Visual verification**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify:
- Three stat cards in a row
- Big numbers, small uppercase labels
- Wraps below 600px viewport (resize browser to test)
- Dark mode preserves readability
Stop server.

- [ ] **Step 8: Commit**

```bash
git add layouts/shortcodes/stats.html layouts/shortcodes/stat.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add stats shortcode"
```

---

## Task 8: Compare with before and after

**Files:**
- Create: `layouts/shortcodes/compare.html`
- Create: `layouts/shortcodes/before.html`
- Create: `layouts/shortcodes/after.html`
- Modify: `assets/css/extended/components.css` (append)
- Modify: `content/posts/general/component-preview/index.md` (append section)

- [ ] **Step 1: Add compare usage to the preview post**

Append before `Baamaapii`:

```markdown
## Compare

{{< compare >}}
  {{< before >}}
  Binder, sticky notes, and a phone full of texts. Volunteers no-show and nobody finds out until the Elder stops calling.
  {{< /before >}}
  {{< after >}}
  Form, match, follow-up. The coordinator catches a bad ride before the Elder gives up.
  {{< /after >}}
{{< /compare >}}

```

- [ ] **Step 2: Run `task build` and verify it fails**

Run: `task build`
Expected: build FAILS with shortcode-not-found error.

- [ ] **Step 3: Create the compare wrapper template**

Create `layouts/shortcodes/compare.html`:

```html
<div class="compare">
  {{ .Inner }}
</div>
```

- [ ] **Step 4: Create the before template**

Create `layouts/shortcodes/before.html`:

```html
<div class="compare-before">
  <div class="compare-marker">✕</div>
  <div class="compare-body">{{ .Inner | markdownify }}</div>
</div>
```

- [ ] **Step 5: Create the after template**

Create `layouts/shortcodes/after.html`:

```html
<div class="compare-after">
  <div class="compare-marker">✓</div>
  <div class="compare-body">{{ .Inner | markdownify }}</div>
</div>
```

- [ ] **Step 6: Append compare CSS**

```css

/* ----- Compare (before/after) ----- */
.compare {
  display: flex;
  gap: 12px;
  margin: 1.5em 0;
}
.compare-before, .compare-after {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 18px;
  border-radius: 6px;
  border: 1px solid;
}
.compare-before {
  background: var(--component-warning-bg);
  border-color: var(--component-warning);
}
.compare-after {
  background: var(--component-success-bg);
  border-color: var(--component-success);
}
.compare-marker {
  font-size: 1.2em;
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1.4;
}
.compare-before .compare-marker { color: var(--component-warning); }
.compare-after .compare-marker { color: var(--component-success); }
.compare-body { flex: 1; }
.compare-body > :first-child { margin-top: 0; }
.compare-body > :last-child { margin-bottom: 0; }
@media (max-width: 600px) {
  .compare { flex-direction: column; }
}
```

- [ ] **Step 7: Run `task build` and verify it succeeds**

Run: `task build`
Expected: success.

- [ ] **Step 8: Visual verification**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify:
- Two side-by-side boxes, before in warning tones, after in success tones
- ✕ and ✓ markers visible and colored
- Stacks vertically when viewport narrows below 600px
- Dark mode keeps both readable
Stop server.

- [ ] **Step 9: Commit**

```bash
git add layouts/shortcodes/compare.html layouts/shortcodes/before.html layouts/shortcodes/after.html assets/css/extended/components.css content/posts/general/component-preview/index.md
git commit -m "feat(components): add compare/before/after shortcodes"
```

---

## Task 9: Minoo Elders post retrofit

**Files:**
- Modify: `content/posts/general/minoo-elders/index.md`

This task validates the components against a real post. Two components get applied: `steps` replaces the numbered list, `cta` replaces the bottom paragraph.

- [ ] **Step 1: Replace the numbered list with a steps block**

In `content/posts/general/minoo-elders/index.md`, find the block:

```markdown
1. An Elder submits a request: a ride, groceries, yard work, or a visit.
2. A community coordinator reviews the request and matches it to a nearby volunteer.
3. The volunteer reaches out, arranges the details, and shows up.
4. The coordinator follows up afterward to make sure it went well.
```

Replace it with:

```markdown
{{< steps >}}
  {{< step "Submit a request" >}}
  An Elder asks for a ride, groceries, yard work, or a visit.
  {{< /step >}}
  {{< step "Coordinator matches" >}}
  Reviews the request and finds a nearby volunteer.
  {{< /step >}}
  {{< step "Volunteer shows up" >}}
  Reaches out, arranges the details, and provides help.
  {{< /step >}}
  {{< step "Coordinator follows up" >}}
  Checks in afterward to make sure it went well.
  {{< /step >}}
{{< /steps >}}
```

- [ ] **Step 2: Replace the bottom CTA paragraph with a cta block**

Find the line:

```markdown
Visit [minoo.live/elders](https://minoo.live/elders) to see how it works. If you want to run it in your community, find me at [jonesrussell.github.io](https://jonesrussell.github.io/) and let's talk.
```

Replace it with:

```markdown
{{< cta title="Want to run Minoo Elders in your community?" button="Find me online" href="https://jonesrussell.github.io/" >}}
Visit [minoo.live/elders](https://minoo.live/elders) to see how it works, then reach out and we'll set you up as a community coordinator.
{{< /cta >}}
```

- [ ] **Step 3: Run `task build` and verify it succeeds**

Run: `task build`
Expected: success, no shortcode errors.

- [ ] **Step 4: Visual verification on the actual Minoo Elders post**

Run: `task serve`, open `http://localhost:1313/blog/minoo-elders/`.
Verify:
- Step cards render in place of the numbered list
- CTA box renders at the bottom with the "Find me online" button
- Button links to `https://jonesrussell.github.io/`
- Both light and dark modes are clean
Stop server.

- [ ] **Step 5: Commit**

```bash
git add content/posts/general/minoo-elders/index.md
git commit -m "refactor(minoo-elders): apply steps and cta shortcodes"
```

---

## Task 10: Update blog-writing skill

**Files:**
- Modify: `~/.claude/skills/blog-writing/SKILL.md`

The blog-writing skill lives in the user's Claude config, not the blog repo. It teaches future authoring sessions about the new components.

- [ ] **Step 1: Read the current skill file to find the right insertion point**

Run: read `~/.claude/skills/blog-writing/SKILL.md` and locate the `## Common Mistakes` section. The new Visual Components section goes immediately before it.

- [ ] **Step 2: Insert the Visual Components section**

Add this section before `## Common Mistakes`:

```markdown
## Visual Components

The blog has six Hugo shortcodes for breaking up walls of text. Use them when they add information; never use them for decoration. Walls of decoration are worse than walls of text.

Spec and rules: `docs/superpowers/specs/2026-04-06-blog-visual-components-design.md`

| Shortcode | Syntax | Use when | Don't use when |
|-----------|--------|----------|----------------|
| `callout` | `{{</* callout type="info" */>}}body{{</* /callout */>}}` (types: info, warning, tip, note, success) | Asides, gotchas, version notes, prerequisites | General emphasis, decorating prose |
| `steps` | `{{</* steps */>}}` containing `{{</* step "Title" */>}}body{{</* /step */>}}` | Sequential processes with 3+ steps where each step has explanation | Short flat lists, non-sequential items |
| `pullquote` | `{{</* pullquote */>}}line{{</* /pullquote */>}}` | The post's killer line. **Max one per post.** | Decoration, quoting other authors (use `> ` instead) |
| `cta` | `{{</* cta title="..." button="..." href="..." */>}}body{{</* /cta */>}}` | Single concrete action at a meaningful break. **Max one per post.** | Vague "learn more" links, newsletter signup |
| `stats` | `{{</* stats */>}}` containing `{{</* stat "N" "Label" */>}}` | Posts where metrics are central | Posts without real metrics, single-stat scenarios |
| `compare` | `{{</* compare */>}}{{</* before */>}}…{{</* /before */>}}{{</* after */>}}…{{</* /after */>}}{{</* /compare */>}}` | Old way vs new way framings, refactor before/after | Arbitrary contrasts, three-way comparisons |

**Universal rule:** If a component doesn't add information, remove it.

```

- [ ] **Step 3: Add two new entries to the Common Mistakes table**

Find the Common Mistakes table and append these rows:

```markdown
| Adding components for visual interest rather than information | Remove the component. Walls of decoration are worse than walls of text. |
| More than one pullquote or cta per post | Pick the strongest one and delete the rest. Two CTAs means two purposes — split the post. |
```

- [ ] **Step 4: Verify the file is well-formed by re-reading it**

Run: read the file again, confirm both edits applied cleanly, no broken markdown table syntax.

- [ ] **Step 5: Commit (note: this commit may be in a different repo if the skills directory is its own repo, otherwise it's a no-op for the blog repo)**

If `~/.claude/skills/` is a git repo:
```bash
cd ~/.claude/skills
git add blog-writing/SKILL.md
git commit -m "feat(blog-writing): document visual components"
cd -
```

If not a git repo, the file change persists but no commit is needed.

---

## Task 11: Update blog-reviewing skill

**Files:**
- Modify: `~/.claude/skills/blog-reviewing/SKILL.md`

- [ ] **Step 1: Read the current skill file**

Run: read `~/.claude/skills/blog-reviewing/SKILL.md` and locate the `### Content` checklist section.

- [ ] **Step 2: Add a new Visual Components checklist section after Content**

Insert immediately after the `### Content` section:

```markdown
### Visual Components

- [ ] Numbered lists with 3+ items where each item has explanatory content → suggest `steps` shortcode
- [ ] Inline link CTAs at the end of a project-showcase post → suggest `cta` shortcode
- [ ] Asides or warnings written as bare paragraphs → suggest `callout` shortcode
- [ ] More than one `pullquote` shortcode per post → flag as INCORRECT (max one per post)
- [ ] More than one `cta` shortcode per post → flag as INCORRECT (max one per post)
- [ ] Component used decoratively without adding information → flag as INCORRECT (walls of decoration are worse than walls of text)
- [ ] `compare` used for non-before/after contrasts → flag as INCORRECT (use a markdown table instead)
- [ ] `stats` used in a post without real metrics → flag as INCORRECT (don't invent numbers)
```

- [ ] **Step 3: Verify by re-reading the file**

Confirm the section was inserted in the right place and the markdown is well-formed.

- [ ] **Step 4: Commit**

If `~/.claude/skills/` is a git repo:
```bash
cd ~/.claude/skills
git add blog-reviewing/SKILL.md
git commit -m "feat(blog-reviewing): add visual components checklist"
cd -
```

If not a git repo, no commit needed.

---

## Task 12: Update dev/blog/CLAUDE.md

**Files:**
- Modify: `/home/jones/dev/blog/CLAUDE.md`

- [ ] **Step 1: Add a one-line pointer in the Content Conventions section**

In `dev/blog/CLAUDE.md`, find the `## Content Conventions` heading. Below the existing "Style baseline" line, add:

```markdown

**Visual components:** Six Hugo shortcodes (`callout`, `steps`, `pullquote`, `cta`, `stats`, `compare`) live in `layouts/shortcodes/`. Styles in `assets/css/extended/components.css`. Usage rules in `docs/superpowers/specs/2026-04-06-blog-visual-components-design.md`. Live preview at the draft post `content/posts/general/component-preview/index.md`.
```

- [ ] **Step 2: Verify the file by re-reading it**

Confirm the addition appears in the right location and doesn't break surrounding content.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: reference visual components from CLAUDE.md"
```

---

## Task 13: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build with strict warnings**

Run: `task check`
Expected: build succeeds. Pre-existing warnings (json taxonomy layout, .Site.Data deprecation) may still appear — they are unrelated. No NEW warnings should appear, especially nothing about shortcodes or CSS.

- [ ] **Step 2: Verify all ten shortcode files exist**

Run: `ls layouts/shortcodes/`
Expected output includes: `after.html`, `before.html`, `callout.html`, `compare.html`, `cta.html`, `pullquote.html`, `stat.html`, `stats.html`, `step.html`, `steps.html` (plus any pre-existing shortcodes).

- [ ] **Step 3: Verify components.css exists and is bundled**

Run: `task build`, then check the generated CSS includes the component class names:

```bash
grep -l "callout-info" public/assets/css/*.css
```
Expected: at least one match (PaperMod's bundled stylesheet contains the component CSS).

- [ ] **Step 4: Visual verification of component preview post in both modes**

Run: `task serve`, open `http://localhost:1313/blog/component-preview/`.
Verify each section renders correctly:
- Five callout variants
- Steps with auto-numbered badges 1-4
- Pullquote
- CTA box with button
- Three stat cards
- Compare with before/after columns

Toggle dark mode and verify all six components remain readable.
Stop server.

- [ ] **Step 5: Visual verification of Minoo Elders post**

Run: `task serve`, open `http://localhost:1313/blog/minoo-elders/`.
Verify:
- "How Minoo Elders Works" section shows step cards instead of a flat numbered list
- Bottom of post has the CTA box with "Find me online" button
- Button links to `https://jonesrussell.github.io/`
- Both light and dark modes are clean
Stop server.

- [ ] **Step 6: Verify spec acceptance criteria checklist**

Re-read `docs/superpowers/specs/2026-04-06-blog-visual-components-design.md` Acceptance criteria section and confirm all 10 items pass. Specifically:
1. ✓ Ten shortcode files exist
2. ✓ components.css exists and bundles via PaperMod extension
3. ✓ Both modes render correctly
4. ✓ Minoo Elders post uses steps and cta
5. ✓ blog-writing skill updated
6. ✓ blog-reviewing skill updated
7. ✓ dev/blog/CLAUDE.md updated
8. ✓ task build succeeds with no new warnings
9. ✓ No JavaScript added
10. ✓ No other existing posts modified

- [ ] **Step 7: Verify git status is clean**

Run: `git status`
Expected: working tree clean (or only contains other unrelated work, e.g., the pre-existing dirty state from before this plan if it was not committed separately). All component-related files should be committed.

- [ ] **Step 8: No final commit needed if everything was committed per task**

The plan creates 12 commits across tasks 1-12. Task 13 is verification only.

---

## Self-Review

**Spec coverage:** Walked through every section of the spec.
- Goals 1-5 → Tasks 1-12 collectively
- File layout (10 shortcode files + 1 CSS file) → Tasks 1, 3, 4, 5, 6, 7, 8
- Each component (6) → Tasks 3-8
- Skill updates → Tasks 10, 11
- CLAUDE.md update → Task 12
- Minoo Elders retrofit → Task 9
- Acceptance criteria → Task 13 verifies all 10 items
- Out-of-scope items confirmed: no preview site, no animations, no JS, no other posts touched

**Placeholder scan:** No "TBD", "TODO", or "fill in" anywhere. Every code block is complete and copy-paste-ready. Every command has an expected outcome.

**Type/name consistency:**
- CSS class names match between HTML templates and CSS file: `.callout`, `.callout-info`, `.callout-marker`, `.callout-body`, `.steps`, `.step`, `.step-badge`, `.step-body`, `.step-title`, `.step-content`, `.pullquote`, `.cta`, `.cta-title`, `.cta-body`, `.cta-button`, `.stats`, `.stat`, `.stat-number`, `.stat-label`, `.compare`, `.compare-before`, `.compare-after`, `.compare-marker`, `.compare-body` ✓
- Shortcode names match across plan, spec, and skill updates: `callout`, `steps`, `step`, `pullquote`, `cta`, `stats`, `stat`, `compare`, `before`, `after` ✓
- CSS custom property names match across `:root`, `body.dark`, and consuming rules: `--component-info`, `--component-info-bg`, `--component-warning`, `--component-warning-bg`, `--component-tip`, `--component-tip-bg`, `--component-note`, `--component-note-bg`, `--component-success`, `--component-success-bg` ✓
- Step shortcode positional argument is consistent: `{{ .Get 0 }}` for the title in both step.html and the preview post markdown ✓

No issues found. Plan is ready for execution.
