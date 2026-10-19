#!/usr/bin/env node
// Deterministic Buffer delivery. Credentials stay in the environment, never in receipts.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

export const platforms = ['bluesky', 'linkedin', 'facebook'];
const limits = { bluesky: 300, linkedin: 3000, facebook: 63206 };
const normalize = text => text.replace(/\r\n/g, '\n').trim();

export function parseSocial(markdown) {
  const bodies = {};
  for (const part of markdown.split(/^##[ \t]+/m).slice(1)) {
    const nl = part.indexOf('\n');
    const platform = part.slice(0, nl < 0 ? undefined : nl).trim().toLowerCase();
    if (!platforms.includes(platform) || bodies[platform] !== undefined) {
      throw new Error(`Unexpected or duplicate social section: ${platform}`);
    }
    bodies[platform] = normalize(nl < 0 ? '' : part.slice(nl + 1));
  }
  for (const p of platforms) {
    if (!bodies[p] || [...bodies[p]].length > limits[p]) throw new Error(`Invalid ${p} text length`);
  }
  return bodies;
}

export function readManifest(file) {
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  if (!manifest.id || !Array.isArray(manifest.posts)) throw new Error('Invalid manifest');
  const socialRoot = realpathSync('docs/social');
  const seen = new Set();
  const entries = manifest.posts.flatMap(post => {
    if (!post.id || seen.has(post.id)) throw new Error('Missing or duplicate post id');
    seen.add(post.id);
    const path = realpathSync(resolve(post.file));
    const rel = relative(socialRoot, path);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Social file must be inside docs/social');
    if (post.dueAt && !Number.isFinite(Date.parse(post.dueAt))) throw new Error('Invalid dueAt');
    const bodies = parseSocial(readFileSync(path, 'utf8'));
    return platforms.map(platform => ({
      key: `${post.id}/${platform}`, platform, text: bodies[platform],
      ...(post.dueAt ? { dueAt: new Date(post.dueAt).toISOString() } : {}),
    }));
  });
  if (new Set(entries.map(e => `${e.platform}:${e.text}`)).size !== entries.length) {
    throw new Error('Duplicate campaign text on the same channel');
  }
  return { manifest, entries };
}

export function makeApi(env = process.env, fetcher = fetch) {
  const key = env.BUFFER_API_KEY;
  const ids = Object.fromEntries(platforms.map(p => [p, env[`BUFFER_CHANNEL_${p.toUpperCase()}`]]));
  if (!key || platforms.some(p => !ids[p]) || new Set(Object.values(ids)).size !== 3) {
    throw new Error('Set BUFFER_API_KEY and three distinct BUFFER_CHANNEL_* environment variables');
  }
  async function gql(query, variables = {}) {
    const response = await fetcher('https://api.buffer.com', {
      method: 'POST', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'blog-buffer-delivery/1.0' },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new Error(`Buffer HTTP ${response.status}`);
    const json = await response.json();
    if (json.errors?.length || !json.data) throw new Error(json.errors?.[0]?.message || 'Missing Buffer data');
    return json.data;
  }
  return {
    async channel(platform) {
      const data = await gql(`{ channel(input: {id: ${JSON.stringify(ids[platform])}}) {
        id name service organizationId timezone isDisconnected isLocked isQueuePaused
      } }`);
      if (!data.channel) throw new Error(`Missing ${platform} channel`);
      return data.channel;
    },
    async posts(channel) {
      // Scan all statuses so a failed, drafted or already-sent copy is never silently duplicated.
      const posts = [];
      let after = null;
      const cursors = new Set();
      for (let page = 0; page < 100; page++) {
        const data = await gql(`query ($input: PostsInput!, $after: String) {
          posts(input: $input, first: 100, after: $after) {
            ... on PostsResults { edges { node {id text status dueAt sentAt} } pageInfo {hasNextPage endCursor} }
          }
        }`, { input: { organizationId: channel.organizationId, filter: { channelIds: [channel.id] } }, after });
        const result = data.posts;
        if (!Array.isArray(result?.edges) || typeof result.pageInfo?.hasNextPage !== 'boolean') {
          throw new Error('Unreadable Buffer posts response');
        }
        for (const edge of result.edges) {
          if (!edge.node?.id || typeof edge.node.text !== 'string' || !edge.node.status) throw new Error('Invalid Buffer post');
          posts.push(edge.node);
        }
        if (!result.pageInfo.hasNextPage) return posts;
        after = result.pageInfo.endCursor;
        if (!after || cursors.has(after)) throw new Error('Buffer pagination did not advance');
        cursors.add(after);
      }
      throw new Error('Buffer history exceeded safety limit; nothing submitted');
    },
    async create(entry, channel) {
      const input = {
        channelId: channel.id, text: entry.text, schedulingType: 'automatic',
        mode: entry.dueAt ? 'customScheduled' : 'addToQueue',
        ...(entry.dueAt ? { dueAt: entry.dueAt } : {}),
        ...(entry.platform === 'facebook' ? { metadata: { facebook: { type: 'post' } } } : {}),
      };
      const data = await gql(`mutation ($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {post {id text status dueAt}}
          ... on MutationError {message}
        }
      }`, { input });
      const result = data.createPost;
      if (!result?.post?.id) throw new Error(result?.message || 'Unknown createPost outcome; inspect before retrying');
      return result.post;
    },
  };
}

export function matchExisting(entry, posts) {
  const matches = posts.filter(p => normalize(p.text) === entry.text);
  if (matches.length > 1) throw new Error(`Multiple copies already exist: ${entry.key}`);
  if (!matches.length) return null;
  const post = matches[0];
  if (!['scheduled', 'sent', 'sending'].includes(post.status)) throw new Error(`Existing ${entry.key} has status ${post.status}`);
  if (entry.dueAt && Date.parse(entry.dueAt) !== Date.parse(post.dueAt)) {
    throw new Error(`Existing ${entry.key} has a different scheduled time`);
  }
  return post;
}

export async function deliver(entries, api, { action = 'inspect', now = Date.now(), save = () => {} } = {}) {
  if (!['inspect', 'queue', 'verify'].includes(action)) throw new Error('Action must be inspect, queue or verify');
  const receipt = { action, startedAt: new Date(now).toISOString(), channels: [], posts: [] };
  const state = {};
  for (const platform of platforms) {
    const channel = await api.channel(platform);
    if (channel.service !== platform || !channel.organizationId) throw new Error(`Wrong channel for ${platform}`);
    if (channel.isDisconnected !== false || channel.isLocked !== false || channel.isQueuePaused !== false) {
      throw new Error(`${platform} channel disconnected, locked or paused`);
    }
    const posts = await api.posts(channel);
    state[platform] = { channel, posts };
    receipt.channels.push({ platform, name: channel.name, timezone: channel.timezone,
      queued: posts.filter(p => p.status === 'scheduled').length });
  }
  if (new Set(Object.values(state).map(s => s.channel.organizationId)).size !== 1) throw new Error('Channels belong to different organizations');
  const plan = entries.map(entry => {
    const { channel, posts } = state[entry.platform];
    const existing = matchExisting(entry, posts);
    if (!existing && action !== 'verify' && entry.dueAt && Date.parse(entry.dueAt) <= now + 60000) {
      throw new Error(`Scheduled time is not in the future: ${entry.key}`);
    }
    if (!existing && entry.dueAt && posts.some(p => p.status === 'scheduled' && Date.parse(p.dueAt) === Date.parse(entry.dueAt))) {
      throw new Error(`Scheduled slot already occupied: ${entry.key}`);
    }
    return { entry, channel, existing };
  });
  if (action !== 'verify') {
    for (const p of platforms) {
      const queued = state[p].posts.filter(post => post.status === 'scheduled').length;
      const missing = plan.filter(item => item.entry.platform === p && !item.existing).length;
      if (queued + missing > 10) throw new Error(`${p} would exceed the 10-post queue cap`);
    }
  }
  // Complete the preflight for every channel before the first mutation.
  save(receipt);
  for (const { entry, channel, existing } of plan) {
    let post = existing;
    let result = existing ? 'existing' : 'planned';
    if (!existing && action === 'verify') throw new Error(`Missing queued post: ${entry.key}`);
    if (!existing && action === 'queue') {
      receipt.pending = entry.key;
      save(receipt);
      // Never automatically retry a write. Reconcile live state on a new run.
      post = await api.create(entry, channel);
      if (post.status !== 'scheduled' || !post.dueAt || normalize(post.text) !== entry.text ||
          (entry.dueAt && Date.parse(post.dueAt) !== Date.parse(entry.dueAt))) {
        throw new Error(`Unexpected created post for ${entry.key}; inspect before retrying`);
      }
      result = 'created';
    }
    receipt.posts.push({ key: entry.key, result, id: post?.id, status: post?.status, dueAt: post?.dueAt || entry.dueAt });
    delete receipt.pending;
    save(receipt);
  }
  if (action === 'queue') {
    for (const p of platforms) {
      const posts = await api.posts(state[p].channel);
      for (const entry of entries.filter(e => e.platform === p)) {
        if (!matchExisting(entry, posts)) throw new Error(`Created post not found in live queue: ${entry.key}`);
      }
    }
  }
  receipt.verified = action !== 'inspect';
  save(receipt);
  return receipt;
}

async function main() {
  const [file, action = 'inspect'] = process.argv.slice(2);
  if (!file) throw new Error('Usage: buffer-delivery.mjs <manifest.json> [validate|inspect|queue|verify]');
  const { manifest, entries } = readManifest(file);
  if (action === 'validate') return console.log(`Validated ${entries.length} variants in ${manifest.id}`);
  if (!entries.length) return console.log('No pending Buffer posts.');
  const receipt = await deliver(entries, makeApi(), { action, save: r => writeFileSync('buffer-receipt.json', JSON.stringify({ campaign: manifest.id, ...r }, null, 2) + '\n') });
  console.log(JSON.stringify(receipt, null, 2));
  if (action === 'queue' && file === 'data/buffer-outbox.json') {
    const ledgerFile = 'data/buffer-delivery-ledger.json';
    const ledger = JSON.parse(readFileSync(ledgerFile, 'utf8'));
    ledger.deliveries.push({ recordedAt: new Date().toISOString(), sources: manifest.posts, posts: receipt.posts });
    writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
    writeFileSync(file, JSON.stringify({ ...manifest, posts: [] }, null, 2) + '\n');
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
