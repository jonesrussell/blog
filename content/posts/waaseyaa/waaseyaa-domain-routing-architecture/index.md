---
title: "Domain Routing in Waaseyaa: Replacing a Giant Dispatcher With Small Routers"
date: 2026-04-05
categories: [waaseyaa]
tags: [php, architecture, waaseyaa]
summary: "How Waaseyaa splits a monolithic controller dispatcher into domain-specific routers using a two-method interface."
slug: "waaseyaa-domain-routing-architecture"
draft: true
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework) had a controller dispatcher that grew past 1,000 lines. Every new feature meant more conditionals in the same file. This post covers how we replaced it with domain-specific routers, each implementing a two-method interface that keeps routing logic scoped and testable.

## The Problem With a Monolithic Dispatcher

A single dispatcher that handles every request type accumulates conditionals fast. Entity CRUD, schema generation, lifecycle management, OpenAPI docs: all funneling through one class. Each new feature touches the same file, and testing any one path means loading the context for all of them.

The fix isn't a better dispatcher. It's smaller, focused routers that each own one domain.

## DomainRouterInterface

The contract is two methods:

```php
interface DomainRouterInterface
{
    /**
     * Whether this router can handle the given request.
     */
    public function supports(Request $request): bool;

    /**
     * Handle the request and return a response.
     */
    public function handle(Request $request): Response;
}
```

`supports()` inspects the request and returns a boolean. `handle()` does the work. The dispatcher iterates through registered routers in order, and the first one that returns `true` from `supports()` wins.

This is the Chain of Responsibility pattern with an explicit contract. Each router declares what it can handle and does nothing else.

## How Routers Claim Requests

The primary discriminator is the `_controller` request attribute, set during route matching. Routers check this attribute to decide whether a request belongs to them:

```php
// EntityTypeLifecycleRouter
public function supports(Request $request): bool
{
    $controller = $request->attributes->get('_controller', '');

    return $controller === 'entity_types'
        || str_starts_with($controller, 'entity_type.');
}
```

This router claims any request where `_controller` is `entity_types` (the list endpoint) or starts with `entity_type.` (disable, enable actions). Clean prefix matching means adding a new entity type action just needs a new case in `handle()`, not a new router.

## EntityTypeLifecycleRouter

This router manages entity type state: listing all types, disabling a type, and re-enabling it.

```php
final class EntityTypeLifecycleRouter implements DomainRouterInterface
{
    use JsonApiResponseTrait;

    public function __construct(
        private readonly EntityTypeManager $entityTypeManager,
        private readonly EntityTypeLifecycleManager $lifecycleManager,
    ) {}
}
```

Two dependencies, both injected. The `EntityTypeManager` provides type metadata. The `EntityTypeLifecycleManager` handles state transitions with safety checks: you can't disable the last enabled entity type without a `force` flag.

The `handle()` method routes to internal methods based on the controller attribute:

- `entity_types` calls `listTypes()`, which returns all entity types with their id, label, disabled status, and capabilities (translatable, revisionable)
- `entity_type.disable` and `entity_type.enable` call their respective methods with validation

Each response uses the `JsonApiResponseTrait` for consistent formatting. The router owns its entire domain: matching, handling, and response formatting.

## SchemaRouter

The schema router serves OpenAPI specs and entity type schemas:

```php
final class SchemaRouter implements DomainRouterInterface
{
    use JsonApiResponseTrait;

    public function __construct(
        private readonly EntityTypeManager $entityTypeManager,
        private readonly EntityAccessHandler $accessHandler,
    ) {}
}
```

It claims requests where `_controller` is `openapi` or contains `SchemaController`:

```php
public function supports(Request $request): bool
{
    $controller = $request->attributes->get('_controller', '');

    return $controller === 'openapi'
        || str_contains($controller, 'SchemaController');
}
```

The `openapi` route generates the full OpenAPI spec using an `OpenApiGenerator`. Schema controller routes delegate to `SchemaController::show()` with the entity type extracted from request attributes.

The access handler is injected here because schema endpoints respect the same access control as the entities they describe. You don't get to read the schema for an entity type you can't access.

## Request Context

By the time a request reaches a domain router, it carries pre-populated attributes:

- `_account`: the authenticated account
- `_broadcast_storage`: the storage backend for the current context
- `_parsed_body`: deserialized request body
- `_waaseyaa_context`: framework context object

Routers don't need to parse authentication tokens or deserialize request bodies. That work happens once, upstream, and the router receives a fully contextualized request. This keeps routers focused on domain logic.

## Adding a New Router

To add a router for a new domain:

1. Create a class implementing `DomainRouterInterface`
2. Define `supports()` to match your controller prefix
3. Implement `handle()` with your domain logic
4. Register the router in the dispatcher's router collection

No existing router changes. No dispatcher modifications. The interface guarantees that new domains are additive.

## What This Pattern Gets You

The 1,000-line dispatcher is gone. In its place: small classes with clear boundaries, each testable in isolation. You can test `EntityTypeLifecycleRouter` by constructing it with mock managers and passing in a request with the right attributes. No need to boot the entire framework.

The pattern also makes the codebase navigable. When you see a request to `entity_type.disable`, you know exactly which file handles it. No tracing through a switch statement in a god class.

Baamaapii
