---
categories:
    - ai
date: 2026-07-02T00:00:00Z
devto_id: 3506802
draft: false
slug: bimaaji-agent-safe-mutations
summary: Why AI agents modifying a Waaseyaa app need a DSL, an AST-safe patch generator, and sovereignty guardrails, instead of raw file edits.
tags:
    - waaseyaa
    - ai-agents
    - php
    - sovereignty
title: 'Bimaaji: agent-safe mutations for Waaseyaa'
---

Ahnii!

If you let an AI agent modify your application, the agent needs more than a text editor. Raw `str_replace` on a PHP file passes a lot of tests and still breaks things an hour later in production, because the tool has no idea what the file actually represents. Bimaaji is the [Waaseyaa](https://github.com/waaseyaa/framework) package that gives agents a structured path from "I want to add a field to this entity" to a reviewable patch that a community's sovereignty rules have already vetted. This post walks through what shipped in `waaseyaa/bimaaji` and why each piece exists.

> **Prerequisites:** familiarity with Waaseyaa's package layout, PHP 8.4+, and the idea that an application has more state than the filesystem (routes, entities, introspection metadata).

## Why not just let the agent edit files

The failure mode you want to avoid: an agent reads a prompt like "add a `published_at` field to the `Post` entity," does a reasonable-looking edit to `Post.php`, and leaves the rest of the app inconsistent. The migration is missing. The JSON:API resource doesn't expose the field. The admin panel still doesn't know it exists. The sovereignty profile that was supposed to block the change on a local-only deployment never got consulted.

Each of those is a different subsystem. A good agent can write a correct edit to any one of them. What a filesystem-level tool cannot do is ensure the edit is *coordinated* across all of them and is *allowed* under the community's posture.

Bimaaji separates that problem into three stages: introspect, propose, patch.

## The pipeline

The package description (from `packages/bimaaji/composer.json`) spells it out: *application graph introspection and agent-safe mutation for Waaseyaa.* The flow is:

```
Introspection → ApplicationGraph → MutationRequest → Validator → PatchGenerator → PatchSet
```

An agent reads the graph, submits a structured mutation request, a validator checks it against sovereignty rules, and the patch generator returns reviewable diffs. Nothing touches the filesystem until a human (or a higher-level workflow) accepts the `PatchSet`.

## Introspection: what the agent reads first

`src/Introspection/` holds a provider for every surface the agent might need context on:

- `AdminIntrospectionProvider` — what's exposed to the admin panel
- `EntityIntrospectionProvider` — entity definitions
- `JsonApiIntrospectionProvider` — public API shape
- `PublicSurfaceProvider` — what's reachable from outside
- `RoutingIntrospectionProvider` — route table
- `SovereigntyIntrospectionProvider` — the community's deployment posture and rules

Each one implements `GraphSectionProviderInterface` and contributes a `GraphSection` to the `ApplicationGraph`. The point is that the agent never reads source files to understand the app. It reads the graph. That is the canonical view.

This matters because it means an agent's understanding of your app is a data structure you control, not whatever the agent's context window happened to pick up from grep.

## The task DSL

`src/Dsl/` is the entry point for agents. `TaskParser` parses a structured task definition into `TaskDefinition` objects. `TaskPipeline` runs them, producing a `TaskPipelineResult`. The DSL describes *what* to change (add a field, add an entity type, add a route stub, add a test skeleton), not *how*.

That separation is the whole point. An agent says "add field `published_at: datetime` to entity `Post`." Bimaaji decides how that compiles into a PHP edit, a migration stub, an admin surface update, and a JSON:API resource change. The agent is not writing PHP. It's writing a task.

## Mutation: the reviewable proposal

`src/Mutation/` turns a parsed task into a `MutationRequest`, runs it through `MutationValidator`, and returns a `MutationResult`. The validator is where the sovereignty guardrails plug in.

`src/Policy/SovereigntyGuardrails.php` and `GuardrailRule` hold the rules. The model: a community declares a `SovereigntyProfile` (local, hybrid, cloud) on their Waaseyaa deployment. Certain mutations are allowed under certain profiles and not others. A local-only community might forbid any mutation that adds outbound network dependencies. A cloud-hosted community might allow them but require a specific audit annotation. The guardrails are declarative, matrixed per profile, and they *stop the mutation at the proposal stage*, not after the patch has already rewritten files.

This is where Waaseyaa's sovereignty story gets teeth. Community control over AI-driven changes is not a policy document. It's a validator in the mutation path.

## Patching: AST, not strings

`src/Patch/PatchGenerator.php` takes a validated `MutationRequest` and produces a `PatchSet` of `PatchEntry` objects. For PHP files, it uses [nikic/php-parser](https://github.com/nikic/PHP-Parser) via `PhpFileBuilder` to round-trip through an AST. That means the patch is syntactically valid by construction. You cannot generate a patch that breaks parsing because the patch itself is a parsed tree that gets printed back out.

For non-PHP files, the generator falls back to constrained operations with risk flags. Anything that can't be AST-verified is surfaced as unsafe and requires an explicit opt-in. That's the right default. Agents should fail loudly on anything they can't guarantee.

## The integration test

`tests/Integration/FullPipelineTest.php` runs the whole flow: introspect an app, submit a task through the DSL, validate against guardrails, generate a patch, assert the patch is well-formed. It's the check that all five subsystems (Graph, Dsl, Mutation, Policy, Patch) still agree on the contracts between them. When any one of them changes, that test catches the drift.

## Where this fits in the bigger picture

Bimaaji is the seam where Waaseyaa's AI tooling meets Waaseyaa's community governance. The whole Waaseyaa thesis is that the software communities run should answer to the community, not the other way around. Sovereignty profiles are the policy expression of that. Bimaaji is the enforcement point for anything an AI agent wants to do to the app.

The package is at [waaseyaa/framework packages/bimaaji](https://github.com/waaseyaa/framework/tree/main/packages/bimaaji). The README is still a scaffold note; the code has moved past that. If you want to read one thing, start with `tests/Integration/FullPipelineTest.php` — it's the shortest honest tour of what the pipeline does end to end.

Baamaapii
