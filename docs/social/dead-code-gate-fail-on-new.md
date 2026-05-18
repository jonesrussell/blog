# Phase 4: dead-code CI gate flipped to fail-on-new

Reference URL: https://github.com/waaseyaa/framework/pull/1504

## Bluesky

Phase 4 done: the dead-code gate is now fail-on-new in CI. After a multi-PR campaign that narrowed the baseline by hundreds of entries, the gate stops admitting new debt. The cleanup window closes; from here it's hold-the-line. #buildinpublic

https://github.com/waaseyaa/framework/pull/1504

## LinkedIn

Phase 4 of the Waaseyaa dead-code campaign landed today. The CI gate is now fail-on-new.

What that means in practice: any pull request that adds a new unreferenced symbol, dead import, or unreachable function fails before it can merge. Previously the gate was warn-only, which is the polite name for "noticed but ignored."

The phased path got us here:

Phase 1+2 collapsed the baseline. The audit-and-suppress files were rewritten so the existing tail of dead entries became the known starting point.

Phase 3 (buckets) chipped at that baseline through targeted PRs that closed -15, then -103 entries by adding @api PHPDoc overlays to entries that were actually public, and removing the ones that weren't.

Phase 4 (today) flipped the gate. With the baseline at zero remaining slack, "fail on new" became a sustainable rule instead of a tantrum about historical mess.

The reason this matters: dead-code numbers only ever go up unless something forces them down. A warn-only gate is a wishlist. A fail-on-new gate is a contract: from this PR forward, the number is bounded above by what's in main. The cleanup window closes; from here it's hold-the-line.

The cost of getting here was real. Multiple weeks, a multi-PR campaign, careful @api vs @internal decisions on every borderline interface. The cost of not getting here would be paying interest on dead code forever.

Recommended for any codebase old enough that "we should clean up dead code someday" has become a phrase used regularly. Pick a baseline. Narrow it. Flip the gate. Don't try to do it in one PR.

https://github.com/waaseyaa/framework/pull/1504

## Facebook

The Waaseyaa framework's CI now fails any pull request that adds new dead code. As of today.

This is the capstone of a multi-PR campaign that first collapsed the dead-code baseline (Phase 1+2), then chipped at it bucket by bucket (Phase 3, two PRs totaling -118 entries), then flipped the gate to fail-on-new (Phase 4, today). The previous gate was warn-only, which is the polite name for "noticed but ignored."

From here forward the dead-code count is bounded above by what's in main. The cleanup window closes; the hold-the-line phase begins.

https://github.com/waaseyaa/framework/pull/1504

#buildinpublic #waaseyaa
