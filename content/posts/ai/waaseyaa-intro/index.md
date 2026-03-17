---
title: "Waaseyaa: building a Drupal-inspired PHP CMS with AI"
date: 2026-03-17
categories: [ai, php]
tags: [waaseyaa, claude-code, php, open-source]
series: ["waaseyaa"]
series_order: 1
series_group: "Main"
summary: "What waaseyaa is, why it exists, and how planning with GitHub issues before coding changes the dynamic of building complex software with AI."
slug: "waaseyaa-intro"
draft: false
---

Ahnii!

> **Prerequisites:** PHP 8.4+, [Composer](https://getcomposer.org/), and familiarity with [Drupal](https://www.drupal.org/), [Laravel](https://laravel.com/), or [Symfony](https://symfony.com/) concepts.

[Waaseyaa](https://github.com/waaseyaa/framework) is an Anishinaabe word meaning "it is bright" or "there is light." It's also a PHP CMS framework that takes the best ideas from both [Drupal](https://www.drupal.org/) and [Laravel](https://laravel.com/) — forked from Drupal 11's core and stripped of its technical debt, then shaped by Laravel 12's developer experience without carrying its baggage either. The result is a 43-package monorepo built on PHP 8.4+, [Symfony](https://symfony.com/) 7.x, with a [Nuxt 3](https://nuxt.com/) admin SPA. The first application built on it is [Minoo](https://github.com/waaseyaa/minoo), an Indigenous knowledge platform.

This week is a five-part series covering the framework's architecture and the AI-assisted workflow used to build it. Each post covers one part of the system and shows how [GitHub issues, milestones, and codified context]({{< relref "codified-context-the-problem" >}}) made it possible to build something this complex working solo.

## Why Build Another CMS Framework?

Drupal and Laravel are both genuinely good software. Drupal's entity system, field API, and access control model have been refined over decades of production use. Laravel's developer experience — elegant routing, service providers, Eloquent — set the standard for modern PHP. But both carry technical debt. Deploying Drupal means accepting its module system, theme layer, and database abstraction. Laravel's magic comes with hidden complexity and conventions that fight you when your domain doesn't fit the mold.

Waaseyaa started as a fork of Drupal 11's core, stripped down to the architectural patterns worth preserving — the entity/field model, deny-unless-granted access control, content type abstraction. Then it borrowed from Laravel's playbook — clean service providers, expressive routing, a focus on developer ergonomics. The foundation is Symfony 7 components: PHP 8.4 attributes instead of annotations, Symfony's DI container, JSON:API and GraphQL for the API layer, and a Nuxt 3 SPA for the admin interface.

The result is a framework with Drupal's content modeling power, Laravel's developer experience, and neither framework's legacy constraints.

## The Architecture

Waaseyaa is organized into seven layers with explicit dependency rules. Each layer can import from its own layer or lower, never from higher layers.

```text
Layer 0: core, types, contracts
Layer 1: field, storage
Layer 2: entity
Layer 3: access, taxonomy
Layer 4: node, routing
Layer 5: api, serialization
Layer 6: application (Minoo)
```

43 packages across these seven layers, each in its own directory under `packages/`. The packages that map directly to Drupal concepts: entity, field, node, taxonomy, access, vocabulary, content-type. The packages that don't exist in Drupal: ai-schema, ai-agent, ai-pipeline, ai-vector.

The AI integration packages exist because the whole point of building a new framework is the ability to design for current constraints, not 2008 ones.

## Planning With GitHub Issues

The framework exists because of a workflow, not despite it. Building 43 packages solo would be overwhelming without a system for knowing what to work on next and what "done" means for each piece.

GitHub milestones serve as the roadmap. Each milestone is a named architectural phase with a clear scope — not "add features to entity system" but "entity system: field collection API, field type registry, ContentEntityBase." Milestones are completed before the next one opens. Work doesn't drift.

Within each milestone, issues are the unit of work. An issue is opened before code is written, not after. It states the scope, the acceptance criteria, and which packages are in scope. When the issue is closed, the work is done — not "probably done" or "done except for the edge cases."

This workflow changes the AI collaboration dynamic in a specific way: when a Claude Code session opens, the first thing it reads is the issue. The issue scopes the session. The session doesn't drift into adjacent features because the acceptance criteria define what "done" means. The codified context — the framework's CLAUDE.md, domain skills, and specs — provides the architectural knowledge. The issue provides the task scope.

The combination is more effective than either alone. Good context without a scoped task produces exploratory sessions that don't complete. A scoped task without good context produces code that's correct for the issue but wrong for the architecture.

## The Minoo Application

[Minoo](https://github.com/waaseyaa/minoo) is Anishinaabe for "it is good." It's the first application built on the framework and the reason the framework exists — a platform for managing and sharing Indigenous knowledge: teachings, ceremonies, languages, community events. Minoo is live at [minoo.live](https://minoo.live), with full Ojibwe (Anishinaabemowin) translation at [minoo.live/oj/](https://minoo.live/oj/).

Minoo has 18 entity types across 6 domains, including a community registry (637 First Nations communities), an elder support program, and consent/copyright governance. It demonstrates that the framework's abstractions generalize: entity types with custom fields, access policies that restrict content by language community, a search interface powered by the [north-cloud]({{< relref "codified-context-the-problem" >}}) API with indigenous-only filtering enforced server-side.

It also demonstrates the "thin application" pattern: a Minoo `CLAUDE.md` that's 186 lines versus the framework's 196, six domain skills for application-level patterns, and five specs covering the application-specific subsystems. Critically, Minoo's MCP wiring includes both local `minoo_*` tools and upstream `waaseyaa_*` tools — sessions touching framework-level code retrieve framework specs, sessions touching application-level code retrieve Minoo specs. The framework carries the complexity; the application stays thin, and its codified context routes correctly across both layers.

## What This Series Covers

Each post covers one subsystem, showing both the architecture and how AI-assisted development with structured context worked in practice.

**The entity system** — EntityInterface, ContentEntityBase, the field API. The heart of the framework and the foundation for everything else.

**Access control** — The deny-unless-granted model, AccessPolicyInterface, field-level access, and how Minoo implements indigenous-content filtering.

**The API layer** — JSON:API and GraphQL, ResourceSerializer, SchemaPresenter, and how the Nuxt 3 admin SPA consumes it.

**The AI integration packages** — ai-schema, ai-agent, ai-pipeline, ai-vector, and what they make possible. Plus an honest account of where the framework stands today versus where it's going.

Next up: [Three skills for governing multi-repo co-development with Claude Code]({{< relref "co-development-skill-set" >}}).

Baamaapii
