---
title: "Keep SQLite data in a private child directory, not at the Docker volume root"
date: 2026-09-04
categories: [docker]
tags: [docker, sqlite, containers, security]
summary: "Mounting a durable volume straight onto the directory you chmod'd in the image throws away that permission — bake a private child path instead."
slug: "docker-sqlite-private-child-directory"
draft: false
---

Ahnii!

[northway](https://github.com/jonesrussell/northway) is a Go service that ships as a `scratch`-based container running as a non-root UID, with an embedded SQLite database for durable storage. That setup raises a question every containerized SQLite app eventually has to answer. Where does the database file actually live once a volume takes over the mount point?

The first answer was the obvious one — bake `/data` into the image with the right owner and mode, then mount a volume there. It didn't hold up.

## Why the volume root can't be trusted

The original Dockerfile did this:

```dockerfile
RUN mkdir -p /out/data && chmod 0700 /out/data
...
COPY --from=build --chown=65532:65532 --chmod=0700 /out/data /data
```

That sets `/data` to mode **`0700`**, owned by UID/GID **`65532`**, as an image layer. It looks correct. It *is* correct — right up until something mounts a volume at that exact path.

A volume mount replaces whatever was at that path with the volume's own root. That root can come back with different ownership than what the image baked in, depending on the engine, the storage driver, and whether the volume is new or already provisioned. `--chown`/`--chmod` on `/data` describes the image layer, not whatever gets mounted over it at runtime. In short: relying on a volume driver to preserve a mount point's ownership is relying on behavior the image doesn't control.

## Push the private path one level down

The fix: stop putting the sensitive directory *at* the mount point. Put it in a child directory the image bakes in, and mount the volume at the parent:

```dockerfile
RUN mkdir -p /out/data/northway && chmod 0700 /out/data/northway
...
# Volume roots may be initialized with engine-specific permissions. Keep the
# private database directory as a copied child whose ownership/mode are explicit.
COPY --from=build --chown=65532:65532 --chmod=0700 /out/data/ /data/
```

{{< compare >}}
  {{< before >}}
  `chmod 0700 /data`, then mount the volume at `/data`. The volume's own root can come back with different ownership than what the image set — the permission is gone.
  {{< /before >}}
  {{< after >}}
  `chmod 0700 /data/northway`, then mount the volume at `/data`. The child directory's ownership was set at build time and nothing overwrites it.
  {{< /after >}}
{{< /compare >}}

Now the volume gets mounted at `/data`, and northway's actual database lives at `/data/northway`. Whatever ownership the volume root itself ends up with no longer matters, because nothing security-sensitive is stored there — the child directory's permissions came from the image build, and Docker preserves file ownership *inside* a volume once it exists.

Every place that referenced the old path moved with it. The container docs now say it directly:

> The private child directory avoids relying on Docker preserving a volume root's permissions. For a host bind mount, infra must prepare that child with the same owner/mode.

And the CLI invocations point at the child path, not the mount root:

```sh
./bin/northway migrate --database=/data/northway/northway.sqlite
./bin/northway serve --database=/data/northway/northway.sqlite
```

## Proving it with a real container, not just docs

Docs describing intent are easy to invalidate with the next change. northway's `scripts/smoke_storage_container.py` builds the image, mounts a disposable named volume, and drives the whole lifecycle against the child path:

```python
mount = ["--mount", f"type=volume,source={volume},target=/data"]
docker("run", "--rm", *limits, *mount, image, "migrate", "--database=/data/northway/northway.sqlite")
container = docker("run", "--detach", *limits, *mount, "--publish", "127.0.0.1::8080", image, "serve", "--database=/data/northway/northway.sqlite")
```

The mount target is `/data` — the parent, exactly as documented — while every command that touches the database uses the `/data/northway/northway.sqlite` child path. The script goes on to:

- restart the container and confirm the same volume still serves correctly,
- run a backup against the running database, and
- migrate the backup file as a separate check that the snapshot is itself a valid, restorable database.

All of it runs `--read-only` with `--cap-drop=ALL` and no host mounts, so the only way the container can persist anything is through the volume it was actually given.

## The general lesson

This isn't SQLite-specific. Any container that needs a guaranteed-private path for something sensitive — a database file, a credential cache, a Unix socket — shouldn't put that path exactly at a mount point:

- **A mount point's ownership belongs to whatever gets mounted there**, not to the image layer underneath it. `--chown`/`--chmod` on that exact path only survives until the first mount.
- **A child directory baked into the image keeps its permissions**, because nothing overwrites it — the volume mount happens at the parent, and Docker preserves ownership for files that already exist inside a volume.
- **Test it against a real disposable volume**, not just a fresh container filesystem. Permission problems at the mount boundary don't show up until something actually mounts over the path.

Baamaapii
