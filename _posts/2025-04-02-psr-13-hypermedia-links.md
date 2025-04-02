---
layout: post
title: "PSR-13: Hypermedia Links in PHP"
date: 2025-04-02
categories: php standards
series: php-fig-standards
tags: [php, psr-13, hypermedia, rest]
summary: "Discover PSR-13's hypermedia link interfaces, understand HATEOAS principles, and implement discoverable APIs in PHP applications."
---

Ahnii! Today we'll explore PSR-13, which defines interfaces for creating and managing hypermedia links in PHP applications. This standard is particularly useful for building REST APIs that follow HATEOAS (Hypermedia as the Engine of Application State) principles, enabling self-documenting and discoverable APIs.

## Core Interfaces (5 minutes)

PSR-13 defines three main interfaces that work together to create a flexible hypermedia linking system. These interfaces provide the foundation for building discoverable APIs and implementing HATEOAS principles. Let's explore each one:

### 1. LinkInterface

```php
<?php

namespace Psr\Link;

/**
 * Represents a hypermedia link with its attributes and relationships.
 * This interface defines the basic structure for all hypermedia links.
 */
interface LinkInterface
{
    /**
     * Get the URI of the link.
     * @return string The URI of the link
     */
    public function getHref();

    /**
     * Check if the link is templated (contains variables).
     * @return bool True if the link contains template variables
     */
    public function isTemplated();

    /**
     * Get the link relationships (rels).
     * @return array Array of relationship names
     */
    public function getRels();

    /**
     * Get all attributes of the link.
     * @return array Array of attribute name => value pairs
     */
    public function getAttributes();
}
```

### 2. EvolvableLinkInterface

```php
<?php

namespace Psr\Link;

/**
 * Extends LinkInterface to provide immutable link modification methods.
 * Each method returns a new instance with the requested changes.
 */
interface EvolvableLinkInterface extends LinkInterface
{
    /**
     * Create a new instance with the specified href.
     * @param string $href The new URI
     * @return static
     */
    public function withHref($href);

    /**
     * Create a new instance with an additional relationship.
     * @param string $rel The relationship to add
     * @return static
     */
    public function withRel($rel);

    /**
     * Create a new instance without the specified relationship.
     * @param string $rel The relationship to remove
     * @return static
     */
    public function withoutRel($rel);

    /**
     * Create a new instance with an additional attribute.
     * @param string $attribute The attribute name
     * @param mixed $value The attribute value
     * @return static
     */
    public function withAttribute($attribute, $value);

    /**
     * Create a new instance without the specified attribute.
     * @param string $attribute The attribute to remove
     * @return static
     */
    public function withoutAttribute($attribute);
}
```

### 3. LinkProviderInterface

```php
<?php

namespace Psr\Link;

/**
 * Interface for collections of links.
 * Provides methods to retrieve links and filter them by relationship.
 */
interface LinkProviderInterface
{
    /**
     * Get all links in the collection.
     * @return LinkInterface[]
     */
    public function getLinks();

    /**
     * Get all links with the specified relationship.
     * @param string $rel The relationship to filter by
     * @return LinkInterface[]
     */
    public function getLinksByRel($rel);
}
```

## Basic Implementation (10 minutes)

Now that we understand the interfaces, let's look at how to implement them. We'll create concrete classes that implement these interfaces, making it easy to work with hypermedia links in your applications. The implementation follows immutable object patterns, meaning each modification creates a new instance rather than changing the existing one.

### 1. Link Implementation

```php
<?php

use Psr\Link\EvolvableLinkInterface;

/**
 * Concrete implementation of the EvolvableLinkInterface.
 * Provides immutable link objects with all required functionality.
 */
class Link implements EvolvableLinkInterface
{
    /** @var string The URI of the link */
    private $href;

    /** @var array Map of relationship names */
    private $rels = [];

    /** @var array Map of attribute name => value pairs */
    private $attributes = [];

    /** @var bool Whether the link contains template variables */
    private $templated = false;

    /**
     * Create a new link instance.
     * @param string $href The URI of the link
     */
    public function __construct(string $href)
    {
        $this->href = $href;
        // Check if the href contains template variables (e.g., {id})
        $this->templated = strpos($href, '{') !== false;
    }

    /**
     * Get the URI of the link.
     * @return string
     */
    public function getHref(): string
    {
        return $this->href;
    }

    /**
     * Check if the link is templated.
     * @return bool
     */
    public function isTemplated(): bool
    {
        return $this->templated;
    }

    /**
     * Get all relationships of the link.
     * @return array
     */
    public function getRels(): array
    {
        return $this->rels;
    }

    /**
     * Get all attributes of the link.
     * @return array
     */
    public function getAttributes(): array
    {
        return $this->attributes;
    }

    /**
     * Create a new instance with the specified href.
     * @param string $href
     * @return static
     */
    public function withHref($href): EvolvableLinkInterface
    {
        $new = clone $this;
        $new->href = $href;
        $new->templated = strpos($href, '{') !== false;
        return $new;
    }

    /**
     * Create a new instance with an additional relationship.
     * @param string $rel
     * @return static
     */
    public function withRel($rel): EvolvableLinkInterface
    {
        $new = clone $this;
        $new->rels[$rel] = true;
        return $new;
    }

    /**
     * Create a new instance without the specified relationship.
     * @param string $rel
     * @return static
     */
    public function withoutRel($rel): EvolvableLinkInterface
    {
        $new = clone $this;
        unset($new->rels[$rel]);
        return $new;
    }

    /**
     * Create a new instance with an additional attribute.
     * @param string $attribute
     * @param mixed $value
     * @return static
     */
    public function withAttribute($attribute, $value): EvolvableLinkInterface
    {
        $new = clone $this;
        $new->attributes[$attribute] = $value;
        return $new;
    }

    /**
     * Create a new instance without the specified attribute.
     * @param string $attribute
     * @return static
     */
    public function withoutAttribute($attribute): EvolvableLinkInterface
    {
        $new = clone $this;
        unset($new->attributes[$attribute]);
        return $new;
    }
}
```

### 2. Link Provider Implementation

```php
<?php

use Psr\Link\LinkProviderInterface;
use Psr\Link\LinkInterface;

/**
 * Concrete implementation of the LinkProviderInterface.
 * Manages collections of links and provides filtering capabilities.
 */
class LinkProvider implements LinkProviderInterface
{
    /** @var LinkInterface[] Collection of links */
    private $links = [];

    /**
     * Add a link to the collection.
     * @param LinkInterface $link The link to add
     * @return $this For method chaining
     */
    public function addLink(LinkInterface $link)
    {
        $this->links[] = $link;
        return $this;
    }

    /**
     * Get all links in the collection.
     * @return LinkInterface[]
     */
    public function getLinks(): array
    {
        return array_values($this->links);
    }

    /**
     * Get all links with the specified relationship.
     * @param string $rel The relationship to filter by
     * @return LinkInterface[]
     */
    public function getLinksByRel($rel): array
    {
        return array_values(array_filter(
            $this->links,
            fn(LinkInterface $link) => in_array($rel, array_keys($link->getRels()))
        ));
    }
}
```

## Usage Examples (15 minutes)

Let's see how to use these implementations in real-world scenarios. We'll start with simple examples and then move on to more complex use cases in REST APIs. These examples will show you how to create links, add relationships, and work with collections of links.

### 1. Basic Link Creation

```php
<?php

// Create a simple link to a user profile
$link = new Link('/users/123')
    ->withRel('self')  // Indicates this is the canonical URL for the resource
    ->withAttribute('title', 'User Profile');  // Human-readable description

// Create a templated link for user resources
$link = new Link('/users/{id}')
    ->withRel('user')  // Indicates this is a user resource
    ->withAttribute('templated', true);  // Explicitly mark as templated

// Create a link collection and add links to it
$provider = new LinkProvider();
$provider->addLink($link);
```

### 2. REST API Implementation

```php
<?php

/**
 * Controller for handling user-related API endpoints.
 * Demonstrates HATEOAS implementation in a REST API.
 */
class UserController
{
    /**
     * Show user details with related links.
     * @param int $id User ID
     * @return array Response data with links
     */
    public function show($id): array
    {
        $user = $this->repository->find($id);
        $links = new LinkProvider();
        
        // Add self-referential link
        $links->addLink(
            (new Link("/users/$id"))
                ->withRel('self')
        );
        
        // Add link to related posts
        $links->addLink(
            (new Link("/users/$id/posts"))
                ->withRel('posts')
        );
        
        return [
            'data' => $user,
            '_links' => $this->serializeLinks($links)
        ];
    }

    /**
     * Convert link collection to HAL format.
     * @param LinkProviderInterface $provider
     * @return array Serialized links
     */
    private function serializeLinks(LinkProviderInterface $provider): array
    {
        $result = [];
        foreach ($provider->getLinks() as $link) {
            foreach ($link->getRels() as $rel => $_) {
                $result[$rel] = [
                    'href' => $link->getHref(),
                    'templated' => $link->isTemplated(),
                    'attributes' => $link->getAttributes()
                ];
            }
        }
        return $result;
    }
}
```

## Framework Integration (15 minutes)

Many popular PHP frameworks have built-in support for PSR-13 or can be easily extended to work with it. Let's look at how to integrate hypermedia links with Laravel and Symfony, two of the most popular PHP frameworks. This will show you how to combine PSR-13 with framework-specific features.

### 1. Laravel Example

```php
<?php

use Illuminate\Http\Resources\Json\JsonResource;
use Psr\Link\LinkProviderInterface;

/**
 * API Resource for User model with HATEOAS support.
 * Extends Laravel's JsonResource to include hypermedia links.
 */
class UserResource extends JsonResource
{
    /** @var LinkProviderInterface|null Collection of links */
    private $links;

    /**
     * Create a new resource instance.
     * @param mixed $resource The resource data
     * @param LinkProviderInterface|null $links Optional link collection
     */
    public function __construct($resource, LinkProviderInterface $links = null)
    {
        parent::__construct($resource);
        $this->links = $links;
    }

    /**
     * Transform the resource into an array.
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            '_links' => $this->serializeLinks()
        ];
    }

    /**
     * Serialize the link collection into HAL format.
     * @return array
     */
    private function serializeLinks(): array
    {
        if (!$this->links) {
            return [];
        }

        return array_reduce(
            $this->links->getLinks(),
            function ($carry, LinkInterface $link) {
                foreach ($link->getRels() as $rel => $_) {
                    $carry[$rel] = [
                        'href' => $link->getHref(),
                        'templated' => $link->isTemplated()
                    ];
                }
                return $carry;
            },
            []
        );
    }
}
```

### 2. Symfony Example

```php
<?php

use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Link\LinkProviderInterface;

/**
 * API Controller demonstrating PSR-13 integration in Symfony.
 */
class ApiController
{
    /**
     * Show user details with hypermedia links.
     * @param int $id User ID
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        // Create link collection
        $links = new LinkProvider();
        
        // Add self-referential link
        $links->addLink(
            (new Link("/api/users/$id"))
                ->withRel('self')
        );

        // Return JSON response with links
        return new JsonResponse([
            'data' => $user,
            '_links' => $this->serializeLinks($links)
        ]);
    }
}
```

## Best Practices (10 minutes)

When working with hypermedia links, following certain best practices can make your APIs more maintainable and easier to use. These guidelines help ensure consistency across your application and make it easier for other developers to understand and work with your code.

### 1. Link Relations

```php
// Bad - Using arbitrary relation names
$link->withRel('get-user-stuff');  // Non-standard relation name

// Good - Using standard IANA relations
$link->withRel('self')     // Canonical URL
     ->withRel('next')     // Next page in sequence
     ->withRel('prev');    // Previous page in sequence
```

### 2. Template Parameters

```php
// Bad - Hardcoded IDs in URLs
$link = new Link("/users/123/posts");  // Not reusable

// Good - Templated links
$link = (new Link("/users/{id}/posts"))
    ->withTemplated(true);  // Reusable for any user ID
```

## Common Patterns (10 minutes)

As you work with hypermedia links, you'll find yourself repeating certain patterns. Let's look at some common patterns that can help you write cleaner, more maintainable code. These patterns include helper classes and design patterns that make working with links easier.

### 1. Link Builder

```php
<?php

/**
 * Helper class for creating consistent links with a base URL.
 * Ensures all links are properly formatted and include the base URL.
 */
class LinkBuilder
{
    /** @var string Base URL for all links */
    private $baseUrl;

    /**
     * Create a new link builder.
     * @param string $baseUrl Base URL for all links
     */
    public function __construct(string $baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Create a link to a resource.
     * @param string $path Resource path
     * @return Link
     */
    public function resource(string $path): Link
    {
        return new Link($this->baseUrl . '/' . ltrim($path, '/'));
    }

    /**
     * Create a templated link for a collection.
     * @param string $path Collection path
     * @return Link
     */
    public function collection(string $path): Link
    {
        return $this->resource($path . '{?page,limit,sort}')
            ->withAttribute('templated', true);
    }
}
```

### 2. Resource Decorator

```php
<?php

/**
 * Decorator for adding hypermedia links to resources.
 * Wraps any resource with link collection functionality.
 */
class ResourceWithLinks
{
    /** @var mixed The original resource */
    private $resource;

    /** @var LinkProviderInterface Collection of links */
    private $links;

    /**
     * Create a new decorated resource.
     * @param mixed $resource The resource to decorate
     * @param LinkProviderInterface $links Link collection
     */
    public function __construct($resource, LinkProviderInterface $links)
    {
        $this->resource = $resource;
        $this->links = $links;
    }

    /**
     * Convert the resource to an array with links.
     * @return array
     */
    public function toArray(): array
    {
        return [
            'data' => $this->resource,
            '_links' => $this->serializeLinks()
        ];
    }

    /**
     * Serialize the link collection.
     * @return array
     */
    private function serializeLinks(): array
    {
        // Serialization logic...
    }
}
```

## HATEOAS Implementation (15 minutes)

HATEOAS (Hypermedia as the Engine of Application State) is a constraint of REST that makes your APIs self-documenting and discoverable. Let's see how to implement HATEOAS principles using PSR-13, making your APIs more user-friendly and easier to navigate.

### 1. Resource State Machine

```php
<?php

/**
 * Manages the state machine for Order resources.
 * Provides appropriate links based on the order's current state.
 */
class OrderState
{
    /**
     * Get links for an order based on its state.
     * @param Order $order The order instance
     * @return LinkProviderInterface
     */
    public function getLinks(Order $order): LinkProviderInterface
    {
        $links = new LinkProvider();
        
        // Always include self-referential link
        $links->addLink(
            (new Link("/orders/{$order->id}"))
                ->withRel('self')
        );

        // Add payment link for pending orders
        if ($order->status === 'pending') {
            $links->addLink(
                (new Link("/orders/{$order->id}/pay"))
                    ->withRel('payment')
            );
        }

        // Add shipment link for paid orders
        if ($order->status === 'paid') {
            $links->addLink(
                (new Link("/orders/{$order->id}/ship"))
                    ->withRel('shipment')
            );
        }

        return $links;
    }
}
```

### 2. Link Discovery

```php
<?php

/**
 * Manages API discovery and entry points.
 * Provides links to available API resources.
 */
class ApiDiscovery
{
    /**
     * Get links for API root.
     * @return LinkProviderInterface
     */
    public function getRootLinks(): LinkProviderInterface
    {
        $links = new LinkProvider();
        
        // Add users collection link with pagination
        $links->addLink(
            (new Link('/users{?page,limit}'))
                ->withRel('users')
                ->withAttribute('templated', true)
        );
        
        // Add products collection link with filtering
        $links->addLink(
            (new Link('/products{?category,sort}'))
                ->withRel('products')
                ->withAttribute('templated', true)
        );
        
        return $links;
    }
}
```

## Next Steps (5 minutes)

In our next article, we'll explore PSR-14, which defines interfaces for event handling in PHP applications. This standard provides a common way to implement the Observer pattern and event-driven architectures. Stay tuned for more insights into PHP-FIG standards!

## Resources (5 minutes)

- [Official PSR-13 Specification](https://www.php-fig.org/psr/psr-13/)
- [IANA Link Relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml)
- [HAL Specification](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal)

Baamaapii 👋
