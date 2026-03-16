---
title: "Docker from Scratch: Writing Your First Dockerfile"
date: 2026-03-02
categories: [docker]
tags: [docker, containers, nodejs, devops]
series: ["docker-fundamentals"]
summary: "Learn Dockerfile basics — FROM, COPY, RUN, CMD — and build your first container image."
slug: "docker-dockerfile-fundamentals"
draft: false
---

Ahnii!

A [Dockerfile](https://docs.docker.com/reference/dockerfile/) is a text file that tells Docker how to build an image. Each line is an instruction — what base to start from, what files to copy in, what commands to run. This post covers the fundamentals before we get to Compose or multi-stage builds.

Clone the [companion repo](https://github.com/jonesrussell/docker-examples) to follow along.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- Basic terminal knowledge

## Your First Dockerfile

Here's a minimal Dockerfile for a Node.js app:

```dockerfile
FROM node:25-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]
```

Four lines. Let's break them down:

- `FROM node:25-alpine` — Start from the official Node.js 25 image (Alpine variant for smaller size)
- `WORKDIR /app` — Set `/app` as the working directory for subsequent instructions
- `COPY . .` — Copy everything from your local directory into the container's `/app`
- `CMD ["node", "index.js"]` — Run this command when the container starts

Build and run it:

```bash
docker build -t hello-docker .
docker run hello-docker
```

The `-t` flag tags the image with a name. The `.` tells Docker to use the current directory as the build context.

## Core Dockerfile Instructions

### FROM: Choose Your Base Image

Every Dockerfile starts with `FROM`. It sets the base image your container builds on.

```dockerfile
FROM node:25-alpine
```

The tag (`25-alpine`) matters:

- `node:25` — Full Debian-based image (~1GB)
- `node:25-slim` — Smaller Debian variant (~200MB)
- `node:25-alpine` — Alpine Linux base (~50MB)

Alpine images are smaller but use `musl` instead of `glibc`. Most Node.js apps work fine, but some native modules may need adjustment.

Always pin a specific version. `FROM node:latest` means your build could break tomorrow when a new version drops.

### COPY vs ADD

Both copy files into the image. Use `COPY` unless you specifically need `ADD`'s extras.

```dockerfile
COPY package.json ./
COPY src/ ./src/
```

`ADD` can also extract tar archives and fetch URLs, but that magic often causes confusion. Stick with `COPY` for clarity.

### RUN: Execute Commands

`RUN` executes commands during the build. Use it to install dependencies:

```dockerfile
RUN npm install --production
```

Each `RUN` creates a new layer. Combine related commands to reduce layers:

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

The cleanup at the end keeps the layer small — files deleted in the same `RUN` don't bloat the image.

### WORKDIR, ENV, EXPOSE

```dockerfile
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
```

- `WORKDIR` — Sets the directory for `RUN`, `CMD`, `COPY`, etc. Creates it if it doesn't exist.
- `ENV` — Sets environment variables available at build time and runtime.
- `EXPOSE` — Documents which port the app listens on. It doesn't publish the port — that's what `-p` does at runtime.

### CMD vs ENTRYPOINT

Both define what runs when the container starts. The difference is subtle but important.

`CMD` provides defaults that can be overridden:

```dockerfile
CMD ["node", "index.js"]
```

```bash
# Runs node index.js
docker run hello-docker

# Overrides CMD — runs node --version instead
docker run hello-docker node --version
```

`ENTRYPOINT` sets a fixed command:

```dockerfile
ENTRYPOINT ["node"]
CMD ["index.js"]
```

```bash
# Runs node index.js
docker run hello-docker

# Runs node --version (ENTRYPOINT stays, CMD is replaced)
docker run hello-docker --version
```

For most apps, `CMD` alone is fine. Use `ENTRYPOINT` when your container is a wrapper around a specific executable.

## Understanding Layers and Caching

Docker caches each instruction. If a layer hasn't changed, Docker reuses the cached version. This speeds up builds dramatically — but only if you order instructions wisely.

Bad order (cache busts on every code change):

```dockerfile
FROM node:25-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]
```

Any change to your code invalidates the `COPY . .` layer, which invalidates `npm install`. You reinstall dependencies every build.

Better order (dependencies cached separately):

```dockerfile
FROM node:25-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js"]
```

Now `npm install` only reruns when `package.json` changes. Code changes only affect the final `COPY` layer.

## Common Mistakes

### Running as Root

By default, containers run as root. That's a security risk. Create a non-root user:

```dockerfile
FROM node:25-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "index.js"]
```

The `--chown` flag sets ownership during copy. `USER` switches to that user for subsequent instructions and runtime.

### Missing .dockerignore

Without a `.dockerignore`, `COPY . .` grabs everything — including `node_modules`, `.git`, and files you don't want in your image.

Create a `.dockerignore`:

```
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
```

This keeps your build context small and your image clean.

### Ignoring Layer Order

Covered above, but worth repeating: put instructions that change frequently at the bottom. Dependencies before code. Code before tests.

## Try It Yourself

From the [companion repo](https://github.com/jonesrussell/docker-examples):

```bash
cd 01-dockerfile-basics
docker build -t hello-docker .
docker run -p 3000:3000 hello-docker
curl http://localhost:3000
```

You should see JSON with the container's hostname, Node version, and uptime.

## What's Next

Part 2 covers multi-stage builds — how to use one Dockerfile to build your app in a full Node image, then copy the result into a minimal runtime image. Your production images get smaller and more secure.

Baamaapii

---

**Want the complete guide?** All 5 parts of Docker from Scratch as a formatted ebook, plus a Dockerfile cheat sheet and 3 production-ready templates (Node.js, Python, Go). [Grab the bundle on Gumroad →](https://jonesrussell.gumroad.com/l/docker-from-scratch)
