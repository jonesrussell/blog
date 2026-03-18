---
title: "Building a temporal layer so your AI never lies about time"
date: 2026-03-19
categories: [ai, php]
tags: [claudriel, php, temporal, testing]
series: ["waaseyaa"]
series_order: 3
series_group: "Main"
summary: "How Claudriel's temporal subsystem pins time per request, resolves timezones from context, and detects clock drift before it corrupts AI reasoning."
slug: "claudriel-temporal-layer"
draft: false
---

Ahnii!

> **Series context:** This post builds on the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Claudriel is an AI personal operations system built on the Waaseyaa framework. You don't need to have read the earlier posts, but they cover the entity system and architecture that this temporal layer sits on top of.

Most applications treat time as a free function call. Need the current time? `new DateTime()`. Need it again three lines later? `new DateTime()` again. In a request that takes 200ms, nobody notices the two-millisecond difference between those calls.

An AI system that reasons about your schedule, detects drifting commitments, and nudges you before meetings does notice. If the commitment extractor captures "now" at 14:00:00.003 and the drift detector captures it at 14:00:00.217, you get inconsistent temporal reasoning. Worse, if the system clock drifts from reality and nobody checks, every time-based decision is quietly wrong.

This post covers Claudriel's `Temporal` subsystem: how it pins time per request, resolves the right timezone from context, and monitors clock health before letting agents reason about your schedule.

## The Core Problem: Scattered Time Calls

The naive approach looks like this:

```php
// In the commitment extractor
$extractedAt = new \DateTimeImmutable();

// 50ms later, in the drift detector
$checkedAt = new \DateTimeImmutable();

// These are different instants. Now your "simultaneous"
// checks disagree about what time it is.
```

In isolation, the difference is trivial. But when four components in a single request each capture their own "now," you get four slightly different timestamps in the same response. Temporal agents comparing those timestamps draw wrong conclusions.

The fix is simple in concept: capture time once, share it everywhere.

## AtomicTimeService

`AtomicTimeService` is the single source of time for any request. It captures a `TimeSnapshot` that bundles wall-clock time, monotonic time, and timezone into one immutable object.

```php
final class AtomicTimeService
{
    public function now(
        ?string $scopeKey = null,
        ?\DateTimeZone $timezone = null,
    ): TimeSnapshot {
        if ($scopeKey === null) {
            return $this->captureSnapshot($timezone);
        }

        return $this->snapshotStore()->remember(
            $this->snapshotScopeKey($scopeKey, $timezone),
            fn () => $this->captureSnapshot($timezone),
        );
    }
}
```

When you pass a `$scopeKey`, the service captures the snapshot once and returns the same instance for every subsequent call with that key. No scope key means a fresh capture every time, which is useful for benchmarking or logging where you want the actual current instant.

The `TimeSnapshot` itself is a value object:

```php
final class TimeSnapshot
{
    public function __construct(
        private readonly \DateTimeImmutable $capturedAtUtc,
        private readonly \DateTimeImmutable $capturedAtLocal,
        private readonly int $monotonicNanoseconds,
        private readonly string $timezone,
    ) {}
}
```

UTC and local time are both captured at construction. Monotonic nanoseconds come from `hrtime()`, which is immune to NTP adjustments and clock corrections. You get wall time for display and monotonic time for duration calculations, both from the same instant.

## RequestTimeSnapshotStore

The scoping mechanism is `RequestTimeSnapshotStore`, an in-memory map that lives for the duration of a single request.

```php
final class RequestTimeSnapshotStore
{
    /** @var array<string, TimeSnapshot> */
    private array $snapshots = [];

    public function remember(string $scopeKey, callable $resolver): TimeSnapshot
    {
        if (!isset($this->snapshots[$scopeKey])) {
            $this->snapshots[$scopeKey] = $resolver();
        }

        return $this->snapshots[$scopeKey];
    }
}
```

This is intentionally simple. The store is not a cache, not a singleton, not a service locator. It holds snapshots for one request and gets garbage collected when the request ends. The `remember` pattern means the first component to ask for time in a given scope defines it for everyone else.

## TimezoneResolver

An AI system that handles your calendar needs to know your timezone. But "your timezone" depends on context. Are you looking at a workspace configured for `America/Toronto`? Did the API request include an explicit timezone header? Does your account have a preference set?

`TimezoneResolver` walks a priority chain:

```php
final class TimezoneResolver
{
    public function resolve(
        mixed $account = null,
        mixed $workspace = null,
        ?string $requestTimezone = null,
    ): ResolvedTimezone {
        // Resolution order:
        // 1. Explicit request override
        // 2. Workspace timezone
        // 3. Workspace metadata/settings
        // 4. Account timezone
        // 5. Account metadata/preferences/settings
        // 6. Default (UTC)
    }
}
```

The resolver returns a `ResolvedTimezone` that carries both the `DateTimeZone` and a `source` string indicating where it came from (`'request'`, `'workspace.timezone'`, `'account.settings.timezone'`, `'default'`). This matters for debugging. When a user says "my times are wrong," you can check the resolution source and trace exactly where the timezone was picked up.

The resolver accepts `mixed` types for account and workspace because it needs to work with entity objects, arrays, and anything else that might carry timezone data. It probes fields and nested paths without assuming a specific object shape.

## TemporalContextFactory

`TemporalContextFactory` ties the pieces together. Given a scope key, tenant, workspace, and optional account, it resolves the timezone and captures a snapshot in one call:

```php
final class TemporalContextFactory
{
    public function snapshotForInteraction(
        string $scopeKey,
        ?string $tenantId = null,
        ?string $workspaceUuid = null,
        mixed $account = null,
        ?string $requestTimezone = null,
    ): TimeSnapshot {
        $workspace = $this->resolveWorkspace($workspaceUuid, $tenantId);
        $timezone = $this->timezoneResolver()
            ->resolve($account, $workspace, $requestTimezone)
            ->timezone();

        return $this->timeService()->now($scopeKey, $timezone);
    }
}
```

Controllers and commands call `snapshotForInteraction()` once at the start of a request. Everything downstream receives the resulting `TimeSnapshot` as a dependency. No component further down the chain calls `new DateTime()` or asks what time it is. They already know.

## ClockHealthMonitor

The temporal layer's most unusual component is `ClockHealthMonitor`. Before letting temporal agents reason about your schedule, Claudriel checks whether the system clock is trustworthy.

```php
final class ClockHealthMonitor
{
    public function assess(string $referenceSource = 'reference-clock'): array
    {
        $sync = $this->syncProbe->read();
        $appNow = $this->timeService->wallNow(new \DateTimeZone('UTC'));
        $referenceNow = $this->referenceClock->now();
        $driftSeconds = abs($referenceNow->getTimestamp() - $appNow->getTimestamp());
        $unsafe = !$sync->synchronized()
            || $driftSeconds > $this->unsafeDriftThresholdSeconds;

        return [
            'state' => $unsafe ? 'unsafe' : 'healthy',
            'safe_for_temporal_reasoning' => !$unsafe,
            'drift_seconds' => $driftSeconds,
            'fallback_mode' => $unsafe ? 'wall-clock-only' : 'none',
            // ...
        ];
    }
}
```

The monitor compares the application's wall clock against a reference clock and checks NTP synchronization status via `ClockSyncProbeInterface`. If drift exceeds the threshold (default: 5 seconds), it marks the state as `unsafe` and sets `safe_for_temporal_reasoning` to false. Downstream agents check this flag. An agent that would normally say "your meeting starts in 3 minutes" stays quiet if it can't trust the clock.

## Temporal Agents

The `TemporalGuidanceAssembler` is where clock health meets schedule awareness. It takes a day brief (your schedule, gaps, overruns) and a `TimeSnapshot`, runs both through a set of specialized agents, and produces notifications:

- `OverrunAlertAgent`: flags when a meeting has gone past its end time
- `ShiftRiskAgent`: warns when back-to-back blocks leave no buffer
- `WrapUpPromptAgent`: nudges you to wrap up before the next block
- `UpcomingBlockPrepAgent`: gives you a heads-up to prepare for what's next

Each agent receives the same `TimeSnapshot`. They all agree on what "now" is. The orchestrator filters their output through a delivery service that deduplicates and manages notification state, so you don't get the same "wrap up" nudge every time the brief refreshes.

## Testing Without Real Clocks

Every component accepts its clock as a constructor dependency. `WallClockInterface` and `MonotonicClockInterface` have system implementations and test doubles:

```php
$fixedWall = new class implements WallClockInterface {
    public function now(): \DateTimeImmutable {
        return new \DateTimeImmutable('2026-03-16T14:00:00Z');
    }
};

$service = new AtomicTimeService(
    wallClock: $fixedWall,
    monotonicClock: new FixedMonotonicClock(1_000_000_000),
);

$snapshot = $service->now('test-scope');
// Always 2026-03-16T14:00:00Z, always 1 second monotonic
```

No global state. No mocking frameworks. Inject the clock, control the time. Tests for temporal agents can simulate "it's 2 minutes before your next meeting" by constructing the right snapshot and clock health state, then asserting the agent produces the expected notification.

## Why This Matters for AI Systems

Traditional web apps can tolerate sloppy time handling. A blog post timestamped 200ms off doesn't matter. But AI systems that reason about your schedule, detect patterns in your behavior, and make proactive suggestions need temporal consistency the same way financial systems need transactional consistency.

The temporal layer is seven classes. It adds no external dependencies. The entire subsystem is injectable and testable. The cost of getting time right is low. The cost of getting it wrong is an AI assistant that confidently tells you the wrong thing about your own schedule.

Next: The entity system at the heart of Waaseyaa.

Baamaapii
