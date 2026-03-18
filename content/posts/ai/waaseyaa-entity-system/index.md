---
title: "The entity system at the heart of Waaseyaa"
date: 2026-03-20
categories: [ai, php]
tags: [waaseyaa, php, claude-code, open-source]
series: ["waaseyaa"]
series_order: 4
series_group: "Main"
summary: "How waaseyaa's EntityInterface, ContentEntityBase, and field system work — and how the entity-system specialist skill made cross-session development possible."
slug: "waaseyaa-entity-system"
draft: false
---

Ahnii!

> **Series context:** This is part 4 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Read [part 1]({{< relref "waaseyaa-intro" >}}) for an overview of the framework, its architecture, and the GitHub issue workflow used to build it.

[Drupal](https://www.drupal.org/)'s greatest contribution to PHP content management isn't its UI or its module ecosystem — it's the entity/field model. The idea that content types are configurations of typed fields, that any content type can have any field, that fields carry their own storage and validation logic, is what makes Drupal flexible enough to model almost any content domain.

Waaseyaa inherits this model, rewritten for PHP 8.4+ with modern type declarations and [Symfony](https://symfony.com/)'s dependency injection. This post covers how the entity system works and how structured AI context made it buildable across multiple sessions without losing architectural coherence.

## EntityInterface

Every entity in the framework implements `EntityInterface`. The contract is minimal:

```php
interface EntityInterface
{
    public function getId(): EntityId;
    public function getEntityType(): string;
    public function getFields(): FieldCollection;
    public function getField(string $name): ?FieldInterface;
    public function toArray(): array;
    public function fromArray(array $data): static;
}
```

A few things about this contract that matter for how the rest of the framework works:

`getId()` returns an `EntityId` value object, never a scalar. This means entity identities are strongly typed — you can't accidentally pass an integer where an entity ID is expected.

`getField()` returns `?FieldInterface`, never throwing on an unregistered field name. Callers check for null; they don't catch exceptions. This is a behavioral contract, not just a signature, and it's documented explicitly in the entity-system specialist skill so sessions don't accidentally generate exception-throwing implementations.

`toArray()` is the serialization contract used by `ResourceSerializer` in the API layer. The shape it returns is what JSON:API responses are built from. Sessions working on the API layer load both the entity-system skill and the api-layer skill to understand how these two contracts interact.

## ContentEntityBase

`ContentEntityBase` is the abstract base class that provides default implementations for most of `EntityInterface`. Custom entity types extend this, not `EntityInterface` directly.

```php
abstract class ContentEntityBase implements EntityInterface
{
    private EntityId $id;
    private FieldCollection $fields;
    private string $entityType;

    public function __construct(string $entityType, EntityId $id)
    {
        $this->entityType = $entityType;
        $this->id = $id;
        $this->fields = new FieldCollection();
    }

    public function getField(string $name): ?FieldInterface
    {
        return $this->fields->get($name);
    }

    abstract public function buildFields(): void;
}
```

The `buildFields()` abstract method is where concrete entity types define their field structure. A `Teaching` entity in Minoo calls `$this->fields->add()` for each of its fields in `buildFields()`. This keeps field definitions in the entity class, not in external configuration files.

## The Field System

Fields are typed containers for entity data. Each field type implements `FieldInterface`:

```php
interface FieldInterface
{
    public function getName(): string;
    public function getType(): string;
    public function getValue(): mixed;
    public function setValue(mixed $value): void;
    public function validate(): ValidationResult;
    public function toArray(): array;
}
```

The framework ships field types for the common cases: `StringField`, `TextField`, `IntegerField`, `BooleanField`, `DateTimeField`, `EntityReferenceField`, `FileField`. Each carries its own validation logic and serialization behavior.

A `Teaching` entity in Minoo illustrates how entity types compose fields:

```php
class Teaching extends ContentEntityBase
{
    public function buildFields(): void
    {
        $this->fields->add(new StringField('title'));
        $this->fields->add(new TextField('body'));
        $this->fields->add(new EntityReferenceField('language', 'language'));
        $this->fields->add(new EntityReferenceField('teacher', 'person'));
        $this->fields->add(new BooleanField('is_public'));
        $this->fields->add(new DateTimeField('recorded_at'));
    }
}
```

This is the thin-application pattern in practice. Minoo defines the entity types and their fields. The framework provides the field implementations, the storage layer, the serialization, and the API endpoints. An application-level change (adding a field to `Teaching`) stays in the application layer.

## The Entity Factory

Entities aren't instantiated directly. They go through `EntityFactory`:

```php
class EntityFactory
{
    public function create(string $entityType, ?EntityId $id = null): EntityInterface;
    public function fromArray(string $entityType, array $data): EntityInterface;
    public function fromStorage(string $entityType, array $row): EntityInterface;
}
```

The factory handles entity type resolution (mapping `'teaching'` to the `Teaching` class), ID generation for new entities, and reconstruction from storage rows. Sessions that need to create entities use the factory. Sessions that find themselves constructing `Teaching` directly are doing something wrong — the entity-system skill flags this as a common mistake.

## The Specialist Skill's Role

The entity-system skill carries the knowledge above — interface contracts, the `buildFields()` pattern, the factory usage, common mistakes. Before the skill existed, sessions working on the entity system would occasionally generate code that threw exceptions from `getField()` (wrong), constructed entities directly instead of using the factory (wrong), or tried to access field values via array access instead of `getField()` (wrong).

With the skill in place, those mistakes stopped. The session loads the skill at the start of any session touching `packages/entity/`, has the interface contracts and behavioral rules, and generates code that fits the system.

The GitHub issue that drove the initial entity system build scoped the work precisely: `EntityInterface`, `ContentEntityBase`, `FieldCollection`, five core field types, and the factory. Nothing outside that scope. When sessions drifted toward adding validation rules or storage adapters — work that belonged in later milestones — the issue scope pulled them back.

The combination — issue scope plus codified context — is what makes complex framework development manageable across dozens of sessions.

Next: Deny-unless-granted: access control in Waaseyaa.

Baamaapii
