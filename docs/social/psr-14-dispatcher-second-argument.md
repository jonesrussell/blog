# PSR-14 dispatch contract

## Bluesky

Symfony accepts an event name as a second dispatch() argument. PSR-14 does not promise it. A small Waaseyaa fix shows why the interface you inject matters: https://jonesrussell.github.io/blog/psr-14-dispatcher-second-argument/ #PHP

## LinkedIn

Your code can work with a concrete dispatcher while relying on a method argument its declared interface does not provide.

A small Waaseyaa fix removed a redundant event-name argument from a call typed against PSR-14. Symfony already defaults to the event class, so listener registration could stay the same.

The review checks are practical: inspect the imported interface, confirm how listeners are registered, and preserve the surrounding transaction behavior.

I wrote up the example here: https://jonesrussell.github.io/blog/psr-14-dispatcher-second-argument/

#PHP #Symfony #SoftwareDevelopment

## Facebook

Two PHP interfaces can have the same short name and promise different things.

Symfony's event dispatcher accepts an optional event name. The PSR-14 interface takes the event object alone. A small Waaseyaa fix is a useful example of keeping a call within the interface your code actually depends on.

Here's the change and what to check before making it: https://jonesrussell.github.io/blog/psr-14-dispatcher-second-argument/

#PHP #Symfony
