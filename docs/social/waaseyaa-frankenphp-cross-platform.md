# Running a PHP framework on FrankenPHP, cross-platform

Reference URL: https://github.com/waaseyaa/framework/pull/1698

## Bluesky

Got FrankenPHP running a PHP framework cross-platform, including the part nobody enjoys: Windows. An optional dev-runtime package, a composer dev with zero PATH mangling, and a real-Windows fix so php.ini actually serves 200. https://github.com/waaseyaa/framework/pull/1698 #buildinpublic

## LinkedIn

The hardest part of "just run it with FrankenPHP" was never Linux. It was Windows, and the shell, and where the binary lives.

I shipped an optional dev-runtime package that closes that whole class of problems. It follows the Laravel Octane model: the framework does not guess where FrankenPHP is and does not depend on a fragile shell.

What changed:

composer dev now runs through Composer's own PHP, not FrankenPHP's bundled php.exe. That makes it cross-platform by construction, because it is PHP and not bash. No PATH setup, no full-path launches, no two-terminal dance.

A FrankenPhpLocator resolves the binary to an absolute path instead of trusting PATH, which kills the "the shell cannot find PHP" and PATH-shadowing failures outright.

And the one that only shows up on real hardware: the Windows installer had to generate a working php.ini so the server actually returns HTTP 200. Found by end-to-end testing on an actual Windows machine, not a CI assumption.

The lesson I keep relearning: cross-platform support is not a checkbox. It is a pile of small, unglamorous fixes you only find by running the thing where your users run it.

Details in the PR: https://github.com/waaseyaa/framework/pull/1698

#buildinpublic #php #frankenphp #webdevelopment

## Facebook

The hardest part of "just run it on FrankenPHP" was never Linux. It was Windows, the shell, and where the binary actually lives.

I shipped an optional dev-runtime package that removes that whole class of problems, following the Laravel Octane model. composer dev now runs through Composer's own PHP instead of FrankenPHP's bundled php.exe, so it works the same on every platform with no PATH setup. A locator resolves the binary to an absolute path, which kills the "shell cannot find PHP" failures. And the install step now generates a working php.ini on Windows so the server actually serves HTTP 200, a bug only real-hardware testing caught.

Cross-platform support is not a checkbox. It is a pile of small, unglamorous fixes you only find by running the thing where your users run it. https://github.com/waaseyaa/framework/pull/1698

#buildinpublic
