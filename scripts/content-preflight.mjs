#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const requestId = process.env.REQUEST_ID;
if (!requestId || !/^[a-zA-Z0-9-]{1,80}$/.test(requestId)) throw new Error('Invalid request id');
const ledger = JSON.parse(readFileSync('data/autopilot-ledger.json', 'utf8'));
const outbox = JSON.parse(readFileSync('data/buffer-outbox.json', 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const result = { requestId, checkedAt: new Date().toISOString(), date: today,
  baseSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  proceed: false, reason: '', candidates: [] };
if (ledger.lastPublishedOn === today) result.reason = 'Already published today';
else if (outbox.posts.length) result.reason = 'Buffer outbox still pending';
else {
  const gate = spawnSync(process.execPath, ['scripts/buffer-queue-depth.mjs', '9'], { encoding: 'utf8', timeout: 120000 });
  process.stdout.write(gate.stdout || '');
  if (gate.error || ![0, 1].includes(gate.status)) throw new Error('Buffer preflight failed; see queue diagnostics');
  if (gate.status === 1) result.reason = 'Buffer queue at capacity';
  else {
    const pages = JSON.parse(execFileSync('gh', ['api', '--paginate', '--slurp',
      'repos/jonesrussell/jonesrussell/issues?state=open&labels=content-queue,stage%3Amined&per_page=100'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
    result.candidates = pages.flat().filter(i => !i.pull_request && !ledger.processed.includes(i.number))
      .map(i => ({ number: i.number, title: i.title, body: i.body, url: i.html_url }));
    result.proceed = result.candidates.length > 0;
    result.reason = result.proceed ? 'Ready for local curation' : 'No unprocessed candidates';
  }
}
writeFileSync('content-preflight.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ requestId, proceed: result.proceed, reason: result.reason, candidates: result.candidates.length }));
