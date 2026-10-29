---
categories:
    - php
date: 2026-10-29T00:00:00Z
devto_id: 4941269
draft: false
slug: separate-installation-from-production-activation
summary: Qualify database installation and production activation as separate gates so a successful setup cannot hide a blocked runtime.
tags:
    - php
    - deployment
    - testing
    - security
title: Separate installation from production activation
---

Ahnii!

A successful installer does not prove that an application is ready to serve production traffic. It proves that the installer completed its own bounded job.

This post covers a production qualification pattern from a versioned Waaseyaa candidate: test installation, activation evidence, and HTTP runtime as separate gates, then stop at the first failing boundary.

## Give the installer narrow authority

An installer may need powers that ordinary application boot must not have. It can create the configured database, apply migrations, synchronize entity schemas, and initialize configuration.

Keep that authority attached to the installation command. Help output, invalid options, unexpected arguments, and unrelated commands should not create storage as a side effect.

The qualified candidate tested these boundaries directly:

- A valid production install created the selected SQLite database.
- Repeating installation preserved an existing content witness and configuration activation rows.
- An invalid production secret failed before creating storage.
- Existing foreign schema drift caused a refusal without deleting the foreign row.
- Ordinary commands still refused an absent database instead of creating it.

This is more useful than one broad end-to-end success assertion. Each check tells you which command owns a mutation and which commands must remain read-only.

## Do not manufacture activation evidence during setup

Installation and activation answer different questions.

Installation asks whether the application can create and initialize its operational state. Field-access activation asks whether the exact installed framework, schema, scanner generation, and field classifications have been reviewed and are ready for production reads.

The installer intentionally did not create the field-access activation artifact. A separate preflight command inspected the live installation. Read-only execution reported its result without writing the artifact. Only an explicit artifact-writing option published the evidence later consumed by normal boot.

That separation prevents setup from approving itself. It also lets you prove several refusal cases:

- Missing evidence blocks activation.
- A malformed artifact is rejected.
- A different scanner generation is rejected.
- A framework or schema identity mismatch is stale.
- A changed checksum or readiness flag is invalid.
- Any unresolved blocker keeps the result not ready.

The important part is not the filename or command name. The important part is that reviewed evidence is produced explicitly and bound to the inputs it actually describes.

## Qualify each installation independently

Two installations can produce similar results without sharing the same identity.

In the recorded qualification, development and no-dev installations had different discovered fields, schema fingerprints, and preflight checksums. Each installation used its own vendor tree, database, schema, scan, and artifact. No artifact was copied from one environment to the other.

That matters because a passing result is not portable merely because the output looks familiar. Reuse requires source, dependency, schema, scanner, and execution equivalence. When those inputs differ, generate and review evidence again.

## Test the actual runtime after the CLI gates

Once installation and activation pass, exercise the same server path production will use.

The candidate qualification checked cold, warm, and restarted Apache with PHP-FPM. It confirmed production mode, disabled debugging, disabled development fallback, and a real application-owned response marker. A separate no-dev installation also proved that the runtime did not depend on PHPUnit.

The sequence was deliberate:

1. Install the application.
2. Run the read-only activation preflight.
3. Explicitly write the reviewed activation artifact.
4. Confirm ordinary CLI boot consumes it.
5. Start the production web stack.
6. Test cold, warm, and restarted requests.
7. Run negative controls and restore the exact environment.

Do not collapse those checks into one green label. A prerequisite, a generated artifact, and a runtime response are separate pieces of evidence.

## Preserve the first failing boundary

The versioned qualification first reached a homepage only after the activation artifact existed. Its next unknown-route request returned a generic 500 instead of the required 404. The record preserved that result and handed the failure to the issue that owned error handling and diagnostics.

That is the right stopping rule. Do not patch an unrelated subsystem inside a qualification run just to make the journey green. Record:

- The exact source and dependency identity
- The environment and server mode
- The command or request that failed
- The public response
- The private diagnostic evidence that is safe to retain
- The limits of what the evidence proves

A clean production qualification is not a story about everything working. It is a chain of bounded claims that stops honestly when the next claim cannot be made.

Baamaapii
