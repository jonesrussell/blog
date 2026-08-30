# Social copy: Publishing a versioned API contract you can actually trust

Canonical URL: https://jonesrussell.github.io/blog/publishing-a-versioned-api-contract/

## Bluesky

How goformx freezes its OpenAPI contract: a CI gate that fails on stale generated types, then a packaging script that hashes committed bytes and writes a checksummed, content-addressed release. https://jonesrussell.github.io/blog/publishing-a-versioned-api-contract/ #buildinpublic

## LinkedIn

Public API, permanent question from clients: what exactly am I integrating against, and will it move under me.

goformx answers that by treating the OpenAPI contract as its own release artifact, separate from the application version.

A CI check regenerates the client types on every build and fails if the committed files do not match, or if new generated files were never committed. That closes the most common failure mode: an API change that ships without its generated client keeping up.

Publishing a version goes further. A packaging script refuses to run on a dirty git tree, reads file contents straight from the commit instead of the working copy so platform line endings cannot change a hash, and requires an explicit semantic version before it will build anything. The output is a manifest of content-addressed URLs, each pinned to the exact commit SHA, plus SHA256 checksums for every artifact. No network calls happen during packaging. Publishing the release is a separate, deliberate step.

The published docs then draw a line that is easy to skip: a frozen contract describes the interface, not whether any given server has actually been upgraded to it. Clients are told to confirm deployment compatibility before integrating.

Full writeup covers the credential model, the additive versioning rules for fields like allowed origins, and the five-step release checklist.

https://jonesrussell.github.io/blog/publishing-a-versioned-api-contract/

#api #golang #softwarearchitecture #apidesign #softwaredevelopment

## Facebook

How do you let external clients trust a specific version of your API without trusting a moving branch? goformx packages its OpenAPI contract as its own checksummed release, separate from the app version. A CI gate catches generated client code that drifts from the spec, and the packaging script hashes committed bytes, refuses a dirty git tree, and builds content-addressed URLs pinned to the exact commit. New post walks through the drift check, the release script, and the rules published for clients staying compatible.

https://jonesrussell.github.io/blog/publishing-a-versioned-api-contract/

#api #softwareengineering
