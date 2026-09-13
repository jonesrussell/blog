## Bluesky

Prototyped northway's feed reader in the browser first. A loopback-only Node proxy keeps the API key out of client-side JavaScript, checks its own bind host, and validates every request before it spends a call. https://jonesrussell.github.io/blog/feed-reader-prototype-loopback-proxy/

## LinkedIn

Before writing northway's feed reader UX into the production Go service, I prototyped it in the browser with a small Node.js proxy.

The proxy holds the API key so client-side JavaScript never sees it, refuses to bind anywhere but loopback, and validates every request on the way in: Host header checks, Content-Type enforcement, a same-origin check, and a body size cap. The client falls back to the last good feed on a failed refresh instead of blanking the screen.

Wrote up the details, with the actual code, on the blog: https://jonesrussell.github.io/blog/feed-reader-prototype-loopback-proxy/

#nodejs #softwareengineering #security #golang #buildinpublic

## Facebook

New post: how northway's feed reader prototype keeps its API key off the browser with a loopback-only Node proxy, before any of it reaches the production Pi build. https://jonesrussell.github.io/blog/feed-reader-prototype-loopback-proxy/

#buildinpublic #golang
