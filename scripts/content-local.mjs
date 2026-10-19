#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { parseSocial } from './buffer-delivery.mjs';

export const torontoDate = (now = Date.now()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(now));
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

export function validateCopy(result, post, social) {
  if (!Number.isSafeInteger(result.issue) || result.issue <= 0 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug)) throw new Error('Invalid issue or slug');
  if (!/^content\/posts\/[a-z0-9-]+\/[a-z0-9-]+\/index\.md$/.test(result.post_path) ||
      !result.post_path.endsWith(`/${result.slug}/index.md`) || result.social_path !== `docs/social/${result.slug}.md`) throw new Error('Unexpected publication paths');
  if (!Array.isArray(result.sources) || !result.sources.length || result.sources.some(s => {
    try { return new URL(s).protocol !== 'https:'; } catch { return true; }
  })) throw new Error('Verified HTTPS sources are required');
  const { data, content } = matter(post.replace(/\r\n/g, '\n'));
  if (data.draft !== false || data.slug !== result.slug || !data.title || !data.summary ||
      !Array.isArray(data.tags) || data.tags.length > 4) throw new Error('Invalid post frontmatter');
  if (!content.trim().startsWith('Ahnii!') || !content.trim().endsWith('Baamaapii')) throw new Error('Missing opening or closing');
  if (post.includes('\u2014') || social.includes('\u2014')) throw new Error('Remove em dashes');
  if (content.trim().split(/\s+/).length < 150) throw new Error('Post is too thin for automatic publication');
  const bodies = parseSocial(social);
  const url = `https://jonesrussell.github.io/blog/${result.slug}/`;
  if (Object.values(bodies).some(text => !text.includes(url))) throw new Error('Every social variant needs the canonical URL');
  return { url, date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date).slice(0, 10) };
}

export function validatePublication({ result, preflight, ledger, outbox, post, social, now = Date.now() }) {
  const today = torontoDate(now);
  if (result.status !== 'PUBLISH') throw new Error('Only PUBLISH results can be staged');
  const age = now - Date.parse(preflight.checkedAt);
  if (!preflight.proceed || !Number.isFinite(age) || age < 0 || age > 7200000 || preflight.date !== today) throw new Error('Preflight is stale or did not authorize generation');
  if (!preflight.candidates.some(c => c.number === result.issue)) throw new Error('Issue was not in the preflight candidates');
  if (ledger.processed.includes(result.issue)) throw new Error('Issue already published');
  if (ledger.lastPublishedOn === today) throw new Error('Already published today');
  if (outbox.posts.length) throw new Error('Pending Buffer delivery must complete first');
  const copy = validateCopy(result, post, social);
  if (copy.date !== today) throw new Error('Post date must be today in Toronto');
  return { ...copy, today };
}

function main() {
  const [action, resultFile, preflightFile] = process.argv.slice(2);
  if (action === 'check-records') {
    let files;
    try { files = readdirSync('data/content-publications').filter(f => f.endsWith('.json')); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const file of files) {
      const result = json(`data/content-publications/${file}`);
      // Check paths before opening any referenced file.
      if (!/^content\/posts\/[a-z0-9-]+\/[a-z0-9-]+\/index\.md$/.test(result.post_path) ||
          result.social_path !== `docs/social/${result.slug}.md` || !/^[a-z0-9-]+$/.test(result.slug)) throw new Error('Unexpected record paths');
      validateCopy(result, readFileSync(result.post_path, 'utf8'), readFileSync(result.social_path, 'utf8'));
      execFileSync(process.execPath, ['scripts/slop-check.mjs', result.post_path], { stdio: 'inherit' });
    }
    return console.log(`Validated ${files.length} publication records`);
  }
  if (!['validate', 'stage'].includes(action) || !resultFile || !preflightFile) throw new Error('Usage: content-local.mjs validate|stage <result.json> <preflight.json>');
  const result = json(resultFile), preflight = json(preflightFile);
  // Prevent both traversal and accidental replacement of an existing article.
  if (!/^content\/posts\/[a-z0-9-]+\/[a-z0-9-]+\/index\.md$/.test(result.post_path) ||
      !/^[a-z0-9-]+$/.test(result.slug) || result.social_path !== `docs/social/${result.slug}.md`) throw new Error('Unexpected publication paths');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (head !== preflight.baseSha) throw new Error('Checkout changed after preflight; refresh before staging');
  for (const path of [result.post_path, result.social_path]) {
    let tracked = false;
    try { execFileSync('git', ['cat-file', '-e', `HEAD:${path}`], { stdio: 'ignore' }); tracked = true; } catch {}
    if (tracked) throw new Error(`Refusing to overwrite tracked content: ${path}`);
  }
  const ledger = json('data/autopilot-ledger.json'), outbox = json('data/buffer-outbox.json');
  const checked = validatePublication({ result, preflight, ledger, outbox,
    post: readFileSync(result.post_path, 'utf8'), social: readFileSync(result.social_path, 'utf8') });
  execFileSync(process.execPath, ['scripts/slop-check.mjs', result.post_path], { stdio: 'inherit' });
  if (action === 'stage') {
    const recordFile = `data/content-publications/${checked.today}.json`;
    mkdirSync('data/content-publications', { recursive: true });
    writeFileSync(recordFile, JSON.stringify({ ...result, publishedOn: checked.today,
      preflightRequestId: preflight.requestId, baseSha: preflight.baseSha }, null, 2) + '\n', { flag: 'wx' });
    writeJson('data/autopilot-ledger.json', { ...ledger, lastPublishedOn: checked.today,
      processed: [...ledger.processed, result.issue].sort((a, b) => a - b) });
    writeJson('data/buffer-outbox.json', { ...outbox, posts: [{ id: result.slug, file: result.social_path, url: checked.url }] });
    console.log(`Stage together: ${result.post_path}, ${result.social_path}, ${recordFile}, data/autopilot-ledger.json, data/buffer-outbox.json`);
  }
  console.log('Local publication checks passed. Hugo CI must pass before merge.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
