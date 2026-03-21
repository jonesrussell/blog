---
title: "Kernel and Systemd Service Hardening"
date: 2026-03-25
categories: [devops]
tags: [linux, security, systemd]
series: ["production-linux"]
series_order: 6
summary: "Tune kernel parameters with sysctl and sandbox services with systemd to reduce your VPS attack surface."
slug: "kernel-systemd-hardening"
draft: false
---

Ahnii!

> This is part 6 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Caddy Hardening]({{< relref "caddy-security-headers-rate-limiting" >}}).

Previous posts locked down network access and hardened your services from the outside. This post restricts what processes can do once they are already running — at the kernel level with sysctl, and at the service level with systemd sandboxing.

## Sysctl Hardening

[sysctl](https://man7.org/linux/man-pages/man8/sysctl.8.html) exposes kernel parameters you can tune at runtime. Setting them in `/etc/sysctl.d/` makes them persist across reboots.

Create the file:

```bash
sudo nano /etc/sysctl.d/99-hardening.conf
```

Add the following configuration:

```ini
# Network stack
net.ipv4.conf.all.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Kernel
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
kernel.yama.ptrace_scope = 2
fs.suid_dumpable = 0
```

Apply the settings immediately without rebooting:

```bash
sudo sysctl --system
```

This reloads all files in `/etc/sysctl.d/` in order, so your new file takes effect alongside any existing system defaults.

### Network Settings

**`rp_filter = 1`** — Enables reverse path filtering. The kernel drops packets that arrive on an interface where routing would not send the reply back through the same interface. This defeats some IP spoofing attacks.

**`tcp_syncookies = 1`** — Enables SYN cookies. When the SYN backlog is full during a flood, the kernel responds with a cryptographic cookie instead of dropping the connection, keeping the service available.

**`accept_redirects = 0` / `send_redirects = 0`** — Disables ICMP redirect processing and sending. Attackers can use ICMP redirects to manipulate routing tables. Disable both directions on all interfaces, including IPv6.

**`accept_source_route = 0`** — Rejects packets with source routing options set. Source routing lets the sender specify the path through the network, which can be used to bypass firewall rules.

**`icmp_echo_ignore_broadcasts = 1`** — Ignores ICMP echo requests sent to broadcast addresses. This prevents your server from participating in Smurf amplification attacks.

### Kernel Settings

**`kptr_restrict = 2`** — Hides kernel symbol addresses from all users, including root. Kernel addresses in `/proc/kallsyms` and similar interfaces are useful for exploit development. Restricting them raises the bar for local privilege escalation.

**`dmesg_restrict = 1`** — Limits `dmesg` output to root. Kernel messages can leak memory addresses, hardware details, and timing information useful to an attacker with a foothold.

**`yama.ptrace_scope = 2`** — Restricts `ptrace` to processes with `CAP_SYS_PTRACE`. By default, any process can attach a debugger to another process it owns. Scope 2 requires an explicit capability, limiting what a compromised service can inspect.

**`fs.suid_dumpable = 0`** — Prevents core dumps from setuid processes. A core dump from a setuid binary can contain privileged memory, including credentials or cryptographic keys.

## Systemd Service Sandboxing

[systemd](https://systemd.io/) can restrict what a service is allowed to access, even if the process itself is compromised. You apply these restrictions through override files rather than editing the upstream unit file directly, so they survive package upgrades.

The key directives:

| Directive | Effect |
|---|---|
| `ProtectSystem=strict` | Mounts the filesystem read-only except for explicitly allowed paths |
| `ProtectHome=yes` | Makes `/home`, `/root`, and `/run/user` inaccessible |
| `PrivateTmp=yes` | Gives the service its own isolated `/tmp` and `/var/tmp` |
| `NoNewPrivileges=yes` | Prevents the process from gaining privileges via setuid or file capabilities |
| `ReadWritePaths=` | Lists specific paths the service is allowed to write to |

### PHP-FPM Override

```bash
sudo systemctl edit php8.4-fpm
```

This opens a blank override file at `/etc/systemd/system/php8.4-fpm.service.d/override.conf`. Add:

```ini
[Service]
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
NoNewPrivileges=yes
ReadWritePaths=/var/log/php8.4-fpm /run/php /var/lib/php/sessions
```

PHP-FPM needs write access to its socket directory, log directory, and session storage. Everything else on the filesystem becomes read-only from the service's perspective.

### Caddy Override

```bash
sudo systemctl edit caddy
```

Add:

```ini
[Service]
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
NoNewPrivileges=yes
ReadWritePaths=/var/log/caddy /var/lib/caddy /run/caddy
```

[Caddy](https://caddyserver.com/) writes TLS certificates to `/var/lib/caddy` and logs to `/var/log/caddy`. The `ReadWritePaths` list gives it exactly what it needs and nothing more.

After editing both overrides, reload systemd and restart the services:

```bash
sudo systemctl daemon-reload
sudo systemctl restart php8.4-fpm caddy
```

`daemon-reload` tells systemd to re-read all unit files, including your new override files.

## Audit Your Services

[`systemd-analyze security`](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html) scores each service on a scale from 0 to 10, where lower means more sandboxed.

Run it across all running services:

```bash
systemd-analyze security
```

Focus on the services you control. System services managed by your distribution are often intentionally privileged. A score above 7 for a service like `caddy` or `php8.4-fpm` means there are straightforward restrictions you have not applied yet.

Check a specific service after applying an override:

```bash
systemd-analyze security caddy
```

This shows a breakdown of which directives are set and which are missing, along with the weight each contributes to the score. Use it iteratively — apply a directive, reload, check the score — until you reach an acceptable level.

After applying the overrides above, both Caddy and PHP-FPM should score in the 2–4 range. That is not perfect, but it is a significant reduction from the default of 9+.

Baamaapii
