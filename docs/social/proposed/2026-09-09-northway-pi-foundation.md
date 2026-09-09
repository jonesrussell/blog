Queue-Issue: #1107
Reference URL: https://github.com/jonesrussell/northway/commit/ddf1773f8eac7c8497a93d4a03f53710bb9220fd

## Bluesky

Most self-hosted AI tools assume a server rack. northway starts from the other direction: SQLite as the only database dependency, designed to deploy on a Raspberry Pi. https://github.com/jonesrussell/northway/commit/ddf1773f8eac7c8497a93d4a03f53710bb9220fd #buildinpublic #golang

## LinkedIn

Most self-hosted AI tools are built for servers you rent, not hardware you own.

northway is a new Go project going the other direction. The stated product foundation in the initial commit is SQLite as the database and a Raspberry Pi as the deployment target. Not a VPS, not a container cluster. A Pi on your desk.

The reasoning is straightforward: if the only dependency is a single SQLite file, you can run the service anywhere Go compiles. No Postgres to stand up, no Redis for cache, no infrastructure to manage separately from the application. The database is a file.

The initial architecture document at docs/architecture.md defines the service boundary: a JSON API for feed queries and snapshots, with feedback collected per query. The API schemas in api/schemas/ are JSON Schema files that define the wire format up front, before any implementation. That schema-first discipline carries through the whole project.

The roadmap in docs/roadmap.md is honest about scope: this is early, the delivery model is still being defined, and external collection options are still being evaluated. That transparency is part of build-in-public.

If you are building something that needs to run without managed infrastructure, SQLite-backed Go on a Pi is a surprisingly solid stack. northway is the public record of what that looks like in practice.

Foundation commit: https://github.com/jonesrussell/northway/commit/ddf1773f8eac7c8497a93d4a03f53710bb9220fd

#golang #sqlite #selfhosted #buildinpublic #raspberrypi

## Facebook

Most AI services are built to run on managed cloud infrastructure. northway is being built to run on a Raspberry Pi.

The project is a Go service for AI-assisted content retrieval. The architectural decision recorded in the first commit is simple: SQLite as the only database dependency. No Postgres, no Redis, no separate infrastructure layer. If Go compiles for the target, northway runs.

The API contract is defined up front as JSON Schema files before any implementation lands. That is a discipline worth noting when the codebase is still young, because it is much easier to hold a schema boundary at the start than to retrofit one later.

https://github.com/jonesrussell/northway/commit/ddf1773f8eac7c8497a93d4a03f53710bb9220fd #buildinpublic #golang
