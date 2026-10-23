---
categories:
    - php
date: 2026-10-23T00:00:00Z
devto: true
devto_id: 4905455
draft: false
slug: generated-content-homepage-route
summary: Keep generated collection routes from replacing your application homepage when detail pages live at the root.
tags:
    - php
    - routing
    - testing
    - waaseyaa
title: Do not let generated content replace your homepage
---

Ahnii!

A content generator can produce valid routes and still erase the application you started with.

The failure appears when a content type uses a root-level detail route such as `/{slug}`. If the generator derives the collection route by removing the slug segment, it gets `/`. Registering that collection at the root can replace the homepage provided by your starter application.

A recent [Waaseyaa route-generation repair](https://github.com/waaseyaa/framework/commit/17bf3bb78fa494fcd325a5753795d93952ede184) makes the ownership rule explicit. This post covers the route policy and the tests that keep a generated content index from taking over `/`.

## The detail route is not the collection route

Consider three content types:

| Content type | Detail route | Expected collection |
| --- | --- | --- |
| Page | `/{slug}` | `/page` |
| News | `/news/{slug}` | `/news` |
| Archive | `/news/archive/{slug}` | `/news/archive` |

Removing the terminal slug works for the two prefixed routes. It does not work for the root-level route because the empty parent becomes `/`.

The original derivation followed that logic:

```php
$route = preg_replace('#/\{[^/]+\}$#', '', $detailRoute) ?? '';

return $route === '' ? '/' : $route;
```

Both the homepage and the generated page collection then claimed the same literal URL. The router could serve a valid response while still serving the wrong owner.

That distinction matters. An HTTP 200 does not prove your homepage survived generation.

## Give the root collection a stable name

The repaired recipe passes the bundle identifier into its collection-route function:

```php
private function indexRoute(string $detailRoute, string $bundle): string
{
    $route = preg_replace('#/\{[^/]+\}$#', '', $detailRoute) ?? '';

    return $route === '' ? '/' . $bundle : $route;
}
```

The policy is small:

- a root-level detail route keeps its authored `/{slug}` pattern;
- its collection moves to `/<bundle-id>`;
- a prefixed detail route keeps its parent as the collection;
- the application homepage remains at `/`.

For the default `page` bundle, individual pages still resolve from paths such as `/about`, while the collection lives at `/page`.

This is better than inventing a global `/content` prefix. The bundle already provides a stable, declared name, and prefixed routes do not change unnecessarily.

## Reserve literal collection paths first

Moving the collection exposes another possible collision. A root-level `page` bundle now owns `/page`, so another content type cannot also declare `/page/{slug}` and derive the same collection.

The recipe records each collection route while rendering definitions:

```php
if (isset($indexRoutes[$indexRoute])) {
    throw new InvalidArgumentException(
        "Published content index route collision: {$indexRoute}"
    );
}

$indexRoutes[$indexRoute] = true;
```

This refuses the ambiguous site before publishing generated files. It also reserves the literal collection path ahead of the broad `/{slug}` detail matcher.

Route ordering can hide a collision during one request. Generation-time refusal makes the contract independent of registration order.

## Test ownership, not only response codes

The focused recipe tests cover the route table directly:

- `/{slug}` produces `/page`;
- `/news/{slug}` produces `/news`;
- `/news/archive/{slug}` produces `/news/archive`;
- no generated collection may equal `/`;
- a second collection at `/page` is refused.

The stronger integration check verifies the composed application:

1. Generate and install the minimal published-content recipe.
2. Request `/` from the real HTTP runtime.
3. Assert the response contains a marker owned by the application's homepage template.
4. Request `/page`.
5. Assert the response contains the generated `page_index` listing.
6. Repeat the homepage request cold, warm, and after restarting the server process.

The marker is important. Checking only for status 200 would accept the original bug because the generated listing also returned 200 at `/`.

You need evidence about *which component answered*, not just whether something answered.

## Version the generated contract

Changing generated URLs is observable application behavior. Waaseyaa includes the collection policy in the recipe digest:

```php
'index_routes' => [
    'root_detail' => 'bundle_path',
    'prefixed_detail' => 'parent_path',
],
```

That prevents an older generated selection from silently claiming the new output. Existing applications retain their routes until a reviewed regeneration adopts the changed recipe.

This is the right upgrade boundary for code generation:

- fix future output at the producer;
- record the new generation contract;
- refuse conflicting routes before writing;
- require existing applications to regenerate deliberately.

Do not patch generated metadata by hand to make verification pass. The generator, its digest, and the application output should move together.

## A route-generation checklist

Before you trust a generated route set, prove these boundaries:

| Boundary | Minimum proof |
| --- | --- |
| Homepage ownership | `/` renders an application-owned marker after generation |
| Root detail routes | `/{slug}` keeps details at the root without creating a root collection |
| Prefixed routes | Parent collection paths remain unchanged |
| Literal collisions | Duplicate collection URLs fail before publication |
| Matcher precedence | Collection literals are reserved ahead of broad slug routes |
| Upgrade behavior | A changed route policy changes the generation contract |

Generated code is part of your application's public interface. Treat route ownership as a contract, and test the composed application that users will actually reach.

Baamaapii
