Queue-Issue: #378
Reference URL: https://github.com/waaseyaa/framework/commit/6491f7e

## Bluesky

Waaseyaa's LlmConversationRequest is a provider-agnostic DTO that serializes to both Anthropic and OpenAI chat formats. Swap the provider in your container; keep the conversation code unchanged. https://github.com/waaseyaa/framework/commit/6491f7e #PHP #buildinpublic

## LinkedIn

Every LLM API uses a different message format. The more providers you want to support, the more places you have to serialize and switch.

Commit 6491f7e adds LlmConversationRequest to Waaseyaa's ai-agent package: a provider-agnostic conversation DTO. You construct your messages once in a neutral format, then the provider serializes them. Swap the provider in your container config and the conversation code stays unchanged.

The DTO ships two serialization methods. toAnthropicFragment() produces the body fragment expected by the Anthropic Messages API. toOpenAiChatFragment() maps the same messages to OpenAI chat completions format, including remapping system prompts to the OpenAI system role message convention.

The commit also adds OpenAiCompatibleProvider, a concrete provider implementation for the OpenAI chat completions endpoint. Combined with the existing AnthropicProvider, you can now run the same conversation against either backend by changing one line in your container.

One caveat documented in the code: non-empty tool definitions are not yet supported for OpenAI serialization and throw an exception at serialize time. The Anthropic provider handles MCP and tool loops. For straightforward chat completion, both providers work.

Four files, fully tested:
packages/ai-agent/src/Provider/LlmConversationRequest.php (119 new lines)
packages/ai-agent/src/Provider/OpenAiCompatibleProvider.php (133 new lines)
packages/ai-agent/src/Provider/MessageRequest.php (refactored to delegate to the conversation DTO)
packages/ai-agent/tests/Unit/Provider/ (3 test classes added or updated)

Provider-agnostic conversation handling is the right abstraction to own at the framework level. Committing to a single provider's wire format is a decision that compounds cost every time you want to benchmark, failover, or give users a choice.

https://github.com/waaseyaa/framework/commit/6491f7e

#Waaseyaa #PHP #AI #buildinpublic #OpenSource

## Facebook

Building an AI agent in PHP that works with multiple providers means writing separate message serialization code for each one. That cost compounds the moment you want to benchmark providers or give users a choice.

Commit 6491f7e adds LlmConversationRequest to Waaseyaa's ai-agent package: a neutral conversation DTO with serialization to both Anthropic and OpenAI chat completions format. Pick a provider in your container config. The conversation code stays the same.

The commit also ships OpenAiCompatibleProvider as a concrete backend. Tool calls are not yet bridged for OpenAI, but for standard chat it works. https://github.com/waaseyaa/framework/commit/6491f7e #Waaseyaa #PHP #AI

Distributed: 2026-08-07 (autopilot, customScheduled)
