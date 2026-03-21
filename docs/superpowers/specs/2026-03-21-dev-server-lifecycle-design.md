# Dev Server Lifecycle Management — Design Spec

**Date:** 2026-03-21
**Status:** Draft
**Scope:** Claude Code hooks for dev server cleanup, URL verification skill, blog post

## Problem

AI coding assistants start dev servers but never clean them up. Multiple stale processes accumulate across sessions. The AI also presents localhost URLs without verifying them — wrong ports, missing base paths, confident 404s.

This is a recurring pattern across the AI-assisted development community, not specific to any one tool.

## Solution: Two Parts

### Part 1: Hooks — Dev Server Lifecycle

#### PreToolUse Hook (`dev-server-guard.sh`)

- **Triggers on:** `Bash` tool calls
- **Pattern matches:** `hugo server`, `vite`, `npm run dev`, `npx next dev`, `task serve`, `php artisan serve`, and variants
- **Behavior:**
  1. Reads `/tmp/claude-dev-servers.json` for tracked processes
  2. Kills any tracked processes that are still running
  3. Prunes entries where PID is no longer running
  4. Falls back to `pgrep` against the matched server binary
  5. Outputs what it killed to stderr
  6. Exits 0 to allow the command to proceed
- **Location:** `~/.claude/hooks/dev-server-guard.sh`

#### PostToolUse Hook (`dev-server-register.sh`)

- **Triggers on:** `Bash` tool calls
- **Pattern matches:** Same dev server patterns as PreToolUse
- **Behavior:**
  1. If the command matched a dev server pattern AND ran in background, captures PID
  2. Writes to `/tmp/claude-dev-servers.json`: `{ pid, port, command, cwd, started_at }`
  3. If the process exited immediately, warns via output
- **Location:** `~/.claude/hooks/dev-server-register.sh`

#### Tracking File (`/tmp/claude-dev-servers.json`)

```json
[
  {
    "pid": 515136,
    "port": 1313,
    "command": "hugo server -D",
    "cwd": "/home/jones/dev/blog",
    "started_at": "2026-03-21T15:00:00Z"
  }
]
```

#### Settings Configuration

Hooks are registered in `~/.claude/settings.json` (or project-level settings):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/dev-server-guard.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/dev-server-register.sh"
          }
        ]
      }
    ]
  }
}
```

### Part 2: Skill — URL Verification (`dev-server-url`)

#### Trigger

When the AI is about to present a localhost URL to the user after starting a dev server or referencing one already running.

#### Behavior (in order)

1. Read `/tmp/claude-dev-servers.json` for active servers
2. Detect base URL from project config:

| Framework | Config file | Key |
|---|---|---|
| Hugo | `hugo.toml` / `hugo.yaml` | `baseURL` |
| Vite | `vite.config.*` | `base` |
| Next.js | `next.config.*` | `basePath` |
| Laravel | `.env` | `APP_URL` |

3. Construct full URL: `http://localhost:{port}` + base path + route
4. Verify with HTTP request, check for 200
5. On failure, try variations (with/without base path, alternate ports)
6. Present with transparency:
   - Success: just give the URL
   - Auto-corrected: explain why (e.g., "The server uses base path `/blog/`")
   - Failed: list what was tried

#### Location

`~/dev/skills/skills/dev-server-url/SKILL.md`

### Part 3: Blog Post

- **Title:** "Your AI assistant keeps losing track of dev servers — here's how to fix it"
- **Slug:** `dev-server-lifecycle`
- **Category:** `ai`
- **Tags:** `claude-code`, `developer-experience`, `ai-assisted-development`, `hooks`
- **Series:** None (standalone)
- **Status:** Draft

#### Structure

1. Ahnii! — intro: the scenario everyone recognizes
2. The problem has three parts — stale processes, wrong URLs, no cleanup
3. A real example — the Hugo session that inspired this post
4. Why AI assistants get this wrong — stateless tool calls, no config awareness
5. The fix: hooks + a skill — two-part solution overview
6. Hook implementation — PreToolUse/PostToolUse scripts, tracking file, settings config
7. Skill implementation — URL verification, config awareness, transparency
8. Try it yourself — links to gist/repo, installation instructions
9. Baamaapii

## Deliverables

| Artifact | Location | Shareable |
|---|---|---|
| PreToolUse hook | `~/.claude/hooks/dev-server-guard.sh` | Gist |
| PostToolUse hook | `~/.claude/hooks/dev-server-register.sh` | Gist |
| Hook config | `~/.claude/settings.json` | In blog post |
| URL verification skill | `~/dev/skills/skills/dev-server-url/SKILL.md` | Skills repo |
| Blog post (draft) | `content/posts/ai/dev-server-lifecycle/index.md` | Published |

## Out of Scope

- Non-dev-server long-running processes (watchers, tunnels, builds)
- IDE-specific integrations (VS Code, Cursor)
- Automatic port selection or conflict resolution
