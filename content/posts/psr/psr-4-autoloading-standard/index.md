---
title: "PSR-4: Autoloading Standard in PHP"
date: 2025-01-08
categories: [php, standards]
tags: [php, php-fig, psr-4, autoloading]
series: ["php-fig-standards"]
series_order: 3
series_group: "Foundation"
companion_files: ["src/PSR4/Core/Database/Connection.php", "src/PSR4/Post/PostController.php"]
test_files: ["tests/PSR4/Core/Database/ConnectionTest.php", "tests/PSR4/Post/PostControllerTest.php"]
prerequisites: [1]
summary: "Master PHP's PSR-4 autoloading standard to organize your code efficiently. Learn how to structure your projects for automatic class loading and seamless package management with Composer."
slug: "psr-4-autoloading-standard"
draft: false
devto_id: 2197856
---

Ahnii!

> **Prerequisites:** Basic PHP OOP, Composer installed. **Recommended:** Read [PSR-1]({{< relref "psr-1-basic-coding-standard" >}}) first.

Remember the old days of PHP when you had to manually `require` every single file? Imagine modernizing a legacy application with 50+ require statements at the top of each file. PSR-4 autoloading makes this a problem of the past.

## Understanding PSR-4

Think of PSR-4 as your code's GPS system - it helps PHP find the right files automatically. Just like how a GPS uses addresses to find locations, PSR-4 uses namespaces to locate classes.

### Key Concepts

1. **Fully Qualified Class Name (FQCN)**
   - Vendor namespace (like your brand)
   - Package namespace (like your project)
   - Class name (the actual file)

2. **Directory Structure**
   - Base directory (where everything starts)
   - Namespace mapping (your GPS coordinates)
   - File location rules (the actual addresses)

## Real-World Example

Here's a well-structured project layout:

```text
vendor/
└── jonesrussell/
    └── blog/
        ├── composer.json
        └── src/
            └── Post/
                ├── PostController.php
                └── PostRepository.php
```

### 1. Setting Up Composer

```json
{
    "name": "jonesrussell/blog",
    "autoload": {
        "psr-4": {
            "JonesRussell\\Blog\\": "src/"
        }
    }
}
```

### 2. Creating Classes

```php
<?php

namespace JonesRussell\Blog\Post;

class PostController
{
    public function index()
    {
        return ['status' => 'Ready to blog!'];
    }
}
```

## Common Patterns

### 1. Multiple Namespace Roots

```json
{
    "autoload": {
        "psr-4": {
            "JonesRussell\\Blog\\": "src/",
            "JonesRussell\\Blog\\Tests\\": "tests/"
        }
    }
}
```

### 2. Nested Namespaces

```php
<?php

namespace JonesRussell\Blog\Core\Database;

class Connection
{
    private $config;
    
    public function __construct(array $config)
    {
        $this->config = $config;
    }
}

// File location: src/Core/Database/Connection.php
```

## Framework Examples

If you're using Laravel or Symfony, they follow PSR-4 out of the box:

### Laravel

```php
<?php

namespace App\Http\Controllers;

class BlogController extends Controller
{
    public function index()
    {
        return view('blog.index');
    }
}
```

### Symfony

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class BlogController extends AbstractController
{
    public function index(): Response
    {
        return $this->render('blog/index.html.twig');
    }
}
```

## Quick Fixes for Common Issues

1. **"Class Not Found" Errors**

```bash
# When things go wrong, this is your friend:
composer dump-autoload
```

2. **Directory Structure Mistakes**

```text
# Don't do this
src/
└── controllers/  # lowercase = bad
    └── PostController.php

# Do this instead
src/
└── Controller/  # Matches namespace case
    └── PostController.php
```

## Testing Your Setup

Drop this in `test-autoload.php`:

```php
<?php

require 'vendor/autoload.php';

// If this works, your autoloading is set up correctly!
$controller = new \JonesRussell\Blog\Post\PostController();
var_dump($controller->index()); // Should show "Ready to blog!"
```

## Next Steps

Tomorrow, you'll explore PSR-6 and see how it standardizes caching in PHP applications. This post is part of the [PSR Standards in PHP series]({{< relref "psr-standards-in-php-practical-guide-for-developers" >}}).

## Resources

- [Official PSR-4 Specification](https://www.php-fig.org/psr/psr-4/)
- [Composer Autoloading Documentation](https://getcomposer.org/doc/04-schema.md#autoload)
- [Series Example Repository](https://github.com/jonesrussell/php-fig-guide) (v0.3.0 - PSR-4 Implementation)

Baamaapii
