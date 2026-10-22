---
categories:
    - php
date: 2026-10-22T00:00:00Z
devto: true
draft: false
slug: configured-authentication-service
summary: Keep login, logout, eligibility, credential upgrades, and HTTP permission checks behind the authentication services configured by your application.
tags:
    - php
    - authentication
    - security
    - waaseyaa
title: Do not construct authentication policy inside a login helper
---

Ahnii!

A login helper can verify the right password and still bypass part of your authentication policy.

This happens when application code constructs an authentication manager directly. The new object may have access to credentials, but it does not automatically inherit the eligibility checks, password-upgrade service, session rules, or principal factory configured in your container.

A recent [Anokii authentication repair](https://github.com/waaseyaa/anokii/commit/ca02a2fac9ceb75f320dbbb651cfc804543d990c) shows how to put those decisions back behind framework-owned services. The same boundary applies to any PHP application with configurable authentication policy.

## Authentication managers carry policy

It is easy to mistake an authentication manager for a utility class. Give it a user reader, call `authenticate()`, and you have a password check.

But password verification is only one part of login. The application's configured manager may also enforce:

- active account status;
- verified email requirements;
- credential migration or rehashing;
- session creation and rotation;
- session-generation revocation;
- audited access to sealed credential fields.

Anokii previously created a new manager inside its login helper:

```php
$auth = new AuthManager($internalFields);

if (!$auth->authenticate($user, $password)) {
    return null;
}

$auth->login($user);
```

That local object had the credential reader, but it could not preserve services attached to the container-owned manager. The repair changed the helper to accept the configured `AuthManager` instead:

```php
if (!$auth->authenticate($user, $password)) {
    return null;
}

try {
    $auth->login($user);
} catch (AuthenticationEligibilityException) {
    return null;
}
```

The difference is architectural, not cosmetic. The helper now uses the same authentication policy as the rest of the application.

## Resolve once and inject it

The application's service provider resolves the manager from the container and fails if the binding is missing:

```php
$auth = $this->resolve(AuthManager::class);

if (!$auth instanceof AuthManager) {
    throw new LogicException(
        'The workspace requires the framework AuthManager binding.'
    );
}
```

The provider then passes that instance into the login controller and the workspace controller. Login, logout, and current-password verification all use the same configured service.

This gives you one policy boundary:

- **Login** authenticates credentials and applies eligibility rules.
- **Logout** tears down the session through the same manager.
- **Password change** verifies the current password through the same credential service.

If the manager is unavailable, the application fails during assembly. It does not silently fall back to a weaker path.

## Separate credential reads from permission decisions

Authentication and authorization often need information from the same account, but they should not use the same authority by accident.

Anokii has an audited internal-field reader for sensitive account maintenance. That reader can support credential verification and controlled access to sealed fields. It is not the right abstraction for an HTTP controller deciding whether the current account may open a dashboard.

The repaired dashboard gate asks the framework's principal factory for an immutable account principal:

```php
if (!$this->principals
    ->fromAccount($user)
    ->hasPermission($permission)) {
    return $this->forbiddenResponse();
}
```

That keeps two concerns distinct:

| Concern | Service |
| --- | --- |
| Verify credentials and read protected authentication fields | Configured authentication manager and audited reader |
| Decide an HTTP account's permissions | Account principal factory |
| Perform maintenance-only account inspection | Explicit maintenance authority |

The old path derived dashboard permissions from maintenance authorization. It could answer the question, but with an authority intended for a different context. Using the HTTP principal makes the caller and policy scope explicit.

## Fail loudly when the authorization boundary is missing

A missing principal factory is a wiring error, not a normal access denial.

Returning `403 Forbidden` would hide the difference between these two states:

1. the account lacks the requested permission;
2. the application cannot evaluate permissions because a required service was never mounted.

The dashboard gate throws a `LogicException` for the second state. Once it has a principal, a failed permission check produces the ordinary forbidden response.

This distinction makes production failures diagnosable. A user should not be told they lack access when the application never performed the access decision.

## Test the complete login contract

The repair added an integration test that boots real framework authentication components around a bounded in-memory account repository. It covers much more than a successful password check.

The acceptance matrix includes:

- a correct password opens the expected dashboard route;
- the session records both the account ID and its generation;
- the HTTP principal grants the required dashboard permission;
- a wrong password is rejected;
- an inactive account is rejected;
- an account without the dashboard permission is rejected;
- an unverified account is rejected when verification is configured;
- repeated failures trigger the database-backed throttle;
- anonymous requests redirect to login;
- authenticated accounts without permission receive a forbidden response;
- an old session generation resumes as anonymous;
- successful login rotates the native session ID;
- logout destroys the session.

One test also records every protected account read and asserts that the HTTP flow never uses the maintenance-only capability. That proves the boundary, not just the final status code.

## Review the construction site

When you review authentication code, search for direct construction of policy-bearing services:

```text
new AuthManager(...)
new AuthorizationService(...)
new SessionManager(...)
```

Direct construction is not always wrong. It is suspicious when the application already configures that service in its container.

Check what the locally constructed object loses. Then write an integration test that covers configured eligibility, permission resolution, session rotation, revocation, throttling, and logout through the real HTTP path.

Authentication policy belongs at the application boundary. Your login helper should use that boundary, not quietly create a smaller one of its own.

Baamaapii
