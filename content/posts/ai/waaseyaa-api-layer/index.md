---
title: "JSON:API from Framework to SPA: Waaseyaa's API Layer"
date: 2026-03-19
categories: [ai, php]
tags: [waaseyaa, php, claude-code, open-source]
series: ["waaseyaa"]
series_order: 6
series_group: "Main"
summary: "How waaseyaa's JSON:API layer works — ResourceSerializer, SchemaPresenter, and how Tier 3 specs let a new session pick up mid-feature without re-explaining the whole contract."
slug: "waaseyaa-api-layer"
draft: false
---

Ahnii!

> **Series context:** This is part 6 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). This post builds on [the entity system]({{< relref "waaseyaa-entity-system" >}}) and [access control]({{< relref "waaseyaa-access-control" >}}) from earlier in the series.

The entity system models your content. The access control layer decides who can see it. The API layer exposes it to the outside world — and in waaseyaa's case, that means a [JSON:API](https://jsonapi.org/) interface consumed by a Nuxt 3 admin SPA.

This post covers the API layer's design: ResourceSerializer, SchemaPresenter, the request/response contract, and how a Tier 3 spec made it possible for new sessions to pick up mid-feature without re-learning the full contract.

## JSON:API as the Protocol

[JSON:API](https://jsonapi.org/) is a specification for building APIs in JSON. It defines a document structure, error format, link relationships, and filtering conventions that client libraries can depend on without custom parsing.

Waaseyaa implements the JSON:API spec natively for entity CRUD. A `Teaching` entity is exposed at `/api/teachings`, with JSON:API document structure in both requests and responses. The Nuxt 3 admin SPA uses a JSON:API client library, which means the SPA gets filtering, pagination, and relationship loading for free — the framework's API compliance provides them.

## ResourceSerializer

`ResourceSerializer` converts entity objects into `JsonApiResource` value objects:

```php
final class ResourceSerializer
{
    public function serialize(
        EntityInterface $entity,
        ?EntityAccessHandler $accessHandler = null,
        ?AccountInterface $account = null,
    ): JsonApiResource;

    public function serializeCollection(
        array $entities,
        ?EntityAccessHandler $accessHandler = null,
        ?AccountInterface $account = null,
    ): array;
}
```

There's no `deserialize()` method — the framework handles inbound JSON:API documents in `JsonApiController` directly, validating the `data.type` and `data.attributes` structure before passing values to entity storage.

The serialized form of a `Teaching` entity:

```json
{
  "data": {
    "type": "teaching",
    "id": "01HXYZ...",
    "attributes": {
      "title": "Water is Life",
      "body": "...",
      "is_public": false,
      "recorded_at": "2024-08-15T14:30:00Z"
    },
    "relationships": {
      "language": {
        "data": { "type": "language", "id": "01HABC..." }
      },
      "teacher": {
        "data": { "type": "person", "id": "01HDEF..." }
      }
    }
  }
}
```

This shows a single Teaching resource with its attributes and relationship references to language and teacher entities.

`ResourceSerializer` calls `entity->toArray()` and maps the result to JSON:API structure, excluding entity keys (like `id` and `uuid`) from attributes since they appear at the top level of the resource. When an `EntityAccessHandler` and `AccountInterface` are provided, fields that the current user can't view are omitted from the serialized output.

## SchemaPresenter

`SchemaPresenter` handles a different problem: not "serialize this entity" but "describe what entities of this type look like." It's used for the SPA's dynamic form generation — when the admin interface needs to render a form for creating a new entity type, it requests the schema first.

```php
final class SchemaPresenter
{
    public function present(
        EntityTypeInterface $entityType,
        array $fieldDefinitions = [],
        ?EntityInterface $entity = null,
        ?EntityAccessHandler $accessHandler = null,
        ?AccountInterface $account = null,
    ): array;
}
```

The `present()` method returns a JSON Schema (draft-07) array with custom `x-widget` hints for the admin UI. It builds system properties from entity keys automatically, then adds field definitions you pass in. When access control parameters are provided, view-denied fields are removed entirely and edit-denied fields are marked `readOnly` with `x-access-restricted`.

The schema for `Teaching` describes each field's JSON Schema type, widget hint, label, and required status. The SPA reads this schema and generates the appropriate form inputs — a text input for `title`, a rich text editor for `body`, a relationship picker for `language` and `teacher`.

This separation — serializer for data, presenter for schema — means the SPA doesn't need hardcoded knowledge of each entity type's structure. New entity types in [Minoo]({{< relref "waaseyaa-intro" >}}) (waaseyaa's reference application) appear in the admin interface automatically.

## The API Layer Spec and Mid-Feature Pickup

The api-layer subsystem spec is where Tier 3 cold memory earns its keep most clearly.

A session that opened halfway through implementing relationship sideloading for the Teachings endpoint needed to know: What's the existing ResourceSerializer contract? How do `EntityAccessHandler` and `AccountInterface` propagate the access control context? What's the JSON:API format for included relationships? What does the existing test setup look like?

Without a spec, answering these questions requires reading several source files, understanding their interactions, and reconstructing the contract from code. That's 15-20 minutes of session context before the actual work starts.

With the api-layer spec, the session calls `waaseyaa_get_spec("api-layer")` and gets the full picture: `ResourceSerializer` and `SchemaPresenter` method signatures, the access control parameter pattern, the JSON:API document format for both single resources and collections, the relationship loading contract, and the standard test setup.

The spec exists precisely because relationship loading was the kind of feature that required multiple sessions to implement. The first session established the contract. Subsequent sessions needed to understand it without re-reading everything the first session produced.

## A Minoo Endpoint

Minoo doesn't need a custom `TeachingController` at all. The framework's `JsonApiController` handles CRUD for any registered entity type:

```php
final class JsonApiController
{
    public function __construct(
        private readonly EntityTypeManagerInterface $entityTypeManager,
        private readonly ResourceSerializer $serializer,
        private readonly ?EntityAccessHandler $accessHandler = null,
        private readonly ?AccountInterface $account = null,
    ) {}

    public function show(string $entityTypeId, int|string $id): JsonApiDocument
    {
        $entity = $this->loadByIdOrUuid($entityTypeId, $id);

        if ($entity === null) {
            return $this->errorDocument(
                JsonApiError::notFound("Entity of type '{$entityTypeId}' with ID '{$id}' not found."),
            );
        }

        if ($this->accessHandler !== null && $this->account !== null) {
            $access = $this->accessHandler->check($entity, 'view', $this->account);
            if (!$access->isAllowed()) {
                return $this->errorDocument(
                    JsonApiError::forbidden("Access denied for viewing entity '{$id}'."),
                );
            }
        }

        $resource = $this->serializer->serialize($entity, $this->accessHandler, $this->account);

        return JsonApiDocument::fromResource($resource, links: ['self' => "/api/{$entityTypeId}/{$resource->id}"]);
    }
}
```

The controller is generic. Entity loading, access evaluation, and serialization are all framework responsibilities driven by the entity type ID in the URL. Minoo's `Teaching` entities are served at `/api/teaching/{id}` without any application-specific controller code.

This is the thin-application pattern in practice. Adding a new entity type to Minoo is: define the entity type with its fields and register it with the entity type manager. The framework's `JsonApiController` and `JsonApiRouteProvider` handle the rest — CRUD endpoints, access checks, filtering, pagination, and JSON:API document formatting.

## What the Nuxt 3 SPA Gets

The admin SPA is a Nuxt 3 application using a JSON:API client library. Because the framework is spec-compliant, the SPA gets:

- **Filtering** — `filter[title]=Water` is handled by the framework's query parser using `condition()` calls on entity storage queries, not custom controller code
- **Pagination** — `page[offset]` and `page[limit]` work on all endpoints
- **Relationship loading** — `include=language,teacher` fetches related entities in one request
- **Schema introspection** — the SPA generates forms dynamically from the schema endpoint

None of this is custom code in Minoo. It comes from the framework's JSON:API compliance.

## GraphQL

Since this post was drafted, Waaseyaa added a `graphql` package built on [webonyx/graphql-php](https://github.com/webonyx/graphql-php) v15. It auto-generates CRUD queries and mutations from your entity types — the same zero-config philosophy as the JSON:API layer. Filtering, sorting, pagination, and field-level access control carry over from the entity system.

[Claudriel](https://github.com/jonesrussell/claudriel), a personal operations system built on Waaseyaa, is actively migrating its REST endpoints to GraphQL. Entity types like Commitment, Person, Workspace, and ScheduleEntry now have auto-generated GraphQL schemas. The migration validates that the GraphQL layer handles real-world entity complexity — nested relationships, access-controlled fields, and mixed query patterns — not just the simple CRUD cases.

Next: [Replacing a homegrown database layer with DBAL]({{< relref "waaseyaa-dbal-migration" >}}).

Baamaapii
