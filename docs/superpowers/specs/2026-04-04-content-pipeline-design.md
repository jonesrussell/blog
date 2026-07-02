# Content Pipeline Design

**Date:** 2026-04-04
**Status:** Approved
**Approach:** Skill-driven with scheduled GitHub Actions for mining

## Overview

A content pipeline that watches Russell's work, surfaces publishable material, and handles production and distribution with minimal manual intervention. Built as Claude Code skills and GitHub Actions first, designed for extraction into Claudriel as product features.

## Design Principles

- **Mine → Surface → Curate → Produce → Distribute**
- Curation is the only required human step (assisted)
- Everything else trends toward full automation
- Each piece is a future Claudriel feature for all users
- jonesrussell/jonesrussell hosts the content queue as GitHub issues until Claudriel replaces it

## Phasing

| Phase | Focus | Human involvement |
|-------|-------|-------------------|
| 0 | Codify today's manual workflow as repeatable checklists | High |
| 1 | Claude Code mines git activity, drafts content, automates Buffer/YouTube metadata | Curation + approve |
| 2 | Content ideas surfaced automatically, blog triggers social, video scripts generated | Curation only |
| 3 | Self-refining: tracks performance, adjusts tone/format, Giiken feeds content engine | Approve/reject/edit |

## Section 1: The Content Queue

The queue is the heart of the system. Everything upstream feeds it, everything downstream reads from it.

**Format:** One GitHub issue per content idea in jonesrussell/jonesrussell with a `content-queue` label.

**Issue structure:**

```markdown
## Source
<!-- What triggered this: commit, milestone, session, manual idea -->

## Content Seed
<!-- Raw material: diff summary, issue body, brainstorm notes -->

## Type
<!-- text-post | blog-post | video | newsletter -->

## Channels
<!-- linkedin, facebook, bluesky, youtube, substack, devto, blog -->

## Generated Artifacts
<!-- Added during production: draft copy, script, video file, etc. -->
```

**Stage tracking via labels:**
- `stage:mined` — surfaced by the miner, awaiting curation
- `stage:curated` — approved by human, type and channels locked
- `stage:in_production` — content being generated
- `stage:ready` — content generated, awaiting distribution
- `stage:distributed` — posted to all channels, issue closed

## Section 2: The Mining Layer

The miner watches work activity and creates content queue issues when something is worth talking about.

**Sources:**
- Git commits across repos (meaningful features, not typo fixes)
- GitHub issues/milestones being closed or reaching thresholds
- Design specs and brainstorming sessions (docs/superpowers/specs/ files)
- Blog posts published

**Execution:**
- **GitHub Action on a daily schedule** scans activity across repos since the last run
- Filters noise (merge commits, dependency bumps, CI fixes) using simple heuristics
- For each surfaceable item, opens a content queue issue labeled `stage:mined` with suggested type and raw source material
- **Manual invocation:** A Claude Code mining skill can be run on demand ("what have I done this week that's worth posting about?")

**Boundaries:**
- Does NOT decide what's worth posting (that's curation)
- Does NOT generate final copy (that's production)
- Does NOT post anything (that's distribution)
- Over-surfaces rather than under-surfaces

## Section 3: Curation

Curation is human-assisted. A curation skill presents mined items as a batch for quick decisions.

**For each item, the skill:**
- Summarizes what the item is and why it was surfaced
- Suggests content types (e.g. "this milestone close would make a good thread + blog post")
- Recommends channels based on content type
- Asks: keep, skip, merge, or edit?

**Actions:**
- **Approve** — moves to `stage:curated`, locks in type and channels
- **Skip** — closes the issue with a `skipped` label
- **Merge** — combines multiple mined items into one content piece
- **Edit** — adjusts seed material, adds notes, changes suggested type

**Invocation:**
- Manual: `/curate` or "what's in my content queue?"
- Optionally surfaced in daily morning brief

**Future (Phase 3):** Skip/approve patterns become training signal for pre-ranking items.

## Section 4: Production

Production takes a curated item and generates the actual content. Workflow differs by content type.

### Text Posts

1. Production skill reads the curated issue and seed material
2. Generates platform-specific copy using brand voice from `~/brand/identity.md`
3. Produces variants per channel (short for X, longer for LinkedIn/Facebook)
4. Writes drafts back into the issue body under Generated Artifacts
5. Moves issue to `stage:ready`

### Blog Posts

1. Generates a draft post in Hugo format
2. Opens a PR in ~/dev/blog/ with the draft
3. Links the PR in the content queue issue
4. Issue stays at `stage:in_production` until PR is merged
5. After merge, moves to `stage:ready`
6. Existing Hugo → Dev.to sync handles cross-posting automatically

### Video

Video production has a shrinking manual core that reduces with each phase.

**Phase 0 (current):**
- Skill generates script from seed material
- Human records audio or uses ElevenLabs
- Human runs HeyGen + editing (CapCut)
- Skill generates YouTube title/description
- Human uploads to YouTube
- Skill pushes to Buffer

**Phase 1 (with ElevenLabs subscription):**
- Skill generates script
- Skill calls ElevenLabs API for audio
- Skill uploads to HeyGen API for avatar video
- Skill downloads result
- Human adds overlays if needed
- Skill handles YouTube upload + Buffer

**Phase 2 (eliminate CapCut):**
- Research programmatic editing: HeyGen built-in editing, FFmpeg for overlays, Remotion (React-based video generation)
- Goal: assemble coding tutorials from screen recordings + avatar clips without manual editing software

## Section 5: Distribution

Distribution takes a `stage:ready` item and delivers it to the appropriate channels.

**Flow:**
1. Distribution skill reads the issue for generated artifacts and target channels
2. Executes per-channel delivery
3. Moves issue to `stage:distributed`
4. Adds a comment with links to live posts
5. Closes the issue

**Per-channel methods:**

| Channel | Method |
|---------|--------|
| LinkedIn, Facebook, Bluesky | Buffer GraphQL API (`createPost` mutation, one call per channel) |
| Dev.to | Automatic via existing Hugo → devto-sync |
| Substack | Newsletter skill drafts; human approves send |
| YouTube | Manual upload with generated metadata until API integration; then draft-then-approve |
| Blog | Handled during production (PR merge triggers deploy) |

**Safety rules:**
- Buffer posts: fully automated (already curated)
- Substack newsletters: always draft-then-approve (higher stakes)
- YouTube uploads: manual until API integration, then draft-then-approve
- Nothing ever posts without having passed through curation

## Video Pipeline Details

**Current tooling:**
- **Voice:** ElevenLabs subscription planned for AI voice clone (replaces manual audio recording)
- **Avatar:** HeyGen for talking-head videos
- **Recording:** OBS for coding tutorials (face-in-corner + desktop)
- **Editing:** CapCut (to be eliminated)

**Video types:**
- Talking head (simple, like the relaunch video) — HeyGen avatar
- Coding tutorials (more common going forward) — OBS multi-clip assembly with overlays

## Extraction Path to Claudriel

Each component is designed with clean boundaries for eventual extraction:

| Component | Current form | Claudriel feature |
|-----------|-------------|-------------------|
| Content queue | GitHub issues | Native queue with UI |
| Miner | GitHub Action + skill | Background worker per user |
| Curation | Claude Code skill | In-app curation interface |
| Production | Claude Code skill | API-driven content generation |
| Distribution | Playwright MCP + skills | Native platform integrations |

The pipeline validates workflows as personal tooling first. Once stable, components are extracted into Claudriel services with multi-tenant support.

## Buffer API Reference

Buffer uses a **GraphQL API** at `https://api.buffer.com`. No Playwright browser automation needed.

**Auth:** `Authorization: Bearer <API_KEY>` (key stored in Ansible vault as `vault_buffer_api_key`)

**Creating a post:**
```graphql
mutation {
  createPost(input: {
    channelId: "<channel_id>"
    text: "Post content here"
    mode: shareNow          # or: addToQueue, shareNext, customScheduled
    schedulingType: automatic
    # dueAt: "2026-04-05T14:00:00Z"  # only for customScheduled
    # saveToDraft: true               # save as draft instead of posting
  }) {
    post { id status text externalLink }
  }
}
```

**Key details:**
- One `createPost` call per channel (channelId is singular, not an array)
- Per-channel text customization is natural: different text in each call
- `mode: shareNow` publishes immediately
- `mode: customScheduled` + `dueAt` for scheduled posts
- `saveToDraft: true` saves without publishing
- Channel IDs can be fetched via the `channels` query

**Buffer channels (current):**
- Facebook: Fullstackdev42
- LinkedIn: Russell Jones
- Bluesky: @jonesrussell.bsky.social

X/Twitter was disconnected 2026-05-18 and is no longer a distribution target.

## Changelog

- **2026-07-01:** Removed X/Twitter from Buffer channels (disconnected 2026-05-18); added Bluesky as active distribution channel. Updated channels table in Section 5 and Buffer API Reference accordingly.

## Open Questions

- Exact heuristics for mining noise filtering (will emerge from use)
- CapCut replacement: needs research into FFmpeg, Remotion, HeyGen editing capabilities
- YouTube API integration: feasibility and quota limits
- Substack API or manual workflow for newsletter distribution
- How Giiken feeds the content engine once the knowledge system is ready (Phase 3)
