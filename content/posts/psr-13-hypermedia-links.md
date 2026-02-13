---
title: "PSR-13: Hypermedia Links in PHP"
date: 2025-02-24
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, psr-13, hypermedia, rest]
summary: "Discover PSR-13's hypermedia link interfaces, understand HATEOAS principles, and implement discoverable APIs in PHP applications."
slug: "psr-13-hypermedia-links"
---

Ahnii!

> **Prerequisites:** PHP OOP, REST API basics. **Recommended:** Read [PSR-7](/psr-7-http-message-interfaces/) first.

## What Problem Does PSR-13 Solve? (3 minutes)

Have you ever used a website where you had to manually construct URLs to navigate? Neither have your API consumers — they shouldn't have to either. PSR-13 lets your API tell clients "here's where to go next," like how a website has navigation links.

This is the heart of HATEOAS (Hypermedia as the Engine of Application State) — a REST principle where API responses include links to related actions and resources. Instead of hardcoding `/api/users/123/posts` in your frontend, the API response itself says "here's the link to this user's posts."

### When Would You Actually Use This?

- **Pagination:** Include `next`, `prev`, `first`, `last` links in list responses
- **Related resources:** A blog post response includes links to its author, comments, and category
- **Available actions:** A draft post includes a `publish` link; a published post includes `unpublish`

Today we'll explore PSR-13, which defines interfaces for creating and managing hypermedia links in PHP applications. This standard is particularly useful for building REST APIs that follow HATEOAS (Hypermedia as the Engine of Application State) principles, enabling self-documenting and discoverable APIs.

## Core Interfaces (5 minutes)

PSR-13 defines three main interfaces that work together to create a flexible hypermedia linking system.

### 1. LinkInterface

```php
<?php

namespace Psr\Link;

interface LinkInterface
{
    public function getHref();
    public function isTemplated();
    public function getRels();
    public function getAttributes();
}
```

### 2. EvolvableLinkInterface

```php
<?php

namespace Psr\Link;

interface EvolvableLinkInterface extends LinkInterface
{
    public function withHref($href);
    public function withRel($rel);
    public function withoutRel($rel);
    public function withAttribute($attribute, $value);
    public function withoutAttribute($attribute);
}
```

### 3. LinkProviderInterface

```php
<?php

namespace Psr\Link;

interface LinkProviderInterface
{
    public function getLinks();
    public function getLinksByRel($rel);
}
```

## Usage Examples (15 minutes)

### 1. Basic Link Creation

```php
<?php

// Create a simple link to a user profile
$link = new HypermediaLink('/users/123')
    ->withRel('self')
    ->withAttribute('title', 'User Profile');

// Create a templated link for user resources
$link = new HypermediaLink('/users/{id}')
    ->withRel('user')
    ->withAttribute('templated', true);

// Create a link collection and add links to it
$provider = new HypermediaLinkProvider();
$provider->addLink($link);
```

### 2. REST API Implementation

```php
<?php

class UserController
{
    public function show($id): array
    {
        $user = $this->repository->find($id);
        $links = new HypermediaLinkProvider();
        
        // Add self-referential link
        $links->addLink(
            (new HypermediaLink("/users/$id"))
                ->withRel('self')
        );
        
        // Add link to related posts
        $links->addLink(
            (new HypermediaLink("/users/$id/posts"))
                ->withRel('posts')
        );
        
        return [
            'data' => $user,
            '_links' => $this->serializeLinks($links)
        ];
    }
}
```

## Best Practices

### 1. Link Relations

```php
// Bad - Using arbitrary relation names
$link->withRel('get-user-stuff');

// Good - Using standard IANA relations
$link->withRel('self')
     ->withRel('next')
     ->withRel('prev');
```

### 2. Template Parameters

```php
// Bad - Hardcoded IDs in URLs
$link = new HypermediaLink("/users/123/posts");

// Good - Templated links
$link = (new HypermediaLink("/users/{id}/posts"))
    ->withTemplated(true);
```

## Next Steps (5 minutes)

In our next article, we'll explore PSR-14, which defines interfaces for event handling in PHP applications.

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

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR13
```

See `src/Link/` for how the blog API adds hypermedia links to post responses.

## Resources (5 minutes)

- [Official PSR-13 Specification](https://www.php-fig.org/psr/psr-13/)
- [IANA Link Relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml)
- [HAL Specification](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal)

Baamaapii 👋
