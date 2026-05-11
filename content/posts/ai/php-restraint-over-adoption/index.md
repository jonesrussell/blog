---
categories:
    - ai
date: 2026-05-11T00:00:00Z
devto_id: 3651808
draft: false
series:
    - waaseyaa-php-8-5-upgrade
slug: php-restraint-over-adoption
summary: An upgrade is also a decision about what not to use. Property hooks, the pipe operator, and an array_find pass we mostly rejected.
tags:
    - php
    - waaseyaa
    - monorepo
    - design
title: 'PHP 8.5 restraint: features we did not adopt'
---

Ahnii!

Third in the [PHP 8.5 upgrade series]({{< relref "waaseyaa-php-version-bump-monorepo" >}}). Post one was the floor-bump mechanics. [Post two]({{< relref "php-8-5-deprecation-sweep" >}}) was the deprecation sweep. This one is about what we deliberately did not adopt.

Most upgrade write-ups read like a feature tour. Here is what is new, here is how to use it. They are useful and they are not the whole story. The other half of an upgrade is what you choose not to add. That choice is invisible in the diff and load-bearing in the codebase.

> **Mission:** `php-8-5-upgrade-01KR8DN2`, merge commit [`e0f8cb57`](https://github.com/waaseyaa/waaseyaa/commit/e0f8cb570). Five work packages shipped. Property hooks were not in any of them.

## Property hooks: not in scope

PHP 8.4 introduced property hooks. Define `get` and `set` on a property directly, eliminate the boilerplate getter and setter pair. Asymmetric visibility came in the same window. Lots of writeups called this the biggest PHP language change in years.

Waaseyaa did not adopt either. The mission spec did not mention them. The plan did not list them as a non-goal. They simply were not part of the upgrade.

If you grep the codebase for the patterns property hooks would replace, you will find traditional methods everywhere:

```php
public function getClientId(): string
{
    return $this->clientId;
}

public function setClientId(string $clientId): void
{
    $this->clientId = $clientId;
}
```

Boring. Repetitive. Could be a property hook. Was not converted.

The reason this is intentional rather than accidental: the mission was scoped to "raise the PHP requirement and fix what 8.5 surfaces, plus a focused 8.5 feature-adoption pass." Property hooks are an 8.4 feature, not an 8.5 feature. The line was drawn at the version being adopted.

That line is the discipline. An upgrade pass is a window where adopting new patterns is cheap because everyone is reading the diff anyway. The temptation is to use the window for everything. The cost of using it for everything is that the diff conflates "we now require 8.5" with "we changed our property style." Two reverts deep, those become impossible to separate.

Property hooks are not rejected. They are deferred. They get their own mission when the conversion is the work, not a side effect of something else.

## The pipe operator: not used

PHP 8.5 introduced `|>`, a pipe operator that lets you write `$x |> $fn1 |> $fn2` instead of nested calls.

Waaseyaa shipped 8.5 without using `|>` anywhere. The plan considered it in WP04 alongside `array_first()` and `array_find()`. After the survey pass, no use sites were strong enough to take.

The reason is that pipe shines when you have a multi-step transform that reads naturally as a chain. Waaseyaa's transforms are usually one-step (use a function), two-step (assign an intermediate), or many-step but heterogeneous (a builder pattern with named methods). The middle band where pipe wins is narrow.

Adopting `|>` at every two-step site for style would create a second idiom alongside the existing intermediate-variable style. Mixed idioms have a tax: every reader has to decide which style is in play before reading. That tax is paid every time the file is opened.

So pipe stays unused until a real call site asks for it. Then it gets adopted in that one place. Not across the codebase.

## `array_find()`: two adoptions, five rejections

The most interesting case. PHP 8.5 added `array_find()` for "first matching element or null." The surface use case is exactly the foreach-and-return-first pattern that shows up in every codebase.

WP04 surveyed seven candidate sites. Two were adopted. Five were rejected.

### The two adoptions

`packages/search/src/SearchResult.php::getFacet()`:

```php
// Before
foreach ($this->facets as $facet) {
    if ($facet->name === $name) {
        return $facet;
    }
}
return null;

// After
return array_find(
    $this->facets,
    static fn(SearchFacet $facet): bool => $facet->name === $name,
);
```

`packages/cli/src/Testing/CliTester.php::findOption()` follows the same pattern. Three lines of foreach become one `array_find()` with a typed predicate.

Both sites win because the return type is `?SearchFacet` or `?OptionDefinition`. The null case is a real outcome the caller handles. `array_find` returns null when nothing matches, and that lines up cleanly with the existing contract.

### The five rejections

`SqlEntityStorage`, `AuthController`, `EntityResolver`, `JsonApiController`, `DbalTransport`. The mission notes give one rationale that covers all five:

> all rejected because the surrounding type contracts (`load()` accepts `int|string`, not null) require an explicit empty guard either way

The point is subtle. `array_find()` returning null is only a win if the caller wants null. If the caller's contract guarantees non-null (because the input was validated upstream, or because nullness is an error condition), then the foreach version is doing two things: searching and asserting. Replacing it with `array_find()` keeps the search but loses the assertion. You end up writing an explicit guard right after the `array_find()` call. The line count is the same. The intent is worse.

The fastest way to spot this in your own codebase: read the immediate caller of the candidate site. If it does `throw` or `assert` on the result, do not adopt `array_find()` there. The foreach is encoding more than iteration.

## What was adopted, intentionally

To be specific about what restraint does not mean: WP03 added `#[\NoDiscard]` to sixteen API surfaces. Four allowed/forbidden/neutral factory methods on `AccessResult`. Five repository interface methods that return loaded entities. Ten fluent-builder methods on `DBALSelect` that return the modified builder.

`#[\NoDiscard]` is a semantic safety net. If a caller ignores a `find()` return value they probably have a bug. The attribute makes the compiler say so. Adopting it on sixteen surfaces was a security-shaped decision, not a style one.

WP05 also wired three mechanical PHP-CS-Fixer rules: `octal_notation` (52 sites converted to `0o755`), `new_expression_parentheses` (58 chained-new conversions), and `heredoc_indentation` (8 SQL and HTML heredocs reindented). Mechanical, fixer-driven, no judgement required per site. Easy to adopt at scale because the fixer makes the decision.

The pattern across both: adoption is at its best when it is either a safety improvement on a critical surface, or a mechanical fixer rule that can be applied uniformly. Adoption is at its worst when it is a style change applied site by site by humans.

## The point

An upgrade is a decision about what to add and what not to add. Both decisions live in the diff. The "did not adopt" decisions are invisible if you only read the merged code, which is why they are worth writing down somewhere.

Mission directories are the place we write them down. The five-site rejection rationale for `array_find()` is one line in WP04's notes. Six months from now, someone will look at `SqlEntityStorage::load()` and think "why isn't this `array_find()`?" The mission directory has the answer.

If your team is doing a PHP 8.5 upgrade, the most useful thing you can write down is not the list of features you adopted. It is the list of features you considered and rejected, with one sentence each. That list is what makes the upgrade a position, not a checklist.

Baamaapii
