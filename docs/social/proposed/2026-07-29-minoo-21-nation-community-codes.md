# Language data needs community-level provenance from day one, not dialect groups

Queue-Issue: #1075
Reference URL: https://github.com/waaseyaa/minoo/commit/1d8b4a346a7b8a01870007ff12db14bef53997c1

## Bluesky

Dialect codes like oji-east grouped two dozen communities under one label. That flattens the wrong thing for a sovereignty-first language platform. Minoo now tags data with individual BCP 47 codes for all 21 Robinson Huron Treaty nations, oj-x-sagamok style, each provisional and OCAP-governed. https://github.com/waaseyaa/minoo/commit/1d8b4a3 #languagetech #buildinpublic

## LinkedIn

When you store language data, the question is always: whose language?

Dialect codes like oji-east are a reasonable answer for linguistic classification. They map a continuum of related speech across a broad region. But for a platform built on data sovereignty, they collapse the wrong thing. Twenty communities contributing their recordings end up tagged the same way, with no machine-readable way to ask which community produced which corpus item.

OCAP is the Indigenous data governance framework this work follows. Ownership, Control, Access, Possession. It means the community holds the data, governs who can read or write it, and controls how it flows. For that to hold technically, provenance has to be in the tag.

Minoo now uses a community-code registry for all 21 Robinson Huron Treaty nations. Each nation gets a BCP 47 private-use extension in the format oj-x-[code]. Sagamok corpus is tagged oj-x-sagamok. Serpent River would be oj-x-serpent-river. Multi-subtag codes handle the cases where a single token would exceed BCP 47's 8-character private-use limit.

Three things changed technically. The oji-east and oji-ottawa dialect codes are gone, replaced by a nishnaabemwin grouping that covers the Eastern Ojibwe and Odawa continuum without flattening individual community identity. The DialectCodeProvider now derives the dialect grouping from the community code rather than storing it, so community granularity is kept in the tag and never lost in storage. The IngestController stamps corpus drafts oj-x-sagamok on ingest, because Steven's teaching corpus is Sagamok recordings.

Both Minoo and rhtcircle.ca use the same registry. One source of truth for language provenance across both platforms.

The codes are provisional and OCAP-governed. That's the point. Provenance is not a detail to wire up later. It goes in the tag on day one.

https://github.com/waaseyaa/minoo/commit/1d8b4a346a7b8a01870007ff12db14bef53997c1

#languagetech #indigenoustech #buildinpublic #ojibwe #php

## Facebook

When a language platform stores a corpus recording, the tag it applies answers one question: whose language is this? Dialect codes like oji-east are a sensible answer for linguistics. They cover a broad continuum. But for a platform built on Indigenous data sovereignty, they collapse too much. Twenty communities contributing their recordings end up tagged identically.

Minoo now uses a community-code registry for all 21 Robinson Huron Treaty nations. Each nation gets its own BCP 47 private-use language tag in the format oj-x-[code], so corpus data carries provenance down to the contributing community from the moment of ingest, not just the dialect group. Every code is provisional and governed under the OCAP framework: Ownership, Control, Access, Possession.

The old oji-east and oji-ottawa codes are gone. Both Minoo and rhtcircle.ca use the same registry now.

https://github.com/waaseyaa/minoo/commit/1d8b4a346a7b8a01870007ff12db14bef53997c1 #languagetech
