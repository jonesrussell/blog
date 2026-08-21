# Blog style guide

**Baseline post:** `content/posts/laravel-boost-ddev.md` — use it as the reference for voice, structure, and tone.

## Voice and tone

- **Second person, direct:** Write to the reader ("your Laravel project", "your editor", "you can"). Instructional, not corporate.
- **Concise:** Short sentences. One idea per paragraph. No filler or throat-clearing.
- **Scoped:** In the intro, state what the post covers in one sentence (e.g. "This post covers the standard DDEV setup and the extra step needed for WSL.").

## Structure

1. **Ahnii!** — opening greeting.
2. **Intro paragraph** — what the thing is (with links on first mention) + one sentence on scope.
3. **Prerequisites** (when relevant) — short bullet list before the main steps.
4. **Main sections** — clear H2s (e.g. "Install Boost", "Configure the MCP Server"). Use H3 for variants (e.g. "Standard Setup (Linux / macOS)", "WSL Setup (Windows)").
5. **Verify / follow-up** (when relevant) — e.g. "Verify It Works", "Keeping Boost Updated".
6. **Baamaapii** — closing, no emoji.

## Frontmatter

- **title:** Sentence case, descriptive.
- **summary:** One sentence: outcome or who it’s for (e.g. "Set up Laravel Boost as an MCP server inside DDEV, with a WSL configuration for Windows users.").
- **slug:** kebab-case, descriptive.
- **tags:** Max 4.

## Links and code

- **Links:** Link the first mention of a product, tool, or project (e.g. [DDEV](url), [Laravel Boost](url)).
- **Code blocks:** After each block, add one or two sentences explaining what the commands/config do or why they’re used.

## Formatting

Use the affordances of markdown. Prose walls are hard to scan and are not the house style — the raw notes most posts start from are already structured, so keep that structure.

- **Bulleted lists** for any enumerable content: steps, options, findings, what-shipped, trade-offs. If you're separating items with "and" or commas across a long sentence, it should probably be a list.
- **Numbered lists** for ordered sequences.
- **Bold** for key terms, names, and figures the reader should catch while scanning (e.g. **14 pull requests**, **authorization bypass**).
- *Italic* for light emphasis or a first-use term. Don't overuse it.
- **Tables** for comparisons or before/after (the visual components `compare` and `stats` shortcodes also exist).
- A post that is nothing but paragraphs is a red flag — most posts want a mix of prose and lists.

## Voice authenticity

Write in the author's actual voice, not a performed one.

- **No invented catchphrases or metaphor tics.** Don't manufacture a signature phrase the author doesn't use (e.g. "here are the receipts"). If you didn't hear it in their real writing, don't put it in their mouth.
- **Match how they actually talk.** When the source material is bulleted and blunt, the post is bulleted and blunt. Don't dress plain notes up into flowery narrative.
- First person is fine for build-logs and essays about the author's own work; keep it sparing, at the decisions.

## Cultural convention

- Open with **Ahnii!**
- Close with **Baamaapii** (no emoji in the body or after the sign-off).
