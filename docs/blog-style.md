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

## Cultural convention

- Open with **Ahnii!**
- Close with **Baamaapii** (no emoji in the body or after the sign-off).
