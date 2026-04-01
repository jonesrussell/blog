---
title: "The conformance engine: how Waaseyaa brings code into alignment with its canonical model"
date: 2026-04-01
categories: ["architecture"]
tags: ["architecture", "platform", "php", "governance"]
summary: "How Waaseyaa built a governed conformance engine after completing remediation: freezing a canonical model, classifying drift, building an execution DAG, and running batch-driven refactors with invariant verification at every step."
slug: "waaseyaa-governance-conformance"
series: ["waaseyaa-governance"]
series_order: 3
draft: true
---

Ahnii!

This is Part 3 of the [Waaseyaa Governance series]({{< relref "waaseyaa-governance" >}}). [Part 2]({{< relref "waaseyaa-governance-remediation" >}}) covers how the eight-milestone remediation program ran and closed. This post covers what came next: a governed conformance engine that brings the actual codebase into alignment with the authoritative model the program produced.

## The Gap Remediation Leaves Behind

When the remediation program closes its exit-gate, findings are resolved and the outputs are locked as fixed inputs. But the codebase has not been systematically compared against those outputs. Packages may still declare incorrect layer membership. Provider discovery may still have inconsistencies. The authoritative model exists — it just has not been enforced yet.

Conformance is that enforcement. It is not another audit. The [M9 draft (#978)](https://github.com/waaseyaa/framework/issues/978) draws the line explicitly:

> M9 is not another audit and must not reclassify M1 findings. M9 must not mutate the M3–M8 backlog structures. M9 may plan conformance work but must not introduce new audit surfaces.

Five drift classes define everything M9 can see:

- **missing alignment** — a surface that should exist per the canonical model but does not
- **stale implementation path** — code that once served a purpose but is no longer canonical
- **duplicate surface** — two competing implementations of the same concern
- **invalid fallback path** — a fallback that bypasses the canonical resolution path
- **locked-surface violation** — a modification to a surface the program declared locked

Nothing outside that taxonomy can be recorded. The constraint keeps conformance from silently becoming a second audit.

## M9: Six Tracks, Fixed Order

M9 runs six planning tracks in a deterministic sequence. None apply code changes.

| Track | Issue | Output |
|-------|-------|--------|
| Authoritative extraction and canonical source freeze | [#981](https://github.com/waaseyaa/framework/issues/981) | Frozen canonical model |
| Codebase comparison and seam-by-seam conformance scan | [#983](https://github.com/waaseyaa/framework/issues/983) | Comparison baseline |
| Drift inventory and classification | [#982](https://github.com/waaseyaa/framework/issues/982) | Drift ledger |
| Dependency graph and conformance batch planning | [#984](https://github.com/waaseyaa/framework/issues/984) | Execution DAG |
| Conformance execution planning | [#986](https://github.com/waaseyaa/framework/issues/986) | Batch execution specs |
| Invariant verification and governance handoff planning | [#985](https://github.com/waaseyaa/framework/issues/985) | Verification harness |

Track 1 must complete before Track 2 can compare against anything. Track 3 waits for comparison output before classifying drift. Track 4 needs a drift inventory to sort before it can build a dependency graph. Tracks 5 and 6 are last because execution planning and verification requirements both depend on everything upstream.

The [M9 bootstrap (#980)](https://github.com/waaseyaa/framework/issues/980) locked the invariant boundary at the start:

> - this phase is governance-driven execution planning, not another audit
> - only implementation drift may be recorded
> - no M1 findings are modified
> - no M3–M8 backlogs are mutated

## Freezing the Canonical Model

Track 1 produced the artifact every downstream track depends on. [#987](https://github.com/waaseyaa/framework/issues/987) reconciled the two authoritative M8 outputs into one canonical conformance source and closed on 2026-03-31.

Without this freeze, comparison results depend on which version of the canonical model a reviewer had in mind. Drift classification becomes subjective. Execution batches shift. The conformance program becomes non-deterministic.

Once #987 closes, it is read-only for the rest of M9 and all of M10+. Every closure claim in every execution batch must be phrased as conformance to #987 — not as reinterpretation of implementation truth.

## Mapping the Gap

With a frozen canonical source, M9 moved through its comparison and planning tracks.

[#992](https://github.com/waaseyaa/framework/issues/992) defined the seam-by-seam comparison methodology: every package and every seam checked against the canonical source, deterministically, with no drift classified yet. Comparison produces a raw gap map, not a judgment.

[#991](https://github.com/waaseyaa/framework/issues/991) froze the drift ledger structure. The ledger is immutable once created. Execution batches close entries in it, but nothing modifies its structure or taxonomy. This prevents execution from silently redefining what drift means mid-run.

[#990](https://github.com/waaseyaa/framework/issues/990) defined the dependency DAG. Classified drift items have dependencies: you cannot normalize declaration semantics before fixing package-shape distortions. You cannot consolidate duplicate runtime surfaces before declarations are normalized. The DAG makes those dependencies explicit and locks execution order before a single refactor starts.

## The Batch Plan

[#984](https://github.com/waaseyaa/framework/issues/984) built the batch plan from the DAG:

| Batch | Focus | Drift items |
|-------|-------|-------------|
| D1 | Foundational alignment and surface-correction prerequisites | C16, C1–C6, C8 |
| D2 | Stale-path elimination and duplicate-surface removal | C7, C10–C14 |
| D3 | Fallback-path correction and semantic normalization | C9 |
| D4 | Support-surface and verification-consumer alignment | C15 |
| D5+ | Domain-specific residual cleanup slices | Residual post-D1–D4 |

D1 must complete before D2 because D2 consumes the normalized declaration and activation spine D1 establishes. D3 requires D1 complete and D2 complete enough to expose residual semantic inconsistencies. Each handoff condition is explicit in the batch spec.

[#986](https://github.com/waaseyaa/framework/issues/986) operationalized this into execution-ready definitions. Each batch declares its required codebase entry points, invariant guards derived from #987, rollback strategy, safe-commit boundaries, and closure evidence requirements. D1's rollback rule:

> each boundary must remain independently reversible without forcing downstream request or admin surface rollback

Three safe-commit boundaries for D1:

1. Aggregate and tooling-only package identity cleanup for `core`, `cms`, `full`, and `deployer` only.
2. Declaration normalization across provider-bearing manifests and package-level activation seams.
3. Registration and discovery adoption inside foundation bootstrapping and manifest-compilation seams.

D1 cannot cross from boundary 1 to boundary 2 until boundary 1 has closure evidence and a valid rollback path.

## The Verification Harness

[#988](https://github.com/waaseyaa/framework/issues/988) defined the invariant-verification protocol governing every M10+ batch. Six steps, every time:

1. **Pre-execution invariant gate** — confirm the batch declares only its assigned drift instances
2. **Dependency gate** — confirm all predecessor handoff conditions are satisfied
3. **Rollback gate** — confirm the change set is partitioned along the safe-commit boundaries
4. **Execution verification** — run surface-boundary, semantic-alignment, fallback, and locked-surface checks
5. **Post-execution closure gate** — confirm the batch conforms to #987 and closes only its assigned drift instances
6. **Evidence gate** — record code, docs, and test evidence for downstream batches and governance handoff

No batch may claim closure without passing all six gates. The harness is read-only from the moment M9 hands off to M10.

## M10: Batch D1 Activated

[#993](https://github.com/waaseyaa/framework/issues/993) bootstrapped M10 conformance execution on 2026-03-31, authorizing Batch D1 under five immutable inputs:

| Input | Issue | Role |
|-------|-------|------|
| Canonical conformance source | [#987](https://github.com/waaseyaa/framework/issues/987) | Sole source of invariants |
| Drift ledger | [#991](https://github.com/waaseyaa/framework/issues/991) | Sole source of drift-instance identity |
| Dependency DAG | [#990](https://github.com/waaseyaa/framework/issues/990) | Fixes execution ordering |
| Execution baseline | [#986](https://github.com/waaseyaa/framework/issues/986) | Fixes batch scope and rollback boundaries |
| Verification harness | [#988](https://github.com/waaseyaa/framework/issues/988) | Governs all closure and handoff behavior |

None of these may be modified during execution. Closure claims map to them. They do not move.

## Batch D1 in Code

D1 execution is live on the `m10-batch-d1` branch. Commit `8599cd41` — "feat: normalize D1 package declaration discovery" — is boundary 1.

```
packages/deployer/composer.json                        |  3 -
packages/foundation/src/Discovery/PackageManifest.php  |  6 +-
packages/foundation/src/Discovery/PackageManifestCompiler.php | 65 +++
packages/foundation/tests/Unit/Discovery/PackageManifestCompilerTest.php | 73 +++
packages/foundation/tests/Unit/Discovery/PackageManifestTest.php | 11 +
```

### Before: a tooling package claiming a layer

`packages/deployer/composer.json` had this in `extra`:

```json
"waaseyaa": {
    "layer": 6
}
```

`waaseyaa/deployer` wraps [Deployer](https://deployer.org/) for release automation. It has no PSR-4 autoload, no service providers, no runtime participation in the framework. The `layer: 6` key caused it to appear in implementation-domain membership counts and distorted the architectural picture. That is drift class C16: a package-shape distortion that incorrectly signals implementation-domain participation.

After boundary 1, the stale key is gone:

```json
"extra": {
    "branch-alias": {
        "dev-main": "0.1.x-dev"
    }
}
```

### After: explicit surface and activation classification

The real boundary 1 work is `PackageManifestCompiler::collectPackageDeclarations()`, which classifies every installed package by its actual Composer characteristics:

```php
private function collectPackageDeclarations(array $packages): array
{
    $declarations = [];

    foreach ($packages as $package) {
        $name  = $package['name'] ?? null;
        $type  = is_string($package['type'] ?? null) ? $package['type'] : 'library';
        $extra = is_array($package['extra']['waaseyaa'] ?? null) ? $package['extra']['waaseyaa'] : [];
        $psr4  = is_array(($package['autoload']['psr-4'] ?? null)) ? $package['autoload']['psr-4'] : [];

        if ($type === 'metapackage') {
            $declarations[$name] = ['surface' => 'aggregate', 'activation' => 'none'];
            continue;
        }

        $hasProviders        = is_array($extra['providers'] ?? null) && $extra['providers'] !== [];
        $hasDiscoveryAutoload = $psr4 !== [];

        if ($hasProviders) {
            $declarations[$name] = ['surface' => 'implementation', 'activation' => 'provider'];
            continue;
        }

        if ($hasDiscoveryAutoload) {
            $declarations[$name] = ['surface' => 'implementation', 'activation' => 'discovery'];
            continue;
        }

        $declarations[$name] = ['surface' => 'tooling', 'activation' => 'none'];
    }

    ksort($declarations);
    return $declarations;
}
```

The four classification rules, derived from #987:

- **`metapackage` type** → `surface: aggregate, activation: none`. Catches `waaseyaa/core`, `waaseyaa/cms`, `waaseyaa/full` — bundles with no runtime implementation surface.
- **Library with `extra.waaseyaa.providers`** → `surface: implementation, activation: provider`. Standard path for `waaseyaa/auth`, `waaseyaa/entity`, `waaseyaa/routing`, and similar.
- **Library with PSR-4 autoload, no providers** → `surface: implementation, activation: discovery`. Participates at runtime via attribute-based discovery rather than explicit service providers.
- **Library with neither** → `surface: tooling, activation: none`. `waaseyaa/deployer` after boundary 1.

The result lands in a new `PackageManifest::$packageDeclarations` property:

```php
/** @var array<string, array{surface: 'aggregate'|'implementation'|'tooling', activation: 'discovery'|'none'|'provider'}> */
public readonly array $packageDeclarations = [],
```

The manifest now carries an authoritative per-package surface map derived from objective package characteristics — not from hand-maintained metadata that can drift.

### Test evidence for boundary closure

`PackageManifestCompilerTest::compile_collects_normalized_package_declarations()` verifies the classification logic:

```php
// waaseyaa/core — metapackage
$this->assertSame(
    ['surface' => 'aggregate', 'activation' => 'none'],
    $manifest->packageDeclarations['waaseyaa/core'] ?? null,
);

// waaseyaa/deployer — library, no autoload, no providers
$this->assertSame(
    ['surface' => 'tooling', 'activation' => 'none'],
    $manifest->packageDeclarations['waaseyaa/deployer'] ?? null,
);

// waaseyaa/auth — library with extra.waaseyaa.providers
$this->assertSame(
    ['surface' => 'implementation', 'activation' => 'provider'],
    $manifest->packageDeclarations['waaseyaa/auth'] ?? null,
);
```

This satisfies evidence gate 6: test evidence proving package discovery, provider registration, and bootstrapping correctness after normalization.

## Why This Prevents Future Drift

`packageDeclarations` is not a documentation artifact. It is a live runtime property of `PackageManifest`, compiled from `vendor/composer/installed.json` every time the manifest is rebuilt. Any package that incorrectly claims implementation-domain participation — a stale `extra.waaseyaa` key, a misplaced provider registration, an unexpected autoload declaration — produces a classification that does not match the canonical model in #987.

That mismatch is detectable at compile time. A CI check that compares each package's `surface` and `activation` values against expected values fails immediately when drift appears. The canonical model is frozen. The comparison is deterministic. Drift stops accumulating silently between audits.

That is the point of the batch-driven execution model. Each batch closes a set of classified drift instances against a frozen canonical source, with a verification harness that requires evidence before the batch is considered closed. When D1 through D5 complete, you do not just have a cleaner codebase. You have a recorded, verified, dependency-ordered history of conformance work that future contributors can read and check against.

Batches D2 through D5 remain gated by the DAG in #990 and the batch spec in #986. The invariant harness in #988 enforces it. The M9 planning artifacts do not expire — every change that touches the implementation surface has a reference point: what does the canonical model in #987 say this should look like?

Baamaapii
