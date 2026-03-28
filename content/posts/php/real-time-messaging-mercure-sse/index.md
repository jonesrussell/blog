---
categories:
    - php
date: 2026-03-28T00:00:00Z
devto: true
devto_id: 3420843
draft: false
slug: real-time-messaging-mercure-sse
summary: How to build a real-time messaging system with Mercure server-sent events, covering threads, user blocking, and email digests.
tags:
    - php
    - mercure
    - sse
    - waaseyaa
title: Real-time messaging with Mercure SSE in PHP
---

Ahnii!

[Mercure](https://mercure.rocks/) lets you push real-time updates to browsers using server-sent events (SSE), without WebSocket complexity. This post covers how [Minoo](https://minoo.live), a community platform built on the [Waaseyaa](https://github.com/waaseyaa/waaseyaa) framework, uses Mercure for real-time messaging with threads, user blocking, and email notification digests.

## How the messaging layers fit together

The messaging system has four layers:

1. **Entities** — Thread, Participant, and Message stored in SQLite
2. **Controller** — handles HTTP requests for sending messages and listing threads
3. **MercurePublisher** — pushes new messages to subscribed browsers via SSE
4. **MessageDigestCommand** — CLI command that emails unread message summaries on a cron schedule

When a user sends a message, the controller saves it to the database, then publishes an event through Mercure. Every browser with that thread open receives the message instantly. Users who are offline get an email digest every four hours.

## The MercurePublisher

The publisher lives in the `waaseyaa/mercure` framework package. It takes a hub URL and JWT secret, then posts updates to the Mercure hub:

```php
final class MercurePublisher
{
    public function __construct(
        private readonly string $hubUrl,
        private readonly string $jwtSecret,
    ) {}

    public function publish(string $topic, array $data): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        $ch = curl_init($this->hubUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $this->buildPostBody($topic, $data),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->generateJwt(),
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $result !== false && $httpCode >= 200 && $httpCode < 300;
    }
}
```

The `isConfigured()` check lets the publisher degrade gracefully in environments where Mercure is not running (like local development without Docker). If the hub URL or JWT secret is empty, `publish()` returns `false` without throwing.

## Publishing a message from the controller

When the messaging controller saves a new message, it publishes to a topic scoped to the thread:

```php
$this->publishMercure("/threads/{$threadId}", [
    'type' => 'message',
    'message' => [
        'id' => (int) $message->id(),
        'thread_id' => $threadId,
        'sender_id' => $userId,
        'body' => $body,
        'created_at' => $now,
    ],
]);
```

The topic follows the pattern `/threads/{id}` so the JavaScript client knows what to subscribe to. The private `publishMercure` method delegates to the `MercurePublisher` with null-safe access (`$this->mercurePublisher?->publish(...)`).

## Subscribing from the browser

The frontend uses the native `EventSource` API to subscribe to the Mercure hub. No library needed:

```javascript
const url = new URL(hubUrl, window.location.origin);
url.searchParams.append('topic', `/threads/${threadId}`);

const eventSource = new EventSource(url, { withCredentials: true });

eventSource.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            appendMessage(data.message);
        }
    } catch {
        // Ignore malformed events
    }
};
```

The `hubUrl` (typically `/.well-known/mercure`) is passed from the server template. `EventSource` handles reconnection automatically. If the connection drops, the browser reconnects and receives any events it missed (Mercure tracks the `Last-Event-ID` header). The `MercureConnection` class in Minoo also includes a polling fallback for environments where SSE is unavailable.

## Enforcing user blocks at thread creation

When a user creates a thread, the controller checks the block relationship in both directions before allowing it:

```php
$blockStorage = $this->entityTypeManager->getStorage('user_block');
foreach ($participantIds as $participantId) {
    if ($participantId === $creatorId) {
        continue;
    }

    $blocked = $blockStorage->getQuery()
        ->condition('blocker_id', $participantId)
        ->condition('blocked_id', $creatorId)
        ->range(0, 1)
        ->execute();

    if ($blocked !== []) {
        return $this->json(['error' => 'Cannot message a user who has blocked you'], 403);
    }

    $blocking = $blockStorage->getQuery()
        ->condition('blocker_id', $creatorId)
        ->condition('blocked_id', $participantId)
        ->range(0, 1)
        ->execute();

    if ($blocking !== []) {
        return $this->json(['error' => 'Cannot message a user you have blocked'], 403);
    }
}
```

The check runs against the `user_block` entity storage. It queries both directions: whether any participant has blocked the creator, and whether the creator has blocked any participant. Either case returns a 403. This prevents threads from being created between blocked users, rather than silently dropping messages after the fact.

## Email digests for offline users

Not everyone is online when a message arrives. The `MessageDigestCommand` runs on a cron schedule and emails summaries of unread messages:

```bash
# Cron entry (every 4 hours)
0 */4 * * * cd /home/deploy/minoo/current && php bin/waaseyaa messaging:digest
```

The command queries for messages created since the last digest run where the recipient has not read them. It groups messages by thread and sends one email per recipient with all their unread threads. This avoids flooding inboxes with individual notification emails.

## Thread data model

The data model uses three tables:

- **thread** — holds the thread metadata (title, created_at, type)
- **thread_participant** — junction table linking threads to users, with a `last_read_at` timestamp
- **message** — the actual messages, with `thread_id`, `sender_id`, `body`, and `created_at`

The `last_read_at` timestamp on the participant record is how the digest command knows which messages are unread. When a user opens a thread, the frontend updates `last_read_at` to the current time.

## Beyond the server side

The JavaScript modules that handle the UI (typing indicators, scroll-to-bottom, unread badges) and the infrastructure for deploying Mercure alongside Caddy on a VPS are separate topics. The Mercure hub also supports additional event types beyond messages: Minoo publishes `typing`, `read`, `message_edited`, and `message_deleted` events through the same `/threads/{id}` topic, giving the frontend a complete real-time view of thread activity.

Baamaapii
