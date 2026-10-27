## Bluesky

A stale digest pin is a fixture migration, not a reason to weaken verification. Update the reviewed selection, render the real reference config, and keep the wrong-digest refusal test. https://jonesrussell.github.io/blog/repair-stale-digest-pins/ #PHP #Testing

## LinkedIn

Strict artifact digests stop old configuration from silently accepting changed generated output.

When a reviewed recipe changes, a reference fixture can legitimately become stale. The right repair is to migrate the pinned selection, test the actual reference manifest against the installed recipe, and keep the negative test that refuses a substituted digest.

https://jonesrussell.github.io/blog/repair-stale-digest-pins/

#PHP #SoftwareTesting #CodeGeneration #SoftwareArchitecture

## Facebook

When a generated-artifact digest changes, do not make verification optional. Migrate the reviewed fixture, test the real reference configuration, and keep a negative test that rejects the wrong identity. https://jonesrussell.github.io/blog/repair-stale-digest-pins/ #PHP #Testing
