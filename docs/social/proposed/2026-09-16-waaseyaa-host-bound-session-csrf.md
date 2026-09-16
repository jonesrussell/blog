Queue-Issue: #1159
Reference URL: https://github.com/waaseyaa/framework/commit/e8015390d04c971d83292c4c9d833b98c4c9a4af

## Bluesky

The __Host- cookie prefix only works when your runtime actually enforces all four of its constraints. Waaseyaa now validates the full session cookie contract at boot and rejects the config if you get any of them wrong. https://github.com/waaseyaa/framework/commit/e8015390 #buildinpublic

## LinkedIn

Most session cookie hardening advice stops at "use the __Host- prefix." That's not enough.

The __Host- prefix prevents cross-subdomain session fixation. But the prefix only works when four constraints are all true at once: no Domain attribute, Path set to /, Secure required, HttpOnly required. Set a domain alongside __Host- and the browser treats the cookie as malformed and drops it silently. Your session is gone, and there is no log line telling you why.

For frameworks that let you configure arbitrary cookie attributes, this is a quiet window for misconfiguration. You can write what looks like a correct config, get through CI, deploy, and never catch the error until a user reports a broken login on a subdomain.

Waaseyaa now enforces the full contract when the app boots. If your session.cookie config has a Domain set alongside __Host- mode, the app refuses to start. A non-root Path is also rejected. The validation fires before any request is handled, so misconfigurations fail early in deployment, not in production under real traffic.

The same commit fixes two related problems. CSRF cookie names in the Admin SPA were previously hardcoded in HTML templates, so a runtime config change to the session policy required matching edits across multiple files. The csrfCookieName is now derived from the runtime policy and injected into every served HTML asset. You change the config in one place and it propagates.

Active session resume also validates the full Secure/HttpOnly/SameSite tuple against your current policy. A session started under a looser config will fail resume rather than silently continue with downgraded security properties. That is the right trade-off: a forced re-login is recoverable, a silently-downgraded session is not.

If you are running Waaseyaa's Admin SPA and want __Host- session cookies, this is what ties the config knob to real enforcement.

https://github.com/waaseyaa/framework/commit/e8015390d04c971d83292c4c9d833b98c4c9a4af

#php #security #buildinpublic #waaseyaa #webdev

## Facebook

The __Host- cookie prefix is a strong browser security guarantee: no cross-subdomain leakage, root path only, always Secure. But the prefix only works if your server enforces all four constraints it implies. Set a domain attribute alongside it and the browser quietly drops the cookie.

Waaseyaa now validates the full session cookie contract at boot. Wrong config fails before your first request. The same commit also cleans up CSRF cookie naming in the Admin SPA: names are now derived from the runtime policy and injected into HTML responses, so you change one config value and everything stays in sync.

https://github.com/waaseyaa/framework/commit/e8015390d04c971d83292c4c9d833b98c4c9a4af #buildinpublic
