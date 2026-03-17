---
title: "Flag untriaged GitHub issues automatically with Claude Code hooks"
date: 2026-03-16
categories: [ai]
tags: [claude-code, github, automation, developer-tools]
summary: "Use a Claude Code startup hook to surface untriaged GitHub issues and stale milestones before you write any code."
slug: "flag-untriaged-issues-claude-code-hooks"
draft: true
devto: true
---

Ahnii!

The best project management happens automatically. [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) has a feature called hooks that runs shell commands at key moments during your session. This post shows how to build a startup hook that flags untriaged GitHub issues before you write a single line of code.

## What Are Claude Code Hooks

Hooks are shell commands that Claude Code executes in response to events. You configure them in `.claude/settings.json` at the project level. There are several hook types:

- **SessionStart** fires when you open Claude Code in a project
- **PreToolUse** fires before Claude calls a tool (like editing a file or running a command)
- **PostToolUse** fires after a tool completes

The output of a hook flows into Claude's context. If your `SessionStart` hook prints a warning, Claude sees it and can act on it. That's what makes hooks useful for governance: you surface the right information at the right time, automatically.

## The Goal: Catch Untriaged Issues Early

An "untriaged" issue is one that exists in your tracker but hasn't been assigned to a milestone. It's not on the roadmap. Nobody has decided when it gets done.

These issues pile up. You create a bug report, forget to assign it, and three weeks later it's buried under newer work. Multiply that across a team and your issue tracker becomes a graveyard of good intentions.

The fix is simple: check for untriaged issues at the start of every coding session. If any exist, surface them so you can triage before diving into code.

Here's what that looks like in practice:

```text
❯ claude

● Startup hook detected 3 untriaged issues:

  #163 - Clean up dead $twig property writes in controllers
  #162 - Remove continue-on-error from admin bundle CI job
  #161 - Create docs/specs/workflow.md referenced in CLAUDE.md

  2 milestones have no open issues: v1.3, v1.3.1
```

Claude receives this summary at the start of your session and can flag untriaged issues immediately.

Claude sees this output and can immediately ask what you want to do about it.

## Build the Milestone Check Script

Create a `bin/check-milestones` script in your project. This uses the [GitHub CLI](https://cli.github.com/) (`gh`) to query your issues and milestones.

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

# Find open issues with no milestone
untriaged=$(gh issue list --repo "$REPO" --no-milestone --state open --json number,title --jq '.[] | "#\(.number) - \(.title)"')

if [ -n "$untriaged" ]; then
  count=$(echo "$untriaged" | wc -l)
  echo "⚠ ${count} untriaged issues (no milestone assigned):"
  echo "$untriaged"
  echo ""
fi

# Find milestones with zero open issues
stale=$(gh api "repos/${REPO}/milestones?state=open" --jq '.[] | select(.open_issues == 0) | .title')

if [ -n "$stale" ]; then
  echo "⚠ Milestones with no open issues (possibly stale):"
  echo "$stale"
  echo ""
fi

if [ -z "$untriaged" ] && [ -z "$stale" ]; then
  echo "✓ All issues triaged, no stale milestones."
fi
```

The script does two things. First, it queries for open issues that have no milestone assigned. Second, it checks for milestones that have zero open issues, which usually means the milestone is done and should be closed, or something fell through the cracks.

Make it executable:

```bash
chmod +x bin/check-milestones
```

This marks the script as executable so your shell can run it directly.

```bash
./bin/check-milestones
```

This runs the script locally so you can verify the output before wiring it into a hook.

Adapt this to your workflow. You might want to check for issues without assignees, issues older than 30 days, or PRs that reference closed issues. The script is yours to extend.

## Wire It Into Claude Code

Add the hook to your project's `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "bash bin/check-milestones",
        "timeout": 10000
      }
    ]
  }
}
```

The `timeout` is in milliseconds. Ten seconds is generous for a `gh` API call, but you want the hook to fail gracefully rather than block your session if your network is slow.

That's the entire configuration. Next time you open Claude Code in this project, the hook fires, the script runs, and Claude receives the output.

## What This Looks Like in Practice

With the hook in place, your workflow changes in a small but useful way. You open Claude Code and immediately see the state of your issue tracker. No extra commands. No switching to the browser to check GitHub.

If there are untriaged issues, Claude can help you triage them. You can say "assign those three issues to the v1.4 milestone" and Claude will handle it through the GitHub API. If milestones are stale, you can close them on the spot.

The real value is consistency. Every session starts with a clean picture of your project's health. Issues don't drift because you see them every time you sit down to code.

This pattern connects to a broader idea: treating project governance as automation rather than discipline. If you're interested in that direction, the [Codified Context]({{< relref "codified-context-the-problem" >}}) series covers a full three-tier architecture for keeping AI sessions aligned with your codebase.

Baamaapii
