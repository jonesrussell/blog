---
categories:
    - php
    - waaseyaa
date: 2026-09-15T00:00:00Z
devto: true
devto_id: 4669033
draft: false
slug: stdio-mcp-server-php
summary: The wire-level rules that make a stdio MCP server correct in PHP - one writer to stdout, a bounded read with no natural limit, and a handshake that tells old clients from new ones.
tags:
    - php
    - waaseyaa
    - mcp
    - ai
title: Building a conformant stdio MCP server in PHP
---

Ahnii!

[MCP](https://modelcontextprotocol.io/) lets a coding agent call tools over a small [JSON-RPC 2.0](https://www.jsonrpc.org/specification) protocol. The simplest transport for it is stdio: the agent spawns your process, writes requests to its stdin, and reads responses from its stdout. [Waaseyaa](https://github.com/waaseyaa/framework)'s `packages/cli` package ships exactly that, as a `mcp:serve` command backing a `StdioMcpServer` class. Getting stdio right turned out to hinge on a handful of rules that have nothing to do with MCP specifically and everything to do with sharing a byte stream with a client that trusts every byte on it.

## Only One Thing May Write to Stdout

A stdio JSON-RPC server's entire contract is: every line on stdout is a complete JSON-RPC frame, and nothing else is ever written there. Break that contract once and every frame after it is garbage - there's no delimiter to resync on. A stray `echo`, a PHP warning printed to stdout, or a library that logs a banner is all it takes.

`StdioMcpServer` treats this as a structural rule, not a habit: exactly one private method ever touches the output stream.

```php
private function writeFrame(array $frame): void
{
    $encoded = json_encode($frame, \JSON_THROW_ON_ERROR | \JSON_UNESCAPED_SLASHES);
    fwrite($this->out, $encoded . "\n");
    fflush($this->out);
}
```

Everything else - parse errors, unhandled exceptions, operator notes - goes through a separate `$diagnostic` closure the caller wires to stderr instead. Even a crash follows that rule: a `\Throwable` that escapes a tool dispatch gets a fixed, sanitized message on stderr and a generic **`-32603 Internal error`** frame on stdout, never the exception's own message, which could contain a credential or an absolute machine path.

## Bounding a Read That Has No Natural Limit

Stdin doesn't tell you how long a line is before you've read it. PHP's `fgets()` will happily keep growing a buffer until it finds a newline, which means one misbehaving or hostile caller can exhaust the process before your protocol layer gets a chance to reject it with a proper error.

The fix is to give `fgets()` a hard ceiling - **1 MiB** (1,048,576 bytes) - and treat "the ceiling was hit with no newline" as its own case:

```php
public const int MAX_FRAME_BYTES = 1_048_576;

public function run(): int
{
    while (($line = fgets($this->in, self::MAX_FRAME_BYTES + 2)) !== false) {
        if (!$this->isCompleteBoundedFrame($line)) {
            $this->discardRemainderOfOversizedFrame($line);
            $this->writeError(null, StdioJsonRpcErrorCode::INVALID_REQUEST,
                \sprintf('Invalid Request: frame exceeds %d bytes.', self::MAX_FRAME_BYTES));
            continue;
        }
        // ... decode and route the line
    }
    return 0;
}
```

The `+2` matters: it's the room for a maximum-size payload plus its own terminating newline, so a legitimate frame that exactly fills the limit isn't mistaken for an oversized one. When a frame *is* oversized, the server still has to drain the rest of that line off the stream before it can read the next one - otherwise the leftover bytes get parsed as the start of the following request.

## The JSON Object/Array Ambiguity

PHP's `json_decode($json, true)` erases a distinction JSON-RPC actually cares about: both `{}` and `[]` decode to the same empty PHP array, and a non-empty JSON array decodes to a PHP list that `is_array()` can't tell apart from an object. A `params` field is supposed to be an object; a naive `is_array($params)` check would silently accept `"params": [1, 2, 3]` and hand a handler a value it can't read `$params['name']` off of - producing a confusing downstream error for what's really a malformed frame.

```php
private static function isDecodedJsonObject(mixed $value): bool
{
    return \is_array($value) && ($value === [] || !array_is_list($value));
}
```

A non-empty list is unambiguously a JSON array and gets rejected. The empty array is genuinely ambiguous - it's what both `{}` and `[]` decode to - and gets accepted, because every handler in the server treats an empty params object and an absent one identically anyway.

The request ID gets the same strict treatment. JSON-RPC allows a string, a number, or null for `id`, but MCP narrows that to "string or integer, never null." `StdioMcpServer` takes the narrower rule and rejects anything else - including a fractional number - with a `null`-id error response rather than echoing the bad value back, since an object or array `id` echoed into a response frame would itself be malformed.

## Telling Old Clients From New Ones

MCP's protocol revisions split into two eras that don't mix.

| | Handshake era (through `2025-11-25`) | Modern era (from `2026-07-28`) |
|---|---|---|
| **Version negotiation** | Client sends `initialize`; server responds with the version it's willing to speak | Every request carries its own protocol version |
| **Startup sequence** | Client must send `notifications/initialized` before anything else | No handshake - any method can be called first |
| **Discovery** | Not part of the protocol | Server must implement `server/discover` |

`StdioMcpServer` only implements the handshake lifecycle, so it only ever negotiates a handshake-era revision:

```php
final class StdioMcpProtocol
{
    public const string LATEST_HANDSHAKE_REVISION = '2025-11-25';

    public const array SUPPORTED = [
        self::LATEST_HANDSHAKE_REVISION,
        '2025-06-18',
    ];

    public static function negotiate(string $requested): string
    {
        return \in_array($requested, self::SUPPORTED, true)
            ? $requested
            : self::LATEST_HANDSHAKE_REVISION;
    }
}
```

The interesting part isn't the negotiation - it's what happens when a *modern*-era client probes this server first. The spec's own recommendation is that a dual-era client should call `server/discover` before anything else, and fall back to the handshake if it gets an error that isn't specifically one of the modern protocol's own recognized codes.

`StdioMcpServer` answers `server/discover`, along with every other method it doesn't know, with a plain **`-32601 Method not found`**. That's deliberate. It's the exact signal a dual-era client is watching for to know it should fall back to `initialize`. Answering with a recognized modern-era error, or answering `server/discover` at all, would make this server look modern and break that fallback.

## Resolving the Interpreter Without Trusting PATH

The last piece is mundane but easy to get wrong: how does a launcher know what command to run to start the server? The obvious answer is `"command": "php"`. That depends on `php` being on the launching process's `PATH`, which isn't guaranteed on every platform or every editor's spawn environment.

`StdioServerExecutableResolver` sidesteps `PATH` entirely. It resolves the interpreter the same way the framework's dev server does: through `PHP_BINARY`, an absolute path PHP resolves for itself, never a bare name searched on `PATH`.

```php
public static function resolve(
    string $projectRoot,
    ?string $phpBinary = null,
    string $profile = self::DEFAULT_PROFILE,
): array {
    $php = $phpBinary ?? \PHP_BINARY;
    // ...
    return [
        'command' => $php,
        'args' => ['-d', 'display_errors=stderr', $normalizedRoot . '/vendor/bin/waaseyaa', 'mcp:serve', '--profile=' . $profile],
    ];
}
```

The `-d display_errors=stderr` flag does real work too. It's applied before PHP even loads the target script, so a bootstrap or autoload warning can't land on stdout and corrupt the JSON-RPC stream before the server has a chance to enforce its own one-writer rule.

## The General Lesson

None of this is MCP-specific. Any time you put a JSON-RPC (or line-delimited-anything) protocol on top of a raw byte stream, you inherit a short list of problems that have nothing to do with your actual RPC methods:

- Who is allowed to write to the stream
- What happens when a read has no natural length limit
- Whether your decoder throws away a distinction your protocol needs
- How a client on a newer version of your protocol recognizes that you're older

Skip any one of those and the bug doesn't show up as a clean error. It shows up as a corrupted frame, an exhausted process, or a client that can't tell what it's talking to.

Baamaapii
