---
title: "Testing 38 packages without losing your mind"
date: 2026-03-23
categories: [ai, php]
tags: [waaseyaa, php, testing, claude-code]
series: ["waaseyaa"]
series_order: 9
series_group: "Main"
summary: "How in-memory implementations, a layered test strategy, and AI-assisted test generation keep a 38-package PHP monorepo testable."
slug: "waaseyaa-testing"
draft: false
---

Ahnii!

> **Series context:** This is part 7 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Previous posts covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), [DBAL migration]({{< relref "waaseyaa-dbal-migration" >}}), and [i18n]({{< relref "waaseyaa-i18n" >}}).

Waaseyaa has 38 packages, 7 architectural layers, and 3 consuming applications. That is a lot of surface area to test. If every test needs a running database, a full DI container, and a web server, the suite takes minutes and breaks constantly. Flaky tests erode trust. Slow tests kill momentum.

This post covers the testing strategy that keeps the monorepo workable: in-memory implementations for speed, a layered test plan for coverage, and AI-assisted generation for volume.

## The testing problem at scale

A monorepo multiplies the usual testing challenges. Change a method signature in the entity system and you might break access control, the API layer, and two consuming applications. Run every test against a real database and you are waiting three minutes for feedback on a one-line change.

The goal is fast, isolated unit tests that catch logic errors immediately, with slower integration tests that catch the cross-package bugs unit tests miss. Each level has a job. No level tries to do everything.

## In-memory implementations

Every subsystem that touches infrastructure has an in-memory counterpart. `InMemoryEntityStorage` implements the same `EntityStorageInterface` as `SqlEntityStorage`. The difference is that it stores entities in a PHP array instead of hitting a database.

```php
$storage = new InMemoryEntityStorage($entityType);
$storage->create(['name' => 'Test Teaching', 'status' => 1]);
$entity = $storage->load(1);
```

This pattern runs in milliseconds. No database connection, no schema setup, no teardown. The storage interface contract guarantees that code tested against the in-memory version behaves the same way against the real one.

The pattern repeats across the framework. In-memory cache backends, in-memory queue implementations, in-memory configuration storage. Every package that depends on infrastructure can swap in a fast double without mocking. These are not mocks — they are complete implementations that happen to store data in arrays. They implement the full interface, including edge cases like loading a nonexistent entity or handling duplicate keys.

## EntityFactory for consistent test data

Building test entities by hand is tedious and error-prone. `EntityFactory` provides a builder pattern for test data.

```php
EntityFactory::define('teaching', [
    'name' => 'Default Teaching',
    'status' => 1,
    'language' => 'en',
]);

$teaching = EntityFactory::create('teaching');
$draft = EntityFactory::create('teaching', ['status' => 0]);
```

`define()` registers a blueprint. `create()` produces an entity with sensible defaults that you override as needed. Two companion methods handle common scenarios: `createMany()` builds collections for pagination and list tests, and `sequence()` generates unique values when you need five teachings with different names.

The factory keeps test data consistent across packages. When access control tests and API layer tests both need a published teaching entity, they get the same shape of data.

## The three test levels

The test suite has three levels, each with a clear purpose.

**Unit tests** run per-package with in-memory implementations. They test business logic, validation rules, access checks, and serialization. A unit test for the access control layer creates an in-memory user, assigns a role, and checks whether `AccessManager::check()` returns the right result. No database, no HTTP, no container. These run in seconds.

**Integration tests** use real [SQLite](https://www.sqlite.org/) databases. They catch the bugs that in-memory tests miss — SQL syntax issues, query builder edge cases, and cross-package interactions. The SQL reserved word issue from [post 5]({{< relref "waaseyaa-dbal-migration" >}}) is a perfect example. The in-memory storage had no opinion about column names. SQLite rejected `language` as a column name because it is a reserved word. Only an integration test against a real database caught it.

**End-to-end tests** use [Playwright](https://playwright.dev/) for [Minoo](https://github.com/jonesrussell/minoo), the community platform built on Waaseyaa. They test rendering, navigation, and user flows in a real browser.

## Claudriel's 195 test files

[Claudriel](https://github.com/jonesrussell/claudriel), the commercial SaaS application built on Waaseyaa, has 195 test files covering its entity types. Commitment entities have tests for CRUD operations, access control enforcement, and pipeline behavior. Workspace entities test membership rules and permission inheritance.

The test suite uses [PHPUnit](https://phpunit.de/) for unit tests and [Pest](https://pestphp.com/) for more expressive assertion chains. Integration tests spin up a real SQLite database, run migrations, and exercise the full storage layer. The combination catches both logic errors and storage bugs.

```php
it('denies access to unpublished commitments for anonymous users', function () {
    $commitment = EntityFactory::create('commitment', ['status' => 0]);
    $anonymous = EntityFactory::create('user', ['roles' => []]);

    $result = $this->accessManager->check('view', $commitment, $anonymous);

    expect($result->isAllowed())->toBeFalse();
});
```

Pest's `expect()` API makes the intent readable. The test says what it means. When it fails, the output tells you exactly which expectation broke.

## Minoo's Playwright tests

Minoo's end-to-end tests take a different approach from typical Playwright suites. The platform runs against real content — teachings, stories, language resources contributed by community members. The database is not seeded with fixtures. It contains whatever content exists at test time.

This means tests cannot assert "the page contains exactly 5 teachings." Instead, they use data guards: check what content exists, then assert based on what is found.

```typescript
test('teaching detail page renders correctly', async ({ page }) => {
  const teachings = await page.locator('[data-testid="teaching-card"]');
  const count = await teachings.count();

  if (count === 0) {
    test.skip('No teachings available');
    return;
  }

  await teachings.first().click();
  await expect(page.locator('[data-testid="teaching-title"]')).toBeVisible();
});
```

The test adapts to the current state. If there are no teachings, it skips instead of failing. If there are teachings, it clicks through and verifies the detail page renders. This is practical for a content platform where the data is real, not manufactured.

## AI and test generation

AI writes tests well when the pattern is clear. The combination of in-memory implementations and `EntityFactory` gives AI sessions a repeatable template. Define the entity type, create test data with the factory, call the method under test, assert the result. The structure is mechanical enough that AI can generate dozens of test cases from a single example.

The testing specialist skill carries these patterns between sessions. When a new entity type is added, the AI session loads the skill, sees the established patterns, and generates a full test suite that follows the same conventions.

Where AI struggles is with meaningful [Playwright](https://playwright.dev/) selectors for dynamic content. When page structure depends on what content exists, the AI cannot predict which selectors will work. The data guard pattern was a human insight. The AI adopted it once shown, but did not invent it. This is a recurring theme in the project: humans design the patterns, AI scales them.

## What's next

The next post covers deploying a Waaseyaa application — from scaffold to live site in 90 minutes.

Baamaapii
