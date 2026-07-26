#!/usr/bin/env node
// Queue or send one Buffer post. Cloud-compatible (env vars), vault fallback locally.
// Usage: node scripts/buffer-post.mjs <facebook|linkedin|bluesky> <textfile> <addToQueue|shareNow|customScheduled> [dueAtISO]
// The post text is read from <textfile> to avoid shell-quoting hazards.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [platform, textFile, mode = "addToQueue", dueAt] = process.argv.slice(2);
if (!platform || !textFile) {
  console.error("Usage: buffer-post.mjs <platform> <textfile> [mode] [dueAtISO]");
  process.exit(1);
}
if (mode === "customScheduled" && !dueAt) {
  console.error("customScheduled requires a dueAt ISO timestamp");
  process.exit(1);
}
const text = readFileSync(textFile, "utf8").trim();
if (!text) {
  console.error(`empty text file: ${textFile}`);
  process.exit(1);
}

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
let channelId = process.env[`BUFFER_CHANNEL_${platform.toUpperCase()}`];
if (!key || !channelId) {
  const v = fromVault();
  key ??= v.key;
  channelId ??= v.channels[platform];
}
if (!key || !channelId) {
  console.error(`missing BUFFER_API_KEY or channel id for ${platform}`);
  process.exit(1);
}

if (platform === "bluesky" && [...text].length > 300) {
  console.error(`bluesky post is ${[...text].length} chars; max is 300 including URL`);
  process.exit(1);
}

const dueField = mode === "customScheduled" ? `dueAt: ${JSON.stringify(dueAt)}` : "";
const query = `mutation { createPost(input: { channelId: ${JSON.stringify(channelId)} text: ${JSON.stringify(text)} mode: ${mode} schedulingType: automatic ${dueField} }) { ... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message } } }`;

const res = await fetch("https://api.buffer.com", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    "User-Agent": "blog-metrics-script/1.0",
  },
  body: JSON.stringify({ query }),
});
const body = await res.text();
if (!body) {
  console.error(`Buffer API HTTP ${res.status} empty body`);
  process.exit(1);
}
const json = JSON.parse(body);
const result = json.data?.createPost ?? {};
if (json.errors || result.message) {
  console.error(`Buffer error: ${json.errors?.[0]?.message ?? result.message}`);
  process.exit(1);
}
console.log(`Posted: ${result.post.status} ID: ${result.post.id}${result.post.dueAt ? ` dueAt: ${result.post.dueAt}` : ""}`);
