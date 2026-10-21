---
categories:
    - php
date: 2026-10-21T00:00:00Z
devto: true
devto_id: 4889741
draft: false
slug: test-machine-publishers-real-tools
summary: Prove a machine publisher has the permissions it needs, and no broader authority, by exercising the registered tools it will actually call.
tags:
    - php
    - testing
    - security
    - waaseyaa
title: Test machine publishers through their real tools
---

Ahnii!

A machine publisher can look least-privileged on paper and still be wrong in both directions. It may carry an administrative permission it never needed, or it may fail in production because a lower-level framework check requires a capability nobody included.

The useful test is not a list of permission strings. It is the real publishing workflow, executed through the same registered tools and authorization handler the machine will use in production.

A recent [RHT Circle publishing change](https://github.com/jonesrussell/rhtcircle/commit/fd3d3dfba378cc29682ec04ee1f4cb4682d6dca1) provides a compact example. The application has an automated article publisher. It can create drafts, publish and retract articles, and upload images. It must not administer every node or media item, create unrelated content, or let anonymous callers use the same tools.

## Start with the workflow, not the role name

Calling an account `ArticlePublisherAccount` does not constrain it. The account is constrained by the exact permissions it answers `true` for and by every check reached during the workflow.

The publisher needs an application capability plus a small set of framework permissions:

```php
return in_array($permission, [
    ArticleContentType::CAPABILITY,
    NodePermissions::ACCESS_CONTENT,
    NodePermissions::create('article'),
    NodePermissions::editAny('article'),
    NodeAccessPolicy::PUBLISH_PERMISSION,
    MediaPermissions::ACCESS,
    MediaPermissions::VIEW_OWN_UNPUBLISHED,
    MediaPermissions::create('image'),
], true);
```

This is broader than one custom `publish article` flag, but much narrower than node or media administration. It also exposes an important detail: least privilege is a property of the whole call path. A high-level tool may be article-specific while its repository, entity policy, or asset service performs additional checks underneath.

Guessing those dependencies produces a frustrating loop of production failures and permission additions. Exercising the real tools turns the dependencies into evidence.

## Make authorization a required dependency

Optional security dependencies are dangerous. If a publisher can be constructed without its authorization handler, a missing service registration may silently disable the check you meant to enforce.

The RHT Circle provider changed the handler from optional to required:

```php
$accessHandler = $this->resolve(EntityAccessHandler::class);

if (!$accessHandler instanceof EntityAccessHandler) {
    throw new RuntimeException(
        'Article publishing requires entity authorization.'
    );
}
```

That failure belongs at construction time. An application that cannot assemble the authorization boundary should not build a degraded publisher and hope each later call remembers to compensate.

This gives the system a simple invariant: if the publishing service exists, authorization exists with it.

## Scope protected reads to the content the tool owns

Draft and revision workflows need read access that anonymous visitors should not have. The tempting shortcut is a broad content-administration grant. A better boundary is a protected read policy that checks all four relevant facts:

- the entity type is `node`;
- the bundle is `article`;
- the operation is `view` or `view_revision`;
- the principal holds the article publishing capability.

Every other case returns neutral rather than allowed. That matters because an application can combine several policies. This policy contributes one narrow grant without pretending to decide access for unrelated bundles or operations.

The follow-up [contract tightening](https://github.com/jonesrussell/rhtcircle/commit/399a45d4c10379020be2be564f38a781be9e5996) also made the provider's return type non-nullable. Once the application promises to provide this protected read policy, its type signature should say so. A nullable contract would preserve an impossible state and make callers defend against a missing policy that the implementation always requires.

## Test the registered tool set

Unit tests for `hasPermission()` are useful, but they do not prove that the publisher can complete its job. The stronger acceptance test boots the application, resolves the actual tool registry, and calls the production tool implementations.

The RHT Circle test performs this sequence:

1. Assert the machine principal lacks node administration, media administration, page creation, and document creation.
2. Call `article.createDraft` with a complete synthetic article.
3. Confirm the draft exists and is not published.
4. Confirm an anonymous user cannot view that draft.
5. Call the same create tool as an anonymous user and require an error.
6. Publish the article through `article.publish`.
7. Retract it through `article.unpublish`.
8. Upload a real one-pixel PNG through `asset.upload` and confirm the detected media type.

This test proves positive and negative behavior together. The publisher can do its assigned work, while nearby administrative and cross-bundle powers remain absent.

It also catches wiring failures that permission unit tests cannot see. A tool may be registered under the wrong name. The container may omit the access handler. A repository may apply a bundle permission that the machine account lacks. An asset upload may reach a media policy that was never considered when the article capability was designed.

## Advance the claims generation when authority changes

Permission changes can outlive a process when authorization claims are cached. RHT Circle changed its claims generation marker from `rhtcircle-article-publisher-v1` to `v2` at the same time as the grants changed.

The exact invalidation mechanism will differ by system, but the rule is general: if cached claims describe what a principal may do, changing that authority must invalidate the old description. Otherwise a correct deployment can continue operating with stale access until an unrelated expiry or restart.

Treat the claims generation as part of the authorization contract, not release bookkeeping.

## A practical acceptance contract

For any service account or machine publisher, the acceptance test should prove four things:

| Boundary | Proof |
| --- | --- |
| Required authority | Every supported workflow succeeds through the real registered tools |
| Refused authority | Administrative, unrelated-bundle, and anonymous operations remain denied |
| Mandatory wiring | The service cannot be constructed without its authorization dependency |
| Claim freshness | Permission changes invalidate previously cached claims |

This is more reliable than reviewing a role definition in isolation. The account, tool registry, service container, repository, entity policies, and media policies all participate in the result.

Least privilege is not the shortest permission list. It is the smallest authority that survives the real workflow, backed by tests that also prove where the authority stops.

Baamaapii
