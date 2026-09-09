Queue-Issue: #1104
Reference URL: https://github.com/jonesrussell/northway/commit/7cfbeca6251bf0574af1d85eb7adbb90df511b4a

## Bluesky

Optimistic billing in a metered API is a correctness bug. northway commits a SQLite spending hold before a query runs, rolls back on failure, and scopes every request to a tenant API key so you know exactly who ran what. https://github.com/jonesrussell/northway/commit/7cfbeca6251bf0574af1d85eb7adbb90df511b4a #buildinpublic #golang

## LinkedIn

Optimistic billing is a silent failure mode.

When your service charges per AI query, the gap between "work ran" and "charge recorded" is a window for loss. A crash, a timeout, a rollback on the application side, and you've either eaten the cost or double-billed the customer. Neither is acceptable at scale.

The fix in northway is atomic: before a query executes, a spending hold is written to SQLite in the same transaction as the query record. If the work fails, the hold rolls back. If it succeeds, the hold converts to a committed charge. There is no window.

What made this tractable in Go is that SQLite's WAL mode handles concurrent readers without locking out the writer, so the spending hold does not serialize every query through a bottleneck. The query coordination layer in internal/sqlite/query.go wraps the state machine: pending, held, completed, failed.

Alongside that, every API request is now scoped to a tenant API key. The key table lives in db/migrations/00003_api_keys.sql and ties every query record to the tenant that ran it. No key, no query.

This is the foundation for a fair, auditable metered service. The alternative, trusting the caller to report usage, is not a foundation at all.

Code: https://github.com/jonesrussell/northway/commit/7cfbeca6251bf0574af1d85eb7adbb90df511b4a

#golang #sqlite #buildinpublic #softwareengineering #devtools

## Facebook

When you charge per API call, the gap between "the work ran" and "the charge landed" is a real problem. A crash in that window means you eat the cost or you bill twice.

In northway, a SQLite spending hold is committed before the query runs. If execution fails, the hold rolls back atomically. The charge only lands when the work completes. No gap, no ambiguity.

Every request is also tied to a tenant API key so there is a clear audit trail of who ran what and when. The key table and query coordination were both added in one session of Go work this week.

https://github.com/jonesrussell/northway/commit/7cfbeca6251bf0574af1d85eb7adbb90df511b4a #buildinpublic #golang
