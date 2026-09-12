## Bluesky

Our cache:clear command could not run in production at all, and once fixed it cleared a hardcoded bin list that did not match the real config. Wrote up the fix. https://jonesrussell.github.io/blog/cache-clear-hardcoded-bin-list/

## LinkedIn

New post: a cache:clear CLI command that had two bugs stacked on top of each other.

First, it could not even be constructed in production - a missing kernel binding meant every invocation failed outright.

Second, once that was patched around, the command cleared a hardcoded list of cache bin names that had drifted from what the application actually configured. One real bin was never reachable. Two bin names that were not configured printed "cleared" anyway, because the cache factory hands back a harmless empty backend for any name you ask it for.

The fix replaces the hardcoded list with a single canonical accessor for "what bins does this configuration actually register," shared by both the HTTP and CLI boot paths, so the two surfaces can never drift apart again.

The bigger lesson: a test that mocks deleteAll() and counts calls will pass whether your bin list is right or wrong. The fix here mattered less than making the tests check real backend state instead.

Full writeup: https://jonesrussell.github.io/blog/cache-clear-hardcoded-bin-list/

#php #softwareengineering #cli

## Facebook

Debugged a CLI cache:clear command that could not run in production, then quietly lied about what it cleared once it could. Wrote up the bug and the fix: https://jonesrussell.github.io/blog/cache-clear-hardcoded-bin-list/

#php #softwareengineering
