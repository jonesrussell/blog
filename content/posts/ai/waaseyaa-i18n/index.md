---
title: "i18n for a cultural platform"
date: 2026-03-21
categories: [ai, php]
tags: [waaseyaa, php, i18n, minoo]
series: ["waaseyaa"]
series_order: 8
series_group: "Main"
summary: "How waaseyaa's i18n package handles language negotiation and multilingual entities — built for an indigenous cultural platform where language isn't a feature, it's the point."
slug: "waaseyaa-i18n"
draft: false
---

Ahnii!

> **Series context:** This is part 6 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). The previous post covered [replacing the database layer]({{< relref "waaseyaa-dbal-migration" >}}). This post covers internationalization — the subsystem that makes [Minoo](https://minoo.live) a multilingual platform.

Most frameworks treat i18n as a UI concern. You have English strings and French strings. The user picks a locale. Labels change. The content stays the same.

That model doesn't work for [Minoo](https://minoo.live).

## Why i18n matters differently here

Minoo is a platform for indigenous language and culture. A teaching exists in Ojibwe. It might also exist in English. Those aren't two translations of the same content — they're two expressions of the same knowledge, each with its own structure, nuance, and community context.

The language isn't a UI preference. It's a property of the knowledge itself.

This distinction drives every design decision in waaseyaa's `i18n` package. Language negotiation isn't about swapping label files. It's about resolving which language context the entire request operates in — and making sure entity storage, access control, and search all respect that context.

## LanguageManagerInterface

The core contract for language resolution:

```php
interface LanguageManagerInterface
{
    public function setCurrentLanguage(string $langcode): void;
    public function getCurrentLanguage(): string;
    public function getDefaultLanguage(): string;
    public function getLanguages(): array;
}
```

`getLanguages()` returns all enabled languages for the platform. `getDefaultLanguage()` returns the fallback — for Minoo, that's English. `getCurrentLanguage()` returns whatever the negotiation pipeline resolved for the current request. `setCurrentLanguage()` allows middleware or test harnesses to override it explicitly.

The interface is deliberately small. Language resolution is a single responsibility: determine what language context this request operates in. Everything downstream reads from `getCurrentLanguage()`.

## Language negotiation

How does waaseyaa decide the current language? Through a negotiation pipeline that checks multiple sources in priority order.

The highest-priority source is the URL prefix. When a user visits `minoo.live/oj/teachings/`, the router strips the `/oj/` prefix, sets the current language to Ojibwe, and forwards the remaining path (`/teachings/`) to the standard routing pipeline.

```php
interface LanguageNegotiatorInterface
{
    public function negotiate(RequestInterface $request): string;
}
```

The negotiator checks sources in order:

1. **URL prefix** — `/oj/` resolves to Ojibwe, `/en/` to English. No prefix falls through to the next source.
2. **User preference** — If the user is authenticated and has a stored language preference, use it.
3. **Accept-Language header** — The browser's language header, matched against enabled languages.
4. **Default language** — If nothing else matches, fall back to the platform default.

This is a chain-of-responsibility pattern. Each source either returns a resolved language or defers to the next. The first match wins.

```php
final class UrlPrefixNegotiator implements LanguageNegotiatorInterface
{
    public function negotiate(RequestInterface $request): string
    {
        $path = $request->getUri()->getPath();
        $prefix = $this->extractPrefix($path);

        if ($prefix && $this->languageManager->isValidLanguage($prefix)) {
            return $prefix;
        }

        return '';  // Defer to next negotiator
    }
}
```

An empty string means "I don't have an opinion." The negotiation pipeline moves to the next source. This mirrors the neutral-result pattern from [access control]({{< relref "waaseyaa-access-control" >}}) — no opinion means defer, not default.

## Multilingual entities

Language context flows into the entity system through `EntityInterface`:

```php
interface EntityInterface
{
    public function language(): string;
    // ... other methods from post 2
}
```

Every entity carries its language. A teaching in Ojibwe and a teaching in English are related but distinct entity instances. They share a relationship (same source teaching), but they have different content, different field values, and potentially different access policies.

The entity storage layer handles language-aware queries. When the current language is Ojibwe, a query for teachings returns Ojibwe teachings. The storage adapter filters by `language()` automatically, using the value from `LanguageManagerInterface::getCurrentLanguage()`.

```php
$this->languageManager->setCurrentLanguage('oj');

// This query returns Ojibwe teachings
$teachings = $this->entityStorage->loadByType('teaching');
```

No language parameter needed on every query. The current language is ambient context — set once at the request level, respected everywhere downstream.

This is a deliberate tradeoff. Ambient context is implicit, which can make debugging harder. But the alternative — passing a language parameter through every method signature in the stack — creates noise that obscures the actual business logic. For a platform where every request operates in a single language context, ambient wins.

## LanguageAccessPolicy

Language and access control intersect in Minoo's `LanguageAccessPolicy`. This policy covers four entity types: dictionary entries, example sentences, word parts, and speakers.

```php
#[PolicyAttribute(entityType: ['dictionary_entry', 'example_sentence', 'word_part', 'speaker'])]
final class LanguageAccessPolicy implements AccessPolicyInterface
{
    public function access(
        EntityInterface $entity,
        string $operation,
        AccountInterface $account,
    ): AccessResult {
        if (!$this->communityAccess->hasLanguageAccess($account, $entity->language())) {
            return AccessResult::forbidden('No access to this language community');
        }

        return AccessResult::neutral();
    }
}
```

If the account doesn't have access to the entity's language community, access is forbidden. Otherwise, the policy returns neutral — deferring to other policies for the final grant decision. This connects directly to the deny-unless-granted semantics from [post 3]({{< relref "waaseyaa-access-control" >}}). A neutral result here doesn't mean "allowed." It means "this policy has no objection, but something else still needs to grant access."

Community-controlled language access is a real requirement. Some indigenous communities restrict access to certain language materials to community members. This isn't DRM — it's cultural sovereignty. The access control layer enforces it without special-casing.

## The ai-vector language connection

Waaseyaa's `ai-vector` package handles semantic search. Language boundaries matter here too.

```php
interface VectorStoreInterface
{
    public function search(
        string $query,
        string $langcode,
        array $fallbackLangcodes = [],
        int $limit = 10,
    ): array;
}
```

The `search()` method accepts a `langcode` and optional `fallbackLangcodes`. A search in Ojibwe returns Ojibwe results. If the Ojibwe corpus doesn't have enough matches, the fallback languages are searched in order.

This keeps semantic search honest. Embedding models behave differently across languages. Mixing languages in a single vector search produces unreliable similarity scores. By searching within language boundaries first and falling back explicitly, the results stay meaningful.

## Building i18n with AI sessions

Language negotiation activation was a recent milestone — completed during a focused AI session with the full `LanguageNegotiatorInterface` contract as context.

The spec-backed approach paid off here. Each session started with the interface definitions, the negotiation pipeline design, and the test expectations. Claude didn't need to infer the architecture from scattered code. The contracts were the architecture.

The negotiation pipeline was built in three sessions: URL prefix negotiation first (the highest-priority source), then user preference and Accept-Language header support, then the fallback chain that ties them together. Each session produced working code that passed the contract tests from the previous session.

This is the pattern that's worked throughout waaseyaa: define the interface, write the tests against the interface, then implement. AI sessions are productive because the contracts eliminate ambiguity about what "done" means.

## Next

Testing 38 packages without losing your mind.

Baamaapii
