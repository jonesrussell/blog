# Claude Code and Codex skills are directories, not files

Reference URL: https://jonesrussell.github.io/blog/claude-code-codex-skill-directories/

## Bluesky

Claude Code and Codex both discover agent skills as a directory with SKILL.md, not a flat file that silently fails to load. Here's what each client actually expects. https://jonesrussell.github.io/blog/claude-code-codex-skill-directories/ #aiagents

## LinkedIn

If you are building tooling that installs skills for AI coding agents, it is tempting to treat a skill as just another markdown file. It is not.

Both Claude Code and OpenAI Codex discover skills by walking the project tree for a directory containing SKILL.md, not a flat file. For Claude Code, the command name comes from the directory name, not the name field in frontmatter, and frontmatter is only recognized when the opening --- is the file's first line. A flat .claude/skills/name.md file is not a documented layout and never gets discovered at all.

I ran into this while looking at Waaseyaa's Bimaaji package, which installs framework skills into a consuming project. Its installer originally emitted exactly that flat shape for Claude Code, so every file written count it reported was quietly counting output the client would never load.

The fix was not two client-specific renderers patched around the edges. Once both Claude Code and Codex turned out to want the same shape, a concise always-loaded guidance file plus one SKILL.md per skill, Bimaaji introduced a single shared renderer both transformers extend, with a provenance footer so you can prove both clients regenerated identical output from the same source inventory.

Full writeup with the discovery paths and a side by side comparison table: https://jonesrussell.github.io/blog/claude-code-codex-skill-directories/

#softwaredevelopment #aiagents #claudecode #developertools #buildinpublic

## Facebook

Turns out both Claude Code and OpenAI Codex discover AI agent skills the same way: as a directory containing a SKILL.md file, not a flat markdown file. Get the shape wrong and the client just never loads it, no error, no warning.

Wrote up what each client actually expects, the bug this caused in a real installer, and the fix: one shared renderer instead of two drifting copies.

https://jonesrussell.github.io/blog/claude-code-codex-skill-directories/

#buildinpublic #aiagents
