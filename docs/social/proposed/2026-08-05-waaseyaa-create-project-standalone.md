Queue-Issue: #379
Reference URL: https://github.com/waaseyaa/framework/commit/d20bff2

## Bluesky

waaseyaa create-project was hardwired to the monorepo. Commit d20bff2 removes the path-repo assumption from skeleton/composer.json and adds a CI smoke test so it stays fixed. https://github.com/waaseyaa/framework/commit/d20bff2 #PHP #buildinpublic

## LinkedIn

waaseyaa create-project was only tested inside the monorepo. Running it anywhere else failed silently.

The root cause was a repositories block in skeleton/composer.json. It declared a path repository pointing to ../waaseyaa/packages/* with symlink enabled. That relative path only resolves when you are inside the specific monorepo directory structure. Composer finds nothing, and the install fails without a clear error explaining why.

The post-create-project-cmd also ran chmod +x bin/waaseyaa, a binary that only exists in the monorepo. Outside the monorepo that step also fails.

Commit d20bff2 removes the repositories block entirely. The skeleton now requires waaseyaa/framework from Packagist directly, the way any downstream project would. The stale bin/waaseyaa chmod was removed from post-create-project-cmd at the same time.

To keep this fixed, two safeguards were added. SkeletonLayoutTest in packages/testing validates the expected file layout after a fresh skeleton install. A create-project smoke job in .github/workflows/ci.yml runs the full composer create-project command on every push. If the skeleton breaks again, CI catches it before it ships.

The commit also adds skeleton/README.md with local dev instructions, and skeleton/bin/golden-public-index.php as an auditable snapshot of what the generated project public index looks like out of the box.

Three files did most of the work:
skeleton/composer.json (removed path repository block and stale chmod)
.github/workflows/ci.yml (+25 lines, create-project smoke job)
packages/testing/tests/Unit/SkeletonLayoutTest.php (+36 lines, layout regression test)

If you tried waaseyaa before and got stuck on project creation, that blocker is gone.

https://github.com/waaseyaa/framework/commit/d20bff2

#Waaseyaa #PHP #DeveloperExperience #buildinpublic #OpenSource

## Facebook

waaseyaa create-project had a hidden dependency on the monorepo. skeleton/composer.json declared a path repository pointing to ../waaseyaa/packages/* that only resolved from inside the monorepo directory structure. Outside of it, the install failed without a useful error.

Commit d20bff2 removes the path repository. The skeleton now installs waaseyaa/framework from Packagist directly. A regression test and a CI smoke job were added to keep it working on every push.

If you hit this before and gave up, the blocker is gone. https://github.com/waaseyaa/framework/commit/d20bff2 #Waaseyaa #PHP
