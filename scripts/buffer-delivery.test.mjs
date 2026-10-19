import test from 'node:test';
import assert from 'node:assert/strict';
import { deliver, platforms, parseSocial, makeApi } from './buffer-delivery.mjs';
import { staleIssues } from './content-queue-hygiene.mjs';

const now = Date.parse('2026-10-19T00:00:00Z');
const entries = platforms.map(platform => ({ key: `test/${platform}`, platform, text: `Hello ${platform}`, dueAt: '2026-10-20T14:00:00.000Z' }));
function fixture() {
  const posts = Object.fromEntries(platforms.map(p => [p, []]));
  let writes = 0;
  const api = {
    channel: async p => ({ id: p, name: p, service: p, organizationId: 'personal', isDisconnected: false, isLocked: false, isQueuePaused: false }),
    posts: async c => posts[c.id],
    create: async (e, c) => {
      writes++;
      const post = { id: String(writes), text: e.text, status: 'scheduled', dueAt: e.dueAt };
      posts[c.id].push(post);
      return post;
    },
  };
  return { api, posts, writes: () => writes };
}
test('validate every platform before submitting any post', async () => {
  const f = fixture();
  f.posts.facebook.push({ id: 'x', text: entries[2].text, status: 'error' });
  await assert.rejects(deliver(entries, f.api, { action: 'queue', now }), /status error/);
  assert.equal(f.writes(), 0);
});
test('partial accepted write reconciles on rerun without duplicates', async () => {
  const f = fixture();
  const create = f.api.create;
  f.api.create = async (e, c) => { await create(e, c); throw new Error('connection lost after acceptance'); };
  await assert.rejects(deliver(entries, f.api, { action: 'queue', now }), /connection lost/);
  assert.equal(f.writes(), 1);
  f.api.create = create;
  const result = await deliver(entries, f.api, { action: 'queue', now });
  assert.equal(f.writes(), 3);
  assert.equal(result.posts[0].result, 'existing');
  await deliver(entries, f.api, { action: 'queue', now });
  assert.equal(f.writes(), 3);
});
test('inspection does not write and verify rejects missing posts', async () => {
  const f = fixture();
  await deliver(entries, f.api, { action: 'inspect', now });
  assert.equal(f.writes(), 0);
  await assert.rejects(deliver(entries, f.api, { action: 'verify', now }), /Missing queued/);
});
test('channel mismatch, pause, full queue and conflicting dates stop writes', async () => {
  for (const fault of ['wrong-service', 'paused', 'full', 'date']) {
    const f = fixture();
    const channel = f.api.channel;
    if (fault === 'wrong-service') f.api.channel = async p => ({ ...await channel(p), service: 'other' });
    if (fault === 'paused') f.api.channel = async p => ({ ...await channel(p), isQueuePaused: true });
    if (fault === 'full') f.posts.facebook.push(...Array.from({ length: 10 }, (_, i) => ({ id: String(i), text: `Other ${i}`, status: 'scheduled' })));
    if (fault === 'date') f.posts.facebook.push({ id: 'x', text: entries[2].text, status: 'scheduled', dueAt: '2026-10-22T00:00:00Z' });
    await assert.rejects(deliver(entries, f.api, { action: 'queue', now }));
    assert.equal(f.writes(), 0, fault);
  }
});
test('invalid social text cannot silently skip a channel', () => {
  assert.throws(() => parseSocial('## Bluesky\nHi'), /length/);
  assert.throws(() => parseSocial('## Bluesky\nHi\n## Bluesky\nAgain'), /duplicate/);
  assert.throws(() => parseSocial(`## Bluesky\n${'x'.repeat(301)}\n## LinkedIn\nHi\n## Facebook\nHi`), /length/);
  assert.equal(parseSocial('## Bluesky\r\nHi\r\n## LinkedIn\r\nHello\r\n## Facebook\r\nLast').facebook, 'Last');
});
const env = { BUFFER_API_KEY: 'test', BUFFER_CHANNEL_BLUESKY: 'b', BUFFER_CHANNEL_FACEBOOK: 'f', BUFFER_CHANNEL_LINKEDIN: 'l' };
test('unreadable API results fail instead of treating queue as empty', async () => {
  const api = makeApi(env, async () => ({ ok: true, json: async () => ({ data: { posts: {} } }) }));
  await assert.rejects(api.posts({ id: 'b', organizationId: 'o' }), /Unreadable/);
});
test('history pagination includes subsequent pages', async () => {
  let calls = 0;
  const api = makeApi(env, async (_url, options) => {
    const { variables } = JSON.parse(options.body);
    assert.equal(variables.after, calls ? 'cursor1' : null);
    calls++;
    return { ok: true, json: async () => ({ data: { posts: {
      edges: [{ node: { id: String(calls), text: 'post', status: 'sent' } }],
      pageInfo: { hasNextPage: calls === 1, endCursor: 'cursor1' },
    } } }) };
  });
  assert.equal((await api.posts({ id: 'b', organizationId: 'o' })).length, 2);
});
test('cleanup ignores fresh, curated, closed and PR items and rejects malformed dates', () => {
  const issue = { number: 1, updated_at: '2026-10-01T00:00:00Z', state: 'open', labels: [{ name: 'content-queue' }, { name: 'stage:mined' }] };
  assert.deepEqual(staleIssues([issue], now), [issue]);
  assert.equal(staleIssues([
    { ...issue, updated_at: '2026-10-09T00:00:00Z' }, { ...issue, labels: [{ name: 'content-queue' }] },
    { ...issue, state: 'closed' }, { ...issue, pull_request: {} },
  ], now).length, 0);
  assert.throws(() => staleIssues([{ ...issue, updated_at: '' }], now), /Invalid/);
});
