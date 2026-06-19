# One URL, two readers: serving HTML to people and Markdown to agents

Reference URL: https://jonesrussell.github.io/blog/agent-readable-content-negotiation/

## Bluesky

The web has two readers now: people and agents. Most stacks build a second API for the second one. Waaseyaa serves a web page and clean Markdown from one URL, decided by the Accept header. New post on how it works. https://jonesrussell.github.io/blog/agent-readable-content-negotiation/ #buildinpublic

## LinkedIn

The web has two kinds of readers now: people and AI agents. Most stacks make you build a second system to serve the second one, a parallel API with its own routes, auth, and serializers that slowly drifts from what people actually see.

Waaseyaa takes a different path. One URL serves both.

You define a content type once with a single command. From that, the canonical /{type}/{id} URL answers a browser with a rendered web page and an agent with clean Markdown, decided by the HTTP Accept header. No second API. No shadow routes to keep in sync.

A few details I wrote up in the new post:

- An explicit ?raw / ?format=md toggle, so you can eyeball exactly what an agent sees in a browser.
- A Vary: Accept header so a shared cache never hands HTML to an agent or Markdown to a browser.
- Zero-config /robots.txt, /sitemap.xml, and /llms.txt routes, generated from the same content-type metadata, plus schema.org JSON-LD in the page head.

As more of the web gets read through AI assistants, negotiating on one URL keeps people and machines reading the same source of truth instead of two systems that drift apart.

Still alpha, the read side is further along than the write side, but the thesis holds: one URL, two readers, no second system.

https://jonesrussell.github.io/blog/agent-readable-content-negotiation/

#php #opensource #buildinpublic #ai

## Facebook

The web has two kinds of readers now: people and AI agents. Most stacks make you build a second system for the second one, a separate API that slowly drifts from what people see.

Waaseyaa serves both from one URL. You define a content type once, and the same address returns a normal web page for a person and clean Markdown when an agent asks for it, decided by the HTTP Accept header. No second API. You can append ?raw to any content URL to see exactly what an agent sees. It even publishes /llms.txt, /sitemap.xml, and schema.org data from the same definition, so your content is legible to an AI assistant the moment it goes live.

New post walks through how it works. Still alpha, but the idea holds: one URL, two readers, no second system.

https://jonesrussell.github.io/blog/agent-readable-content-negotiation/

#php #opensource
