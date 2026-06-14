# New opt-in workspace chat package in Waaseyaa

Reference URL: https://github.com/waaseyaa/framework/commit/8315890c01a892526086c4e3a9f8e3ba70c96f99

## Bluesky

New opt-in package: a chat-first workspace shell. SSE client with pending and failed send states, stream-drop resync, paginated rehydration, and viewer-mode proposal cards. #buildinpublic

https://github.com/waaseyaa/framework/commit/8315890c01a892526086c4e3a9f8e3ba70c96f99

## LinkedIn

Shipped the first cut of a chat-first workspace shell as a new opt-in package in the framework.

It is opt-in by design. The chat surface is its own layer, so apps that don't want it pay nothing, and apps that do get a real client instead of a toy.

The interesting part is what "real" meant once I pulled the SSE chat client out of the Anokii identity companion and parameterized it: endpoints, a per-account thread key with URL precedence validated before anything persists, intro and chips, avatars, and a proposal router with a finalize seam.

The field-tested details are where chat UIs usually cut corners:

A turn is never shown as sent before the server acknowledges it. Pending and failed states are explicit, and a rejection surfaces the server's own reason and adopts its machine-readable limit instead of guessing.

If the stream drops, the client resyncs from the persisted conversation rather than losing messages.

History rehydrates lazily with load-earlier paging, repaints from a sessionStorage snapshot, and renders viewer-mode proposal cards for people who aren't the proposer.

The transport is a seam too. The current client can be swapped for the agent transport later without touching consumers.

Opt-in layers and honest send states. Two things worth copying.

https://github.com/waaseyaa/framework/commit/8315890c01a892526086c4e3a9f8e3ba70c96f99

#softwareengineering #frontend #buildinpublic #php

## Facebook

Shipped the first increment of a chat-first workspace shell as a new opt-in package in the framework. Apps that don't want it pay nothing.

I pulled the SSE chat client out of our identity companion and made it reusable: configurable endpoints, a per-account thread key, proposal cards, and a transport seam so the agent backend can slot in later. The details I care about are the honest ones. A message is never shown as sent before the server acknowledges it, failed sends surface the server's actual reason, and a dropped stream resyncs from the saved conversation instead of losing turns.

Opt-in layers and honest send states are both worth copying.

https://github.com/waaseyaa/framework/commit/8315890c01a892526086c4e3a9f8e3ba70c96f99

#buildinpublic #frontend
