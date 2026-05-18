# String controller detection in route providers

Reference URL: https://github.com/waaseyaa/framework/pull/1505

## Bluesky

Static analyzer missed string-form controller refs in route providers, flagging real code unreachable. Detection added. Static analysis is only as smart as its walker. #buildinpublic

https://github.com/waaseyaa/framework/pull/1505

## LinkedIn

A small but instructive fix landed in the Waaseyaa framework this week.

The dead-code static analyzer was walking route providers looking for controller references, but it only recognized the callable form (a closure or an explicit class-method tuple). It missed the string form: `'controller' => 'App\Controllers\FooController::index'`. That string is a perfectly valid Symfony-style controller reference, but to the analyzer it looked like an opaque value.

The result: real controllers were getting flagged as unreferenced. The dead-code report had false positives, and any developer following them in good faith would have deleted live code.

The fix adds string-controller detection to the route provider analyzer. Now both forms get walked, both forms count as references, and the dead-code report stops lying about which classes are actually in use.

The reason this matters more than the diff suggests: static analysis is only as smart as its source walker. Every framework has corners where dynamic references hide behind strings, magic methods, or service-locator lookups. When the walker doesn't know about those corners, the analyzer is confidently wrong, which is worse than being silent.

If you run dead-code analysis on a non-trivial codebase, audit the walker for these blind spots before you trust the report. The shape of the false positives tells you where the language meets the dynamic dispatch.

https://github.com/waaseyaa/framework/pull/1505

## Facebook

Small but instructive fix in the Waaseyaa framework: the dead-code analyzer was missing string-form controller references in route providers, so real controllers were being flagged as unreachable.

The callable form was recognized; the string form (`'App\Controllers\FooController::index'`) was opaque to the walker. Following the report in good faith would have deleted live code. Fix added detection for both forms.

The lesson generalizes: static analysis is only as smart as its source walker. Audit the walker for dynamic-dispatch blind spots before you trust the dead-code report.

https://github.com/waaseyaa/framework/pull/1505

#buildinpublic #waaseyaa
