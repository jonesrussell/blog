---
categories:
    - ai
date: 2026-03-25T00:00:00Z
devto: true
devto_id: 3404417
draft: false
slug: minoo-crossword-ojibwe
summary: How Minoo's crossword game teaches Anishinaabemowin through daily puzzles, Elder-authored clues, and a three-layer learning design.
tags:
    - waaseyaa
    - ojibwe
    - minoo
    - games
title: Building an Ojibwe Crossword Puzzle for Minoo
---

Ahnii!

[Minoo](https://minoo.live) is an Indigenous cultural platform built on the [Waaseyaa](https://github.com/waaseyaa/framework) framework. It already had [Shkoda]({{< relref "shkoda-campfire-word-game-ojibwe" >}}), a campfire word game for learning Ojibwe vocabulary. This post covers how the crossword puzzle game extends that idea into a grid format with clue-based reasoning, daily challenges, and difficulty progression.

![Minoo crossword puzzle showing a 7x7 grid with Ojibwe clues and word bank](/blog/images/posts/minoo-crossword-ojibwe/crossword-daily.png)

## Why a Crossword

Shkoda teaches individual words through hangman-style guessing. That works for recognition, but it doesn't exercise the connection between meaning and spelling at the same time. A crossword does: you read a clue in English, recall the Ojibwe word, and spell it letter by letter into an intersecting grid.

The intersections matter. Getting one word right gives you letters for the next one, which reinforces spelling patterns across related vocabulary. That cascade effect is hard to replicate in a single-word game.

## Three Layers of Learning

The game's pedagogy came from an Elder-informed design process. Each clue engages three cognitive layers:

1. **Reasoning** — solve the clue (a definition or an Elder-crafted riddle)
2. **Translation** — map the English concept to the correct Ojibwe word
3. **Spelling** — type the word character by character into the grid

On easy difficulty, a word bank shows both the Ojibwe words and their English meanings. On medium, the word bank shows Ojibwe only. On hard, there is no word bank at all — you work from the clues alone.

There is no lose state. You can retry any word as many times as you need. The game reinforces learning, not gatekeeping.

## Daily Puzzles and Difficulty Cycling

The crossword has three modes: daily, practice, and themed puzzle packs. Daily mode assigns one puzzle per day with difficulty that follows the day of the week:

| Day | Difficulty |
|---|---|
| Monday, Wednesday, Friday | Easy |
| Tuesday, Thursday | Medium |
| Saturday, Sunday | Hard |

This gives new learners three easy days per week while still challenging experienced speakers on weekends. Practice mode lets you choose your own difficulty and generates random puzzles from the full word pool.

## The Ojibwe Keyboard Problem

Standard keyboards don't include the glottal stop (ʼ), which appears in many Ojibwe words like *a'aw* and *aaba'an*. An on-screen keyboard provides the full Ojibwe alphabet plus the glottal stop character (U+02BC) as a dedicated key.

The grid handles Ojibwe orthography at the cell level. Most characters occupy one cell, but digraphs like *sh* and *zh* span two cells. Intersections are allowed on the first letter of a digraph, so a word like *shkoda* can cross with another word on the *s*.

## Grid Generation With CrosswordEngine

Puzzles are pre-generated offline using a greedy placement algorithm with backtracking. The engine places the longest words first, then attempts to intersect shorter words against existing letters. A puzzle must meet quality thresholds before it's accepted:

- All words connected (no islands)
- More than 30% of cells filled
- No two-letter words
- Minimum word count for the grid size

The 7x7 grid is used for daily and practice modes. Themed packs use a larger 10x10 grid to accommodate more vocabulary around a single topic.

Pre-generating puzzles avoids request-time computation, but the controller has a fallback: if the daily cron job misses a run, it generates a simpler puzzle on the fly using a smaller word pool.

## Elder Clues

The clue system supports two sources per word: an auto-generated definition from the dictionary and an optional Elder-authored riddle. When an Elder clue exists, the game displays it alongside the author's name.

```json
{
  "0": {
    "auto": "that over there (animate singular)",
    "elder": "The one who stands apart from the group, watching",
    "elder_author": "Elder Name"
  }
}
```

The `auto` field always exists as a fallback. Elder clues are added through a script in phase one, with an admin interface planned for phase two. On hard difficulty, Elder clues are preferred when available — they require deeper cultural reasoning rather than direct translation.

## Completion and Teaching

When you finish a puzzle, the completion screen shows your time, hints used, and a teaching section. Each word appears with its definition, part of speech, and an example sentence from the dictionary. If any clues had Elder attributions, those are shown too.

The completion data also generates a shareable grid pattern using emoji — filled squares and blanks — so players can share their result without spoiling the answers.

## What Stayed the Same

The crossword reuses Minoo's existing infrastructure. The dictionary entity that powers Shkoda's word pool is the same one that supplies crossword vocabulary. The `GameSession` entity gained a `game_type` field to distinguish crossword sessions from Shkoda sessions, so stats for each game stay separate. The same localStorage fallback for anonymous players and database persistence for authenticated users applies to both games.

Building the second game on the same foundation took a fraction of the time the first one did. The entity system, the session tracking, and the dictionary were already there. The crossword added a grid engine, a new controller, and a frontend — not a new architecture.

Baamaapii
