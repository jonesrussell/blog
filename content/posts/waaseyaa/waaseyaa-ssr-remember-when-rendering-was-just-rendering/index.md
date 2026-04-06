---
categories:
    - php
    - waaseyaa
date: 2026-04-06T00:00:00Z
devto: true
devto_id: 3458212
draft: false
slug: waaseyaa-ssr-remember-when-rendering-was-just-rendering
summary: How Waaseyaa's SSR package renders HTML the way PHP always has, with Twig templates, field formatters, and a theme chain loader, no JavaScript runtime required.
tags:
    - php
    - waaseyaa
    - ssr
    - twig
title: Remember when server-side rendering was just rendering?
---

Ahnii!

Somewhere around 2016, "server-side rendering" stopped meaning "the server renders HTML." It started meaning "run your JavaScript framework on the server so it can produce the HTML that the browser will then throw away and rebuild." The industry just forgot what to call it after React came along.

[Waaseyaa's](https://github.com/waaseyaa/waaseyaa) SSR package does the original thing. A request comes in. PHP resolves a template. Twig renders HTML. The server sends it back. No hydration step, no virtual DOM diffing, no 200MB `node_modules` folder for the privilege of generating a `<div>`.

This post walks through how the rendering pipeline works: from request to HTML, with the entity renderer, field formatters, and theme chain loader that make it more than `echo` statements in a `.php` file.

## What the rendering pipeline actually does

The entry point is `SsrPageHandler::handleRenderPage()`. It takes a path, an account, and an HTTP request. It returns an array with the rendered HTML, a status code, and headers. That's it.

```php
public function handleRenderPage(
    string $path,
    AccountInterface $account,
    HttpRequest $httpRequest,
    string $requestedViewMode = 'full',
): array {
```

The method signature tells you what matters: a path to render, who's asking, and what view mode they want. The return type is a structured array, not a framework-specific response object. The kernel decides how to send it.

Between receiving the path and returning HTML, five things happen in sequence:

1. **Language negotiation** resolves the content language from URL prefixes and `Accept-Language` headers.
2. **Path alias resolution** maps friendly URLs to entity references.
3. **Editorial visibility** checks whether the current account can see the content.
4. **Entity rendering** converts the entity into a Twig variable bag with formatted fields.
5. **Template resolution** finds the most specific Twig template and renders it.

If the path doesn't resolve to an entity, `RenderController` tries a path-based template instead. Visit `/about` and it looks for `about.html.twig`. Visit `/` and it looks for `home.html.twig`. No route file needed.

Steps 1 through 3 narrow down what to render. Step 4 is where it gets interesting.

## How entities become template variables

The `EntityRenderer` is where the real work happens. It takes an entity and a view mode, and returns a flat array that Twig can consume directly:

```php
public function render(EntityInterface $entity, ViewMode|string $viewMode = 'full'): array
{
    $mode = $viewMode instanceof ViewMode ? $viewMode->name : (string) $viewMode;
    $entityTypeId = $entity->getEntityTypeId();
    $definition = $this->entityTypeManager->getDefinition($entityTypeId);
    $fieldDefinitions = $definition->getFieldDefinitions();
    $display = $this->viewModeConfig->getDisplay($entityTypeId, $mode);

    // ... field formatting happens here ...

    return [
        'entity' => $entity,
        'entity_type' => $entityTypeId,
        'bundle' => $entity->bundle(),
        'view_mode' => $mode,
        'template_suggestions' => $this->buildTemplateSuggestions($entityTypeId, (string) $entity->bundle(), $mode),
        'fields' => $fields,
    ];
}
```

The return value is a plain associative array. Every field gets three things: the raw value, a formatted string ready for output, and the field type. Your Twig template can use `{{ fields.body.formatted }}` for the processed HTML or `{{ fields.body.raw }}` when you need the original.

View mode configuration controls which fields appear and in what order. A `teaser` view mode might show only the title and summary. A `full` view mode shows everything. If no display configuration exists for a view mode, the renderer builds a sensible default from the entity's field definitions.

## Field formatters: type-safe output without the ceremony

Each field type has a formatter that knows how to turn a raw value into safe HTML. The package ships with formatters for the common cases:

- `PlainTextFormatter` for strings (with proper escaping)
- `HtmlFormatter` for rich text
- `DateFormatter` for timestamps
- `ImageFormatter` for image fields
- `BooleanFormatter` for flags
- `EntityReferenceFormatter` for relationships between entities

The `FieldFormatterRegistry` maps field types to formatters. When the entity renderer processes a field, it asks the registry for the right formatter and calls it:

```php
$fields[$fieldName] = [
    'raw' => $raw,
    'formatted' => $this->formatterRegistry->format($formatterType, $raw, $settings),
    'type' => $fieldType,
];
```

One line of code handles the dispatch. The formatter does the escaping, date formatting, or reference resolution. Your template never has to worry about whether a value is safe for output.

You can register custom formatters for domain-specific field types. The `#[AsFormatter]` attribute marks a class as a formatter, and the registry picks it up automatically.

## Template resolution: the chain loader

Waaseyaa uses Twig's `ChainLoader` to search for templates in priority order. The `ThemeServiceProvider` builds the chain at boot:

```php
public static function createTemplateChainLoader(
    string $projectRoot,
    string $activeTheme = '',
): ChainLoader {
    $chain = new ChainLoader();

    // 1) App templates (highest priority)
    self::addPathLoaderIfExists($chain, $root . '/templates');

    // 2) Active theme templates
    // ... discovered from composer metadata ...

    // 3) Package templates
    // ... from packages/*/templates ...

    // 4) Base SSR templates (lowest priority)
    self::addPathLoaderIfExists($chain, $root . '/packages/ssr/templates');

    return $chain;
}
```

Your application's `templates/` directory wins over everything. The active theme sits below that. Package templates come next. The base SSR package provides the fallback.

This means you can override any template at any level. Want a custom 404 page? Drop `404.html.twig` in your app's `templates/` directory. Want a theme to provide a default layout that individual apps can override? That works too.

Theme discovery reads `composer.json` metadata. Any package with a `waaseyaa.theme` key in its `extra` block is a theme candidate:

```json
{
    "extra": {
        "waaseyaa": {
            "theme": {
                "id": "my-theme",
                "templates": "templates"
            }
        }
    }
}
```

No theme registry, no configuration file, no admin panel. Composer already knows what's installed. The SSR package just reads that.

## Template suggestions: specificity without complexity

When the entity renderer builds a variable bag, it also generates template suggestions, an ordered list of template filenames from most specific to least:

```php
private function buildTemplateSuggestions(
    string $entityTypeId,
    string $bundle,
    string $mode,
): array {
    return [
        "{$entityTypeId}.{$bundle}.{$mode}.html.twig",   // node.article.teaser.html.twig
        "{$entityTypeId}.{$bundle}.full.html.twig",       // node.article.full.html.twig
        "{$entityTypeId}.{$mode}.html.twig",              // node.teaser.html.twig
        "{$entityTypeId}.full.html.twig",                 // node.full.html.twig
        "entity.html.twig",                               // catch-all
    ];
}
```

The `RenderController` walks this list and uses the first template that exists. Create `node.article.teaser.html.twig` and it renders article teasers. Remove it and the renderer falls through to the next match. You only create the templates you need.

## What this isn't

This isn't PHP 4. There's no `<?php echo $row['title'] ?>` in a file that's also running SQL queries. The rendering layer is separate from data access, has proper escaping through Twig's auto-escape, supports i18n, and handles caching with surrogate keys for CDN invalidation.

But the fundamental model is the same one PHP has used since the beginning: the server receives a request, finds the right template, fills it with data, and sends HTML to the browser. The browser receives a fully rendered page and displays it. Nothing to hydrate. Nothing to rebuild.

The JavaScript ecosystem spent a decade reinventing this model and gave it a new name. Waaseyaa just kept doing it.

Baamaapii
