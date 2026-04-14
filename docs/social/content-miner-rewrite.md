# Rewrote the content miner: grouping, confidence scoring, SHA dedup

Reference URL: https://github.com/jonesrussell/blog/commit/3199224

## X

Rewrote the content miner. Commit grouping, per-candidate confidence scoring, SHA dedup against the queue. Vibe-coding fix on a vibe-coded pipeline. #buildinpublic

**First reply:**
https://github.com/jonesrussell/blog/commit/3199224

## LinkedIn

Rebuilt my content miner today. The pipeline that scans my own git activity for postable ideas had a signal-to-noise problem.

The queue was drowning in single-commit noise: typo fixes, dep bumps, MIME tweaks. Each one surfacing as its own content candidate. The miner was doing its job. It just had no sense of what was interesting.

Four changes:

Commit grouping. Related commits now collapse into one seed instead of N. A rewrite and its follow-up fixes become one story, not three.

Per-candidate confidence scoring. Each seed gets a score based on signal strength, source diversity, and scope. Low-confidence noise no longer crowds out the real ideas.

SHA-based dedup. If a commit has already seeded a queue item, it does not seed another. Rerunning the miner is safe.

Configurable confidence threshold on the mining workflow, plus a weekly queue hygiene workflow to prune stale items.

The part I cannot stop laughing at: this was a vibe-coding fix on a vibe-coded pipeline. The first miner worked well enough to ship, and running it on my own repo is how the rough edges surfaced.

Building in public means your own tools mine your own work. When they are noisy, you notice fast.

#softwaredevelopment #buildinpublic #devtools #automation

**First comment:**
https://github.com/jonesrussell/blog/commit/3199224

## Facebook

Rebuilt my content miner today. It scans my git activity for postable ideas, and the queue was drowning in single-commit noise: typo fixes, dep bumps, MIME tweaks.

Added commit grouping so related commits become one seed, per-candidate confidence scoring, SHA-based dedup against the existing queue, and a configurable threshold on the mining workflow.

The part I cannot stop laughing at is that this was a vibe-coding fix on a vibe-coded pipeline. Building in public means running your own tools on your own work, and the rough edges surface fast.

#buildinpublic

**First comment:**
https://github.com/jonesrussell/blog/commit/3199224
