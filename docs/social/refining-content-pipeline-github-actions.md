# Social copy: Day One of the Content Pipeline: What Broke and What I Fixed

**Canonical URL:** https://jonesrussell.github.io/blog/refining-content-pipeline-github-actions/

## Facebook

Three days ago this content pipeline did not exist. Yesterday I wrote about building it. Today I'm writing about what broke when I ran it for real.

First run mined 20 issues overnight. Too much noise, plus a Giiken project that surfaced as eight separate issues when it was really one post. No filter can see that — only a human reading them side by side.

So curation now supports "merge into target" to collapse N sub-issues into one canonical post. And the production step drafts the blog post first, then the social copy, because every tweet needs a URL and the URL has to point at something that exists. None of this was in the design doc. All of it was obvious after 24 hours of real use.

https://jonesrussell.github.io/blog/refining-content-pipeline-github-actions/

#ContentAutomation #GitHubActions #BuildInPublic #ClaudeCode

## X (Twitter)

Shipped a content pipeline. Ran it. Rewrote three parts the next day. Noise, human-only merges, backwards production. None visible until real input hit. https://jonesrussell.github.io/blog/refining-content-pipeline-github-actions/

## LinkedIn

You cannot design a content pipeline in the abstract. You ship v1, run it against one day of real input, and watch it lie to you.

Day one of an automated pipeline surfaced three things that could not have been predicted: the filter let through too much noise, the curation step had no way to merge near-duplicates that only a human could spot, and the production step jumped straight to social copy when every post needed a blog URL that did not exist yet.

Three fixes, one day. The refinement is not a sign something went wrong. It is the point.

https://jonesrussell.github.io/blog/refining-content-pipeline-github-actions/
