#!/usr/bin/env node
// slop-check.mjs — deterministic "AI slop" linter for a markdown post. No API call.
// Signals (2025-2026 consensus): low sentence-length burstiness, em-dash density,
// and banned cliché/vocab clusters. Fails on clear violations so the autopilot can
// HOLD a sloppy draft before it publishes.
//
// Usage: node scripts/slop-check.mjs <post.md>
// Exit: 0 = clean enough to ship, 1 = slop detected, 2 = usage/read error

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("Usage: slop-check.mjs <post.md>"); process.exit(2); }

let raw;
try { raw = readFileSync(file, "utf8"); }
catch (e) { console.error(`cannot read ${file}: ${e.message}`); process.exit(2); }

// Strip frontmatter (first --- ... --- block), fenced code, inline code, and md syntax.
let body = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
body = body.replace(/```[\s\S]*?```/g, " ");
body = body.replace(/`[^`]*`/g, " ");
body = body.replace(/^#{1,6}\s+/gm, "");          // headings
body = body.replace(/[*_>|-]/g, " ");              // md punctuation/bullets
body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // links -> text

// Sentence split (keep it simple; abbreviations are rare in this corpus).
const sentences = body.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
const wordsOf = (s) => (s.match(/\b[\w']+\b/g) || []).length;
const lens = sentences.map(wordsOf).filter(n => n > 0);
const totalWords = lens.reduce((a, b) => a + b, 0);

if (lens.length < 5 || totalWords < 80) {
  console.log(`slop-check: post too short to score (${lens.length} sentences, ${totalWords} words) — passing`);
  process.exit(0);
}

const mean = totalWords / lens.length;
const variance = lens.reduce((a, n) => a + (n - mean) ** 2, 0) / lens.length;
const stdev = Math.sqrt(variance);
const burstiness = stdev / mean; // human ~0.6-1.2, AI slop < 0.4

const emDashes = (body.match(/—/g) || []).length;
const emDashDensity = (emDashes / totalWords) * 1000;

// Living ban-list: cliché phrases + drift-prone vocab. Review quarterly.
const BANNED = [
  /\bdelve(s|d)?\b/gi, /\btapestry\b/gi, /\bnavigat(e|ing) the complexit/gi,
  /\bit's important to note\b/gi, /\bit is important to note\b/gi,
  /\bin today's (fast-paced|digital|ever-changing)\b/gi, /\bat the end of the day\b/gi,
  /\bunlock(ing)? the (power|potential)\b/gi, /\ba testament to\b/gi,
  /\bin the realm of\b/gi, /\bever-evolving\b/gi, /\bseamless(ly)?\b/gi,
  /\bgame[- ]chang(er|ing)\b/gi, /\brobust and scalable\b/gi, /\bdive into\b/gi,
  /\bwhen it comes to\b/gi, /\bplays a (crucial|vital|key) role\b/gi,
];
const bannedHits = [];
let bannedTotal = 0;
for (const re of BANNED) {
  const m = body.match(re);
  if (m) { bannedHits.push(`${m[0]} (x${m.length})`); bannedTotal += m.length; }
}

// Score signals.
const signals = [];
if (burstiness < 0.4) signals.push(`low burstiness ${burstiness.toFixed(2)} (< 0.40)`);
if (emDashDensity > 20) signals.push(`em-dash density ${emDashDensity.toFixed(1)}/1k (> 20)`);
if (bannedHits.length > 0) signals.push(`banned phrases: ${bannedHits.join(", ")}`);

console.log("slop-check report:");
console.log(`  sentences=${lens.length} words=${totalWords} mean=${mean.toFixed(1)}`);
console.log(`  burstiness=${burstiness.toFixed(2)} (human 0.6-1.2, slop < 0.40)`);
console.log(`  em-dash density=${emDashDensity.toFixed(1)}/1k words`);
console.log(`  banned hits=${bannedHits.length}${bannedHits.length ? ": " + bannedHits.join(", ") : ""}`);

// Fail on a clear violation: hard burstiness floor, a pile of clichés on its own,
// OR convergence of >= 2 distinct signals.
const fail = burstiness < 0.32 || bannedTotal >= 3 || signals.length >= 2;
if (fail) {
  console.log(`\nSLOP DETECTED (${signals.length} signal(s)):`);
  signals.forEach(s => console.log(`  - ${s}`));
  console.log("Revise for sentence-length variety and cut the flagged phrases.");
  process.exit(1);
}
console.log(`\nPASS (${signals.length} signal(s), below fail threshold).`);
process.exit(0);
