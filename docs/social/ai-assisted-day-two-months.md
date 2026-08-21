# One AI-assisted day, two months of senior engineering

Reference URL: https://jonesrussell.github.io/blog/ai-assisted-day-two-months/

## Bluesky

One AI-assisted day: 14 PRs merged, a 358-site SQLite audit, and a pile of latent defects caught on the adversarial second pass. Roughly two months of senior engineering in one window. The receipts: https://jonesrussell.github.io/blog/ai-assisted-day-two-months/ #buildinpublic

## LinkedIn

In about 24 hours, a stacked backlog of conflicting and half-validated pull requests across the Waaseyaa Framework and Sheg became a clean landing sequence.

The receipts:

Fourteen PRs merged, twelve in the Framework, two in Sheg. SQLite schema authority, safe embed lifecycle, entity revision authorization, upgrade deadlock protection, and more, each rebased against a main that never stopped moving.

But the merge count hides the real work: the defects that survived their own original implementations and only surfaced on the second pass. Two authorization holes. Advisory exceptions leaking across layers. Acceptance-test failures being swallowed, a green check on a red result. A Composer subprocess deadlocking on a pipe. None of that is in the write-the-feature budget. It is the tax you only pay when someone reviews the work adversarially instead of rubber-stamping it.

Underneath it all, a 358-site SQLite coupling inventory across 108 files, the real map of what Postgres and MySQL support will cost.

And what I chose not to do: no tag, no release, no deploy, no production mutation. Velocity is worthless if it quietly ships a bad alpha.

Hand this to one senior developer at the same starting point: roughly 8 full-time weeks, 240 to 400 hours. So the comparison is not 24 hours versus scratch. It is one AI-assisted day against two months of conventional senior engineering.

https://jonesrussell.github.io/blog/ai-assisted-day-two-months/

#ai #softwaredevelopment #buildinpublic #engineering

## Facebook

In about 24 hours, a stacked backlog of conflicting pull requests across the Waaseyaa Framework and Sheg turned into a clean landing sequence. Fourteen PRs merged, plus a 358-site database audit and a pile of latent defects caught on the adversarial second pass.

The interesting part is not the merge count. It is the bugs that survived their own original implementations: authorization holes, swallowed test failures, a subprocess deadlock. The tax you only pay when work gets reviewed hard instead of rubber-stamped. And nothing shipped: no tag, no release, no production change.

Hand the same work to one senior developer and it is roughly two months of effort. Full write-up:

https://jonesrussell.github.io/blog/ai-assisted-day-two-months/

#ai #buildinpublic
