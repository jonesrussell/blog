---
title: "Caddy Hardening: Security Headers and Rate Limiting"
date: 2026-03-24
categories: [devops]
tags: [security, caddy, linux]
series: ["production-linux"]
series_order: 5
summary: "Add security headers, rate limiting, and server identity removal to your Caddy configuration."
slug: "caddy-security-headers-rate-limiting"
draft: false
devto_id: 3386527
---

Ahnii!

> **Series context:** This is part 5 of the [Production Linux series]({{< relref "production-linux-series-index" >}}). Previous: [Docker Security on a Shared VPS]({{< relref "docker-security-shared-vps" >}}).

[Caddy](https://caddyserver.com/) handles TLS automatically, but it doesn't add security headers by default. This post adds them, along with rate limiting and server identity removal.

## Security Headers as a Snippet

Caddy supports reusable snippets, which lets you define headers once and apply them across every site block. Add this near the top of your Caddyfile:

```caddyfile
(security-headers) {
    header / {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
        -X-Powered-By
    }
}
```

Import the snippet in each site block:

```caddyfile
yourdomain.com {
    import security-headers
    reverse_proxy localhost:8000
}
```

The `import` directive inlines the snippet at that point in the config. What each header does:

- **HSTS** — tells browsers to always use HTTPS for the next year, across all subdomains.
- **X-Content-Type-Options** — prevents browsers from MIME-sniffing responses away from the declared content type.
- **X-Frame-Options** — blocks your site from being embedded in an iframe on another origin, reducing clickjacking risk.
- **Referrer-Policy** — controls how much of the URL is sent in the `Referer` header when navigating away from your site.
- **Permissions-Policy** — opts out of browser APIs your site doesn't need; an attacker can't use them even if they inject script.

## Content Security Policy

CSP is powerful but complex enough to warrant its own section. Add it inside the snippet or directly in the site block:

```caddyfile
header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
```

This is a reasonable starting point for a Laravel/Inertia SPA. A few common gotchas:

- **Inline scripts** — Inertia's initial page payload is injected inline. You'll need `'unsafe-inline'` in `script-src` or generate per-request nonces.
- **Vite dev server** — During local development, Vite serves assets from `http://localhost:5173`. Add that URL to `script-src` in dev; never ship it to production.
- **Third-party fonts or CDN assets** — Add those origins explicitly to `font-src` or `script-src` as needed.

Start permissive and tighten over time. Use your browser's DevTools console: CSP violations appear there and tell you exactly what to allow.

## Remove the Server Header

The `-Server` and `-X-Powered-By` lines in the snippet above suppress the headers that advertise your software stack. Reducing information disclosure makes automated scanners work harder to fingerprint your server.

If you have an existing config without those lines, add them inside any `header` block:

```caddyfile
header {
    -Server
    -X-Powered-By
}
```

## Rate Limiting

Caddy doesn't include rate limiting in the standard build. Install the [`mholt/caddy-ratelimit`](https://github.com/mholt/caddy-ratelimit) module using `xcaddy`:

```bash
xcaddy build --with github.com/mholt/caddy-ratelimit
```

Replace your system Caddy binary with the custom build, then configure per-IP limits on your API routes:

```caddyfile
yourdomain.com {
    import security-headers

    route /api/* {
        rate_limit {
            zone api_zone {
                key {remote_ip}
                events 100
                window 1s
            }
        }
        reverse_proxy localhost:8000
    }

    reverse_proxy localhost:8000
}
```

When a client exceeds 100 requests per second, Caddy returns a `429 Too Many Requests` response. Legitimate traffic stays under the limit; brute-force and scraping attempts are cut off automatically.

## Structured JSON Logs for fail2ban

Caddy's structured logging is what makes fail2ban filtering work. If you followed Post 3, your jail already expects JSON. Confirm your log directive outputs JSON:

```caddyfile
yourdomain.com {
    import security-headers

    log {
        output file /var/log/caddy/access.log
        format json
    }

    reverse_proxy localhost:8000
}
```

The `format json` line ensures each access log entry is a single JSON object with fields like `request.remote_ip` and `status`. fail2ban's regex filter parses those fields to identify ban candidates.

See [UFW, fail2ban, and Banning Repeat Offenders]({{< relref "ufw-fail2ban-intrusion-response" >}}) for the fail2ban jail configuration that reads this log.

## Keep Caddy Updated

Caddy ships an upgrade command that replaces the binary in place:

```bash
sudo caddy upgrade
```

Run this regularly. Multiple high-severity vulnerabilities were disclosed in March 2026 affecting Caddy v2.10.0 through v2.11.1. Staying on the current release is the single most effective hardening step — no config change compensates for a vulnerable binary.

Subscribe to [Caddy's GitHub releases](https://github.com/caddyserver/caddy/releases) to get notified of new versions.

## Verify Your Headers

After reloading Caddy (`sudo systemctl reload caddy`), confirm the headers are present:

```bash
curl -I https://yourdomain.com
```

The response should include `strict-transport-security`, `x-content-type-options`, `x-frame-options`, and your CSP header. Check that `server` is absent from the output.

For a scored report, paste your domain into [securityheaders.com](https://securityheaders.com). It grades each header and flags anything missing or misconfigured.

Next: Kernel and Systemd Service Hardening.

Baamaapii
