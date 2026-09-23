## Bluesky

Waaseyaa's OAuth providers used to over-ask by default: Google always wanted a refresh token and forced consent, GitHub always fetched your email even if nobody read it. Now both take optional identity-only config. https://jonesrussell.github.io/blog/identity-only-oauth-requests/ #php #oauth

## LinkedIn

New post: configuring identity-only OAuth requests in Waaseyaa.

The oauth-provider package's Google and GitHub providers only knew how to over-ask. Google's authorization URL hardcoded offline access and a forced consent prompt on every login, whether or not the app ever stored a refresh token. GitHub's profile lookup always made a second API call for the user's email, even when a consumer only needed the stable numeric id.

Both providers now take optional trailing constructor parameters that default to the old behavior. Google gets a typed accessType enum and a forceConsent flag, so an identity-only login can request online access and skip the re-consent screen. GitHub gets a fetchEmail flag that skips the /user/emails call outright rather than making it and discarding the result.

The fix rejected two easier paths: a generic options array (unvalidated, hard to review) and a single identity-only toggle (which would have silently coupled scopes and refresh-token eligibility). Along the way, the optional profile fields also got hardened, since a missing or malformed email or name is exactly what identity-only responses expose in practice.

https://jonesrussell.github.io/blog/identity-only-oauth-requests/

#php #oauth #security #softwareengineering #opensource

## Facebook

Waaseyaa's Google and GitHub OAuth providers used to always ask for more than a login flow needs: Google forced offline access and a consent prompt every time, GitHub always fetched your email even if nobody read it. Wrote up the additive config that lets a consumer ask for identity only, and why that beat a generic options array or a single all-or-nothing toggle.

https://jonesrussell.github.io/blog/identity-only-oauth-requests/

#php #oauth
