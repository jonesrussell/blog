# Social backlog — the autopilot hopper

Files here are **approved, ready-to-queue** social copy. The daily content-autopilot
cloud routine checks Buffer's runway each morning; when the queue runs low it takes
the alphabetically-first file here, queues its three platform sections at the next
free day's slots (LinkedIn 13:33 UTC, Bluesky 15:07 UTC, Facebook 17:03 UTC), then
moves the file up to `docs/social/` as the posted archive.

File format (same as every `docs/social/*.md` file):

```markdown
# Title

Reference URL: https://...

## Bluesky
(body + URL, <=300 chars total)

## LinkedIn
...

## Facebook
...
```

Name files `YYYY-MM-DD-slug.md` — the date prefix controls queue order.

## The approval gate

- The weekly content-producer routine drafts candidates into `docs/social/proposed/`.
- Moving a file from `proposed/` to `backlog/` **is** the approval. Nothing posts
  publicly without that move.
- Community/accountability content (Sagamok, RHT Circle governance) is never
  autopiloted — the routine skips it and flags for Russell.
