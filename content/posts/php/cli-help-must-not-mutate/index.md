---
categories:
    - php
date: 2026-10-24T00:00:00Z
devto: true
draft: false
slug: cli-help-must-not-mutate
summary: Defer application boot and filesystem authority until your CLI framework has validated that a mutating command will actually execute.
tags:
    - php
    - cli
    - testing
    - security
title: CLI help must not mutate your filesystem
---

Ahnii!

Running `install:init --help` should print help. It should not create a database.

That sounds obvious, but command selection often happens before input validation. If your console kernel sees a mutating command name and boots the application immediately, help and invalid options can trigger storage setup before the CLI framework decides not to execute the command.

A recent [Waaseyaa installer repair](https://github.com/waaseyaa/framework/commit/08fbc6199b39a7772303d183dfffe8da6f4ae60b) separates command selection from validated execution. This post covers the boundary and the real-entrypoint tests that prove it.

## Selection is not execution

Console kernels often inspect the first argument to choose a boot mode:

```php
if ($input->getFirstArgument() === 'install:init') {
    // Boot with installation authority.
}
```

The token identifies the requested command, but it does not prove the command will run.

Symfony Console still needs to handle cases such as:

- `install:init --help`;
- `install:init -h`;
- an unknown option;
- an unexpected argument;
- missing required input.

Help exits successfully without executing the handler. Invalid input exits with a usage error. Neither case should boot a mode that can create storage.

The original Waaseyaa path selected installation boot from the raw command token. That boot could prepare the configured database directory before Symfony processed help or rejected the input.

The visible command never ran, but its boot path had already mutated the filesystem.

## Put authority inside the execution callback

The repaired kernel builds a small console application containing the canonical `install:init` command, then replaces its execution callback:

```php
$application = new WaaseyaaConsoleApplication(
    version: new VersionResolver($this->projectRoot)->resolve(),
    logger: $this->logger,
);

$command = MigrateServiceProvider::installInitCommand();
$command->setCode(function () use ($input, $output): int {
    $this->initializingDatabase = true;
    try {
        $this->bootForSchemaSync();
    } finally {
        $this->initializingDatabase = false;
    }

    return new ConsoleApplicationFactory(
        kernel: $this,
        container: $this->buildHandlerContainer(),
        providers: $this->getProviders(),
        logger: $this->logger,
    )->create()->run($input, $output);
});

$application->addCommand($command);

return $application->run($input, $output);
```

Symfony parses the input, renders help, and validates arguments and options before entering the callback. Installation boot now happens only on the execution path.

The important part is not `setCode()` itself. The important part is where the authority begins.

| Phase | May create storage? |
| --- | --- |
| Read command name | No |
| Render help | No |
| Validate arguments and options | No |
| Enter the validated execution callback | Yes |
| Complete or fail execution | Authority restored in `finally` |

This makes the mutation boundary match the command framework's lifecycle.

## Share the command definition

Moving validation before boot can tempt you to build a second parser in the kernel. That creates drift between pre-boot validation and the command registered after boot.

Waaseyaa avoids that by exposing one command factory:

```php
public static function installInitCommand(): HandlerCommand
{
    return new HandlerCommand(
        name: 'install:init',
        description: 'Initialize a fresh installation: apply migrations, synchronize schema, and activate the initial configuration generation',
        handler: [InstallInitHandler::class, 'execute'],
    );
}
```

Both provider discovery and the pre-boot dispatch path use this definition. Arguments, options, description, and handler ownership stay in one place.

If the command changes later, help and validation change with it. The kernel does not need a parallel list of accepted input.

## Keep elevated boot authority scoped

Fresh installation is unusual because it may be the only allowed path that creates a missing production database. Ordinary production boot should still refuse that state.

The kernel represents this exception with a private installation mode. The callback enables it only around schema boot and restores it in `finally`.

That gives you two protections:

- help and invalid input never receive creation authority;
- a boot exception cannot leave the kernel in installation mode.

Temporary authority should always have an obvious start, an obvious end, and failure-safe cleanup.

## Test the real entrypoint and negative space

A unit test of the callback is not enough. The defect lived in the ordering between the executable, the kernel, Symfony Console, and application boot.

The integration test invokes the real CLI entrypoint with a database path under a directory that does not exist. It checks four non-executing inputs:

| Input | Expected exit |
| --- | --- |
| `--help` | 0 |
| `-h` | 0 |
| unknown option | 2 |
| unexpected argument | 2 |

After every invocation, the test proves the absence of:

- the configured SQLite file;
- its `-wal` sidecar;
- its `-shm` sidecar;
- the selected parent directory;
- the ordinary storage directory.

Those absence checks matter. An exit code can be correct even after the application created an empty directory or touched a database file.

Test both the response and the negative space left behind.

## Review pre-boot dispatch carefully

Any CLI with multiple boot modes can have this problem. Look for code that grants authority from raw argument tokens before the command framework validates input.

Pay extra attention to commands that can:

- create databases or directories;
- acquire migration locks;
- open network connections;
- load production secrets;
- modify caches or generated files.

For each one, prove that help, malformed options, unexpected arguments, and missing input perform no mutation.

The command name tells you what the user selected. Only the validated execution callback tells you what the program is allowed to do.

Baamaapii
