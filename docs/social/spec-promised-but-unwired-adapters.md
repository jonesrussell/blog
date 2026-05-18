# Spec-promised but unwired: deleting two adapters that never got a caller

Reference URL: https://github.com/waaseyaa/framework/pull/1508

## Bluesky

Speced two adapters last sprint. Neither got wired. Today we shipped two PRs deleting both. Sometimes the right move is taking it back out. #buildinpublic

https://github.com/waaseyaa/framework/pull/1508

## LinkedIn

Two adapters that shipped into last sprint's spec just shipped back out.

The pattern: we wrote SseBroadcaster and an ai-agent McpServer adapter into the design because the architecture said they'd be needed. Both got built. Neither got wired to a caller. They sat in the codebase like vestigial scaffolding, accruing dead-code warnings.

Today's resolution: delete both. PR #1507 took out SseBroadcaster, PR #1508 took out the McpServer adapter. The spec gets updated to no longer promise them.

This is a kind of spec drift you don't read about as much. Not the case where the code outruns the spec, but the case where the spec outruns the code. The design said "these adapters exist", the code said "no caller asked", and the gap quietly widened until somebody noticed.

The decision wasn't dramatic. Three options were on the table: ship a caller, delete the orphan, or formally accept-and-defer. We chose delete because deferring something nobody is asking for is just unbounded debt with a polite name.

What this costs you, when you make the call, is intellectual honesty about how much you actually know upfront. The spec promised a piece of infrastructure that turned out to be unneeded. Taking it back out is the cheap correction. Letting it ride would be the expensive one.

If you run a spec-first workflow, you'll have this moment eventually. Better to have it on day 60 than on day 600.

https://github.com/waaseyaa/framework/pull/1508

## Facebook

Two adapters we shipped into last sprint's spec just shipped back out.

SseBroadcaster and an ai-agent McpServer adapter both got built because the design said we'd need them. Neither one ever got wired to a caller. So today we shipped two PRs deleting both, and updated the spec to stop promising them.

Spec drift goes both ways. Sometimes the code outruns the spec, sometimes the spec outruns the code. The fix is the same either way: close the gap honestly. Taking dead scaffolding back out is cheaper than letting it ride.

https://github.com/waaseyaa/framework/pull/1508

#buildinpublic
