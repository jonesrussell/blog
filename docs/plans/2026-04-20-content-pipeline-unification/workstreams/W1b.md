# W1b — NC Cross-Item Clustering

## Objective

Add `dedup_cluster_id` and `related_content_ids[]` to the NC envelope so
consumers can identify items telling the same story and items related via
entity/topic overlap.

## Repos touched

- `~/dev/north-cloud` — classifier, possibly publisher (depending on where
  the clustering pass lives)

## Deliverables

- Clustering pass assigning `dedup_cluster_id` to items telling the same
  story. v1 heuristics (no embeddings):
  1. URL canonicalization (two items with the same canonical URL share a
     cluster).
  2. Title hash (normalized title, near-exact match).
  3. **Entity Jaccard** over `{name, type}` tuples from `entities[]`,
     considering only entities with `confidence` ≥ a configurable threshold
     (default **0.6**). Entities below the threshold are ignored to prevent
     low-signal NER noise from gluing unrelated items together.
- **Cluster merge semantics.** If a candidate item overlaps with two
  existing clusters A and B, it joins the **older cluster by
  `first_seen_at`** and emits a log line recording the candidate's
  `content_id`, the chosen cluster id, and the rejected cluster id so
  operators can audit merges.
- `related_content_ids[]` populated from entity/topic overlap against the
  last 14 days of classified items, where the window is measured
  relative to **`published_at`** (not `ingested_at` — published time is
  what the reader cares about; ingested time drifts with crawler schedule).
  Window length is configurable.
- Max cardinality: `related_content_ids[]` capped at **top 10 by overlap
  score** (configurable). Ordering: descending overlap score; ties broken
  by `published_at` desc.
- Placement decision documented in
  `~/dev/north-cloud/docs/specs/classification.md` — inside the classifier
  vs. a new pass. Both acceptable; be explicit about the trade-off.
- Envelope schema test updated to cover the two new fields.

## Acceptance criteria

- Two items crawled within an hour from two different sources telling the
  same story share the same `dedup_cluster_id`.
- Entity Jaccard respects the confidence threshold: NER output below the
  default 0.6 threshold does not drive clustering.
- Merge-conflict case (candidate overlaps A and B) resolves deterministically
  to the older cluster by `first_seen_at` and logs the decision.
- `related_content_ids[]` populated for items with entity+topic overlap in
  the configurable window, with the window measured against `published_at`.
- `related_content_ids[]` never exceeds the configured cap (default 10).
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
  03-sequencing.md, workstreams/W1b.md (clustering heuristics, merge
  rules, and window semantics are specified explicitly; follow them).
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the dedup code in
  ~/dev/north-cloud/publisher/internal/dedup/.
- Confirm W1a is marked done in status.json before starting. If not, stop
  and escalate.

What to build:
1. A clustering pass that assigns dedup_cluster_id and populates
   related_content_ids[] on every classified item. v1 heuristic:
   (a) URL canonicalization, (b) title hash, (c) entity Jaccard over
   {name, type} tuples, considering only entities with confidence >= 0.6
   (configurable). No embeddings in v1.
2. Cluster merge rule: if a candidate item overlaps with two existing
   clusters A and B, it joins the older cluster by first_seen_at and
   logs a line recording the candidate content_id, chosen cluster id,
   and rejected cluster id.
3. related_content_ids[]: entity/topic overlap window measured against
   published_at (not ingested_at), default 14 days, configurable.
   Cap at top 10 by overlap score (configurable), ties broken by
   published_at desc.
4. Decide placement: inside the classifier (tighter coupling, simpler)
   or as a new pass (looser, more moving parts). Document the choice in
   ~/dev/north-cloud/docs/specs/classification.md.
5. Preserve existing per-item dedup semantics in publisher/internal/dedup/.
   If they are superseded, say so explicitly in the spec.
6. Update the envelope schema test from W1a to cover the two new fields.

Acceptance criteria:
- Two items from different sources telling the same story share
  dedup_cluster_id.
- Low-confidence NER output (below 0.6) does not drive clustering.
- Two-cluster merge conflict resolves to the older cluster and logs.
- related_content_ids[] populated and capped at the configured limit;
  window measured against published_at.
- task lint and task test pass in ~/dev/north-cloud.

Out of scope (do not touch):
- Workstreams W1a, W2, W3, W4, W5.
- NC window-query HTTP API.
- Blog repo code beyond the planning directory.

When done:
- Update status.json and regenerate status.js per README.
- Commit NC code and contracts-doc update separately if touched.
```
