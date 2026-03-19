---
title: "Publishing a PHP monorepo to Packagist with splitsh-lite"
date: 2026-03-24
categories: [ai, php]
tags: [waaseyaa, php, packagist, open-source]
series: ["waaseyaa"]
series_order: 8
series_group: "Main"
summary: "How waaseyaa went from a monorepo with 43 path-repository subpackages to individually installable Composer packages on Packagist using splitsh-lite."
slug: "waaseyaa-packagist"
draft: false
---

Ahnii!

> **Series context:** This is part 8 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Previous posts covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), and the [AI packages]({{< relref "waaseyaa-ai-packages" >}}).

A framework that can't be installed isn't a framework. It's a demo. This post covers how waaseyaa went from a monorepo where every subpackage depended on `@dev` path repositories to individually versioned packages on [Packagist](https://packagist.org/).

## The Problem With "Just Publish It"

Waaseyaa is a monorepo. The root `composer.json` defines 43 subpackages under `packages/`, each referenced as a path repository with `@dev` constraints. During development, this is convenient. [Composer](https://getcomposer.org/) resolves everything locally, and you never think about versioning.

The moment you try to register the root package on Packagist, the problem becomes clear. Packagist can't resolve path repositories. Every `"waaseyaa/entity": "@dev"` in a subpackage's `require` block points to a local directory that doesn't exist on the registry. The root package is unpublishable without publishing every subpackage first.

This isn't a metadata fix. It's an architectural decision about how the monorepo relates to its consumers.

## Four Strategies, One Winner

Before writing any code, four approaches were on the table.

| Strategy | Time to first install | Maintenance | Consumer ergonomics |
|---|---|---|---|
| Split into separate repos | Weeks | High — 43 repos to maintain | Clean, but painful to develop |
| Monorepo + splitsh-lite | Days | Low — automated splits on tag | Clean installs, monorepo dev |
| Private Satis registry | Days | Medium — self-hosted registry | Requires Satis infrastructure |
| Composer metapackage | Hours | Low | Installs everything, no granularity |

**splitsh-lite** won because it preserves the monorepo as the single source of truth while giving Packagist what it needs: one repo per package, each with its own `composer.json` and tagged releases.

The developer workflow doesn't change. You still work in the monorepo. You still run tests from the root. The split is a release concern, not a development concern.

## How splitsh-lite Works

[splitsh-lite](https://github.com/splitsh/lite) reads a subdirectory from your git history and produces a new commit tree containing only that directory's contents, as if it had always been its own repository. It's fast because it operates on git objects directly rather than checking out files.

The workflow:

1. Tag a release in the monorepo (`v1.1.0`)
2. For each subpackage, run splitsh-lite against its directory
3. Push the split commit to a mirror repo (`waaseyaa/entity`, `waaseyaa/field`, etc.)
4. Tag the mirror repo with the same version
5. Packagist auto-syncs from the mirror via webhook

```bash
splitsh-lite --prefix=packages/entity --target=refs/heads/main
```

This produces a commit hash containing only the contents of `packages/entity/`, with history preserved for files in that directory. Push it to the mirror repo and tag it.

## The GitHub Actions Workflow

Manual splits don't scale to 43 packages. A GitHub Actions workflow runs on every tag push, splits each package, and pushes to its mirror.

```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  split:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        package:
          - { local: 'packages/entity', remote: 'entity' }
          - { local: 'packages/field', remote: 'field' }
          - { local: 'packages/access', remote: 'access' }
          # ... all 43 packages
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install splitsh-lite
        run: |
          curl -sL https://github.com/splitsh/lite/releases/download/v1.0.1/lite_linux_amd64.tar.gz | tar xz
          sudo mv splitsh-lite /usr/local/bin/splitsh-lite

      - name: Split and push
        env:
          SPLIT_GH_TOKEN: ${{ secrets.SPLIT_GITHUB_TOKEN }}
          LOCAL_PREFIX: ${{ matrix.package.local }}
          REMOTE_REPO: ${{ matrix.package.remote }}
          REPO_OWNER: ${{ github.repository_owner }}
          TAG_NAME: ${{ github.ref_name }}
        run: |
          REMOTE_URL="https://x-access-token:${SPLIT_GH_TOKEN}@github.com/${REPO_OWNER}/${REMOTE_REPO}.git"
          SHA=$(splitsh-lite --prefix="${LOCAL_PREFIX}")
          git remote add split "${REMOTE_URL}" 2>/dev/null || true
          git push split "${SHA}:refs/heads/main" --force
          git push split "${SHA}:refs/tags/${TAG_NAME}" --force
```

The workflow installs splitsh-lite directly from its GitHub releases, then uses it to produce a subtree commit for each package and push it to the corresponding mirror repo.

Each matrix entry runs in parallel. A full split of 43 packages takes about two minutes.

The `fetch-depth: 0` is important. splitsh-lite needs the full git history to produce correct subtree commits. A shallow clone produces broken splits.

## Preparing Each Subpackage

Before the first split, every subpackage's `composer.json` needed two changes.

First, replace `@dev` constraints with semver ranges:

```json
{
  "require": {
    "waaseyaa/typed-data": "^0.1",
    "waaseyaa/plugin": "^0.1"
  }
}
```

Path repositories resolve `@dev` locally, but Packagist needs real version constraints. The `^0.1` range means "any 0.x release starting from 0.1.0."

Second, ensure every `composer.json` has the fields Packagist expects:

```json
{
  "name": "waaseyaa/entity",
  "type": "library",
  "description": "Entity system for the Waaseyaa framework",
  "license": "GPL-2.0-or-later",
  "autoload": {
    "psr-4": {
      "Waaseyaa\\Entity\\": "src/"
    }
  }
}
```

Packagist rejects packages missing `name`, `description`, or `license`. The `autoload` block is technically optional but practically required. Without it, consumers can't use the package.

## The POC That Proved It

Before committing to 38 mirror repos, a proof of concept with three packages validated the approach: `waaseyaa/foundation`, `waaseyaa/entity`, and `waaseyaa/api`. These represent layers 0, 2, and 5 of the framework. If the dependency chain resolves cleanly across layers, the rest will too.

The test was straightforward:

```bash
composer require waaseyaa/foundation waaseyaa/entity waaseyaa/api
```

It installed cleanly. Autoloading worked. The dependency chain resolved without conflicts. That was enough confidence to create the remaining 40 mirror repos and run the full split.

## What Consumers See

From a consumer's perspective, waaseyaa is now a normal set of Composer packages. Install the whole framework or pick individual packages:

```bash
# Install everything
composer require waaseyaa/framework

# Or pick what you need
composer require waaseyaa/entity waaseyaa/field waaseyaa/access
```

The monorepo root publishes as `waaseyaa/framework` and requires all subpackages. Individual packages declare their own dependencies, so installing `waaseyaa/entity` pulls in `waaseyaa/typed-data` and `waaseyaa/plugin` automatically but doesn't force you to install `waaseyaa/api` or `waaseyaa/admin`.

## What Stayed the Same

The important thing about this process is what it didn't change. The monorepo is still the development environment. Tests still run from the root. CI still validates the full dependency graph. Contributors still open PRs against one repo.

The split is invisible during development. It only matters at release time, and it's fully automated. Tag a release, wait two minutes, and 43 packages appear on Packagist with matching versions.

That wraps the Waaseyaa series. If you're just finding this, start from the beginning: [Waaseyaa: building a Drupal-inspired PHP CMS with AI]({{< relref "waaseyaa-intro" >}}).

Baamaapii
