---
categories:
    - go
date: 2026-08-30T00:00:00Z
devto: true
devto_id: 4532129
draft: false
slug: publishing-a-versioned-api-contract
summary: How goformx freezes, packages, and checksums its OpenAPI contract so external clients can pin to a specific, verifiable release instead of a moving branch.
tags:
    - go
    - api
    - openapi
    - api-design
title: Publishing a versioned API contract you can actually trust
---

Ahnii!

If you ship a public API, you eventually hit the same question from every client: "what exactly am I integrating against, and will it change under me?" [goformx](https://github.com/goformx/goformx), a Go forms service, answers with a generated OpenAPI contract that gets frozen, checksummed, and published as its own release artifact, separate from the application's version tags. Here's how that pipeline works: the CI drift check, the release packaging script, and the rules the published docs give clients for staying compatible.

## The problem: generated code that quietly goes stale

goformx generates its TypeScript client types from an OpenAPI 3.1 spec using `openapi-typescript`. Generated files are easy to forget to regenerate after an API change, and once that happens, the published client silently disagrees with the server. The fix is a CI gate that fails the build if generated artifacts don't match a clean regeneration — `goforms/contracts/check-generated.mjs`:

```js
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
execFileSync("git", ["diff", "--exit-code", "--", "contracts/generated"], { cwd, stdio: "inherit" });
const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", "contracts/generated"], { cwd }).toString().trim();
if (untracked) throw new Error(`Generated artifacts must be committed:\n${untracked}`);
```

It regenerates the contract, then checks two things: no diff against what's committed, and no new untracked files under `contracts/generated`. Either failure means someone changed the API without regenerating and committing the client types.

## Packaging a frozen release

Passing CI isn't the same as being safe to integrate against — `main` still moves. goformx solves that with `package-release.mjs`, which turns a specific commit into an immutable, checksummed bundle:

- **Refuses a dirty tree.** It runs `git status --porcelain` first and throws if there are uncommitted changes — only a clean, verified commit gets packaged.
- **Hashes committed bytes, not a checkout.** It reads file contents with `git show HEAD:<path>` instead of the filesystem, so a contributor's line-ending settings can't change the published SHA-256.
- **Requires an explicit semantic version.** It reads `info.version` out of the generated `openapi.json` and rejects anything that isn't `MAJOR.MINOR.PATCH`.
- **Builds a manifest of content-addressed URLs.** Each artifact (OpenAPI spec, form-definition schema, auth assertion schema, generated client types, example archive) gets a `raw.githubusercontent.com/<repo>/<exact-commit-sha>/...` URL plus its own SHA-256, so a client can verify what it downloaded actually matches that commit.
- **Never touches the network.** The script only writes files to a local, git-ignored `.contract-release/` directory — publishing the GitHub release is a separate, deliberate step.

That last point matters: packaging and publishing are decoupled on purpose, so building the artifact can't accidentally ship it.

## What clients are told to do with it

The published guide, `docs/api-clients.md`, gives external integrators (including the project's own agent tooling) a discovery list rather than a single "latest" link:

- Current release tag, manifest, OpenAPI download, client example archive, and `SHA256SUMS`
- Links to the **previous** frozen versions (so a client mid-migration isn't stranded)
- A pointer to the **current development contract** on `main`, explicitly labeled as not immutable

The guidance is blunt about the distinction that matters most: a published contract describes the *interface*, not the *deployment state* of any given server. Clients are told to confirm the target deployment actually supports the pinned version before integrating — a frozen spec is not proof anything is live.

## The credential model, at a glance

The same doc lays out three credential types and where each is allowed to live:

| Credential | Where it belongs | Authority |
| --- | --- | --- |
| `gfpk_` public form key | Browser embeds and public submission clients | Published schema/submission access only; never management access |
| `gfst_` service token | External agents and custom-dashboard servers, in secret custody | One organization, explicit scopes, expiry and revocation |
| First-party assertion (`gofx-fpa+jwt`) | Server-to-server request only | Verified user and resolved organization; signed, audience-bound, single-use, at most **60 seconds** |

Every management operation also declares its own `x-goformx-required-scopes` in the spec — **eight scopes total** (`forms:read/write/publish`, `submissions:read`, `tokens:read/write`, `webhooks:read/write`). Write access doesn't implicitly grant publish access. Reading submissions doesn't implicitly grant webhook configuration.

## Semantics that outlive any one endpoint

A few rules from the contract are the kind of thing that usually gets documented only after someone gets bitten by their absence:

- **Additive fields need an explicit contract bump.** Contract **1.1.0** added a stored `allowedOrigins` array to form responses. The docs are explicit that an empty array means no cross-origin grant — never treat it as a wildcard — and that older servers omitting the field entirely is not the same as an empty configuration.
- **Numeric precision is a first-class guarantee.** Contract **1.1.1** states that schemas and submission values retain numeric precision, with published token/exponent/decimal-place budgets, because JSONB storage can normalize spelling but must not normalize value.
- **Concurrency is ETag-based.** Metadata `PATCH` requires the ETag from a current `GET` in `If-Match`; a `428` means fetch a fresh validator, a `412` means reconcile before retrying.
- **Idempotency keys are retry-scoped, not create-scoped.** Public submissions require one; management creation has no general idempotency contract, so an uncertain create/publish response has to be reconciled rather than blindly retried.

## The release checklist

Maintainers publish a new frozen contract with a fixed sequence:

1. Bump `info.version` for a new contract — never republish an existing version. Regenerate, verify, and commit source and generated files.
2. Run the packaging script from `goforms/`, which writes the manifest, OpenAPI copy, checksums, and client archive to the ignored release directory without any network call.
3. Create a `contract-vVERSION` tag at that exact commit and attach the four files to its GitHub release (not an application `v*` tag — contract releases are versioned independently).
4. Download the published artifacts anonymously, verify the SHA-256 digests and commit-pinned URLs, and run the example client against them.
5. Update the discovery doc for the new version, keeping the prior versions' links live.

Separating the contract's version from the application's version, and verifying the published artifact anonymously after the fact, closes the gap between "we merged it" and "an outside client can safely depend on it."

Baamaapii
