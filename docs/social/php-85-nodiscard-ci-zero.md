# Green CI with zero test failures: PHP 8.5 NoDiscard and phpunit deprecations

Reference URL: https://github.com/waaseyaa/framework/issues/1594

## Bluesky

ci/unit-tests was red with zero test failures. The cause: phpunit deprecations and PHP 8.5's new #[\NoDiscard] warnings. Drove both to zero and the suite went green. #php #buildinpublic

https://github.com/waaseyaa/framework/issues/1594

## LinkedIn

A test suite reporting zero failures while CI stays red is a special kind of annoying.

Nothing was actually broken. The job was failing on noise: phpunit deprecation notices, plus a new source of warnings from PHP 8.5's #[\NoDiscard] attribute.

If you haven't hit #[\NoDiscard] yet, you will. It marks a function whose return value is not meant to be ignored, and calling such a function in void context now raises a warning. Great signal in general. It also lights up the moment you upgrade, because plenty of existing call sites discard returns that suddenly have an opinion.

The fix was not to suppress the warnings. It was to clear them: address the deprecations, and at each #[\NoDiscard] call site either use the return value or be explicit that discarding is intended. Once the noise was at zero, the suite was green for the right reason.

The takeaway: treat a red pipeline with zero failures as a real bug, not a flake to rerun. Warnings you route around become warnings you stop reading, and then a real one slips through.

If you're moving to PHP 8.5, budget time for #[\NoDiscard] specifically.

https://github.com/waaseyaa/framework/issues/1594

#php #cicd #buildinpublic #softwareengineering

## Facebook

CI was red while the tests reported zero failures. That is a bug in its own right, not something to rerun until it passes.

The cause was noise: phpunit deprecation notices plus warnings from PHP 8.5's new #[\NoDiscard] attribute, which flags return values you weren't supposed to ignore. The fix was to actually clear them, not silence them. Address the deprecations, and at each flagged call site either use the return value or be explicit about discarding it. Then the suite goes green for the right reason.

If you're upgrading to PHP 8.5, budget time for #[\NoDiscard] specifically.

https://github.com/waaseyaa/framework/issues/1594

#php #buildinpublic
