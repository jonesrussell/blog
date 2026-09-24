Queue-Issue: #1148
Reference URL: https://github.com/waaseyaa/framework/commit/b7d83958c184d30180b0df55010a49c9dce9cc34

## Bluesky

A missing unique constraint on client_id lets two OIDC clients share one identity. Token routing then breaks silently. Waaseyaa adds a partial unique index on oidc_client.client_id so the registry rejects duplicates on insert. https://github.com/waaseyaa/framework/commit/b7d83958 #buildinpublic

## LinkedIn

OIDC client registration has an integrity gap that is easy to miss until it causes a problem.

When your authorization server routes a token request, it looks up the client by client_id. If two client records share the same id, the lookup is ambiguous. You get wrong-client token delivery, or an error that is hard to trace because the individual operations all look correct.

Most OIDC implementations assume the application layer prevents this. But without a database constraint, a retry, a race condition, or a bug in registration code can create duplicate client_id values. The failure is silent: records are written successfully, tokens are issued, and something downstream behaves unexpectedly.

Waaseyaa closes this with a partial unique index on oidc_client.client_id in the OIDC package. The index makes duplicates a database-level rejection, not something the application has to remember to check. If a registration attempt would produce a duplicate, the insert fails at the database before the application can treat it as success.

The test suite adds client identity recovery contracts alongside the index: tests that cover what happens when a registration hits the constraint, what state is left behind, and what the caller receives. The spec review confirmed this change does not touch signing key lifecycle or token validation behavior. It is purely a registry integrity constraint.

If you are running Waaseyaa's OIDC provider and have not applied this migration, you have a window where a registration race or retry can produce duplicate client_ids. The migration is safe to run against an existing registry.

https://github.com/waaseyaa/framework/commit/b7d83958c184d30180b0df55010a49c9dce9cc34

#php #oidc #security #buildinpublic #waaseyaa

## Facebook

If two OIDC clients can share the same client_id, your authorization server cannot route token requests reliably. The failure is silent: inserts succeed, tokens are issued, but they may be going to the wrong client.

Waaseyaa adds a partial unique index on oidc_client.client_id. Duplicate registration now fails at the database level. The test suite covers client identity recovery contracts, including what state is left behind when a duplicate is attempted.

https://github.com/waaseyaa/framework/commit/b7d83958c184d30180b0df55010a49c9dce9cc34 #buildinpublic

Distributed: 2026-09-24 (autopilot, customScheduled)
