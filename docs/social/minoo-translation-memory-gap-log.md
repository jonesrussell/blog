# A translation memory where the misses are the point

Reference URL: https://github.com/waaseyaa/minoo/pull/891

## Bluesky

A translation memory where the misses are the point: minoo's language module logs every lookup it can't answer to a gap log, turning the holes in a low-resource Indigenous language into a prioritized worklist. Dialect-aware. https://github.com/waaseyaa/minoo/pull/891 #buildinpublic

## LinkedIn

Most translation memories quietly throw away their failures. For a low-resource language, the failures are the most valuable thing you have.

minoo's new language module is built around that. Its lookup runs in three steps:

Exact match first, on a hash of the source plus the dialect, with a dialect-agnostic fallback so a phrase known in one dialect still helps another.

Then a fuzzy match, comparing against known English source strings within the dialect, accepting the best candidate above a similarity threshold.

And on a miss, instead of shrugging, it writes or increments a row in a gap log.

That gap log is the whole idea. Every phrase the system could not translate, and how often it was asked for, becomes a ranked worklist. The community is told exactly which words and sentences to record next, in order of demand, instead of guessing what to prioritize.

For a major language you buy or scrape a translation memory. For an Indigenous language being actively revitalized, you build one, and the most useful output early on is a precise map of what you do not have yet. The whole thing is gated behind a module flag and exposed over a small /api/lang surface. Built on Waaseyaa and Anokii.

https://github.com/waaseyaa/minoo/pull/891

#buildinpublic #ai #waaseyaa #php

## Facebook

Most translation memories quietly discard their failures. For a low-resource language, the failures are the most valuable thing you have, and minoo's new language module is built around that.

A lookup tries an exact match first, on the source plus dialect with a dialect-agnostic fallback, then a fuzzy match against known strings above a similarity threshold. On a miss, instead of shrugging, it logs the phrase to a gap log and counts how often it was asked for.

That gap log is the point: every phrase the system could not translate becomes a ranked worklist, so the community knows exactly which words to record next, in order of demand. For an Indigenous language being actively revitalized, the most useful early output is a precise map of what you do not have yet. Built on Waaseyaa and Anokii. https://github.com/waaseyaa/minoo/pull/891

#buildinpublic
