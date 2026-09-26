---
categories:
    - php
    - waaseyaa
date: 2026-09-26T00:00:00Z
devto: true
draft: false
slug: entity-storage-hardcoded-revision-id
summary: How Waaseyaa's EntityRepository let entity types configure their revision-pointer column, but ten call sites still read the literal revision_id string, and how a single private accessor plus a two-way test closed the gap.
tags:
    - php
    - waaseyaa
    - entity-storage
    - testing
title: Fixing a hardcoded revision key in Waaseyaa's entity storage
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/entity-storage` lets an entity type declare which column holds its "current revision" pointer instead of assuming the literal `revision_id` — resolved through `$entityType->getKeys()['revision'] ?? 'revision_id'`. `EntityRepository` is the class responsible for reading and writing that pointer across every revision operation: save, load, roll back, publish, prune. The lookup existed and worked correctly in `doSave()`. It just wasn't used anywhere else in the class. Here's the bug, the fix, and why "the correct way to read this value exists somewhere in the file" isn't the same as "every call site uses it."

## The bug: a getter nobody called

`doSave()` resolved the configured key properly when it first wrote the base row's pointer:

```php
$revisionKey = $this->entityType->getKeys()['revision'] ?? 'revision_id';
$idKeyName = $this->entityType->getKeys()['id'] ?? 'id';
$claimed = $this->database->update($entityTypeId)
    ->fields([$revisionKey => $revisionId])
    // ...
```

But every other method that later read that same base row back reached for the literal string instead. `loadWorkingCopy()`:

```php
$baseRow = $this->readDriverRow($this->entityType->id(), $id);
$baseRevisionId = $baseRow !== null ? (int) ($baseRow['revision_id'] ?? 0) : 0;
```

`rollback()`, `setCurrentRevision()`, and `pruneRevisions()` had the same pattern — `(int) ($priorBaseRow['revision_id'] ?? 0)` — and `loadRevision()` wrote the hydrated row's pointer back under the same hardcoded key. For an entity type using the default column name, `revision_id` and the configured key were the same string, so none of this showed up.

Configure an entity type with a different revision column — the test that caught this uses `vid` — and the base row's pointer lives under `vid`. But `loadWorkingCopy()`, `rollback()`, `setCurrentRevision()`, and `pruneRevisions()` keep looking for `revision_id`, find nothing, and fall back to `?? 0`. A pointer read as revision 0 breaks every guard built on top of it:

- Is this the **current revision**?
- Is this revision **safe to prune**?
- What revision did we **roll back** from?

All three quietly answer as if the entity had no revision history at all.

## The fix: one private accessor, used everywhere

The fix adds a single method that's the only place `getKeys()['revision']` gets resolved:

```php
/**
 * Return the entity type's base-row revision pointer key.
 *
 * Revision history tables use their own fixed `revision_id` column; this
 * key applies only to entity values and the base storage row.
 */
private function revisionKey(): string
{
    return $this->entityType->getKeys()['revision'] ?? 'revision_id';
}
```

Every call site that previously repeated the `getKeys()['revision'] ?? 'revision_id'` expression, or worse, the bare `'revision_id'` literal, now calls `$this->revisionKey()` instead. **Ten methods** changed:

- `doSave()`
- `loadRevision()`
- `loadWorkingCopy()`
- `rollback()`
- `setCurrentRevision()`
- `doSetPublishedRevision()`
- `loadTranslation()`
- `hydrateTranslationRow()`
- `pruneRevisions()`
- `backfillInitialRevisions()`

A few spots needed one more line, not just a substitution:

```php
$revisionKey = $this->revisionKey();
if ($revisionKey !== 'revision_id') {
    unset($row['revision_id']);
}
$row[$revisionKey] = $revisionId;
```

That `unset()` matters wherever a row was already hydrated with a `revision_id` value from elsewhere (a revision history row, which does keep its own fixed `revision_id` column) before being written back onto the base table under a custom key — without it, a custom-key entity type would end up with both `revision_id` and `vid` sitting on the same row, one stale and one correct.

## Verifying it

The new `EntityRepositoryConfiguredRevisionKeyTest` runs the same workflow twice through a data provider — once with the default `revision_id` key, once with a custom `vid` key — against a real SQLite-backed repository, not a mock:

- Create an entity and save a second revision, then assert the base row's pointer column (whichever one is configured) reads **2**.
- Load revision 1 and the working copy, and assert their labels reflect the pre- and post-edit values.
- Call `setCurrentRevision()` back to revision 1, and assert the base row's pointer drops back to **1**.
- Roll back to revision 2, and assert the base row's pointer advances to the new tip revision **3**.
- Promote a published revision, and assert both the revision pointer and `published_revision_id` land correctly on the base row.
- Prune revisions under a keep-last-uniform policy, and assert the current, published, and latest revisions all survive regardless of which column tracks them.

Every assertion reads the base row directly by column name, so the `vid` run of the data provider is the one that would have failed against the pre-fix code — the `revision_id` run passes either way, which is exactly why the bug was invisible until a non-default key was exercised.

## The general lesson

A correct accessor sitting fifty lines from the last hardcoded copy of the same expression doesn't help you if nothing forces the rest of the class to use it. This bug shipped because the resolution logic — `getKeys()['revision'] ?? 'revision_id'` — was right the first time it was written, and every later call site independently retyped the fallback instead of calling the method that already existed for it. The fix is a one-line accessor; the more useful part is the test. A single data-provider case that runs the full revision workflow under both the default key and a deliberately different one is the only kind of test that can tell "coincidentally correct because the two strings match" apart from "actually reads the configured key." If your class only has assertions written against the default configuration, you don't know it's configurable — you know it works once.

Baamaapii
