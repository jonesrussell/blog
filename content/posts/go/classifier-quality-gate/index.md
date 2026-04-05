---
categories:
    - go
date: 2026-03-27T00:00:00Z
devto: true
devto_id: 3457031
draft: true
slug: classifier-quality-gate
summary: How to add a configurable quality gate to a Go microservices classifier that rejects low-confidence content before it reaches your publishing pipeline.
tags:
    - go
    - machine-learning
    - pipeline
    - elasticsearch
title: Building a quality gate for a Go ML classifier pipeline
---

Ahnii!

This post covers how north-cloud's classifier service uses a quality gate to filter low-scoring content before it reaches Elasticsearch's `*_classified_content` indices and the downstream publishing pipeline.

## Prerequisites

- Familiarity with Go and basic ML pipeline concepts
- A classifier that produces a numeric quality score per document
- Elasticsearch (or any downstream store) as the sink

## Why a Gate Instead of Filtering Downstream

The classifier scores every crawled document on a 0–100 quality scale, factoring in word count, metadata completeness, readability, and content richness. Without a gate, low-quality pages, event listings, and stub articles flow into `*_classified_content` unchanged. Publisher routing layers then see noise that degrades topic feeds.

Moving the filter to the processor — between classification and indexing — means junk never enters the indices at all. Rejected documents get a `StatusFiltered` marker so the poller doesn't re-process them on the next tick.

But not all low-quality content is the same. Articles warrant a softer treatment than pages.

## The Three Outcomes

The gate produces one of three outcomes for each document:

| Condition | Action |
|-----------|--------|
| `quality_score >= threshold` | Pass through, clear `LowQuality` flag |
| `quality_score < threshold` AND `content_type = article` | Pass with `LowQuality = true` |
| `quality_score < threshold` AND `content_type != article` | Reject entirely |

Articles are too valuable to discard outright. A thin article might still have valid topic signals. Flagging it with `low_quality = true` lets downstream consumers decide whether to surface it. Pages, events, and listings below threshold get dropped.

## The Implementation

Two structs carry the gate's output:

```go
// QualityGateResult holds the output of the quality gate filter.
type QualityGateResult struct {
    Passed      []*domain.ClassifiedContent
    RejectedIDs []string // Content IDs rejected by the gate (need status update)
}
```

`Passed` feeds directly into the bulk-index call. `RejectedIDs` gets a `StatusFiltered` Elasticsearch update so those documents won't appear in the next poll batch.

The gate logic lives in a single package-private function:

```go
func applyQualityGate(
    cfg config.QualityGateConfig,
    contents []*domain.ClassifiedContent,
    logger infralogger.Logger,
) QualityGateResult {
    if !cfg.Enabled {
        return QualityGateResult{Passed: contents}
    }

    passed := make([]*domain.ClassifiedContent, 0, len(contents))
    rejectedIDs := make([]string, 0)
    flaggedCount := 0

    for _, content := range contents {
        if content.QualityScore >= cfg.Threshold {
            content.LowQuality = false
            passed = append(passed, content)
            continue
        }

        if content.ContentType == domain.ContentTypeArticle {
            content.LowQuality = true
            passed = append(passed, content)
            flaggedCount++
            continue
        }

        rejectedIDs = append(rejectedIDs, content.ID)
    }

    return QualityGateResult{
        Passed:      passed,
        RejectedIDs: rejectedIDs,
    }
}
```

When the gate is disabled the function returns immediately, passing every document through. This makes the feature flag a true no-op — no sorting, no allocation beyond the return value.

## Configuration

Two environment variables control the gate:

```yaml
# config.yml
classification:
  quality_gate:
    enabled: false                # CLASSIFIER_QUALITY_GATE_ENABLED
    threshold: 40                 # CLASSIFIER_QUALITY_GATE_THRESHOLD
```

`QualityGateConfig` maps directly to those env tags:

```go
type QualityGateConfig struct {
    Enabled   bool `env:"CLASSIFIER_QUALITY_GATE_ENABLED"   yaml:"enabled"`
    Threshold int  `env:"CLASSIFIER_QUALITY_GATE_THRESHOLD" yaml:"threshold"`
}
```

The default threshold is 40. If the config struct is zero-valued, the bootstrap sets it:

```go
if c.QualityGate.Threshold == 0 {
    c.QualityGate.Threshold = defaultQualityGateThreshold // 40
}
```

This means you can enable the gate with a single env var and get a reasonable threshold out of the box.

## Wiring Into the Poller

The gate sits between the batch classifier and the bulk-index call in the poller's processing loop:

```go
// Apply quality gate — filter/flag before indexing
gateResult := applyQualityGate(p.qualityGateCfg, classifiedContents, p.logger)
classifiedContents = gateResult.Passed

// Mark rejected documents as filtered so they don't get re-polled
for _, rejectedID := range gateResult.RejectedIDs {
    if err := p.esClient.UpdateRawContentStatus(ctx, rejectedID, domain.StatusFiltered, time.Now()); err != nil {
        p.logger.Error("Failed to update filtered content status",
            infralogger.String("content_id", rejectedID),
            infralogger.Error(err),
        )
    }
}

if len(classifiedContents) == 0 {
    return nil
}
```

After the gate runs, `classifiedContents` contains only the documents that should be indexed. The status update for rejected IDs happens one-by-one because Elasticsearch doesn't provide a bulk status-update API — individual failures are logged but don't abort the batch.

## Observability

Every flagged or rejected document produces a structured log entry:

```
level=info msg="Quality gate: flagged low-quality article"
  url=https://example.com/stub source=example content_type=article
  quality_score=28 threshold=40 reason=below_threshold

level=info msg="Quality gate: rejected non-article content"
  url=https://example.com/events/123 source=example content_type=event
  quality_score=15 threshold=40 reason=non_article_below_threshold
```

At the end of each batch, a summary log gives you totals without scanning individual entries:

```
level=info msg="Quality gate summary"
  total=50 passed=42 flagged=5 rejected=3 threshold=40
```

The summary only logs when there's something to report — clean batches produce no output.

## Enabling It Safely

The gate is off by default for a reason. On first enable, scan your existing `*_classified_content` indices to understand the score distribution before committing to a threshold. A threshold of 40 is conservative; in most feeds you'll see the bulk of legitimate articles scoring above 60.

```bash
# Check score distribution before enabling
curl -s "http://localhost:9200/*_classified_content/_search" \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"aggs":{"quality_hist":{"histogram":{"field":"quality_score","interval":10}}}}' \
  | jq '.aggregations.quality_hist.buckets'
```

This returns per-bucket counts in increments of 10, showing you exactly where your content clusters. Once you're confident in the threshold, flip the feature flag.

Baamaapii
