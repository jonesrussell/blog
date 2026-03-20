# Social Posts: PSR-17: HTTP Factories in PHP

**Canonical URL:** https://jonesrussell.github.io/blog/psr-17-http-factories/

## Facebook

Using `new GuzzleHttp\Psr7\Response()` directly? You've coupled your code to Guzzle. PSR-17 defines factory interfaces for creating PSR-7 objects, so you can swap HTTP libraries without changing application code. This post shows the coupled vs decoupled approach with real examples. #PHP #PSR17 #HTTP #WebDev

Read more: https://jonesrussell.github.io/blog/psr-17-http-factories/

## X (Twitter)

PSR-17 is the factory pattern for PSR-7 objects. Stop newing up concrete HTTP classes. Use factories, stay decoupled, swap implementations freely.

https://jonesrussell.github.io/blog/psr-17-http-factories/

## LinkedIn

PSR-17 solves a subtle but important problem: how to create PSR-7 HTTP objects without coupling to a specific implementation. This post covers the six factory interfaces, demonstrates the difference between coupled and decoupled code, and shows how factories make testing trivial by eliminating the need for HTTP mocking libraries.

Read more: https://jonesrussell.github.io/blog/psr-17-http-factories/
