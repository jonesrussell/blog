# Docker from Scratch: Dockerfile Series Design

**Date:** 2026-03-01
**Series tag:** `docker-fundamentals`
**Audience:** Beginner developers, no Docker experience assumed
**Scope:** Dockerfile instructions only. No Compose, no orchestration, no CI/CD.
**Cadence:** 1 post per day, Mon-Fri (March 2-6, 2026)
**Companion repo:** https://github.com/jonesrussell/docker-examples (numbered directories where hands-on helps)

## Series Structure (Approach A: Linear Progression)

Each post builds on the last. Readers can stop at any post and have usable knowledge.

### Part 1: Writing Your First Dockerfile (Node.js)

- **Slug:** `docker-dockerfile-fundamentals`
- **Status:** Draft complete, needs light editing
- **Covers:** FROM, COPY, RUN, CMD, WORKDIR, ENV, EXPOSE, .dockerignore, build context basics, CMD vs ENTRYPOINT, layer ordering intro
- **Companion repo:** `01-dockerfile-basics/`
- **Publish:** Monday March 2

### Part 2: Multi-Stage Builds (Node.js)

- **Slug:** `docker-multi-stage-builds`
- **Covers:** Why images get bloated, build stage vs runtime stage, copying artifacts between stages, before/after image size comparison
- **Companion repo:** `02-multi-stage/`
- **Example:** Full Node.js app with build tooling (TypeScript or similar) that compiles down, then runtime stage with just the output
- **Publish:** Tuesday March 3

### Part 3: Security & Users (Python)

- **Slug:** `docker-security-users`
- **Covers:** Why running as root is dangerous, creating non-root users, choosing minimal base images (distroless, alpine, slim), avoiding secrets in layers, `docker scout` / scanning basics
- **Companion repo:** Not needed, pattern-focused with inline examples
- **Language switch:** Python, to show these patterns aren't Node-specific
- **Publish:** Wednesday March 4

### Part 4: Build Performance (Go)

- **Slug:** `docker-build-performance`
- **Covers:** Layer caching deep dive, BuildKit features (cache mounts, `--mount=type=cache`), parallel stages, .dockerignore impact on build context size, build args for cache busting
- **Companion repo:** `04-build-performance/`
- **Language switch:** Go, naturally shows off multi-stage (compile to static binary) and cache mount patterns
- **Publish:** Thursday March 5

### Part 5: Advanced Patterns (Mixed)

- **Slug:** `docker-advanced-patterns`
- **Covers:** ARG for conditional builds, ONBUILD, HEALTHCHECK, LABEL/metadata, cross-platform builds with `--platform`, SHELL instruction, linting with hadolint
- **Companion repo:** Not needed, pattern catalog with inline examples
- **Languages:** Mix of Node.js, Go, Python to reinforce universality
- **Publish:** Friday March 6

## Design Decisions

- **Linear progression** chosen over topic clusters for better beginner experience
- **Mixed languages** (Node.js, Python, Go) to show Dockerfile skills are universal
- **Companion repo only where hands-on helps** (parts 1, 2, 4), not forced for every post
- **Posts directory organized by topic** (`content/posts/docker/`) for maintainability
