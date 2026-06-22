# JSON-LD can be an XSS hole if you build the script tag yourself

Reference URL: https://github.com/waaseyaa/framework/pull/1722

## Bluesky

JSON-LD XSS worth knowing: we encoded structured data without JSON_HEX_TAG, then wrapped it in a script tag. An entity label like </script><img onerror=x> broke out of the element and injected markup. Fix: JSON_HEX_TAG. https://github.com/waaseyaa/framework/pull/1722 #buildinpublic

## LinkedIn

Your SEO markup can be an XSS hole. Here is one we just closed.

We render JSON-LD structured data for search engines by encoding an entity to JSON and wrapping it in a script tag of type application/ld+json. Standard stuff.

The encoder used JSON_UNESCAPED_SLASHES but not JSON_HEX_TAG. That second flag is what escapes the characters that can close an HTML tag.

Untrusted data reaches this path on the live server-rendered page. The entity label goes straight into the JSON-LD name field. So a label containing </script><img src=x onerror=...> closed the script element early and injected live markup into the page. A stored XSS, delivered through your own SEO block.

The fix is one flag: add JSON_HEX_TAG so < and > are hex-escaped before the JSON ever touches the HTML.

The general lesson: the moment you hand-build a script tag around JSON, you are in HTML context, not JSON context. JSON encoding alone does not make data safe to drop between script tags. Escape for the context you are actually writing into, not the one you started from.

https://github.com/waaseyaa/framework/pull/1722

#buildinpublic #security #php #webdevelopment

## Facebook

A reminder that your SEO markup is attacker surface too. We render JSON-LD structured data by encoding an entity to JSON and wrapping it in a script tag. The encoder escaped slashes but not angle brackets, and untrusted entity data reaches that path on the live page. So an entity label containing </script><img src=x onerror=...> closed the script element early and injected live markup. A stored XSS delivered through our own SEO block.

The fix was one flag, JSON_HEX_TAG, so the characters that can close an HTML tag get hex-escaped before the JSON ever touches the page. The general lesson: once you wrap JSON in a script tag, you are writing into HTML, not JSON. Escape for the context you are actually in. https://github.com/waaseyaa/framework/pull/1722

#buildinpublic
