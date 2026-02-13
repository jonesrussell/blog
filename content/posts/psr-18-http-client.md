---
title: "PSR-18: HTTP Client in PHP"
date: 2025-04-06
categories: [php, standards]
tags: [php, php-fig, psr-18, http]
series: ["php-fig-standards"]
summary: "Discover PSR-18's HTTP client interface for making standardized HTTP requests, enabling swappable HTTP client implementations in PHP."
slug: "psr-18-http-client"
---

Ahnii!

We can define HTTP messages (PSR-7), create them with factories (PSR-17), and handle incoming requests (PSR-15). But what about *sending* requests to other services? PSR-18 completes the HTTP picture.

> **Prerequisites:** PHP OOP. **Required:** Read [PSR-7](/psr-7-http-message-interfaces/) and [PSR-17](/psr-17-http-factories/) first. PSR-18 sends PSR-7 requests and receives PSR-7 responses.

## What Problem Does PSR-18 Solve? (3 minutes)

Here's the analogy that ties the HTTP stack together:

- **PSR-7** is the **letter** -- it defines the shape of the message (headers, body, status code).
- **PSR-17** is the **envelope factory** -- it creates those messages without coupling you to a specific brand.
- **PSR-18** is the **postal service** -- it *delivers* the letter and brings back the reply.

Your code writes a letter and hands it to the postal service. You don't care if it goes by FedEx (Guzzle), UPS (Symfony HttpClient), or carrier pigeon (cURL wrapper). PSR-18 defines the contract: give me a request, I'll give you a response.

Without PSR-18, your code calls `$guzzle->get('/api/feeds')` -- tightly coupled to Guzzle. Want to switch to Symfony's HttpClient? You'd rewrite every HTTP call across your codebase.

With PSR-18, you call `$client->sendRequest($request)` and the implementation behind it can be anything. One interface, any HTTP library.

## Core Interface (5 minutes)

PSR-18 is the simplest PSR you'll encounter. It defines a single interface with a single method:

```php
<?php

namespace Psr\Http\Client;

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

interface ClientInterface
{
    /**
     * Sends a PSR-7 request and returns a PSR-7 response.
     */
    public function sendRequest(RequestInterface $request): ResponseInterface;
}
```

That's it. One method. Give it a PSR-7 request, get back a PSR-7 response.

### Exception Interfaces

PSR-18 also defines three exception interfaces for when things go wrong:

```php
<?php

namespace Psr\Http\Client;

// Base exception -- all PSR-18 exceptions extend this
interface ClientExceptionInterface extends \Throwable {}

// The request itself was malformed (bad URI, invalid method, etc.)
interface RequestExceptionInterface extends ClientExceptionInterface
{
    public function getRequest(): RequestInterface;
}

// Couldn't reach the server (DNS failure, connection timeout, etc.)
interface NetworkExceptionInterface extends ClientExceptionInterface
{
    public function getRequest(): RequestInterface;
}
```

Here's the key insight that trips people up: **PSR-18 does NOT throw exceptions for 4xx or 5xx responses.** A 404 Not Found or a 500 Internal Server Error is a perfectly valid HTTP response -- the server received your request and replied. Your code should check the status code, not rely on exceptions for error handling.

Exceptions are only thrown when the request *can't be sent at all* -- a malformed URI, a DNS failure, a connection timeout. These are transport-level failures, not application-level errors.

## Real-World Implementation (10 minutes)

Let's build something practical: an `RssFeedFetcher` that pulls external RSS feeds for the blog. This is a real use case -- aggregating content from other sites.

### The Decoupled Fetcher

```php
<?php

namespace App\Blog;

use Psr\Http\Client\ClientInterface;
use Psr\Http\Client\NetworkExceptionInterface;
use Psr\Http\Message\RequestFactoryInterface;

class RssFeedFetcher
{
    public function __construct(
        private ClientInterface $client,
        private RequestFactoryInterface $requestFactory,
    ) {}

    /**
     * Fetches and parses an RSS feed from the given URL.
     *
     * @return array<int, array{title: string, link: string, pubDate: string}>
     */
    public function fetch(string $feedUrl): array
    {
        $request = $this->requestFactory->createRequest('GET', $feedUrl);

        try {
            $response = $this->client->sendRequest($request);
        } catch (NetworkExceptionInterface $e) {
            throw new \RuntimeException(
                "Could not reach feed at {$feedUrl}: {$e->getMessage()}"
            );
        }

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException(
                "Feed returned HTTP {$response->getStatusCode()}"
            );
        }

        return $this->parseFeed($response->getBody()->getContents());
    }

    /**
     * @return array<int, array{title: string, link: string, pubDate: string}>
     */
    private function parseFeed(string $xml): array
    {
        $feed = new \SimpleXMLElement($xml);
        $items = [];

        foreach ($feed->channel->item as $item) {
            $items[] = [
                'title'   => (string) $item->title,
                'link'    => (string) $item->link,
                'pubDate' => (string) $item->pubDate,
            ];
        }

        return $items;
    }
}
```

Notice what this class depends on: `ClientInterface` and `RequestFactoryInterface` -- both PSR interfaces. It knows nothing about Guzzle, Symfony, or cURL.

### Swapping Implementations

Here's the power of PSR-18. The same `RssFeedFetcher` works with any compliant HTTP client:

```php
<?php

// With Guzzle (implements PSR-18 natively since v7)
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;

$fetcher = new RssFeedFetcher(
    new Client(),
    new HttpFactory()
);

// With Symfony HttpClient (via PSR-18 adapter)
use Symfony\Component\HttpClient\Psr18Client;

$fetcher = new RssFeedFetcher(
    new Psr18Client(),
    new Psr18Client() // Psr18Client also implements RequestFactoryInterface
);
```

Same `RssFeedFetcher`, different postal services. Zero code changes inside the class.

### Testing with a Mock Client

PSR-18 makes testing trivial. Create a mock client that returns predetermined responses:

```php
<?php

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class MockHttpClient implements ClientInterface
{
    public function __construct(
        private ResponseInterface $response
    ) {}

    public function sendRequest(RequestInterface $request): ResponseInterface
    {
        return $this->response;
    }
}
```

Now test the fetcher without making any real HTTP calls:

```php
<?php

use Nyholm\Psr7\Factory\Psr17Factory;

class RssFeedFetcherTest extends TestCase
{
    public function testFetchParsesRssItems(): void
    {
        $factory = new Psr17Factory();

        $xml = <<<XML
        <?xml version="1.0"?>
        <rss><channel>
            <item>
                <title>Test Post</title>
                <link>https://example.com/test</link>
                <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
            </item>
        </channel></rss>
        XML;

        $mockResponse = $factory->createResponse(200)
            ->withBody($factory->createStream($xml));

        $fetcher = new RssFeedFetcher(
            new MockHttpClient($mockResponse),
            $factory
        );

        $items = $fetcher->fetch('https://example.com/feed.xml');

        $this->assertCount(1, $items);
        $this->assertEquals('Test Post', $items[0]['title']);
    }

    public function testFetchThrowsOnServerError(): void
    {
        $factory = new Psr17Factory();

        $mockResponse = $factory->createResponse(500);

        $fetcher = new RssFeedFetcher(
            new MockHttpClient($mockResponse),
            $factory
        );

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Feed returned HTTP 500');

        $fetcher->fetch('https://example.com/feed.xml');
    }
}
```

No HTTP mocking libraries needed. No spinning up fake servers. Just inject a different implementation -- that's the whole point of coding to interfaces.

## Common Mistakes and Fixes

### 1. Catching \Exception Instead of PSR-18 Exceptions

PSR-18 defines specific exception types for a reason. Use them to handle failures appropriately.

```php
// Bad -- catches everything, can't distinguish failure types
try {
    $response = $client->sendRequest($request);
} catch (\Exception $e) {
    echo "Something went wrong";
}

// Good -- handle each failure type differently
try {
    $response = $client->sendRequest($request);
} catch (NetworkExceptionInterface $e) {
    // Server unreachable -- retry or use cached data
    $this->logger->warning("Network error: {$e->getMessage()}");
    return $this->getCachedResponse($request);
} catch (RequestExceptionInterface $e) {
    // Request itself is broken -- fix it, don't retry
    throw new \InvalidArgumentException("Bad request: {$e->getMessage()}");
}
```

### 2. Not Using PSR-17 to Create Requests

If you're using PSR-18 but creating requests with concrete classes, you've decoupled the delivery but not the envelope. Half-decoupled code is still coupled code.

```php
// Bad -- coupled to Guzzle's Request class
use GuzzleHttp\Psr7\Request;

$request = new Request('GET', 'https://api.example.com/data');
$response = $client->sendRequest($request);

// Good -- use PSR-17 factory for full decoupling
$request = $this->requestFactory->createRequest('GET', 'https://api.example.com/data');
$response = $client->sendRequest($request);
```

### 3. Ignoring Response Status Codes

PSR-18 doesn't throw on 4xx/5xx. Assuming `sendRequest()` returned successfully means "200 OK" is a common bug.

```php
// Bad -- assumes success means 200
$response = $client->sendRequest($request);
$data = json_decode($response->getBody()->getContents(), true);
// What if the response was a 404 with an HTML error page?

// Good -- always check the status code
$response = $client->sendRequest($request);

if ($response->getStatusCode() >= 400) {
    throw new \RuntimeException(
        "API returned HTTP {$response->getStatusCode()}"
    );
}

$data = json_decode($response->getBody()->getContents(), true);
```

## Framework Integration

### Guzzle

Guzzle implements PSR-18 natively since version 7. The `Client` class implements `ClientInterface` out of the box -- no adapters needed:

```php
use GuzzleHttp\Client;

$client = new Client(['timeout' => 5]);
// $client is a PSR-18 ClientInterface -- use it directly
$response = $client->sendRequest($request);
```

### Symfony HttpClient

Symfony provides the `Psr18Client` adapter that wraps Symfony's native HttpClient with a PSR-18 interface:

```php
use Symfony\Component\HttpClient\Psr18Client;

$client = new Psr18Client();
// Also implements RequestFactoryInterface, StreamFactoryInterface
$response = $client->sendRequest($request);
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR18
```

See `src/Http/Client/` for the HTTP client implementation and `src/Blog/RssFeedFetcher.php` for a practical example.

## What's Next

We've completed the HTTP stack! Next: [PSR-6: Caching Interface](/psr-6-caching-interface/) -- making your application faster with standardized caching.

## Resources

- [Official PSR-18 Specification](https://www.php-fig.org/psr/psr-18/)
- [PHP-FIG Website](https://www.php-fig.org)

Baamaapii 👋
