Queue-Issue: #308
Reference URL: https://github.com/waaseyaa/framework/commit/46a11cb8ea21e6a9dce58fca6c9558e662d55776

## Bluesky

The first commit that ships a package is not the commit that finishes it. waaseyaa/northcloud launched with NorthCloudClient, NcSyncService, and a mapper interface. Then 14 follow-up fixes landed. https://github.com/waaseyaa/framework/commit/46a11cb8ea21e6a9dce58fca6c9558e662d55776 #buildinpublic

## LinkedIn

Your first cut of a PHP integration package is not the finished version.

waaseyaa/northcloud shipped as a single commit: NorthCloudClient with a SQLite-backed NorthCloudCache, NorthCloudSearchProvider implementing Waaseyaa's SearchProviderInterface, and NcSyncService with a background NcSyncWorker and northcloud:sync command.

The extension seam is NcHitToEntityMapperInterface. Each consuming app implements this interface to map North Cloud search hits to its own entity types. MapperRegistry routes those hits to the right mapper at runtime.

17 unit tests passed. The package was wired into the monorepo. It was shipped.

Then usage began.

Token guard was missing. SSRF vectors were open. Sync deduplication was wrong. Cache keys were unstable across queries. Environment variable fallbacks had gaps. Malformed API responses caused crashes. The northcloud:sync command was not on the public surface. The default base URL was wrong.

14 fixes landed across the following week.

This is not a story about a bad first implementation. The mapper interface held. The sync architecture held. The gaps were in configuration, error handling, and edge cases that only a real consuming app running against a live API will find.

If you are building a PHP integration package, budget a follow-up week after it passes its unit tests. That is when the real shipping happens.

https://github.com/waaseyaa/framework/commit/46a11cb8ea21e6a9dce58fca6c9558e662d55776

#buildinpublic #phpdevelopment #symfony #waaseyaa #integrationpatterns

## Facebook

Shipping a package and finishing a package are two different things.

waaseyaa/northcloud landed in a single commit: NorthCloudClient with a SQLite-backed cache, NorthCloudSearchProvider wired to Waaseyaa's search surface, NcSyncService with a background worker, and NcHitToEntityMapperInterface as the seam where each app defines how search hits map to its own entities. 17 unit tests passed.

The following week brought 14 fixes: token guard, SSRF hardening, sync dedup, cache-key stability, env-var fallbacks, malformed response handling, command surface exposure, and a wrong default base URL. Integration packages have edge cases that only real usage finds. https://github.com/waaseyaa/framework/commit/46a11cb8ea21e6a9dce58fca6c9558e662d55776

#buildinpublic #phpdevelopment
