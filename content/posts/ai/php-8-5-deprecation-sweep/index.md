---
categories:
    - ai
date: 2026-05-11T00:00:00Z
devto_id: 3651807
draft: false
series:
    - waaseyaa-php-8-5-upgrade
slug: php-8-5-deprecation-sweep
summary: Three deprecation categories. Twenty-nine call sites. A test corpus that surfaces them all.
tags:
    - php
    - waaseyaa
    - monorepo
    - testing
title: 'The PHP 8.5 deprecation sweep: from 34 warnings to zero'
---

Ahnii!

Second in the [PHP 8.5 upgrade series]({{< relref "waaseyaa-php-version-bump-monorepo" >}}). The first post covered the floor-bump mechanics. This one is about what 8.5 surfaced when the floor moved and how the sweep cleared it.

> **Mission:** `php-8-5-upgrade-01KR8DN2`, work package WP02. Merge commit [`e0f8cb57`](https://github.com/waaseyaa/waaseyaa/commit/e0f8cb570). The CHANGELOG entry for [alpha.176](https://github.com/waaseyaa/waaseyaa/blob/main/CHANGELOG.md) records the verification: 34 PHPUnit deprecations to 0, across 7,497 tests.

## The starting number

Before WP02 ran, the test suite was emitting 34 deprecation warnings against 8.5. That number does not measure how broken the codebase was. It measures how dense the test corpus is. A weaker test suite would have surfaced fewer warnings because fewer code paths run during CI.

PHPUnit's deprecation handling matters here. Waaseyaa runs PHPUnit in strict mode where deprecation messages are captured and counted per test, not just printed. The mission's exit criterion was zero deprecations on the matrix that already ran 18,118 assertions.

## Three categories, twenty-nine sites

The 34 warnings collapsed into three deprecation patterns once you grouped them. Twenty-nine distinct call sites across the monorepo.

### 1. `Reflection*::setAccessible()` — 22 sites

The biggest category. `ReflectionMethod::setAccessible()` and `ReflectionProperty::setAccessible()` were marked as no-ops in PHP 8.1 (private members became reflectively accessible by default) and deprecated outright in 8.5.

Twenty-two call sites across seven test files. Packages: `entity`, `user`, `ssr`, `foundation`, `entity-storage`, and one integration test under `tests/Integration/Phase13/`.

Every site looked roughly like this:

```php
$reflection = new ReflectionMethod($object, 'privateMethod');
$reflection->setAccessible(true);
$reflection->invoke($object, $arg);
```

The fix was deletion. The line that called `setAccessible(true)` was removed. The line that called `invoke()` worked unchanged. No behavior change at runtime. The reflection access was already implicit.

This is the cleanest kind of deprecation removal you can do: the warning was telling you the line was already useless.

### 2. `$http_response_header` — 1 site

A single site in `packages/http-client/src/StreamHttpClient.php`. The magic global variable `$http_response_header` was deprecated in favor of the explicit function `http_get_last_response_headers()`.

Before:

```php
$headers = $http_response_header ?? [];
```

After:

```php
$headers = http_get_last_response_headers() ?? [];
```

Same null-coalesce default. Explicit function call instead of a side-effect global. Easier to read, easier to mock, easier to grep for.

This is the kind of language cleanup that arrives one site at a time when the language standardizes a long-running pattern. PHP's magic globals are slowly being retired across the major versions.

### 3. `curl_close()` — 6 sites

Six call sites of `curl_close()`, deprecated in 8.5 because libcurl has treated it as a no-op since version 7.20.0. PHP held onto the function for years for compatibility. 8.5 finally removes it.

Files:
- `packages/ai-agent/src/Provider/AnthropicProvider.php` — 3 sites
- `packages/ai-agent/src/Provider/OpenAiCompatibleProvider.php` — 2 sites
- `packages/mercure/src/MercurePublisher.php` — 1 site

All six were paired with `curl_exec()` calls in HTTP request flows. Removed without replacement. The cURL handle is collected by GC when it goes out of scope.

A second tautological PHPStan warning was cleaned up in the same area while we were there. Worth noting because deprecation sweeps are a good moment to fix the things you keep walking past.

## What did not get removed

WP02 was a deprecation sweep, not a code cleanup. The bar for removal was "PHP 8.5 marks it deprecated" or "PHPStan reports it tautological in the file we are already editing." Nothing else.

That bar matters. It is tempting during an upgrade to fold in unrelated cleanup. The reason not to is that the diff stops being readable. A reviewer looking at WP02 should be able to read it as "deprecation removals" with no surprises. Adding "and we also renamed this variable while we were there" makes every line of the diff a question.

## The verification

The exit criterion was numeric and binary. Run the full suite. Count deprecations. The number must be zero.

```
Locked by full PHPUnit (7497 tests / 18118 assertions / 0 deprecations / 2 expected skips)
```

That line in the CHANGELOG is the work package's signature. Two expected skips are environment-dependent tests that always skip in CI (Redis, Mercure broker variants). Zero deprecations across 7,497 tests is dense enough coverage that a future deprecation drift would surface immediately.

If you are running a similar sweep on your own codebase, the methodology is straightforward:

1. Move the PHP floor.
2. Run the full test suite. Capture deprecation output.
3. Group warnings by the deprecation key (`E_USER_DEPRECATED` message, function name, or class).
4. For each group, write a one-line removal pattern and apply it across all sites in one commit per group.
5. Rerun. The number is zero or it is not done.

The reason to group by deprecation pattern (not by file) is that each group has the same fix. Mixing them in one commit makes the diff hard to read and impossible to revert selectively.

## Next post

Post 3 in the series covers the features 8.5 introduced that we deliberately did not adopt. Property hooks. The pipe operator. Broader `array_find()` adoption beyond the two confirmed sites. The reasoning is that restraint is part of the upgrade, not the absence of one.

Baamaapii
