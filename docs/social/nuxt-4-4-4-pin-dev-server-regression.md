# Pinned Nuxt 4.4.4 to dodge 4.4.5 dev-server regression

Reference URL: https://github.com/waaseyaa/framework/pull/1420

## Bluesky

Pinned Nuxt to 4.4.4. 4.4.5 broke hot-reload after the first save and npm won't roll back. Cap the blast radius on packages in your inner loop. #buildinpublic

https://github.com/waaseyaa/framework/pull/1420

## LinkedIn

Pinned Nuxt to 4.4.4 in the Waaseyaa admin SPA today. 4.4.5 shipped a dev-server regression that breaks hot-module reload after the first save, and the npm registry doesn't roll back.

The chain of events is depressingly common. Project starts with `"nuxt": "^4.0.0"`. Months pass without incident, caret ranges work, everyone's happy. A new minor lands. The CI passes because CI doesn't exercise the dev server. A developer opens the project for the first time that week, makes one edit, and the dev server stops responding to file changes. They restart it. Same thing. They blame their editor, then their node version, then their machine, then eventually `git log` reveals the lockfile update from yesterday.

Fix: pin to 4.4.4 explicitly in package.json. Document in the commit why the pin exists, so a future developer doesn't blindly remove it. Subscribe to the upstream issue for when 4.4.6 ships with the fix, then unpin.

The general lesson: caret ranges are a productivity tool that occasionally bricks you. The win-loss math usually comes out positive because most minors really are non-breaking. But the loss case is dev-server breakage, which costs hours per developer until somebody figures it out. That's worth a defensive pin on the packages that drive your inner loop.

Pin the inner loop. Cap the blast radius. Document the unpin condition.

https://github.com/waaseyaa/framework/pull/1420

## Facebook

Pinned Nuxt to 4.4.4 in the Waaseyaa admin SPA. The 4.4.5 release broke hot-module reload after the first save, npm doesn't roll back, and CI didn't catch it because CI doesn't exercise the dev server.

Caret ranges are a productivity tool that occasionally bricks you. The fix is to pin packages that drive your inner loop, document the unpin condition, and move on.

https://github.com/waaseyaa/framework/pull/1420

#buildinpublic #waaseyaa
