---
categories:
    - php
date: 2026-10-26T00:00:00Z
devto_id: 4921938
draft: false
slug: integration-tests-independent-local-env
summary: Give integration tests complete, temporary configuration so they pass for the same reason on every machine.
tags:
    - php
    - testing
    - environment
    - sqlite
title: Make integration tests independent of your local .env
---

Ahnii!

An integration test can pass on your computer because your local `.env` quietly supplies a database path, application secret, or storage directory. The same test then fails in CI, or worse, touches a real local resource that was never meant to be part of the test.

This post shows how to make a PHP integration test own its complete environment, using a [Waaseyaa](https://github.com/waaseyaa/framework) media publishing test as the concrete example.

## Hidden configuration is a test dependency

The test boots the real CLI, initializes a database, writes media files, and exercises the HTTP publishing path. That means it depends on more than the values named in the test method.

Its runtime needs:

- an explicit application environment;
- debug mode disabled;
- a database path;
- valid application and JWT secrets;
- isolated upload and file-storage roots.

If even one value falls through to your shell or `.env`, the test is not self-contained. A developer with a configured application may get a pass while a clean runner gets a boot error.

## Save every variable the test owns

Before changing the process environment, save the original value of every variable the test will replace:

```php
/** @var array<string, string|false> */
private array $originalEnvironment = [];

foreach ([
    'APP_ENV',
    'APP_DEBUG',
    'WAASEYAA_DB',
    'WAASEYAA_APP_SECRET',
    'WAASEYAA_JWT_SECRET',
    'WAASEYAA_MEDIA_UPLOADS_DIR',
    'WAASEYAA_FILES_ROOT',
] as $name) {
    $this->originalEnvironment[$name] = getenv($name);
}
```

`getenv()` returns `false` when a variable was absent. Keep that distinction. An absent variable and a variable set to an empty string can take different configuration paths.

The list should be explicit. It documents the environment boundary of the test and makes new dependencies visible in review.

## Create unique temporary resources

A fixed test database or upload directory creates collisions between runs and leaves stale state available to the next test. Generate one suffix, then use it for every related temporary path:

```php
$suffix = bin2hex(random_bytes(8));

$this->databasePath = sys_get_temp_dir()
    . '/rhtcircle-media-' . $suffix . '.sqlite';

$this->uploadsDir = sys_get_temp_dir()
    . '/rhtcircle-media-' . $suffix;

mkdir($this->uploadsDir, 0700, true);
```

This gives the database and file storage a shared run identity without letting one run reuse another run's files. The restrictive directory mode also matches the fact that these are private test artifacts, not public fixtures.

## Supply valid test-only secrets

Do not make the test depend on development credentials. Generate values that satisfy the application's real configuration rules:

```php
putenv('APP_ENV=testing');
putenv('APP_DEBUG=false');
putenv('WAASEYAA_DB=' . $this->databasePath);
putenv('WAASEYAA_APP_SECRET=base64:' . base64_encode(random_bytes(32)));
putenv('WAASEYAA_JWT_SECRET=' . bin2hex(random_bytes(32)));
putenv('WAASEYAA_MEDIA_UPLOADS_DIR=' . $this->uploadsDir);
putenv('WAASEYAA_FILES_ROOT=' . $this->uploadsDir);
```

These secrets exist only for the test process. They are random, valid for the boot path being exercised, and unrelated to local or production values.

Avoid a short placeholder such as `test-secret` when the application expects a specific strength or format. A weak fixture can bypass the same validation that protects the real system, which means your integration test no longer represents a valid installation.

## Restore absence as absence

Teardown must restore both kinds of original state:

```php
foreach ($this->originalEnvironment as $name => $value) {
    putenv($value === false ? $name : $name . '=' . $value);
}
```

Calling `putenv($name)` removes a variable. Calling `putenv($name . '=')` leaves it present with an empty value. That difference is easy to miss and can leak configuration into later tests.

The test also removes its database and upload files. Environment restoration and filesystem cleanup belong in the same lifecycle because both are part of the temporary application state.

## Watch for process-global state

`putenv()` changes the environment for the current PHP process. This is practical for a test that launches application entrypoints, but it is still global mutable state.

Use these controls when your suite grows:

- run environment-mutating tests in separate processes or a serialized group;
- give every run unique database and storage paths;
- restore variables in teardown even after an assertion fails;
- keep the owned-variable list next to setup and teardown;
- never read secrets from the developer's real `.env` as test fixtures.

PHPUnit calls `tearDown()` after each completed test lifecycle, but setup code can fail too. If resource creation becomes more complex, wrap partial setup in guarded cleanup or move it into helpers that can undo their own work.

## Verify the boundary

A clean test should answer these questions:

| Check | Expected result |
|---|---|
| Local `.env` is missing | Test still boots |
| Developer secrets are different | Test behavior is unchanged |
| Two runs use temporary storage | Paths do not collide |
| A later test reads the environment | It sees the original values |
| The test fails halfway through | Temporary state is still cleaned up |

The point is not simply to make CI green. It is to make the test prove the same thing everywhere. Once the test owns its full configuration, a pass describes application behavior instead of the accidental state of one developer machine.

Baamaapii
