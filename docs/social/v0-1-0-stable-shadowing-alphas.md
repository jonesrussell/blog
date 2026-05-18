# v0.1.0 stable tag was shadowing every alpha — fixed

Reference URL: https://github.com/waaseyaa/framework/issues/1440

## Bluesky

Discovered v0.1.0 stable tag in Waaseyaa shadowed every alpha. Composer prefers stable, so new sites got the oldest "production" release while real progress sat in 175+ alphas. Fixed by retiring the stable tag. #buildinpublic

https://github.com/waaseyaa/framework/issues/1440

## LinkedIn

A quietly destructive bug surfaced in the Waaseyaa framework this week. Worth documenting because the failure mode is generic.

Earlier in the project we cut a v0.1.0 tag without an `-alpha` suffix. Looked harmless at the time — semver lets you do that. Months later, all real development was happening in v0.1.x-alpha.N tags (currently somewhere past alpha.175), and v0.1.0 was a fossil nobody thought about.

Then a new contributor tried to spin up a fresh site and ran `composer require waaseyaa/framework`. Composer obediently resolved to v0.1.0.

Why: by default Composer prefers stable versions over pre-releases. Without explicit `"minimum-stability": "alpha"` and `"prefer-stable": false` in the consumer's composer.json, Composer scans the available tags, classifies each as stable or pre-release, and picks the newest stable. v0.1.0 had no suffix, so Composer classified it stable. Every later tag was an alpha, so they all classified as pre-release. The fossil won every resolution.

The new contributor's "fresh install" was running code from months ago and didn't know it. Their bug reports referenced behaviors that hadn't existed since alpha.30.

Fix: retire the v0.1.0 tag. Republish under a name that classifies as pre-release. Document the stability requirements that consumers need in their composer.json until v1 actually exists.

The general lesson: once you cut a stable-classified tag, you can't take it back without breaking semver, and every later pre-release will lose resolution by default. Treat your first stable tag as a one-way door. Until you mean it, ship pre-releases only.

https://github.com/waaseyaa/framework/issues/1440

## Facebook

A quietly destructive bug surfaced in the Waaseyaa framework this week.

Earlier we cut a v0.1.0 tag without an "-alpha" suffix, thinking it harmless. Months later, all real development was happening in v0.1.x-alpha.N tags. New contributors running `composer require waaseyaa/framework` were getting v0.1.0 — months out of date — without knowing it. Composer prefers stable-classified tags over pre-releases by default, and the fossil v0.1.0 won every resolution.

Fix: retire the stable tag, republish as a pre-release. The general lesson: your first stable tag is a one-way door. Until you mean it, ship pre-releases only.

https://github.com/waaseyaa/framework/issues/1440

#buildinpublic #waaseyaa
