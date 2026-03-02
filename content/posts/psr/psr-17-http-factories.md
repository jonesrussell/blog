---
title: "PSR-17: HTTP Factories in PHP"
date: 2025-03-23
categories: [php, standards]
tags: [php, php-fig, psr-17, http]
series: ["php-fig-standards"]
summary: "Learn how PSR-17's HTTP factory interfaces decouple your code from specific PSR-7 implementations, enabling testable and portable HTTP applications."
slug: "psr-17-http-factories"
---

Ahnii!

We've seen how PSR-7 defines what HTTP messages look like. But how do you *create* them without tying your code to a specific library? That's where PSR-17 comes in.

> **Prerequisites:** PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) first -- PSR-17 creates the objects PSR-7 defines.

## What Problem Does PSR-17 Solve? (3 minutes)

PSR-7 defines what a "car" is -- the interfaces: wheels, engine, steering. PSR-17 is the *factory* that builds them.

Without factories, your code must say `new GuzzleHttp\Psr7\Request('GET', '/posts')` -- coupling you directly to Guzzle. What if you want to switch to Laminas Diactoros? You'd need to find and replace every `new GuzzleHttp\Psr7\...` call across your entire codebase.

And what about testing? How do you create a fake request without pulling in a full HTTP library?

With PSR-17 factories, you say `$factory->createRequest('GET', '/posts')` and the factory decides which implementation to use. Your code stays portable. Swap the factory, and every object it creates changes with it -- no other code needs to change.

## Core Interfaces (5 minutes)

PSR-17 defines six factory interfaces, one for each type of PSR-7 object. Let's walk through them.

### RequestFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface RequestFactoryInterface
{
    public function createRequest(string $method, $uri): RequestInterface;
}
```

Creates outgoing HTTP requests. The `$uri` parameter accepts either a string or a `UriInterface` instance.

### ResponseFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface ResponseFactoryInterface
{
    public function createResponse(int $code = 200, string $reasonPhrase = ''): ResponseInterface;
}
```

Creates HTTP responses. The reason phrase defaults to the standard one for the given status code (e.g., "OK" for 200, "Not Found" for 404).

### ServerRequestFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface ServerRequestFactoryInterface
{
    public function createServerRequest(
        string $method,
        $uri,
        array $serverParams = []
    ): ServerRequestInterface;
}
```

Creates server-side requests -- the kind your application receives from a web server. The `$serverParams` array maps to `$_SERVER`.

### StreamFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface StreamFactoryInterface
{
    public function createStream(string $content = ''): StreamInterface;
    public function createStreamFromFile(string $filename, string $mode = 'r'): StreamInterface;
    public function createStreamFromResource($resource): StreamInterface;
}
```

Three ways to create a stream: from a string, from a file path, or from an existing PHP resource. You'll use `createStream()` most often for JSON response bodies.

### UploadedFileFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface UploadedFileFactoryInterface
{
    public function createUploadedFile(
        StreamInterface $stream,
        ?int $size = null,
        int $error = UPLOAD_ERR_OK,
        ?string $clientFilename = null,
        ?string $clientMediaType = null
    ): UploadedFileInterface;
}
```

Creates uploaded file representations. Useful for testing file upload handlers without actual file uploads.

### UriFactoryInterface

```php
<?php

namespace Psr\Http\Message;

interface UriFactoryInterface
{
    public function createUri(string $uri = ''): UriInterface;
}
```

Creates URI objects from strings. The factory parses the URI and gives you a structured object with methods like `getHost()`, `getPath()`, and `getQuery()`.

### Which Ones Matter Most?

The two you'll use most are **RequestFactoryInterface** and **ResponseFactoryInterface** -- they cover the vast majority of use cases. **StreamFactoryInterface** comes up when you need to set response bodies. The others are for specialized cases like testing file uploads or building URIs programmatically.

## Real-World Implementation (10 minutes)

Let's see the difference factories make in a blog API handler.

### The Coupled Version (Bad)

```php
<?php

use GuzzleHttp\Psr7\Response;

class BlogPostHandler
{
    public function handle($request): Response
    {
        $posts = $this->fetchPosts();
        $json = json_encode($posts);

        // Coupled to Guzzle's concrete Response class
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            $json
        );
    }
}
```

This works, but you've hardcoded `GuzzleHttp\Psr7\Response` into your handler. Want to switch to Nyholm or Laminas? You need to change this class and every other class that creates HTTP objects.

### The Decoupled Version (Good)

```php
<?php

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamFactoryInterface;

class BlogPostHandler
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
    ) {}

    public function handle($request): ResponseInterface
    {
        $posts = $this->fetchPosts();
        $body = $this->streamFactory->createStream(json_encode($posts));

        return $this->responseFactory->createResponse(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody($body);
    }
}
```

Now the handler depends only on interfaces. The concrete implementation is injected at construction time -- the handler doesn't care whether it's Guzzle, Nyholm, or Laminas under the hood.

### Testing Becomes Trivial

```php
<?php

use Nyholm\Psr7\Factory\Psr17Factory;

class BlogPostHandlerTest extends TestCase
{
    public function testReturnsJsonResponse(): void
    {
        // Nyholm provides a single class that implements all 6 factory interfaces
        $factory = new Psr17Factory();

        $handler = new BlogPostHandler($factory, $factory);
        $response = $handler->handle($factory->createServerRequest('GET', '/posts'));

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('application/json', $response->getHeaderLine('Content-Type'));
    }
}
```

Swap the factory, and the entire implementation changes. No mocking needed for the HTTP layer -- just inject a different factory.

## Common Mistakes and Fixes

### 1. Newing Up PSR-7 Objects Directly

If your application code contains `new Response(...)` or `new Request(...)`, you've bypassed the factory pattern and re-introduced coupling.

```php
// Bad -- coupled to a specific implementation
use GuzzleHttp\Psr7\Response;

$response = new Response(200, [], 'Hello');

// Good -- use the injected factory
$response = $this->responseFactory->createResponse(200);
$body = $this->streamFactory->createStream('Hello');
$response = $response->withBody($body);
```

### 2. Not Type-Hinting Factory Interfaces

Accepting a concrete factory class defeats the purpose. Always type-hint the PSR-17 interface.

```php
// Bad -- tied to Guzzle's factory
use GuzzleHttp\Psr7\HttpFactory;

public function __construct(HttpFactory $factory) {}

// Good -- any PSR-17 compliant factory works
use Psr\Http\Message\ResponseFactoryInterface;

public function __construct(ResponseFactoryInterface $responseFactory) {}
```

## Framework Integration

### Slim 4

Slim 4 uses PSR-17 natively. When you create a Slim app, it auto-discovers available PSR-17 factories from your installed packages:

```php
<?php

use Slim\Factory\AppFactory;

// Slim auto-discovers PSR-17 factories from installed packages
// (e.g., nyholm/psr7, slim/psr7, or guzzlehttp/psr7)
$app = AppFactory::create();

$app->get('/posts', function ($request, $response) {
    $response->getBody()->write(json_encode(['title' => 'Hello']));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
```

You can also set a specific factory explicitly:

```php
use Nyholm\Psr7\Factory\Psr17Factory;

AppFactory::setResponseFactory(new Psr17Factory());
$app = AppFactory::create();
```

### Laminas Diactoros

Laminas Diactoros provides all six factory implementations out of the box:

```php
<?php

use Laminas\Diactoros\RequestFactory;
use Laminas\Diactoros\ResponseFactory;
use Laminas\Diactoros\ServerRequestFactory;
use Laminas\Diactoros\StreamFactory;
use Laminas\Diactoros\UploadedFileFactory;
use Laminas\Diactoros\UriFactory;

// Each factory implements its corresponding PSR-17 interface
$responseFactory = new ResponseFactory();
$response = $responseFactory->createResponse(200, 'OK');
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR17
```

See `src/Http/Factory/` for the factory implementations used in the blog API.

## What's Next

Now that we can create requests and responses, let's process them: [PSR-15: HTTP Handlers and Middleware](/psr-15-http-handlers/) -- building a middleware pipeline.

## Resources

- [Official PSR-17 Specification](https://www.php-fig.org/psr/psr-17/)
- [Nyholm PSR-7 and PSR-17](https://github.com/Nyholm/psr7)
- [PHP-FIG Website](https://www.php-fig.org)

Baamaapii 👋
