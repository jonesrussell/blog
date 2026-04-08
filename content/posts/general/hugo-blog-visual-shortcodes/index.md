---
categories:
    - general
date: 2026-04-08T00:00:00Z
devto: true
devto_id: 3473078
draft: false
slug: hugo-blog-visual-shortcodes
summary: Six Hugo shortcodes that give your PaperMod blog callouts, steps, pull quotes, stats, before/after comparisons, and CTAs — built in one vibe coding session.
tags:
    - hugo
    - claude-code
    - papermod
    - shortcodes
title: 'Hugo blog shortcodes: adding a visual component system to PaperMod'
---

Ahnii!

[PaperMod](https://github.com/adityatelange/hugo-PaperMod) is a clean, fast [Hugo](https://gohugo.io/) theme. What it doesn't give you out of the box is a component library: no callouts, no numbered steps, no before/after comparisons. If you write tutorials or technical posts, you end up compensating with blockquotes and bold text where purpose-built components would serve the reader better.

This post covers all six shortcodes, the CSS behind them, and how to add the same components to your own PaperMod blog. All of it came together in a single [Claude Code](https://claude.com/claude-code) session.

## What we're building

Six shortcodes, one CSS file:

- **callout**: highlighted aside with five severity types
- **steps / step**: auto-numbered procedure blocks
- **pullquote**: large-format quote for emphasis
- **stats / stat**: side-by-side metric tiles
- **compare / before / after**: side-by-side comparison panels
- **cta**: call-to-action box with a button

{{< stats >}}
{{< stat "6" "shortcodes" >}}
{{< stat "9" "template files" >}}
{{< stat "1" "CSS file" >}}
{{< stat "0" "JS required" >}}
{{< /stats >}}

All styles hook into PaperMod's CSS variables (`--primary`, `--entry`, `--border`, etc.), so they adapt to dark and light mode automatically.

## File locations

Hugo resolves shortcodes from `layouts/shortcodes/`. Create one `.html` file per shortcode:

```text
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

The CSS goes in `assets/css/extended/`. PaperMod loads everything in that directory automatically; no import statements needed.

## The shortcodes

### Callout

A callout is a highlighted aside that draws the reader's attention. It accepts a `type` parameter: `info`, `warning`, `tip`, `note`, or `success`. Defaults to `note`.

**Template** (`layouts/shortcodes/callout.html`):

```html
{{- $type := .Get "type" | default "note" -}}
{{- $emoji := dict "info" "💡" "warning" "⚠️" "tip" "✨" "note" "📝" "success" "✅" -}}
<div class="callout callout-{{ $type }}">
  <div class="callout-marker">{{ index $emoji $type }}</div>
  <div class="callout-body">{{ .Inner | markdownify }}</div>
</div>
```

**Usage:**

```text
{{</* callout type="warning" */>}}
Run `git stash` before switching branches or you will lose your changes.
{{</* /callout */>}}
```

**Rendered:**

{{< callout type="warning" >}}
Run `git stash` before switching branches or you will lose your changes.
{{< /callout >}}

The `markdownify` call means you can use inline markdown inside the body: backtick code, bold, links. All render correctly.

### Steps and step

The `steps` shortcode wraps a sequence of `step` shortcodes. Each `step` takes a title as its first positional argument and auto-numbers itself via CSS counters. No JavaScript, no manual numbering.

**Templates** (`layouts/shortcodes/steps.html` and `step.html`):

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

**Usage:**

```text
{{</* steps */>}}
{{</* step "Create the shortcode file" */>}}
Add `layouts/shortcodes/callout.html` to your project.
{{</* /step */>}}
{{</* step "Add the CSS" */>}}
Create `assets/css/extended/components.css` with the component styles.
{{</* /step */>}}
{{</* /steps */>}}
```

**Rendered:**

{{< steps >}}
{{< step "Create the shortcode file" >}}
Add `layouts/shortcodes/callout.html` to your project.
{{< /step >}}
{{< step "Add the CSS" >}}
Create `assets/css/extended/components.css` with the component styles.
{{< /step >}}
{{< /steps >}}

### Stats and stat

The `stats` shortcode is a flex container for `stat` tiles. Each `stat` takes two positional arguments: the value and the label.

**Templates** (`layouts/shortcodes/stats.html` and `stat.html`):

```html
<!-- stats.html -->
<div class="stats">{{ .Inner }}</div>

<!-- stat.html -->
<div class="stat">
  <div class="stat-number">{{ .Get 0 }}</div>
  <div class="stat-label">{{ .Get 1 }}</div>
</div>
```

**Usage:**

```text
{{</* stats */>}}
{{</* stat "6" "shortcodes" */>}}
{{</* stat "1" "CSS file" */>}}
{{</* stat "0" "JS required" */>}}
{{</* /stats */>}}
```

**Rendered:**

{{< stats >}}
{{< stat "6" "shortcodes" >}}
{{< stat "1" "CSS file" >}}
{{< stat "0" "JS required" >}}
{{< /stats >}}

The tiles flex-wrap on small screens, so they stack gracefully on mobile without extra media query work.

### Compare, before, and after

Three files work together: `compare.html` wraps the pair, `before.html` and `after.html` render each panel. The before panel uses PaperMod's warning colour; after uses the success colour.

**Templates** (`compare.html`, `before.html`, `after.html`):

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

**Usage:**

```text
{{</* compare */>}}
{{</* before */>}}
Blockquote hacks repurposed as callouts.
{{</* /before */>}}
{{</* after */>}}
Purpose-built `callout` shortcode with five types.
{{</* /after */>}}
{{</* /compare */>}}
```

**Rendered:**

{{< compare >}}
{{< before >}}
Blockquote hacks repurposed as callouts.
{{< /before >}}
{{< after >}}
Purpose-built `callout` shortcode with five types.
{{< /after >}}
{{< /compare >}}

On screens narrower than 600px the panels stack vertically.

### Pullquote

A pullquote is a styled blockquote for emphasis. Use it to surface a key insight or memorable line from the surrounding text.

**Template** (`layouts/shortcodes/pullquote.html`):

```html
<blockquote class="pullquote">
  {{ .Inner | markdownify }}
</blockquote>
```

**Usage:**

```text
{{</* pullquote */>}}
Good writing tools get out of the way. Good components make the writing better.
{{</* /pullquote */>}}
```

**Rendered:**

{{< pullquote >}}
Good writing tools get out of the way. Good components make the writing better.
{{< /pullquote >}}

### CTA

A call-to-action box with a centred button. Takes three named parameters: `title`, `button`, and `href`. The inner body is optional copy.

**Template** (`layouts/shortcodes/cta.html`):

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

**Usage:**

```text
{{</* cta title="Try it yourself" button="View the source" href="https://github.com/jonesrussell/blog" */>}}
All six shortcodes and the CSS are in the repo.
{{</* /cta */>}}
```

**Rendered:**

{{< cta title="Try it yourself" button="View the source" href="https://github.com/jonesrussell/blog" >}}
All six shortcodes and the CSS are in the repo.
{{< /cta >}}

## The proving ground

Before calling the system done, retrofit an existing post. I used Minoo Elders, replacing a flat numbered list with a `steps` block and a closing paragraph with a `cta`. If the shortcodes work in a real post with real content, they are ready.

The retrofit caught a line-height edge case in the step badge CSS and confirmed the dark mode colours held in both themes. Worth the ten minutes.

## Vibe coding the component system

This system was built with [Claude Code](https://claude.com/claude-code) in one session. Describe the component you want, review the draft, push back on anything over-engineered. Nine files and the CSS came together without a lot of manual effort.

The real gain is in the iteration loop: see a render, request a tweak, get updated CSS in thirty seconds. That speed is the whole point.

Baamaapii
