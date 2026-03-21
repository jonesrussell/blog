---
title: "The entity system at the heart of Waaseyaa"
date: 2026-03-16
categories: [ai, php]
tags: [waaseyaa, php, claude-code, open-source]
series: ["waaseyaa"]
series_order: 3
series_group: "Main"
summary: "How waaseyaa's EntityInterface, ContentEntityBase, and field system work — and how the entity-system specialist skill made cross-session development possible."
slug: "waaseyaa-entity-system"
draft: false
---

Ahnii!

> **Series context:** This is part 3 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Read the [series intro]({{< relref "waaseyaa-intro" >}}) for an overview, and [co-development governance]({{< relref "co-development-skill-set" >}}) for how the multi-repo workflow is governed.

[Drupal](https://www.drupal.org/)'s greatest contribution to PHP content management isn't its UI or its module ecosystem — it's the entity/field model. The idea that content types are configurations of typed fields, that any content type can have any field, that fields carry their own storage and validation logic, is what makes Drupal flexible enough to model almost any content domain.

Waaseyaa inherits this model, rewritten for PHP 8.4+ with modern type declarations and [Symfony](https://symfony.com/)'s dependency injection. This post covers how the entity system works and how structured AI context made it buildable across multiple sessions without losing architectural coherence.

## EntityInterface

Every entity in the framework implements `EntityInterface`. The contract is minimal:

```php
interface EntityInterface
{
    public function id(): int|string|null;
    public function uuid(): string;
    public function label(): string;
    public function getEntityTypeId(): string;
    public function bundle(): string;
    public function isNew(): bool;
    public function toArray(): array;
    public function language(): string;
}
```

A few things about this contract that matter for how the rest of the framework works:

`id()` returns `int|string|null` — nullable because new entities that haven't been saved yet don't have an ID. `isNew()` uses this: an entity is new when its ID is null (or when explicitly forced via `enforceIsNew()`).

`bundle()` enables entity subtypes. A `node` entity type can have bundles like `article` or `page`, each with different field definitions. When no bundle key is set, the bundle defaults to the entity type ID itself.

`toArray()` is the serialization contract used by `ResourceSerializer` in the API layer. The shape it returns is what JSON:API responses are built from. Sessions working on the API layer load both the entity-system skill and the api-layer skill to understand how these two contracts interact.

## ContentEntityBase

`ContentEntityBase` is the abstract base class that provides default implementations for most of `EntityInterface`. It extends `EntityBase` and implements `ContentEntityInterface`, which combines `EntityInterface` with `FieldableInterface`. Custom entity types extend this, not `EntityInterface` directly.

```php
abstract class ContentEntityBase extends EntityBase implements ContentEntityInterface
{
    protected array $fieldDefinitions = [];

    public function __construct(
        array $values = [],
        string $entityTypeId = '',
        array $entityKeys = [],
        array $fieldDefinitions = [],
    ) {
        parent::__construct($values, $entityTypeId, $entityKeys);
        $this->fieldDefinitions = $fieldDefinitions;
    }

    public function hasField(string $name): bool
    {
        return array_key_exists($name, $this->values)
            || array_key_exists($name, $this->fieldDefinitions);
    }

    public function get(string $name): mixed
    {
        return $this->values[$name] ?? null;
    }

    public function set(string $name, mixed $value): static
    {
        $this->values[$name] = $value;
        return $this;
    }
}
```

Entity values are stored in a `$values` array, and field access goes through `get()` and `set()` rather than dedicated field objects. `hasField()` checks both the values array and the field definitions — a field can be defined even if it doesn't have a value yet. This keeps the entity lightweight: for v0.1.0, field values are raw values in the array, with full `FieldItemList` integration planned for the `waaseyaa/field` package.

## The Field System

The field system lives in the `waaseyaa/field` package. Each field type implements `FieldItemInterface`:

```php
interface FieldItemInterface extends ComplexDataInterface
{
    public function isEmpty(): bool;
    public function getFieldDefinition(): FieldDefinitionInterface;
    /** @return string[] */
    public static function propertyDefinitions(): array;
    public static function mainPropertyName(): string;
}
```

Field items are typed data objects that know their own property structure. `propertyDefinitions()` declares the properties a field type carries, and `mainPropertyName()` identifies the primary property (usually `'value'`). Each field type also provides `schema()` and `jsonSchema()` methods for storage and API serialization.

The framework ships field item types for the common cases: `StringItem`, `TextItem`, `IntegerItem`, `BooleanItem`, `FloatItem`, and `EntityReferenceItem`. Each is annotated with a `#[FieldType]` attribute that declares its ID, label, description, and default cardinality.

A `Skill` entity in [Claudriel](https://github.com/jonesrussell/claudriel) illustrates how entity types work in practice:

```php
final class Skill extends ContentEntityBase
{
    protected string $entityTypeId = 'skill';

    protected array $entityKeys = [
        'id' => 'sid',
        'uuid' => 'uuid',
        'label' => 'name',
    ];

    public function __construct(array $values = [])
    {
        parent::__construct($values, 'skill', $this->entityKeys);
    }
}
```

This is the thin-application pattern in practice. Claudriel defines entity types with their entity keys — the mapping that tells the framework which value array keys correspond to the entity's ID, UUID, and label. The framework provides the base class, UUID auto-generation, serialization, and the API endpoints. An application-level change (adding a new entity type or adjusting its keys) stays in the application layer.

## The Entity Factory

For testing, the `waaseyaa/testing` package provides an `EntityFactory` — a test data generator that creates entity value arrays:

```php
$factory = new EntityFactory();
$factory->define('skill', [
    'name' => 'Default skill',
    'status' => 1,
]);

$values = $factory->create('skill', ['name' => 'Custom']);
// => ['name' => 'Custom', 'status' => 1]
```

The factory's `create(string $entityTypeId, array $overrides = []): array` method merges registered defaults with per-test overrides. It also supports `sequence()` callbacks for generating unique values across multiple entities, and `createMany()` for batch creation. This is a test utility, not a production service — entity types in application code are constructed directly via `new Skill($values)`.

## The Specialist Skill's Role

The entity-system skill carries the knowledge above — interface contracts, the values-array pattern, the entity keys mapping, common mistakes. Before the skill existed, sessions working on the entity system would occasionally generate code that used incorrect method names, invented classes that don't exist, or misunderstood how field access works through `get()` and `set()`.

With the skill in place, those mistakes stopped. The session loads the skill at the start of any session touching `packages/entity/`, has the interface contracts and behavioral rules, and generates code that fits the system.

The GitHub issue that drove the initial entity system build scoped the work precisely: `EntityInterface`, `EntityBase`, `ContentEntityBase`, `FieldableInterface`, six core field item types, and the testing factory. Nothing outside that scope. When sessions drifted toward adding validation rules or storage adapters — work that belonged in later milestones — the issue scope pulled them back.

The combination — issue scope plus codified context — is what makes complex framework development manageable across dozens of sessions.

Next: [Building a temporal layer so your AI never lies about time]({{< relref "claudriel-temporal-layer" >}}).

Baamaapii
