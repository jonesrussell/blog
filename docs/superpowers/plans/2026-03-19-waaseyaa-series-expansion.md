# Waaseyaa Blog Series Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the 6-post Waaseyaa blog series to 10 posts covering the full ecosystem (framework, minoo, claudriel, waaseyaa.org) with continuous daily dates Mar 17–26.

**Architecture:** 4 new posts created as page bundles under `content/posts/ai/`. 2 existing posts redated and updated with new examples. 2 existing posts get minor edits. Series navigation links updated across all posts.

**Tech Stack:** Hugo, Markdown, PaperMod theme

**Spec:** `docs/superpowers/specs/2026-03-19-waaseyaa-series-expansion-design.md`

---

## Style Rules (apply to all tasks)

- Open with `Ahnii!`, close with `Baamaapii` (no emoji)
- Series context blockquote after greeting: `> **Series context:** This is part N of the [Waaseyaa series]...`
- Second person, direct voice. Short sentences. One idea per paragraph.
- Link first mentions of products/projects. Code blocks followed by 1-2 sentence explanation.
- Frontmatter: `series: ["waaseyaa"]`, `categories: [ai, php]`, `tags:` max 4, `draft: false`
- Page bundle format: `content/posts/ai/<slug>/index.md`

## Series Order Reference

| # | Date | Slug | series_order | Status |
|---|------|------|-------------|--------|
| 1 | Mar 17 | waaseyaa-intro | 1 | No change |
| 2 | Mar 18 | waaseyaa-entity-system | 4 → 2 | Update series_order, minor edit |
| 3 | Mar 19 | waaseyaa-access-control | 5 → 3 | Update series_order, context line |
| 4 | Mar 20 | waaseyaa-api-layer | 6 → 4 | Update series_order, context line, add GraphQL/Claudriel |
| 5 | Mar 21 | waaseyaa-dbal-migration | NEW (5) | **Create** |
| 6 | Mar 22 | waaseyaa-i18n | NEW (6) | **Create** |
| 7 | Mar 23 | waaseyaa-testing | NEW (7) | **Create** |
| 8 | Mar 24 | waaseyaa-deployment | NEW (8) | **Create** |
| 9 | Mar 25 | waaseyaa-ai-packages | 7 → 9 | Redate, update series_order, add Claudriel examples |
| 10 | Mar 26 | waaseyaa-packagist | 8 → 10 | Redate, update series_order, add series conclusion |

---

### Task 1: Update series_order and navigation on existing posts 2-4

**Files:**
- Modify: `content/posts/ai/waaseyaa-intro/index.md` (series description + "What This Series Covers" section)
- Modify: `content/posts/ai/waaseyaa-entity-system/index.md`
- Modify: `content/posts/ai/waaseyaa-access-control/index.md`
- Modify: `content/posts/ai/waaseyaa-api-layer/index.md`

- [ ] **Step 1: Update waaseyaa-intro series description**

Change "This is a six-part series" to "This is a ten-part series" in the intro paragraph. Update the "What This Series Covers" section to list all 10 posts:

```markdown
## What This Series Covers

Each post covers one subsystem, showing both the architecture and how AI-assisted development with structured context worked in practice.

**The entity system** — EntityInterface, ContentEntityBase, the field API. The heart of the framework and the foundation for everything else.

**Access control** — The deny-unless-granted model, AccessPolicyInterface, field-level access, and how Minoo implements indigenous-content filtering.

**The API layer** — JSON:API and GraphQL, ResourceSerializer, SchemaPresenter, and how the Nuxt 3 admin SPA consumes it.

**Replacing the database layer** — Migrating from a homegrown PdoDatabase to Doctrine DBAL across all applications.

**Internationalization** — Language negotiation, multilingual entities, and building i18n for an indigenous cultural platform.

**Testing at scale** — In-memory implementations, integration tests, and keeping 38 packages testable across hundreds of AI sessions.

**Deployment** — From scaffold to live site in 90 minutes: Deployer, Caddy, GitHub Actions across three applications.

**The AI integration packages** — ai-schema, ai-agent, ai-pipeline, ai-vector, and what they make possible. Plus an honest account of where the framework stands today versus where it's going.

**Publishing to Packagist** — How splitsh-lite turns a monorepo into individually installable Composer packages.
```

- [ ] **Step 2: Update waaseyaa-entity-system series_order and context**

Change `series_order: 4` to `series_order: 2`. Update series context line:

```markdown
> **Series context:** This is part 2 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Read [part 1]({{< relref "waaseyaa-intro" >}}) for an overview of the framework, its architecture, and the GitHub issue workflow used to build it.
```

(Already says this — just confirm series_order change.)

- [ ] **Step 3: Update waaseyaa-access-control series_order and context**

Change `series_order: 5` to `series_order: 3`. Update series context line:

```markdown
> **Series context:** This is part 3 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Catch up on [part 1]({{< relref "waaseyaa-intro" >}}) (overview) and [part 2]({{< relref "waaseyaa-entity-system" >}}) (entity system) before reading this.
```

- [ ] **Step 4: Update waaseyaa-api-layer series_order and context**

Change `series_order: 6` to `series_order: 4`. Update series context line:

```markdown
> **Series context:** This is part 4 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). This post builds on [the entity system]({{< relref "waaseyaa-entity-system" >}}) and [access control]({{< relref "waaseyaa-access-control" >}}) from earlier in the series.
```

Update the "Next" line at the bottom:

```markdown
Next: Replacing a homegrown database layer with DBAL.
```

- [ ] **Step 5: Add Claudriel GraphQL paragraph to waaseyaa-api-layer**

After the existing GraphQL section (line ~172), expand it to mention Claudriel's REST→GraphQL migration:

```markdown
## GraphQL

Since this post was drafted, Waaseyaa added a `graphql` package built on [webonyx/graphql-php](https://github.com/webonyx/graphql-php) v15. It auto-generates CRUD queries and mutations from your entity types — the same zero-config philosophy as the JSON:API layer. Filtering, sorting, pagination, and field-level access control carry over from the entity system.

[Claudriel](https://github.com/jonesrussell/claudriel), a personal operations system built on Waaseyaa, is actively migrating its REST endpoints to GraphQL. Entity types like Commitment, Person, Workspace, and ScheduleEntry now have auto-generated GraphQL schemas. The migration validates that the GraphQL layer handles real-world entity complexity — nested relationships, access-controlled fields, and mixed query patterns — not just the simple CRUD cases.
```

- [ ] **Step 6: Commit**

```bash
git add content/posts/ai/waaseyaa-intro/index.md content/posts/ai/waaseyaa-entity-system/index.md content/posts/ai/waaseyaa-access-control/index.md content/posts/ai/waaseyaa-api-layer/index.md
git commit -m "chore(blog): update waaseyaa series to 10 posts, fix series_order and navigation"
```

---

### Task 2: Create post 5 — DBAL Migration (Mar 21)

**Files:**
- Create: `content/posts/ai/waaseyaa-dbal-migration/index.md`

**Source material (from repo exploration):**
- waaseyaa: 413 commits in 2 weeks, PdoDatabase→DBALDatabase migration, kernel boot changes, SQL reserved-word quoting, integration tests
- minoo: upgraded to alpha.25, adopted migration system, migrated to DBALDatabase
- claudriel: uses DBAL abstraction with SQLite
- waaseyaa.org: full 30+ package stack including DBAL

- [ ] **Step 1: Create page bundle directory**

```bash
mkdir -p content/posts/ai/waaseyaa-dbal-migration
```

- [ ] **Step 2: Write the post**

Create `content/posts/ai/waaseyaa-dbal-migration/index.md` with:

**Frontmatter:**
```yaml
---
title: "Replacing a homegrown database layer with DBAL"
date: 2026-03-21
categories: [ai, php]
tags: [waaseyaa, php, claude-code, dbal]
series: ["waaseyaa"]
series_order: 5
series_group: "Main"
summary: "How waaseyaa migrated from a homegrown PdoDatabase to Doctrine DBAL across 413 commits — and how all three applications upgraded without breaking."
slug: "waaseyaa-dbal-migration"
draft: false
---
```

**Content outline (write full prose, ~1200-1500 words):**

1. **Ahnii! + Series context** (part 5, builds on entity system and API layer)

2. **Why replace a working database layer** — PdoDatabase worked for v0.1.0 but had limitations: no query builder abstraction, manual SQL string building, no schema introspection, no migration tooling. DBAL provides all of these as battle-tested Symfony ecosystem components.

3. **What DBAL gives you** — Brief intro to [Doctrine DBAL](https://www.doctrine-project.org/projects/dbal.html). Query builder (`DBALSelect`), schema manager, connection abstraction, migration support. Not an ORM — waaseyaa uses its own entity system, not Doctrine ORM.

4. **The migration scope** — 413 commits across 2 weeks. Every `PdoDatabase` call site replaced. Kernel boot changed to initialize `DBALDatabase`. SQL reserved-word quoting added to all `DBALSelect` builders (table names, aliases). Integration tests rewritten against real DBAL connections.

5. **Kernel boot changes** — Show how the kernel now initializes DBAL:
   - Before: `new PdoDatabase($dsn)` in kernel
   - After: DBAL `DriverManager::getConnection()` integrated into kernel boot sequence
   - The connection is available to all services via DI

6. **SQL hardening** — Reserved word quoting. Show a before/after of a query that broke on `status` or `order` columns. The fix: quote all table names and aliases in `DBALSelect` builders. This wasn't a DBAL-specific problem but DBAL's query builder made it systematically fixable.

7. **The migration protocol** — File-based migration discovery, transaction wrapping, status tracking. `bin/waaseyaa make:migration` creates timestamped migration files. `bin/waaseyaa migrate` runs pending migrations. Show minoo adopting this: `a6f58c6 — Adopt migration system for schema management`.

8. **Three apps upgrading** — Minoo upgraded to alpha.25 with DBALDatabase. Claudriel already used DBAL abstraction. waaseyaa.org launched with the new stack from day one. The migration was invisible to application code because the entity storage interface didn't change — `SqlEntityStorage` switched its internals from PdoDatabase to DBALDatabase.

9. **How AI handled 413 commits** — The codified context made this tractable. Each session loaded the relevant spec, understood the migration pattern, and applied it to a subset of packages. The migration was mechanical but vast — exactly the kind of work AI handles well when the pattern is clear and the scope is defined per-issue.

10. **Next:** i18n for a cultural platform.

11. **Baamaapii**

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-dbal-migration/
git commit -m "post: Replacing a homegrown database layer with DBAL (waaseyaa series #5)"
```

---

### Task 3: Create post 6 — i18n (Mar 22)

**Files:**
- Create: `content/posts/ai/waaseyaa-i18n/index.md`

**Source material:**
- waaseyaa: i18n package, `setCurrentLanguage` on LanguageManagerInterface, language negotiation activated
- minoo: indigenous languages (Ojibwe/Anishinaabemowin), live at minoo.live/oj/, multi-language entity support, LanguageAccessPolicy covering 4 language entity types

- [ ] **Step 1: Create page bundle directory**

```bash
mkdir -p content/posts/ai/waaseyaa-i18n
```

- [ ] **Step 2: Write the post**

Create `content/posts/ai/waaseyaa-i18n/index.md` with:

**Frontmatter:**
```yaml
---
title: "i18n for a cultural platform"
date: 2026-03-22
categories: [ai, php]
tags: [waaseyaa, php, i18n, minoo]
series: ["waaseyaa"]
series_order: 6
series_group: "Main"
summary: "How waaseyaa's i18n package handles language negotiation and multilingual entities — built for an indigenous cultural platform where language isn't a feature, it's the point."
slug: "waaseyaa-i18n"
draft: false
---
```

**Content outline (~1200-1500 words):**

1. **Ahnii! + Series context** (part 6)

2. **Why i18n matters differently here** — Most frameworks treat i18n as "translate your UI strings." Minoo's requirement is different: the content itself is multilingual. A teaching exists in Ojibwe and English. The language isn't a UI preference — it's a property of the knowledge. This shapes how the i18n package works.

3. **LanguageManagerInterface** — The core contract. `setCurrentLanguage()`, `getCurrentLanguage()`, `getDefaultLanguage()`, `getLanguages()`. Language negotiation determines the current language from the request (URL prefix, Accept-Language header, user preference).

4. **Language negotiation** — How waaseyaa resolves the current language. URL-based negotiation (`/oj/teachings/` → Ojibwe). Show how minoo.live/oj/ works: the router strips the language prefix, sets the current language, and the rest of the request pipeline operates in that language context.

5. **Multilingual entities** — `EntityInterface::language()` returns the entity's language. Entities are stored per-language. A teaching in Ojibwe and a teaching in English are related but distinct entity instances. The entity storage layer handles language-aware queries.

6. **LanguageAccessPolicy** — Minoo's `LanguageAccessPolicy` covers 4 entity types (dictionary entries, example sentences, word parts, speakers). Access to language-specific content can be restricted by community. This connects back to the deny-unless-granted model from post 3.

7. **The ai-vector language connection** — The `VectorStoreInterface::search()` method accepts `langcode` and `fallbackLangcodes` parameters. Semantic search respects language boundaries: searching in Ojibwe returns Ojibwe-language results first, with English fallback if configured. This is framework-level multilingual search, not a filter applied after the fact.

8. **Building i18n with AI sessions** — Language negotiation activation was a recent milestone. The i18n package needed to be correct before it was wired in — getting language resolution wrong corrupts every downstream query. The spec-backed approach meant each session had the full language resolution contract and couldn't accidentally bypass negotiation.

9. **Next:** Testing 38 packages without losing your mind.

10. **Baamaapii**

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-i18n/
git commit -m "post: i18n for a cultural platform (waaseyaa series #6)"
```

---

### Task 4: Create post 7 — Testing (Mar 23)

**Files:**
- Create: `content/posts/ai/waaseyaa-testing/index.md`

**Source material:**
- waaseyaa: InMemoryEntityStorage, in-memory implementations for every subsystem, EntityFactory in waaseyaa/testing
- claudriel: 195 PHP test files, PHPUnit + Pest, integration tests with real SQLite
- minoo: Playwright tests with data guards, framework upgrade regression testing

- [ ] **Step 1: Create page bundle directory**

```bash
mkdir -p content/posts/ai/waaseyaa-testing
```

- [ ] **Step 2: Write the post**

Create `content/posts/ai/waaseyaa-testing/index.md` with:

**Frontmatter:**
```yaml
---
title: "Testing 38 packages without losing your mind"
date: 2026-03-23
categories: [ai, php]
tags: [waaseyaa, php, testing, claude-code]
series: ["waaseyaa"]
series_order: 7
series_group: "Main"
summary: "How in-memory implementations, a layered test strategy, and AI-assisted test generation keep a 38-package PHP monorepo testable."
slug: "waaseyaa-testing"
draft: false
---
```

**Content outline (~1200-1500 words):**

1. **Ahnii! + Series context** (part 7)

2. **The testing problem at scale** — 38 packages, 7 layers, 3 consuming applications. If every test needs a database, a running server, and a full DI container, the test suite takes minutes and breaks constantly. The framework's answer: in-memory implementations for every subsystem.

3. **In-memory implementations** — `InMemoryEntityStorage` implements the same `EntityStorageInterface` as `SqlEntityStorage`. Tests that need entity CRUD use the in-memory version — no database, no SQLite file, no setup/teardown. Show the pattern:

```php
$storage = new InMemoryEntityStorage($entityType);
$storage->create(['name' => 'Test Teaching', 'status' => 1]);
$entity = $storage->load(1);
```

Every subsystem follows this pattern: in-memory cache, in-memory queue, in-memory config. Unit tests are fast and isolated. Integration tests use real implementations (SQLite) when they need to verify actual storage behavior.

4. **EntityFactory** — Already covered in post 2, but show how it integrates with the test strategy. `EntityFactory::define()` + `EntityFactory::create()` for consistent test data. `createMany()` for collection tests. `sequence()` for unique values.

5. **The three test levels** — Unit (in-memory, per-package), Integration (real SQLite, cross-package), E2E (Playwright for minoo). Each level catches different problems. Unit tests catch logic errors. Integration tests catch storage/query bugs (like the SQL reserved word issue from post 5). E2E tests catch rendering and navigation issues.

6. **Claudriel's 195 test files** — A real application's test strategy. PHPUnit for unit tests, Pest for assertions, integration tests with real SQLite. Show how entity types like Commitment and Workspace have test coverage for CRUD, access control, and pipeline behavior.

7. **Minoo's Playwright tests** — Data guards that check for content before asserting. `c78632c — Data guards for Playwright community tests`. The tests adapt to the current database state rather than requiring fixtures — practical for a content platform where the data is real, not seeded.

8. **AI and test generation** — AI writes tests well when the pattern is clear. The in-memory implementations and EntityFactory give AI sessions a repeatable pattern: create storage, create entities, assert behavior. The testing skill carries the patterns so each session generates consistent tests. Where AI struggles: writing meaningful Playwright selectors for dynamic content (hence the data guards).

9. **Next:** From scaffold to live site in 90 minutes.

10. **Baamaapii**

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-testing/
git commit -m "post: Testing 38 packages without losing your mind (waaseyaa series #7)"
```

---

### Task 5: Create post 8 — Deployment (Mar 24)

**Files:**
- Create: `content/posts/ai/waaseyaa-deployment/index.md`

**Source material:**
- waaseyaa.org: 8 commits on Mar 17, 90 min from scaffold to live site, Deployer artifact-based deployment, Caddy, GitHub Actions, deployment post-mortem
- minoo: Deployer deployment, GitHub Actions CI/CD, systemd services
- claudriel: Docker + Caddy + GitHub Actions, deploy config split (staging/prod)

- [ ] **Step 1: Create page bundle directory**

```bash
mkdir -p content/posts/ai/waaseyaa-deployment
```

- [ ] **Step 2: Write the post**

Create `content/posts/ai/waaseyaa-deployment/index.md` with:

**Frontmatter:**
```yaml
---
title: "From scaffold to live site in 90 minutes"
date: 2026-03-24
categories: [ai, php]
tags: [waaseyaa, deployment, caddy, deployer]
series: ["waaseyaa"]
series_order: 8
series_group: "Main"
summary: "How waaseyaa.org went from first commit to production in 90 minutes — and the deployment patterns shared across three Waaseyaa applications."
slug: "waaseyaa-deployment"
draft: false
---
```

**Content outline (~1200-1500 words):**

1. **Ahnii! + Series context** (part 8)

2. **The 90-minute launch** — waaseyaa.org went from `composer init` to live in production on March 17, 2026. 8 commits. The site runs on the same framework it markets — dogfooding by necessity. This post covers what made that possible and the deployment patterns behind all three Waaseyaa applications.

3. **Dogfooding the framework** — waaseyaa.org is a 4-page marketing site running the full 32-package Waaseyaa stack. SiteServiceProvider registers routes, PageController renders Twig templates. No CMS features needed — it's a static-ish site using the framework's routing and templating. This validates that the framework boots cleanly and serves content without requiring entity storage or access control.

4. **The Deployer pattern** — All three apps use [Deployer](https://deployer.org/) for artifact-based deployment. The workflow: GitHub Actions builds the artifact (composer install, npm build), rsyncs it to the server, Deployer manages releases with symlinks. 5-release retention. Shared `storage/` and `.env` across releases.

Show the `deploy.php` structure:

```php
host('production')
    ->set('deploy_path', '/home/deployer/waaseyaa.org/releases/')
    ->set('shared_dirs', ['storage'])
    ->set('shared_files', ['.env']);
```

5. **Caddy as the web server** — All three apps use [Caddy](https://caddyserver.com/) with automatic TLS. Show a representative Caddyfile block. The post-mortem lesson: the waaseyaa.org deploy initially assumed Nginx — the server actually runs Caddy. A small assumption that cost 20 minutes of debugging.

6. **GitHub Actions CI/CD** — The workflow: checkout both the app repo and the waaseyaa framework repo (since waaseyaa.org uses a path repository during build), composer install, rsync the build artifact, trigger Deployer. Show the key workflow steps.

7. **Deployment post-mortem** — Five lessons from the waaseyaa.org launch:
   - Server assumption (Nginx vs Caddy)
   - Log directory permissions (Caddy systemd vs deployer-owned logs)
   - Framework weight (marketing site needs full 30+ package stack)
   - Missing env vars (WAASEYAA_DB for PHP-FPM)
   - Caddyfile validation (pre-existing syntax errors in other project configs blocked reload)

8. **Three apps, one pattern** — Minoo, Claudriel, and waaseyaa.org share the Deployer + Caddy + GitHub Actions pattern. The differences: Claudriel splits deploy config for staging/prod. Minoo has more complex shared directories (SQLite database, uploaded media). waaseyaa.org is the simplest — no database, no user uploads.

9. **Next:** AI-native PHP: the Waaseyaa AI packages.

10. **Baamaapii**

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-deployment/
git commit -m "post: From scaffold to live site in 90 minutes (waaseyaa series #8)"
```

---

### Task 6: Redate and update posts 9 and 10

**Files:**
- Modify: `content/posts/ai/waaseyaa-ai-packages/index.md`
- Modify: `content/posts/ai/waaseyaa-packagist/index.md`

- [ ] **Step 1: Redate and update waaseyaa-ai-packages**

Change `date: 2026-03-21` to `date: 2026-03-25`. Change `series_order: 7` to `series_order: 9`.

Update series context line:

```markdown
> **Series context:** This is part 9 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). The series covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), [DBAL migration]({{< relref "waaseyaa-dbal-migration" >}}), [i18n]({{< relref "waaseyaa-i18n" >}}), [testing]({{< relref "waaseyaa-testing" >}}), and [deployment]({{< relref "waaseyaa-deployment" >}}).
```

Add Claudriel ai-pipeline example after the ai-pipeline section (~line 69). Insert a paragraph:

```markdown
[Claudriel](https://github.com/jonesrussell/claudriel) uses ai-pipeline for its commitment extraction workflow. Gmail messages flow through a `GmailMessageNormalizer`, then a `CommitmentExtractionStep` that uses the Anthropic API to identify commitments — deadlines, promises, follow-ups — with a confidence threshold of 0.7. Candidates below the threshold are silently skipped. The pipeline produces `Commitment` entities that feed the daily brief. This is ai-pipeline in production: composable steps, each with a clear input/output contract, orchestrated by the framework.
```

- [ ] **Step 2: Redate and update waaseyaa-packagist**

Change `date: 2026-03-22` to `date: 2026-03-26`. Change `series_order: 8` to `series_order: 10`.

Update series context line:

```markdown
> **Series context:** This is part 10 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Previous posts covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), [DBAL migration]({{< relref "waaseyaa-dbal-migration" >}}), [i18n]({{< relref "waaseyaa-i18n" >}}), [testing]({{< relref "waaseyaa-testing" >}}), [deployment]({{< relref "waaseyaa-deployment" >}}), and the [AI packages]({{< relref "waaseyaa-ai-packages" >}}).
```

Replace the closing paragraph ("That wraps the Waaseyaa series...") with an expanded series conclusion:

```markdown
## The Full Picture

This series started with a question: what would a PHP CMS framework look like if you designed it today, with AI as a first-class development tool?

Ten posts later, the answer: 38 packages across seven layers, three production applications, a database migration that touched every package, i18n designed for indigenous languages, a test strategy built on in-memory implementations, deployment infrastructure that launches a site in 90 minutes, and AI integration packages that make entity schemas machine-readable.

Waaseyaa started as one person's attempt to keep Drupal's best ideas while shedding its legacy. It grew into a framework powering [Minoo](https://minoo.live) (an indigenous cultural platform), [Claudriel](https://github.com/jonesrussell/claudriel) (an AI personal operations system), and [waaseyaa.org](https://waaseyaa.org) (its own marketing site). Building something this large solo was only possible because of a workflow that combined GitHub issues for scope, codified context for architectural consistency, and AI for the mechanical work of implementation.

The framework is open source and in active development. If you're building a content platform that needs Drupal's content modeling depth, Laravel's developer experience, and AI integration from the ground up, [waaseyaa](https://github.com/waaseyaa/framework) is worth watching.

If you're just finding this series, start from the beginning: [Waaseyaa: building a Drupal-inspired PHP CMS with AI]({{< relref "waaseyaa-intro" >}}).
```

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-ai-packages/index.md content/posts/ai/waaseyaa-packagist/index.md
git commit -m "chore(blog): redate and expand waaseyaa series posts 9-10"
```

---

### Task 7: Update intro post series description

**Files:**
- Modify: `content/posts/ai/waaseyaa-intro/index.md`

- [ ] **Step 1: Update series description and "What This Series Covers"**

As described in Task 1, Step 1. The intro post needs to reflect 10 posts, not 6.

- [ ] **Step 2: Verify all series navigation links**

Run `task build` and check for broken relref links. All 10 posts should build without warnings.

- [ ] **Step 3: Commit**

```bash
git add content/posts/ai/waaseyaa-intro/index.md
git commit -m "chore(blog): update waaseyaa intro to reflect 10-post series"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full build**

```bash
task build
```

Expected: Clean build with no warnings. All 10 posts should appear (posts dated through Mar 22 visible today, future posts hidden until their dates).

- [ ] **Step 2: Run dev server and verify**

```bash
task serve
```

Check:
- Posts 1-5 visible (Mar 17-21, today is Mar 19 but serve includes future with drafts)
- Series navigation works between all posts
- No broken links or missing images

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(blog): resolve build issues in waaseyaa series expansion"
```
