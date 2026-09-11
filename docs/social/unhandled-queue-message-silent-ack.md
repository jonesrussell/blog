# Fixing a silent message-drop bug in Waaseyaa's queue worker

## Bluesky

Found a bug in our PHP queue worker: messages with no matching handler were silently acknowledged and dropped instead of failing. Fixed it to throw, retry, and dead-letter like every other failure.

https://jonesrussell.github.io/blog/unhandled-queue-message-silent-ack/

## LinkedIn

Wrote up a bug I fixed in Waaseyaa's queue worker this week.

The worker's dispatch loop looked for the first handler that supported an incoming message. If nothing matched, the loop just ran out and returned normally, so the caller acknowledged the delivery as successful. A message nobody handled looked identical to one a handler had actually processed. No retry, no dead-letter row, no record in the failed-job repository. It just disappeared.

The fix was one throw statement: raise a typed exception when the handler roster is exhausted instead of returning. That routed unsupported messages through the retry, backoff, and failed-job recording paths that already existed for every other kind of failure, ordered so a failed-job store outage still preserves the delivery instead of losing it a second way.

The general lesson: a dispatch loop that runs out of candidates without doing anything is easy to miss, because no handler matched does not read like an error, it reads like the absence of work. A message pulled off a durable queue is a promise, not optional work.

https://jonesrussell.github.io/blog/unhandled-queue-message-silent-ack/

#php #softwareengineering #queues #backend #reliability

## Facebook

Fixed a sneaky bug this week where our PHP queue worker silently acknowledged and dropped messages that had no matching handler, instead of retrying or recording them as failed. Wrote up the bug, the one-line fix, and the general lesson about dispatch loops that finish without doing anything.

https://jonesrussell.github.io/blog/unhandled-queue-message-silent-ack/

#php #buildinpublic
