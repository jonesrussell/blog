# Sequencing — Dependencies, Parallelization, Deferred

## Dependency graph

```
W1a  (NC envelope + NER + excerpt + language)
 │
 ├──▶ W1b (NC cross-item clustering)          [enriches W2 outputs; not gating]
 │
 └──▶ W2  (blog subscriber + entity indexes)
         │
         ├──▶ W3 (weekly roundup, consumer-side synthesis)
         │
         └──▶ W5 (intake unification)

W4  (Substack output)                         [independent; parallel from day one]
```

## Blocks / Blocked-by, per workstream

| Workstream | Blocked by | Blocks |
|---|---|---|
| W1a | — | W1b, W2, W5 |
| W1b | W1a | (none in v1; enriches W2 outputs if present) |
| W2  | W1a | W3, W5 |
| W3  | W2 | — |
| W4  | — | — |
| W5  | W1a, W2 | — |

Note: W3 does **not** depend on NC window-query. W2's local envelope index
serves both entity fan-in and window queries for the weekly roundup.

## Parallelization plan

- **Day one:** W1a and W4 run in parallel. No shared repo surface, no shared
  schema.
- **After W1a lands:** W1b and W2 both unblock. They run in parallel. W2 does
  not wait on W1b — the envelope fields W1b adds are optional for W2's MVP.
- **After W2 lands:** W3 and W5 both unblock. They run in parallel.
- **Critical path:** W1a → W2 → {W3 or W5}. Four workstreams deep on the
  critical path. W1a is the single biggest time risk and highest-value lock.

## Deferred (not in v1)

- **NC window-query HTTP API** (previously sized as W1c).
  - *Rationale:* W2 requires a local envelope index in the blog for entity
    fan-in against queue issues and published posts. That same index serves
    the weekly roundup's window queries, so NC does not need to expose one
    for v1. W1c has no v1 consumer.
  - *Promote when:* a second consumer (Minoo, Miikana, etc.) needs window
    queries against NC envelopes from outside the blog process.

- **NC-hosted synthesis service** for compound signals.
  - *Rationale:* Locked in the ADR. v1 synthesizes consumer-side from the
    local envelope index.
  - *Promote when:* a second consumer wants the same digest (weekly roundup,
    sector-specific summary, etc.) emitted as a primary NC signal. Lift the
    blog's synthesis logic into an NC sub-service at that point.

## Order-of-deferral if time pressure

If the v1 scope has to shrink, defer in this order:

1. **W1b first.** Dedup/clustering is additive. W2 can ship without it and
   gracefully accept the fields when NC starts emitting them.
2. **W3 second.** The weekly roundup continues to run as the current Cowork
   scheduled task. Promote to the pipeline after W2 stabilizes.
3. **W5 third.** Existing intakes keep their legacy shapes. New intakes (W3)
   and new channels (W4) use the unified envelope. Parity migration becomes
   its own later initiative.

**W1a and W2 are non-negotiable for v1.** Without them there is no initiative.
W4 is independent and small enough to keep even under pressure.
