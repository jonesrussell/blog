# PSR Series Redesign — Make It Beginner-Complete

**Date:** 2026-02-13
**Status:** Approved

## Goal

Transform the PHP-FIG PSR blog series into a comprehensive, beginner-friendly guide for junior PHP developers, covering all 14 accepted PSRs with a cohesive companion repository.

## Audience

Junior PHP developers who know PHP basics (OOP, Composer) but haven't worked with PSR standards or understood the patterns underlying frameworks.

## Approach: Polish & Complete

Raise all existing posts to the quality bar set by the strongest posts (PSR-1, 3, 4), finish 3 draft posts, write 3 new posts (PSR-17, 18, 20), and evolve the companion repo into a blog API mini-app.

---

## Post Template Standard

Every PSR post follows this structure (~200-300 lines):

1. **Ahnii greeting** + 1-2 sentence hook connecting to previous PSR
2. **Prerequisites line** — one-liner: "Prerequisites: Basic PHP OOP, Composer, PSR-4 autoloading. Recommended: Read PSR-7 first."
3. **"What Problem Does PSR-X Solve?"** (~3-5 min) — relatable analogy, then technical explanation
4. **"Core Concepts"** — interface definitions with inline commentary
5. **"Real-World Implementation"** (~10 min) — working example tied to companion repo blog API
6. **"Common Mistakes and Fixes"** — 2-3 bad vs good code comparisons
7. **"Framework Integration"** — Laravel and Symfony examples
8. **"Try It Yourself"** — companion repo file paths and commands
9. **"What's Next"** — link to next PSR in recommended reading order
10. **Baamaapii closing**

### Frontmatter Standard

```yaml
---
title: "PSR-X: Title"
date: 2025-XX-XX
categories: [php, standards]
tags: [php, php-fig, psr-X, topic]  # max 4
series: ["php-fig-standards"]
summary: "..."
slug: "psr-X-slug"
draft: false
---
```

---

## Companion Repository: Blog API Mini-App

Repository: `jonesrussell/php-fig-guide`

### Concept

A simple blog API that naturally uses every PSR, giving juniors a real project to clone, run, and explore.

### PSR-to-Feature Mapping

| PSR | Role in Blog API |
|-----|-----------------|
| PSR-1 | Coding standard for entire project |
| PSR-3 | Application logging (file + console) |
| PSR-4 | Autoloading (Composer PSR-4 mapping) |
| PSR-6 | Advanced caching (tagged cache for categories) |
| PSR-7 | HTTP request/response objects |
| PSR-11 | DI container for wiring services |
| PSR-12 | Coding style (enforced via phpcs) |
| PSR-13 | Hypermedia links in API responses (pagination, related posts) |
| PSR-14 | Event dispatcher (post.created, post.updated events) |
| PSR-15 | Middleware stack (auth, logging, CORS) |
| PSR-16 | Simple cache (session/config caching) |
| PSR-17 | HTTP factory for creating request/response objects |
| PSR-18 | HTTP client for fetching external data (RSS feeds) |
| PSR-20 | Clock interface for testable time (published_at, TTL) |

### Repository Structure

```
php-fig-guide/
├── src/
│   ├── Cache/          # PSR-6, PSR-16
│   ├── Container/      # PSR-11
│   ├── Event/          # PSR-14
│   ├── Http/           # PSR-7, PSR-15, PSR-17, PSR-18
│   ├── Link/           # PSR-13
│   ├── Log/            # PSR-3
│   ├── Clock/          # PSR-20
│   └── Blog/           # Domain: Post, Category models
├── tests/              # PHPUnit tests per PSR
├── public/index.php    # Entry point
├── config/             # Container definitions, routes
└── README.md           # Setup guide + PSR map
```

---

## Post-by-Post Action Plan

### Published Posts — Raise to Template

**PSR-1** (strong) — Minor: add prerequisites line only.

**PSR-3** (strong) — Minor: add prerequisites line only.

**PSR-4** (strong) — Minor: add prerequisites line only.

**PSR-6** (adequate) — Moderate: add greetings if missing, expand "Common Mistakes" section, add framework integration, link to companion repo cache example.

**PSR-7** (adequate) — Moderate: add greetings, expand immutability explanation for beginners, add framework examples, connect to companion repo HTTP layer.

**PSR-11** (brief) — Significant: add greetings, expand DI explanation with analogy, add "Common Mistakes" section, framework examples, companion repo reference.

**PSR-12** (adequate) — Moderate: add greetings, fix "yourusername" placeholder to "jonesrussell", add companion repo reference.

**PSR-13** (adequate) — Moderate: fix date (currently April 2), add more practical context for when hypermedia links are useful.

### Draft Posts — Complete to Full Standard

**PSR-14** — Major: fix date (2024→2025), expand from ~92 to ~250 lines. Event analogy, working dispatcher implementation, Laravel/Symfony event comparison, companion repo events.

**PSR-15** — Major: fix date (2024→2025), expand from ~101 to ~250 lines. Middleware chain explanation, auth/logging/CORS middleware, framework comparison, companion repo middleware stack.

**PSR-16** — Major: fix date (2024→2025), expand from ~82 to ~250 lines. PSR-6 vs PSR-16 decision guide, file cache implementation, framework cache facades, companion repo simple cache.

### New Posts

**PSR-17: HTTP Factories** — Why factories matter (testability, decoupling). Creating requests/responses without coupling to Guzzle/Laminas. Pairs with PSR-7.

**PSR-18: HTTP Client** — Standardized HTTP calls. Blog API fetching RSS feeds. Compare to direct Guzzle usage. Pairs with PSR-17.

**PSR-20: Clock** — Testable time handling. Blog API uses Clock for published_at and cache TTL. Compare to `new \DateTime()`.

### Index Post

- Fix all "Coming" entries with actual published dates and links
- Add PSR-17, 18, 20 entries
- Add recommended reading order (themed groupings) alongside numerical reference
- Update companion repo description to mention blog API

---

## Series Reading Order

### Recommended Path (themed)

**Foundation:**
1. PSR-1: Basic Coding Standard
2. PSR-12: Extended Coding Style
3. PSR-4: Autoloading

**Core Infrastructure:**
4. PSR-3: Logger Interface
5. PSR-11: Container Interface
6. PSR-14: Event Dispatcher

**HTTP Stack (sequential):**
7. PSR-7: HTTP Messages
8. PSR-17: HTTP Factories
9. PSR-15: HTTP Handlers & Middleware
10. PSR-18: HTTP Client

**Data & Caching:**
11. PSR-6: Caching Interface
12. PSR-16: Simple Cache

**Specialized:**
13. PSR-13: Hypermedia Links
14. PSR-20: Clock

### Numerical Reference

Also available in the index post for readers who want to look up a specific PSR by number.

---

## Consistency Fixes (all posts)

- All dates use 2025-XX-XX format (fix 2024 typos)
- All posts have Ahnii greeting and Baamaapii closing
- All posts reference companion repo with specific file paths
- All posts have "What's Next" linking to next post in reading order
- No placeholder text (fix "yourusername" etc.)
- All frontmatter follows the standard template
