# Enforcing package layering in the Waaseyaa framework

Reference URL: https://github.com/waaseyaa/framework/pull/1814

## Bluesky

The Waaseyaa framework now enforces package layering. A layer gate flags any undeclared cross-package dependency. After four cleanup batches the grandfathered-violations baseline is empty, so every dependency is declared on purpose.

https://github.com/waaseyaa/framework/pull/1814

#buildinpublic

## LinkedIn

Most dependency messes are not decisions. They pile up one undeclared import at a time until nobody can say what depends on what.

This week I closed that door in the Waaseyaa framework.

Each package sits in a layer. A new layer gate, the PL007 check, flags any use-edge to another package that is not declared in that package's manifest, including same-layer and lower-layer edges that are easy to miss.

Turning that on against an existing codebase surfaces a pile of violations you cannot fix all at once. So the gate reads a baseline file: the known, grandfathered violations it tolerates while you clean up. The rule is simple. The baseline can only shrink.

Over four batches I declared every undeclared dependency across the framework's packages, from audit, auth, and config up through routing, workflows, and the AI packages. The baseline is now empty.

That means from here on, every cross-package dependency is explicit and intentional. A new undeclared edge fails the build instead of quietly becoming load-bearing.

https://github.com/waaseyaa/framework/pull/1814

#php #opensource #buildinpublic #softwarearchitecture #cleancode

## Facebook

Most dependency messes are not decisions. They pile up one undeclared import at a time until nobody knows what depends on what.

This week I added a layer gate to the Waaseyaa framework that flags any cross-package dependency a package has not explicitly declared. It runs against a baseline of grandfathered violations that can only shrink, and over four cleanup batches I drove that baseline to empty. From here on, every dependency between packages is declared on purpose, and a new undeclared one fails the build.

https://github.com/waaseyaa/framework/pull/1814

#buildinpublic #cleancode
