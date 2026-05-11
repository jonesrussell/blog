# The PHP 8.5 deprecation sweep: from 34 warnings to zero

Reference URL: https://jonesrussell.github.io/blog/php-8-5-deprecation-sweep/

## X

PHP 8.5 surfaced 34 deprecations across our test suite. Three patterns. Twenty-nine sites. Wrote up the sweep methodology. #buildinpublic

https://jonesrussell.github.io/blog/php-8-5-deprecation-sweep/

## LinkedIn

PHP 8.5 surfaced 34 deprecation warnings across Waaseyaa's test suite. That number is not a measure of how broken the code was. It is a measure of how dense the test corpus is.

The 34 warnings collapsed into three patterns once you grouped them:

ReflectionMethod::setAccessible() — 22 sites. No-op since 8.1, deprecated outright in 8.5. The fix was deletion. The line was already doing nothing.

$http_response_header — 1 site. The magic global swapped for the explicit function http_get_last_response_headers(). Easier to read, easier to mock, easier to grep for.

curl_close() — 6 sites. No-op since libcurl 7.20.0. Deleted without replacement. The handle is collected by GC when it goes out of scope.

Exit criterion was numeric and binary: zero deprecations across the full 7,497 test suite. Either the number is zero or the work package is not done.

The methodology if you are doing the same on your codebase:
- Move the PHP floor
- Run the full suite, capture deprecations
- Group warnings by deprecation key (not by file)
- One commit per group, with the same removal pattern applied to every site
- Rerun, zero, or not done

Grouping by file produces unreadable diffs. Grouping by pattern produces revertible ones.

Post two of three in the PHP 8.5 upgrade series.

https://jonesrussell.github.io/blog/php-8-5-deprecation-sweep/

## Facebook

PHP 8.5 surfaced 34 deprecations across Waaseyaa's tests. Three patterns: ReflectionMethod::setAccessible() at 22 sites, the $http_response_header magic global at 1, and curl_close() at 6.

The sweep methodology: group warnings by deprecation key, fix one group per commit with the same removal pattern across every site. Exit when the number is zero across the full 7,497 test suite.

Post two of three on the upgrade.

https://jonesrussell.github.io/blog/php-8-5-deprecation-sweep/

#buildinpublic
