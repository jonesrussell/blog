# GraphQL mutations over GET are a CSRF vector

Reference URL: https://github.com/waaseyaa/framework/pull/1721

## Bluesky

If your /graphql accepts GET and runs the query param, GET /graphql?query=mutation{...} runs a state change with the victim's session cookie. A classic CSRF vector. Fix: reject mutations over GET. https://github.com/waaseyaa/framework/pull/1721 #buildinpublic

## LinkedIn

A CSRF bug that hides in a lot of GraphQL setups.

Our /graphql endpoint was registered for both GET and POST, marked allow-all, and CSRF-exempt. The endpoint executed the query param on GET requests, including mutations.

That means GET /graphql?query=mutation{...} ran a state-changing operation. And a GET request is a simple cross-site request: an attacker can trigger it with an image tag or a link, and the browser attaches the victim's session cookie automatically. No token, no preflight, no consent. That is textbook CSRF.

GraphQL hides this because one endpoint serves both reads and writes, so it is easy to allow GET for query convenience and forget that the same handler will happily run a mutation.

The fix: reject mutations when they arrive over GET. GET stays available for read queries, writes must come over POST where CSRF protections and non-simple request rules apply.

The general rule has not changed since REST: GET must be safe and side-effect free. GraphQL does not exempt you from it. If a request can change state, it does not belong on GET.

https://github.com/waaseyaa/framework/pull/1721

#buildinpublic #security #graphql #php

## Facebook

A CSRF bug worth checking in your own GraphQL setup. Our /graphql endpoint accepted both GET and POST and ran the query param on GET, including mutations. That means a URL like /graphql?query=mutation{...} ran a state-changing operation, and because a GET is a simple cross-site request, an attacker could trigger it from an image tag while the browser attached the victim's session cookie. Textbook CSRF.

The fix was to reject mutations that arrive over GET. Reads can stay on GET, writes must go over POST. The old REST rule still holds: GET must be safe and side-effect free, and GraphQL does not exempt you from it. https://github.com/waaseyaa/framework/pull/1721

#buildinpublic
