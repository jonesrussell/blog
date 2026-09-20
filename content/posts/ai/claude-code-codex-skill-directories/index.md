---
title: "Claude Code and Codex skills are directories, not files"
date: 2026-09-20
categories: [ai]
tags: [claude-code, codex, ai-agents, waaseyaa]
summary: "Why Claude Code and Codex discover agent skills as a directory containing SKILL.md, not a flat markdown file, and what silently breaks when an installer gets that wrong."
slug: "claude-code-codex-skill-directories"
draft: false
---

Ahnii!

If you're building tooling that installs "skills" for AI coding agents, it's tempting to treat a skill as just another markdown file you drop somewhere in the repo. It isn't. Both [Claude Code](https://code.claude.com/docs/en/skills) and [OpenAI Codex](https://learn.chatgpt.com/docs/build-skills) discover skills by walking the project tree for a **directory** that contains a `SKILL.md` file, not a flat file. Here's what each client actually looks for, the bug a shape mismatch causes, and how [Waaseyaa](https://waaseyaa.org/)'s installer package, Bimaaji, fixed it by sharing one renderer across both clients instead of maintaining two.

## What Claude Code actually discovers

A Claude Code project skill lives at:

```
.claude/skills/<skill-name>/SKILL.md
```

Two details matter here:

- **The command name comes from the directory name**, not from the `name` field in the file's frontmatter. The frontmatter `name` is only the display label shown in skill listings.
- **Frontmatter is only recognized when the opening `---` is the file's first line.** If anything precedes it — a comment, a blank line, a provenance marker — Claude Code won't parse it as frontmatter at all.

A flat `.claude/skills/<name>.md` file is not a documented layout, and Claude Code doesn't discover it. Bimaaji's installer originally emitted exactly that flat shape, and every "file written" count it reported was quietly counting output the client would never load.

## What Codex actually discovers

Codex's convention is split in two:

- A root `AGENTS.md` for always-loaded project guidance — the same vendor-neutral file [Devin Desktop and JetBrains Junie](https://agents.md) read.
- Detailed, on-demand skills under `.agents/skills/<skill-name>/SKILL.md`, discovered by walking from the current working directory up to the repository root.

Codex's per-skill directory shape is the same structural contract as Claude Code's: a directory per skill, a `SKILL.md` inside it, `name`/`description` metadata in frontmatter. Bimaaji's installer used to fold every skill body straight into `AGENTS.md` as one consolidated file. That worked, in the sense that Codex could read it, but it threw away the on-demand loading both clients are designed around — the whole point of a skill is that its detail loads only when needed, not on every request.

## The fix: one renderer, not two

Once both clients turned out to want the same shape — a concise always-loaded guidance file plus one `SKILL.md` per skill — Bimaaji stopped maintaining separate Claude and Codex renderers and introduced a shared base class both transformers extend. Each subclass supplies only two things:

- its client id (`claude` or `codex`)
- its guidance file's title line

Everything else — the per-skill file layout, whether frontmatter is required, the guidance index, and a provenance footer — comes from the shared renderer plus a small per-client capabilities lookup (skill file paths, whether frontmatter must sit at byte zero, and so on).

That provenance footer is the detail worth stealing for your own installers. Two pieces of metadata do the work:

- Every generated skill file carries an HTML-comment footer with the **sha256 of the whole skill inventory** it was rendered from.
- The guidance index lists each skill's own **source sha256** next to its target path.

Together they let you *prove*, rather than assume, that Claude and Codex regenerated their skill files from the same canonical source — and that the two clients' output is byte-identical for the same input.

## Claude Code vs. Codex, side by side

| | Claude Code | Codex |
|---|---|---|
| Always-loaded guidance | `.claude/CLAUDE-WAASEYAA.md` (kept separate from a consumer's own `CLAUDE.md`) | root `AGENTS.md` |
| Per-skill file | `.claude/skills/<skill-name>/SKILL.md` | `.agents/skills/<skill-name>/SKILL.md` |
| Discovery key | directory name | directory name |
| Frontmatter required at byte zero | yes | per capability lookup |
| Command name source | directory name, not frontmatter `name` | directory name |

## What this means if you're building similar tooling

- **Don't trust your own success counters.** A "files written" count that doesn't check whether the client's discovery mechanism actually finds those files will lie to you convincingly.
- **Cite the client's own docs, not an issue description.** Bimaaji's changelog is explicit that the Codex per-skill layout only shipped once there was a citable, verified discovery mechanism from OpenAI's own docs — not because it seemed like a reasonable guess.
- **One renderer beats one renderer per client** once you notice two clients want the same shape. Two copies of "how a skill file gets rendered" is exactly the kind of thing that drifts quietly.

Baamaapii
