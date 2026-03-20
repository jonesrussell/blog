# Social Posts: PSR-20: Clock Interface in PHP

**Canonical URL:** https://jonesrussell.github.io/blog/psr-20-clock/

## Facebook

Every time you write `new DateTime('now')` in PHP, you make your code untestable. PSR-20 fixes this with a one-method Clock interface. Use SystemClock in production, FrozenClock in tests. No more flaky time-dependent tests. This post wraps up the entire 14-post PSR series. #PHP #PSR20 #Testing #WebDev

Read more: https://jonesrussell.github.io/blog/psr-20-clock/

## X (Twitter)

PSR-20: one interface, one method, and the end of flaky time-dependent tests in PHP. Replace `new DateTime('now')` with `$clock->now()` and freeze time in your tests.

https://jonesrussell.github.io/blog/psr-20-clock/

## LinkedIn

Time is a hidden dependency that makes code untestable. PSR-20 solves this with a minimal Clock interface, letting you inject a SystemClock in production and a FrozenClock in tests. This final post in the PHP-FIG Standards series covers practical examples including testable publishing, cache TTL, and scheduled operations. The full series covers all 14 accepted PSRs.

Read more: https://jonesrussell.github.io/blog/psr-20-clock/
