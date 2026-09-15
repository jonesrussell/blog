## Bluesky

Built a stdio MCP server for Waaseyaa in PHP. The hard part wasn't the RPC methods, it was the wire discipline: one writer to stdout, a bounded read with no natural limit, and a handshake that tells old and new protocol clients apart. https://jonesrussell.github.io/blog/stdio-mcp-server-php/

## LinkedIn

Wrote up how Waaseyaa's stdio MCP server stays correct at the wire level, not just the RPC method level.

The MCP methods (initialize, tools/list, tools/call) were the easy part. The real work was a short list of problems every stdio JSON-RPC server inherits regardless of what it's actually serving:

Only one method in the class is allowed to write to stdout, because a single stray warning on that stream corrupts every frame after it for a client reading line by line.

Stdin has no natural length limit, so a read has to be bounded explicitly, with its own error path for a line that hits the ceiling without a newline.

PHP's json_decode erases the JSON object/array distinction, which is exactly the distinction a params field needs preserved.

And the protocol has two incompatible eras: handshake and handshake-less. The server has to fail a specific way to signal which one it speaks.

None of this is MCP-specific. It's what you inherit any time you put a line-delimited RPC protocol on a raw byte stream.

Full walkthrough with the real code on the blog: https://jonesrussell.github.io/blog/stdio-mcp-server-php/

#php #mcp #softwareengineering #protocols #buildinpublic

## Facebook

New post: the wire-level rules that make a stdio MCP server actually correct in PHP, not just the RPC methods on top. One writer to stdout, a bounded read, and a handshake that tells old clients from new ones. https://jonesrussell.github.io/blog/stdio-mcp-server-php/

#buildinpublic #php
