---
title: "Managing LLM context in a real application"
date: 2026-03-27
categories: [ai]
tags: [ai, llm, php, claudriel]
summary: "How Claudriel manages LLM context in production: conversation trimming, turn budgets, model fallback, prompt caching, and per-turn token telemetry."
slug: "claudriel-context-guardrails"
draft: false
devto: true
---

Ahnii!

This post covers how [Claudriel](https://github.com/jonesrussell/claudriel), a [Waaseyaa](https://github.com/jonesrussell/waaseyaa)-based AI assistant SaaS, handles LLM context in production: conversation trimming, per-task turn budgets, model degradation on rate limits, prompt caching, and per-turn token telemetry.

## The problem with unbounded context

Every message you send to an LLM API costs tokens. Long-running chat sessions accumulate history fast. Left unchecked, a single active session can push input token counts into the tens of thousands per turn, even before the model generates a word.

Claudriel runs multiple agent turns per user request — reading email, checking calendars, querying entities. Each turn sends the full conversation history plus tool definitions. Without guardrails, costs compound and rate limits trigger unpredictably.

## Trimming conversation history before it reaches the API

The first line of defense is `ChatStreamController::trimConversationHistory()`. Before any message goes to the API, the history is trimmed to a cap of 20 messages. Older assistant responses beyond that window are truncated to 500 characters with a `[truncated]` marker.

```php
private function trimConversationHistory(
    array $sessionMessages,
    int $maxMessages = 20,
    int $olderAssistantMaxChars = 500,
): array {
    $total = count($sessionMessages);

    if ($total <= $maxMessages) {
        return array_map(
            fn ($m) => ['role' => $m->get('role'), 'content' => $m->get('content')],
            $sessionMessages,
        );
    }

    $recentCount = min(4, $total);
    $cutoff = $total - $recentCount;
    $olderStart = max(0, $total - $maxMessages);
    $trimmedCount = $olderStart;

    // ... truncate older assistant responses, inject trim notice ...
}
```

The last four messages (two exchanges) are always kept in full. When messages are dropped, the first kept user message gets a notice prepended: `[Earlier conversation trimmed — N messages]`. This keeps the model aware that context was cut without burning tokens on the full history.

This alone puts a ceiling on input token growth for long sessions — but it doesn't address cost within a single agentic turn.

## Per-task turn budgets

Agentic tasks vary in how many tool calls they need. A calendar lookup needs two or three turns. A research task may need forty. Treating them the same wastes tokens on simple tasks and starves complex ones.

`NativeAgentClient` classifies each request by keyword-matching the first user message and looks up a turn limit from a table:

```php
private const DEFAULT_TURN_LIMITS = [
    'quick_lookup'     => 5,
    'email_compose'    => 15,
    'brief_generation' => 10,
    'research'         => 40,
    'general'          => 25,
    'onboarding'       => 30,
];
```

These are the default limits. Workspaces can override them per session via `turnLimitsOverride`, and individual calls can pass a hard `turnLimitOverride`. Session metadata stores the applied limit and turns consumed so that multi-part continuations pick up where they left off.

When the agent approaches its limit — specifically, one turn before it would hit the cap — it fires an `onNeedsContinuation` callback rather than cutting off silently:

```php
if ($turnLimit > 1 && $turnsWithinCall >= $turnLimit - 1) {
    if ($onNeedsContinuation !== null) {
        $onNeedsContinuation([
            'turns_consumed' => $turnsConsumed,
            'task_type'      => $taskType,
            'message'        => 'I need more turns to complete this task. Continue?',
        ]);
    }

    break;
}
```

The frontend receives this as a progress event and can prompt the user to continue, rather than getting a half-finished response with no explanation.

## Tool result truncation

Each tool result returned to the model is also bounded. `NativeAgentClient` caps tool results at 2,000 characters by default. Gmail message bodies get a tighter 500-character cap since they tend to be verbose and the agent rarely needs the full body to act.

```php
private const TOOL_RESULT_MAX_CHARS = 2000;
private const GMAIL_BODY_MAX_CHARS  = 500;
```

The truncation appends `[truncated]` so the model knows the data was cut rather than incomplete. Tool results bound the payload size per turn; model selection determines how expensive each of those tokens is.

## Model selection per workspace

The model isn't global. `ChatStreamController::resolveChatModel()` checks the workspace entity for an `anthropic_model` field first, then falls back to the `ANTHROPIC_MODEL` environment variable, then to the application default (`claude-sonnet-4-6`).

```php
private function resolveChatModel(?Workspace $workspace): string
{
    $workspaceModel = $workspace?->get('anthropic_model');
    if (is_string($workspaceModel)) {
        $trimmed = trim($workspaceModel);
        if ($trimmed !== '' && isset(self::ALLOWED_ANTHROPIC_MODELS[$trimmed])) {
            return $trimmed;
        }
    }

    return $this->resolveDefaultModel();
}
```

Only models in the allowlist are accepted:

```php
private const ALLOWED_ANTHROPIC_MODELS = [
    'claude-opus-4-6'            => true,
    'claude-sonnet-4-6'          => true,
    'claude-haiku-4-5-20251001'  => true,
];
```

This means a workspace running a high-volume, low-complexity workflow can be pinned to Haiku, while a research-heavy workspace uses Opus — without any code changes. Per-workspace model selection works until the API disagrees.

## Automatic model degradation on rate limits

Even with per-workspace model selection, rate limits happen. When the API returns a rate limit error after three retries, `NativeAgentClient` degrades to the next cheaper model rather than failing the request:

```php
private const MODEL_DEGRADATION = [
    'claude-opus-4-6'           => 'claude-sonnet-4-6',
    'claude-sonnet-4-6'         => 'claude-haiku-4-5-20251001',
    'claude-haiku-4-5-20251001' => null,
];
```

When the fallback is null (already at the cheapest tier), the request fails and the error is surfaced. Escalation works in reverse — a non-rate-limit API error tries a more capable model before giving up.

Both transitions emit a `progress` event to the frontend so the user sees something like "Rate limit exhausted on claude-opus-4-6, falling back to claude-sonnet-4-6" rather than a spinner freeze.

## Prompt caching to reduce repeated token costs

System prompts and tool definitions are sent on every API call. [Anthropic's prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) lets you mark these as cacheable, so the model can reuse previously processed tokens at a fraction of the cost.

`NativeAgentClient` applies `cache_control: ephemeral` to two locations before each API call:

```php
$cachedSystem = [[
    'type'          => 'text',
    'text'          => $systemPrompt,
    'cache_control' => ['type' => 'ephemeral'],
]];

// Mark last tool definition for caching
$cachedTools = $toolDefinitions;
if ($cachedTools !== []) {
    $lastIdx = count($cachedTools) - 1;
    $cachedTools[$lastIdx]['cache_control'] = ['type' => 'ephemeral'];
}
```

The system prompt and the full tool list are the two largest static inputs. Caching them is the single highest-impact cost reduction for multi-turn sessions. Cached tokens still count against rate limits, so they don't eliminate the need for turn budgets — but they cut the dollar cost of a long agentic session significantly.

The default cache TTL is 5 minutes. For longer-lived sessions, Anthropic now offers a 1-hour TTL at additional cost: `"cache_control": {"type": "ephemeral", "ttl": "1h"}`. For an assistant that stays active across a workday, that's worth evaluating. Caching reduces cost — but without telemetry, you won't know by how much.

## Per-turn token telemetry

Cost visibility requires knowing what each turn actually consumed. After each API response, `NativeAgentClient` fires an `onTelemetry` callback with per-turn usage data:

```php
if (is_array($usage) && $onTelemetry !== null) {
    $onTelemetry([
        'turn_number' => $turnsConsumed,
        'task_type'   => $taskType,
        'model'       => $currentModel,
        'usage'       => $usage,
        'turn_limit'  => $turnLimit,
    ]);
}
```

`ChatStreamController` receives this and writes a `chat_token_usage` entity per turn, recording input tokens, output tokens, cache read tokens, and cache write tokens separately:

```php
$entry = new ChatTokenUsage([
    'uuid'               => $this->generateUuid(),
    'session_uuid'       => $sessionUuid,
    'turn_number'        => $turnNumber,
    'model'              => $model,
    'input_tokens'       => (int) ($usage['input_tokens'] ?? 0),
    'output_tokens'      => (int) ($usage['output_tokens'] ?? 0),
    'cache_read_tokens'  => (int) ($usage['cache_read_input_tokens'] ?? 0),
    'cache_write_tokens' => (int) ($usage['cache_creation_input_tokens'] ?? 0),
    'tenant_id'          => $tenantId,
    'workspace_id'       => $workspaceUuid,
    'created_at'         => (new \DateTimeImmutable)->format('c'),
]);

$storage->save($entry);
```

With this data you can see which task types consume the most tokens, whether cache hits are materializing, and whether model degradation events correlate with cost spikes — all at the turn level, not just per session.

## How the layers interact

These aren't independent features. Conversation trimming bounds history growth. Turn budgets bound agentic depth. Tool result truncation bounds per-turn payload size. Prompt caching reduces repeated costs. Model degradation handles rate pressure without hard failures. Telemetry makes all of it observable.

Each layer addresses a different part of the same problem: LLM API costs and reliability are non-deterministic unless you actively shape the inputs and handle the edges. Shipping a production AI feature means shipping all of these, not just the happy path.

Baamaapii
