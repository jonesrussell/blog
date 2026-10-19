# Buffer posting

The **Buffer Posting** GitHub workflow sends already-written social copy. It does not install or call Claude. It uses the existing personal account secrets: BUFFER_API_KEY and BUFFER_CHANNEL_BLUESKY, BUFFER_CHANNEL_LINKEDIN, BUFFER_CHANNEL_FACEBOOK. The older local Ansible vault token is invalid; do not sync it over these working secrets.

For a campaign, commit Markdown with exactly three platform sections and a manifest listing each file with an optional ISO dueAt. Paths are relative to the repository root. Validate locally:

```sh
node scripts/buffer-delivery.mjs docs/social/campaigns/waaseyaa-2026-10/campaign.json validate
node --test scripts/buffer-delivery.test.mjs
```

Run Buffer Posting manually with that manifest and action `inspect`. Review the channel names, current queue depths and planned times in the run log, then use `queue`. Use `verify` to check delivery without writes. The Waaseyaa October campaign has four posts per channel, October 20, 23, 27 and 30 at 10 AM Toronto time.

All channels and copy are checked before the first write. Live exact-text matches are reused; mismatched dates, failed/draft copies, disconnected channels and queues exceeding ten posts stop the run. Every mutation is saved to the run's receipt artifact. No write is automatically retried. After an uncertain response, inspect live state and the partial receipt before rerunning. This protects ordinary reruns but is not a server-side idempotency guarantee if Buffer has accepted a write that its reads cannot yet see.

Content Autopilot commits each new social bundle to `data/buffer-outbox.json` with the blog post. Buffer Posting drains this outbox after Autopilot finishes, even when its later steps fail, and retries daily at 12:00 UTC. Successful outbox deliveries are committed to `data/buffer-delivery-ledger.json`. Both workflows share a concurrency group. Autopilot pauses new generation while an outbox item is pending. No existing historical social bundles are replayed automatically.

Claude generation still uses its subscription token. The October 19 failure says the organization disabled Claude subscription access. This is independent of Buffer and is not evidence of a bad Buffer key. Restore the account's subscription access or explicitly choose API billing before changing authentication. The workflow does not silently fall back to a separately billed API.

Queue Hygiene defaults to a dry run when started manually. Its weekly schedule retains the existing fourteen-day expiry policy for open mined items. It uses CROSS_REPO_TOKEN because the queue is in a different repository, fetches every page and rechecks state before closing an item.
