---
title: "Docker from Scratch: Advanced Dockerfile Patterns"
date: 2026-03-06
categories: [docker]
tags: [docker, containers, devops, buildkit]
series: ["docker-fundamentals"]
summary: "Conditional builds with ARG, health checks, cross-platform images, linting, and other Dockerfile patterns for production use."
slug: "docker-advanced-patterns"
draft: true
---

Ahnii!

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) installed, basic terminal knowledge. **Recommended:** Read the previous parts in this series: [Part 1: Fundamentals](/docker-dockerfile-fundamentals/), [Part 2: Multi-Stage Builds](/docker-multi-stage-builds/), [Part 3: Security](/docker-security-users/), [Part 4: Build Performance](/docker-build-performance/).

This is the final post in the Docker from Scratch series. You've covered the fundamentals, multi-stage builds, security, and performance. This post covers patterns you'll reach for as your Dockerfiles mature: conditional logic with ARG, health checks, cross-platform builds, metadata with LABEL, and linting with [hadolint](https://github.com/hadolint/hadolint).

## Conditional Builds With ARG

`ARG` defines variables that are available during the build. Combined with shell logic, they let you create Dockerfiles that adapt to different environments.

### Switch Base Image by Build Argument

```dockerfile
ARG PYTHON_VERSION=3.13
FROM python:${PYTHON_VERSION}-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]
```

```bash
# Default: Python 3.13
docker build -t myapp .

# Override: Python 3.12
docker build --build-arg PYTHON_VERSION=3.12 -t myapp .
```

The `ARG` before `FROM` is a special case. It's the only instruction that can appear before `FROM`, and it's only available for the `FROM` line itself. To use the value inside the build stage, redeclare it after `FROM`.

### Install Dev Dependencies Conditionally

```dockerfile
FROM node:22-alpine
ARG ENV=production
WORKDIR /app
COPY package*.json ./
RUN if [ "$ENV" = "development" ]; then \
      npm install; \
    else \
      npm install --omit=dev; \
    fi
COPY . .
CMD ["node", "index.js"]
```

```bash
# Production (default)
docker build -t myapp .

# Development with dev dependencies
docker build --build-arg ENV=development -t myapp .
```

One Dockerfile, two behaviors. The shell conditional runs during `RUN`, so Docker evaluates it at build time. This is cleaner than maintaining separate Dockerfiles for dev and prod.

### ARG Scope Rules

```dockerfile
ARG VERSION=3.13
FROM python:${VERSION}-slim

# VERSION is no longer available here
ARG VERSION
# Now it's available again, with the same default
RUN echo "Python ${VERSION}"
```

Arguments declared before `FROM` are consumed by `FROM` and then discarded. Redeclare them inside the stage if you need them later. Each stage has its own scope.

## HEALTHCHECK: Let Docker Monitor Your App

`HEALTHCHECK` tells Docker how to test whether your container is still working. Without it, Docker only knows if the process is running, not if it's actually responding to requests.

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY . .
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
CMD ["python", "app.py"]
```

The options control timing:

- `--interval=30s` checks every 30 seconds
- `--timeout=5s` fails the check if it takes longer than 5 seconds
- `--start-period=10s` gives the app 10 seconds to start before health checks count
- `--retries=3` marks the container unhealthy after 3 consecutive failures

Check container health with:

```bash
docker inspect --format='{{.State.Health.Status}}' container_name
```

The status is `starting`, `healthy`, or `unhealthy`. Orchestration tools like Docker Swarm use this to restart unhealthy containers automatically.

### Health Check for Non-HTTP Apps

Not every app has an HTTP endpoint. Use whatever makes sense for your application:

```dockerfile
# Check if a Go binary responds
HEALTHCHECK CMD ["./server", "--health"]

# Check if a file exists (worker that writes a heartbeat)
HEALTHCHECK CMD ["test", "-f", "/tmp/worker-heartbeat"]

# Check a TCP port with netcat
HEALTHCHECK CMD ["nc", "-z", "localhost", "5432"]
```

The check just needs to return exit code 0 for healthy or 1 for unhealthy.

## Cross-Platform Builds With --platform

Docker images are architecture-specific. An image built on an x86 machine won't run on ARM (like Apple Silicon Macs or AWS Graviton) without emulation. `docker buildx` solves this by building for multiple platforms in one command.

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS build
ARG TARGETOS
ARG TARGETARCH
WORKDIR /app
COPY . .
RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o server ./cmd/server

FROM alpine:3.21
COPY --from=build /app/server /usr/local/bin/server
CMD ["server"]
```

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .
```

`$BUILDPLATFORM` is the machine doing the build. `$TARGETOS` and `$TARGETARCH` are the platform you're building for. Docker passes these automatically when you use `--platform`.

Go makes this easy because it cross-compiles natively. For interpreted languages like Python or Node.js, you don't need the `GOOS`/`GOARCH` trick. The base image handles the architecture, so a standard Dockerfile works across platforms.

### Push Multi-Platform Images

```bash
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag myuser/myapp:latest \
    --push .
```

The `--push` flag sends all platform variants to the registry as a single manifest. When someone pulls `myuser/myapp:latest`, Docker automatically selects the right architecture.

## LABEL: Add Metadata to Your Images

`LABEL` attaches key-value metadata to your image. It costs nothing at runtime and makes images easier to manage.

```dockerfile
FROM python:3.13-slim
LABEL org.opencontainers.image.title="My App" \
      org.opencontainers.image.version="1.2.0" \
      org.opencontainers.image.source="https://github.com/user/myapp" \
      org.opencontainers.image.description="A Python web service"
```

The `org.opencontainers.image.*` prefix is the [OCI standard](https://github.com/opencontainers/image-spec/blob/main/annotations.md) for image labels. Using standard keys means tools like container registries can display your metadata automatically.

Query labels on any image:

```bash
docker inspect --format='{{json .Config.Labels}}' myapp | jq
```

## SHELL: Change the Default Shell

By default, `RUN` instructions execute with `/bin/sh -c`. The `SHELL` instruction changes that:

```dockerfile
FROM mcr.microsoft.com/windows/servercore:ltsc2022
SHELL ["powershell", "-Command"]
RUN Get-ChildItem C:\
```

On Linux, you might switch to bash for more reliable scripting:

```dockerfile
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://example.com/install.sh | bash
```

The `-o pipefail` flag makes piped commands fail if any part of the pipeline fails. Without it, only the exit code of the last command matters, and a failed `curl` would be silently ignored.

## Lint Your Dockerfiles With Hadolint

[Hadolint](https://github.com/hadolint/hadolint) is a Dockerfile linter that catches common mistakes and suggests improvements. It checks against best practices and runs ShellCheck on your `RUN` instructions.

```bash
# Run with Docker (no install needed)
docker run --rm -i hadolint/hadolint < Dockerfile
```

Example output:

```
DL3008 warning: Pin versions in apt-get install
DL3059 info: Multiple consecutive RUN instructions. Consider consolidation.
SC2086 info: Double quote to prevent globbing and word splitting.
```

Each rule has a code you can look up for details. Add hadolint to your CI pipeline to catch issues before they reach production.

### Suppress Rules When Needed

Some rules don't apply in every context. Suppress them with inline comments:

```dockerfile
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y curl
```

Or create a `.hadolint.yaml` in your project root:

```yaml
ignored:
  - DL3008
```

Suppress sparingly. Most hadolint rules exist for good reasons.

## ONBUILD: Instructions for Downstream Images

`ONBUILD` defers an instruction until someone uses your image as a base. This is useful for creating reusable base images:

```dockerfile
FROM python:3.13-slim
WORKDIR /app
ONBUILD COPY requirements.txt .
ONBUILD RUN pip install --no-cache-dir -r requirements.txt
ONBUILD COPY . .
CMD ["python", "app.py"]
```

When someone writes `FROM your-base-image`, the `ONBUILD` instructions execute automatically. They don't need to know about `requirements.txt` handling. It's already baked into the base.

Use `ONBUILD` sparingly. It hides behavior, which makes debugging harder. It works well for standardized base images within a team. It's a poor choice for public images where users expect full control.

## Series Recap

Over five posts, you've built up from a four-line Dockerfile to production patterns:

| Part | Topic | Key Takeaway |
|------|-------|-------------|
| [1](/docker-dockerfile-fundamentals/) | Fundamentals | FROM, COPY, RUN, CMD, and layer ordering |
| [2](/docker-multi-stage-builds/) | Multi-Stage Builds | Separate build from runtime to shrink images |
| [3](/docker-security-users/) | Security & Users | Non-root users, minimal bases, secrets handling |
| [4](/docker-build-performance/) | Build Performance | Cache mounts, parallel stages, .dockerignore |
| 5 | Advanced Patterns | ARG, HEALTHCHECK, cross-platform, linting |

Every pattern in this series stays within the Dockerfile itself. No Compose, no orchestration, no CI/CD. Master these and you have a solid foundation for whatever comes next.

Baamaapii
