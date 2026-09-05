---
title: "A nested git worktree broke our pre-push gate"
date: 2026-09-05
categories: [devops]
tags: [php, git, ci, testing]
series: []
summary: "A stray PHPStan cache in a nested git worktree got scanned as production code, showing why filesystem-exclusion rules for local gates need to match at any depth."
slug: "nested-git-worktree-pre-push-gate"
draft: false
---

Ahnii!

The [waaseyaa/framework](https://github.com/waaseyaa/framework) repo has a set of "S1 roster" gates: scripts that scan the tree for specific governed patterns (things like raw SQLite construction or schema-boundary crossings) and compare what they find against a recorded, reviewed roster. The whole point is that a local run and a CI run of the same gate must agree on the same tree — that's spelled out as an explicit invariant in the repo's `governed-gates.md` spec. One exclusion gap in the shared scanner broke that guarantee.

## What broke

Every S1 gate shares one function, `s1RosterIsExcluded()`, that decides which paths are "never repository content" and therefore skipped. Before the fix, it looked like this:

```php
function s1RosterIsExcluded(string $relative): bool
{
    if (str_starts_with($relative, '.git/')
        || str_starts_with($relative, 'storage/')
        || str_starts_with($relative, 'tmp/')
    ) {
        return true;
    }

    return str_starts_with($relative, 'vendor/')
        || str_contains($relative, '/vendor/')
        || str_starts_with($relative, 'node_modules/')
        || str_contains($relative, '/node_modules/');
}
```

That function had three inconsistent rules:

- **`vendor/` and `node_modules/`** were excluded at any depth — `str_contains($relative, '/vendor/')` catches a vendored copy nested inside another package.
- **`tmp/`** only had the `str_starts_with` check, so it was excluded at the repo root but not anywhere nested.
- **`.claude/worktrees/`** — the directory where a separate git worktree checkout lives — wasn't excluded at all.

That gap had a concrete failure: with one nested git worktree present, a *different* checkout's PHPStan result cache (`.claude/worktrees/*/tmp/phpstan*/resultCache.php`) got walked by the scanner and read as a governed SQLite-construction and schema-boundary candidate. Two gates — `check-s1-sqlite-contract` and `check-s1-schema-authority` — failed in the primary working tree while passing in CI, because CI checks out exactly one tree and never has nested worktrees.

`check-pr-preflight` is the pre-push hook, so a failing gate meant a broken hook — and `--no-verify` became the routine way around it. That's the part that makes this more than a cosmetic bug: a local/CI mismatch in a gate that's supposed to guarantee local/CI agreement quietly teaches developers to skip the hook.

## The fix

The fix makes `tmp/` match the same any-depth pattern already used for `vendor/` and `node_modules/`, and adds an outright exclusion for nested worktrees:

```php
function s1RosterIsExcluded(string $relative): bool
{
    if (str_starts_with($relative, '.git/')
        || str_starts_with($relative, 'storage/')
        || str_starts_with($relative, '.claude/worktrees/')
    ) {
        return true;
    }

    return str_starts_with($relative, 'vendor/')
        || str_contains($relative, '/vendor/')
        || str_starts_with($relative, 'node_modules/')
        || str_contains($relative, '/node_modules/')
        || str_starts_with($relative, 'tmp/')
        || str_contains($relative, '/tmp/');
}
```

Two things worth calling out:

- **`tmp/` now matches at any depth**, the same rule `vendor/` already had. A nested `packages/demo/tmp/cache` is exactly as invisible to the gate as a nested `packages/demo/vendor`.
- **`.claude/worktrees/` is excluded outright**, but `.claude/` itself is *not*. `.claude/rules/*.md` and `.claude/settings.json` are tracked repository content, so widening the exclusion to all of `.claude/` would have been a regression, not a fix.

## Guarding both directions

The test added alongside the fix checks both sides of that boundary. It plants poison files in the newly excluded paths and confirms they contribute nothing:

```php
'packages/demo/tmp/cache',
'.claude/worktrees/wf_x/tmp/phpstan',
'.claude/worktrees/wf_x/packages/demo/src',
```

And a second test asserts the exclusion didn't overreach — a tracked file under `.claude/rules/` must still show up as a candidate:

```php
#[Test]
public function tracked_claude_content_is_still_scanned(): void
{
    mkdir($this->tempDir . '/.claude/rules', 0o755, true);
    file_put_contents($this->tempDir . '/.claude/rules/Tracked.php', "<?php\nGovernedNeedle::run();\n");

    $entries = s1RosterScan(/* ... */);

    $this->assertCount(1, $entries, 'Tracked .claude/ content must remain scannable.');
}
```

That second test is the one that keeps this fix from sliding into "just exclude more stuff." An exclusion rule for a scanner like this has two failure modes, not one: too narrow, and it scans noise; too broad, and it stops catching real violations. Testing only the first would have let a future change quietly widen the blast radius.

## What verification looked like

Because the fix touches a gate that other gates depend on, the commit records exactly what was checked before merging, with the nested worktree still on disk:

| Check | Result |
| --- | --- |
| `check-pr-preflight` | 37/37 passing |
| Architecture suite | 556 tests / 31,394 assertions |
| `support/s1-sqlite-construction-roster.json` | unchanged |
| `support/s1-schema-authority-roster.json` | unchanged |

The unchanged rosters matter as much as the passing gates: they confirm the candidates removed by the fix were never legitimate governed occurrences in the first place, just phantom matches from a checkout the gate should never have looked at.

## The lesson

An exclusion list for a filesystem scanner is only as strong as its least-consistent rule. `vendor/` and `node_modules/` got the any-depth treatment because vendored and installed dependencies nest inside sub-packages. `tmp/` didn't. Nobody had hit the case where a *build artifact* — not a dependency — showed up nested. Git worktrees are exactly that case: a second checkout living inside `.claude/worktrees/` puts an entire parallel `tmp/`, cache files and all, somewhere a root-only `tmp/` rule will never see.

If you're writing a gate that's meant to make local and CI agree, the exclusion rules need to account for every local-only surface — not just the ones you tested against when you wrote the rule.

Baamaapii
