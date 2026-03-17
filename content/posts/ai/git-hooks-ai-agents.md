---
title: "Git hooks are your best defense against AI-generated mess"
date: 2026-03-16
categories: [ai, tools]
tags: [git, claude-code, ai-agents]
summary: "Git hooks have always enforced standards before code enters a repo. With AI agents writing commits autonomously, they've become essential."
slug: "git-hooks-ai-agents"
draft: true
devto: true
---

Ahnii!

[Git hooks](https://git-scm.com/docs/githooks) have been around forever. Pre-commit linting, pre-push test suites, commit message formatting. Useful but optional. Most developers set them up once and forget about them.

With AI agents writing and committing code, hooks aren't optional anymore. They're the gate between an agent's output and your repository. This post covers why hooks matter more now than ever and what to enforce.

## The Problem Hooks Solve

An AI agent can generate syntactically correct code that passes its own review and still violate your project's standards. Wrong import style. Missing type annotations. A function with cognitive complexity over your threshold. Tests that pass but don't cover the edge case your team cares about.

Without hooks, that code lands in your repo. You catch it in code review, or worse, you don't.

A pre-commit hook catches it before the commit exists. The agent gets the failure, adjusts, and tries again. No human review needed for mechanical violations.

## What to Enforce

Start with what you already lint. If your project has a linter config, a pre-commit hook should run it.

```bash
#!/bin/sh
# .git/hooks/pre-commit

# PHP
vendor/bin/pint --test || exit 1

# Go
golangci-lint run || exit 1

# TypeScript
npm run lint || exit 1
```

Each command exits non-zero on failure. Git aborts the commit. The agent sees the error output and fixes it.

Beyond linting, consider what agents get wrong most often:

**Type checking.** Agents generate plausible TypeScript that `tsc` rejects. Run `tsc --noEmit` in the hook.

```bash
# TypeScript type checking
npx tsc --noEmit || exit 1
```

This catches type errors before they reach the commit, not in CI minutes later.

**Tests.** Run the fast subset. A full test suite in a pre-commit hook slows everything down, but a targeted run against changed files catches regressions early.

```bash
# Run tests related to changed files
changed=$(git diff --cached --name-only --diff-filter=d)
if echo "$changed" | grep -q '\.go$'; then
  go test ./... -short || exit 1
fi
```

The `-short` flag skips slow integration tests. Fast enough for a hook, thorough enough to catch breakage.

**Commit message format.** Agents default to generic messages. A commit-msg hook enforces your convention.

```bash
#!/bin/sh
# .git/hooks/commit-msg
msg=$(cat "$1")
if ! echo "$msg" | grep -qE '^(feat|fix|chore|docs|refactor|test):'; then
  echo "Commit message must start with feat:|fix:|chore:|docs:|refactor:|test:"
  exit 1
fi
```

This keeps the git log useful regardless of who (or what) wrote the commit.

## Sharing Hooks Across a Team

Git hooks live in `.git/hooks/`, which isn't tracked by version control. For shared enforcement, use a hooks manager.

[Husky](https://typicode.github.io/husky/) handles JavaScript/TypeScript projects:

```bash
npx husky init
echo "npm run lint && npm test" > .husky/pre-commit
```

For multi-language projects, [pre-commit](https://pre-commit.com/) runs hooks defined in a YAML config:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: lint
        name: lint
        entry: golangci-lint run
        language: system
        types: [go]
      - id: test
        name: test
        entry: go test ./... -short
        language: system
        types: [go]
```

Both approaches commit the hook configuration to the repo. New clones get the same enforcement.

## Why Agents Actually Benefit From Hooks

Hooks aren't just a safety net. They improve agent output.

When [Claude Code](https://docs.anthropic.com/en/docs/claude-code) hits a pre-commit hook failure, it reads the error, fixes the violation, and re-commits. The feedback loop is immediate. No round-trip through CI. No waiting for a human reviewer to flag the same lint violation for the third time.

This creates a pattern where the agent learns the project's standards through enforcement. The hook is a form of codified context: it tells the agent what matters mechanically, so humans can focus on what matters architecturally.

Projects without hooks rely on the agent's training data and whatever's in the CLAUDE.md to get conventions right. Projects with hooks verify it. The difference shows up in commit quality over weeks of AI-assisted development.

## A Minimal Setup

If you have nothing today, start here:

```bash
mkdir -p .githooks
cat > .githooks/pre-commit << 'EOF'
#!/bin/sh
set -e

# Add your linter command
# vendor/bin/pint --test
# golangci-lint run
# npm run lint

echo "Pre-commit checks passed"
EOF

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

The `.githooks/` directory is version-controlled. `core.hooksPath` tells git to use it instead of `.git/hooks/`. Every clone, every agent session, gets the same gates.

Uncomment the linter for your stack, add tests if they're fast enough, and you have a foundation that catches mechanical errors whether the author is human or AI.

Baamaapii
