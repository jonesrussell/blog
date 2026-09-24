---
categories:
    - php
    - waaseyaa
date: 2026-09-24T00:00:00Z
devto: true
draft: false
slug: operator-shell-skip-link-accessibility
summary: How Waaseyaa's shared operator shell added a real skip link and hid decorative icons from assistive technology, including the focus trick that makes the link's own jump work in every browser.
tags:
    - php
    - waaseyaa
    - accessibility
    - twig
title: Adding a working skip link to Waaseyaa's operator shell
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `operator` package ships a shared admin shell — sidebar, nav, dashboard grid — that every hosting instance's `/admin/anokii` reuses. It was missing two baseline accessibility requirements: a skip link as the first focusable element, and `aria-hidden` on its decorative SVG icons. Both landed in one fix, along with a browser quirk worth knowing if you're building a skip link yourself: a `<main>` you make focusable stays focusable for every click, not just the skip.

## What Was Missing

- **No skip link.** The first focusable element in the shell was the first sidebar nav item. A keyboard or screen-reader user had no way to jump straight to the page content — they had to tab through the entire sidebar on every page.
- **Decorative icons were exposed to assistive technology.** The nav-link and dashboard-tile SVGs are pure decoration next to a text label, but nothing told screen readers to skip them. Each one added noise to the accessible name of its link or tile.

## The Skip Link, and Why It Needs a Script

The fix adds a `<a class="anokii-skiplink" href="#anokii-main-content">` as the very first element in `<body>`, hidden until focused:

```css
.anokii-skiplink:not(:focus){ width:1px; height:1px; margin:-1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
```

That part is the standard pattern. The less obvious part is what happens when the link is activated. The target is `<main class="anokii-main" id="anokii-main-content">` — and `<main>` isn't focusable by default, so a plain `href="#anokii-main-content"` jump would scroll the page without moving keyboard focus there. The usual fix is `tabindex="-1"` on the target. But adding that permanently changes the page: any ordinary mouse click inside `<main>` would now focus it too, and in Chromium the next <kbd>Tab</kbd> press would start over from the top of `<main>` instead of from wherever the user clicked.

The shell avoids that by making `<main>` focusable only for the moment of the skip:

```js
(() => {
  const skip = document.querySelector('.anokii-skiplink');
  const main = document.getElementById('anokii-main-content');
  if (!(skip instanceof HTMLAnchorElement) || !(main instanceof HTMLElement)) return;
  skip.addEventListener('click', () => {
    main.setAttribute('tabindex', '-1');
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
  });
})();
```

Clicking the skip link adds `tabindex="-1"` right before the browser's own anchor jump runs, so `<main>` is focusable exactly when the jump needs it to be. The `blur` listener removes the attribute afterward, so `<main>` goes back to being non-focusable for everything else. A test locks in that `<main>` never carries `tabindex` in the rendered markup — only the script adds it, and only transiently.

## Hiding Decorative Icons

The nav-link and dashboard-tile icons got two attributes each:

```html
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">{{ item.icon|raw }}</svg>
```

`aria-hidden="true"` removes the SVG from the accessibility tree; `focusable="false"` stops old IE/Edge from tabbing into it (SVG elements were focusable by default in those browsers). The visible text label next to each icon — the `<span>` in a nav link, the `<b>` in a dashboard tile — already carries the accessible name, so hiding the icon doesn't lose any information. A regression test walks every icon-bearing element and asserts the exposed accessible text still starts with the visible label.

## Testing Contrast, Not Just Markup

The skip link is only visible while focused, sitting on top of whatever chrome an instance has themed. `OperatorShellAccessibilityTest` doesn't just assert the CSS rule exists — it computes WCAG relative luminance from the shell's hardcoded colors and checks:

- **Text-to-background contrast** on the link itself is at least **4.5:1**.
- **Fill-or-border contrast against the sidebar** is at least **3:1**, checked against the default sidebar color, an example instance's themed sidebar, and a light-mode sidebar.

That's what justifies the fixed (non-CSS-variable) colors on `.anokii-skiplink`: a themeable color could pass contrast against one instance's chrome and fail against another's, and nothing would catch it until a real screen-reader user hit an invisible-on-focus link.

## What Ships Where

This is a shared package, so the fix reaches consumers on refresh, not on deploy:

| Scenario | What happens |
|---|---|
| Default shell | Skip link and hidden icons ship automatically once the host updates the `operator` package — there's no per-instance opt-in. |
| Host overrides the `nav` block | The host supplies its own markup and must add `aria-hidden="true"` to its own icons the same way — the package can't reach into markup it doesn't render. |

## Why This Matters Beyond Waaseyaa

- **A skip link's target needs `tabindex="-1"` only for the moment it's used.** Leave it on permanently and every mouse click inside the target changes tab order, not just the skip.
- **`aria-hidden` and `focusable="false"` are a pair for inline SVG, not either/or.** The first hides the icon from screen readers. The second stops IE11 and early Edge, where SVG was focusable by default, from tabbing into it anyway.
- **Assert contrast ratios in tests, not just markup shape, when a component's colors are hardcoded for a reason.** A themeable swap can pass against one instance's chrome and fail against another's, and nothing catches it until a screen-reader user hits an invisible-on-focus link.

Baamaapii
