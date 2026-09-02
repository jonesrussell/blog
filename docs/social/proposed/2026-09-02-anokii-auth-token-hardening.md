Queue-Issue: #1082
Reference URL: https://github.com/waaseyaa/anokii/commit/d0f030b1fc7673e1080c25f78b54f6fb52b59db8

## Bluesky

Anokii now refuses to boot in production if AUTH_TOKEN_SECRET looks like a placeholder. The check runs at startup before the first request, so you find out immediately instead of running with a compromised default. https://github.com/waaseyaa/anokii/commit/d0f030b #buildinpublic #php

## LinkedIn

How many apps have shipped to production with a secret that reads "changeme" or "your-secret-here"? More than anyone admits.

Waaseyaa Anokii just made that class of mistake a hard boot failure.

If AUTH_TOKEN_SECRET in your deployed environment matches any known placeholder, a Waaseyaa-documented default, or an empty value, Anokii refuses to start. The validation delegates to Waaseyaa\Auth\Security\AuthTokenSecret, a contract introduced in Framework alpha.297, so the check logic lives in one canonical location and gets exercised on every boot in every environment.

Two commits close this together. The first, in PR #18, requires a valid AUTH_TOKEN_SECRET before any production HTTP readiness check can pass. The second, in PR #22, adds the AuthTokenSecret contract, removes all example values from the shipped .env.example so there is nothing to accidentally copy-paste, and locks the Framework dependency to alpha.297 so apps cannot run against an unverified alpha. A dedicated test in tests/Config/AuthTokenSecretTest.php and a functional boot test in tests/Functional/ProductionHttpServingPathTest.php verify both paths on every CI run.

The mechanism is simple on purpose. A placeholder secret is not a secret. Boot-time rejection costs nothing and removes an entire category of misconfiguration from the table before a single request is handled.

https://github.com/waaseyaa/anokii/commit/d0f030b

#php #security #waaseyaa #buildinpublic #opensourcephp

## Facebook

One of the most common production security failures has nothing to do with clever attacks. Someone copies .env.example to .env, does not change the secret value, and deploys. The app starts without errors. The placeholder token is live in production.

Waaseyaa Anokii now rejects that at boot time. If AUTH_TOKEN_SECRET is a placeholder, an empty string, or matches any known default from the documentation, the app will not start. You find out before the first request is ever handled, not during a security review.

The check delegates to a contract in the Waaseyaa framework so the validation is consistent and tested. The .env.example file no longer ships with any example value to copy accidentally.

Small change, hard guarantee. https://github.com/waaseyaa/anokii/commit/d0f030b

#php #buildinpublic
