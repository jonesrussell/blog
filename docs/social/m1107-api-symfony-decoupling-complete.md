# Mission #1107: api / symfony decoupling complete

Reference URL: https://github.com/waaseyaa/framework/commit/faf85b2

## Bluesky

Mission #1107 done in Waaseyaa: api package decoupled from Symfony. Symfony/console removed, native CLI kernel speced, byte-parity 71/71 in verification. The framework no longer depends on the layer most people assume it does. #buildinpublic

https://github.com/waaseyaa/framework/commit/faf85b2

## LinkedIn

Mission #1107 closed in the Waaseyaa framework: full decoupling of the api package from Symfony.

This is a multi-week effort that touched twenty-plus work packages. The short version of what came out the other side: Waaseyaa no longer depends on symfony/console. The CLI runs on a native kernel speced inside the framework. The HTTP layer reaches Symfony's request/response shapes only where it's the explicit interop seam, not as ambient infrastructure. The boundary is enforced by a ci linter (bin/check-symfony-imports) that fails any PR that pulls Symfony into the wrong layer.

Final verification: 71 of 71 byte-parity tests pass, meaning the framework's behavior on the test suite is identical to what it was before the decoupling started. The point of the mission was to break dependencies, not behaviors.

The reason any of this is worth talking about: most PHP frameworks treat Symfony as a kind of substrate that you eventually rely on by default. Service container, console, http-foundation, validator, the works. Once you're in, you're in, and your framework's behavior is bounded above by what Symfony will let you do.

Waaseyaa's bet was that the substrate should be the framework's own primitives, with Symfony as one of several adapters when interop is needed. That bet only pays off if you actually walk back the Symfony imports that crept in during early development. Mission #1107 is the walking back.

What this unlocks: the framework can adopt or replace its own kernel, container, and request lifecycle without negotiating with someone else's roadmap. It's an unfashionable amount of work for an unfashionable amount of long-term leverage.

https://github.com/waaseyaa/framework/commit/faf85b2

## Facebook

Mission #1107 just closed in the Waaseyaa framework: the api package is fully decoupled from Symfony. symfony/console removed, native CLI kernel in its place, HTTP layer bounded to explicit interop seams. 71 of 71 byte-parity tests still pass.

Most PHP frameworks treat Symfony as substrate by default. Waaseyaa's bet is that the substrate should be its own primitives, with Symfony as one adapter among several. Mission #1107 walks back the Symfony imports that crept in during early development. Unfashionable work, long-term leverage.

https://github.com/waaseyaa/framework/commit/faf85b2

#buildinpublic #waaseyaa
