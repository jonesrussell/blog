---
categories:
    - general
date: 2026-06-20T00:00:00Z
devto: true
devto_id: 3965241
draft: false
slug: ai-slop-content-treadmill
summary: Why I automated my own content pipeline, what it costs, and how developers can share their work without adding to the AI slop.
tags:
    - ai
    - writing
    - social-media
    - content
title: AI slop and the content treadmill every developer is on
---

Ahnii!

I built a machine that turns my git commits into social media posts. This post is about why I did that, what it costs, and whether any of us can share our work anymore without contributing to the flood of AI slop.

Let me be honest about my own setup first.

## I automated my own content pipeline

Every day a script scans my repositories for recent commits. It groups them by theme, scores each group on how postable it looks, and files a queue item. I review the queue, pick the good ones, and a second tool drafts a blog post or a short update. A third tool rewrites that draft three times, once for [Bluesky](https://bsky.app/), once for [LinkedIn](https://www.linkedin.com/), once for Facebook, and pushes all three into a scheduler.

Four stages: mine, curate, produce, distribute. A human, me, sits in the middle of two of them. The rest runs on its own.

I am not proud of all of it. I am also not going to pretend I would keep up without it.

## The treadmill has a lot of belts

Here is the part nobody mentions when you start sharing your work. It is not one post. It is one idea, reshaped for every platform's algorithm, because each one punishes you for treating it like the others.

Bluesky wants one or two sentences and a link, under 300 characters, or it reads as spam.

LinkedIn wants 1,200 to 1,800 characters with the hook in the first two lines, because everything after "see more" is invisible to people who never click.

Facebook barely shows text posts to anyone who does not already follow you, so you end up writing for an audience that is already yours.

X wanted something else again, before I disconnected it.

Same idea. Four rewrites. Four character budgets. Four hashtag policies. Four mental models of an algorithm I do not control and cannot see. And that is before you reach Mastodon, Threads, Reddit, a newsletter, [dev.to](https://dev.to/), and whatever launched this quarter.

I am a developer. I want to share what I built and have a few of the right people see it. Instead I am a one-person content team optimizing for five recommendation engines.

## Where the slop actually comes from

We talk about AI slop like it is a content problem. Low-effort articles, generated images, summaries of summaries. But the slop is a symptom. The disease is the incentive.

When the only way to be seen is to feed five algorithms every day, nobody can do that by hand and still ship code. So we automate. And automated, optimized, competent, voiceless content is exactly what slop is.

My pipeline is good. The posts are accurate, they link to real commits, they read fine. That is the problem. "Reads fine" at infinite scale is the slop. I am not flooding the feed with garbage. I am flooding it with volume. Past a certain point those are the same thing.

## What I think the way out looks like

I do not have this solved. I have a few moves that feel less bad than the alternative, and I would genuinely like your read on them.

**Write once, syndicate from a canonical source.** The blog post is the real thing. Everything else points back to it. The social copy is a doorway, not the room. One piece of writing holds my actual voice, instead of five disposable ones competing to be the loudest.

**Automate distribution, not authorship.** I let machines handle scheduling and reformatting. I do not let them decide what is worth saying. The human stays on the idea and the voice. The robot does the cross-posting. The moment the robot picks the topic, it is slop.

**Cover fewer platforms, on purpose.** You do not have to be everywhere. Owning one channel you control, an RSS feed, a newsletter, your own domain, beats renting attention on five you do not. I would rather have 200 readers who chose me than 5,000 impressions an algorithm rented me for an afternoon.

**Treat the reader as the tiebreaker.** When the algorithm and the human want different things, pick the human. It performs worse this quarter. It is the only thing that compounds.

**Disclose the assistance.** If a tool helped me write something, saying so costs me nothing and keeps me honest about what I am putting into the feed.

## A question, not a conclusion

Here is what I keep getting stuck on. If I stop, I lose to the people who do not. If we all keep going, the feeds become unreadable and none of us win either. That is a coordination problem, and I cannot solve it from inside my own pipeline.

So I am asking you. How do you share your work without turning into a content factory? Have you cut platforms and survived it? Did owning your own channel actually work, or is it a slow fade into obscurity? Is disclosing AI assistance signal, or just more noise?

I will read every reply. Not the algorithm. Me.

Baamaapii
