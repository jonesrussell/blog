## Bluesky

Unpublishing is more than returning 404. Preserve the source, block seed refresh from republishing it, remove every discovery path, reindex search, and test absence plus recoverability. https://jonesrussell.github.io/blog/reversible-content-withdrawal/ #CMS #DevOps

## LinkedIn

Removing a page is easy. Withdrawing content safely means changing every public surface without destroying the material needed for recovery or migration.

I documented a recent content withdrawal that keeps managed article bodies and revision history, removes static routes without deleting their templates, blocks later seed refreshes from republishing anything, cleans listings and sitemaps, and requires search reindex verification in production.

The useful test is not only that old URLs return 404. It proves the stored body still exists, publication status remains false after repeated seeding, and no public discovery surface advertises the withdrawn path.

https://jonesrussell.github.io/blog/reversible-content-withdrawal/

#contentmanagement #devops #testing #publishing

## Facebook

Content withdrawal should be a reversible migration, not a destructive delete. Keep the source and history, remove routes and discovery links, block seed refresh from republishing records, reindex search, and test both public absence and recoverability. https://jonesrussell.github.io/blog/reversible-content-withdrawal/ #CMS #DevOps
