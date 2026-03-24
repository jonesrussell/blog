# Shkoda Blog Post Design

**Date:** 2026-03-24
**Type:** Standalone blog post (not part of Waaseyaa series)
**Status:** Draft spec

## Overview

A blog post announcing Shkoda, the first game on the Minoo indigenous knowledge platform. Shkoda is a hangman-style word guessing game that teaches Ojibwe vocabulary through a campfire metaphor. It's live at https://minoo.live/games/shkoda, free, no account required.

## Audience

Dual audience:
- **Developers** building community platforms, language tools, or games with AI assistance
- **Indigenous language/culture community** interested in Ojibwe language revitalization

## Angle

Lead with the game (Approach A). Hook the reader with a playable game, show what the experience is like, then pull back to cultural significance and technical underpinnings.

## Frontmatter

```yaml
title: "Shkoda: a campfire word game for learning Ojibwe"
slug: shkoda-campfire-word-game-ojibwe
categories: [ai]
tags: [waaseyaa, minoo, open-source, claude-code]
summary: "The first game on minoo.live teaches Ojibwe vocabulary through a campfire that burns as long as you keep guessing right."
draft: true
```

## Post Structure

### 1. Intro
One paragraph. Shkoda is live at minoo.live/games/shkoda. A word game that teaches Ojibwe vocabulary. The campfire burns as long as you keep guessing. Free, no account needed.

### 2. "How the game works"
Three modes (daily challenge, practice, streak), two directions (English to Ojibwe, Ojibwe to English), adaptive difficulty by word length and part of speech. Screenshots of the game in action. The Wordle-style share grid. Player-focused, not technical.

### 3. "Every round ends with a teaching"
After each round (win or lose), the player sees the definition, stem, example sentence, and related words from the dictionary database. The game is a vehicle for the dictionary, not the other way around. This is what separates Shkoda from a generic hangman clone.

### 4. "A living language, not a frozen one"
The name correction story: originally named "Ishkode," the author's mother (an elder) corrected it to "Shkoda." Possibly dialect-related. This is the process of learning a living language. The word pool grows as dictionary entries sync from the community pipeline. Minoo isn't preserving a museum piece; it's serving a living community.

### 5. "How it's built"
Brief technical section for developers. Key points:
- Waaseyaa entity system: GameSession (content entity) and DailyChallenge (config entity)
- Hybrid validation: server-validated daily challenge (word never sent to client, prevents cheating), client-validated practice/streak (instant UX, lower stakes)
- Vanilla JS frontend (645 lines), no framework
- SVG campfire with CSS state transitions (data-fire-state attribute)
- Word pool drawn from Minoo's existing dictionary_entry and example_sentence entities
- API: 5 REST endpoints under /api/games/shkoda/

### 6. Baamaapii

## Screenshots to capture

Using Playwright MCP against https://minoo.live/games/shkoda:
- Game in progress (campfire burning, some letters guessed)
- Win state (campfire roaring, teaching data displayed)
- Loss state (cold stones, smoke wisps, teaching still shown)
- Share grid (Wordle-style emoji output)

## Style rules

Per blog-writing skill:
- Open with "Ahnii!", close with "Baamaapii"
- Second person, direct voice
- Max 4 tags
- No em dashes (use periods, colons, commas)
- Link first mentions of products/tools
- Code blocks with language tags + 1-2 sentence explanation after each
- SEO-friendly headings with keywords
- Section transitions that pull the reader forward

## Social media artifact

Generate docs/social/shkoda-campfire-word-game-ojibwe.md with Facebook (hashtags), X (under 240 chars), and LinkedIn (no hashtags) copy.
