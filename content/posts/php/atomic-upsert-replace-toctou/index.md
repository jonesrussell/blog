---
title: "Fix TOCTOU race conditions with atomic SQLite upserts"
date: 2026-03-28
categories: [php]
tags: [php, sqlite, concurrency, waaseyaa]
summary: "Replace check-then-insert patterns with INSERT OR REPLACE to eliminate race conditions in SQLite."
slug: "atomic-upsert-replace-toctou"
draft: true
devto: true
---

Ahnii!

If your PHP application checks whether a row exists before inserting it, you have a TOCTOU (time-of-check-to-time-of-use) race condition. This post covers how to replace that pattern with an atomic `INSERT OR REPLACE` in [SQLite](https://www.sqlite.org/), using a real fix from the [Waaseyaa](https://github.com/waaseyaa/waaseyaa) scheduler package.

## The check-then-insert pattern

Here is the pattern that ships in a surprising number of PHP codebases. You try an UPDATE first, and if no rows were affected, you INSERT:

```php
$affected = $this->database->update(self::TABLE)
    ->fields(['last_run_at' => $now, 'last_result' => $result])
    ->condition('task_name', $taskName)
    ->execute();

if ($affected === 0) {
    $this->database->insert(self::TABLE)
        ->values([
            'task_name' => $taskName,
            'last_run_at' => $now,
            'last_result' => $result,
        ])
        ->execute();
}
```

This updates the row if it exists, and inserts a new one if it does not. The logic looks correct in isolation, but it breaks under concurrency.

Between the UPDATE returning zero affected rows and the INSERT executing, another process can insert the same `task_name`. The second INSERT then either throws a constraint violation or, worse, creates a duplicate row if there is no unique constraint.

## Why this matters for queue and scheduler systems

Schedulers and queue workers are the most common place this bug hides. Your scheduler records the last run time for each task. Two workers pick up the same task at roughly the same time. Both see zero affected rows from the UPDATE. Both INSERT. One fails, or both succeed with duplicate data.

The fix is straightforward if your table has a primary key or unique constraint on the column you are checking.

## Atomic upsert with INSERT OR REPLACE

SQLite supports `INSERT OR REPLACE`, which atomically inserts a new row or replaces an existing one when a uniqueness constraint would be violated:

```php
$this->database->query(
    'INSERT OR REPLACE INTO ' . self::TABLE
        . ' (task_name, last_run_at, last_result) VALUES (?, ?, ?)',
    [$taskName, $now, $result],
);
```

This is a single statement. SQLite handles the conflict resolution internally. There is no window between a check and a write for another process to sneak in.

The key requirement is that `task_name` must be a `PRIMARY KEY` or have a `UNIQUE` constraint. Without it, `INSERT OR REPLACE` has nothing to conflict on and will always insert.

## The schema that makes it work

```sql
CREATE TABLE schedule_state (
    task_name VARCHAR(255) PRIMARY KEY,
    last_run_at DATETIME NOT NULL,
    last_result VARCHAR(50) NOT NULL
);
```

The `PRIMARY KEY` on `task_name` gives `INSERT OR REPLACE` its conflict target. When a row with the same `task_name` already exists, SQLite deletes the old row and inserts the new one in a single atomic operation.

## Testing the fix

Your tests should verify that repeated upserts do not create duplicate rows:

```php
public function test_recordRun_does_not_duplicate_rows(): void
{
    $repo = new ScheduleStateRepository($this->database);

    $repo->recordRun('cleanup', new \DateTimeImmutable('2026-03-27 10:00:00'), 'success');
    $repo->recordRun('cleanup', new \DateTimeImmutable('2026-03-27 11:00:00'), 'success');

    $count = $this->database->query(
        'SELECT COUNT(*) FROM schedule_state WHERE task_name = ?',
        ['cleanup']
    )->fetchColumn();

    $this->assertSame(1, (int) $count);
}
```

This test calls `recordRun` twice with the same task name. If the upsert is correct, there will be exactly one row. If the old check-then-insert pattern leaked through, you would see two.

## When INSERT OR REPLACE is not enough

`INSERT OR REPLACE` deletes and re-inserts the row. If your table has foreign keys with `ON DELETE CASCADE`, the replace will cascade those deletes. In that case, use `INSERT ... ON CONFLICT DO UPDATE` instead:

```sql
INSERT INTO schedule_state (task_name, last_run_at, last_result)
VALUES (?, ?, ?)
ON CONFLICT(task_name) DO UPDATE SET
    last_run_at = excluded.last_run_at,
    last_result = excluded.last_result;
```

This updates in place without deleting, so foreign key cascades do not fire.

SQLite also cannot use `INSERT OR REPLACE` with FTS5 virtual tables. For those, wrap a DELETE and INSERT in a transaction. But for regular tables with a unique key and no cascading foreign keys, `INSERT OR REPLACE` is the simplest fix.

Baamaapii
