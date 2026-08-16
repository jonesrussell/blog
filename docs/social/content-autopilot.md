## Bluesky

This blog now writes some of its own posts. A GitHub Actions pipeline mines project activity, curates it with Claude, verifies any code against the real source repo, and publishes with zero human review. How it works: https://jonesrussell.github.io/blog/content-autopilot/

## LinkedIn

I built a zero touch content pipeline for my blog. A GitHub Actions workflow mines activity from my projects, hands candidates to Claude running headless in CI with a rule to reject thin scaffolding and verify any code against the real source repo before quoting it, then writes the post, gates it on a Hugo build, and pushes straight to main.

The throttle is not a schedule, it is Buffer's queue depth. If a channel already has posts waiting, the pipeline stops before it spends a single token.

This post is the pipeline documenting itself. Full writeup here: https://jonesrussell.github.io/blog/content-autopilot/

#automation #githubactions #aiengineering #devops

## Facebook

My blog now has a pipeline that mines activity, drafts posts with Claude, verifies the code before publishing, and ships straight to main with no human review. This post is the pipeline explaining how it works: https://jonesrussell.github.io/blog/content-autopilot/

#automation #buildinpublic
