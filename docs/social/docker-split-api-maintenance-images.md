## Bluesky

One Dockerfile was building the API image with two maintenance CLIs bundled in. Split it into a shared base plus api and maintenance targets, then wrote a script that verifies each image only has what it should. https://jonesrussell.github.io/blog/docker-split-api-maintenance-images/

## LinkedIn

A production Dockerfile I looked at was shipping its API image with two CLI tools it never runs in production, just because they came out of the same build stage as the API binary.

The fix: a shared runtime base stage with no binaries, then two named build targets, api and maintenance, that each copy only their own executables. Building without a target flag still produces the API image, so nothing else has to change.

The part I found more interesting than the Dockerfile split is the verification script. It builds all three image variants, runs each one with the network disabled, filesystem read-only, and all capabilities dropped, then asserts exactly which files exist inside and which user it's running as. That check now runs as part of CI, so the split can't quietly drift the next time someone edits the Dockerfile.

Full writeup: https://jonesrussell.github.io/blog/docker-split-api-maintenance-images/

#docker #devops #golang #cicd #security

## Facebook

Split a Dockerfile that was bundling admin CLI tools into the API image, then added a script that proves the split holds on every build instead of trusting it by eye. https://jonesrussell.github.io/blog/docker-split-api-maintenance-images/

#docker #devops
