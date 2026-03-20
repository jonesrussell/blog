# Production Linux Series — Design Spec

## Overview

A 10-post blog series covering the full lifecycle of a production Linux VPS: from initial provisioning through hardening, configuration, deployment support, monitoring, and disaster recovery. Targets developers deploying their own production servers who are comfortable with the terminal but not ops specialists.

## Series Metadata

- **Series key:** `production-linux`
- **Category:** `devops`
- **Tag budget per post:** max 4 from pool: `linux`, `security`, `docker`, `caddy`, `fail2ban`, `ssh`, `systemd`, `ansible`, `monitoring`, `backup`
- **Cadence:** Daily once started, first post drops immediately
- **Coupling:** Loosely coupled — each post stands alone, series order adds narrative arc

## Post Plan

### Post 1 — Provision an Ubuntu VPS and Create a Deploy User

- **Slug:** `provision-ubuntu-vps-deploy-user`
- **Tags:** `linux`, `security`, `digitalocean`
- **Source:** New
- **Scope:** DigitalOcean droplet creation, first SSH connection, creating a non-root deploy user with sudo, basic UFW setup (default-deny, allow 22/80/443), enabling unattended-upgrades. The "before you do anything else" post.
- **Cross-refs:** Links to existing Ansible post for "automate this with Ansible" path.

### Post 2 — SSH Hardening: Ed25519 Keys and Disabling Root Login

- **Slug:** `ssh-hardening-ed25519-disable-root`
- **Tags:** `linux`, `security`, `ssh`
- **Source:** Expanded from hardening draft (SSH section) + 2026 research
- **Scope:** `PermitRootLogin no` (not `prohibit-password`), ed25519-only key restrictions, disabling GSSAPI/X11/keyboard-interactive, SSH config drop-in files, verifying active config with `sshd -T`. Brief mention of SSH certificates as a forward-looking option.

### Post 3 — UFW, fail2ban, and Banning Repeat Offenders

- **Slug:** `ufw-fail2ban-intrusion-response`
- **Tags:** `linux`, `security`, `fail2ban`, `caddy`
- **Source:** Expanded from hardening draft (fail2ban sections) + 2026 research
- **Scope:** UFW deep dive (rules, logging, common mistakes), fail2ban architecture, Caddy JSON log filter, caddy-security jail, recidive jail with nftables banaction (not iptables), CrowdSec as a brief mention for collective intelligence. Verify section: checking jail status, reading ban logs.

### Post 4 — Docker Security on a Shared VPS

- **Slug:** `docker-security-shared-vps`
- **Tags:** `linux`, `security`, `docker`
- **Source:** New, uses hardening draft (service binding section) + 2026 research
- **Scope:** Docker's iptables bypass of UFW explained (FORWARD vs INPUT chain), DOCKER-USER chain for published ports, binding services to 127.0.0.1, rootless Docker overview, container hardening (`no-new-privileges`, `cap_drop: ALL`, read-only filesystems), image scanning with Trivy. Real examples from north-cloud docker-compose.

### Post 5 — Caddy Hardening: Security Headers and Rate Limiting

- **Slug:** `caddy-security-headers-rate-limiting`
- **Tags:** `security`, `caddy`, `linux`
- **Source:** New
- **Scope:** Security headers in Caddy (HSTS, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, removing Server header), rate limiting with `mholt/caddy-ratelimit` module, TLS configuration (ACME, OCSP stapling — mostly automatic with Caddy), structured JSON access logs for fail2ban integration. Caddyfile snippets for reusable header blocks.

### Post 6 — Kernel and Systemd Service Hardening

- **Slug:** `kernel-systemd-hardening`
- **Tags:** `linux`, `security`, `systemd`
- **Source:** New
- **Scope:** sysctl tuning (SYN cookies, source address verification, restrict ptrace, restrict dmesg, disable ICMP redirects), persisting with `/etc/sysctl.d/` drop-ins. Systemd service sandboxing: `ProtectSystem=strict`, `PrivateTmp=yes`, `NoNewPrivileges=yes`, `ProtectHome=yes`, `ReadWritePaths=`. Applied to PHP-FPM and Caddy service units. Auditing with `systemd-analyze security`.

### Post 7 — Secrets, Certificates, and Credential Rotation

- **Slug:** `secrets-certificates-credential-management`
- **Tags:** `security`, `linux`, `ansible`
- **Source:** New
- **Scope:** `.env` file permissions (0640, www-data group access), Ansible Vault for encrypted secrets (cross-ref Ansible post), Let's Encrypt/ACME automation via Caddy (mostly automatic), database credential rotation strategy, SSH key rotation, GitHub deploy key management. Not a secrets-manager-as-a-service post — focused on what a solo developer running 1-2 VPSes actually needs.
- **Cross-refs:** Links to Ansible post's Vault section.

### Post 8 — Automated Patching and Server Maintenance

- **Slug:** `automated-patching-maintenance`
- **Tags:** `linux`, `security`
- **Source:** New
- **Scope:** Unattended-upgrades configuration (security vs all updates, auto-reboot policy, email notifications), `needrestart` package for detecting stale services, log rotation with logrotate (especially for app logs Caddy writes), disk usage monitoring, cleaning up old Docker images/volumes. The "keep it running without thinking about it" post.

### Post 9 — Monitoring, Alerting, and Incident Response

- **Slug:** `monitoring-alerting-incident-response`
- **Tags:** `linux`, `monitoring`, `security`
- **Source:** New
- **Scope:** What to watch: fail2ban ban rate, disk/memory/CPU, systemd service health, certificate expiry. Lightweight alerting for a solo developer (not Prometheus/Grafana overkill): simple health checks, email/webhook alerts. Post-incident checklist: what to check, how to review logs, when to rebuild vs patch. auditd for security-relevant event logging.

### Post 10 — Backup and Disaster Recovery

- **Slug:** `backup-disaster-recovery-vps`
- **Tags:** `linux`, `backup`, `security`
- **Source:** New
- **Scope:** DigitalOcean snapshots (automated weekly), database dumps (MariaDB, Postgres for north-cloud), off-server backup targets (DO Spaces or similar), testing restores, the "rebuild from Ansible" runbook — how long does it take to go from a fresh droplet to fully running with Ansible + Deployer? Recovery time objective for a solo developer.

## Handling the Existing Hardening Draft

The current `content/posts/devops/harden-linux-vps-caddy-docker/index.md` draft covers content that splits across posts 2, 3, and 4:

- SSH hardening → Post 2
- Service binding to localhost → Post 4
- fail2ban Caddy jail → Post 3
- Recidive jail → Post 3

**Action:** Archive the hardening draft. Add `aliases: ["/harden-linux-vps-caddy-docker/"]` to whichever series post makes the best landing page (likely Post 3, which covers the most ground from the original).

## Existing Ansible Post

The published post `ansible-manage-digitalocean-laravel-infrastructure` (2026-03-18) stays standalone. It is cross-referenced from Posts 1 and 7 but is NOT part of the series. No changes to its frontmatter.

## Series Index Post

Create an index post at `content/posts/devops/production-linux-series-index/index.md` with:
- Series overview (what the series covers, who it's for)
- Linked list of all posts with one-line descriptions
- Published first, updated as posts publish

## Social Media

Each post gets a companion file at `docs/social/{slug}.md` following the standard format (Facebook with hashtags, X under 240 chars, LinkedIn professional tone no hashtags).

## Structure per Post

Each post follows the blog's standard structure:
1. Ahnii!
2. Series context blockquote with links to previous/intro post
3. Scoped intro paragraph
4. Prerequisites bullet list (when relevant)
5. Main sections (H2s, H3s for variants)
6. Verify / confirm section
7. Baamaapii
