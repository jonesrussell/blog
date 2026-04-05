---
categories:
    - ai
date: 2026-03-27T00:00:00Z
devto: true
devto_id: 3457030
draft: true
slug: adaptive-memory-decay
summary: How Claudriel uses a daily importance score decay to keep its memory relevant without growing indefinitely.
tags:
    - claudriel
    - ai
    - waaseyaa
    - php
title: Adaptive memory decay in Claudriel
---

Ahnii!

[Claudriel](https://claudriel.ai) stores context about people, commitments, and calendar events so its agent can reason about your work without you repeating yourself. This post covers how the adaptive memory decay system keeps that context lean by nudging stale records toward a configurable floor — and how to run and tune it.

## The Problem With Keeping Everything

Every entity Claudriel stores starts with an `importance_score` of `1.0`. Over time, a contact you haven't interacted with, a commitment that slipped, or an event from six months ago still carries full weight. The agent treats it the same as something that happened yesterday.

That's a context noise problem. The more low-relevance records compete for attention, the more the agent has to sift. Something has to push stale memories toward irrelevance — not delete them, just reduce their influence.

The decay system is that mechanism.

## Schema Fields That Enable Decay

Three fields were added to the `person`, `commitment`, and `mc_event` entity types to support decay. They appear in both the entity classes and their Waaseyaa `EntityType` field definitions:

```php
'importance_score' => ['type' => 'float'],
'access_count'     => ['type' => 'integer'],
'last_accessed_at' => ['type' => 'datetime'],
```

Every entity initializes `importance_score` to `1.0` at creation. The `access_count` and `last_accessed_at` fields are optional for now — they exist to support access-weighted decay in a future iteration, where a memory that gets retrieved frequently decays more slowly.

The schema uses Waaseyaa's `SqlSchemaHandler`, which creates columns on first `ensureTable()`. If you're upgrading an existing database, you'll need a manual `ALTER TABLE` to add these columns — `ensureTable()` only creates, never migrates.

## The `claudriel:decay` Command

The decay logic lives in `src/Command/DecayCommand.php` and runs as a Symfony Console command:

```bash
php artisan claudriel:decay
```

Options:

```
--tenant=UUID    Process only one tenant (omit for all)
--dry-run        Print score changes without persisting them
--verbose        Print per-entity old → new score
```

The command iterates over `person`, `commitment`, and `mc_event` entities. For each one, it skips any entity already updated today — so running it multiple times in a day is safe — then applies the formula:

```
new_score = max(min_threshold, old_score * rate)
```

In code:

```php
$oldScore = $this->normalizeScore($entity->get('importance_score'));
$newScore = max($minThreshold, min(1.0, $oldScore * $rate));
$entity->set('importance_score', $newScore);
$entity->set('updated_at', $now->format('c'));
```

`normalizeScore()` clamps any stored value to `[0.0, 1.0]` before the multiplication, so corrupt or out-of-range data doesn't produce runaway results.

The command finishes with a summary line:

```
Decay complete. updated=142 skipped_already_decayed=0 rate=0.995 min_threshold=0.100 dry_run=no
```

## Tuning Decay Rate and Floor

The two levers are `decay_rate_daily` and `min_importance_threshold`. Both are read from the account's `settings` JSON blob, which Claudriel stores in the `Account` entity:

```json
{
  "decay_rate_daily": 0.995,
  "min_importance_threshold": 0.1
}
```

`decay_rate_daily` is a multiplier applied once per day. At `0.995`, an entity at full importance reaches `0.9` after roughly 20 days of no access. At `0.98`, it gets there in about 5 days. Both values default conservatively — the system resolves `decay_rate_daily` to `0.995` and `min_importance_threshold` to `0.1` if the settings key is absent or unparseable.

The floor prevents any memory from reaching zero through decay alone. An entity pinned to `0.1` can still be found; it just competes weakly against fresh context.

To experiment without touching data, run with `--dry-run --verbose` and watch a few entities drift:

```bash
php artisan claudriel:decay --dry-run --verbose --tenant=your-uuid
```

Output shows each entity's before and after:

```
person:3a7f... 1.0000 -> 0.9950
commitment:c182... 0.8312 -> 0.8271
mc_event:99de... 0.1012 -> 0.1000
```

The third line shows the floor kicking in — the event is already near `min_importance_threshold` and gets clamped.

## Running Decay on a Schedule

The command is designed to run once daily, typically from a cron job or a scheduled task runner. A crontab entry that processes all tenants at 2am:

```cron
0 2 * * * /path/to/php artisan claudriel:decay >> /var/log/claudriel-decay.log 2>&1
```

The idempotency guard (`alreadyDecayedToday`) checks `updated_at` against the current date, so if the job runs twice — from a retry or a manual trigger — nothing is double-decayed.

## What Decay Doesn't Do

Decay doesn't delete records. A memory at `0.1` is still there. The agent can still retrieve it; it just scores low relative to recent activity.

It also doesn't account for access patterns yet. A person you interact with daily will decay at the same rate as someone you never contact. The `access_count` and `last_accessed_at` fields are there for when that changes — read activity logged via `MemoryAccessEvent` will eventually feed back into the rate.

That's the next step: let retrieval events slow the decay of frequently-accessed memories, and let silence accelerate it.

Baamaapii
