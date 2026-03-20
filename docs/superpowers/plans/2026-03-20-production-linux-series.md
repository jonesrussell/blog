# Production Linux Series — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a 10-post blog series covering the full lifecycle of a production Linux VPS.

**Architecture:** Each task produces one publishable post + social companion file. Posts 2-4 draw from the existing hardening draft and 2026 research at `docs/vps-hardening-research-2026.md`. The hardening draft is archived after its content is distributed. A series index post is created first as the landing page.

**Tech Stack:** Hugo, PaperMod theme, Markdown, `task` runner

**Spec:** `docs/superpowers/specs/2026-03-20-production-linux-series-design.md`

**Style guide:** `docs/blog-style.md`

**Reference post for voice/tone:** `content/posts/laravel/laravel-boost-ddev/index.md`

**Research file:** `docs/vps-hardening-research-2026.md`

**Existing hardening draft:** `content/posts/devops/harden-linux-vps-caddy-docker/index.md`

**Existing Ansible post (cross-ref only):** `content/posts/devops/ansible-manage-digitalocean-laravel-infrastructure/index.md`

---

## Task 0: Series Setup — Index Post and Archive Hardening Draft

**Files:**
- Create: `content/posts/devops/production-linux-series-index/index.md`
- Modify: `content/posts/devops/harden-linux-vps-caddy-docker/index.md` (archive)

- [ ] **Step 1: Create series index post**

Create `content/posts/devops/production-linux-series-index/index.md`:

```yaml
---
title: "Production Linux: Secure and Maintain Your Own VPS"
date: 2026-03-20
categories: [devops]
tags: [linux, security]
series: ["production-linux"]
series_order: 0
summary: "A 10-post series covering the full lifecycle of a production Linux VPS — from first login to disaster recovery."
slug: "production-linux-series"
draft: false
---
```

Body: Ahnii!, series overview paragraph (what it covers, who it's for — developers deploying their own VPS), numbered list of all 10 posts with one-line descriptions (use plain text for unpublished posts, convert to relref links as each publishes), Baamaapii.

- [ ] **Step 2: Archive the hardening draft**

Add to `harden-linux-vps-caddy-docker/index.md` frontmatter:
- `archived: true`
- `archived_date: 2026-03-20`
- `sitemap: { disable: true }`
- `robotsNoIndex: true`

Do NOT delete it — its content is reference material for tasks 2-4.

- [ ] **Step 3: Verify build**

Run: `task build`
Expected: Clean build, no errors. Index post appears at `/production-linux-series/`.

- [ ] **Step 4: Commit**

```bash
git add content/posts/devops/production-linux-series-index/ content/posts/devops/harden-linux-vps-caddy-docker/index.md
git commit -m "series: production-linux index post, archive old hardening draft"
```

---

## Task 1: Post 1 — Provision an Ubuntu VPS and Create a Deploy User

**Files:**
- Create: `content/posts/devops/provision-ubuntu-vps-deploy-user/index.md`
- Create: `docs/social/provision-ubuntu-vps-deploy-user.md`

- [ ] **Step 1: Research current DigitalOcean provisioning flow**

Web search for current DO droplet creation flow (console UI or `doctl`), Ubuntu 24.04 initial setup best practices. Confirm: does DO still set up root with SSH key by default? Does cloud-init still handle initial `PasswordAuthentication no`?

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Provision an Ubuntu VPS and Create a Deploy User"
date: 2026-03-21
categories: [devops]
tags: [linux, security, digitalocean]
series: ["production-linux"]
series_order: 1
summary: "Set up a DigitalOcean droplet from scratch: first SSH connection, deploy user, UFW baseline, and unattended upgrades."
slug: "provision-ubuntu-vps-deploy-user"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote: "This is part 1 of the [Production Linux series](relref to index)."
- Intro: what this post covers (droplet creation → deploy user → UFW → auto-updates), one sentence on scope
- **Create the Droplet** — DO console or `doctl compute droplet create`, Ubuntu 24.04, SSH key, region selection
- **First SSH Connection** — `ssh root@ip`, what you see, what cloud-init already set up
- **Create a Deploy User** — `adduser deployer`, add to sudo group, copy SSH authorized_keys, test login in a second terminal before closing root session
- **Set Up UFW** — `ufw default deny incoming`, `ufw allow 22,80,443/tcp`, `ufw enable`, verify with `ufw status verbose`
- **Enable Unattended Upgrades** — `apt install unattended-upgrades`, `dpkg-reconfigure`, verify with `cat /etc/apt/apt.conf.d/20auto-upgrades`
- **Verify Your Baseline** — summary table (like the hardening post's table), checklist of what's now in place
- Cross-ref: "If you want to automate this with Ansible, see [Manage DigitalOcean Infrastructure With Ansible](relref to ansible post)."
- Baamaapii

Voice: second person, direct, instructional. Follow `docs/blog-style.md`. Every code block gets 1-2 sentences explaining what it does.

- [ ] **Step 3: Write social companion**

Create `docs/social/provision-ubuntu-vps-deploy-user.md` with Facebook (hashtags), X (under 240 chars), LinkedIn (professional, no hashtags). All include canonical URL `https://jonesrussell.github.io/blog/provision-ubuntu-vps-deploy-user/`.

- [ ] **Step 4: Review with blog-reviewing skill**

Run the blog-reviewing checklist against the post. Fix any findings.

- [ ] **Step 5: Verify build**

Run: `task build`
Expected: Clean build, post renders at `/provision-ubuntu-vps-deploy-user/`.

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/provision-ubuntu-vps-deploy-user/ docs/social/provision-ubuntu-vps-deploy-user.md
git commit -m "post: provision Ubuntu VPS and create deploy user (production-linux 1/10)"
```

- [ ] **Step 7: Update series index**

Update `production-linux-series-index/index.md`: convert Post 1's plain text entry to a relref link.

```bash
git add content/posts/devops/production-linux-series-index/index.md
git commit -m "series: link post 1 in production-linux index"
```

---

## Task 2: Post 2 — SSH Hardening: Ed25519 Keys and Disabling Root Login

**Files:**
- Create: `content/posts/devops/ssh-hardening-ed25519-disable-root/index.md`
- Create: `docs/social/ssh-hardening-ed25519-disable-root.md`
- Reference: `content/posts/devops/harden-linux-vps-caddy-docker/index.md` (SSH section)
- Reference: `docs/vps-hardening-research-2026.md`

- [ ] **Step 1: Research current SSH hardening standards**

Web search for 2025-2026 SSH hardening guides. Confirm: ed25519 as default key type, recommended `sshd_config` settings, SSH certificate adoption status, any new OpenSSH features.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "SSH Hardening: Ed25519 Keys and Disabling Root Login"
date: 2026-03-22
categories: [devops]
tags: [linux, security, ssh]
series: ["production-linux"]
series_order: 2
summary: "Lock down SSH access with ed25519 keys, disable root login, and remove unused authentication methods."
slug: "ssh-hardening-ed25519-disable-root"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote linking to index and post 1
- Intro: SSH is the front door, this post locks it down
- **Generate an Ed25519 Key** — `ssh-keygen -t ed25519`, why ed25519 over RSA, copying the key
- **Disable Root Login** — `PermitRootLogin no` via drop-in file `/etc/ssh/sshd_config.d/99-hardening.conf`, why `no` not `prohibit-password` (expanded from hardening draft with research context)
- **Disable Unused Auth Methods** — GSSAPI, X11 forwarding, keyboard-interactive, all in the same drop-in file
- **Verify the Active Config** — `sshd -T | grep -E "permitrootlogin|gssapi|x11|pubkeyaccepted"`, explain what each line means
- **SSH Certificates (Looking Ahead)** — brief 2-3 paragraph section on what SSH certificates are and when they make sense (not a how-to, just awareness)
- Baamaapii

Source material: hardening draft SSH section + `docs/vps-hardening-research-2026.md` SSH findings.

- [ ] **Step 3: Write social companion**

Create `docs/social/ssh-hardening-ed25519-disable-root.md`.

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

Run: `task build`

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/ssh-hardening-ed25519-disable-root/ docs/social/ssh-hardening-ed25519-disable-root.md
git commit -m "post: SSH hardening with ed25519 and root disable (production-linux 2/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 3: Post 3 — UFW, fail2ban, and Banning Repeat Offenders

**Files:**
- Create: `content/posts/devops/ufw-fail2ban-intrusion-response/index.md`
- Create: `docs/social/ufw-fail2ban-intrusion-response.md`
- Reference: `content/posts/devops/harden-linux-vps-caddy-docker/index.md` (fail2ban sections)
- Reference: `docs/vps-hardening-research-2026.md`

- [ ] **Step 1: Research current fail2ban and nftables best practices**

Confirm: nftables as default banaction in current fail2ban, CrowdSec current state, UFW logging best practices.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "UFW, fail2ban, and Banning Repeat Offenders"
date: 2026-03-23
categories: [devops]
tags: [linux, security, fail2ban, caddy]
series: ["production-linux"]
series_order: 3
aliases: ["/harden-linux-vps-caddy-docker/"]
summary: "Configure UFW rules, build a fail2ban jail for Caddy access logs, and escalate bans for repeat offenders with the recidive jail."
slug: "ufw-fail2ban-intrusion-response"
draft: false
---
```

Note: `aliases` captures the old hardening post URL.

Structure:
- Ahnii!
- Series context blockquote
- Intro: firewalls block ports, fail2ban blocks behavior
- **UFW Beyond the Basics** — rule ordering, logging (`ufw logging medium`), common mistakes (forgetting to allow SSH before enabling), checking with `ufw status numbered`
- **How fail2ban Works** — brief architecture: log → filter → jail → action, the findtime/maxretry/bantime model
- **A fail2ban Jail for Caddy** — Caddy JSON log filter (from hardening draft, with improved regex `40[0-5]`), jail config, testing with `fail2ban-regex`
- **Escalate With the Recidive Jail** — from hardening draft, updated to use `nftables[type=allports]` banaction, explanation of why nftables over iptables
- **CrowdSec: Collective Intelligence** — 2-3 paragraphs on what CrowdSec adds (shared blocklists), when it makes sense, not a full setup guide
- **Verify Your Jails** — `fail2ban-client status`, reading ban logs, checking nftables rules
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/ufw-fail2ban-intrusion-response/ docs/social/ufw-fail2ban-intrusion-response.md
git commit -m "post: UFW, fail2ban, and recidive jail (production-linux 3/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 4: Post 4 — Docker Security on a Shared VPS

**Files:**
- Create: `content/posts/devops/docker-security-shared-vps/index.md`
- Create: `docs/social/docker-security-shared-vps.md`
- Reference: `content/posts/devops/harden-linux-vps-caddy-docker/index.md` (service binding section)
- Reference: `docs/vps-hardening-research-2026.md`

- [ ] **Step 1: Research current Docker security practices**

Confirm: DOCKER-USER chain behavior, rootless Docker maturity, current Trivy usage, `no-new-privileges` and `cap_drop` in compose. Check north-cloud's `docker-compose.base.yml` for real examples.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Docker Security on a Shared VPS"
date: 2026-03-24
categories: [devops]
tags: [linux, security, docker]
series: ["production-linux"]
series_order: 4
summary: "Why Docker bypasses your UFW rules, how to fix it, and container hardening practices that matter on a shared VPS."
slug: "docker-security-shared-vps"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: Docker and your firewall aren't friends by default
- **Why Docker Bypasses UFW** — FORWARD vs INPUT chain diagram (text-based), how `-p` flag creates DOCKER chain rules, why `ufw status` lies to you
- **The DOCKER-USER Chain Fix** — adding rules to DOCKER-USER for published ports, persisting with `/etc/docker/daemon.json`
- **Bind Services to Localhost** — from hardening draft, the `127.0.0.1:` prefix on port mappings, Docker-to-Docker traffic unaffected, verify with `docker ps --format`
- **Container Hardening** — `security_opt: [no-new-privileges:true]`, `cap_drop: [ALL]` + `cap_add` only what's needed, `read_only: true` with tmpfs for write paths, running as non-root user
- **Scan Images With Trivy** — `trivy image myimage:latest`, integrating into CI, what to do with findings
- **Rootless Docker** — what it is, when it makes sense, current limitations (no privileged ports without workaround)
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/docker-security-shared-vps/ docs/social/docker-security-shared-vps.md
git commit -m "post: Docker security on a shared VPS (production-linux 4/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 5: Post 5 — Caddy Hardening: Security Headers and Rate Limiting

**Files:**
- Create: `content/posts/devops/caddy-security-headers-rate-limiting/index.md`
- Create: `docs/social/caddy-security-headers-rate-limiting.md`
- Reference: `docs/vps-hardening-research-2026.md`

- [ ] **Step 1: Research current Caddy security features**

Confirm: current Caddy security header syntax, `mholt/caddy-ratelimit` module status and API, CSP best practices for Laravel/Inertia SPAs, any Caddy security advisories.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Caddy Hardening: Security Headers and Rate Limiting"
date: 2026-03-25
categories: [devops]
tags: [security, caddy, linux]
series: ["production-linux"]
series_order: 5
summary: "Add security headers, rate limiting, and server identity removal to your Caddy configuration."
slug: "caddy-security-headers-rate-limiting"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: Caddy handles TLS automatically, but it doesn't add security headers by default
- **Security Headers as a Snippet** — reusable `(security-headers)` snippet with HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. Import it per-site.
- **Content Security Policy** — separate section because CSP is complex. Starter policy for a Laravel/Inertia SPA, common gotchas (inline scripts, Vite dev server)
- **Remove the Server Header** — `header -Server` to hide Caddy identity
- **Rate Limiting** — `mholt/caddy-ratelimit` module: install via `xcaddy`, Caddyfile syntax, per-IP and per-path limits, what happens when limits are hit
- **Structured JSON Logs for fail2ban** — tie back to Post 3, the log format that makes fail2ban filtering work
- **Verify Your Headers** — `curl -I https://yourdomain.com`, online tools like securityheaders.com
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/caddy-security-headers-rate-limiting/ docs/social/caddy-security-headers-rate-limiting.md
git commit -m "post: Caddy security headers and rate limiting (production-linux 5/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 6: Post 6 — Kernel and Systemd Service Hardening

**Files:**
- Create: `content/posts/devops/kernel-systemd-hardening/index.md`
- Create: `docs/social/kernel-systemd-hardening.md`
- Reference: `docs/vps-hardening-research-2026.md`

- [ ] **Step 1: Research current sysctl and systemd hardening**

Confirm: recommended sysctl settings for Ubuntu 24.04, `systemd-analyze security` output format, current best practices for PHP-FPM and Caddy service sandboxing.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Kernel and Systemd Service Hardening"
date: 2026-03-26
categories: [devops]
tags: [linux, security, systemd]
series: ["production-linux"]
series_order: 6
summary: "Tune kernel parameters with sysctl and sandbox services with systemd to reduce your VPS attack surface."
slug: "kernel-systemd-hardening"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: previous posts locked down access; this post restricts what processes can do once they're running
- **Sysctl Hardening** — SYN cookies, source address verification, restrict ptrace, restrict dmesg, disable ICMP redirects. Each setting gets a brief "what this prevents." Persist via `/etc/sysctl.d/99-hardening.conf`, apply with `sysctl --system`.
- **Systemd Service Sandboxing** — `ProtectSystem=strict`, `PrivateTmp=yes`, `NoNewPrivileges=yes`, `ProtectHome=yes`, `ReadWritePaths=` for specific directories. Show override files for PHP-FPM and Caddy.
- **Audit Your Services** — `systemd-analyze security` output, what the scores mean, which ones to care about
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/kernel-systemd-hardening/ docs/social/kernel-systemd-hardening.md
git commit -m "post: kernel and systemd service hardening (production-linux 6/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 7: Post 7 — Secrets, Certificates, and Credential Rotation

**Files:**
- Create: `content/posts/devops/secrets-certificates-credential-management/index.md`
- Create: `docs/social/secrets-certificates-credential-management.md`

- [ ] **Step 1: Research credential management for solo developers**

Confirm: current Ansible Vault workflow, Let's Encrypt/ACME via Caddy status, SSH key rotation best practices, `.env` permission patterns.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Secrets, Certificates, and Credential Rotation"
date: 2026-03-27
categories: [devops]
tags: [security, linux, ansible]
series: ["production-linux"]
series_order: 7
summary: "Manage .env files, encrypt secrets with Ansible Vault, and rotate credentials without downtime."
slug: "secrets-certificates-credential-management"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: your server is locked down, but secrets still need managing
- **.env File Permissions** — 0640, www-data group, why 0600 breaks PHP-FPM
- **Ansible Vault for Server Secrets** — brief recap with cross-ref: "For the full Ansible Vault setup, see [Manage DigitalOcean Infrastructure With Ansible](relref to ansible post)."
- **TLS Certificates With Caddy** — Caddy handles ACME automatically, what to check (certificate expiry monitoring from post 9), manual renewal if needed
- **Database Credential Rotation** — strategy for MariaDB/Postgres, rotating without downtime (create new user → update .env → deploy → remove old user)
- **SSH Key Rotation** — when to rotate, how to add new key before removing old, deploy key management for GitHub Actions
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/secrets-certificates-credential-management/ docs/social/secrets-certificates-credential-management.md
git commit -m "post: secrets, certificates, and credential rotation (production-linux 7/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 8: Post 8 — Automated Patching and Server Maintenance

**Files:**
- Create: `content/posts/devops/automated-patching-maintenance/index.md`
- Create: `docs/social/automated-patching-maintenance.md`

- [ ] **Step 1: Research current unattended-upgrades and needrestart**

Confirm: unattended-upgrades auto-reboot config, needrestart behavior on Ubuntu 24.04, Docker image cleanup best practices, logrotate for app-level logs.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Automated Patching and Server Maintenance"
date: 2026-03-28
categories: [devops]
tags: [linux, security]
series: ["production-linux"]
series_order: 8
summary: "Configure automatic security patches, detect stale services with needrestart, and keep logs and Docker images from filling your disk."
slug: "automated-patching-maintenance"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: security patches mean nothing if they're not applied
- **Unattended Upgrades Configuration** — security-only vs all updates, auto-reboot policy (`Automatic-Reboot`, `Automatic-Reboot-Time`), email notifications, verify with `unattended-upgrades --dry-run`
- **Needrestart: Detect Stale Services** — what it does (detects services running outdated libraries), install, configure auto-restart mode
- **Log Rotation** — logrotate config for Caddy access logs and app logs, size-based vs time-based, compression
- **Docker Cleanup** — `docker system prune`, scheduled cleanup cron, cleaning old images/volumes
- **Disk Monitoring** — simple `df` check, when to alert (post 9 preview)
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/automated-patching-maintenance/ docs/social/automated-patching-maintenance.md
git commit -m "post: automated patching and server maintenance (production-linux 8/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 9: Post 9 — Monitoring, Alerting, and Incident Response

**Files:**
- Create: `content/posts/devops/monitoring-alerting-incident-response/index.md`
- Create: `docs/social/monitoring-alerting-incident-response.md`

- [ ] **Step 1: Research lightweight monitoring for solo developers**

Confirm: current options for simple uptime/health checks (Uptime Kuma, Healthchecks.io, DO monitoring), auditd setup on Ubuntu 24.04, lightweight alerting via webhook/email.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Monitoring, Alerting, and Incident Response"
date: 2026-03-29
categories: [devops]
tags: [linux, monitoring, security]
series: ["production-linux"]
series_order: 9
summary: "Set up lightweight monitoring and alerting for a solo-developer VPS, plus a post-incident checklist."
slug: "monitoring-alerting-incident-response"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: everything from the series so far is preventive — this post covers detection and response
- **What to Monitor** — fail2ban ban rate, disk/memory/CPU, systemd service health, certificate expiry, login events
- **Lightweight Alerting** — not Prometheus/Grafana (overkill for 1-2 servers). Options: DigitalOcean built-in monitoring, Uptime Kuma (self-hosted), Healthchecks.io for cron monitoring, simple webhook/email for threshold alerts
- **auditd for Security Events** — install, basic rules (file access, user changes, sudo usage), reading audit logs
- **Post-Incident Checklist** — what to check first (auth.log, fail2ban log, systemd journal), when to patch vs rebuild, communication (even if it's just yourself)
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/monitoring-alerting-incident-response/ docs/social/monitoring-alerting-incident-response.md
git commit -m "post: monitoring, alerting, and incident response (production-linux 9/10)"
```

- [ ] **Step 7: Update series index**

---

## Task 10: Post 10 — Backup and Disaster Recovery

**Files:**
- Create: `content/posts/devops/backup-disaster-recovery-vps/index.md`
- Create: `docs/social/backup-disaster-recovery-vps.md`

- [ ] **Step 1: Research current backup strategies**

Confirm: DO snapshot automation, MariaDB/Postgres dump best practices, off-server backup targets (DO Spaces, Backblaze B2), restore testing approaches.

- [ ] **Step 2: Write the post**

Frontmatter:
```yaml
---
title: "Backup and Disaster Recovery"
date: 2026-03-30
categories: [devops]
tags: [linux, backup, security]
series: ["production-linux"]
series_order: 10
summary: "Automate backups, test restores, and build a disaster recovery runbook for your VPS."
slug: "backup-disaster-recovery-vps"
draft: false
---
```

Structure:
- Ahnii!
- Series context blockquote
- Intro: everything else in the series protects the server — this post protects you when the server is gone
- **DigitalOcean Snapshots** — automated weekly snapshots, cost, limitations (not a database-consistent backup)
- **Database Dumps** — MariaDB: `mysqldump` with `--single-transaction`, Postgres: `pg_dump`, cron scheduling, storing dumps off-server
- **Off-Server Backups** — DO Spaces or Backblaze B2 with `rclone`, encrypting before upload, retention policy
- **Test Your Restores** — spin up a test droplet, restore from snapshot, verify services start, check data. If you haven't tested it, it's not a backup.
- **The Rebuild Runbook** — how long from fresh droplet to fully running? Steps: provision → Ansible site.yml → Deployer deploy → restore database → verify. Tie back to Post 1 and the Ansible post.
- **Series Wrap-Up** — brief recap of the full series arc, what the reader now has in place (summary table of all 10 layers)
- Baamaapii

- [ ] **Step 3: Write social companion**

- [ ] **Step 4: Review with blog-reviewing skill**

- [ ] **Step 5: Verify build**

- [ ] **Step 6: Commit**

```bash
git add content/posts/devops/backup-disaster-recovery-vps/ docs/social/backup-disaster-recovery-vps.md
git commit -m "post: backup and disaster recovery (production-linux 10/10)"
```

- [ ] **Step 7: Final series index update**

Update index post: all 10 entries are now relref links. Commit.

- [ ] **Step 8: Push the full series**

```bash
git push
```
