## Bluesky

Our PHP file repository used parse_url() to build metadata sidecar paths. Two files with the same name in different directories collided onto one sidecar and overwrote each other's metadata. Wrote up the bug and the fix. https://jonesrussell.github.io/blog/media-sidecar-uri-collision/ #php

## LinkedIn

New post: a metadata collision bug in Waaseyaa's file repository, and what fixing it actually obligated us to do.

The repository stores each uploaded file's metadata in a JSON sidecar next to a path derived from the file's URI. That derivation used parse_url(), which is built for real URLs. Stream wrapper URIs like public://images/photo.jpg are not real hierarchical URLs, but parse_url() still applies URL grammar to them, splitting off the first segment as a host and silently discarding it from the path used to build the sidecar location.

The result: public://images/shared.pdf and public://docs/shared.pdf, two distinct uploaded files, collided onto the exact same sidecar file. Saving one silently overwrote the other's metadata. No exception, no log line.

The fix treats every segment after the scheme as one flat ordered path instead of splitting host from path. But changing how a path is derived means every sidecar already on disk sits at the old location. We added an explicit, idempotent reconciliation method that relocates unambiguous cases automatically and reports real conflicts for a human to resolve, rather than silently guessing a winner. We also fixed a second bug found in review: the sidecar write was not atomic, so a concurrent read could see a partial file.

Full writeup: https://jonesrussell.github.io/blog/media-sidecar-uri-collision/

#php #softwareengineering #filesystems #backend #reliability

## Facebook

Fixed a quiet bug where our PHP file repository built metadata file paths with parse_url(), which does not understand stream wrapper URIs. Two different uploaded files with the same filename in different directories were silently overwriting each other's metadata. Wrote up the bug, the fix, and the migration tool it required: https://jonesrussell.github.io/blog/media-sidecar-uri-collision/

#php #softwareengineering
