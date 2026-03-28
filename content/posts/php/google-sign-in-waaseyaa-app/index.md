---
categories:
    - php
date: 2026-03-28T00:00:00Z
devto: true
devto_id: 3420840
draft: true
slug: google-sign-in-waaseyaa-app
summary: How to add Google Sign-In to a PHP app with proper account linking, password-less rejection, and consent screen setup.
tags:
    - php
    - oauth
    - google
    - authentication
title: Adding Google Sign-In to a PHP application
---

Ahnii!

This post covers how [Claudriel](https://claudriel.ai) implements Google Sign-In using raw OAuth 2.0. No SDK, no Socialite. You get a controller that handles the redirect, callback, account creation, and integration upsert. The same pattern works in any PHP application.

## Two OAuth flows, two scope sets

Claudriel has two distinct Google flows:

1. **Sign-In** — creates or logs into an account using `openid`, `email`, and `profile` scopes
2. **Connect** — links Google services (Gmail, Calendar, Drive) to an existing account using broader scopes

The sign-in flow requests minimal permissions:

```php
private const SIGNIN_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];
```

The connect flow requests service-level access:

```php
private const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/drive.file',
];
```

Separating these means new users see a simple "Sign in with Google" prompt. Service permissions are requested later, when the user actually needs them. This follows the principle of incremental authorization.

## The sign-in redirect

The controller builds the OAuth URL and redirects the user to Google:

```php
public function signin(): RedirectResponse
{
    $state = bin2hex(random_bytes(32));
    $_SESSION['google_oauth_state'] = $state;
    $_SESSION['google_oauth_flow'] = 'signin';

    $authUrl = self::AUTH_ENDPOINT . '?' . http_build_query([
        'client_id' => $this->clientId,
        'redirect_uri' => $this->signinRedirectUri,
        'response_type' => 'code',
        'scope' => implode(' ', self::SIGNIN_SCOPES),
        'access_type' => 'offline',
        'prompt' => 'consent',
        'state' => $state,
    ]);

    return new RedirectResponse($authUrl, 302);
}
```

The `state` parameter is a random token stored in the session. The callback verifies it to prevent CSRF attacks. The `google_oauth_flow` session key distinguishes sign-in from connect when both use the same controller.

## Handling the callback

When Google redirects back, the controller validates the state, exchanges the authorization code for tokens, and fetches the user's profile:

```php
public function signinCallback(array $query = []): RedirectResponse
{
    $expectedState = $_SESSION['google_oauth_state'] ?? null;
    $expectedFlow = $_SESSION['google_oauth_flow'] ?? null;
    unset($_SESSION['google_oauth_state'], $_SESSION['google_oauth_flow']);

    if ($expectedState === null
        || $expectedFlow !== 'signin'
        || !hash_equals($expectedState, $query['state'] ?? '')) {
        $_SESSION['flash_error'] = 'Invalid OAuth state. Please try again.';
        return new RedirectResponse('/login', 302);
    }

    $tokenData = $this->exchangeCodeForTokens($query['code'] ?? '');
    $userInfo = $this->fetchUserInfo($tokenData['access_token']);
    $email = $userInfo['email'] ?? null;
    $emailVerified = $userInfo['verified_email'] ?? false;

    if ($email === null || !$emailVerified) {
        $_SESSION['flash_error'] = 'Google account email is not verified.';
        return new RedirectResponse('/login', 302);
    }

    $signupService = new PublicAccountSignupService($this->entityTypeManager);
    $accountEntity = $signupService->createFromGoogle($email, $name);

    $_SESSION['claudriel_account_uuid'] = $accountEntity->get('uuid');
    session_regenerate_id(true);

    return new RedirectResponse('/app', 302);
}
```

Three things to note. First, `hash_equals` prevents timing attacks on the state comparison. Second, the email must be verified by Google before account creation. Third, `session_regenerate_id(true)` prevents session fixation after login.

## Creating password-less accounts

The `createFromGoogle()` method creates an account with a `null` password hash:

```php
$account = $signupService->createFromGoogle($email, $name);
// This account has password_hash => null
```

This marks the account as Google-only. The account exists in the same table as email/password accounts, but it cannot be used with the standard login form.

## Rejecting password-less accounts on email login

When someone tries to log in with email and password to a Google-only account, the login controller rejects it with a helpful message:

```php
if ($passwordHash === '') {
    return $this->render('public/login.twig', [
        'email' => $email,
        'error' => 'This account uses Google sign-in. '
            . 'Use the "Sign in with Google" button below.',
        'show_google_signin' => true,
    ], 401);
}
```

The `show_google_signin` flag tells the template to render the Google button prominently, guiding the user to the correct flow. This is better than a generic "invalid credentials" error, which would leave the user confused about why their password does not work.

## Upserting the integration record

After sign-in or connect, the controller stores the OAuth tokens in an `integration` entity:

```php
private function upsertIntegration(
    AuthenticatedAccount $account,
    array $tokenData,
    ?string $providerEmail
): void {
    $existingIds = $storage->getQuery()
        ->condition('account_id', $accountId)
        ->condition('provider', 'google')
        ->range(0, 1)
        ->execute();

    if ($existingIds !== []) {
        // Update existing integration with new tokens
        $integration->set('access_token', $tokenData['access_token']);
        $integration->set('token_expires_at', $expiresAt);
        $integration->set('scopes', $scopes);

        if (isset($tokenData['refresh_token'])) {
            $integration->set('refresh_token', $tokenData['refresh_token']);
        }
    } else {
        // Create new integration record
        $integration = new Integration([...]);
    }

    $storage->save($integration);
}
```

The upsert checks for an existing Google integration for this account. If one exists, it updates the tokens and scopes. If not, it creates a new record. Google only sends the `refresh_token` on the first authorization (or when `prompt=consent` forces re-consent), so the code only overwrites it when present.

## Google Cloud Console setup

Before any of this works, you need to configure the OAuth consent screen in [Google Cloud Console](https://console.cloud.google.com/):

1. Create an OAuth 2.0 Client ID (Web application type)
2. Add your redirect URIs for both sign-in and connect flows
3. Configure the consent screen with your app name, logo, and privacy policy URL
4. Request verification if you use sensitive scopes (Gmail, Calendar, Drive)

The privacy policy URL must be live and accessible before Google approves your app for production use. Handle this early.

Baamaapii
