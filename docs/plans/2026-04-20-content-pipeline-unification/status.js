window.STATUS = {
  "initiative": {
    "name": "Content Pipeline Unification",
    "slug": "content-pipeline-unification",
    "started": "2026-04-20",
    "last_updated": "2026-04-20T16:00:00Z",
    "docs": {
      "overview": "00-overview.md",
      "adrs": ["01-adr-universal-consumer-split.md"],
      "contracts": "02-contracts.md",
      "sequencing": "03-sequencing.md",
      "risks": "04-risks.md"
    }
  },
  "repos": [
    { "slug": "blog", "path": "~/dev/blog" },
    { "slug": "north-cloud", "path": "~/dev/north-cloud" }
  ],
  "workstreams": [
    {
      "id": "W1a",
      "title": "NC envelope schema lock + NER + canonical excerpt",
      "slug": "nc-envelope-schema-ner-excerpt",
      "plan_doc": "workstreams/W1a.md",
      "repos": ["north-cloud"],
      "summary": "Extend NC envelope with entities[], canonical_excerpt, language. Lock schema against 02-contracts.md.",
      "status": "not-started",
      "depends_on": [],
      "kickoff_prompt": "Execute workstream W1a from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read these planning docs in ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/: README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md (the \"Field shapes\" and \"Schema evolution\" sections are load-bearing), workstreams/W1a.md (including the \"Rollout & backfill\" and \"Scope: NER choice may force a split\" sections).
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the existing 4-step classification pipeline.

What to build:
1. Add entities[], canonical_excerpt, language fields to the NC envelope. Field shapes are locked in 02-contracts.md -- match them exactly.
2. Choose and implement an NER approach. Write a short ADR under ~/dev/north-cloud/docs/specs/ capturing the choice between: rules-based, a new ML sidecar matching the mining-ml/indigenous-ml pattern, or an LLM call. Pick on constraints (latency, cost, deploy footprint), not preferences. IMPORTANT: if the chosen approach is a new ML sidecar, STOP this workstream. Update status.json to split W1a into W1a-ner (sidecar) and W1a-envelope (fields + schema lock + ES mappings) per workstreams/W1a.md \"Scope: NER choice may force a split\", and re-kickoff the split workstreams. Rules-based and LLM-call keep W1a as-is.
3. Emit canonical_excerpt per the derivation rule in 02-contracts.md (meta description if >= 80 chars, otherwise first paragraph trimmed to 400 chars on a word boundary, plain text only).
4. Emit language via a cheap language-detection pass.
5. Update Elasticsearch index mappings for the new fields across *_classified_content indexes. Document and verify the reindex or mapping-update path on a test index.
6. Add a test that asserts the envelope shape against 02-contracts.md for at least two sources.
7. Update ~/dev/north-cloud/docs/specs/classification.md with the new fields.

Rollout policy: forward-only by default. New fields populate on items classified after deploy. Existing ES docs are not re-classified unless the NER ADR explicitly calls for a one-time backfill sweep. W3 and downstream consumers see partial envelope data for ~7 days after deploy -- expected and documented.

Acceptance criteria:
- Every item published on routing-layer channels includes the three new fields with shapes matching 02-contracts.md.
- ES index mappings updated; reindex/mapping-update path documented and verified on a test index.
- task lint and task test pass in ~/dev/north-cloud.
- Contract doc and code agree; if they disagree, edit the contract first, then update code.

Out of scope (do not touch):
- Workstreams W1b, W2, W3, W4, W5. If you think you need something from another workstream, stop and escalate -- do not expand scope.
- NC window-query HTTP API (deferred; see 03-sequencing.md).
- Blog repo code beyond the planning directory.

When done:
- Edit ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/status.json to mark this workstream's tasks done and update last_updated.
- Regenerate status.js per README instructions.
- Commit planning updates separately from NC code.",
      "tasks": [
        {
          "id": "W1a.T1",
          "title": "NER choice + implementation + entities[] emission",
          "repos": ["north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "NER ADR written under ~/dev/north-cloud/docs/specs/",
            "entities[] present on every classified item",
            "task lint and task test pass"
          ],
          "complexity": "L",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W1a.md" },
            { "label": "Contracts", "href": "02-contracts.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W1a.T2",
          "title": "canonical_excerpt + language emission",
          "repos": ["north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "canonical_excerpt present on every classified item",
            "language (ISO-639-1) present on every classified item"
          ],
          "complexity": "S",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W1a.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W1a.T3",
          "title": "Envelope schema test + ES mappings + contract-code parity",
          "repos": ["north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Test asserts envelope shape for at least two sources",
            "02-contracts.md and code agree",
            "ES index mappings updated across *_classified_content",
            "Reindex or mapping-update path documented and verified on a test index"
          ],
          "complexity": "M",
          "links": [
            { "label": "Contracts", "href": "02-contracts.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "W1b",
      "title": "NC cross-item clustering",
      "slug": "nc-cross-item-clustering",
      "plan_doc": "workstreams/W1b.md",
      "repos": ["north-cloud"],
      "summary": "dedup_cluster_id and related_content_ids[] on the envelope, via URL canon + title hash + entity Jaccard.",
      "status": "not-started",
      "depends_on": ["W1a"],
      "kickoff_prompt": "Execute workstream W1b from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md, 03-sequencing.md, workstreams/W1b.md.
- Read ~/dev/north-cloud/classifier/CLAUDE.md and the dedup code in ~/dev/north-cloud/publisher/internal/dedup/.
- Confirm W1a is marked done in status.json before starting. If not, stop and escalate.

What to build:
1. A clustering pass that assigns dedup_cluster_id and populates related_content_ids[] on every classified item. Start with the simplest correct heuristic: URL canonicalization + title hash + entity Jaccard. No embeddings in v1.
2. Decide placement: inside the classifier (tighter coupling, simpler) or as a new pass (looser, more moving parts). Document the choice in ~/dev/north-cloud/docs/specs/classification.md.
3. Preserve existing per-item dedup semantics in publisher/internal/dedup/. If they are superseded, say so explicitly in the spec.
4. Update the envelope schema test from W1a to cover the two new fields.

Acceptance criteria:
- Two items from different sources telling the same story share dedup_cluster_id.
- related_content_ids[] populated for items with entity+topic overlap in the configurable window (default 14 days).
- task lint and task test pass in ~/dev/north-cloud.

Out of scope (do not touch):
- Workstreams W1a, W2, W3, W4, W5.
- NC window-query HTTP API.
- Blog repo code beyond the planning directory.

When done:
- Update status.json and regenerate status.js per README.
- Commit NC code and contracts-doc update separately if touched.",
      "tasks": [
        {
          "id": "W1b.T1",
          "title": "Clustering pass (URL canon + title hash + entity Jaccard)",
          "repos": ["north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Two items telling same story share dedup_cluster_id",
            "related_content_ids[] populated on entity+topic overlap",
            "Placement decision documented in classification.md"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W1b.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "W2",
      "title": "Blog consumer-enrichment subscriber",
      "slug": "blog-consumer-subscriber",
      "plan_doc": "workstreams/W2.md",
      "repos": ["blog"],
      "summary": "Redis subscriber, local envelope index, entity fan-in indexes, envelope to issue translator.",
      "status": "not-started",
      "depends_on": ["W1a"],
      "kickoff_prompt": "Execute workstream W2 from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md, 03-sequencing.md, workstreams/W2.md (the Suggested inference rules and Fan-in indexing strategy sections are load-bearing; the angle_hypothesis decision inside the inference rules section is already made -- do not relitigate).
- Read blog's existing pipeline skills under ~/.claude/skills/content-*/ to understand the current content-queue issue shape and how production and distribution consume it. Do not modify them.
- Confirm W1a is marked done in status.json. If not, stop and escalate.

What to build:
1. A blog-side subscriber service that reads NC envelopes from Redis. Language: Go preferred to match NC. Decide at kickoff and document.
2. A local envelope index keyed on content_id with a 90-day TTL. Implementation: SQLite unless a concrete reason says otherwise. Location: ~/.blog-pipeline/ (or similar), documented in blog CLAUDE.md.
3. Entity -> queue-issue index built by scanning open content-queue issues on jonesrussell/jonesrussell.
4. Entity -> published-post index built by scanning ~/dev/blog/content/posts/**/*.md frontmatter and body.
5. NC envelope -> content-queue issue translator producing all consumer fields in 02-contracts.md. Inference rules must be deterministic functions of envelope fields (not coin-flips). Document them in the service's README.
6. GitHub issue writer with labels content-queue, stage:mined, source:<origin>, and appropriate type:* from 02-contracts.md.

Acceptance criteria:
- Envelope on a subscribed channel -> exactly one stage:mined issue with all consumer fields populated and all labels correct.
- Idempotent on content_id (re-delivery does not double-create).
- related_queue_issues[] and related_published_posts[] verified against two hand-picked examples.
- Crash/restart test: kill mid-stream, restart, no loss and no dupes.
- CLAUDE.md updated with the subscriber's Gotcha entry and backfill recipe.

Out of scope (do not touch):
- Workstreams W1a, W1b, W3, W4, W5.
- NC code (this is blog-side only).
- Production or distribution skills -- issue creation ends at stage:mined.
- Existing content-mine workflow (that is W5's job).

When done:
- Update status.json and regenerate status.js per README.
- Commit blog code and CLAUDE.md updates.",
      "tasks": [
        {
          "id": "W2.T1",
          "title": "Subscriber service + local envelope index (SQLite, 90-day TTL)",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Subscriber reads NC Redis channels and writes to a local index",
            "TTL default 90 days",
            "Crash/restart test passes (no loss, no dupes)"
          ],
          "complexity": "L",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W2.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W2.T2",
          "title": "Entity to queue-issue and to published-post indexes",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Fan-in verified on two hand-picked examples"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W2.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W2.T3",
          "title": "Envelope to content-queue issue translator + writer",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "One envelope produces exactly one stage:mined issue",
            "Idempotent on content_id",
            "All consumer fields populated per 02-contracts.md",
            "Inference rules documented in service README"
          ],
          "complexity": "M",
          "links": [
            { "label": "Contracts", "href": "02-contracts.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "W3",
      "title": "Weekly industry roundup (consumer-side synthesis)",
      "slug": "weekly-roundup",
      "plan_doc": "workstreams/W3.md",
      "repos": ["blog"],
      "summary": "Monday scheduled synthesis from the local envelope index. Retire the Cowork task after two-week parity.",
      "status": "not-started",
      "depends_on": ["W2"],
      "kickoff_prompt": "Execute workstream W3 from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 01-adr-universal-consumer-split.md (especially the \"Where synthesis signals live\" section), 02-contracts.md, workstreams/W3.md.
- Confirm W2 is marked done in status.json. If not, stop and escalate.

What to build:
1. A Monday ~8am UTC scheduled job (GitHub Action preferred) that reads the last 7 days of NC envelopes from the blog's local index and synthesizes a four-section industry roundup (AI/ML, software development, tech business, cybersecurity).
2. Preserve the Cowork task's instruction text verbatim for the first two weeks, then allow edits. The instruction text should live in this workstream's directory or next to the GitHub Action; copy it in faithfully.
3. Output:
   - Default: Hugo draft under ~/dev/blog/content/posts/general/industry-roundup-YYYY-MM-DD/index.md following the blog's page-bundle convention.
   - Optional: Substack draft under ~/brand/substack-issue-N.md. Decide with Russell at kickoff.
4. Open a content-queue issue with:
   - labels: content-queue, stage:ready, type:blog-post (or type:substack-issue), source:weekly-roundup
   - body: link to the draft + short summary + source_signal_ids[] from the envelope index (preserve provenance).
5. Run for two consecutive Mondays alongside the Cowork task. Compare outputs. After sign-off, disable the Cowork schedule.

Acceptance criteria:
- Issue opens within 10 minutes of schedule.
- Output is a pure function of local index + instruction template.
- Empty-topic sections say \"no significant news this week\" rather than fabricating.
- Two weeks of side-by-side parity with Cowork before retiring the old task.

Out of scope (do not touch):
- Workstreams W1a, W1b, W2, W4, W5.
- NC code (consumer-side synthesis per ADR).
- Promoting synthesis to NC (explicitly deferred; see 03-sequencing.md).

When done:
- Update status.json and regenerate status.js per README.
- Commit the GitHub Action, any CLAUDE.md updates, and the preserved Cowork instruction text.",
      "tasks": [
        {
          "id": "W3.T1",
          "title": "Monday scheduled synthesis job + draft output",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Issue opens within 10 min of Monday 8am UTC",
            "Output pure function of local index + instruction template",
            "Empty-topic sections say no significant news"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W3.md" },
            { "label": "ADR synthesis section", "href": "01-adr-universal-consumer-split.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W3.T2",
          "title": "Two-week Cowork-parity compare + retire Cowork task",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Two consecutive Mondays of side-by-side parity",
            "Cowork task disabled after sign-off"
          ],
          "complexity": "S",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W3.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "W4",
      "title": "Substack as output channel",
      "slug": "substack-output",
      "plan_doc": "workstreams/W4.md",
      "repos": ["blog"],
      "summary": "Decide Buffer vs. direct vs. manual-paste. Wire into distribution.",
      "status": "not-started",
      "depends_on": [],
      "kickoff_prompt": "Execute workstream W4 from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 02-contracts.md, workstreams/W4.md.
- Read ~/.claude/skills/content-pipeline/SKILL.md and channels.env.
- Read ~/.claude/skills/substack-writing/SKILL.md -- the current drafting skill Russell uses for the Ahnii! Substack at jonesrussell42.substack.com.

What to build:
1. A short decision doc under this workstream's directory:
   a) Does Buffer support Substack as a channel? Verify via Buffer's GraphQL API (the channels query lists configured channels).
   b) Does Substack have a usable API or an email-to-post path for this publication?
   c) Chosen path: Buffer / direct / manual-paste-with-draft.
2. Implement the chosen path:
   - Buffer: add a Substack channel id to channels.env and extend the content-pipeline skill to post to it.
   - Direct: write a small adapter that posts the draft.
   - Manual: make the distribution path pause for operator confirmation when substack is in the issue's channels, present the draft, and transition the issue to stage:distributed on confirmation.
3. Update content-pipeline SKILL.md with the new branch.
4. Test end-to-end with one real or dry-run issue that lists substack in suggested_channels[].

Acceptance criteria:
- Issue with substack in suggested_channels[] produces a draft during distribution -- not silently skipped.
- Buffer targets (X, LinkedIn, Facebook) behavior unchanged.
- The decision doc is committed even if the answer is manual paste.

Out of scope (do not touch):
- Workstreams W1a, W1b, W2, W3, W5.
- Changes to the substack-writing skill beyond wiring for distribution.
- NC code (output-side concern only).

When done:
- Update status.json and regenerate status.js per README.
- Commit blog code, skill updates, and the decision doc.",
      "tasks": [
        {
          "id": "W4.T1",
          "title": "Decision doc: Buffer / direct / manual-paste",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Decision doc committed to workstream directory",
            "Verification of Buffer channel support recorded",
            "Substack API/email-to-post feasibility recorded"
          ],
          "complexity": "S",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W4.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W4.T2",
          "title": "Implement chosen path + update content-pipeline skill",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Issue with substack in suggested_channels[] produces a draft",
            "Buffer targets unchanged",
            "SKILL.md updated"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W4.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "W5",
      "title": "Intake unification",
      "slug": "intake-unification",
      "plan_doc": "workstreams/W5.md",
      "repos": ["blog", "north-cloud"],
      "summary": "Fold existing intakes (content-mine, coforge subscriber) onto the envelope pattern. One issue shape, one lifecycle.",
      "status": "not-started",
      "depends_on": ["W1a", "W2"],
      "kickoff_prompt": "Execute workstream W5 from the content-pipeline-unification initiative.

Before doing anything:
- cd ~/dev/blog && git pull origin main
- cd ~/dev/north-cloud && git pull origin main
- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 02-contracts.md, 03-sequencing.md, workstreams/W5.md.
- Read the existing content-mine workflow at ~/dev/blog/.github/workflows/content-mine.yml and the content-mine skill.
- Confirm W1a and W2 are marked done in status.json. If not, stop and escalate.

What to build:
1. Rewrite the git-activity miner to produce envelopes that match the NC envelope contract. Emit on a synthetic \"source:git\" channel (Redis or in-process if Redis is overkill) consumed by W2's subscriber. The subscriber then produces the stage:mined issue -- the miner does not write issues directly anymore.
2. Remove the standalone coforge Redis subscriber in favor of W2's subscriber reading the same channel.
3. Dual-write for one week: old and new paths produce issues in parallel. Verify parity by comparing shapes on a sample of issues.
4. Cut over: disable old paths, remove legacy code. Document the removal in blog CLAUDE.md and note \"one intake shape, one lifecycle\" as a rule future sessions must uphold.

Acceptance criteria:
- All three v1 intakes produce identically-shaped stage:mined issues.
- No references to the legacy content-mine issue shape remain.
- CLAUDE.md documents \"one intake shape, one lifecycle\" as a maintained rule.
- Running any single intake with the others disabled still produces valid issues.

Out of scope (do not touch):
- Workstreams W1a, W1b, W2, W3, W4.
- Production/distribution skills -- you are only touching the intake side.

When done:
- Update status.json and regenerate status.js per README.
- Commit blog (and any NC) changes. If this closes the initiative, update 00-overview.md's Definition of Done accordingly.",
      "tasks": [
        {
          "id": "W5.T1",
          "title": "Rewrite git-activity miner to envelope pattern",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Miner emits envelopes consumed by W2's subscriber",
            "Miner no longer writes issues directly"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W5.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W5.T2",
          "title": "Retire legacy coforge subscriber",
          "repos": ["blog", "north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "No legacy subscriber code remains",
            "Dual-write parity verified for one week before cutover"
          ],
          "complexity": "M",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W5.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W5.T3",
          "title": "CLAUDE.md gotcha: one intake shape, one lifecycle",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Rule documented as a gotcha in blog CLAUDE.md"
          ],
          "complexity": "XS",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W5.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        }
      ]
    }
  ],
  "deferred": [
    {
      "id": "D1",
      "title": "NC window-query HTTP API",
      "rationale": "No v1 consumer. W2's local envelope index serves both entity fan-in and weekly-roundup window queries. Promote when a second consumer asks.",
      "promote_when": "A second consumer (Minoo, Miikana, etc.) needs window queries against NC envelopes from outside the blog process."
    },
    {
      "id": "D2",
      "title": "NC-hosted synthesis service for compound signals",
      "rationale": "Per ADR, v1 synthesizes consumer-side. Promote when a second consumer wants the same digest emitted by NC.",
      "promote_when": "A second consumer subscribes to the same synthesis that the blog produces for its weekly roundup."
    }
  ],
  "schema_version": 1
}; window.STATUS_GENERATED_AT = "2026-04-20T19:42:41Z";
