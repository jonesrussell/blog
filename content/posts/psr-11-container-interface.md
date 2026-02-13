---
title: "PSR-11: Container Interface in PHP"
date: 2025-02-03
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-11, dependency-injection]
summary: "Learn about PSR-11's container interface standard, how it enables framework-agnostic dependency injection, and best practices for implementation."
slug: "psr-11-container-interface"
---

Ahnii!

> **Prerequisites:** PHP OOP (classes, interfaces, constructors). **Recommended:** Read [PSR-4](/psr-4-autoloading-standard/) and [PSR-3](/psr-3-logger-interface/) first.

Ever created an object that needs five other objects to work, and each of those needs three more? That's the dependency puzzle. PSR-11 defines a common interface for dependency injection containers in PHP — the tool that solves this puzzle automatically.

## What Problem Does PSR-11 Solve? (3 minutes)

Imagine building a car by hand: you need an engine, which needs a fuel system, which needs a fuel pump, which needs... it goes on forever. A dependency injection container is like a car factory — you tell it the blueprint, and it builds everything in the right order.

Without a standard container interface, libraries that need to look up services (like a router finding controllers) must be written for a specific container. PSR-11 lets any library work with any container — PHP-DI, Symfony's container, Laravel's container, or your own simple one.

## Understanding Dependency Injection Containers

A dependency injection container (DIC) is responsible for:

1. Managing service definitions
2. Creating service instances
3. Resolving dependencies
4. Managing object lifecycle

## The Container Interface

```php
<?php

namespace JonesRussell\PhpFigGuide\PSR11;

interface ContainerInterface
{
    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param string $id
     * @return mixed
     * @throws NotFoundExceptionInterface
     * @throws ContainerExceptionInterface
     */
    public function get($id);

    /**
     * Returns true if the container can return an entry for the given identifier.
     *
     * @param string $id
     * @return bool
     */
    public function has($id);
}
```

## Basic Implementation

Here's a simple implementation of a dependency injection container that adheres to PSR-11:

```php
<?php

namespace JonesRussell\PhpFigGuide\PSR11;

class SimpleContainer implements ContainerInterface
{
    private array $services = [];

    public function set(string $id, $service): void
    {
        $this->services[$id] = $service;
    }

    public function get($id)
    {
        if (!$this->has($id)) {
            throw new class extends \Exception implements NotFoundExceptionInterface {};
        }

        return $this->services[$id];
    }

    public function has($id): bool
    {
        return isset($this->services[$id]);
    }
}

// Example usage
$container = new SimpleContainer();
$container->set('database', new DatabaseConnection());
$database = $container->get('database');
```

## Best Practices

1. **Service Resolution**

```php
// Bad - Service locator pattern
class UserService
{
    public function __construct(private ContainerInterface $container) {}
    
    public function doSomething()
    {
        $dep = $this->container->get('some.service');
    }
}

// Good - Explicit dependency injection
class UserService
{
    public function __construct(
        private SomeServiceInterface $someService
    ) {}
}
```

2. **Container Configuration**

```php
// Bad - Runtime service definition
if ($condition) {
    $container->set('service', new ServiceA());
} else {
    $container->set('service', new ServiceB());
}

// Good - Configuration-driven definition
$container->set('service', function (ContainerInterface $c) {
    return $c->get('config')->get('use_service_a')
        ? new ServiceA()
        : new ServiceB();
});
```

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

Symfony's DependencyInjection component is PSR-11 compliant. You define services in YAML or PHP:

```yaml
# config/services.yaml
services:
    App\Service\PostService:
        arguments:
            $logger: '@Psr\Log\LoggerInterface'
            $cache: '@Psr\SimpleCache\CacheInterface'
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR11
```

See `src/Container/` for the blog API's container implementation.

## Next Steps

In our next post, we'll explore PSR-14, which defines a standard event dispatcher interface. Check out our [example repository](https://github.com/jonesrussell/php-fig-guide/tree/psr-11) for the implementation of these standards.

## Resources

- [Official PSR-11 Specification](https://www.php-fig.org/psr/psr-11/)
- [PHP-DI Documentation](http://php-di.org/)

Baamaapii 👋
