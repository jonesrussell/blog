---
title: "Agent-friendly JSON output for PHP CI tools"
date: 2026-05-24
categories: [ai]
tags: [claude-code, php, ci-tools, waaseyaa]
summary: How the waaseyaa/agent-output package shrinks PHPUnit, PHPStan, and bin/check-* output to compact NDJSON envelopes so AI agents do not drown their context window in CI noise.
slug: agent-output-php-ci-tools
draft: false
devto: true
---

Ahnii!

When an AI agent runs your test suite or a CI gate during an implement-or-review loop, the verbose stdout gets piped straight back into its context window. A full [PHPUnit](https://phpunit.de/) run on the [Waaseyaa framework](https://github.com/waaseyaa/framework) monorepo is around 12,000 lines. `bin/check-package-layers` is about 600. Per iteration, per gate. The token cost is real, and it compounds across review cycles. This post walks through `waaseyaa/agent-output`, a Layer 0 package that shrinks that output to a single NDJSON line for agents while leaving human terminal output completely unchanged.

## Why agent context windows hate CI output

The pattern shows up the moment you let an agent drive your test loop. The agent runs `composer test`. PHPUnit emits its banner, then a dot per test, then a footer summary, then optionally a slow-test report. None of that helps the agent. It needs three things: did the run pass, what failed, where. Everything else is noise that displaces real signal.

The same is true for `bin/check-package-layers`, `bin/check-phpstan`, `tools/drift-detector.sh`, and friends. Each one is a CI gate that the agent already understands at the contract level. The full human-readable output exists to help a person scan and react. An agent does not need any of it.

## What the package does

`waaseyaa/agent-output` is a single-purpose Layer 0 package (no `waaseyaa/*` runtime deps, installable standalone). It does three things:

1. **Detects an agent runtime** from a list of well-known env vars (`CLAUDE_CODE`, `CURSOR_AGENT`, and the rest), extensible.
2. **Provides a `FormatterInterface`** and first-party formatters for PHPUnit, Pest, PHPStan, the `bin/check-*` CI gates, and the drift detector.
3. **Honors three activation triggers** per command: an `--output=json` flag, a `WAASEYAA_OUTPUT=json` env var, or auto-activation when an agent env var is set.

When none of those triggers apply, the affected command emits exactly the human output it always did. No JSON fields leak, no exit codes change.

## Three ways to flip a tool into agent mode

```bash
bin/check-package-layers --output=json
WAASEYAA_OUTPUT=json bin/check-package-layers
CLAUDE_CODE=1 bin/check-package-layers
```

The first is explicit per-invocation. The second sets it for the shell. The third is what happens automatically when Claude Code (or another supported agent) drives your terminal — you do not have to wire anything up; the auto-detection kicks in.

## Coverage

Here is the full set of tools the package now covers, taken verbatim from the package README:

| Tool | Trigger | Formatter |
|------|---------|-----------|
| `bin/check-package-layers` | `--output=json` / env | `PackageLayersFormatter` |
| `bin/check-dead-code` | `--output=json` / env | `DeadCodeFormatter` |
| `bin/check-getquery-bindings` | `--output=json` / env | `GetQueryBindingsFormatter` |
| `bin/check-composer-policy` | `--output=json` / env | `ComposerPolicyFormatter` |
| `bin/check-phpstan` | `--output=json` / env | `PhpStanFormatter` |
| `tools/drift-detector.sh` | `--output=json` / env | `DriftDetectorFormatter` |
| `vendor/bin/phpunit` | `WAASEYAA_OUTPUT=json` (PHPUnit does not surface custom CLI flags) | `PhpUnitFormatter` via `AgentOutputPhpUnitExtension` |

Five `bin/check-*` scripts, a drift detector, and PHPUnit. Each one emits an NDJSON envelope through a formatter dedicated to that tool's domain.

## PHPUnit is the awkward one

PHPUnit's extension API does not surface custom CLI flags. There is no clean way to add `--output=json` and have PHPUnit pass it to your extension. So the env var is the canonical trigger, and the package ships a PHPUnit 10 extension that registers six event subscribers (passed, failed, errored, marked-incomplete, skipped, execution-finished) over a shared run-state object:

```php
final class PhpUnitRunState
{
    public int $passed = 0;
    public int $failed = 0;
    public int $skipped = 0;

    /** @var list<array{test: string, file: string, line: int, message: string}> */
    public array $failures = [];
}
```

That class lives in its own file rather than as an anonymous shape inside the extension, so PHPStan can type-check the field accesses without inferring `mixed` through anonymous classes. A small thing, but it is the kind of detail that decides whether a package's own lint suite stays green.

The extension itself is a no-op when `WAASEYAA_OUTPUT` is not `json` — zero overhead in human mode. When it is, the envelope is printed at `TestRunner\ExecutionFinished` with a leading newline so it lands on its own trailing line. Agent consumers read the file line-by-line and parse the line that starts with `{"tool":"phpunit"`.

## What the numbers say

WP06 of the mission was an empirical token-reduction smoke test against the original NFR. The headline result, measured on `packages/foundation/tests/Unit --no-coverage`:

- **Standard PHPUnit output:** 2,209 bytes
- **Agent envelope (NDJSON line only):** 117 bytes
- **Reduction:** 94.70%

The threshold was ≥90%. The pattern delivers. And that number understates the savings on a full monorepo run, where the human output runs in the thousands of lines and the envelope stays a single line.

## Why not just use Laravel PAO?

The pattern was lifted from Laravel PAO (released around May 2026), but the package is framework-native for two reasons. First, PAO does not cover the custom CI gates the Waaseyaa monorepo runs as hard gates (`bin/check-package-layers` and the rest). Second, the formatters need to live alongside the gate scripts so the contract between script and envelope shape can evolve in the same PR — third-party packaging would have made that coupling awkward.

The package is also a Layer 0 dependency, which means anyone outside the Waaseyaa monorepo can install just `waaseyaa/agent-output` and reuse the formatter interface for their own tools. The detection logic and envelope contract travel; the bin/check-* wrappers stay in the framework where they belong.

## Try it in your own monorepo

```bash
composer require waaseyaa/agent-output
```

Then either pass `--output=json` to any supported script, set `WAASEYAA_OUTPUT=json` in your shell, or run under an agent that sets `CLAUDE_CODE=1`. For PHPUnit specifically, register the extension in `phpunit.xml.dist`:

```xml
<extensions>
    <bootstrap class="Waaseyaa\AgentOutput\Listener\AgentOutputPhpUnitExtension"/>
</extensions>
```

The extension self-disables when `WAASEYAA_OUTPUT` is not set to `json`, so registering it does not change human-mode output.

For the full envelope schema, formatter contract, and a guide for writing third-party formatters, see `docs/specs/agent-output.md` in the framework repo.

Baamaapii
