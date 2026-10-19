import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePublication, torontoDate } from './content-local.mjs';
import { ensureLivePages } from './buffer-delivery.mjs';

const now = Date.parse('2026-10-20T13:00:00Z');
function fixture() {
  return {
    now,
    result: { status: 'PUBLISH', issue: 123, slug: 'useful-post', post_path: 'content/posts/php/useful-post/index.md', social_path: 'docs/social/useful-post.md', sources: ['https://www.php-fig.org/psr/psr-14/'] },
    preflight: { proceed: true, checkedAt: '2026-10-20T12:55:00Z', date: '2026-10-20', candidates: [{ number: 123 }] },
    ledger: { processed: [] }, outbox: { posts: [] },
    post: '---\ntitle: A useful post\nsummary: Learn a useful thing.\nslug: useful-post\ndate: 2026-10-20\ndraft: false\ntags: [php]\n---\nAhnii!\n\n' + 'This is a test fixture for validating publication boundaries. '.repeat(20) + '\n\nBaamaapii',
    social: ['Bluesky', 'LinkedIn', 'Facebook'].map(p => `## ${p}\nA useful post: https://jonesrussell.github.io/blog/useful-post/`).join('\n\n'),
  };
}
test('Toronto publication dates follow local midnight and daylight saving', () => {
  assert.equal(torontoDate(Date.parse('2026-10-20T03:30:00Z')), '2026-10-19');
  assert.equal(torontoDate(Date.parse('2026-12-20T04:30:00Z')), '2026-12-19');
});
test('valid bundle resolves its canonical URL', () => {
  assert.equal(validatePublication(fixture()).url, 'https://jonesrussell.github.io/blog/useful-post/');
});
test('stale, failed and wrong-day preflights cannot publish', () => {
  for (const patch of [{ checkedAt: '2026-10-20T10:00:00Z' }, { proceed: false }, { date: '2026-10-19' }, { checkedAt: 'invalid' }]) {
    const f = fixture(); Object.assign(f.preflight, patch);
    assert.throws(() => validatePublication(f), /Preflight/);
  }
});
test('duplicate issue, daily limit, unknown candidate and pending delivery stop publication', () => {
  for (const fault of ['duplicate', 'daily', 'candidate', 'outbox']) {
    const f = fixture();
    if (fault === 'duplicate') f.ledger.processed = [123];
    if (fault === 'daily') f.ledger.lastPublishedOn = '2026-10-20';
    if (fault === 'candidate') f.preflight.candidates = [];
    if (fault === 'outbox') f.outbox.posts = [{ id: 'pending' }];
    assert.throws(() => validatePublication(f), undefined, fault);
  }
});
test('unverified sources, traversal, wrong dates and missing channel URLs are rejected', () => {
  for (const fault of ['sources', 'path', 'date', 'social']) {
    const f = fixture();
    if (fault === 'sources') f.result.sources = [];
    if (fault === 'path') f.result.post_path = '../../other.md';
    if (fault === 'date') f.post = f.post.replace('2026-10-20', '2026-10-21');
    if (fault === 'social') f.social = f.social.replace('https://jonesrussell.github.io/blog/useful-post/', '');
    assert.throws(() => validatePublication(f), undefined, fault);
  }
});
test('social delivery waits for a live canonical blog page', async () => {
  const posts = [{ url: 'https://jonesrussell.github.io/blog/useful-post/' }];
  await assert.rejects(ensureLivePages(posts, async () => ({ ok: false, status: 404 })), /not live/);
  await assert.rejects(ensureLivePages(posts, async () => ({ ok: true, text: async () => 'not an article' })), /canonical/);
  await ensureLivePages(posts, async () => ({ ok: true, text: async () => `<link rel="canonical" href="${posts[0].url}">` }));
});
