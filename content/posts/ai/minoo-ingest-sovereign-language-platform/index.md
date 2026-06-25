---
categories:
    - ai
date: 2026-06-25T00:00:00Z
devto: true
devto_id: 3991568
draft: false
slug: minoo-ingest-sovereign-language-platform
summary: How an Elder's whiteboard video becomes a searchable Anishinaabemowin lesson, on infrastructure the community owns end to end.
tags:
    - waaseyaa
    - language-tech
    - ai-agents
    - build-in-public
title: The ingest side of a sovereign language platform
---

Ahnii!

I just shipped the ingest side of [Minoo](https://minoo.live), the Anishinaabemowin language platform I am building. The short version: an Elder posts a video of himself holding a whiteboard with a word on it, and that teaching becomes a published, searchable lesson, with a human reviewing every step and the community owning the whole stack. This post walks through how it actually works and the decisions underneath it.

## The problem

Anishinaabemowin teaching happens constantly, but it is scattered. Elders share words on Facebook, in notebooks, in classrooms, and almost none of it flows into anything a learner can search tonight. The few deep digital resources that do exist are owned by institutions, not by the communities whose language they hold.

So I set two goals that have to be true at the same time. Turn everyday teaching into structured, reusable data. And keep that data under community control end to end. Not control as a policy promise bolted on afterward, but control built into where the data lives, who can read it, and who can change it.

## The pipeline

The source material is real. Steven Bennett, an Elder from Sagamok, posts short videos holding up a whiteboard with one word, the Anishinaabemowin on top and the English gloss below. The pipeline turns one of those into a lesson in four stages.

**Ingest.** A reel comes in, by upload or through a URL importer backed by a swappable media-fetcher interface. The system pulls a keyframe and the audio, stages the media, and creates a draft tagged with its community provenance.

**Vision.** The keyframe goes to a vision model through the framework's provider abstraction, which returns a small JSON object: the Ojibwe and the English read straight off the whiteboard. Today that provider is Claude vision. The binding is swappable by config, and the sovereign-stack goal is a local model before any public beta.

**Transcribe, Curate, Publish.** Each of these is a human gate, not an automated hop. The model drafts, a person confirms. Curate promotes the entry into the dictionary. Publish puts it on the live site inside a lesson. Nothing reaches the public without a human pass.

The design principle is that the model is an assistant that fills a draft, never an authority that publishes.

## Language tags: BCP 47, three layers

One of the core decisions was how to tag the language so it can federate across the 21 Robinson Huron Treaty nations without flattening their dialects into one another. I use [BCP 47](https://www.rfc-editor.org/info/bcp47) with three layers and a fallback chain.

There is the macrolanguage, `oj`, always displayed with the autonym Anishinaabemowin rather than the ISO exonyms. There is an optional dialect layer in the middle. And there is community provenance as a private-use subtag, for example `oj-x-sagamok`.

Translation memory keys on the full tag, never on a dialect-only code, so each community keeps its own granularity. Dialect groupings (Nishnaabemwin spans two ISO codes) are derived from the community tag, not stored as the source of truth. A tag like `oj-x-sagamok` resolves `oj-x-sagamok` to `oj` to `en`, which needed a small fix to the framework's i18n fallback chain so it would resolve private-use subtags at all. That fix shipped upstream.

## The translation side

Alongside transcription there is a translation memory exposed at `/api/lang`: exact match first, then fuzzy, then log the gap when there is no entry yet, so the backlog fills itself as it gets used.

To seed it with real demand instead of guesses, I crawled the public English interface strings off the 21 RHT nation websites and ranked them by how many sites each one appears on. The result is a demand-ordered list of the words communities actually put on their own sites, things like Governance, Education, Membership, Chief and Council, a few hundred of them, waiting on speaker-verified translations. That ranked list is the backlog, highest demand first.

## Sovereign by construction

The part I care about most: this runs on infrastructure the community controls. The app is a PHP service built on the [Waaseyaa framework](https://github.com/waaseyaa/framework), in Docker behind Caddy, on a Raspberry Pi the community runs, not on someone else's cloud. The corpus stays local. The AI provider is swappable by config. The model assists, it does not own the language, the data, or the hosting.

That boundary shows up in the API too. The public `/api/lang` surface is read-only and validated, returning a 422 on a malformed tag rather than guessing. The admin pipeline and the corpus behind it are staff-gated. Reading is open. The language itself is governed.

## What is honest about it

Build-in-public should include the rough parts. Pulling video off Facebook is login-walled, so reliable ingest is upload-first for now. The vision provider is a hosted model, which is the interim and not the destination. And "published in the admin" has to actually mean "visible on the public site," which is exactly the kind of seam you only find by walking the whole pipeline on camera. Finding those is the point of demoing it for real.

The language has been taught this way for a long time, one word at a time, by people willing to stand in front of a camera and share it. The software's only job is to catch those teachings and hand them back to the community in a form a learner can use, without taking ownership of them along the way.

Watch the walkthrough: [youtu.be/zfx7CHs_Ec0](https://youtu.be/zfx7CHs_Ec0). The framework is open source at [github.com/waaseyaa/framework](https://github.com/waaseyaa/framework) and on [Packagist](https://packagist.org/packages/waaseyaa/framework).

Baamaapii
