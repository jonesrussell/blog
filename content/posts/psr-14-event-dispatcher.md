---
title: "PSR-14: Event Dispatcher in PHP"
date: 2025-02-17
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-14, events]
summary: "Explore PSR-14's event dispatcher interface, understand event-driven architecture in PHP, and learn best practices for implementing event systems."
slug: "psr-14-event-dispatcher"
draft: true
---

PSR-14 defines a standard interface for event dispatching in PHP applications. This standardization enables libraries and applications to communicate through events in a framework-agnostic way, promoting loose coupling and better extensibility.

## Core Concepts

### 1. Event Objects

Events are simple objects that carry data about something that happened:

```php
<?php

class UserRegisteredEvent
{
    public function __construct(
        private User $user,
        private \DateTimeImmutable $registeredAt
    ) {}

    public function getUser(): User
    {
        return $this->user;
    }
}
```

### 2. Event Listeners

Listeners are callables that receive and process events:

```php
<?php

class SendWelcomeEmailListener
{
    public function __invoke(UserRegisteredEvent $event): void
    {
        $user = $event->getUser();
        $this->emailService->sendWelcomeEmail($user);
    }
}
```

## The PSR-14 Interfaces

### EventDispatcherInterface

```php
<?php

namespace Psr\EventDispatcher;

interface EventDispatcherInterface
{
    public function dispatch(object $event): object;
}
```

### ListenerProviderInterface

```php
<?php

namespace Psr\EventDispatcher;

interface ListenerProviderInterface
{
    public function getListenersForEvent(object $event): iterable;
}
```

## Best Practices

1. **Event Naming and Structure** - Use specific events with clear purpose
2. **Listener Organization** - Single responsibility listeners

## Resources

- [Official PSR-14 Specification](https://www.php-fig.org/psr/psr-14/)

Baamaapii 👋
