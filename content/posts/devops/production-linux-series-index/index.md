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

Ahnii!

This series covers the full lifecycle of a production Linux VPS — from first login to disaster recovery. It is for developers who deploy their own servers and are comfortable with a terminal but are not operations specialists.

1. Provision an Ubuntu VPS and Create a Deploy User — Droplet creation, deploy user, UFW baseline, unattended upgrades
2. SSH Hardening: Ed25519 Keys and Disabling Root Login — Ed25519 keys, PermitRootLogin no, disable unused auth
3. UFW, fail2ban, and Banning Repeat Offenders — UFW deep dive, Caddy jail, recidive with nftables
4. Docker Security on a Shared VPS — Docker/UFW bypass, DOCKER-USER chain, container hardening
5. Caddy Hardening: Security Headers and Rate Limiting — Security headers, CSP, rate limiting module
6. Kernel and Systemd Service Hardening — sysctl tuning, systemd sandboxing, security audit
7. Secrets, Certificates, and Credential Rotation — .env permissions, Ansible Vault, TLS, key rotation
8. Automated Patching and Server Maintenance — unattended-upgrades, needrestart, log rotation, Docker cleanup
9. Monitoring, Alerting, and Incident Response — Lightweight monitoring, auditd, post-incident checklist
10. Backup and Disaster Recovery — Snapshots, database dumps, off-server backups, rebuild runbook

Each post stands alone — start wherever your server needs the most attention.

Baamaapii
