# Fixing a silent truncation bug in Waaseyaa's StreamHttpClient

## Bluesky

Found a nasty bug in our PHP HTTP client. Hitting the byte ceiling on a response returned a truncated body as HTTP 200 instead of failing. Fixed it to fail closed and check the actual body length.

https://jonesrussell.github.io/blog/streamhttpclient-truncated-body-fail-closed/

## LinkedIn

Wrote up a bug I fixed in Waaseyaa's HTTP client this week.

The client caps how many bytes of a response body it reads, so a hostile or runaway endpoint cannot exhaust memory. The bug was that hitting that cap did not fail the request. It silently returned a truncated prefix as a successful 200 response. The caller had no way to know the body was incomplete unless it happened to check the length itself.

The fix reads the body in chunks, checks the actual length against a declared Content-Length, times out mid body instead of hanging, and rejects any body that would exceed the ceiling instead of guessing. HEAD requests and 1xx, 204, and 304 responses are treated as having no body at all, since they carry metadata only.

The lesson generalizes past HTTP clients. Bounding a read for memory safety and detecting truncation are two different problems, and it is easy to only solve the first one. If hitting your limit looks identical to a legitimate response that happens to be exactly that size, you are not bounding the read — you are lying about it.

https://jonesrussell.github.io/blog/streamhttpclient-truncated-body-fail-closed/

#php #softwareengineering #reliability #backend

## Facebook

Fixed a bug this week where our PHP HTTP client would silently turn a truncated response body into a successful 200 response instead of failing. Wrote up the fix and the more general lesson about bounding reads without lying about what you actually read.

https://jonesrussell.github.io/blog/streamhttpclient-truncated-body-fail-closed/

#php #buildinpublic
