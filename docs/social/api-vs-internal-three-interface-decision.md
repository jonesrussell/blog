# @api vs @internal: when an internal interface turns out to have callers

Reference URL: https://github.com/waaseyaa/framework/issues/1493

## Bluesky

Three interfaces marked @internal in Waaseyaa turned out to have callers outside the package boundary. RateLimiter, AuthTokenRepository, ComputedField. The audit forces a decision: promote to @api or refactor the callers. PHPDoc tags don't enforce themselves. #buildinpublic

https://github.com/waaseyaa/framework/issues/1493

## LinkedIn

@internal means nothing to the runtime. It's a PHPDoc tag, and PHPDoc tags don't enforce themselves.

A boundary audit on the Waaseyaa framework today surfaced three interfaces marked @internal that have callers reaching across the package boundary anyway: RateLimiter, AuthTokenRepository, and ComputedField. Two paths forward, neither free.

Path one: promote them to @api. That's an admission that the design got it wrong on first call. The interface is part of the public surface whether you wanted it to be or not, and a future change to it will break consumers. The cost is now you're committed to maintaining backwards compatibility on an API you didn't plan to expose.

Path two: refactor the callers. That's an admission the consumers got it wrong. They reached into a package's internals because the right seam wasn't available, and the fix is to add the right seam or change the caller's design. The cost is real work in the consumers, and the seam might need to be invented from scratch.

There's no third option where you keep the @internal tag and pretend the callers aren't there. The audit already found them.

The reason this matters: @internal is a load-bearing assumption that the rest of the codebase respects the boundary. When it doesn't, you don't just have a doc tag drift problem. You have a coupling problem that gets harder to unwind every week.

The clean play in a young framework is path two. The clean play in a mature one is path one. Waaseyaa is closer to the first case, so the work is going inward.

https://github.com/waaseyaa/framework/issues/1493

## Facebook

A boundary audit on the Waaseyaa framework today found three interfaces marked "internal" that turned out to have callers outside the package they live in. RateLimiter, AuthTokenRepository, ComputedField.

The PHPDoc tag means nothing to the compiler. It's a convention, and conventions only work when everyone respects them. The choice now is to either promote the interfaces to the public API surface (and own that commitment) or refactor the callers (and find the right seam they should have used instead).

https://github.com/waaseyaa/framework/issues/1493

#buildinpublic #waaseyaa
