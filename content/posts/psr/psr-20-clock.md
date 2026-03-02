---
title: "PSR-20: Clock Interface in PHP"
date: 2025-04-20
categories: [php, standards]
tags: [php, php-fig, psr-20, clock]
series: ["php-fig-standards"]
summary: "Learn how PSR-20's Clock interface makes time-dependent code testable and predictable by abstracting PHP's time functions."
slug: "psr-20-clock"
---

Ahnii!

Here's a question that's tripped up every developer: how do you test code that depends on "right now"? PSR-20 has the answer.

> **Prerequisites:** PHP OOP, basic testing concepts. No specific PSR prerequisites -- this is a standalone utility standard.

## What Problem Does PSR-20 Solve? (3 minutes)

Every time you write `new \DateTime('now')` or `time()`, you've made your code untestable.

Think about it. Your test says "check if this event was created in the last 5 minutes." But when is "now"? During CI at 3am? When the developer runs it at noon? On a server in a different timezone? The answer changes every time the test runs, and that's the problem.

Time is a **hidden dependency**, just like a database connection or a file path. When you call `new \DateTime('now')` inside a method, you've hardcoded a dependency on the system clock. You can't control it, you can't predict it, and you can't freeze it for testing.

PSR-20 makes that dependency explicit. Instead of asking PHP for the time, you ask a **Clock** object. In production, the clock returns the real time. In tests, you freeze it to whatever moment you need. The code under test doesn't know the difference -- it just calls `$clock->now()` and gets a `DateTimeImmutable` back.

No more flaky tests. No more "it passed on my machine." No more race conditions between the time a test creates data and the time it checks it.

## Core Interface (3 minutes)

PSR-20 is the simplest PSR of all -- one interface, one method:

```php
<?php

namespace Psr\Clock;

interface ClockInterface
{
    public function now(): \DateTimeImmutable;
}
```

That's the entire specification. Call `now()`, get back the current time as a `DateTimeImmutable`. No exceptions to handle, no configuration to pass, no edge cases to consider.

The power is in the implementations. You need two:

### SystemClock

The production implementation. Returns the real current time:

```php
<?php

namespace App\Clock;

use Psr\Clock\ClockInterface;

class SystemClock implements ClockInterface
{
    public function now(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('now');
    }
}
```

### FrozenClock

The testing implementation. Returns a fixed time that never changes:

```php
<?php

namespace App\Clock;

use Psr\Clock\ClockInterface;

class FrozenClock implements ClockInterface
{
    public function __construct(private \DateTimeImmutable $frozenAt) {}

    public function now(): \DateTimeImmutable
    {
        return $this->frozenAt;
    }
}
```

In production, your service container wires up `SystemClock`. In tests, you create a `FrozenClock` with whatever time you need. The code that depends on `ClockInterface` works identically in both cases.

## Real-World Implementation (10 minutes)

Let's build practical examples using the blog API. Each one demonstrates a different reason you'd want testable time.

### Publishing a Post with Testable Time

When a post is published, it needs a timestamp. With PSR-20, that timestamp comes from the clock:

```php
<?php

namespace App\Blog;

use Psr\Clock\ClockInterface;

class PostPublisher
{
    public function __construct(
        private PostRepository $posts,
        private ClockInterface $clock,
    ) {}

    public function publish(Post $post): void
    {
        $post->setPublishedAt($this->clock->now());
        $this->posts->save($post);
    }
}
```

No `new \DateTime()` hidden inside the method. The time comes from an injected dependency you can control.

### Cache TTL with Testable Time

Cache expiration depends on time. Without a clock, you can't test whether expired entries are properly evicted:

```php
<?php

namespace App\Blog;

use Psr\Clock\ClockInterface;

class CachedPostRepository
{
    /** @var array<string, array{post: Post, expires: \DateTimeImmutable}> */
    private array $cache = [];

    public function __construct(
        private PostRepository $inner,
        private ClockInterface $clock,
        private int $ttlSeconds = 300,
    ) {}

    public function find(int $id): ?Post
    {
        $key = "post.$id";

        if (isset($this->cache[$key]) && $this->cache[$key]['expires'] > $this->clock->now()) {
            return $this->cache[$key]['post'];
        }

        $post = $this->inner->find($id);

        if ($post !== null) {
            $this->cache[$key] = [
                'post'    => $post,
                'expires' => $this->clock->now()->modify("+{$this->ttlSeconds} seconds"),
            ];
        }

        return $post;
    }
}
```

With a `FrozenClock`, you can test cache expiration by setting the clock to a time after the TTL -- no waiting, no `sleep()` calls, no timing-dependent failures.

### Scheduled Publishing

Check if a post's scheduled date has arrived and publish all pending posts:

```php
<?php

namespace App\Blog;

use Psr\Clock\ClockInterface;

class ScheduledPostPublisher
{
    public function __construct(
        private PostRepository $posts,
        private ClockInterface $clock,
    ) {}

    public function publishScheduledPosts(): int
    {
        $now = $this->clock->now();
        $pending = $this->posts->findScheduledBefore($now);

        foreach ($pending as $post) {
            $post->setPublishedAt($now);
            $this->posts->save($post);
        }

        return count($pending);
    }
}
```

In tests, you set the frozen clock to 2025-03-15 10:00:00 and schedule a post for 2025-03-15 09:00:00. The test deterministically verifies the post gets published. No ambiguity, no flakiness.

## Common Mistakes and Fixes

### 1. Using `new \DateTime()` Instead of the Clock

The whole point of PSR-20 is to eliminate direct time construction. If you're still calling `new \DateTime()` inside your methods, the clock can't help you.

```php
// Bad -- hardcoded time, untestable
public function publish(Post $post): void
{
    $post->setPublishedAt(new \DateTimeImmutable('now'));
    $this->posts->save($post);
}

// Good -- time comes from the clock
public function publish(Post $post): void
{
    $post->setPublishedAt($this->clock->now());
    $this->posts->save($post);
}
```

### 2. Making the Clock Optional

Don't make the clock a nullable parameter with a fallback to real time. This defeats the purpose entirely -- if tests don't provide a clock, they silently use real time and become flaky.

```php
// Bad -- optional clock means tests might skip it
public function __construct(
    private PostRepository $posts,
    private ?ClockInterface $clock = null,
) {
    $this->clock = $clock ?? new SystemClock();
}

// Good -- always require the clock
public function __construct(
    private PostRepository $posts,
    private ClockInterface $clock,
) {}
```

### 3. Using `time()` or `date()` Functions

The global `time()` and `date()` functions have the same problem as `new \DateTime()`. All time access should go through the clock.

```php
// Bad -- global function, same untestable problem
if (time() - $cachedAt > 300) {
    $this->refreshCache();
}

// Good -- clock-based comparison
if ($this->clock->now()->getTimestamp() - $cachedAt > 300) {
    $this->refreshCache();
}
```

## Testing with PSR-20 (5 minutes)

Testing is PSR-20's entire reason for existing. Let's write a complete PHPUnit test that demonstrates why this standard matters:

```php
<?php

namespace Tests\Blog;

use App\Blog\Post;
use App\Blog\PostPublisher;
use App\Blog\PostRepository;
use App\Clock\FrozenClock;
use PHPUnit\Framework\TestCase;

class PostPublisherTest extends TestCase
{
    public function testPublishSetsTimestamp(): void
    {
        $frozenTime = new \DateTimeImmutable('2025-03-15 10:00:00');
        $clock = new FrozenClock($frozenTime);

        $post = new Post('My Blog Post');
        $repository = $this->createMock(PostRepository::class);
        $repository->expects($this->once())->method('save')->with($post);

        $publisher = new PostPublisher($repository, $clock);
        $publisher->publish($post);

        $this->assertEquals($frozenTime, $post->getPublishedAt());
        // This test ALWAYS passes, regardless of when it runs
    }

    public function testPublishScheduledPostsOnlyPublishesPastDue(): void
    {
        $frozenTime = new \DateTimeImmutable('2025-03-15 10:00:00');
        $clock = new FrozenClock($frozenTime);

        // A post scheduled for 9am should be published at 10am
        $scheduledPost = new Post('Scheduled Post');
        $scheduledPost->setScheduledAt(new \DateTimeImmutable('2025-03-15 09:00:00'));

        $repository = $this->createMock(PostRepository::class);
        $repository->method('findScheduledBefore')
            ->with($frozenTime)
            ->willReturn([$scheduledPost]);

        $publisher = new ScheduledPostPublisher($repository, $clock);
        $count = $publisher->publishScheduledPosts();

        $this->assertSame(1, $count);
        $this->assertEquals($frozenTime, $scheduledPost->getPublishedAt());
    }
}
```

Notice what's happening: the tests don't depend on the real clock at all. They freeze time at a known moment and assert against that moment. Run them at midnight, noon, or during a leap second -- the result is always the same.

### Symfony's Clock Component

If you don't want to write your own implementations, `symfony/clock` provides a full PSR-20 package:

```bash
composer require symfony/clock
```

It includes `NativeClock` (production), `MockClock` (testing with the ability to advance time), and a `Clock::now()` static helper. The `MockClock` is particularly useful because you can advance time during a test to simulate the passage of time without waiting.

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=Clock
```

See `src/Clock/` for the SystemClock and FrozenClock implementations.

## Series Wrap-Up

This is the final post in the PHP-FIG Standards series, and what a journey it's been.

We've covered all 14 accepted PSRs -- from the foundational coding standards of PSR-1 and PSR-12, through the logging, caching, and dependency injection interfaces, across the entire HTTP stack (PSR-7, PSR-15, PSR-17, PSR-18), and now ending with PSR-20's elegantly simple approach to testable time.

Each standard solves a specific interoperability problem, but they truly shine when used together. The [companion repository](https://github.com/jonesrussell/php-fig-guide) ties every PSR into a working blog API -- a logger that follows PSR-3, a container that implements PSR-11, HTTP handling with PSR-7/15/17/18, caching with PSR-6/16, events with PSR-14, and time with PSR-20. Clone the repo and experiment with it. Change an implementation, swap a library, write a test. That's the best way to internalize these standards.

The PHP-FIG standards aren't just rules to follow -- they're contracts that let your code play well with the entire PHP ecosystem. When you type-hint against `ClockInterface` instead of calling `time()`, you're making a promise: this code is testable, this code is swappable, this code is ready for whatever comes next.

If you're just discovering this series, start from [the beginning](/psr-standards-in-php-practical-guide-for-developers/) and work through each post. If you've been following along from PSR-1 to PSR-20 -- thank you for sticking with it. Now go build something great.

## Resources

- [Official PSR-20 Specification](https://www.php-fig.org/psr/psr-20/)
- [PHP-FIG Website](https://www.php-fig.org)
- [Companion Repository](https://github.com/jonesrussell/php-fig-guide)
- [Series Index](/psr-standards-in-php-practical-guide-for-developers/)

Baamaapii 👋
