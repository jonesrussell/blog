Queue-Issue: #583
Reference URL: https://github.com/waaseyaa/framework/commit/f63696a

## Bluesky

Behind Caddy, request->isSecure() returned false and your XSRF-TOKEN cookie had no Secure flag. HttpKernel now registers trusted proxies from config before any code reads the request. https://github.com/waaseyaa/framework/commit/f63696a #buildinpublic

## LinkedIn

Deploy Waaseyaa behind Caddy, and request->isSecure() lies to you.

The framework's documented production shape is Caddy terminating TLS, forwarding plain HTTP to PHP-FPM. Behind that proxy, Symfony's Request object has no reason to trust X-Forwarded-Proto unless you explicitly call Request::setTrustedProxies(). Before commit f63696a, Waaseyaa never made that call.

The result: request->isSecure() returned false on every HTTPS request. The XSRF-TOKEN cookie went out without its Secure attribute. Any browser with strict cookie policies would drop it on subsequent same-site HTTPS requests, breaking CSRF protection silently.

The fix is in packages/foundation/src/Kernel/HttpKernel.php.

HttpKernel now reads a trusted_proxies config key and the TRUSTED_PROXIES environment variable (comma-separated CIDRs, IPs, or the REMOTE_ADDR sentinel). It calls Request::setTrustedProxies() with the standard X-Forwarded-* header set before any application code touches the request. If the list is empty, behavior is unchanged: no proxies trusted, identical to pre-fix semantics.

Two configuration sources are supported: set trusted proxies in config/waaseyaa.php for a fixed deployment, or override via environment variable for Docker or CI.

Files changed:
packages/foundation/src/Kernel/HttpKernel.php (+78 lines)
packages/foundation/tests/Unit/Kernel/HttpKernelTrustedProxiesTest.php (+221 lines)
config/waaseyaa.php (+18 lines)

If you run PHP behind any TLS-terminating reverse proxy and your framework does not call setTrustedProxies(), this applies to you. Check that your XSRF-TOKEN responses carry the Secure attribute on HTTPS.

https://github.com/waaseyaa/framework/commit/f63696a

#PHP #Security #WebFramework #buildinpublic #Waaseyaa

## Facebook

Behind Caddy, Waaseyaa was sending XSRF-TOKEN cookies without the Secure flag on HTTPS responses. The root cause: request->isSecure() returned false because Request::setTrustedProxies() was never called.

HttpKernel now wires trusted proxy configuration from config/waaseyaa.php and the TRUSTED_PROXIES environment variable before anything else runs. Empty config means no proxies trusted, same behavior as before.

If your PHP app runs behind a TLS-terminating reverse proxy and you have not verified your XSRF or session cookies carry the Secure flag on HTTPS, worth checking: https://github.com/waaseyaa/framework/commit/f63696a #buildinpublic
