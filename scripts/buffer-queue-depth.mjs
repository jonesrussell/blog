#!/usr/bin/env node
// Report Buffer scheduled-post depth per channel; the content autopilot's throttle.
// Env-first credentials (CI), Ansible-vault fallback (local).
// Usage: node scripts/buffer-queue-depth.mjs [cap]
// Exit: 0 = all channels below cap (safe to queue more)
//       1 = one or more channels at/above cap (queue is full — stop producing)
//       2 = credential or API error (treat as unsafe)

import { execSync } from "node:child_process";

const CAP = Number(process.argv[2] || 9);

function fromVault() {
  const home = process.env.HOME;
  try {
    const raw = execSync(
      `ansible-vault view ${home}/dev/waaseyaa-infra/ansible/group_vars/all/vault.yml --vault-password-file ${home}/.ansible-vault-password`,
      { env: { ...process.env, LC_ALL: "C.UTF-8", LANG: "C.UTF-8" } },
    ).toString();
    const get = (k) => raw.match(new RegExp(`${k}:\\s*["']?([^\\s"']+)`))?.[1];
    return {
      key: get("vault_buffer_api_key"),
      facebook: get("vault_buffer_channel_facebook"),
      linkedin: get("vault_buffer_channel_linkedin"),
      bluesky: get("vault_buffer_channel_bluesky"),
    };
  } catch {
    return {};
  }
}

let key = process.env.BUFFER_API_KEY;
let channels = {
  facebook: process.env.BUFFER_CHANNEL_FACEBOOK,
  linkedin: process.env.BUFFER_CHANNEL_LINKEDIN,
  bluesky: process.env.BUFFER_CHANNEL_BLUESKY,
};
if (!key || !channels.facebook || !channels.linkedin || !channels.bluesky) {
  const v = fromVault();
  key ??= v.key;
  channels.facebook ||= v.facebook;
  channels.linkedin ||= v.linkedin;
  channels.bluesky ||= v.bluesky;
}
if (!key || !channels.facebook || !channels.linkedin || !channels.bluesky) {
  console.error("Error: missing BUFFER_API_KEY or channel ids (env or vault)");
  process.exit(2);
}

async function gql(query) {
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "User-Agent": "content-autopilot/1.0",
    },
    body: JSON.stringify({ query }),
  });
  const data = JSON.parse((await res.text()) || "{}");
  if (data.errors) throw new Error(data.errors[0]?.message || "GQL error");
  return data;
}

let orgId;
try {
  const r = await gql(`{ channel(input: { id: ${JSON.stringify(channels.facebook)} }) { organizationId } }`);
  orgId = r.data.channel.organizationId;
} catch (e) {
  console.error(`Error: could not resolve organizationId — ${e.message}`);
  process.exit(2);
}

let atCap = false;
let errored = false;
console.log("Buffer queue depth (scheduled posts pending):");
for (const [platform, chId] of Object.entries(channels)) {
  const q = `{ posts(input: { organizationId: ${JSON.stringify(orgId)}, filter: { channelIds: [${JSON.stringify(chId)}], status: scheduled } } first: 10) { ... on PostsResults { edges { node { dueAt } } pageInfo { hasNextPage } } } }`;
  try {
    const d = await gql(q);
    const p = d.data?.posts || {};
    const count = (p.edges || []).length;
    const hasNext = p.pageInfo?.hasNextPage || false;
    const near = hasNext || count >= CAP;
    if (near) atCap = true;
    console.log(`  ${platform.padEnd(9)} ${hasNext ? "10+" : String(count)}${near ? "  *** AT/NEAR CAP ***" : ""}`);
  } catch (e) {
    errored = true;
    console.log(`  ${platform.padEnd(9)} ERROR: ${e.message}`);
  }
}

if (atCap) {
  console.log(`\nWARNING: a channel is at >= ${CAP}/10. Autopilot should stop producing until Buffer drains.`);
  process.exit(1);
}
if (errored) {
  console.log("\nSome channels unreadable — treat as unsafe.");
  process.exit(2);
}
console.log(`\nAll channels below ${CAP}/10. Safe to produce and queue.`);
process.exit(0);
