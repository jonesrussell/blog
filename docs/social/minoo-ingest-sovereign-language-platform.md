# The ingest side of a sovereign language platform

Reference URL: https://jonesrussell.github.io/blog/minoo-ingest-sovereign-language-platform/

## Bluesky

An Elder holds up a whiteboard with one Anishinaabemowin word. Minoo turns that video into a searchable lesson, with a human reviewing every step and the community owning the whole stack. How the ingest side works:

https://jonesrussell.github.io/blog/minoo-ingest-sovereign-language-platform/

#languagetech #buildinpublic

## LinkedIn

An Elder posts a video of himself holding a whiteboard with one Anishinaabemowin word. That teaching becomes a published, searchable lesson. A human reviews every step, and the community owns the whole stack.

I just shipped the ingest side of Minoo, the Anishinaabemowin language platform I am building at minoo.live.

Two goals had to be true at the same time. Turn everyday teaching into structured, reusable data. And keep that data under community control end to end, built into where it lives and who can change it, not bolted on as a policy promise.

The pipeline runs in four stages. Ingest pulls a keyframe and audio from the reel. A vision model reads the Ojibwe and English off the whiteboard into a small JSON object. Then transcribe, curate, and publish are each a human gate, not an automated hop. The model fills a draft. It never publishes.

Language tagging uses BCP 47 with three layers, so it federates across the 21 Robinson Huron Treaty nations without flattening their dialects. Community provenance lives in a private-use subtag like oj-x-sagamok, which resolves oj-x-sagamok to oj to en. That needed a small upstream fix to the framework's i18n fallback chain.

The part I care about most: it runs on a Raspberry Pi the community controls, in Docker behind Caddy, on the Waaseyaa framework. The corpus stays local. The AI provider is swappable by config. The model assists. It does not own the language, the data, or the hosting.

https://jonesrussell.github.io/blog/minoo-ingest-sovereign-language-platform/

#languagetech #buildinpublic #opensource #php #indigenoustech

## Facebook

An Elder posts a video holding up a whiteboard with one Anishinaabemowin word. Minoo turns that into a published, searchable lesson, with a human reviewing every step and the community owning the whole stack.

I just shipped the ingest side: a reel comes in, a vision model reads the word off the whiteboard into a draft, and a person confirms it before anything reaches the public. It runs on a Raspberry Pi the community controls, on the Waaseyaa framework. The corpus stays local and the language stays governed by the people who hold it.

https://jonesrussell.github.io/blog/minoo-ingest-sovereign-language-platform/

#languagetech #buildinpublic
