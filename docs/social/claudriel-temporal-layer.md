# Social copy: Building a temporal layer so your AI never lies about time

**Canonical URL:** https://jonesrussell.github.io/blog/claudriel-temporal-layer/

## Facebook

Built a temporal subsystem for my AI ops system. Seven PHP classes that pin time per request, resolve timezones from context, and check clock drift before letting agents reason about your schedule. No more scattered DateTime calls. https://jonesrussell.github.io/blog/claudriel-temporal-layer/

## X (Twitter)

Built a temporal layer for my AI system: pin time once per request, resolve timezones from context, detect clock drift before agents reason about your schedule. Seven classes, zero dependencies. https://jonesrussell.github.io/blog/claudriel-temporal-layer/

## LinkedIn

When your AI assistant reasons about schedules and commitments, sloppy time handling means sloppy advice. I built a temporal subsystem for Claudriel that captures time atomically per request, resolves timezones from workspace and account context, and monitors clock health before letting temporal agents make decisions. Seven classes, fully injectable and testable. https://jonesrussell.github.io/blog/claudriel-temporal-layer/
