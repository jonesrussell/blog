#!/usr/bin/env bash
set -euo pipefail

# mine-git-activity.sh
# Scans configured repos for recent git activity, groups commits by theme,
# scores by confidence, and creates content queue issues for qualifying groups.
# Called by .github/workflows/content-mine.yml
#
# Usage: ./scripts/mine-git-activity.sh [days] [confidence_threshold]
# Default: 7 days lookback, 0.3 confidence threshold

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DAYS="${1:-7}"
CONFIDENCE_THRESHOLD="${2:-0.3}"
SINCE_DATE=$(date -u -d "${DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"${DAYS}"d +%Y-%m-%dT%H:%M:%SZ)
QUEUE_REPO="jonesrussell/jonesrussell"
VALIDATOR="node ${SCRIPT_DIR}/../schemas/validate.js"
REPOS=("waaseyaa/framework" "waaseyaa/giiken" "jonesrussell/blog" "jonesrussell/jonesrussell")

MINED_COUNT=0
SKIPPED_COUNT=0
BELOW_THRESHOLD=0

# Create temp directory for intermediate files, clean up on exit
TMPDIR_WORK=$(mktemp -d /tmp/mine-git-XXXXXX)
trap 'rm -rf "${TMPDIR_WORK}"' EXIT

echo "Mining git activity since ${SINCE_DATE} (${DAYS} days, threshold=${CONFIDENCE_THRESHOLD})"

# Fetch existing issue bodies for SHA-based dedup
EXISTING_BODIES=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --json body --jq '.[].body' --limit 200 2>/dev/null || echo "")

# ── Phase 1: Collect commits and group by theme ──

for repo in "${REPOS[@]}"; do
  echo "--- Scanning ${repo} ---"

  # Fetch recent commits (compact JSON, one per line)
  COMMITS=$(gh api "repos/${repo}/commits?since=${SINCE_DATE}&per_page=50" \
    --jq '.[] | select(.commit.message | test("^(Merge |bump |chore\\(deps\\)|ci:|fix typo|formatting)"; "i") | not) | {sha: .sha, message: .commit.message, date: .commit.author.date}' \
    2>/dev/null || echo "")

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
    FILES_JSON=$(gh api "repos/${repo}/commits/${SHA}" --jq '[.files[].filename]' 2>/dev/null || echo "[]")

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

# ── Phase 2: Score each group and create issues ──

echo ""
echo "--- Scoring groups ---"

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

  # ── Phase 4: Build seed JSON and create issue ──

  # Extract directory portion from group name (after repo)
  DIR_PART=$(echo "$GROUP_NAME" | sed "s|^${REPO}||; s|^/||")
  if [[ -z "$DIR_PART" ]]; then
    DIR_PART="root"
  fi

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
  "suggested_channels": ["x", "linkedin", "facebook"],
  "mined_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "confidence": ${CONFIDENCE}
}
SEED

  # Validate against schema
  if $VALIDATOR mined-seed "$SEED_FILE" > /dev/null 2>&1; then
    TITLE="[content] ${REPO}: ${DIR_PART} work"

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
- **Channels:** x, linkedin, facebook"

    gh issue create --repo "$QUEUE_REPO" \
      --title "$TITLE" \
      --label "content-queue,stage:mined,type:text-post" \
      --body "$ISSUE_BODY" \
      > /dev/null

    echo "    Created issue: ${TITLE}"
    MINED_COUNT=$((MINED_COUNT + 1))
  else
    echo "    Validation failed for group ${GROUP_NAME}, skipping"
    $VALIDATOR mined-seed "$SEED_FILE" 2>&1 || true
  fi
done

echo ""
echo "Mining complete: ${MINED_COUNT} issues created, ${SKIPPED_COUNT} skipped, ${BELOW_THRESHOLD} below threshold"
