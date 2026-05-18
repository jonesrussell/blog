# PHP 8.4 mechanical modernization mission complete

Reference URL: https://github.com/waaseyaa/framework/commit/10e7ade

## Bluesky

PHP 8.4 mechanical modernization done in Waaseyaa. Property promotion, readonly, new array helpers, asymmetric visibility where applicable. Run the tool, review the diffs, ship. The cleanup before the PHP 8.5 work could begin. #buildinpublic

https://github.com/waaseyaa/framework/commit/10e7ade

## LinkedIn

The PHP 8.4 mechanical modernization mission closed in the Waaseyaa framework. Worth a flag for what "mechanical" actually means in practice.

The work was a sweep of constructor property promotion, readonly properties where the value is set once and never mutated, the array_find / array_find_key / array_all / array_any helpers in places that used to roll their own foreach, and asymmetric visibility on a few classes where a public read with private write made the invariant clearer than a getter and a setter.

None of it added behavior. All of it removed code. The diff is a long tail of one-or-two-line edits across roughly every package in the framework, applied by Rector with rules tuned to the project's style, then reviewed by hand for the cases where the tool's interpretation didn't match intent.

The reason a mechanical mission gets its own milestone: doing this kind of work in a sweep is much cheaper than doing it incidentally as you touch each file. Sweep mode means you tune the rules once, run the tool, review one large diff, and stop thinking about it. Incidental mode means you keep re-litigating "should I update this style while I'm here" on every PR, forever, and inevitably leave the framework half-modernized in a way that confuses anyone reading the code later.

The PHP 8.5 work that followed (the deprecation sweep series I posted earlier this month) couldn't have shipped cleanly without this pass landing first. Modernization in sequence: 8.4 mechanical first, 8.5 deprecation second. Tomorrow's syntax features need today's foundation ready.

https://github.com/waaseyaa/framework/commit/10e7ade

## Facebook

The PHP 8.4 mechanical modernization mission closed in the Waaseyaa framework this month: constructor property promotion, readonly properties, new array_find helpers, asymmetric visibility where it made invariants clearer. All applied across the framework in one sweep.

None of it added behavior. All of it removed code. The mission was a tooled refactor (Rector with project-tuned rules) followed by a hand review of the cases where the tool's call didn't match intent.

Doing this in a sweep is much cheaper than doing it incidentally as you touch files. The PHP 8.5 deprecation work that came next would have been a mess otherwise.

https://github.com/waaseyaa/framework/commit/10e7ade

#buildinpublic #waaseyaa
