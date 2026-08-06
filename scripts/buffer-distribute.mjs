#!/usr/bin/env node
// Distribute a docs/social/<slug>.md file to Buffer: one queued post per platform section.
// Parses "## Bluesky", "## LinkedIn", "## Facebook" headings and queues each body.
// Env-first credentials (CI), Ansible-vault fallback (local).
// Usage: node scripts/buffer-distribute.mjs <social-md-file> [addToQueue|shareNow]

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [file, mode = "addToQueue"] = process.argv.slice(2);
if (!file) {
  console.error("Usage: buffer-distribute.mjs <social-md-file> [mode]");
  process.exit(1);
}

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
const channels = {
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
if (!key) {
  console.error("Error: missing BUFFER_API_KEY (env or vault)");
  process.exit(2);
}

// Parse "## Platform" sections out of the markdown (split-based; robust for the last section).
const md = readFileSync(file, "utf8");
const parsed = {};
for (const part of md.split(/^##[ \t]+/m).slice(1)) {
  const nl = part.indexOf("\n");
  const name = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase();
  parsed[name] = (nl === -1 ? "" : part.slice(nl + 1)).trim();
}
const bodies = {
  bluesky: parsed.bluesky || "",
  linkedin: parsed.linkedin || "",
  facebook: parsed.facebook || "",
};

async function createPost(platform, text) {
  const channelId = channels[platform];
  if (!channelId) return { platform, ok: false, msg: "no channel id" };
  if (platform === "bluesky" && [...text].length > 300) {
    return { platform, ok: false, msg: `bluesky ${[...text].length} chars > 300` };
  }
  const meta = platform === "facebook" ? "metadata: { facebook: { type: post } }" : "";
  const query = `mutation { createPost(input: { channelId: ${JSON.stringify(channelId)} text: ${JSON.stringify(text)} mode: ${mode} schedulingType: automatic ${meta} }) { ... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message } } }`;
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "User-Agent": "content-autopilot/1.0",
    },
    body: JSON.stringify({ query }),
  });
  const json = JSON.parse((await res.text()) || "{}");
  const result = json.data?.createPost ?? {};
  if (json.errors || result.message) {
    return { platform, ok: false, msg: json.errors?.[0]?.message ?? result.message };
  }
  return { platform, ok: true, id: result.post.id, status: result.post.status, dueAt: result.post.dueAt };
}

let failures = 0;
for (const platform of ["bluesky", "linkedin", "facebook"]) {
  const text = bodies[platform];
  if (!text) {
    console.log(`SKIP  ${platform} (no section)`);
    continue;
  }
  const r = await createPost(platform, text);
  if (r.ok) {
    console.log(`QUEUED ${platform} id=${r.id} status=${r.status}${r.dueAt ? ` dueAt=${r.dueAt}` : ""}`);
  } else {
    failures++;
    console.log(`FAIL  ${platform}: ${r.msg}`);
  }
}
process.exit(failures ? 1 : 0);
