---
title: "Splitting Anokii into composable core, identity, and operator packages"
date: 2026-08-20
categories: [php, waaseyaa]
tags: [php, waaseyaa, architecture, composer]
summary: "How Anokii went from one monolithic repo with duplicate identity code to three composable Composer packages, published by a governed CI split instead of a manual release process."
slug: "anokii-composable-packages"
draft: false
devto: true
---

Ahnii!

[Anokii](https://github.com/waaseyaa/anokii) is a distribution built on the [Waaseyaa](https://github.com/waaseyaa/framework) framework. It used to carry its own copy of identity handling duplicated across the root project instead of living in one place. This post covers how that got split into three composable Composer packages, core, identity, and operator, and the governed CI workflow that publishes them without a full release process.

## The Problem: Duplicate Identity, No Boundary

Before the split, the root Anokii distribution kept its own Identity implementation instead of depending on a single canonical one. Any change to authentication or permissions had to be made carefully in more than one place, and there was no enforced boundary stopping other code from reaching into identity internals.

The fix was to extract two things:

- **`waaseyaa/anokii-core`**, shared primitives only, nothing domain-specific.
- **`waaseyaa/anokii-identity`**, one canonical identity domain: entity, service, permissions, policy, provider, migrations, and an opt-in read-only host surface.

A third package, **`waaseyaa/anokii-operator`**, followed the same pattern. The root distribution now consumes all three instead of maintaining its own duplicate implementations.

## Composer Path Repositories Keep Local Dev Fast

Anokii's root `composer.json` points at each package directory as a local path repository, symlinked, so changes inside `packages/core` or `packages/identity` are picked up immediately without a publish step:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "packages/core",
            "options": {
                "symlink": true,
                "versions": {
                    "waaseyaa/anokii-core": "dev-main"
                }
            }
        },
        {
            "type": "path",
            "url": "packages/identity",
            "options": {
                "symlink": true,
                "versions": {
                    "waaseyaa/anokii-identity": "dev-main"
                }
            }
        }
    ],
    "require": {
        "waaseyaa/anokii-core": "dev-main",
        "waaseyaa/anokii-identity": "dev-main"
    }
}
```

The `symlink` option means editing a file under `packages/identity/src` is the same as editing it in the standalone `anokii-identity` package, no `composer update` round trip. The monorepo stays the single source of truth: everything is authored in `waaseyaa/anokii`, not in the split repos directly.

## The Split-Main Workflow

Getting code out of the monorepo and into standalone `anokii-core` and `anokii-identity` repositories is a `workflow_dispatch` job, not a script anyone runs by hand. It takes three inputs: the exact 40-character `main` SHA to split, a comma-separated list of package names, and a reason (an issue URL or similar).

Before anything is split, the workflow enforces a few gates:

```bash
# Only admin/maintain/write collaborators can dispatch the split
permission="$(gh api "repos/${REPOSITORY}/collaborators/${ACTOR}/permission" --jq '.permission')"
case "${permission}" in
  admin|maintain|write) ;;
  *) echo "::error::${ACTOR} cannot dispatch split-main."; exit 1 ;;
esac
```

It also refuses a stale or unmerged SHA, requiring the requested commit to match `origin/main` exactly, and it blocks until the Quality workflow (PHPUnit, PHPStan, php-cs-fixer, Composer audit) has reported success for that same SHA. Only then does it split:

```bash
split_sha="$(splitsh-lite --prefix="${LOCAL_PREFIX}")"
git push split --force-with-lease="refs/heads/main:${existing}" "${split_sha}:refs/heads/main"
```

[splitsh-lite](https://github.com/splitsh/lite) extracts the git history for one subdirectory (`packages/core`, `packages/identity`) into its own tree, preserving history instead of squashing it. The workflow pushes that exact commit to the split repo's `main` branch, then verifies with `git ls-remote` that what landed matches what was pushed, and uploads a provenance JSON artifact recording the source SHA, prefix, split SHA, actor, and reason.

## Development Main Only, No Releases Yet

The workflow can update `main` on `anokii-core` and `anokii-identity`, but it cannot create tags, GitHub releases, or Packagist releases. That's deliberate: the split-main job proves the extraction is clean and history-preserving without committing to a versioning scheme before one exists. Tagged releases stay a separate, manual, exact-main procedure. Anyone consuming the split repos today does so at `dev-main`, the same version constraint the root project itself uses.

## What the Split Buys You

Splitting this way doesn't just move files around, it enforces a boundary. Every returned identity entity now passes through one canonical access handler instead of whatever each duplicate implementation happened to do. The root distribution's test suite, PHPStan at max level, and a Composer audit all have to pass on the exact commit before that commit is eligible to split, so the packages that ship are never ahead of what was verified.

If you're running a monorepo that needs to publish more than one standalone package, the pattern is worth stealing even without Anokii's specific tooling: keep authoring in one place with Composer path repositories for fast local iteration, gate any split on your CI status for that exact commit, and use `splitsh-lite` to push history-preserving mirrors instead of hand-copying files into separate repos.

Baamaapii
