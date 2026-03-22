---
title: "How Search Autocomplete Works — And I Rebuilt My Frontend to Prove It"
date: 2026-03-22
categories: [php, search]
tags: [waaseyaa, elasticsearch, autocomplete]
summary: "Build a search frontend with live autocomplete using PHP, Elasticsearch suggest, and zero JavaScript frameworks."
slug: "how-search-autocomplete-works"
draft: true
---

Ahnii!

Someone asked on X: "You type 3 letters into Google and it already knows the full sentence you're about to search. How?" Good question. This post answers it by building a working autocomplete from scratch. The live result is at [northcloud.one](https://northcloud.one).

## The Short Answer

Search autocomplete works in three parts:

1. Your browser sends what you've typed so far to a suggest endpoint
2. The server queries a completion index that stores popular queries and document titles as prefix-matchable tokens
3. The results come back as a ranked list, and JavaScript renders them under the input

The interesting part is step 2. Let's build all three.

## Prerequisites

- PHP 8.4+ with `pdo_sqlite` and `mbstring`
- [Composer](https://getcomposer.org/) 2.x
- A search API with a suggest endpoint (we use [North Cloud's](https://github.com/jonesrussell/north-cloud) Elasticsearch-backed search service)

## Scaffold the Project

[Waaseyaa](https://waaseyaa.org) is a PHP framework built on Symfony 7. You create a new app the same way you would with Laravel or Symfony:

```bash
composer create-project waaseyaa/waaseyaa northcloud-search --stability=alpha
cd northcloud-search
php bin/waaseyaa install
```

That gives you a working app with a CLI, Twig templates, routing, and a built-in dev server. The `--stability=alpha` flag is required during pre-release.

One gotcha: two packages (`waaseyaa/deployer` and `waaseyaa/ingestion`) aren't published to Packagist yet. Remove them from `composer.json` and run `composer install` again. This is alpha friction, tracked at [waaseyaa/waaseyaa#5](https://github.com/waaseyaa/waaseyaa/issues/5).

## How the Suggest Endpoint Works

Your search API needs a suggest endpoint. North Cloud's returns an array of strings:

```
GET /api/v1/search/suggest?q=trud
```

```json
["trudeau", "trudeau resignation", "trudeau housing policy"]
```

Under the hood, Elasticsearch uses a [completion suggester](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester). Document titles and popular queries are indexed as completion fields. When you query with a prefix, Elasticsearch does a fast FST (finite state transducer) lookup. No full-text search, no scoring. Just prefix matching ranked by weight.

## The PHP Proxy Controller

Your frontend shouldn't talk directly to Elasticsearch. Wrap it in a controller that proxies to the search API:

```php
final class SuggestController
{
    public function __construct(
        private readonly NorthCloudClient $client,
    ) {}

    public function suggest(
        array $params,
        array $query,
        AccountInterface $account,
        Request $httpRequest,
    ): SsrResponse {
        $q = trim($query['q'] ?? '');

        if ($q === '') {
            return new SsrResponse(
                content: '[]',
                headers: ['Content-Type' => 'application/json'],
            );
        }

        try {
            $suggestions = $this->client->suggest($q);
            return new SsrResponse(
                content: json_encode($suggestions, JSON_THROW_ON_ERROR),
                headers: ['Content-Type' => 'application/json'],
            );
        } catch (\Throwable) {
            return new SsrResponse(
                content: '[]',
                headers: ['Content-Type' => 'application/json'],
            );
        }
    }
}
```

The controller returns an empty array on error instead of a 500. Your autocomplete dropdown should degrade gracefully, not break the page.

The `NorthCloudClient` is a thin wrapper around Symfony's HTTP client that reads `NORTHCLOUD_API_URL` from the environment:

```php
final class NorthCloudClient
{
    private readonly HttpClientInterface $http;
    private readonly string $apiUrl;

    public function __construct()
    {
        $this->http = HttpClient::create();
        $this->apiUrl = getenv('NORTHCLOUD_API_URL') ?: 'http://search:8092';
    }

    public function suggest(string $query): array
    {
        $response = $this->http->request('GET', $this->apiUrl . '/api/v1/search/suggest', [
            'query' => ['q' => $query],
            'timeout' => 3,
        ]);
        return $response->toArray();
    }
}
```

One service, two methods (`search` and `suggest`), injected into every controller. No framework magic.

## The JavaScript: 20 Lines, No Dependencies

The autocomplete is vanilla JavaScript. No React, no Alpine, no build step:

```javascript
var input = document.getElementById('search-input');
var dropdown = document.getElementById('suggest-dropdown');
var timer = null;
var activeIdx = -1;

input.addEventListener('input', function() {
  clearTimeout(timer);
  var q = this.value.trim();
  if (q.length < 2) { dropdown.classList.remove('open'); return; }
  timer = setTimeout(function() { fetchSuggestions(q); }, 300);
});

function fetchSuggestions(q) {
  fetch('/api/suggest?q=' + encodeURIComponent(q))
    .then(function(r) { return r.json(); })
    .then(function(items) {
      if (!items.length) { dropdown.classList.remove('open'); return; }
      while (dropdown.firstChild) { dropdown.removeChild(dropdown.firstChild); }
      items.forEach(function(suggestion) {
        var div = document.createElement('div');
        div.className = 'suggest-item';
        div.textContent = suggestion;
        div.addEventListener('click', function() {
          window.location = '/search?q=' + encodeURIComponent(suggestion);
        });
        dropdown.appendChild(div);
      });
      dropdown.classList.add('open');
    })
    .catch(function() { dropdown.classList.remove('open'); });
}
```

Three things to notice:

1. **Debounce at 300ms.** You don't send a request on every keystroke. Wait until the user pauses.
2. **DOM methods, not innerHTML.** Each suggestion is created with `createElement` and `textContent`. No XSS risk from server-returned strings.
3. **Graceful failure.** If the fetch fails, the dropdown closes. The search box still works as a normal form.

Arrow key navigation and Escape handling add another 10 lines. The full version is in the [repo](https://github.com/waaseyaa/northcloud-search).

## Server-Rendered Search Results

The search results page is fully server-rendered. No client-side routing, no hydration, no loading spinners:

```php
public function results(/* ... */): SsrResponse {
    $searchQuery = trim($query['q'] ?? '');
    $page = max(1, (int) ($query['page'] ?? 1));
    $from = ($page - 1) * 10;

    $topics = array_filter(explode(',', $query['topics'] ?? ''));

    try {
        $data = $this->client->search($searchQuery, $from, 10, $topics);
        $results = $data['hits'] ?? [];
        $total = $data['total'] ?? 0;
        $facets = $data['facets'] ?? [];
    } catch (\Throwable) {
        $error = true;
    }

    $html = $this->twig->render('search.html.twig', [/* context */]);
    return new SsrResponse(content: $html);
}
```

The search API returns facet counts alongside results. Topics like "Crime (42)" and "Mining (15)" render as clickable filters in the sidebar. Clicking one adds `&topics=crime` to the URL and re-renders the page with filtered results. All state lives in the URL. No JavaScript needed for filtering or pagination.

## Deploy with Docker

The app runs in a single container. No nginx sidecar, no Node.js, no build step:

```dockerfile
FROM php:8.4-cli-alpine

RUN apk add --no-cache sqlite-dev \
    && docker-php-ext-install pdo_sqlite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction
COPY . .
RUN php bin/waaseyaa install --no-interaction 2>/dev/null || true

ENV NORTHCLOUD_API_URL=http://search:8092
EXPOSE 3003
CMD ["php", "-S", "0.0.0.0:3003", "-t", "public"]
```

Build it, add it to your docker-compose, point nginx at port 3003. The container joins the same Docker network as the search service, so `http://search:8092` resolves directly. No external API calls in production.

The Waaseyaa skeleton doesn't ship a Dockerfile yet. Filed as [waaseyaa/waaseyaa#8](https://github.com/waaseyaa/waaseyaa/issues/8).

## What I Learned About the Alpha

This was the first real app built with Waaseyaa's `composer create-project`. Here's what worked and what didn't:

**Worked well:**
- Routing via `RouteBuilder` is clean and expressive
- Twig templates render without issues
- CLI (`bin/waaseyaa serve`, `install`, `migrate`) works out of the box
- Constructor injection resolves `Twig\Environment` automatically

**Friction:**
- Two packages not published to Packagist ([waaseyaa/waaseyaa#5](https://github.com/waaseyaa/waaseyaa/issues/5))
- No Dockerfile in the skeleton ([waaseyaa/waaseyaa#8](https://github.com/waaseyaa/waaseyaa/issues/8))
- SQLite journal files not in `.gitignore`
- `route:list` CLI command shows empty even with routes registered
- Custom services (like an HTTP client) need manual singleton registration

Every friction point was filed as a GitHub issue. That's the value of dogfooding your own framework.

## Try It

Type something into the search box at [northcloud.one](https://northcloud.one). Watch the suggestions appear. That's Elasticsearch completion, a PHP proxy, and 20 lines of JavaScript.

The full source is at [github.com/waaseyaa/northcloud-search](https://github.com/waaseyaa/northcloud-search).

Baamaapii
