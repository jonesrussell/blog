# W1b — NC Cross-Item Clustering

## Objective

Add `dedup_cluster_id` and `related_content_ids[]` to the NC envelope so
consumers can identify items telling the same story and items related via
entity/topic overlap.

## Repos touched

- `~/dev/north-cloud` — classifier, possibly publisher (depending on where
  the clustering pass lives)

## Deliverables

- Clustering pass that assigns `dedup_cluster_id` to items telling the same
  story (start with URL canonicalization + title hash + entity Jaccard
  heuristics; no embeddings in v1).
- `related_content_ids[]` populated from entity/topic overlap against the
  last N days of classified items (default 14; configurable).
- Placement decision documented in
  `~/dev/north-cloud/docs/specs/classification.md` — inside the classifier
  vs. a new pass. Both acceptable; be explicit about the trade-off.
- Envelope schema test updated to cover the two new fields.

## Acceptance criteria

- Two items crawled within an hour from two different sources telling the
  same story share the same `dedup_cluster_id`.
- `related_content_ids[]` is non-empty for items with at least one shared
  entity-plus-topic overlap inside the configurable window.
- Existing per-item dedup behavior in `publisher/internal/dedup/` is
  unchanged, or explicitly superseded with the supersession documented.
- `02-contracts.md` updated if any field name or type differs from this doc.

## Dependencies

- W1a (envelope lock + `entities[]`).

## Complexity

M — clustering is well-trodden; the risk is over-engineering. Stay simple.

## Kickoff prompt

```
Execute workstream W1b from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read planning docs:
  ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md,
  00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md,
  03-sequencing.md, workstreams/W1b.md.
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the dedup code in
  ~/dev/north-cloud/publisher/internal/dedup/.
- Confirm W1a is marked done in status.json before starting. If not, stop
  and escalate.

What to build:
1. A clustering pass that assigns dedup_cluster_id and populates
   related_content_ids[] on every classified item. Start with the simplest
   correct heuristic: URL canonicalization + title hash + entity Jaccard.
   No embeddings in v1.
2. Decide placement: inside the classifier (tighter coupling, simpler) or
   as a new pass (looser, more moving parts). Document the choice in
   ~/dev/north-cloud/docs/specs/classification.md.
3. Preserve existing per-item dedup semantics in publisher/internal/dedup/.
   If they are superseded, say so explicitly in the spec.
4. Update the envelope schema test from W1a to cover the two new fields.

Acceptance criteria:
- Two items from different sources telling the same story share
  dedup_cluster_id.
- related_content_ids[] populated for items with entity+topic overlap in
  the configurable window (default 14 days).
- task lint and task test pass in ~/dev/north-cloud.

Out of scope (do not touch):
- Workstreams W1a, W2, W3, W4, W5.
- NC window-query HTTP API.
- Blog repo code beyond the planning directory.

When done:
- Update status.json and regenerate status.js per README.
- Commit NC code and contracts-doc update separately if touched.
```
