# Waaseyaa bimaaji:install shipped (M5)

Reference URL: https://github.com/waaseyaa/framework/pull/1565

## Bluesky

Shipped: bimaaji:install CLI. One command installs Waaseyaa agent skills into 7 launch clients (Claude Code, Cursor, and more). 190 tests / 497 assertions. Dry-run, sandbox, hand-edit preservation included.

https://github.com/waaseyaa/framework/pull/1565

#buildinpublic

## LinkedIn

Shipped: bimaaji:install CLI for the Waaseyaa framework.

Installing AI agent skills into a Waaseyaa-based app used to be a per-client config exercise. You wrote one config for Claude Code, a different one for Cursor, then again for whichever other agent you wanted to support. It was both error-prone and the kind of thing you did once and forgot.

bimaaji:install collapses that into one command. The CLI reads a SkillSet manifest, then writes the right config to each of 7 launch clients (Claude Code, Cursor, and five others) using each client's own convention. Three things make it safe to run on a real codebase:

- Dry-run mode shows the diff before writing
- Sandbox mode writes to a scratch directory for verification
- Hand-edits to existing config blocks are preserved across re-runs

There is a documented exit-code matrix for every failure mode (unknown client, parse error, permission denied) so you can wire it into CI without surprises.

This was M5 of the Waaseyaa AI agent ecosystem. 5 work packages, 190 tests / 497 assertions green across the install surface.

The shape that mattered most was the SkillSetParser. Skills are a manifest, not a per-client config. The parser is the one place that knows what a skill set is; every client adapter is a thin output formatter. That means adding the next launch client is a small, isolated change instead of a sweep across the codebase. The first version takes the most thinking; every one after that is mostly mechanical.

https://github.com/waaseyaa/framework/pull/1565

#cli #ai #devtools #waaseyaa #buildinpublic

## Facebook

Shipped: bimaaji:install CLI for the Waaseyaa framework.

Installing AI agent skills used to mean writing a different config per agent client (Claude Code, Cursor, and a few more). The new bimaaji:install reads a SkillSet manifest and writes the right config to each of 7 launch clients in one command. Dry-run, sandbox, and hand-edit preservation are all built in.

This was M5 of the Waaseyaa AI agent ecosystem. 190 tests / 497 assertions green.

https://github.com/waaseyaa/framework/pull/1565

#buildinpublic
