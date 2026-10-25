---
title: "Preserve failed test evidence before you retry"
date: 2026-10-25
categories: [devops]
tags: [testing, ci, docker, security]
summary: "Design a qualification harness that keeps the first failure, accounts for uncertain resources, and publishes useful evidence without exposing secrets."
slug: "preserve-failed-test-evidence"
draft: false
---

Ahnii!

A qualification harness has a harder job than an ordinary test suite. It must tell you whether a real installation worked, but it also has to preserve enough evidence to explain a failure without leaking private inputs.

This post covers five controls I used while building a published-consumer qualification lane for the [Waaseyaa framework](https://github.com/waaseyaa/framework). The examples come from a specific PHP and Docker harness, but the design applies to any CI job that launches real services and produces evidence for later review.

## Start the clock before setup

If a harness starts its timeout after checkout and dependency installation, those steps are outside its claimed execution budget. A slow setup can leave too little time to stop services, export state, encrypt it, and upload the result.

The workflow records its start time in the first executable step:

```yaml
- name: Start the absolute qualification and custody clock
  run: echo "J1_JOB_STARTED_AT=$(date +%s)" >> "$GITHUB_ENV"
```

The PHP harness then derives one deadline from that timestamp:

```php
$started = (string) getenv('J1_JOB_STARTED_AT');
$this->need(ctype_digit($started) && (int) $started <= time(), 'Workflow start identity required');
$this->deadline = (int) $started + 30 * 60;
```

Every subprocess receives only the time remaining. Finalization gets a separate reserved window for stopping and exporting containers, sealing files, and writing the result. The workflow still has a larger outer timeout, so runner cleanup and artifact upload have room to finish.

The useful rule is simple: **the budget begins when work begins, not when the interesting test begins**.

## Record resource ownership before launch

Container startup can return an uncertain result. The client may time out even though the daemon created the container. If your cleanup list is updated only after a successful launch, that container disappears from your accounting.

The harness first proves that each run-owned container name is absent. It then records the name before calling `docker run`:

```php
$this->containers[] = $name;
$this->run('container-start', [
    'docker', 'run', '-d', '--name', $name,
    '--memory', '2g', '--cpus', '2',
    'j1-s1:' . getenv('GITHUB_RUN_ID'),
]);
```

Finalization inspects every possibly created name. An absent name becomes an explicit custody record. A present container is stopped, inspected, and exported. If inspection itself fails, custody remains incomplete.

This avoids a dangerous assumption: a failed launch command does not prove that no resource exists.

## Separate public evidence from private recovery state

A useful failure report and a restorable snapshot have different audiences.

The public evidence stream contains sanitized JSON records, step timings, hashes, and failure classifications. The private snapshot contains the full application bind, environment files, database side files, raw process streams, and exported container filesystems. That snapshot is encrypted before upload.

Redaction also has to match the encoding used by the output format. Replacing only the literal secret is not enough when JSON can escape characters such as `/`. The harness replaces both forms:

```php
foreach ($this->secrets as $secret) {
    $escaped = substr(json_encode($secret, JSON_THROW_ON_ERROR), 1, -1);
    $data = str_replace([$secret, $escaped], '[REDACTED]', $data);
}
```

A regression test uses a synthetic secret containing `/` and `+` to prove that the JSON representation is redacted. The private source remains inside the encrypted snapshot rather than being copied into the public report.

## Preserve the first failure

An automatic retry can turn a useful failure into a misleading pass. It can also mutate the application you need to inspect.

The qualification lane records the first failure, freezes any possibly created resources, and seals the original state. A new attempt needs a fresh application and a new snapshot identity. The failed instance is not repaired into success.

That distinction matters when a test harness is qualifying a release rather than merely checking a code path. You need to know what the first published installation did, not what it did after an unrecorded recovery sequence.

## Test the observer against reality

Two early failures were caused by the harness, not the framework.

The first expected SQLite's `database_list` pragma to return exactly one row. A real connection can contain one file-backed `main` database and an unbacked `temp` schema. The corrected predicate allows that normal `temp` row while still refusing additional attached databases, path escapes, symlinks, incorrect pragmas, and duplicate rows.

The second expected an entire log event to be JSON. The actual formatter writes the message as a text prefix and only the context as JSON. The corrected parser anchors extraction to the exact critical channel and message, then decodes the following context. Tests feed it real formatter output and prove that warnings, truncated data, and unrelated JSON are ignored.

In both cases, the right repair was to correct the observer and preserve the failed run. Changing runtime behavior to satisfy a mistaken harness would have hidden the real contract.

## A practical checklist

Before trusting a qualification lane, check that it can answer these questions:

- When did the total budget begin?
- Which resources might have been created, even after an uncertain command result?
- Can every resource be stopped, inspected, and exported?
- Which evidence is safe to publish?
- Is private recovery state encrypted and integrity-checked?
- Does a retry create a fresh identity instead of modifying the failed instance?
- Are parsers and topology checks tested against output from the real tools?
- Can the final result say that custody is incomplete instead of claiming a clean failure?

The goal is not to collect as many logs as possible. It is to make each result explainable. A pass should identify exactly what was tested. A failure should preserve the first state that failed. An uncertain cleanup should remain uncertain.

That is what turns a CI job into qualification evidence.

Baamaapii
