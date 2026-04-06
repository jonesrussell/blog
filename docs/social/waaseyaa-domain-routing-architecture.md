# Social copy: Domain Routing in Waaseyaa

**Canonical URL:** https://jonesrussell.github.io/blog/waaseyaa-domain-routing-architecture/

## Facebook

Replaced a 1,000-line controller dispatcher in Waaseyaa with domain-specific routers. Each implements a two-method interface: supports() and handle(). New domains are additive, existing routers never change. Wrote up the pattern and the real implementation. https://jonesrussell.github.io/blog/waaseyaa-domain-routing-architecture/ #php #architecture #waaseyaa

## X (Twitter)

Replaced a 1,000-line dispatcher in Waaseyaa with domain routers. Two-method interface, additive by design. Wrote up the pattern. https://jonesrussell.github.io/blog/waaseyaa-domain-routing-architecture/

## LinkedIn

Waaseyaa's controller dispatcher hit 1,000 lines. Every new feature meant more conditionals in the same file. Replaced it with domain-specific routers, each implementing a two-method interface: does this router support this request, and if so, handle it.

The result: small, testable classes with clear boundaries. New domains are additive. No existing code changes.

https://jonesrussell.github.io/blog/waaseyaa-domain-routing-architecture/
