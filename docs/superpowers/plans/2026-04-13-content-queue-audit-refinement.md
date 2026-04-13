# Content Queue Audit & Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the content queue (66 mixed-concern issues), then make mining smarter and self-maintaining so the queue stays healthy.

**Architecture:** One-time triage via `gh` CLI, then rewrite `scripts/mine-git-activity.sh` to group commits by theme and score by confidence, add a weekly hygiene GitHub Action, and update the content-curate skill to handle grouped seeds.

**Tech Stack:** Bash (mining script), GitHub Actions (workflows), Node.js (schema validation), GitHub CLI (`gh`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/mine-git-activity.sh` | Rewrite | Commit grouping, confidence scoring, array source refs, improved dedup |
| `scripts/triage-content-queue.sh` | Create | One-time triage: close noise, relabel infra/audit, report results |
| `.github/workflows/content-mine.yml` | Modify | Add `confidence_threshold` input, call revised mining script |
| `.github/workflows/content-queue-hygiene.yml` | Create | Weekly auto-close of stale `stage:mined` issues |
| `schemas/mined-seed.json` | Modify | Allow `source_ref` as string or array, add `confidence` as required |
| Content-curate skill (`/home/jones/dev/skills/skills/content-curate/SKILL.md`) | Modify | Sort by confidence, skip-closes, handle grouped seeds |

---

### Task 1: One-Time Triage Script

**Files:**
- Create: `scripts/triage-content-queue.sh`

This script runs once to clean up the existing queue. It's a throwaway tool, but scripting it means we can review what it will do before it acts.

- [ ] **Step 1: Create the triage script**

```bash
#!/usr/bin/env bash
set -euo pipefail

# triage-content-queue.sh
# One-time cleanup of the content queue.
# Run with --dry-run first to review actions.
#
# Usage: ./scripts/triage-content-queue.sh [--dry-run]

QUEUE_REPO="jonesrussell/blog"
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN MODE ==="
fi

CLOSED_COUNT=0
RELABELED_COUNT=0

echo "Fetching all content-queue issues..."
ISSUES=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --limit 100 --json number,title,labels,createdAt,updatedAt)

TOTAL=$(echo "$ISSUES" | jq 'length')
echo "Found ${TOTAL} content-queue issues"

echo ""
echo "--- Phase 1: Close scheduled social posts ---"
# These have date/time patterns like [x] 2026-04-19 15:00 or [linkedin] 2026-04-15
echo "$ISSUES" | jq -c '.[] | select(.title | test("\\[(?:x|linkedin|facebook|twitter)\\].*\\d{4}-\\d{2}-\\d{2}"; "i"))' | while read -r issue; do
  NUM=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  echo "  Close #${NUM}: ${TITLE}"
  if [[ "$DRY_RUN" == false ]]; then
    gh issue close "$NUM" --repo "$QUEUE_REPO" --comment "Closed during content queue triage: scheduled social post. Buffer handles scheduling now."
  fi
  CLOSED_COUNT=$((CLOSED_COUNT + 1))
done

echo ""
echo "--- Phase 2: Close vague/stale items ---"
# Items with very short bodies or no body, older than 14 days, still stage:mined
FOURTEEN_DAYS_AGO=$(date -u -d "14 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-14d +%Y-%m-%dT%H:%M:%SZ)
echo "$ISSUES" | jq -c --arg cutoff "$FOURTEEN_DAYS_AGO" '.[] | select(.updatedAt < $cutoff) | select(.labels | map(.name) | index("stage:mined"))' | while read -r issue; do
  NUM=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  # Check if body is too short to be actionable
  BODY_LEN=$(gh issue view "$NUM" --repo "$QUEUE_REPO" --json body --jq '.body | length')
  if [[ "$BODY_LEN" -lt 50 ]]; then
    echo "  Close #${NUM} (vague/stale): ${TITLE}"
    if [[ "$DRY_RUN" == false ]]; then
      gh issue close "$NUM" --repo "$QUEUE_REPO" --comment "Closed during content queue triage: insufficient detail and stale."
    fi
    CLOSED_COUNT=$((CLOSED_COUNT + 1))
  fi
done

echo ""
echo "--- Phase 3: Relabel infrastructure issues ---"
# Issues about tooling, setup, integration (not content ideas)
echo "$ISSUES" | jq -c '.[] | select(.title | test("(cover image|buffer|favicon|og image|deploy|setup|integration|workflow|sync|schema|validator)"; "i"))' | while read -r issue; do
  NUM=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  echo "  Relabel #${NUM} to backlog: ${TITLE}"
  if [[ "$DRY_RUN" == false ]]; then
    gh issue edit "$NUM" --repo "$QUEUE_REPO" --add-label "backlog" --remove-label "content-queue"
  fi
  RELABELED_COUNT=$((RELABELED_COUNT + 1))
done

echo ""
echo "--- Phase 4: Relabel blog audit issues ---"
echo "$ISSUES" | jq -c '.[] | select(.title | test("(audit|review posts|refresh.*draft)"; "i"))' | while read -r issue; do
  NUM=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  echo "  Relabel #${NUM} to blog-audit: ${TITLE}"
  if [[ "$DRY_RUN" == false ]]; then
    gh issue edit "$NUM" --repo "$QUEUE_REPO" --add-label "blog-audit" --remove-label "content-queue"
  fi
  RELABELED_COUNT=$((RELABELED_COUNT + 1))
done

echo ""
echo "=== Triage complete ==="
echo "Closed: ${CLOSED_COUNT}"
echo "Relabeled: ${RELABELED_COUNT}"
echo ""
echo "Remaining content-queue items:"
gh issue list --repo "$QUEUE_REPO" --label "content-queue" --limit 50 --json number,title --jq '.[] | "#\(.number): \(.title)"'
```

- [ ] **Step 2: Run with --dry-run to review**

Run: `bash scripts/triage-content-queue.sh --dry-run`
Expected: Lists all issues that would be closed or relabeled, without making changes. Review the output to confirm the regex patterns are catching the right issues.

- [ ] **Step 3: Run for real**

Run: `bash scripts/triage-content-queue.sh`
Expected: Issues closed/relabeled, final report shows remaining content-queue items (target: 8-12).

- [ ] **Step 4: Manual grouping pass**

After the script runs, review the remaining `stage:mined` items. For any cluster of related items (e.g., multiple Waaseyaa provider commits), manually create a grouped issue and close the originals:

```bash
# Example: group related Waaseyaa provider commits
gh issue create --repo jonesrussell/blog \
  --label "content-queue,stage:mined,type:text-post" \
  --title "[content] Waaseyaa: Service provider system build-out" \
  --body "## Source

**Repos:** waaseyaa/framework
**Commits:** abc1234, def5678, ghi9012 (list actual SHAs)
**Date range:** 2026-04-07 to 2026-04-13
**Confidence:** 0.8

## Content Seed

Built out the service provider architecture in the Waaseyaa framework, including (describe the grouped work).

## Suggested

- **Type:** text-post
- **Channels:** x, linkedin, facebook"

# Then close the originals referencing the new issue
gh issue close 240 241 242 --repo jonesrussell/blog --comment "Grouped into #NEW_ISSUE_NUMBER"
```

- [ ] **Step 5: Commit the triage script**

```bash
git add scripts/triage-content-queue.sh
git commit -m "feat: add one-time content queue triage script"
```

---

### Task 2: Update mined-seed Schema

**Files:**
- Modify: `schemas/mined-seed.json`
- Modify: `schemas/validate.test.js` (if fixtures need updating)
- Create: `schemas/fixtures/valid/mined-seed-grouped.json`

The schema needs to accept `source_ref` as either a string (single commit) or an array (grouped commits), and make `confidence` required.

- [ ] **Step 1: Read current schema**

Run: `cat schemas/mined-seed.json`
Verify the current `source_ref` is type `string` and `confidence` is not in `required`.

- [ ] **Step 2: Update the schema**

In `schemas/mined-seed.json`, change `source_ref` from:
```json
"source_ref": {
  "type": "string",
  "description": "Commit SHA, issue URL, file path, or article ID"
}
```
to:
```json
"source_ref": {
  "oneOf": [
    { "type": "string", "description": "Single commit URL or reference" },
    {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "description": "Array of commit URLs for grouped seeds"
    }
  ],
  "description": "Commit SHA(s), issue URL, file path, or article ID"
}
```

Add `"confidence"` to the `required` array.

- [ ] **Step 3: Add a grouped seed fixture**

Create `schemas/fixtures/valid/mined-seed-grouped.json`:
```json
{
  "source": "git-commit",
  "source_ref": [
    "https://github.com/waaseyaa/framework/commit/abc1234",
    "https://github.com/waaseyaa/framework/commit/def5678",
    "https://github.com/waaseyaa/framework/commit/ghi9012"
  ],
  "content_seed": "Waaseyaa: Service provider system build-out",
  "suggested_type": "text-post",
  "suggested_channels": ["x", "linkedin", "facebook"],
  "mined_at": "2026-04-13T11:00:00Z",
  "confidence": 0.75
}
```

- [ ] **Step 4: Run validator tests**

Run: `node schemas/validate.js mined-seed schemas/fixtures/valid/mined-seed-grouped.json`
Expected: Validation passes.

Run: `node schemas/validate.js mined-seed schemas/fixtures/valid/mined-seed.json`
Expected: Still passes (backward compatible, but will need `confidence` added to the existing fixture).

If the existing fixture fails because `confidence` is now required, add `"confidence": 0.5` to it.

- [ ] **Step 5: Run full test suite if it exists**

Run: `cd schemas && npm test 2>/dev/null || node validate.test.js`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add schemas/mined-seed.json schemas/fixtures/valid/mined-seed-grouped.json
git add -u schemas/  # catch any fixture updates
git commit -m "feat: update mined-seed schema for grouped commits and required confidence"
```

---

### Task 3: Rewrite Mining Script

**Files:**
- Rewrite: `scripts/mine-git-activity.sh`

This is the core change. The script needs to collect commits, group them by repo + directory, score each group, and create one issue per group.

- [ ] **Step 1: Replace the mining script**

Write the new `scripts/mine-git-activity.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# mine-git-activity.sh
# Scans configured repos for recent git activity, groups commits by theme,
# scores each group, and creates content queue issues for qualifying groups.
#
# Usage: ./scripts/mine-git-activity.sh [days] [confidence_threshold]
# Default: 7 days lookback, 0.3 confidence threshold

DAYS="${1:-7}"
THRESHOLD="${2:-0.3}"
SINCE_DATE=$(date -u -d "${DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-${DAYS}d +%Y-%m-%dT%H:%M:%SZ)
QUEUE_REPO="jonesrussell/blog"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VALIDATOR="node ${SCRIPT_DIR}/../schemas/validate.js"
REPOS=("waaseyaa/framework" "waaseyaa/giiken" "jonesrussell/blog" "jonesrussell/jonesrussell")

MINED_COUNT=0
SKIPPED_COUNT=0
FILTERED_COUNT=0

echo "Mining git activity since ${SINCE_DATE} (${DAYS} days, threshold: ${THRESHOLD})"

# Fetch existing queue issue bodies to check for commit SHA dedup
EXISTING_BODIES=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --json body --jq '.[].body' --limit 200)

# Temp directory for grouping
WORK_DIR=$(mktemp -d /tmp/mine-groups-XXXXXX)
trap 'rm -rf "$WORK_DIR"' EXIT

# Phase 1: Collect all qualifying commits with file paths
for repo in "${REPOS[@]}"; do
  echo "--- Scanning ${repo} ---"

  COMMITS=$(gh api "repos/${repo}/commits?since=${SINCE_DATE}&per_page=50" \
    --jq '.[] | select(.commit.message | test("^(Merge |bump |chore\\(deps\\)|ci:|fix typo|formatting)"; "i") | not) | {sha: .sha[0:7], full_sha: .sha, message: .commit.message, date: .commit.author.date}' \
    2>/dev/null || echo "")

  if [[ -z "$COMMITS" ]]; then
    echo "  No qualifying commits found."
    continue
  fi

  while read -r commit_json; do
    SHA=$(echo "$commit_json" | jq -r '.sha')
    FULL_SHA=$(echo "$commit_json" | jq -r '.full_sha')
    MESSAGE=$(echo "$commit_json" | jq -r '.message' | head -1)
    COMMIT_DATE=$(echo "$commit_json" | jq -r '.date')

    # Skip short messages
    if [[ ${#MESSAGE} -lt 10 ]]; then
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      continue
    fi

    # Skip if this SHA is already in an existing issue body
    if echo "$EXISTING_BODIES" | grep -qF "$SHA"; then
      echo "  Skipping (SHA already queued): ${SHA} ${MESSAGE}"
      continue
    fi

    # Get files changed in this commit for grouping
    FILES_CHANGED=$(gh api "repos/${repo}/commits/${FULL_SHA}" \
      --jq '[.files[].filename] | join("\n")' 2>/dev/null || echo "")

    # Determine group key: repo + first two path segments of most-changed file
    if [[ -n "$FILES_CHANGED" ]]; then
      # Pick the most common top-level directory
      GROUP_DIR=$(echo "$FILES_CHANGED" | awk -F'/' '{if(NF>=2) print $1"/"$2; else print $1}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
    else
      GROUP_DIR="_root"
    fi
    GROUP_KEY="${repo}/${GROUP_DIR}"

    # Sanitize group key for filename
    SAFE_KEY=$(echo "$GROUP_KEY" | tr '/' '_')
    GROUP_FILE="${WORK_DIR}/${SAFE_KEY}.jsonl"

    # Count files for scoring
    FILE_COUNT=$(echo "$FILES_CHANGED" | wc -l)
    HAS_TESTS=false
    if echo "$FILES_CHANGED" | grep -qiE "(test|spec)"; then
      HAS_TESTS=true
    fi

    # Append commit to group
    jq -n --arg sha "$SHA" --arg full_sha "$FULL_SHA" --arg msg "$MESSAGE" \
      --arg date "$COMMIT_DATE" --arg repo "$repo" --arg group "$GROUP_KEY" \
      --argjson file_count "$FILE_COUNT" --argjson has_tests "$HAS_TESTS" \
      --argjson msg_len "${#MESSAGE}" \
      '{sha: $sha, full_sha: $full_sha, message: $msg, date: $date, repo: $repo, group: $group, file_count: $file_count, has_tests: $has_tests, msg_len: $msg_len}' \
      >> "$GROUP_FILE"

  done < <(echo "$COMMITS" | jq -c '.')
done

# Phase 2: Score each group and create issues
echo ""
echo "--- Scoring and creating issues ---"

for group_file in "$WORK_DIR"/*.jsonl; do
  [[ -f "$group_file" ]] || continue

  COMMIT_COUNT=$(wc -l < "$group_file")
  GROUP_KEY=$(jq -r '.group' "$group_file" | head -1)
  REPO=$(jq -r '.repo' "$group_file" | head -1)

  # Compute confidence score
  # Commit count signal (weight 0.25): 1=0.2, 3+=0.6, 5+=1.0
  if [[ "$COMMIT_COUNT" -ge 5 ]]; then CC_SCORE="1.0"
  elif [[ "$COMMIT_COUNT" -ge 3 ]]; then CC_SCORE="0.6"
  else CC_SCORE="0.2"; fi

  # Files changed signal (weight 0.25): sum unique files
  TOTAL_FILES=$(jq -r '.file_count' "$group_file" | paste -sd+ | bc)
  if [[ "$TOTAL_FILES" -ge 6 ]]; then FC_SCORE="1.0"
  elif [[ "$TOTAL_FILES" -ge 3 ]]; then FC_SCORE="0.6"
  else FC_SCORE="0.3"; fi

  # Message quality signal (weight 0.30): average length
  AVG_MSG_LEN=$(jq -r '.msg_len' "$group_file" | awk '{s+=$1} END {printf "%.0f", s/NR}')
  if [[ "$AVG_MSG_LEN" -ge 50 ]]; then MQ_SCORE="1.0"
  elif [[ "$AVG_MSG_LEN" -ge 20 ]]; then MQ_SCORE="0.5"
  else MQ_SCORE="0.2"; fi

  # Tests present signal (weight 0.20)
  if jq -r '.has_tests' "$group_file" | grep -q "true"; then TP_SCORE="1.0"
  else TP_SCORE="0.0"; fi

  # Weighted total
  CONFIDENCE=$(echo "scale=2; 0.25 * $CC_SCORE + 0.25 * $FC_SCORE + 0.30 * $MQ_SCORE + 0.20 * $TP_SCORE" | bc)

  echo "  Group: ${GROUP_KEY} (${COMMIT_COUNT} commits, confidence: ${CONFIDENCE})"

  # Filter by threshold
  PASSES=$(echo "$CONFIDENCE >= $THRESHOLD" | bc -l)
  if [[ "$PASSES" -eq 0 ]]; then
    echo "    ✗ Below threshold (${CONFIDENCE} < ${THRESHOLD}), skipping"
    FILTERED_COUNT=$((FILTERED_COUNT + 1))
    continue
  fi

  # Build commit list and date range
  SHAS=$(jq -r '"https://github.com/" + .repo + "/commit/" + .full_sha' "$group_file" | paste -sd', ')
  SHA_ARRAY=$(jq -r '"https://github.com/" + .repo + "/commit/" + .full_sha' "$group_file" | jq -Rs 'split("\n") | map(select(length > 0))')
  EARLIEST_DATE=$(jq -r '.date' "$group_file" | sort | head -1)
  LATEST_DATE=$(jq -r '.date' "$group_file" | sort | tail -1)
  MESSAGES=$(jq -r '.message' "$group_file" | sort -u)

  # Extract directory name for title
  DIR_NAME=$(echo "$GROUP_KEY" | awk -F'/' '{print $NF}')
  TITLE="[content] ${REPO}: ${DIR_NAME} work"

  # Synthesize content seed from unique commit messages
  SEED_TEXT=$(echo "$MESSAGES" | head -5 | sed 's/^/- /')
  if [[ "$COMMIT_COUNT" -gt 5 ]]; then
    SEED_TEXT="${SEED_TEXT}
- ... and $((COMMIT_COUNT - 5)) more commits"
  fi

  # Build and validate seed JSON
  SEED_FILE=$(mktemp /tmp/mined-seed-XXXXXX.json)
  cat > "$SEED_FILE" << SEED
{
  "source": "git-commit",
  "source_ref": ${SHA_ARRAY},
  "content_seed": $(echo "$SEED_TEXT" | jq -Rs .),
  "suggested_type": "text-post",
  "suggested_channels": ["x", "linkedin", "facebook"],
  "mined_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "confidence": ${CONFIDENCE}
}
SEED

  if $VALIDATOR mined-seed "$SEED_FILE" > /dev/null 2>&1; then
    ISSUE_BODY="## Source

**Repos:** ${REPO}
**Commits:** ${SHAS}
**Date range:** ${EARLIEST_DATE} to ${LATEST_DATE}
**Confidence:** ${CONFIDENCE}

## Content Seed

${SEED_TEXT}

## Suggested

- **Type:** text-post
- **Channels:** x, linkedin, facebook"

    gh issue create --repo "$QUEUE_REPO" \
      --label "content-queue,stage:mined,type:text-post" \
      --title "${TITLE}" \
      --body "${ISSUE_BODY}" \
      > /dev/null

    echo "    ✓ Created: ${TITLE}"
    MINED_COUNT=$((MINED_COUNT + 1))
  else
    echo "    ✗ Validation failed, skipping"
    $VALIDATOR mined-seed "$SEED_FILE" 2>&1 || true
  fi

  rm -f "$SEED_FILE"
done

echo ""
echo "Mining complete: ${MINED_COUNT} issues created, ${SKIPPED_COUNT} trivial commits skipped, ${FILTERED_COUNT} groups below threshold"
```

- [ ] **Step 2: Make executable**

Run: `chmod +x scripts/mine-git-activity.sh`

- [ ] **Step 3: Test with dry inspection**

Run: `bash scripts/mine-git-activity.sh 3 0.3 2>&1 | head -50`

Review the output. Verify:
- Commits are being grouped (not one issue per commit)
- Confidence scores are computed and printed
- Groups below threshold are skipped
- No duplicate issues created for already-queued SHAs

Note: This will create real issues. If you want to test without side effects, temporarily change `QUEUE_REPO` to a test repo, or comment out the `gh issue create` line and verify the logic from output alone.

- [ ] **Step 4: Commit**

```bash
git add scripts/mine-git-activity.sh
git commit -m "feat: rewrite miner with commit grouping, confidence scoring, and SHA dedup"
```

---

### Task 4: Update Content Mining Workflow

**Files:**
- Modify: `.github/workflows/content-mine.yml`

Add `confidence_threshold` as a workflow input and pass it to the script.

- [ ] **Step 1: Update the workflow**

Replace the contents of `.github/workflows/content-mine.yml` with:

```yaml
name: Content Mining

on:
  schedule:
    # Daily at 11:00 UTC (7:00 AM ET)
    - cron: '0 11 * * *'
  workflow_dispatch:
    inputs:
      days:
        description: 'Number of days to look back'
        required: false
        default: '7'
      confidence_threshold:
        description: 'Minimum confidence score (0.0-1.0) for creating issues'
        required: false
        default: '0.3'

permissions:
  contents: read
  issues: write

jobs:
  mine:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout blog repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run git activity mining
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          DAYS="${{ github.event.inputs.days || '7' }}"
          THRESHOLD="${{ github.event.inputs.confidence_threshold || '0.3' }}"
          bash scripts/mine-git-activity.sh "$DAYS" "$THRESHOLD"
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/content-mine.yml
git commit -m "feat: add confidence threshold input to mining workflow"
```

---

### Task 5: Create Queue Hygiene Workflow

**Files:**
- Create: `.github/workflows/content-queue-hygiene.yml`

Weekly action that auto-closes stale `stage:mined` issues.

- [ ] **Step 1: Create the workflow**

```yaml
name: Content Queue Hygiene

on:
  schedule:
    # Weekly on Mondays at 09:00 UTC (5:00 AM ET)
    - cron: '0 9 * * 1'
  workflow_dispatch: {}

permissions:
  issues: write

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Close stale mined issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          REPO="jonesrussell/blog"
          CUTOFF=$(date -u -d "14 days ago" +%Y-%m-%dT%H:%M:%SZ)
          CLOSED_COUNT=0

          echo "Finding stage:mined issues older than 14 days (before ${CUTOFF})..."

          # Fetch mined issues, filter by updated date
          STALE_ISSUES=$(gh issue list --repo "$REPO" \
            --label "content-queue,stage:mined" \
            --json number,title,updatedAt \
            --limit 100 \
            --jq ".[] | select(.updatedAt < \"${CUTOFF}\")")

          if [[ -z "$STALE_ISSUES" ]]; then
            echo "No stale issues found. Queue is healthy."
            exit 0
          fi

          echo "$STALE_ISSUES" | jq -c '.' | while read -r issue; do
            NUM=$(echo "$issue" | jq -r '.number')
            TITLE=$(echo "$issue" | jq -r '.title')
            echo "Closing #${NUM}: ${TITLE}"
            gh issue close "$NUM" --repo "$REPO" \
              --comment "Auto-closed: not curated within 14 days. Reopen if still relevant."
            gh issue edit "$NUM" --repo "$REPO" --add-label "auto-expired"
            CLOSED_COUNT=$((CLOSED_COUNT + 1))
          done

          echo ""
          echo "Hygiene complete: ${CLOSED_COUNT} stale issues closed"
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/content-queue-hygiene.yml
git commit -m "feat: add weekly content queue hygiene workflow"
```

---

### Task 6: Update Content-Curate Skill

**Files:**
- Modify: `/home/jones/dev/skills/skills/content-curate/SKILL.md`

The curate skill needs three changes: sort by confidence, handle grouped seeds (array source_ref), and make skip close the issue.

- [ ] **Step 1: Read current skill**

Run: `cat /home/jones/dev/skills/skills/content-curate/SKILL.md`
Identify the sections that handle: issue fetching, item presentation, and skip action.

- [ ] **Step 2: Update issue fetching to sort by confidence**

In the section that fetches `stage:mined` issues, add sorting. The skill should:
1. Fetch all `stage:mined` issues as before
2. Parse the `**Confidence:**` value from each issue body
3. Sort items by confidence descending (highest first)

Add to the skill instructions after the fetch step:
```markdown
**Sort mined items by confidence score** (highest first). Extract the confidence value from the `**Confidence:**` line in the issue body. Items without a confidence value sort last (legacy items from before grouping was implemented).
```

- [ ] **Step 3: Update item presentation for grouped seeds**

In the section that presents each item to the user, update to show grouped commit info:

```markdown
For each mined item, present:
- **Title** (from issue title)
- **Confidence:** {score} (from issue body)
- **Commits:** {count} commits from {repo list} (parse from **Commits:** line; count comma-separated entries)
- **Content seed** (from Content Seed section)

For items with multiple commits (grouped seeds), show the commit count rather than individual SHAs. The user does not need to see every SHA during curation.
```

- [ ] **Step 4: Update skip action to close the issue**

Find the skip action handling. Change from "leave as-is" to:

```markdown
**Skip:** Close the issue immediately. Add label `curate:skipped`. Comment: "Skipped during curation." This distinguishes intentional skips from auto-expiry (which uses the `auto-expired` label).
```

- [ ] **Step 5: Commit the skill changes**

```bash
cd /home/jones/dev/skills
git add skills/content-curate/SKILL.md
git commit -m "feat: update curate skill for grouped seeds, confidence sort, skip-closes"
```

---

### Task 7: Verify End-to-End

- [ ] **Step 1: Verify triage results**

Run: `gh issue list --repo jonesrussell/blog --label "content-queue" --limit 50 --json number,title,labels --jq '.[] | "#\(.number): \(.title) [\(.labels | map(.name) | join(", "))]"'`

Expected: 8-12 focused content items, all labeled `content-queue` + `stage:mined`. No social schedule posts, no infrastructure tasks, no blog audits.

- [ ] **Step 2: Verify schema accepts grouped seeds**

Run: `node schemas/validate.js mined-seed schemas/fixtures/valid/mined-seed-grouped.json`
Expected: Validation passes.

Run: `node schemas/validate.js mined-seed schemas/fixtures/valid/mined-seed.json`
Expected: Validation still passes (backward compatibility, single string source_ref).

- [ ] **Step 3: Verify mining script runs without errors**

Run: `bash scripts/mine-git-activity.sh 1 0.9`

Use a 1-day window and very high threshold (0.9) to minimize issue creation while testing the full flow. Verify:
- Output shows groups being formed
- Confidence scores are computed
- Most groups are filtered (below 0.9)
- No script errors

- [ ] **Step 4: Final commit (if any test-driven fixes were needed)**

```bash
git add -u
git commit -m "fix: adjustments from end-to-end verification"
```
