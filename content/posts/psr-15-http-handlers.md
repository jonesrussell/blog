---
title: "PSR-15: HTTP Handlers in PHP"
date: 2025-03-02
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-15, http]
summary: "Learn about PSR-15's HTTP server request handlers and middleware interfaces, and how they enable modular HTTP application development."
slug: "psr-15-http-handlers"
draft: true
---

PSR-15 builds upon PSR-7 by defining standard interfaces for server-side HTTP request handling and middleware. This standardization allows for interoperable middleware that can be shared between frameworks and applications.

## Core Interfaces

### 1. Request Handler Interface

```php
<?php

namespace Psr\Http\Server;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

interface RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface;
}
```

### 2. Middleware Interface

```php
<?php

namespace Psr\Http\Server;

interface MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface;
}
```

## Basic Implementation

### Simple Request Handler

```php
<?php

class ApiHandler implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $data = ['message' => 'Hello, World!'];
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            json_encode($data)
        );
    }
}
```

### Middleware Implementation

```php
<?php

class AuthMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $token = $request->getHeaderLine('Authorization');
        
        if (!$this->validateToken($token)) {
            return new Response(401, [], 'Unauthorized');
        }
        
        return $handler->handle($request);
    }
}
```

## Best Practices

1. **Middleware Composition** - Keep middleware focused on single responsibilities
2. **Request Attribute Handling** - Use request attributes for middleware communication

## Resources

- [Official PSR-15 Specification](https://www.php-fig.org/psr/psr-15/)

Baamaapii 👋
