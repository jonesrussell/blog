---
title: "Entity lifecycle hooks and batch operations in Waaseyaa"
date: 2026-03-27
categories: [php, waaseyaa]
tags: [php, waaseyaa, entities, oop]
summary: "How to use preSave, postSave, preDelete, and postDelete hooks in Waaseyaa, with automatic pre-save validation and saveMany/deleteMany batch operations."
slug: "entity-lifecycle-hooks-waaseyaa"
draft: false
devto: true
---

Ahnii!

This post covers the entity lifecycle hook system added to [Waaseyaa](https://github.com/waaseyaa/waaseyaa), along with automatic pre-save validation and the `saveMany`/`deleteMany` batch operations that landed alongside it.

## What lifecycle hooks give you

Every entity in Waaseyaa extends `EntityBase`. Four methods on that base class fire automatically when the repository saves or deletes an entity:

```php
abstract class EntityBase implements EntityInterface
{
    public function preSave(bool $isNew): void {}
    public function postSave(bool $isNew): void {}
    public function preDelete(): void {}
    public function postDelete(): void {}
}
```

The default implementations are no-ops. Override any of them in your entity class to add custom behaviour. The `$isNew` parameter on the save hooks tells you whether the entity is being inserted for the first time or updated.

These hooks are synchronous and run inside the same request that triggered the save or delete, so they are the right place for things like cache invalidation, derived field computation, or side-effect cleanup that must happen before or after persistence.

## Overriding hooks in an entity class

Override only the methods you need:

```php
final class Article extends EntityBase
{
    protected string $entityTypeId = 'article';

    protected array $entityKeys = [
        'id'    => 'id',
        'label' => 'title',
    ];

    public function __construct(array $values = [])
    {
        parent::__construct($values);
    }

    public function preSave(bool $isNew): void
    {
        if ($isNew) {
            // Stamp a created_at value on first insert.
            $this->values['created_at'] = date('c');
        }

        $this->values['updated_at'] = date('c');
    }

    public function postSave(bool $isNew): void
    {
        // Clear a cached article list after any write.
        cache()->forget('article.index');
    }

    public function preDelete(): void
    {
        // Disallow deleting published articles.
        if ($this->values['status'] === 'published') {
            throw new \DomainException('Cannot delete a published article.');
        }
    }
}
```

The `preSave` hook runs before the driver writes to storage; `postSave` runs after the write succeeds. The same ordering applies to `preDelete` and `postDelete`. If `preSave` throws, the write never happens.

## Automatic pre-save validation

When you call `$repository->save($entity)`, the repository runs constraint validation before calling `preSave`. If the entity type defines constraints via `getConstraints()` and the entity violates any of them, an `EntityValidationException` is thrown and nothing is written.

```php
use Waaseyaa\Entity\Validation\EntityValidationException;

try {
    $repository->save($article);
} catch (EntityValidationException $e) {
    foreach ($e->violations as $violation) {
        echo $violation->getPropertyPath() . ': ' . $violation->getMessage() . "\n";
    }
}
```

`EntityValidationException` carries the full `ConstraintViolationListInterface` from Symfony Validator, so you can iterate violations, render them in an API response, or log them as structured data.

You can skip validation by passing `validate: false`:

```php
$repository->save($entity, validate: false);
```

This is useful in migrations or fixtures where you are importing data that predates your constraint definitions.

## Batch operations: saveMany and deleteMany

`saveMany` and `deleteMany` wrap a collection of entities in a single database transaction. Events are buffered during the transaction and dispatched only after the commit succeeds. If anything fails mid-batch, the transaction rolls back and no events fire.

```php
// Save a batch — returns an array of SAVED_NEW / SAVED_UPDATED per entity.
$results = $repository->saveMany([$article1, $article2, $article3]);

// Delete a batch — returns the number of entities deleted.
$count = $repository->deleteMany([$draft1, $draft2]);
```

The return values mirror the single-entity methods: `saveMany` gives you one result per input entity in the same order, and `deleteMany` gives you the total count.

Lifecycle hooks still fire for each entity inside the transaction. If a `preSave` hook throws on entity two, the transaction rolls back — entity one's write is undone and no events are dispatched.

Both methods require a database connection and will throw `\LogicException` if called on a repository that was constructed without one (for example, in unit tests using `InMemoryEntityStorage`).

## Verify it works

The test fixture in the framework records hook calls for inspection:

```php
$entity = new LifecycleTrackingEntity(['id' => '1', 'name' => 'Test']);
$repository->save($entity);

// $entity->hookLog === ['preSave:new', 'postSave:new']

$repository->delete($entity);

// $entity->hookLog === ['preSave:new', 'postSave:new', 'preDelete', 'postDelete']
```

For your own tests, the same pattern works: implement the four methods on a test entity, persist it, and assert the log.

Baamaapii
