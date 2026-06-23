# Your queue must carry the real notification, not a stripped copy

Reference URL: https://github.com/waaseyaa/framework/pull/1727

## Bluesky

A queue bug worth knowing: our handler rebuilt the queued notification as a stripped copy with only via() and toArray(). The mail channel sent nothing, the database channel lost its payload. Async rendered unlike sync. https://github.com/waaseyaa/framework/pull/1727 #buildinpublic

## LinkedIn

If your queued job renders differently from the synchronous one, look at what you put on the queue.

Our notification system supports multiple channels: mail, database, and others. Each channel asks the notification for its own shape, toMail for email, toDatabase for the stored record.

When a notification went async, the send handler rebuilt it as an anonymous class that implemented only via() and toArray(). A stripped copy. It had the routing and a generic array, but not the channel-specific methods.

The fallout was quiet and per-channel. The mail channel early-returns when toMail is absent, so it sent nothing at all. The database channel fell back from toDatabase to the generic toArray, so the stored record had the wrong shape. The same notification, sent synchronously, rendered correctly. Queue it, and it silently degraded.

The fix carries the real notification through the queue so the async path renders every channel exactly like the sync path.

The general lesson: a queue is a serialization boundary, and a stripped or rehydrated stand-in is not the same object. If the thing you enqueue is not the thing you would have run inline, your async path is a different code path with different behavior, and the difference will show up as the bug that only happens in production.

https://github.com/waaseyaa/framework/pull/1727

#buildinpublic #php #softwarearchitecture #webdevelopment

## Facebook

A queue bug worth sharing. Our notifications support multiple channels, and each channel asks the notification for its own shape, toMail for email and toDatabase for the stored record. When a notification went async, the handler rebuilt it as a stripped anonymous class with only via() and a generic toArray(). So the mail channel, which skips sending when toMail is absent, sent nothing, and the database channel stored the wrong shape. Sent synchronously the same notification worked fine.

The fix carries the real notification through the queue so async renders every channel like sync. The general lesson: a queue is a serialization boundary, and a stripped stand-in is not the same object. If what you enqueue is not what you would have run inline, you have two different code paths, and that gap becomes the bug that only shows up in production. https://github.com/waaseyaa/framework/pull/1727

#buildinpublic
