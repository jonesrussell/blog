## Bluesky

Found a bug where a configurable revision-pointer column existed, but ten call sites in the repository class still read the literal revision_id string instead. One accessor and a two-key test closed the gap. https://jonesrussell.github.io/blog/entity-storage-hardcoded-revision-id/

## LinkedIn

New post: a bug in Waaseyaa's entity storage where a configuration option existed but most of the code never used it.

EntityRepository lets an entity type declare a custom column name for its "current revision" pointer instead of the default revision_id. The resolution logic for that was correct in exactly one method. Everywhere else in the class, the code reached for the literal string revision_id instead of the getter that already existed for this.

For the default configuration, both strings matched, so nothing looked wrong. Configure a custom revision column and every one of those other reads silently falls back to zero, breaking the logic that decides which revision is current, which is safe to prune, and what a rollback rolled back from.

The fix is a single private accessor used everywhere. The more useful part is the test: it runs the exact same revision workflow twice, once with the default key and once with a custom one, against a real database. Only the second run could have caught this.

Full writeup: https://jonesrussell.github.io/blog/entity-storage-hardcoded-revision-id/

#php #softwareengineering #testing #backend #opensource

## Facebook

A configuration option existed in our entity storage layer, but most of the code quietly ignored it and used a hardcoded default instead. Wrote up the bug, the fix, and the test that finally caught it: https://jonesrussell.github.io/blog/entity-storage-hardcoded-revision-id/

#php #softwareengineering
