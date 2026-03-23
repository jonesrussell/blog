---
title: "Docker Security on a Shared VPS"
date: 2026-03-23
categories: [devops]
tags: [linux, security, docker]
series: ["production-linux"]
series_order: 4
summary: "Why Docker bypasses your UFW rules, how to fix it, and container hardening practices that matter on a shared VPS."
slug: "docker-security-shared-vps"
draft: false
devto_id: 3386528
---

Ahnii!

[Docker](https://www.docker.com/) and your firewall aren't friends by default. This post explains why published ports bypass UFW entirely, two ways to fix it, and how to harden containers so they're not a liability on a shared VPS.

> This is part 4 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [UFW, fail2ban, and Banning Repeat Offenders]({{< relref "ufw-fail2ban-intrusion-response" >}}).

## Why Docker Bypasses UFW

UFW manages the **INPUT chain** — traffic destined for the host itself. Docker publishes ports by writing rules into the **FORWARD chain** via NAT/PREROUTING — traffic routed through the host to a container. These two chains don't interact.

When you run `docker run -p 6379:6379 redis`, Docker inserts iptables rules that forward external traffic on port 6379 directly to the container. UFW never sees it. Running `ufw status` and seeing port 6379 as inactive doesn't mean it's blocked — Docker has already opened it at a lower level.

This catches people off guard. Your firewall config looks correct, but your Redis instance is world-accessible.

## The DOCKER-USER Chain Fix

Docker provides the **DOCKER-USER chain** specifically for operator-defined rules. Rules here are evaluated before Docker's own rules, so you can block traffic before it reaches Docker's forwarding logic.

To restrict a published port to a specific IP (e.g., your bastion host at `203.0.113.10`):

```bash
sudo iptables -I DOCKER-USER -p tcp --dport 6379 ! -s 203.0.113.10 -j DROP
```

To block all external access to a port while allowing local Docker network traffic:

```bash
sudo iptables -I DOCKER-USER -p tcp --dport 6379 ! -s 127.0.0.1 -j DROP
```

These rules insert at the top of DOCKER-USER, so they evaluate first. The `! -s` syntax means "not from this source" — everything except the allowed address is dropped.

Rules added with `iptables` don't survive a reboot. Persist them with `iptables-persistent`:

```bash
sudo apt install iptables-persistent
sudo netfilter-persistent save
```

This saves your current iptables rules to `/etc/iptables/rules.v4` and restores them on boot.

## Bind Services to Localhost

The simpler fix for most situations: prefix port mappings with `127.0.0.1:`. Docker then binds the host-side socket to loopback only.

```yaml
# Before — binds to all interfaces, bypasses UFW
ports:
  - "${REDIS_PORT:-6379}:6379"

# After — binds to localhost only
ports:
  - "127.0.0.1:${REDIS_PORT:-6379}:6379"
```

Container-to-container traffic on Docker networks is unaffected — containers communicate over the Docker bridge, not the host's external interface. This change only restricts what's reachable from outside the host.

Verify your bindings after applying changes:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

This shows each container name alongside its port mappings. Any binding without a `127.0.0.1:` prefix is exposed on all interfaces.

## Container Hardening

Default Docker containers run with more privileges than they need. Add these options to your `docker-compose.yml` service definitions:

```yaml
services:
  app:
    image: myapp:latest
    user: "1000:1000"
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

**`user: "1000:1000"`** runs the container process as a non-root user. If your container image runs as root by default, this is the single highest-impact change you can make.

**`read_only: true`** mounts the container filesystem as read-only. Attackers can't write malware to disk. `tmpfs` entries give the process writable scratch space in memory for paths that legitimately need writes.

**`no-new-privileges:true`** prevents the process from gaining additional privileges via setuid binaries or file capabilities. A process that starts unprivileged stays unprivileged.

**`cap_drop: ALL`** removes all Linux capabilities. `cap_add` then grants only what the service actually needs — in this example, binding to ports below 1024. Most application containers need no capabilities at all.

## Scan Images With Trivy

A hardened runtime config doesn't help if your base image has known CVEs. [Trivy](https://aquasecurity.github.io/trivy/) scans container images for vulnerabilities.

Install and run a scan:

```bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
trivy image myimage:latest
```

Trivy queries a vulnerability database and reports CVEs by severity (CRITICAL, HIGH, MEDIUM, LOW). The output shows the package name, installed version, fixed version, and CVE identifier.

In CI, fail the pipeline on critical vulnerabilities:

```bash
trivy image --exit-code 1 --severity CRITICAL myimage:latest
```

`--exit-code 1` makes Trivy return a non-zero exit code when it finds vulnerabilities at or above the specified severity. Your pipeline rejects the image before it reaches production.

Pin images by digest in production to prevent silent tag mutations:

```yaml
image: redis@sha256:a1b2c3d4e5f6...
```

A tag like `redis:7` can be updated to point at a different image layer without notice. A digest is immutable.

## Rootless Docker

Rootless Docker runs the Docker daemon itself without root privileges. The daemon and all containers operate under your user account.

```bash
dockerd-rootless-setuptool.sh install
```

This is the highest isolation model available — a container escape doesn't yield root on the host. The tradeoff: privileged ports (below 1024) require a sysctl workaround, and some storage drivers and network features aren't supported. It's worth considering for high-risk workloads, but not a drop-in replacement for standard Docker without testing.

For most VPS deployments, localhost binding plus DOCKER-USER rules plus container hardening gives you the practical security gains without the compatibility overhead.

## Common Mistakes

**Publishing ports without a bind address:**

```yaml
# Bad — exposed on all interfaces
ports:
  - "6379:6379"

# Good — localhost only
ports:
  - "127.0.0.1:6379:6379"
```

Every port mapping without an explicit bind address is reachable from the internet, regardless of your UFW rules.

**Running containers as root with full capabilities:**

```yaml
# Bad — default root with all capabilities
services:
  app:
    image: myapp:latest

# Good — non-root, minimal capabilities
services:
  app:
    image: myapp:latest
    user: "1000:1000"
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
```

A container running as root with full capabilities gives an attacker everything they need after a container escape.

**Using mutable tags in production:**

```yaml
# Bad — tag can change without notice
image: redis:7

# Good — pinned to a specific digest
image: redis@sha256:a1b2c3d4e5f6...
```

A tag like `redis:7` can point to a different image tomorrow. Digests are immutable.

## Try It Yourself

Audit your running containers:

```bash
# Check for ports exposed on all interfaces
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -v 127.0.0.1

# Check which containers run as root
docker ps -q | xargs docker inspect --format '{{.Name}} user={{.Config.User}}' | grep 'user=$'

# Scan an image for CVEs
trivy image myimage:latest
```

If any containers show ports without `127.0.0.1:` or run with an empty user field, apply the fixes from this post.

## What's Next

Next in the series: Caddy Security Headers and Rate Limiting — covers TLS configuration, security headers, and request rate limiting at the reverse proxy layer.

Baamaapii
