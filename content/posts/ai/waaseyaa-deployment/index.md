---
title: "From scaffold to live site in 90 minutes"
date: 2026-03-23
categories: [ai, php]
tags: [waaseyaa, deployment, caddy, deployer]
series: ["waaseyaa"]
series_order: 10
series_group: "Main"
summary: "How waaseyaa.org went from first commit to production in 90 minutes — and the deployment patterns shared across three Waaseyaa applications."
slug: "waaseyaa-deployment"
draft: false
devto_id: 3386520
---

Ahnii!

> **Series context:** This is part 9 of the [Waaseyaa series]({{< relref "waaseyaa-intro" >}}). Previous posts covered the [entity system]({{< relref "waaseyaa-entity-system" >}}), [Claudriel's temporal layer]({{< relref "claudriel-temporal-layer" >}}), [access control]({{< relref "waaseyaa-access-control" >}}), the [API layer]({{< relref "waaseyaa-api-layer" >}}), [DBAL migration]({{< relref "waaseyaa-dbal-migration" >}}), [i18n]({{< relref "waaseyaa-i18n" >}}), and [testing]({{< relref "waaseyaa-testing" >}}).

On March 17, 2026, waaseyaa.org went from `composer init` to live in production. Eight commits. Ninety minutes. The site runs on the same framework it markets — dogfooding by necessity, not by choice.

This post covers how that happened, the deployment pattern shared across all three Waaseyaa applications, and the five things that went wrong along the way.

## Dogfooding the framework

waaseyaa.org is a four-page marketing site. It runs the full 32-package Waaseyaa stack. No CMS features. No entity storage. No access control. Just a `SiteServiceProvider` that registers routes and a `PageController` that renders [Twig](https://twig.symfony.com/) templates.

That simplicity is the point. If a framework can't boot cleanly and serve four static pages without ceremony, something is wrong with the framework. waaseyaa.org validates the happy path — the full dependency tree resolves, the service container wires correctly, and Twig renders without requiring database configuration.

The site doesn't need entities, field types, or access policies. But it loads every package anyway. That's a design trade-off worth noting — and one of the post-mortem lessons below.

## The Deployer pattern

All three Waaseyaa applications — waaseyaa.org, Minoo, and Claudriel — use [Deployer](https://deployer.org/) for artifact-based deployment. The pattern is the same across all three:

1. GitHub Actions builds the artifact (composer install, npm build).
2. The workflow rsyncs the build artifact to the server.
3. Deployer manages releases with symlinks.

Each deploy creates a new release directory. Deployer keeps five releases for rollback. Shared directories like `storage/` and shared files like `.env` are symlinked across releases so they persist between deploys.

The `deploy.php` for waaseyaa.org is minimal:

```php
host('production')
    ->set('hostname', 'waaseyaa.org')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '/home/deployer/waaseyaa.org')
    ->set('shared_dirs', ['storage'])
    ->set('shared_files', ['.env'])
    ->set('keep_releases', 5);
```

Five lines define the entire deployment target. Deployer handles the symlink rotation, shared directory linking, and release cleanup.

## Caddy as the web server

All three apps use [Caddy](https://caddyserver.com/) as the web server. Caddy provides automatic TLS via Let's Encrypt with zero configuration. No certbot cron jobs. No manual certificate renewal.

A representative Caddyfile block:

```caddyfile
waaseyaa.org {
    root * /home/deployer/waaseyaa.org/current/public
    php_fastcgi unix//run/php/php8.4-fpm.sock
    file_server
    encode gzip

    log {
        output file /var/log/caddy/waaseyaa.org.access.log
    }
}
```

Caddy serves the `current` symlink, which Deployer points at the latest release. A deploy doesn't require a Caddy reload — the symlink update is atomic and Caddy follows it on the next request.

## GitHub Actions CI/CD

The deployment workflow has four stages: checkout, build, transfer, and deploy. The interesting part is the build stage — waaseyaa.org depends on the Waaseyaa framework via a Composer path repository during development.

Key workflow steps:

```yaml
- name: Checkout app
  uses: actions/checkout@v4

- name: Checkout waaseyaa framework
  uses: actions/checkout@v4
  with:
    repository: jonesrussell/waaseyaa
    path: waaseyaa

- name: Install dependencies
  run: composer install --no-dev --optimize-autoloader

- name: Transfer artifact
  run: rsync -azP --delete ./ deployer@${{ secrets.SERVER_IP }}:/tmp/waaseyaa-build/

- name: Deploy
  run: ssh deployer@${{ secrets.SERVER_IP }} 'cd /tmp/waaseyaa-build && vendor/bin/dep deploy'
```

The workflow checks out both the application and the framework repository side by side. Composer resolves the framework packages from the local path during the build, then the entire artifact — vendor directory included — ships to the server. No Composer install runs on production.

## Deployment post-mortem

Five things went wrong during the 90-minute launch. Each one cost between 5 and 15 minutes to diagnose.

**1. Server assumption.** The initial deploy script assumed Nginx. The server runs Caddy. The Caddyfile syntax is different enough that copy-pasting Nginx config blocks doesn't work — `try_files` becomes `php_fastcgi`, `location` blocks become matchers. Lesson: check `systemctl list-units` before writing web server config.

**2. Log directory permissions.** Caddy runs as the `caddy` system user via systemd. The application writes logs as the `deployer` user. The `storage/logs/` directory needs permissions that let both users write. A shared group with `g+w` solved it, but the first deploy threw 500 errors because PHP-FPM couldn't write to the log directory that Deployer had just created.

**3. Framework weight.** A four-page marketing site loads 32 Composer packages. The entity system, access control layer, field type registry — none of it is needed. The framework doesn't yet support loading a minimal subset. This works fine for Minoo and Claudriel, which use the full stack. For waaseyaa.org, it's unnecessary overhead. A future `waaseyaa/slim` meta-package could solve this.

**4. Missing environment variables.** PHP-FPM doesn't inherit shell environment variables. The `WAASEYAA_DB` connection string was set in the deployer user's `.bashrc` but invisible to the PHP-FPM worker. Moving it to `.env` in the shared files fixed it — but the error message was a generic "connection refused" that didn't immediately point to a missing env var.

**5. Caddyfile validation.** The server had a pre-existing Caddyfile syntax error from an unrelated site. `caddy reload` refused to apply any changes until the entire file was valid. A stale site block with a missing closing brace blocked the waaseyaa.org deployment. Lesson: run `caddy validate` before `caddy reload`.

## Three apps, one pattern

Minoo, Claudriel, and waaseyaa.org share the Deployer + Caddy + GitHub Actions pattern. The differences are small:

- **waaseyaa.org** is the simplest. No database. No user uploads. No queue workers. Four shared files, one shared directory.
- **Minoo** has more complex shared directories — user uploads, cache directories, and a SQLite database file that persists across releases.
- **Claudriel** splits its deploy configuration for staging and production environments. Staging deploys on every push to `develop`. Production deploys require a tagged release.

The shared pattern means a new Waaseyaa application can go from scaffold to production in under two hours. The Deployer config is a copy-paste with path changes. The GitHub Actions workflow is a template. The Caddyfile block is six lines.

That's the real value of standardizing deployment. Not the individual deploy — the compound speed of every deploy after the first.

## What's Next

The next post covers the AI-native PHP packages in Waaseyaa — how the framework integrates LLM capabilities directly into the service container.

Baamaapii
