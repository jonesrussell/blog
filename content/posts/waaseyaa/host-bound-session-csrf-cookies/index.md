---
categories:
    - php
    - waaseyaa
date: 2026-09-19T00:00:00Z
devto: true
devto_id: 4733547
draft: false
slug: host-bound-session-csrf-cookies
summary: How Waaseyaa's SessionCookiePolicy enforces the __Host- cookie prefix's four constraints for both the session cookie and the CSRF double-submit cookie, and rejects misconfiguration at boot instead of failing silently in the browser.
tags:
    - php
    - waaseyaa
    - security
    - cookies
title: Host-bound session and CSRF cookies in Waaseyaa
---

Ahnii!

The `__Host-` cookie prefix is one of the stronger security guarantees browsers give you: a cookie named `__Host-something` can only be set and read by the exact origin that set it, no matter how many subdomains share the parent domain. That closes a real attack: a compromised or malicious subdomain writing a cookie that your main app then trusts as its own session.

The catch is that `__Host-` isn't a flag you flip. It's a contract with four parts, and if your server violates any one of them, the browser doesn't reject the request or throw an error — it just silently drops the cookie. [Waaseyaa](https://github.com/waaseyaa/framework) recently added a `host_bound` mode to its `SessionCookiePolicy` that enforces the full contract for both the session cookie and the CSRF cookie, and refuses to boot if the configuration can't satisfy it. What follows is the four-part contract, how `host_bound` enforces it for both cookies, and where it refuses to boot instead.

## The Four Constraints

A cookie name starting with `__Host-` is only valid if all of these hold at once:

- **No `Domain` attribute.** The cookie must be host-only — omitting `Domain` scopes it to the exact host, not `Domain=example.com` which would let subdomains see it too.
- **`Path=/`.** Any narrower path is rejected.
- **`Secure` is set.** The cookie only travels over HTTPS.
- **Secure context, implicitly.** The cookie has to originate from a secure context in the first place — `Secure` alone doesn't retroactively fix an insecure origin.

Get any of these wrong and the browser doesn't error — it drops the `Set-Cookie` header for that cookie entirely. Your session cookie silently never gets set, a user hits a login loop, and there's no log line pointing at the cause. That's the gap Waaseyaa's `host_bound` option closes: instead of trusting config to be correct, it validates the contract at construction time.

## One Policy, Two Cookies

Waaseyaa mints two cookies that need the same hardening:

- **The PHP session cookie.**
- **The CSRF double-submit cookie** (`XSRF-TOKEN` by default), read by [Inertia](https://inertiajs.com/)'s axios adapter and forwarded as the `X-XSRF-TOKEN` header on every mutation.

Before this change, `CsrfMiddleware` hard-coded the `XSRF-TOKEN` name. Now both cookies are governed by the same `session.cookie` config, resolved through `SessionCookiePolicy`:

```php
final class SessionCookiePolicy
{
    public const DEFAULT_CSRF_COOKIE_NAME = 'XSRF-TOKEN';
    public const HOST_BOUND_SESSION_COOKIE_NAME = '__Host-waaseyaa_session';
    public const HOST_BOUND_CSRF_COOKIE_NAME = '__Host-XSRF-TOKEN';

    private const array SECURE_COOKIE_DEFAULTS = [
        'httponly' => true,
        'secure' => 'auto',
        'samesite' => 'Lax',
        'use_strict_mode' => true,
        'path' => '/',
        'csrf_name' => self::DEFAULT_CSRF_COOKIE_NAME,
        'host_bound' => false,
    ];
}
```

Setting `session.cookie.host_bound => true` switches both cookies to the `__Host-` profile:

| Attribute | Default | Host-bound |
|---|---|---|
| `Secure` | Follows the `secure` setting (`'auto'`) | Forced on, regardless of `secure` |
| `Path` | Configurable | Forced to `/` |
| `Domain` | Configurable | Forced unset |
| Cookie name | `waaseyaa_session` / `XSRF-TOKEN` | `__Host-waaseyaa_session` / `__Host-XSRF-TOKEN` (or an explicit `__Host-`-prefixed override) |

`SessionMiddleware` applies the resolved policy to the PHP session cookie ini. `CsrfMiddleware` applies the same policy object to the CSRF cookie. Same source, so the two cookies can't drift out of sync.

## Rejected at Construction, Not Discovered in the Browser

The policy validates the whole contract when it's built, before a single request is handled:

```php
private function assertConfigurationCompatible(): void
{
    if (!$this->hostBound()) {
        // non-host-bound cookie name validation
        return;
    }

    $path = $this->path();
    if ($path !== '/') {
        throw new InvalidSessionCookiePolicyException(sprintf(
            'Host-bound session cookies require path "/", got "%s".',
            $path,
        ));
    }

    $domain = $this->options['domain'] ?? null;
    if (is_string($domain) && $domain !== '') {
        throw new InvalidSessionCookiePolicyException(sprintf(
            'Host-bound session cookies must omit Domain; got "%s".',
            $domain,
        ));
    }

    $secure = $this->options['secure'];
    if ($secure !== 'auto' && !filter_var($secure, FILTER_VALIDATE_BOOLEAN)) {
        throw new InvalidSessionCookiePolicyException(
            'Host-bound session cookies require secure=true (or auto); secure=false is incompatible.',
        );
    }

    $sessionName = $this->sessionName();
    if ($sessionName === null || !str_starts_with($sessionName, '__Host-')) {
        throw new InvalidSessionCookiePolicyException(sprintf(
            'Host-bound session cookie name must use the __Host- prefix; got "%s".',
            (string) $sessionName,
        ));
    }
    // same check repeated for the CSRF cookie name
}
```

If you set `host_bound => true` and also set an explicit `Domain`, or a non-root `Path`, or `secure => false`, the app refuses to start. That trade-off is deliberate: a config error that fails loudly in CI or on deploy is recoverable. A config error that fails silently in production means some users can't log in, and there's no exception anywhere to explain why.

The policy also checks **already-active** PHP sessions, not just fresh config. If something upstream (another bootstrap path, an inherited `php.ini`) already started a session before the policy runs, `assertCompatibleWithActiveSession()` compares the live `session_name()` and `session_get_cookie_params()` against the resolved policy and throws if they disagree — catching the case where host-bound mode is configured but a prestarted session is still running under the old, non-`__Host-` name.

## Malformed Config Is Rejected Too

Beyond the host-bound-specific checks, the policy rejects structurally unsafe values on construction regardless of mode — a `path` or `domain` containing a `;` (which would inject another `Set-Cookie` attribute) or control characters, and a non-boolean `host_bound` value:

```php
if (array_key_exists('host_bound', $options)) {
    $parsed = filter_var(
        $options['host_bound'],
        FILTER_VALIDATE_BOOLEAN,
        FILTER_NULL_ON_FAILURE,
    );
    if ($parsed === null) {
        throw new InvalidSessionCookiePolicyException(
            'session.cookie.host_bound must be a boolean (or a documented boolean string such as "true"/"false").',
        );
    }
    $options['host_bound'] = $parsed;
}
```

Documented legacy string forms (`"1"`, `"0"`, `"on"`, `"off"`) still parse correctly — this rejects garbage, not backward compatibility.

## What Consumers See

None of this changes how Inertia/Vue or vanilla `fetch` consumers read the CSRF cookie — that contract is unchanged:

```vue
<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({ file: null as File | null })

function submit() {
  form.post('/ingest/upload', { forceFormData: true })
  // Inertia's axios reads the cookie and forwards X-XSRF-TOKEN automatically.
}
</script>
```

Inertia's adapter looks for a cookie literally named `XSRF-TOKEN` unless you tell it otherwise. That's why the Admin SPA's cookie readers were unified into one shared decoder (`packages/admin/app/utils/csrfCookie.ts`) that reads the *configured* `csrfCookieName` from runtime config, rather than each consumer hard-coding the default name. When host-bound mode renames the cookie to `__Host-XSRF-TOKEN`, every packaged Admin HTML response — the SPA fallback and the prebuilt `.html` assets — has that name rewritten into it from the runtime policy, so the served bundle and the actual cookie name never disagree.

## Why This Matters Beyond Waaseyaa

The pattern generalizes past this one framework:

- If you support `__Host-`-prefixed cookies anywhere, **validate the full contract programmatically**, not just at code review. The failure mode is silent.
- When two cookies (session + CSRF) share a security posture, **govern them from one policy object**, not two copies of the same logic that can drift.
- Prefer **rejecting bad config at boot** over "best-effort" defaults that paper over a mistake. A crash on deploy is a bug report with a stack trace. A silently dropped cookie is a support ticket with no clues.

Baamaapii
