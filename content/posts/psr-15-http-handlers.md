---
title: "PSR-15: HTTP Handlers and Middleware in PHP"
date: 2025-03-02
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-15, http]
summary: "Learn about PSR-15's HTTP server request handlers and middleware interfaces, and how they enable modular HTTP application development."
slug: "psr-15-http-handlers"
draft: false
---

Ahnii!

We've seen how PSR-7 defines HTTP messages and PSR-17 creates them. Now, how do we actually *process* a request and produce a response? That's PSR-15.

> **Prerequisites:** PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) first -- PSR-15 builds directly on it.

## What Problem Does PSR-15 Solve? (3 minutes)

Think of your HTTP request as a traveler going through an airport. Each checkpoint (middleware) can inspect your boarding pass (headers), check your luggage (body), add a stamp to your passport (modify the request), or turn you away entirely (return an error response). The final gate (the handler) is your destination -- it's where the actual work happens and you get your response.

Without a standard, every framework's middleware is incompatible. Middleware written for Slim can't be used in Laravel. Middleware from Mezzio won't work in Symfony. PSR-15 fixes this by defining two simple interfaces that every framework can agree on.

The result? You can write an authentication middleware once and use it in any PSR-15 compliant application. Just like PSR-7 gave us a standard "shape" for HTTP messages, PSR-15 gives us a standard "shape" for processing them.

## Core Interfaces (5 minutes)

PSR-15 defines just two interfaces. That's it -- two interfaces that power every middleware pipeline.

### RequestHandlerInterface

```php
<?php

namespace Psr\Http\Server;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

interface RequestHandlerInterface
{
    /**
     * Handles a request and produces a response.
     */
    public function handle(ServerRequestInterface $request): ResponseInterface;
}
```

This is the final destination. A handler takes a request and returns a response -- no delegation, no chain. Think of it as the gate at the end of the airport.

### MiddlewareInterface

```php
<?php

namespace Psr\Http\Server;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

interface MiddlewareInterface
{
    /**
     * Process a request and delegate to the next handler.
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface;
}
```

Here's the key insight: middleware receives both the request AND the next handler in the chain. This means middleware can:

1. **Modify the request** before passing it along
2. **Call the next handler** with `$handler->handle($request)` to continue the chain
3. **Modify the response** that comes back
4. **Short-circuit** by returning a response without calling the handler at all

That `$handler->handle($request)` call is the delegation pattern -- it passes control to the next layer in the pipeline.

## Real-World Implementation (10 minutes)

Let's build a middleware pipeline for a blog API. We'll create four middleware/handler classes, then wire them into a pipeline.

### LoggingMiddleware

```php
<?php

namespace App\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;

class LoggingMiddleware implements MiddlewareInterface
{
    public function __construct(
        private LoggerInterface $logger
    ) {}

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        // Log the incoming request
        $this->logger->info('Request', [
            'method' => $request->getMethod(),
            'uri'    => (string) $request->getUri(),
        ]);

        // Delegate to the next handler
        $response = $handler->handle($request);

        // Log the outgoing response
        $this->logger->info('Response', [
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
```

Notice how we log before *and* after delegating. The request flows in, passes through to the next layer, and the response bubbles back up.

### AuthMiddleware

```php
<?php

namespace App\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Nyholm\Psr7\Response;

class AuthMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $token = $request->getHeaderLine('Authorization');

        if (empty($token) || !$this->validateToken($token)) {
            // Short-circuit -- return 401 without calling the handler
            return new Response(
                401,
                ['Content-Type' => 'application/json'],
                json_encode(['error' => 'Unauthorized'])
            );
        }

        // Token is valid -- attach user data to the request
        $request = $request->withAttribute('user', $this->getUserFromToken($token));

        return $handler->handle($request);
    }

    private function validateToken(string $token): bool
    {
        return str_starts_with($token, 'Bearer ') && strlen($token) > 10;
    }

    private function getUserFromToken(string $token): array
    {
        return ['id' => 1, 'name' => 'Blog Author'];
    }
}
```

If the token is missing or invalid, the pipeline stops right here -- no further middleware or handler runs. If the token is valid, the middleware attaches user data to the request using `withAttribute()` so downstream code can access it.

### CorsMiddleware

```php
<?php

namespace App\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        // Delegate first, then modify the response
        $response = $handler->handle($request);

        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
```

CORS middleware modifies the *response*, so it delegates first and then adds the headers on the way back out.

### BlogPostHandler

```php
<?php

namespace App\Http\Handler;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Nyholm\Psr7\Response;

class BlogPostHandler implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // Access user data set by AuthMiddleware
        $user = $request->getAttribute('user');

        $posts = [
            ['id' => 1, 'title' => 'Getting Started with PSR-15', 'author' => $user['name']],
            ['id' => 2, 'title' => 'Middleware Pipelines in PHP', 'author' => $user['name']],
        ];

        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            json_encode($posts)
        );
    }
}
```

This is the final destination -- no delegation, just produce a response.

### MiddlewarePipeline

```php
<?php

namespace App\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class MiddlewarePipeline implements RequestHandlerInterface
{
    /** @var MiddlewareInterface[] */
    private array $middleware;
    private int $index = 0;

    public function __construct(
        array $middleware,
        private RequestHandlerInterface $handler
    ) {
        $this->middleware = $middleware;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // If we've run through all middleware, call the final handler
        if ($this->index >= count($this->middleware)) {
            return $this->handler->handle($request);
        }

        // Get the next middleware and advance the index
        $next = $this->middleware[$this->index];
        $this->index++;

        // Process the middleware, passing $this as the next handler
        return $next->process($request, $this);
    }
}
```

### Wiring It All Together

```php
<?php

use App\Http\MiddlewarePipeline;
use App\Http\Middleware\{LoggingMiddleware, AuthMiddleware, CorsMiddleware};
use App\Http\Handler\BlogPostHandler;

$pipeline = new MiddlewarePipeline(
    [new LoggingMiddleware($logger), new AuthMiddleware(), new CorsMiddleware()],
    new BlogPostHandler()
);

$response = $pipeline->handle($serverRequest);
```

Here's how a request flows through the pipeline:

```
Request → Logging → Auth → CORS → BlogPostHandler
                                        ↓
Response ← Logging ← Auth ← CORS ← Response
```

Each middleware wraps the next layer. Logging sees the request first and the response last. Auth can stop the chain entirely. CORS adds headers on the way out.

## Common Mistakes and Fixes

### 1. Forgetting to Call `$handler->handle()`

If middleware doesn't delegate, the chain breaks and no downstream middleware or handler ever runs.

```php
// Bad -- returns a response without delegating
public function process(
    ServerRequestInterface $request,
    RequestHandlerInterface $handler
): ResponseInterface {
    return new Response(200, [], 'Handled!');
}

// Good -- delegates, then modifies the response
public function process(
    ServerRequestInterface $request,
    RequestHandlerInterface $handler
): ResponseInterface {
    $response = $handler->handle($request);
    return $response->withHeader('X-Custom', 'value');
}
```

### 2. Modifying Request State Directly

Don't use globals or superglobals to pass data between middleware. Use the request's attributes instead.

```php
// Bad -- storing data in globals
public function process(
    ServerRequestInterface $request,
    RequestHandlerInterface $handler
): ResponseInterface {
    $_SESSION['user'] = $this->getUser($request);
    return $handler->handle($request);
}

// Good -- using request attributes
public function process(
    ServerRequestInterface $request,
    RequestHandlerInterface $handler
): ResponseInterface {
    $user = $this->getUser($request);
    $request = $request->withAttribute('user', $user);
    return $handler->handle($request);
}
```

### 3. Doing Too Much in One Middleware

Each middleware should have one job. If your middleware is handling auth, logging, AND CORS, split it up.

```php
// Bad -- one middleware doing three jobs
class KitchenSinkMiddleware implements MiddlewareInterface
{
    public function process($request, $handler): ResponseInterface
    {
        $this->logger->info($request->getMethod()); // logging
        if (!$this->checkAuth($request)) { return new Response(401); } // auth
        $response = $handler->handle($request);
        return $response->withHeader('Access-Control-Allow-Origin', '*'); // CORS
    }
}

// Good -- three focused middleware classes
$pipeline = new MiddlewarePipeline(
    [new LoggingMiddleware($logger), new AuthMiddleware(), new CorsMiddleware()],
    new BlogPostHandler()
);
```

## Framework Integration

### Laravel

Laravel middleware uses the same concept but its own interface. PSR-15 packages work via a bridge:

```bash
php artisan make:middleware CheckAge
```

```php
// Laravel's middleware signature (not PSR-15, but same pattern)
public function handle(Request $request, Closure $next): Response
{
    if ($request->age < 18) {
        return redirect('home');
    }
    return $next($request);
}
```

### Slim

Slim is built on PSR-15 natively -- any PSR-15 middleware works out of the box:

```php
$app->add(new LoggingMiddleware($logger));
$app->add(new AuthMiddleware());
$app->add(new CorsMiddleware());
```

### Mezzio (Laminas)

Mezzio provides a full PSR-15 pipeline with declarative configuration:

```php
$app->pipe(LoggingMiddleware::class);
$app->pipe(AuthMiddleware::class);
$app->pipe(CorsMiddleware::class);
$app->pipe(BlogPostHandler::class);
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR15
```

See `src/Http/Middleware/` for the blog API's middleware stack.

## What's Next

Next up: [PSR-18: HTTP Client](/psr-18-http-client/) -- how to send HTTP requests the standard way, completing our HTTP stack.

## Resources

- [Official PSR-15 Specification](https://www.php-fig.org/psr/psr-15/)
- [PHP-FIG Website](https://www.php-fig.org)

Baamaapii 👋
