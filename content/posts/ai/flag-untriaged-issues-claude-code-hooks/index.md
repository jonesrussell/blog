---
categories:
    - ai
date: 2026-03-22T00:00:00Z
devto_id: 3386550
draft: false
slug: flag-untriaged-issues-claude-code-hooks
summary: Use a Claude Code startup hook to surface untriaged GitHub issues and stale milestones before you write any code.
tags:
    - claude-code
    - github
    - automation
    - developer-tools
title: Flag untriaged GitHub issues automatically with Claude Code hooks
---

Ahnii!

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) has a feature called hooks that runs shell commands at key moments during your session. This post shows how to build a startup hook that flags untriaged GitHub issues before you write a single line of code.

## What Are Claude Code Hooks

Hooks are shell commands that Claude Code executes in response to lifecycle events. You configure them in `.claude/settings.json` at the project level. The most common hook events:

- **SessionStart** fires when you open Claude Code in a project
- **PreToolUse** fires before Claude calls a tool (like editing a file or running a command)
- **PostToolUse** fires after a tool completes
- **UserPromptSubmit** fires when you send a message

There are [over 20 hook events](https://docs.anthropic.com/en/docs/claude-code/hooks) in total, including `SubagentStart`, `PreCompact`, `Notification`, and more.

For `SessionStart` hooks, stdout flows directly into Claude's context. If your hook prints a warning, Claude sees it and can act on it. That's what makes hooks useful for governance: you surface the right information at the right time, automatically.

## The Goal: Catch Untriaged Issues Early

An "untriaged" issue is one that exists in your tracker but hasn't been assigned to a milestone. It's not on the roadmap. Nobody has decided when it gets done.

These issues pile up. You create a bug report, forget to assign it, and three weeks later it's buried under newer work. Multiply that across a team and your issue tracker becomes a graveyard of good intentions.

The fix is simple: check for untriaged issues at the start of every coding session. If any exist, surface them so you can triage before diving into code.

Here's what that looks like in practice:

```text
❯ claude

⚠ 3 untriaged issues (no milestone assigned):
#163 - Clean up dead $twig property writes in controllers
#162 - Remove continue-on-error from admin bundle CI job
#161 - Create docs/specs/workflow.md referenced in CLAUDE.md

⚠ Milestones with no open issues (possibly stale):
v1.3
v1.3.1
```

Claude sees this output and can immediately ask what you want to do about it.

## Build the Milestone Check Script

Create a `bin/check-milestones` script in your project. This uses the [GitHub CLI](https://cli.github.com/) (`gh`) to query your issues and milestones.

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

# Find open issues with no milestone
untriaged=$(gh issue list --repo "$REPO" --search "no:milestone" \
  --state open --json number,title \
  --jq '.[] | "#\(.number) - \(.title)"')

if [ -n "$untriaged" ]; then
  count=$(echo "$untriaged" | wc -l)
  echo "⚠ ${count} untriaged issues (no milestone assigned):"
  echo "$untriaged"
  echo ""
fi

# Find milestones with zero open issues
stale=$(gh api "repos/${REPO}/milestones?state=open" \
  --jq '.[] | select(.open_issues == 0) | .title')

if [ -n "$stale" ]; then
  echo "⚠ Milestones with no open issues (possibly stale):"
  echo "$stale"
  echo ""
fi

if [ -z "$untriaged" ] && [ -z "$stale" ]; then
  echo "✓ All issues triaged, no stale milestones."
fi
```

The script does two things. First, it uses GitHub's search syntax (`no:milestone`) to find open issues with no milestone assigned. Second, it checks for milestones that have zero open issues, which usually means the milestone is done and should be closed, or something fell through the cracks.

Make it executable:

```bash
chmod +x bin/check-milestones
```

This marks the script as executable so your shell can run it directly.

## Verify It Works

Run the script before wiring it into a hook:

```bash
./bin/check-milestones
```

You should see one of two things. If you have untriaged issues or stale milestones, the script prints warnings with issue numbers and titles. If everything is triaged, you get a clean `✓ All issues triaged, no stale milestones.` message.

If you see `command not found: gh`, install the [GitHub CLI](https://cli.github.com/) first. If you see authentication errors, run `gh auth login`.

Adapt this to your workflow. You might want to check for issues without assignees, issues older than 30 days, or PRs that reference closed issues. The script is yours to extend.

## Wire It Into Claude Code

Add the hook to your project's `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash bin/check-milestones 2>&1",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Each hook event takes an array of matcher groups. The empty `matcher` means "always run." Inside, the `hooks` array holds the commands to execute. The `type` field is required. The `timeout` is in seconds, and 10 is generous for a couple of API calls.

To confirm the hook is wired correctly, open Claude Code in your project:

```bash
claude
```

You should see the milestone check output appear as a system message at the top of your session. Claude receives this output and can act on it immediately.

## How a Startup Hook Changes Your Workflow

With the hook in place, your workflow changes in a small but useful way. You open Claude Code and immediately see the state of your issue tracker. No extra commands. No switching to the browser to check GitHub.

If there are untriaged issues, Claude can help you triage them. You can say "assign those three issues to the v1.4 milestone" and Claude will handle it through the GitHub API. If milestones are stale, you can close them on the spot.

The real value is consistency. Every session starts with a clean picture of your project's health. Issues don't drift because you see them every time you sit down to code.

This pattern connects to a broader idea: treating project governance as automation rather than discipline. If you're interested in that direction, the [Codified Context]({{< relref "codified-context-the-problem" >}}) series covers a full three-tier architecture for keeping AI sessions aligned with your codebase.

Baamaapii
