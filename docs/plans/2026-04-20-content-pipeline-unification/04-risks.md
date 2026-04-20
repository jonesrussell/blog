# Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | NER implementation choice in W1a becomes a time sink (quality vs. latency vs. cost trade-offs) | Medium | High | Start W1a with a brief ADR choosing between rules-based, spaCy sidecar, and LLM call. Pick on constraints, not preferences. Budget: one session for decision, one for implementation. |
| R2 | Local envelope index in W2 grows unbounded | Medium | Medium | Index has a TTL (default 90 days). Roundups and entity fan-in do not need deeper history. Rehydrate from NC Elasticsearch on demand if needed. |
| R3 | Substack has no public API, forcing manual paste | High | Low | Accept manual posting for v1. W4 produces the draft automatically; operator pastes. Revisit when an API or reliable email-to-post path is available. |
| R4 | Schema drift between NC envelope in code and envelope in `02-contracts.md` | High if unmanaged | High | Contract doc is edited first, then code. Add a classifier/publisher test that asserts envelope payload matches `02-contracts.md`. Listed in W1a's acceptance criteria. |
| R5 | W5 migration of existing intakes breaks running GitHub Action schedules | Medium | Medium | W5 runs as a dual-write period: old shape and new shape emit side-by-side for one week. Rollback is a config flag. |
| R6 | Entity index surfaces names that should not be cross-indexed | Low | Medium | NER output is cached but not published to any external surface. Entity fan-in is consumer-side and local. Issues show entity tags, not raw source fragments. |
| R7 | Weekly roundup quality regresses when moving off Cowork's model/prompt | Medium | Medium | W3 preserves the Cowork task's instructions verbatim in its first two iterations. Side-by-side compare for two weeks before retiring the Cowork task. Rollback: re-enable the Cowork schedule. |
| R8 | Blog subscriber service becomes a single point of failure for all intake | Medium | High | Service is crash-only — restart reconsumes from Redis. Issue creation is idempotent on `content_id`. NC-side envelopes are durable in Elasticsearch for backfill. |
| R9 | Plan and status drift as sessions execute | High | Medium | Every workstream kickoff prompt requires a `status.json` update at session end. Dashboard warns when `status.js` is older than `status.json`. Drift is visible. |
| R10 | ADR's synthesis-location decision relitigated every time W3 is touched | Medium | Low | ADR section "Where synthesis signals live" is explicit. W3's kickoff prompt references it by filename + section. |
| R11 | Two enrichment locations (NC universal, blog consumer) confused during code review | Medium | Medium | ADR states the rule of thumb: same field name across consumers → NC; consumer-disagreement on value → consumer. Link it from each workstream's kickoff prompt. |

Escalation: any risk graduating from Medium to High in flight gets an entry
here and, if load-bearing, an ADR update. Not a silent workaround.
