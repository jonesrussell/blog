# CLI help must not mutate your filesystem

## Bluesky

Command selection is not command execution. If install:init --help creates a database, your boot authority starts too early. Validate first, then boot inside the execution callback. https://jonesrussell.github.io/blog/cli-help-must-not-mutate/ #PHP #CLI

## LinkedIn

Running install:init --help should print help. It should not create a database.

A console kernel can see the command name and enter a mutating boot mode before the CLI framework handles help or rejects invalid input. The fix is to reuse the canonical command definition and grant installation authority only inside its validated execution callback.

I wrote up the boundary and the real-entrypoint tests that prove help, invalid options, and unexpected arguments leave no database, sidecars, or directories behind. https://jonesrussell.github.io/blog/cli-help-must-not-mutate/

#PHP #CLI #SoftwareTesting #Security

## Facebook

Command selection is not command execution.

If your kernel grants installation authority as soon as it sees install:init, then --help or an invalid option can create storage before the CLI rejects the input. Reuse the real command definition, validate first, and boot only inside the execution callback. https://jonesrussell.github.io/blog/cli-help-must-not-mutate/

#PHP #CLI
