#!/usr/bin/env bash
set -euo pipefail

# One-time triage script for content-queue issues in jonesrussell/jonesrussell.
# Closes orphaned social-schedule posts, stale mined items, and relabels
# infrastructure and blog-audit issues so the content queue contains only
# genuine content ideas.
#
# Usage:
#   ./scripts/triage-content-queue.sh            # execute all phases
#   ./scripts/triage-content-queue.sh --dry-run   # preview without changes

QUEUE_REPO="jonesrussell/jonesrussell"
DRY_RUN=false
STALE_DAYS=14
MIN_BODY_LENGTH=50

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN MODE (no changes will be made) ==="
  echo ""
fi

# ---------------------------------------------------------------------------
# Counters (written to temp files so pipe subshells can update them)
# ---------------------------------------------------------------------------
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

count_file() { echo "$tmp_dir/$1"; }
bump() { echo "x" >> "$(count_file "$1")"; }
get_count() { wc -l < "$(count_file "$1")" 2>/dev/null | tr -d ' '; }

# Initialise counter files
for counter in closed_social closed_stale relabeled_infra relabeled_audit skipped; do
  : > "$(count_file "$counter")"
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
close_issue() {
  local number="$1" reason="$2"
  if [[ "$DRY_RUN" == true ]]; then
    echo "  [dry-run] Would close #${number} (${reason})"
  else
    gh issue close "$number" --repo "$QUEUE_REPO" --comment "Closed by triage script: ${reason}"
    echo "  Closed #${number} (${reason})"
  fi
}

relabel_issue() {
  local number="$1" new_label="$2"
  if [[ "$DRY_RUN" == true ]]; then
    echo "  [dry-run] Would relabel #${number}: remove content-queue, add ${new_label}"
  else
    gh issue edit "$number" --repo "$QUEUE_REPO" --add-label "$new_label" --remove-label "content-queue"
    echo "  Relabeled #${number} -> ${new_label}"
  fi
}

# ---------------------------------------------------------------------------
# Fetch all open content-queue issues (JSON, one object per line)
# Fields: number, title, body, labels, createdAt
# ---------------------------------------------------------------------------
echo "Fetching content-queue issues from ${QUEUE_REPO}..."
issues_json="$(gh issue list \
  --repo "$QUEUE_REPO" \
  --label "content-queue" \
  --state open \
  --limit 200 \
  --json number,title,body,labels,createdAt)"

issue_count="$(echo "$issues_json" | jq 'length')"
echo "Found ${issue_count} open content-queue issues."
echo ""

# ---------------------------------------------------------------------------
# Phase 1: Close scheduled social posts
# Patterns: "[x] 2026-04-19 15:00", "[linkedin] 2026-04-15", date+time+platform
# ---------------------------------------------------------------------------
echo "=== Phase 1: Close scheduled social posts ==="

echo "$issues_json" | jq -c '.[]' | while IFS= read -r issue; do
  number="$(echo "$issue" | jq -r '.number')"
  title="$(echo "$issue" | jq -r '.title')"
  body="$(echo "$issue" | jq -r '.body // ""')"
  combined="${title} ${body}"

  # Match social scheduling patterns
  if echo "$combined" | grep -qiE '\[x\]\s*20[0-9]{2}-[0-9]{2}-[0-9]{2}' ||
     echo "$combined" | grep -qiE '\[(linkedin|facebook|x|twitter)\]\s*20[0-9]{2}-[0-9]{2}-[0-9]{2}' ||
     echo "$combined" | grep -qiE '20[0-9]{2}-[0-9]{2}-[0-9]{2}\s+[0-9]{1,2}:[0-9]{2}.*\b(linkedin|facebook|twitter|x|buffer)\b' ||
     echo "$combined" | grep -qiE '\b(linkedin|facebook|twitter|x)\b.*20[0-9]{2}-[0-9]{2}-[0-9]{2}\s+[0-9]{1,2}:[0-9]{2}'; then
    close_issue "$number" "Orphaned social schedule post; Buffer handles scheduling now"
    bump closed_social
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Phase 2: Close vague/stale items (stage:mined, older than 14 days, short body)
# ---------------------------------------------------------------------------
echo "=== Phase 2: Close vague/stale stage:mined items ==="

cutoff_date="$(date -d "-${STALE_DAYS} days" +%Y-%m-%dT%H:%M:%S 2>/dev/null || date -v-${STALE_DAYS}d +%Y-%m-%dT%H:%M:%S)"

echo "$issues_json" | jq -c '.[]' | while IFS= read -r issue; do
  number="$(echo "$issue" | jq -r '.number')"
  title="$(echo "$issue" | jq -r '.title')"
  body="$(echo "$issue" | jq -r '.body // ""')"
  created="$(echo "$issue" | jq -r '.createdAt')"
  labels="$(echo "$issue" | jq -r '[.labels[].name] | join(",")')"

  # Must have stage:mined label
  if ! echo "$labels" | grep -q "stage:mined"; then
    continue
  fi

  # Must be older than cutoff
  if [[ "$created" > "$cutoff_date" ]]; then
    continue
  fi

  # Body must be shorter than threshold
  body_length="${#body}"
  if [[ "$body_length" -lt "$MIN_BODY_LENGTH" ]]; then
    close_issue "$number" "Stale stage:mined item (${body_length} chars, created ${created:0:10})"
    bump closed_stale
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Phase 3: Relabel infrastructure issues -> backlog
# ---------------------------------------------------------------------------
echo "=== Phase 3: Relabel infrastructure issues ==="

infra_pattern="cover image|buffer|favicon|og image|deploy|setup|integration|workflow|sync|schema|validator"

echo "$issues_json" | jq -c '.[]' | while IFS= read -r issue; do
  number="$(echo "$issue" | jq -r '.number')"
  title="$(echo "$issue" | jq -r '.title')"
  body="$(echo "$issue" | jq -r '.body // ""')"
  combined="${title} ${body}"

  if echo "$combined" | grep -qiE "$infra_pattern"; then
    relabel_issue "$number" "backlog"
    bump relabeled_infra
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Phase 4: Relabel blog audit issues -> blog-audit
# ---------------------------------------------------------------------------
echo "=== Phase 4: Relabel blog audit issues ==="

audit_pattern="audit|review|refresh|outdated|update existing|revisit|rewrite"

echo "$issues_json" | jq -c '.[]' | while IFS= read -r issue; do
  number="$(echo "$issue" | jq -r '.number')"
  title="$(echo "$issue" | jq -r '.title')"
  body="$(echo "$issue" | jq -r '.body // ""')"
  combined="${title} ${body}"

  if echo "$combined" | grep -qiE "$audit_pattern"; then
    relabel_issue "$number" "blog-audit"
    bump relabeled_audit
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Phase 5: Close all remaining stage:mined items
# These will be superseded by the new grouped miner.
# ---------------------------------------------------------------------------
echo "=== Phase 5: Close all remaining stage:mined items (superseded by grouped miner) ==="

echo "$issues_json" | jq -c '.[]' | while read -r issue; do
  number=$(echo "$issue" | jq -r '.number')
  title=$(echo "$issue" | jq -r '.title')
  labels=$(echo "$issue" | jq -r '[.labels[].name] | join(",")')

  # Skip if already processed (relabeled out of content-queue)
  if [[ "$labels" != *"content-queue"* ]]; then
    continue
  fi

  # Only close stage:mined items
  if [[ "$labels" == *"stage:mined"* ]]; then
    close_issue "$number" "Closed during triage: superseded by grouped mining. The new miner will create themed, scored seeds from this activity."
    bump closed_mined
  fi
done

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "==========================================="
echo "  Triage Summary"
echo "==========================================="
echo "  Closed (social schedule):  $(get_count closed_social)"
echo "  Closed (stale/vague):      $(get_count closed_stale)"
echo "  Relabeled -> backlog:      $(get_count relabeled_infra)"
echo "  Relabeled -> blog-audit:   $(get_count relabeled_audit)"
echo "  Closed (mined, superseded):$(get_count closed_mined)"
echo "==========================================="
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo "(No changes were made. Remove --dry-run to execute.)"
  echo ""
fi

# Show remaining content-queue issues
echo "Remaining content-queue issues:"
gh issue list --repo "$QUEUE_REPO" --label "content-queue" --state open --limit 200
