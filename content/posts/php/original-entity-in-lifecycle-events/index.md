---
categories:
    - php
date: 2026-03-28T00:00:00Z
devto: true
devto_id: 3420841
draft: true
slug: original-entity-in-lifecycle-events
summary: How to give event listeners access to the pre-mutation state of an entity, test-driven from failing tests to working implementation.
tags:
    - php
    - waaseyaa
    - tdd
    - events
title: Passing the original entity into lifecycle events
---

Ahnii!

When an entity changes, your event listeners often need to know what changed. That means comparing the current state to what was in the database before the save. This post covers how the [Waaseyaa](https://github.com/waaseyaa/waaseyaa) entity system passes the original (pre-mutation) entity into lifecycle events, and how the feature was test-driven from failing tests to working code.

## Why listeners need the original state

Suppose you have a listener that sends a notification when a task's status changes from "draft" to "published". Without the original entity, your listener only sees the current state. It knows the entity is now published, but not that it was previously a draft. You end up querying the database inside the listener, which defeats the purpose of an event-driven architecture.

Passing the original entity alongside the mutated one gives every listener a clean diff without extra queries.

## The EntityEvent class

The event object carries both entities as constructor-promoted properties:

```php
class EntityEvent extends Event
{
    public function __construct(
        public readonly EntityInterface $entity,
        public readonly ?EntityInterface $originalEntity = null,
    ) {}
}
```

`entity` is the current (mutated) state. `originalEntity` is the state before any changes, loaded from the database. For new entities, `originalEntity` is `null` since there is no previous state.

## Writing the failing tests first

Before touching any implementation, the tests define the expected behavior. The test fixture uses a `SpyEntityEventFactory` that captures the arguments passed to event creation:

```php
public function test_preSave_receives_originalEntity_on_update(): void
{
    // Create and save the original entity
    $entity = $this->createEntity(['title' => 'Original Title']);
    $this->repository->save($entity);

    // Modify and save again
    $entity->set('title', 'Updated Title');
    $this->repository->save($entity);

    // The PRE_SAVE event should have received the original
    $event = $this->spy->getLastEvent(EntityEvents::PRE_SAVE);
    $this->assertNotNull($event->originalEntity);
    $this->assertSame('Original Title', $event->originalEntity->get('title'));
    $this->assertSame('Updated Title', $event->entity->get('title'));
}
```

This test fails immediately because the repository does not load the original entity yet. The test for new entities verifies that `originalEntity` is `null`:

```php
public function test_preSave_receives_null_originalEntity_on_create(): void
{
    $entity = $this->createEntity(['title' => 'New Entity']);
    $this->repository->save($entity);

    $event = $this->spy->getLastEvent(EntityEvents::PRE_SAVE);
    $this->assertNull($event->originalEntity);
}
```

The same pair of tests exists for `POST_SAVE`, `PRE_DELETE`, and `POST_DELETE`.

## Loading the original before save

The `EntityRepository::doSave()` method loads the original entity from the database before dispatching any events:

```php
private function doSave(EntityInterface $entity, ?UnitOfWork $unitOfWork = null, bool $validate = true): int
{
    $isNew = $entity->isNew();

    // ... validation ...

    $originalEntity = null;
    if (!$isNew) {
        $id = (string) $entity->id();
        $originalEntity = $this->find($id);
    }

    $this->dispatchEvent(
        $this->eventFactory->create($entity, $originalEntity),
        EntityEvents::PRE_SAVE->value,
        $unitOfWork,
    );

    // ... write to storage ...

    $this->dispatchEvent(
        $this->eventFactory->create($entity, $originalEntity),
        EntityEvents::POST_SAVE->value,
        $unitOfWork,
    );

    return $isNew ? EntityConstants::SAVED_NEW : EntityConstants::SAVED_UPDATED;
}
```

The `find()` call loads a fresh copy from the database. This happens before `preSave()` runs on the entity, so the original state is a clean snapshot of what was persisted. Both `PRE_SAVE` and `POST_SAVE` receive the same original, so listeners in either phase can compare.

## The event factory interface

The `EntityEventFactoryInterface` has a single method:

```php
interface EntityEventFactoryInterface
{
    public function create(EntityInterface $entity, ?EntityInterface $originalEntity = null): EntityEvent;
}
```

The default implementation constructs the `EntityEvent` directly. The `SpyEntityEventFactory` used in tests wraps the default and records every call, which is how the tests assert on `originalEntity` without hooking into the event dispatcher.

## What about delete events?

Delete events follow the same pattern. The entity being deleted is the "current" state, and since it already exists in the database, `originalEntity` is loaded the same way. In practice, `entity` and `originalEntity` will be identical for deletes. The value is that listeners get a consistent API across all lifecycle events, and any last-second mutations before delete are visible in `entity` while `originalEntity` holds the persisted state.

## The extra query trade-off

Loading the original entity adds one SELECT per save operation. For most applications, this is negligible. If you are doing bulk saves, the `saveMany()` method wraps everything in a `UnitOfWork` transaction, but each individual save still loads its original. If this becomes a bottleneck, you can implement a caching event factory that pre-loads originals in batch.

For the common case of saving one entity at a time in a web request, the extra query is the right trade-off. Your listeners get clean diffs without coupling to the storage layer.

Baamaapii
