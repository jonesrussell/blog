# A cache key without the user leaks access-filtered rows

Reference URL: https://github.com/waaseyaa/framework/pull/1725

## Bluesky

A cache bug that leaks data: we ran a per-row access filter on a listing, then cached the result under a key with no user context. The next user got a cache hit on the first user's filtered rows, including restricted ones. Fix: key the cache per acting account. https://github.com/waaseyaa/framework/pull/1725 #buildinpublic

## LinkedIn

If a result depends on who is asking, the cache key has to include who is asking. We just relearned this one.

A listing resolver runs a per-row access gate, so each user only sees the rows they are allowed to see. Good. It also caches the resolved listing to avoid recomputing it. Also good, until you look at the cache key.

The key folded the user's roles into the cache context only on a non-default path. The default view path also runs the per-row access gate, but it stored its filtered result under a key with no user context.

So user A loads the listing, the gate filters it to A's rows, and that filtered set gets cached under a user-agnostic key. User B requests the same listing and gets a cache hit on A's filtered rows, including role-restricted and owner-restricted entities they were never allowed to see.

The fix: key the per-row-filtered cache per acting account, so a cached result is only ever served back to the same identity that produced it.

The general lesson: caching and authorization interact, and the interaction is where the leaks live. The moment a value is access-filtered, the identity that filtered it is part of that value. If it is not in the key, you are serving one user's permissions to another.

https://github.com/waaseyaa/framework/pull/1725

#buildinpublic #security #php #softwarearchitecture

## Facebook

A cache bug that leaks data, and a good reminder. Our listing resolver runs a per-row access gate so each user only sees rows they are allowed to see, then caches the result. The problem was the cache key: on the default path it stored the access-filtered rows under a key with no user context. So user A's filtered listing got cached, and user B requesting the same listing got a cache hit on A's rows, including restricted ones they were never allowed to see.

The fix was to key the filtered cache per acting account, so a cached result is only served back to the identity that produced it. The general lesson: once a value is access-filtered, the identity that filtered it is part of that value. If it is not in the cache key, you are handing one user's permissions to another. https://github.com/waaseyaa/framework/pull/1725

#buildinpublic
