---
title: "Production Linux: Secure and Maintain Your Own VPS"
date: 2026-03-19
categories: [devops]
tags: [linux, security]
series: ["production-linux"]
series_order: 0
summary: "A 10-post series covering the full lifecycle of a production Linux VPS — from first login to disaster recovery."
slug: "production-linux-series"
draft: false
archived: false
devto_id: 3378664
---

Ahnii!

This series covers the full lifecycle of a production Linux VPS — from first login to disaster recovery. It is for developers who deploy their own servers and are comfortable with a terminal but are not operations specialists.

### 1. [Provision an Ubuntu VPS and Create a Deploy User]({{< relref "provision-ubuntu-vps-deploy-user" >}})

Droplet creation, deploy user, UFW baseline, and unattended upgrades. The "before you do anything else" checklist.

### 2. [SSH Hardening: Ed25519 Keys and Disabling Root Login]({{< relref "ssh-hardening-ed25519-disable-root" >}})

Ed25519 keys, `PermitRootLogin no`, and disabling unused authentication methods.

### 3. UFW, fail2ban, and Banning Repeat Offenders

UFW deep dive, a fail2ban jail for Caddy access logs, and the recidive jail with nftables.

### 4. Docker Security on a Shared VPS

Why Docker bypasses UFW, the DOCKER-USER chain fix, localhost binding, and container hardening.

### 5. Caddy Hardening: Security Headers and Rate Limiting

Reusable security headers snippet, Content Security Policy, and rate limiting with caddy-ratelimit.

### 6. Kernel and Systemd Service Hardening

sysctl tuning, systemd sandboxing for PHP-FPM and Caddy, and auditing with `systemd-analyze security`.

### 7. Secrets, Certificates, and Credential Rotation

`.env` permissions, Ansible Vault, TLS via Caddy, and zero-downtime credential rotation.

### 8. Automated Patching and Server Maintenance

unattended-upgrades configuration, needrestart, log rotation, and Docker cleanup.

### 9. Monitoring, Alerting, and Incident Response

Lightweight monitoring, auditd for security events, and a post-incident checklist.

### 10. Backup and Disaster Recovery

Snapshots, database dumps, off-server backups, restore testing, and the rebuild runbook.

Each post stands alone — start wherever your server needs the most attention.

Baamaapii
