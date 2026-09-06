---
categories:
    - php
    - waaseyaa
date: 2026-09-06
devto: true
draft: false
slug: streamhttpclient-truncated-body-fail-closed
summary: How Waaseyaa's StreamHttpClient silently turned a truncated, over-limit response body into an HTTP 200, and the fail-closed fix that rejects incomplete bodies instead of guessing.
tags:
    - php
    - waaseyaa
    - http
    - reliability
title: "Fixing a silent truncation bug in Waaseyaa's StreamHttpClient"
---

Ahnii!

[Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/http-client` package wraps PHP streams behind a small `HttpClientInterface`, with `StreamHttpClient` as the production implementation. It caps how many bytes of a response body it will read, so a runaway or hostile endpoint can't exhaust worker memory. That cap had a bug: hitting it didn't fail the request. It silently handed back a truncated body as a successful `HttpResponse`. What follows walks through the bug, the fix, and the broader lesson about bounding a read without lying about what you actually read.

## The Bug: A Byte Ceiling That Didn't Fail

The original `fetch()` method read the body with a single call:

```php
// m4: cap the body so a runaway/hostile endpoint can't OOM the worker.
$responseBody = @stream_get_contents($handle, $this->maxResponseBytes);

if ($responseBody === false) {
    throw $this->transportFailure($method, $url);
}

return $responseBody;
```

`stream_get_contents()` with a length argument stops reading once it hits that many bytes and returns whatever it has. It doesn't return `false` just because the stream had more data waiting — an endpoint returning a body larger than `maxResponseBytes` produced a **200 OK** with a truncated prefix instead of an error. The caller had no way to know the body was incomplete unless it happened to check the length itself.

## The Fix: Fail Closed, Not Silent

The fix, tracked as [FW-HTTP-STREAM-TRUNCATION-01](https://github.com/waaseyaa/framework/blob/main/docs/change-records/FW-HTTP-STREAM-TRUNCATION-01.md), replaces the single `stream_get_contents()` call with a loop that reads in chunks and checks completeness against what the response actually declared:

- **Over-limit bodies throw.** If the body would exceed `maxResponseBytes`, the client throws a typed `HttpRequestException` instead of returning a partial string.
- **`Content-Length` mismatches throw.** If the connection closes (or times out) before the declared length is reached, that's a failure, not a short success.
- **A declared length above the ceiling is rejected before reading starts**, so memory stays bounded even for a body the client will never accept.
- **Exact-limit bodies still succeed.** A body whose size equals `maxResponseBytes` exactly, including chunked and connection-close bodies with no `Content-Length` at all, is a valid, complete response.

```php
private function readCompleteBody($handle, string $method, string $url): string
{
    $headers = http_get_last_response_headers() ?? [];
    $status = $this->parseStatusCode($headers);
    // HEAD and these status codes carry metadata, never a response body.
    if (strtoupper($method) === 'HEAD' || ($status >= 100 && $status < 200) || $status === 204 || $status === 304) {
        return '';
    }
    $contentLength = $this->headerContentLength($headers);
    if ($contentLength !== null && $contentLength > $this->maxResponseBytes) {
        throw $this->boundedBodyFailure($method, $url, 'HTTP response body exceeded the configured maximum');
    }

    $body = '';
    while (!feof($handle)) {
        $remaining = $this->maxResponseBytes - strlen($body);
        if ($contentLength !== null && strlen($body) === $contentLength) {
            break;
        }
        $readBytes = $contentLength !== null ? $contentLength - strlen($body) : $remaining + 1;
        $chunk = @fread($handle, max(1, min(8192, $readBytes)));
        $meta = stream_get_meta_data($handle);
        if ($meta['timed_out'] === true) {
            throw $this->boundedBodyFailure($method, $url, 'HTTP response body was incomplete');
        }
        if ($chunk === false) {
            throw $this->transportFailure($method, $url);
        }
        if ($chunk === '') {
            break;
        }
        $body .= $chunk;
        if (strlen($body) > $this->maxResponseBytes) {
            throw $this->boundedBodyFailure($method, $url, 'HTTP response body exceeded the configured maximum');
        }
    }

    if ($contentLength !== null && strlen($body) !== $contentLength) {
        throw $this->boundedBodyFailure($method, $url, 'HTTP response body was incomplete');
    }

    return $body;
}
```

Reading one extra byte beyond `maxResponseBytes` when there's no declared `Content-Length` is what turns "we stopped because we're at the limit" into "we detected the body actually exceeds the limit." Without that extra byte, an exact-limit body and an over-limit body look identical.

A `stream_set_timeout()` call was also added before the read loop. A connection that stalls mid-body now times out and fails closed instead of hanging or silently truncating.

## Where the Framing Boundary Actually Sits

Part of getting this right is knowing which responses have no body at all, regardless of what their headers claim:

| Response | Body |
|---|---|
| `HEAD` request | none |
| `1xx` status | none |
| `204 No Content` | none |
| `304 Not Modified` | none |
| Declared `Content-Length` | stops exactly at that length, doesn't wait for connection close |
| No `Content-Length` (connection-close framing) | EOF defines completion |

The [change record](https://github.com/waaseyaa/framework/blob/main/docs/change-records/FW-HTTP-STREAM-TRUNCATION-01.md) is honest about the limits of this fix, too. PHP's HTTP stream wrapper dechunks `Transfer-Encoding: chunked` responses and strips the header before the client ever sees the stream, so the byte ceiling still applies to the decoded body. But `StreamHttpClient` can't independently verify a missing chunk terminator — that's a problem for PHP's stream layer, not this client. Scoping the fix to what the client can actually observe, and documenting what it can't, beats pretending it covers every framing edge case.

## Verifying It

`packages/http-client/tests/Unit/StreamHttpClientTransportTest.php` covers the cases that matter:

- Bodies below, at, and above the limit
- Chunked transfer
- Absent `Content-Length`
- Mismatched `Content-Length`
- A mid-body timeout
- An over-limit `5xx`
- A complete `404`

The suite also gained a small raw HTTP test server (`tests/Support/RawHttpServer.php`), so these cases could be driven against real socket behavior instead of mocked streams.

## The General Lesson

Bounding a read and detecting truncation are two different problems, and it's easy to solve only the first one. `stream_get_contents($handle, $limit)` does exactly what it says: it reads at most `$limit` bytes and returns them. It was never going to tell you whether that's *all* the bytes there were. Any time you cap a read for memory safety, whether that's an HTTP body, a file, or a queue message, ask what happens at the boundary: does hitting the cap look identical to a legitimate response that happens to be exactly that size? If your code can't tell those two cases apart, it's not bounding the read — it's lying about it when the answer would be inconvenient.

Baamaapii
