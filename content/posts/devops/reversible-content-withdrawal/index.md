---
title: "Treat content withdrawal as a reversible migration"
date: 2026-11-03
categories: [devops]
tags: [content-management, migrations, testing, publishing]
summary: "Withdraw published content without destroying its source, revision history, or the evidence needed to move it safely."
slug: "reversible-content-withdrawal"
draft: false
---

Ahnii!

Removing a page from a website is easy. Withdrawing it safely is not.

A real content withdrawal has to change every public surface while preserving the material needed for review, recovery, or migration. This post uses a recent [RHT Circle change](https://github.com/jonesrussell/rhtcircle/commit/bba42a11b9f3eac2a49321dbc305278403c700b0) to show how to treat that work as a reversible migration instead of a deletion.

## Define what withdrawal means

Start with an explicit contract. In this case, five managed articles and four static pages had to leave the public site before their material moved elsewhere.

Withdrawal meant all of the following:

- Existing public URLs return 404
- News lists and community hubs stop linking to the material
- Static and generated sitemaps omit the URLs
- Search indexing drops the old public chunks during the normal reindex
- Managed article bodies remain stored as unpublished records
- Original seed files and static templates remain available for migration
- No redirect exists until a verified destination is actually live

That last point avoids a common mistake. A planned destination is not a working destination. Redirecting early turns a controlled withdrawal into a broken handoff.

## Preserve content, remove publication state

The managed articles were not deleted. Their slugs were added to an explicit `unpublishedSlugs()` list, and the seeder created them with `status: false`.

```php
'status' => !in_array(
    $slug,
    ArticleSeedData::unpublishedSlugs(),
    true,
),
```

This keeps the body and record available while removing anonymous access. It also gives new installations the same state as production instead of letting a fresh seed accidentally republish withdrawn material.

The refresh path needed a second guard. A slug cannot be both withdrawn and eligible for publication refresh. The seeder now skips any unpublished slug, and the test suite asserts that the unpublished and publication-refresh lists do not intersect.

This is the critical invariant:

> Re-running installation or seed refresh must not reverse the withdrawal.

Without that rule, the next deployment can quietly undo the change.

## Handle managed and static content differently

The site had two kinds of public material:

| Content type | Withdrawal action | Preserved evidence |
|---|---|---|
| Managed articles | Keep the entity, set it unpublished | Database record, body, revision history, seed source |
| Static pages | Remove the route from public catalogues | Twig template and Git history |

Trying to force both through one mechanism would hide important differences. A managed article has publication state. A static route does not, so the public route registration itself has to disappear.

The static templates stayed in the repository. That makes the withdrawal reversible without leaving the old URLs reachable. It also keeps the material available for a later migration where the destination may use a different content model.

## Remove every discovery path

Returning 404 from the old URL is necessary, but it is not enough. A withdrawn page can still appear public if the rest of the site advertises it.

The change removed references from:

- Home and news listings
- Community cards and accountability hubs
- Manually maintained sitemap XML
- The application's generated sitemap route list
- Contextual links embedded in other content

Search requires separate attention because an index is another copy of the content. The release procedure relies on the normal `app:reindex` deployment step to remove old page chunks, then calls for production verification that those chunks are gone.

This is why content withdrawal belongs in release planning. Code can remove routes and links, but the deployed search corpus is runtime state that still has to be checked.

## Test absence and preservation together

The strongest regression test does not merely ask whether a page disappeared. It proves that the page is unavailable while its source remains intact.

The integration test runs article migration, boots the application, and then checks each withdrawn article:

- Exactly one stored record still exists
- Its publication status is false
- Its body is not empty
- Its public URL returns 404

It also requests the home page, news list, community hub, and sitemap, then asserts that none contains a withdrawn path.

The test name calls out repeated seeding because idempotency is the real risk. A one-time successful withdrawal is not enough. The same release operations must keep producing the same private state.

## Keep the scope auditable

The release note records what moved and what did not. Other authors' articles, petition records, and consent instruments were explicitly outside the withdrawal.

That boundary matters for operational safety. A vague request to remove related content can grow into an accidental purge. A slug list, route list, and named exclusions give reviewers a finite change to inspect.

A safe withdrawal therefore leaves four kinds of evidence:

1. **Scope:** the exact records and routes being withdrawn
2. **State:** unpublished records and preserved source files
3. **Public absence:** 404 responses, clean listings, and clean sitemaps
4. **Operational follow-up:** reindexing and production verification

Deletion destroys options. A reversible migration removes publication authority while keeping the source and history needed for whatever comes next.

Baamaapii
