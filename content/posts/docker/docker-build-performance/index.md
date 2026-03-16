---
title: "Docker from Scratch: Speed Up Builds With Caching and BuildKit"
date: 2026-03-05
categories: [docker]
tags: [docker, go, buildkit, performance]
series: ["docker-fundamentals"]
series_order: 4
series_group: "Main"
summary: "Use layer caching, BuildKit cache mounts, and parallel stages to make your Docker builds faster."
slug: "docker-build-performance"
draft: false
---

Ahnii!

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) installed, basic terminal knowledge. **Recommended:** Read [Part 1]({{< relref "docker-dockerfile-fundamentals" >}}) and [Part 2]({{< relref "docker-multi-stage-builds" >}}) first.

A slow Docker build wastes time on every code change. Most of that slowness comes from rebuilding layers that haven't changed. This post covers how Docker's layer cache works, how to structure your Dockerfile to maximize cache hits, and how [BuildKit](https://docs.docker.com/build/buildkit/) features like cache mounts and parallel stages can cut build times dramatically. We're using [Go](https://go.dev/) for the examples because its build process makes caching patterns especially visible.

## How Docker Layer Caching Works

Docker builds your image one instruction at a time. Each instruction produces a layer. If an instruction and its inputs haven't changed since the last build, Docker reuses the cached layer instead of running it again.

The cache invalidation rule is simple: **if a layer changes, every layer after it rebuilds.** This is why instruction order matters so much.

### A Slow Dockerfile

```dockerfile
FROM golang:1.24-alpine
WORKDIR /app
COPY . .
RUN go build -o server ./cmd/server
CMD ["./server"]
```

Every time you change any file, `COPY . .` invalidates. That triggers a full `go build`, which re-downloads all dependencies. On a project with many dependencies, that can take minutes.

### A Fast Dockerfile

```dockerfile
FROM golang:1.24-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server
CMD ["./server"]
```

Now dependency downloads are cached in their own layer. They only rerun when `go.mod` or `go.sum` change. Code changes only invalidate the final `COPY` and `go build` layers.

This is the single most impactful optimization you can make: **separate dependency installation from source code.**

## BuildKit Cache Mounts

Layer caching helps, but it has limits. If your dependency layer invalidates (because you added a new package), you re-download everything from scratch. BuildKit's `--mount=type=cache` preserves a cache directory across builds, even when the layer rebuilds.

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.24-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o server ./cmd/server
CMD ["./server"]
```

Two cache mounts are at work here:

- `/go/pkg/mod` caches downloaded Go modules. Even if `go.mod` changes, previously downloaded modules are still in the cache. Only new dependencies get fetched.
- `/root/.cache/go-build` caches compiled packages. Go's compiler reuses cached object files, so only changed packages recompile.

These caches persist between builds but aren't stored in any layer. Your image stays small while your builds stay fast.

### Enable BuildKit

BuildKit is the default builder in Docker Desktop. On Linux with Docker Engine, enable it with:

```bash
export DOCKER_BUILDKIT=1
```

Or set it permanently in `/etc/docker/daemon.json`:

```json
{
  "features": {
    "buildkit": true
  }
}
```

The `# syntax=docker/dockerfile:1` line at the top of the Dockerfile tells Docker to use the latest Dockerfile syntax, which enables cache mount support.

## Parallel Stages

In a multi-stage build, independent stages can run in parallel. BuildKit detects this automatically. If two stages don't depend on each other, they build at the same time.

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.24-alpine AS build-api
WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o api ./cmd/api

FROM golang:1.24-alpine AS build-worker
WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o worker ./cmd/worker

FROM alpine:3.21 AS runtime
COPY --from=build-api /app/api /usr/local/bin/
COPY --from=build-worker /app/worker /usr/local/bin/
CMD ["api"]
```

The `build-api` and `build-worker` stages are independent. BuildKit runs them simultaneously. The `runtime` stage waits for both to finish, then copies the binaries. On a multi-core machine, this can cut build time nearly in half for projects with multiple binaries.

## Reduce Build Context With .dockerignore

Before any stage runs, Docker sends the entire build context (your project directory) to the daemon. A large context slows down every build, even cached ones.

```bash
# Check your context size
du -sh --exclude=.git .
```

A `.dockerignore` file keeps unnecessary files out:

```
.git
.github
*.md
docs/
vendor/
bin/
**/*_test.go
```

Exclude test files, documentation, version control, and any build output that doesn't belong in the image. The smaller your context, the faster the transfer to the Docker daemon.

## Build Args for Cache Control

Sometimes you want to bust the cache on purpose. `ARG` combined with `--build-arg` gives you a cache-busting mechanism:

```dockerfile
FROM golang:1.24-alpine
ARG CACHEBUST=1
WORKDIR /app
COPY . .
RUN go build -o server ./cmd/server
CMD ["./server"]
```

```bash
# Normal build (uses cache)
docker build -t myapp .

# Force rebuild from the ARG instruction onward
docker build --build-arg CACHEBUST=$(date +%s) -t myapp .
```

Changing the value of `CACHEBUST` invalidates that layer and everything after it. Useful when you need a clean build without clearing your entire Docker cache.

Place the `ARG` right before the instruction you want to invalidate. Everything above it stays cached.

## Full Production Dockerfile for Go

Combining multi-stage builds, cache mounts, non-root user, and a minimal runtime image:

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -o server ./cmd/server

FROM alpine:3.21
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/server /usr/local/bin/server
USER appuser
CMD ["server"]
```

The build stage uses cache mounts for fast rebuilds. `CGO_ENABLED=0` produces a static binary that runs on the minimal Alpine runtime. The runtime image has no Go toolchain, no source code, and runs as a non-root user. Final size: around 15-20MB.

## Try It Yourself

From the [companion repo](https://github.com/jonesrussell/docker-examples):

```bash
cd 04-build-performance
docker build -t perf-demo .
docker images perf-demo
```

Make a small code change and build again. Watch how fast the second build completes compared to the first.

## What's Next

Part 5 wraps the series with advanced Dockerfile patterns: conditional builds with ARG, HEALTHCHECK, cross-platform images, and linting with hadolint.

Baamaapii

---

**Want the complete guide?** All 5 parts of Docker from Scratch as a formatted ebook, plus a Dockerfile cheat sheet and 3 production-ready templates (Node.js, Python, Go). [Grab the bundle on Gumroad →](https://jonesrussell.gumroad.com/l/docker-from-scratch)
