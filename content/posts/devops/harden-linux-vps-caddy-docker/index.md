---
title: "Harden a Linux VPS Running Caddy, PHP, and Docker"
date: 2026-03-08
categories: [devops]
tags: [security, linux, docker, fail2ban]
summary: "Audit and harden a production VPS: SSH root login, exposed service bindings, and fail2ban jails for web traffic and repeat offenders."
slug: "harden-linux-vps-caddy-docker"
draft: true
archived: true
archived_date: 2026-03-20
sitemap:
  disable: true
robotsNoIndex: true
---

Ahnii!

A fresh VPS from a hosting provider usually comes with some sensible defaults — but not all of them. This post covers an audit of a server running [Caddy](https://caddyserver.com/), PHP 8.4, and Docker — what was already solid, and the four gaps worth closing.

## What Was Already in Place

Before adding anything, check what you have.

```bash
sudo ufw status verbose
grep -E "^PermitRootLogin|^PasswordAuthentication" /etc/ssh/sshd_config /etc/ssh/sshd_config.d/*.conf 2>/dev/null
dpkg -l unattended-upgrades | grep ^ii
fail2ban-client status
```

On this server, four things were already in good shape:

- **[UFW](https://wiki.ubuntu.com/UncomplicatedFirewall)** — default-deny incoming, only ports 22, 80, and 443 open publicly.
- **Key-only SSH** — `PasswordAuthentication no` set via a cloud-init drop-in. No password brute-force possible.
- **[Unattended Upgrades](https://wiki.debian.org/UnattendedUpgrades)** — security patches apply automatically.
- **[fail2ban](https://github.com/fail2ban/fail2ban) sshd jail** — SSH brute-force attempts trigger a ban after too many failures.

That's a reasonable baseline. But the audit surfaced four more things to fix.

## Disable Root SSH Login

The server had `PermitRootLogin yes` in `/etc/ssh/sshd_config`. Even with key-only auth, allowing root to connect directly is unnecessary. Use a drop-in file instead of editing the main config — it's easier to track and survives package upgrades.

```bash
echo "PermitRootLogin prohibit-password" | sudo tee /etc/ssh/sshd_config.d/99-hardening.conf
sudo systemctl reload ssh
```

`prohibit-password` blocks password and keyboard-interactive auth for root while still allowing key-based access if you ever need it for recovery. To verify the active setting:

```bash
sshd -T | grep permitrootlogin
```

## Bind Exposed Services to Localhost

Listing open sockets revealed Redis and a Postgres container both bound to `0.0.0.0`:

```bash
ss -tlnp | grep -E "6379|5432"
```

```text
LISTEN  0.0.0.0:6379  ...  north-cloud-redis-1
LISTEN  0.0.0.0:5432  ...  north-cloud-postgres-crawler-1
```

UFW blocked external access, but Docker manipulates iptables directly and can bypass UFW rules entirely. Binding to `0.0.0.0` means a firewall rule change or Docker network misconfiguration could expose these ports without warning.

Both services are defined in a `docker-compose.base.yml`. The fix is a two-character prefix on the port mapping:

```yaml
# Before
ports:
  - "${REDIS_PORT:-6379}:6379"
  - "${POSTGRES_CRAWLER_PORT:-5433}:5432"

# After
ports:
  - "127.0.0.1:${REDIS_PORT:-6379}:6379"
  - "127.0.0.1:${POSTGRES_CRAWLER_PORT:-5433}:5432"
```

`127.0.0.1:` before the host port tells Docker to bind only to the loopback interface. Internal Docker-to-Docker traffic is unaffected — containers communicate over the Docker network using service names, not host ports.

Restart the affected containers to apply the change:

```bash
docker compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d --no-deps redis postgres-crawler
```

Verify the binding changed:

```bash
docker ps --format "{{.Names}}\t{{.Ports}}" | grep -E "redis|crawler"
```

```text
north-cloud-redis-1         127.0.0.1:6379->6379/tcp
north-cloud-postgres-crawler-1  127.0.0.1:5432->5432/tcp
```

## Add a fail2ban Jail for Web Traffic

The default fail2ban setup only covered SSH. The web server was unprotected — scanner bots probing for WordPress admin pages, PHP shells, and common CVEs were hitting the access logs with no consequences.

[Caddy](https://caddyserver.com/) writes JSON access logs. Create a filter that extracts the client IP and matches error status codes:

```ini
# /etc/fail2ban/filter.d/caddy-security.conf
[INCLUDES]
before = common.conf

[Definition]
datepattern = "ts":<F-TIME>%%s</F-TIME>

failregex = ^.*"remote_ip":"<HOST>".*"status":(?:40[0-5]|429|5\d\d).*$

ignoreregex =
```

`datepattern` tells fail2ban how to find the timestamp in Caddy's JSON format — `"ts"` holds a Unix epoch float. `failregex` matches lines where the client IP triggered a 400–405, 429, or any 5xx response.

Then create the jail:

```ini
# /etc/fail2ban/jail.d/caddy.conf
[caddy-security]
enabled  = true
port     = http,https
filter   = caddy-security
logpath  = /home/deployer/*/log/access.log
backend  = auto
maxretry = 20
findtime = 600
bantime  = 3600
```

`logpath` uses a glob — it covers all sites on the server, not just one. `backend = auto` lets fail2ban pick the right file-watching method (pyinotify on Linux). After 20 errors in 10 minutes, the IP is banned for an hour.

```bash
sudo fail2ban-client reload
grep "caddy-security" /var/log/fail2ban.log | tail -5
```

You'll see `Jail 'caddy-security' started` and, within minutes, `Found` entries for active scanners.

## Escalate Bans for Repeat Offenders

A one-hour ban doesn't deter a persistent attacker — they wait and come back. The recidive jail watches fail2ban's own log and escalates anyone who triggers multiple bans to a week-long all-ports block.

```ini
# /etc/fail2ban/jail.d/recidive.conf
[recidive]
enabled   = true
logpath   = /var/log/fail2ban.log
banaction = nftables[type=allports]
bantime   = 604800
findtime  = 86400
maxretry  = 5
```

`banaction = nftables[type=allports]` blocks every port, not just 80 and 443. `bantime = 604800` is seven days. After 5 bans within 24 hours, the IP disappears from the server entirely.

```bash
sudo fail2ban-client reload
grep "recidive" /var/log/fail2ban.log | tail -3
```

## Verify the Full Posture

After all changes, the server looks like this:

| Layer | Control |
|-------|---------|
| Network | UFW default-deny, ports 22/80/443 only |
| SSH | Key-only, root login prohibited |
| Services | Redis and Postgres bound to 127.0.0.1 |
| fail2ban | sshd + caddy-security + recidive |
| Patches | Unattended upgrades running |

None of this is exotic. It's the unglamorous work of closing gaps that are easy to overlook when a server is first provisioned — and easy for an attacker to find with an automated scanner.

Baamaapii
