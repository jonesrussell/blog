# check-milestones: REST list instead of Search API for consistency

Reference URL: https://github.com/waaseyaa/framework/pull/1475

## Bluesky

bin/check-milestones was reporting stale because GitHub's Search API has indexing lag, so freshly-closed milestones still looked open. Switched to the REST list endpoint, which is consistent. Same data, no race. #buildinpublic

https://github.com/waaseyaa/framework/pull/1475

## LinkedIn

A small fix to a release-time check script worth flagging because the underlying gotcha is general.

The Waaseyaa framework has a `bin/check-milestones` script that gates releases on whether all expected milestones have closed. It was occasionally reporting stale: a milestone that had just been closed would still show as open, the script would fail, and re-running it 30 seconds later would pass.

Root cause: the script was querying GitHub's Search API. Search is built on an asynchronous index. When you close an issue or milestone via the REST API, the change is durable on the underlying record immediately, but Search doesn't see it until the next indexing pass. The gap can be seconds to minutes, with no way to wait for consistency from the client.

Fix: switch from Search to the REST list endpoint. Same data, no race. The list endpoint reads from the primary record, so it reflects the most recent state.

The general lesson: any time you're checking the state of something you just modified, ask whether your read path goes through an async index or a primary record. Search APIs are usually optimized for query expressiveness, not consistency. When you need read-after-write semantics on a recently modified record, find a direct endpoint.

This bites people most often in deploy gates and CI scripts that close issues and then read them back. The fix is almost always to skip Search.

https://github.com/waaseyaa/framework/pull/1475

## Facebook

Small but generalizable fix in the Waaseyaa framework. The `bin/check-milestones` release-gate script was sometimes failing on freshly-closed milestones: GitHub's Search API has asynchronous indexing lag, so the recent state change wasn't visible yet.

Fix: switch from Search to the REST list endpoint, which reads from the primary record and reflects the latest state immediately.

The lesson generalizes. Any deploy gate or CI script that closes something and then reads it back needs to think about whether the read path is consistent. Search is almost never the right choice for read-after-write.

https://github.com/waaseyaa/framework/pull/1475

#buildinpublic #waaseyaa
