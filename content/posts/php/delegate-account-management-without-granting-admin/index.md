---
categories:
    - php
date: 2026-10-31T00:00:00Z
devto_id: 4952730
draft: false
slug: delegate-account-management-without-granting-admin
summary: Add narrowly scoped account-management authority without handing a service role every power carried by an administrator permission.
tags:
    - php
    - authorization
    - security
    - testing
title: Delegate account management without granting admin
---

Ahnii!

A staff member may need to update accounts in one approved roster without gaining every power carried by an administrator role. That is a delegation problem, not a reason to widen the administrator boundary.

This post covers a versioned Waaseyaa authorization change that added consumer-scoped account management, then narrowed it through review. The useful pattern is to delegate exact decisions while keeping privileged fields, account creation, deletion, and credentials behind their existing boundaries.

## Start with the authority you actually need

A broad permission such as `administer users` can authorize much more than the workflow requires. It may cover role changes, account deletion, and targets outside the consumer's roster.

Write down the smaller decision instead:

- Which authenticated actor may act?
- Which exact account may they update?
- Which operation may they perform?
- Which fields must remain unavailable?
- What evidence binds the target to the consumer's scope?

The framework extension introduced an optional delegate inside the canonical user access policy. The consumer supplies the roster and consent decision. The framework continues to compose the final authorization result.

Without a delegate binding, the old refusal remains. This makes delegation an explicit application choice instead of a new default permission.

## Pass immutable authorization input

The delegate receives an authenticated authorization principal and the exact target account. It does not receive a mutable account object that application code can alter before asking for a decision.

That distinction matters in retained workers and long-running processes. Authorization should depend on a snapshot of identity, roles, and permissions for the current request. It should not retain an actor from an earlier request.

The provider-discovery tests exercised both bound and unbound policies. They also sent different actors through the same retained handler and then returned to the first actor. That proves the delegate binding survives discovery without turning request identity into service state.

Direct legacy callers still pass through a runtime type guard. An authenticated object is not enough. Delegated decisions require the immutable principal contract.

## Keep creation behind a separate intake boundary

The first version of the delegate included an actor-only account creation decision. Review removed it.

An actor-only predicate can prove that a clerk is generally trusted, but it cannot prove that this new account belongs to an approved roster entry or verified consent record. There is no target yet, so the most important subject of the decision is missing.

The hardened design keeps generic account creation administrator-only. Consumer creation needs a separate provisioning boundary with an explicit approved-intake reference.

This is a useful review question for any delegated API: **does the method receive enough evidence to authorize the thing it creates?** If it receives only the actor, it may be too broad for the workflow it claims to protect.

## Do not release privileged fields

Permission to update an account does not imply permission to edit every account field.

The delegate cannot authorize edits to:

- Roles or permissions
- Email verification state
- Password or legacy password material
- Two-factor secrets and recovery data
- Session-generation data
- Generic active-status fields
- Account deletion

Those restrictions stay in the canonical field and entity policies. A consumer cannot bypass them by returning `true` from its delegate.

The initial candidate allowed delegated active-status edits through the generic field surface. The integrated behavior moved that change to a dedicated lifecycle operation. This is the safer boundary because disabling an account has a required side effect: existing sessions must be revoked.

## Couple status changes to session revocation

The account lifecycle service checks two independent decisions before changing status:

1. The actor may update this exact target.
2. The actor may perform the dedicated active-status operation.

It also refuses self-administration through this path.

When disabling an account, the service increments the session generation and changes the active flag before one repository save. Existing sessions bound to the previous generation become invalid with the same durable write that disables the account.

Re-enabling the account does not restore the old generation. An unchanged status produces no write, and an exhausted generation counter fails instead of wrapping.

That is why the generic field write was not enough. A security-sensitive state change belongs behind the operation that can enforce all of its invariants.

## Test the refusals as part of the contract

The useful tests are not limited to the admitted clerk and target. They also prove that the boundary refuses:

- Another actor
- Another target
- Anonymous input
- A mutable legacy account object
- Account creation without approved intake
- Privileged and credential fields
- Deletion
- Status changes without both delegate decisions
- Self-disable through the lifecycle service

Keep those negative cases beside the success path. They describe the authority the delegate does not have, which is the most important part of a narrow delegation contract.

Delegation works when it adds one bounded capability without creating a second administrator role. Pass immutable request identity, bind decisions to exact targets, keep creation tied to verified intake, and route security-sensitive mutations through services that enforce their required side effects.

Baamaapii
