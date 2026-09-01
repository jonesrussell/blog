## Bluesky

Wired a manual @claude review into GitHub Actions. Default tag mode is implementation capable, so I locked it read only, bounded the diff, denied git metadata reads, and added stale-review detection. https://jonesrussell.github.io/blog/hardening-claude-code-review-workflow-github-actions/

## LinkedIn

The official Claude Code Action example is great for letting Claude implement changes on request. It is the wrong default for a review only workflow.

I wired up a manual @claude review trigger for goformx and found the gaps fast: GitHub Actions if conditions are case insensitive, so a simple string match trigger is not exact. Tool permissions in the SDK accumulate instead of replacing mode defaults, so an allow list alone cannot get you to read only. And tag mode checks out the PR with a job token sitting in .git config, readable by anything with unrestricted file access.

The fixes: an exact-match preflight step, a bounded diff download that fails closed, an explicit deny list on top of the tool allow list, denied reads on .git, and a final revision check that flags the review as stale if the PR changed while Claude was working.

Full writeup with the actual workflow code:
https://jonesrussell.github.io/blog/hardening-claude-code-review-workflow-github-actions/

#GitHubActions #ClaudeCode #CI #DevSecOps #SoftwareEngineering

## Facebook

Turns out wiring an AI code reviewer into GitHub Actions safely takes more than an if condition and a comment trigger. Wrote up the five fixes it took to harden a manual @claude review workflow, from case insensitive triggers to stale review detection.

https://jonesrussell.github.io/blog/hardening-claude-code-review-workflow-github-actions/

#GitHubActions #ClaudeCode
