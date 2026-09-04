Queue-Issue: #1081
Reference URL: https://github.com/goformx/goformx/pull/114

## Bluesky

A contact form is only as useful as its delivery guarantee. GoFormX now ships a signed webhook outbox: submissions are written durably, dispatched over HMAC-verified HTTP, and retried automatically if your endpoint is down. https://github.com/goformx/goformx/pull/114 #buildinpublic #golang

## LinkedIn

Contact forms are a spam magnet. Most form backends spend all their energy on intake filtering and none on the question that actually matters when a real submission arrives: did it reach you?

GoFormX, an open-source Go forms service, just closed that gap across two shipped milestones.

First, schema-first abuse controls. The API now enforces a per-form token bucket rate limiter that runs before the request body is decoded. On top of that, a rolling 24-hour daily submission quota is enforced with PostgreSQL advisory locks to prevent race conditions under concurrent load. Cursor-based pagination with hard page-size caps keeps list endpoints from becoming a data dump. The implementation lives in submission_limiter.go; the full threat model is in docs/security/threat-model.md if you want the reasoning behind the design choices.

Second, durable webhook delivery. Submissions are written to a webhook outbox table in the same database transaction as acceptance. A dispatcher reads from the outbox, builds a signed POST to your configured endpoint using HMAC-SHA256, and retries on failure. The signing key never leaves your infrastructure. If your endpoint is down when a submission comes in, you still get it when it comes back.

Together they enforce a hard boundary between accepting a submission and delivering it, with verification on both sides of that boundary.

Code is in the goformx/goformx repository. The webhook outbox landed in PR #114, and the schema-first abuse gate in PR #112.

https://github.com/goformx/goformx/pull/114

#golang #webhooks #opensourcego #buildinpublic #formsecurity

## Facebook

Most contact form setups have one failure mode nobody thinks about until it happens: you get a real inquiry, your backend is temporarily down, and the submission is gone.

GoFormX, an open-source Go forms service, now ships a webhook outbox to close that gap. Submissions are written to a durable outbox table in the same transaction as acceptance. A dispatcher reads from the outbox, signs each delivery with HMAC-SHA256, and retries until your endpoint acknowledges it. If the endpoint is down when the submission arrives, you still get the delivery when it recovers.

The same release adds schema-first abuse controls: per-form token bucket rate limiting, daily rolling quotas enforced with PostgreSQL advisory locks, and bounded cursor-based pagination. Two separate problems addressed in one shipping window.

https://github.com/goformx/goformx/pull/114

#buildinpublic #golang

Distributed: 2026-09-04 (autopilot, customScheduled)
