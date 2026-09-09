---
categories:
    - php
    - waaseyaa
date: 2026-09-09T00:00:00Z
devto: true
draft: false
slug: taxonomy-schema-mutating-access-check
summary: How Waaseyaa's taxonomy package let ordinary request traffic ALTER a table to add a foreign key, and the fix that moved that DDL exclusively into coordinated schema sync.
tags:
    - php
    - waaseyaa
    - database
    - schema
title: Fixing a schema-mutating access check in Waaseyaa's taxonomy package
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/taxonomy` package manages vocabularies and terms, with a foreign key tying every term row back to the vocabulary it belongs to. Two places in that package called the same "make sure this foreign key exists" helper unconditionally, and one of them ran on every delete-access check against a vocabulary — meaning ordinary request traffic could issue an `ALTER TABLE` under load. Here's the bug, the fix, and why "no DDL on the request path" needs to be a *contract*, not just a habit.

## The Bug: DDL Behind an Access Check

`TaxonomyServiceProvider::boot()` and `VocabularyAccessPolicy::access()` both called `VocabularyReferenceConstraint::ensure()` unconditionally. `ensure()` issues DDL: it adds the `taxonomy_term` → `taxonomy_vocabulary` foreign key if it's missing.

Calling that from `boot()` is already risky — a production deployment whose schema hadn't finished a coordinated sync yet could have a request trigger the `ALTER TABLE` under live traffic. But the call inside `VocabularyAccessPolicy::access()` was worse, because it wasn't bounded to boot at all. It ran on *every* delete-access check against a vocabulary, for the lifetime of the process:

```php
public function access(EntityInterface $entity, string $operation, AccountInterface $account): AccessResultInterface
{
    if ($operation !== 'delete') {
        return AccessResult::neutral();
    }

    if ($this->database !== null) {
        new VocabularyReferenceConstraint($this->database)->ensure();
    }

    $terms = $this->entityTypeManager->getRepository('taxonomy_term')->findBy(
        ['vid' => (string) $entity->id()],
        limit: 1,
    );
    // ...
}
```

An access policy's job is to answer "is this delete allowed," not to mutate the schema on the way to answering. The framework had already closed this exact class of defect once, in `AttachmentServiceProvider` (issue **#2478**) — this was the same mistake resurfacing in a package that hadn't been through that fix.

## The Fix: DDL Belongs Only to Coordinated Schema Sync

Both unconditional `ensure()` calls were removed (issue **#2761**). `VocabularyAccessPolicy` no longer accepts a database at all — its existing `findBy()` check (does any term still reference this vocabulary?) is the real enforcement. The foreign key becomes a storage-level backstop, installed exclusively by coordinated schema sync (`db:init`, `schema:sync`):

```php
final class VocabularyAccessPolicy implements AccessPolicyInterface
{
    public function __construct(
        private readonly EntityTypeManagerInterface $entityTypeManager,
    ) {}

    public function access(EntityInterface $entity, string $operation, AccountInterface $account): AccessResultInterface
    {
        if ($operation !== 'delete') {
            return AccessResult::neutral();
        }

        $terms = $this->entityTypeManager->getRepository('taxonomy_term')->findBy(
            ['vid' => (string) $entity->id()],
            limit: 1,
        );
        // ...
    }
}
```

No new migration was needed for the sync path — the entity type already declares its `_foreignKeys`, and `SqlSchemaHandler`'s generic `ensureDeclaredForeignKeys()` (used by every entity type with declared foreign keys) picks it up automatically once the unconditional call in `boot()` is gone.

`TaxonomyServiceProvider::boot()` keeps a **local/development-only** convenience materialization, gated the same way `AttachmentServiceProvider` gates its own schema convenience:

```php
public function boot(): void
{
    // ... event listener wiring unchanged ...

    $database = $this->resolveOptional(DatabaseInterface::class);
    if ($database instanceof DatabaseInterface && $this->allowsConvenientSchemaMaterialization()) {
        new VocabularyReferenceConstraint($database)->ensure();
    }
}

private function allowsConvenientSchemaMaterialization(): bool
{
    return RuntimePolicy::resolve($this->config)->isDevelopment();
}
```

Production and staging boot no longer touch the foreign key at all, and neither does any request that reaches the access policy.

## Closing the "Silent Skip" Gap

Removing the DDL calls raises an obvious question: what happens in production if the foreign key is genuinely missing — say, a deploy where schema sync hasn't run yet? Silently skipping the constraint would be its own bug. The framework already had a no-DDL runtime contract, `SqlSchemaHandler::assertRuntimeSchema()`, which every `getRepository()` resolution runs and which already asserted declared unique keys were present. It now asserts declared foreign keys too:

```php
private function assertDeclaredForeignKeysReady(): void
{
    if (!$this->entityType instanceof EntityTypeForeignKeyDefinitionInterface) {
        return;
    }
    $schema = $this->database->schema();
    if (!$schema instanceof ForeignKeySchemaInterface) {
        return;
    }

    foreach ($this->entityType->getStorageForeignKeys() as $definition) {
        if (!$schema->tableExists($definition['table'])) {
            continue;
        }
        if ($schema->foreignKeyExists($this->tableName, $definition['name'])) {
            continue;
        }
        throw new \RuntimeException(sprintf(
            '[S1-DB106] Required runtime schema is unavailable for table "%s"; missing: foreign key %s. Apply migration "waaseyaa schema:sync" through the schema coordinator.',
            $this->tableName,
            $definition['name'],
        ));
    }
}
```

That required a new read-only capability: `ForeignKeySchemaInterface` already had `addForeignKey()` (DDL) but nothing to check whether a key already exists without mutating anything. A `foreignKeyExists()` companion method was added to the interface — contract-only, since the concrete `DBALSchema` implementation already had the underlying check available.

A declared key whose *referenced* table doesn't exist yet is skipped rather than treated as an error, because entity type registration order isn't guaranteed (`taxonomy_term` registers before `taxonomy_vocabulary`) — that table's own readiness is a separate concern.

## Verifying It

The risk with a "read-only" schema check is that it quietly isn't, on some database platform. That got its own test, proving `foreignKeyExists()` and `tableExists()` never call `executeStatement()` — using mocked DBAL connections that report MySQL, PostgreSQL, and SQLite platforms, the same technique the existing DDL-generation tests already used for portability:

| Check | What it proves |
|---|---|
| `foreignKeyExistsIsReadOnlyOnRealSqlite` | Real SQLite in-memory database: false before creating the key, true after |
| `foreignKeyExistsNeverIssuesDdlAndReportsAbsence` | MySQL, PostgreSQL, SQLite: reports `false`, never calls `executeStatement()` |
| `foreignKeyExistsNeverIssuesDdlAndReportsPresence` | Same three platforms: reports `true`, never calls `executeStatement()` |
| `tableExistsNeverIssuesDdl` | Same guarantee for the existing `tableExists()` check |

On the `assertRuntimeSchema()` side, new unit tests cover a table materialized *without* its declared foreign key, proving the assertion throws with the `[S1-DB106]` message instead of silently passing. There's no live MySQL or PostgreSQL server in this environment, so the mocked-connection tests are what stand in for cross-platform proof; real fresh-install and concurrent-upgrade behavior against live servers is explicitly called out as deferred.

## The General Lesson

"No DDL on the request path" sounds obvious once you say it. It's easy to violate by accident anyway, because DDL doesn't announce itself — `ensure()` reads like a harmless idempotent helper, not a schema mutation. The tell was where the call lived. A `boot()` method is at least bounded to process startup; an access-check method runs on every matching request for as long as the process is up. So anywhere your code "makes sure X exists" as a side effect of answering an unrelated question, ask whether that assurance is DDL — and if it is, ask who's actually allowed to run it. The fix here wasn't just deleting the two bad calls. It was making the runtime *assert* the schema is already correct and fail loudly if it isn't, so removing the convenience path couldn't quietly turn into a silent skip.

Baamaapii
