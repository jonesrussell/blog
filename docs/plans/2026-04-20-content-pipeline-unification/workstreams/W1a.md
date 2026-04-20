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
  classified item, matching the locked shapes in
  `02-contracts.md` § "Field shapes".
- Elasticsearch index mapping updates for the new fields across the
  `*_classified_content` indexes.
- Envelope schema test that fails if the fields are missing or mistyped.
- Redis channel payload matches `02-contracts.md` exactly.
- Spec update at `~/dev/north-cloud/docs/specs/classification.md` noting the
  new fields.

## Acceptance criteria

- A classified item published to any routing-layer channel includes
  `entities[]`, `canonical_excerpt`, `language` in the envelope with the
  shapes listed in `02-contracts.md` § "Field shapes".
- A test asserts envelope field presence and types for at least two
  sources (one crawled, one structured).
- ES index mappings updated across `*_classified_content`. Reindex or
  mapping-update path is documented and verified on a test index before
  production rollout.
- `02-contracts.md` and code agree. If they disagree, edit the contract first.
- `task lint` and `task test` in `~/dev/north-cloud` pass.

## Rollout & backfill

Default policy: **forward-only**. The classifier populates the new fields
on items classified after W1a deploys. Existing documents in
`*_classified_content` are not re-classified by default.

Implication: for roughly 7 days after W1a lands, W3's weekly-roundup window
will see a mix of fully-enriched envelopes (post-deploy) and partial
envelopes (pre-deploy). W3 must tolerate missing `entities[]` /
`canonical_excerpt` / `language` gracefully — synthesis reports on the data
it has and does not fabricate.

Optional backfill: if a classifier re-run over existing ES docs is cheap
(same code path, idempotent writes), the NER ADR may propose it as a one-time
sweep during deploy. Default is still forward-only. Backfill is an opt-in
that the ADR owner justifies, not a default.

## Scope: NER choice may force a split

W1a is sized L assuming a **rules-based NER** or **LLM-call** approach.
Both keep implementation inside the existing classifier surface.

If the W1a research step concludes that a **new ML sidecar** (spaCy-style,
matching the `mining-ml` / `indigenous-ml` pattern) is the right choice, W1a
becomes XL and must be split at that moment, not retroactively:

- **W1a-ner** — new ML sidecar service (scaffold, deploy, integration with
  classifier). Standalone workstream.
- **W1a-envelope** — fields + schema lock + ES mappings + contract test.
  Depends on W1a-ner emitting via the agreed interface (or on a stub that
  W1a-ner later replaces).

The split decision happens inside the ADR step. Do not carry XL-sized work
under a single workstream id. Update `status.json` to reflect the split
before continuing implementation.

## Dependencies

None.

## Complexity

L for rules-based or LLM-call approaches. Upgrades to XL if the ADR picks
a new ML sidecar, in which case the workstream splits (see above).

## Kickoff prompt

```
Execute workstream W1a from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read these planning docs in ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/:
  README.md, 00-overview.md, 01-adr-universal-consumer-split.md,
  02-contracts.md (the "Field shapes" and "Schema evolution" sections are
  load-bearing), workstreams/W1a.md (including the "Rollout & backfill"
  and "Scope: NER choice may force a split" sections).
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the existing 4-step
  classification pipeline.

What to build:
1. Add entities[], canonical_excerpt, language fields to the NC envelope.
   Field shapes are locked in 02-contracts.md -- match them exactly.
2. Choose and implement an NER approach. Write a short ADR under
   ~/dev/north-cloud/docs/specs/ capturing the choice between: rules-based,
   a new ML sidecar matching the mining-ml/indigenous-ml pattern, or an LLM
   call. Pick on constraints (latency, cost, deploy footprint), not
   preferences.
   IMPORTANT: if the chosen approach is a new ML sidecar, STOP this
   workstream. Update status.json to split W1a into W1a-ner (sidecar) and
   W1a-envelope (fields + schema lock + ES mappings) per the "Scope" section
   of workstreams/W1a.md, and re-kickoff the split workstreams. Rules-based
   and LLM-call keep W1a as-is.
3. Emit canonical_excerpt per the derivation rule in 02-contracts.md
   (meta description if >= 80 chars, otherwise first paragraph trimmed to
   400 chars on a word boundary, plain text only).
4. Emit language via a cheap language-detection pass.
5. Update Elasticsearch index mappings for the new fields across
   *_classified_content indexes. Document and verify the reindex or
   mapping-update path on a test index.
6. Add a test that asserts the envelope shape against 02-contracts.md for
   at least two sources.
7. Update ~/dev/north-cloud/docs/specs/classification.md with the new fields.

Rollout policy: forward-only by default. New fields populate on items
classified after deploy. Existing ES docs are not re-classified unless the
NER ADR explicitly calls for a one-time backfill sweep. W3 and downstream
consumers see partial envelope data for ~7 days after deploy -- expected
and documented.

Acceptance criteria:
- Every item published on routing-layer channels includes the three new
  fields with shapes matching 02-contracts.md.
- ES index mappings updated; reindex/mapping-update path documented and
  verified on a test index.
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
