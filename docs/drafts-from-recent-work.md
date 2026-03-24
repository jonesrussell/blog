# Potential Blog Post Drafts — from git logs (2026-03-09 to 2026-03-23)

## 1. Building a PHP Framework from Scratch

**Suggested title:** "Building a PHP Framework: From Migration Protocol to HTTP Middleware Stack"
- **Repos:** waaseyaa, minoo, claudriel, irc.waaseyaa.org, me-vs-roadmap, scratch-waaseyaa
- **Key work:** 9 field types for content modeling, 6 HTTP middleware (security, rate limiting, compression, ETag), migration protocol, logger contract replacing all error_log() calls, security hardening, monorepo split workflow with Discord changelog notifications
- **Pitch:** Architecture decisions and trade-offs against Laravel, validated across 5+ real apps.

## 2. Turning Your PHP App into an MCP Server

**Suggested title:** "Turning Your PHP App into an MCP Server"
- **Repos:** claudriel, waaseyaa
- **Key commits:** `bc95e72` expose Claudriel as MCP server via waaseyaa/mcp, `eb294d0` replace Docker agent subprocess with native waaseyaa/ai-agent, `80c5359` wire ai-vector for semantic entity embedding, `6f9205b` model fallback chains and benchmark harness
- **Pitch:** MCP is hot right now. Showing how to wire a PHP application as an MCP server is highly topical.

## 3. LLM Eval Framework in PHP

**Suggested title:** "Building an LLM Eval Harness in PHP: Schema Validation, Drift Detection, and Judge Scoring"
- **Repos:** claudriel
- **Key commits:** `96d6b62` schema contract validator + drift detection CI, `458dfe5` LLM judge scoring, `9ed645b` eval report generator, `25ec8d4` model routing table, `6f9205b` model fallback chains + benchmark harness
- **Pitch:** Most eval tooling is Python. Building one in PHP with CI-integrated drift detection is unusual enough to stand out.

## 4. Go Monorepo Hygiene: Layer Boundaries and Drift Detection

**Suggested title:** "Enforcing Architecture in a Go Monorepo: Layer Checkers, Drift Detectors, and CI Gates"
- **Repos:** north-cloud
- **Key commits:** `76e7006d` layer-checker CI gate, `660bd578` spec drift detector, `f2c83913` Phase 1 layer hygiene, `30735457` per-service image tag tracking, `021e2748` pin Docker image tags to git SHA
- **Pitch:** Practical patterns for keeping a Go microservices monorepo from turning into a big ball of mud.

## 5. Shipping a Community Platform in Two Weeks

**Suggested title:** "Shipping a Community Platform in Two Weeks: GraphQL, Image Uploads, Elder Identity, and Umami Analytics"
- **Repos:** minoo
- **Key work:** GraphQL endpoint + post CRUD, image upload service, Elder self-identification toggle, role management UI, zero-friction auto-login registration, NC content sync queue worker, Umami analytics, sidebar-first navigation redesign
- **Pitch:** End-to-end story of launching a community platform for Indigenous users — UX decisions are as interesting as the tech.

## 6. Building an IRC Web Client on a Custom PHP Framework

**Suggested title:** "Building an IRC Web Client from Scratch: SSE Streaming, Session Queues, and Guest Access"
- **Repos:** irc.waaseyaa.org
- **Key work:** IRC protocol domain layer, SSE streaming chat client with SessionQueue, admin panel, guest session support, Go IRCd service, session deadlock fix (session_write_close inside SSE callback)
- **Pitch:** IRC is retro-cool. Building a web client with SSE (not WebSockets) and solving the session-deadlock-inside-SSE problem is a fun technical story.

## 7. Plugin-Based Content Harvesting Pipeline

**Suggested title:** "Building a Plugin-Based Content Harvester in Python"
- **Repos:** indigenous-harvesters
- **Key work:** Harvester protocol + plugin registry, runner pipeline (register/fetch/transform/deliver), NC API client, envelope builder, Click CLI
- **Pitch:** Clean plugin architecture in Python that feeds into the North Cloud pipeline.

## 8. Codifying Your Dev Workflow as Claude Code Skills

**Suggested title:** "Codifying Your Development Workflow as Claude Code Skills"
- **Repos:** skills
- **Key work:** session-to-blog skill, laravel-to-waaseyaa migration skill, social-media-posts skill, accuracy verification + self-improving audit loop, copilot-claudriel skill for Codex orchestration
- **Pitch:** Meta-post about using Claude Code skills to automate recurring development tasks.

## 9. Pin Docker Image Tags to Git SHA

**Suggested title:** "Stop Using :latest — Pin Docker Image Tags to Git SHA"
- **Repos:** north-cloud
- **Key commits:** `021e2748` pin to git SHA, `eeab8941` revert global IMAGE_TAG (broke unchanged services), `30735457` per-service manifest tracking
- **Pitch:** Short, focused post on a common DevOps pitfall with the exact failure mode that forced the fix.

## 10. Developer Portfolio That Pulls Live Data from Repos

**Suggested title:** "Building a Developer Portfolio That Pulls Live Data from Your Repos"
- **Repos:** me
- **Key work:** Dynamic series routes replacing hardcoded data, server-only loaders for hydration fixes, husky pre-commit hooks with lint-staged, E2E test fixes, page hero redesign
- **Pitch:** Practical post on making a portfolio site that stays current automatically.
