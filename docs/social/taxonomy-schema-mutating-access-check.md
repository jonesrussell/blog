# Fixing a schema-mutating access check in Waaseyaa's taxonomy package

## Bluesky

Found a bug where an access-check method in our PHP framework ran schema DDL on every delete check, not just at boot. Moved that DDL exclusively into coordinated schema sync instead.

https://jonesrussell.github.io/blog/taxonomy-schema-mutating-access-check/

## LinkedIn

Wrote up a bug I fixed in Waaseyaa's taxonomy package this week.

Two places called the same "make sure this foreign key exists" helper unconditionally. One was in a service provider boot method, which is at least bounded to process startup. The other was inside an access-check method that ran on every delete-access check against a vocabulary, for the entire lifetime of the process. That meant ordinary request traffic could trigger an ALTER TABLE under load.

The fix removed both unconditional calls. The foreign key is now installed exclusively by coordinated schema sync, and the runtime schema check that already ran on every repository resolution was extended to assert the foreign key is present and fail loudly if it is not, instead of silently skipping it.

The general lesson: DDL does not announce itself. A method that reads like a harmless idempotent helper can still be a schema mutation, and the tell is where it is called from. A boot method is bounded to startup. An access-check method is not bounded at all.

https://jonesrussell.github.io/blog/taxonomy-schema-mutating-access-check/

#php #softwareengineering #database #backend #reliability

## Facebook

Fixed a bug this week where an access-check method in our PHP framework was quietly running schema-altering DDL on every delete check, not just at startup. Wrote up the fix and the general lesson about DDL that doesn't announce itself.

https://jonesrussell.github.io/blog/taxonomy-schema-mutating-access-check/

#php #buildinpublic
