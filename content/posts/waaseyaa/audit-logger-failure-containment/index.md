---
categories:
    - php
    - waaseyaa
date: 2026-09-08T00:00:00Z
devto: true
draft: false
slug: audit-logger-failure-containment
summary: Why a throwing audit logger in Waaseyaa's MCP endpoint could crash a request after its outcome was already decided, and the containment pattern that fixed it.
tags:
    - php
    - waaseyaa
    - logging
    - mcp
title: Stop letting a failing audit logger crash requests that already succeeded
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s MCP endpoint writes a durable audit record around every tool call: a reservation before the tool runs, a terminal record after. That ledger is deliberately fail-closed — if it can't record a write attempt, the write is refused. But the code path that *reports* a ledger failure to the application logger had the opposite problem: it was fail-open in the worst way. If the logger itself threw, the throw escaped uncaught, after the real outcome had already been decided. Here's the bug, the fix, and the worse variant of the same gap one layer up.

## The bug: a logger call with no safety net

`AuditedToolDispatcher::finalizeQuietly()` runs after a tool has already executed. It tries to write the terminal audit record, and if that write fails, it reports the failure — but the report itself wasn't guarded:

```php
private function finalizeQuietly(StrictAuditReceipt $receipt, AuditStage $stage, string $toolName): void
{
    try {
        $this->ledger->finalize($receipt, $stage, $this->metadata);
    } catch (\Throwable $e) {
        $this->reportAuditFailure('agent_tool.audit_finalize_failed', [
            'correlation_id' => $this->correlationId,
            'surface' => $this->surface,
            'receipt_id' => $receipt->id,
            'tool' => $toolName,
            'stage' => $stage->value,
            'exception' => $e::class,
            'note' => 'Dangling reservation: outcome unknown, side effect may have committed.',
        ]);
    }
}
```

Before the fix, `reportAuditFailure()` called `$this->logger?->critical(...)` directly. If the logger itself threw — a broken handler, a full disk, a downed log shipper — that `critical()` call escaped `dispatch()` as an uncaught exception, even though the tool had **already run and its side effect had already committed**. The caller would see a crash instead of the completed result, and a naive retry would repeat an action that already happened.

Two sibling call sites in the same class — `agent_tool.audit_reservation_failed` and `agent_tool.audit_terminal_record_failed` — had the identical unguarded shape. All three report an outcome that is already final; none of them should be able to overturn it.

## The fix: swallow the logger's own failures

The fix wraps every one of those report sites in a private helper that catches and discards:

```php
private function reportAuditFailure(string $event, array $context): void
{
    try {
        $this->logger?->critical($event, $context);
    } catch (\Throwable) {
        // Deliberately empty — see method doc.
    }
}
```

The empty catch is intentional, not an oversight. The method's docblock spells out why the failure isn't re-logged: there's no framework `LoggerInterface` convention for logging a logging failure, recursing into a broken sink risks looping, and `error_log()` is reserved for the logging infrastructure itself rather than its callers. A logging failure must never be allowed to replace a caller-visible outcome with an unrelated crash — so the safest thing the helper can do is nothing.

## The same gap, one layer up — with a worse ordering problem

`McpEndpoint` (the layer above `AuditedToolDispatcher`) dispatches `tools/call` directly, so nothing downstream catches for it. It carried the identical unguarded logger call at its own post-execution finalize path — meaning a throwing logger there became an HTTP transport failure for a write that had *already committed*. `McpEndpoint` got its own `reportAuditFailure()`, deliberately duplicated rather than shared: `mcp` is Layer 6 and `ai-tools` is Layer 5 in Waaseyaa's layering, and a containment detail doesn't justify a new cross-package public symbol.

A follow-up sweep found **six more unguarded sites** in `McpEndpoint`, all at `error()` level rather than `critical()`:

- the rate-limiter durability check
- the protocol dispatch path
- the resource dispatch path
- the malformed-response branches

Those got a sibling helper:

```php
private function reportOperationalFailure(string $event, array $context): void
{
    try {
        $this->logger?->error($event, $context);
    } catch (\Throwable) {
        // Deliberately empty — see method doc.
    }
}
```

This family turned out to have a worse failure mode than the audit-critical one, even though it guards no committed side effect. Four of its six call sites report **before** their own `auditTerminal()` call:

```php
try {
    $response = $handler();
} catch (\Throwable $e) {
    $this->reportOperationalFailure('mcp.protocol_execution_failed', [
        'correlation_id' => $correlationId,
        'method' => $method,
        'exception' => $e::class,
    ]);

    $this->auditTerminal(
        AuditStage::ExecutionFailed,
        $correlationId,
        $actorUid,
        $method,
        $method,
        [],
        ['reason' => 'protocol_handler_threw', 'exception' => $e::class],
    );
    // ...
}
```

An unguarded throw at `reportOperationalFailure()` here wouldn't just crash the request — it would also skip the `auditTerminal()` call three lines below, silently erasing the terminal audit record for a request that already failed. That's a strictly worse outcome than the `reportAuditFailure()` gap, where the reported outcome is always already decided *and* recorded.

## What changed

| Site | Level | Reports relative to outcome | Guard added |
| --- | --- | --- | --- |
| `AuditedToolDispatcher` reservation/terminal/finalize | `critical` | After outcome is final | `reportAuditFailure()` |
| `McpEndpoint` reservation/finalize/approval paths | `critical` | After outcome is final | `reportAuditFailure()` (duplicated per layer) |
| `McpEndpoint` rate limiter, protocol/resource dispatch, malformed response | `error` | 4 of 6 **before** `auditTerminal()` | `reportOperationalFailure()` |

## How it was tested

Both fixes came with a `ThrowingLogger` test double driven through the real request boundary — `dispatch()` for the ai-tools side, `serve()` for MCP — not by calling the private helpers directly. Each test followed the same discipline:

- **Red first.** Verified against the unmodified code, failing at the exact line the throw would have escaped from.
- **Green after.** Re-run once the guard was added.
- **Two assertions per `error()`-level site.** For the four sites that precede their own `auditTerminal()` call, each test checks that the request still completes *and* that the terminal audit record still gets written despite the broken logger.
- **Reflection for the unreachable branches.** Two malformed-response branches can't be hit through any conforming handler, so those are driven directly on the private methods via reflection.

## The general lesson

Audit and observability code that runs *after* a decision has already been made must never be allowed to overturn that decision. If a logging call inside a catch block can throw, and nothing catches that throw, your logger has quietly become a second failure mode for every code path that touches it — one your test suite may never exercise, because tests almost always run against a logger that works. The fix isn't clever: catch `\Throwable` around the logging call itself, swallow it, and don't try to log the failure to log. But you have to go looking for every site with that shape, because a refactor can reintroduce an unguarded one without any test noticing — unless you specifically test with a logger that fails.

Baamaapii
