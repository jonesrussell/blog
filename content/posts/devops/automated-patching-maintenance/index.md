---
title: "Automated Patching and Server Maintenance"
date: 2026-03-27
categories: [devops]
tags: [linux, security]
series: ["production-linux"]
series_order: 8
summary: "Configure automatic security patches, detect stale services with needrestart, and keep logs and Docker images from filling your disk."
slug: "automated-patching-maintenance"
draft: false
---

Ahnii!

> This is part 8 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Secrets, Certificates, and Credential Rotation]({{< relref "secrets-certificates-credential-management" >}}).

Security patches mean nothing if they're not applied. This post covers automated patching, detecting stale services, and the maintenance tasks that keep your server from slowly filling its disk.

## Unattended Upgrades

Install the package:

```bash
apt install unattended-upgrades
```

This installs the daemon that applies package updates on a schedule without manual intervention.

Edit `/etc/apt/apt.conf.d/50unattended-upgrades` to control what gets upgraded:

```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    // "${distro_id}:${distro_codename}-updates";
};

Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";

Unattended-Upgrade::Mail "you@example.com";
```

The `Allowed-Origins` block limits upgrades to the security pocket only. The commented-out `-updates` line is intentional — applying all updates on production carries more risk than applying security fixes alone. The automatic reboot window at 04:00 ensures the server restarts after kernel patches during low-traffic hours.

Verify your configuration without making changes:

```bash
unattended-upgrades --dry-run --debug
```

This prints the packages that would be upgraded and any configuration errors, so you can confirm your settings before relying on them.

## Needrestart: Detect Stale Services

[needrestart](https://github.com/liske/needrestart) detects services that are still running against old shared library versions after an upgrade — a common source of "I updated the package but the vulnerability is still exploitable" situations.

```bash
apt install needrestart
```

Configure it to restart services automatically rather than prompting. Edit `/etc/needrestart/needrestart.conf`:

```perl
$nrconf{restart} = 'a';
```

The `'a'` mode restarts services automatically. The default `'i'` mode is interactive, which blocks unattended upgrade runs. Setting `'a'` ensures services pick up updated libraries without manual intervention.

Run needrestart in batch mode to check current status:

```bash
needrestart -b
```

This outputs a machine-readable list of services that need restarting, suitable for log review or scripting.

## Log Rotation

Without rotation, application logs accumulate until they fill the disk. [logrotate](https://linux.die.net/man/8/logrotate) handles this automatically.

Create `/etc/logrotate.d/caddy`:

```
/var/log/caddy/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload caddy > /dev/null 2>&1 || true
    endscript
}
```

`rotate 14` keeps 14 days of logs. `compress` gzip-compresses rotated files; `delaycompress` skips compression on the most recent rotated file so Caddy can finish writing to it before gzip runs. The `postrotate` script signals Caddy to reopen its log file handles.

Test the configuration without rotating anything:

```bash
logrotate --debug /etc/logrotate.d/caddy
```

The debug output shows what logrotate would do, including which files it would rotate and compress.

## Docker Cleanup

Unused Docker images, stopped containers, and dangling build cache accumulate quickly on a busy server.

Remove stopped containers, unused networks, and dangling images:

```bash
docker system prune -f
```

Remove images that haven't been used in 30 days:

```bash
docker image prune -a --filter "until=720h"
```

The `720h` filter targets images older than 30 days. This is conservative enough to avoid removing images you're actively using across deployments, while reclaiming space from old build artifacts.

Automate cleanup with a weekly cron job. Add to `/etc/cron.weekly/docker-cleanup` or via crontab:

```
0 3 * * 0 root docker system prune -f && docker image prune -a --filter "until=720h" -f
```

This runs at 03:00 every Sunday. Check current Docker disk usage at any time:

```bash
docker system df
```

The output breaks down space used by images, containers, volumes, and build cache.

## Disk Monitoring

Check current partition usage:

```bash
df -h
```

For automated alerting, a simple script handles the common case:

```bash
#!/bin/bash
THRESHOLD=80
df -h | awk 'NR>1 {gsub(/%/,"",$5); if ($5 > '"$THRESHOLD"') print "WARN: "$6" at "$5"%"}'
```

Save this to `/usr/local/bin/check-disk` and make it executable. Run it from cron or your monitoring system to get warnings before a full disk causes an outage.

Post 9 covers monitoring and alerting in depth — including structured log shipping and uptime checks.

Baamaapii
