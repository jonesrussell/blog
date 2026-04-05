# Content Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a content pipeline that mines work activity, surfaces content ideas as GitHub issues, and automates production and distribution to social platforms via Buffer API.

**Architecture:** GitHub issues in jonesrussell/jonesrussell serve as the content queue. Claude Code skills handle curation, production, and distribution. A GitHub Action handles daily mining. Buffer's GraphQL API replaces Playwright for social posting.

**Tech Stack:** GitHub Actions (mining), Claude Code skills (curation/production/distribution), Buffer GraphQL API (posting), bash/curl (API calls), Hugo (blog), existing social-media-posts skill (copy generation)

**Spec:** `docs/superpowers/specs/2026-04-04-content-pipeline-design.md`

---

## File Map

| File | Purpose |
|------|---------|
| `~/.claude/skills/content-pipeline/buffer-post.sh` | Shell script to post to Buffer via GraphQL API |
| `~/.claude/skills/content-pipeline/buffer-channels.sh` | Shell script to fetch Buffer channel IDs |
| `~/.claude/skills/content-pipeline/SKILL.md` | Distribution skill: read content queue issue, post to Buffer |
| `~/.claude/skills/content-produce/SKILL.md` | Production skill: generate platform copy from a curated issue |
| `~/.claude/skills/content-curate/SKILL.md` | Curation skill: batch-present mined items for approval |
| `~/.claude/skills/content-mine/SKILL.md` | Manual mining skill: scan recent git/GitHub activity |
| `.github/workflows/content-mine.yml` (in jonesrussell/jonesrussell) | Daily GitHub Action to mine activity and create queue issues |
| `.github/ISSUE_TEMPLATE/content-queue.md` (in jonesrussell/jonesrussell) | Issue template for content queue items |

---

### Task 1: Content Queue Infrastructure

Set up labels and issue template in jonesrussell/jonesrussell.

**Files:**
- Create: `.github/ISSUE_TEMPLATE/content-queue.md` (in jonesrussell/jonesrussell repo via GitHub API)

- [ ] **Step 1: Create content queue labels**

Use GitHub CLI to create the labels. Run each command:

```bash
cd ~/dev  # not inside any specific repo

# Stage labels
gh label create "stage:mined" --repo jonesrussell/jonesrussell --color "FBCA04" --description "Surfaced by miner, awaiting curation"
gh label create "stage:curated" --repo jonesrussell/jonesrussell --color "0E8A16" --description "Approved, type and channels locked"
gh label create "stage:in_production" --repo jonesrussell/jonesrussell --color "1D76DB" --description "Content being generated"
gh label create "stage:ready" --repo jonesrussell/jonesrussell --color "5319E7" --description "Content ready for distribution"
gh label create "stage:distributed" --repo jonesrussell/jonesrussell --color "006B75" --description "Posted to all channels"

# Type labels
gh label create "type:text-post" --repo jonesrussell/jonesrussell --color "C5DEF5" --description "Social media text post"
gh label create "type:blog-post" --repo jonesrussell/jonesrussell --color "BFD4F2" --description "Blog post"
gh label create "type:video" --repo jonesrussell/jonesrussell --color "D4C5F9" --description "Video content"
gh label create "type:newsletter" --repo jonesrussell/jonesrussell --color "F9D0C4" --description "Substack newsletter"

# Queue label
gh label create "content-queue" --repo jonesrussell/jonesrussell --color "E99695" --description "Content pipeline queue item"

# Skip label
gh label create "skipped" --repo jonesrussell/jonesrussell --color "D93F0B" --description "Skipped during curation"
```

Expected: Each command prints `✓ Label "..." created in jonesrussell/jonesrussell`

- [ ] **Step 2: Create issue template**

```bash
# Clone if not already local
cd ~/dev
git clone git@github.com:jonesrussell/jonesrussell.git 2>/dev/null || true
cd ~/dev/jonesrussell
mkdir -p .github/ISSUE_TEMPLATE
```

Create `.github/ISSUE_TEMPLATE/content-queue.md`:

```markdown
---
name: Content Queue Item
about: A content idea surfaced by the mining pipeline
title: "[content] "
labels: content-queue, stage:mined
assignees: jonesrussell
---

## Source

<!-- What triggered this: commit, milestone, session, manual idea -->
<!-- Include repo, PR/issue number, commit SHA, or session reference -->

## Content Seed

<!-- Raw material: diff summary, issue body, brainstorm notes, key quotes -->

## Suggested Type

<!-- text-post | blog-post | video | newsletter -->

## Suggested Channels

<!-- x, linkedin, facebook, youtube, substack, devto, blog -->

## Generated Artifacts

<!-- Added during production — do not fill manually -->
```

- [ ] **Step 3: Commit and push**

```bash
cd ~/dev/jonesrussell
git add .github/ISSUE_TEMPLATE/content-queue.md
git commit -m "feat: add content queue issue template for content pipeline"
git push origin main
```

- [ ] **Step 4: Verify**

```bash
gh issue create --repo jonesrussell/jonesrussell --title "[content] Test queue item" --template "content-queue.md" --dry-run 2>&1 || echo "Template created — verify at https://github.com/jonesrussell/jonesrussell/issues/new/choose"
gh label list --repo jonesrussell/jonesrussell | grep -E "stage:|type:|content-queue|skipped"
```

Expected: All 11 labels listed.

---

### Task 2: Buffer API Client Scripts

Build the shell scripts that call Buffer's GraphQL API.

**Files:**
- Create: `~/.claude/skills/content-pipeline/buffer-channels.sh`
- Create: `~/.claude/skills/content-pipeline/buffer-post.sh`

- [ ] **Step 1: Create the skills directory**

```bash
mkdir -p ~/.claude/skills/content-pipeline
```

- [ ] **Step 2: Create the channel listing script**

Create `~/.claude/skills/content-pipeline/buffer-channels.sh`:

```bash
#!/usr/bin/env bash
# Fetch Buffer channel IDs and names
# Usage: ./buffer-channels.sh
# Requires: BUFFER_API_KEY environment variable

set -euo pipefail

if [[ -z "${BUFFER_API_KEY:-}" ]]; then
  echo "Error: BUFFER_API_KEY not set" >&2
  exit 1
fi

curl -s -X POST https://api.buffer.com \
  -H "Authorization: Bearer ${BUFFER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { channels { id name service } }"
  }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
channels = data.get('data', {}).get('channels', [])
for ch in channels:
    print(f\"{ch['service']:12s} {ch['id']:28s} {ch['name']}\")
"
```

```bash
chmod +x ~/.claude/skills/content-pipeline/buffer-channels.sh
```

- [ ] **Step 3: Test channel listing**

```bash
export BUFFER_API_KEY="7hlPbF9hgpbRLrByFRh1fYUunvH-tf_hbZxj5sK-Y0s"
~/.claude/skills/content-pipeline/buffer-channels.sh
```

Expected output: Three lines showing facebook, twitter, linkedin with their channel IDs and names.

- [ ] **Step 4: Save channel IDs to config**

Create `~/.claude/skills/content-pipeline/channels.env` with the IDs from Step 3:

```bash
# Buffer channel IDs — fetched via buffer-channels.sh
BUFFER_CHANNEL_FACEBOOK="<id from step 3>"
BUFFER_CHANNEL_TWITTER="<id from step 3>"
BUFFER_CHANNEL_LINKEDIN="<id from step 3>"
```

- [ ] **Step 5: Create the posting script**

Create `~/.claude/skills/content-pipeline/buffer-post.sh`:

```bash
#!/usr/bin/env bash
# Post to a single Buffer channel via GraphQL API
# Usage: ./buffer-post.sh <channel_id> <text> [mode]
# mode: shareNow (default), addToQueue, customScheduled
# For customScheduled, set DUE_AT env var to ISO8601 datetime
# Requires: BUFFER_API_KEY environment variable

set -euo pipefail

if [[ -z "${BUFFER_API_KEY:-}" ]]; then
  echo "Error: BUFFER_API_KEY not set" >&2
  exit 1
fi

CHANNEL_ID="${1:?Usage: buffer-post.sh <channel_id> <text> [mode]}"
TEXT="${2:?Usage: buffer-post.sh <channel_id> <text> [mode]}"
MODE="${3:-shareNow}"

# Escape text for JSON
TEXT_ESCAPED=$(python3 -c "import json; print(json.dumps(${TEXT@Q})[1:-1])")

# Build dueAt field if customScheduled
DUE_AT_FIELD=""
if [[ "$MODE" == "customScheduled" && -n "${DUE_AT:-}" ]]; then
  DUE_AT_FIELD="dueAt: \"${DUE_AT}\""
fi

QUERY=$(cat <<GRAPHQL
mutation {
  createPost(input: {
    channelId: "${CHANNEL_ID}"
    text: "${TEXT_ESCAPED}"
    mode: ${MODE}
    schedulingType: automatic
    ${DUE_AT_FIELD}
  }) {
    post {
      id
      status
      text
      externalLink
    }
    userErrors {
      message
    }
  }
}
GRAPHQL
)

RESPONSE=$(curl -s -X POST https://api.buffer.com \
  -H "Authorization: Bearer ${BUFFER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "import json; print(json.dumps({'query': ${QUERY@Q}}))")")

# Check for errors
ERRORS=$(echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
errors = data.get('errors', [])
user_errors = data.get('data', {}).get('createPost', {}).get('userErrors', [])
all_errors = errors + user_errors
if all_errors:
    for e in all_errors:
        print(e.get('message', str(e)))
" 2>/dev/null)

if [[ -n "$ERRORS" ]]; then
  echo "Error posting to Buffer:" >&2
  echo "$ERRORS" >&2
  exit 1
fi

# Output post info
echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
post = data.get('data', {}).get('createPost', {}).get('post', {})
print(f\"Posted: {post.get('status', 'unknown')}\")
print(f\"ID: {post.get('id', 'n/a')}\")
link = post.get('externalLink', '')
if link:
    print(f\"Link: {link}\")
"
```

```bash
chmod +x ~/.claude/skills/content-pipeline/buffer-post.sh
```

- [ ] **Step 6: Test posting (dry run with draft)**

```bash
source ~/.claude/skills/content-pipeline/channels.env
export BUFFER_API_KEY="7hlPbF9hgpbRLrByFRh1fYUunvH-tf_hbZxj5sK-Y0s"

# Post a test to Twitter as draft (won't publish)
# Note: saveToDraft isn't in the script yet, so test with addToQueue
# and then delete from Buffer dashboard
~/.claude/skills/content-pipeline/buffer-post.sh "$BUFFER_CHANNEL_TWITTER" "Test post from content pipeline API — please ignore" addToQueue
```

Expected: `Posted: buffer` with an ID. Delete the queued post from Buffer dashboard after verifying.

- [ ] **Step 7: Commit**

```bash
cd ~/.claude/skills/content-pipeline
git init 2>/dev/null || true
# These are local tools, no need to push to a repo yet
# They'll move into Claudriel later
```

---

### Task 3: Distribution Skill

Claude Code skill that reads a `stage:ready` content queue issue and posts to all target channels.

**Files:**
- Create: `~/.claude/skills/content-pipeline/SKILL.md`

- [ ] **Step 1: Create the distribution skill**

Create `~/.claude/skills/content-pipeline/SKILL.md`:

```markdown
---
name: content-distribute
description: Post content from a stage:ready content queue issue to all target channels via Buffer API. Use when a content queue item is ready to distribute, or when user says "distribute", "post this", "send to socials".
---

# Content Distribution

## Overview

Read a `stage:ready` content queue issue from jonesrussell/jonesrussell and post the generated artifacts to all target channels via Buffer's GraphQL API.

## Prerequisites

- `BUFFER_API_KEY` environment variable must be set
- Channel IDs in `~/.claude/skills/content-pipeline/channels.env`
- The content queue issue must have `stage:ready` label and generated artifacts in the issue body

## Process

1. **Identify the issue.** The user provides an issue number or you find issues with `stage:ready` label:
   ```bash
   gh issue list --repo jonesrussell/jonesrussell --label "stage:ready" --json number,title
   ```

2. **Read the issue body.** Extract:
   - Generated artifacts section (platform-specific copy)
   - Target channels from the "Suggested Channels" section

3. **Load channel config:**
   ```bash
   source ~/.claude/skills/content-pipeline/channels.env
   ```

4. **Post to each channel.** For each target channel, extract the platform-specific copy and call:
   ```bash
   ~/.claude/skills/content-pipeline/buffer-post.sh "$CHANNEL_ID" "$COPY" shareNow
   ```

   Channel mapping:
   - `x` or `twitter` → `$BUFFER_CHANNEL_TWITTER`
   - `facebook` → `$BUFFER_CHANNEL_FACEBOOK`
   - `linkedin` → `$BUFFER_CHANNEL_LINKEDIN`

5. **Update the issue.** After all channels are posted:
   - Add a comment with links to each live post
   - Remove `stage:ready`, add `stage:distributed`
   - Close the issue

   ```bash
   gh issue comment <NUMBER> --repo jonesrussell/jonesrussell --body "## Distribution Complete

   Posted to:
   - [x] Facebook
   - [x] X/Twitter
   - [x] LinkedIn

   Distributed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

   gh issue edit <NUMBER> --repo jonesrussell/jonesrussell --remove-label "stage:ready" --add-label "stage:distributed"
   gh issue close <NUMBER> --repo jonesrussell/jonesrussell
   ```

## Safety

- Only process issues with `stage:ready` label
- Show the user what will be posted to each channel before posting
- Wait for confirmation before executing
- If any channel fails, report the error and continue with remaining channels

## Error Handling

- If Buffer API returns an error, print the error and skip that channel
- After all attempts, report which channels succeeded and which failed
- Do not close the issue if any channel failed — leave at `stage:ready` with a comment noting failures
```

- [ ] **Step 2: Verify skill is discoverable**

```bash
ls -la ~/.claude/skills/content-pipeline/SKILL.md
```

Expected: File exists. Claude Code will discover it on next session start.

- [ ] **Step 3: Manual integration test**

Create a test content queue issue, add generated artifacts, label it `stage:ready`, then invoke the skill manually:

```bash
gh issue create --repo jonesrussell/jonesrussell \
  --title "[content] Test pipeline distribution" \
  --label "content-queue,stage:ready,type:text-post" \
  --body "## Source
Manual test of content pipeline distribution.

## Content Seed
Testing the Buffer API integration.

## Suggested Type
text-post

## Suggested Channels
x, linkedin, facebook

## Generated Artifacts

### Facebook
Testing the content pipeline. This post was generated and distributed automatically.

https://github.com/jonesrussell/jonesrussell

### X (Twitter)
Testing the content pipeline — automated distribution via Buffer API.

https://github.com/jonesrussell/jonesrussell

### LinkedIn
Testing the content pipeline. Automated social distribution via Buffer's GraphQL API.

https://github.com/jonesrussell/jonesrussell"
```

Then invoke: `/content-distribute` or "distribute the test pipeline issue"

Expected: Posts appear on all three platforms, issue gets `stage:distributed` label and is closed.

---

### Task 4: Text Post Production Skill

Claude Code skill that takes a `stage:curated` issue and generates platform-specific copy.

**Files:**
- Create: `~/.claude/skills/content-produce/SKILL.md`

- [ ] **Step 1: Create the production skill**

```bash
mkdir -p ~/.claude/skills/content-produce
```

Create `~/.claude/skills/content-produce/SKILL.md`:

```markdown
---
name: content-produce
description: Generate platform-specific social media copy from a curated content queue issue. Use when a content queue item needs copy generated, or when user says "produce", "generate copy", "write posts for this".
---

# Content Production

## Overview

Read a `stage:curated` content queue issue and generate platform-specific copy using the author's brand voice. Write the generated copy back into the issue body.

## Prerequisites

- Brand voice reference: `~/brand/identity.md`
- Existing voice rules from the social-media-posts skill apply (direct, technical, no emoji, no hashtags, no corporate fluff)

## Process

1. **Identify the issue.** User provides an issue number or find curated issues:
   ```bash
   gh issue list --repo jonesrussell/jonesrussell --label "stage:curated" --json number,title
   ```

2. **Read the issue body.** Extract:
   - Content seed (the raw material)
   - Source (where the idea came from)
   - Type (should be `text-post` for this skill)
   - Channels (which platforms to generate for)

3. **Read brand voice.** Load `~/brand/identity.md` for positioning, key messages, and tone.

4. **Generate copy per channel.** Follow these platform rules:

   **Facebook:**
   - 2-3 short paragraphs. Hook, context, result/CTA.
   - Longest format. Room to explain the "why."
   - URL on its own line at the end.

   **X (Twitter):**
   - Under 240 characters including URL.
   - One punchy statement. Link at the end.
   - If it doesn't fit, cut words. Don't thread.

   **LinkedIn:**
   - Professional but not stiff. Technical audience.
   - 2-3 paragraphs. Problem, solution, result.
   - URL on its own line at the end.

5. **Show the user the generated copy.** Present all variants for review. Ask for approval or edits.

6. **Write back to the issue.** After approval, update the issue body's "Generated Artifacts" section:

   ```bash
   # Read current body, append generated artifacts, update
   gh issue edit <NUMBER> --repo jonesrussell/jonesrussell --body "<updated body with artifacts>"
   ```

7. **Update labels:**
   ```bash
   gh issue edit <NUMBER> --repo jonesrussell/jonesrussell --remove-label "stage:curated" --add-label "stage:ready"
   ```

## Voice Reference

- Open with something specific to the content, not generic ("Excited to share...")
- Use real numbers, project names, outcomes
- Write like explaining to a peer
- Ojibwe greetings (Ahnii/Baamaapii) are optional, use when appropriate (announcements, milestone posts)
- No emoji, no hashtags unless requested

## Content Seed to Copy Examples

**Seed:** "Closed waaseyaa/framework#1093 — Added SovereigntyProfile to Layer 0. Communities can now declare local/hybrid/cloud sovereignty mode."

**Facebook output:**
Added SovereigntyProfile to Layer 0 of the Waaseyaa framework. Communities can now declare their sovereignty mode: local (everything on their hardware), hybrid, or cloud.

This is the foundation for Giiken's data isolation. A community running in local mode will never have a byte leave their machine.

https://github.com/waaseyaa/framework/issues/1093

**X output:**
SovereigntyProfile landed in Waaseyaa. Communities declare local/hybrid/cloud mode — local means zero data leaves their hardware. https://github.com/waaseyaa/framework/issues/1093

**LinkedIn output:**
Shipped SovereigntyProfile in the Waaseyaa framework. Indigenous communities can now declare their data sovereignty mode at the infrastructure level: local, hybrid, or cloud.

Local mode means the entire stack runs on community hardware. No external calls, no cloud dependency. This is the foundation that Giiken's knowledge management builds on.

https://github.com/waaseyaa/framework/issues/1093
```

- [ ] **Step 2: Verify**

```bash
ls -la ~/.claude/skills/content-produce/SKILL.md
```

---

### Task 5: Curation Skill

Claude Code skill that presents `stage:mined` issues for batch curation.

**Files:**
- Create: `~/.claude/skills/content-curate/SKILL.md`

- [ ] **Step 1: Create the curation skill**

```bash
mkdir -p ~/.claude/skills/content-curate
```

Create `~/.claude/skills/content-curate/SKILL.md`:

```markdown
---
name: content-curate
description: Review and curate mined content queue items. Use when user says "curate", "what's in my content queue?", "review content ideas", or "/curate".
---

# Content Curation

## Overview

Present `stage:mined` content queue issues as a batch for quick human decisions: approve, skip, merge, or edit.

## Process

1. **Fetch mined items:**
   ```bash
   gh issue list --repo jonesrussell/jonesrussell --label "stage:mined" --json number,title,body,createdAt --limit 20
   ```

2. **Present each item.** For each issue, show:
   - Issue number and title
   - Source summary (where this came from)
   - Content seed (1-3 sentence summary of the raw material)
   - Suggested type and channels
   - Your recommendation: why this might make a good post, or why it might not

3. **Ask for a decision on each item:**
   - **Approve** — confirm or adjust type/channels, then:
     ```bash
     gh issue edit <N> --repo jonesrussell/jonesrussell --remove-label "stage:mined" --add-label "stage:curated"
     ```
   - **Skip** — close with skip label:
     ```bash
     gh issue close <N> --repo jonesrussell/jonesrussell
     gh issue edit <N> --repo jonesrussell/jonesrussell --add-label "skipped"
     ```
   - **Merge** — combine with another item (ask which one), update the target issue's seed, skip the source
   - **Edit** — update the seed material, type, or channels before approving

4. **Batch summary.** After processing all items, report:
   - N approved (ready for production)
   - N skipped
   - N merged
   - Suggest running `/content-produce` next for the approved items

## Presentation Style

Keep it scannable. One item at a time. Example:

```
**#15: [content] SovereigntyProfile shipped in Waaseyaa**
Source: waaseyaa/framework commit abc1234 (2026-04-04)
Seed: Added SovereigntyProfile to Layer 0. Communities declare local/hybrid/cloud sovereignty mode.
Suggested: text-post → x, linkedin, facebook

This is a good candidate. Concrete feature, ties to data sovereignty narrative.

→ Approve / Skip / Merge / Edit?
```

## When Queue Is Empty

If no `stage:mined` items exist, say so and suggest:
- Running the mining skill (`/content-mine`) to scan recent activity
- Creating a content idea manually via the issue template
```

- [ ] **Step 2: Verify**

```bash
ls -la ~/.claude/skills/content-curate/SKILL.md
```

---

### Task 6: Manual Mining Skill

Claude Code skill for on-demand mining of recent work activity.

**Files:**
- Create: `~/.claude/skills/content-mine/SKILL.md`

- [ ] **Step 1: Create the mining skill**

```bash
mkdir -p ~/.claude/skills/content-mine
```

Create `~/.claude/skills/content-mine/SKILL.md`:

```markdown
---
name: content-mine
description: Scan recent git and GitHub activity to surface content ideas. Use when user says "mine my work", "what's postable?", "content ideas", or "/content-mine".
---

# Content Mining

## Overview

Scan recent activity across repos to surface content ideas. Create content queue issues for anything worth posting about.

## Process

1. **Determine time range.** Default: last 7 days. User can specify: "mine the last 3 days", "mine since Monday".

2. **Scan sources.** For each source, look for notable activity:

   **Git commits (key repos):**
   ```bash
   for repo in waaseyaa/framework waaseyaa/giiken jonesrussell/blog jonesrussell/jonesrussell; do
     echo "=== $repo ==="
     gh api repos/$repo/commits --jq '.[].commit | "\(.author.date) \(.message)"' --paginate 2>/dev/null | head -20
   done
   ```

   **Closed issues and milestones:**
   ```bash
   for repo in waaseyaa/framework waaseyaa/giiken jonesrussell/jonesrussell; do
     echo "=== $repo ==="
     gh issue list --repo $repo --state closed --json number,title,closedAt --limit 10
   done
   ```

   **New design specs:**
   ```bash
   find ~/dev/blog/docs/superpowers/specs/ -name "*.md" -newer /tmp/last-mine-marker 2>/dev/null
   ```

   **Blog posts published:**
   ```bash
   find ~/dev/blog/content/posts/ -name "index.md" -newer /tmp/last-mine-marker 2>/dev/null
   ```

3. **Filter noise.** Skip:
   - Merge commits, dependency bumps, CI fixes
   - Commits with messages under 10 characters
   - Typo fixes, formatting-only changes
   - Anything already in the content queue (check existing issues)

4. **Assess each candidate.** For each remaining item, ask:
   - Does this demonstrate something interesting? (feature, technique, milestone)
   - Would this resonate with the audience? (Indigenous tech, open source, PHP, AI-augmented dev)
   - Is there enough substance for a post?

5. **Create queue issues.** For each surfaceable item:
   ```bash
   gh issue create --repo jonesrussell/jonesrussell \
     --title "[content] <descriptive title>" \
     --label "content-queue,stage:mined,type:<suggested-type>" \
     --body "<filled content queue template>"
   ```

6. **Update marker.**
   ```bash
   touch /tmp/last-mine-marker
   ```

7. **Report.** Show what was mined:
   - N items surfaced (with issue numbers)
   - Key themes spotted
   - Suggest running `/curate` to review

## Noise Filtering Heuristics

| Signal | Keep | Skip |
|--------|------|------|
| Feature commit with description | yes | |
| "fix typo", "update deps" | | yes |
| Milestone closed | yes | |
| Issue with 1-line body | | yes |
| Design spec created | yes | |
| CI/CD config change | | yes |
| New blog post published | yes | |
| Merge commit | | yes |

## Over-Surface

When in doubt, create the issue. It's easier to skip during curation than to miss something worth posting.
```

- [ ] **Step 2: Verify**

```bash
ls -la ~/.claude/skills/content-mine/SKILL.md
```

---

### Task 7: Daily Mining GitHub Action

Automated daily scan that creates content queue issues.

**Files:**
- Create: `.github/workflows/content-mine.yml` (in jonesrussell/jonesrussell)

- [ ] **Step 1: Create the workflow file**

```bash
cd ~/dev/jonesrussell
mkdir -p .github/workflows
```

Create `.github/workflows/content-mine.yml`:

```yaml
name: Content Mining

on:
  schedule:
    # Run daily at 8am ET (12:00 UTC)
    - cron: '0 12 * * *'
  workflow_dispatch: # Allow manual trigger

permissions:
  issues: write
  contents: read

jobs:
  mine:
    runs-on: ubuntu-latest
    steps:
      - name: Mine recent activity
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          SINCE=$(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)
          echo "Mining activity since $SINCE"

          # Repos to scan
          REPOS="waaseyaa/framework waaseyaa/giiken jonesrussell/jonesrussell"

          for REPO in $REPOS; do
            echo "=== Scanning $REPO ==="

            # Get recent commits (skip merge commits, deps, typos)
            COMMITS=$(gh api "repos/$REPO/commits?since=$SINCE" \
              --jq '.[] | select(.commit.message | test("^(Merge|chore|fix typo|bump|update dep)"; "i") | not) | {sha: .sha[0:7], message: .commit.message, date: .commit.author.date}' \
              2>/dev/null || echo "")

            if [ -n "$COMMITS" ]; then
              echo "$COMMITS" | while IFS= read -r line; do
                MSG=$(echo "$line" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['message'].split('\n')[0])")
                SHA=$(echo "$line" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['sha'])")

                # Skip short messages
                if [ ${#MSG} -lt 10 ]; then continue; fi

                # Check if already in queue
                EXISTING=$(gh issue list --repo jonesrussell/jonesrussell --label "content-queue" --search "$SHA" --json number --jq 'length')
                if [ "$EXISTING" != "0" ]; then continue; fi

                echo "Surfacing: $MSG ($SHA)"
                gh issue create --repo jonesrussell/jonesrussell \
                  --title "[content] $MSG" \
                  --label "content-queue,stage:mined,type:text-post" \
                  --body "## Source
          Commit $SHA in $REPO

          ## Content Seed
          $MSG

          ## Suggested Type
          text-post

          ## Suggested Channels
          x, linkedin, facebook

          ## Generated Artifacts
          <!-- To be filled by production skill -->"
              done
            fi

            # Get recently closed issues
            CLOSED=$(gh issue list --repo "$REPO" --state closed --json number,title,closedAt \
              --jq ".[] | select(.closedAt > \"$SINCE\")" 2>/dev/null || echo "")

            if [ -n "$CLOSED" ]; then
              echo "$CLOSED" | while IFS= read -r line; do
                TITLE=$(echo "$line" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['title'])")
                NUM=$(echo "$line" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['number'])")

                EXISTING=$(gh issue list --repo jonesrussell/jonesrussell --label "content-queue" --search "$REPO#$NUM" --json number --jq 'length')
                if [ "$EXISTING" != "0" ]; then continue; fi

                echo "Surfacing closed issue: $TITLE"
                gh issue create --repo jonesrussell/jonesrussell \
                  --title "[content] $TITLE" \
                  --label "content-queue,stage:mined,type:text-post" \
                  --body "## Source
          Closed issue $REPO#$NUM

          ## Content Seed
          $TITLE

          ## Suggested Type
          text-post

          ## Suggested Channels
          x, linkedin, facebook

          ## Generated Artifacts
          <!-- To be filled by production skill -->"
              done
            fi
          done

          echo "Mining complete."
```

- [ ] **Step 2: The action needs a PAT for cross-repo access**

The default `GITHUB_TOKEN` can only access the jonesrussell/jonesrussell repo. To scan waaseyaa/* repos, add the existing `vault_waaseyaa_split_github_token` as a repo secret:

```bash
# Add the PAT as a secret (get value from ansible vault)
cd ~/dev/northcloud-ansible
TOKEN=$(ansible-vault view inventory/group_vars/all/vault.yml | grep vault_waaseyaa_split_github_token | cut -d'"' -f2)
gh secret set CROSS_REPO_TOKEN --repo jonesrussell/jonesrussell --body "$TOKEN"
```

Then update the workflow to use it:
```yaml
env:
  GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
```

- [ ] **Step 3: Commit and push**

```bash
cd ~/dev/jonesrussell
git add .github/workflows/content-mine.yml
git commit -m "feat: add daily content mining GitHub Action"
git push origin main
```

- [ ] **Step 4: Test with manual trigger**

```bash
gh workflow run content-mine.yml --repo jonesrussell/jonesrussell
# Wait ~30 seconds, then check
gh run list --repo jonesrussell/jonesrussell --workflow content-mine.yml --limit 1
```

Expected: Workflow runs successfully. Check for any newly created content queue issues.

---

### Task 8: End-to-End Smoke Test

Test the full pipeline from mining to distribution.

- [ ] **Step 1: Mine**

Invoke `/content-mine` or run the mining skill manually. Verify at least one `stage:mined` issue is created.

```bash
gh issue list --repo jonesrussell/jonesrussell --label "stage:mined" --json number,title
```

- [ ] **Step 2: Curate**

Invoke `/curate`. Approve at least one item. Verify it moves to `stage:curated`.

```bash
gh issue list --repo jonesrussell/jonesrussell --label "stage:curated" --json number,title
```

- [ ] **Step 3: Produce**

Invoke `/content-produce` on the curated item. Review generated copy. Verify issue moves to `stage:ready`.

```bash
gh issue list --repo jonesrussell/jonesrussell --label "stage:ready" --json number,title
```

- [ ] **Step 4: Distribute**

Invoke `/content-distribute` on the ready item. Verify posts appear on all three platforms. Verify issue moves to `stage:distributed` and is closed.

```bash
gh issue list --repo jonesrussell/jonesrussell --label "stage:distributed" --state closed --json number,title
```

- [ ] **Step 5: Document results**

Note any friction points, errors, or improvements needed. These feed into future iterations.
