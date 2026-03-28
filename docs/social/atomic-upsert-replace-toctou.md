# Social copy: Fix TOCTOU race conditions with atomic SQLite upserts

**Canonical URL:** https://jonesrussell.github.io/blog/atomic-upsert-replace-toctou/

## Facebook

Your PHP "check then insert" pattern has a race condition. Here's how to fix it with a single atomic SQLite statement — no transactions needed. https://jonesrussell.github.io/blog/atomic-upsert-replace-toctou/ #PHP #SQLite #Concurrency #WebDev

## X (Twitter)

Check-then-insert has a race condition. Replace it with atomic INSERT OR REPLACE in SQLite. https://jonesrussell.github.io/blog/atomic-upsert-replace-toctou/

## LinkedIn

If your PHP code checks whether a row exists before inserting it, you have a TOCTOU race condition. This post walks through replacing that pattern with an atomic SQLite upsert, using a real fix from the Waaseyaa framework's scheduler. https://jonesrussell.github.io/blog/atomic-upsert-replace-toctou/
