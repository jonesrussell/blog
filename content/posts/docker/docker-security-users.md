---
title: "Docker from Scratch: Secure Your Containers With Non-Root Users"
date: 2026-03-04
categories: [docker]
tags: [docker, security, python, containers]
series: ["docker-fundamentals"]
summary: "Run containers as non-root users, choose minimal base images, and keep secrets out of your Docker layers."
slug: "docker-security-users"
draft: true
---

Ahnii!

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) installed, basic terminal knowledge. **Recommended:** Read [Part 1: Writing Your First Dockerfile](/docker-dockerfile-fundamentals/) and [Part 2: Multi-Stage Builds](/docker-multi-stage-builds/) first.

By default, your container runs as root. That means if someone exploits your app, they have root access inside the container. This post covers the security basics you should apply to every Dockerfile: non-root users, minimal base images, and keeping secrets out of your layers. We're switching to [Python](https://www.python.org/) for the examples to show that these patterns work in any language.

## Why Running as Root Is Dangerous

Start a container and check who you are:

```bash
docker run --rm python:3.13-slim whoami
```

```
root
```

That's the default. Every `RUN`, `COPY`, and `CMD` instruction executes as root unless you say otherwise. If an attacker finds a vulnerability in your app, they inherit those root privileges. They can read files, install packages, or escape the container in some configurations.

The fix is simple: create a dedicated user and switch to it.

## Create a Non-Root User

Here's a Python app with a non-root user:

```dockerfile
FROM python:3.13-slim
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup --create-home appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
CMD ["python", "app.py"]
```

`groupadd` and `useradd` create a system group and user. `--system` means no login shell and no home directory clutter. `--create-home` gives the user a home directory for tools that expect one (pip, for example).

`chown -R appuser:appgroup /app` ensures the app user owns the working directory. Without this, files copied by root remain owned by root, and your app may not be able to read its own config files.

`USER appuser` switches all subsequent instructions and the runtime process to that user.

### Verify It Works

```bash
docker build -t secure-app .
docker run --rm secure-app whoami
```

```
appuser
```

### Alpine vs Debian-Based Images

The commands differ slightly on Alpine:

```dockerfile
FROM python:3.13-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
```

Alpine uses `addgroup`/`adduser` with `-S` for system accounts. Debian-based images use `groupadd`/`useradd`. Pick the one that matches your base image.

## Choose Minimal Base Images

Your base image is the biggest factor in image size and attack surface. Fewer packages mean fewer vulnerabilities.

| Base Image | Size | Packages | Use Case |
|------------|------|----------|----------|
| `python:3.13` | ~1GB | Full Debian, build tools | Development, compiling C extensions |
| `python:3.13-slim` | ~150MB | Minimal Debian, no build tools | Most production apps |
| `python:3.13-alpine` | ~50MB | Alpine Linux, musl libc | Size-sensitive deployments |

Start with `slim`. It covers most production needs without the bloat of the full image or the compatibility quirks of Alpine.

### When Alpine Causes Problems

Alpine uses `musl` instead of `glibc`. Most pure Python packages work fine. But packages with C extensions (numpy, pandas, cryptography) may need extra build dependencies or longer compile times. If you hit errors installing packages on Alpine, switch to `slim`.

## Keep Secrets Out of Your Layers

Every instruction in a Dockerfile creates a layer. Layers are permanent. Even if you delete a file in a later layer, it still exists in the image history.

### The Wrong Way

```dockerfile
COPY .env .
RUN python setup.py configure
RUN rm .env
```

This looks like it cleans up, but `.env` is baked into the `COPY` layer. Anyone with access to the image can extract it:

```bash
docker history myapp
```

Every layer is visible.

### Use Build Secrets Instead

[BuildKit](https://docs.docker.com/build/buildkit/) provides `--mount=type=secret` for passing secrets during build without baking them into layers:

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=secret,id=pip_conf,target=/etc/pip.conf \
    pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Build with the secret:

```bash
DOCKER_BUILDKIT=1 docker build --secret id=pip_conf,src=./pip.conf -t myapp .
```

The secret is available during the `RUN` instruction but never stored in any layer. This is the right way to handle private package indexes, API keys during build, or any credential your build process needs.

### Environment Variables at Runtime

For runtime secrets (database passwords, API keys), pass them at run time, not build time:

```bash
docker run -e DATABASE_URL="postgres://..." myapp
```

Or use a `.env` file with `--env-file`:

```bash
docker run --env-file .env myapp
```

Neither approach bakes the secret into the image. The values exist only in the running container's environment.

## Scan Your Images for Vulnerabilities

[Docker Scout](https://docs.docker.com/scout/) checks your image against known vulnerability databases:

```bash
docker scout quickview myapp
```

This shows a summary of CVEs (Common Vulnerabilities and Exposures) in your image, grouped by severity. Run it after every build to catch issues early.

For a detailed report:

```bash
docker scout cves myapp
```

Scanning won't find logic bugs in your code, but it catches known vulnerabilities in your base image and installed packages. A smaller base image means fewer packages, which means fewer things to patch.

## Putting It All Together

Here's a production-ready Python Dockerfile combining everything from this post:

```dockerfile
FROM python:3.13-slim

RUN groupadd --system appgroup && \
    useradd --system --gid appgroup --create-home appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

CMD ["python", "app.py"]
```

Non-root user. Slim base image. No secrets in layers. No `--cache-dir` bloat from pip. This is a solid baseline for any Python project.

## What's Next

Part 4 switches to Go and dives into build performance: layer caching strategies, BuildKit cache mounts, and parallel stages that speed up your builds.

Baamaapii

---

**Want the complete guide?** All 5 parts of Docker from Scratch as a formatted ebook, plus a Dockerfile cheat sheet and 3 production-ready templates (Node.js, Python, Go). [Grab the bundle on Gumroad →](https://jonesrussell.gumroad.com/l/docker-from-scratch)
