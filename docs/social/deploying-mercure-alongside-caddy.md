# Social copy: Deploying Mercure alongside Caddy on a shared VPS

**Canonical URL:** https://jonesrussell.github.io/blog/deploying-mercure-alongside-caddy/

## Facebook

Mercure embeds its own Caddy server. If you already run Caddy, you have two processes fighting over ports. Here's how to deploy both on the same VPS with Ansible, plus fixes for gzip breaking SSE streams. https://jonesrussell.github.io/blog/deploying-mercure-alongside-caddy/ #Caddy #Mercure #SSE #DevOps

## X (Twitter)

Mercure + Caddy on the same VPS: port conflicts, gzip breaking SSE, JWT config, and a flush_interval gotcha. All solved with Ansible. https://jonesrussell.github.io/blog/deploying-mercure-alongside-caddy/

## LinkedIn

Running Mercure for real-time SSE alongside Caddy as your web server requires solving port conflicts, disabling gzip on SSE routes, and configuring JWT secrets. This post covers the full Ansible setup with every gotcha that came up. https://jonesrussell.github.io/blog/deploying-mercure-alongside-caddy/
