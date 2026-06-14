# Append-only audit log enforced at the database layer

Reference URL: https://github.com/waaseyaa/framework/commit/e3bf6fcaf255c5e08b699456ceaab0498f591236

## Bluesky

An append-only audit log is just a convention until something enforces it. So the database now throws on any UPDATE or DELETE to audit_event. Inserts pass, mutations don't. #buildinpublic

https://github.com/waaseyaa/framework/commit/e3bf6fcaf255c5e08b699456ceaab0498f591236

## LinkedIn

"Append-only" is a promise most audit logs can't keep.

The table is writable. The application code is just trusting itself not to issue an UPDATE or a DELETE. One stray query, one well-meaning migration, and the record of what happened quietly changes.

I moved the guarantee down a layer.

The Waaseyaa framework now wraps audit writes in AppendOnlyAuditDatabase, a thin decorator over the database connection. It throws on any UPDATE or DELETE targeting the audit_event table. Inserts, reads, and schema calls pass straight through. The writer itself was rewritten to do one thing: a parameterized INSERT. The only mutation it can express is an append.

This replaced a guard class that existed but was never actually wired in. Active enforcement, not a convention sitting in a comment somewhere.

A few details that made it clean:

Legitimate deletion still works. The retention purge (audit:prune) talks to the raw connection, so trimming old events is fine. What's blocked is mutation through the write path, not all deletion everywhere.

The log tables stopped pretending to be entities. audit_event and audit_retention_policy were registered as content entities, which implied a CRUD and update path that should never exist for a log. De-registering them also cleared 8 false-positive schema drift warnings.

And there's a test that tries to cheat: write an event, then attempt to update it and delete it. Both throw. The row is still intact afterward.

If your invariant matters, put it somewhere the application can't forget to honor it.

https://github.com/waaseyaa/framework/commit/e3bf6fcaf255c5e08b699456ceaab0498f591236

#softwarearchitecture #php #buildinpublic #databases

## Facebook

Most audit logs call themselves "append-only" but nothing actually stops a write. The table is mutable, and the code is just trusting itself never to issue an UPDATE or DELETE.

I pushed that guarantee into the database layer of the Waaseyaa framework. Audit writes now go through a decorator that throws on any UPDATE or DELETE to the audit_event table. Inserts and reads pass through. The writer was rewritten to a single parameterized INSERT, so the only thing it can do is append. Legitimate retention purging still works through a separate sanctioned path, and there's a test that proves a written event can't be updated or deleted afterward.

If an invariant matters, enforce it where the application can't forget to.

https://github.com/waaseyaa/framework/commit/e3bf6fcaf255c5e08b699456ceaab0498f591236

#php #buildinpublic
