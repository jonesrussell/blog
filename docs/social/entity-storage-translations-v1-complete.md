# entity-storage-translations-v1: mission complete

Reference URL: https://github.com/waaseyaa/framework/commit/0f7e180

## Bluesky

Translations now land at the entity-storage layer in Waaseyaa. The prequel to translatable revisions. Translations first, then revisions of them. #buildinpublic

https://github.com/waaseyaa/framework/commit/0f7e180

## LinkedIn

entity-storage-translations-v1 landed in main last week. The Waaseyaa framework now stores per-language data on every entity, schema-aware.

What that means at the storage layer: every entity record has a translatable companion table, indexed by language code, with the schema mirrored from the base entity. A node entity with five fields can carry five fields of French data and five fields of English data alongside the canonical record, and the storage layer knows which queries should respect which language.

This is the prequel to M-004 (entity-storage-translatable-revisions, shipped a few days later), which added per-language revision history on top. Order matters here. You ship translations first, then revisions of translations, then policies for which translation is current. Doing it in the wrong order means rewriting the storage layer twice.

Why mention a foundation mission in isolation: the prequel is where the choices that matter get made. By the time you're shipping revisions, the data shape is fixed. If translations had been retrofitted onto an entity model that wasn't designed for them, every later capability (admin UI, JSON:API filtering, search indexing) would inherit the workaround. Doing translations at the storage layer first means everything built on top reads from one consistent shape.

Not the kind of milestone that wins on a feature list. Always the kind that decides what the framework can do six months later.

https://github.com/waaseyaa/framework/commit/0f7e180

## Facebook

entity-storage-translations-v1 landed in the Waaseyaa framework last week. The framework now stores per-language data on every entity at the storage layer.

This is the prequel to translatable revisions (M-004), which shipped a few days later on top of this foundation. Translations first, then revisions of translations. Doing it in that order is the difference between an integrated model and a retrofit.

Not flashy, but the kind of milestone that decides what the framework can do six months out.

https://github.com/waaseyaa/framework/commit/0f7e180

#buildinpublic #waaseyaa
