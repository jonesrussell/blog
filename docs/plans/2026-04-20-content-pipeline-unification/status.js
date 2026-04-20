window.STATUS = {
  "initiative": {
    "name": "Content Pipeline Unification",
    "slug": "content-pipeline-unification",
    "started": "2026-04-20",
    "last_updated": "2026-04-20T17:00:00Z",
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
      "kickoff_prompt": "Execute workstream W1a from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- cd ~/dev/north-cloud && git pull origin main\n- Read these planning docs in ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/: README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md (the \"Field shapes\" and \"Schema evolution\" sections are load-bearing), workstreams/W1a.md (including the \"Rollout & backfill\" and \"Scope: NER choice may force a split\" sections).\n- Read ~/dev/north-cloud/classifier/CLAUDE.md and the existing 4-step classification pipeline.\n\nWhat to build:\n1. Add entities[], canonical_excerpt, language fields to the NC envelope. Field shapes are locked in 02-contracts.md -- match them exactly.\n2. Choose and implement an NER approach. Write a short ADR under ~/dev/north-cloud/docs/specs/ capturing the choice between: rules-based, a new ML sidecar matching the mining-ml/indigenous-ml pattern, or an LLM call. Pick on constraints (latency, cost, deploy footprint), not preferences. IMPORTANT: if the chosen approach is a new ML sidecar, STOP this workstream. Update status.json to split W1a into W1a-ner (sidecar) and W1a-envelope (fields + schema lock + ES mappings) per workstreams/W1a.md \"Scope: NER choice may force a split\", and re-kickoff the split workstreams. Rules-based and LLM-call keep W1a as-is.\n3. Emit canonical_excerpt per the derivation rule in 02-contracts.md (meta description if >= 80 chars, otherwise first paragraph trimmed to 400 chars on a word boundary, plain text only).\n4. Emit language via a cheap language-detection pass.\n5. Update Elasticsearch index mappings for the new fields across *_classified_content indexes. Document and verify the reindex or mapping-update path on a test index.\n6. Add a test that asserts the envelope shape against 02-contracts.md for at least two sources.\n7. Update ~/dev/north-cloud/docs/specs/classification.md with the new fields.\n\nRollout policy: forward-only by default. New fields populate on items classified after deploy. Existing ES docs are not re-classified unless the NER ADR explicitly calls for a one-time backfill sweep. W3 and downstream consumers see partial envelope data for ~7 days after deploy -- expected and documented.\n\nAcceptance criteria:\n- Every item published on routing-layer channels includes the three new fields with shapes matching 02-contracts.md.\n- ES index mappings updated; reindex/mapping-update path documented and verified on a test index.\n- task lint and task test pass in ~/dev/north-cloud.\n- Contract doc and code agree; if they disagree, edit the contract first, then update code.\n\nOut of scope (do not touch):\n- Workstreams W1b, W2, W3, W4, W5. If you think you need something from another workstream, stop and escalate -- do not expand scope.\n- NC window-query HTTP API (deferred; see 03-sequencing.md).\n- Blog repo code beyond the planning directory.\n\nWhen done:\n- Edit ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/status.json to mark this workstream's tasks done and update last_updated.\n- Regenerate status.js per README instructions.\n- Commit planning updates separately from NC code.",
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
      "summary": "dedup_cluster_id and related_content_ids[] on the envelope. URL canon + title hash + entity Jaccard over {name, type} with confidence >= 0.6.",
      "status": "not-started",
      "depends_on": ["W1a"],
      "kickoff_prompt": "Execute workstream W1b from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- cd ~/dev/north-cloud && git pull origin main\n- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md, 03-sequencing.md, workstreams/W1b.md (clustering heuristics, merge rules, and window semantics are specified explicitly; follow them).\n- Read ~/dev/north-cloud/classifier/CLAUDE.md and the dedup code in ~/dev/north-cloud/publisher/internal/dedup/.\n- Confirm W1a is marked done in status.json before starting. If not, stop and escalate.\n\nWhat to build:\n1. A clustering pass that assigns dedup_cluster_id and populates related_content_ids[] on every classified item. v1 heuristic: (a) URL canonicalization, (b) title hash, (c) entity Jaccard over {name, type} tuples, considering only entities with confidence >= 0.6 (configurable). No embeddings in v1.\n2. Cluster merge rule: if a candidate item overlaps with two existing clusters A and B, it joins the older cluster by first_seen_at and logs a line recording the candidate content_id, chosen cluster id, and rejected cluster id.\n3. related_content_ids[]: entity/topic overlap window measured against published_at (not ingested_at), default 14 days, configurable. Cap at top 10 by overlap score (configurable), ties broken by published_at desc.\n4. Decide placement: inside the classifier (tighter coupling, simpler) or as a new pass (looser, more moving parts). Document the choice in ~/dev/north-cloud/docs/specs/classification.md.\n5. Preserve existing per-item dedup semantics in publisher/internal/dedup/. If they are superseded, say so explicitly in the spec.\n6. Update the envelope schema test from W1a to cover the two new fields.\n\nAcceptance criteria:\n- Two items from different sources telling the same story share dedup_cluster_id.\n- Low-confidence NER output (below 0.6) does not drive clustering.\n- Two-cluster merge conflict resolves to the older cluster and logs.\n- related_content_ids[] populated and capped at the configured limit; window measured against published_at.\n- task lint and task test pass in ~/dev/north-cloud.\n\nOut of scope (do not touch):\n- Workstreams W1a, W2, W3, W4, W5.\n- NC window-query HTTP API.\n- Blog repo code beyond the planning directory.\n\nWhen done:\n- Update status.json and regenerate status.js per README.\n- Commit NC code and contracts-doc update separately if touched.",
      "tasks": [
        {
          "id": "W1b.T1",
          "title": "Clustering pass + merge rule + related_content_ids window",
          "repos": ["north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Two items telling same story share dedup_cluster_id",
            "Entity Jaccard respects confidence threshold (default 0.6)",
            "Merge conflict resolves to older cluster by first_seen_at and logs",
            "related_content_ids[] window measured against published_at, capped at 10",
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
      "summary": "Redis subscriber, local envelope index, entity fan-in indexes, envelope to issue translator, coforge cutover on deploy.",
      "status": "not-started",
      "depends_on": ["W1a"],
      "kickoff_prompt": "Execute workstream W2 from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- cd ~/dev/north-cloud && git pull origin main\n- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 01-adr-universal-consumer-split.md, 02-contracts.md, 03-sequencing.md, workstreams/W2.md (the Suggested inference rules, Fan-in indexing strategy, and Rollout sections are load-bearing; the angle_hypothesis decision inside the inference rules section is already made -- do not relitigate).\n- Read blog's existing pipeline skills under ~/.claude/skills/content-*/ to understand the current content-queue issue shape and how production and distribution consume it. Do not modify them.\n- Confirm W1a is marked done in status.json. If not, stop and escalate.\n\nWhat to build:\n1. A blog-side subscriber service that reads NC envelopes from Redis. Language: Go preferred to match NC. Decide at kickoff and document.\n2. A local envelope index keyed on content_id with a 90-day TTL. Implementation: SQLite unless a concrete reason says otherwise. Location: ~/.blog-pipeline/ (or similar), documented in blog CLAUDE.md.\n3. Entity -> queue-issue index built by scanning open content-queue issues on jonesrussell/jonesrussell.\n4. Entity -> published-post index built by scanning ~/dev/blog/content/posts/**/*.md frontmatter and body.\n5. NC envelope -> content-queue issue translator producing all consumer fields in 02-contracts.md. Inference rules must be deterministic functions of envelope fields (angle_hypothesis uses a cached LLM call per content_id -- see W2.md). Document rules in the service's README.\n6. GitHub issue writer with labels content-queue, stage:mined, source:<origin>, and appropriate type:* from 02-contracts.md.\n\nDeploy requirement:\n- W2's deploy disables the legacy coforge Redis subscriber in the same change. Running both simultaneously produces duplicate issues on coforge:core. Follow the Rollout deploy checklist: verify W2 live before disabling legacy; verify no duplicates after. Broader intake-unification (content-mine, source:git) stays W5's job.\n\nAcceptance criteria:\n- Envelope on a subscribed channel -> exactly one stage:mined issue with all consumer fields populated and all labels correct.\n- Idempotent on content_id (re-delivery does not double-create).\n- related_queue_issues[] and related_published_posts[] verified against two hand-picked examples.\n- Crash/restart test: kill mid-stream, restart, no loss and no dupes.\n- Legacy coforge subscriber disabled in same deploy; no duplicate coforge:core issues after cutover.\n- CLAUDE.md updated with the subscriber's Gotcha entry and backfill recipe.\n\nOut of scope (do not touch):\n- Workstreams W1a, W1b, W3, W4, W5.\n- NC code (this is blog-side only).\n- Production or distribution skills -- issue creation ends at stage:mined.\n- Content-mine workflow code deletion (W5's job; W2 only disables coforge).\n\nWhen done:\n- Update status.json and regenerate status.js per README.\n- Commit blog code and CLAUDE.md updates.",
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
        },
        {
          "id": "W2.T4",
          "title": "Legacy coforge subscriber cutover on deploy",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "W2 running and producing stage:mined issues for a known coforge:core item",
            "Legacy coforge subscriber disabled in same deploy change",
            "No duplicate issues on coforge:core after cutover"
          ],
          "complexity": "S",
          "links": [
            { "label": "Rollout section", "href": "workstreams/W2.md" }
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
      "summary": "Monday synthesis from local envelope index. Step 0: topic-coverage verification against NC source registry. Retire Cowork task after two-week parity.",
      "status": "not-started",
      "depends_on": ["W2"],
      "kickoff_prompt": "Execute workstream W3 from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- cd ~/dev/north-cloud && git pull origin main\n- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 01-adr-universal-consumer-split.md (especially the \"Where synthesis signals live\" section), 02-contracts.md, workstreams/W3.md.\n- Confirm W2 is marked done in status.json. If not, stop and escalate.\n\nStep 0 -- Topic coverage verification (blocking):\nInventory NC's source-manager registry against the four roundup topics: AI/ML, software development, tech business, cybersecurity.\n- Full coverage (>= 2 feeds per topic): proceed.\n- Sparse coverage: pick (a) extend NC source registry with new feeds, which pushes ~/dev/north-cloud into scope, or (b) add a web-search fallback for uncovered topics (matching how the Cowork task works). Document the inventory and the chosen fallback in a markdown file under this workstream's directory before writing any synthesis code.\n- Escalate to Russell if both (a) and (b) would be needed.\n\nWhat to build (after Step 0):\n1. A Monday ~8am UTC scheduled job (GitHub Action preferred) that reads the last 7 days of NC envelopes from the blog's local index and synthesizes a four-section industry roundup.\n2. Preserve the Cowork task's instruction text verbatim for the first two weeks, then allow edits. The instruction text should live in this workstream's directory or next to the GitHub Action; copy it in faithfully.\n3. Output:\n   - Default: Hugo draft under ~/dev/blog/content/posts/general/industry-roundup-YYYY-MM-DD/index.md following the blog's page-bundle convention.\n   - Optional: Substack draft under ~/brand/substack-issue-N.md. Decide with Russell at kickoff.\n4. Open a content-queue issue with:\n   - labels: content-queue, stage:mined, type:blog-post (or type:substack-issue), source:weekly-roundup\n   - body: link to the draft + short summary + source_signal_ids[] from the envelope index (preserve provenance).\n   The roundup does NOT bypass curation -- stage:mined, human promotes.\n5. Run for two consecutive Mondays alongside the Cowork task. Compare outputs. After sign-off, disable the Cowork schedule.\n\nAcceptance criteria:\n- Topic-coverage inventory committed and explicit.\n- Issue opens within 10 minutes of schedule, labeled stage:mined.\n- Output is a pure function of local index + instruction template (+ fallback search where configured).\n- Empty-topic sections say \"no significant news this week\" rather than fabricating.\n- Two weeks of side-by-side parity with Cowork before retiring the old task.\n\nOut of scope (do not touch):\n- Workstreams W1a, W1b, W2, W4, W5.\n- NC classifier/publisher code (consumer-side synthesis per ADR). The only NC-side exception is source-registry entries under option (a) above.\n- Promoting synthesis to NC (explicitly deferred; see 03-sequencing.md).\n\nWhen done:\n- Update status.json and regenerate status.js per README.\n- Commit the GitHub Action, any CLAUDE.md updates, the topic-coverage inventory, and the preserved Cowork instruction text.",
      "tasks": [
        {
          "id": "W3.T0",
          "title": "Topic-coverage verification against NC source registry",
          "repos": ["blog", "north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Inventory doc committed to workstream directory",
            "Coverage per topic area explicit (envelope-sourced vs. fallback)",
            "Option chosen (a or b) or escalated if both needed"
          ],
          "complexity": "S",
          "links": [
            { "label": "Workstream doc", "href": "workstreams/W3.md" }
          ],
          "kickoff_prompt": "",
          "notes": "",
          "updated_at": "2026-04-20T00:00:00Z"
        },
        {
          "id": "W3.T1",
          "title": "Monday scheduled synthesis job + draft output",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Issue opens within 10 min of Monday 8am UTC, labeled stage:mined",
            "Output pure function of local index + instruction template (+ fallback)",
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
      "summary": "Likely outcome: manual-paste with auto-draft via substack-writing skill. 30-min decision time-box then commit.",
      "status": "not-started",
      "depends_on": [],
      "kickoff_prompt": "Execute workstream W4 from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 02-contracts.md, 04-risks.md (R3), workstreams/W4.md.\n- Read ~/.claude/skills/content-pipeline/SKILL.md and channels.env.\n- Read ~/.claude/skills/substack-writing/SKILL.md -- the existing drafting skill Russell uses for the Ahnii! Substack at jonesrussell42.substack.com. This skill generates the draft; W4 wires it into distribution.\n\nWhat to build:\n1. Decision doc (30-minute time-box):\n   a) Does Buffer support Substack as a channel? Verify via Buffer's GraphQL API (the channels query lists configured channels).\n   b) Does Substack have a usable API or email-to-post path for this publication?\n   c) Chosen path: Buffer / direct / manual-paste-with-draft.\n   Likely outcome given R3: manual-paste-with-draft. If 30 minutes pass without a usable API surfacing, commit to manual and move on. Commit the decision doc even if the answer is \"manual paste.\"\n2. Draft generation: when an issue lists substack in suggested_channels, the distribution path invokes the substack-writing skill with the envelope + consumer fields and saves the draft to the skill's documented output location (~/brand/substack-issue-N.md).\n3. Implement the chosen posting path:\n   - Buffer: add Substack channel id to channels.env; extend the content-pipeline skill to post to it.\n   - Direct: write a small adapter.\n   - Manual: after the draft is produced, pause for operator confirmation, show the draft path, transition to stage:distributed on confirmation.\n4. Update content-pipeline SKILL.md with the new branch.\n5. Test end-to-end with one real or dry-run issue that lists substack in suggested_channels[].\n\nAcceptance criteria:\n- Issue with substack in suggested_channels[] triggers the substack-writing skill to produce a draft.\n- Distribution does not silently skip Substack.\n- Buffer targets (X, LinkedIn, Facebook) behavior unchanged.\n- Decision doc committed.\n\nOut of scope (do not touch):\n- Workstreams W1a, W1b, W2, W3, W5.\n- Changes to the substack-writing skill beyond wiring for distribution.\n- NC code (output-side concern only).\n\nWhen done:\n- Update status.json and regenerate status.js per README.\n- Commit blog code, skill updates, and the decision doc.",
      "tasks": [
        {
          "id": "W4.T1",
          "title": "Decision doc (30-min time-box): Buffer / direct / manual-paste",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Decision doc committed to workstream directory",
            "Verification of Buffer channel support recorded",
            "Substack API/email-to-post feasibility recorded",
            "Investigation bounded to 30 minutes; manual-paste default if none surfaces"
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
          "title": "Wire substack-writing skill + implement chosen posting path",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Issue with substack in suggested_channels[] triggers substack-writing skill",
            "Draft lands at ~/brand/substack-issue-N.md",
            "Buffer targets unchanged",
            "content-pipeline SKILL.md updated"
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
      "summary": "Fold content-mine miner onto the envelope pattern via source:git Redis channel. Delete legacy coforge code (W2 already disabled it at deploy).",
      "status": "not-started",
      "depends_on": ["W1a", "W2"],
      "kickoff_prompt": "Execute workstream W5 from the content-pipeline-unification initiative.\n\nBefore doing anything:\n- cd ~/dev/blog && git pull origin main\n- cd ~/dev/north-cloud && git pull origin main\n- Read planning docs: ~/dev/blog/docs/plans/2026-04-20-content-pipeline-unification/README.md, 00-overview.md, 02-contracts.md, 03-sequencing.md, workstreams/W5.md.\n- Read the existing content-mine workflow at ~/dev/blog/.github/workflows/content-mine.yml and the content-mine skill.\n- Confirm W1a and W2 are marked done in status.json. If not, stop and escalate.\n\nWhat to build:\n1. Rewrite the git-activity miner to produce envelopes that match the NC envelope contract. Emit on a synthetic source:git Redis channel consumed by W2's subscriber. The subscriber then produces the stage:mined issue -- the miner does not write issues directly anymore. (Redis, not in-process: consistency with NC's pattern.)\n2. Remove the now-disabled legacy coforge Redis subscriber code. W2's deploy already disabled it at runtime; W5 deletes the dead code after verifying no duplicate issues on coforge:core.\n3. Dual-write for one week: old and new paths produce issues in parallel. Verify parity by comparing shapes on a sample of issues.\n4. Cut over: disable old paths, remove legacy code. Document the removal in blog CLAUDE.md and note \"one intake shape, one lifecycle\" as a rule future sessions must uphold.\n\nAcceptance criteria:\n- All three v1 intakes produce identically-shaped stage:mined issues.\n- No references to the legacy content-mine issue shape remain.\n- CLAUDE.md documents \"one intake shape, one lifecycle\" as a maintained rule.\n- Running any single intake with the others disabled still produces valid issues.\n\nOut of scope (do not touch):\n- Workstreams W1a, W1b, W2, W3, W4.\n- Production/distribution skills -- you are only touching the intake side.\n- The coforge-subscriber disable step itself (W2 already did that).\n\nWhen done:\n- Update status.json and regenerate status.js per README.\n- Commit blog (and any NC) changes. If this closes the initiative, update 00-overview.md's Definition of Done accordingly.",
      "tasks": [
        {
          "id": "W5.T1",
          "title": "Rewrite git-activity miner to source:git Redis envelope pattern",
          "repos": ["blog"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "Miner emits envelopes on source:git Redis channel consumed by W2",
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
          "title": "Delete legacy coforge subscriber code",
          "repos": ["blog", "north-cloud"],
          "status": "not-started",
          "assigned_session": "",
          "blockers": [],
          "acceptance": [
            "No legacy subscriber code remains",
            "No duplicate issues on coforge:core confirmed before deletion"
          ],
          "complexity": "S",
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
}
; window.STATUS_GENERATED_AT = "2026-04-20T20:08:05Z";
