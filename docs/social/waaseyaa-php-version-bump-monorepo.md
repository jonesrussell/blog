# Bumping a PHP monorepo to 8.5: the mechanics

Reference URL: https://jonesrussell.github.io/blog/waaseyaa-php-version-bump-monorepo/

## X

Bumped a 67-package PHP monorepo to 8.5. Five work packages, three CI workflows, one PHPStan target. The diff is smaller than you think. #buildinpublic

https://jonesrussell.github.io/blog/waaseyaa-php-version-bump-monorepo/

## LinkedIn

The expensive version of a PHP version bump is the one where every package picks its own minimum and you negotiate sixty-six exceptions.

Waaseyaa just moved from 8.4 to 8.5 across 67 packages. The actual diff is four artifacts:

1. 66 first-party composer.json files
2. 3 GitHub Actions workflows
3. phpstan.neon
4. The lockfile

That is it. Everything else in the upgrade is downstream of those four moving in lockstep.

The reason the surface is small is that the monorepo defends the floor in many places. Hard gates fail CI if any package drifts from the root constraint. Hard gates fail if the dependency direction inverts. Hard gates fail if docs lag the code. The floor is one number, enforced by tooling.

Wrote up the mechanics: the work package structure, the verification gates, and why splitting "floor moves" from "features get adopted" from "deprecations get removed" matters even when the diff is small enough to land as one PR.

Mission ID: php-8-5-upgrade-01KR8DN2. PR #1406. Released in alpha.176.

This is post one of three. Posts two and three cover the deprecation sweep and the features we deliberately did not adopt.

https://jonesrussell.github.io/blog/waaseyaa-php-version-bump-monorepo/

## Facebook

Walked Waaseyaa from PHP 8.4 to 8.5 across 67 packages. The actual diff is four artifacts: 66 composer.json files, three CI workflows, the static analysis config, and the lockfile.

The interesting part is not the bump. It is the work package structure that kept "floor moves," "deprecations get removed," and "features get adopted" from being conflated into one unreadable commit.

First of three posts on the upgrade.

https://jonesrussell.github.io/blog/waaseyaa-php-version-bump-monorepo/

#buildinpublic
