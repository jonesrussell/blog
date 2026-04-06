# Blog Visual Components Design

**Date:** 2026-04-06
**Status:** Approved, ready for implementation plan
**Triggering context:** The Minoo Elders post (`content/posts/general/minoo-elders/index.md`) revealed that the blog has no visual variety beyond default markdown. A numbered list explaining the system flow felt flat, and there's no good treatment for asides, calls to action, pull quotes, or comparisons. This spec introduces six reusable Hugo shortcodes plus the skill updates that teach future authoring agents when to use each one and when not to.

## Goals

1. Give the blog a small, opinionated set of visual components that break up walls of text without devolving into decoration.
2. Make every component author-friendly via Hugo shortcodes (no raw HTML required in markdown).
3. Inherit dark mode from PaperMod's CSS variables so no JavaScript or theme detection is needed.
4. Update the `blog-writing` and `blog-reviewing` skills so future agents discover the components and apply them appropriately.
5. Retrofit the Minoo Elders post in the same change so the new components are validated against a real post immediately.

## Non-goals

- Retrofitting any other existing post. Every other post stays as-is.
- Adding a component library beyond these six. New components can be added later under the same pattern.
- Animations, hover states, JavaScript interactivity, or progressive enhancement. Pure CSS only.
- A separate component documentation site. The skill files are the documentation.

## Architecture

### File layout

| Path | Purpose |
|------|---------|
| `layouts/shortcodes/callout.html` | Callout shortcode template |
| `layouts/shortcodes/steps.html` | Steps wrapper |
| `layouts/shortcodes/step.html` | Individual step |
| `layouts/shortcodes/pullquote.html` | Pull quote |
| `layouts/shortcodes/cta.html` | Call-to-action box |
| `layouts/shortcodes/stats.html` | Stats wrapper |
| `layouts/shortcodes/stat.html` | Individual stat |
| `layouts/shortcodes/compare.html` | Before/after wrapper |
| `layouts/shortcodes/before.html` | Before column |
| `layouts/shortcodes/after.html` | After column |
| `assets/css/extended/components.css` | All component styles, single file |

PaperMod auto-bundles anything in `assets/css/extended/` into the main stylesheet pipeline. No `hugo.toml` change required, no extra HTTP request, and the file gets minified by Hugo's standard asset pipeline.

### Styling discipline

Every color value comes from PaperMod's existing CSS variables:

- `--theme` — page background
- `--entry` — card/box background (slightly elevated)
- `--primary` — primary text
- `--secondary` — secondary text
- `--tertiary` — borders and dividers
- `--content` — body content text
- `--code-bg` — code block background (reused for component backgrounds when appropriate)
- `--border` — border color

Variants that need accent color (callout types like info/warning/tip) use a small fixed palette defined at the top of `components.css` with both light and dark variants set via the `body.dark` selector. The palette is restricted to these five values:

| Type | Light accent | Dark accent | Emoji |
|------|--------------|-------------|-------|
| `info` | `#2196f3` | `#64b5f6` | 💡 |
| `warning` | `#f57c00` | `#ffb74d` | ⚠️ |
| `tip` | `#7b1fa2` | `#ba68c8` | ✨ |
| `note` | `#455a64` | `#90a4ae` | 📝 |
| `success` | `#2e7d32` | `#81c784` | ✅ |

Each accent value drives both the left border and a low-opacity background tint. No other accent colors appear anywhere in the component CSS.

### Authoring discipline

Shortcodes are single-purpose. No "kitchen sink" component with twenty parameters. Component composition happens at the markdown level: if you want a callout inside a step, you nest the shortcodes naturally.

## Components

### 1. callout

**Syntax:**

```
{{< callout type="info" >}}
Content here. Markdown is preserved.
{{< /callout >}}
```

**Parameters:**

| Param | Required | Allowed values | Default |
|-------|----------|----------------|---------|
| `type` | yes | `info`, `warning`, `tip`, `note`, `success` | none |

**Visual:** Left border in the type color, tinted background, optional emoji prefix per type, body content rendered as markdown.

**When to use:**
- Asides that interrupt the main flow without belonging in it (gotchas, warnings, version-specific notes)
- Tips that are genuinely supplementary
- Required prerequisites callouts in tutorial-style posts

**When not to use:**
- General emphasis (use bold or pull quotes instead)
- Decorating ordinary paragraphs
- Hiding important information that should be in the main flow

### 2. steps + step

**Syntax:**

```
{{< steps >}}
  {{< step "Submit a request" >}}
  A ride, groceries, yard work, or a visit.
  {{< /step >}}
  {{< step "Coordinator matches" >}}
  Reviews the request and finds a nearby volunteer.
  {{< /step >}}
{{< /steps >}}
```

**Parameters:**

- `step` takes one positional argument: the step title.
- Numbering is automatic via CSS counters on the `steps` wrapper.

**Visual:** Each step is a horizontal flex row: a circle-numbered badge on the left, bold title and body content on the right, all inside a tinted card with a left accent border.

**When to use:**
- Sequential processes with 3+ steps
- When each step has explanatory content beyond a single short phrase
- Onboarding flows, "how it works" sections, multi-stage workflows

**When not to use:**
- Short flat lists where markdown's `1. 2. 3.` is fine
- Lists of items that aren't sequential (use a regular bullet list)
- Steps with only a few words each (the visual weight is wasted)

### 3. pullquote

**Syntax:**

```
{{< pullquote >}}
The coordinator is the system. The software is the leverage.
{{< /pullquote >}}
```

**Parameters:** none.

**Visual:** Large italic text (1.4em), left accent border in `--primary` color, left-aligned, generous vertical margin, distinct from body text but still readable in flow.

**When to use:**
- The post's central thesis statement
- A line so good it deserves a moment of pause
- **Maximum one per post.** If you have two candidate lines, pick the better one.

**When not to use:**
- Decoration
- Quoting another author (use a regular blockquote — `> text` — for that)
- Anything that isn't a single sentence or short paragraph

### 4. cta

**Syntax:**

```
{{< cta title="Want to run Minoo Elders in your community?" button="Get in touch" href="https://jonesrussell.github.io/" >}}
Visit minoo.live/elders to see how it works, then reach out and we'll set you up as a coordinator.
{{< /cta >}}
```

**Parameters:**

| Param | Required | Notes |
|-------|----------|-------|
| `title` | yes | Short hook |
| `button` | yes | Button label |
| `href` | yes | Action URL |

Body content is the descriptive text between title and button.

**Visual:** Solid `--entry` background with a 1px `--border` outline and rounded corners. Title in larger bold text. Body in regular content text. Button at the bottom, styled as a solid pill in `--primary` color with `--theme` text. No gradients (gradient backgrounds are fragile across theme switches).

**When to use:**
- Single concrete action at a meaningful break point in the post
- Project showcase posts where the whole point is the ask
- **Maximum one per post.** If you have two CTAs, your post has two purposes — split it.

**When not to use:**
- Vague "learn more" or "stay tuned" links
- Newsletter signup (the global newsletter CTA partial already exists)
- Multiple competing actions in the same post

### 5. stats + stat

**Syntax:**

```
{{< stats >}}
  {{< stat "612" "Pages" >}}
  {{< stat "97%" "Cache hit rate" >}}
  {{< stat "0" "External JS deps" >}}
{{< /stats >}}
```

**Parameters:** Each `stat` takes two positional arguments: number and label.

**Visual:** Horizontal row of equal-width tinted cards, large number on top, small uppercase label below.

**When to use:**
- Posts where metrics are central to the argument
- Before/after performance posts
- Project retrospectives with real numbers

**When not to use:**
- Posts that don't actually have metrics (don't invent them)
- Single-stat scenarios (just write the number in a sentence)
- More than 4 stats in a row (gets cluttered)

### 6. compare + before/after

**Syntax:**

```
{{< compare >}}
  {{< before >}}
  Binder, sticky notes, and a phone full of texts. Volunteers no-show and nobody finds out until the Elder stops calling.
  {{< /before >}}
  {{< after >}}
  Form, match, follow-up. Coordinator catches a bad ride before the Elder gives up.
  {{< /after >}}
{{< /compare >}}
```

**Parameters:** none. The structure is fixed.

**Visual:** Two columns side by side. Before in muted/red-tinted box with an X marker, after in green-tinted box with a check marker. Stacks vertically on narrow screens.

**When to use:**
- "Old way vs new way" framings
- Migration posts
- Refactor before/after snippets
- Showing the value of the change you just described

**When not to use:**
- Arbitrary contrasts that aren't really before/after
- Three-way comparisons (use a markdown table)
- Comparisons where one side isn't really worse (it'll feel like strawmanning)

## Skill updates

### `blog-writing/SKILL.md`

Add a new section titled **Visual Components** placed after **Common Mistakes** and before **Style Rules** (so it's discoverable but not the first thing):

- One-line summary of each shortcode
- Syntax example
- "Use when" and "Don't use when" rules (mirrored from this spec)
- Universal rule: "If a component doesn't add information, remove it. Walls of decoration are worse than walls of text."
- Per-post limits: pullquote and cta max 1 each
- Pointer to this spec for full details

Add a new entry in the **Common Mistakes** table:

| Mistake | Fix |
|---------|-----|
| Adding components for visual interest rather than information | Remove the component. Walls of decoration are worse than walls of text. |
| More than one pullquote or cta per post | Pick the strongest one and delete the rest. |

### `blog-reviewing/SKILL.md`

Add a new section in the **Checklist** titled **Visual Components**:

- [ ] Numbered lists with 3+ items where each item has explanatory content → suggest `steps`
- [ ] Inline link CTAs at the end of a project-showcase post → suggest `cta`
- [ ] Asides or warnings written as bare paragraphs → suggest `callout`
- [ ] More than one `pullquote` shortcode per post → flag as INCORRECT
- [ ] More than one `cta` shortcode per post → flag as INCORRECT
- [ ] Component used decoratively without adding information → flag as INCORRECT
- [ ] `compare` used for non-before/after contrasts → flag as INCORRECT

### `dev/blog/CLAUDE.md`

Add a one-line pointer in the **Content Conventions** section:

> Visual components (callout, steps, pullquote, cta, stats, compare) are available as Hugo shortcodes in `layouts/shortcodes/`. See `docs/superpowers/specs/2026-04-06-blog-visual-components-design.md` for usage rules.

## Minoo Elders retrofit

The post becomes the proving ground for two of the six components:

1. **Steps:** Replace the four-item numbered list in the "How Minoo Elders Works" section with a `steps` block. The four step titles become "Submit a request", "Coordinator matches", "Volunteer shows up", "Coordinator follows up". Each body keeps its current sentence.
2. **CTA:** Replace the final paragraph (`Visit minoo.live/elders to see how it works. If you want to run it in your community, find me at jonesrussell.github.io and let's talk.`) with a `cta` block. Title: "Want to run Minoo Elders in your community?" Button: "Find me online". Href: `https://jonesrussell.github.io/`. Body: short description pointing at the live platform.

No `callout`, `pullquote`, `stats`, or `compare` get added to this post. Forcing them in is the over-decoration trap the rules exist to prevent.

## Acceptance criteria

1. All ten shortcode files exist in `layouts/shortcodes/` and render without errors.
2. `assets/css/extended/components.css` exists, uses only PaperMod CSS variables for theme-bound colors, and gets bundled into the main stylesheet by Hugo.
3. All six components render correctly in both light and dark mode (verified by toggling theme on the Minoo Elders post).
4. The Minoo Elders post uses `steps` and `cta` shortcodes and renders without errors.
5. `blog-writing/SKILL.md` contains a Visual Components section listing all six shortcodes with usage rules.
6. `blog-reviewing/SKILL.md` contains a Visual Components checklist section.
7. `dev/blog/CLAUDE.md` references the spec.
8. `task build` succeeds with no Hugo warnings about the new shortcodes.
9. No JavaScript added. No Mermaid-style theme detection needed.
10. No other existing posts are modified.

## Out of scope

- Component documentation site
- Storybook or component playground
- Animations or transitions
- Retrofit of any post other than Minoo Elders
- New shortcodes beyond the six listed
- Changes to PaperMod theme files (we use the extension points only)

## Open questions

None. All decisions made during brainstorming.
