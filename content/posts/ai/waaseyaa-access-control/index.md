---
title: "Deny-unless-granted: access control in waaseyaa"
date: 2026-03-18
categories: [ai, php]
tags: [waaseyaa, php, claude-code, open-source]
series: ["waaseyaa"]
series_order: 5
series_group: "Main"
summary: "How waaseyaa's AccessPolicyInterface implements deny-unless-granted semantics with field-level access control — and how GitHub milestones kept it from scope-creeping."
slug: "waaseyaa-access-control"
draft: false
---

Ahnii!

> **Series context:** This is part 5 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). This post builds on the [entity system]({{< relref "waaseyaa-entity-system" >}}) from earlier in the series.

Access control is where frameworks make their most consequential design decisions. The choice between allow-unless-denied and deny-unless-granted isn't a style preference — it determines what happens when your policy logic has a gap.

Allow-unless-denied: if no policy explicitly denies access, it's granted. A gap in your policies is a hole.

Deny-unless-granted: if no policy explicitly grants access, it's denied. A gap in your policies is safe.

Waaseyaa uses deny-unless-granted. This post covers how that decision shapes the access control architecture and how Minoo implements it for indigenous-content filtering.

## AccessPolicyInterface

The access control contract:

```php
interface AccessPolicyInterface
{
    public function access(EntityInterface $entity, string $operation, AccountInterface $account): AccessResult;
    public function createAccess(string $entityTypeId, string $bundle, AccountInterface $account): AccessResult;
    public function appliesTo(string $entityTypeId): bool;
}
```

`appliesTo()` returns whether this policy is relevant to the given entity type. `access()` checks an existing entity and returns the decision: `AccessResult::allowed()`, `AccessResult::forbidden()`, or `AccessResult::neutral()`. `createAccess()` handles the create operation separately, since no entity exists yet — it receives the entity type ID and bundle instead.

The policy evaluator runs all registered policies that `appliesTo()` the given entity type. The rules:

- Any `forbidden()` result blocks access immediately, regardless of other policies.
- At least one `allowed()` result is required for access to be granted.
- If all applicable policies return `neutral()`, access is denied.

That last rule is the key one. Neutral is not "I have no opinion, default to allowed." Neutral is "this policy doesn't have a view on this case" — and without an explicit grant from somewhere else, the default is denial.

## Field-Level Access

Access policies apply at two levels: entity-level operations (read, create, update, delete) and field-level operations (view, edit).

The field-level API:

```php
interface FieldAccessPolicyInterface
{
    public function fieldAccess(
        EntityInterface $entity,
        string $fieldName,
        string $operation,
        AccountInterface $account,
    ): AccessResult;
}
```

A policy that implements both `AccessPolicyInterface` and `FieldAccessPolicyInterface` can restrict field access independently of entity access. An entity might be readable by an anonymous user, but certain fields — coordinates, personal information, restricted teachings — might require additional permissions to view.

This matters for Minoo. Teachings can be browsable by the public (entity-level view granted), but specific fields within a teaching might be restricted to community members (field-level view requires an authenticated account with community membership).

## Minoo's Language Access Policy

Minoo implements teaching-content access at the access control layer. The `TeachingAccessPolicy` applies to `teaching` and `teaching_type` entities:

```php
#[PolicyAttribute(entityType: ['teaching', 'teaching_type'])]
final class TeachingAccessPolicy implements AccessPolicyInterface
{
    public function appliesTo(string $entityTypeId): bool
    {
        return $entityTypeId === 'teaching' || $entityTypeId === 'teaching_type';
    }

    public function access(EntityInterface $entity, string $operation, AccountInterface $account): AccessResult
    {
        if ($account->hasPermission('administer content')) {
            return AccessResult::allowed('Admin permission.');
        }

        return match ($operation) {
            'view' => (int) $entity->get('status') === 1
                ? AccessResult::allowed('Published content is publicly viewable.')
                : AccessResult::neutral('Cannot view unpublished teaching.'),
            default => AccessResult::neutral('Non-admin cannot modify teachings.'),
        };
    }

    public function createAccess(string $entityTypeId, string $bundle, AccountInterface $account): AccessResult
    {
        if ($account->hasPermission('administer content')) {
            return AccessResult::allowed('Admin permission.');
        }

        return AccessResult::neutral('Non-admin cannot create teachings.');
    }
}
```

The deny-unless-granted semantics here are load-bearing. Unpublished teachings return `neutral()` for non-admins — and since no other policy grants access, the result is denial. If this policy has a bug that causes it to throw an exception, the exception propagates — but without this policy, access to teachings is denied by default, not granted. The architecture is safe-by-default.

This is also enforced at the search level. The NorthCloud search API is queried with `baseTopics = ['indigenous']` for all Minoo search requests. This is server-side enforcement, not a client-side filter. Users can't bypass it by constructing their own API calls to the search backend.

## Keeping Scope Contained

Access control is the subsystem most likely to expand beyond its original scope. A well-intentioned session working on `TeachingAccessPolicy` might notice that the search filtering could be more sophisticated — perhaps weighting results by cultural relevance, or implementing per-community topic restrictions. Both are real future requirements. Neither belongs in the access control milestone.

The GitHub milestone for the access control layer was scoped to: `AccessPolicyInterface`, the policy evaluator, field-level access, and two concrete policies for Minoo. The issue scope made the boundary explicit: search relevance weighting is a different milestone, a different issue.

When sessions drifted toward search sophistication — which they did, because the problems are adjacent and interesting — the issue scope was the correction mechanism. "That's out of scope for this issue, document it as a future issue and continue."

This is a real benefit of the issue-before-code workflow. The scope decision is made before the session starts, by a human, with full architectural context. Not during the session, by an AI agent that has been given momentum and finds adjacent problems compelling.

## The access-control Specialist Skill

The `waaseyaa:access-control` specialist skill carries:

- `AccessPolicyInterface` and `FieldAccessPolicyInterface` full method signatures and behavioral contracts
- The evaluator algorithm: forbidden wins, neutral defaults to deny, all-neutral is denial
- Policy registration — how policies are registered in the service container and discovered by the evaluator
- Common mistakes: implementing `access()` without a correct `appliesTo()` (evaluating all entities, expensive), returning `neutral()` when the intent was `forbidden()` (incorrect semantics), forgetting that anonymous users are non-nullable `AccountInterface` instances where `isAuthenticated()` returns false

The skill also flags the OR semantics issue for topic filtering. Merging a user's preferred topics with `baseTopics` using OR semantics — "show me Indigenous content OR cooking recipes" — undermines the indigenous-content filtering. The spec documents why this is unsafe and how the current implementation avoids it.

Sessions working on access control load this skill and get the full context. The mistake history in the skill represents real mistakes that happened in sessions before the skill existed.

Next: [JSON:API from framework to SPA: Waaseyaa's API layer](/waaseyaa-api-layer/).

Baamaapii
