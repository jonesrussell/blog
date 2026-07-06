#!/usr/bin/env node
// Snapshot per-channel post metrics from Buffer's GraphQL API (requires a token
// with insights:read — rotated 2026-07-06).
// - Appends one row per channel per run to docs/social/metrics/buffer-snapshots.csv
// - Rewrites docs/social/metrics/buffer-posts.csv with per-post metrics
// Auth: BUFFER_API_KEY env var, falling back to the waaseyaa-infra Ansible vault
// (local runs only). Channel IDs resolve the same way.
// Run: node scripts/buffer-metrics.mjs  (or: task metrics:buffer)

import { execSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORG_ID = "6850ca634a7f61140c124798";
const SAMPLE_PER_CHANNEL = 20;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "social", "metrics");

function fromVault() {
  const home = process.env.HOME;
  const raw = execSync(
    `ansible-vault view ${home}/dev/waaseyaa-infra/ansible/group_vars/all/vault.yml --vault-password-file ${home}/.ansible-vault-password`,
    { env: { ...process.env, LC_ALL: "C.UTF-8", LANG: "C.UTF-8" } },
  ).toString();
  const get = (k) => raw.match(new RegExp(`${k}:\\s*["']?([^\\s"']+)`))?.[1];
  return {
    key: get("vault_buffer_api_key"),
    channels: {
      facebook: get("vault_buffer_channel_facebook"),
      linkedin: get("vault_buffer_channel_linkedin"),
      bluesky: get("vault_buffer_channel_bluesky"),
    },
  };
}

let key = process.env.BUFFER_API_KEY;
let channels = {
  facebook: process.env.BUFFER_CHANNEL_FACEBOOK,
  linkedin: process.env.BUFFER_CHANNEL_LINKEDIN,
  bluesky: process.env.BUFFER_CHANNEL_BLUESKY,
};
if (!key || !channels.facebook) {
  const v = fromVault();
  key ??= v.key;
  channels = { ...v.channels, ...Object.fromEntries(Object.entries(channels).filter(([, x]) => x)) };
}
if (!key) {
  console.error("No BUFFER_API_KEY in env or vault.");
  process.exit(1);
}

async function gql(query) {
  const res = await fetch("https://api.buffer.com/1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// Buffer metric names vary per channel; normalize to summable columns.
const COLS = ["impressions", "reach", "reactions", "comments", "shares", "clicks"];
const NAME_MAP = { reposts: "shares" };
const normalize = (metrics) => {
  const out = Object.fromEntries(COLS.map((c) => [c, 0]));
  for (const m of metrics ?? []) {
    const name = NAME_MAP[m.name.toLowerCase()] ?? m.name.toLowerCase();
    if (name in out) out[name] += Number(m.value) || 0;
  }
  return out;
};

mkdirSync(OUT_DIR, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const csvEscape = (s) => `"${String(s).replaceAll('"', '""')}"`;

const snapPath = join(OUT_DIR, "buffer-snapshots.csv");
if (!existsSync(snapPath)) {
  writeFileSync(snapPath, `date,channel,posts_sampled,${COLS.join(",")}\n`);
}

const postRows = [];
for (const [channel, id] of Object.entries(channels)) {
  if (!id) continue;
  const data = await gql(
    `query { posts(input: { organizationId: "${ORG_ID}", filter: { channelIds: ["${id}"], status: sent } }, first: ${SAMPLE_PER_CHANNEL}) { edges { node { sentAt text metrics { name value } } } } }`,
  );
  const nodes = data.posts.edges.map((e) => e.node);
  const totals = Object.fromEntries(COLS.map((c) => [c, 0]));
  for (const n of nodes) {
    const m = normalize(n.metrics);
    for (const c of COLS) totals[c] += m[c];
    postRows.push(
      [channel, n.sentAt?.slice(0, 10) ?? "", ...COLS.map((c) => m[c]), csvEscape((n.text ?? "").replace(/\s+/g, " ").slice(0, 100))].join(","),
    );
  }
  appendFileSync(snapPath, [today, channel, nodes.length, ...COLS.map((c) => totals[c])].join(",") + "\n");
  console.log(
    `${channel}: ${nodes.length} posts — ` + COLS.map((c) => `${c}=${totals[c]}`).join(" "),
  );
}

writeFileSync(
  join(OUT_DIR, "buffer-posts.csv"),
  `channel,sent,${COLS.join(",")},text\n` + postRows.join("\n") + "\n",
);
console.log(`Wrote ${snapPath} and buffer-posts.csv.`);
