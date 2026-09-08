# Stop letting a failing audit logger crash requests that already succeeded

## Bluesky

Found a bug where a throwing audit logger could crash a request after the real outcome was already decided, sometimes even erasing the audit record itself. Wrote up the fix: catch and swallow the logger's own failures.

https://jonesrussell.github.io/blog/audit-logger-failure-containment/

## LinkedIn

Wrote up a PHP bug this week that took two passes to fully close.

Our MCP endpoint writes a durable audit record around every tool call, fail closed by design. But the code that reports a ledger failure to the application logger was not guarded. If the logger itself threw, the throw escaped uncaught, after the tool had already run and its side effect had already committed. A caller would see a crash instead of the completed result and could retry an action that already happened.

The fix wraps every one of those report sites in a small helper that catches and silently discards a throwing logger, on purpose, since there is no safe way to log a logging failure without risking a loop.

A follow up sweep found a worse variant: some report calls ran before the request's own terminal audit write, so an unguarded throw there would crash the request and silently erase the audit record for it. Same fix, applied everywhere that shape showed up.

That lesson isn't specific to this framework. Logging code that runs after a decision is already made should never be able to overturn that decision. If your logger can throw and nothing catches it, it is a hidden second failure mode for every path that touches it, and your tests will not catch it unless you specifically test with a logger that fails.

https://jonesrussell.github.io/blog/audit-logger-failure-containment/

#php #softwareengineering #reliability #backend #observability

## Facebook

Fixed a bug this week where a failing audit logger could crash a request after its real outcome was already decided, and in one case even erase the audit record for it. Wrote up the fix and the general lesson about containing logging failures.

https://jonesrussell.github.io/blog/audit-logger-failure-containment/

#php #buildinpublic
