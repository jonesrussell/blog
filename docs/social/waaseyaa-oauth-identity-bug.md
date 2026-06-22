# An OAuth login bug that could map you to the wrong account

Reference URL: https://github.com/waaseyaa/framework/pull/1729

## Bluesky

An OAuth login bug worth knowing: our GitHub provider read JSON from /user without checking the request succeeded. On a 401 or 429, the error body has no id, so it minted an empty identity. Always check isSuccess first. https://github.com/waaseyaa/framework/pull/1729 #buildinpublic

## LinkedIn

A subtle OAuth bug, and why "the happy path works" is not enough.

Our GitHub login provider exchanged the code fine, then called getUserProfile() to read the account. That method fetched GET /user and GET /user/emails and read the JSON straight into a profile object.

The problem: it never checked whether the request actually succeeded.

On a 401, 403, 429, or any 5xx, GitHub returns an error body with no id and no login. The old code read that error body as if it were a user, and minted an identity with an empty provider id and name. A consumer app could then map that empty identity onto the wrong account. A transient rate-limit could quietly become a login as someone else.

The fix is small and worth copying:

Throw when the user request fails, surfacing GitHub's own error message, instead of reading the body.

Reject a success body that has no id, because that is not a real profile either.

Keep the emails lookup best-effort: a missing user:email scope or a transient error should yield no verified email, not a failed login, and an error body must never be read as email data.

It shipped with failing-first tests that prove the pre-fix code produced a degenerate identity on an error response.

The lesson is general, not framework-specific: never read JSON from an HTTP response you have not confirmed succeeded. In auth code, an unchecked error body is not just a bug. It is a wrong-identity bug.

https://github.com/waaseyaa/framework/pull/1729

#buildinpublic #oauth #php #security

## Facebook

A subtle OAuth bug worth sharing. Our GitHub login provider read the user profile from GitHub's API but never checked whether the request actually succeeded. On a 401 or a 429 rate-limit, GitHub returns an error body with no id, and the old code read that as a user. It minted an identity with an empty provider id, which a consumer app could map onto the wrong account. A transient error could quietly turn into a login as someone else.

The fix: throw when the user request fails instead of reading the body, reject any success response that has no id, and keep the email lookup best-effort so a missing scope yields no email rather than a broken login. It shipped with tests that fail against the old code.

The lesson is general. Never read JSON from an HTTP response you have not confirmed succeeded. In auth code, an unchecked error body is a wrong-identity bug. https://github.com/waaseyaa/framework/pull/1729

#buildinpublic
