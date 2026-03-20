# VPS Hardening Research (2025-2026) — Blog Post Enhancement Notes

Research findings for enhancing `content/posts/devops/harden-linux-vps-caddy-docker/index.md`.

---

## 1. SSH Hardening

**Current post:** Uses `PermitRootLogin prohibit-password`.

**Finding:** `PermitRootLogin no` is now the standard recommendation (2025-2026). The reasoning: create a regular user with sudo, connect as that user. This requires an attacker to compromise both the SSH key AND the sudo password. `prohibit-password` still allows key-based root login, which is unnecessary if you have a sudo user. The post should switch to `no` or at minimum explain the trade-off and recommend `no` as the stronger option.

**Additional SSH hardening the post is missing:**
- **Ed25519-only keys:** Ed25519 is the recommended key type — faster, smaller, simpler implementation, fewer side-channel risks. Add to the hardening drop-in: `PubkeyAcceptedAlgorithms ssh-ed25519,sk-ssh-ed25519@openssh.com`
- **Disable unused auth methods:** `KbdInteractiveAuthentication no`, `ChallengeResponseAuthentication no`, `GSSAPIAuthentication no`, `X11Forwarding no`
- **FIDO2/hardware keys:** Mention `sk-ssh-ed25519@openssh.com` for hardware-backed keys as the gold standard
- **SSH certificates:** Emerging practice for team environments (short-lived certs from a CA instead of long-lived authorized_keys), but overkill for a single-admin VPS

**Sources:**
- https://www.brandonchecketts.com/archives/ssh-ed25519-key-best-practices-for-2025
- https://www.sshaudit.com/hardening_guides.html
- https://www.hostiserver.com/community/articles/ssh-security-and-key-authentication

---

## 2. Docker + UFW Interaction

**Current post:** States "Docker manipulates iptables directly and can bypass UFW rules entirely" — this is still 100% accurate in 2026.

**Why it happens:** Docker routes container traffic through the FORWARD chain (via NAT/PREROUTING), not the INPUT chain where UFW rules live. Published ports bypass UFW completely.

**Solutions the post could mention (ranked):**

1. **Bind to 127.0.0.1 (post already does this)** — simplest and most effective for services that don't need external access
2. **Don't publish ports at all** — use Docker networks for inter-container communication; only the reverse proxy (Caddy) needs a published port
3. **DOCKER-USER chain** — Docker provides this chain for user-defined rules evaluated before Docker's own rules. Rules persist across Docker restarts but need `iptables-persistent` for reboots:
   ```bash
   sudo iptables -I DOCKER-USER -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
   sudo iptables -I DOCKER-USER -p tcp --dport 80 -j RETURN
   sudo iptables -I DOCKER-USER -p tcp --dport 443 -j RETURN
   sudo iptables -A DOCKER-USER -j DROP
   ```
4. **ufw-docker utility** — third-party wrapper (github.com/chaifeng/ufw-docker) that modifies UFW's after.rules to properly filter Docker traffic
5. **`"iptables": false` in daemon.json** — disables Docker's iptables management entirely, but requires manual networking setup. Only for experienced admins.
6. **nftables backend** — Docker now supports `"firewall-backend": "nftables"` in daemon.json. No DOCKER-USER chain equivalent yet; use separate nftables tables with matching hook points and priority.

**Recommendation for the post:** Add a note/callout explaining WHY Docker bypasses UFW (FORWARD vs INPUT chain) and mention the DOCKER-USER chain as the proper fix for cases where you must publish ports externally.

**Sources:**
- https://zeonedge.com/am/blog/ufw-docker-firewall-bypass-fix
- https://docs.docker.com/engine/network/packet-filtering-firewalls/
- https://docs.docker.com/engine/network/firewall-nftables/
- https://github.com/chaifeng/ufw-docker

---

## 3. fail2ban vs Alternatives

**Current post:** Uses fail2ban with nftables banaction. This is solid.

**fail2ban status (2026):** Still the standard for single-server, resource-constrained VPS. Minimal dependencies, battle-tested since 2004, works well.

**CrowdSec:** The main emerging alternative (launched 2020). Key differentiator is **collective intelligence** — a crowd-sourced blocklist of known malicious IPs shared across all CrowdSec users. Better for:
- Multi-server environments
- Proactive blocking (block IPs before they hit you)
- Behavioral analysis beyond simple log pattern matching
- Higher resource requirements than fail2ban

**SSHGuard:** Lightweight, zero dependencies, SSH-focused. Less flexible than fail2ban for multi-service setups.

**Recommendation for the post:** fail2ban is the right choice for a single VPS. Optionally mention CrowdSec as an alternative worth exploring for multi-server setups, or as a complement (fail2ban for fast local bans, CrowdSec for proactive threat intel). The `nftables` banaction the post already uses is the correct modern choice over iptables.

**Sources:**
- https://www.crowdsec.net/blog/crowdsec-not-your-typical-fail2ban-clone
- https://onidel.com/blog/fail2ban-vs-crowdsec-vps-2025
- https://medium.com/@sriranjankapilan/beyond-fail2ban-how-crowdsec-revolutionizes-vm-server-security-with-collective-intelligence-1a9f5fd25def

---

## 4. Caddy-Specific Hardening

**Current post:** Mentions Caddy JSON logs for fail2ban but no Caddy-specific hardening.

**Security headers to add to Caddyfile:**
```
header / {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options nosniff
    X-Frame-Options SAMEORIGIN
    Referrer-Policy strict-origin-when-cross-origin
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    -Server
    -X-Powered-By
}
```

**Rate limiting:** Caddy has a rate limiting module (`mholt/caddy-ratelimit`):
```
route /api/* {
    rate_limit {
        zone api_zone {
            key {remote_ip}
            events 100
            window 1s
        }
    }
}
```

**Request body size limits:**
```
route /api/* {
    request_body {
        max_size 100MB
    }
}
```

**TLS hardening:** Caddy defaults are already strong (TLS 1.2+ with good ciphers), but you can enforce TLS 1.3 only:
```
tls {
    protocols tls1.3
}
```

**CRITICAL — Caddy CVEs in 2026:** Multiple high-severity vulnerabilities were disclosed in March 2026 affecting v2.10.0 through v2.11.1 (header injection/privilege escalation, Host matcher, Path matcher, TLS client auth, file matcher, FastCGI transport). The post should emphasize keeping Caddy updated and mention `caddy upgrade`.

**Sources:**
- https://hackviser.com/tactics/hardening/caddy
- https://github.com/mholt/caddy-ratelimit
- https://paulbradley.dev/caddyfile-web-security-headers/
- https://dailycve.com/caddy-privilege-escalation-via-header-injection-cve-2026-nnnn-high/

---

## 5. Container Security (Beyond localhost binding)

**Current post:** Only covers binding to 127.0.0.1.

**2026 best practices the post is missing:**

- **Run as non-root:** Use `USER` directive in Dockerfile. Never run containers as root.
- **Read-only filesystem:** `--read-only` flag + writable tmpfs for `/tmp` if needed. Stops persistence attacks.
- **Drop all capabilities, add back selectively:**
  ```yaml
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE  # only if needed
  ```
- **no-new-privileges:** Prevents privilege escalation within the container.
- **Seccomp profiles:** Default profile blocks ~44 dangerous syscalls. Custom profiles can restrict to ~40-50 essential calls.
- **User namespaces:** Remap container root to unprivileged host user.
- **Image scanning:** Trivy in CI/CD pipeline (`trivy image --exit-code 1 --severity CRITICAL myapp:latest`)
- **Pin images by digest, not tag** — tags are mutable.
- **Never mount Docker socket** into containers.
- **Memory/CPU limits** to prevent resource exhaustion.
- **Use `internal: true`** on Docker networks that don't need internet access.
- **Docker Bench Security** — run periodically to audit configuration.

**Stats:** Container security incidents increased 47% YoY in 2025. Top vectors: vulnerable base images (32%), root containers (28%), exposed Docker sockets (18%).

**Sources:**
- https://zeonedge.com/blog/docker-security-best-practices-2026-hardening-containers-build-runtime
- https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- https://thelinuxcode.com/docker-security-best-practices-2026-hardening-the-host-images-and-runtime-without-slowing-teams-down/

---

## 6. General VPS Hardening (Missing from the post)

**Kernel/sysctl hardening** — add to `/etc/sysctl.d/99-hardening.conf`:
```ini
# Network stack
net.ipv4.conf.all.rp_filter = 1              # Source address verification
net.ipv4.tcp_syncookies = 1                   # SYN flood protection
net.ipv4.conf.all.accept_redirects = 0        # Disable ICMP redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0     # Disable source routing
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Kernel
kernel.kptr_restrict = 2                      # Restrict kernel pointer access
kernel.dmesg_restrict = 1                      # Restrict dmesg access
kernel.yama.ptrace_scope = 2                   # Restrict ptrace
fs.suid_dumpable = 0                           # No core dumps from setuid
```

**AppArmor/SELinux:** Ubuntu ships with AppArmor by default — ensure profiles are enforcing for Docker, PHP-FPM, and Caddy.

**Audit logging:** Configure `auditd` for Docker-related activities (daemon config changes, container creation, image pulls, volume mounts).

**Systemd hardening** for services (Caddy, PHP-FPM):
```ini
[Service]
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
NoNewPrivileges=true
ReadWritePaths=/var/log/caddy /var/lib/caddy
```

**Disable unused services:** `systemctl list-unit-files --state=enabled` and disable what you don't need.

**Live kernel patching:** Services like KernelCare or Canonical Livepatch avoid reboots for kernel security updates.

**Sources:**
- https://zeonedge.com/sr/blog/linux-server-hardening-checklist
- https://retzor.com/blog/vps-security-hardening-25-point-checklist-for-2025/
- https://oneuptime.com/blog/post/2026-03-02-how-to-harden-ubuntu-server-a-complete-security-checklist/view
- https://madaidans-insecurities.github.io/guides/linux-hardening.html

---

## 7. Unattended Upgrades

**Current post:** Mentions unattended-upgrades are running.

**Still the standard in 2026:** Yes. Configure for security-only updates (not feature updates) on production servers.

**Gotchas:**
- Ensure `Unattended-Upgrade::Automatic-Reboot` is configured (either auto-reboot at a maintenance window or use `needrestart` to flag services needing restart)
- Monitor `/var/log/unattended-upgrades/` for failures
- Consider Canonical Livepatch for kernel updates without reboots
- `needrestart` package auto-restarts daemons after library updates (default on Ubuntu 22.04+)

**No better alternative** for Debian/Ubuntu — unattended-upgrades remains the right tool.

---

## Summary: Recommended Post Enhancements (Priority Order)

1. **Change `prohibit-password` to `no`** and add SSH hardening extras (ed25519-only, disable unused auth)
2. **Add a callout/note explaining the Docker-UFW bypass** mechanism (FORWARD vs INPUT chain) and mention DOCKER-USER chain
3. **Add a Caddy hardening section** — security headers and `caddy upgrade` (mention March 2026 CVEs)
4. **Add container security basics** — non-root, read-only fs, no-new-privileges, drop capabilities
5. **Add kernel/sysctl hardening** as an optional "going further" section
6. **Mention CrowdSec** as a modern alternative/complement to fail2ban
7. **Add systemd hardening** for Caddy and PHP-FPM services
