# Contracts — Envelope, Issue Shape, Wire Format

This doc is the canonical reference for what crosses the wire between North
Cloud and the blog. Any workstream that touches these fields reads this doc
first and updates it on change. Contract is source of truth; code matches.

## North Cloud envelope (universal)

Emitted by NC on Redis, one message per item. Field owners are NC. Consumers
treat fields as read-only.

| Field | Source | Notes |
|---|---|---|
| `content_id` | existing | Stable NC-generated identifier |
| `source_id` | existing | References `source-manager` registry |
| `url`, `canonical_url` | existing | Item URL + canonicalized form |
| `first_seen_at`, `published_at`, `ingested_at` | existing | ISO-8601 |
| `content_type` | classifier Step 1 | article \| page \| video \| image \| job |
| `content_subtype` | classifier Step 1 | press_release \| blog_post \| event \| advisory \| report \| blotter \| company_announcement |
| `quality_score` | classifier Step 2 | 0–100 integer |
| `quality_components` | classifier Step 2 | `{ word_count, metadata, richness, readability }` |
| `spam_flag` | classifier Step 2 | boolean |
| `topics[]` | classifier Step 3 | Priority-ordered topic tag strings from `classification_rules` |
| `topic_scores[]` | classifier Step 3 | Keyed objects. See "Field shapes" below. |
| `source_reputation` | classifier Step 4 | 0–100 integer |
| `domain_tags[]` | publisher routing layers | crime, mining, indigenous, coforge, rfp, etc. |
| `entities[]` | **new (W1a)** | Structured NER output. See "Field shapes" below. |
| `canonical_excerpt` | **new (W1a)** | Normalized plain-text summary. See "Field shapes" below for derivation rule. |
| `language` | **new (W1a)** | ISO-639-1 |
| `dedup_cluster_id` | **new (W1b)** | Shared ID across items telling the same story |
| `related_content_ids[]` | **new (W1b)** | Cross-item "see also" via entity/topic overlap |

Wire format: JSON, one message per Redis `PUBLISH`, channel names following
NC's existing `indigenous:category:{slug}` / `content:{topic}` pattern. New
channels or channel reuse is decided during W1a schema lock.

Consumers must ignore unknown fields and tolerate missing new fields during
rollout. The envelope schema is additive.

## Field shapes (locked)

Shapes below are locked in the contract. W1a and W1b match exactly. If
implementation finds a reason to diverge, edit this doc first.

### `entities[]`

Structured array of NER output. Each entry:

```text
{
  "name": "string",
  "type": "person" | "organization" | "product" | "place" | "event",
  "confidence": number in [0, 1],
  "char_offsets": [start, end] | null
}
```

- `type` enum covers people, organizations, products (software, services,
  models), places (geographic or venue), and events (conferences, product
  launches, fundraising rounds — relevant for digest synthesis).
  If W1a's NER research finds a stable library taxonomy that differs, update
  this enum in one pass across this doc and the implementation.
- `confidence` is a number in `[0, 1]` inclusive.
- `char_offsets` is nullable. If the chosen NER approach cannot produce
  reliable offsets (e.g., an LLM-call returning only surface forms), emit
  `null`. Consumers must tolerate `null`.

### `topic_scores[]`

Keyed objects, not parallel arrays:

```text
[
  { "topic": "string", "score": number in [0, 1] }
]
```

Keyed form chosen because it survives topic-list reordering and additions
without downstream correctness bugs. `topics[]` remains a priority-ordered
string list for consumers that only need tag names; `topic_scores[]` is the
source of truth for confidences.

### `canonical_excerpt`

Plain text, no HTML. Derivation rule:

1. If the crawled item has a `meta` description with ≥ 80 characters after
   trimming, use it verbatim.
2. Otherwise, take the first paragraph of the normalized body, strip HTML,
   trim to 400 characters on a word boundary (append a single ellipsis if
   truncated).

Rule is locked in the contract. W1a owns the implementation and may adjust
the specific selectors it uses to find "meta" or "first paragraph" based on
the existing crawler's output shape, but the selection priority
(meta-then-body) and length thresholds (80 / 400) stay.

## Schema evolution

Contract changes during this initiative are **additive-only**. Adding a new
field is safe at any time; renames and type changes are not.

Renames or type changes require a deprecation window: ship the new field
alongside the old, give consumers time to migrate, remove the old field
after migration is complete. This doc records the deprecation window's
start date and planned removal date when one is opened. No deprecations
are in flight as of 2026-04-20.

## Blog content-queue issue shape (consumer)

Written by the blog subscriber when translating an NC envelope into a GitHub
issue on `jonesrussell/jonesrussell` with the `content-queue` label.

| Field | Kind | Notes |
|---|---|---|
| `source_signal_id` | reference | NC `content_id` — not a copy, a pointer |
| `source_signal_type` | reference | NC channel the signal arrived on |
| `suggested_type` | consumer | text-post \| blog-post \| video \| newsletter \| substack-issue |
| `suggested_channels[]` | consumer | Subset of `{ x, linkedin, facebook, substack, devto, blog }` |
| `format_fit` | consumer | thread \| longform \| narrative \| roundup-item |
| `angle_hypothesis` | consumer | One sentence: why this is postable from Russell's voice |
| `audience` | consumer | builders \| indigenous \| clients \| general |
| `estimated_effort` | consumer | quick \| medium \| deep |
| `related_queue_issues[]` | consumer | Open content-queue issues touching same entities |
| `related_published_posts[]` | consumer | Shipped blog posts touching same entities |
| `series_candidate` | consumer | Nullable; suggests joining an existing series |
| `voice_notes` | consumer | Editorial hooks |
| `link_anchor_candidates[]` | consumer | Anchor-text candidates for internal linking |
| Labels: `content-queue`, `stage:*`, `type:*`, `source:*`, `priority:*` | existing | Lifecycle |

All consumer fields are computed by the blog subscriber at ingest using the
NC envelope + the blog's local entity indexes. They are not a function of NC
state alone — fan-in across GitHub issues and shipped blog posts is
consumer-owned (see ADR). Per-field inference rules live in W2's implementation
and are documented there so they stay explicit (deterministic, not guessed).

## Wire

- Transport: Redis pub/sub, existing NC channels. No new transport introduced
  by this initiative.
- Ordering: per-channel FIFO from NC. Subscribers must be idempotent on
  `content_id` (already true of NC's dedup behavior).
- Backfill: NC envelopes are persisted in Elasticsearch (`*_classified_content`).
  The blog subscriber's local index is rehydratable from NC on a blog outage.

## Gap list (what needs to be built)

NC-side gaps to close in v1:

- NER entity extraction (W1a). Implementation choice left to W1a kickoff —
  rules-based, spaCy sidecar pattern, or LLM call — with a preference for
  reusing the existing ML-sidecar pattern (`mining-ml`, `indigenous-ml`).
- Canonical excerpt normalization (W1a). Lightweight; shares crawl output.
- Language detection (W1a). Cheap library pass.
- Cross-item clustering (W1b). Requires a new data-model field and a
  clustering pass after per-item classification.

NC-side items explicitly deferred (no v1 consumer):

- Window-query HTTP API. Blog maintains its own envelope index in W2, which
  serves both entity fan-in and weekly-roundup window queries.

Blog-side new capability:

- Envelope subscriber service (W2) that owns the local index and the issue
  translation.
- Entity → queue-issue and entity → published-post indexes (W2).
- Substack output wiring (W4).
- Migration of existing intakes onto the new envelope pattern (W5).

## What NC already provides (do not re-implement)

| Capability | Where |
|---|---|
| Stable identity, URL, canonical, published_time | classifier Step 1 |
| content_type + content_subtype | classifier Step 1 |
| quality_score + components + spam flag | classifier Step 2 |
| Priority-ordered topic classification from Postgres rules | classifier Step 3 |
| source_reputation | classifier Step 4 |
| Per-topic Redis channels + 8 routing layers | publisher |
| Source registry (all intake types) | source-manager |
| Per-item dedup | publisher `internal/dedup/` |
| Compound/lead-style signals (precedent) | signal-crawler + `claudriel_lead*` |
| Scheduler pattern for time-based jobs | ai-observer L4 |
