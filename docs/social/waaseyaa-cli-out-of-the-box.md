# Waaseyaa CLI works out-of-the-box

Reference URL: https://github.com/waaseyaa/framework/issues/1226

## Bluesky

Closed a Waaseyaa DX bug. vendor/bin/waaseyaa now works in consuming apps out of the box. No wrapper script, no post-install symlink. #buildinpublic

https://github.com/waaseyaa/framework/issues/1226

## LinkedIn

Your framework's CLI should work out of the box. Mine didn't.

If you installed Waaseyaa in a consuming app and ran vendor/bin/waaseyaa, you got:

"Bootstrap failed: Database not found. In production, the database must already exist."

Three things were going wrong, all in the same boot path.

1. The bin script didn't load .env. If your app set APP_ENV=local and a DB path in .env, the CLI saw neither. Only the OS environment was visible.

2. projectRoot was computed from the bin's own location, which resolved to vendor/waaseyaa/cli, not your app root. So the default DB path pointed inside vendor.

3. resolveEnvironment defaulted APP_ENV to production when unset. The production guard then refused to auto-create the SQLite file. No env meant production meant hard failure on first dev run. The opposite of every other PHP framework's convention.

The workaround every consuming app shipped: a five-line wrapper that loaded Dotenv and built the kernel with the right projectRoot, plus a post-install hook to symlink it. That was the cost of not working out of the box.

I found it the way most framework-DX bugs get found: by using my own framework inside another app and hitting the paper cut. The fix lives at the framework layer now. Consuming apps drop the wrapper, drop the symlink hook, and the CLI just works.

Small fix, real lesson. A framework isn't done until you install it somewhere you didn't build it.

https://github.com/waaseyaa/framework/issues/1226

#php #opensource #developerexperience #buildinpublic

## Facebook

Closed a Waaseyaa framework bug today. If you installed the framework in a consuming app and ran vendor/bin/waaseyaa, you hit a hard failure on first run: the CLI didn't load .env, computed its project root from the wrong directory, and defaulted to production mode with no environment file in sight.

Every consuming app worked around it by shipping their own wrapper and a post-install symlink hook. That's the opposite of working out of the box. The fix lives at the framework layer now, so consuming apps can drop the wrapper entirely.

Small bug. Real reminder: a framework isn't done until you install it somewhere you didn't build it.

https://github.com/waaseyaa/framework/issues/1226

#php #buildinpublic
