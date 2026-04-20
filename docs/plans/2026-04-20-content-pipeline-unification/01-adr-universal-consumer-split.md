# ADR — Universal/Consumer Enrichment Split

- Status: Accepted
- Date: 2026-04-20
- Supersedes: none

## Context

The blog pipeline needs richer intake: entities, related content, suggested
channels, format fit, relatedness to existing queue and published artifacts.
North Cloud already owns classification, routing, and source registry and emits
per-item signals on Redis. The question: where does enrichment live?

Three positions were considered before the decision.

- **All in NC.** Push every enrichment concern — including "suggested Substack
  vs. Buffer" and "format fit" — into NC. Strongest reuse. Couples NC to
  consumer-specific output taxonomy (Buffer channels, Substack drafts) and
  leaks back when a second consumer (Minoo, Miikana) subscribes.
- **All in blog.** Duplicate NC's existing classification/enrichment in a
  blog-side worker. Independent but re-implements work already done in NC.
  Divergence over time is inevitable.
- **Skill layer only.** Claude Code skills call NC MCP tools and compose the
  issue. Fast to prototype; gives up determinism, batch, and replay — which is
  the whole point of this initiative.

## Decision

Split enrichment by scope, not by location:

- **Universal enrichment is NC's.** "What is this signal?" — identity,
  classification, entities, quality, related content, dedup clusters,
  canonical excerpts. Emitted on the existing routed Redis channels pattern.
  Additive to what NC already does (classifier Steps 1–4 + routing layers).
- **Consumer enrichment is the blog's.** "What to do with this signal?" —
  suggested publishing channels, format fit, audience, the GitHub issue shape,
  stage lifecycle, fan-in against local indexes of queue issues and published
  posts. Blog subscriber translates NC envelope → issue.

### Where synthesis signals live

Per-item signals follow the split above: NC-emitted, blog-consumed.

**Compound/window signals** (digests, roundups, "top 5 breaches this week") do
not fit the per-item model cleanly. For v1:

- Compound signals are **consumer-computed.** The blog maintains a local index
  of NC envelopes (already required for entity fan-in in W2) and runs window
  queries against that index to synthesize digests.
- NC does **not** add a window-query API or a synthesis sub-service in v1.
  The precedent exists (`signal-crawler`, `need_signal*`, `claudriel_lead*`),
  but YAGNI — there is no second consumer.
- **Promotion to NC** is a future initiative, triggered by a second consumer
  (Minoo, Miikana, anyone else) asking for the same digest. When that happens,
  lift the blog's synthesis logic into an NC sub-service and switch the blog
  to subscribe. Consumers that only want per-item signals are unaffected.

This rule is explicit so a future session does not relitigate it on first
contact with the weekly roundup workstream (W3). If you are reading this
because W3 suggested putting synthesis in NC, stop and re-read.

## Consequences

### Positive

- NC stays a signal authority without Buffer/Substack concepts leaking in.
  Future consumers subscribe without inheriting blog-specific output fields.
- Consumer enrichment evolves at the blog's pace without waiting on NC deploys.
- The local envelope index the blog builds in W2 does double duty: entity
  fan-in for per-item signals, window queries for compound signals. No extra
  infrastructure for roundups.
- Synthesis promotion path is pre-designed. When a second consumer wants the
  same digest, the lift is mechanical, not a re-argument.

### Negative

- Two places to edit when adding a new enrichment field. Rule of thumb: if it
  is the same field name for every consumer, it goes in NC; if consumers
  disagree on value, it goes in the consumer.
- The blog holds a local envelope index — small operational footprint but
  real (storage, backfill after a blog outage, schema evolution with NC).
  Mitigated by W2 owning the index technology choice, keyed on NC
  `content_id`.
- Consumer-side synthesis runs per-consumer. Second consumer means duplicate
  work until promotion happens. Acceptable for v1 with one consumer.

## Alternatives rejected

- **Put synthesis in NC now.** One consumer, no reuse to amortize cost. Rejected.
- **Put all enrichment in the skill layer.** Non-deterministic, no batch, no
  replay, no backfill. The initiative explicitly rejects this.
- **Separate "enrichment service" sitting between NC and blog.** Third deploy
  target, no owner, and NC already has most of the data needed. Rejected.
