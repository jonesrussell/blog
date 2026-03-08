# Waaseyaa Blog Series — Design Doc

**Date:** 2026-03-07
**Cadence:** 1 post/day, Mon-Fri (Week 2)
**Directory:** `content/posts/ai/`
**Tag:** `waaseyaa`

---

## Series Overview

Angle: Framework architecture AND AI-driven workflow, interleaved.
Each post shows a piece of the waaseyaa framework through the process of building it with AI —
GitHub issues, milestones, Claude Code. The framework is the story; the AI workflow is the lens.

Audience: Developers using AI agents to ship, with a PHP/Symfony slant.

---

## Known Material

- 29-package PHP monorepo, Drupal-inspired (entity, field, node, taxonomy, access, api...)
- PHP 8.3+, Symfony 7.x, Nuxt 3 admin SPA
- Minoo: Indigenous knowledge platform built on the framework (13 entity types, 5 domains)
- Full GitHub issues + milestones workflow for planning/tracking
- AI integration packages: ai-schema, ai-agent, ai-pipeline, ai-vector
- 8 domain specialist skills, 30 framework specs + 4 minoo specs
- Design doc: `docs/plans/2026-03-02-codified-context-design.md` in waaseyaa repo

---

## Posts

### Post 1 — What Is Waaseyaa? (Monday)

**Title:** Waaseyaa: building a Drupal-inspired PHP CMS with AI
**Slug:** `waaseyaa-intro`
**Summary:** What waaseyaa is, why it exists, and how planning with GitHub issues changes the AI collaboration dynamic.
**Angle:** Introduce the framework and the project. What it is (Drupal-inspired PHP CMS monorepo), why it exists, the 7-layer architecture. Show the GitHub milestones as the roadmap. How planning in issues before coding changes the AI collaboration dynamic.
**Key material:** Root CLAUDE.md architecture overview, GitHub milestones, composer.json package list.

### Post 2 — The Entity System (Tuesday)

**Title:** The entity system at the heart of waaseyaa
**Slug:** `waaseyaa-entity-system`
**Summary:** How waaseyaa's EntityInterface, ContentEntityBase, and field system work — and how the entity-system skill made cross-session development possible.
**Angle:** Walk through EntityInterface, ContentEntityBase, the field system. Show a real entity from minoo (e.g. Event or Teaching). Weave in: how the `waaseyaa:entity-system` skill made it possible to work on this subsystem across sessions without losing thread.
**Dependency:** GitHub issues content from waaseyaa/framework (retrieve before writing).

### Post 3 — Access Control (Wednesday)

**Title:** Deny-unless-granted: access control in waaseyaa
**Slug:** `waaseyaa-access-control`
**Summary:** How waaseyaa's AccessPolicyInterface implements deny-unless-granted semantics with field-level access control.
**Angle:** The deny-unless-granted vs. allow-unless-denied semantics. AccessPolicyInterface, field-level access. Show minoo's access policies. Weave in: the GitHub issue that scoped this work and how milestones kept it from scope-creeping.
**Dependency:** GitHub issues content from waaseyaa/framework (retrieve before writing).

### Post 4 — The API Layer (Thursday)

**Title:** JSON:API from framework to SPA: waaseyaa's API layer
**Slug:** `waaseyaa-api-layer`
**Summary:** How waaseyaa's JSON:API layer serves a Nuxt 3 admin SPA, with ResourceSerializer and SchemaPresenter.
**Angle:** JSON:API CRUD, ResourceSerializer, SchemaPresenter. How the admin SPA (Nuxt 3) consumes it. Show a real endpoint from minoo. Weave in: how Tier 3 specs let a new session pick up mid-feature without re-explaining the whole contract.
**Dependency:** GitHub issues content from waaseyaa/minoo (retrieve before writing).

### Post 5 — AI Packages and What's Next (Friday)

**Title:** AI-native PHP: the waaseyaa AI packages
**Slug:** `waaseyaa-ai-packages`
**Summary:** What ai-schema, ai-agent, ai-pipeline, and ai-vector enable in a PHP framework built from the ground up for AI.
**Angle:** The ai-schema, ai-agent, ai-pipeline, ai-vector packages — what they are and what they enable. Honest state: what's done, what's in the milestones ahead. Close with a reflection on building a complex open-source framework solo with AI assistance.

---

## Dependencies Before Writing

Posts 2-5 benefit from GitHub issues/milestones from:
- `waaseyaa/framework` GitHub repo
- `waaseyaa/minoo` GitHub repo

Retrieve with GitHub MCP tools or gh CLI before writing posts 2-5.
