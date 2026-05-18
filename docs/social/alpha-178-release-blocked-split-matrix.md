# alpha.178 release blocked: waaseyaa/migration missing from split matrix

Reference URL: https://github.com/waaseyaa/framework/pull/1477

## Bluesky

Tried to cut alpha.178. waaseyaa/migration wasn't in split.yml, so its per-package tag never got made. Two PRs to add the package and sync composer.json. Monorepo release ops are fiddly. #buildinpublic

https://github.com/waaseyaa/framework/pull/1477

## LinkedIn

alpha.178 of the Waaseyaa framework didn't ship clean. Here's what actually happened.

The framework is a Composer monorepo with about a dozen packages, all developed in lockstep. The release workflow tags the meta-package, then a separate split.yml job mirrors each subpackage out to its own repository with its own per-package tag. Consumers can then `composer require waaseyaa/migration:^0.1.178` without pulling the whole framework.

Today: waaseyaa/migration was not in the split.yml matrix. The meta-package tagged fine. The subpackages that were in the matrix tagged fine. Migration silently did not tag, so consumers asking for the new version got the older one, with no obvious signal that the new code existed.

Two PRs fixed it. The first added migration to the matrix. The second committed the synced composer.json that had drifted while migration was being held outside the release loop. Re-cut the release, both PRs merged.

The reason this matters more than the diff: monorepo release pipelines fail silently in the most expensive way. Nothing alerts. Tests pass. CI is green. Consumers see a stale package and assume the new code is broken or absent. Lost trust on a release is much worse than a failed build that nobody can ignore.

If you run this pattern, audit your split matrix every time you add a package. Better: generate the matrix from the package list rather than maintaining it by hand. Hand-curated lists drift; generated ones don't.

https://github.com/waaseyaa/framework/pull/1477

## Facebook

alpha.178 of the Waaseyaa framework didn't ship clean. The framework is a monorepo where each subpackage gets mirrored out to its own repo with its own tag during release. The split-matrix list was missing waaseyaa/migration, so the meta-package tagged fine but the subpackage silently didn't.

Two PRs fixed it: add the package to the matrix, commit the synced composer.json that had drifted. Re-cut the release.

The lesson is uncomfortable. Monorepo release pipelines fail silently in the worst way: green CI, no alerts, stale package for consumers. If you run this pattern, generate the matrix from the package list. Hand-curated lists drift.

https://github.com/waaseyaa/framework/pull/1477

#buildinpublic #waaseyaa
