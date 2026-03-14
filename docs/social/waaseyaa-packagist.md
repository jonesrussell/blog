# Social copy: Publishing a PHP monorepo to Packagist with splitsh-lite

**Canonical URL:** https://jonesrussell.github.io/blog/waaseyaa-packagist/

## Mastodon / Bluesky

Tried to publish a 38-package PHP monorepo to Packagist and discovered "just publish it" doesn't work when every subpackage uses @dev path repositories. Here's how splitsh-lite solved it — monorepo dev workflow stays the same, Packagist gets individual versioned packages.

https://jonesrussell.github.io/blog/waaseyaa-packagist/

## X (Twitter)

How do you publish a 38-package PHP monorepo to Packagist? splitsh-lite splits each package on tag, pushes to mirror repos, done in 2 minutes. https://jonesrussell.github.io/blog/waaseyaa-packagist/

## LinkedIn

Publishing a PHP monorepo to Packagist isn't as simple as registering the root package. When your framework has 38 subpackages with internal dependencies, you need a strategy. We evaluated four approaches and landed on splitsh-lite — it preserves the monorepo as the single development environment while giving Packagist individually versioned packages. Full breakdown of the process.

https://jonesrussell.github.io/blog/waaseyaa-packagist/
