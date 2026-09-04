---
categories:
    - docker
date: 2026-09-03T00:00:00Z
devto_id: 4574027
draft: false
slug: docker-split-api-maintenance-images
summary: A shared runtime stage plus two build targets keeps CLI maintenance tools out of the deployed API image, and a script proves it on every build.
tags:
    - docker
    - security
    - containers
    - ci
title: Splitting one Dockerfile into API and maintenance images
---

Ahnii!

[goformx](https://github.com/goformx/goformx) is a Go form-builder API. Its production Dockerfile used to build one image containing the API binary *and* two maintenance CLIs — `goformx-webhook-keys` and `goformx-token`. That meant every deployed API container shipped tools it never runs, just because they came out of the same build stage.

The fix: a shared runtime base with two divergent targets, plus a script that verifies the split on every build instead of trusting it by eye.

## The problem with one shared stage

The old production stage looked roughly like this:

```dockerfile
FROM alpine:3.24@sha256:28bd5fe... AS production
RUN apk add --no-cache ca-certificates tzdata wget
RUN addgroup -g 1001 -S goforms && adduser -u 1001 -S goforms -G goforms
WORKDIR /app
COPY --from=go-builder /app/bin/goforms ./bin/goforms
COPY --from=go-builder /app/bin/goformx-webhook-keys ./bin/goformx-webhook-keys
COPY --from=go-builder /app/bin/goformx-token ./bin/goformx-token
USER goforms
CMD ["./bin/goforms"]
```

Everything the build produced landed in the same image. The API container — the one exposed to the internet — carried two extra CLIs whose only job is one-off maintenance work (rotating webhook keys, minting tokens). More binaries in a running container means more attack surface if it's ever compromised, and no way to tell from the image alone which tools are actually meant to run there.

## A shared runtime stage, two targets

The fix in [PR #157](https://github.com/goformx/goformx/commit/cab719b8a46d03f5ec15a5c90592763ec900eee4) keeps the user and package setup in one shared `runtime` stage, then branches into `maintenance` and `api` targets that each copy only their own binaries:

```dockerfile
# Shared non-root runtime; no application or maintenance executables.
FROM alpine:3.24@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b AS runtime
RUN apk add --no-cache ca-certificates tzdata wget
RUN addgroup -g 1001 -S goforms && \
    adduser -u 1001 -S goforms -G goforms
WORKDIR /app

# Maintenance is opt-in and never inherits the API command or health check.
FROM runtime AS maintenance
COPY --from=go-builder /app/bin/goformx-webhook-keys ./bin/goformx-webhook-keys
COPY --from=go-builder /app/bin/goformx-token ./bin/goformx-token
USER goforms
CMD ["./bin/goformx-token"]

# Keep API last so builds without --target also produce the serving image.
FROM runtime AS api
COPY --from=go-builder /app/bin/goforms ./bin/goforms
USER goforms
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/health || exit 1
CMD ["./bin/goforms"]
```

A few things worth calling out:

- **`runtime` has no binaries at all** — it's just the OS packages and the non-root user, shared by both targets so that setup isn't duplicated.
- **`maintenance` never gets a `HEALTHCHECK` or `EXPOSE`.** Those only make sense for a long-running service, not a one-shot CLI invocation.
- **`api` is defined last on purpose.** `docker build` with no `--target` flag builds the final stage in the file, so existing build commands that don't pass `--target` keep producing the serving image without any change.

The two targets end up with nothing in common except the base:

| | `api` | `maintenance` |
|---|---|---|
| Binaries | `bin/goforms` | `bin/goformx-webhook-keys`, `bin/goformx-token` |
| `EXPOSE` | 8090 | none |
| `HEALTHCHECK` | yes, 30s interval | none |
| `CMD` | `./bin/goforms` | `./bin/goformx-token` |

Building each image now takes an explicit `--target`:

```bash
docker build --target api -f docker/production/Dockerfile -t goformx:api .
docker build --target maintenance -f docker/production/Dockerfile -t goformx:maintenance .
```

The API image only ever contains `bin/goforms`. The maintenance image only ever contains the two CLIs, with no exposed port and no health check to get confused by.

## Proving the split instead of trusting it

A Dockerfile comment describing intent is easy to invalidate with the next edit. goformx backs the split with `docker/production/verify.sh`, a packaging gate that builds all three variants — `api`, `maintenance`, and the no-`--target` default — and asserts what's actually inside each one:

```sh
docker run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges \
    --entrypoint /bin/sh "$serving" -ec '
    check() { "$@" || { printf "%s\n" "API packaging assertion failed: $*" >&2; exit 1; }; }
    check test "$(id -u)" = 1001
    check test -x /app/bin/goforms
    check test "$(find /app -type f | sort)" = /app/bin/goforms
'
```

This runs the built API image with the network disabled, the filesystem read-only, all capabilities dropped, and `no-new-privileges` set, then asserts the container runs as **UID 1001** and that `/app/bin/goforms` is the *only* file in `/app`. If a future change accidentally copies a maintenance binary into the API stage, this check fails the build — it doesn't rely on someone noticing in review.

The maintenance image gets the mirror-image check: no health check, no exposed port, and both CLIs present and executable. It also confirms each CLI hits its real usage guard when run with no arguments, rather than crashing on a missing config loader:

```sh
status=0
output=$(/app/bin/"$tool" 2>&1) || status=$?
check test "$status" = 1
case "$output" in
    "$tool: usage: $tool "*) ;;
    *) printf "%s\n" "unexpected CLI usage result: $tool" >&2; exit 1 ;;
esac
```

## Wiring it into CI

The check is exposed as a Task target and folded into the existing verification pipeline in `Taskfile.yml`:

```yaml
packaging:
  desc: Build and check API/default and maintenance images without credentials or network access at runtime
  dir: ./goforms
  cmd: sh docker/production/verify.sh
```

And `verify` — the task CI already runs — gained one more step:

```yaml
  - task: packaging
```

That's the whole change: the packaging gate isn't a separate, easy-to-skip script. It runs wherever `task verify` already runs, so the image split stays correct without anyone having to remember to check it.

The pattern generalizes to any multi-stage Dockerfile that produces more than one kind of image from the same codebase:

- Put the shared setup — packages, users, working directory — in a base stage.
- Branch into named targets that each copy only the binaries they need.
- Order the default target last, so builds without `--target` don't change behavior.
- Write a script that builds and inspects the images, rather than trusting the Dockerfile to keep doing the right thing forever.

Baamaapii
