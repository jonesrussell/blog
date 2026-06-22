# Your search index needs the same access control as your pages

Reference URL: https://github.com/waaseyaa/framework/pull/1723

## Bluesky

Easy to miss: our full-text search returned every matching row with zero access checks. Entities get indexed automatically on save, so a forbidden or unpublished item was searchable by anyone. Fix: enforce per-document view access in the read path. https://github.com/waaseyaa/framework/pull/1723 #buildinpublic

## LinkedIn

A search index is a second copy of your data, and it needs the same access control as the first.

Our full-text search provider ran the query and returned every matching row. No access enforcement at all.

That sounds obviously wrong, but here is how it happens. The index is populated automatically when an entity is saved, through a save-event subscriber. So content flows into the index whether or not it is published, and whoever can run a search can read it back. A draft, a restricted record, an unpublished entity: all searchable, reachable even anonymously through the public search helper.

The page that renders the entity had access control. The API had access control. The search path quietly did not, because it queries its own index instead of going through the normal load-and-authorize flow.

The fix: enforce per-document view access inside the search read path, so a result is only returned if the caller could view the entity directly.

The general lesson: every read path needs its own authorization, not just the canonical one. Search indexes, caches, exports, sitemaps, and feeds are all alternate doors to the same data. If one of them skips the access check, the access check is optional.

https://github.com/waaseyaa/framework/pull/1723

#buildinpublic #security #php #softwaredevelopment

## Facebook

A reminder that your search index is a second copy of your data, and it needs the same access control as the first. Our full-text search returned every matching row with no access checks. Because entities get indexed automatically when saved, an unpublished or restricted item was searchable by anyone, even anonymously, while the page and the API that served the same entity both enforced access.

The fix was to enforce per-document view access inside the search read path, so a result only comes back if the caller could view the entity directly. The general lesson: every read path needs its own authorization. Search, caches, exports, sitemaps, and feeds are all alternate doors to the same data. https://github.com/waaseyaa/framework/pull/1723

#buildinpublic
