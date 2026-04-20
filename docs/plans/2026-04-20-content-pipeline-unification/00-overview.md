# Overview — Content Pipeline Unification

## Problem

Content intake and output for the blog is fragmented:

- Two intake paths exist (git-activity miner + a north-cloud Redis subscriber
  for the `coforge:core` channel), each producing differently-shaped issues.
- A third intake (a Cowork-scheduled weekly industry roundup) is being piloted
  outside the pipeline and has no home.
- Substack exists as a drafting skill only. It is not wired as an output channel.
- There is no enrichment during intake. Suggested publishing channels, related
  sources, and format fit are guessed at production time, not captured at ingest.
- Every new output channel currently requires changes to every intake path.

The cost: non-deterministic conversion from signal to published artifact, and
work duplicated between the blog and the north-cloud pipeline.

## Goal

One envelope in, one issue shape out, deterministic mapping between them.

- **North Cloud owns universal enrichment** — entities, classification, excerpts,
  cross-item clustering. It emits a stable envelope on Redis.
- **Blog owns consumer enrichment** — suggested channels, format fit, entity
  fan-in against local indexes. It produces a single content-queue issue shape
  regardless of origin.
- **One intake contract, one output contract.** New intake sources and new
  output channels plug into the same shape.

## In scope (v1)

- NC envelope schema lock + NER entity extraction + canonical excerpt + language
  (W1a).
- NC cross-item clustering — `dedup_cluster_id`, `related_content_ids[]` (W1b).
- Blog consumer-enrichment subscriber with local entity indexes (W2).
- Weekly industry roundup as a permanent intake, consumer-side synthesis (W3).
- Substack as a permanent output channel (W4).
- Migration of existing intakes (content-mine, coforge subscriber) onto the
  new envelope pattern (W5).

## Out of scope (v1)

- NC window-query HTTP API. Deferred — no v1 consumer. See `03-sequencing.md`.
- NC-hosted synthesis signals. Deferred until a second consumer asks. Locked
  in `01-adr-universal-consumer-split.md`.
- Rewriting production or distribution. This initiative ends at producing a
  fully-enriched `stage:mined` issue. Production and distribution already work.
- Other consumers of the NC envelope (Minoo, future Miikana surfaces). They
  will subscribe later; v1 ensures the contract is ready for them.

## Success criteria

1. A signal from any source (git activity, NC Redis, weekly roundup, coforge
   subscriber) arrives as a content-queue issue with identical shape.
2. Every mined issue includes universal fields (entities, related content,
   quality) and consumer fields (suggested type, suggested channels, format fit,
   related queue issues, related published posts).
3. The Monday weekly roundup is produced deterministically from the NC envelope
   stream, not a separate Cowork task.
4. Substack appears in the distribution path for issues that list it as a
   channel. Draft is generated automatically; posting is manual if API is
   unavailable.
5. Removing any one intake source does not break any other. Adding a new one
   requires only plugging into the envelope — no changes to production or
   distribution.

## Definition of done

- All v1 workstreams in `status.json` marked `done`.
- End-to-end run for each of: git activity, NC-classified article, weekly
  roundup. All three produce identically-shaped `stage:mined` issues with
  all envelope and consumer fields populated. W4 additionally produces a
  Substack draft for issues that list substack as a channel; posting is
  out of scope.
- Plan artifacts merged into `main` (or retained on
  `plan/content-pipeline-unification` as the durable operator surface — the
  merge decision is a retrospective, not a blocker).
- Each workstream leaves a spec update in the repo it touched
  (`~/dev/north-cloud/docs/specs/` for NC; `~/dev/blog/CLAUDE.md` gotchas or
  `~/dev/blog/docs/` for blog) so future sessions do not re-derive.
