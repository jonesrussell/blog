---
categories:
    - devops
date: 2026-04-05T00:00:00Z
devto_id: 3455365
draft: false
slug: automated-content-pipeline-github-actions
summary: Build a daily content mining pipeline that scans your repos and queues post ideas as GitHub issues.
tags:
    - github-actions
    - automation
    - content
title: Automate Your Content Pipeline With GitHub Actions and Issues
---

Ahnii!

You ship work every day, but most of it never becomes a post. The problem isn't writing. It's remembering what you shipped three days ago that was actually worth talking about. This post walks through a content pipeline that mines your [GitHub](https://github.com) repos daily and queues content ideas as issues, so nothing slips through.

## How the Pipeline Works

The system has three moving parts: a [GitHub Actions](https://docs.github.com/en/actions) workflow that runs on a cron schedule, an issue template that standardizes the format, and label-based stages that track each idea from raw commit to published post.

```
commit lands → Action mines it → issue created (stage:mined)
  → you curate (stage:curated) → produce copy (stage:ready) → distribute
```

Every stage is a GitHub label. You always know where each content idea sits, and nothing moves forward without your decision.

## The Mining Workflow

The workflow runs daily at 8am ET, scans a list of repos, and creates issues for commits that look like real work.

```yaml
name: Content Mining

on:
  schedule:
    - cron: '0 12 * * *'
  workflow_dispatch:

permissions:
  issues: write
  contents: read
```

The `workflow_dispatch` trigger lets you run it manually when you want to catch up. Permissions are scoped to just what the job needs: reading commits and writing issues.

The core loop iterates over repos and fetches recent commits via the GitHub API:

```yaml
env:
  GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
run: |
  SINCE=$(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)
  REPOS="waaseyaa/framework waaseyaa/giiken jonesrussell/jonesrussell"

  for REPO in $REPOS; do
    COMMITS=$(gh api "repos/$REPO/commits?since=$SINCE&per_page=50" \
      --jq '.[] | select(.commit.message | test("...filter...") | not) | ...')
  done
```

The `CROSS_REPO_TOKEN` is a personal access token with read access to all repos you want to mine. Without it, the workflow can only see public repos.

## Filtering Noise

Not every commit is content. The filter regex excludes merge commits, dependency bumps, docs changes, and housekeeping fixes:

```bash
test("^(Merge |chore|docs|fix typo|bump|update dep|Bump |fix:.*
  ([Pp]hp[Ss]tan|namespace|alignment|placeholder|phpunit|mock|ignore|typo))"; "i")
```

This catches the patterns that showed up as noise in practice: PHPStan fixes, namespace alignment, test placeholders. Commits also need a minimum message length of 25 characters to filter out low-context changes like "fix test" or "update readme".

The filter will evolve. After your first curation pass, you'll know which patterns your repos produce that aren't worth posting about. Update the regex and the next run gets cleaner.

## Deduplication

Before creating an issue, the workflow checks whether a commit has already been queued:

```bash
EXISTING=$(gh issue list --repo jonesrussell/jonesrussell \
  --label "content-queue" --search "$SHA" \
  --json number --jq 'length')
if [ "$EXISTING" != "0" ]; then
  echo "Skipping (already queued): $MSG"
  continue
fi
```

This prevents duplicate issues when you re-run the workflow manually or when the cron overlaps with a manual trigger.

## The Issue Template

Each mined commit becomes an issue with a structured body:

```markdown
## Source
Commit `abc1234` in `waaseyaa/framework`

## Content Seed
feat(#571): add DomainRouterInterface, EntityTypeLifecycleRouter, SchemaRouter

## Suggested Type
text-post

## Suggested Channels
x, linkedin, facebook

## Generated Artifacts
<!-- To be filled by production skill -->
```

The "Generated Artifacts" section stays empty until you curate and produce the content. Labels track the stage: `stage:mined`, `stage:curated`, `stage:ready`, `stage:distributed`.

## The Curation Step

Mining is automated. Curation is not. You review each `stage:mined` issue and decide: approve, skip, merge with another item, or edit the seed. Skipped items get closed with an audit comment explaining why. Approved items move to `stage:curated`.

This is where judgment lives. A commit that says "feat: Community RBAC policies" might be a standalone post or might merge with two other commits into a broader story about your data model. The pipeline gives you the raw material. You shape it.

## Closed Issues as Content Sources

The workflow also scans recently closed issues across your repos:

```bash
gh issue list --repo "$REPO" --state closed \
  --json number,title,closedAt,labels \
  --jq ".[] | select(.closedAt > \"$SINCE\") | ..."
```

Closed issues often represent shipped features with richer context than a commit message. The workflow creates content queue items for those too, with the same deduplication and labeling.

## Setting It Up in Your Repos

You need three things:

1. **A personal access token** (`CROSS_REPO_TOKEN`) with `repo` scope, stored as a repository secret
2. **The workflow file** at `.github/workflows/content-mine.yml` in whichever repo you want to host the content queue
3. **The labels** created in that repo: `content-queue`, `stage:mined`, `stage:curated`, `stage:ready`, `stage:distributed`, `stage:skipped`

Create the labels first:

```bash
for label in content-queue stage:mined stage:curated stage:ready stage:distributed stage:skipped; do
  gh label create "$label" --repo your-org/your-repo
done
```

Then add the workflow, update the `REPOS` list with your repos, and trigger it manually to verify.

## What This Doesn't Do

This pipeline handles discovery, not writing. It won't draft a blog post or compose a tweet. Those are separate steps that happen after curation, when you know the angle and audience for each piece.

It also won't decide what's worth posting. That's the point. Automated mining with human curation gives you a reliable queue without losing editorial control.

Baamaapii
