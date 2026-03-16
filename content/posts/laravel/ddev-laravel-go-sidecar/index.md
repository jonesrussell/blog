---
title: "How We Got DDEV, Laravel, and a Go API Talking: The Sidecar Approach"
date: 2025-02-18
categories: [laravel]
tags: [laravel, ddev, go, docker]
summary: "Run a Go API as a DDEV sidecar so Laravel in the web container can call it by service name, with one shared secret for signed requests."
slug: "ddev-laravel-go-sidecar"
draft: false
---

Ahnii!

Our stack splits responsibilities: **Laravel** (DDEV) handles auth and the UI; a **Go service** serves the API. We needed the Laravel app inside DDEV to call the Go API reliably. Here’s how we did it.

## The Problem

- **Laravel** runs in a DDEV web container.
- **Go** was either on the host or in its own Docker Compose.
- From inside the web container, `localhost:8090` points at the container itself, not the host.
- Using `host.docker.internal:8090` led to timeouts (routing/WSL2) or required the Go app to listen on `0.0.0.0`.
- When we did get a response, we often saw **401 Unauthorized**: the shared secret for signed requests didn’t match between Laravel and Go.

We wanted one predictable setup: Laravel and Go on the same network, with a single place to configure the shared secret.

## The Solution: Go as a DDEV Sidecar

We added the Go service (and its Postgres) as **custom Docker Compose services** in DDEV so they share the same Docker network as the web container and can talk by service name.

1. **Custom compose file**  
   Add a file like `.ddev/docker-compose.go-api.yaml` that defines:
   - **go-api-db**: Postgres for the Go app (data in a named volume).
   - **go-api**: Builds from your Go repo (e.g. a sibling directory), mounts it for live reload if you use something like `air`. It depends on `go-api-db` and uses `APP_HOST=0.0.0.0` so the app is reachable on the network.
   - **web**: Extend the web service to set your API URL, e.g. `API_URL=http://go-api:8090`, so Laravel always targets the sidecar.

2. **Paths**  
   Compose paths are relative to the compose file. If the file lives in `.ddev/` and your Go repo is a sibling of the Laravel project, use `../../your-go-project` for build context and volume mount.

3. **Shared secret**  
   Both sides must use the same value for signed requests (e.g. `X-Signature`). In the Go service, set something like `SHARED_SECRET: ${SHARED_SECRET:-ddev-sidecar-secret}` so the container always has a non-empty default. In Laravel’s `.env`, set the same value (e.g. `SHARED_SECRET=ddev-sidecar-secret`) so Laravel signs with the same secret.

4. **Healthcheck**  
   Give the Go service a healthcheck that hits something like `/health` with a long `start_period` so DDEV waits for the first build before considering the stack ready.

## Result

- Laravel calls the sidecar by service name (e.g. `http://go-api:8090`); no host networking or `host.docker.internal`.
- One `.env` (Laravel’s) controls both the API URL and the shared secret for DDEV.
- `ddev restart` brings up web, db, and your sidecar services together.
- Same pattern works for any “Laravel in DDEV + internal Go (or other) service”: add a custom compose file, put the service on the default network, and point Laravel at the service name.

If you run into 401s, double-check that the shared secret env var is identical in Laravel’s `.env` and in the Go container.

Baamaapii
