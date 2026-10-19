---
title: "A PSR-14 dispatcher does not promise Symfony's second argument"
date: 2026-10-19
categories: [php]
tags: [php, psr14, symfony, waaseyaa]
summary: "Keep event dispatch calls within the interface you inject, using a small Waaseyaa fix as a practical example."
slug: "psr-14-dispatcher-second-argument"
devto_id: 4879890
draft: false
devto: true
---

Ahnii!

If your constructor accepts `Psr\EventDispatcher\EventDispatcherInterface`, call `dispatch()` with one argument. [Symfony's dispatcher](https://github.com/symfony/event-dispatcher/blob/v7.3.0/EventDispatcher.php) supports an optional event name, but the PSR interface does not promise that parameter.

A small [Waaseyaa fix](https://github.com/waaseyaa/framework/commit/4ac878ed2999ca9c6860c90a277b0f75430f9f84) shows how an implementation-specific convenience can slip into code that declares a portable dependency.

## Read the interface you inject

The [PSR-14 dispatcher interface](https://www.php-fig.org/psr/psr-14/) declares this method:

```php
public function dispatch(object $event);
```

The event object is the only argument in that contract. A concrete dispatcher may offer more, but callers depending on the PSR interface cannot assume those additions exist.

For example, this call relies on an extra parameter:

```php
$dispatcher->dispatch($event, $event::class);
```

Symfony accepts an optional event name in that position. In its implementation, leaving the name out uses the event object's class. When the second argument is already that class name, it is redundant for Symfony's normal dispatch behavior.

The portable call is shorter:

```php
$dispatcher->dispatch($event);
```

This stays within the PSR interface. Listener selection still belongs to the dispatcher and its listener provider; PSR-14 does not prescribe a second naming argument.

## The Waaseyaa change

In the linked revision, `EntityRepository` depends on the PSR dispatcher interface. Its persistence path dispatched an `EntityPersistedEvent` and also supplied `EntityPersistedEvent::class` as the second argument.

The repair removed that argument. The messaging subscriber already registered its listener under the event class, so the call could use Symfony's default class-based name.

The event stayed at the same point in the persistence transaction. Removing an argument did not move the listener to a later notification phase or change when the transaction commits.

That distinction matters when reviewing a small compatibility fix: check both the call signature and the behavior surrounding the call.

## When you need a custom event name

An application may intentionally use names that differ from the event class. In that case, make the requirement explicit.

[Symfony's event-dispatcher contract](https://github.com/symfony/event-dispatcher-contracts/blob/v3.6.0/EventDispatcherInterface.php) exposes the optional event-name parameter. Depending on that contract tells readers and static analysis which behavior your code requires. It also makes the Symfony dependency visible.

Before changing a dispatch call, check:

- **The imported interface.** PSR and Symfony both have an `EventDispatcherInterface`; the namespace matters.
- **The listener registration.** Confirm whether listeners use the event class or a custom name.
- **The surrounding behavior.** Preserve transaction boundaries, listener ordering and exception handling unless the change explicitly targets them.
- **The verification.** Run static analysis and the focused dispatch tests. Successful execution with one concrete dispatcher does not establish compatibility with every implementation of the interface.

For the broader event model, see the [PSR-14 walkthrough]({{< relref "psr-14-event-dispatcher" >}}). For a small dependency fix, start with the interface named in your constructor and make the call match it.

Baamaapii
