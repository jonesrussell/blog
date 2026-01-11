---
title: "PSR-16: Simple Cache in PHP"
date: 2024-03-16
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-16, caching]
summary: "Learn about PSR-16's simple caching interface, understand when to use it over PSR-6, and implement straightforward caching solutions in PHP."
slug: "psr-16-simple-cache"
draft: true
---

PSR-16 provides a simpler alternative to PSR-6 for basic caching needs. While PSR-6 offers a more robust object-oriented interface, PSR-16 provides a straightforward key-value interface that's easier to implement and use for simple caching scenarios.

## Core Interface

```php
<?php

namespace Psr\SimpleCache;

interface CacheInterface
{
    public function get($key, $default = null);
    public function set($key, $value, $ttl = null);
    public function delete($key);
    public function clear();
    public function getMultiple($keys, $default = null);
    public function setMultiple($values, $ttl = null);
    public function deleteMultiple($keys);
    public function has($key);
}
```

## Usage Examples

### Basic Operations

```php
<?php

$cache = new FileCache('/path/to/cache');

// Store a value
$cache->set('user.1', [
    'id' => 1,
    'name' => 'John Doe'
], 3600); // 1 hour TTL

// Retrieve a value
$user = $cache->get('user.1', ['guest' => true]);

// Check existence
if ($cache->has('user.1')) {
    // Cache hit
}

// Delete a value
$cache->delete('user.1');
```

## PSR-6 vs PSR-16

### When to Use PSR-16

1. Simple key-value storage needs
2. Small to medium-sized applications
3. Direct cache access without pooling
4. When simplicity is preferred over features

### When to Use PSR-6

1. Complex caching requirements
2. Need for cache item metadata
3. Deferred save operations
4. Fine-grained cache control

## Resources

- [Official PSR-16 Specification](https://www.php-fig.org/psr/psr-16/)

Baamaapii 👋
