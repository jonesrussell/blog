---
title: "I Migrated a Laravel App to a Custom PHP Framework in One Claude Code Session"
date: 2026-03-19
categories: [ai]
tags: [claude-code, waaseyaa, laravel, migration, php, inertia]
summary: "How I used Claude Code to build 3 framework packages, scaffold a full application, and get 12 pages rendering — all in a single session."
slug: "laravel-to-waaseyaa-one-session"
draft: true
---

## The Setup

GoFormX is a forms management platform. The web frontend has been running on Laravel 12 + Inertia v2 + Vue 3. The Go API backend handles forms and submissions. I've been building Waaseyaa, a PHP framework, and decided it was time to dogfood it — migrate GoFormX from Laravel to Waaseyaa.

The migration spec was already written. Three new framework packages needed to exist (`waaseyaa/inertia`, `waaseyaa/auth`, `waaseyaa/billing`), plus the entire application scaffold. My plan was to execute this over several sessions.

It happened in one.

## What Got Built

In a single Claude Code session (~8 hours wall time), here's what was produced:

**3 Waaseyaa packages (all published to Packagist):**

- `waaseyaa/inertia` — Server-side Inertia v3 protocol adapter. Handles initial HTML page loads with embedded JSON page objects, XHR JSON responses, version checking (409), and redirect status code conversion. 30 tests.
- `waaseyaa/auth` — Headless authentication. Login/logout with session management, HMAC-signed password reset tokens, signed email verification URLs, TOTP two-factor auth (RFC 6238, no external library), token-bucket rate limiting. 46 tests.
- `waaseyaa/billing` — Stripe billing. Plan tier resolution from subscriptions and admin overrides, checkout session creation, customer portal, webhook event processing, founding member slot management. 35 tests.

**1 full application (`goformx-web`):**

- 7 PHP controllers (Auth, Public, Dashboard, Form, Billing, Settings, GoFormsClient)
- 37 PHP unit tests
- 28 Vue 3 page components (full parity with the Laravel app)
- 24 shadcn-vue UI component directories
- 9 SSR Twig templates with base layout
- 5 MariaDB migration files
- Docker Compose with 6 services (PHP/nginx, Vite, Go API, MariaDB, PostgreSQL, Mailpit)
- GitHub Actions CI/CD pipeline
- Ansible deployment configuration

**Total: 148 tests across everything.**

## The TDD Pipeline That Made It Work

Each package followed the same pattern, which I captured in a reusable skill (`laravel-to-waaseyaa`):

1. **Scaffold** — `composer.json`, minimal `ServiceProvider`, wire to root monorepo
2. **TDD core components** — Write test, watch it fail, implement, watch it pass. Every class gets this treatment.
3. **Wire** — Service provider registers singletons, middleware, routes
4. **Verify** — Full test suite + CS Fixer
5. **Deploy** — Add to monorepo split workflow, create GitHub split repo, tag, submit to Packagist

The key insight: Claude Code can execute this pipeline reliably because every step has a concrete, verifiable outcome. The tests aren't just for correctness — they're the feedback loop that tells the agent whether each step succeeded.

## The Hard Parts

### Waaseyaa's Kernel vs GoFormX's Needs

The Waaseyaa kernel boots with SQLite for its entity storage layer. GoFormX's users live in MariaDB (migrated from Laravel). The solution: a `UserRepository` that queries MariaDB directly via PDO, bypassing the entity system for auth operations. Not elegant, but practical — the entity system handles framework entities, MariaDB handles app data.

### Inertia v3's Page Data Format

This was a fun debugging session. The initial implementation put the page data in a `<script type="application/json" data-page="true">` tag (the v2 convention). White screen. Then we tried a `data-page` attribute on the `#app` div. Still white screen — the JSON parsed fine, but Inertia couldn't find it.

Reading the Inertia v3 source revealed the answer:

```js
const scriptEl = document.querySelector(
    `script[data-page="${id}"][type="application/json"]`
);
```

V3 looks for `data-page="app"` (the mount element ID), not `data-page="true"`. A one-attribute fix, but it took reading the framework source to find it.

### PHP-FPM Doesn't Inherit Docker Env Vars

The HMAC shared secret between the PHP app and Go API was empty in production — `$_ENV` doesn't work in PHP-FPM because FPM clears the environment by default. Two fixes: `clear_env = no` in FPM config, and switching from `$_ENV` to `getenv()` with a helper function.

## What's Actually Verified

Every flow was tested with Playwright MCP (browser automation), not just curl. The login flow works end-to-end: GET the login page → fill email and password → click "Sign in" → land on the dashboard with the Vue app rendering, navigation working, user data displayed.

The HMAC assertion to the Go API works — the Go API accepts the signatures and processes requests. The forms page gracefully shows "No forms yet" because the test user doesn't have forms in the Go database.

## What's Left

The app is structurally complete but not production-ready. The remaining work:

- Form.io builder integration testing (requires the `@goformx/formio` npm link)
- Stripe webhook testing with test keys
- Profile/password update POST handlers (forms render, submissions need wiring)
- Production Ansible vault secrets
- 7-day confidence period cutover plan (already documented in GitHub issues)

## The Reusable Skill

The most valuable artifact might be the `laravel-to-waaseyaa` skill — a repeatable 6-phase pipeline for building new Waaseyaa packages. It encodes the exact patterns, conventions, and gotchas discovered during this migration. Next time I port a Laravel feature to Waaseyaa, the skill provides the playbook.

## Takeaway

The migration worked because of three things:

1. **A detailed spec written before any code.** The migration design doc specified every route, every entity field, every API endpoint. Claude Code executed against the spec, not against vague intentions.

2. **TDD as the agent feedback loop.** Every component started with a failing test. The agent knows it succeeded when the test passes. No ambiguity.

3. **Incremental verification.** Commit after every task. Test after every component. Don't batch 10 things and hope they all work.

The total test count across the session: 148 tests, all green. Not bad for a day's work.
