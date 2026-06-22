# An append-only audit log that double quotes could erase

Reference URL: https://github.com/waaseyaa/framework/pull/1709

## Bluesky

Sharp one: our append-only audit log blocked raw deletes by stripping quoted spans as string literals. But in SQLite and Postgres, double quotes are identifiers. DELETE FROM "audit_event" hid the table name from the guard and erased the log. https://github.com/waaseyaa/framework/pull/1709 #buildinpublic

## LinkedIn

A guard is only as good as its model of the thing it is guarding. Here is one that looked airtight and was not.

We have an append-only audit database. Deletes and updates to the audit table must never reach the underlying engine. The raw-SQL guard enforced this partly by stripping out quoted spans before inspecting the statement, on the assumption that quotes wrap string literals you can safely ignore.

That assumption is wrong in SQL. In SQLite and Postgres, single quotes are string literals, but double quotes are identifier quotes. Table and column names.

So DELETE FROM "audit_event" stripped the quoted span as if it were a literal, which erased the table name from the guard's view. The statement looked harmless to the guard and reached the inner database, mutating the append-only log. The same trick worked with the backtick, bracket, and schema-qualified forms SQLite accepts.

We proved it with a test: under the old code those statements raise the engine's table-not-found error, not the guard's logic error, which means they got through.

The fix closes the identifier-quoting forms so the table name is always visible to the guard.

The general lesson: do not parse SQL by guessing what quotes mean. Quote characters carry different meaning by dialect, and an attacker will pick the meaning you did not handle. A denylist that strips spans is fragile by design.

https://github.com/waaseyaa/framework/pull/1709

#buildinpublic #security #sql #php

## Facebook

A sharp bug worth sharing. We have an append-only audit log, and its raw-SQL guard blocked deletes by stripping quoted spans before inspecting the statement, assuming quotes wrap string literals. But in SQLite and Postgres, double quotes are identifier quotes, not string literals. So DELETE FROM "audit_event" stripped the table name out of the guard's view, looked harmless, and reached the database, mutating the supposedly append-only log. The backtick and bracket forms worked too.

The fix closes those identifier-quoting forms so the table name is always visible to the guard. The general lesson: do not parse SQL by guessing what quotes mean. Quote characters differ by dialect, and an attacker will pick the one you did not handle. https://github.com/waaseyaa/framework/pull/1709

#buildinpublic
