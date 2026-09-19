## Bluesky

The __Host- cookie prefix has four constraints at once, and browsers drop the cookie silently if you miss one. Wrote up how Waaseyaa validates the whole contract at boot instead of failing quietly in production. https://jonesrussell.github.io/blog/host-bound-session-csrf-cookies/ #php #security

## LinkedIn

New post: host-bound session and CSRF cookies in Waaseyaa.

The __Host- cookie prefix is a strong browser guarantee: a cookie named __Host-something can only be set and read by the exact origin that set it, closing off a real subdomain-takeover attack against session cookies. The catch is that the prefix is a contract with four parts: no Domain attribute, Path set to root, Secure required, and a secure context. Violate any one of them and the browser doesn't throw an error, it just silently drops the cookie. That turns into a login loop for a user and no log line pointing at the cause.

Waaseyaa added a host_bound mode to its SessionCookiePolicy that enforces the full contract for both the session cookie and the CSRF double submit cookie, governed from one policy object so the two can't drift out of sync. Set an explicit Domain, a non-root path, or secure to false while host_bound is on, and the app refuses to boot rather than shipping a cookie that silently never gets set. It also checks already-active PHP sessions against the resolved policy, catching the case where a prestarted session is still running under the old cookie name.

The writeup covers the validation code, how the CSRF cookie name now propagates from runtime config into every served Admin SPA HTML asset instead of being hard-coded, and why rejecting bad config at boot beats a best-effort default that papers over a mistake.

https://jonesrussell.github.io/blog/host-bound-session-csrf-cookies/

#php #security #webdev #softwareengineering #opensource

## Facebook

The __Host- cookie prefix is a strong security guarantee, but only if your server satisfies all four of its constraints. Miss one and the browser silently drops the cookie with no error. Wrote up how Waaseyaa's SessionCookiePolicy validates the full contract at boot for both the session and CSRF cookies, and refuses to start rather than fail quietly in production.

https://jonesrussell.github.io/blog/host-bound-session-csrf-cookies/

#php #security
