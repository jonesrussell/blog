# W1a — NC Envelope Schema Lock + NER + Canonical Excerpt

## Objective

Extend the NC envelope with three universal-enrichment fields — `entities[]`,
`canonical_excerpt`, `language` — and lock the envelope schema against the
contract doc so downstream workstreams (W1b, W2, W5) can depend on it.

## Repos touched

- `~/dev/north-cloud` — classifier service, possibly a new ML sidecar

## Deliverables

- NER implementation choice captured as an ADR under
  `~/dev/north-cloud/docs/specs/` — rules-based vs. spaCy sidecar (matching
  the `mining-ml` / `indigenous-ml` pattern) vs. LLM-call.
- Classifier emits `entities[]`, `canonical_excerpt`, `language` on every
  classified item.
- Envelope schema test that fails if the fields are missing or mistyped.
- Redis channel payload matches `02-contracts.md` exactly.
- Spec update at `~/dev/north-cloud/docs/specs/classification.md` noting the
  new fields.

## Acceptance criteria

- A classified item published to any routing-layer channel includes
  `entities[]`, `canonical_excerpt`, `language` in the envelope with the
  types listed in `02-contracts.md`.
- A test asserts envelope field presence and types for at least two
  sources (one crawled, one structured).
- `02-contracts.md` and code agree. If they disagree, edit the contract first.
- `task lint` and `task test` in `~/dev/north-cloud` pass.

## Dependencies

None.

## Complexity

L — the NER choice carries the bulk of the risk; excerpt and language are
cheap follow-ons.

## Kickoff prompt

```
Execute workstream W1a from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read these planning docs in ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/:
  README.md, 00-overview.md, 01-adr-universal-consumer-split.md,
  02-contracts.md, workstreams/W1a.md.
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the existing 4-step
  classification pipeline.

What to build:
1. Add entities[], canonical_excerpt, language fields to the NC envelope.
2. Choose and implement an NER approach. Write a short ADR under
   ~/dev/north-cloud/docs/specs/ capturing the choice between: rules-based,
   a new ML sidecar matching the mining-ml/indigenous-ml pattern, or an LLM
   call. Pick on constraints (latency, cost, deploy footprint), not
   preferences. Implement the chosen approach.
3. Emit canonical_excerpt from the crawled/normalized content.
4. Emit language via a cheap language-detection pass.
5. Add a test that asserts the envelope shape against 02-contracts.md for
   at least two sources.
6. Update ~/dev/north-cloud/docs/specs/classification.md with the new fields.

Acceptance criteria:
- Every item published on routing-layer channels includes the three new
  fields with types matching 02-contracts.md.
- task lint and task test pass in ~/dev/north-cloud.
- Contract doc and code agree; if they disagree, edit the contract first,
  then update code.

Out of scope (do not touch):
- Workstreams W1b, W2, W3, W4, W5. If you think you need something from
  another workstream, stop and escalate -- do not expand scope.
- NC window-query HTTP API (deferred; see 03-sequencing.md).
- Blog repo code beyond the planning directory.

When done:
- Edit ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/status.json
  to mark this workstream's tasks done and update last_updated.
- Regenerate status.js per README instructions.
- Commit planning updates separately from NC code.
```
