---
categories:
    - go
date: 2026-08-31T00:00:00Z
devto: true
devto_id: 4556997
draft: false
slug: idempotent-budget-bounded-queries-sqlite
summary: How northway's SQLite store keeps paid AI-provider queries idempotent and budget-bounded, using a single writer, lease-based claims, and a reserve-then-settle spend model.
tags:
    - go
    - sqlite
    - concurrency
    - api-design
title: Idempotent, budget-bounded AI queries on a single SQLite writer
---

Ahnii!

[northway](https://github.com/jonesrussell/northway) is a Go service that turns approved sources into small, ranked, source-backed news feeds for AI agents — one process, embedded SQLite, deployed Pi-first. Every feed query that reaches an AI provider costs real money, and a network retry or a crashed request must never turn into a second charge for the same query. `internal/sqlite` is what makes that guarantee hold: one writer, scoped credentials, a reserve-then-settle budget, and an idempotent claim lifecycle for the provider call itself.

## One writer, strictly locked

`Store` owns a single SQLite file and refuses to share it. `Open` takes an `flock`-style exclusive lock on the database file and requires the directory to be private:

```go
if !info.IsDir() || info.Mode().Perm()&0077 != 0 {
    return nil, "", errors.New("database directory must be private (0700) and not a symlink")
}
```

Writes go through one `*sql.DB` with `_txlock=immediate`, and a buffered channel (`writeGate`) serializes callers before any transaction opens:

```go
func (s *Store) write(ctx context.Context, fn func(*sqlc.Queries) error) error {
    select {
    case s.writeGate <- struct{}{}:
    case <-ctx.Done():
        return ctx.Err()
    }
    defer func() { <-s.writeGate }()
    tx, err := s.writer.BeginTx(ctx, nil)
    ...
}
```

Reads use a separate read-only pool (`query_only(1)`) with up to two connections, so lookups never queue behind the write gate. WAL mode, `foreign_keys(1)`, and `synchronous(FULL)` are all asserted — not just set — by `Ready()`, which fails startup if the file's actual pragmas don't match what the binary expects.

## Scoped keys, one cross-tenant lookup

Every credential is tenant-scoped. `identity.go` stores a key's SHA-256 digest, never the key itself, and validates the full record shape before writing:

```go
if key.TenantID != tenant || !identity.ValidKeyID(key.ID) || !key.Scopes.Valid() ||
    !validTimestamp(key.CreatedAt) || key.Digest == [32]byte{} ||
    key.LastUsedAt != nil || key.RevokedAt != nil {
    return errors.New("invalid key metadata")
}
```

`LookupAPIKey` is deliberately the **only** function in the package that resolves a key without an existing tenant scope — its own comment spells out the boundary: it "exposes no corpus data and is consumed only by identity.Service, never a public lookup endpoint." Everything downstream of that lookup — `TouchAPIKey`, `RevokeAPIKey`, every query and mutation — takes a `tenant` and checks access before touching a row.

## Reserve first, settle later

Budgets are tracked in micros (`LimitMicros`, `SpentMicros`, `HeldMicros`) and set through an operator-only call:

```go
func (s *Store) SetBudget(ctx context.Context, principal identity.Principal, limitMicros int64) error {
    tenant, err := principal.RequireOperator()
    ...
}
```

The spend itself never just decrements a counter after the fact. A query first **reserves** a worst-case amount; only once the real cost is known does it **settle** the difference back. That two-step is what makes an in-flight AI call safe to retry, fail, or recover from a crash without double-billing.

## The query claim lifecycle

`BeginQuery` is the entry point, and it's built to be replay-safe. It hashes the caller's idempotency key together with the endpoint (`sha256("POST /v1/feed-queries\x00" + key)`) and looks for existing work under that hash:

- **Cache hit** (same feed/corpus/entitlement/ranker revision as an existing snapshot) → returns the cached result, no budget touched.
- **Existing work found, same request digest** → returns the in-progress or completed claim; a second call with the same key can never start a second paid attempt.
- **Existing work found, different request digest** → `ErrConflict`. Reusing an idempotency key for a different request is rejected outright.
- **No existing work, budget configured** → reserves `policy.WorstCaseMicros` and returns a `WorkID` the caller can use to actually invoke the provider.
- **No existing work, no budget** → still creates work, but `ProviderAllowed` is false — the caller is limited to deterministic (non-AI) results.

The function's own comment is blunt about the safety property: "A replay never returns WorkID, so it cannot authorize another call."

From there, three methods carry a claim through its lifecycle:

| Call | Precondition | Effect |
| --- | --- | --- |
| `StartProvider` | work is `pending`, spend is `reserved`, lease not expired, scope unchanged | flips spend to `started` — must commit *before* the provider is actually called |
| `CompleteQuery` | work is `pending`, lease valid, feed/entitlement revision unchanged | validates every selected article against current storage, settles spend, writes an immutable snapshot |
| `FailQuery` | work is `pending` | settles the hold as `uncertain` if the provider had started, marks work `failed` |

`StartProvider`'s doc comment states the ordering guarantee directly: "An error/ambiguous commit never authorizes a call... No provider code runs inside storage." The database transaction is the gate, not the HTTP call to the provider.

`CompleteQuery` re-checks the feed's revision and each selected article's content hash before it will settle spend or write a snapshot — an unrelated ingest arriving mid-request can't get charged for or attached to a query that started against older data.

## Recovering from crashes without guessing

Every claim carries a `LeaseUntil`. If a process dies mid-call, the spend is left in `reserved` or `started`, not silently lost or silently spent. `RecoverQueries` sweeps expired leases and fails them the same way `FailQuery` would — its comment notes it processes bounded batches and "preserves uncertain holds," since an operator later needs to reconcile those, not assume they were free.

That reconciliation is `ReconcileQuery`, and it requires actual evidence, not elapsed time, before it will move a hold out of `uncertain`:

```go
if w.SpendState == "settled" {
    if w.ActualMicros.Int64 == actualMicros {
        return nil
    }
    return query.ErrConflict
}
if w.SpendState != "uncertain" {
    return query.ErrConflict
}
```

Repeating the same settlement is a safe no-op; a contradictory number is rejected outright rather than silently overwritten.

## Timestamps get the same suspicion

Money isn't the only thing storage refuses to trust blindly. `timestamps_test.go` asserts that out-of-range values — before the epoch, past `9999-12-31`, or offsets that push a boundary value across it — are rejected on write and never partially applied:

```go
"positive wrap":    time.Date(600000, 1, 1, 0, 0, 0, 0, time.UTC),
"offset past end":  time.Date(9999, 12, 31, 23, 0, 0, 0, time.FixedZone("west", -3600)),
```

A rejected write leaves the row, its version history, and its full-text index completely unchanged — the test checks the version count and search index directly, not just the returned error.

## Why this shape

None of this is exotic SQLite usage — WAL mode, a single writer, a lease column. What makes it hold together is that every step that touches money or identity states its own precondition in code, not just in a comment: wrong state, expired lease, mismatched revision, or a reused key against a different request all fail the transaction outright. For a Raspberry Pi-deployed, single-process service fronting paid AI calls, that's the difference between "retry-safe" as a claim and as a property you can point to in the diff.

Baamaapii
