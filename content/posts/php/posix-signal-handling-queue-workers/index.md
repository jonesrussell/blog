---
title: "POSIX signal handling for graceful PHP queue workers"
date: 2026-03-28
categories: [php]
tags: [php, waaseyaa, queues, linux]
summary: "How to handle SIGTERM and SIGINT in a PHP queue worker so jobs finish cleanly instead of dying mid-process."
slug: "posix-signal-handling-queue-workers"
draft: true
devto: true
---

Ahnii!

When you deploy a PHP queue worker behind systemd or a container orchestrator, the process receives SIGTERM on shutdown. If you do nothing, the worker dies mid-job. This post covers how the [Waaseyaa](https://github.com/waaseyaa/waaseyaa) queue package handles POSIX signals for graceful shutdown, and how to add the same pattern to your own workers.

## The problem with killing queue workers

A long-running PHP worker sits in a loop: pop a job, process it, pop the next one. When systemd sends SIGTERM (or you press Ctrl+C for SIGINT), PHP's default behavior is to terminate immediately. If a job is halfway through writing to the database, you get partial state.

The fix is to catch the signal and set a flag that tells the loop to stop after the current job finishes.

## Registering signal handlers

The [Waaseyaa](https://github.com/waaseyaa/waaseyaa) `Worker` class registers handlers in a dedicated method called before the main loop:

```php
private bool $shouldQuit = false;

private function listenForSignals(): void
{
    if (!\function_exists('pcntl_signal')) {
        return;
    }

    pcntl_signal(\SIGTERM, fn () => $this->shouldQuit = true);
    pcntl_signal(\SIGINT, fn () => $this->shouldQuit = true);
}
```

Each handler does one thing: set `$shouldQuit` to `true`. The guard on `function_exists` lets the worker run on systems without the `pcntl` extension (like Windows or restricted containers), but without graceful shutdown.

The key is that setting a flag does not interrupt the current job. The worker finishes whatever it is doing, then checks the flag.

## The worker loop

The main `run()` method calls `listenForSignals()` once, then enters a loop that checks `shouldContinue()` on every iteration:

```php
public function run(string $queue, WorkerOptions $options): int
{
    $this->listenForSignals();

    $startTime = time();
    $processed = 0;

    while ($this->shouldContinue($options, $processed, $startTime)) {
        $raw = $this->transport->pop($queue);

        if ($raw === null) {
            sleep($options->sleep);
            continue;
        }

        $this->processJob($raw, $queue, $options);
        $processed++;
    }

    return $processed;
}
```

When a signal arrives, `$shouldQuit` flips to `true`. But the current call to `processJob()` runs to completion. The loop only exits on the next `shouldContinue()` check.

## Dispatching pending signals

PHP does not process signals automatically in userland code. You need to call `pcntl_signal_dispatch()` to check for pending signals. The `shouldContinue()` method does this on every iteration:

```php
private function shouldContinue(WorkerOptions $options, int $processed, int $startTime): bool
{
    if ($this->shouldQuit) {
        return false;
    }

    if (\function_exists('pcntl_signal_dispatch')) {
        pcntl_signal_dispatch();
    }

    if ($options->maxJobs > 0 && $processed >= $options->maxJobs) {
        return false;
    }

    if ($options->maxTime > 0 && (time() - $startTime) >= $options->maxTime) {
        return false;
    }

    if (memory_get_usage(true) / 1024 / 1024 >= $options->memoryLimit) {
        return false;
    }

    return true;
}
```

The method also enforces max jobs, max time, and memory limits. These give you additional ways to recycle workers without relying on signals alone.

## Configuring worker options

The `WorkerOptions` value object holds all the knobs:

```php
final class WorkerOptions
{
    public function __construct(
        public readonly int $sleep = 3,
        public readonly int $maxJobs = 0,
        public readonly int $maxTime = 0,
        public readonly int $memoryLimit = 128,
        public readonly int $timeout = 60,
        public readonly int $maxTries = 3,
    ) {}
}
```

`sleep` controls how long the worker waits when the queue is empty. `maxJobs` and `maxTime` let you restart workers periodically, which is useful for avoiding memory leaks in long-running PHP processes.

## Pairing with systemd

In your systemd unit file, set `TimeoutStopSec` high enough for your longest job to finish:

```ini
[Service]
Type=simple
ExecStart=/usr/bin/php bin/waaseyaa queue:work --queue=default
Restart=always
TimeoutStopSec=30
```

When systemd sends SIGTERM, the worker has 30 seconds to finish the current job before systemd escalates to SIGKILL. Set this higher than your longest expected job duration.

## Testing graceful shutdown

You can call the public `stop()` method directly in tests to simulate a signal:

```php
public function test_worker_stops_after_current_job(): void
{
    // Push two jobs to the queue
    $this->transport->push('default', serialize(new TestJob('first')));
    $this->transport->push('default', serialize(new TestJob('second')));

    // Tell the worker to stop after processing starts
    $this->worker->stop();

    $processed = $this->worker->run('default', new WorkerOptions(maxJobs: 10));

    // Worker should have processed at most 1 job before stopping
    $this->assertLessThanOrEqual(1, $processed);
}
```

The `stop()` method sets `$shouldQuit = true`, which is the same thing the signal handler does. This avoids needing to send real POSIX signals in your test suite.

Baamaapii
