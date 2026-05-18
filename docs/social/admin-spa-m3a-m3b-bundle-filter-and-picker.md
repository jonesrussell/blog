# admin-spa M3A and M3B: bundle filter + bundle picker

Reference URL: https://github.com/waaseyaa/framework/issues/1413

## Bluesky

Admin SPA M3A and M3B landed in Waaseyaa: filter entity lists by bundle (#1423), pick a bundle on the create form (#1424). The two pieces that turn "entities" into "the kind of entity you care about" in the UI. #buildinpublic

https://github.com/waaseyaa/framework/issues/1413

## LinkedIn

Two pieces of the Waaseyaa admin SPA M3 mission shipped last week: bundle filtering on entity list views, and bundle selection on entity create forms.

A bundle, in case you don't think in CMS terms, is a sub-type of an entity. A node entity might have article, page, and event bundles. Each bundle has its own fields, validation, and rendering. From a database point of view they're rows in the same table; from a user's point of view they're different things.

M3A (PR #1423): the entity list views now have a bundle filter. Instead of seeing every node mixed together, an editor can ask for just articles, just events, just whatever. The filter is part of the URL, not session state, so it shares cleanly.

M3B (PR #1424): the entity create form now asks which bundle the user wants to make before showing the fields. You can't reasonably show all twenty bundle-specific fields at once and have the user mentally skip the ones that don't apply, so picking the bundle is step one.

Together they bridge the gap between "entities exist in storage" and "an editor can actually find and create the kind of entity they care about." Foundational features that don't sound exciting in isolation, but every CMS that's missing them feels broken in a way users can't quite articulate.

The next two pieces of M3 (workflow admin, transition history) build on this. The mission is in good shape.

https://github.com/waaseyaa/framework/issues/1413

## Facebook

Two admin SPA features shipped in the Waaseyaa framework last week: bundle filtering on entity list views (M3A, PR #1423) and bundle selection on the entity create form (M3B, PR #1424).

Bundles are CMS sub-types: a node might be an article, a page, or an event, each with its own fields. M3A lets editors filter lists to a specific bundle. M3B asks which bundle to make before showing the create form.

Together they turn "entities exist in storage" into "an editor can find and create the kind they care about." Foundational UX work.

https://github.com/waaseyaa/framework/issues/1413

#buildinpublic #waaseyaa
