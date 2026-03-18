---
title: "JSON:API from framework to SPA: waaseyaa's API layer"
date: 2026-03-22
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

> **Series context:** This is part 6 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). This post builds on [the entity system]({{< relref "waaseyaa-entity-system" >}}) and [access control]({{< relref "waaseyaa-access-control" >}}) from earlier in the week.

The entity system models your content. The access control layer decides who can see it. The API layer exposes it to the outside world — and in waaseyaa's case, that means a [JSON:API](https://jsonapi.org/) interface consumed by a Nuxt 3 admin SPA.

This post covers the API layer's design: ResourceSerializer, SchemaPresenter, the request/response contract, and how a Tier 3 spec made it possible for new sessions to pick up mid-feature without re-learning the full contract.

## JSON:API as the Protocol

[JSON:API](https://jsonapi.org/) is a specification for building APIs in JSON. It defines a document structure, error format, link relationships, and filtering conventions that client libraries can depend on without custom parsing.

Waaseyaa implements the JSON:API spec natively for entity CRUD. A `Teaching` entity is exposed at `/api/teachings`, with JSON:API document structure in both requests and responses. The Nuxt 3 admin SPA uses a JSON:API client library, which means the SPA gets filtering, pagination, and relationship loading for free — the framework's API compliance provides them.

## ResourceSerializer

`ResourceSerializer` converts entity objects into JSON:API document structures:

```php
class ResourceSerializer
{
    public function serialize(EntityInterface $entity, RequestContext $context): array;
    public function serializeCollection(iterable $entities, RequestContext $context): array;
    public function deserialize(array $document, string $entityType): EntityInterface;
}
```

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

`ResourceSerializer` calls `entity->toArray()` and maps the result to JSON:API structure, handling relationship references as links rather than embedded objects. The `RequestContext` carries the access control context — fields that the current user can't view are omitted from the serialized output.

## SchemaPresenter

`SchemaPresenter` handles a different problem: not "serialize this entity" but "describe what entities of this type look like." It's used for the SPA's dynamic form generation — when the admin interface needs to render a form for creating a new entity type, it requests the schema first.

```php
class SchemaPresenter
{
    public function present(string $entityType): array;
    public function presentField(FieldInterface $field): array;
}
```

The schema for `Teaching` describes each field's type, validation rules, required status, and relationship targets. The SPA reads this schema and generates the appropriate form inputs — a text input for `title`, a rich text editor for `body`, a relationship picker for `language` and `teacher`.

This separation — serializer for data, presenter for schema — means the SPA doesn't need hardcoded knowledge of each entity type's structure. New entity types in Minoo appear in the admin interface automatically.

## The API Layer Spec and Mid-Feature Pickup

The api-layer subsystem spec is where Tier 3 cold memory earns its keep most clearly.

A session that opened halfway through implementing relationship sideloading for the Teachings endpoint needed to know: What's the existing ResourceSerializer contract? How does `RequestContext` propagate the access control context? What's the JSON:API format for included relationships? What does the existing test setup look like?

Without a spec, answering these questions requires reading several source files, understanding their interactions, and reconstructing the contract from code. That's 15-20 minutes of session context before the actual work starts.

With the api-layer spec, the session calls `waaseyaa_get_spec("api-layer")` and gets the full picture: `ResourceSerializer` and `SchemaPresenter` method signatures, the `RequestContext` structure, the JSON:API document format for both single resources and collections, the relationship loading contract, and the standard test setup.

The spec exists precisely because relationship loading was the kind of feature that required multiple sessions to implement. The first session established the contract. Subsequent sessions needed to understand it without re-reading everything the first session produced.

## A Minoo Endpoint

Here's what a Minoo controller looks like with the framework's API layer handling the heavy work:

```php
class TeachingController extends AbstractApiController
{
    public function __construct(
        private readonly EntityRepository $repository,
        private readonly ResourceSerializer $serializer,
        private readonly PolicyEvaluator $access,
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        $teaching = $this->repository->find('teaching', EntityId::from($id));

        if ($teaching === null) {
            return $this->notFound();
        }

        $context = RequestContext::fromRequest($request);
        $result = $this->access->evaluate($teaching, 'read', $context->getUser());

        if ($result->isDenied()) {
            return $this->forbidden($result->getReason());
        }

        return $this->json($this->serializer->serialize($teaching, $context));
    }
}
```

The controller is thin. Entity loading, access evaluation, and serialization are all framework responsibilities. Minoo's application code handles the routing and the `Teaching`-specific entity type — everything else is inherited.

This is the thin-application pattern in practice. Adding a new entity type to Minoo is: define the entity class with its fields, register it in the container, add the controller routes. The framework provides the rest.

## What the Nuxt 3 SPA Gets

The admin SPA is a Nuxt 3 application using a JSON:API client library. Because the framework is spec-compliant, the SPA gets:

- **Filtering** — `filter=title:Water` is handled by the framework's query parser, not custom controller code
- **Pagination** — `page[number]` and `page[size]` work on all endpoints
- **Relationship loading** — `include=language,teacher` fetches related entities in one request
- **Schema introspection** — the SPA generates forms dynamically from the schema endpoint

None of this is custom code in Minoo. It comes from the framework's JSON:API compliance.

## GraphQL

Since this post was drafted, Waaseyaa added a `graphql` package built on [webonyx/graphql-php](https://github.com/webonyx/graphql-php) v15. It auto-generates CRUD queries and mutations from your entity types — the same zero-config philosophy as the JSON:API layer. Filtering, sorting, pagination, and field-level access control carry over from the entity system.

Next: AI-native PHP: the Waaseyaa AI packages.

Baamaapii
