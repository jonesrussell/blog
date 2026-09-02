## Bluesky

A missing npm ci let schema validation crash on every mined candidate, so our content pipeline filed zero issues for a week and nothing complained. Fixed with a loud fail-open guard, then the real CI fix. #ci #automation

https://jonesrussell.github.io/blog/content-mining-pipeline-silent-failure/

## LinkedIn

New post: a missing npm ci step silently starved my content mining pipeline for a week.

The mining workflow validates every candidate against a JSON schema before filing an issue. The validator's dependency was never installed in CI, so validation crashed on every candidate, got treated as a rejection, and the workflow still exited clean. Zero issues filed, nothing in the logs said so.

The fix has two parts: a fail-open guard that warns loudly when the validator's dependencies are missing instead of silently dropping candidates, and the actual root cause fix, installing Node dependencies in the CI workflow before the script runs.

The bigger lesson: a script that succeeds by doing nothing is worse than one that fails loudly, because nothing pages you for it.

https://jonesrussell.github.io/blog/content-mining-pipeline-silent-failure/

## Facebook

A missing npm ci step let my content mining pipeline silently fail for a week straight. Zero issues filed, no errors, nothing to page me. Wrote up the two part fix, fail loud and warn, then patch the actual cause.

https://jonesrussell.github.io/blog/content-mining-pipeline-silent-failure/
