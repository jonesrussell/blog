---
layout: post
title: "PSR-1: Basic Coding Standard in PHP"
date: 2025-01-06
categories: [php, standards]
tags: [php, php-fig, psr-1, coding-standards]
series: php-fig-standards
summary: "A guide to PSR-1, the foundational coding standard for PHP that establishes basic rules for files, namespaces, classes, and methods to improve code consistency."
---

> Updated on Jan 7, 2025: Improved writing style and examples for better clarity.
> Updated on Jan 10, 2025: Removed emojis and simplified language for consistency.

Ahnii!

Have you ever pulled down a PHP project and felt like you were reading five different coding styles at once? That's exactly what happened to me last week while helping a team with their legacy codebase. Let me show you how PSR-1 can save you from this headache.

## Understanding PSR-1 (5 minutes)

Think of PSR-1 as the "house rules" for PHP code. Just like how every house has basic rules (shoes off at the door, close the fridge, turn off lights), PSR-1 sets the foundation for writing clean PHP code that everyone can understand.

### Files and Namespaces (2 minutes)

Here are the ground rules:

- Only use `<?php` and `<?=` tags (forget about those old-school short tags)
- Always use UTF-8 without BOM (it prevents weird encoding issues)
- Keep your files focused - either declare stuff OR do stuff, not both

### Naming Things Right (3 minutes)

Let's make it clear:

- Classes use `StudlyCaps` (like `UserManager`, `OrderProcessor`)
- Constants should be in `UPPER_CASE` (like `MAX_ATTEMPTS`, `API_VERSION`)
- Methods use `camelCase` (like `getUserById`, `processOrder`)

## Real-World Example (10 minutes)

Here's a practical example from our [repository](https://github.com/jonesrussell/php-fig-guide/blob/main/src/PSR1/UserManager.php):

```php
<?php

namespace JonesRussell\PhpFigGuide\PSR1;

class UserManager
{
    const VERSION = '1.0.0';
    const ERROR_TYPE_NOT_FOUND = 'not_found';

    public function getUserById($id)
    {
        // Implementation
        return ['id' => $id, 'name' => 'John Doe'];
    }
}
```

Let's break down what makes this code PSR-1 compliant:

- Proper namespace using `StudlyCaps`
- Class name in `StudlyCaps`
- Constants in UPPERCASE_WITH_UNDERSCORES
- Method in `camelCase`

## Common Mistakes and Fixes (5 minutes)

### The Kitchen Sink File

```php
<?php
// Don't do this - mixing declarations and side effects
echo "Hello World";
class Foo {}

// Do this instead - separate files
// config.php
echo "Hello World";

// Foo.php
class Foo {}
```

### Name Things Right

```php
<?php
// Incorrect
class user_manager {}

// Correct
class UserManager {}
```

## Tools to Help You (3 minutes)

I use these tools in all my projects:

- PHP_CodeSniffer: `composer check-style` to spot issues
- Auto-fixing: `composer fix-style` to fix common mistakes
- IDE Integration: Let your editor help you stay compliant
- Git hooks: Catch issues before they hit your repo

## Next Steps

Tomorrow, we'll explore PSR-3 and see how it makes logging consistent across your applications. This post is part of our [PSR Standards in PHP series](/blog/psr-standards-in-php-practical-guide-for-developers).

## Resources (5 minutes)

For more information:

- [Official PSR-1 Specification](https://www.php-fig.org/psr/psr-1/)
- [PHP-FIG Website](https://www.php-fig.org)

Baamaapii 👋
