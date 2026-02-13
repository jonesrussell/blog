---
title: "PSR-7: HTTP Message Interfaces in PHP"
date: 2025-01-24
categories: [php, standards]
tags: [php, php-fig, psr-7, http]
series: ["php-fig-standards"]
summary: "Deep dive into PSR-7's HTTP message interfaces, understanding HTTP message abstraction, and implementing HTTP clients and servers in PHP."
slug: "psr-7-http-message-interfaces"
---

Ahnii!

> **Prerequisites:** PHP OOP, Composer. **Recommended:** Read [PSR-4](/psr-4-autoloading-standard/) first. **Pairs with:** PSR-15 (middleware) and PSR-17 (factories).

Ever wondered how frameworks like Laravel and Slim handle HTTP requests behind the scenes? PSR-7 defines common interfaces for representing HTTP messages in PHP. These interfaces enable framework-agnostic HTTP message handling, making it easier to create interoperable HTTP clients, servers, and middleware.

## What Problem Does PSR-7 Solve? (3 minutes)

Imagine every restaurant in town used different-shaped plates. Chefs couldn't share recipes because "put it on the plate" meant something different everywhere. PSR-7 gives PHP a standard "plate" for HTTP messages — every framework and library agrees on what a request and response look like.

Before PSR-7, switching from Guzzle to Buzz or from Laravel to Slim meant learning entirely new objects for the same HTTP concepts. PSR-7 lets you write code that works with any compliant library.

### Why Immutability?

PSR-7 messages are **immutable** — you can't change them after creation. Instead, methods like `withHeader()` return a *new* object with the change applied. Think of it like editing a Google Doc with "suggestion mode" on: the original stays intact, and each change creates a new version.

This matters because HTTP messages often pass through multiple middleware layers. If one middleware could modify the request object directly, another middleware downstream might get unexpected data. Immutability prevents these bugs.

## Core Interfaces

### 1. Message Interface

```php
<?php

namespace Psr\Http\Message;

interface MessageInterface
{
    public function getProtocolVersion();
    public function withProtocolVersion($version);
    public function getHeaders();
    public function hasHeader($name);
    public function getHeader($name);
    public function getHeaderLine($name);
    public function withHeader($name, $value);
    public function withAddedHeader($name, $value);
    public function withoutHeader($name);
    public function getBody();
    public function withBody(StreamInterface $body);
}
```

### 2. Request Interface

```php
<?php

namespace Psr\Http\Message;

interface RequestInterface extends MessageInterface
{
    public function getRequestTarget();
    public function withRequestTarget($requestTarget);
    public function getMethod();
    public function withMethod($method);
    public function getUri();
    public function withUri(UriInterface $uri, $preserveHost = false);
}
```

### 3. Response Interface

```php
<?php

namespace Psr\Http\Message;

interface ResponseInterface extends MessageInterface
{
    public function getStatusCode();
    public function withStatus($code, $reasonPhrase = '');
    public function getReasonPhrase();
}
```

## Basic Implementation

### 1. Creating Requests

```php
<?php

use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Uri;

// Simple GET request
$request = new Request(
    'GET',
    'https://api.example.com/users'
);

// POST request with JSON body
$request = new Request(
    'POST',
    'https://api.example.com/users',
    [
        'Content-Type' => 'application/json'
    ],
    json_encode(['name' => 'John Doe'])
);
```

### 2. Handling Responses

```php
<?php

use GuzzleHttp\Psr7\Response;

$response = new Response(
    200,
    ['Content-Type' => 'application/json'],
    json_encode(['status' => 'success'])
);

// Working with responses
$status = $response->getStatusCode();
$body = $response->getBody()->getContents();
$contentType = $response->getHeaderLine('Content-Type');
```

## Best Practices

1. **Immutability**

```php
// Bad - Modifying message directly
$request->method = 'POST';

// Good - Using withers
$newRequest = $request->withMethod('POST');
```

2. **Stream Handling**

```php
// Bad - Loading entire body into memory
$content = $request->getBody()->getContents();

// Good - Streaming large responses
$body = $response->getBody();
while (!$body->eof()) {
    echo $body->read(8192);
}
```

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

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR7
```

See `src/Http/` for the PSR-7 implementation in the blog API.

## Next Steps

In our next post, we'll explore PSR-15, which builds upon PSR-7 to define HTTP server request handlers and middleware. Check out our [example repository](https://github.com/jonesrussell/php-fig-guide/tree/psr-7) for the implementation of these standards.

## Resources

- [Official PSR-7 Specification](https://www.php-fig.org/psr/psr-7/)
- [Guzzle HTTP Client](https://docs.guzzlephp.org/)
- [Laminas Diactoros](https://docs.laminas.dev/laminas-diactoros/)

Baamaapii 👋
