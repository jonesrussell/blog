---
categories:
    - php
    - waaseyaa
date: 2026-09-23
devto: true
draft: false
slug: identity-only-oauth-requests
summary: How Waaseyaa's oauth-provider package added optional, additive configuration so a consumer that only needs a stable Google or GitHub identity can skip the email lookup, the forced consent prompt, and the offline refresh-token grant.
tags:
    - php
    - waaseyaa
    - oauth
    - security
title: Configuring identity-only OAuth requests in Waaseyaa
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `oauth-provider` package wraps Google and GitHub OAuth 2.0 behind one `OAuthProviderInterface`. Until recently, both bundled providers only knew how to over-ask: Google always requested offline access with a forced consent prompt, and GitHub always made a second API call for the user's email, even when a consumer just needed a stable, verified identity to log someone in. The package now takes optional constructor arguments so an identity-only consumer can say exactly that, without touching the interface or forking the provider. What follows is the over-asking, the additive fix, and the two unsafe casts that got hardened along the way.

## What Over-Asking Looked Like

Before this change:

- **`GoogleOAuthProvider::getAuthorizationUrl()`** hardcoded `access_type=offline` and `prompt=consent` into every authorization URL. Every login requested refresh-token eligibility and forced a re-consent screen, whether or not the consumer ever stored a refresh token.
- **`GitHubOAuthProvider::getUserProfile()`** called `GET /user` and then unconditionally called `GET /user/emails`, even for a consumer that only reads the numeric `id` GitHub already returns from `GET /user`.
- **Optional profile fields were unsafe.** Google's `email`/`name` were read with a bare `(string) $data['email']` cast, and GitHub's `name` fallback cast `$userData['login']` the same way. A response missing either key triggered an "Undefined array key" warning; a malformed non-string value (an array, say) triggered an "Array to string conversion" warning and silently became the string `'Array'`. Waaseyaa's `phpunit.xml.dist` sets `failOnWarning="true"`, so either defect turned into a hard test failure, not a quietly-ignored notice.

## Additive Configuration, Not a Parameter Bag

The fix rejected two easier options: a generic `array $options` bag on either provider (arbitrary, unvalidated URL rewriting) and a single `IdentityOnlyMode` toggle (which would have silently coupled scopes and refresh-token eligibility — concerns the interface already keeps separate). Instead, both providers gained optional trailing constructor parameters that default to the old behavior:

| Provider | Default (unchanged) | Identity-only |
|---|---|---|
| Google | `accessType: Offline`, `forceConsent: true` → `access_type=offline&prompt=consent` | `accessType: Online`, `forceConsent: false` → `access_type=online`, `prompt` omitted entirely |
| GitHub | `fetchEmail: true` → `GET /user` then `GET /user/emails` | `fetchEmail: false` → only `GET /user`; profile has `email: ''`, `emailVerified: false` |

A new `@api` enum backs the Google option instead of a raw string:

```php
enum GoogleAccessType: string
{
    case Offline = 'offline';
    case Online = 'online';
}
```

`GoogleOAuthProvider` builds the authorization URL from it, and only adds `prompt` when consent is forced:

```php
$params = [
    'client_id'     => $this->clientId,
    'redirect_uri'  => $this->redirectUri,
    'response_type' => 'code',
    'scope'         => implode(' ', $scopes),
    'state'         => $state,
    'access_type'   => $this->accessType->value,
];

if ($this->forceConsent) {
    $params['prompt'] = 'consent';
}

return self::AUTH_URL . '?' . http_build_query($params);
```

Per [Google's docs](https://developers.google.com/identity/protocols/oauth2/web-server), online is already the default when `access_type` is absent — so omitting `prompt` lets Google decide whether re-consent is needed instead of the framework forcing it. `forceConsent` is independent of `accessType`: turning off the prompt doesn't silently flip an offline consumer to online access.

`GitHubOAuthProvider` skips the secondary lookup entirely rather than making the call and discarding the result:

```php
$email = '';
$emailVerified = false;
if ($this->fetchEmail) {
    $emailsResponse = $this->httpClient->get(self::EMAILS_URL, $headers);
    if ($emailsResponse->isSuccess()) {
        foreach ($emailsResponse->json() as $entry) {
            // ...find the primary, verified email
        }
    }
}
```

The existing fail-loud checks are untouched on both providers: a non-2xx response, a missing or empty `id`, both still block. An identity-only configuration still refuses a failed or unidentifiable response. It just stops paying for a lookup it would discard.

## Using It

```php
use Waaseyaa\OAuthProvider\Provider\GoogleAccessType;
use Waaseyaa\OAuthProvider\Provider\GoogleOAuthProvider;
use Waaseyaa\OAuthProvider\Provider\GitHubOAuthProvider;

// Google: online access, no forced re-consent prompt.
$google = new GoogleOAuthProvider(
    clientId: $clientId,
    clientSecret: $clientSecret,
    redirectUri: $redirectUri,
    httpClient: $httpClient,
    accessType: GoogleAccessType::Online,
    forceConsent: false,
);

// GitHub: skip the secondary /user/emails lookup.
$github = new GitHubOAuthProvider(
    clientId: $clientId,
    clientSecret: $clientSecret,
    redirectUri: $redirectUri,
    httpClient: $httpClient,
    fetchEmail: false,
);
```

The existing four-argument constructor call on either class still compiles. It still produces byte-identical behavior — offline access with a forced prompt for Google, an email lookup for GitHub. An offline consumer that stores a refresh token, or one that needs a verified GitHub email, just keeps using the defaults.

## Hardening the Optional Fields

The unsafe casts got fixed alongside the new parameters, since identity-only responses are exactly where a missing `email` or `name` shows up in practice. Google's profile parsing now guards both fields:

```php
$email = isset($data['email']) && is_string($data['email']) ? $data['email'] : '';
$name = isset($data['name']) && is_string($data['name']) ? $data['name'] : '';
```

GitHub's `name` fallback got the same treatment — falling back to `''` instead of casting a missing or non-string `login`. The required identity check is unchanged on both providers: a non-2xx response or an absent `id` still throws before any optional-field logic runs. Only the optional path stopped assuming the upstream payload is well-formed.

## Why This Matters Beyond Waaseyaa

- **Prefer optional, default-preserving parameters over a config bag.** A typed enum plus a couple of booleans is auditable at a glance; a generic `array $options` invites arbitrary, unvalidated behavior that's hard to review.
- **Don't make a call you'll discard the result of.** If a consumer configures identity-only, skip the secondary request outright rather than fetching and ignoring it — it's fewer round trips and one less thing that can rate-limit you.
- **Optional response fields need `isset()` and a type check, not a bare cast.** Any code path that only exercises the full/happy response will pass tests right up until a real provider omits a field you assumed was always present.

Baamaapii
