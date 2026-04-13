#!/usr/bin/env bash
set -euo pipefail

# mine-git-activity.sh
# Scans configured repos for recent git activity and creates content queue issues.
# Called by .github/workflows/content-mine.yml
#
# Usage: ./scripts/mine-git-activity.sh [days]
# Default: 7 days lookback

DAYS="${1:-7}"
SINCE_DATE=$(date -u -d "${DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-${DAYS}d +%Y-%m-%dT%H:%M:%SZ)
QUEUE_REPO="jonesrussell/jonesrussell"
VALIDATOR="node $(dirname "$0")/../schemas/validate.js"
REPOS=("waaseyaa/framework" "waaseyaa/giiken" "jonesrussell/blog" "jonesrussell/jonesrussell")

MINED_COUNT=0
SKIPPED_COUNT=0

echo "Mining git activity since ${SINCE_DATE} (${DAYS} days)"

# Fetch existing queue issue titles to avoid duplicates
EXISTING_TITLES=$(gh issue list --repo "$QUEUE_REPO" --label "content-queue" --json title --jq '.[].title' --limit 100)

for repo in "${REPOS[@]}"; do
  echo "--- Scanning ${repo} ---"

  # Fetch recent commits
  COMMITS=$(gh api "repos/${repo}/commits?since=${SINCE_DATE}&per_page=50" \
    --jq '.[] | select(.commit.message | test("^(Merge |bump |chore\\(deps\\)|ci:|fix typo|formatting)"; "i") | not) | {sha: .sha[0:7], message: .commit.message, date: .commit.author.date}' \
    2>/dev/null || echo "")

  if [[ -z "$COMMITS" ]]; then
    echo "  No qualifying commits found."
    continue
  fi

  echo "$COMMITS" | jq -c '.' | while read -r commit_json; do
    SHA=$(echo "$commit_json" | jq -r '.sha')
    MESSAGE=$(echo "$commit_json" | jq -r '.message' | head -1)
    COMMIT_DATE=$(echo "$commit_json" | jq -r '.date')

    # Skip short messages (likely trivial)
    if [[ ${#MESSAGE} -lt 10 ]]; then
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      continue
    fi

    # Skip if already in queue
    if echo "$EXISTING_TITLES" | grep -qF "$MESSAGE"; then
      echo "  Skipping (already queued): ${MESSAGE}"
      continue
    fi

    # Build seed JSON
    SEED_FILE=$(mktemp /tmp/mined-seed-XXXXXX.json)
    cat > "$SEED_FILE" << SEED
{
  "source": "git-commit",
  "source_ref": "https://github.com/${repo}/commit/${SHA}",
  "content_seed": $(echo "$MESSAGE" | jq -Rs .),
  "suggested_type": "text-post",
  "suggested_channels": ["x", "linkedin", "facebook"],
  "mined_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
SEED

    # Validate against schema
    if $VALIDATOR mined-seed "$SEED_FILE" > /dev/null 2>&1; then
      # Create the queue issue
      ISSUE_BODY="## Source\n\n**Repo:** ${repo}\n**Commit:** ${SHA}\n**Date:** ${COMMIT_DATE}\n\n## Content Seed\n\n${MESSAGE}\n\n## Suggested\n\n- **Type:** text-post\n- **Channels:** x, linkedin, facebook"

      gh issue create --repo "$QUEUE_REPO" \
        --title "[content] ${MESSAGE}" \
        --label "content-queue,stage:mined,type:text-post" \
        --body "$(echo -e "$ISSUE_BODY")" \
        > /dev/null

      echo "  ✓ Mined: ${MESSAGE}"
      MINED_COUNT=$((MINED_COUNT + 1))
    else
      echo "  ✗ Validation failed for commit ${SHA}, skipping"
      $VALIDATOR mined-seed "$SEED_FILE" 2>&1 || true
    fi

    rm -f "$SEED_FILE"
  done
done

echo ""
echo "Mining complete: ${MINED_COUNT} issues created, ${SKIPPED_COUNT} skipped"
