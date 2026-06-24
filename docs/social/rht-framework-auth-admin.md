# Swapping basic_auth for real framework auth on admin

Reference URL: https://github.com/jonesrussell/rhtcircle/commit/2d3eb8d494ae

## Bluesky

Retired a shared htpasswd: rhtcircle.ca admin now uses real framework auth, with proper sessions and roles from the Waaseyaa stack instead of one basic_auth password living in the web server config. https://github.com/jonesrussell/rhtcircle/commit/2d3eb8d494ae #buildinpublic

## LinkedIn

Basic auth is a fine doorstop and a bad door. We just replaced ours.

The rhtcircle.ca admin dashboards were gated with Caddy basic_auth, a single shared password sitting in the web server config. It kept casual visitors out, and that was about all it did. One credential for everyone, no identity, no roles, no audit, and rotating it means editing server config and telling everyone the new secret.

Now the admin is gated by the Waaseyaa framework's own auth: real sessions, real accounts, real roles. The web server goes back to serving, and authorization lives in the application where it can actually reason about who you are and what you are allowed to do.

The general point: basic_auth in the proxy is a placeholder, not an access-control strategy. The moment more than one person needs in, or you need to know who did what, it has to move into the app. On a framework that already ships auth, that move is a small change instead of a project.

https://github.com/jonesrussell/rhtcircle/commit/2d3eb8d494ae

#buildinpublic #security #php #waaseyaa

## Facebook

The admin area on rhtcircle.ca used to be gated by Caddy basic_auth, a single shared password in the web server config. It kept casual visitors out and did little else: one credential for everyone, no identity, no roles, and rotating it meant editing server config and telling everyone the new secret.

Now it uses the Waaseyaa framework's own auth, with real sessions, accounts, and roles, so authorization lives in the application where it can reason about who you are and what you can do. Basic auth in the proxy is a placeholder, not an access-control strategy. The moment more than one person needs in, it has to move into the app. https://github.com/jonesrussell/rhtcircle/commit/2d3eb8d494ae

#buildinpublic
