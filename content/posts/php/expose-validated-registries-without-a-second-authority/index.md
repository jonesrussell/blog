---
categories:
    - php
date: 2026-11-01T00:00:00Z
draft: false
slug: expose-validated-registries-without-a-second-authority
summary: Let provider factories consume a validated registry without rebuilding it, overriding it, or reading it before composition finishes.
tags:
    - php
    - architecture
    - dependency-injection
    - testing
title: Expose validated registries without a second authority
---

Ahnii!

A framework can validate a registry during boot and still create a security problem if later consumers receive a different instance. Validation only protects the object that was actually validated.

This post covers a versioned Waaseyaa fix that exposed the kernel's role repository to provider factories. The pattern applies to permission catalogues, route snapshots, schema registries, and other boot-time authorities.

## Keep one owner for validated state

Waaseyaa service providers contribute roles and permissions during kernel boot. The kernel collects those contributions, validates them, and retains a role repository for runtime use.

Provider factories also need to resolve that repository. The dangerous shortcuts are easy to imagine:

- Build another repository from provider declarations.
- Let a sibling provider register its own repository binding.
- Resolve a partially composed repository during provider registration.
- Call contribution methods again after validation.

Each shortcut creates a second authority or changes the inputs after they were checked.

The fix kept ownership with the kernel. The provider service bus received a lazy accessor to the kernel's repository instead of a factory that could reconstruct it.

## Return nothing before composition is complete

Timing is part of the contract.

During provider registration, role contributions have not finished composing. Returning a repository at that point would expose incomplete or unvalidated state. The accessor therefore returns `null` before the kernel has completed catalogue composition.

After composition, provider boot hooks receive the exact repository retained by the kernel. The service bus does not synthesize a fallback.

This produces a useful lifecycle rule:

| Phase | Repository result |
| --- | --- |
| Provider registration | Unavailable |
| Catalogue collection and validation | Kernel-owned work in progress |
| Provider boot | Validated kernel instance |
| Runtime factory resolution | Same kernel instance |

Making the pre-composition state unavailable is better than returning an object that looks usable but has not crossed the validation gate.

## Give kernel authority precedence over provider bindings

A provider may try to register a binding for the same repository type. That binding must not replace the kernel authority.

The service bus checks the role repository type before consulting sibling providers. If the kernel accessor is absent or not ready, resolution returns `null`. It does not fall through to a provider-owned replacement.

That precedence rule matters because dependency injection containers often treat the nearest binding as authoritative. For validated infrastructure, ownership must be encoded explicitly. Registration order should not decide which security catalogue wins.

## Preserve identity, not only equivalent values

Two repositories can contain equal-looking roles and still represent different authority.

Identity proves that provider factories consume the object that passed kernel validation. Rebuilding an equivalent repository loses that proof and can hide timing bugs, stale data, or a second call to stateful contribution code.

The qualification used a provider whose `roles()` result changes on every call. The tests proved that:

- The contribution method was consulted exactly once.
- The repository was unavailable during registration.
- The provider received the kernel repository during boot.
- Repeated service resolution returned the same instance.
- A sibling replacement binding was ignored.

The stateful fixture is deliberate. A provider that always returns the same values would not expose an accidental second collection pass.

## Wire every construction path

The service bus was constructed in several kernel paths, including provider discovery, access-policy discovery, field-read installation, schedule registration, and query validation.

The fix passed the same lazy repository accessor through each path. Missing one construction site would create phase-dependent behavior where a factory resolves correctly in one subsystem and fails or falls back in another.

When you add a kernel-owned service to a shared resolver, search for every place that resolver is constructed. Test the identity and refusal rules through the public boot lifecycle, not only through a directly instantiated helper.

## Test authority as a lifecycle invariant

The important assertion is not simply that dependency resolution returns a repository. Test the full boundary:

1. Contributions are collected once.
2. Invalid grants fail before provider boot.
3. Pre-composition resolution returns nothing.
4. Post-composition resolution returns the validated object.
5. Provider bindings cannot replace it.
6. Every consumer receives the same identity.

Validated registries need both content checks and custody checks. Validate the catalogue, keep one owner, expose it only after composition, and preserve its identity everywhere it is consumed.

Baamaapii
