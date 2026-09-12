---
categories:
    - php
    - waaseyaa
date: 2026-09-12T00:00:00Z
devto: true
draft: false
slug: cache-clear-hardcoded-bin-list
summary: How Waaseyaa's cache:clear command couldn't even run in production, and how a hardcoded bin list quietly reported success while clearing the wrong cache entirely.
tags:
    - php
    - waaseyaa
    - cli
    - caching
title: Fixing a cache:clear command that couldn't run and couldn't be trusted
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `cache:clear` CLI command had two bugs stacked on top of each other: it couldn't be constructed by the real CLI at all, and once that was worked around, it cleared a hardcoded list of bins that didn't match what the application actually configured. Here's both bugs, the fix, and why a command that prints "cleared" needs to be checked against real state, not just its own exit code.

## The Bug: A Command That Couldn't Run, Then Lied When It Could

The first problem was structural. `CacheFactoryInterface` had no binding anywhere in the CLI's `ConsoleKernel` boot path — only `HttpKernel::finalizeBoot()` ever built a `CacheFactory`. Every real invocation of `cache:clear` failed before it could do anything:

> No binding for `Waaseyaa\Cache\CacheFactoryInterface` in `KernelHandlerContainer`

The second problem was hiding behind the first. Once constructible, the handler cleared a fixed list of bin names:

```php
final class CacheClearHandler
{
    private const array DEFAULT_BINS = ['default', 'render', 'discovery', 'config'];

    public function __construct(
        private readonly CacheFactoryInterface $cacheFactory,
    ) {}

    public function execute(SymfonyCommandIO $io): int
    {
        // ...
        foreach (self::DEFAULT_BINS as $binName) {
            $this->cacheFactory->get($binName)->deleteAll();
        }

        $io->writeln('All cache bins cleared.');

        return 0;
    }
}
```

That list had drifted from what the application actually registers: `render`, `discovery`, and `mcp_read`. Two things followed from the mismatch:

- **`mcp_read` was unreachable.** It was never in `DEFAULT_BINS`, so `cache:clear` never touched it, no matter what you asked for.
- **`default` and `config` printed "cleared" for nothing.** `CacheFactory::get()` hands back a usable backend for any bin name, configured or not — a fresh, empty, unconfigured fallback. Clearing it "succeeds," but there was never any real data behind that name. The command reported success for two bins that didn't exist and silently skipped the one that did.

The exit code was **0** whether the bin was real or not. That's what makes this worse than an outright crash — a crash gets noticed; a wrong success message doesn't.

## The Fix: One Canonical List, Shared by HTTP and CLI

The fix starts with a single accessor for "what bins does this configuration actually register":

```php
final class CacheConfiguration
{
    // ...

    public function getConfiguredBins(): array
    {
        $bins = [];
        foreach (array_keys($this->binMapping) as $bin) {
            $bins[$bin] = true;
        }
        foreach (array_keys($this->binFactories) as $bin) {
            $bins[$bin] = true;
        }

        // PHP coerces a numeric-string array key to int, so array_keys() would
        // hand back int(123) for a bin registered as '123' -- violating the
        // declared list<string> and making the consumer report a configured
        // bin as "not configured". Cast back to the registered string form.
        return array_map(strval(...), array_keys($bins));
    }
}
```

`AbstractKernel::buildCacheFactory()` becomes the one place the framework's production bins (`render`, `discovery`, `mcp_read`) get composed:

```php
public function buildCacheFactory(RuntimeEpochInterface $runtimeEpoch): CacheFactory
{
    $providerFactory = $this->providerCacheFactory();
    if ($providerFactory !== null) {
        return $providerFactory;
    }

    // ... derive $pdo, $cacheHmacKey, $projectionDiagnostic ...

    $cacheConfig = new CacheConfiguration();
    $cacheConfig->setFactoryForBin('render', fn(): DatabaseBackend => new DatabaseBackend(
        $pdo, 'cache_render', hmacKey: $cacheHmacKey, projectionDiagnostic: $projectionDiagnostic,
    ));
    $cacheConfig->setFactoryForBin('discovery', fn(): DatabaseBackend => new DatabaseBackend(
        $pdo, 'cache_discovery', hmacKey: $cacheHmacKey, projectionDiagnostic: $projectionDiagnostic,
    ));
    $cacheConfig->setFactoryForBin('mcp_read', fn(): RuntimeEpochCacheBackend => new RuntimeEpochCacheBackend(
        new DatabaseBackend($pdo, 'cache_mcp_read', hmacKey: $cacheHmacKey, projectionDiagnostic: $projectionDiagnostic),
        $runtimeEpoch->fingerprint(),
    ));

    return $this->cacheFactory = new CacheFactory($cacheConfig, $projectionDiagnostic);
}
```

`HttpKernel::finalizeBoot()` now calls that method instead of building its own `CacheConfiguration` inline, and the CLI's handler container gains bindings for both `CacheFactoryInterface` and `CacheConfiguration` that go through the same method. HTTP-serving boot and the CLI can no longer register a different set of bins from each other — which also fixes the original "no binding" failure, since the CLI now has one.

With a real, shared list to enumerate, `CacheClearHandler` stops hardcoding anything:

```php
private function clearConfigured(SymfonyCommandIO $io): int
{
    $bins = $this->cacheConfiguration->getConfiguredBins();

    if ($bins === []) {
        $io->writeln('No cache bins are configured.');

        return 0;
    }

    $cleared = [];
    $failed = [];

    foreach ($bins as $binName) {
        try {
            $this->cacheFactory->get($binName)->deleteAll();
        } catch (\Throwable $e) {
            $io->writeln(sprintf('Cache bin "%s" failed to clear: %s', $binName, $e->getMessage()));
            $failed[] = $binName;
            continue;
        }

        $io->writeln(sprintf('Cache bin "%s" cleared.', $binName));
        $cleared[] = $binName;
    }

    if ($failed === []) {
        $io->writeln('All cache bins cleared.');

        return 0;
    }

    if ($cleared === []) {
        $io->writeln('No cache bins were cleared.');

        return 1;
    }

    $io->writeln(sprintf(
        'Partially cleared: %d of %d cache bins failed (%s).',
        count($failed),
        count($bins),
        implode(', ', $failed),
    ));

    return 1;
}
```

A few behavior changes fall out of this that are worth calling out:

- **One failing bin no longer aborts the rest.** Each bin is attempted independently, and the exit status reflects total success, total failure, or partial failure — never a blanket "All cache bins cleared." when that isn't true.
- **`--bin` naming an unconfigured bin is now a reported failure, not a false success.** `clearOne()` checks `getConfiguredBins()` first and exits 1 with "nothing to clear" instead of quietly clearing an empty fallback backend.
- **`--bin`/`--tags` option shapes are unchanged.** This was a bin-inventory and reporting fix, not a CLI interface change.

The fix doesn't claim this ever caused a production stale-read incident. `mcp_read` is namespaced by a runtime epoch fingerprint, so prior-epoch entries were already unreadable regardless of `cache:clear`. What it fixes is narrower and still worth fixing: the command couldn't run, and once it could, its success message wasn't describing reality.

## Verifying It

The existing test suite mocked a factory and asserted `deleteAll()` was called **four times**. That assertion holds regardless of which four bin names were actually used, so it couldn't have caught the mismatch. The new tests assert against real backend state through the actual registered command:

| Test | What it proves |
|---|---|
| `clearsAllConfiguredBins` | Only the bins a `CacheConfiguration` actually registers get cleared |
| `noConfiguredBinsReportsNothingToClear` | An empty configuration reports "No cache bins are configured," never a false success |
| `explicitUnconfiguredBinIsNotReportedAsCleared` | `--bin nonexistent` exits 1 with "nothing to clear," never "cleared" |
| `backendThatThrowsIsReportedAsFailureWithoutAbortingOtherBins` | One bin throwing still lets the others clear, with a truthful partial-failure message and exit code |
| `allBinsThrowingIsTotalFailure` | Every bin failing reports "No cache bins were cleared," not "All cache bins cleared." |

Two of the discriminating cases drive the real registered `cache:clear` command through the production `KernelHandlerContainer`, with a real `CacheFactory`/`CacheConfiguration` and a `DatabaseBackend` over SQLite — checking actual table state before and after, not just stdout.

## The General Lesson

A command that hardcodes "the list of things to process" instead of asking the configuration what it actually registers will drift the first time someone adds or renames a bin elsewhere in the codebase. Drift alone isn't the scary part. What's scary is that `$factory->get($name)` doesn't fail for an unconfigured name — it hands back an empty fallback backend, so the command keeps reporting success on names that no longer mean anything. A test suite that mocks `deleteAll()` and counts calls can't tell the difference: it passes against the correct list of bins and the wrong one alike. If "cleared" can be true for a bin that was never real, the tests have to check actual backend state, not call counts. That check is worth more than removing `DEFAULT_BINS` itself.

Baamaapii
