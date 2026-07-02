# Waaseyaa API layer: strategy pattern replaces instanceof dispatch

Reference URL: https://github.com/waaseyaa/framework/issues/1111

## Facebook

Replaced a chain of instanceof checks in the Waaseyaa API layer with a strategy pattern. The old code had to know about every concrete type to decide how to handle a request. The new code delegates to the right handler without that knowledge.

The instanceof chain was readable at first. It became a problem every time a new request type was added: you had to touch the dispatch logic, which should not change when you add new types. The strategy pattern fixes that.

https://github.com/waaseyaa/framework/issues/1111

#php #refactoring

## Bluesky

Replaced instanceof dispatch with a strategy pattern in the Waaseyaa API layer. Adding a new request type no longer requires touching the dispatcher. https://github.com/waaseyaa/framework/issues/1111 #buildinpublic

## LinkedIn

Refactored the Waaseyaa framework's API dispatch layer to use a strategy pattern instead of a chain of instanceof checks. The dispatch logic no longer needs to know about every concrete request type; each type registers its own handler.

This is the open/closed principle in practice: adding a new request type no longer requires touching the dispatcher. It is one of those refactors that feels obvious after the fact but requires the right moment to justify the change.

https://github.com/waaseyaa/framework/issues/1111

#php #waaseyaa #refactoring #softwaredevelopment
