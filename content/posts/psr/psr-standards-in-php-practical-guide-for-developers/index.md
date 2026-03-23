---
title: "PSR Standards in PHP: A Practical Guide for Developers"
date: 2025-01-05
categories: [php, standards]
tags: [php, php-fig, psr, coding-standards]
series: ["php-fig-standards"]
series_order: 0
series_group: "Index"
summary: "A comprehensive series exploring PHP-FIG's PSR standards, with practical examples and real-world applications to help developers write more maintainable and interoperable PHP code."
slug: "psr-standards-in-php-practical-guide-for-developers"
draft: false
devto_id: 2258990
---

Are you tired of wrestling with inconsistent PHP codebases or struggling to make different packages work together? You're not alone! In this series, you'll explore how PHP-FIG's PSR standards can transform your development experience.

## What is PHP-FIG?

PHP-FIG is a group of PHP project representatives working together to advance the PHP ecosystem. Their primary contribution is the PSR system, which defines coding standards and interfaces that enable better interoperability between PHP packages and frameworks.

## Why PSRs Matter

PSRs solve several critical challenges in PHP development:

- Code Consistency: Standardized coding styles make code more readable
- Interoperability: Common interfaces allow different packages to work together seamlessly
- Best Practices: Established patterns improve code quality and maintainability

## Recommended Reading Path

New to PSRs? Follow this order — it builds knowledge progressively:

### Foundation (Start Here)

1. [PSR-1: Basic Coding Standard]({{< relref "psr-1-basic-coding-standard" >}}) — The "house rules" for PHP code
2. [PSR-12: Extended Coding Style]({{< relref "psr-12-extended-coding-style-guide" >}}) — Detailed formatting rules (extends PSR-1)
3. [PSR-4: Autoloading Standard]({{< relref "psr-4-autoloading-standard" >}}) — How PHP finds your classes automatically

### Core Infrastructure

4. [PSR-3: Logger Interface]({{< relref "psr-3-logger-interface" >}}) — Standardized logging across your application
5. [PSR-11: Container Interface]({{< relref "psr-11-container-interface" >}}) — Dependency injection made interoperable
6. [PSR-14: Event Dispatcher]({{< relref "psr-14-event-dispatcher" >}}) — Decoupled communication between components

### HTTP Stack (Read in Sequence)

7. [PSR-7: HTTP Message Interfaces]({{< relref "psr-7-http-message-interfaces" >}}) — The standard "shape" of HTTP requests and responses
8. [PSR-17: HTTP Factories]({{< relref "psr-17-http-factories" >}}) — Creating PSR-7 objects without coupling to implementations
9. [PSR-15: HTTP Handlers and Middleware]({{< relref "psr-15-http-handlers" >}}) — Processing HTTP requests through a middleware pipeline
10. [PSR-18: HTTP Client]({{< relref "psr-18-http-client" >}}) — Sending HTTP requests the standard way

### Data and Caching

11. [PSR-6: Caching Interface]({{< relref "psr-6-caching-interface" >}}) — Full-featured cache pools and items
12. [PSR-16: Simple Cache]({{< relref "psr-16-simple-cache" >}}) — Lightweight key-value caching

### Specialized

13. [PSR-13: Hypermedia Links]({{< relref "psr-13-hypermedia-links" >}}) — Self-documenting REST APIs with HATEOAS
14. [PSR-20: Clock Interface]({{< relref "psr-20-clock" >}}) — Testable time handling

## Quick Reference (by PSR Number)

| PSR | Topic | Post |
|-----|-------|------|
| 1 | Basic Coding Standard | [Read]({{< relref "psr-1-basic-coding-standard" >}}) |
| 3 | Logger Interface | [Read]({{< relref "psr-3-logger-interface" >}}) |
| 4 | Autoloading Standard | [Read]({{< relref "psr-4-autoloading-standard" >}}) |
| 6 | Caching Interface | [Read]({{< relref "psr-6-caching-interface" >}}) |
| 7 | HTTP Messages | [Read]({{< relref "psr-7-http-message-interfaces" >}}) |
| 11 | Container Interface | [Read]({{< relref "psr-11-container-interface" >}}) |
| 12 | Extended Coding Style | [Read]({{< relref "psr-12-extended-coding-style-guide" >}}) |
| 13 | Hypermedia Links | [Read]({{< relref "psr-13-hypermedia-links" >}}) |
| 14 | Event Dispatcher | [Read]({{< relref "psr-14-event-dispatcher" >}}) |
| 15 | HTTP Handlers | [Read]({{< relref "psr-15-http-handlers" >}}) |
| 16 | Simple Cache | [Read]({{< relref "psr-16-simple-cache" >}}) |
| 17 | HTTP Factories | [Read]({{< relref "psr-17-http-factories" >}}) |
| 18 | HTTP Client | [Read]({{< relref "psr-18-http-client" >}}) |
| 20 | Clock | [Read]({{< relref "psr-20-clock" >}}) |

## Practical Learning

Each post includes:

- A relatable analogy explaining what the standard solves
- The actual PSR interface with commentary
- A working implementation from the blog API companion project
- Common mistakes with before/after fixes
- Framework integration examples (Laravel, Symfony, Slim)
- A "Try It Yourself" section with exact commands to run

## Getting Started

To follow along, clone the companion repository — a blog API that uses all 14 PSRs:

```bash
git clone https://github.com/jonesrussell/php-fig-guide.git
cd php-fig-guide
composer install
```

The blog API demonstrates every PSR in a real project context. Each PSR has:
- Implementation code under `src/`
- PHPUnit tests under `tests/`

```bash
# Run all tests
composer test

# Run tests for a specific PSR
composer test -- --filter=PSR7

# Check coding standards (PSR-1 + PSR-12)
composer check-style
```

## Resources

- [PHP-FIG Website](https://www.php-fig.org/)
- [PSR Index](https://www.php-fig.org/psr/)
- [Our Example Repository](https://github.com/jonesrussell/php-fig-guide)

Baamaapii
