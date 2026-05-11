---
title: "Bumping a PHP monorepo to 8.5: the mechanics"
date: 2026-05-11
categories: [ai]
tags: [php, waaseyaa, monorepo, spec-kitty]
series: ["waaseyaa-php-8-5-upgrade"]
summary: "Sixty-seven packages, one CI matrix, one PHPStan target. What it takes to actually move the floor."
slug: "waaseyaa-php-version-bump-monorepo"
draft: false
---

Ahnii!

This is the first of three posts about taking Waaseyaa to PHP 8.5. This one is about the mechanics: how a coordinated version bump across a 67-package monorepo actually happens. The next two cover the deprecation sweep that came with it and the features we deliberately did not adopt.

> **Context:** Waaseyaa is the open-source PHP framework I have been writing about. Mission: `php-8-5-upgrade-01KR8DN2`. Shipped as PR [#1406](https://github.com/waaseyaa/waaseyaa/pull/1406), merge commit [`e0f8cb57`](https://github.com/waaseyaa/waaseyaa/commit/e0f8cb570). Released in alpha.176.

## The starting state

Before the bump, Waaseyaa required PHP 8.4. Sixty-six first-party `composer.json` files, all aligned on `>=8.4`. Plus a skeleton package, which is a template artifact and is kept at the lowest reasonable floor on purpose.

CI ran a single PHP version. PHPStan was pinned to a matching `phpVersion`. The floor was tight and consistent. That alignment is what makes a bump cheap. The expensive version of this story is the one where every package picks its own minimum and you have to negotiate sixty-six exceptions.

## Mission shape

The mission split into five work packages plus a closing one:

- **WP01.** Constraint bump, CI, Docker, lockfile, PHPStan pin, docs, governance charter touch.
- **WP02.** 8.5 deprecation sweep.
- **WP03.** Adopt `#[\NoDiscard]` on critical surfaces.
- **WP04.** Targeted `array_find()` adoption.
- **WP05.** PHP-CS-Fixer migration rules.
- **WP06.** CHANGELOG and verification.

WP01 is the only one that touches the floor. Everything after is feature work that becomes available because the floor moved. Splitting it this way matters: if WP01 lands clean, the rest can land in any order without coupling.

## What WP01 actually changed

The mechanical surface of a floor bump is smaller than people expect. From the merge:

- **66 first-party `composer.json` files** updated from `>=8.4` to `>=8.5`.
- **3 GitHub Actions workflows** repinned to `php-version: '8.5'`: `ci.yml`, `skeleton-smoke.yml`, `release-cut.yml`. Ten total occurrences of the string `'8.5'`.
- **`phpstan.neon`** updated: `phpVersion: 80500`.
- **Lockfile** regenerated against 8.5.

That is the bump. Everything else in the mission is downstream of those four artifacts moving in lockstep.

The reason the surface is small is that Waaseyaa has hard gates that already enforce alignment. There is a `bin/check-composer-policy` script that fails CI if any package drifts from the root constraint. There is a `bin/check-package-layers` script that fails if the dependency direction inverts. There is a `tools/drift-detector.sh` that fails if docs lag the code. The floor is one number defended in many places.

## The verification surface

For a bump to be safe, every hard gate has to be green on the new floor. Waaseyaa's full gate list for this mission:

- `composer phpstan` (root level + package level)
- `vendor/bin/phpunit`
- `composer cs-check`
- `bin/check-composer-policy`
- `bin/check-package-layers`
- `bin/audit-dead-code`
- `tools/drift-detector.sh`

At merge time the test suite was 7,497 unit tests, 18,118 assertions, 0 deprecations, 2 expected skips. That is the number to trust. Not because tests prove a version is fine, but because the test corpus is dense enough that deprecation warnings would surface.

## Why split it into work packages at all

This is the part worth paying attention to if you maintain a PHP monorepo. The actual diff for a version bump is small. You could do it in one PR with one commit. People do.

The cost of doing it that way is that the diff conflates four different kinds of change:
1. The floor moves (a policy change).
2. Deprecations get removed (a behavior change).
3. New features get adopted (a style change).
4. New tooling gets wired (a configuration change).

When all four land in one squash commit, the next person to touch any of them cannot read the rationale. Six months later, someone reverts a `#[\NoDiscard]` attribute thinking it is part of the floor bump, and now the floor bump cannot be reverted cleanly either.

The work package structure makes each kind of change auditable on its own terms. WP02 is removable without affecting WP01. WP04 can be reverted without touching WP03. The mission directory is the persistent record of why each was done.

That is the same point I made about the [Spec Kitty mission lifecycle]({{< relref "spec-kitty-mission-lifecycle" >}}) post: the output of any mission is replaceable. The trail is not.

## What the next posts cover

Post 2 in this series digs into the deprecation sweep: what 8.5 surfaced, where it was hiding in the codebase, and how the sweep got from 34 warnings to 0.

Post 3 covers the features we deliberately did not adopt. Property hooks. The pipe operator. Broader `array_find()`. The argument is that restraint is part of the upgrade, not absent from it.

Baamaapii
