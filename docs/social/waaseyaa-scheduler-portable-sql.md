# INSERT OR REPLACE is SQLite-only, and it broke every scheduler tick

Reference URL: https://github.com/waaseyaa/framework/pull/1728

## Bluesky

A portability bug worth knowing: our scheduler recorded each run with SQLite's INSERT OR REPLACE. That is a syntax error on MySQL and Postgres, so every tick threw there. Fix: a portable upsert, UPDATE then INSERT when no row changed. https://github.com/waaseyaa/framework/pull/1728 #buildinpublic

## LinkedIn

Dialect-specific SQL in shared code is a bug waiting for a different database.

Our scheduler records each run in a small state table. The repository used INSERT OR REPLACE to upsert that row. It worked perfectly, on SQLite.

INSERT OR REPLACE is SQLite syntax. On MySQL and Postgres it is a syntax error. So on any non-SQLite deployment, every single scheduler tick threw at the point it tried to record its run. The feature was effectively dead anywhere but the database it happened to be developed on.

The fix is a portable upsert built from the query builder: a transaction-wrapped UPDATE, then an INSERT when no row was affected. No engine-specific clause, and the per-task overlap lock guarantees a single writer so the update-then-insert is safe. The overlap lock itself was also made durable, keyed off database availability rather than assuming it.

The general lesson: if code ships against more than one database, every statement has to be portable or explicitly branched per dialect. INSERT OR REPLACE, ON CONFLICT, ON DUPLICATE KEY, RETURNING, the LIMIT in an UPDATE, these are all dialect traps. The one you reach for by habit is usually the one that only exists in the database you tested on.

https://github.com/waaseyaa/framework/pull/1728

#buildinpublic #php #sql #softwaredevelopment

## Facebook

A portability bug worth sharing. Our scheduler records each run in a state table, and the repository upserted that row with INSERT OR REPLACE. That worked great on SQLite, but INSERT OR REPLACE is SQLite-only syntax. On MySQL and Postgres it is a syntax error, so every scheduler tick threw there and the feature was dead on any non-SQLite deployment.

The fix is a portable upsert from the query builder: a transaction-wrapped UPDATE, then an INSERT when no row was affected, with an overlap lock guaranteeing a single writer. The general lesson: if your code runs against more than one database, every statement has to be portable or branched per dialect. INSERT OR REPLACE, ON CONFLICT, ON DUPLICATE KEY, RETURNING. The one you reach for by habit is usually the one that only exists in the database you tested on. https://github.com/waaseyaa/framework/pull/1728

#buildinpublic
