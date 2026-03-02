---
title: "PSR-14: Event Dispatcher in PHP"
date: 2025-02-17
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-14, events]
summary: "Explore PSR-14's event dispatcher interface, understand event-driven architecture in PHP, and learn best practices for implementing event systems."
slug: "psr-14-event-dispatcher"
draft: false
---

Ahnii!

> **Prerequisites:** PHP OOP (classes, interfaces). **Recommended:** Read [PSR-11](/psr-11-container-interface/) first.

Now that we've seen how PSR-11 wires services together, what if those services need to communicate without knowing about each other? That's where events come in. PSR-14 defines a standard interface for event dispatching in PHP, enabling loose coupling and better extensibility across your entire application.

## What Problem Does PSR-14 Solve? (3 minutes)

Think of your application as a radio station. When something happens -- a user registers, a post gets published, an order is placed -- the station broadcasts it. Listeners are tuned-in radios: they hear the broadcasts they care about and react accordingly.

The key insight is **decoupling**. The radio station doesn't need to know who's listening, and listeners don't need to know about each other. A registration broadcast might trigger a welcome email, update analytics, and create a default profile -- all without the registration code knowing any of that exists.

Without a standard, every framework invents its own event system. Symfony has its EventDispatcher, Laravel has its Events facade, and smaller libraries roll their own. PSR-14 standardizes the pattern so event systems become interchangeable -- just like PSR-3 did for logging and PSR-11 did for containers.

## Core Interfaces (5 minutes)

PSR-14 defines three interfaces. Let's look at each one.

### EventDispatcherInterface

```php
<?php

namespace Psr\EventDispatcher;

interface EventDispatcherInterface
{
    /**
     * Dispatches an event to all registered listeners.
     *
     * @param object $event The event to dispatch
     * @return object The same event object, possibly modified by listeners
     */
    public function dispatch(object $event): object;
}
```

One method, one job: take any object as an event, pass it to listeners, and return it. The event object is returned so listeners can modify it -- for example, a validation listener might mark an event as invalid.

### ListenerProviderInterface

```php
<?php

namespace Psr\EventDispatcher;

interface ListenerProviderInterface
{
    /**
     * Returns all listeners applicable to the given event.
     *
     * @param object $event The event to find listeners for
     * @return iterable<callable> Listeners for this event
     */
    public function getListenersForEvent(object $event): iterable;
}
```

This is the registry. When an event is dispatched, the dispatcher asks the provider: "Who wants to hear about this?" The provider returns all matching listeners. This separation means you can swap out how listeners are discovered without changing the dispatcher.

### StoppableEventInterface

```php
<?php

namespace Psr\EventDispatcher;

interface StoppableEventInterface
{
    /**
     * Has propagation been stopped?
     *
     * @return bool True if no further listeners should be called
     */
    public function isPropagationStopped(): bool;
}
```

Sometimes you need to short-circuit. If a validation listener finds a problem, there's no point running the rest. Events that implement this interface can signal the dispatcher to stop calling listeners.

## Real-World Implementation (10 minutes)

Let's build a working event system for a blog application. We'll create events, listeners, a provider, and a dispatcher.

### Event Classes

```php
<?php

namespace App\Event;

class PostCreatedEvent
{
    public function __construct(
        private object $post,
        private \DateTimeImmutable $createdAt = new \DateTimeImmutable()
    ) {}

    public function getPost(): object
    {
        return $this->post;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}

class PostPublishedEvent
{
    public function __construct(
        private object $post
    ) {}

    public function getPost(): object
    {
        return $this->post;
    }
}
```

Events are simple data carriers. They hold information about what happened -- nothing more.

### Listener Provider

```php
<?php

namespace App\Event;

use Psr\EventDispatcher\ListenerProviderInterface;

class SimpleListenerProvider implements ListenerProviderInterface
{
    /** @var array<string, array<callable>> */
    private array $listeners = [];

    /**
     * Register a listener for a specific event class.
     */
    public function addListener(string $eventClass, callable $listener): void
    {
        $this->listeners[$eventClass][] = $listener;
    }

    /**
     * Returns all listeners registered for this event's class.
     */
    public function getListenersForEvent(object $event): iterable
    {
        $eventClass = get_class($event);
        return $this->listeners[$eventClass] ?? [];
    }
}
```

The provider maps event class names to arrays of callables. When the dispatcher asks for listeners, it looks up the event's class and returns any registered listeners.

### Event Dispatcher

```php
<?php

namespace App\Event;

use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\EventDispatcher\ListenerProviderInterface;
use Psr\EventDispatcher\StoppableEventInterface;

class SimpleEventDispatcher implements EventDispatcherInterface
{
    public function __construct(
        private ListenerProviderInterface $listenerProvider
    ) {}

    public function dispatch(object $event): object
    {
        // If the event is already stopped, return immediately
        if ($event instanceof StoppableEventInterface && $event->isPropagationStopped()) {
            return $event;
        }

        foreach ($this->listenerProvider->getListenersForEvent($event) as $listener) {
            // Check before each listener call
            if ($event instanceof StoppableEventInterface && $event->isPropagationStopped()) {
                break;
            }
            $listener($event);
        }

        return $event;
    }
}
```

The dispatcher gets listeners from the provider and calls each one. It respects StoppableEventInterface by checking before each call.

### Wiring It All Together

```php
<?php

// Create the provider and register listeners
$provider = new SimpleListenerProvider();

// When a post is created, send a notification
$provider->addListener(PostCreatedEvent::class, function (PostCreatedEvent $event) {
    $post = $event->getPost();
    echo "Notification: New post '{$post->title}' created!\n";
});

// When a post is created, update the search index
$provider->addListener(PostCreatedEvent::class, function (PostCreatedEvent $event) {
    $post = $event->getPost();
    echo "Search index updated for post #{$post->id}\n";
});

// When a post is published, notify subscribers
$provider->addListener(PostPublishedEvent::class, function (PostPublishedEvent $event) {
    $post = $event->getPost();
    echo "Email sent to subscribers about '{$post->title}'\n";
});

// Create the dispatcher
$dispatcher = new SimpleEventDispatcher($provider);

// Dispatch events
$post = (object) ['id' => 1, 'title' => 'Getting Started with PSR-14'];
$dispatcher->dispatch(new PostCreatedEvent($post));
$dispatcher->dispatch(new PostPublishedEvent($post));

// Output:
// Notification: New post 'Getting Started with PSR-14' created!
// Search index updated for post #1
// Email sent to subscribers about 'Getting Started with PSR-14'
```

Notice how the code that creates the post doesn't know about notifications, search indexing, or emails. It just dispatches an event and moves on. That's the power of event-driven architecture.

## Common Mistakes and Fixes

### 1. Fat Events That Do Too Much

Events should carry data, not business logic. They describe what happened -- they don't decide what to do about it.

```php
// Bad -- the event does the processing
class PostCreatedEvent
{
    public function process(): void
    {
        $this->sendEmail();
        $this->updateIndex();
        $this->logCreation();
    }
}

// Good -- the event carries data, listeners do the work
class PostCreatedEvent
{
    public function __construct(private object $post) {}
    public function getPost(): object { return $this->post; }
}
```

### 2. Relying on Listener Order

Don't write listeners that assume they'll run in a specific order. If order matters, use a single listener that orchestrates the steps explicitly.

```php
// Bad -- second listener assumes the first already ran
$provider->addListener(PostCreatedEvent::class, function ($event) {
    $event->getPost()->slug = generateSlug($event->getPost()->title);
});
$provider->addListener(PostCreatedEvent::class, function ($event) {
    // Assumes slug is already set -- fragile!
    saveToDatabase($event->getPost());
});

// Good -- one listener handles the ordered workflow
$provider->addListener(PostCreatedEvent::class, function ($event) {
    $post = $event->getPost();
    $post->slug = generateSlug($post->title);
    saveToDatabase($post);
});
```

### 3. Not Using Stoppable Events

When you want to short-circuit processing -- like validation where one failure should stop everything -- use StoppableEventInterface.

```php
class ValidationEvent implements StoppableEventInterface
{
    private array $errors = [];

    public function addError(string $error): void
    {
        $this->errors[] = $error;
    }

    public function isPropagationStopped(): bool
    {
        // Stop as soon as we find any error
        return count($this->errors) > 0;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
```

## Framework Integration

### Laravel

Laravel's event system follows the same pattern, though it predates PSR-14:

```php
// Dispatch an event
Event::dispatch(new PostCreated($post));

// Register a listener in EventServiceProvider
protected $listen = [
    PostCreated::class => [
        SendNotification::class,
        UpdateSearchIndex::class,
    ],
];
```

### Symfony

Symfony's EventDispatcher component is PSR-14 compliant. You can register listeners with PHP attributes:

```php
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: PostCreatedEvent::class)]
class SendNotificationListener
{
    public function __invoke(PostCreatedEvent $event): void
    {
        // Send notification for the new post
    }
}
```

## Try It Yourself

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
composer test -- --filter=PSR14
```

See `src/Event/` for the blog API's event dispatcher implementation.

## What's Next

Next, we'll dive into the HTTP stack, starting with [PSR-7: HTTP Message Interfaces](/psr-7-http-message-interfaces/) -- the standard that defines how PHP represents HTTP requests and responses.

## Resources

- [Official PSR-14 Specification](https://www.php-fig.org/psr/psr-14/)
- [PHP-FIG Website](https://www.php-fig.org)

Baamaapii 👋
