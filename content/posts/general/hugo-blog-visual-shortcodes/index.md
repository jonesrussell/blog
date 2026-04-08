---
title: "Hugo blog shortcodes: adding a visual component system to PaperMod"
date: 2026-04-08
categories: [general]
tags: [hugo, claude-code, papermod, shortcodes]
summary: "Six Hugo shortcodes that give your PaperMod blog callouts, steps, pull quotes, stats, before/after comparisons, and CTAs — built in one vibe coding session."
slug: "hugo-blog-visual-shortcodes"
draft: true
devto: true
---

Ahnii!

[PaperMod](https://github.com/adityatelange/hugo-PaperMod) is a clean, fast Hugo theme. What it doesn't give you out of the box is a component library — no callouts, no numbered steps, no before/after comparisons. If you write tutorials or technical posts, you end up compensating with blockquotes and bold text where purpose-built components would serve the reader better.

I added six shortcodes to this blog in a single [Claude Code](https://claude.com/claude-code) session. This post shows you what I built, how each one works, and how to add the same components to your own Hugo blog.

## What we're building

Six shortcodes, one CSS file:

- **callout** — highlighted aside with five severity types
- **steps / step** — auto-numbered procedure blocks
- **pullquote** — large-format quote for emphasis
- **stats / stat** — side-by-side metric tiles
- **compare / before / after** — side-by-side comparison panels
- **cta** — call-to-action box with a button

All styles hook into PaperMod's CSS variables (`--primary`, `--entry`, `--border`, etc.), so they adapt to dark and light mode automatically with no extra work.

## File locations

Hugo resolves shortcodes from `layouts/shortcodes/`. Create one `.html` file per shortcode:

```
layouts/shortcodes/
  callout.html
  steps.html
  step.html
  pullquote.html
  stats.html
  stat.html
  compare.html
  before.html
  after.html
```

The CSS goes in `assets/css/extended/`. PaperMod loads everything in that directory automatically — no import statements needed.

## The shortcodes

### Callout

`callout.html` accepts a `type` parameter. Valid types are `info`, `warning`, `tip`, `note`, and `success`. Defaults to `note` if you omit it.

```html
{{- $type := .Get "type" | default "note" -}}
{{- $emoji := dict "info" "💡" "warning" "⚠️" "tip" "✨" "note" "📝" "success" "✅" -}}
<div class="callout callout-{{ $type }}">
  <div class="callout-marker">{{ index $emoji $type }}</div>
  <div class="callout-body">{{ .Inner | markdownify }}</div>
</div>
```

Usage in a post:

```
{{</* callout type="warning" */>}}
Run `git stash` before switching branches or you will lose your changes.
{{</* /callout */>}}
```

The `markdownify` call means you can use inline markdown inside the callout body — backtick code, bold, links — all render correctly.

### Steps and step

`steps.html` sets up the counter context. `step.html` takes a title as its first positional argument and renders the body as markdown.

```html
<!-- steps.html -->
<div class="steps">{{ .Inner }}</div>

<!-- step.html -->
<div class="step">
  <div class="step-badge"></div>
  <div class="step-body">
    <div class="step-title">{{ .Get 0 }}</div>
    <div class="step-content">{{ .Inner | markdownify }}</div>
  </div>
</div>
```

The step badge is numbered via CSS counters — no JavaScript, no manual numbering.

Usage:

```
{{</* steps */>}}
{{</* step "Install dependencies" */>}}
Run `npm install` in the project root.
{{</* /step */>}}
{{</* step "Start the dev server" */>}}
Run `npm run dev`. The site is available at `http://localhost:5173`.
{{</* /step */>}}
{{</* /steps */>}}
```

### Stats and stat

`stats.html` is a flex container. `stat.html` takes two positional arguments: the number and the label.

```html
<!-- stats.html -->
<div class="stats">{{ .Inner }}</div>

<!-- stat.html -->
<div class="stat">
  <div class="stat-number">{{ .Get 0 }}</div>
  <div class="stat-label">{{ .Get 1 }}</div>
</div>
```

Usage:

```
{{</* stats */>}}
{{</* stat "6" "shortcodes" */>}}
{{</* stat "1" "CSS file" */>}}
{{</* stat "0" "JS required" */>}}
{{</* /stats */>}}
```

The tiles flex-wrap on small screens, so they stack gracefully on mobile without any extra media query work.

### Compare, before, and after

Three files work together: `compare.html` wraps the pair, `before.html` and `after.html` render the two panels.

```html
<!-- compare.html -->
<div class="compare">{{ .Inner }}</div>

<!-- before.html -->
<div class="compare-before">
  <div class="compare-marker">✕</div>
  <div class="compare-body">{{ .Inner | markdownify }}</div>
</div>

<!-- after.html -->
<div class="compare-after">
  <div class="compare-marker">✓</div>
  <div class="compare-body">{{ .Inner | markdownify }}</div>
</div>
```

The `before` panel uses the warning colour from PaperMod's palette; `after` uses the success colour. On screens narrower than 600px the panels stack vertically.

Usage:

```
{{</* compare */>}}
{{</* before */>}}
Blockquote hacks repurposed as callouts.
{{</* /before */>}}
{{</* after */>}}
Purpose-built `callout` shortcode with five types.
{{</* /after */>}}
{{</* /compare */>}}
```

### CTA

`cta.html` takes three named parameters: `title`, `button`, and `href`. The inner body is optional supporting copy.

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

Usage:

```
{{</* cta title="Try it yourself" button="View the source" href="https://github.com/jonesrussell/blog" */>}}
All six shortcodes and the CSS are in the repo.
{{</* /cta */>}}
```

### Pullquote

The simplest of the six — a styled blockquote for pull emphasis.

```html
<blockquote class="pullquote">
  {{ .Inner | markdownify }}
</blockquote>
```

Usage:

```
{{</* pullquote */>}}
Good writing tools don't replace good writing. They get out of the way.
{{</* /pullquote */>}}
```

## The proving ground

Before calling the system done, I retrofitted an existing post — [Minoo Elders]({{< relref "minoo-elders" >}}) — replacing a flat numbered list with a `steps` block and a closing paragraph with a `cta`. If the shortcodes worked in a real post with real content, they were ready.

The retrofit caught a line-height edge case in the step badge CSS and confirmed the dark mode colours held in both themes. Worth the ten minutes.

## How I built it

This was a vibe coding session with [Claude Code](https://claude.com/claude-code). I described the component system I wanted, reviewed each shortcode draft, and pushed back when anything felt over-engineered. The whole thing — nine files, the CSS, and the retrofit — came together in one session.

The shortcodes are straightforward Hugo template code. Claude didn't do anything I couldn't have done manually. What changed was the iteration loop: see a render, say "the step numbers need more breathing room," get an updated CSS in thirty seconds. That speed is where the value is.

Baamaapii
