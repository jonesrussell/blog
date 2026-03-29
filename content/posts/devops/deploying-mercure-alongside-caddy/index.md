---
categories:
    - devops
date: 2026-03-28T00:00:00Z
devto: true
devto_id: 3420837
draft: false
slug: deploying-mercure-alongside-caddy
summary: How to run Mercure for real-time SSE alongside Caddy as your web server, with solutions for port conflicts, gzip interference, and JWT configuration.
tags:
    - caddy
    - mercure
    - ansible
    - sse
title: Deploying Mercure alongside Caddy on a shared VPS
---

Ahnii!

[Mercure](https://mercure.rocks/) is a real-time push protocol built on server-sent events (SSE). It ships as a standalone binary that embeds its own [Caddy](https://caddyserver.com/) server. If you already run Caddy as your web server, you now have two Caddy processes fighting over ports. This post covers how to deploy both on the same VPS using [Ansible](https://www.ansible.com/), with solutions for every gotcha that came up.

## Prerequisites

- A VPS with Caddy already serving your sites
- Ansible for deployment automation
- The [Mercure binary](https://mercure.rocks/docs/hub/install) installed on the server
- A domain with DNS pointed at your VPS

## Resolving the port conflict

Mercure's embedded Caddy wants to bind to port 443 and run its own admin API on port 2019. Your main Caddy already owns both. The fix is to disable auto-HTTPS on Mercure and bind it to a localhost-only port:

```caddyfile
{
  auto_https off
  admin localhost:2039
}

http://localhost:3080 {
  mercure {
    publisher_jwt {env.MERCURE_JWT_SECRET}
    subscriber_jwt {env.MERCURE_JWT_SECRET}
    cors_origins https://minoo.live
    publish_origins *
    anonymous
  }
  respond /healthz 200
}
```

`auto_https off` prevents Mercure's Caddy from requesting certificates. `admin localhost:2039` moves the admin API off port 2019 where your main Caddy is already listening. Mercure listens on `localhost:3080` where only your main Caddy can reach it.

Pick a port that is not already in use on your server. Port 3080 is a safe default since common tools like Docker tend to claim ports in the 3000 range.

## Proxying SSE through your main Caddy

Your main Caddy reverse-proxies the Mercure hub URL to the local Mercure instance. The critical detail is `flush_interval -1`, which tells Caddy to flush response bytes immediately instead of buffering:

```caddyfile
@mercure_hub {
  path /.well-known/mercure*
}
handle @mercure_hub {
  reverse_proxy localhost:3080 {
    flush_interval -1
    header_up X-Forwarded-For {remote_host}
  }
}
```

Without `flush_interval -1`, Caddy buffers the SSE stream and your clients never receive events. This is the single most common issue when proxying SSE through any reverse proxy.

## Excluding SSE routes from gzip

Caddy's `encode` directive compresses responses. Compressed SSE streams break because the client cannot decompress a stream that never ends. Exclude the Mercure routes from compression:

```caddyfile
@not_mercure {
  not path /.well-known/mercure*
}
encode @not_mercure gzip zstd
```

This applies gzip to everything except the SSE endpoint. If you do not have Mercure configured, the template falls back to the simpler `encode gzip zstd` without the matcher.

## JWT secret configuration

Both the publisher (your PHP app) and the subscriber (your frontend) authenticate with Mercure using JWTs signed with a shared secret. Store the secret in Ansible Vault:

```yaml
# defaults/main.yml
mercure_jwt_secret: "{{ vault_mercure_jwt_secret }}"
```

The environment file that Mercure reads at startup is minimal:

```bash
MERCURE_JWT_SECRET=your-secret-here
```

Both `publisher_jwt` and `subscriber_jwt` in the Caddyfile reference this same environment variable. Your PHP publisher generates JWTs with the same secret:

```php
$header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
$payload = base64UrlEncode(json_encode([
    'mercure' => ['publish' => ['*']],
    'iat' => time(),
    'exp' => time() + 3600,
]));
$signature = base64UrlEncode(
    hash_hmac('sha256', "{$header}.{$payload}", $jwtSecret, true)
);

return "{$header}.{$payload}.{$signature}";
```

This generates a JWT that grants publish access to all topics. The `exp` claim means each token is valid for one hour.

## BoltDB data directory

Mercure uses BoltDB for persistence. The Ansible role creates the data directory under the deploy user's home:

```yaml
- name: Create Mercure BoltDB data directory
  ansible.builtin.file:
    path: "/home/{{ deploy_user }}/.local/share/caddy"
    state: directory
    mode: "0755"
    owner: "{{ deploy_user }}"
    group: "{{ deploy_user }}"
```

Mercure's embedded Caddy writes its BoltDB files here. If the directory does not exist, Mercure fails silently on startup and events are not persisted.

## Running as a systemd service

The Ansible role deploys a systemd unit that reads the environment file:

```ini
[Service]
Type=simple
ExecStart=/usr/local/bin/mercure run --config /etc/mercure/Caddyfile
EnvironmentFile=/etc/mercure/mercure.env
User={{ deploy_user }}
Restart=always
```

Set the `User` to your deploy user so Mercure can access its BoltDB directory.

## Health check

The Mercure Caddyfile includes a `/healthz` endpoint that returns 200. Use this for monitoring:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3080/healthz
```

If you get anything other than 200, Mercure is down. Wire this into your monitoring tool of choice.

Baamaapii
