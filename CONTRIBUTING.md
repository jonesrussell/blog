# Contributing a Guest Post

This blog accepts guest posts from developers. No fees, no paywalls, no exclusivity requirements. If you write something useful, submit it.

## Who can submit

Anyone writing about software development. The audience is working developers — tutorials, war stories, tool reviews, opinion pieces. No marketing content, no AI-generated filler.

## How to submit

1. Fork this repo
2. Create your post directory: `content/guest/your-post-slug/`
3. Add your post as `content/guest/your-post-slug/index.md`
4. Use the frontmatter format below
5. Open a pull request against `main`

## Frontmatter

```yaml
---
title: "Your Post Title"
date: YYYY-MM-DD
categories: [guest]
tags: []              # max 4 tags
summary: ""           # one sentence describing the post
slug: "your-post-slug"
draft: true           # leave as true — changed to false on publish
author:
  name: "Your Name"
  bio: "One sentence about you."
  url: "https://your-site.com"     # optional
  github: "your-handle"            # optional
  twitter: "your-handle"           # optional
---
```

## Content guidelines

- **Original content only.** Posts must not be published elsewhere at the time of submission. Syndication after publication is fine.
- **Developer audience.** Write for people who ship code. Assume competence.
- **Working code only.** If you include code snippets, they must be correct and tested. Pseudocode is fine if labelled as such.
- **No minimum or maximum length.** Write as much as the topic needs.
- **Images.** Put them in `content/guest/your-post-slug/` alongside the post. Use descriptive filenames.

## Review process

Pull requests are reviewed by the blog owner. Expect feedback on clarity, accuracy, and fit. Most posts need at least one round of edits. If your PR sits for more than two weeks without a response, ping in the PR comments.

## What you get

- Your post at `https://jonesrussell.github.io/blog/your-post-slug/`
- Author attribution with name, bio, and links at the bottom of the post
- Listed at `/guest/`
- You keep full rights to your content

## Questions

Open an issue or ask in your PR.
