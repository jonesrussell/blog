# Dev Server Lifecycle Management — Design Spec

**Date:** 2026-03-21
**Status:** Draft
**Scope:** Claude Code hooks for dev server cleanup, URL verification skill, blog post

## Problem

AI coding assistants start dev servers but never clean them up. Multiple stale processes accumulate across sessions. The AI also presents localhost URLs without verifying them — wrong ports, missing base paths, confident 404s.

This is a recurring pattern across the AI-assisted development community, not specific to any one tool.

## Solution: Two Parts

### Part 1: Hooks — Dev Server Lifecycle

#### Hook Input Format

Claude Code hooks receive JSON on stdin. For `Bash` tool calls:

- **PreToolUse:** `{ "tool_name": "Bash", "tool_input": { "command": "hugo server -D", ... } }`
- **PostToolUse:** `{ "tool_name": "Bash", "tool_input": { "command": "..." }, "tool_result": "..." }`

The hook scripts parse `tool_input.command` to detect dev server patterns.

#### Server Command Patterns

Both hooks share a pattern list for detection:

```
hugo server
vite
npm run dev
npx next dev
task serve
php artisan serve
```

Matching uses substring search against `tool_input.command`. Only commands matching these patterns trigger the cleanup/registration logic.

#### PreToolUse Hook (`dev-server-guard.sh`)

- **Triggers on:** `Bash` tool calls
- **Behavior:**
  1. Parses `tool_input.command` from stdin JSON
  2. Checks if the command matches a dev server pattern — if not, exits 0 immediately
  3. Reads `/tmp/claude-dev-servers.json` for tracked processes
  4. Kills any tracked processes that are still running (verified with `kill -0`)
  5. Prunes dead entries from the tracking file
  6. Falls back to `pgrep -f` with the full server command pattern (e.g., `pgrep -f "hugo server"`, not `pgrep hugo`) to catch untracked servers
  7. Outputs what it killed to stderr so the AI sees it
  8. Exits 0 to allow the command to proceed
- **Location:** `/home/jones/.claude/hooks/dev-server-guard.sh`

#### PostToolUse Hook (`dev-server-register.sh`)

- **Triggers on:** `Bash` tool calls
- **Behavior:**
  1. Parses `tool_input.command` from stdin JSON
  2. Checks if the command matches a dev server pattern — if not, exits 0 immediately
  3. Detects PID using `pgrep -f "{command}"` (the same command string from the tool input) — this is the reliable method since the hook runs in a separate process and cannot access `$!` from the original shell
  4. Detects port using this priority:
     - Parse CLI flags from the command: `-p`, `--port`, `-P`
     - Fall back to framework defaults: Hugo=1313, Vite=5173, Next.js=3000, Laravel=8000
     - Last resort: `lsof -i -P | grep {pid}` to find the actual listening port
  5. If PID found, writes entry to `/tmp/claude-dev-servers.json`
  6. If no matching process found (server crashed on start), outputs warning to stderr
- **Location:** `/home/jones/.claude/hooks/dev-server-register.sh`

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

Hooks are registered in `~/.claude/settings.json` using absolute paths:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/home/jones/.claude/hooks/dev-server-guard.sh"
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
            "command": "/home/jones/.claude/hooks/dev-server-register.sh"
          }
        ]
      }
    ]
  }
}
```

For the blog post and shareable gist, use `$HOME/.claude/hooks/` with a note that tilde expansion may not work.

### Part 2: Skill — URL Verification (`dev-server-url`)

#### Invocation Model

This is a Claude Code skill defined in `SKILL.md`. It is invoked in two ways:

1. **CLAUDE.md instruction:** Projects add to their CLAUDE.md: "Before presenting any localhost URL to the user, use the dev-server-url skill to verify it." This causes the AI to invoke the skill automatically.
2. **Explicit slash command:** The user or AI calls `/dev-server-url` manually.

There is no automatic hook-based trigger — skills are instruction-driven, not event-driven. The CLAUDE.md instruction is the primary mechanism.

#### Behavior (in order)

1. Read `/tmp/claude-dev-servers.json` for active servers (verify PIDs are still running)
2. Detect base URL from project config:

| Framework | Config file | Key |
|---|---|---|
| Hugo | `hugo.toml` / `hugo.yaml` | `baseURL` |
| Vite | `vite.config.*` | `base` |
| Next.js | `next.config.*` | `basePath` |
| Laravel | `.env` | `APP_URL` |

3. Construct full URL: `http://localhost:{port}` + base path + route
4. Verify with `curl -s -o /dev/null -w "%{http_code}"`, check for 200
5. On failure, try variations:
   - With and without base path
   - Alternate ports from tracking file
   - Port +1 (Hugo's auto-increment behavior)
6. Present with transparency:
   - Success: just give the URL
   - Auto-corrected: "The server uses base path `/blog/`, so the correct URL is: ..."
   - Failed: "The server doesn't seem to be responding. Here's what I tried: ..."

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
| PreToolUse hook | `/home/jones/.claude/hooks/dev-server-guard.sh` | Gist |
| PostToolUse hook | `/home/jones/.claude/hooks/dev-server-register.sh` | Gist |
| Hook config | `~/.claude/settings.json` | In blog post |
| URL verification skill | `~/dev/skills/skills/dev-server-url/SKILL.md` | Skills repo |
| Blog post (draft) | `content/posts/ai/dev-server-lifecycle/index.md` | Published |

## Out of Scope

- Non-dev-server long-running processes (watchers, tunnels, builds)
- IDE-specific integrations (VS Code, Cursor)
- Automatic port selection or conflict resolution
