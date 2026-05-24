# Waaseyaa bimaaji-mcp-bridge shipped (M3)

Reference URL: https://github.com/waaseyaa/framework/pull/1562

## Bluesky

Shipped a per-request Laravel-to-MCP bridge with auth-resolved account context. AI agents calling MCP tools now act as the authenticated user, not a service account. 145 tests / 470 assertions green.

https://github.com/waaseyaa/framework/pull/1562

#buildinpublic

## LinkedIn

Shipped: per-request Laravel-to-MCP bridge with auth-resolved account context.

When an AI agent (Claude Code, Cursor, anything speaking MCP) calls a tool on a multi-tenant Laravel app, the obvious naive wiring is to expose tools as a service account. The agent gets to do anything the app can do. That is not the security boundary you want.

The fix is a per-request bridge. Every MCP tool invocation runs inside the auth context of the user who initiated the agent session. The bridge resolves the account from the request, not from a configured service identity. The tool sees exactly what the user would see. If the user cannot read a model, the agent cannot either.

This was M3 of the Waaseyaa AI agent ecosystem: 5 work packages, ServiceProvider bridge wiring, bimaaji_search_specs tool, per-request resolution, doctrine spec edits, mission close-out with full verification.

Result: 145 tests / 470 assertions green. The bridge ships as part of the framework Bimaaji surface and is what every other AI tool calls into.

This is one piece of a larger pattern. The same auth-resolved model is now the contract every new Waaseyaa AI tool follows. Adding a new tool means writing the tool itself; the bridge handles capability gating, request resolution, and the audit trail automatically. That separation is the part that pays off over time.

https://github.com/waaseyaa/framework/pull/1562

#laravel #mcp #ai #claudecode #buildinpublic

## Facebook

Shipped: per-request Laravel-to-MCP bridge with auth-resolved account context.

When an AI agent calls a tool on a multi-tenant Laravel app, you do not want the agent acting as a service account that can do anything. The per-request bridge resolves the account from the user's auth context, so the agent sees exactly what the user would see. If the user cannot read a model, the agent cannot either.

This was M3 of the Waaseyaa AI agent ecosystem. 5 work packages, 145 tests / 470 assertions green. Mission complete.

https://github.com/waaseyaa/framework/pull/1562

#buildinpublic
