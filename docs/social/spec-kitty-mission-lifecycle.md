# Spec Kitty mission lifecycle: a domain modeling pass through Giiken

Reference URL: https://jonesrussell.github.io/blog/spec-kitty-mission-lifecycle/

## X

Spec Kitty drove a mission end to end on Giiken: spec, plan, tasks, implement, review, merge. Wrote up what the trail looks like on disk. #buildinpublic

**First reply:**
https://jonesrussell.github.io/blog/spec-kitty-mission-lifecycle/

## LinkedIn

Most agent frameworks promise "end to end" workflows. Most stop at "generate a plan and hope."

Spec Kitty is different. It runs a real mission through a state machine, with artifacts on disk and gates between phases.

I just walked one of those missions, giiken-domain-modeling-01KR2HKT, from spec to merge. The whole lifecycle: specify, plan, tasks, implement, review, merge.

The output is a directory under kitty-specs/, with thirteen files in the merge commit. spec.md is the contract. plan.md is the chosen approach. research.md plus two CSVs are the evidence trail. status.json and the events log are the lane state and audit log. A requirements checklist gates each phase.

What this is not: a generated artifact dump.

Every transition is gated. You cannot move a work package to approved without a passing review. You cannot merge with WPs still in flight. The agent is constrained to the shape of the state machine, not free to wander.

The output of any one mission is replaceable. The trail is not.

If you have been around agent workflows for any length of time, you know the failure mode: the AI session ends, the context evaporates, the next session reconstructs everything from the code. Spec Kitty inverts that. The mission directory is the persistent context. The next agent picks up the spec and the checklist, not a chat log.

That is the lifecycle proof. Not "an agent shipped code," but "an agent moved through a structured workflow that another agent or human can audit, resume, or extend."

Full writeup with the directory layout and what each artifact actually does in the first comment.

#softwaredevelopment #ai #buildinpublic #opensource

**First comment:**
https://jonesrussell.github.io/blog/spec-kitty-mission-lifecycle/

## Facebook

Walked a real Spec Kitty mission end to end this week: spec, plan, tasks, implement, review, merge. The mission was domain modeling for Giiken, a community knowledge service.

The interesting part is not the code that landed. It is the trail. Every phase writes an artifact. Every transition is gated. The mission directory becomes a persistent context that survives session ends and hands off cleanly to the next agent or human.

Wrote up what the directory looks like and why the trail matters more than the output.

#buildinpublic

**First comment:**
https://jonesrussell.github.io/blog/spec-kitty-mission-lifecycle/
