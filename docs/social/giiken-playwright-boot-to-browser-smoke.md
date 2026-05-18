# Giiken: Playwright boot-to-browser smoke

Reference URL: https://github.com/waaseyaa/giiken/commit/bf76d24

## Bluesky

Added a Playwright boot-to-browser smoke to Giiken: GET /, GET /test-community, both must return 200 in a real browser. Cheap insurance against the "tests pass, deploy succeeded, site is 500-ing" regression. #buildinpublic

https://github.com/waaseyaa/giiken/commit/bf76d24

## LinkedIn

Added a tiny but high-value test to Giiken this week: a Playwright boot-to-browser smoke that hits GET / and GET /test-community and verifies both come back 200 in a real Chromium instance.

That's all it does. Two URLs, two assertions, one browser. Total runtime measured in seconds.

The value isn't in what it tests. The value is in what it catches that nothing else does. Unit tests pass on a server-side method that constructs an HTML string. Integration tests pass because the test client never actually parses CSS or runs Vue mount. The deploy succeeds because CI was green. And then somebody opens the site in a browser and gets a blank page because a Vite manifest path resolved wrong, or the dev-server hot-reload script crashed Vue at mount, or a service worker is caching a 500 response from a prior deploy.

A boot-to-browser smoke catches that. It runs after the deploy, in a real browser, against the deployed URLs, and asks the dumbest possible question: did the page load? If yes, ship. If no, roll back before anyone notices.

The pattern is general. If your app renders client-side, run one Playwright smoke per critical surface, in CI after deploy, before you allow the traffic switch. The runtime cost is negligible. The error class it catches is the one your existing tests can't see because they're not real browsers.

Recommended for any project that has ever had a "tests pass but the site is broken" moment.

https://github.com/waaseyaa/giiken/commit/bf76d24

## Facebook

Added a Playwright boot-to-browser smoke test to the Giiken project: a real Chromium loads the home page and one test page, expects 200, fails the deploy if not.

That's it. Two URLs, two assertions. Runtime measured in seconds. The value is catching the class of regression that says "tests pass, deploy succeeded, site is 500-ing." Unit tests can't see it. Integration tests can't see it. A real browser can.

If your app renders client-side, run one of these per critical surface in CI after deploy. Cheap insurance.

https://github.com/waaseyaa/giiken/commit/bf76d24

#buildinpublic #waaseyaa
