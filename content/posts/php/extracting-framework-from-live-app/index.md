---
categories:
    - php
date: 2026-03-28T00:00:00Z
devto: true
devto_id: 3420839
draft: true
slug: extracting-framework-from-live-app
summary: How to extract reusable framework packages from a running application without breaking production, using real examples from the Waaseyaa framework.
tags:
    - php
    - waaseyaa
    - refactoring
    - architecture
title: Extracting a PHP framework from a live application
---

Ahnii!

The [Waaseyaa](https://github.com/waaseyaa/waaseyaa) framework was extracted from [Minoo](https://minoo.live), a community platform that was already in production. This post covers how to pull reusable packages out of a running application in batches, what to extract first, and the gotchas that come up when your framework and your application share a git history.

## When extraction makes sense

You should not extract a framework because you think you might need one later. Extract when a second application needs the same code. Minoo had been running for months when Claudriel, a separate product, needed the same entity system, access control, and queue worker. Duplicating the code was not an option, so extraction began.

The [Waaseyaa](https://github.com/waaseyaa/waaseyaa) framework now contains 55+ packages. They were not extracted all at once.

## The package inventory

Before writing any code, list every piece of your application that could be a standalone package. Group them by dependency depth. Packages with no dependencies on your application's domain come out first.

Here is a subset of what came out of Minoo, ordered by extraction batch:

**Batch 1 (zero app dependencies):**
- `geo` — Haversine distance calculation
- `foundation` — SlugGenerator, base utilities
- `media` — UploadHandler with configurable MIME types and size limits
- `ssr` — Flash messaging with Twig extension
- `api` — JsonResponseTrait with typed helpers

**Batch 2 (depend on Batch 1 packages):**
- `mail` — MailDriverInterface, MailMessage, SendGridDriver
- `user` — UserBlock entity, access policy, PasswordResetTokenRepository, AuthMailer
- `mercure` — MercurePublisher for real-time SSE

Each batch builds on the previous one. Batch 2 packages can depend on Batch 1 packages but not on each other.

## The extraction protocol

For each package, the process is the same:

1. **Create the package** in the framework repo with its own `composer.json`, namespace, and test suite
2. **Copy the code** from the application, adjusting namespaces
3. **Define the interface** — extract an interface if the application was using a concrete class directly
4. **Write tests** against the framework package, not the application
5. **Require the framework package** in the application via Composer
6. **Swap the application code** for the framework package, updating `use` statements
7. **Delete the old application code**

Step 3 is where most of the design work happens. A class that worked fine inside your application may have hidden dependencies on application state. Extracting it forces you to make those dependencies explicit.

## Example: extracting the MercurePublisher

Minoo had a `MercurePublisher` class that generated JWTs and published to the Mercure hub. The extraction looked like this:

```php
// Framework package: waaseyaa/mercure
final class MercurePublisher
{
    public function __construct(
        private readonly string $hubUrl,
        private readonly string $jwtSecret,
    ) {}

    public function publish(string $topic, array $data): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        $ch = curl_init($this->hubUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $this->buildPostBody($topic, $data),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->generateJwt(),
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $result !== false && $httpCode >= 200 && $httpCode < 300;
    }
}
```

The constructor takes two strings. No framework container, no config object, no environment variable lookup. The application's service provider wires in the values from its own config. This is the key principle: framework packages accept values, applications provide them.

## Example: extracting the SlugGenerator

Some extractions are trivial. Minoo had a slug generator that was a static method on a utility class. The extraction moved it to its own package with a single class:

```php
// Framework package: waaseyaa/foundation
final class SlugGenerator
{
    public static function generate(string $input): string
    {
        // transliterate, lowercase, replace non-alphanumeric with hyphens
    }
}
```

In Minoo, the `use` statement changed from `App\Utility\Slug` to `Waaseyaa\Foundation\SlugGenerator`. That was the entire migration.

## Gotchas

**Hidden state.** A class that reads `$_ENV` or `$_SESSION` directly cannot be extracted as-is. Push environment access to the constructor or a configuration object.

**Circular dependencies.** If package A needs a class from package B, and package B needs a class from package A, you need to split one of them. In practice, this means extracting an interface into a third package that both depend on.

**Schema coupling.** Minoo's UserBlock entity assumed a specific database table name. The framework package needed to make table names configurable, or delegate schema knowledge to the application.

**Testing in two places.** After extraction, run both the framework's test suite and the application's test suite. The framework tests verify the package works in isolation. The application tests verify the integration still works. Do not skip either.

## The second-application test

Your extraction is not done until a second application uses the package without modifications. When Claudriel adopted the Waaseyaa entity system, queue worker, and access control packages, every assumption baked into Minoo's codebase surfaced. Table names, environment variable conventions, and default configuration values all needed to become explicit parameters.

If you only have one application, simulate this by writing a minimal integration test that boots the package with a fresh configuration. If the test requires copying config from your application to pass, the package still has hidden coupling.

Baamaapii
