---
title: "Repair stale digest pins without weakening verification"
date: 2026-10-27
categories: [php]
tags: [php, testing, integrity, code-generation]
summary: "Treat a stale generated-artifact digest as a fixture migration, then prove the real reference configuration still renders."
slug: "repair-stale-digest-pins"
draft: false
---

Ahnii!

A strict digest check is supposed to stop old configuration from silently selecting changed generated output. When a reviewed generator changes, that protection can also make a reference fixture fail until its pinned identity is migrated.

This post shows how to repair that failure without weakening the integrity check, using a [Waaseyaa](https://github.com/waaseyaa/framework) reference consumer as the example.

## Understand what the digest protects

The reference application selects a generated recipe in YAML:

```yaml
recipes:
  - id: published_content
    version: 1
    capability: published_content
    artifact_digest: cf8f1932dea7f7dc08ccf2cefbf42465d5c2838b1d0e1fbd3cf62a63da580f11
```

The digest identifies the reviewed recipe artifact, not just the recipe name and version. If the recipe's generated files or contract change, an older selection should not claim that it still describes the installed output.

That refusal is useful. It turns a silent compatibility mismatch into an explicit migration decision.

## Classify the failure before changing code

The hosted reference consumer failed because its checked-in answers still pinned the previous recipe digest. A fresh installed consumer reproduced the same mismatch through `project:init --dry-run`.

There are two very different possible causes:

| Cause | Correct response |
|---|---|
| Installed recipe changed without an approved contract update | Stop and repair the producer or release process |
| Reviewed recipe changed but its reference fixture kept the old digest | Migrate the fixture and prove it against the installed recipe |

Do not make digest comparison optional just because the failure appeared in a test fixture. That would also allow genuinely stale applications to accept changed generated output.

In this case, the reviewed recipe already owned the new digest. The missing change was in the reference consumer's selection.

## Update the selection, not the verifier

The repair changed one value in the reference answers file: the previous digest was replaced with the digest of the reviewed installed recipe.

The validation rules stayed strict. Runtime boot, installation authority, persistence behavior, and normal refusal controls did not need to change.

This is an important boundary for code generation:

- the producer defines the artifact identity;
- the consumer pins the identity it reviewed;
- a changed identity requires an explicit consumer migration;
- the verifier continues refusing mismatches.

If you instead loosen the verifier, you erase the evidence that the consumer has reviewed the new generated contract.

## Test the real reference fixture

Updating a hash by hand can make the immediate error disappear without proving that the complete reference configuration works. Add a contract test that loads the actual fixture and sends it through the installed recipe:

```php
#[Test]
public function theReferenceSelectionRendersWithTheInstalledPublishedContentRecipe(): void
{
    $path = dirname(__DIR__) . '/ReferenceConsumer/site.answers.yaml';
    $manifest = new SiteManifestParser()
        ->parse((string) file_get_contents($path), $path);

    self::assertNotEmpty(
        new PublishedContentRecipe()->render($manifest),
    );
}
```

This test checks the real answers file rather than a smaller duplicate fixture. It exercises three things together:

- the reference YAML parses as a site manifest;
- its pinned recipe identity matches the installed recipe;
- the recipe can render output for that manifest.

The test was captured failing with the stale digest before the fixture was updated. That proves the regression test detects the original mismatch.

## Keep the negative test

A successful real-fixture test is only half of the contract. Keep a separate test that substitutes the wrong digest and expects refusal.

The two tests answer different questions:

| Test | Evidence |
|---|---|
| Actual reference selection renders | The maintained fixture matches the installed reviewed recipe |
| Substituted digest is refused | Integrity checking still rejects an unreviewed identity |

Without the first test, fixture drift can reach hosted qualification. Without the second, a permissive implementation could make every fixture pass.

## Requalify the new identity

Once the fixture and regression test change, you have a new candidate. Run the focused contract tests, the broader governed preflight, and the hosted consumers again against the exact new commit.

Do not reuse the old green results. They describe the old candidate. Do not repair a failed installed consumer in place either. A fresh consumer gives you evidence about the new fixture without mixing it with state from the failed attempt.

The final checklist is short:

1. Reproduce the digest mismatch from a clean consumer.
2. Confirm whether the producer or the pinned fixture is stale.
3. Update only the reviewed consumer selection when it is a fixture migration.
4. Add a test that renders the actual reference manifest.
5. Retain a negative test for a substituted digest.
6. Requalify the new commit through fresh consumers.

Strict digest checks create migration work on purpose. Preserve that boundary, migrate the fixture explicitly, and test both acceptance and refusal.

Baamaapii
