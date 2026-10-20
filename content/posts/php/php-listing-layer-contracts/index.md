---
title: "Five contracts a PHP listing layer should prove"
date: 2026-10-20
categories: [php]
tags: [php, testing, architecture, waaseyaa]
summary: "Test filter semantics, cache invalidation, and installed package behavior before trusting a PHP listing layer."
slug: "php-listing-layer-contracts"
draft: false
devto: true
---

Ahnii!

A listing layer can return the right rows in ordinary tests while still breaking under repeated filters, mixed-case search, cache invalidation, or a real package install.

A recent [Waaseyaa listing repair](https://github.com/waaseyaa/framework/commit/40df73a2425e96f019ad9af414bc68c5b1e974b1) turned those failure modes into explicit contracts. This post covers five checks you can apply to any PHP listing or query package.

## 1. Filters must compose

Two filters on the same field should not silently replace each other.

Consider a definition with contradictory requirements:

```php
$definition = new ListingDefinition(
    id: 'and',
    entityType: 'article',
    filters: [
        Filter::eq('id', '1'),
        Filter::eq('id', '2'),
    ],
);
```

The correct result contains zero rows. If your query builder stores equality criteria in an array keyed only by field name, the second value can overwrite the first. The query then returns one row instead of preserving the intended conjunction.

Your contract tests should cover:

- contradictory filters on the same field;
- identical repeated filters;
- filter order changes;
- implicit scope filters combined with explicit filters;
- equivalent behavior across memory and database backends.

That last check matters. A PHP fallback and a SQL adapter can each look correct while disagreeing about the same listing definition.

## 2. Text matching needs declared semantics

Words like *contains* and *starts with* are incomplete without a case and Unicode policy.

Waaseyaa's declared contract is a literal, case-insensitive comparison. The repaired resolver applies Unicode case folding to both values before matching:

```php
$actual = mb_convert_case($actual, MB_CASE_FOLD, 'UTF-8');
$expected = mb_convert_case($expected, MB_CASE_FOLD, 'UTF-8');

$matches = str_contains($actual, $expected);
```

This is not the same as handing the value to SQL `LIKE`. Percent and underscore stay literal, and the result does not depend on a database collation.

A useful test uses a value such as `CAFÉ one` and searches for `café`. Add negative controls, literal wildcard characters, and both supported storage backends. You are testing the product contract, not just a convenient implementation.

## 3. Input coercion and resolution must agree

Validating a URL value is only half the job. The resolver must accept the value shape the parser returns.

The listing parser validates date and datetime input with `DateTimeImmutable`, but preserves the original string:

```php
new DateTimeImmutable($raw);

return $raw;
```

Keeping the string avoids inventing timezone normalization or changing a stored ISO value. The important part is that the resolver expects that same scalar representation.

Test the whole path:

1. Parse the exposed query value.
2. Apply it to the listing definition.
3. Resolve the listing.
4. Assert rows and pagination metadata.

Include invalid calendar dates, strict and permissive parsing, and list or range operators. Unit tests for the coercer alone cannot prove the query accepts its output.

## 4. Cache invalidation must follow the canonical lifecycle

Cache invalidation fails quietly when a package listens for an event that ordinary repositories never emit.

The repaired listing provider subscribes to the repository's canonical `POST_DELETE` notification and routes it to the same invalidator used by standalone delete events. That keeps compatibility without creating a second lifecycle authority.

The boundary test should be concrete:

1. Resolve and cache a listing with two rows.
2. Delete a row outside the current page.
3. Complete the repository transaction.
4. Resolve again.
5. Assert that totals and rows changed.

Also prove rollback behavior. Invalidating before a failed delete commits can make cache state disagree with storage.

## 5. Test the installed package, not only the source tree

Monorepo tests can hide missing dependencies, accidental autoloading, and files that never reach the distributed package.

Waaseyaa added a [split-artifact acceptance fixture](https://github.com/waaseyaa/framework/blob/2a5206ed14854c0fd5384543f4679addec08a5c0/tests/SplitArtifactAcceptance/listing.php) that runs from extracted package bytes. It proves two consumer shapes:

- a standalone production install with no development dependencies;
- a generated application that serves a public listing through the HTTP kernel.

The standalone path exercises parsed Unicode text, optional cache behavior, access refusal, and contradictory equality filters. The generated path stores one public row and one draft row, then verifies that only the public row reaches the response.

This is stronger than checking whether Composer completed. It proves the package boots and preserves its public behavior from the same bytes a consumer receives.

## A practical listing test matrix

Before calling a listing package reliable, cover these boundaries:

| Boundary | Minimum proof |
| --- | --- |
| Filter composition | Repeated and contradictory filters preserve AND semantics |
| Text matching | Case, Unicode, and literal wildcard behavior are explicit |
| Input pipeline | Parser output reaches the resolver unchanged and valid |
| Cache lifecycle | Save, delete, commit, rollback, and refusal update cached results correctly |
| Storage parity | Memory and database adapters return the same membership and totals |
| Distribution | A production install boots from packaged bytes without dev dependencies |
| Application use | A generated route returns allowed rows and excludes disallowed rows |

The useful lesson is not that every listing layer needs Waaseyaa's implementation. It is that each layer needs one declared contract from input through storage, access, cache, packaging, and the final consumer.

Baamaapii
