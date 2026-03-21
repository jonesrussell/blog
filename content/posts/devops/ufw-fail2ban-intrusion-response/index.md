---
title: "UFW, fail2ban, and Banning Repeat Offenders"
date: 2026-03-22
categories: [devops]
tags: [linux, security, fail2ban, caddy]
series: ["production-linux"]
series_order: 3
aliases: ["/harden-linux-vps-caddy-docker/"]
summary: "Configure UFW rules, build a fail2ban jail for Caddy access logs, and escalate bans for repeat offenders with the recidive jail."
slug: "ufw-fail2ban-intrusion-response"
draft: false
---

Ahnii!

> This is part 3 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [SSH Hardening]({{< relref "ssh-hardening-ed25519-disable-root" >}}).

UFW blocks ports. [fail2ban](https://github.com/fail2ban/fail2ban) blocks behavior. Together they form your server's intrusion response layer — UFW narrows the attack surface, fail2ban watches the traffic that gets through and bans the IPs that misbehave.

This post covers UFW rule ordering, building a fail2ban jail for Caddy's JSON access logs, and escalating repeat offenders to a week-long all-ports block with the recidive jail.

## UFW Beyond the Basics

If UFW isn't installed, add it:

```bash
apt install ufw
```

Install the package. On most Ubuntu VPS images it's already present.

**Allow SSH before enabling UFW.** This is the most common mistake. If you enable UFW without allowing SSH first, you will lock yourself out of the server.

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
```

These three rules cover SSH, HTTP, and HTTPS. Add any other ports your services need before the next step.

```bash
ufw enable
```

Enabling UFW applies the default policy — deny incoming, allow outgoing — and activates your rules.

### Rule Ordering

UFW evaluates rules in order and stops at the first match. Check your current rules with their index numbers:

```bash
ufw status numbered
```

This shows each rule prefixed with a number, which you'll need for deletions.

To delete a rule, pass its number:

```bash
ufw delete 3
```

UFW removes the rule at position 3 and renumbers the rest.

### Logging

UFW's default logging is sparse. Raise it to see blocked connection attempts:

```bash
ufw logging medium
```

Logs go to `/var/log/ufw.log`. The `medium` level records blocked packets with source IP, destination port, and protocol — enough detail to spot scan patterns without flooding your disk.

## How fail2ban Works

fail2ban watches log files through a pipeline: log → filter → jail → action.

- **Filter** — a regex that extracts a client IP and timestamp from a log line
- **Jail** — combines a filter with thresholds: how many matches (`maxretry`) within what window (`findtime`) triggers a ban, and how long that ban lasts (`bantime`)
- **Action** — what happens when the threshold is crossed; typically an nftables or iptables rule that drops traffic from the offending IP

Install fail2ban:

```bash
apt install fail2ban
systemctl enable --now fail2ban
```

The second command ensures fail2ban starts on boot and is running now.

## A fail2ban Jail for Caddy

Caddy writes structured JSON access logs. The filter below extracts the client IP and timestamp from that format.

```ini
# /etc/fail2ban/filter.d/caddy-security.conf
[INCLUDES]
before = common.conf

[Definition]
datepattern = "ts":<F-TIME>%%s</F-TIME>
failregex = ^.*"remote_ip":"<HOST>".*"status":(?:40[0-5]|429|5\d\d).*$
ignoreregex =
```

`datepattern` tells fail2ban where to find the timestamp — Caddy's `"ts"` field holds a Unix epoch float. `failregex` matches any log line where the client triggered a 400–405, 429, or 5xx response. `<HOST>` is fail2ban's placeholder for the IP it will extract and ban.

Now create the jail that uses this filter:

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

`logpath` uses a glob to cover every app's log directory under `/home/deployer/`. `backend = auto` lets fail2ban choose the most efficient log-watching method for your system. With these settings, an IP hitting 20 errors in 10 minutes earns a one-hour ban on ports 80 and 443.

Test your filter against a real log file before reloading:

```bash
fail2ban-regex /home/deployer/myapp/log/access.log /etc/fail2ban/filter.d/caddy-security.conf
```

This runs the regex against the log and reports how many lines match, how many were skipped, and the IPs it would have banned. Fix the filter until you see matches before deploying.

Reload fail2ban to apply the new jail:

```bash
fail2ban-client reload
```

## Escalate With the Recidive Jail

A one-hour ban on web ports doesn't discourage determined attackers — they rotate IPs or wait it out. The recidive jail watches fail2ban's own log and escalates IPs that keep getting banned.

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

`banaction = nftables[type=allports]` blocks every port, not just 80 and 443. nftables is the modern Linux firewall backend; iptables is the legacy compatibility layer and should be avoided on current systems. `bantime = 604800` is seven days in seconds. An IP that triggers 5 separate bans within 24 hours gets blocked on all ports for a week.

This jail requires no custom filter — it reads fail2ban's own log format out of the box.

## CrowdSec: Collective Intelligence

[CrowdSec](https://www.crowdsec.net/) takes a different approach. Instead of reacting to behavior on your server, it uses a crowd-sourced blocklist built from reports across all CrowdSec users. When an IP attacks one server, every server in the network can block it proactively.

For a single VPS, fail2ban is simpler and has lower resource requirements. CrowdSec becomes compelling when you manage multiple servers — the shared intelligence means a scanner that hits one box gets blocked on all of them. It also ships with pre-built parsers for Caddy, Nginx, SSH, and dozens of other services.

CrowdSec isn't a drop-in fail2ban replacement; the two can run side by side. A common pattern is to run fail2ban for reactive banning and subscribe to CrowdSec's blocklist for proactive blocking. If you're scaling beyond a single VPS, it's worth evaluating.

## Verify Your Jails

Check that fail2ban loaded your jails:

```bash
fail2ban-client status
```

This lists every active jail by name.

Inspect a specific jail:

```bash
fail2ban-client status caddy-security
```

The output shows the filter in use, current ban count, and the list of currently banned IPs.

To see recent ban activity in the log:

```bash
grep "Ban\|Unban" /var/log/fail2ban.log | tail -20
```

This filters the fail2ban log to show only ban and unban events, newest last.

Confirm nftables is enforcing the recidive bans:

```bash
nft list ruleset | grep fail2ban
```

If the recidive jail has fired, you'll see chains and rules named after fail2ban in the output.

Baamaapii
