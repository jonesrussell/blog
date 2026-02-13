---
title: "PSR-12: Extended Coding Style Guide in PHP"
date: 2025-02-16
categories: [php, standards]
series: ["php-fig-standards"]
tags: [php, php-fig, psr-12, coding-style]
summary: "PSR-12 extends PSR-1 and PSR-2 to provide a comprehensive coding style guide for modern PHP, ensuring consistency across PHP code."
slug: "psr-12-extended-coding-style-guide"
---

Ahnii!

> **Prerequisites:** Read [PSR-1](/psr-1-basic-coding-standard/) first — PSR-12 extends it.

Remember PSR-1's "house rules" for PHP code? PSR-12 is like the detailed home manual. It extends PSR-1 and replaces the deprecated PSR-2 to provide a comprehensive coding style guide for modern PHP.

## Why PSR-12 Matters (2 minutes)

You might think coding style is superficial. But imagine reading a book where every chapter uses different indentation, different quote marks, and different paragraph spacing. It's exhausting. PSR-12 eliminates these distractions so you can focus on what the code *does* rather than how it looks.

PSR-12 replaces PSR-2 (now deprecated) and works alongside PSR-1. If PSR-1 covers the "what" (naming, file structure), PSR-12 covers the "how" (formatting, spacing, braces).

## Key Style Rules

### 1. General Code Layout

- Files MUST use Unix LF line endings.
- Files MUST end with a single blank line.
- The closing `?>` tag MUST be omitted from files containing only PHP.
- Lines SHOULD be 80 characters or less.
- There MUST be one blank line after namespace declarations.
- Opening braces MUST be on the same line as the statement.

### 2. Class Structure

Here's an example of a properly structured class:

```php
<?php

declare(strict_types=1);

namespace Vendor\Package;

use Vendor\Package\SomeClass;
use Vendor\Package\AnotherClass as AClass;

class ClassName extends ParentClass implements \ArrayAccess, \Countable
{
    private const VERSION = '1.0';
    
    public function methodName(int $arg1, ?string $arg2): string
    {
        // method body
    }
}
```

### 3. Control Structures

Examples of control structures formatted according to PSR-12:

```php
<?php

if ($expr1) {
    // if body
} elseif ($expr2) {
    // elseif body
} else {
    // else body
}

switch ($expr) {
    case 0:
        echo 'First case';
        break;
    default:
        echo 'Default case';
        break;
}

try {
    // try body
} catch (FirstThrowableType $e) {
    // catch body
} finally {
    // finally body
}
```

## Modern PHP Features

### 1. Type Declarations

Example of using type declarations in method signatures:

```php
<?php

public function processUser(
    User $user,
    ?array $options = null
): ?Response {
    // Implementation
}
```

### 2. Attribute Syntax

Example of using attribute syntax in PHP 8:

```php
<?php

#[Route("/api/posts/{id}", methods: ["GET"])]
public function show(#[EntityId] int $id): Response
{
    // Implementation
}
```

## Tools for PSR-12 Compliance

1. PHP_CodeSniffer Configuration
2. PHP-CS-Fixer Setup
3. IDE Integration
   - PhpStorm
   - VS Code with PHP Intelephense

## Common Issues and Solutions

1. **Mixed Line Endings**

```bash
# Check for mixed line endings
$ find . -name "*.php" -exec file {} \;

# Fix with dos2unix
$ find . -name "*.php" -exec dos2unix {} \;
```

2. **Incorrect Indentation**

```php
// Bad
class Foo {
    function bar() {
return true;
    }
}

// Good
class Foo
{
    public function bar(): bool
    {
        return true;
    }
}
```

## Next Steps

In our next post, we'll explore PSR-13, which defines standards for HTTP message interfaces in PHP. Check out our [example repository](https://github.com/jonesrussell/php-fig-guide/tree/psr-12) for the implementation of these standards.

## Try It Yourself

Clone the companion repository — the entire project follows PSR-12:

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install

# Check if code follows PSR-12
composer check-style

# Auto-fix style violations
composer fix-style
```

See `phpcs.xml` for the PSR-12 configuration used across the project.

## Resources

- [Official PSR-12 Specification](https://www.php-fig.org/psr/psr-12/)
- [PHP_CodeSniffer PSR-12 Ruleset](https://github.com/squizlabs/PHP_CodeSniffer/blob/master/src/Standards/PSR12/ruleset.xml)
- [PHP-CS-Fixer Documentation](https://github.com/FriendsOfPHP/PHP-CS-Fixer)

Baamaapii 👋
