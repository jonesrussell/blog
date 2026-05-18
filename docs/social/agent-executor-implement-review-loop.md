# Agent Executor v1: the multi-agent loop building itself

Reference URL: https://github.com/waaseyaa/framework/commit/66ef3fd

## Bluesky

Two Claude agents are building the multi-agent dispatch primitive today. Implementer writes, reviewer pushes back, spec arbitrates. WPs landing in alternating beats. The primitive is being built by the orchestration it enables. #buildinpublic

https://github.com/waaseyaa/framework/commit/66ef3fd

## LinkedIn

Two AI agents are building the primitive that lets agents dispatch other agents.

Agent Executor v1, the new orchestration layer in the Waaseyaa framework, was filed as a Spec Kitty mission this morning. Spec at 04:54Z, plan at 04:56Z, work packages by 15:11Z, two WPs approved by mid-afternoon, third in review by 17:24Z. All of that on the same day.

The interesting part is who did the work. The git log labels each commit with the agent that produced it: claude:sonnet:implementer writes a work package, claude:opus-4-7:reviewer pushes back on it. The implementer fixes, the reviewer signs off, the spec stays as the arbiter. Two beats per WP.

If you read the log straight, it looks like a slightly weird code review. If you step back, it's a multi-agent system building the multi-agent system that lets agents dispatch other agents.

Why this matters: until now, Spec Kitty workflows ran one agent at a time. The implementer was a single Claude instance, the reviewer was a separate session, and a human held the handoff. Agent Executor takes the dispatch primitive itself into the framework, so a mission can route subtasks across agent profiles without a human in the loop for every transition.

That gets you compounding leverage on the runs where the spec is correct. It gets you nothing on the runs where it isn't. Same as before, just faster on the good runs and faster to a dead end on the bad ones.

Worth saying out loud either way. Watching the receipts roll in throughout the day, with one Claude reviewing another Claude's work and both of them converging on something that compiles and passes a spec, is the cleanest demonstration of where this is going.

https://github.com/waaseyaa/framework/commit/66ef3fd

## Facebook

Two AI agents are building the primitive that lets agents dispatch other agents.

Agent Executor v1 was filed as a Spec Kitty mission in the Waaseyaa framework this morning. The git log labels each commit with the agent that produced it: one Claude variant implementing work packages, another reviewing them, the spec arbitrating between the two. Three WPs cycled through implement and review in a single afternoon.

The meta-loop is the point. A multi-agent orchestration system is building the multi-agent orchestration system that enables it. Most of the time this kind of thing reads as a contrived demo. This one's just the day's work.

https://github.com/waaseyaa/framework/commit/66ef3fd

#buildinpublic #waaseyaa
