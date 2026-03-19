# Waaseyaa Blog Series Expansion

## Overview

Expand the 6-post Waaseyaa series to 10 posts (Mar 17–26), weaving in real application examples from minoo, claudriel, and waaseyaa.org alongside framework architecture and engineering stories.

## Audience & Approach

Dual audience: PHP developers evaluating Waaseyaa + AI-assisted development community. Each post covers both "what Waaseyaa does" and "how AI helped build it" — continuing the pattern established in post 1.

## Series Outline

### Post 1 — Mar 17 (PUBLISHED, no changes)
**Waaseyaa: building a Drupal-inspired PHP CMS with AI**
Intro, 7-layer architecture, GitHub issues + codified context.

### Post 2 — Mar 18 (existing, minor updates)
**The entity system at the heart of Waaseyaa**
EntityInterface, ContentEntityBase, field system. Add minoo's 17 entity types as proof of real-world scale.

### Post 3 — Mar 19 (existing, no changes needed)
**Deny-unless-granted: access control in Waaseyaa**
AccessPolicyInterface, field-level access. Already uses minoo's TeachingAccessPolicy as example.

### Post 4 — Mar 20 (existing, add claudriel examples)
**JSON:API from framework to SPA: waaseyaa's API layer**
ResourceSerializer, SchemaPresenter. Expand GraphQL section with claudriel's migration from REST → GraphQL (auto-generated from entity types). Reference the Nuxt 3 admin SPA consuming the API.

### Post 5 — Mar 21 (NEW)
**Replacing a homegrown database layer with DBAL**
The migration from PdoDatabase to DBALDatabase — why it happened, how 413 commits in 2 weeks reshaped the foundation. SQL reserved-word hardening, kernel boot changes, integration test strategy. Show all 3 apps upgrading (minoo alpha.25, claudriel, waaseyaa.org).

### Post 6 — Mar 22 (NEW)
**i18n for a cultural platform**
Language negotiation, setCurrentLanguage on LanguageManagerInterface, multilingual entity support. Minoo as the driving use case — indigenous languages requiring proper i18n at the framework level, not bolted on. How the i18n package serves both minoo (cultural content) and claudriel (future localization).

### Post 7 — Mar 23 (NEW)
**Testing 38 packages without losing your mind**
In-memory implementations for every subsystem (InMemoryEntityStorage, etc.), integration tests with real SQLite, how the layered architecture makes testing tractable. Claudriel's 195 test files, minoo's Playwright tests with data guards. The testing skill that keeps AI-written tests consistent.

### Post 8 — Mar 24 (NEW)
**From scaffold to live site in 90 minutes**
waaseyaa.org launch story — dogfooding the framework for its own marketing site. Deployer artifact-based deployment, Caddy configuration, GitHub Actions CI/CD. Deployment post-mortem lessons (Nginx→Caddy assumption, log permissions, missing env vars). Contrast with minoo and claudriel deployment patterns.

### Post 9 — Mar 25 (existing, move from Mar 21, add claudriel examples)
**AI-native PHP: the Waaseyaa AI packages**
ai-schema, ai-agent, ai-pipeline, ai-vector. Expand with claudriel's CommitmentExtractionStep as a real ai-pipeline consumer. Show how ai-agent is constrained by access control (connecting back to post 3).

### Post 10 — Mar 26 (existing, move from Mar 22, add series conclusion)
**Publishing a PHP monorepo to Packagist with splitsh-lite**
splitsh-lite workflow, GitHub Actions splitting 43 packages. Add a brief series wrap-up: what started as a Drupal-inspired experiment became a production framework powering 3 applications — and how AI co-development made it possible.

## Changes Required

| Post | Action | Key changes |
|------|--------|-------------|
| 1 | None | Published |
| 2 | Minor edit | Add minoo entity count reference |
| 3 | None | Already solid |
| 4 | Edit | Expand GraphQL section with claudriel |
| 5 | **Create** | DBAL migration post |
| 6 | **Create** | i18n post |
| 7 | **Create** | Testing post |
| 8 | **Create** | Deployment/dogfooding post |
| 9 | Edit + redate | Mar 21 → Mar 25, add claudriel examples |
| 10 | Edit + redate | Mar 22 → Mar 26, add series conclusion |

## Series Navigation

Each post links to the next via "What's Next" section. Post 10 links back to post 1, completing the loop.
