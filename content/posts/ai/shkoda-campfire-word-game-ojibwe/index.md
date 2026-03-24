---
categories:
    - ai
date: 2026-03-24T00:00:00Z
devto: true
devto_id: 3396475
draft: false
slug: shkoda-campfire-word-game-ojibwe
summary: The first game on minoo.live teaches Ojibwe vocabulary through a campfire that burns as long as you keep guessing right.
tags:
    - waaseyaa
    - minoo
    - open-source
    - language-revitalization
title: 'Shkoda: a campfire word game for learning Ojibwe'
---

Ahnii!

[Shkoda](https://minoo.live/games/shkoda) is live. It is a word game that teaches Ojibwe vocabulary through play, and it is the first game on [Minoo](https://minoo.live). A campfire burns on screen as long as you keep guessing correctly. Wrong guesses add stones to the fire ring. Free, no account needed.

## How Shkoda teaches Ojibwe vocabulary through play

The game has three modes:

- **Daily challenge**: one fixed word per day, the same for all players. The server validates guesses without ever sending the word to the client. Difficulty follows a weekly schedule: easy on Monday, Wednesday, and Friday. Medium on Tuesday and Thursday. Hard on Saturday and Sunday.
- **Practice**: unlimited random words with adaptive difficulty. Win three in a row and the difficulty escalates. Lose two and it drops back down.
- **Streak**: endless rounds until your first loss. The game tracks your longest run.

You can play in two directions. English-to-Ojibwe shows you a definition and asks you to guess the Ojibwe word. Ojibwe-to-English shows the word revealed piece by piece and asks you to guess the English meaning.

Difficulty scales by word length:

- **Easy** (5 characters or fewer): 7 wrong guesses allowed
- **Medium** (6 to 8 characters): 6 wrong guesses allowed
- **Hard** (more than 8 characters): 5 wrong guesses allowed

After completing a round, you can share your results as emoji text. Correct guesses show as 🔥 and wrong guesses as 🪨. The sequence copies to your clipboard without spoiling the answer.

![Mid-game screenshot showing the campfire, a partially revealed word, and the letter keyboard](/blog/images/posts/shkoda-campfire-word-game-ojibwe/game-in-progress.png)

## Every round ends with a teaching

Win or lose, the game shows you the word's definition, part of speech, and stem. It links directly to the full dictionary entry on Minoo. The game is a vehicle for the dictionary, not the other way around. That is what separates Shkoda from generic hangman clones.

![Win state showing "Miigwech! You got it!", the completed word with its definition, stats, and a share button](/blog/images/posts/shkoda-campfire-word-game-ojibwe/win-state.png)

The teaching data comes from Minoo's dictionary, which is shaped by the community. That brings up how the game's own name was corrected.

## A living language, not a frozen one

The game was originally called "Ishkode." My mother, an elder, corrected the spelling to "Shkoda." It may be a dialect difference. That correction is the whole point. This is how living languages work. Elders shape the language, and the platform reflects their guidance. The old URL at `/games/ishkode` still redirects via 301, so no links break.

The word pool grows automatically as new dictionary entries are added through the community pipeline. Minoo is not preserving a museum piece. It is serving a living community.

The community shapes the language. The framework underneath makes that possible.

## How Shkoda is built on the Waaseyaa framework

For developers curious about the architecture: Shkoda runs on [Waaseyaa](https://github.com/waaseyaa/framework), a PHP CMS framework.

Two entity types drive the game. **GameSession** is a content entity that stores the full state of a game in progress. **DailyChallenge** is a config entity holding pre-generated daily words.

Validation uses a hybrid approach. The daily challenge is fully server-validated. The word is never sent to the client, which prevents cheating. Practice and streak modes use client-side validation with base64-obfuscated words. That is a deliberate tradeoff: lower-stakes modes do not need server round-trips on every guess.

The frontend is vanilla JavaScript, roughly 650 lines, with no framework dependency. The campfire is SVG with CSS state transitions that respond to game events.

Five REST endpoints live under `/api/games/shkoda/`:

- `/daily` for fetching the daily challenge
- `/word` for requesting a random practice word
- `/guess` for server-validated guesses (daily mode)
- `/complete` for recording a finished round
- `/stats` for player statistics

The `/complete` endpoint returns the word, definition, part of speech, stem, slug, example sentences in both Ojibwe and English, and aggregate stats. The word pool draws exclusively from `dictionary_entry` entities in Minoo's database.

Try a round at [minoo.live/games/shkoda](https://minoo.live/games/shkoda). If you know an elder who would correct a word or add one, that is exactly what Minoo is built for.

Baamaapii
