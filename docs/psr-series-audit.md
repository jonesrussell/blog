# PSR Series Audit Report

Generated: 2026-03-19

---

## psr-standards-in-php-practical-guide-for-developers/index.md — 8 findings: 3 missing, 3 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[FRONTMATTER]** Missing: `summary` is two sentences. Fix: Shorten to one sentence, e.g., "A series exploring PHP-FIG's PSR standards with practical examples to help you write more interoperable PHP code."

**[STRUCTURE]** Line 13: Does not open with "Ahnii!" as its own paragraph. Fix: Add `Ahnii!` as its own paragraph before the intro text.

**[STRUCTURE]** Line 13: Intro uses first person ("You're not alone!") and is somewhat informal for an index page. This is minor but noted for consistency with the style guide's second-person directive.

**[SERIES STRUCTURE]** N/A: This is the series index post, so the series-specific template (prerequisites blockquote, problem statement, common mistakes, try it yourself, etc.) does not fully apply. However, it does have a "Try It Yourself" equivalent ("Getting Started") and closes with "Baamaapii". No action needed on template sections.

**[CONTENT]** Line 92: "To follow along, clone our companion repository" uses "our" (first person plural). Fix: Change to "the companion repository" for consistency with second-person voice.

**[CONTENT]** Line 100: "The blog API demonstrates every PSR in a real project context. Each PSR has:" -- no language tag issues, but "our" is not used here. OK.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-standards-in-php-practical-guide-for-developers.md`.

---

## psr-1-basic-coding-standard/index.md — 12 findings: 3 missing, 6 incorrect, 3 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Line 23: Intro uses first person ("That's exactly what happened to me last week"). Fix: Rewrite in second person, e.g., "You've probably pulled down a PHP project and felt like you were reading five different coding styles at once."

**[STRUCTURE]** Line 27: Heading "Understanding PSR-1 (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)" from heading.

**[STRUCTURE]** Line 29: Heading "Files and Namespaces (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 39: Heading "Naming Things Right (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 45: Heading "Real-World Example (10 minutes)" has a time estimate. Fix: Remove "(10 minutes)".

**[STRUCTURE]** Line 101: Heading "Common Mistakes and Fixes (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 130: Heading "Tools to Help You (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 145: Heading "Resources (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[CONTENT]** Line 133: "I use these tools in all my projects" -- first person. Fix: Rewrite as "These tools help enforce PSR-1 compliance:" or similar second-person phrasing.

**[SERIES STRUCTURE]** Missing: No "Try It Yourself" section with companion repo commands. Fix: Add a section with `git clone`, `composer install`, and `composer test -- --filter=PSR1` commands.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-1-basic-coding-standard.md`.

---

## psr-3-logger-interface/index.md — 11 findings: 2 missing, 6 incorrect, 3 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Line 23: Intro uses first person ("I was helping a team"). Fix: Rewrite in second person.

**[STRUCTURE]** Line 27: Heading "Understanding PSR-3 (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 59: Heading "2. Log Levels (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 71: Heading "Real-World Implementation (10 minutes)" has a time estimate. Fix: Remove "(10 minutes)".

**[STRUCTURE]** Line 152: Heading "Using It In Your Project (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 174: Heading "Framework Integration (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 210: Heading "Quick Tips (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[CONTENT]** Line 153: "Here's how I use this in my projects" -- first person. Fix: Rewrite as "Here's how to use this in a project:".

**[SERIES STRUCTURE]** Missing: No "Try It Yourself" section with companion repo commands. Fix: Add a section with clone/test commands.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-3-logger-interface.md`.

---

## psr-4-autoloading-standard/index.md — 12 findings: 2 missing, 7 incorrect, 3 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Line 20: Intro uses first person ("I was helping a team"). Fix: Rewrite in second person.

**[STRUCTURE]** Line 22: Heading "Understanding PSR-4 (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 26: Heading "Key Concepts (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 38: Heading "Real-World Example (10 minutes)" has a time estimate. Fix: Remove "(10 minutes)".

**[STRUCTURE]** Line 40: "Here's how I structure my projects" -- first person. Fix: Rewrite in second person.

**[STRUCTURE]** Line 52: Heading "1. Setting Up Composer (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 66: Heading "2. Creating Classes (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 82: Heading "Common Patterns I Use (5 minutes)" has a time estimate. Fix: Rename to "Common Patterns" (remove time estimate and first person).

**[STRUCTURE]** Line 117: Heading "Framework Examples (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 119: "If you're using Laravel or Symfony (like I do)" -- first person. Fix: Remove "(like I do)".

**[STRUCTURE]** Line 155: Heading "Quick Fixes for Common Issues (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 179: Heading "Testing Your Setup (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[SERIES STRUCTURE]** Missing: No dedicated "Try It Yourself" section with companion repo commands (the "Testing Your Setup" section exists but uses a different file, not the companion repo). Fix: Add standard "Try It Yourself" section.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-4-autoloading-standard.md`.

---

## psr-6-caching-interface/index.md — 5 findings: 2 missing, 1 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Line 18: Does not open with "Ahnii!" as its own paragraph. The intro text is on the same line/paragraph block as "Ahnii!". Actually, line 17 is `Ahnii!` on its own line, which is correct. However, line 19 starts a new paragraph with series info before the intro sentence. The prerequisites blockquote (line 22) comes after the series link paragraph, which breaks the expected order. Fix: Move the prerequisites blockquote to immediately after "Ahnii!" and before the intro paragraph. Move the series link to the end or inline.

**[STRUCTURE]** Line 26: Heading "What Problem Does PSR-6 Solve? (2 minutes)" has a time estimate. Fix: Remove "(2 minutes)".

**[STRUCTURE]** Line 29: Heading "Core Interfaces (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 75: Heading "Practical Usage (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 102: Heading "Common Pitfalls (3 minutes)" has a time estimate. Fix: Remove "(3 minutes)".

**[STRUCTURE]** Line 164: Heading "Next Steps (5 minutes)" -- not a time estimate in the heading per se, but "(5 minutes)" should not be there. Actually, line 164 is just "## Next Steps" without a time estimate. Wait, re-checking: line 164 is "## Next Steps" -- no time estimate. Correction: no issue here.

**[CONTENT]** Line 102: Section is called "Common Pitfalls" rather than "Common Mistakes" -- this is acceptable but differs from the template. Suggestion only.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-6-caching-interface.md`.

---

## psr-7-http-message-interfaces/index.md — 4 findings: 2 missing, 0 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[CONTENT]** Lines 96-117: The "Creating Requests" code block has no follow-up explanation sentences. Fix: Add 1-2 sentences after the code block explaining what the code demonstrates.

**[CONTENT]** Lines 122-136: The "Handling Responses" code block has no follow-up explanation sentences. Fix: Add 1-2 sentences.

**[CONTENT]** Line 139: Section titled "Best Practices" -- the series template calls for "Common Mistakes" with bad/good code pairs. The section does show bad/good pairs but is titled differently. Suggestion: Rename to "Common Mistakes and Fixes" for consistency.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-7-http-message-interfaces.md`.

---

## psr-11-container-interface/index.md — 3 findings: 1 missing, 0 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[CONTENT]** Line 68: "Here's a simple implementation" -- minor, no explicit first person. OK.

**[CONTENT]** Lines 70-103: The basic implementation code block has a brief follow-up, but the `// Example usage` is inside the code block itself rather than as prose after it. Suggestion: Move the usage example to a separate code block with a prose explanation.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-11-container-interface.md`.

---

## psr-12-extended-coding-style-guide/index.md — 6 findings: 2 missing, 2 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Line 170: "In our next post, we'll explore PSR-13, which defines standards for HTTP message interfaces in PHP." This is factually incorrect -- PSR-13 is about hypermedia links, not HTTP message interfaces. Fix: Change to "PSR-13, which defines standards for hypermedia links in PHP."

**[CONTENT]** Lines 130-135: The "Tools for PSR-12 Compliance" section is a bare numbered list with no code or links. Fix: Add brief code examples or links for each tool.

**[CONTENT]** Line 164: Heading "Next Steps" section says PSR-13 is about "HTTP message interfaces" which is wrong. Fix: Correct to "hypermedia links".

**[SOCIAL]** Missing: No companion file at `docs/social/psr-12-extended-coding-style-guide.md`.

---

## psr-13-hypermedia-links/index.md — 6 findings: 2 missing, 2 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[FRONTMATTER]** Line 11: Tags are `[php, psr-13, hypermedia, rest]` -- missing `php-fig` tag which all other posts include. Fix: Add `php-fig` to tags (but this would make 5 tags; consider replacing one). Alternatively, keep 4 tags but note the inconsistency.

**[STRUCTURE]** Line 85: Heading "Usage Examples (15 minutes)" has a time estimate. Fix: Remove "(15 minutes)".

**[STRUCTURE]** Line 164: Heading "Next Steps (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[STRUCTURE]** Line 195: Heading "Resources (5 minutes)" has a time estimate. Fix: Remove "(5 minutes)".

**[CONTENT]** Line 32: The paragraph beginning "Today we'll explore PSR-13" is redundant with the earlier intro that already explains PSR-13. Fix: Remove this paragraph to avoid repetition.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-13-hypermedia-links.md`.

---

## psr-14-event-dispatcher/index.md — 2 findings: 0 missing, 0 incorrect, 2 suggestions

**[CONTENT]** Line 26: Uses double hyphens `--` instead of em dashes throughout the post (lines 26, 139, 261, 262, 285, 289, 293, etc.). The style guide says em dashes should be used sparingly (1-2 max). The double hyphens are a stylistic choice but are used very frequently here. Suggestion: Convert to proper em dashes and reduce usage to 1-2 per post.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-14-event-dispatcher.md`.

---

## psr-15-http-handlers/index.md — 3 findings: 0 missing, 1 incorrect, 2 suggestions

**[STRUCTURE]** Line 19: The intro paragraph comes before the prerequisites blockquote (line 21). The template expects prerequisites immediately after "Ahnii!". Fix: Swap the intro paragraph and the prerequisites blockquote so prerequisites come first.

**[CONTENT]** Uses double hyphens `--` extensively throughout the post as dash substitutes (lines 25, 27, 29, 85, 157, 165, 249, 327, 348, etc.). Same suggestion as PSR-14: reduce em dash usage and use proper em dashes where kept.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-15-http-handlers.md`.

---

## psr-16-simple-cache/index.md — 2 findings: 0 missing, 0 incorrect, 2 suggestions

**[STRUCTURE]** Lines 19-21: The intro paragraph is followed by a series link paragraph before the prerequisites blockquote (line 23). The template expects prerequisites immediately after "Ahnii!". Suggestion: Move the prerequisites blockquote to immediately after "Ahnii!" and before the intro.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-16-simple-cache.md`.

---

## psr-17-http-factories/index.md — 3 findings: 1 missing, 0 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Lines 17-18: The intro paragraph comes before the prerequisites blockquote (line 20). Suggestion: Swap so prerequisites come immediately after "Ahnii!".

**[SOCIAL]** Missing: No companion file at `docs/social/psr-17-http-factories.md`.

---

## psr-18-http-client/index.md — 3 findings: 1 missing, 0 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Lines 17-18: The intro paragraph comes before the prerequisites blockquote (line 20). Suggestion: Swap so prerequisites come immediately after "Ahnii!".

**[SOCIAL]** Missing: No companion file at `docs/social/psr-18-http-client.md`.

---

## psr-20-clock/index.md — 3 findings: 1 missing, 0 incorrect, 2 suggestions

**[FRONTMATTER]** Missing: `draft` field is absent. Fix: Add `draft: false`.

**[STRUCTURE]** Lines 17-18: The intro paragraph comes before the prerequisites blockquote (line 20). Suggestion: Swap so prerequisites come immediately after "Ahnii!".

**[SERIES STRUCTURE]** This is the final post, so "What's Next" links to the series index instead of a next post. This is correct behavior for the last post in the series.

**[SOCIAL]** Missing: No companion file at `docs/social/psr-20-clock.md`.

---

# Summary

| Post | Findings | Missing | Incorrect | Suggestions |
|------|----------|---------|-----------|-------------|
| psr-standards-index | 8 | 3 | 3 | 2 |
| psr-1 | 12 | 3 | 6 | 3 |
| psr-3 | 11 | 2 | 6 | 3 |
| psr-4 | 12 | 2 | 7 | 3 |
| psr-6 | 5 | 2 | 1 | 2 |
| psr-7 | 4 | 2 | 0 | 2 |
| psr-11 | 3 | 1 | 0 | 2 |
| psr-12 | 6 | 2 | 2 | 2 |
| psr-13 | 6 | 2 | 2 | 2 |
| psr-14 | 2 | 0 | 0 | 2 |
| psr-15 | 3 | 0 | 1 | 2 |
| psr-16 | 2 | 0 | 0 | 2 |
| psr-17 | 3 | 1 | 0 | 2 |
| psr-18 | 3 | 1 | 0 | 2 |
| psr-20 | 3 | 1 | 0 | 2 |
| **TOTAL** | **83** | **22** | **28** | **33** |

## Top Recurring Issues

1. **Missing `draft` field** (11 posts) -- only PSR-14, PSR-15, and PSR-16 have it
2. **Missing social media companion files** (all 15 posts) -- `docs/social/` has no PSR files
3. **Time estimates in headings** (PSR-1, PSR-3, PSR-4, PSR-6, PSR-13) -- older posts have "(N minutes)" in section headings
4. **First-person voice** (PSR-1, PSR-3, PSR-4, index) -- "I", "my", "our" instead of "you"/"your"
5. **Prerequisites blockquote placement** (PSR-6, PSR-15, PSR-16, PSR-17, PSR-18, PSR-20) -- should come immediately after "Ahnii!"
6. **Missing "Try It Yourself" section** (PSR-1, PSR-3, PSR-4) -- older posts lack the companion repo commands
