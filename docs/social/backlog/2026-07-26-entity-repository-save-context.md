Queue-Issue: #584
Reference URL: https://github.com/waaseyaa/framework/commit/f55d1ea

## Bluesky

Before: import a migration entity, get double BeforeSave/AfterSave events. EntityRepository::save() now takes an optional SaveContext parameter: one dispatch site, no duplicates. https://github.com/waaseyaa/framework/commit/f55d1ea #buildinpublic

## LinkedIn

Your migration imports were double-firing lifecycle events, and you might not have noticed.

When Waaseyaa's EntityDestination::write() called EntityRepository::save(), both the destination and the repository each dispatched BeforeSaveEvent and AfterSaveEvent independently. Every imported entity triggered twice the expected lifecycle hooks.

This is a class of bug that hides well. If your listeners are idempotent the behavior looks normal. The moment you add a listener that counts, logs to an audit trail, or sends a notification, you get phantom entries.

The fix in commit f55d1ea makes the repository the single dispatch site.

EntityRepository::save() now accepts an optional third parameter: ?SaveContext $context = null. This gives callers a way to pass import metadata without changing the interface contract. EntityRepositoryInterface::save() stays unchanged, which keeps the layer boundary clean.

EntityDestination::write() passes SaveContext::asImport() through the save call instead of dispatching events on its own. UnitOfWork::bufferEvent() was widened from Symfony\Contracts\EventDispatcher\Event to the object type so it can buffer any domain event going forward.

Three files changed:
packages/entity-storage/src/EntityRepository.php (+56, -5)
packages/entity-storage/src/UnitOfWork.php (+8, -4)
packages/migration/src/Plugin/Destination/EntityDestination.php (+17, -11)

8,254 PHPUnit tests pass. Static analysis and package layer checks clean.

If you have a framework or ORM-adjacent layer with more than one call site touching the same lifecycle events, this pattern applies. Push dispatch responsibility to one place and thread context through.

https://github.com/waaseyaa/framework/commit/f55d1ea

#PHP #EntityFramework #buildinpublic #Waaseyaa #SoftwareArchitecture

## Facebook

Migration imports in Waaseyaa had a double-dispatch problem: both the destination writer and the entity repository fired BeforeSave and AfterSave events on every save call. If any listener logs, counts, or sends a notification, you get duplicates.

The fix widens EntityRepository::save() to accept an optional SaveContext parameter. The repository owns dispatch. EntityDestination::write() threads SaveContext::asImport() through and stops dispatching on its own.

Full change at https://github.com/waaseyaa/framework/commit/f55d1ea #buildinpublic
