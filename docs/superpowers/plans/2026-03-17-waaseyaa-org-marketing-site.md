# waaseyaa.org Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a marketing site for the Waaseyaa PHP CMS framework at waaseyaa.org, built on the framework itself, deployed via the same Deployer artifact pattern as minoo.live.

**Architecture:** Minimal Waaseyaa framework app — routing + Twig SSR templates, no entities or database. One ServiceProvider registers static page routes. One PageController renders Twig templates. Deployer artifact deploy via GitHub Actions to northcloud.one.

**Tech Stack:** PHP 8.4, Waaseyaa framework (routing, foundation, ssr packages), Twig templates, vanilla CSS, Deployer, Nginx, GitHub Actions, Certbot SSL.

---

## File Structure

```
~/dev/waaseyaa.org/
├── composer.json              # Minimal waaseyaa deps (foundation, routing, ssr)
├── deploy.php                 # Deployer config (clone of minoo, adapted)
├── public/
│   ├── index.php              # HttpKernel boot (identical to minoo)
│   └── css/
│       └── site.css           # Marketing site styles
├── config/
│   └── waaseyaa.php           # Minimal config (no DB, no auth, no AI)
├── templates/
│   ├── base.html.twig         # Layout: nav, footer, meta
│   ├── home.html.twig         # Hero + feature highlights
│   ├── features.html.twig     # Architecture, packages, GraphQL + JSON:API
│   ├── getting-started.html.twig  # Quick install/usage
│   └── about.html.twig        # Story, meaning, team
├── src/
│   ├── Controller/
│   │   └── PageController.php # Renders static templates
│   └── Provider/
│       └── SiteServiceProvider.php  # Routes + provider registration
├── storage/                   # Shared dir for deployer (empty for now)
├── ops/
│   └── nginx/
│       └── waaseyaa.org.conf  # Nginx vhost
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
├── .gitignore
└── CLAUDE.md
```

---

## Chunk 1: Project Scaffold & App Bootstrap

### Task 1: Create repo and project skeleton

**Files:**
- Create: `~/dev/waaseyaa.org/.gitignore`
- Create: `~/dev/waaseyaa.org/composer.json`
- Create: `~/dev/waaseyaa.org/public/index.php`
- Create: `~/dev/waaseyaa.org/config/waaseyaa.php`
- Create: `~/dev/waaseyaa.org/CLAUDE.md`

- [ ] **Step 1: Create GitHub repo**

```bash
gh repo create waaseyaa/waaseyaa.org --public --description "Marketing site for the Waaseyaa PHP CMS framework" --clone
```

- [ ] **Step 2: Create .gitignore**

```gitignore
/vendor/
/.build/
/.env
*.sqlite
storage/framework/packages.php
```

- [ ] **Step 3: Create composer.json**

Minimal deps — only the framework packages needed for routing + SSR:

```json
{
    "name": "waaseyaa/waaseyaa.org",
    "description": "Marketing site for the Waaseyaa PHP CMS framework",
    "type": "project",
    "license": "MIT",
    "require": {
        "php": ">=8.4",
        "waaseyaa/foundation": "^0.1@alpha",
        "waaseyaa/routing": "^0.1@alpha",
        "waaseyaa/ssr": "^0.1@alpha",
        "waaseyaa/config": "^0.1@alpha"
    },
    "autoload": {
        "psr-4": {
            "WaaseyaaOrg\\": "src/"
        }
    },
    "extra": {
        "waaseyaa": {
            "providers": [
                "WaaseyaaOrg\\Provider\\SiteServiceProvider"
            ]
        }
    },
    "config": {
        "optimize-autoloader": true,
        "sort-packages": true
    },
    "minimum-stability": "alpha",
    "prefer-stable": true
}
```

Path repositories for `../waaseyaa/packages/*` will be added after initial creation (same pattern as minoo).

- [ ] **Step 4: Create public/index.php**

```php
<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

$kernel = new Waaseyaa\Foundation\Kernel\HttpKernel(dirname(__DIR__));
$kernel->handle();
```

- [ ] **Step 5: Create config/waaseyaa.php**

Minimal config — no DB, no auth, no AI, no search:

```php
<?php

declare(strict_types=1);

return [
    'database' => null,
    'ssr' => [
        'theme' => '',
        'cache_max_age' => 300,
    ],
];
```

- [ ] **Step 6: Create CLAUDE.md**

Document the project purpose, commands, and deploy pattern.

- [ ] **Step 7: Create storage/ directory**

```bash
mkdir -p storage/framework
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: project scaffold with composer.json and bootstrap"
```

### Task 2: Add path repositories and install deps

**Files:**
- Modify: `~/dev/waaseyaa.org/composer.json` (add repositories block)

- [ ] **Step 1: Add path repositories to composer.json**

Add the same `repositories` block as minoo uses, pointing to `../waaseyaa/packages/*`:

```json
"repositories": [
    {"type": "path", "url": "../waaseyaa/packages/*"}
]
```

- [ ] **Step 2: Run composer install**

```bash
cd ~/dev/waaseyaa.org && composer install
```

- [ ] **Step 3: Commit lock file**

```bash
git add composer.json composer.lock
git commit -m "feat: add path repositories and install framework deps"
```

### Task 3: Create ServiceProvider and PageController

**Files:**
- Create: `~/dev/waaseyaa.org/src/Provider/SiteServiceProvider.php`
- Create: `~/dev/waaseyaa.org/src/Controller/PageController.php`

- [ ] **Step 1: Create SiteServiceProvider**

Registers routes for /, /features, /getting-started, /about:

```php
<?php

declare(strict_types=1);

namespace WaaseyaaOrg\Provider;

use Waaseyaa\Foundation\ServiceProvider\ServiceProvider;
use Waaseyaa\Routing\RouteBuilder;
use Waaseyaa\Routing\WaaseyaaRouter;

final class SiteServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function routes(WaaseyaaRouter $router): void
    {
        $pages = [
            'home'            => '/',
            'features'        => '/features',
            'getting-started' => '/getting-started',
            'about'           => '/about',
        ];

        foreach ($pages as $name => $path) {
            $router->addRoute(
                "page.{$name}",
                RouteBuilder::create($path)
                    ->controller("WaaseyaaOrg\\Controller\\PageController::{$name}")
                    ->render()
                    ->methods('GET')
                    ->build(),
            );
        }
    }
}
```

- [ ] **Step 2: Create PageController**

```php
<?php

declare(strict_types=1);

namespace WaaseyaaOrg\Controller;

use Symfony\Component\HttpFoundation\Request as HttpRequest;
use Twig\Environment;
use Waaseyaa\SSR\SsrResponse;

final class PageController
{
    public function __construct(
        private readonly Environment $twig,
    ) {}

    public function home(array $params, array $query, $account, HttpRequest $request): SsrResponse
    {
        return new SsrResponse($this->twig->render('home.html.twig', ['path' => '/']));
    }

    public function features(array $params, array $query, $account, HttpRequest $request): SsrResponse
    {
        return new SsrResponse($this->twig->render('features.html.twig', ['path' => '/features']));
    }

    public function gettingStarted(array $params, array $query, $account, HttpRequest $request): SsrResponse
    {
        return new SsrResponse($this->twig->render('getting-started.html.twig', ['path' => '/getting-started']));
    }

    public function about(array $params, array $query, $account, HttpRequest $request): SsrResponse
    {
        return new SsrResponse($this->twig->render('about.html.twig', ['path' => '/about']));
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: add SiteServiceProvider and PageController"
```

### Task 4: Create Twig templates

**Files:**
- Create: `~/dev/waaseyaa.org/templates/base.html.twig`
- Create: `~/dev/waaseyaa.org/templates/home.html.twig`
- Create: `~/dev/waaseyaa.org/templates/features.html.twig`
- Create: `~/dev/waaseyaa.org/templates/getting-started.html.twig`
- Create: `~/dev/waaseyaa.org/templates/about.html.twig`
- Create: `~/dev/waaseyaa.org/public/css/site.css`

- [ ] **Step 1: Create base.html.twig**

Layout with nav (Home, Features, Getting Started, About), footer (GitHub link, "Built with Waaseyaa"), meta tags. Clean, modern design. Include `css/site.css`.

- [ ] **Step 2: Create home.html.twig**

Hero section: "Waaseyaa" heading, tagline ("Entity-first, AI-native PHP framework built on Symfony components"), CTA buttons (GitHub, Getting Started). Feature highlight cards: Entity System, Access Control, JSON:API + GraphQL, AI Packages. Link to Minoo as the production showcase.

- [ ] **Step 3: Create features.html.twig**

Sections for each architecture layer. Package count (43). Key capabilities: entity/field model, deny-unless-granted access, JSON:API + GraphQL auto-generation, AI packages, Packagist publishing. Reference the blog series.

- [ ] **Step 4: Create getting-started.html.twig**

Quick install via Composer. Minimal app example. Link to GitHub repo for full docs.

- [ ] **Step 5: Create about.html.twig**

The Anishinaabe meaning of "Waaseyaa" ("it is bright" / "there is light"). Why it was built (Drupal's good ideas, modern PHP foundation). Who's behind it (Russell Jones). Link to the blog series for the full story.

- [ ] **Step 6: Create public/css/site.css**

Clean, modern CSS. Dark theme with accent color. Responsive. No framework — vanilla CSS grid/flexbox. Typography-focused.

- [ ] **Step 7: Verify locally**

```bash
cd ~/dev/waaseyaa.org && php -S localhost:8080 -t public/
```

Visit http://localhost:8080 and verify all 4 pages render.

- [ ] **Step 8: Commit**

```bash
git add templates/ public/css/
git commit -m "feat: add page templates and CSS"
```

---

## Chunk 2: Deployment Infrastructure

### Task 5: Create Deployer config

**Files:**
- Create: `~/dev/waaseyaa.org/deploy.php`

- [ ] **Step 1: Create deploy.php**

Clone minoo's deploy.php, adapted for waaseyaa.org:
- `application`: `waaseyaa-org`
- `hostname`: `waaseyaa.org`
- `remote_user`: `deployer`
- `deploy_path`: `/home/deployer/waaseyaa-org`
- Remove `minoo:migrate` task (no database)
- Keep `deploy:upload`, `minoo:clear-manifest` (rename to `waaseyaa:clear-manifest`), `php-fpm:reload`

```php
<?php

namespace Deployer;

require 'recipe/common.php';

set('application', 'waaseyaa-org');
set('keep_releases', 5);
set('allow_anonymous_stats', false);

set('shared_dirs', ['storage']);
set('shared_files', ['.env']);
set('writable_dirs', ['storage', 'storage/framework']);

host('production')
    ->setHostname('waaseyaa.org')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '/home/deployer/waaseyaa-org')
    ->set('labels', ['stage' => 'production']);

desc('Upload pre-built release artifact from CI');
task('deploy:upload', function (): void {
    upload('.build/', '{{release_path}}/', [
        'options' => ['--recursive', '--compress'],
    ]);
});

desc('Clear Waaseyaa framework manifest cache');
task('waaseyaa:clear-manifest', function (): void {
    run('rm -f {{release_path}}/storage/framework/packages.php');
});

desc('Reload PHP-FPM to pick up new release');
task('php-fpm:reload', function (): void {
    run('sudo systemctl reload php8.4-fpm');
});

desc('Deploy waaseyaa.org to production');
task('deploy', [
    'deploy:info',
    'deploy:setup',
    'deploy:lock',
    'deploy:release',
    'deploy:upload',
    'deploy:shared',
    'deploy:writable',
    'waaseyaa:clear-manifest',
    'deploy:symlink',
    'deploy:unlock',
    'deploy:cleanup',
    'php-fpm:reload',
]);

after('deploy:failed', 'deploy:unlock');
```

- [ ] **Step 2: Commit**

```bash
git add deploy.php
git commit -m "feat: add Deployer config for waaseyaa.org"
```

### Task 6: Create GitHub Actions workflow

**Files:**
- Create: `~/dev/waaseyaa.org/.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy.yml**

Simplified version of minoo's — no tests (no PHPUnit/Playwright yet), no Node.js:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout waaseyaa.org
        uses: actions/checkout@v4
        with:
          path: waaseyaa-org

      - name: Checkout waaseyaa framework
        uses: actions/checkout@v4
        with:
          repository: waaseyaa/framework
          ref: develop/v1.1
          path: waaseyaa
          token: ${{ secrets.WAASEYAA_PAT }}

      - name: Set up PHP 8.4
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          extensions: mbstring, xml
          coverage: none

      - name: Install Composer dependencies
        working-directory: waaseyaa-org
        run: |
          composer install \
            --no-dev \
            --no-interaction \
            --optimize-autoloader \
            --prefer-dist

      - name: Assemble build artifact
        run: |
          mkdir -p waaseyaa-org/.build
          rsync -aL \
            --exclude='.git' \
            --exclude='.build/' \
            --exclude='tests/' \
            --exclude='docs/' \
            --exclude='.env' \
            --exclude='storage/framework/packages.php' \
            --exclude='deploy.php' \
            --exclude='ops/' \
            waaseyaa-org/ waaseyaa-org/.build/

      - name: Install PHP Deployer
        run: composer global require deployer/deployer --no-interaction

      - name: Set up SSH key
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}

      - name: Add known host
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan waaseyaa.org >> ~/.ssh/known_hosts

      - name: Deploy
        working-directory: waaseyaa-org
        run: dep deploy production --no-interaction
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy workflow"
```

### Task 7: Create Nginx config

**Files:**
- Create: `~/dev/waaseyaa.org/ops/nginx/waaseyaa.org.conf`

- [ ] **Step 1: Create waaseyaa.org.conf**

Clone minoo.live.conf, replace:
- `minoo.live` → `waaseyaa.org`
- `/home/deployer/minoo/` → `/home/deployer/waaseyaa-org/`
- Log paths → `waaseyaa.org-access.log` / `waaseyaa.org-error.log`

- [ ] **Step 2: Commit**

```bash
git add ops/
git commit -m "feat: add Nginx vhost config"
```

---

## Chunk 3: Server Setup & Deploy

### Task 8: DNS configuration

- [ ] **Step 1: Point waaseyaa.org A record to northcloud.one IP**

Check the IP: `dig +short northcloud.one` or `ssh jones@northcloud.one hostname -I`

Set A records:
- `waaseyaa.org` → server IP
- `www.waaseyaa.org` → server IP

### Task 9: Server setup

All commands run as `jones@northcloud.one`:

- [ ] **Step 1: Create deployer directory structure**

```bash
ssh jones@northcloud.one "sudo mkdir -p /home/deployer/waaseyaa-org/{releases,shared/storage/framework} && sudo chown -R deployer:deployer /home/deployer/waaseyaa-org"
```

- [ ] **Step 2: Create shared .env**

```bash
ssh jones@northcloud.one "sudo -u deployer bash -c 'echo \"APP_ENV=production\" > /home/deployer/waaseyaa-org/shared/.env'"
```

- [ ] **Step 3: Install Nginx vhost**

```bash
scp ops/nginx/waaseyaa.org.conf jones@northcloud.one:/tmp/
ssh jones@northcloud.one "sudo cp /tmp/waaseyaa.org.conf /etc/nginx/sites-available/waaseyaa.org && sudo ln -sf /etc/nginx/sites-available/waaseyaa.org /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"
```

- [ ] **Step 4: SSL via Certbot**

```bash
ssh jones@northcloud.one "sudo certbot --nginx -d waaseyaa.org -d www.waaseyaa.org --non-interactive --agree-tos -m deployer@waaseyaa.org"
```

- [ ] **Step 5: Verify deployer SSH access**

Ensure `deployer` user on the server has the SSH key that matches the `DEPLOY_SSH_KEY` GitHub secret. If using minoo's same key:

```bash
ssh jones@northcloud.one "sudo cat /home/deployer/.ssh/authorized_keys"
```

Verify the key used for minoo deploys is present. If a new key is needed, generate and add it.

### Task 10: GitHub repo secrets

- [ ] **Step 1: Set DEPLOY_SSH_KEY secret**

```bash
gh secret set DEPLOY_SSH_KEY --repo waaseyaa/waaseyaa.org < ~/.ssh/waaseyaa_deploy
```

Or reuse minoo's deploy key if the same `deployer` user is shared.

- [ ] **Step 2: Set WAASEYAA_PAT secret**

```bash
gh secret set WAASEYAA_PAT --repo waaseyaa/waaseyaa.org
```

Use the same PAT as minoo (needs `repo` scope for waaseyaa/framework).

- [ ] **Step 3: Create production environment**

```bash
gh api repos/waaseyaa/waaseyaa.org/environments/production -X PUT
```

### Task 11: Push and deploy

- [ ] **Step 1: Push all commits to main**

```bash
cd ~/dev/waaseyaa.org && git push -u origin main
```

- [ ] **Step 2: Monitor deployment**

```bash
gh run watch --repo waaseyaa/waaseyaa.org
```

- [ ] **Step 3: Verify live site**

```bash
curl -sI https://waaseyaa.org | head -5
```

Visit https://waaseyaa.org in browser and verify all 4 pages render.

- [ ] **Step 4: Post-mortem**

Document the deployment experience: what worked, what broke, what to improve for next time. Save to `~/dev/waaseyaa.org/docs/deploy-postmortem-2026-03-17.md`.

---

## Summary

| Task | Description | Deps |
|------|-------------|------|
| 1 | Project scaffold + composer.json + bootstrap | — |
| 2 | Path repositories + composer install | 1 |
| 3 | ServiceProvider + PageController | 2 |
| 4 | Twig templates + CSS | 3 |
| 5 | Deployer config | 1 |
| 6 | GitHub Actions workflow | 5 |
| 7 | Nginx config | 1 |
| 8 | DNS configuration | — |
| 9 | Server setup | 7, 8 |
| 10 | GitHub secrets | 6 |
| 11 | Push + deploy + verify | all |

**Parallelizable:** Tasks 1-4 (app) and Tasks 5-7 (infra) can be built in parallel. Tasks 8-10 (server) can run in parallel. Task 11 requires all others.
