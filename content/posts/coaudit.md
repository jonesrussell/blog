# coaudit: AI-Powered Code Audits with GitHub Copilot CLI

*This is a submission for the [GitHub Copilot CLI Challenge](https://dev.to/challenges/github-2026-01-21)*

## What I Built

**coaudit** is a command-line tool that performs structured code audits on any repository using GitHub Copilot CLI. Instead of implementing static analyzers, it orchestrates Copilot to analyze codebases across **6 critical dimensions**:

1. **Dead Code** – Unused functions, variables, imports, unreachable code
2. **Architectural Leaks** – Layer violations, cyclic dependencies, improper coupling
3. **Selector Fragility** – Brittle CSS/DOM selectors prone to breaking with HTML changes
4. **Routing Inconsistencies** – Mismatched or missing route handlers, parameter naming mismatches
5. **Missing Tests** – Untested functions, uncovered error paths, integration gaps
6. **Observability Gaps** – Missing logging, error context, unmonitored operations

### How It Works

```bash
# Audit any local project
coaudit ~/my-project

# Or audit directly from GitHub
coaudit owner/repo

# Full GitHub URL also works
coaudit https://github.com/owner/repo
```

The tool:
1. **Collects** source files from the target repository (multi-language support: JS, TS, Python, PHP, Go, Java, Rust)
2. **Loads** dimension-specific audit prompts from curated markdown templates
3. **Chunks** code context intelligently to stay within token limits
4. **Invokes** GitHub Copilot CLI in batch mode with prompt + context
5. **Generates** a structured Markdown report with findings across all dimensions

### Why This Matters

Code audits typically require:
- **Static analyzers** – Language-specific, limited to syntactic rules
- **Code review tools** – Expensive, require human reviewers
- **Manual analysis** – Time-consuming, inconsistent

coaudit combines the **intelligence of Copilot** with the **automation of batch processing**. It provides semantic analysis that static tools can't do, at the speed of automation.

---

## Demo

**Repository:** https://github.com/jonesrussell/coaudit

### Quick Start

```bash
# Install
npm install
npm start

# Run audit on coaudit itself (meta!)
node bin/coaudit .

# Audit an external GitHub repo
node bin/coaudit facebook/react
```

### Example Output

When you run `coaudit` on a repository, you get a Markdown report like:

```
# Copilot Pipeline Audit Report

**Repository:** facebook/react
**Timestamp:** 2026-02-16T01:45:59.842Z

## Summary
| Status | Count |
|--------|-------|
| Completed | 6 |
| Skipped | 0 |
| Errors | 0 |

## Findings

### Dead Code
**Status:** ✅ Completed
- Unused exports in `src/utils.js`
- Unreachable branches in error handling
- Deprecated function still exported...

### Architectural Leaks
**Status:** ✅ Completed
- Direct imports violating layer boundaries
- Cyclic dependency between modules A and B...

### Missing Tests
**Status:** ✅ Completed
- 14 functions with zero test coverage
- Error paths not tested...
```

### Real Copilot Integration

This is **not a mock** – the tool makes real calls to Copilot CLI in batch mode:

```javascript
// From src/runner.js
const output = execSync(
  `copilot -p '${prompt + context}' --allow-all --add-dir '${targetDir}'`,
  { encoding: 'utf8', timeout: 180000 }
);
```

Each audit dimension spawns a full Copilot analysis, giving you genuine semantic insights across your entire codebase.

---

## My Experience with GitHub Copilot CLI

### Why Copilot CLI Was Essential

Building coaudit was only possible *because* of Copilot CLI's non-interactive mode (`-p` flag). Here's why:

**Problem:** I needed to automate code analysis without manually running Copilot for each repo.

**Solution:** Copilot CLI's `-p, --prompt` flag enables batch execution:
```bash
copilot -p "analyze this code" --allow-all
```

This unlocked the entire project. Without it, coaudit would require:
- Manual prompt copying/pasting
- Interactive terminal sessions per repo
- No way to orchestrate 6 sequential analyses

### The Development Journey

1. **Initial Approach** – Started with static analyzer rules. Too limiting – couldn't detect architectural patterns or semantic issues.

2. **Pivot to Copilot** – Realized Copilot CLI could do semantic analysis. But how to automate it?

3. **Discovered Batch Mode** – The `-p` flag was the breakthrough. Suddenly, I could:
   - Pass full code context as a single prompt
   - Run 6 audit dimensions in sequence
   - Parse Copilot's responses into structured reports
   - All without user interaction

4. **Real-World Testing** – Ran coaudit on itself (meta!). The 6 audit dimensions identified:
   - Architectural issue: Copilot integration logic duplicated in `runner.js`
   - Test coverage gap: No test framework yet
   - Observability gap: Silent failures in repo cloning
   - Dead code: Unused exports in integration module

These insights came from Copilot, not linters.

### Key Features Enabled by Copilot CLI

| Feature | Why It Works |
|---------|-------------|
| **Semantic Analysis** | Copilot understands code intent, not just syntax |
| **Multi-Language** | One prompt works for JS, Python, PHP, Go, Java, Rust |
| **Contextual** | Can analyze architectural patterns across files |
| **Extensible** | Adding audit dimensions is just adding a markdown prompt |
| **Batch Processing** | Non-interactive mode enables automation |

### What I Learned

- **Copilot CLI is a powerful automation engine** – Not just for chat, but for building agentic workflows
- **Prompts-as-code is elegant** – Audit rules live in markdown, easy to version and modify
- **Context windows are the lever** – Intelligently chunking code context is more important than prompt engineering
- **Batch mode is underrated** – The `-p` flag transforms Copilot from interactive tool to orchestration platform

### Challenges & Solutions

**Challenge:** Large codebases exceed token limits
**Solution:** Implemented smart chunking – limit context to 50KB per audit dimension, prioritize relevant files

**Challenge:** Copilot takes 30-180 seconds per dimension
**Solution:** Added progress indicators and timeout handling; parallel audits planned for v1

**Challenge:** Structuring Copilot's free-text output
**Solution:** Request JSON format in prompts; parse responses programmatically

### The Meta Moment

I ran coaudit on coaudit itself. Copilot found legitimate issues that I missed:
- Unused exports in `copilot-integration.js`
- Architectural leak: Should use dedicated integration module instead of duplicating logic in runner.js
- Missing tests and observability logging

This validated the tool's value – even the author benefits from automated analysis.

---

## Why coaudit Matters for Teams

1. **Speed** – Get insights from a full codebase audit in minutes, not days
2. **Consistency** – Same audit rules applied to every dimension
3. **Scale** – Works on any size repo, any language
4. **Feedback Loop** – Iterate on audit prompts to improve analysis
5. **Learning** – Copilot's findings teach you architectural patterns you might miss

### What's Next

- Real-time audit feedback in GitHub PR comments
- Configurable audit dimensions via `.copilot-audit.json`
- JSON/HTML report formats for CI/CD integration
- Severity levels and risk scoring
- Parallel dimension audits for faster results

---

## Thanks to GitHub Copilot CLI

This project wouldn't exist without the `-p` batch execution mode. Copilot CLI transformed from a chat interface into a powerful automation platform. Excited to see what else the community builds!

**Try coaudit:** https://github.com/jonesrussell/coaudit

---
