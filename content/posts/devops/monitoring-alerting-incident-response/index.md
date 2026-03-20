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

Ahnii!

> This is part 9 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Automated Patching and Server Maintenance]({{< relref "automated-patching-maintenance" >}}).

Everything in this series so far has been preventive — hardening, firewalls, secrets management, automated patching. Prevention matters, but it is not enough. At some point something will go wrong: a service crashes, a certificate expires, a login attempt succeeds when it should not. This post covers detection and response — knowing when something breaks and what to do about it.

## What to Monitor

You do not need a full observability stack for one or two servers. You need enough signal to catch problems early. These are the most useful things to watch:

- **fail2ban ban rate** — A sudden spike in bans means an active attack is hitting your server. Normal background noise is a handful of bans per day.
- **Disk usage** — Logs, Docker images, and database dumps grow silently. A full disk causes service failures that are confusing to diagnose.
- **Memory and CPU** — Sustained high usage often means a runaway process, a memory leak, or an underpowered server for the workload.
- **Systemd service health** — A service can fail quietly if you are not watching. `systemctl is-active caddy` returns "active" or "failed" — simple to script.
- **TLS certificate expiry** — Caddy auto-renews certificates, but renewal can fail. A certificate expiring in production takes your site offline.
- **SSH login events** — Successful logins from unexpected IPs are an immediate investigation trigger. Failed logins are noise; successful ones are not.

## Lightweight Alerting

This is not a Prometheus and Grafana post. That stack is powerful but it is overkill for a solo developer running one or two servers. Use the right tool for the scale.

**[DigitalOcean Monitoring](https://docs.digitalocean.com/products/monitoring/)** — If your VPS is on DigitalOcean, you already have free built-in monitoring. Enable it in the control panel and set threshold alerts for CPU, disk, and memory. No configuration on the server required.

**[Uptime Kuma](https://github.com/louislam/uptime-kuma)** — Self-hosted uptime monitoring with a clean web UI. Monitors HTTP endpoints, TCP ports, and DNS. Sends alerts via email, Slack, Telegram, and more. Run it as a Docker container on the same server or a separate cheap VPS.

**[Healthchecks.io](https://healthchecks.io/)** — Monitors cron jobs using a ping-based model. Your cron job sends an HTTP request to a unique URL after it succeeds. If the ping does not arrive on schedule, Healthchecks.io sends you an alert. Free tier covers several checks.

For custom thresholds, a simple shell script is often enough:

```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

ALERT_EMAIL="you@example.com"
DISK_THRESHOLD=85
SERVICES="caddy docker"

# Check disk usage
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
  echo "ALERT: Disk usage at ${DISK_USAGE}% on $(hostname)" | \
    mail -s "Disk Alert: $(hostname)" "$ALERT_EMAIL"
fi

# Check service status
for SERVICE in $SERVICES; do
  if ! systemctl is-active --quiet "$SERVICE"; then
    echo "ALERT: $SERVICE is not running on $(hostname)" | \
      mail -s "Service Down: $SERVICE on $(hostname)" "$ALERT_EMAIL"
  fi
done
```

This script checks disk usage against a threshold and verifies each listed service is active. Drop it in a cron job to run every five or ten minutes via a `healthchecks.io` monitored cron entry.

## auditd for Security Events

[auditd](https://man7.org/linux/man-pages/man8/auditd.8.html) is the Linux audit daemon. It logs security-relevant kernel events — file access, user changes, privilege escalation — to a structured log you can query later.

Install it:

```bash
sudo apt install auditd audispd-plugins
sudo systemctl enable --now auditd
```

This installs the daemon and enables it at boot. The `audispd-plugins` package adds dispatch support for forwarding events to other systems if needed.

Create a rules file at `/etc/audit/rules.d/hardening.rules`:

```
# Delete existing rules
-D

# Buffer size
-b 8192

# Failure mode: 1 = log, 2 = panic
-f 1

# Monitor sudo usage
-w /usr/bin/sudo -p x -k sudo_usage

# Monitor /etc/passwd and /etc/shadow changes
-w /etc/passwd -p wa -k identity_changes
-w /etc/shadow -p wa -k identity_changes
-w /etc/group -p wa -k identity_changes

# Monitor SSH authorized_keys changes
-w /root/.ssh/authorized_keys -p wa -k ssh_keys
-w /home -p wa -k home_ssh_keys

# Monitor cron changes
-w /etc/cron.d/ -p wa -k cron_changes
-w /var/spool/cron/crontabs/ -p wa -k cron_changes

# Monitor su usage
-w /bin/su -p x -k su_usage

# Make rules immutable until reboot
-e 2
```

Each `-w` line watches a path. The `-p` flag sets the permission triggers: `r` (read), `w` (write), `x` (execute), `a` (attribute change). The `-k` flag tags events with a search key.

Reload the rules:

```bash
sudo augenrules --load
```

Query the audit log by key:

```bash
# See all sudo invocations
sudo ausearch -k sudo_usage

# See authentication report
sudo aureport --auth

# See failed authentication attempts
sudo aureport --auth --failed

# See events from the last hour
sudo ausearch --start recent -k identity_changes
```

These commands give you a searchable record of who ran sudo, when passwords were changed, and whether any authorized_keys files were modified.

## Post-Incident Checklist

When something goes wrong, work through this list in order before jumping to conclusions.

**1. Check recent service logs**

```bash
journalctl -u caddy --since "1 hour ago"
journalctl -u docker --since "1 hour ago" --no-pager
```

Service logs tell you whether a crash happened, what the last error was, and when the problem started.

**2. Check authentication logs**

```bash
sudo grep "Accepted\|Failed\|Invalid" /var/log/auth.log | tail -50
```

Look for successful logins from IPs you do not recognize. Failed attempts are expected; successful ones from unknown sources are not.

**3. Check fail2ban status**

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

A high ban count that appeared suddenly tells you an attack was in progress. Cross-reference the banned IPs with your auth log.

**4. Review login history**

```bash
last -20
lastb -20
```

`last` shows successful logins; `lastb` shows failed login attempts. Look for logins at unusual times or from unfamiliar locations.

**5. Check running processes**

```bash
ps auxf
```

Look for processes you do not recognize, especially ones running as root or as your deploy user. A process with a name that looks like a legitimate system tool but is running from `/tmp` or a home directory is a red flag.

**6. Query the audit log**

```bash
sudo ausearch -k sudo_usage --start today
sudo aureport --auth --failed
```

If someone escalated privileges or modified system files, auditd has a record of it.

### Patch or Rebuild

After an incident, you face a decision: fix in place or rebuild from scratch.

**Patch in place** if you can identify exactly what happened, understand the full scope of the damage, and fix it cleanly. A crashed service with a known OOM error is a patch-in-place situation.

**Rebuild from Ansible** if you cannot fully explain what happened. If you found an unexpected process, a modified binary, or a login you cannot account for, assume the server is compromised. Treat it as untrusted and rebuild from your Ansible playbooks. The next post in this series covers exactly that.

Document what happened regardless. Even a short note to yourself — what failed, when, what you found, what you changed — pays off the next time something similar occurs.

Baamaapii
