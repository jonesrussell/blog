Queue-Issue: #338
Reference URL: https://github.com/waaseyaa/framework/commit/a310cc3f111907115801dfc1ac376e43916db092

## Bluesky

The waaseyaa/groups package ships Group and GroupType, but zero pre-registered bundles. Your app declares what group bundles exist and what fields they carry. https://github.com/waaseyaa/framework/commit/a310cc3f111907115801dfc1ac376e43916db092 #buildinpublic

## LinkedIn

Most content frameworks make you configure around a set of pre-registered types. waaseyaa/groups flips that.

The package ships two entity types: Group, a ContentEntityBase with id (gid), uuid, bundle, and label fields, and GroupType, a ConfigEntityBase that acts as the bundle holder. GroupsServiceProvider registers both.

Zero bundles are pre-registered.

Your app declares its own GroupTypes and registers bundle-scoped fields via EntityTypeManager::addBundleFields(). The framework provides storage, query routing, and validation. The domain model is yours.

The test suite documents what the architecture guarantees. A fresh install with no bundles starts with no subtables and no schema drift. Adding two bundles materializes both subtables. Bundle-scoped queries narrow via INNER JOIN. Loading an entity back merges subtable values correctly. Querying a field that exists in two bundles without specifying which raises a BundleAmbiguousFieldException.

13 new tests brought the total from 6391 to 6404. The integration suite covers standalone consumption and two-bundle coexistence.

The zero-bundles constraint is a deliberate choice for a layer-2 package. A layer-2 package provides infrastructure, not domain opinions. You get storage and query routing. What bundles mean in your app is your problem to solve.

https://github.com/waaseyaa/framework/commit/a310cc3f111907115801dfc1ac376e43916db092

#buildinpublic #phpdevelopment #symfony #frameworkdesign #waaseyaa

## Facebook

Most content frameworks come with bundle types already registered. waaseyaa/groups does not.

The package ships Group (a content entity with id, uuid, bundle, and label) and GroupType (the bundle holder). GroupsServiceProvider wires both into Waaseyaa's entity layer. What it does not do is pre-register a single bundle. Your app declares its own GroupTypes and tells the framework which fields belong to each one.

The test suite covers the architecture: fresh install has no subtables, two bundles materializes both, bundle-scoped queries use INNER JOIN, and querying the same field name across two bundles without specifying which raises a BundleAmbiguousFieldException. https://github.com/waaseyaa/framework/commit/a310cc3f111907115801dfc1ac376e43916db092

#buildinpublic #phpdevelopment
