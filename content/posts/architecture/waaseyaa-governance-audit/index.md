---
title: "The audit that started everything: how Waaseyaa designed an invariant-driven architectural review"
date: 2026-04-01
categories: ["architecture"]
tags: ["architecture", "platform", "php", "governance"]
summary: "How the Waaseyaa framework designed and ran a formal invariant-driven audit across 52 packages, what it found, and how those findings were turned into a dependency-ordered eight-milestone remediation program."
slug: "waaseyaa-governance-audit"
series: ["waaseyaa-governance"]
series_order: 1
draft: false
---

Ahnii!

This is Part 1 of the [Waaseyaa Governance series]({{< relref "waaseyaa-governance" >}}). It covers how [Waaseyaa](https://github.com/waaseyaa/framework) — a PHP framework monorepo of 52 packages — ran a formal invariant-driven architectural audit, what it found across five concern passes, and how [Milestone 2](#from-findings-to-a-program-m2) turned those findings into the eight-milestone remediation program covered in Part 2.

## Prerequisites

- Familiarity with PHP Composer package mechanics (`extra`, `autoload`, provider discovery)
- Comfort reading GitHub issue-driven governance workflows
- No prior knowledge of Waaseyaa required

## What Drift Looks Like at Scale

Waaseyaa is a PHP framework organized into a 7-layer architecture across 52 Composer packages. The layers run from L0 (foundation infrastructure) up through L6 (interfaces — the admin SPA, SSR, and other user-facing surfaces). The constraint that makes the model useful is simple: packages may only import from their own layer or lower. Upward communication must go through sanctioned seams.

That constraint is easy to state and hard to maintain. Feature work happens fast. A developer needs something from a higher layer, adds a dependency, moves on. A provider needs access to a kernel-composed service, reconstructs it locally instead. A CLI command gets implemented, never wired into the registered console surface. None of these are catastrophic individually. Over time they accumulate into a codebase where the architectural model and the actual dependency graph have quietly diverged.

The standard response is ad hoc cleanup: fix things as you notice them, add notes to the CLAUDE.md, hope the team remembers. That works up to a point. It stops working when the divergence is widespread enough that you cannot trust the layer model as an enforceable invariant. At that point you need an audit — not as a one-time cleanup, but as a structured baseline that everything downstream can depend on.

## Designing the Audit Before Running It

The critical decision in [#817](https://github.com/waaseyaa/framework/issues/817) was to freeze the audit's vocabulary before the first finding was written.

The concern model was frozen:

- `boundaries` — package dependency edges and layer violations
- `contracts` — interface and API contract gaps
- `testing` — harness coverage and test quality
- `docs-governance` — specification drift and documentation alignment
- `dx-tooling` — developer experience and build tooling gaps

The layer model was frozen: L0-foundation through L6-interfaces, plus cross-layer for concerns that span multiple layers.

The closed vocabularies were frozen: subsystem taxonomy (14 values), severity (critical / high / medium / low), remediation class (8 values: invariant-break, contract-gap, coverage-gap, governance-drift, docs-drift, tooling-gap, cleanup-candidate, framework-uplift), audit phase, and evidence sources.

These are not just taxonomies. They are constraints on the audit's own output. A finding that does not fit one of the frozen remediation classes cannot be created. An issue with an ad hoc severity value is invalid. The vocabulary freeze meant every finding would be comparable, sortable, and clusterable without disambiguation work later.

The scope was equally constrained:

> - Framework repository only
> - No downstream consumer apps
> - No remediation work
> - No finding issues until each pass rubric is stable

That last rule matters most. Finding issues were blocked until the pass rubric — the set of questions each pass would ask and the evidence format it would use — was stable. Without that gate, early findings would have been written under different assumptions than later ones, making the inventory inconsistent before M2 tried to cluster it.

## Five Passes, Fixed Order

M1 ran five passes sequentially. Each pass had its own concern, its own subsystem focus, and its own pass issue that owned the rubric before findings were created.

| Pass | Concern | Focus |
|------|---------|-------|
| M1-boundaries | Package dependency edges and layer violations | L0–L6 layer graph |
| M1-contracts | Interface and API contract gaps | Public surface correctness |
| M1-testing | Harness coverage and test quality | Foundation, kernel, integration |
| M1-docs-governance | Specification drift | Specs vs. implementation alignment |
| M1-dx-tooling | Developer experience gaps | CLI, build tooling, console surface |

The order was intentional. Boundary violations had to be catalogued first because contracts, testing, and docs findings often depend on knowing which package boundaries are already broken. You cannot reason about whether a contract is correctly expressed if the package expressing it is importing from the wrong layer.

## What M1 Found

M1 produced 36 finding issues (#823 through #858). A sample across concerns shows the range of what the audit captured.

**Boundary violations were the most severe class.** [#823](https://github.com/waaseyaa/framework/issues/823) caught a direct upward dependency in the API layer:

> The API package declares waaseyaa/ssr as a package dependency even though the documented architecture places api in Layer 4 and ssr in Layer 6.
>
> **Evidence:** `packages/api/composer.json` lines 39–50 declare `../ssr` and require `waaseyaa/ssr`

That is not an ambiguous finding. The layer model says Layer 4 cannot depend on Layer 6. The Composer manifest says it does. Remediation direction: untangle the dependency before treating the layer table as an enforceable invariant.

**Some findings were subtler topology problems.** [#824](https://github.com/waaseyaa/framework/issues/824) caught a representation mismatch rather than a dependency edge:

> CLAUDE.md lists admin in the Layer 6 package table, while `packages/admin` is a Node/Nuxt workspace with `package.json` and no `composer.json`.

The admin SPA exists outside the Composer package graph entirely. Any mechanical boundary check that reads from `vendor/composer/installed.json` cannot see it. The finding was not that admin was in the wrong layer — it was that the layer model's topology representation was inconsistent about what counts as a package. Remediation direction: clarify whether the layer model governs all repo workspaces or only Composer packages, then align the representation accordingly.

**Hidden composition roots were flagged as invariant breaks.** [#831](https://github.com/waaseyaa/framework/issues/831) found the admin-surface provider reconstructing core security wiring from manifest storage rather than consuming a kernel-composed service:

> `AdminSurfaceServiceProvider` loads `storage/framework/packages.php`, rebuilds a `PackageManifest`, instantiates `AccessPolicyRegistry`, and reconstructs an `EntityAccessHandler` for its host wiring.

The architecture reserves cross-layer orchestration for the kernel composition root. An interface-layer provider that rebuilds access-policy wiring independently is a hidden composition root — one that will silently diverge from the kernel's version over time. Remediation direction: consume a kernel-composed access service or explicitly model admin-surface access bootstrapping as a sanctioned seam.

**The testing pass found brittleness in the harness itself.** [#845](https://github.com/waaseyaa/framework/issues/845) found foundation kernel tests coupled to implementation detail:

> `packages/foundation/tests/Unit/Kernel/HttpKernelTest.php` repeatedly uses `ReflectionMethod`, `ReflectionProperty`, and `setAccessible()` to invoke private methods and mutate internal kernel state.

Tests that reach private state through reflection are not testing invariants — they are testing implementation. They pass when the internal structure is intact and fail when it is refactored, regardless of whether the public behavior changed. The audit classified this as a `cleanup-candidate` with medium severity: real technical debt, but not an invariant break.

**The DX tooling pass found phantom CLI commands.** [#858](https://github.com/waaseyaa/framework/issues/858) found a gap between what was implemented and what was reachable:

> Implemented command classes exist for `queue:work`, `queue:failed`, `queue:retry`, `queue:flush`, `schedule:run`, `schedule:list`, `scaffold:auth`, and `telescope:validate` under `packages/cli/src/Command/*`. `php bin/waaseyaa list --raw` does not expose any of those commands.

The operations playbooks documented these commands as operational workflows. The actual CLI surface did not expose them. Any operator following the playbook would find their commands missing. This was classified as `tooling-gap` with high severity: the gap between documented and actual behavior was wide enough to cause operational incidents.

## From Findings to a Program: M2

With 36 findings across five concerns, the question M2 had to answer was: how do you turn an inventory of problems into a sequence of work that closes them without creating new ones?

[#859](https://github.com/waaseyaa/framework/issues/859) defined the M2 scope:

> - cluster M1 findings #823–#858 into remediation themes
> - derive a dependency-ordered remediation graph
> - identify cross-layer sequencing constraints
> - define uplift phases that preserve architectural invariants
> - produce a milestone-ready remediation roadmap

Clustering findings into themes meant grouping by what needed to be stable before something else could be fixed. The boundary violations could not be the last thing addressed — they had to come first, because contract, testing, and governance work all depended on a stable layer model. The CLI tooling gaps could not be fixed before the kernel bootstrap paths that should have wired those commands were themselves corrected.

M2 produced the eight-milestone structure: M3 (architectural base recovery), M4 (public-surface unification), M5 (verification lock-in), M6 (governance alignment), M7 (workflow ergonomics), M8 (implementation-surface alignment). Each milestone consumed its predecessor's outputs as fixed inputs. Each had sequencing constraints that prevented it from reaching into territory that belonged to a later milestone.

The dependency ordering was not arbitrary. It followed from the finding inventory. Boundary violations in M3 had to stabilize before M4 could unify public surfaces — you cannot unify contracts across a broken layer graph. M5 verification lock-in depended on M4's stable surfaces to verify against. The chain was determined by the findings, not by preference.

## The Governance Scaffold

The two-artifact pattern that every milestone used — a bootstrap gate and an execution umbrella — was itself a finding from M2's synthesis work. A remediation program that does not constrain its own scope will drift. Each milestone needs an explicit statement of what it can and cannot touch before execution starts.

The bootstrap gate restates the dependency prerequisites, sequencing constraints, and exit criteria before any track begins. It is not a planning document — it is an activation gate. A milestone that cannot satisfy its bootstrap gate does not start.

The execution umbrella owns the tracks and holds the exit criteria. When the umbrella's exit criteria are satisfied, the milestone closes. Nothing else triggers closure.

Together, the two artifacts make the program self-describing and self-constraining. Any reviewer reading the issue chain can see what each milestone was allowed to do, what it actually did, and whether its exit criteria were met — without reading the code.

That structure carried the program from M3 through M8. Part 2 covers how it ran, how it closed, and what it handed off to conformance work.

Baamaapii
