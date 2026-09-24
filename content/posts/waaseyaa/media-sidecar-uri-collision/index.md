---
categories:
    - php
    - waaseyaa
date: 2026-09-18T00:00:00Z
devto: true
devto_id: 4733558
draft: false
slug: media-sidecar-uri-collision
summary: How Waaseyaa's LocalFileRepository silently collided metadata for different stream-wrapper URIs that shared a trailing path segment, and the fix that preserves full URI identity plus atomic writes and a reconciliation tool.
tags:
    - php
    - waaseyaa
    - filesystem
    - storage
title: Fixing a metadata collision bug in Waaseyaa's file repository
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/media` package stores uploaded files behind stream-wrapper URIs like `public://images/photo.jpg`, and `LocalFileRepository` keeps each file's metadata (filename, MIME type, owner, size) in a JSON sidecar next to the derived path. The sidecar path came from `parse_url()`, and `parse_url()` doesn't know these URIs aren't real hierarchical URLs. That mismatch let two completely different files quietly overwrite each other's metadata. Here's the bug, the fix, and the reconciliation problem a fix like this creates.

## The Bug: `parse_url()` Doesn't Know About Stream Wrappers

`resolveMetadataPath()` used to build a sidecar path from just the `scheme` and `path` components `parse_url()` returned:

```php
$parsed = parse_url($uri);
$scheme = isset($parsed['scheme']) ? $this->sanitizeSegment($parsed['scheme']) : 'public';
$path = isset($parsed['path']) ? trim($parsed['path'], '/') : trim($uri, '/');

$segments = array_filter(explode('/', $path), static fn(string $segment): bool => $segment !== '');
```

That looks reasonable until you feed it a stream-wrapper URI. `public://images/shared.pdf` isn't a hierarchical URL — it's a scheme plus a flat, ordered path — but `parse_url()` still applies RFC 3986 grammar to it, and under that grammar the first segment after `//` is a **host**, not a path component. So `public://images/shared.pdf` parses into `host: images`, `path: /shared.pdf`, and `resolveMetadataPath()` only ever looked at `path`.

That silently dropped the host segment. Two distinct, documented URIs that happened to share a trailing filename under different directories:

- `public://images/shared.pdf`
- `public://docs/shared.pdf`

collided onto the exact same `.../shared.pdf.meta.json` sidecar. Save the second file and it silently overwrote the first file's metadata. Delete either one's metadata and both lost it. No exception, no log line — just metadata for a file you never touched disappearing.

## The Fix: Treat Every Segment After the Scheme as One Flat Path

The fix stops using `parse_url()`'s host/path split entirely and instead treats everything after `scheme://` as one ordered list of segments:

```php
private function resolveMetadataPath(string $uri): string
{
    $scheme = 'public';
    $rest = $uri;

    if (preg_match('#^([A-Za-z][A-Za-z0-9+.-]*)://(.*)$#s', $uri, $matches) === 1) {
        $scheme = $this->sanitizeSegment($matches[1]);
        $rest = $matches[2];
    }

    $segments = array_filter(explode('/', trim($rest, '/')), static fn(string $segment): bool => $segment !== '');
    $safeSegments = array_map([$this, 'sanitizeSegment'], $segments);

    $target = implode('/', $safeSegments);
    if ($target === '') {
        $target = 'file';
    }

    return rtrim($this->rootDir, '/') . '/' . $scheme . '/' . $target . '.meta.json';
}
```

Every segment gets sanitized individually and stays in order, so `images` and `docs` are preserved as distinct path components instead of one being silently discarded. Traversal confinement under the repository root is unchanged — sanitized `..` segments still collapse to `_` and can't escape `rootDir`.

That's a good fix, but it changes the on-disk layout for any URI with more than one segment after the scheme. The reviewers caught two problems that a fix like this can't just wave away.

## Problem 1: Upgrading Doesn't Migrate Existing Sidecars

Change how a path is derived and every sidecar an existing install already wrote sits at the *old* location. On upgrade, `load()` and `delete()` would look at the new path and find nothing, silently losing access to metadata that's still sitting on disk one directory over.

The fix deliberately does **not** add an automatic fallback to the old path on read — a fallback would have to pick a winner among the URIs that used to collide there, which is exactly the silent-data-loss failure mode being fixed in the first place. Instead, `reconcileLegacySidecars()` is a one-time migration operators run explicitly:

- It scans every `*.meta.json` sidecar under the repository root and reads the `uri` each one recorded at save time.
- If a sidecar is already at its current-layout location, it's left alone.
- If it isn't, and nothing already exists at the new location, it's relocated there — the common case, since there's exactly one candidate on disk.
- If something already exists at the new location (a real conflict — two live candidates for one URI), the legacy sidecar is left untouched and reported as a `conflict`, never silently overwritten.

It's idempotent, so running it twice on an already-reconciled tree reports nothing to do. The candidate list is collected up front before any renaming happens, because mutating files mid-walk on a `RecursiveDirectoryIterator` has undefined visitation order.

## Problem 2: `save()` Wasn't Atomic

The original `save()` wrote sidecars with a direct `file_put_contents()` to the existing path — a truncate-then-rewrite of the same inode. A concurrent `load()` opening that file mid-write could read a partial, possibly non-JSON-decodable body.

The fix is the standard write-to-temp-then-rename pattern:

```php
private function writeAtomically(string $path, string $payload): void
{
    $directory = dirname($path);
    $temporary = tempnam($directory, '.meta-');
    if (!is_string($temporary)) {
        throw new \RuntimeException(sprintf('Unable to create a temporary file beside %s.', $path));
    }

    try {
        if (file_put_contents($temporary, $payload) !== strlen($payload)) {
            throw new \RuntimeException(sprintf('Unable to write file metadata: %s', $path));
        }

        if (!rename($temporary, $path)) {
            throw new \RuntimeException(sprintf('Unable to move file metadata into place: %s', $path));
        }
    } catch (\Throwable $exception) {
        if (is_file($temporary)) {
            unlink($temporary);
        }

        throw $exception;
    }
}
```

The temp file lives in the same directory as the target, so `rename()` stays on one filesystem and is a single atomic directory-entry swap. A reader only ever sees the complete old sidecar or the complete new one — never a partial write. Any failure along the way cleans up the temp file instead of leaving it behind.

## Verifying It

The test suite added **eight cases** specifically to close coverage gaps the CI gate flagged (**73.21%** on the new code), on top of the regression tests for the original collision fix:

| Case | What it proves |
|---|---|
| Distinct authorities, same relative path | `public://images/shared.pdf` and `public://docs/shared.pdf` save, load, and delete independently |
| Traversal-sanitized paths | `..` segments still collapse and stay confined to the repository root |
| Empty root directory | `reconcileLegacySidecars()` on a not-yet-created root returns `[]` |
| Corrupt or missing `uri` in a legacy sidecar | Reported as `unreadable`, doesn't abort the pass |
| Legacy sidecar with a conflicting target | Left untouched, reported as `conflict`, never overwritten |
| Already-reconciled tree | A second run reports nothing to do (idempotent) |
| `save()` against an existing sidecar | The write swaps the file's inode, proving rename-based replacement |
| Rename failure during `writeAtomically()` | Cleans up the temp file, throws `RuntimeException` |

## The General Lesson

`parse_url()` is built for real URLs, and stream-wrapper URIs like `scheme://` only *look* like them. Feeding a flat, ordered identifier through a parser that assumes host/path semantics will happily produce a result — it just won't be the result you meant, and nothing will tell you that at runtime. The two-line diff that dropped one path segment didn't fail loudly; it just started routing some writes to the wrong file.

The other lesson is about what "fix the derivation" actually obligates you to do. Changing how a path is computed is easy. Owning up to the fact that existing installs have data sitting at the *old* derivation is the harder part. Giving them an explicit, conflict-reporting way to bring it forward — instead of a silent fallback that would repeat the same bug in miniature — is the work that's easy to punt to a follow-up ticket and never ship.

Baamaapii
