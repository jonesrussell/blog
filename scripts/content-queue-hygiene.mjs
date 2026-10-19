#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function staleIssues(issues, now = Date.now()) {
  const cutoff = now - 14 * 86400000;
  return issues.filter(issue => {
    if (!Number.isSafeInteger(issue.number) || !Number.isFinite(Date.parse(issue.updated_at))) {
      throw new Error('Invalid issue response; cleanup stopped');
    }
    const labels = issue.labels.map(label => label.name);
    return !issue.pull_request && issue.state === 'open' && labels.includes('content-queue') &&
      labels.includes('stage:mined') && Date.parse(issue.updated_at) < cutoff;
  });
}

function main() {
  const repo = 'jonesrussell/jonesrussell';
  const gh = args => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const pages = JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${repo}/issues?state=open&labels=content-queue,stage%3Amined&per_page=100`]));
  const candidates = staleIssues(pages.flat());
  const apply = process.argv.includes('--apply');
  console.log(`${apply ? 'Cleanup' : 'Dry run'}: ${candidates.length} stale mined issues`);
  for (const candidate of candidates) {
    console.log(`#${candidate.number}: last updated ${candidate.updated_at}`);
    if (!apply) continue;
    // Recheck immediately before changing an issue in case someone curated it meanwhile.
    const current = JSON.parse(gh(['api', `repos/${repo}/issues/${candidate.number}`]));
    if (!staleIssues([current]).length) continue;
    gh(['issue', 'close', String(current.number), '--repo', repo, '--comment', 'Auto-closed: not curated within 14 days. Reopen if still relevant.']);
    gh(['issue', 'edit', String(current.number), '--repo', repo, '--add-label', 'auto-expired']);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); } catch (error) {
    console.error(error.stderr?.toString() || error.message);
    process.exitCode = 1;
  }
}
