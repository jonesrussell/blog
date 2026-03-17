# Waaseyaa Series — Social Media Posts

Publishing daily 2026-03-17 through 2026-03-24.

---

## Post 1: Waaseyaa Intro (Mar 17)

**X:**
Introducing Waaseyaa — a Drupal-inspired PHP CMS framework built with AI. 43 packages, 7 architectural layers, modern PHP 8.4+. The first app: Minoo, an Indigenous knowledge platform. https://jonesrussell.github.io/blog/waaseyaa-intro/

**Facebook:**
I'm kicking off a series about Waaseyaa, a PHP CMS framework I've been building with AI assistance. It takes Drupal's best ideas — the entity/field model, deny-unless-granted access control — and rebuilds them on PHP 8.4+ and Symfony 7. The first app built on it is Minoo, an Indigenous knowledge platform live at minoo.live. https://jonesrussell.github.io/blog/waaseyaa-intro/

**LinkedIn:**
Today I'm launching a blog series about Waaseyaa ("it is bright" in Anishinaabe) — a 43-package PHP CMS framework I've been building with Claude Code. It extracts Drupal's proven content modeling patterns and rebuilds them on PHP 8.4+, Symfony 7, with a Nuxt 3 admin SPA. The first application is Minoo, an Indigenous knowledge platform at minoo.live. This series covers the architecture, the AI-assisted workflow, and what it takes to build something this complex solo. https://jonesrussell.github.io/blog/waaseyaa-intro/ #PHP #OpenSource #AI #WebDev #Drupal #Symfony

---

## Post 2: Co-Development Skill Set (Mar 18)

**X:**
How do you keep a framework and two apps architecturally consistent when AI has no cross-repo awareness? Three Claude Code skills that enforce patterns, audit divergence, and extract shared code. https://jonesrussell.github.io/blog/co-development-skill-set/

**Facebook:**
When you're developing a framework and two applications together with AI, the AI in one repo has zero awareness of the other two. I built a three-skill system to fix that: one governs daily development, one audits pattern divergence, and one extracts shared code back into the framework. The develop-measure-extract cycle keeps everything consistent. https://jonesrussell.github.io/blog/co-development-skill-set/

**LinkedIn:**
Multi-repo AI development has a hidden problem: context isolation. Claude Code working in one repo doesn't know what exists in another, so you get duplicate implementations and diverging patterns. I built a three-skill governance system for the Waaseyaa ecosystem — app development guardrails, cross-project auditing with compliance scoring, and automated framework extraction. The skills live in the repos they govern and trigger automatically when relevant code paths are touched. Documentation works when someone reads it. Skills work because they're active. https://jonesrussell.github.io/blog/co-development-skill-set/ #PHP #AI #OpenSource #WebDev

---

## Post 3: Claudriel Temporal Layer (Mar 19)

**X:**
AI systems that reason about your schedule can't tolerate sloppy time handling. Here's how Claudriel pins time per request, resolves timezones from context, and detects clock drift before agents act. https://jonesrussell.github.io/blog/claudriel-temporal-layer/

**Facebook:**
If your AI assistant says "your meeting starts in 3 minutes" but the system clock has drifted, that's a problem. I built a temporal layer for Claudriel that captures time once per request, resolves timezones from context, and monitors clock health before letting AI agents reason about your schedule. Seven classes, zero external dependencies. https://jonesrussell.github.io/blog/claudriel-temporal-layer/

**LinkedIn:**
Most applications treat time as a free function call. AI systems that reason about schedules, detect drifting commitments, and send proactive nudges need better than that. I built a temporal subsystem for Claudriel (an AI personal ops system on the Waaseyaa framework) that pins time atomically per request, resolves timezones through a priority chain, and includes a ClockHealthMonitor that flags when the system clock has drifted too far for temporal reasoning to be safe. The entire subsystem is injectable and testable — no global state, no mocking frameworks. https://jonesrussell.github.io/blog/claudriel-temporal-layer/ #PHP #AI #OpenSource #WebDev

---

## Post 4: Entity System (Mar 20)

**X:**
Drupal's entity/field model is its greatest contribution to PHP. Waaseyaa inherits it, rewritten for PHP 8.4+ with modern types and Symfony DI. Here's how EntityInterface, ContentEntityBase, and the field system work. https://jonesrussell.github.io/blog/waaseyaa-entity-system/

**Facebook:**
The entity system is the heart of Waaseyaa. It takes Drupal's idea that content types are configurations of typed fields and rebuilds it with PHP 8.4 type declarations and Symfony's DI container. A Teaching entity in Minoo is just a class with six field definitions — the framework handles storage, serialization, and API endpoints. https://jonesrussell.github.io/blog/waaseyaa-entity-system/

**LinkedIn:**
Drupal's greatest contribution to PHP isn't its UI or module ecosystem — it's the entity/field model. The idea that content types are configurations of typed fields is what makes Drupal flexible enough to model almost any content domain. Waaseyaa inherits this model, rewritten for PHP 8.4+ with strongly typed EntityId value objects, a FieldCollection API, and an EntityFactory that handles type resolution and ID generation. The specialist skill that carries these contracts is what made cross-session development possible without losing architectural coherence. https://jonesrussell.github.io/blog/waaseyaa-entity-system/ #PHP #OpenSource #Drupal #Symfony #WebDev

---

## Post 5: Access Control (Mar 21)

**X:**
Allow-unless-denied: a gap in your policies is a hole. Deny-unless-granted: a gap is safe. Waaseyaa chose the safe default. Here's how it works, including Minoo's Indigenous content filtering. https://jonesrussell.github.io/blog/waaseyaa-access-control/

**Facebook:**
Access control is where frameworks make their most consequential design decisions. Waaseyaa uses deny-unless-granted — if no policy explicitly grants access, it's denied. In Minoo, this means restricted Indigenous teachings are protected by default, with field-level access control for community-only content. A gap in your policies is safe, not a security hole. https://jonesrussell.github.io/blog/waaseyaa-access-control/

**LinkedIn:**
The choice between allow-unless-denied and deny-unless-granted determines what happens when your access policy has a gap. Waaseyaa chose deny-unless-granted: no explicit grant means no access. This is especially important for Minoo, the Indigenous knowledge platform built on the framework. Restricted teachings are protected by default with field-level access control — an entity can be publicly browsable while specific fields require community membership. The architecture is safe-by-default, and search filtering is enforced server-side so it can't be bypassed. https://jonesrussell.github.io/blog/waaseyaa-access-control/ #PHP #OpenSource #AI #WebDev #Drupal

---

## Post 6: API Layer (Mar 22)

**X:**
JSON:API compliance means your Nuxt 3 SPA gets filtering, pagination, and relationship loading for free. Here's how Waaseyaa's ResourceSerializer and SchemaPresenter make thin applications possible. https://jonesrussell.github.io/blog/waaseyaa-api-layer/

**Facebook:**
Waaseyaa's API layer implements JSON:API natively, which means the Nuxt 3 admin SPA gets filtering, pagination, relationship loading, and dynamic form generation without custom code per entity type. Add a new entity type to Minoo and it appears in the admin interface automatically. Plus it now has GraphQL too. https://jonesrussell.github.io/blog/waaseyaa-api-layer/

**LinkedIn:**
The API layer is where Waaseyaa's entity system meets the outside world. ResourceSerializer converts entities to JSON:API documents. SchemaPresenter describes entity types for dynamic form generation. The Nuxt 3 admin SPA uses a standard JSON:API client library and gets filtering, pagination, and relationship loading for free from the framework's spec compliance. Adding a new entity type to Minoo means defining the class, registering it, and adding routes — the framework provides everything else. Recently added: a GraphQL package built on webonyx/graphql-php that auto-generates CRUD operations from entity types. https://jonesrussell.github.io/blog/waaseyaa-api-layer/ #PHP #OpenSource #WebDev #Symfony

---

## Post 7: AI Packages (Mar 23)

**X:**
A CMS designed in 2026 should handle AI workflows natively. Waaseyaa ships four AI packages: schema, agent, pipeline, and vector search. Here's what they enable and where they stand today. https://jonesrussell.github.io/blog/waaseyaa-ai-packages/

**Facebook:**
If you're building a CMS framework in 2026, you design for AI workflows from the start. Waaseyaa ships four AI packages: ai-schema for machine-readable entity descriptions, ai-agent for actions within the system, ai-pipeline for content transformation, and ai-vector for semantic search with pgvector. Agents operate through the same access control as human users — no bypassing the deny-unless-granted model. https://jonesrussell.github.io/blog/waaseyaa-ai-packages/

**LinkedIn:**
Drupal was designed when content meant text. Waaseyaa's four AI packages address what's different in 2026: ai-schema makes entity structures machine-readable for LLM reasoning, ai-agent defines contracts for AI agents that operate through the same access control as human users, ai-pipeline handles content transformation at ingestion, and ai-vector provides semantic search via pgvector. The key design decision: AI agents can't bypass the deny-unless-granted model. In Minoo, an agent summarizing Indigenous teachings is as constrained as the most restricted human user with the same permissions. This post also includes an honest accounting of what's built versus what's planned. https://jonesrussell.github.io/blog/waaseyaa-ai-packages/ #PHP #AI #OpenSource #WebDev

---

## Post 8: Publishing to Packagist (Mar 24)

**X:**
How do you publish a 43-package PHP monorepo to Packagist? splitsh-lite + GitHub Actions. Tag a release, wait two minutes, 43 packages appear. Development workflow stays unchanged. https://jonesrussell.github.io/blog/waaseyaa-packagist/

**Facebook:**
A framework that can't be installed isn't a framework — it's a demo. This post covers how Waaseyaa went from a monorepo with 43 path-repository subpackages to individually installable Composer packages on Packagist using splitsh-lite. Tag a release, GitHub Actions splits all 43 packages in parallel, and they appear on Packagist in about two minutes. The monorepo stays the single source of truth. https://jonesrussell.github.io/blog/waaseyaa-packagist/

**LinkedIn:**
The final post in the Waaseyaa series tackles a practical problem: how do you publish a 43-package PHP monorepo to Packagist? The answer is splitsh-lite automated with GitHub Actions. Each tag push triggers parallel splits of all 43 packages into individual mirror repos, tagged with matching versions. Consumers can install the full framework or cherry-pick packages. The development workflow doesn't change at all — the split is purely a release concern. This wraps a series covering the entity system, access control, API layer, AI packages, and the co-development workflow that made building it solo possible. https://jonesrussell.github.io/blog/waaseyaa-packagist/ #PHP #OpenSource #Packagist #WebDev #Symfony
