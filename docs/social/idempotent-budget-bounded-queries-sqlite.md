Queue-Issue: #1104
Reference URL: https://github.com/jonesrussell/northway/commit/7cfbeca6251bf0574af1d85eb7adbb90df511b4a

## Bluesky

A retried AI query should never bill you twice. northway's SQLite store reserves a budget hold before calling a provider and only settles it once the real cost is known, keyed by an idempotency hash. https://jonesrussell.github.io/blog/idempotent-budget-bounded-queries-sqlite/ #golang

## LinkedIn

How do you stop a retried API call from charging a customer twice for the same paid AI query?

northway, a Go service that builds source-backed news feeds for AI agents, answers with a single SQLite writer and a reserve-then-settle spend model. Before calling an AI provider, a query reserves a worst-case budget hold. Storage only settles the difference once the real cost is known. A second call with the same idempotency key never starts a second paid attempt: it just returns the cached result, or the in-progress claim.

The claim moves through explicit states — pending, started, done or failed — and each transition checks its own precondition inside the database transaction, not just in a comment. If a process dies mid-call, the lease expires and the hold is recovered as uncertain rather than assumed free. Reconciling it later takes actual evidence, not elapsed time.

Full write-up on the writer locking, tenant-scoped keys, the claim lifecycle, and how storage rejects out-of-range timestamps before they can corrupt a version history.

https://jonesrussell.github.io/blog/idempotent-budget-bounded-queries-sqlite/

#golang #sqlite #softwarearchitecture #api #buildinpublic

## Facebook

northway is a Go service building source-backed news feeds for AI agents. Every query that reaches a paid provider has to survive a retry without charging twice. The fix: a single SQLite writer, a reserve-then-settle budget model, and an idempotent claim lifecycle. A retried request either reuses the cached result or resumes its in-progress claim — it never pays twice.

Full breakdown at https://jonesrussell.github.io/blog/idempotent-budget-bounded-queries-sqlite/ #golang
