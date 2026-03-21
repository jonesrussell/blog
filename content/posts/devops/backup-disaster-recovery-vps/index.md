---
title: "Backup and Disaster Recovery"
date: 2026-03-29
categories: [devops]
tags: [linux, backup, security]
series: ["production-linux"]
series_order: 10
summary: "Automate backups, test restores, and build a disaster recovery runbook for your VPS."
slug: "backup-disaster-recovery-vps"
draft: false
---

Ahnii!

> This is the final post in the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Monitoring, Alerting, and Incident Response]({{< relref "monitoring-alerting-incident-response" >}}).

Everything else in this series protects the server. This post protects you when the server is gone. Backups only count if you've tested restoring from them.

## DigitalOcean Snapshots

Enable automated weekly snapshots in the [DigitalOcean](https://www.digitalocean.com/) console under your droplet's Backups tab. Cost is 20% of your droplet's monthly price.

Snapshots are filesystem-level, not database-consistent. They're good for full-server recovery — restoring everything to a known state — but not for point-in-time database recovery. For that, you need database dumps.

## Database Dumps

**MariaDB:**

```bash
mysqldump --single-transaction --all-databases > /var/backups/db/dump-$(date +%F).sql
```

The `--single-transaction` flag creates a consistent snapshot without locking tables. Your application keeps running during the dump.

**Postgres:**

```bash
pg_dump -Fc dbname > /var/backups/db/dump-$(date +%F).dump
```

The custom format (`-Fc`) supports selective restore — you can restore individual tables instead of the whole database.

**Schedule with cron:**

```cron
0 3 * * * root /usr/local/bin/db-backup.sh
```

This runs your backup script at 3 AM daily. Store dumps on a separate volume or off the database server entirely.

## Off-Server Backups

Use [rclone](https://rclone.org/) to sync dumps to [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) or Backblaze B2. Before syncing, encrypt with GPG:

```bash
gpg -c /var/backups/db/dump-$(date +%F).sql
rclone sync /var/backups/db/ spaces:your-bucket/db-backups/
```

The `gpg -c` command encrypts with a passphrase. The `rclone sync` command mirrors your local backup directory to remote storage, removing files that no longer exist locally.

Here is a rotation script that keeps 7 daily, 4 weekly, and 3 monthly backups:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/db"
REMOTE="spaces:your-bucket/db-backups"
DATE=$(date +%F)
DAY=$(date +%u)   # 1=Monday, 7=Sunday
WEEK=$(date +%V)
MONTH=$(date +%d)

# Always create daily dump
mysqldump --single-transaction --all-databases | gpg -c --batch --passphrase-file /etc/backup.key > "${BACKUP_DIR}/daily-${DATE}.sql.gpg"

# Weekly copy on Sunday
if [ "$DAY" -eq 7 ]; then
  cp "${BACKUP_DIR}/daily-${DATE}.sql.gpg" "${BACKUP_DIR}/weekly-${WEEK}.sql.gpg"
fi

# Monthly copy on the 1st
if [ "$MONTH" -eq "01" ]; then
  cp "${BACKUP_DIR}/daily-${DATE}.sql.gpg" "${BACKUP_DIR}/monthly-$(date +%Y-%m).sql.gpg"
fi

# Prune old files
find "${BACKUP_DIR}" -name "daily-*.sql.gpg"   | sort | head -n -7  | xargs -r rm
find "${BACKUP_DIR}" -name "weekly-*.sql.gpg"  | sort | head -n -4  | xargs -r rm
find "${BACKUP_DIR}" -name "monthly-*.sql.gpg" | sort | head -n -3  | xargs -r rm

# Sync to remote
rclone sync "${BACKUP_DIR}/" "${REMOTE}/"
```

The `find | sort | head -n -N | xargs rm` pattern deletes everything except the N most recent files in each rotation tier.

## Test Your Restores

Spin up a test droplet from a recent snapshot. Verify it boots and that your services start without intervention.

Restore a database dump on the test droplet:

**MariaDB restore:**

```bash
mysql < /var/backups/db/dump-2026-03-29.sql
```

**Postgres restore:**

```bash
pg_restore -d dbname /var/backups/db/dump-2026-03-29.dump
```

After restoring, run your application's health check or smoke test. If you haven't tested restoring, it's not a backup — it's a hope.

## The Rebuild Runbook

How long from a fresh droplet to fully running? Map the steps now, before you need them:

1. Provision the droplet (see [Provision an Ubuntu VPS With a Deploy User]({{< relref "provision-ubuntu-vps-deploy-user" >}}))
2. Run the Ansible playbook (see [Manage DigitalOcean Infrastructure With Ansible]({{< relref "ansible-manage-digitalocean-laravel-infrastructure" >}})): `ansible-playbook site.yml`
3. Deploy the application: `dep deploy`
4. Restore the database from the latest dump
5. Verify services: `systemctl status`, health endpoints, logs

For a solo developer with a current Ansible playbook, recovery time should be under one hour. The bottleneck is usually the database restore, not the infrastructure setup.

Keep your runbook in a text file outside the server — in a git repo, a note, or a password manager. A runbook stored only on the failed server is not useful.

This series covered ten layers of a production Linux setup. Each layer handles a different attack surface or failure mode:

| Post | Layer | What It Protects |
|------|-------|-----------------|
| 1 | Provisioning | Baseline: deploy user, firewall, auto-updates |
| 2 | SSH | Access: ed25519 keys, no root login |
| 3 | Intrusion Response | Behavior: fail2ban, recidive, UFW |
| 4 | Docker | Containers: UFW bypass fix, hardening |
| 5 | Caddy | Web: security headers, rate limiting |
| 6 | Kernel/Systemd | Processes: sysctl, service sandboxing |
| 7 | Secrets | Credentials: .env, Vault, rotation |
| 8 | Maintenance | Patches: unattended-upgrades, cleanup |
| 9 | Monitoring | Detection: alerting, auditd, incident response |
| 10 | Recovery | Backups: snapshots, dumps, rebuild runbook |

No single post makes your server secure. All ten together give you a production setup you can maintain, recover from, and sleep at night knowing it's running.

Baamaapii
