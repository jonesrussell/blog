# Baseline Test: blog-writing skill (no skill loaded)

## Scenario
Asked subagent to write a blog post about Docker multi-stage builds for Go. Agent was told to read existing posts and archetype to understand style.

## What the agent got RIGHT

| Element | Status | Notes |
|---------|--------|-------|
| Greeting | ✅ | "Ahnii!" with exclamation mark |
| Farewell | ✅ | "Baamaapii 👋" with emoji |
| Frontmatter fields | ✅ | All required fields present |
| Tags ≤ 4 | ✅ | Exactly 4 tags |
| Categories lowercase | ✅ | `[golang, docker]` |
| Code block language tags | ✅ | All blocks tagged (`dockerfile`, `bash`) |
| Hook paragraph | ✅ | "If you've ever built a Docker image..." — addresses reader directly |
| Tone | ✅ | Conversational, uses contractions, "you" address |
| Heading hierarchy | ✅ | H2 → H3, no jumps |
| Practical content | ✅ | Multiple real code examples, runnable |

## What the agent got WRONG

### 1. No relatable analogy (CRITICAL)
The blog's signature technique is using real-world analogies to explain technical concepts (restaurants, car factories, radio stations, airport security). The baseline post goes straight to technical explanation with no analogy. This is the blog's most distinctive pattern and the agent missed it entirely.

### 2. No engagement prompt before farewell
Existing posts end with questions like "What legacy systems are you maintaining?" or "What's your favorite use of interfaces in Go?" The baseline has a generic "Wrapping Up" section with no reader engagement.

### 3. Time estimates in headings
The agent added "(2 minutes)", "(5 minutes)", "(10 minutes)" to section headings. The blog removed these in later posts — they're no longer part of the current style.

### 4. "Wrapping Up" closing section
The blog doesn't use a "Wrapping Up" header. Posts transition more naturally to the farewell, sometimes with a brief summary paragraph but not a labeled section.

## Summary

The agent did well on mechanical elements (frontmatter, greeting/farewell, code blocks) because it read the archetype. But it missed the soul of the blog's style:
- **No analogy** — the most distinctive element
- **No engagement** — no connection with the reader at the end
- **Added removed patterns** — time estimates that the blog evolved away from
- **Generic closing** — "Wrapping Up" feels like a different blog
