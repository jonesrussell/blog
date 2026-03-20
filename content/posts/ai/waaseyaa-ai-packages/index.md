---
title: "AI-native PHP: the waaseyaa AI packages"
date: 2026-03-25
categories: [ai, php]
tags: [waaseyaa, php, claude-code, open-source]
series: ["waaseyaa"]
series_order: 11
series_group: "Main"
summary: "What ai-schema, ai-agent, ai-pipeline, and ai-vector enable in a PHP framework designed from the ground up with AI in mind — and an honest look at what's built versus what's planned."
slug: "waaseyaa-ai-packages"
draft: false
---

Ahnii!

> **Series context:** This is part 9 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). The series covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), [DBAL migration]({{< relref "waaseyaa-dbal-migration" >}}), [i18n]({{< relref "waaseyaa-i18n" >}}), [testing]({{< relref "waaseyaa-testing" >}}), and [deployment]({{< relref "waaseyaa-deployment" >}}).

The entity system, access control, and API layer are all borrowed ideas — well-proven patterns from [Drupal](https://www.drupal.org/), ported to a modern PHP stack. They're the foundation because they're correct, not because they're new.

The AI packages are where waaseyaa starts to build something that doesn't have a Drupal equivalent. This post covers the four AI integration packages — what they are, what they enable, and an honest account of where they stand today.

## Why AI Packages in a CMS Framework?

Drupal was designed when content meant text. A node was some fields and a body. The edit form was the interface. The workflow was: author creates content, content gets published, users consume it.

That model doesn't map well to AI-augmented content workflows. Content is generated with AI assistance. Entities carry embeddings for semantic search. Agents can take actions in the system — summarizing, translating, enriching. Pipelines process content at ingestion time.

If you're building a new CMS framework in 2026, you design for these workflows from the start. That's what the four AI packages do.

## ai-schema

`ai-schema` provides structured representations of entity types for AI consumption. When an AI agent needs to understand what a `Teaching` entity looks like — its fields, their types, their constraints, their relationships — it calls the schema API.

The schema format is designed for AI, not for humans. Field names come with semantic descriptions. Relationships include their cardinality and the target entity type's schema. Validation rules are expressed in terms an LLM can act on.

The practical use case in Minoo: when generating a new Teaching from a transcript, the AI agent reads the schema to understand what fields to populate, what's required, and how to structure relationships. The schema makes entity structure machine-readable in a way that the JSON:API schema endpoint doesn't quite achieve — the JSON:API schema is designed for form generation, not for LLM reasoning.

## ai-agent

`ai-agent` is the framework's interface for AI agents that can take actions within the system. It defines the contract for agents that can read entities, create entities, update fields, and trigger workflows.

```php
interface AgentInterface
{
    public function execute(AgentContext $context): AgentResult;
    public function dryRun(AgentContext $context): AgentResult;
    public function describe(): string;
}
```

The interface defines three methods: `execute` runs the agent's action within a given context, `dryRun` previews what the agent would do without making changes, and `describe` returns a human-readable explanation of the agent's purpose.

The key design decision: agents operate through the same access control layer as human users. An agent has a user identity, and that identity is subject to `AccessPolicyInterface` like any other user. An agent can't bypass the deny-unless-granted model — it's as constrained as the most restricted human user with the same permissions.

This matters for Minoo specifically. An agent summarizing teachings operates with the permissions of the user who invoked it. If the user can't see restricted teachings, the agent can't see them either. The access control layer is the boundary, not a firewall bolted on after the fact.

## ai-pipeline

`ai-pipeline` handles content transformation pipelines — sequences of operations applied to entities at ingestion time or on demand.

A pipeline for ingesting a teaching transcript might:
1. Extract the teaching metadata (language, teacher, date) from the transcript
2. Generate a structured summary
3. Create the `Teaching` entity with populated fields
4. Queue for review by a community member before publication

The pipeline is composable. Each step is a discrete processor that takes an input and produces an output. Steps can be reordered, replaced, or augmented without touching the surrounding steps.

The framework provides the pipeline orchestration and the plugin discovery mechanism. Minoo registers the processors that are specific to its content domain. This is the plugin system applied to AI workflows.

[Claudriel](https://github.com/jonesrussell/claudriel) uses ai-pipeline for its commitment extraction workflow. Gmail messages flow through a `GmailMessageNormalizer`, then a `CommitmentExtractionStep` that uses the Anthropic API to identify commitments — deadlines, promises, follow-ups — with a confidence threshold of 0.7. Candidates below the threshold are silently skipped. The pipeline produces `Commitment` entities that feed the daily brief. This is ai-pipeline in production: composable steps, each with a clear input/output contract, orchestrated by the framework.

## ai-vector

`ai-vector` is the semantic search package. It handles embedding generation, storage, and retrieval for entities.

The interface is straightforward:

```php
interface VectorStoreInterface
{
    public function store(EntityEmbedding $embedding): void;
    public function delete(string $entityTypeId, int|string $entityId): void;
    public function search(
        array $queryVector,
        int $limit = 10,
        ?string $entityTypeId = null,
        ?string $langcode = null,
        array $fallbackLangcodes = [],
    ): array;
    public function get(string $entityTypeId, int|string $entityId): ?EntityEmbedding;
    public function has(string $entityTypeId, int|string $entityId): bool;
}
```

Storage takes an `EntityEmbedding` value object rather than a raw entity and array — the embedding is a first-class concept. Search returns `SimilarityResult[]` sorted by score, with optional filters for entity type and language (including fallback langcodes for multilingual content). The `get` and `has` methods allow checking stored embeddings directly.

The practical implementation stores embeddings in a vector database (pgvector in the current implementation) and exposes semantic search on top of the regular JSON:API query interface. Searching Minoo's teachings by semantic similarity — "find teachings about water" — goes through the vector store, not through the NorthCloud keyword search.

The NorthCloud integration handles real-time news-style search. The vector store handles semantic similarity search over indigenous knowledge content. They coexist; neither replaces the other.

## Where Things Stand

The AI packages are at different stages. Honest accounting:

**ai-schema:** Functional for the entity types currently in Minoo. The schema format is settled. The coverage is complete for the existing entity types.

**ai-agent:** Interface defined, basic execution loop implemented with dry-run support for previewing changes before committing them. Agent actions for entity CRUD are working. Workflow triggers are planned for the next milestone.

**ai-pipeline:** The orchestration and plugin registration are in place. Two processors are implemented (transcript extraction, summary generation). The review queue integration is planned.

**ai-vector:** The `VectorStoreInterface` and pgvector implementation are working. Automatic embedding generation on entity save is implemented. The semantic search endpoint is under development.

The planned work for the next milestone: the `VERSIONING.md` and `defaults/` directory that establish how packages declare compatibility constraints, the release-gate workflow that enforces those constraints in CI, and the dynamic listing pages in Minoo that surface semantic search results alongside keyword search.

## Building a Complex Framework Solo

Waaseyaa started as a way to avoid Drupal's legacy while keeping its best ideas. It grew into a 43-package monorepo with seven architectural layers, an admin SPA, an AI integration package set, and a production application in Minoo.

Building something this large solo is only possible with a workflow that manages complexity across sessions. The GitHub milestones kept scope contained. The issues kept sessions focused. The codified context — the 17KB CLAUDE.md, 31 framework specs backed by MCP retrieval, and the service-level knowledge in each package group — kept the AI collaborator architecturally coherent across the hundreds of sessions it took to get here.

What AI-assisted development does well at this scale: it removes the activation energy cost of implementation. Writing a new field type, implementing a new access policy, adding a new API endpoint — these are mechanical once the architecture is clear. The AI handles the mechanical work; the architectural decisions stay human.

What it doesn't do well: it has no memory of why a decision was made three months ago. The context has to be codified explicitly or it evaporates. That's the work the codified-context series covered this week — making architectural knowledge persistent across the session boundary.

Waaseyaa is open source and in active development. If you're building a content platform that needs content modeling depth, AI integration from the start, and a modern PHP foundation, the framework is worth watching.

Next: Publishing a PHP monorepo to Packagist with splitsh-lite.

Baamaapii
