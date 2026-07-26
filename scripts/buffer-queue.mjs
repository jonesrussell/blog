#!/usr/bin/env node
// Print Buffer scheduled-queue state as JSON: per-channel pending count and
// latest due date. Used by the content-autopilot routine to compute runway.
// Auth: BUFFER_API_KEY + BUFFER_CHANNEL_* env vars, vault fallback locally.

import { execSync } from "node:child_process";

const ORG_ID = "6850ca634a7f61140c124798";

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

async function gql(query) {
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "User-Agent": "blog-metrics-script/1.0",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!text) throw new Error(`Buffer API HTTP ${res.status} empty body`);
  const json = JSON.parse(text);
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

const out = {};
for (const [name, id] of Object.entries(channels)) {
  const data = await gql(
    `query { posts(input: { organizationId: "${ORG_ID}", filter: { channelIds: ["${id}"], status: scheduled } }, first: 20) { edges { node { dueAt } } } }`,
  );
  const dues = data.posts.edges.map((e) => e.node.dueAt).filter(Boolean).sort();
  out[name] = { pending: dues.length, lastDueAt: dues.at(-1) ?? null };
}
console.log(JSON.stringify(out, null, 2));
