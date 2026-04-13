# Content Queue Audit & Refinement

**Date:** 2026-04-13
**Status:** Draft
**Scope:** One-time triage + ongoing queue health improvements

---

## Overview

The content queue (GitHub Issues in `jonesrussell/jonesrussell` with `content-queue` label) has grown to ~66 issues with mixed concerns: content ideas, scheduled social posts, infrastructure tasks, and blog audits. Mining produces one issue per qualifying commit, resulting in high volume and low signal. Nothing has moved past `stage:mined`. This spec addresses both the immediate cleanup and the structural changes to prevent recurrence.

### Goals

1. Reduce the queue to focused, curate-ready content seeds
2. Separate content ideas from infrastructure and scheduling concerns
3. Make mining smarter: group by theme, score by confidence, filter noise
4. Add automatic hygiene so the queue stays healthy without manual intervention
5. Adjust the curate skill to handle grouped seeds

### Non-Goals

- Replacing GitHub Issues as the queue backend (that's Approach C territory)
- Implementing Spec-Kitty schema validation (M1 scope, layers on top of this work)
- Changing the produce or distribute stages (downstream is unaffected)

---

## Part 1: One-Time Triage

### Close as Noise

- **Scheduled social posts** (~39 issues with date/time/platform formatting like `[x] 2026-04-19 15:00`). Buffer owns scheduling now; these are orphaned execution items.
- **Vague/stale items** with no actionable detail, source reference, or outline.

### Relabel Out of Content Queue

- **Infrastructure tasks** (cover images, Buffer integration, form setup, etc.) get relabeled `backlog` and lose the `content-queue` label. Real work, wrong queue.
- **Blog audit issues** (#2-9, scoped by series) get relabeled `blog-audit`, remove `content-queue`.

### Group and Keep

- Related mined items from the same area of work (e.g., 12 Waaseyaa provider commits) get merged into single themed issues. Original issues closed with a cross-reference to the grouped replacement.
- Genuine standalone content ideas stay as-is.

### Expected Outcome

Queue drops from ~66 issues to roughly 8-12 focused, curate-ready items.

---

## Part 2: Smarter Mining

### Commit Grouping by Theme

The mining script (`scripts/mine-git-activity.sh`) changes from one-issue-per-commit to grouped seeds:

1. Collect all qualifying commits across all watched repos over the lookback window (default 7 days)
2. Group commits by **repo + first two path segments** of the most-changed file in each commit (e.g., commits primarily touching files under `src/Providers/` in the `waaseyaa/framework` repo form one group). Commits that only touch root-level files (no directory) group by repo alone.
3. Each group becomes one seed issue. The title is generated as `"{Repo}: {directory segment} work"` (e.g., "waaseyaa/framework: Providers work"). The curate skill is where titles get editorial polish, not the miner.

**Example:** 12 commits primarily touching `src/Providers/` in `waaseyaa/framework` produce one issue titled "waaseyaa/framework: Providers work" with all commit SHAs listed in the body.

### Confidence Scoring

Each group receives a confidence score (0.0-1.0) computed from:

| Signal | Weight | Logic |
|--------|--------|-------|
| Commit count | 0.25 | More commits = more substantial work. Normalized: 1 commit = 0.2, 3+ = 0.6, 5+ = 1.0 |
| Files changed | 0.25 | Total unique files across the group. Normalized: 1-2 = 0.3, 3-5 = 0.6, 6+ = 1.0 |
| Message quality | 0.30 | Average message length in the group. < 20 chars = 0.2, 20-50 = 0.5, 50+ = 1.0 |
| Tests present | 0.20 | Whether any commit in the group touches test files. Yes = 1.0, No = 0.0 |

**Threshold:** Groups scoring below 0.3 are not created as issues. Threshold is configurable via workflow input (default: 0.3).

### Improved Deduplication

Replace exact title substring match with **source ref matching**: before creating an issue, check whether any commit SHA in the group already appears in the body of an existing `content-queue` issue. If all SHAs are already represented, skip the group.

### Issue Body Format

Compatible with the existing `mined-seed` schema:

```markdown
## Source
**Repos:** {repo list}
**Commits:** {SHA1}, {SHA2}, ... {SHAN}
**Date range:** {earliest} to {latest}
**Confidence:** {score}

## Content Seed
{Synthesized summary of the grouped work}

## Suggested
- **Type:** text-post
- **Channels:** x, linkedin, facebook
```

The `source_ref` field becomes an array of commit SHAs for grouped seeds. All other fields remain the same.

---

## Part 3: Auto-Expiry and Queue Hygiene

### Stale Item Cleanup

A new GitHub Action (`content-queue-hygiene.yml`) runs weekly:

- Finds all `stage:mined` issues older than 14 days with no activity
- Closes them with a comment: "Auto-closed: not curated within 14 days. Reopen if still relevant."
- Adds label `auto-expired` for tracking

**Exemptions:** Issues at `stage:curated` or later are never auto-closed. Conscious curation decisions don't expire.

### Why 14 Days

Two weekly curation cycles is enough time. If an item hasn't caught attention by then, the commit history preserves the source material if you change your mind later.

### Label Hygiene

Enforce clean label separation going forward:

| Label | Purpose |
|-------|---------|
| `content-queue` + `stage:*` | Content pipeline items only |
| `backlog` | Infrastructure and tooling work |
| `blog-audit` | Content review tasks |
| `auto-expired` | Items closed by hygiene action |
| `curate:skipped` | Items intentionally skipped during curation |

---

## Part 4: Curate Skill Adjustments

### Batch Presentation

When `/curate` runs, the skill fetches all `stage:mined` issues sorted by confidence score (highest first). For each item it shows:

- Theme title
- Confidence score
- Number of source commits and repos
- Content seed summary

### Decision Options

| Action | Effect |
|--------|--------|
| **Approve** | Move to `stage:curated`, lock type and channels |
| **Skip** | Close immediately with `curate:skipped` label |
| **Merge** | Combine two or more grouped seeds into one curated item. Resulting issue gets `merge_sources` listing all original source refs |
| **Edit** | Modify title, seed text, type, or channels before approving |

### Key Change: Skip = Close

Previously, skipping left items in the queue. Now skipping closes the issue immediately with the `curate:skipped` label, distinguishing intentional skips from auto-expiry.

### Downstream Unchanged

A curated item is a curated item regardless of whether it came from one commit or twelve. The produce, distribute, and monitor stages require no changes.

---

## Compatibility with Spec-Kitty

This work is forward-compatible with the M1 schema contracts:

- The grouped seed body format aligns with `mined-seed.json` (source_ref becomes an array, confidence is already an optional field in the schema)
- The hygiene action uses labels, not schema validation, so it doesn't conflict with future validation gates
- When M1 lands, the validator can be wired into the mining script and curate skill as an additional check without changing the grouping or scoring logic

---

## Files Changed

| File | Change |
|------|--------|
| `scripts/mine-git-activity.sh` | Rewrite: grouping, scoring, array source refs, improved dedup |
| `.github/workflows/content-mine.yml` | Add confidence threshold input, update to call revised script |
| `.github/workflows/content-queue-hygiene.yml` | New: weekly stale issue cleanup |
| Content-curate skill | Update: sort by confidence, skip-closes, handle grouped seeds |

---

## Open Questions

None. Design is self-contained and forward-compatible.
