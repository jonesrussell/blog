# Agent-friendly JSON output for PHP CI tools

Reference URL: https://jonesrussell.github.io/blog/agent-output-php-ci-tools/

## Bluesky

94.7% smaller PHPUnit output for AI agents in PHP monorepos. waaseyaa/agent-output detects the agent, emits NDJSON, leaves human output unchanged.

https://jonesrussell.github.io/blog/agent-output-php-ci-tools/

#buildinpublic

## LinkedIn

94.7% smaller PHPUnit output for AI agents.

When Claude Code runs your test suite during a review loop, the verbose stdout is piped right back into its context window. A full PHPUnit run on the Waaseyaa framework monorepo is around 12,000 lines. Per iteration. Per gate. The token cost is real.

So I shipped waaseyaa/agent-output, a Layer 0 PHP package that detects the agent runtime from env vars like CLAUDE_CODE or CURSOR_AGENT, then swaps every covered CI tool into emitting a single NDJSON envelope instead of the usual human output.

Coverage: PHPUnit, PHPStan, drift-detector, plus 5 of the framework bin/check-* gates. Each has a dedicated formatter. Each honors three triggers: an --output=json flag, a WAASEYAA_OUTPUT=json env var, or auto-activation under an agent env.

Empirical smoke test on packages/foundation/tests/Unit:

- Standard PHPUnit output: 2,209 bytes
- Agent envelope: 117 bytes
- 94.70% reduction

Human terminal output is completely unchanged when no agent is detected and no flag is passed. Zero overhead in human mode. The PHPUnit 10 extension is a no-op until WAASEYAA_OUTPUT=json is set.

The pattern was lifted from Laravel PAO, then made framework-native because PAO does not cover custom CI gates and we wanted the formatter contract to evolve in the same PR as the gate scripts.

Full writeup, coverage table, and the PHPUnit extension shape are in the post.

https://jonesrussell.github.io/blog/agent-output-php-ci-tools/

#php #ai #claudecode #waaseyaa #buildinpublic

## Facebook

Shipped a small thing that solves a specific pain. When an AI coding agent runs your test suite, the full verbose output gets piped back into its context window. A PHPUnit run on the Waaseyaa monorepo is around 12,000 lines. Per iteration.

waaseyaa/agent-output is a Layer 0 PHP package that detects the agent, then swaps PHPUnit, PHPStan, drift-detector, and 5 bin/check-* gates into emitting a single compact NDJSON line instead. Empirical smoke test came back at 94.70% smaller output on PHPUnit. Human terminal output is unchanged when no agent is detected.

Full writeup, coverage table, and how to wire it into your own monorepo:

https://jonesrussell.github.io/blog/agent-output-php-ci-tools/

#php
