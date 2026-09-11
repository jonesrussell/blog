---
categories:
    - php
    - waaseyaa
date: 2026-09-11T00:00:00Z
devto: true
draft: false
slug: unhandled-queue-message-silent-ack
summary: How Waaseyaa's queue worker silently acknowledged persistent messages with no matching handler, and the fail-closed fix that routes them through retry and the failed-job repository instead.
tags:
    - php
    - waaseyaa
    - queue
    - reliability
title: Fixing a silent message-drop bug in Waaseyaa's queue worker
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/queue` package runs background jobs through a `Worker` that pops a message off a transport and hands it to whichever handler in its roster `supports()` that message type. If nothing in the roster claimed a message, the worker didn't fail the delivery — it just finished the loop, returned normally, and acknowledged the message as done. Here's the bug, the fix, and why "no handler matched" needs to be a failure, not a no-op.

## The Bug: An Empty Loop Still Counts as Success

`Worker::handleMessage()` walked the handler list looking for the first one that supported the message:

```php
private function handleMessage(object $message): void
{
    foreach ($this->handlers as $handler) {
        if ($handler->supports($message)) {
            $handler->handle($message);

            return;
        }
    }
}
```

If no handler supports the message, the loop just runs out. The method returns void either way, so from the caller's point of view a message nobody handled looks identical to a message a handler successfully processed. `processJob()` treats that return as success and acks the delivery:

```php
try {
    // ... envelope/occurrence handling ...
    $this->handleMessage($message);
    // ...
    $this->transport->ack($raw['id']);
} catch (\Throwable $e) {
    $this->handleFailure($raw, $queue, $message, $e, $options, $envelope?->occurrence);
}
```

`QueueInterface`/`DbalQueue` accept any object for dispatch, not just `Job` — but the worker's own handler roster, by default, only knows how to run `Job`. Dispatch a plain message object with no registered handler and the worker pulls it off the queue, runs an empty loop, and acks it. No retry, no dead-letter row, nothing written to the failed-job repository. The durable row just disappears, and nothing downstream can tell the difference between "handled" and "nobody was listening."

## The Fix: Throw Instead of Falling Through

The fix adds a typed, payload-free exception:

```php
final class UnhandledQueueMessage extends \RuntimeException
{
    public function __construct(object $message)
    {
        parent::__construct(sprintf(
            'No queue handler supports message type "%s".',
            $message::class,
        ));
    }
}
```

and `handleMessage()` throws it once the roster is exhausted instead of returning:

```php
private function handleMessage(object $message): void
{
    foreach ($this->handlers as $handler) {
        if ($handler->supports($message)) {
            $handler->handle($message);

            return;
        }
    }

    throw new UnhandledQueueMessage($message);
}
```

That single `throw` is enough to route an unsupported message through machinery `processJob()` already had for every other kind of failure. A few things about that path are worth calling out:

- **It reuses the existing retry policy.** The `catch` block hands the exception to `handleFailure()`, which applies the worker's normal bounded retry/backoff — `Job::$tries` for jobs, `WorkerOptions::$maxTries` otherwise (three attempts by default for non-`Job` messages).
- **The failure record names only the class, not the payload.** `UnhandledQueueMessage`'s message is `No queue handler supports message type "..."` — useful for an operator, safe to log.
- **Ordering matters.** The failed-job row is persisted *before* the delivery is rejected. If the failed-job repository itself is down, the rejection doesn't happen either, so the message stays reserved for lease recovery instead of being lost a second way.
- **Nothing about dispatch changed.** `QueueInterface` still accepts any object. This isn't about narrowing what you're allowed to queue — it's about not silently discarding what the worker can't run.

The package README now says this out loud instead of leaving it to be discovered:

> Persistent dispatch accepts any object, but successful consumption requires a supporting worker handler. If no handler supports an accepted message, `Worker` raises a typed `UnhandledQueueMessage` failure and applies its configured bounded retry/backoff policy. On exhaustion, the signed payload and failure are stored in the failed-job repository before the delivery is rejected; it is never silently acknowledged.

## Verifying It

A new `QueueServiceProviderUnhandledMessageTest` drives the fix through the real database-backed composition — `QueueServiceProvider`, `DbalQueue`, `DbalTransport`, and `DatabaseFailedJobRepository` — instead of a bare `Worker` in isolation:

| Test | What it proves |
|---|---|
| `acceptedUnsupportedMessageRetriesThenFailsDurablyInsteadOfBeingAcknowledged` | An unsupported message is released once on the first attempt, then durably failed and recorded on the second — never silently acked |
| `firstSupportingCustomHandlerExecutesOnceAndAcknowledgesNormally` | A message with a matching handler still runs exactly once and acks normally |
| `providerJobHandlerStillExecutesVoidJobAndAcknowledgesNormally` | Existing `Job` dispatch through the provider is unaffected |

A fourth case, `failedRepositoryOutagePreservesUnsupportedDeliveryForLeaseRecovery`, goes the other way on purpose: it's added to the existing `WorkerTest` and wires up a bare `Worker` with a stub `FailedJobRepositoryInterface` that throws on `record()` — not something you can provoke on demand through the real `DatabaseFailedJobRepository`. That's the test that would have caught a version of this fix that traded "silently ack an unhandled message" for "silently lose it if the failed-job store is unavailable": when the stub throws, the delivery stays `in_progress` for lease recovery instead of vanishing a second way.

Both files pass alongside the rest of the suite. The queue package's unit and contract tests ran at **236 tests, 629 assertions** after the change — the provider-composition cases alone account for 3 tests and 40 assertions, the outage control for 1 test and 5 assertions.

## The General Lesson

A dispatch loop that runs out of candidates without doing anything is easy to write and easy to miss, because "no handler matched" doesn't read like an error — it reads like the absence of work. But a message pulled off a durable queue was never optional work; it's a promise made to whoever dispatched it. If your dispatch loop can finish without ever calling a handler, and the caller can't tell that apart from a real success, you don't have a queue — you have a way to accept work and then forget it happened. The fix here was one `throw` statement. What made it correct was that it plugged into retry, backoff, and dead-letter paths that already existed, instead of inventing a bespoke error path for one more corner case.

Baamaapii
