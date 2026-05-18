# admin-spa Mission M2: envelope reshape and build pipeline

Reference URL: https://github.com/waaseyaa/framework/issues/1412

## Bluesky

Admin SPA Mission M2 done in Waaseyaa: API envelope reshaped, build pipeline rewired. Foundational frontend plumbing nobody sees until it breaks. M3 missions land next. #buildinpublic

https://github.com/waaseyaa/framework/issues/1412

## LinkedIn

Mission M2 of the Waaseyaa admin SPA arc closed last week. Two pieces of plumbing landed: the API envelope got reshaped, and the build pipeline got rewired.

Envelope reshape: every endpoint in the admin API now returns the same JSON shape, with the actual payload nested under a known key alongside metadata for pagination, links, and request-trace IDs. Sounds boring. Matters because every Vue component that reads from the API used to have to know whether its endpoint returned a flat array, a paginated list, or a single resource with side-loaded relations. Now it doesn't. There's one shape, one parser, one place to handle errors.

Build pipeline: the SPA bundle is now built and versioned independently of the framework. Previously the admin assets were tangled into the main composer install path, which made dev rebuilds slower and made it impossible to roll back the SPA without rolling back the framework. The pipeline now treats the SPA as a distinct artifact, same way a CMS treats themes.

These are both load-bearing changes that the rest of the admin SPA work depends on. M3, the mission set that actually delivers user-facing pages (bundle filters, workflow admin UI, transition history widgets), couldn't have shipped cleanly until the envelope and build pieces were stable.

Worth a flag because frontend plumbing usually doesn't get a milestone label. When it does, it tends to be because the team learned the hard way that skipping the plumbing makes every feature after it more expensive.

https://github.com/waaseyaa/framework/issues/1412

## Facebook

Mission M2 of the Waaseyaa admin SPA work closed last week: API envelope reshaped to a single consistent JSON shape across every endpoint, and the SPA build pipeline rewired to be independent of the main framework install.

Both are foundational plumbing. The envelope means Vue components don't have to special-case different response shapes. The pipeline means the SPA bundle can be built and rolled back without dragging the framework along. Neither change is visible to a user. Both make everything that comes after cheaper.

https://github.com/waaseyaa/framework/issues/1412

#buildinpublic #waaseyaa
