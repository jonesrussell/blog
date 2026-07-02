#!/usr/bin/env bash
set -euo pipefail

# mine-git-activity.sh
# Scans configured repos for recent git activity, groups commits by theme,
# scores by confidence, and creates content queue issues for qualifying groups.
# Called by .github/workflows/content-mine.yml
#
# Usage: ./scripts/mine-git-activity.sh [days] [confidence_threshold]
# Default: 7 days lookback, 0.3 confidence threshold
# Env: MAX_ISSUES_PER_RUN (default 12) caps issues created per run.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Accept lookback days via env var (CI) or positional arg (local); default 7.
DAYS="${LOOKBACK_DAYS:-${1:-7}}"
CONFIDENCE_THRESHOLD="${2:-0.3}"
# Cap issues created per run so a busy window can't dump dozens of low-value items.
# The cap keeps the highest-confidence groups; the rest are reported, not silently dropped.
MAX_ISSUES_PER_RUN="${MAX_ISSUES_PER_RUN:-12}"
# DRY_RUN=1 prints would-be issue titles instead of creating them (safe for local testing).
DRY_RUN="${DRY_RUN:-0}"
SINCE_DATE=$(date -u -d "${DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"${DAYS}"d +%Y-%m-%dT%H:%M:%SZ)
QUEUE_REPO="jonesrussell/jonesrussell"
VALIDATOR="node ${SCRIPT_DIR}/../schemas/validate.js"
REPOS=("waaseyaa/framework" "waaseyaa/giiken" "waaseyaa/minoo" "jonesrussell/rhtcircle" "jonesrussell/blog" "jonesrussell/jonesrussell")

MINED_COUNT=0
SKIPPED_COUNT=0
BELOW_THRESHOLD=0
DROPPED_CAP=0

# Create temp directory for intermediate files, clean up on exit
TMPDIR_WORK=$(mktemp -d /tmp/mine-git-XXXXXX)
trap 'rm -rf "${TMPDIR_WORK}"' EXIT

echo "Mining git activity since ${SINCE_DATE} (${DAYS} days, threshold=${CONFIDENCE_THRESHOLD}, cap=${MAX_ISSUES_PER_RUN})"

# Fetch existing issue bodies for SHA-based dedup
EXISTING_BODIES=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --json body --jq '.[].body' --limit 200 \
  2>/dev/null || { echo "WARN: failed to fetch existing issue bodies (rate-limited or permission denied)" >&2; echo ""; })

# Fetch titles of OPEN content-queue issues for title-similarity dedup (normalized: lowercased, whitespace-collapsed).
# SHA dedup misses the case where the same directory is mined again from different commits while a prior issue is still open.
_open_titles_raw=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --state open --json title --jq '.[].title' --limit 200 \
  2>/dev/null || { echo "WARN: failed to fetch open issue titles (rate-limited or permission denied)" >&2; echo ""; })
EXISTING_TITLES_NORM=$(echo "$_open_titles_raw" | tr '[:upper:]' '[:lower:]' | tr -s ' ' | sed 's/[[:space:]]*$//')

# Fetch titles of CLOSED content-queue issues (last 30 days) for extended dedup.
# ~150 issues bulk-closed with curate:skipped must not be re-created.
THIRTY_DAYS_AGO=$(date -u -d "30 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-30d +%Y-%m-%dT%H:%M:%SZ)
CLOSED_TITLES_RAW=$(gh issue list --repo "$QUEUE_REPO" --state closed --label "content-queue" --limit 200 --json title,closedAt \
  2>/dev/null || { echo "WARN: failed to fetch closed issue titles (rate-limited or permission denied)" >&2; echo "[]"; })
CLOSED_TITLES_NORM=$(echo "$CLOSED_TITLES_RAW" | jq -r --arg since "$THIRTY_DAYS_AGO" \
  '.[] | select(.closedAt >= $since) | .title' 2>/dev/null \
  | tr '[:upper:]' '[:lower:]' | tr -s ' ' | sed 's/[[:space:]]*$//')

# ── Phase 1: Collect commits and group by theme ──

for repo in "${REPOS[@]}"; do
  echo "--- Scanning ${repo} ---"

  # Fetch recent commits (compact JSON, one per line)
  COMMITS=$(gh api "repos/${repo}/commits?since=${SINCE_DATE}&per_page=50" \
    --jq '.[] | select(.commit.message | test("^(Merge |bump |chore\\(deps\\)|ci:|fix typo|formatting)"; "i") | not) | {sha: .sha, message: .commit.message, date: .commit.author.date}' \
    2>/dev/null || { echo "WARN: failed to fetch commits for ${repo} (rate-limited or permission denied)" >&2; echo ""; })

  if [[ -z "$COMMITS" ]]; then
    echo "  No qualifying commits found."
    continue
  fi

  while IFS= read -r commit_json; do
    [[ -z "$commit_json" ]] && continue

    SHA=$(echo "$commit_json" | jq -r '.sha')
    MESSAGE=$(echo "$commit_json" | jq -r '.message' | head -1)
    COMMIT_DATE=$(echo "$commit_json" | jq -r '.date')

    # Skip short messages
    if [[ ${#MESSAGE} -lt 10 ]]; then
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      continue
    fi

    # Fetch files changed for this commit
    FILES_JSON=$(gh api "repos/${repo}/commits/${SHA}" --jq '[.files[].filename]' \
      2>/dev/null || { echo "WARN: failed to fetch files for ${SHA} in ${repo} (rate-limited or permission denied)" >&2; echo "[]"; })

    # Determine the most common directory among changed files for grouping
    # Use frequency count rather than picking a single file
    MOST_CHANGED=$(echo "$FILES_JSON" | jq -r '.[]' | awk -F'/' '{if(NF>=2) print $1"/"$2; else print $1}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

    if [[ -z "$MOST_CHANGED" || "$MOST_CHANGED" == "null" ]]; then
      GROUP_KEY="${repo}"
    else
      # Extract first two path segments
      SEG_COUNT=$(echo "$MOST_CHANGED" | tr '/' '\n' | wc -l)
      if [[ "$SEG_COUNT" -le 1 ]]; then
        # Root-level file, group by repo alone
        GROUP_KEY="${repo}"
      else
        DIR_PART=$(echo "$MOST_CHANGED" | cut -d'/' -f1-2)
        GROUP_KEY="${repo}/${DIR_PART}"
      fi
    fi

    # Sanitize group key for use as filename
    GROUP_FILE="${TMPDIR_WORK}/$(echo "$GROUP_KEY" | tr '/' '_').jsonl"

    # Append commit data to the group file
    jq -c --arg repo "$repo" --arg files "$FILES_JSON" \
      '. + {repo: $repo, files: ($files | fromjson)}' <<< "$commit_json" >> "$GROUP_FILE"

    echo "  Collected: ${MESSAGE:0:60}... -> ${GROUP_KEY}"

  done < <(echo "$COMMITS" | jq -c '.')
done

# ── Phase 2: Score each group, collect those above threshold ──

echo ""
echo "--- Scoring groups ---"

# Eligible groups recorded as "confidence<TAB>group_file" so Phase 3 can sort by confidence.
ELIGIBLE_LIST="${TMPDIR_WORK}/eligible.tsv"
: > "$ELIGIBLE_LIST"

for group_file in "${TMPDIR_WORK}"/*.jsonl; do
  [[ ! -f "$group_file" ]] && continue

  GROUP_NAME=$(basename "$group_file" .jsonl | tr '_' '/')

  # Read all commits in this group
  COMMIT_COUNT=$(wc -l < "$group_file")
  REPO=$(head -1 "$group_file" | jq -r '.repo')

  # Check SHA-based dedup: skip if any commit SHA already appears in existing issue bodies
  ALREADY_QUEUED=false
  while IFS= read -r line; do
    LINE_SHA=$(echo "$line" | jq -r '.sha')
    if echo "$EXISTING_BODIES" | grep -qF "$LINE_SHA"; then
      ALREADY_QUEUED=true
      break
    fi
  done < "$group_file"

  if [[ "$ALREADY_QUEUED" == "true" ]]; then
    echo "  Skipping (SHA already queued): ${GROUP_NAME}"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  # ── Scoring ──

  # Signal 1: Commit count (weight 0.25)
  if [[ "$COMMIT_COUNT" -ge 5 ]]; then
    SCORE_COMMITS="1.0"
  elif [[ "$COMMIT_COUNT" -ge 3 ]]; then
    SCORE_COMMITS="0.6"
  else
    SCORE_COMMITS="0.2"
  fi

  # Signal 2: Files changed (weight 0.25)
  # Collect unique files across all commits in group
  ALL_FILES=$(jq -r '.files[]' "$group_file" 2>/dev/null | sort -u)
  FILE_COUNT=$(echo "$ALL_FILES" | grep -c . || echo "0")

  if [[ "$FILE_COUNT" -ge 6 ]]; then
    SCORE_FILES="1.0"
  elif [[ "$FILE_COUNT" -ge 3 ]]; then
    SCORE_FILES="0.6"
  else
    SCORE_FILES="0.3"
  fi

  # Signal 3: Message quality (weight 0.30) - average message length
  TOTAL_MSG_LEN=0
  while IFS= read -r line; do
    MSG=$(echo "$line" | jq -r '.message' | head -1)
    TOTAL_MSG_LEN=$((TOTAL_MSG_LEN + ${#MSG}))
  done < "$group_file"
  AVG_MSG_LEN=$(echo "${TOTAL_MSG_LEN} / ${COMMIT_COUNT}" | bc)

  if [[ "$AVG_MSG_LEN" -ge 50 ]]; then
    SCORE_MSG="1.0"
  elif [[ "$AVG_MSG_LEN" -ge 20 ]]; then
    SCORE_MSG="0.5"
  else
    SCORE_MSG="0.2"
  fi

  # Signal 4: Tests present (weight 0.20)
  if echo "$ALL_FILES" | grep -qiE '(test|spec|_test\.go|Test\.php)'; then
    SCORE_TESTS="1.0"
  else
    SCORE_TESTS="0.0"
  fi

  # Weighted total
  CONFIDENCE=$(echo "0.25 * ${SCORE_COMMITS} + 0.25 * ${SCORE_FILES} + 0.30 * ${SCORE_MSG} + 0.20 * ${SCORE_TESTS}" | bc -l)
  # Round to 2 decimal places
  CONFIDENCE=$(printf "%.2f" "$CONFIDENCE")

  echo "  ${GROUP_NAME}: confidence=${CONFIDENCE} (commits=${SCORE_COMMITS} files=${SCORE_FILES} msg=${SCORE_MSG} tests=${SCORE_TESTS})"

  # Check threshold
  ABOVE=$(echo "${CONFIDENCE} >= ${CONFIDENCE_THRESHOLD}" | bc -l)
  if [[ "$ABOVE" -ne 1 ]]; then
    echo "    Below threshold (${CONFIDENCE_THRESHOLD}), skipping"
    BELOW_THRESHOLD=$((BELOW_THRESHOLD + 1))
    continue
  fi

  printf '%s\t%s\n' "$CONFIDENCE" "$group_file" >> "$ELIGIBLE_LIST"
done

# ── Phase 3: Sort eligible groups by confidence, apply title dedup + cap, create issues ──

echo ""
echo "--- Creating issues (cap: ${MAX_ISSUES_PER_RUN}, highest confidence first) ---"

# Highest confidence first so the cap keeps the best groups.
SORTED_ELIGIBLE=$(sort -t"$(printf '\t')" -k1,1nr "$ELIGIBLE_LIST" 2>/dev/null || true)

while IFS="$(printf '\t')" read -r CONFIDENCE group_file; do
  [[ -z "${group_file:-}" ]] && continue
  [[ ! -f "$group_file" ]] && continue

  GROUP_NAME=$(basename "$group_file" .jsonl | tr '_' '/')
  COMMIT_COUNT=$(wc -l < "$group_file")
  REPO=$(head -1 "$group_file" | jq -r '.repo')

  # Extract directory portion from group name (after repo)
  DIR_PART=$(echo "$GROUP_NAME" | sed "s|^${REPO}||; s|^/||")
  if [[ -z "$DIR_PART" ]]; then
    DIR_PART="root"
  fi

  TITLE="[content] ${REPO}: ${DIR_PART} work"

  # Title-similarity dedup vs existing OPEN and recently-CLOSED content-queue issues (normalized exact match).
  # Closed check covers ~150 issues bulk-closed with curate:skipped that must not be re-created.
  TITLE_NORM=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr -s ' ' | sed 's/[[:space:]]*$//')
  if { [[ -n "$EXISTING_TITLES_NORM" ]] && echo "$EXISTING_TITLES_NORM" | grep -qxF "$TITLE_NORM"; } || \
     { [[ -n "$CLOSED_TITLES_NORM" ]] && echo "$CLOSED_TITLES_NORM" | grep -qxF "$TITLE_NORM"; }; then
    echo "  Skipping (title already open or recently closed): ${TITLE}"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  # Enforce per-run cap, keeping the highest-confidence groups (we iterate in sorted order).
  if [[ "$MINED_COUNT" -ge "$MAX_ISSUES_PER_RUN" ]]; then
    DROPPED_CAP=$((DROPPED_CAP + 1))
    continue
  fi

  # ── Build seed JSON and create issue ──

  # Build source_ref array (full commit URLs)
  SOURCE_REFS=$(jq -r --arg repo "$REPO" '"https://github.com/" + $repo + "/commit/" + .sha' "$group_file" | jq -R -s 'split("\n") | map(select(length > 0))')

  # Build content seed: unique commit messages (max 5, then "... and N more")
  UNIQUE_MESSAGES=$(jq -r '.message' "$group_file" | while IFS= read -r msg; do echo "$msg" | head -1; done | sort -u)
  MSG_COUNT=$(echo "$UNIQUE_MESSAGES" | wc -l)

  if [[ "$MSG_COUNT" -le 5 ]]; then
    CONTENT_SEED=$(echo "$UNIQUE_MESSAGES" | sed 's/^/- /')
  else
    FIRST_FIVE=$(echo "$UNIQUE_MESSAGES" | head -5 | sed 's/^/- /')
    REMAINING=$((MSG_COUNT - 5))
    CONTENT_SEED=$(printf "%s\n... and %d more" "$FIRST_FIVE" "$REMAINING")
  fi

  SEED_FILE="${TMPDIR_WORK}/seed-$(echo "$GROUP_NAME" | tr '/' '_').json"
  cat > "$SEED_FILE" << SEED
{
  "source": "git-commit",
  "source_ref": ${SOURCE_REFS},
  "content_seed": $(echo "$CONTENT_SEED" | jq -Rs .),
  "suggested_type": "text-post",
  "suggested_channels": ["bluesky", "linkedin", "facebook"],
  "mined_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "confidence": ${CONFIDENCE}
}
SEED

  # Validate against schema
  if $VALIDATOR mined-seed "$SEED_FILE" > /dev/null 2>&1; then
    # Build issue body
    ISSUE_BODY="## Source

**Repo:** ${REPO}
**Directory:** ${DIR_PART}
**Confidence:** ${CONFIDENCE}
**Commits:** ${COMMIT_COUNT}

## Commit SHAs
"
    while IFS= read -r line; do
      LINE_SHA=$(echo "$line" | jq -r '.sha')
      LINE_MSG=$(echo "$line" | jq -r '.message' | head -1)
      ISSUE_BODY="${ISSUE_BODY}
- [\`${LINE_SHA:0:7}\`](https://github.com/${REPO}/commit/${LINE_SHA}) ${LINE_MSG}"
    done < "$group_file"

    ISSUE_BODY="${ISSUE_BODY}

## Content Seed

${CONTENT_SEED}

## Suggested

- **Type:** text-post
- **Channels:** bluesky, linkedin, facebook"

    if [[ "$DRY_RUN" == "1" ]]; then
      echo "  [DRY_RUN] Would create: ${TITLE} (confidence=${CONFIDENCE}, repo=${REPO})"
    else
      gh issue create --repo "$QUEUE_REPO" \
        --title "$TITLE" \
        --label "content-queue,stage:mined,type:text-post" \
        --body "$ISSUE_BODY" \
        > /dev/null
      echo "    Created issue: ${TITLE} (confidence=${CONFIDENCE})"
    fi
    MINED_COUNT=$((MINED_COUNT + 1))
  else
    echo "    Validation failed for group ${GROUP_NAME}, skipping"
    $VALIDATOR mined-seed "$SEED_FILE" 2>&1 || true
  fi
done <<< "$SORTED_ELIGIBLE"

echo ""
echo "Mining complete: ${MINED_COUNT} issues created, ${SKIPPED_COUNT} skipped, ${BELOW_THRESHOLD} below threshold, ${DROPPED_CAP} dropped by cap (MAX_ISSUES_PER_RUN=${MAX_ISSUES_PER_RUN})"
if [[ "$DROPPED_CAP" -gt 0 ]]; then
  echo "Note: ${DROPPED_CAP} eligible group(s) above threshold were not filed this run because of the per-run cap. Re-run after curating, or raise MAX_ISSUES_PER_RUN."
fi

# Write state marker so local runs know when last executed.
# Skip in CI (CI=true), DRY_RUN=1, or if the state directory is not writable.
STATE_DIR="${HOME}/.local/state/content-mine"
if [[ "${CI:-false}" != "true" && "$DRY_RUN" != "1" ]] && mkdir -p "$STATE_DIR" 2>/dev/null && [[ -w "$STATE_DIR" ]]; then
  date -u +%Y-%m-%dT%H:%M:%SZ > "${STATE_DIR}/last-run"
fi
