---
title: "Replacing a homegrown database layer with DBAL"
date: 2026-03-21
categories: [ai, php]
tags: [waaseyaa, php, claude-code, dbal]
series: ["waaseyaa"]
series_order: 5
series_group: "Main"
summary: "How waaseyaa migrated from a homegrown PdoDatabase to Doctrine DBAL across 413 commits — and how all three applications upgraded without breaking."
slug: "waaseyaa-dbal-migration"
draft: false
---

Ahnii!

> **Series context:** This is part 5 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). This post builds on [the entity system]({{< relref "waaseyaa-entity-system" >}}) and the [API layer]({{< relref "waaseyaa-api-layer" >}}) from earlier in the series.

Every framework eventually outgrows its first database abstraction. Waaseyaa's `PdoDatabase` class served us well through v0.1.0, but by the time three applications depended on it, the cracks were showing. This post covers the migration to [Doctrine DBAL](https://www.doctrine-project.org/projects/dbal.html) — 413 commits across two weeks — and how all three apps upgraded without a single breaking change at the application layer.

## Why replace a working database layer

`PdoDatabase` was a thin wrapper around PHP's PDO. It handled connections, prepared statements, and basic transaction support. That was enough to bootstrap the framework.

But as the entity system matured, we needed things `PdoDatabase` couldn't provide. There was no query builder abstraction — every query was a hand-assembled SQL string. There was no schema introspection, so we couldn't programmatically inspect tables or columns. There was no migration tooling, so schema changes were ad hoc SQL scripts. And there was no systematic way to handle differences between SQLite (used in tests) and MySQL (used in production).

These aren't exotic requirements. They're table stakes for a framework that multiple applications depend on.

## What DBAL gives you

[Doctrine DBAL](https://www.doctrine-project.org/projects/dbal.html) is the database abstraction layer from the Symfony ecosystem. It sits below Doctrine ORM but works perfectly well on its own. Waaseyaa uses its own entity system — we don't use Doctrine ORM and don't plan to.

DBAL provides four things we needed. First, a query builder (`QueryBuilder`) that generates SQL programmatically. Second, a schema manager that can introspect and diff database schemas. Third, a connection abstraction that normalizes differences between database drivers. Fourth, a foundation for migration tooling.

The query builder alone justified the switch. Instead of concatenating SQL strings with parameter placeholders, you build queries with method calls. The builder handles quoting, parameter binding, and driver-specific syntax.

## The migration scope

The migration touched every package that interacted with the database. In total: 413 commits across roughly two weeks of focused work.

Every `PdoDatabase` call site was replaced. The kernel boot sequence changed to initialize a DBAL connection. SQL reserved-word quoting was added to all query builders. Integration tests were rewritten to run against real DBAL connections instead of mocked PDO instances.

The commit count sounds dramatic, but each commit was small and focused. That was deliberate — small commits made it possible to bisect if anything broke.

## Kernel boot changes

Before the migration, the kernel initialized the database like this:

```php
$database = new PdoDatabase($dsn, $username, $password);
$container->set(PdoDatabase::class, $database);
```

A direct PDO connection, registered in the container. Simple but inflexible.

After the migration, the kernel uses DBAL's `DriverManager`:

```php
use Doctrine\DBAL\DriverManager;

$connection = DriverManager::getConnection([
    'dbname'   => $config->get('database.name'),
    'user'     => $config->get('database.user'),
    'password' => $config->get('database.password'),
    'host'     => $config->get('database.host'),
    'driver'   => $config->get('database.driver'),
]);

$container->set(Connection::class, $connection);
```

The DBAL `Connection` object is now available to every service through dependency injection. Services depend on the `Connection` interface, not a concrete class. That's a meaningful improvement for testing — you can swap in an SQLite connection for integration tests without changing any service code.

## SQL hardening

The migration exposed a problem that had been lurking in the old code: SQL reserved word conflicts. Column names like `status`, `order`, and `group` are reserved words in MySQL. The old hand-built SQL happened to work in most cases, but it was fragile.

Before:

```sql
SELECT status, order FROM tasks WHERE group = ?
```

This query would fail on MySQL because `status`, `order`, and `group` are all reserved words.

After, using DBAL's query builder:

```php
$qb = $connection->createQueryBuilder();
$qb->select('t.`status`', 't.`order`')
   ->from('`tasks`', 't')
   ->where('t.`group` = :group')
   ->setParameter('group', $groupId);
```

The backtick quoting ensures reserved words are treated as identifiers, not SQL keywords. This wasn't a DBAL-specific problem — we could have quoted identifiers in the old code too. But DBAL's query builder made it systematically fixable. We added quoting rules to every `DBALSelect` builder and caught every instance in one pass.

## The migration protocol

With DBAL in place, we built proper migration tooling. The `bin/waaseyaa make:migration` command creates a timestamped migration file:

```bash
bin/waaseyaa make:migration CreateUsersTable
```

This generates a file like `migrations/20260315_120000_create_users_table.php` with `up()` and `down()` methods. The `bin/waaseyaa migrate` command discovers pending migrations by scanning the migrations directory, comparing filenames against a `migrations` tracking table, and running any that haven't been applied yet.

Each migration runs inside a transaction. If the `up()` method throws an exception, the transaction rolls back and the migration is marked as failed. The status of every migration is tracked in the database itself.

[Minoo](https://github.com/jonesrussell/minoo) adopted this tooling immediately. Its community platform schema — users, posts, roles — is managed entirely through waaseyaa migrations. Running `bin/waaseyaa migrate` on a fresh Minoo install creates the full schema from scratch.

## Three apps upgrading

The real test of any framework migration is whether applications survive it. Three apps depended on waaseyaa's database layer:

**Minoo** upgraded to alpha.25, which shipped with `DBALDatabase` as the default. The upgrade required changing one line in the bootstrap — swapping the old database service registration for the new DBAL connection setup.

**Claudriel** had already been built against a DBAL abstraction interface. When waaseyaa's internals switched from `PdoDatabase` to `DBALDatabase`, Claudriel required zero changes.

**waaseyaa.org** launched with the new stack from day one. It never knew the old `PdoDatabase` existed.

The migration was invisible at the application layer because the entity storage interface didn't change. `SqlEntityStorage` is the class that translates entity operations into SQL. It switched its internals from `PdoDatabase` to `DBALDatabase`, but its public API — `find()`, `save()`, `delete()`, `query()` — stayed identical. Applications talk to `SqlEntityStorage`, not to the database connection directly.

This is the payoff of the entity system design from part 3 of this series. The storage interface is a seam. You can replace everything behind it without disturbing the code in front of it.

## How AI handled 413 commits

Four hundred thirteen commits in two weeks sounds like a grind. It was — but it was a mechanical grind, which is exactly what AI handles well.

The migration followed a repeatable pattern: find a `PdoDatabase` usage, replace it with the equivalent DBAL call, update the tests, verify, commit. [Claude Code](https://claude.ai/code) executed this pattern across every package in the framework.

The codified context made this tractable. Each session loaded the relevant spec and the migration checklist. The AI understood the pattern, applied it to a subset of packages, and moved on. There was no ambiguity about what the end state should look like — the spec defined the target API, and every commit moved one more call site to that target.

This is the kind of work where AI shines: vast scope, clear pattern, well-defined boundaries. A human would get bored by commit 50. The AI maintained the same attention to detail on commit 413 as on commit 1.

## What's next

With DBAL in place, waaseyaa has a solid foundation for database operations. The next post covers internationalization — building i18n support for Minoo, a cultural platform where multilingual content isn't a nice-to-have but a core requirement.

Baamaapii
