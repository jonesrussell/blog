Queue-Issue: #366
Reference URL: https://github.com/waaseyaa/framework/commit/80937fe7b4a3b997d9a0b607cc6f0c0c864fe213

## Bluesky

WaaseyaaRouter was silently overwriting duplicate route names. It now rejects them at boot. The same commit added DefinesEntityType, a PHP attribute that wires entity types into the package manifest for auto-registration. https://github.com/waaseyaa/framework/commit/80937fe #buildinpublic

## LinkedIn

Silent overwrite is worse than an error.

Before commit 80937fe, if two packages in Waaseyaa registered the same route name, the second registration quietly replaced the first. You would deploy, your link generation would break on one route, and you would spend time figuring out why a working route disappeared. Nothing would tell you two packages were fighting over the same name.

WaaseyaaRouter now rejects duplicate route names. You find out at boot, not in production.

The same commit wired entity type auto-registration through PHP attributes. Before this, each service provider had to explicitly register the entity types it owned. Now you add the DefinesEntityType attribute to an entity class, declare it in the package manifest via attributeEntityTypes, and set entity_auto_register to true in config. ProviderRegistry picks it up at boot with no explicit registration call in any service provider.

Route priority is also part of this change. RouteBuilder gains a priority property and BuiltinRouteRegistrar sorts all routes before dispatching. If two routes match the same request pattern, the one with higher priority wins deterministically instead of by insertion order.

Package migrations move in the same direction. queue, notification, and scheduler now declare their migration paths in their own composer.json files under extra.waaseyaa.migrations, and MigrationLoader resolves them at install time. Migrations go where the package goes.

MCP route registration also moved: BuiltinRouteRegistrar no longer owns the MCP endpoint. The mcp package registers its own routes through its service provider.

https://github.com/waaseyaa/framework/commit/80937fe

#buildinpublic #php #waaseyaa #php84 #symfony

## Facebook

Before commit 80937fe in Waaseyaa, duplicate route names were silently overwritten. Two packages could register the same name and the second would quietly win. You would only notice when link generation stopped working for one of them. WaaseyaaRouter now rejects duplicates at boot.

The same commit added DefinesEntityType, a PHP attribute that lets entity classes declare their own type. Add the attribute, list the class in the package manifest, and the kernel's ProviderRegistry registers it automatically. No wiring in a service provider.

Route priority ordering, package-level migration path declarations, and moving MCP route registration into the mcp package are also in this commit.

https://github.com/waaseyaa/framework/commit/80937fe #buildinpublic #php
