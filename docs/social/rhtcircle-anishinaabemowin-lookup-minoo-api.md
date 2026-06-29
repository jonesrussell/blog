# rhtcircle.ca consumes Minoo's Anishinaabemowin language API

Reference URL: https://github.com/jonesrussell/rhtcircle/pull/2

## Bluesky

rhtcircle.ca now looks up Anishinaabemowin words by calling Minoo's /api/lang. One platform serves the language, another consumes it, with dialect attribution and an OCAP usage note baked into every result.

https://github.com/jonesrussell/rhtcircle/pull/2

#buildinpublic

## LinkedIn

Yesterday I wrote about building a translation memory into Minoo, the Anishinaabemowin language platform. Today, the other side of it: a real app consuming that API.

rhtcircle.ca now does server-side Anishinaabemowin word lookup by calling Minoo's /api/lang endpoint.

A few decisions that mattered.

Every result carries its provenance. The dialect is named (Nishnaabemwin, Sagamok), there is a link back to the source, and an OCAP and noncommercial usage note travels with the word. The language is not just data to be scraped. It stays attributed and governed.

It is built for few-or-zero results, because that is the honest state of the corpus today. A miss is a normal answer, not an error, and the gap gets logged so the backlog fills with real demand.

It degrades gracefully. The call has a short timeout around 2.5 seconds, responses are cached (24h for a hit, 1h for a miss), and if Minoo is unreachable the page still renders. The same page also serves ?format=md for machine-readable access.

This is the part of building an ecosystem I find most satisfying: two platforms I run, one serving the language and one consuming it, over a clean public API.

https://github.com/jonesrussell/rhtcircle/pull/2

#opensource #buildinpublic #php #languagetech #indigenoustech

## Facebook

Yesterday I shared how Minoo serves Anishinaabemowin words over a public API. Here is the other half: rhtcircle.ca now looks those words up by calling that API.

Every result carries its provenance: the dialect is named (Nishnaabemwin, Sagamok), there is a source link, and an OCAP and noncommercial usage note travels with each word. It is cached, it times out fast, and if the language service is unreachable the page still works. Two platforms I run, one serving the language and one consuming it, over a clean API.

https://github.com/jonesrussell/rhtcircle/pull/2

#buildinpublic #languagetech
