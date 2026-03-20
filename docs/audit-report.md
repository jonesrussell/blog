# Blog Post Audit Report

Generated: 2026-03-19

---

## 1. general/age-of-hyper-founder/index.md -- 2 findings: 0 missing, 0 incorrect, 2 suggestions

**[CONTENT]** Line 13: Voice shifts to first person ("It isn't just..."). Most of the post uses a detached observational tone rather than second-person instructional ("you"/"your"). / Fix: Rewrite sections to address the reader directly (e.g., "You've seen it" on line 13 is good, but later paragraphs drift to third person).

**[CONTENT]** Line 29: "myself included" shifts to first person. / Fix: Remove or rephrase (e.g., "including the author of this post" or just cut it).

---

## 2. general/imposter-syndrome/index.md -- 8 findings: 1 missing, 5 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false` (or `draft: true` if intended).

**[STRUCTURE]** Line 19: Heading "What is Imposter Syndrome? (2 minutes)" contains a time estimate. / Fix: Remove "(2 minutes)" -- use "What is Imposter Syndrome?"

**[STRUCTURE]** Line 28: Heading "Common Triggers (5 minutes)" contains a time estimate. / Fix: Remove "(5 minutes)" -- use "Common Triggers in Tech"

**[STRUCTURE]** Line 38: Heading "Coping Strategies (10 minutes)" contains a time estimate. / Fix: Remove "(10 minutes)" -- use "Coping Strategies"

**[STRUCTURE]** Line 87: Contains "Wrapping Up" heading. / Fix: Remove the heading or replace with a content-specific heading.

**[STRUCTURE]** Line 91: Closes with "Baamaapii" followed by emoji. / Fix: Change to just "Baamaapii" (no emoji).

**[CONTENT]** Line 63-64: Code block at line 60 has no follow-up explanation sentence. / Fix: Add 1-2 sentences after the code block explaining what it shows.

**[CONTENT]** Line 17: Voice uses "Let's talk" (first person plural) instead of second person. / Fix: Rephrase to second-person instructional voice.

---

## 3. general/quickly-view-project-dependencies-on-the-cli/index.md -- 8 findings: 1 missing, 4 incorrect, 3 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Line 18: Heading "Built-in NPM Commands (2 minutes)" contains a time estimate. / Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 56: Heading "Enhanced Features with npm@7+ (2 minutes)" contains a time estimate. / Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 75: Contains "Wrapping Up" heading. / Fix: Remove or replace with a content-specific heading.

**[STRUCTURE]** Line 79: Closes with "Baamaapii" followed by emoji. / Fix: Remove the emoji.

**[CONTENT]** Lines 20-30: Multiple consecutive code blocks without explanatory sentences between them. / Fix: Add 1-2 sentences after each code block explaining what it does.

**[CONTENT]** Line 14: Voice uses first person "I frequently find myself" instead of second person. / Fix: Rephrase to "you" voice (e.g., "When you need to check package.json dependencies...").

**[SOCIAL]** Missing: No companion file at `docs/social/quickly-view-project-dependencies-on-the-cli.md`. / Fix: Create social media posts file.

---

## 4. general/scaffold-and-deploy-a-jekyll-github-pages-blog-in-5-minutes/index.md -- 6 findings: 1 missing, 3 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Line 94: Contains "Wrapping Up" heading. / Fix: Remove or replace.

**[STRUCTURE]** Line 100: Closes with "Baamaapii" followed by emoji. / Fix: Remove the emoji.

**[CONTENT]** Lines 38-48: Code blocks at lines 38 and 44 lack follow-up explanatory sentences. / Fix: Add 1-2 sentences after each code block.

**[CONTENT]** Line 17: Post opens with general statement in third person rather than second-person voice. / Fix: Address the reader directly.

**[SOCIAL]** Missing: No companion file at `docs/social/scaffold-and-deploy-a-jekyll-github-pages-blog-in-5-minutes.md`. / Fix: Create social media posts file.

---

## 5. general/start-with-html/index.md -- 1 finding: 0 missing, 0 incorrect, 1 suggestion

**[SOCIAL]** Social file exists at `docs/social/start-with-html.md`. PASS.

**[SUGGESTION]** No code blocks in the post, so the "code block explanation" check is N/A. The post is well-structured, but consider adding a minimal HTML example code block to reinforce the practical angle.

---

## 6. general/quickly-view-nodejs-project-scripts-on-the-cli/index.md -- 8 findings: 1 missing, 5 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Line 17: Does not open with "Ahnii!" as its own paragraph. "Ahnii!" is followed by text on the same line. / Fix: Put "Ahnii!" on its own line/paragraph, then start content on a new paragraph.

**[STRUCTURE]** Missing closing: Post ends with "Meegwetch!" instead of "Baamaapii". / Fix: Replace "Meegwetch!" with "Baamaapii".

**[CONTENT]** Line 17: Voice uses first person ("I previously wrote", "I found"). / Fix: Rephrase to second person.

**[CONTENT]** Line 26-28: Code block has no follow-up explanation. / Fix: Add 1-2 sentences explaining what the sed command does.

**[CONTENT]** Line 33-34: Code block has no follow-up explanation. / Fix: Add 1-2 sentences.

**[FRONTMATTER]** Line 5: `categories: [cli, nodejs]` -- "nodejs" should be hyphenated for multi-word consistency if intended as "node-js". / Fix: Verify category naming convention.

**[SOCIAL]** Missing: No companion file at `docs/social/quickly-view-nodejs-project-scripts-on-the-cli.md`. / Fix: Create social media posts file.

---

## 7. general/coaudit/index.md -- 7 findings: 1 missing, 4 incorrect, 2 suggestions

**[FRONTMATTER]** Line 4: `categories: []` is empty. / Fix: Add appropriate category (e.g., `[tools]` or `[ai]`).

**[STRUCTURE]** Line 228: Closes with "Baamaapii" followed by emoji. / Fix: Remove the emoji.

**[CONTENT]** Line 12: Voice uses first person extensively ("I Built", "I recently encountered", etc.). / Fix: Rephrase to second-person instructional voice where possible.

**[CONTENT]** Lines 63-73, 116-121, 136-138: Multiple code blocks lack follow-up explanatory sentences. / Fix: Add 1-2 sentences after each code block.

**[CONTENT]** Line 53: Em dash usage -- the post uses several em dashes (lines 49, 50, 51, 52, 53, 185, 186, 190). Style guide says one or two per post max. / Fix: Replace most em dashes with commas, colons, or periods.

**[STRUCTURE]** Line 17: Heading hierarchy issue -- "What I Built" is H2, "How It Works" is H3, then "Why This Matters" is H3, but "Demo" is H2 again. The alternation is fine, but "Quick Start", "Example Output", "Real Copilot Integration" under Demo should be H3 (they are). However "My Experience with GitHub Copilot CLI" sub-headings like "Why Copilot CLI Was Essential" are H3 under H2, which is correct. OK on review -- heading hierarchy is acceptable.

**[SOCIAL]** Missing: No companion file at `docs/social/coaudit.md`. / Fix: Create social media posts file.

---

## 8. general/building-codebase-cleanup-skill-claude-code/index.md -- 4 findings: 0 missing, 2 incorrect, 2 suggestions

**[CONTENT]** Line 13: Voice uses first person throughout ("I've been using", "I built", "I ran it"). / Fix: Rephrase to second-person instructional voice (e.g., "You can build a codebase cleanup skill that...").

**[CONTENT]** Line 269: "I ran this skill on the Hugo blog you're reading right now" -- first person. Pervasive throughout the "Running It on This Blog" section. / Fix: Shift perspective.

**[CONTENT]** Lines 23-29, 316-329: Code blocks have explanatory sentences after them (good). However, the large embedded skill markdown (lines 72-261) is a single massive code block with no interstitial explanation. / Fix: Consider breaking it up or adding brief commentary between sections, though this is a stylistic suggestion since it's meant to be copied wholesale.

**[SOCIAL]** Missing: No companion file at `docs/social/building-codebase-cleanup-skill-claude-code.md`. / Fix: Create social media posts file (note: post is draft, so this may be deferred).

---

## 9. general/wiring-spec-drift-detection-into-your-monorepo/index.md -- PASS (0 findings)

All checks pass. Social file exists at `docs/social/wiring-spec-drift-detection-into-your-monorepo.md`.

---

## 10. go/debugging-bubbletea-commands/index.md -- 8 findings: 1 missing, 6 incorrect, 1 suggestion

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Missing opening: Post does not open with "Ahnii!" / Fix: Add "Ahnii!" as the first paragraph.

**[STRUCTURE]** Missing closing: Post does not close with "Baamaapii". / Fix: Add "Baamaapii" as the final paragraph.

**[CONTENT]** Line 10: Disclaimer says "This is entirely AI generated." The post uses first person "I recently encountered", "My first attempt." / Fix: Either remove the disclaimer and rewrite to second person, or rewrite to match style guide.

**[CONTENT]** Line 12: Voice is first person throughout ("I recently encountered", "My first attempt"). / Fix: Rewrite to second-person instructional voice.

**[CONTENT]** Line 34-38: Code block at line 34 lacks follow-up explanation. The text before it explains the approach, but a sentence after explaining why this is wrong would help. / Fix: Add explanation after the code block.

**[STRUCTURE]** Missing intro scope sentence: The post doesn't clearly state what it covers in one scoped sentence. / Fix: Add an intro paragraph stating scope.

**[SOCIAL]** Missing: No companion file at `docs/social/debugging-bubbletea-commands.md`. / Fix: Create social media posts file.

---

## 11. go/understanding-go-interfaces/index.md -- 9 findings: 1 missing, 6 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Line 10: Opens with "Ahnii," (comma) instead of "Ahnii!" (exclamation mark). / Fix: Change to "Ahnii!"

**[STRUCTURE]** Line 16: Heading "What Makes Go Interfaces Special? (2 minutes)" contains a time estimate. / Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 23: Heading "Basic Interface Usage (5 minutes)" contains a time estimate. / Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 134: Contains "Wrapping Up" heading. / Fix: Remove or replace.

**[STRUCTURE]** Line 140: Closes with "Baamaapii" followed by emoji. / Fix: Remove the emoji.

**[CONTENT]** Lines 48-62, 82-87, 89-95, 99-109, 118-123, 128-131: Multiple code blocks without follow-up explanatory sentences. / Fix: Add 1-2 sentences after each code block.

**[CONTENT]** Line 12: Voice uses first person "Let's explore" instead of second-person instructional. / Fix: Rephrase.

**[SOCIAL]** Missing: No companion file at `docs/social/understanding-go-interfaces.md`. / Fix: Create social media posts file.

---

## 12. go/a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection/index.md -- 9 findings: 1 missing, 6 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Line 10: Opens with "Ahnii," (comma) instead of "Ahnii!" (exclamation mark). / Fix: Change to "Ahnii!"

**[STRUCTURE]** Line 14: Heading "Why Dependency Injection? (2 minutes)" contains a time estimate. / Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 22: Heading "Basic Setup (5 minutes)" contains a time estimate. / Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 46: Heading "Testing Strategy (10 minutes)" contains a time estimate. / Fix: Remove "(10 minutes)".

**[STRUCTURE]** Line 107: Contains "Wrapping Up" heading. / Fix: Remove or replace.

**[STRUCTURE]** Line 113: Closes with "Baamaapii" followed by emoji. / Fix: Remove the emoji.

**[CONTENT]** Line 12: Voice uses first person ("I recently refactored", "Let me show you"). / Fix: Rephrase to second person.

**[SOCIAL]** Missing: No companion file at `docs/social/a-nod-to-golang-testing-cobra-cli-applications-with-dependency-injection.md`. / Fix: Create social media posts file.

---

## 13. go/golangci-lint/index.md -- 5 findings: 0 missing, 3 incorrect, 2 suggestions

**[STRUCTURE]** Missing "Wrapping Up" or "Conclusion" heading: N/A (none present -- good).

**[CONTENT]** Line 20: Voice uses first person ("if you're like me", "you've probably"). Mostly second person but slips into first. / Fix: Remove "if you're like me" and rephrase.

**[CONTENT]** Lines 36-42: The "Getting Started" section is very thin -- no code blocks showing configuration or output examples. / Fix: Add a sample `.golangci-lint.yml` config and example output.

**[CONTENT]** Line 44: "feel free to drop a comment below!" -- filler/call-to-action that doesn't match blog style. / Fix: Remove.

**[STRUCTURE]** Line 46: Closing "Baamaapii" is correct (no emoji). PASS.

**[SOCIAL]** Missing: No companion file at `docs/social/golangci-lint.md`. / Fix: Create social media posts file (note: post is archived+draft, may be deferred).

---

## 14. go/understanding-struct-field-alignment-in-go/index.md -- 4 findings: 0 missing, 2 incorrect, 2 suggestions

**[STRUCTURE]** Missing closing: Post ends with "Baamaapii" on its own line -- PASS. No emoji -- PASS.

**[CONTENT]** Lines 17-26: Code block has good follow-up explanation on line 27. PASS.

**[CONTENT]** Lines 42-48: Code block has good follow-up explanation on line 50. PASS.

**[CONTENT]** Line 84: Final paragraph is a general statement not addressed to "you". / Fix: Rephrase to second person (e.g., "By understanding and applying these principles, you can write more memory-efficient code..."). Actually it does say "you can" -- PASS on closer inspection.

**[STRUCTURE]** No "Wrapping Up" heading. PASS.

**[CONTENT]** Line 63: First mention of `go vet` is linked. PASS. First mention of `golangci-lint` is linked. PASS.

**[SOCIAL]** Missing: No companion file at `docs/social/understanding-struct-field-alignment-in-go.md`. / Fix: Create social media posts file (note: post is draft, may be deferred).

**[CONTENT]** Lines 69-75: "Impact on Performance" section is a bullet list without specific data or code examples. / Fix: Consider adding a benchmark example.

**[STRUCTURE]** Missing intro scope sentence: Line 13 says "Let's explore how struct field alignment works and how to optimize it" which is good but uses "Let's" (first person plural). / Fix: Rephrase to "This post explores..." or "You'll learn..."

Revised count: 4 findings: 0 missing, 2 incorrect, 2 suggestions.

---

## 15. laravel/ddev-laravel-go-sidecar/index.md -- 3 findings: 0 missing, 1 incorrect, 2 suggestions

**[CONTENT]** Line 13: Voice uses first person "Our stack" and "We needed" / "Here's how we did it." / Fix: Rephrase to second person (e.g., "This stack splits responsibilities..." or "If your stack splits...").

**[CONTENT]** Lines 29-48: The solution section describes steps but has no code blocks (only mentions file paths and config snippets inline). / Fix: Add actual code/YAML examples for the docker-compose file and .env configuration.

**[SOCIAL]** Missing: No companion file at `docs/social/ddev-laravel-go-sidecar.md`. / Fix: Create social media posts file.

---

## 16. laravel/start-developing-with-laravel-in-ubuntu-24-04/index.md -- 1 finding: 0 missing, 0 incorrect, 1 suggestion

**[SOCIAL]** Missing: No companion file at `docs/social/start-developing-with-laravel-in-ubuntu-24-04.md`. / Fix: Create social media posts file.

All other checks pass. Well-structured post matching style guide.

---

## 17. laravel/use-ddev-to-locally-develop-with-drupal/index.md -- 7 findings: 1 missing, 5 incorrect, 1 suggestion

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Missing opening: Post does not open with "Ahnii!" The first line of content (line 16) starts with "I've been developing..." / Fix: Add "Ahnii!" as the first paragraph.

**[STRUCTURE]** Missing closing: Post ends with "Happy developing! Gabekana." instead of "Baamaapii". / Fix: Replace with "Baamaapii".

**[CONTENT]** Line 16: Voice uses first person ("I've been developing with Drupal for over 10 years"). / Fix: Rephrase to second person.

**[CONTENT]** Lines 30-34, 39-41, 46-48, 52-54, 59-60, 68-70: Several code blocks lack follow-up explanatory sentences. The numbered list provides some context before the blocks, but style guide calls for explanation after. / Fix: Add brief sentences after code blocks.

**[FRONTMATTER]** Line 4: `categories: [web-development, docker]` -- these are fine for an archived post, but "docker" could be "devops" for consistency with other posts. / Fix: Minor -- verify category naming.

**[SOCIAL]** Missing: No companion file at `docs/social/use-ddev-to-locally-develop-with-drupal.md`. / Fix: Create social media posts file (note: post is archived, may be deferred).

---

## 18. laravel/start-developing-with-laravel-in-ubuntu-20.04/index.md -- 7 findings: 1 missing, 5 incorrect, 1 suggestion

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[STRUCTURE]** Missing opening: Post does not open with "Ahnii!" The first line of content (line 17) starts with "First and foremost..." / Fix: Add "Ahnii!" as the first paragraph.

**[STRUCTURE]** Missing closing: Post does not close with "Baamaapii". Ends with an image. / Fix: Add "Baamaapii" as the final paragraph.

**[CONTENT]** Line 17: Voice uses first person ("I find", "I'm sure", "I suggest", "I hope"). / Fix: Rephrase to second person.

**[CONTENT]** Lines 35-45: Code block lacks follow-up explanation. / Fix: Add 1-2 sentences explaining what the commands do.

**[STRUCTURE]** Missing intro scope sentence. / Fix: Add a sentence stating what the post covers.

**[SOCIAL]** Missing: No companion file at `docs/social/start-developing-with-laravel-in-ubuntu-20.04.md`. / Fix: Create social media posts file (note: post is archived, may be deferred).

---

## 19. laravel/laravel-boost-ddev/index.md -- 1 finding: 0 missing, 0 incorrect, 1 suggestion

**[SOCIAL]** Missing: No companion file at `docs/social/laravel-boost-ddev.md`. / Fix: Create social media posts file.

All other checks pass. This is the reference post per the style guide -- well-structured.

---

## 20. cursor/cursor-pin-agent-chats/index.md -- 1 finding: 0 missing, 0 incorrect, 1 suggestion

**[SOCIAL]** Missing: No companion file at `docs/social/cursor-pin-agent-chats.md`. / Fix: Create social media posts file.

All other checks pass. Well-structured post.

---

## 21. cursor/drift-in-cursor-ai-rules/index.md -- 5 findings: 1 missing, 3 incorrect, 1 suggestion

**[FRONTMATTER]** Missing: `draft` field not present. / Fix: Add `draft: false`.

**[FRONTMATTER]** Line 6: Tags are not lowercase: `[Cursor, AI, Rules, Productivity]`. / Fix: Change to `[cursor, ai, rules, productivity]`.

**[STRUCTURE]** Line 10: "Ahnii!" is not on its own paragraph -- it's followed by text on the same line ("Ahnii! As codebases evolve..."). / Fix: Put "Ahnii!" on its own line, then start content on the next paragraph.

**[STRUCTURE]** Line 73: Closes with "Baamaapii!" (with exclamation mark). The convention is "Baamaapii" without exclamation. / Fix: Remove the exclamation mark.

**[SOCIAL]** Missing: No companion file at `docs/social/drift-in-cursor-ai-rules.md`. / Fix: Create social media posts file.

---

## 22. cursor/cursor-ai-tools/index.md -- 3 findings: 0 missing, 1 incorrect, 2 suggestions

**[CONTENT]** Line 13: Post is a reference guide with no code blocks (which is acceptable for a reference), but the style guide expects linked first mentions. [Cursor AI](https://www.cursor.com/) is linked -- PASS.

**[CONTENT]** The post reads more like documentation than an instructional blog post. Voice is neutral/passive rather than second-person instructional. / Fix: Add "you" framing (e.g., "You can use semantic search to find...").

**[STRUCTURE]** Missing intro scope sentence after "Ahnii!" -- Line 13 jumps straight into the reference without stating scope. / Fix: Add a sentence like "This post is a quick reference for every tool available in Cursor AI's agent mode."

**[SOCIAL]** Missing: No companion file at `docs/social/cursor-ai-tools.md`. / Fix: Create social media posts file (note: post is draft, may be deferred).

---

# Summary

| # | Post | Status | Findings |
|---|------|--------|----------|
| 1 | age-of-hyper-founder | REVIEW | 2 (0 missing, 0 incorrect, 2 suggestions) |
| 2 | imposter-syndrome | REVIEW | 8 (1 missing, 5 incorrect, 2 suggestions) |
| 3 | quickly-view-project-dependencies-on-the-cli | REVIEW | 8 (1 missing, 4 incorrect, 3 suggestions) |
| 4 | scaffold-and-deploy-a-jekyll-github-pages-blog | REVIEW | 6 (1 missing, 3 incorrect, 2 suggestions) |
| 5 | start-with-html | REVIEW | 1 (0 missing, 0 incorrect, 1 suggestion) |
| 6 | quickly-view-nodejs-project-scripts-on-the-cli | REVIEW | 8 (1 missing, 5 incorrect, 2 suggestions) |
| 7 | coaudit | REVIEW | 7 (1 missing, 4 incorrect, 2 suggestions) |
| 8 | building-codebase-cleanup-skill-claude-code | REVIEW | 4 (0 missing, 2 incorrect, 2 suggestions) |
| 9 | wiring-spec-drift-detection-into-your-monorepo | **PASS** | 0 |
| 10 | debugging-bubbletea-commands | REVIEW | 8 (1 missing, 6 incorrect, 1 suggestion) |
| 11 | understanding-go-interfaces | REVIEW | 9 (1 missing, 6 incorrect, 2 suggestions) |
| 12 | testing-cobra-cli-apps-with-di | REVIEW | 9 (1 missing, 6 incorrect, 2 suggestions) |
| 13 | golangci-lint | REVIEW | 5 (0 missing, 3 incorrect, 2 suggestions) |
| 14 | understanding-struct-field-alignment-in-go | REVIEW | 4 (0 missing, 2 incorrect, 2 suggestions) |
| 15 | ddev-laravel-go-sidecar | REVIEW | 3 (0 missing, 1 incorrect, 2 suggestions) |
| 16 | start-developing-with-laravel-in-ubuntu-24-04 | REVIEW | 1 (0 missing, 0 incorrect, 1 suggestion) |
| 17 | use-ddev-to-locally-develop-with-drupal | REVIEW | 7 (1 missing, 5 incorrect, 1 suggestion) |
| 18 | start-developing-with-laravel-in-ubuntu-20.04 | REVIEW | 7 (1 missing, 5 incorrect, 1 suggestion) |
| 19 | laravel-boost-ddev | REVIEW | 1 (0 missing, 0 incorrect, 1 suggestion) |
| 20 | cursor-pin-agent-chats | REVIEW | 1 (0 missing, 0 incorrect, 1 suggestion) |
| 21 | drift-in-cursor-ai-rules | REVIEW | 5 (1 missing, 3 incorrect, 1 suggestion) |
| 22 | cursor-ai-tools | REVIEW | 3 (0 missing, 1 incorrect, 2 suggestions) |

**Totals: 1 PASS, 21 REVIEW. 101 total findings (10 missing, 61 incorrect, 30 suggestions).**

## Most Common Issues

1. **Missing `draft` field** -- 10 posts
2. **Emoji after "Baamaapii"** -- 8 posts
3. **Time estimates in headings** -- 6 posts (across multiple headings)
4. **"Wrapping Up" heading** -- 5 posts
5. **First-person voice instead of second person** -- 14 posts
6. **Missing code block explanations** -- 8 posts
7. **Missing social media companion file** -- 17 posts
8. **"Ahnii!" formatting issues** (comma instead of !, not own paragraph, or missing entirely) -- 5 posts
9. **Missing "Baamaapii" closing** -- 3 posts
