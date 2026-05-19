# Waaseyaa shipped a working OIDC server

Reference URL: https://github.com/waaseyaa/framework/issues/1292

## Bluesky

Waaseyaa ships a working OIDC server now. Discovery, JWKS, /authorize with PKCE, /token with RS256 ID tokens. First-party identity, not a bolt-on. #buildinpublic

https://github.com/waaseyaa/framework/issues/1292

## LinkedIn

The Waaseyaa framework now ships a working OpenID Connect server. Not a wrapper around someone else's library, an actual implementation in a first-party package.

What landed:

The waaseyaa/oidc package, scaffolded per ADR-006.

The discovery endpoint at /.well-known/openid-configuration, with the controller wired and integration-tested.

The JWKS endpoint at /.well-known/jwks.json that publishes the public keys clients need to verify tokens.

The OidcClient entity type and config seeder, so clients can be registered as data.

The authorization code repository for the short-lived codes that bridge /authorize and /token.

The /authorize endpoint, implementing the authorization code flow with PKCE S256 mandatory (not optional, like the spec lets you treat it).

The /token endpoint, returning RS256-signed ID tokens.

That's eight PRs over a week, all under issue #1292, all in main.

Why this matters: most PHP frameworks treat identity as an add-on. You install a third-party OIDC library, you configure five env vars, you trust that the maintainer keeps up with the spec. Waaseyaa's call was that identity is part of the platform substrate. A framework that wants to power multi-tenant publications, communities, and tenanted apps needs to own the identity layer the same way it owns the data layer. The integration cost shows up in every adjacent feature otherwise.

What this unlocks: third-party apps can integrate via standard OIDC. Multi-tenant identity becomes a first-class feature rather than a stack of glued-together libraries. The bar for adopting the framework in regulated contexts drops considerably.

https://github.com/waaseyaa/framework/issues/1292

## Facebook

The Waaseyaa framework now ships a working OpenID Connect server. Discovery, JWKS, authorize-with-PKCE, token with RS256 ID tokens, client registration as a data type, all in a first-party waaseyaa/oidc package. Eight PRs across one week under issue #1292.

Most PHP frameworks treat identity as a third-party add-on. Waaseyaa's call was that identity is platform substrate, same as the data layer. A framework powering tenanted apps needs to own the identity flow, not glue it on.

https://github.com/waaseyaa/framework/issues/1292

#buildinpublic #waaseyaa
