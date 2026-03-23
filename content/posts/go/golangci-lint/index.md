---
categories:
    - go
date: 2024-12-19T00:00:00Z
devto: true
devto_id: 3386978
draft: false
slug: golangci-lint
summary: How to set up golangci-lint with a practical configuration that catches real bugs without drowning you in noise.
tags:
    - golang
    - linting
    - code-quality
title: 'Golangci-lint: Your Go Guardian Against Code Smells'
---

Ahnii!

This post covers what [golangci-lint](https://golangci-lint.run/) does, how to configure it for a real project, and the linters worth enabling beyond the defaults.

## Why Not Just `go vet`?

`go vet` catches a narrow set of issues — wrong printf format strings, unreachable code, bad struct tags. It is a baseline, not a linter suite. golangci-lint runs dozens of linters in a single pass and reports unified output. It is fast because it reuses the Go build cache and runs linters concurrently.

## Install It

```bash
# Homebrew
brew install golangci-lint

# Go install (pinned version)
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

Verify with `golangci-lint --version`. The v2 config format (`version: "2"`) is current.

## A Starter Configuration

Create `.golangci.yml` at your project root. Start with `default: standard` and add linters that catch real problems:

```yaml
version: "2"
linters:
  default: standard
  enable:
    - bodyclose       # unclosed HTTP response bodies
    - contextcheck    # context.Context misuse
    - errname         # error type naming (ErrFoo)
    - errorlint       # unwrapped errors break errors.Is/As
    - exhaustive      # missing switch/map cases
    - gocognit        # cognitive complexity
    - gosec           # security issues
    - nestif          # deeply nested ifs
    - noctx           # HTTP requests without context
    - prealloc        # slice preallocation hints
    - unconvert       # unnecessary type conversions
    - unparam         # unused function parameters
  settings:
    gocognit:
      min-complexity: 20
    errcheck:
      check-type-assertions: true
  exclusions:
    presets:
      - comments
      - common-false-positives
    rules:
      - linters: [funlen, goconst, gosec, noctx]
        path: _test\.go
```

This gives you meaningful feedback on day one without a wall of noise.

## Linters Worth Understanding

**`gosec`** flags security issues — SQL injection, weak crypto, hardcoded credentials. In a real config you will exclude false positives:

```yaml
    gosec:
      excludes:
        - G404  # math/rand is fine for non-crypto use
        - G101  # config keys flagged as credentials
```

**`depguard`** blocks imports you do not want in your codebase. Use it to enforce architectural boundaries:

```yaml
    depguard:
      rules:
        deprecated:
          deny:
            - pkg: io/ioutil
              desc: "deprecated since Go 1.16; use io and os"
        weak_crypto:
          deny:
            - pkg: crypto/md5
              desc: "use crypto/sha256 or crypto/sha512"
```

**`forbidigo`** bans specific function calls. Useful for enforcing structured logging over `fmt.Print`:

```yaml
    forbidigo:
      forbid:
        - pattern: '^fmt\.Print'
          msg: "Use structured logging instead of fmt.Print"
        - pattern: 'http\.DefaultClient'
          msg: "Create a client with explicit timeouts"
```

## Run It

```bash
# Lint the whole project
golangci-lint run

# Lint with auto-fix where possible
golangci-lint run --fix

# Lint only changed files (fast CI feedback)
golangci-lint run --new-from-rev=HEAD~1
```

## Add It to Your Taskfile

If you use [Task](https://taskfile.dev/), add a lint task:

```yaml
  lint:
    desc: Run golangci-lint
    cmds:
      - golangci-lint run ./...
```

Then `task lint` runs your full suite. In CI, run the same command — what you lint locally is what CI enforces.

## Start Small

You do not need 70 linters on day one. Start with `default: standard` plus the 12 listed above. As you fix the initial findings, enable more. The config file is version-controlled, so your whole team stays in sync.

Baamaapii
