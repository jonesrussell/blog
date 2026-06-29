# Tamper-evident audit log in the Waaseyaa framework

Reference URL: https://github.com/waaseyaa/framework/pull/1791

## Bluesky

Added a tamper-evident audit log to the Waaseyaa framework. Every event hash-chains to the one before it, so audit:verify detects any after-the-fact edit. Checkpoint-aware pruning keeps it verifiable over time.

https://github.com/waaseyaa/framework/pull/1791

#buildinpublic

## LinkedIn

An audit log is only worth something if you can prove nobody quietly edited it later.

This week I shipped tamper-evidence for the Waaseyaa framework's audit package.

Every audit event now carries a hash that chains to the previous event, anchored at a genesis row. Change one row after it is written and the chain breaks at that exact point, visibly.

A new audit:verify command walks the whole chain and reports where tamper detection fails, if it does.

The hard part was pruning. You cannot keep every event forever, but naive deletion destroys the chain. So pruning is checkpoint-aware: the framework seals segments behind checkpoints, and audit:prune only removes whole segments already covered by one. The chain stays verifiable even after old data is gone.

I also closed a bypass while I was in there. AppendOnlyAuditDatabase::schema() could be used to sidestep the append-only guarantee. That is fixed.

This matters most for the platforms I build on Waaseyaa that hold community data, where being able to demonstrate integrity is not optional.

https://github.com/waaseyaa/framework/pull/1791

#php #opensource #buildinpublic #softwarearchitecture #security

## Facebook

An audit log is only worth something if you can prove nobody quietly edited it later.

This week I shipped tamper-evidence for the Waaseyaa framework's audit log. Every event hash-chains to the one before it, anchored at a genesis row, so a single after-the-fact edit breaks the chain right where it happened. A new audit:verify command walks the chain and shows you where, and pruning old data is checkpoint-aware so the log stays verifiable even after segments are removed.

https://github.com/waaseyaa/framework/pull/1791

#buildinpublic #php
