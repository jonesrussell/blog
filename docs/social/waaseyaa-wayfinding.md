# Wayfinding: the human-facing complement to the agent-readable web

Reference URL: https://github.com/waaseyaa/framework/pull/1688

## Bluesky

Waaseyaa gave AI agents /llms.txt to read the site. Humans now get the mirror: Wayfinding. A public catalog of stable UI anchors, session-private beacons, and saved trails you can revisit. Read/write symmetry for people, not just bots. https://github.com/waaseyaa/framework/pull/1688 #buildinpublic

## LinkedIn

Most of the "agent-readable web" work right now points one direction: make the site legible to AI. Waaseyaa shipped that part already, a /llms.txt discovery trio that lets an agent understand the app.

The new Wayfinding subsystem is the mirror image. The same structure, aimed at people.

Three pieces landed:

Anchors. Every meaningful element in the UI has a stable ID, derived from the entity schema, not hand-maintained. The catalog is published read-only at /.well-known/waaseyaa-anchors.json, mirroring how /llms.txt is published for agents. One source of truth, two audiences.

Beacons. The server can push a guidance message anchored to a specific element into a single user's session over an existing SSE loop. The isolation is enforced server-side: a connection is auto-subscribed to its own session channel and any client-supplied session channel is stripped. You can only ever receive your own session's messages, no matter what you ask for.

Trails. A saved journey becomes a real content entity: versioned, translatable, and governed by the same human-owned, no-silent-overwrite revision rule as the rest of the platform.

The framing I keep coming back to: agents got a way to read the site, so humans should get a parallel way to be guided through it. Same schema, same discovery pattern, same revision rules. Read/write symmetry across both audiences instead of bolting on a separate tour library.

Phase 1 of 5 is public here: https://github.com/waaseyaa/framework/pull/1688

#buildinpublic #php #webdevelopment #softwarearchitecture

## Facebook

Waaseyaa already shipped the AI-facing half of the modern web: a /llms.txt discovery layer that lets an agent read and understand the app. The new Wayfinding subsystem builds the human-facing half on the same foundation.

It comes in three parts. Anchors give every UI element a stable ID derived from the schema, published at a /.well-known catalog the same way /llms.txt is published for agents. Beacons let the server guide a single user through their session, with isolation enforced server-side so you only ever see your own session. Trails save a journey as a versioned, translatable content entity.

Same schema, same discovery pattern, same revision rules. Guidance for people built the way the agent surface was built. Phase 1 is public here: https://github.com/waaseyaa/framework/pull/1688

#buildinpublic
