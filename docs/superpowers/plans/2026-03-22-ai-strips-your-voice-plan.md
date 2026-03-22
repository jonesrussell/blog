# AI Strips Your Voice Post — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and publish a blog post that responds to Ruth M. Trucks' LinkedIn observation about AI stripping voice, showing how a persistent style layer fixes the problem.

**Architecture:** Hugo page bundle post at `content/posts/ai/ai-strips-your-voice-style-layer/index.md`. Companion social copy at `docs/social/ai-strips-your-voice-style-layer.md`. OG image auto-generated via `task og:generate`.

**Tech Stack:** Hugo, Markdown, Playwright (OG image generation)

**Spec:** `docs/superpowers/specs/2026-03-22-ai-strips-your-voice-design.md`

---

### Task 1: Create post scaffold

**Files:**
- Create: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

- [ ] **Step 1: Create the post directory**

```bash
mkdir -p content/posts/ai/ai-strips-your-voice-style-layer
```

- [ ] **Step 2: Write frontmatter and greeting**

```yaml
---
title: "AI strips your voice because you haven't taught it what to protect"
date: 2026-03-22
categories: [ai]
tags: [claude-code, ai-tools, writing, content-creation]
summary: "Stop AI from stripping your writing voice. Encode your style rules, review the output, and feed corrections back in."
slug: "ai-strips-your-voice-style-layer"
draft: true
---

Ahnii!
```

- [ ] **Step 3: Verify scaffold builds**

```bash
hugo --buildDrafts 2>&1 | tail -3
```

Expected: clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add content/posts/ai/ai-strips-your-voice-style-layer/index.md
git commit -m "feat: scaffold ai-strips-your-voice-style-layer post"
```

---

### Task 2: Write intro and "Why AI Strips Your Voice" sections

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec sections 1 and 2
- Ruth M. Trucks' LinkedIn post (in spec context)
- Soren Kai's comment (prompt-level fix, session-bound)

- [ ] **Step 1: Write the intro paragraph**

After "Ahnii!", write the intro per spec section 1. Reference Ruth's observation. State scope in one sentence. Link [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) on first mention.

Voice checks before moving on:
- No em dashes
- No three-item rhythm patterns
- Short declarative sentences
- Second person

- [ ] **Step 2: Write "Why AI Strips Your Voice" section**

H2 heading. Cover:
- "Shorten this" gives one objective, zero constraints
- Voice elements aren't tagged as protected
- Acknowledge Soren Kai: prompt-level fix works but is session-bound
- The style layer makes it permanent

- [ ] **Step 3: Verify build**

```bash
hugo --buildDrafts 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add intro and why-ai-strips-voice sections"
```

---

### Task 3: Write "The Style Layer" section

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 3
- `archetypes/default.md` (show the actual archetype)
- `~/.claude/skills/blog-writing/SKILL.md` (pull real excerpts for the style rules)

- [ ] **Step 1: Write the archetype subsection**

Show the Hugo archetype as a code block. Explain that structure is enforced from line one.

- [ ] **Step 2: Write the style rules subsection**

Pull real excerpts from the blog-writing skill. Show specific, checkable rules. Not vague guidance.

- [ ] **Step 3: Write the non-coder key point**

One paragraph. You don't need Claude Code for this. Paste a style document into any AI chat. Same principle.

- [ ] **Step 4: Verify the skill excerpts are accurate**

Read `~/.claude/skills/blog-writing/SKILL.md` and confirm every rule quoted in the post exists in the skill.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add style-layer section with archetype and skill excerpts"
```

---

### Task 4: Write "Review the Output" section

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 4
- `~/.claude/skills/blog-reviewing/SKILL.md` (real checklist items and findings format)

- [ ] **Step 1: Write the review checklist subsection**

Show real checklist items from the review skill. Emphasize: specific and checkable, not subjective.

- [ ] **Step 2: Show the findings format**

Include the structured format (category, line number, fix). This is auditable output.

- [ ] **Step 3: Verify review skill excerpts are accurate**

Read `~/.claude/skills/blog-reviewing/SKILL.md` and confirm quoted items exist.

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add review-the-output section"
```

---

### Task 5: Write "Teach It Your Domain" section

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 5
- The `--no-milestone` example from the hooks post review (earlier this session)

- [ ] **Step 1: Write the domain expertise section**

H2 heading. Cover:
- Voice is half the problem. Substance is the other half.
- The `--no-milestone` example: flag doesn't exist, caught by running the command
- Accuracy checklist requires verifying against real repos
- Generalize for content creators: product knowledge, industry terminology

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: add teach-it-your-domain section"
```

---

### Task 6: Write "Feed Corrections Back In" section

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 6
- Em dash catch from this brainstorming session
- Clickbait catch from `~/.claude/projects/-home-jones-dev-blog/memory/feedback_voice_tone.md`

- [ ] **Step 1: Write the feedback loop section**

H2 heading. Two real examples:
1. Em dash catch (this session): summary draft used em dashes, author caught it, became a rule
2. Clickbait catch (past session): "without losing your mind", became a feedback memory

Each correction is permanent. Not a note. A rule.

- [ ] **Step 2: Verify the feedback memory exists and matches**

Read `~/.claude/projects/-home-jones-dev-blog/memory/feedback_voice_tone.md` and confirm the clickbait example is accurate.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add feed-corrections-back-in section"
```

---

### Task 7: Write "Observe, Measure, Refine" section and closing

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec sections 7 and 8
- `docs/content-todo.md` (verify it exists for the revision tracking claim)
- GitHub issues #2-#9 (verify they exist for the audit tracking claim)

- [ ] **Step 1: Write the observe/measure/refine section**

H2 heading. Cover:
- Older posts still have AI tells. Expected.
- Observe, measure, refine loop (brief, not a numbered list with bold labels)
- Revision plans tracked in GitHub issues, auditable
- Manual today, automation coming (teaser, not a full section)

- [ ] **Step 2: Write the closing and Baamaapii**

Flow naturally from the last section. No "wrapping up" header. End with Baamaapii.

- [ ] **Step 3: Verify claims**

```bash
# content-todo.md exists
ls docs/content-todo.md

# GitHub issues exist
gh issue list --repo jonesrussell/blog --label content-quality --state open
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add observe-measure-refine section and closing"
```

---

### Task 8: Write "How This Post Was Made" block

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 9

- [ ] **Step 1: Add the collapsible details block**

Use HTML `<details><summary>` for the expandable section. Place after Baamaapii.

At a glance line + expandable list of:
- Model, style skill, review skill, brainstorming exchanges count, voice corrections, domain checks, archetype, feedback memories, review pass, OG image, social copy

- [ ] **Step 2: Update the brainstorming exchange count**

Count the actual number of back-and-forth exchanges from this session and fill in the ~N placeholder.

- [ ] **Step 3: Verify build with HTML details element**

```bash
hugo --buildDrafts 2>&1 | tail -3
```

Hugo's Goldmark has `unsafe = true` so raw HTML should render.

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add how-this-post-was-made meta block"
```

---

### Task 9: Write "Skills Behind This Post" block

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

**Source material:**
- Spec section 10
- Blog posts, infrastructure, and project ecosystem for verification

- [ ] **Step 1: Add a separate collapsible details block**

Use a second `<details><summary>` block after "How This Post Was Made." Label it "Skills behind this post" or similar.

Categories to include:
- **Languages:** Go, PHP, TypeScript, Python, Bash, Markdown, YAML
- **AI and Automation:** Claude Code, Claude API, MCP tools, prompt engineering, skills/knowledge curation for AI agents, OG image generation (Playwright)
- **Web Frameworks:** Laravel 12, Vue 3, Hugo, Tailwind CSS, Inertia.js
- **Backend and Architecture:** Clean Architecture, Uber FX (DI), Redis pub/sub, microservices pipeline, REST API design, PSR standards (1-20)
- **DevOps and Infrastructure:** Docker, GitHub Actions CI/CD, GitHub Pages, Deployer, Caddy, Ansible, DigitalOcean, systemd, UFW/fail2ban
- **Security:** SSH hardening, SSL/TLS, secrets management, kernel hardening, security headers, rate limiting
- **Testing and Quality:** Pest, Vitest, testify, golangci-lint, PHP Pint, TDD, code auditing
- **Tools:** Git, VS Code, Claude Code, DDEV, Task (Taskfile), Playwright, WSL
- **Content and SEO:** Technical writing, static site optimization, OpenGraph, RSS, content curation, multi-platform social copy
- **Project Management:** GitHub Issues, milestone tracking, audit workflows, monorepo maintenance, open-source contribution

Every item must be demonstrated somewhere in the blog posts or infrastructure. Not aspirational.

- [ ] **Step 2: Verify build**

```bash
hugo --buildDrafts 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add skills-behind-this-post block"
```

---

### Task 10: Full review pass

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

- [ ] **Step 1: Run the blog-reviewing skill**

Invoke `/blog-reviewing` against the post. Fix all findings.

- [ ] **Step 2: Voice check**

Read the full post and check for:
- Em dashes (zero preferred)
- Three-item rhythm patterns
- Filler transitions
- Hedging language
- AI tells

- [ ] **Step 3: Accuracy check**

- All skill excerpts match actual skill files
- Feedback memory example matches actual memory file
- GitHub issues claim is verifiable
- Links resolve (relref for internal, HTTPS for external)

- [ ] **Step 4: Build check**

```bash
hugo --buildDrafts 2>&1 | tail -3
```

- [ ] **Step 5: Commit any fixes**

```bash
git commit -am "fix: review pass corrections"
```

---

### Task 11: Generate social copy and OG image

**Files:**
- Create: `docs/social/ai-strips-your-voice-style-layer.md`

- [ ] **Step 1: Write social copy**

Follow the social media artifact format from the blog-writing skill:
- Facebook: hook + link + hashtags
- X: under 240 chars including URL
- LinkedIn: professional tone, no hashtags
- Canonical URL: `https://jonesrussell.github.io/blog/ai-strips-your-voice-style-layer/`

- [ ] **Step 2: Generate OG image**

```bash
task og:generate
```

Verify the image exists at `static/images/og/ai-strips-your-voice-style-layer.png`.

- [ ] **Step 3: Commit**

```bash
git add docs/social/ai-strips-your-voice-style-layer.md static/images/og/ai-strips-your-voice-style-layer.png
git commit -m "feat: add social copy and OG image"
```

---

### Task 12: Publish

**Files:**
- Modify: `content/posts/ai/ai-strips-your-voice-style-layer/index.md`

- [ ] **Step 1: Set draft to false**

Change `draft: true` to `draft: false`.

- [ ] **Step 2: Production build**

```bash
hugo --gc --minify 2>&1 | tail -3
```

- [ ] **Step 3: Commit and push**

```bash
git commit -am "feat: publish ai-strips-your-voice-style-layer post"
git push
```

- [ ] **Step 4: Verify deploy**

```bash
gh run list --limit 1
gh run watch <run-id> --exit-status
```

- [ ] **Step 5: Verify the post is live**

Confirm the URL resolves: `https://jonesrussell.github.io/blog/ai-strips-your-voice-style-layer/`
