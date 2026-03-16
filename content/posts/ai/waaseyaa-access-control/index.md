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
draft: true
---

Ahnii!

> **Series context:** This is part 3 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Catch up on [part 1]({{< relref "waaseyaa-intro" >}}) (overview) and [part 2]({{< relref "waaseyaa-entity-system" >}}) (entity system) before reading this.

Access control is where frameworks make their most consequential design decisions. The choice between allow-unless-denied and deny-unless-granted isn't a style preference — it determines what happens when your policy logic has a gap.

Allow-unless-denied: if no policy explicitly denies access, it's granted. A gap in your policies is a hole.

Deny-unless-granted: if no policy explicitly grants access, it's denied. A gap in your policies is safe.

Waaseyaa uses deny-unless-granted. This post covers how that decision shapes the access control architecture and how Minoo implements it for indigenous-content filtering.

## AccessPolicyInterface

The access control contract:

```php
interface AccessPolicyInterface
{
    public function applies(EntityInterface $entity, string $operation, ?UserInterface $user): bool;
    public function grants(EntityInterface $entity, string $operation, ?UserInterface $user): AccessResult;
}
```

`applies()` returns whether this policy is relevant to the given entity, operation, and user. `grants()` returns the decision: `AccessResult::allow()`, `AccessResult::deny()`, or `AccessResult::neutral()`.

The policy evaluator runs all registered policies that `apply()` to a given context. The rules:

- Any `deny()` result blocks access immediately, regardless of other policies.
- At least one `allow()` result is required for access to be granted.
- If all applicable policies return `neutral()`, access is denied.

That last rule is the key one. Neutral is not "I have no opinion, default to allowed." Neutral is "this policy doesn't have a view on this case" — and without an explicit grant from somewhere else, the default is denial.

## Field-Level Access

Access policies apply at two levels: entity-level operations (read, create, update, delete) and field-level operations (view, edit).

The field-level API:

```php
interface FieldAccessPolicyInterface extends AccessPolicyInterface
{
    public function appliesToField(FieldInterface $field, string $operation, ?UserInterface $user): bool;
    public function grantsField(FieldInterface $field, string $operation, ?UserInterface $user): AccessResult;
}
```

A policy can restrict field access independently of entity access. An entity might be readable by an anonymous user, but certain fields — coordinates, personal information, restricted teachings — might require additional permissions to view.

This matters for Minoo. Teachings can be browsable by the public (entity-level read granted), but specific fields within a teaching might be restricted to community members (field-level read requires authentication and community membership).

## Minoo's Language Access Policy

Minoo implements indigenous-content filtering at the access control layer. The `IndigenousContentPolicy` applies to entities with an `is_public` field set to false:

```php
class IndigenousContentPolicy implements AccessPolicyInterface
{
    public function applies(EntityInterface $entity, string $operation, ?UserInterface $user): bool
    {
        return $entity->getField('is_public')?->getValue() === false;
    }

    public function grants(EntityInterface $entity, string $operation, ?UserInterface $user): AccessResult
    {
        if ($user === null) {
            return AccessResult::deny('Anonymous users cannot access restricted content');
        }

        if (!$this->isCommunityMember($user)) {
            return AccessResult::deny('Content restricted to community members');
        }

        return AccessResult::allow();
    }
}
```

The deny-unless-granted semantics here are load-bearing. If this policy has a bug that causes it to throw an exception, the exception propagates — but without this policy, access to restricted content is denied by default, not granted. The architecture is safe-by-default.

This is also enforced at the search level. The NorthCloud search API is queried with `baseTopics = ['indigenous']` for all Minoo search requests. This is server-side enforcement, not a client-side filter. Users can't bypass it by constructing their own API calls to the search backend.

## Keeping Scope Contained

Access control is the subsystem most likely to expand beyond its original scope. A well-intentioned session working on `IndigenousContentPolicy` might notice that the search filtering could be more sophisticated — perhaps weighting results by cultural relevance, or implementing per-community topic restrictions. Both are real future requirements. Neither belongs in the access control milestone.

The GitHub milestone for the access control layer was scoped to: `AccessPolicyInterface`, the policy evaluator, field-level access, and two concrete policies for Minoo. The issue scope made the boundary explicit: search relevance weighting is a different milestone, a different issue.

When sessions drifted toward search sophistication — which they did, because the problems are adjacent and interesting — the issue scope was the correction mechanism. "That's out of scope for this issue, document it as a future issue and continue."

This is a real benefit of the issue-before-code workflow. The scope decision is made before the session starts, by a human, with full architectural context. Not during the session, by an AI agent that has been given momentum and finds adjacent problems compelling.

## The access-control Specialist Skill

The `waaseyaa:access-control` specialist skill carries:

- `AccessPolicyInterface` and `FieldAccessPolicyInterface` full method signatures and behavioral contracts
- The evaluator algorithm: deny wins, neutral defaults to deny, all-neutral is denial
- Policy registration — how policies are registered in the service container and discovered by the evaluator
- Common mistakes: implementing `grants()` without a correct `applies()` (evaluating all entities, expensive), returning `neutral()` when the intent was `deny()` (incorrect semantics), forgetting that anonymous users are represented as `null`, not a guest user object

The skill also flags the OR semantics issue for topic filtering. Merging a user's preferred topics with `baseTopics` using OR semantics — "show me Indigenous content OR cooking recipes" — undermines the indigenous-content filtering. The spec documents why this is unsafe and how the current implementation avoids it.

Sessions working on access control load this skill and get the full context. The mistake history in the skill represents real mistakes that happened in sessions before the skill existed.

Next: the API layer that exposes entities to the outside world, and how the Nuxt 3 admin SPA consumes it.

Baamaapii
