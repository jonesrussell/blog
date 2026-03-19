---
title: "Claudia: An AI Chief of Staff That Runs on Claude Code"
date: 2026-03-19
categories: [ai]
tags: [claude-code, ai-tools, productivity, open-source]
summary: "Claudia turns Claude Code into a personal chief of staff that remembers your relationships, tracks your commitments, and helps you make better decisions."
slug: "claudia-ai-chief-of-staff"
draft: true
---

Ahnii!

[Claudia](https://github.com/kbanc85/claudia) is a terminal-based AI chief of staff built on top of [Claude Code](https://docs.anthropic.com/en/docs/claude-code). It remembers your relationships, tracks your commitments, surfaces patterns in your work, and helps you prioritize your day. This post covers what Claudia does, how it works, and how to get started.

## What Claudia Actually Does

Most AI tools are stateless. You chat, you close the terminal, and everything is gone. Claudia is different. It maintains a persistent memory of the people you work with, the promises you've made, and the decisions you've taken.

Ask Claudia about a contact and you get their role, how you met, your relationship health, open commitments, and connected projects. All sourced from your own conversations and notes.

Run `/morning-brief` and you get a daily summary of what needs attention: overdue commitments, meetings coming up, relationships that are going cold, and a count of your open items.

The judgment layer is where it gets interesting. Claudia stores your decision-making rules and applies them when you ask for help prioritizing. If you've told it that revenue-generating work beats relationship maintenance when there's a deadline, it will remind you of that when you're torn between two tasks.

## How It Works

Claudia has two layers: a template layer that defines her personality and skills, and a memory system that gives her persistent recall. Together they add up to 41 skills, 33 MCP tools, and over 750 tests.

### The Template Layer

41 skills defined in markdown files that Claude Code reads on startup. These cover proactive behaviors like commitment detection and pattern recognition, plus commands you can invoke directly. Some highlights:

| Command | What It Does |
|---|---|
| `/morning-brief` | Daily summary of commitments, meetings, and warnings |
| `/meeting-prep [person]` | One-page briefing before a call |
| `/capture-meeting` | Process meeting notes into action items and relationship updates |
| `/meditate` | End-of-session reflection that extracts learnings and patterns |
| `/memory-audit` | See everything Claudia knows, with source chains |
| `/weekly-review` | Guided reflection across relationships and projects |

There are 41 skills in total, ranging from `/inbox-check` for email triage to `/deep-context` for full-context analysis of a topic.

### The Memory System

A Python-based daemon that powers semantic search and pattern detection. It runs in two modes: an MCP daemon that serves 33 memory tools to Claude Code per session, and a standalone daemon that runs scheduled jobs even when Claude Code is closed.

The scheduled jobs handle memory decay (fading old memories while preserving important ones), consolidation (merging duplicates and detecting patterns), and vault sync.

Search uses hybrid ranking: 50% vector similarity, 25% importance, 10% recency, and 15% full-text match. Accessing a memory boosts its score, mimicking how human recall works.

The daemon is self-diagnosing. Run `--preflight` and it validates all 11 startup steps, from Python version to Ollama connectivity. If something breaks, `--repair` auto-fixes common issues like stale WAL checkpoints or missing database directories.

## Personalized Onboarding

When you first launch Claudia, she walks you through a conversation to learn about you. Based on what you share, she selects one of five archetypes and a business depth level (Full, Starter, or Minimal). A consultant gets deep per-client structure with milestone plans, stakeholder maps, and decision logs. A solo operator gets pipeline tracking and financial management. The workspace adapts to how you actually work.

## Google Workspace Integration

Claudia connects to your Google Workspace with a single command:

```shell
npx get-claudia google
```

This walks you through OAuth setup and enables Gmail, Calendar, Drive, Contacts, and more. Three tiers are available depending on how much you want to connect:

| Tier | Tools | Services |
|---|---|---|
| Core | 43 | Gmail, Calendar, Drive, Contacts |
| Extended | 83 | Core + Docs, Sheets, Tasks, Chat |
| Complete | 111 | Extended + Slides, Forms, Apps Script |

## Brain Visualizer

Run `/brain` and Claudia launches a 3D visualization of your relationship network in the browser. Nodes are people, projects, and entities. Edges are the connections between them. It is a React app that reads directly from the SQLite database.

## Obsidian Vault Sync

If you use [Obsidian](https://obsidian.md), Claudia auto-syncs its memory to a vault at `~/.claudia/vault/` using the PARA structure. Every entity becomes a markdown note with wikilinks, so Obsidian's graph view maps your entire network. SQLite remains the source of truth. The vault is a read-only projection you can browse and search.

## Getting Started

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- Node.js 18+
- Python 3.10+ (for the memory system)
- [Ollama](https://ollama.com) (for embeddings)

### Install and Run

```shell
npx get-claudia
```

The installer sets up the workspace, configures the memory daemon, and generates your `.mcp.json`. After it finishes:

```shell
cd claudia
claude
```

Claudia introduces herself and learns about you through a natural conversation. She generates a personalized workspace based on what you share.

Pull the embedding model Ollama needs for semantic search:

```shell
ollama pull all-minilm:l6-v2
```

If you want the template layer without the memory system, pass `--no-memory`:

```shell
npx get-claudia my-project --no-memory
```

Claudia still works with markdown files alone. You can add the memory system later by running the installer again.

## Development Velocity

The project moves fast. Claudia went from v1.0 to v1.55 in under two months, with 373 commits and named releases like "The Unified Memory Release," "The Reliability Release," and "The Community Release." The changelog reads like a product roadmap being executed in real time.

Recent milestones include the Brain Visualizer (v1.14), Relationship Intelligence with automatic connection mapping (v1.13), Google Workspace integration (v1.51), Cognitive Tools for local LLM extraction (v1.8), and a Messaging Gateway that lets you talk to Claudia from your phone (v1.9.4).

## Why It's Worth Trying

Claudia solves a real problem. The people, promises, and priorities in your professional life are scattered across email, chat, notes, and your own head. Claudia pulls them into one place and keeps them current.

It is open source under the [PolyForm Noncommercial](https://polyformproject.org/licenses/noncommercial/1.0.0/) license, actively maintained, and the community is welcoming. I contributed seven improvements to the installer recently and all of them were merged the same day. The v1.55.21 "Community Release" cleared the entire GitHub backlog: 13 issues closed, 7 PRs merged, zero open.

If you use Claude Code already, Claudia is worth a look.

Baamaapii
