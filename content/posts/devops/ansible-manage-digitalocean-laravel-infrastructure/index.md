---
title: "Manage DigitalOcean Infrastructure With Ansible for Laravel and PHP Apps"
date: 2026-03-18
categories: [devops]
tags: [ansible, digitalocean, laravel, caddy]
summary: "How to structure an Ansible repo to manage two DigitalOcean droplets, six Laravel apps, and a Go microservices platform without replacing the existing Deployer workflow."
slug: "ansible-manage-digitalocean-laravel-infrastructure"
draft: false
devto_id: 3368825
---

Ahnii!

This post walks through how to build an [Ansible](https://docs.ansible.com/) repo to manage a production [DigitalOcean](https://www.digitalocean.com/) setup: two Ubuntu droplets, six [Laravel](https://laravel.com/) apps, a couple of PHP framework sites, and a Go microservices platform. The goal is to codify everything that was previously managed via manual SSH, without replacing the [Deployer](https://deployer.org/) workflow that already handles app releases.

## The Problem

The setup worked. But it was held together by tribal knowledge. Adding a new site meant SSHing in, creating directories, writing a Caddyfile, setting up systemd services, creating a database, and hoping you remembered every step. Server config drifted over time. Nothing was reproducible.

I needed a single source of truth for what the server should look like.

## What Ansible Manages (and What It Doesn't)

This is the key design decision. [Deployer](https://deployer.org/) already handles release deploys: building assets, uploading artifacts, symlinking releases, restarting services. It does that job well. Ansible handles everything else.

**Ansible owns:**

- DigitalOcean droplets, DNS records, and firewall rules
- Server packages (Caddy, PHP-FPM, MariaDB, Node.js, Docker)
- SSH hardening, UFW, fail2ban, swap
- Per-app directories, Caddyfiles, and log rotation
- Database creation and user provisioning
- `.env` files (from Vault-encrypted secrets)

**Deployer owns:**

- Release artifact upload and symlink switching
- Systemd user services (Horizon, SSR, scheduler, subscribers)
- Cache clearing and migration running
- Rollback

No overlap. Ansible sets up the environment. Deployer deploys into it.

## Repo Structure

```text
infra-ansible/
  ansible.cfg
  requirements.yml
  inventory/
    hosts.yml
    group_vars/
      all/
        main.yml
        vault.yml          # DO API token (encrypted)
        digitalocean.yml   # droplets, DNS, firewalls
      webservers/
        main.yml           # php_version, extensions
        vault.yml          # MariaDB root password
    host_vars/
      web-prod/
        main.yml           # app definitions
        vault.yml          # per-app secrets
      proxy-01/
        main.yml
  playbooks/
    site.yml               # full convergence
    webserver.yml
    proxy.yml
    provision-droplet.yml
    destroy-droplet.yml
  roles/
    common/
    caddy/
    php/
    mariadb/
    node/
    laravel-app/
    php-framework-app/
    north-cloud/
    crawl-proxy/
    digitalocean/
```

The inventory has two hosts. `web-prod` runs everything (Laravel apps, PHP framework sites, Go microservices). `proxy-01` is a crawl proxy for the content pipeline's URL frontier.

## Apps Are Data

Adding a new Laravel app doesn't require a new role or playbook. You add an entry to `host_vars/web-prod/main.yml`:

```yaml
laravel_apps:
  - name: my-laravel-app
    domain: example.com
    repo: yourorg/my-laravel-app
    db: mariadb
    db_name: myapp
    app_key: "{{ vault_myapp_app_key }}"
    db_password: "{{ vault_myapp_db_password }}"

  - name: another-app
    domain: another.example.com
    repo: yourorg/another-app
    db: mariadb
    app_key: "{{ vault_another_app_key }}"
    db_password: "{{ vault_another_db_password }}"
```

The `laravel-app` role loops over this list. For each app it creates the directory structure, deploys a Caddyfile from a template, pre-creates log files with correct ownership, and optionally deploys the `.env`.

```yaml
# roles/laravel-app/tasks/main.yml
- name: Configure Laravel apps
  ansible.builtin.include_tasks: app.yml
  loop: "{{ laravel_apps }}"
  loop_control:
    loop_var: app
    label: "{{ app.name }}"
```

One role, many apps.

## Caddy Configuration With Glob Imports

The old `/etc/caddy/Caddyfile` had a dozen explicit `import` lines, one per site. Every new site meant SSHing in and appending a line. Now Ansible deploys a two-line Caddyfile:

```caddy
import /home/deployer/*/Caddyfile
import /opt/*/Caddyfile
```

Each app gets its own Caddyfile in its deploy directory, templated by Ansible:

```jinja2
{{ app.domain }} {
  tls {
    issuer acme {
    }
  }

  root * /home/{{ deploy_user }}/{{ app.name }}/current/public

  encode gzip zstd

  @static {
    path /css/* /js/* /img/* /build/* *.ico
  }
  handle @static {
    header Cache-Control "public, max-age=31536000, immutable"
    file_server
  }

  php_fastcgi * unix//run/php/php{{ php_version }}-fpm.sock {
    resolve_root_symlink
  }

  log {
    output file /home/{{ deploy_user }}/{{ app.name }}/log/access.log {
      mode 0644
    }
  }
}
```

New apps are picked up automatically by the glob. The Caddy handler always validates before reloading, so a bad config never takes down other sites.

## DigitalOcean as Code

Droplets, DNS records, and firewalls are declared in `group_vars/all/digitalocean.yml` and managed through the `community.digitalocean` collection:

```yaml
do_droplets:
  - name: web-prod
    region: tor1
    size: s-2vcpu-4gb
    image: ubuntu-24-04-x64
    tags: [prod]

do_domains:
  - domain: example.com
    records:
      - { type: A, name: "@", value: "203.0.113.10" }
      - { type: A, name: www, value: "203.0.113.10" }

do_firewalls:
  - name: web-traffic
    inbound_rules:
      - { protocol: tcp, ports: "443", sources: { addresses: ["0.0.0.0/0"] } }
      - { protocol: tcp, ports: "80", sources: { addresses: ["0.0.0.0/0"] } }
      - { protocol: tcp, ports: "22", sources: { addresses: ["0.0.0.0/0"] } }
    tags: [prod, proxy]
```

Provisioning a new droplet is one command: `ansible-playbook playbooks/provision-droplet.yml`.

## Secrets With Ansible Vault

Server secrets live in encrypted vault files committed to the repo. The vault password file lives at `~/.ansible-vault-password` and is gitignored.

Vault variables use a `vault_` prefix. Clear-text vars reference them:

```yaml
# vault.yml (encrypted)
vault_myapp_app_key: "base64:abc123..."
vault_myapp_db_password: "s3cret-passw0rd"

# main.yml (clear)
laravel_apps:
  - name: my-laravel-app
    app_key: "{{ vault_myapp_app_key }}"
    db_password: "{{ vault_myapp_db_password }}"
```

SSH deploy keys and GitHub Actions secrets stay where they are. No duplication.

## Lessons From the First Real Run

Running this against a live production server surfaced several things that a dry-run couldn't catch:

- **Redis runs in Docker, not as a system package.** The `redis-server` role tried to bind to a port Docker already owned. Removed the role entirely.
- **Ondrej PHP PPA and Docker repo were already installed** with different GPG key paths. Adding them again caused apt conflicts. Fixed with existence checks.
- **MariaDB uses unix socket auth on Ubuntu.** Setting a root password broke subsequent tasks. Removed the password task entirely.
- **[Caddy's](https://caddyserver.com/) `admin off` directive breaks `caddy reload`.** The reload command uses the admin API on localhost:2019. Removed it.
- **App directory names don't always match app names.** The deploy directory might be `my-app-laravel` while your config says `my-app`. Added a `db_name` field to decouple them.
- **`.env` files need mode 0640, not 0600.** PHP-FPM runs as `www-data`, which needs group read access. Added `www-data` to the `deployer` group.

Each of these would have been a "why is the site down?" mystery without the Ansible run surfacing it explicitly.

## Running It

Full convergence (everything from DO infra to app config):

```bash
ansible-playbook playbooks/site.yml
```

Just the web server:

```bash
ansible-playbook playbooks/webserver.yml
```

A single role:

```bash
ansible-playbook playbooks/webserver.yml --tags caddy
```

Just the app configs:

```bash
ansible-playbook playbooks/webserver.yml --tags laravel-app
```

The playbook is idempotent. Run it once or ten times, you get the same result.

Baamaapii
