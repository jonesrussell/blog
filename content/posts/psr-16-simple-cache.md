---
title: "PSR-16: Simple Cache in PHP"
date: 2025-03-16
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-16, caching]
summary: "Learn about PSR-16's simple caching interface, understand when to use it over PSR-6, and implement straightforward caching solutions in PHP."
slug: "psr-16-simple-cache"
draft: false
---

Ahnii!

Remember PSR-6's cache pools and cache items? Sometimes that's more machinery than you need. PSR-16 is the simpler alternative.

This post is part of our [PSR Standards in PHP series](/psr-standards-in-php-practical-guide-for-developers/).

> **Prerequisites:** PHP OOP. **Recommended:** Read [PSR-6](/psr-6-caching-interface/) first for comparison.

## What Problem Does PSR-16 Solve? (3 minutes)

PSR-6 is a full warehouse management system. You get items, check if they're hits, set values, then save them back to the pool. That's five lines of code just to cache a single value. Sometimes you just need a shelf: put something on it, take something off.

PSR-16 is that shelf — a simple `get`/`set` key-value interface for when PSR-6's ceremony is overkill.

Both standards are valid. PSR-6 gives you fine-grained control with item metadata, deferred saves, and pool management. PSR-16 is for the common case where you just need basic caching without the extra layers.

## Core Interface (5 minutes)

PSR-16 defines a single `CacheInterface` with eight methods. That's it — no pools, no items, no wrappers:

```php
<?php

namespace Psr\SimpleCache;

interface CacheInterface
{
    // Returns the cached value, or $default on a miss — no exceptions for misses!
    public function get(string $key, mixed $default = null): mixed;

    // Stores a value under $key, with an optional TTL in seconds (or DateInterval)
    public function set(string $key, mixed $value, null|int|\DateInterval $ttl = null): bool;

    // Removes a single cached item by key
    public function delete(string $key): bool;

    // Wipes the entire cache — use with care
    public function clear(): bool;

    // Batch get: returns an iterable of key => value pairs, using $default for misses
    public function getMultiple(iterable $keys, mixed $default = null): iterable;

    // Batch set: $values is an iterable of key => value pairs, all with the same TTL
    public function setMultiple(iterable $values, null|int|\DateInterval $ttl = null): bool;

    // Batch delete: removes multiple items at once
    public function deleteMultiple(iterable $keys): bool;

    // Checks if a key exists — but prefer get() with a default instead!
    public function has(string $key): bool;
}
```

Notice how every method either returns the cached value directly or a simple `bool`. No intermediate objects, no two-step save process. Call `get()`, get your data. Call `set()`, you're done.

## PSR-6 vs PSR-16: Which Should You Use? (3 minutes)

The best way to see the difference is to compare the same operation side by side. Let's cache a user object.

**PSR-6 — cache a user:**

```php
<?php

// PSR-6: Five steps to cache one value
$item = $pool->getItem('user.1');
if (!$item->isHit()) {
    $item->set($user);
    $item->expiresAfter(3600);
    $pool->save($item);
}
$user = $item->get();
```

**PSR-16 — cache a user:**

```php
<?php

// PSR-16: One line to cache, one line to retrieve
$cache->set('user.1', $user, 3600);
$user = $cache->get('user.1');
```

That's the core trade-off. PSR-6 gives you an item object you can inspect and manipulate. PSR-16 gives you direct access.

### Decision Table

| Scenario | PSR-16 | PSR-6 |
|---|---|---|
| Simple key-value storage | Yes | Overkill |
| Small to medium apps | Yes | Yes |
| Need item metadata (hit/miss status, expiry info) | No | Yes |
| Deferred/batched saves | No | Yes |
| Cache tags or complex invalidation | No | Yes |
| Minimal API surface, quick integration | Yes | No |
| Direct cache access without pooling | Yes | No |

**Rule of thumb:** Start with PSR-16. Move to PSR-6 when you need the extra control.

## Real-World Implementation (10 minutes)

Let's build a practical `FileCache` that implements `CacheInterface`. This stores each cached value as a serialized file on disk:

```php
<?php

namespace App\Cache;

use Psr\SimpleCache\CacheInterface;

class FileCache implements CacheInterface
{
    private string $cacheDir;

    public function __construct(string $cacheDir)
    {
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0775, true);
        }
        $this->cacheDir = rtrim($cacheDir, '/');
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $path = $this->path($key);

        if (!file_exists($path)) {
            return $default;
        }

        $data = unserialize(file_get_contents($path));

        // Check if the entry has expired
        if ($data['expiry'] !== null && $data['expiry'] < time()) {
            $this->delete($key);
            return $default;
        }

        return $data['value'];
    }

    public function set(string $key, mixed $value, null|int|\DateInterval $ttl = null): bool
    {
        $expiry = null;
        if ($ttl instanceof \DateInterval) {
            $expiry = (new \DateTime())->add($ttl)->getTimestamp();
        } elseif (is_int($ttl)) {
            $expiry = time() + $ttl;
        }

        $data = serialize(['value' => $value, 'expiry' => $expiry]);
        return file_put_contents($this->path($key), $data) !== false;
    }

    public function delete(string $key): bool
    {
        $path = $this->path($key);
        return file_exists($path) && unlink($path);
    }

    public function clear(): bool
    {
        $files = glob($this->cacheDir . '/*.cache');
        foreach ($files as $file) {
            unlink($file);
        }
        return true;
    }

    public function has(string $key): bool
    {
        return $this->get($key, $this) !== $this;
    }

    public function getMultiple(iterable $keys, mixed $default = null): iterable
    {
        $results = [];
        foreach ($keys as $key) {
            $results[$key] = $this->get($key, $default);
        }
        return $results;
    }

    public function setMultiple(iterable $values, null|int|\DateInterval $ttl = null): bool
    {
        $success = true;
        foreach ($values as $key => $value) {
            if (!$this->set($key, $value, $ttl)) {
                $success = false;
            }
        }
        return $success;
    }

    public function deleteMultiple(iterable $keys): bool
    {
        $success = true;
        foreach ($keys as $key) {
            if (!$this->delete($key)) {
                $success = false;
            }
        }
        return $success;
    }

    private function path(string $key): string
    {
        return $this->cacheDir . '/' . md5($key) . '.cache';
    }
}
```

### Using It With the Blog API

```php
<?php

$cache = new FileCache('/tmp/blog-cache');

// Cache a blog post for 1 hour
$post = $database->fetchPost($slug);
$cache->set("post.{$slug}", $post, 3600);

// Retrieve it later — returns null if expired
$post = $cache->get("post.{$slug}");

// Cache configuration values with no expiry
$cache->set('config.site_name', 'My Blog');
$cache->set('config.posts_per_page', 10);

// Batch operations — cache multiple posts at once
$posts = $database->fetchRecentPosts(5);
$cacheEntries = [];
foreach ($posts as $post) {
    $cacheEntries["post.{$post['slug']}"] = $post;
}
$cache->setMultiple($cacheEntries, 3600);

// Retrieve multiple posts in one call
$cached = $cache->getMultiple(['post.first-post', 'post.second-post']);
foreach ($cached as $key => $post) {
    if ($post !== null) {
        echo $post['title'] . "\n";
    }
}
```

## Common Mistakes and Fixes

### 1. Using `has()` Then `get()` (Race Condition)

Between checking and getting, the cache entry could expire. This is a classic time-of-check to time-of-use bug:

```php
<?php

// Bad — race condition between has() and get()
if ($cache->has('key')) {
    $value = $cache->get('key'); // Could be null if expired between calls!
}

// Good — use get() with a meaningful default
$value = $cache->get('key', false);
if ($value !== false) {
    // Cache hit — use $value
}

// Also good — just use get() and check for null
$value = $cache->get('user.profile');
if ($value !== null) {
    // Cache hit
}
```

### 2. Storing Non-Serializable Values

Closures, database connections, and file handles can't be serialized. Trying to cache them will fail silently or throw errors:

```php
<?php

// Bad — closures can't be serialized
$cache->set('callback', function() { return 'hello'; });

// Bad — resource handles can't be cached
$cache->set('db', $pdoConnection);

// Good — cache the data, not the objects that produce it
$cache->set('query.result', $pdoConnection->query($sql)->fetchAll());

// Good — cache serializable DTOs or arrays
$cache->set('user.1', [
    'id' => 1,
    'name' => 'Russell',
    'email' => 'russell@example.com',
]);
```

### 3. Key Naming Collisions

Without namespacing, `user.1` in one part of your app could clash with `user.1` in another:

```php
<?php

// Bad — ambiguous keys that could collide
$cache->set('user.1', $userData);    // Is this from auth? profiles? admin?
$cache->set('user.1', $permissions); // Overwrites the previous value!

// Good — prefix keys with a namespace
$cache->set('profiles.user.1', $userData);
$cache->set('auth.user.1', $permissions);

// Even better — use a helper to enforce consistent prefixes
function cacheKey(string $namespace, string $key): string
{
    return "{$namespace}.{$key}";
}

$cache->set(cacheKey('profiles', 'user.1'), $userData);
$cache->set(cacheKey('auth', 'user.1'), $permissions);
```

## Framework Integration

### Laravel

Laravel's `Cache` facade uses a PSR-16-like API — the method names will feel instantly familiar:

```php
<?php

use Illuminate\Support\Facades\Cache;

// Store a value for 1 hour (seconds)
Cache::put('user.1', $user, 3600);

// Retrieve with a default
$user = Cache::get('user.1', null);

// Remember pattern — fetch from cache or compute and store
$user = Cache::remember('user.1', 3600, function () {
    return User::find(1);
});
```

### Symfony

Symfony provides a `Psr16Cache` adapter that wraps any PSR-6 pool as a PSR-16 interface:

```php
<?php

use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Psr16Cache;

// Wrap a PSR-6 adapter as PSR-16
$psr6Cache = new FilesystemAdapter();
$cache = new Psr16Cache($psr6Cache);

// Now use the simple PSR-16 API
$cache->set('user.1', $user, 3600);
$user = $cache->get('user.1');
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR16
```

See `src/Cache/SimpleCache/` for the blog API's simple cache implementation.

## What's Next?

Next: [PSR-13: Hypermedia Links](/psr-13-hypermedia-links/) — making your REST APIs self-documenting with standardized link relations.

Baamaapii 👋
