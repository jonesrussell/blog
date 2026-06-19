---
title: "One URL, two readers: serving HTML to people and Markdown to agents"
date: 2026-06-19
categories: [php, waaseyaa]
tags: [waaseyaa, content-negotiation, ai-agents, php]
summary: "How Waaseyaa serves the same content as a web page for people and clean Markdown for AI agents from a single URL, using HTTP content negotiation."
slug: "agent-readable-content-negotiation"
draft: false
devto: true
---

Ahnii!

The web has two kinds of readers now: people and agents. Most stacks make you build a second system to serve the second one, a separate API with its own routes, auth, and serializers. This post shows the approach [Waaseyaa](https://github.com/waaseyaa/framework) takes instead: one URL serves a human a web page and an AI agent clean Markdown, decided by HTTP content negotiation. It covers the content type you define, the negotiation that picks the format, and the agent-facing routes that come along for free.

> **Prerequisites:** Familiarity with HTTP `Accept` headers and basic PHP. Waaseyaa is an early-alpha PHP framework, so treat the specifics as a moving target.

## Define the content once

You describe the shape of your content one time. In Waaseyaa that is a single command:

```bash
waaseyaa make:content-type story --fields="title:string,body:text,source_url:string"
```

That scaffolds a `story` content type with three fields. Then you add an entry:

```bash
waaseyaa entity:create story --field title="The Five Totems" --field status=1
```

You never write a controller, a route, or a serializer for any of this. The type is the only thing you author. Everything that follows is the framework reading that one definition.

## One URL, negotiated by Accept

The same canonical path, `/{type}/{id}`, serves both audiences. What comes back depends on the request's `Accept` header. A browser sends `text/html` and gets a rendered page. An agent that asks for `text/markdown` gets Markdown. The decision lives in `MediaTypeAcceptNegotiator`:

```php
namespace Waaseyaa\Foundation\Http\ContentNegotiation;

final class MediaTypeAcceptNegotiator
{
    public const string HTML = 'text/html';
    public const string MARKDOWN = 'text/markdown';

    public function negotiate(string $acceptHeader, array $supported, string $default): string
    {
        // Ranks the Accept entries (RFC 7231) and returns the best supported match.
    }
}
```

The negotiator parses the `Accept` header by quality value and returns the most specific supported media type. The human path and the agent path converge on one URL, so there is no `/api/story/123` shadow of `/story/123` to keep in sync.

## A human toggle for the same switch

`Accept` headers are invisible in a browser, so there is also an explicit query override. The negotiator recognizes it directly:

```php
public function resolveQueryOverride(array $query, array $supported): ?string
{
    if (\array_key_exists('raw', $query)) {
        return self::MARKDOWN;
    }

    if (isset($query['format']) && \is_string($query['format'])) {
        return match (strtolower(trim($query['format']))) {
            'md', 'markdown' => self::MARKDOWN,
            'html' => self::HTML,
            default => null,
        };
    }

    return null;
}
```

Append `?raw` or `?format=md` to any content URL and you see exactly what an agent sees. That makes the agent-facing output something you can eyeball in a browser, not a black box you have to script against to inspect.

## Caching two formats at one address

Serving two representations from one URL has a well-known hazard: a shared cache can hand the HTML variant to an agent or the Markdown to a browser. `SsrPageHandler` guards against that by varying the cache on the negotiated type:

```php
$mediaType = $this->negotiateMediaType($httpRequest);

// ...render either Markdown or HTML based on $mediaType...

$headers['Vary'] = 'Accept';
```

The `Vary: Accept` header tells every cache in the chain that the response depends on the request's `Accept` header, so the Markdown and HTML variants never cross-contaminate. One URL, two cache entries, no leakage.

## The agent-facing routes you get for free

Because the framework already knows which content types are public, it can publish the discovery surface agents and crawlers expect without you wiring anything. `SeoPublicController` exposes three zero-config routes:

```php
public function robotsTxt(): Response   // /robots.txt
public function sitemapXml(): Response   // /sitemap.xml
public function llmsTxt(): Response      // /llms.txt
```

`/llms.txt` is the emerging convention for telling language models what a site contains and where to look. Here it is generated from the same content-type metadata that drives everything else, alongside schema.org JSON-LD injected into the page head. Your content becomes legible to an AI assistant the moment it is published, without a second pipeline.

## Why this matters

As more of the web gets read through AI assistants, the content you publish is increasingly consumed by something that does not render HTML. The common answer is to stand up a parallel API: more routes, more auth surface, more drift between what people see and what machines see. Negotiating on one URL collapses that back into a single source of truth. You define the content once, and the same address answers both readers correctly.

It is still alpha, and the write side has rougher edges than the read side. But the read path holds the thesis: one URL, two readers, no second system.

Baamaapii
