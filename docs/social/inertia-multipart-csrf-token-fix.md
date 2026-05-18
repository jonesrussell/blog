# Inertia multipart uploads were silently dropping CSRF

Reference URL: https://github.com/waaseyaa/giiken/commit/123c488

## Bluesky

Bug: Inertia multipart uploads were silently dropping the CSRF token. Server saw no token, rejected the request, the UI got a generic 419. The sharp edge anyone with Inertia + file uploads will hit. Fixed in Giiken. #buildinpublic

https://github.com/waaseyaa/giiken/commit/123c488

## LinkedIn

A small but instructive bug in the Giiken codebase: Inertia visits for multipart uploads were silently dropping the CSRF token. The server saw no token, rejected the request, and the UI surfaced a generic 419 with no useful trace.

The mechanism: Inertia by default serializes form data as JSON and attaches the CSRF token from the meta tag. When you switch to multipart (because you have a file), Inertia rebuilds the request as FormData. The CSRF token doesn't make the trip unless you explicitly include it as a form field or arrange for an interceptor to attach it as a header.

The fix is one of those things you only think about after the first 419. Either set the token explicitly on every multipart form, or write a global axios interceptor that always attaches X-XSRF-TOKEN from the cookie. Both work. The latter is less typing once.

The reason this matters more than the diff suggests: the failure mode is silent and confusing. The UI doesn't say "missing CSRF." The server doesn't log the missing header at info level. The developer sees a 419 page and starts auditing routes, middleware, anything but the request shape. The bug eats hours per developer the first time they hit it.

If you ship Inertia and file uploads, audit the multipart path now. Don't wait to discover this with a user filing a bug report. The cookie-to-header pattern is the move.

https://github.com/waaseyaa/giiken/commit/123c488

## Facebook

Inertia multipart uploads were silently dropping the CSRF token in the Giiken project. The server saw no token, rejected the request, the UI surfaced a generic 419 with no useful trace.

Why: Inertia attaches CSRF from a meta tag by default, but switches to FormData for multipart requests, and the token doesn't make the trip unless you set it explicitly or use a global header interceptor.

The fix is small. The lesson is bigger: if you ship Inertia and file uploads, audit the multipart path before a user finds it for you.

https://github.com/waaseyaa/giiken/commit/123c488

#buildinpublic #waaseyaa
