---
title: "Separate AI drafting from publication authority"
date: 2026-11-02
categories: [devops]
tags: [automation, github-actions, ai, hugo]
summary: "How this blog moved AI drafting onto a local desktop while keeping capacity checks, validation, deployment, and social delivery behind reproducible cloud gates."
slug: "separate-ai-drafting-from-publication-authority"
draft: false
---

Ahnii!

This blog used to put the whole publishing job inside one GitHub Actions workflow. The job checked capacity, called an AI CLI, wrote the article, built the site, committed the result, and handed social delivery to Buffer. That was convenient until the hosted generator became the least reliable part of the system.

The replacement did not move the entire pipeline onto my computer. It split the pipeline at a more useful boundary: judgment happens locally, while publication authority stays behind deterministic checks.

That distinction matters. An AI agent is useful for reading source changes, deciding whether a topic deserves an article, and drafting prose. It should not get to redefine the conditions under which that prose becomes public.

## Make the cloud gate read-only

The old `content-autopilot.yml` was a 250-line publishing workflow with repository write access. The replacement is a small, manually dispatched preflight with read-only repository permissions.

Its job is to inspect current state and return evidence:

- the Toronto calendar date
- the exact `main` commit checked
- whether an article was already published that day
- whether the social outbox is still pending
- whether Buffer has room
- which mined issues are still unprocessed

The result is uploaded as a JSON artifact. It includes a caller-supplied request ID, so a local run can find the exact workflow execution after an uncertain network response instead of dispatching a duplicate.

The artifact is not merely a list of suggestions. It is a short-lived authorization tied to a date and a Git commit. The local publication tool rejects it after two hours, rejects it on the wrong Toronto day, and rejects it if the checkout no longer matches the recorded `baseSha`.

That turns a potentially fuzzy handoff into a concrete contract:

```text
preflight artifact + exact checkout + selected candidate = eligible draft
```

If any term changes, the run goes back through preflight.

## Keep judgment local

The local Codex session handles the part that benefits from context and judgment. It reads the candidate issue as a lead, opens the actual source commit, searches published work for overlap, and can decide that no candidate is worth publishing.

That final option is important. A daily schedule is permission to look, not an obligation to manufacture an article.

When a topic does merit a post, the local run creates only the article and its three social variants. A result file names the source issue, slug, expected paths, and the HTTPS sources that were actually checked. The staging script then validates the result against the preflight before it touches publication records.

The validation is intentionally boring. It checks path shapes, frontmatter, date, source links, social sections, canonical URLs, duplicate issue numbers, daily limits, and a pending outbox. It also refuses to overwrite an existing article. The prose still requires judgment, but the publication invariants do not.

## Commit one bounded transaction

Staging produces five related changes:

1. the Hugo page bundle
2. the social copy
3. a dated publication record
4. the processed-issue ledger
5. the Buffer outbox

Those files are committed together through a pull request. This is the durable boundary of the run. If the process stops before that commit, there is no published record to reconcile. If it stops after the commit, the ledger and outbox describe exactly what remains.

The pull request receives a separate `Content Validation` check. That check installs dependencies from scratch, runs the Node test suite, validates every saved publication record, and builds the production Hugo site. The local agent can propose a change, but it cannot declare its own proposal deployable.

The merge is also pinned to the reviewed head commit. If the branch changes after validation, the merge command fails instead of silently accepting a different revision.

## Let deployment unlock delivery

Merging the article still does not send social posts. Pages must successfully deploy the exact merge first.

Only then does Buffer Posting read the durable outbox. Before it mutates anything, it verifies that each canonical article URL is publicly reachable and that the rendered page contains canonical publication evidence. A successful Git commit is not treated as proof that readers can reach the article.

Social delivery has its own reconciliation rules. The delivery script scans scheduled, sending, sent, failed, and draft posts. It matches exact normalized copy, rejects multiple matches, and records a receipt as it works. If a create response is uncertain, the next run inspects Buffer instead of blindly creating another post.

After all three channels are verified, the workflow appends the receipt to a delivery ledger and clears the outbox. Until that happens, the next preflight refuses to authorize another article.

## Authority belongs in the reproducible layer

Moving AI work out of GitHub Actions solved a billing and reliability problem, but the architectural improvement is broader.

The local agent owns interpretation: what changed, what is useful, what overlaps, and how to explain it. Versioned scripts and cloud checks own authority: whether the source state is current, whether the records are consistent, whether the site builds, whether the article is live, and whether delivery already happened.

That separation makes the pipeline easier to resume because every boundary leaves evidence. It also makes the AI replaceable. The drafting tool can change without moving the gates, ledgers, deployment checks, or delivery contracts that keep publication safe.

Baamaapii
