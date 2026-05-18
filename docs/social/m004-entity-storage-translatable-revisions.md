# M-004 mission complete: entity-storage translatable revisions

Reference URL: https://github.com/waaseyaa/framework/commit/70b867c

## Bluesky

Mission M-004 complete: entity-storage now supports translatable revisions in Waaseyaa. Multilingual content with full version history on every entity. The piece that turns a framework into a CMS. #buildinpublic

https://github.com/waaseyaa/framework/commit/70b867c

## LinkedIn

Mission M-004 is in main. Entity storage in the Waaseyaa framework now supports translatable revisions.

Plain English: every entity can have multiple language versions, every language version has its own revision history, and the storage layer keeps them coherent. Edit a page in French and the English revision history doesn't move. Roll back the French version and the English version stays where it is.

This is the unglamorous half of being a real CMS. Anyone can put multilingual fields on a record. The hard part is making revisions per language work without the data model getting confused about which version of which translation is current, draft, or published. The mission delivered the storage primitives and the entity-level diff factory that knows how to compare revisions inside a single language band.

Why it matters: most projects that try to retrofit translations and revisions onto an existing entity model end up with a quiet mess. The fix-up costs grow with content volume. Doing this at the storage layer, on day 60 of the framework, is much cheaper than doing it on day 600 of a production install.

Translatable revisions are the kind of capability that lets a non-trivial publishing team consider the framework. Without them, the answer to "can two translators work in parallel on the same article" is "yes but you'll lose someone's edits." With them, the answer is yes.

Next mission in this neighborhood is migration sources, which already landed as M-005. The framework is getting closer to "you could actually run a publication on this."

https://github.com/waaseyaa/framework/commit/70b867c

## Facebook

Mission M-004 landed in the Waaseyaa framework: entity storage now supports translatable revisions.

That means each entity can have multiple language versions, each language version keeps its own revision history, and the data model stays coherent across both axes. Editing the French version doesn't disturb the English revision log. Rolling back one language leaves the others alone.

This is the unglamorous half of being a real CMS. Easy to add fields, hard to make revisions per language work without a quiet mess. The mission shipped the storage primitives and the diff factory underneath.

https://github.com/waaseyaa/framework/commit/70b867c

#buildinpublic #waaseyaa
