# Social copy: Splitting Anokii into composable core, identity, and operator packages

**Canonical URL:** https://jonesrussell.github.io/blog/anokii-composable-packages/

## Bluesky

Anokii split duplicate identity code out of its monorepo into composable core, identity, and operator packages, published by a governed CI split gated on tests and an exact commit SHA. https://jonesrussell.github.io/blog/anokii-composable-packages/ #php #architecture

## LinkedIn

Anokii used to carry its own duplicated identity code instead of one canonical implementation. Here is how it got split into three composable Composer packages, core, identity, and operator, using path repositories for fast local development and a governed CI workflow that gates every split on an exact commit SHA and a green test suite before splitsh-lite pushes a history preserving mirror. No tags, no releases, just a verified boundary. https://jonesrussell.github.io/blog/anokii-composable-packages/ #php #softwarearchitecture #composer #monorepo #cicd

## Facebook

How do you split a monolith into standalone packages without losing git history or shipping something CI never verified. Anokii's answer: Composer path repositories for local dev, splitsh-lite in CI, and a workflow that refuses to run unless the exact commit already passed tests. https://jonesrussell.github.io/blog/anokii-composable-packages/ #php #opensource
