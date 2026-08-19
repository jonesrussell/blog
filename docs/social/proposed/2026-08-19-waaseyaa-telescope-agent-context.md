Queue-Issue: #369
Reference URL: https://github.com/jonesrussell/jonesrussell/issues/369

## Bluesky

Knowing what your app does is table stakes. Knowing what context your agents are seeing is harder. Waaseyaa now exposes Prometheus metrics and HTTP routes for agent context via the telescope package. https://github.com/waaseyaa/framework/commit/5e80614 #buildinpublic #phpdev

## LinkedIn

Knowing what your app does is table stakes. Knowing what context your agents are seeing -- that is the harder problem.

Commit 5e80614 in waaseyaa/framework adds the telescope agent-context feature: Prometheus-compatible metrics and HTTP routes so you can observe what codified context is active for any agent at runtime.

The canonical Prometheus series name is waaseyaa_agent_context_*, with deprecated waaseyaa_cc_* mirrors so existing dashboards keep working without a migration. HTTP paths live under /api/telescope/agent-context/ and are registered automatically by BuiltinRouteRegistrar -- you do not wire these yourself.

A new CodifiedContextApiRouter class handles dispatch. Telescope records now treat agent_context as higher precedence than codified_context, which matters when an agent overrides context dynamically mid-request.

The spec lives at docs/specs/telescope-agent-context-telemetry.md inside the framework repo and defines the exact series names, HTTP paths, and precedence rules. Playwright tests cover the e2e flow.

This is part of making Waaseyaa safe to run with AI-assisted workflows, where the gap between "what the developer intended" and "what the agent sees" is exactly what causes silent failures.

https://github.com/waaseyaa/framework/commit/5e80614

#waaseyaa #phpdev #buildinpublic #observability #agentdev

## Facebook

When you add AI-assisted workflows to a framework, debugging shifts. The question is no longer just "what did the code do" -- it is "what context was the agent seeing when it did it."

Waaseyaa's new telescope agent-context feature adds Prometheus metrics and HTTP routes for exactly that. The Prometheus series is waaseyaa_agent_context_* with backward-compatible mirrors for existing dashboards. HTTP paths under /api/telescope/agent-context/ are registered automatically, and a new router class handles dispatch. The spec at docs/specs/telescope-agent-context-telemetry.md defines the full contract.

Telescope records now treat agent_context as higher precedence than codified_context, so dynamic agent overrides show up correctly in both metrics and API responses. https://github.com/waaseyaa/framework/commit/5e80614 #buildinpublic
