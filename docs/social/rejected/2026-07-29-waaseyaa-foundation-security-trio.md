# Three security boundaries that were each one layer short

Queue-Issue: #1054
Reference URL: https://github.com/waaseyaa/framework/pull/1823

## Bluesky

Chunked requests bypass a body-size cap when the limiter only checks Content-Length. Waaseyaa foundation just closed three gaps like that: the chunked bypass, a Vary-header clobber exposing compressed responses across users, and an unauthenticated admin broadcast channel. https://github.com/waaseyaa/framework/pull/1823 #buildinpublic

## LinkedIn

Three security bugs patched in the Waaseyaa framework foundation. Each one came from trusting a boundary one layer too early.

The first was the body-size limiter. It checked the client-supplied Content-Length header. That works when clients tell the truth. Transfer-Encoding: chunked means they don't have to. A chunked request with no Content-Length bypassed the guard entirely and kept reading until memory ran out. The fix: two layers. A fast-path rejects before reading when declared Content-Length exceeds the cap. A backstop measures actual bytes read after reading and returns 413 if the real body overshoots the limit, regardless of what the headers said.

The second was the Vary header in CompressionMiddleware. The middleware called headers->set('Vary', 'Accept-Encoding'), which overwrites any Vary value already set by a controller or upstream middleware. A shared or proxy cache keyed on the truncated Vary field could serve one user's authenticated compressed response to a different user. The fix: append-and-dedupe. If Accept-Encoding is already present, skip. If the existing Vary is a wildcard, leave it. Otherwise append, preserving the original tokens.

The third was the admin broadcast channel. GET /api/broadcast?channels=admin carried no access check. Any anonymous client could subscribe and receive a real-time stream of the entity type and ID of every create, update, and delete across the site. The fix: two layers. The route now requires authentication. The BroadcastRouter ACL strips privileged channels for any account that is not an authenticated admin, and an unauthorized request can never be re-defaulted onto a privileged channel.

None of these required exotic techniques. All three were inputs the code accepted without measuring what they actually delivered.

https://github.com/waaseyaa/framework/pull/1823

#php #websecurity #buildinpublic #frameworkdev #waaseyaa

## Facebook

Three security bugs landed in the Waaseyaa framework foundation patch queue this week. A chunked HTTP request with no Content-Length header could bypass the body-size limiter entirely, because the limiter only checked what the client declared, not what it actually sent. CompressionMiddleware was clobbering the Vary header on every response, which opened the door for proxy caches to serve one user's authenticated compressed response to a different user. And the admin broadcast channel at /api/broadcast required no authentication, so any anonymous client could subscribe and stream entity lifecycle events across the whole site.

Each fix is in the foundation package and closes the gap at two layers: the route and the middleware, or the header check and the actual byte count.

https://github.com/waaseyaa/framework/pull/1823 #buildinpublic
