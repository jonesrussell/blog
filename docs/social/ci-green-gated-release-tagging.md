# Release tags gated on green CI at the exact commit

Reference URL: https://github.com/waaseyaa/framework/commit/b5feacb07e663d1f09455f873baaed8e74e33fa8

## Bluesky

A release tag should never sit on a commit CI hasn't proven green. So cuts now run CI on a throwaway branch and only tag if that exact SHA is green, then fast-forward in one push. #buildinpublic

https://github.com/waaseyaa/framework/commit/b5feacb07e663d1f09455f873baaed8e74e33fa8

## LinkedIn

Three releases in a row went out red. Here's the structural fix.

The old flow tagged a release, then ran CI. If a job failed at the tagged commit, the tag still existed. The fix always rode out in the next cut. That pattern is comfortable and quietly corrosive: your version history stops meaning "this was green."

So I gated tagging on CI, at the exact commit being tagged.

Cutting a release now enforces two gates through a small wait-for-green-ci helper.

Gate 1: the release base, main HEAD, must already have a completed successful CI run before anything is mutated. No starting from a broken base.

Gate 2: the release commit is pushed to a throwaway release-cut branch, CI is dispatched on it, and only a green conclusion at that specific SHA is allowed to tag it. When it passes, the workflow fast-forwards main and creates the tag in one atomic push.

If either gate fails, main is untouched and no tag is created. A tag can no longer exist without CI-proven green at its commit. Red jobs cannot ride into a release, and "it'll go out in the next cut" is structurally gone, not just discouraged.

The lesson from the post-mortem: if an invariant matters, make the pipeline enforce it. Don't leave it to remembering.

https://github.com/waaseyaa/framework/commit/b5feacb07e663d1f09455f873baaed8e74e33fa8

#cicd #devops #buildinpublic #softwareengineering

## Facebook

Three releases in a row shipped red, so I fixed the release process structurally.

The old flow tagged first and ran CI after. If something failed at the tagged commit, the tag still stood and the fix rode out in the next release. Now cutting a release runs CI on a throwaway branch and only tags the commit if that exact SHA goes green, then fast-forwards main and the tag in one atomic push. If CI isn't green, nothing is mutated and no tag is created.

A tag can no longer exist without CI proving the commit green. If an invariant matters, make the pipeline enforce it.

https://github.com/waaseyaa/framework/commit/b5feacb07e663d1f09455f873baaed8e74e33fa8

#devops #buildinpublic
