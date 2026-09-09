---
categories:
    - php
    - waaseyaa
date: 2026-09-07T00:00:00Z
devto: true
devto_id: 4615839
draft: false
slug: git-native-repository-file-enumeration
summary: Why Waaseyaa's CI gate scanners stopped walking the filesystem with a hand-maintained exclusion list and started asking git what's actually in the repository.
tags:
    - php
    - waaseyaa
    - git
    - ci
title: Stop walking the filesystem in your CI gates — ask git instead
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework) has a family of "S1 roster" gate scripts that scan the tree for specific governed patterns — raw SQLite construction, schema-boundary crossings — and compare what they find against a recorded, reviewed roster. A related `check-access-hardening` gate scans for missing authorization guards. All of them needed the same thing first: a list of files to scan. Getting that list right turned out to be harder than it sounds, and the eventual fix replaced a hand-maintained exclusion list with one line: ask git.

## The problem with walking the filesystem

The original scanners enumerated files with a `RecursiveDirectoryIterator` and then subtracted paths that matched a denylist — `vendor/`, `node_modules/`, `.git/`, and so on. That denylist was a stand-in for "repository content," rebuilt by hand instead of asked from the one tool that actually knows the answer. Every time a new kind of untracked tree showed up, the denylist needed another entry.

That's exactly what happened. Nested git worktrees under `.worktrees/` or `.claude/worktrees/`, and a populated `packages/<pkg>/vendor/`, weren't on the list. On the primary checkout, that gap produced:

- **24,780 phantom findings** across three gates — 18,844, 5,932, and 4 — as nested worktree build caches and vendored trees read as governed pattern matches.
- `--write-construction-roster` would have **committed `.worktrees/...` paths into the tracked roster**, permanently baking a developer-local artifact into shared state.
- `check-access-hardening` had **no exclusion at all** beyond requiring `/src/` in the path, so a vendored library shipping its own `src/` directory was scanned as if it were first-party code — the source of that gate's 4.

The root cause wasn't any single missing entry — it was structural. A walk-minus-denylist re-creates the repository boundary by hand, and a denylist only ever grows in response to the last thing that broke it.

## The fix: `git ls-files`, not a walk

Both scanners now go through one shared helper, `bin/lib/repository-files.php`:

```php
function repositoryFiles(string $root, array $pathspecs = []): array
{
    $normalizedRoot = rtrim(str_replace('\\', '/', $root), '/');
    $arguments = ['ls-files', '-z', '--cached', '--others', '--exclude-standard'];
    $pathspecs = array_values(array_filter($pathspecs, static fn(string $pathspec): bool => $pathspec !== ''));
    if ($pathspecs !== []) {
        $arguments[] = '--';
        array_push($arguments, ...$pathspecs);
    }

    [$exitCode, $listing, $error] = repositoryGit($normalizedRoot, $arguments);
    if ($exitCode !== 0) {
        throw new RuntimeException(sprintf(
            'repository-files: git could not enumerate repository files under %s (exit %d)%s',
            $normalizedRoot,
            $exitCode,
            $error === '' ? '.' : ': ' . $error,
        ));
    }

    $files = [];
    foreach (explode("\0", $listing) as $relative) {
        if ($relative === '' || !is_file($normalizedRoot . '/' . $relative)) {
            continue;
        }
        $files[$relative] = true;
    }
    $paths = array_keys($files);
    sort($paths, SORT_STRING);

    return $paths;
}
```

`git ls-files --cached --others --exclude-standard` returns tracked files plus untracked files git would add, honoring `.gitignore` along the way. That single command replaces the denylist entirely:

- **`.gitignore` becomes the exclusion boundary by construction.** Nothing to maintain, nothing to forget.
- **Git never descends into another repository's work tree**, so a nested worktree is invisible whether or not it happens to be ignored. No `.worktrees/` special case needed.
- **A root git can't enumerate fails closed** — `repositoryFiles()` throws instead of silently falling back to a filesystem walk. If the gate can't trust its own file list, it doesn't run.

## The second bug: git answered the wrong repository's question

Shipping the git-native scanner exposed a subtler problem. A pre-push hook run from a linked worktree exports `GIT_DIR=<main>/.git/worktrees/<name>` into the environment. The scanner's `git -C $root ls-files` inherited that variable — and `GIT_DIR` overrides `-C` entirely, so the command enumerated the hook's repository instead of the scan root.

Worse, the access-hardening gate's self-test calls `git init` on a fixture directory to set up test data. With `GIT_DIR` still pointing at the developer's own worktree gitdir, that `git init` "reinitialized" the developer's real repository as bare (`core.bare=true` in the shared `.git/config`), breaking every git command in the main checkout. Any contributor with project hooks installed who pushed from `.claude/worktrees/*` or `.worktrees/*` could hit this.

The fix scrubs every environment variable git itself uses to select a repository before running a child process:

```php
const REPOSITORY_LOCAL_GIT_ENVIRONMENT = [
    'GIT_ALTERNATE_OBJECT_DIRECTORIES',
    'GIT_COMMON_DIR',
    'GIT_CONFIG',
    'GIT_CONFIG_COUNT',
    'GIT_CONFIG_PARAMETERS',
    'GIT_DIR',
    'GIT_GRAFT_FILE',
    'GIT_IMPLICIT_WORK_TREE',
    'GIT_INDEX_FILE',
    'GIT_NO_REPLACE_OBJECTS',
    'GIT_OBJECT_DIRECTORY',
    'GIT_PREFIX',
    'GIT_REPLACE_REF_BASE',
    'GIT_SHALLOW_FILE',
    'GIT_WORK_TREE',
];

function repositoryGitEnvironment(): array
{
    $environment = getenv();
    foreach (REPOSITORY_LOCAL_GIT_ENVIRONMENT as $name) {
        unset($environment[$name]);
    }

    return $environment;
}
```

This is git's own `local_repo_env` list — the set git clears before running a command against another repository. With it scrubbed, `-C $root` is the only thing left that selects which repository a child git process operates on.

## What changed, and what didn't

| Before | After |
| --- | --- |
| `RecursiveDirectoryIterator` + hand-maintained denylist | `git ls-files -z --cached --others --exclude-standard` |
| New untracked-tree kind → new denylist entry, reactively | `.gitignore` is the boundary; nothing to add |
| Access-hardening gate: no exclusion beyond an `/src/` path check | Same git-backed enumeration as the roster scanners |
| Git child processes inherited hook environment | Repository-selecting env vars scrubbed on every git call |
| Silent fallback risk if enumeration failed | Fails closed with a clear error; no fallback walk |

Regenerating all four `support/s1-*-roster.json` files against the new scanner produced a **zero diff** — the fix removed phantom candidates without touching a single legitimate one. All three gates then passed read-only against a checkout holding sixteen nested worktrees and a populated `packages/ai-agent/vendor/`.

## The general lesson

If you're writing a script that scans "the repository" — a linter, a gate, an audit tool — resist the urge to walk the filesystem and subtract what you don't want. A denylist encodes everything you've already been burned by; it says nothing about what you haven't hit yet. Git already knows the answer to "what files are in this repository," `.gitignore` and all, and `git ls-files` will give it to you in one call.

And if that script ever shells out to git from inside a hook or a nested worktree, don't assume the environment is clean. Hooks can carry repository-selecting variables that override the very `-C` flag you're relying on to scope the command — scrub them, or you may find `git init` pointed at the wrong repository entirely.

Baamaapii
