# PSR Series Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the PSR blog series into a complete, beginner-friendly guide covering all 14 accepted PSRs with consistent quality and a cohesive companion repository.

**Architecture:** Six phases — quick consistency fixes first, then companion repo restructure, then improve existing posts, complete drafts, write new posts, and finally update the index. The companion repo must be restructured before posts can reference its new blog API structure.

**Tech Stack:** Hugo blog (Markdown), PHP 8.1+ companion repo (Composer, PHPUnit, PSR interfaces)

---

## Phase 1: Quick Consistency Fixes Across All Published Posts

These are mechanical edits that can be done in parallel across all existing posts.

### Task 1: Add prerequisites line to strong posts (PSR-1, PSR-3, PSR-4)

**Files:**
- Modify: `content/posts/psr-1-basic-coding-standard.md:15` (after "Ahnii!")
- Modify: `content/posts/psr-3-logger-interface.md` (after greeting)
- Modify: `content/posts/psr-4-autoloading-standard.md` (after greeting)

**Step 1: Add prerequisites to PSR-1**

After the "Ahnii!" line (line 15) and before the first paragraph, insert:

```markdown
> **Prerequisites:** Basic PHP syntax, a code editor. No prior PSR knowledge needed — this is where we start!
```

**Step 2: Add prerequisites to PSR-3**

After the greeting, insert:

```markdown
> **Prerequisites:** Basic PHP OOP (classes, interfaces). **Recommended:** Read [PSR-1](/psr-1-basic-coding-standard/) first.
```

**Step 3: Add prerequisites to PSR-4**

After the greeting, insert:

```markdown
> **Prerequisites:** Basic PHP OOP, Composer installed. **Recommended:** Read [PSR-1](/psr-1-basic-coding-standard/) first.
```

**Step 4: Verify with dev server**

Run: `task serve`
Check all three posts render correctly with the prerequisites line.

**Step 5: Commit**

```bash
git add content/posts/psr-1-basic-coding-standard.md content/posts/psr-3-logger-interface.md content/posts/psr-4-autoloading-standard.md
git commit -m "feat(psr-series): add prerequisites line to PSR-1, 3, 4 posts"
```

---

### Task 2: Fix Ahnii greeting on PSR-7

**Files:**
- Modify: `content/posts/psr-7-http-message-interfaces.md:11`

**Step 1: Add Ahnii greeting and prerequisites**

Replace line 11 (current opening paragraph) with:

```markdown
Ahnii!

> **Prerequisites:** PHP OOP, Composer. **Recommended:** Read [PSR-4](/psr-4-autoloading-standard/) first. **Pairs with:** PSR-15 (middleware) and PSR-17 (factories).

Ever wondered how frameworks like Laravel and Slim handle HTTP requests behind the scenes? PSR-7 defines common interfaces for representing HTTP messages in PHP. These interfaces enable framework-agnostic HTTP message handling, making it easier to create interoperable HTTP clients, servers, and middleware.
```

**Step 2: Commit**

```bash
git add content/posts/psr-7-http-message-interfaces.md
git commit -m "feat(psr-series): add Ahnii greeting and prerequisites to PSR-7"
```

---

### Task 3: Fix Ahnii greeting on PSR-11

**Files:**
- Modify: `content/posts/psr-11-container-interface.md:11`

**Step 1: Add Ahnii greeting and prerequisites**

Replace line 11 (current opening paragraph) with:

```markdown
Ahnii!

> **Prerequisites:** PHP OOP (classes, interfaces, constructors). **Recommended:** Read [PSR-4](/psr-4-autoloading-standard/) and [PSR-3](/psr-3-logger-interface/) first.

Ever created an object that needs five other objects to work, and each of those needs three more? That's the dependency puzzle. PSR-11 defines a common interface for dependency injection containers in PHP — the tool that solves this puzzle automatically.
```

**Step 2: Commit**

```bash
git add content/posts/psr-11-container-interface.md
git commit -m "feat(psr-series): add Ahnii greeting and prerequisites to PSR-11"
```

---

### Task 4: Fix PSR-12 — add greeting and fix placeholder

**Files:**
- Modify: `content/posts/psr-12-extended-coding-style-guide.md:11` (opening)
- Modify: `content/posts/psr-12-extended-coding-style-guide.md:155` (yourusername)

**Step 1: Add Ahnii greeting and prerequisites**

Replace line 11 (current opening paragraph) with:

```markdown
Ahnii!

> **Prerequisites:** Read [PSR-1](/psr-1-basic-coding-standard/) first — PSR-12 extends it.

Remember PSR-1's "house rules" for PHP code? PSR-12 is like the detailed home manual. It extends PSR-1 and replaces the deprecated PSR-2 to provide a comprehensive coding style guide for modern PHP.
```

**Step 2: Fix placeholder URL**

Replace `yourusername` with `jonesrussell` on line 155:

```markdown
Check out our [example repository](https://github.com/jonesrussell/php-fig-guide/tree/psr-12) for the implementation of these standards.
```

**Step 3: Commit**

```bash
git add content/posts/psr-12-extended-coding-style-guide.md
git commit -m "fix(psr-series): add greeting and fix repo placeholder in PSR-12"
```

---

### Task 5: Fix PSR-13 date and add prerequisites

**Files:**
- Modify: `content/posts/psr-13-hypermedia-links.md:3` (date)
- Modify: `content/posts/psr-13-hypermedia-links.md:11` (after greeting)

**Step 1: Fix the date**

Change line 3 from `date: 2025-04-02` to `date: 2025-02-24` (fits after PSR-12's Feb 16 date).

**Step 2: Add prerequisites line**

After the "Ahnii!" on line 11, before the rest of the paragraph, insert:

```markdown
> **Prerequisites:** PHP OOP, REST API basics. **Recommended:** Read [PSR-7](/psr-7-http-message-interfaces/) first.
```

**Step 3: Commit**

```bash
git add content/posts/psr-13-hypermedia-links.md
git commit -m "fix(psr-series): fix date and add prerequisites to PSR-13"
```

---

### Task 6: Fix dates on draft posts (PSR-14, 15, 16)

**Files:**
- Modify: `content/posts/psr-14-event-dispatcher.md:3`
- Modify: `content/posts/psr-15-http-handlers.md:3`
- Modify: `content/posts/psr-16-simple-cache.md:3`

**Step 1: Fix PSR-14 date**

Change `date: 2024-02-17` to `date: 2025-02-17`

**Step 2: Fix PSR-15 date**

Change `date: 2024-03-02` to `date: 2025-03-02`

**Step 3: Fix PSR-16 date**

Change `date: 2024-03-16` to `date: 2025-03-16`

**Step 4: Commit**

```bash
git add content/posts/psr-14-event-dispatcher.md content/posts/psr-15-http-handlers.md content/posts/psr-16-simple-cache.md
git commit -m "fix(psr-series): correct 2024 dates to 2025 on draft posts"
```

---

### Task 7: Add prerequisites to PSR-6

**Files:**
- Modify: `content/posts/psr-6-caching-interface.md:15` (after series reference)

**Step 1: Add prerequisites**

After line 15 (the series reference paragraph), insert:

```markdown
> **Prerequisites:** PHP OOP (classes, interfaces). **Recommended:** Read [PSR-4](/psr-4-autoloading-standard/) first. **See also:** [PSR-16](/psr-16-simple-cache/) for simpler caching needs.
```

**Step 2: Commit**

```bash
git add content/posts/psr-6-caching-interface.md
git commit -m "feat(psr-series): add prerequisites to PSR-6"
```

---

## Phase 2: Expand Weaker Published Posts

These posts need new sections added to match the template standard.

### Task 8: Expand PSR-6 — add framework integration and improve common mistakes

**Files:**
- Modify: `content/posts/psr-6-caching-interface.md`

**Step 1: Add Framework Integration section**

Before the "What's Next?" section (line 118), insert a new section:

```markdown
## Framework Integration

### Laravel

Laravel's cache system supports PSR-6 through the `psr/cache` bridge:

```php
<?php

use Illuminate\Support\Facades\Cache;

// Laravel's cache store implements PSR-6 behind the scenes
$pool = app('cache.psr6');
$item = $pool->getItem('user.1');

if (!$item->isHit()) {
    $item->set($user);
    $item->expiresAfter(3600);
    $pool->save($item);
}
```

### Symfony

Symfony's Cache component is a native PSR-6 implementation:

```php
<?php

use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new FilesystemAdapter();
$item = $cache->getItem('user.1');

if (!$item->isHit()) {
    $item->set($user);
    $item->expiresAfter(3600);
    $cache->save($item);
}
```
```

**Step 2: Expand Common Pitfalls with a third example**

After the existing error handling pitfall (line 116), add:

```markdown
3. **Cache Stampede**

   ```php
   // Bad - All requests hit the database at once when cache expires
   $item = $pool->getItem('popular-posts');
   if (!$item->isHit()) {
       $data = $database->getPopularPosts(); // Everyone runs this simultaneously
       $item->set($data)->expiresAfter(60);
       $pool->save($item);
   }

   // Good - Use deferred saves and staggered TTLs
   $item = $pool->getItem('popular-posts');
   if (!$item->isHit()) {
       $data = $database->getPopularPosts();
       $jitter = random_int(0, 30);
       $item->set($data)->expiresAfter(60 + $jitter);
       $pool->save($item);
   }
   ```
```

**Step 3: Add "Try It Yourself" section**

Before Resources, add:

```markdown
## Try It Yourself

Clone the companion repository and explore the caching examples:

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR6
```

See `src/Cache/` for the PSR-6 implementation used in the blog API.
```

**Step 4: Verify with dev server**

Run: `task serve`
Check PSR-6 post renders correctly with new sections.

**Step 5: Commit**

```bash
git add content/posts/psr-6-caching-interface.md
git commit -m "feat(psr-series): expand PSR-6 with framework integration and cache stampede example"
```

---

### Task 9: Expand PSR-7 — beginner immutability explanation and framework examples

**Files:**
- Modify: `content/posts/psr-7-http-message-interfaces.md`

**Step 1: Add "What Problem Does PSR-7 Solve?" section**

After the prerequisites (added in Task 2), before "Core Interfaces", insert:

```markdown
## What Problem Does PSR-7 Solve? (3 minutes)

Imagine every restaurant in town used different-shaped plates. Chefs couldn't share recipes because "put it on the plate" meant something different everywhere. PSR-7 gives PHP a standard "plate" for HTTP messages — every framework and library agrees on what a request and response look like.

Before PSR-7, switching from Guzzle to Buzz or from Laravel to Slim meant learning entirely new objects for the same HTTP concepts. PSR-7 lets you write code that works with any compliant library.

### Why Immutability?

PSR-7 messages are **immutable** — you can't change them after creation. Instead, methods like `withHeader()` return a *new* object with the change applied. Think of it like editing a Google Doc with "suggestion mode" on: the original stays intact, and each change creates a new version.

This matters because HTTP messages often pass through multiple middleware layers. If one middleware could modify the request object directly, another middleware downstream might get unexpected data. Immutability prevents these bugs.
```

**Step 2: Add Framework Integration section**

Before "Next Steps", insert:

```markdown
## Framework Integration

### Laravel

Laravel uses PSR-7 under the hood via Symfony's HttpFoundation. You can access PSR-7 objects directly:

```php
<?php

use Psr\Http\Message\ServerRequestInterface;

// In a controller — Laravel auto-injects the PSR-7 request
public function store(ServerRequestInterface $request)
{
    $body = $request->getParsedBody();
    // $body contains the form data
}
```

### Slim Framework

Slim is built entirely on PSR-7:

```php
<?php

$app->get('/posts/{id}', function ($request, $response, $args) {
    $data = ['id' => $args['id'], 'title' => 'My Post'];
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});
```

### Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR7
```

See `src/Http/` for the PSR-7 implementation in the blog API.
```

**Step 3: Verify and commit**

```bash
task serve  # verify rendering
git add content/posts/psr-7-http-message-interfaces.md
git commit -m "feat(psr-series): expand PSR-7 with immutability explanation and framework examples"
```

---

### Task 10: Expand PSR-11 — analogy, common mistakes, framework examples

**Files:**
- Modify: `content/posts/psr-11-container-interface.md`

**Step 1: Add "What Problem Does PSR-11 Solve?" section**

After the prerequisites (added in Task 3), before "Understanding Dependency Injection Containers", insert:

```markdown
## What Problem Does PSR-11 Solve? (3 minutes)

Imagine building a car by hand: you need an engine, which needs a fuel system, which needs a fuel pump, which needs... it goes on forever. A dependency injection container is like a car factory — you tell it the blueprint, and it builds everything in the right order.

Without a standard container interface, libraries that need to look up services (like a router finding controllers) must be written for a specific container. PSR-11 lets any library work with any container — PHP-DI, Symfony's container, Laravel's container, or your own simple one.
```

**Step 2: Add Common Mistakes section**

After the Best Practices section, before "Next Steps", insert:

```markdown
## Common Mistakes and Fixes

### 1. Using the Container as a Service Locator

```php
// Bad — passing the container everywhere defeats the purpose of DI
class OrderService
{
    public function __construct(private ContainerInterface $container) {}

    public function process(int $orderId): void
    {
        $db = $this->container->get('database');
        $logger = $this->container->get('logger');
        // Now OrderService depends on EVERYTHING
    }
}

// Good — inject only what you need
class OrderService
{
    public function __construct(
        private DatabaseConnection $db,
        private LoggerInterface $logger
    ) {}

    public function process(int $orderId): void
    {
        // Dependencies are clear from the constructor
    }
}
```

### 2. Forgetting to Handle Missing Services

```php
// Bad — crashes with an unhelpful error
$service = $container->get('nonexistent.service');

// Good — check first, or catch the exception
if ($container->has('optional.service')) {
    $service = $container->get('optional.service');
}
```
```

**Step 3: Add Framework Integration section**

Before "Next Steps", insert:

```markdown
## Framework Integration

### Laravel

Laravel's service container is PSR-11 compliant. You usually don't call it directly — Laravel auto-injects dependencies:

```php
<?php

// Laravel resolves LoggerInterface automatically from the container
class PostController extends Controller
{
    public function __construct(
        private LoggerInterface $logger,
        private PostRepository $posts
    ) {}
}
```

### Symfony

Symfony's DependencyInjection component is PSR-11 compliant:

```php
<?php

// services.yaml — Symfony wires dependencies from configuration
services:
    App\Service\PostService:
        arguments:
            $logger: '@Psr\Log\LoggerInterface'
            $cache: '@Psr\SimpleCache\CacheInterface'
```

### Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR11
```

See `src/Container/` for the blog API's container implementation.
```

**Step 4: Verify and commit**

```bash
task serve
git add content/posts/psr-11-container-interface.md
git commit -m "feat(psr-series): expand PSR-11 with analogy, common mistakes, and framework examples"
```

---

### Task 11: Expand PSR-12 — add "Why PSR-12 Matters" and "Try It Yourself"

**Files:**
- Modify: `content/posts/psr-12-extended-coding-style-guide.md`

**Step 1: Add a motivating intro after greeting**

After the greeting and prerequisites (added in Task 4), before "Key Style Rules", insert:

```markdown
## Why PSR-12 Matters (2 minutes)

You might think coding style is superficial. But imagine reading a book where every chapter uses different indentation, different quote marks, and different paragraph spacing. It's exhausting. PSR-12 eliminates these distractions so you can focus on what the code *does* rather than how it looks.

PSR-12 replaces PSR-2 (now deprecated) and works alongside PSR-1. If PSR-1 covers the "what" (naming, file structure), PSR-12 covers the "how" (formatting, spacing, braces).
```

**Step 2: Add "Try It Yourself" before Resources**

```markdown
## Try It Yourself

Clone the companion repository — the entire project follows PSR-12:

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install

# Check if code follows PSR-12
composer check-style

# Auto-fix style violations
composer fix-style
```

See `phpcs.xml` for the PSR-12 configuration used across the project.
```

**Step 3: Verify and commit**

```bash
task serve
git add content/posts/psr-12-extended-coding-style-guide.md
git commit -m "feat(psr-series): expand PSR-12 with motivation section and Try It Yourself"
```

---

### Task 12: Expand PSR-13 — add practical context and "Try It Yourself"

**Files:**
- Modify: `content/posts/psr-13-hypermedia-links.md`

**Step 1: Add "What Problem Does PSR-13 Solve?" section**

After prerequisites (added in Task 5), before the existing paragraph, insert:

```markdown
## What Problem Does PSR-13 Solve? (3 minutes)

Have you ever used a website where you had to manually construct URLs to navigate? Neither have your API consumers — they shouldn't have to either. PSR-13 lets your API tell clients "here's where to go next," like how a website has navigation links.

This is the heart of HATEOAS (Hypermedia as the Engine of Application State) — a REST principle where API responses include links to related actions and resources. Instead of hardcoding `/api/users/123/posts` in your frontend, the API response itself says "here's the link to this user's posts."

### When Would You Actually Use This?

- **Pagination:** Include `next`, `prev`, `first`, `last` links in list responses
- **Related resources:** A blog post response includes links to its author, comments, and category
- **Available actions:** A draft post includes a `publish` link; a published post includes `unpublish`
```

**Step 2: Add "Try It Yourself" and framework integration before Resources**

```markdown
## Framework Integration

### Symfony

Symfony's WebLink component implements PSR-13 for HTTP/2 server push and preloading:

```php
<?php

use Symfony\Component\WebLink\Link;

// Add a preload link for a CSS file
$link = (new Link('preload', '/styles/app.css'))
    ->withAttribute('as', 'style');
```

### Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR13
```

See `src/Link/` for how the blog API adds hypermedia links to post responses.
```

**Step 3: Verify and commit**

```bash
task serve
git add content/posts/psr-13-hypermedia-links.md
git commit -m "feat(psr-series): expand PSR-13 with practical context and framework example"
```

---

## Phase 3: Complete Draft Posts

Each draft post needs to be expanded from ~80-100 lines to ~200-250 lines matching the full template.

### Task 13: Complete PSR-14 (Event Dispatcher)

**Files:**
- Modify: `content/posts/psr-14-event-dispatcher.md` (rewrite most of the file)

**Step 1: Rewrite PSR-14 to full template standard**

Replace the entire file content (keeping frontmatter) with the full post. The post must include:

**Frontmatter fixes:**
- `date: 2025-02-17` (already fixed in Task 6)
- `draft: false`

**Required sections (in order):**
1. Ahnii greeting
2. Prerequisites: `PHP OOP (classes, interfaces). Recommended: Read PSR-11 first.`
3. "What Problem Does PSR-14 Solve?" — Use radio station analogy: events are broadcasts, listeners are tuned-in radios. Without a standard, every framework invents its own event system. PSR-14 standardizes the pattern.
4. "Core Concepts" — Event objects (data carriers, plain PHP objects), Listeners (callables), Stoppable events. Show the two interfaces: `EventDispatcherInterface` and `ListenerProviderInterface` with inline comments.
5. "Real-World Implementation" — Build a working `SimpleEventDispatcher` and `SimpleListenerProvider`. Create blog events: `PostCreatedEvent`, `PostPublishedEvent`. Create listeners: `SendNotificationListener`, `UpdateSearchIndexListener`. Show the full wiring.
6. "Common Mistakes and Fixes" — (a) Fat events that do too much logic (events should be data carriers), (b) Listener ordering assumptions (don't rely on listener execution order), (c) Not using stoppable events when needed.
7. "Framework Integration" — Laravel events (`Event::dispatch(new PostCreated($post))`), Symfony EventDispatcher component.
8. "Try It Yourself" — Companion repo reference: `src/Event/`, test command.
9. "What's Next" — Link to PSR-7 (next in reading order: HTTP Stack).
10. Baamaapii closing.

**Target length:** ~220-250 lines.

**Step 2: Verify with dev server**

Run: `task serve` (with `--buildDrafts` flag removed since draft is now false)
Check post renders correctly.

**Step 3: Commit**

```bash
git add content/posts/psr-14-event-dispatcher.md
git commit -m "feat(psr-series): complete PSR-14 event dispatcher post to full standard"
```

---

### Task 14: Complete PSR-15 (HTTP Handlers & Middleware)

**Files:**
- Modify: `content/posts/psr-15-http-handlers.md` (rewrite most of the file)

**Step 1: Rewrite PSR-15 to full template standard**

**Frontmatter fixes:**
- `date: 2025-03-02` (already fixed in Task 6)
- `draft: false`

**Required sections (in order):**
1. Ahnii greeting
2. Prerequisites: `PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) first — PSR-15 builds directly on it. Recommended: Read PSR-17 for factories.`
3. "What Problem Does PSR-15 Solve?" — Airport security analogy: your request goes through multiple checkpoints (middleware) before reaching the gate (handler). Each checkpoint can inspect, modify, or reject the request. Without a standard, every framework's middleware is incompatible.
4. "Core Interfaces" — `RequestHandlerInterface` and `MiddlewareInterface` with clear inline comments. Explain the `$handler->handle($request)` delegation pattern.
5. "Real-World Implementation" — Build a middleware pipeline for the blog API:
   - `LoggingMiddleware` — logs every request using PSR-3
   - `AuthMiddleware` — checks for API token
   - `CorsMiddleware` — adds CORS headers
   - `BlogPostHandler` — the actual request handler
   - Show how they chain together: Logging → Auth → CORS → Handler
6. "Common Mistakes and Fixes" — (a) Forgetting to call `$handler->handle()` (breaks the chain), (b) Modifying the request instead of using `withAttribute()`, (c) Doing too much in a single middleware (split responsibilities).
7. "Framework Integration" — Laravel middleware (`php artisan make:middleware`), Slim middleware stack, Mezzio (Laminas) pipeline.
8. "Try It Yourself" — Companion repo: `src/Http/Middleware/`, test command.
9. "What's Next" — Link to PSR-18 (HTTP Client).
10. Baamaapii closing.

**Target length:** ~240-260 lines.

**Step 2: Verify and commit**

```bash
task serve
git add content/posts/psr-15-http-handlers.md
git commit -m "feat(psr-series): complete PSR-15 HTTP handlers post to full standard"
```

---

### Task 15: Complete PSR-16 (Simple Cache)

**Files:**
- Modify: `content/posts/psr-16-simple-cache.md` (rewrite most of the file)

**Step 1: Rewrite PSR-16 to full template standard**

**Frontmatter fixes:**
- `date: 2025-03-16` (already fixed in Task 6)
- `draft: false`

**Required sections (in order):**
1. Ahnii greeting
2. Prerequisites: `PHP OOP. **Recommended:** Read [PSR-6](/psr-6-caching-interface/) first for comparison.`
3. "What Problem Does PSR-16 Solve?" — PSR-6 is a full warehouse management system. Sometimes you just need a shelf. PSR-16 is that shelf — a simple key-value cache for when PSR-6's pools and items are overkill.
4. "Core Interface" — Show all 8 methods of `CacheInterface` with inline comments. Emphasize that `get()` returns a default value on miss (no exceptions for cache misses).
5. "PSR-6 vs PSR-16: Which Should You Use?" — Decision table:
   - Use PSR-16 when: simple key-value, small app, direct access, want minimal API
   - Use PSR-6 when: need item metadata, deferred saves, cache tags, complex invalidation
   - Show the same operation (cache a user) in both PSR-6 and PSR-16 side by side
6. "Real-World Implementation" — Build a `FileCache` implementing `CacheInterface`. Show basic operations, multiple operations (`getMultiple`, `setMultiple`), and TTL handling.
7. "Common Mistakes and Fixes" — (a) Using `has()` then `get()` (race condition — just use `get()` with default), (b) Storing non-serializable values, (c) Key naming collisions (use prefixes).
8. "Framework Integration" — Laravel `Cache::get('key')` (uses PSR-16-like API), Symfony SimpleCacheAdapter.
9. "Try It Yourself" — Companion repo: `src/Cache/SimpleCache/`, test command.
10. "What's Next" — Link to PSR-13 (Hypermedia Links).
11. Baamaapii closing.

**Target length:** ~220-250 lines.

**Step 2: Verify and commit**

```bash
task serve
git add content/posts/psr-16-simple-cache.md
git commit -m "feat(psr-series): complete PSR-16 simple cache post to full standard"
```

---

## Phase 4: Write New Posts

### Task 16: Write PSR-17 (HTTP Factories)

**Files:**
- Create: `content/posts/psr-17-http-factories.md`

**Step 1: Create the post**

Use `task new-post -- psr-17-http-factories` to scaffold, then write the full content.

**Frontmatter:**
```yaml
---
title: "PSR-17: HTTP Factories in PHP"
date: 2025-03-23
categories: [php, standards]
tags: [php, php-fig, psr-17, http]
series: ["php-fig-standards"]
summary: "Learn how PSR-17's HTTP factory interfaces decouple your code from specific PSR-7 implementations, enabling testable and portable HTTP applications."
slug: "psr-17-http-factories"
draft: false
---
```

**Required sections:**
1. Ahnii greeting
2. Prerequisites: `PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) first. PSR-17 creates the objects PSR-7 defines.`
3. "What Problem Does PSR-17 Solve?" — Analogy: PSR-7 defines what a "car" is (the interface). PSR-17 is the factory that builds them. Without factories, your code must say `new GuzzleRequest(...)` — coupling you to Guzzle. With factories, you say `$factory->createRequest(...)` and can swap implementations.
4. "Core Interfaces" — Show all 6 factory interfaces:
   - `RequestFactoryInterface`
   - `ResponseFactoryInterface`
   - `ServerRequestFactoryInterface`
   - `StreamFactoryInterface`
   - `UploadedFileFactoryInterface`
   - `UriFactoryInterface`
5. "Real-World Implementation" — Show how the blog API uses factories to create responses without coupling to a specific PSR-7 library. Show a handler that accepts `ResponseFactoryInterface` instead of `new Response()`.
6. "Common Mistakes and Fixes" — (a) Newing up PSR-7 objects directly (use factories), (b) Not type-hinting factory interfaces in constructors.
7. "Framework Integration" — Slim uses PSR-17 natively, Laminas Diactoros provides factories.
8. "Try It Yourself" — Companion repo: `src/Http/Factory/`, test command.
9. "What's Next" — Link to PSR-15 (HTTP Handlers).
10. Baamaapii closing.

**Target length:** ~200-230 lines.

**Step 2: Verify and commit**

```bash
task serve
git add content/posts/psr-17-http-factories.md
git commit -m "feat(psr-series): add PSR-17 HTTP factories post"
```

---

### Task 17: Write PSR-18 (HTTP Client)

**Files:**
- Create: `content/posts/psr-18-http-client.md`

**Step 1: Create the post**

Use `task new-post -- psr-18-http-client` to scaffold, then write the full content.

**Frontmatter:**
```yaml
---
title: "PSR-18: HTTP Client in PHP"
date: 2025-04-06
categories: [php, standards]
tags: [php, php-fig, psr-18, http]
series: ["php-fig-standards"]
summary: "Discover PSR-18's HTTP client interface for making standardized HTTP requests, enabling swappable HTTP client implementations in PHP."
slug: "psr-18-http-client"
draft: false
---
```

**Required sections:**
1. Ahnii greeting
2. Prerequisites: `PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) and [PSR-17](/psr-17-http-factories/) first. PSR-18 sends PSR-7 requests and receives PSR-7 responses.`
3. "What Problem Does PSR-18 Solve?" — Analogy: PSR-7 is the letter, PSR-17 is the envelope factory, PSR-18 is the postal service. Your code writes the letter and hands it off — you don't care if it goes by FedEx (Guzzle) or UPS (Symfony HttpClient).
4. "Core Interface" — `ClientInterface` with its single `sendRequest()` method. Explain `ClientExceptionInterface`, `RequestExceptionInterface`, `NetworkExceptionInterface`.
5. "Real-World Implementation" — Blog API fetching an external RSS feed. Show a `RssFeedFetcher` class that uses `ClientInterface` + `RequestFactoryInterface` to fetch and parse feeds.
6. "Common Mistakes and Fixes" — (a) Catching `\Exception` instead of PSR-18 exception interfaces, (b) Not using PSR-17 factories to create requests (coupling), (c) Ignoring response status codes.
7. "Framework Integration" — Guzzle implements PSR-18, Symfony HttpClient has PSR-18 adapter.
8. "Try It Yourself" — Companion repo: `src/Http/Client/`, test command.
9. "What's Next" — Link to PSR-6 (Caching Interface — next section in reading order).
10. Baamaapii closing.

**Target length:** ~200-230 lines.

**Step 2: Verify and commit**

```bash
task serve
git add content/posts/psr-18-http-client.md
git commit -m "feat(psr-series): add PSR-18 HTTP client post"
```

---

### Task 18: Write PSR-20 (Clock)

**Files:**
- Create: `content/posts/psr-20-clock.md`

**Step 1: Create the post**

Use `task new-post -- psr-20-clock` to scaffold, then write the full content.

**Frontmatter:**
```yaml
---
title: "PSR-20: Clock Interface in PHP"
date: 2025-04-20
categories: [php, standards]
tags: [php, php-fig, psr-20, clock]
series: ["php-fig-standards"]
summary: "Learn how PSR-20's Clock interface makes time-dependent code testable and predictable by abstracting PHP's time functions."
slug: "psr-20-clock"
draft: false
---
```

**Required sections:**
1. Ahnii greeting
2. Prerequisites: `PHP OOP, basic testing concepts. No specific PSR prerequisites — this is a standalone utility standard.`
3. "What Problem Does PSR-20 Solve?" — How do you test code that uses `new \DateTime('now')`? You can't control time. Every test that depends on "now" is fragile. PSR-20 lets you inject a clock, and in tests, you inject a frozen or controllable clock.
4. "Core Interface" — `ClockInterface` with its single `now(): DateTimeImmutable` method. Show `SystemClock` and `FrozenClock` implementations.
5. "Real-World Implementation" — Blog API examples:
   - `Post::publish(ClockInterface $clock)` sets `published_at` using the clock
   - Cache TTL calculation using clock instead of `time()`
   - Scheduled post publishing: "publish at 9am" using clock for comparison
6. "Common Mistakes and Fixes" — (a) Using `new \DateTime()` instead of the clock (untestable), (b) Not injecting the clock via constructor (making it optional defeats the purpose), (c) Using `time()` or `date()` functions directly.
7. "Testing with PSR-20" — Show a PHPUnit test that uses `FrozenClock` to test time-dependent behavior deterministically. This replaces a traditional "Framework Integration" section since PSR-20 is about testability.
8. "Try It Yourself" — Companion repo: `src/Clock/`, test command.
9. "Series Wrap-Up" — Since this is the last post, summarize the journey. Link back to the index post. Encourage the reader to explore the companion repo.
10. Baamaapii closing.

**Target length:** ~200-230 lines.

**Step 2: Verify and commit**

```bash
task serve
git add content/posts/psr-20-clock.md
git commit -m "feat(psr-series): add PSR-20 clock interface post"
```

---

## Phase 5: Update Index Post

### Task 19: Rewrite the index post with reading order and correct links

**Files:**
- Modify: `content/posts/psr-standards-in-php-practical-guide-for-developers.md`

**Step 1: Update Series Overview section**

Replace the "Series Overview" section (lines 25-41) with two lists — a recommended reading path and a numerical reference:

```markdown
## Recommended Reading Path

New to PSRs? Follow this order — it builds knowledge progressively:

### Foundation (Start Here)

1. [PSR-1: Basic Coding Standard](/psr-1-basic-coding-standard/) — The "house rules" for PHP code
2. [PSR-12: Extended Coding Style](/psr-12-extended-coding-style-guide/) — Detailed formatting rules (extends PSR-1)
3. [PSR-4: Autoloading Standard](/psr-4-autoloading-standard/) — How PHP finds your classes automatically

### Core Infrastructure

4. [PSR-3: Logger Interface](/psr-3-logger-interface/) — Standardized logging across your application
5. [PSR-11: Container Interface](/psr-11-container-interface/) — Dependency injection made interoperable
6. [PSR-14: Event Dispatcher](/psr-14-event-dispatcher/) — Decoupled communication between components

### HTTP Stack (Read in Sequence)

7. [PSR-7: HTTP Message Interfaces](/psr-7-http-message-interfaces/) — The standard "shape" of HTTP requests and responses
8. [PSR-17: HTTP Factories](/psr-17-http-factories/) — Creating PSR-7 objects without coupling to implementations
9. [PSR-15: HTTP Handlers & Middleware](/psr-15-http-handlers/) — Processing HTTP requests through a middleware pipeline
10. [PSR-18: HTTP Client](/psr-18-http-client/) — Sending HTTP requests the standard way

### Data & Caching

11. [PSR-6: Caching Interface](/psr-6-caching-interface/) — Full-featured cache pools and items
12. [PSR-16: Simple Cache](/psr-16-simple-cache/) — Lightweight key-value caching

### Specialized

13. [PSR-13: Hypermedia Links](/psr-13-hypermedia-links/) — Self-documenting REST APIs with HATEOAS
14. [PSR-20: Clock Interface](/psr-20-clock/) — Testable time handling

## Quick Reference (by PSR Number)

| PSR | Topic | Post |
|-----|-------|------|
| 1 | Basic Coding Standard | [Read](/psr-1-basic-coding-standard/) |
| 3 | Logger Interface | [Read](/psr-3-logger-interface/) |
| 4 | Autoloading Standard | [Read](/psr-4-autoloading-standard/) |
| 6 | Caching Interface | [Read](/psr-6-caching-interface/) |
| 7 | HTTP Messages | [Read](/psr-7-http-message-interfaces/) |
| 11 | Container Interface | [Read](/psr-11-container-interface/) |
| 12 | Extended Coding Style | [Read](/psr-12-extended-coding-style-guide/) |
| 13 | Hypermedia Links | [Read](/psr-13-hypermedia-links/) |
| 14 | Event Dispatcher | [Read](/psr-14-event-dispatcher/) |
| 15 | HTTP Handlers | [Read](/psr-15-http-handlers/) |
| 16 | Simple Cache | [Read](/psr-16-simple-cache/) |
| 17 | HTTP Factories | [Read](/psr-17-http-factories/) |
| 18 | HTTP Client | [Read](/psr-18-http-client/) |
| 20 | Clock | [Read](/psr-20-clock/) |
```

**Step 2: Update "Practical Learning" section**

Update to mention the blog API:

```markdown
## Practical Learning

Each post includes:

- A relatable analogy explaining what the standard solves
- The actual PSR interface with commentary
- A working implementation from our blog API companion project
- Common mistakes with before/after fixes
- Framework integration examples (Laravel, Symfony, Slim)
- A "Try It Yourself" section with exact commands to run
```

**Step 3: Update "Getting Started" section**

Update companion repo description:

```markdown
## Getting Started

To follow along, clone our companion repository — a blog API that uses all 14 PSRs:

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
```

The blog API demonstrates every PSR in a real project context. Each PSR has:
- Implementation code under `src/`
- PHPUnit tests under `tests/`
- A tagged release matching the blog post

```bash
# Run all tests
composer test

# Run tests for a specific PSR
composer test -- --filter=PSR7

# Check coding standards (PSR-1 + PSR-12)
composer check-style
```
```

**Step 4: Remove "Stay tuned!" line (line 41)**

The series is complete — remove the "Stay tuned!" text.

**Step 5: Verify and commit**

```bash
task serve
git add content/posts/psr-standards-in-php-practical-guide-for-developers.md
git commit -m "feat(psr-series): rewrite index post with reading order and all 14 PSR links"
```

---

## Phase 6: Companion Repository Restructure

> **Note:** This phase works in the `jonesrussell/php-fig-guide` repository, not the blog repo. Clone it separately or use a worktree.

### Task 20: Plan companion repo restructure

**Step 1: Clone the companion repo**

```bash
cd ~/dev
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
```

**Step 2: Review current structure**

```bash
ls -la src/
composer show
cat composer.json
cat phpunit.xml*
```

**Step 3: Create a branch for the restructure**

```bash
git checkout -b feature/blog-api-restructure
```

**Step 4: Plan the directory migration**

Current directories (PSR1/, PSR3/, PSR4/, etc.) need to be restructured into domain-oriented directories (Cache/, Container/, Event/, Http/, etc.) while preserving existing code where possible.

Document the mapping and commit the plan:
- `src/PSR1/` → code stays, enforced by phpcs config
- `src/PSR3/` → `src/Log/`
- `src/PSR4/` → no directory needed (it's the autoloading standard)
- `src/PSR6/` → `src/Cache/Pool/`
- `src/PSR7/` → `src/Http/Message/`
- `src/PSR11/` → `src/Container/`
- `src/PSR12/` → code stays, enforced by phpcs config
- `src/PSR13/` → `src/Link/`
- New: `src/Event/` (PSR-14)
- New: `src/Http/Middleware/` (PSR-15)
- New: `src/Cache/SimpleCache/` (PSR-16)
- New: `src/Http/Factory/` (PSR-17)
- New: `src/Http/Client/` (PSR-18)
- New: `src/Clock/` (PSR-20)
- New: `src/Blog/` (domain models: Post, Category)

**Step 5: Commit the plan**

```bash
git commit --allow-empty -m "docs: plan blog API restructure for PSR series companion"
```

---

### Task 21: Build Blog domain model

**Files:**
- Create: `src/Blog/Post.php`
- Create: `src/Blog/Category.php`
- Create: `src/Blog/PostRepository.php` (interface)
- Create: `src/Blog/InMemoryPostRepository.php`
- Test: `tests/Blog/PostTest.php`
- Test: `tests/Blog/InMemoryPostRepositoryTest.php`

**Step 1: Write failing test for Post**

```php
<?php
// tests/Blog/PostTest.php

namespace JonesRussell\PhpFigGuide\Tests\Blog;

use JonesRussell\PhpFigGuide\Blog\Post;
use PHPUnit\Framework\TestCase;

class PostTest extends TestCase
{
    public function testCreatePost(): void
    {
        $post = new Post(1, 'My First Post', 'Hello world', 'my-first-post');
        $this->assertSame(1, $post->getId());
        $this->assertSame('My First Post', $post->getTitle());
        $this->assertSame('my-first-post', $post->getSlug());
        $this->assertFalse($post->isPublished());
    }
}
```

**Step 2: Run test — expect FAIL**

```bash
composer test -- --filter=PostTest
```

**Step 3: Implement Post**

```php
<?php
// src/Blog/Post.php

namespace JonesRussell\PhpFigGuide\Blog;

class Post
{
    private ?\DateTimeImmutable $publishedAt = null;

    public function __construct(
        private int $id,
        private string $title,
        private string $content,
        private string $slug,
    ) {}

    public function getId(): int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function getContent(): string { return $this->content; }
    public function getSlug(): string { return $this->slug; }
    public function getPublishedAt(): ?\DateTimeImmutable { return $this->publishedAt; }
    public function isPublished(): bool { return $this->publishedAt !== null; }

    public function publish(\DateTimeImmutable $at): void
    {
        $this->publishedAt = $at;
    }
}
```

**Step 4: Run test — expect PASS**

```bash
composer test -- --filter=PostTest
```

**Step 5: Commit**

```bash
git add src/Blog/Post.php tests/Blog/PostTest.php
git commit -m "feat: add Blog Post domain model with tests"
```

**Step 6-10: Repeat TDD cycle for Category, PostRepository interface, and InMemoryPostRepository.**

---

### Task 22: Add PSR-14 Event implementation

**Files:**
- Create: `src/Event/PostCreatedEvent.php`
- Create: `src/Event/PostPublishedEvent.php`
- Create: `src/Event/SimpleEventDispatcher.php`
- Create: `src/Event/SimpleListenerProvider.php`
- Test: `tests/Event/SimpleEventDispatcherTest.php`

Follow TDD: write test first, verify fail, implement, verify pass, commit.

The `SimpleEventDispatcher` implements `Psr\EventDispatcher\EventDispatcherInterface`.
The `SimpleListenerProvider` implements `Psr\EventDispatcher\ListenerProviderInterface`.

Composer dependency needed: `composer require psr/event-dispatcher`

---

### Task 23: Add PSR-15 Middleware implementation

**Files:**
- Create: `src/Http/Middleware/LoggingMiddleware.php`
- Create: `src/Http/Middleware/AuthMiddleware.php`
- Create: `src/Http/Middleware/CorsMiddleware.php`
- Create: `src/Http/Middleware/MiddlewarePipeline.php`
- Create: `src/Http/Handler/BlogPostHandler.php`
- Test: `tests/Http/Middleware/MiddlewarePipelineTest.php`

Follow TDD. Implements `Psr\Http\Server\MiddlewareInterface` and `RequestHandlerInterface`.

Composer dependency: `composer require psr/http-server-handler psr/http-server-middleware`

---

### Task 24: Add PSR-16 Simple Cache implementation

**Files:**
- Create: `src/Cache/SimpleCache/FileCache.php`
- Test: `tests/Cache/SimpleCache/FileCacheTest.php`

Follow TDD. Implements `Psr\SimpleCache\CacheInterface`.

Composer dependency: `composer require psr/simple-cache`

---

### Task 25: Add PSR-17 HTTP Factory implementation

**Files:**
- Create: `src/Http/Factory/ResponseFactory.php`
- Create: `src/Http/Factory/RequestFactory.php`
- Create: `src/Http/Factory/StreamFactory.php`
- Test: `tests/Http/Factory/ResponseFactoryTest.php`

Follow TDD. Implements `Psr\Http\Message\ResponseFactoryInterface`, etc.

Composer dependency: `composer require psr/http-factory`

---

### Task 26: Add PSR-18 HTTP Client implementation

**Files:**
- Create: `src/Http/Client/SimpleHttpClient.php`
- Create: `src/Blog/RssFeedFetcher.php`
- Test: `tests/Http/Client/SimpleHttpClientTest.php`
- Test: `tests/Blog/RssFeedFetcherTest.php`

Follow TDD. Implements `Psr\Http\Client\ClientInterface`.

Composer dependency: `composer require psr/http-client`

---

### Task 27: Add PSR-20 Clock implementation

**Files:**
- Create: `src/Clock/SystemClock.php`
- Create: `src/Clock/FrozenClock.php`
- Test: `tests/Clock/FrozenClockTest.php`
- Modify: `src/Blog/Post.php` — update `publish()` to accept `ClockInterface`

Follow TDD. Implements `Psr\Clock\ClockInterface`.

Composer dependency: `composer require psr/clock`

---

### Task 28: Add public entry point and README

**Files:**
- Create: `public/index.php` — simple router that demonstrates the full middleware pipeline
- Modify: `README.md` — rewrite with blog API description, PSR map table, setup instructions
- Create: `config/container.php` — PSR-11 container wiring all services

**Step 1: Write the entry point**

A minimal `public/index.php` that:
- Boots the PSR-11 container from `config/container.php`
- Creates a middleware pipeline (PSR-15)
- Handles incoming requests (PSR-7)
- Returns responses

**Step 2: Rewrite README with PSR mapping table**

Include the same PSR-to-feature table from the design doc, plus setup/test instructions.

**Step 3: Commit**

```bash
git add public/index.php config/container.php README.md
git commit -m "feat: add entry point, container config, and updated README"
```

---

### Task 29: Open PR for companion repo

**Step 1: Push branch**

```bash
git push -u origin feature/blog-api-restructure
```

**Step 2: Create PR**

```bash
gh pr create --title "Restructure companion repo as blog API" --body "..."
```

---

## Phase 7: Final Verification

### Task 30: Full series review

**Step 1: Run Hugo build**

```bash
cd ~/dev/blog
task build
```

Verify: no build errors, all 14 PSR posts + index post render.

**Step 2: Check all internal links**

Verify every "What's Next" link, every prerequisites link, and every companion repo link works.

**Step 3: Check series ordering in Hugo**

Verify the `php-fig-standards` series page lists all 14 posts in the correct order.

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(psr-series): final link and rendering fixes"
```
