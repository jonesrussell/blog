# Blog Audit: content/posts/ai/ — Full Report

Generated: 2026-03-19

---

## codified-context-constitution/index.md — 3 findings: 0 missing, 1 incorrect, 2 suggestions

- **[TAGS]** Line 5: 3 tags used, within limit. OK.
- **[STRUCTURE]** Line 18: Intro paragraph explains scope well. OK.
- **[CONTENT]** Line 57: `mermaid` code block has language tag. OK.
- **[SERIES]** Lines 1-11: Series field present with correct name "codified-context". Series context blockquote present. OK.
- **[INCORRECT]** Line 2: Title "Writing a CLAUDE.md that actually works" — sentence case is correct, but inconsistent with the series naming pattern. The other series posts use descriptive titles that map to the series topic. This is a minor stylistic note, not a rule violation.
- **[SUGGESTION]** Line 114: Section "Waaseyaa: Scaling to 29 Packages" — heading could benefit from a keyword like "constitution" for SEO ("Scaling the Constitution to 29 Packages").
- **[SUGGESTION]** Line 140: "What's Next" section links to part 3 but does not follow the full series post template (no prerequisites blockquote, no problem statement section, no common mistakes section with bad/good code pairs, no try-it-yourself section, no framework integration section). This is a conceptual/essay post, not a code tutorial, so the series template is only partially applicable.

---

## codified-context-the-problem/index.md — 2 findings: 0 missing, 0 incorrect, 2 suggestions

- **[FRONTMATTER]** Lines 1-12: All fields present and correct. 3 tags (within limit). Series field present.
- **[STRUCTURE]** Line 14: Opens with "Ahnii!" OK. Line 79: Closes with "Baamaapii" OK.
- **[STRUCTURE]** Line 16: Intro paragraph states scope. OK.
- **[CONTENT]** No code blocks present — appropriate for a problem-statement post.
- **[VOICE]** Second person used throughout. OK.
- **[SERIES]** series_order: 1, series_group: "Main". As the first post, no prerequisites blockquote needed.
- **[SUGGESTION]** Line 17: "Vasilopoulos" is referenced but the paper link appears later (line 46). First mention of the paper could be linked inline at line 17 for consistency with the "link first mention" rule.
- **[SUGGESTION]** Line 24: First mention of "north-cloud" is linked. Good. First mention of "Claude Code" (line 22, implied by "AI coding tools") is not linked, but "Claude Code" is not named explicitly until context window discussion. Acceptable.

---

## codified-context-skills/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present and correct. 3 tags. Series field present.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 168: "Baamaapii" OK.
- **[CONTENT]** Code blocks have language tags (bash line 27, markdown line 53/65/69). Explanations follow code blocks. OK.
- **[VOICE]** Second person. OK.
- **[SUGGESTION]** Line 81: The Node.js MCP server scaffolding is described but no code block is shown. Consider adding a minimal code example for the MCP server to match the "code blocks have explanations" pattern.

---

## claude-code-skill-gen-plugin.md — 3 findings: 1 missing, 1 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-8: All fields present and correct. 3 tags. No series field (not a series post). OK.
- **[STRUCTURE]** Line 11: "Ahnii!" OK. Line 81: "Baamaapii" OK.
- **[MISSING]** Line 1: Post is a flat `.md` file, not a page bundle (`claude-code-skill-gen-plugin.md` instead of `claude-code-skill-gen-plugin/index.md`). Per CLAUDE.md: "Posts use page bundles in subdirectories." This should be moved to `content/posts/ai/claude-code-skill-gen-plugin/index.md`.
- **[INCORRECT]** Line 13: First mention of "Claude Code" is linked. First mention of "Firecrawl" is linked. But line 30, first mention of "Taskfile" — linked. OK. Actually all first mentions look linked. However, the post uses first-person at line 13: "Claude Code skills are markdown playbooks that teach Claude how to approach specific types of work." — this is third person, which is fine. No first-person "I/my" violations detected.
- **[SUGGESTION]** Line 43: The `yaml` code block (lines 43-47) is followed by explanation (line 49). OK. But line 73: the `text` code block (lines 73-77) has no follow-up explanation sentence. The next paragraph starts with a different topic ("The `description` field..."). Consider adding a brief explanation after the code block.

---

## git-hooks-ai-agents.md — 3 findings: 1 missing, 1 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-9: All fields present. `categories: [ai, tools]` — two categories, both lowercase. 3 tags. No series field (standalone). `devto: true` is a non-standard field but not a violation.
- **[MISSING]** Line 1: Flat `.md` file, not a page bundle. Should be `content/posts/ai/git-hooks-ai-agents/index.md`.
- **[INCORRECT]** Line 5: `tags: [git, claude-code, ai-agents]` — 3 tags, within limit. OK. Actually re-checking: tag `ai-agents` does not match post content well; the post is about git hooks more than AI agents specifically. However, the AI agent angle is central to the argument. Acceptable.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 151: "Baamaapii" OK.
- **[CONTENT]** All code blocks have language tags (bash, yaml). Explanations follow code blocks. OK.
- **[SUGGESTION]** Line 4: `categories: [ai, tools]` — the `tools` category is not used by other posts in this directory. Consider whether `ai` alone is sufficient for consistency.

---

## flag-untriaged-issues-claude-code-hooks/index.md — 2 findings: 0 missing, 1 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-10: All fields present. `tags: [claude-code, github, automation, developer-tools]` — **4 tags**, at the limit. OK.
- **[STRUCTURE]** Line 13: "Ahnii!" OK. Line 135: "Baamaapii" OK.
- **[INCORRECT]** Line 49-50: Lines 49-50 have duplicated content. Line 49: "Claude receives this summary at the start of your session and can flag untriaged issues immediately." Line 50: "Claude sees this output and can immediately ask what you want to do about it." These say the same thing. One should be removed.
- **[CONTENT]** Code blocks have language tags (text, bash, json). Explanations follow. OK.
- **[SUGGESTION]** Line 6: `tags: [claude-code, github, automation, developer-tools]` — `developer-tools` is hyphenated. OK per convention. But `developer-tools` could be shortened to `devtools` for consistency with other tag patterns. Minor.

---

## codified-context-cold-memory/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present and correct. 3 tags. Series field present.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 140: "Baamaapii" OK.
- **[CONTENT]** Code block at line 98 (bash) has language tag and explanation follows. OK.
- **[VOICE]** Second person. OK.
- **[SUGGESTION]** Line 66: "16 specs" vs line 48 "34 specs" for waaseyaa. The numbers describe different projects (north-cloud vs waaseyaa). Clear in context but could be confusing on skim. Consider adding project name parentheticals for clarity.

---

## codified-context-specialist-skills/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present and correct. 3 tags. Series field present.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 133: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (markdown x2). Explanations follow. First mentions linked. Voice is second person. Concise.
- **[SERIES]** Prerequisites blockquote, core concepts, code examples, common mistakes (instruction vs knowledge), "Next" link to part 4. Solid series post structure.

---

## claudriel-temporal-layer/index.md — 3 findings: 0 missing, 1 incorrect, 2 suggestions

- **[FRONTMATTER]** Lines 1-12: All fields present. `tags: [claudriel, php, temporal, testing]` — 4 tags, at limit. `series: ["waaseyaa"]`, series_order: 3.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 323: "Baamaapii" OK.
- **[INCORRECT]** Line 7: `series_order: 3` but this is the Claudriel temporal layer post. The waaseyaa series intro post (waaseyaa-intro) is series_order 1, entity-system is series_order 2, access-control is series_order 3. This post AND access-control both have `series_order: 3`. One of them is wrong. Looking at the series flow: waaseyaa-intro (1) -> co-development-skill-set (2) -> claudriel-temporal-layer (3) vs waaseyaa-intro (1) -> waaseyaa-entity-system (2) -> waaseyaa-access-control (3). There is a conflict. The co-development-skill-set also has series_order 2, same as waaseyaa-entity-system. This is a series ordering collision that needs resolution.
- **[SUGGESTION]** Line 321: "Next: The entity system at the heart of Waaseyaa." — but the entity system post (waaseyaa-entity-system) has series_order 2, which is *before* this post (series_order 3). The "Next" link points backward in the series. This suggests the series ordering is incorrect.
- **[SUGGESTION]** Line 9: `series_group: "Main"` — all waaseyaa series posts use this. OK.

---

## co-development-skill-set/index.md — 3 findings: 0 missing, 1 incorrect, 2 suggestions

- **[FRONTMATTER]** Lines 1-12: All fields present. `tags: [claude-code, waaseyaa, codified-context, skills]` — 4 tags, at limit. `series: ["waaseyaa"]`, series_order: 2.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 181: "Baamaapii" OK.
- **[INCORRECT]** Line 7: `series_order: 2` conflicts with `waaseyaa-entity-system/index.md` which also has `series_order: 2` in the waaseyaa series. Two posts cannot share the same series_order.
- **[CONTENT]** Code blocks have language tags (bash, markdown, text). Explanations follow. OK.
- **[SUGGESTION]** Line 179: "Next: Building a temporal layer so your AI never lies about time." — this points to the claudriel post, but the entity system post also has series_order 2. The series navigation chain is unclear.
- **[SUGGESTION]** Line 5: `categories: [ai, php]` — consistent with other waaseyaa posts. OK.

---

## claudia-ai-chief-of-staff/index.md — 4 findings: 0 missing, 3 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-8: All fields present. `tags: [claude-code, ai-tools, productivity, open-source]` — 4 tags, at limit.
- **[STRUCTURE]** Line 11: "Ahnii!" OK. Line 134: "Baamaapii" OK.
- **[INCORRECT]** Line 13: "I'm building" — wait, this is about Claudia by kbanc85, not by the blog author. Line 130: "I contributed seven improvements to the installer recently" — uses first person "I". The style guide says voice should be second person, direct, instructional ("you"/"your", not "I"/"my"). Multiple first-person instances throughout: line 13, line 130.
- **[INCORRECT]** Line 17: "Ask Claudia about a contact and you get..." — shifts between first and second person. The overall voice is inconsistent.
- **[INCORRECT]** Line 76: "It is a React app that reads directly from the SQLite database." — missing link for first mention of "React."
- **[SUGGESTION]** Line 52: "Run `--preflight`" — this is a CLI flag, not a code block. Could be wrapped in a code block for consistency, but inline code is acceptable.

---

## minoo-community-platform/index.md — 4 findings: 1 missing, 2 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-8: All fields present. `categories: [projects]` — not `ai`. `tags: [indigenous, community, open-source, northern-ontario]` — 4 tags, at limit.
- **[STRUCTURE]** Line 11: "Ahnii!" OK. Line 66: "Baamaapii" OK.
- **[MISSING]** Line 64: "Miigwech" appears before "Baamaapii" — not a violation, but the closing is "Baamaapii" which is correct.
- **[INCORRECT]** Line 13: "I'm building Minoo" — first person "I". Line 56: "I'm looking for honest feedback" — first person again. The style guide requires second person voice. Multiple violations.
- **[INCORRECT]** Line 11: No link for first mention of "Minoo" — wait, line 13 has `[Minoo](https://minoo.live)`. OK. But line 17: "Anishinaabemowin" is not linked to any reference. This is a cultural term that could benefit from a link, but it's the author's own language so arguably doesn't need one.
- **[SUGGESTION]** Line 1: No code blocks in this post, which is appropriate for a community platform introduction. No code-related checks apply.

---

## waaseyaa-entity-system/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series field present with "waaseyaa", series_order: 2.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 158: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x4). Explanations follow each. First mentions linked (Drupal, Symfony, Claudriel). Voice is second person/impersonal. OK.
- **[SUGGESTION]** Line 10: `slug: "waaseyaa-entity-system"` — consistent. Series_order 2 conflicts with co-development-skill-set (also series_order 2). As noted above, the waaseyaa series has ordering conflicts.

---

## waaseyaa-access-control/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 3.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 138: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x2). Explanations follow. First mentions linked. Voice is second person/impersonal. OK.
- **[SUGGESTION]** Line 2: Title uses lowercase "waaseyaa" — consistent with other waaseyaa posts. The title casing is intentional (product name). OK. Series_order 3 conflicts with claudriel-temporal-layer (also series_order 3).

---

## waaseyaa-intro/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 1.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 94: "Baamaapii" OK. Prerequisites blockquote present.
- **[CONTENT]** Code block at line 34 (text) has language tag. First mentions linked (Waaseyaa, Drupal, Laravel, Symfony, Nuxt 3, Minoo, Composer). Voice is second person/impersonal. OK.
- **[SUGGESTION]** Line 92: "Next up: Three skills for governing multi-repo co-development" links to co-development-skill-set. This implies co-development-skill-set is post 2, which matches its series_order: 2. But waaseyaa-entity-system also has series_order: 2. The intended reading order needs clarification.

---

## waaseyaa-api-layer/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 4.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 178: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x3, json x1). Explanations follow each. First mentions linked (JSON:API, Claudriel, webonyx/graphql-php). Voice is second person/impersonal. Concise.

---

## waaseyaa-dbal-migration/index.md — 1 finding: 0 missing, 0 incorrect, 1 suggestion

- **[FRONTMATTER]** Lines 1-12: All fields present. `tags: [waaseyaa, php, claude-code, dbal]` — 4 tags. Series "waaseyaa", series_order: 5.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 139: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x3, sql x1, bash x1). Explanations follow. First mentions linked (Doctrine DBAL, Minoo, Claude Code). OK.
- **[SUGGESTION]** Line 25: "we needed things" — first person plural "we." The style guide specifies second person. This occurs several times: line 25, line 30. Consider rewriting to "the framework needed" or second person.

---

## waaseyaa-i18n/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. `tags: [waaseyaa, php, i18n, minoo]` — 4 tags. Series "waaseyaa", series_order: 6.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 176: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x4). Explanations follow each. First mentions linked (Minoo, Ojibwe language link implicit). Voice is second person/impersonal. Concise.

---

## waaseyaa-testing/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 7.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 125: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x3, typescript x1). Explanations follow each. First mentions linked (SQLite, Playwright, Minoo, Claudriel, PHPUnit, Pest). Voice is second person/impersonal. OK.

---

## waaseyaa-deployment/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. `tags: [waaseyaa, deployment, caddy, deployer]` — 4 tags. Series "waaseyaa", series_order: 8.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 133: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php, caddyfile, yaml). Explanations follow. First mentions linked (Deployer, Caddy, Twig). Voice is second person/impersonal. OK.

---

## waaseyaa-ai-packages/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 9.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 130: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (php x2). Explanations follow. First mentions linked (Drupal, Claudriel). Voice is second person/impersonal. OK.

---

## waaseyaa-packagist/index.md — PASS (0 findings)

- **[FRONTMATTER]** Lines 1-12: All fields present. 4 tags. Series "waaseyaa", series_order: 10.
- **[STRUCTURE]** Line 14: "Ahnii!" OK. Line 192: "Baamaapii" OK. Series context blockquote present.
- **[CONTENT]** Code blocks have language tags (bash, yaml, json). Explanations follow. First mentions linked (Packagist, splitsh-lite, Composer, Minoo, Claudriel). Voice is second person/impersonal. OK.

---

## laravel-to-waaseyaa-one-session/index.md — 6 findings: 4 missing, 2 incorrect, 0 suggestions

- **[MISSING]** Line 11: No "Ahnii!" greeting. Post opens with `## The Setup` heading directly.
- **[MISSING]** Line 109: No "Baamaapii" closing. Post ends with "Not bad for a day's work." on line 109.
- **[INCORRECT]** Line 2: Title "I Migrated a Laravel App to a Custom PHP Framework in One Claude Code Session" — uses first person "I" in the title. Style guide requires second person voice.
- **[INCORRECT]** Lines 13, 15, 16, etc.: Extensive first-person usage throughout: "I've been building," "My plan was," "I captured," "my Waaseyaa." The style guide requires second person, direct, instructional voice.
- **[MISSING]** Line 1-9: No intro paragraph stating what the post covers in one scoped sentence. The post jumps directly into "## The Setup."
- **[MISSING]** Line 5: `tags: [claude-code, waaseyaa, laravel, migration, php, inertia]` — **6 tags**. Maximum is 4.

---

## Social Media Companion Files — Summary

| Post slug | Social file exists? |
|---|---|
| codified-context-constitution | YES |
| codified-context-the-problem | YES |
| codified-context-skills | YES |
| claude-code-skill-gen-plugin | YES |
| git-hooks-ai-agents | YES |
| flag-untriaged-issues-claude-code-hooks | **MISSING** |
| codified-context-cold-memory | YES |
| codified-context-specialist-skills | **MISSING** |
| claudriel-temporal-layer | YES |
| co-development-skill-set | YES |
| claudia-ai-chief-of-staff | YES |
| minoo-community-platform | YES |
| waaseyaa-entity-system | **MISSING** |
| waaseyaa-access-control | YES |
| waaseyaa-intro | YES |
| waaseyaa-api-layer | **MISSING** |
| waaseyaa-dbal-migration | **MISSING** |
| waaseyaa-i18n | **MISSING** |
| waaseyaa-testing | **MISSING** |
| waaseyaa-deployment | **MISSING** |
| waaseyaa-ai-packages | **MISSING** |
| waaseyaa-packagist | YES |
| laravel-to-waaseyaa-one-session | **MISSING** |

**10 posts are missing social media companion files.**

---

## Cross-Cutting Issues

### Waaseyaa Series Ordering Conflicts

The `series: ["waaseyaa"]` posts have overlapping `series_order` values:

| series_order | Post(s) |
|---|---|
| 1 | waaseyaa-intro |
| 2 | co-development-skill-set, waaseyaa-entity-system (CONFLICT) |
| 3 | claudriel-temporal-layer, waaseyaa-access-control (CONFLICT) |
| 4 | waaseyaa-api-layer |
| 5 | waaseyaa-dbal-migration |
| 6 | waaseyaa-i18n |
| 7 | waaseyaa-testing |
| 8 | waaseyaa-deployment |
| 9 | waaseyaa-ai-packages |
| 10 | waaseyaa-packagist |

The "Next" links in each post suggest the intended order is:
1. waaseyaa-intro
2. co-development-skill-set
3. claudriel-temporal-layer
4. waaseyaa-entity-system
5. waaseyaa-access-control
6. waaseyaa-api-layer
7. waaseyaa-dbal-migration
8. waaseyaa-i18n
9. waaseyaa-testing
10. waaseyaa-deployment
11. waaseyaa-ai-packages
12. waaseyaa-packagist

This would require renumbering series_order for most posts.

### Page Bundle Violations

Two posts are flat `.md` files instead of page bundles:
- `content/posts/ai/claude-code-skill-gen-plugin.md` — should be `claude-code-skill-gen-plugin/index.md`
- `content/posts/ai/git-hooks-ai-agents.md` — should be `git-hooks-ai-agents/index.md`

### Voice Violations (First Person)

Posts using "I"/"my"/"we" instead of second person:
- claudia-ai-chief-of-staff/index.md
- minoo-community-platform/index.md
- laravel-to-waaseyaa-one-session/index.md
- waaseyaa-dbal-migration/index.md (minor, "we")

---

## Summary Statistics

| Metric | Count |
|---|---|
| Posts audited | 23 |
| Posts passing all checks | 7 |
| Posts with findings | 16 |
| Total findings | 39 |
| Missing items | 6 |
| Incorrect items | 10 |
| Suggestions | 13 |
| Missing social files | 10 |
| Series ordering conflicts | 2 |
| Page bundle violations | 2 |
