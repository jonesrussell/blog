---
title: "How We Got DDEV, Laravel, and a Go API Talking: The Sidecar Approach"
date: 2025-02-18
categories: [laravel]
tags: [laravel, ddev, go, docker]
summary: "Run a Go forms API as a DDEV sidecar so Laravel in the web container can call it by service name, with one shared secret for signed requests."
slug: "ddev-laravel-go-sidecar"
draft: false
---

Ahnii!

Our stack splits responsibilities: **Laravel** (DDEV) handles auth and the UI; a **Go service** (goforms) serves the forms API. We needed the Laravel app inside DDEV to call the Go API reliably. Here’s how we did it.

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
   We added `.ddev/docker-compose.goforms.yaml` that defines:
   - **goforms-db**: Postgres for the Go app (data in a named volume).
   - **goforms**: Builds from the sibling `goforms` repo, mounts the repo for live reload, runs the Go app with `air`. It depends on `goforms-db` and uses `APP_HOST=0.0.0.0` so the app is reachable on the network.
   - **web**: We extend the web service to set `GOFORMS_API_URL=http://goforms:8090` so Laravel always targets the sidecar.

2. **Paths**  
   Compose paths are relative to the compose file. Our file lives in `.ddev/`, and the Go repo is a sibling of the Laravel project, so we use `../../goforms` for build context and volume mount.

3. **Shared secret**  
   Both sides must use the same value for signed requests (e.g. `X-Signature`). We:
   - Set `GOFORMS_SHARED_SECRET: ${GOFORMS_SHARED_SECRET:-ddev-goforms-secret}` in the goforms service so the container always has a non-empty default.
   - Set `GOFORMS_SHARED_SECRET=ddev-goforms-secret` in Laravel’s `.env` so Laravel signs with the same secret.

4. **Healthcheck**  
   We gave the goforms service a healthcheck that hits `/health` with a long `start_period` so DDEV waits for the first Go build before considering the stack ready.

## Result

- Laravel calls `http://goforms:8090`; no host networking or `host.docker.internal`.
- One `.env` (Laravel’s) controls both the URL and the shared secret for DDEV.
- `ddev restart` brings up web, db, goforms, and goforms-db together.
- Same pattern works for any “Laravel in DDEV + internal Go (or other) service”: add a custom compose file, put the service on the default network, and point Laravel at the service name.

If you run into 401s, double-check that `GOFORMS_SHARED_SECRET` (or your equivalent) is identical in Laravel’s `.env` and in the Go container.

Baamaapii
