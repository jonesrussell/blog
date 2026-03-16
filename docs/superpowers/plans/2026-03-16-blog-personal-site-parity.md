# Blog-to-Personal-Site Content Automation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate manual series card maintenance by making the personal site auto-generate all content from the blog's RSS feed and a new JSON series endpoint.

**Architecture:** The Hugo blog exposes structured series data via a JSON endpoint (`/blog/series/index.json`) and enriched RSS feed. The SvelteKit personal site fetches this data at build time, replacing hardcoded series data with dynamic content. Two-phase deployment: blog first, personal site second.

**Tech Stack:** Hugo (Go templates, TOML config), SvelteKit 2 (Svelte 5, TypeScript), Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-03-16-blog-personal-site-parity-design.md`

---

## Chunk 1: Blog Infrastructure (Hugo)

### Task 1: Create Hugo Data Files and Series Content Pages

**Files (blog repo: `/home/fsd42/dev/blog`):**
- Create: `data/series.yaml`
- Create: `content/series/_index.md`
- Create: `content/series/php-fig-standards/_index.md`
- Create: `content/series/waaseyaa/_index.md`
- Create: `content/series/docker-fundamentals/_index.md`
- Create: `content/series/codified-context/_index.md`

- [ ] **Step 1: Create `data/series.yaml`**

Create the `data/` directory first (`mkdir -p data`). This maps series IDs to repo URLs (only PSR has one currently):

```yaml
php-fig-standards:
  repoUrl: "https://github.com/jonesrussell/php-fig-guide"
```

- [ ] **Step 2: Create `content/series/_index.md`**

```markdown
---
title: "Series"
description: "Multi-part blog series on software development topics"
---
```

- [ ] **Step 3: Create per-series `_index.md` files**

`content/series/php-fig-standards/_index.md`:
```markdown
---
title: "PHP-FIG Standards Guide"
description: "A comprehensive guide to PHP-FIG standards (PSRs) with practical examples and companion code."
---
```

`content/series/waaseyaa/_index.md`:
```markdown
---
title: "Waaseyaa Framework"
description: "Building an AI personal operations system on the Waaseyaa PHP framework."
---
```

`content/series/docker-fundamentals/_index.md`:
```markdown
---
title: "Docker Fundamentals"
description: "A practical guide to Docker from Dockerfiles to advanced multi-stage builds and security."
---
```

`content/series/codified-context/_index.md`:
```markdown
---
title: "Codified Context"
description: "Using three-tier codified context architecture to help AI assistants understand codebases."
---
```

- [ ] **Step 4: Commit**

```bash
git add data/series.yaml content/series/
git commit -m "feat: add series data files and taxonomy content pages

Create data/series.yaml for series-to-repo mapping.
Create content/series/ _index.md files for taxonomy metadata."
```

---

### Task 2: Add Series Frontmatter to PSR Posts

**Files (blog repo):**
- Modify: `content/posts/psr/psr-1-basic-coding-standard/index.md`
- Modify: `content/posts/psr/psr-12-extended-coding-style-guide/index.md`
- Modify: `content/posts/psr/psr-4-autoloading-standard/index.md`
- Modify: `content/posts/psr/psr-3-logger-interface/index.md`
- Modify: `content/posts/psr/psr-11-container-interface/index.md`
- Modify: `content/posts/psr/psr-14-event-dispatcher/index.md`
- Modify: `content/posts/psr/psr-7-http-message-interfaces/index.md`
- Modify: `content/posts/psr/psr-17-http-factories/index.md`
- Modify: `content/posts/psr/psr-15-http-handlers/index.md`
- Modify: `content/posts/psr/psr-18-http-client/index.md`
- Modify: `content/posts/psr/psr-6-caching-interface/index.md`
- Modify: `content/posts/psr/psr-16-simple-cache/index.md`
- Modify: `content/posts/psr/psr-13-hypermedia-links/index.md`
- Modify: `content/posts/psr/psr-20-clock/index.md`
- Modify: `content/posts/psr/psr-standards-in-php-practical-guide-for-developers/index.md`

Add these frontmatter fields to each PSR post. The values are derived from the hardcoded `psr.ts` data in the personal site. Add fields after the existing `series:` field in each file.

- [ ] **Step 1: Add frontmatter to Foundation group posts**

`psr-1-basic-coding-standard/index.md` -- add after `series:` line:
```yaml
series_order: 1
series_group: "Foundation"
companion_files: ["src/PSR1/UserManager.php"]
test_files: ["tests/PSR1/UserManagerTest.php"]
```

`psr-12-extended-coding-style-guide/index.md`:
```yaml
series_order: 2
series_group: "Foundation"
companion_files: ["src/PSR12/ExampleClass.php", "src/PSR12/ExtendedCodingStyleGuide.php"]
test_files: ["tests/PSR12/ExtendedCodingStyleGuideTest.php"]
prerequisites: [1]
```

`psr-4-autoloading-standard/index.md`:
```yaml
series_order: 3
series_group: "Foundation"
companion_files: ["src/PSR4/Core/Database/Connection.php", "src/PSR4/Post/PostController.php"]
test_files: ["tests/PSR4/Core/Database/ConnectionTest.php", "tests/PSR4/Post/PostControllerTest.php"]
prerequisites: [1]
```

- [ ] **Step 2: Add frontmatter to Core Infrastructure group posts**

`psr-3-logger-interface/index.md`:
```yaml
series_order: 4
series_group: "Core Infrastructure"
companion_files: ["src/PSR3/SmartLogger.php"]
test_files: ["tests/PSR3/SmartLoggerTest.php"]
prerequisites: [1, 3]
```

`psr-11-container-interface/index.md`:
```yaml
series_order: 5
series_group: "Core Infrastructure"
companion_files: ["src/PSR11/ExampleContainer.php", "src/PSR11/DatabaseConnection.php", "src/PSR11/Logger.php"]
test_files: ["tests/PSR11/ExampleContainerTest.php"]
prerequisites: [1, 3]
```

`psr-14-event-dispatcher/index.md`:
```yaml
series_order: 6
series_group: "Core Infrastructure"
companion_files: ["src/Event/PostCreatedEvent.php", "src/Event/SimpleEventDispatcher.php", "src/Event/SimpleListenerProvider.php"]
test_files: ["tests/Event/SimpleEventDispatcherTest.php"]
prerequisites: [1, 3, 5]
```

- [ ] **Step 3: Add frontmatter to HTTP Stack group posts**

`psr-7-http-message-interfaces/index.md`:
```yaml
series_order: 7
series_group: "HTTP Stack"
companion_files: ["src/PSR7/Request.php", "src/PSR7/Response.php", "src/PSR7/Stream.php", "src/PSR7/Uri.php"]
test_files: ["tests/PSR7/RequestTest.php", "tests/PSR7/ResponseTest.php"]
prerequisites: [1, 3]
```

`psr-17-http-factories/index.md`:
```yaml
series_order: 8
series_group: "HTTP Stack"
companion_files: ["src/Http/Factory/ResponseFactory.php", "src/Http/Factory/StreamFactory.php"]
test_files: ["tests/Http/Factory/ResponseFactoryTest.php"]
prerequisites: [7]
```

`psr-15-http-handlers/index.md`:
```yaml
series_order: 9
series_group: "HTTP Stack"
companion_files: ["src/Http/Middleware/AuthMiddleware.php", "src/Http/Middleware/LoggingMiddleware.php", "src/Http/Middleware/MiddlewarePipeline.php"]
test_files: ["tests/Http/Middleware/MiddlewarePipelineTest.php"]
prerequisites: [7, 8]
```

`psr-18-http-client/index.md`:
```yaml
series_order: 10
series_group: "HTTP Stack"
companion_files: ["src/Http/Client/SimpleHttpClient.php", "src/Http/Client/NetworkException.php"]
test_files: ["tests/Http/Client/SimpleHttpClientTest.php"]
prerequisites: [7, 8]
```

- [ ] **Step 4: Add frontmatter to Data & Caching group posts**

`psr-6-caching-interface/index.md`:
```yaml
series_order: 11
series_group: "Data & Caching"
companion_files: ["src/PSR6/CacheItem.php", "src/PSR6/FileCachePool.php"]
test_files: ["tests/PSR6/CacheItemTest.php", "tests/PSR6/FileCachePoolTest.php"]
prerequisites: [1, 3]
```

`psr-16-simple-cache/index.md`:
```yaml
series_order: 12
series_group: "Data & Caching"
companion_files: ["src/Cache/SimpleCache/FileCache.php"]
test_files: ["tests/Cache/SimpleCache/FileCacheTest.php"]
prerequisites: [1, 3]
```

- [ ] **Step 5: Add frontmatter to Specialized group posts**

`psr-13-hypermedia-links/index.md`:
```yaml
series_order: 13
series_group: "Specialized"
companion_files: ["src/PSR13/HypermediaLink.php", "src/PSR13/HypermediaLinkProvider.php"]
test_files: ["tests/PSR13/HypermediaLinkTest.php", "tests/PSR13/HypermediaLinkProviderTest.php"]
prerequisites: [1, 3, 7]
```

`psr-20-clock/index.md`:
```yaml
series_order: 14
series_group: "Specialized"
companion_files: ["src/Clock/SystemClock.php", "src/Clock/FrozenClock.php"]
test_files: ["tests/Clock/FrozenClockTest.php"]
prerequisites: [1, 3]
```

- [ ] **Step 6: Add frontmatter to index post**

`psr-standards-in-php-practical-guide-for-developers/index.md`:
```yaml
series_order: 0
series_group: "Index"
```

This is the series index/overview post; order 0 puts it first.

- [ ] **Step 7: Commit**

```bash
git add content/posts/psr/
git commit -m "feat: add series metadata frontmatter to all PSR posts

Add series_order, series_group, companion_files, test_files,
and prerequisites fields to enable JSON series endpoint."
```

---

### Task 3: Add Series Frontmatter to Non-PSR Series Posts

**Files (blog repo):**
- Modify: `content/posts/ai/waaseyaa-intro/index.md`
- Modify: `content/posts/ai/waaseyaa-entity-system/index.md`
- Modify: `content/posts/ai/waaseyaa-api-layer/index.md`
- Modify: `content/posts/ai/waaseyaa-access-control/index.md`
- Modify: `content/posts/ai/waaseyaa-ai-packages/index.md`
- Modify: `content/posts/ai/waaseyaa-packagist/index.md`
- Modify: `content/posts/ai/co-development-skill-set/index.md`
- Modify: `content/posts/ai/claudriel-temporal-layer/index.md`
- Modify: `content/posts/docker/docker-dockerfile-fundamentals/index.md`
- Modify: `content/posts/docker/docker-multi-stage-builds/index.md`
- Modify: `content/posts/docker/docker-build-performance/index.md`
- Modify: `content/posts/docker/docker-security-users/index.md`
- Modify: `content/posts/docker/docker-advanced-patterns/index.md`
- Modify: `content/posts/ai/codified-context-the-problem/index.md`
- Modify: `content/posts/ai/codified-context-constitution/index.md`
- Modify: `content/posts/ai/codified-context-specialist-skills/index.md`
- Modify: `content/posts/ai/codified-context-skills/index.md`
- Modify: `content/posts/ai/codified-context-cold-memory/index.md`

- [ ] **Step 1: Add frontmatter to waaseyaa posts**

Determine order from publication dates. Add to each post after `series:` line:

`content/posts/ai/waaseyaa-intro/index.md`:
```yaml
series_order: 1
series_group: "Main"
```

`content/posts/ai/waaseyaa-entity-system/index.md`:
```yaml
series_order: 2
series_group: "Main"
```

`content/posts/ai/waaseyaa-api-layer/index.md`:
```yaml
series_order: 3
series_group: "Main"
```

`content/posts/ai/waaseyaa-access-control/index.md`:
```yaml
series_order: 4
series_group: "Main"
```

`content/posts/ai/waaseyaa-ai-packages/index.md`:
```yaml
series_order: 5
series_group: "Main"
```

`content/posts/ai/waaseyaa-packagist/index.md`:
```yaml
series_order: 6
series_group: "Main"
```

`content/posts/ai/co-development-skill-set/index.md`:
```yaml
series_order: 7
series_group: "Main"
```

`content/posts/ai/claudriel-temporal-layer/index.md`:
```yaml
series_order: 8
series_group: "Main"
```

**Note:** Verify exact order by checking `date:` field in each post's frontmatter. Adjust `series_order` values to match chronological order.

- [ ] **Step 2: Add frontmatter to docker-fundamentals posts**

`content/posts/docker/docker-dockerfile-fundamentals/index.md`:
```yaml
series_order: 1
series_group: "Main"
```

`content/posts/docker/docker-multi-stage-builds/index.md`:
```yaml
series_order: 2
series_group: "Main"
```

`content/posts/docker/docker-build-performance/index.md`:
```yaml
series_order: 3
series_group: "Main"
```

`content/posts/docker/docker-security-users/index.md`:
```yaml
series_order: 4
series_group: "Main"
```

`content/posts/docker/docker-advanced-patterns/index.md`:
```yaml
series_order: 5
series_group: "Main"
```

**Note:** Verify exact order by checking `date:` field in each post's frontmatter.

- [ ] **Step 3: Add frontmatter to codified-context posts**

`content/posts/ai/codified-context-the-problem/index.md`:
```yaml
series_order: 1
series_group: "Main"
```

`content/posts/ai/codified-context-constitution/index.md`:
```yaml
series_order: 2
series_group: "Main"
```

`content/posts/ai/codified-context-specialist-skills/index.md`:
```yaml
series_order: 3
series_group: "Main"
```

`content/posts/ai/codified-context-skills/index.md`:
```yaml
series_order: 4
series_group: "Main"
```

`content/posts/ai/codified-context-cold-memory/index.md`:
```yaml
series_order: 5
series_group: "Main"
```

**Note:** Verify exact order by checking `date:` field in each post's frontmatter.

- [ ] **Step 4: Commit**

```bash
git add content/posts/ai/ content/posts/docker/
git commit -m "feat: add series metadata frontmatter to waaseyaa, docker, and codified-context posts"
```

---

### Task 4: Create Hugo JSON Series Endpoint

**Files (blog repo):**
- Modify: `hugo.toml` (lines 125-126, outputs section)
- Create: `layouts/series/list.json`

- [ ] **Step 1: Update `hugo.toml` outputs config**

Add `taxonomy` output format. Find the `[outputs]` section (line 125) and add:

```toml
[outputs]
  home = ['HTML', 'RSS', 'JSON']
  taxonomy = ['HTML', 'RSS', 'JSON']
```

- [ ] **Step 2: Create `layouts/series/list.json`**

This template iterates all series taxonomy terms and outputs structured JSON:

```go-html-template
{{- $scratch := newScratch }}
{{- $scratch.Set "seriesData" slice }}
{{- range .Data.Terms.Alphabetical }}
  {{- $term := .Term }}
  {{- $pages := .Pages }}
  {{- $termPage := site.GetPage (printf "/series/%s" $term) }}
  {{- $title := $term }}
  {{- $description := "" }}
  {{- with $termPage }}
    {{- $title = .Title }}
    {{- $description = .Description }}
  {{- end }}
  {{- $repoUrl := "" }}
  {{- with index site.Data.series $term }}
    {{- with .repoUrl }}
      {{- $repoUrl = . }}
    {{- end }}
  {{- end }}
  {{- /* Group pages by series_group using scratch for loop-safe mutation */ -}}
  {{- $groupScratch := newScratch }}
  {{- $groupScratch.Set "groupMap" dict }}
  {{- $groupScratch.Set "groupOrder" slice }}
  {{- range $pages }}
    {{- $group := .Params.series_group | default "Main" }}
    {{- $currentMap := $groupScratch.Get "groupMap" }}
    {{- if not (index $currentMap $group) }}
      {{- $groupScratch.Set "groupOrder" ($groupScratch.Get "groupOrder" | append $group) }}
    {{- end }}
    {{- $existing := index $currentMap $group | default slice }}
    {{- $entry := dict
      "title" .Title
      "slug" .Slug
      "permalink" .Permalink
      "date" (.Date.Format "2006-01-02")
      "summary" (or .Description (.Summary | plainify | truncate 160))
      "seriesOrder" (.Params.series_order | default 0)
    }}
    {{- with .Params.companion_files }}
      {{- $entry = merge $entry (dict "companionFiles" .) }}
    {{- end }}
    {{- with .Params.test_files }}
      {{- $entry = merge $entry (dict "testFiles" .) }}
    {{- end }}
    {{- with .Params.prerequisites }}
      {{- $entry = merge $entry (dict "prerequisites" .) }}
    {{- end }}
    {{- $existing = $existing | append $entry }}
    {{- $groupScratch.Set "groupMap" (merge $currentMap (dict $group $existing)) }}
  {{- end }}
  {{- /* Build groups array */ -}}
  {{- $groups := slice }}
  {{- $groupMap := $groupScratch.Get "groupMap" }}
  {{- range $groupScratch.Get "groupOrder" }}
    {{- $groupName := . }}
    {{- $entries := index $groupMap $groupName }}
    {{- $entries = sort $entries "seriesOrder" }}
    {{- $groups = $groups | append (dict "name" $groupName "entries" $entries) }}
  {{- end }}
  {{- $seriesEntry := dict
    "id" $term
    "title" $title
    "description" $description
    "postCount" (len $pages)
    "groups" $groups
  }}
  {{- with $repoUrl }}
    {{- $seriesEntry = merge $seriesEntry (dict "repoUrl" .) }}
  {{- end }}
  {{- $scratch.Set "seriesData" ($scratch.Get "seriesData" | append $seriesEntry) }}
{{- end }}
{{- dict "series" ($scratch.Get "seriesData") | jsonify (dict "indent" "  ") }}
```

**Note:** Uses `newScratch` instead of plain variables because Hugo's Go templates have block-scoped variables inside `range` loops -- reassignments don't persist across iterations without Scratch.

- [ ] **Step 3: Build and verify JSON output**

Run: `cd /home/fsd42/dev/blog && task build`

Then verify:
```bash
cat public/series/index.json | python3 -m json.tool | head -50
```

Expected: Valid JSON with 4 series, each having groups and entries with correct `seriesOrder` values.

- [ ] **Step 4: Verify post counts**

```bash
cat public/series/index.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for s in data['series']:
    print(f\"{s['id']}: {s['postCount']} posts, {len(s['groups'])} groups\")
"
```

Expected:
```
php-fig-standards: 15 posts, 6 groups
waaseyaa: 8 posts, 1 groups
docker-fundamentals: 5 posts, 1 groups
codified-context: 5 posts, 1 groups
```

- [ ] **Step 5: Commit**

```bash
git add hugo.toml layouts/series/
git commit -m "feat: add JSON series endpoint at /series/index.json

Outputs structured series data with groups, entries, companion files,
and prerequisites. Consumed by personal site at build time."
```

---

### Task 5: Enrich RSS Feed with Series and Tag Metadata

**Files (blog repo):**
- Modify: `layouts/_default/rss.xml` (lines 51 and 72-89)

- [ ] **Step 1: Add custom namespace to RSS declaration**

In `layouts/_default/rss.xml`, modify line 51. Change:
```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
```
To:
```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:blog="https://jonesrussell.github.io/blog/ns">
```

- [ ] **Step 2: Add series and tag elements to RSS items**

In the item loop (after the `<category>` lines around line 83), add:

```go-html-template
      {{- range .Params.series }}
      <blog:series>{{ . }}</blog:series>
      {{- end }}
      {{- with .Params.series_order }}
      <blog:seriesOrder>{{ . }}</blog:seriesOrder>
      {{- end }}
      {{- range .Params.tags }}
      <blog:tag>{{ . }}</blog:tag>
      {{- end }}
```

Insert this block after the existing `{{- range .Params.categories }}` block and before the `<description>` line.

- [ ] **Step 3: Build and verify RSS output**

Run: `task build`

Then verify series elements appear:
```bash
grep -c "blog:series" public/feed.xml
```

Expected: A count matching the number of series posts (~33).

```bash
grep "blog:tag" public/feed.xml | head -5
```

Expected: `<blog:tag>` elements with tag values.

- [ ] **Step 4: Commit**

```bash
git add layouts/_default/rss.xml
git commit -m "feat: add series and tag metadata to RSS feed

Add blog:series, blog:seriesOrder, and blog:tag custom elements
using xmlns:blog namespace. Consumed by personal site for filtering."
```

---

### Task 6: Final Blog Verification

- [ ] **Step 1: Full build and check**

```bash
cd /home/fsd42/dev/blog && task clean && task build
```

Verify no build errors.

- [ ] **Step 2: Verify all outputs**

```bash
# JSON endpoint exists and is valid
python3 -m json.tool public/series/index.json > /dev/null && echo "JSON valid"

# RSS has custom namespace
grep 'xmlns:blog' public/feed.xml && echo "RSS namespace OK"

# Series count in JSON
python3 -c "import json; d=json.load(open('public/series/index.json')); print(f'{len(d[\"series\"])} series found')"

# PSR has companion files
python3 -c "
import json
d=json.load(open('public/series/index.json'))
psr = [s for s in d['series'] if s['id']=='php-fig-standards'][0]
has_cf = any('companionFiles' in e for g in psr['groups'] for e in g['entries'])
print(f'PSR companion files: {has_cf}')
"
```

Expected: JSON valid, RSS namespace OK, 4 series found, PSR companion files: True

- [ ] **Step 3: Commit any fixes, then done with blog phase**

---

## Chunk 2: Personal Site Refactor (SvelteKit)

### Task 7: Update Types

**Files (me repo: `/home/fsd42/dev/me`):**
- Modify: `src/lib/types/series.ts`
- Modify: `src/lib/types/blog.ts`

- [ ] **Step 1: Update `src/lib/types/blog.ts`**

Add `series`, `seriesOrder`, and `tags` fields:

```typescript
export interface BlogPost {
	title: string;
	link: string;
	content: string;
	published: string;
	formattedDate: string;
	categories: string[];
	tags: string[];
	series: string[];
	seriesOrder: number;
	slug: string;
}
```

- [ ] **Step 2: Replace `src/lib/types/series.ts`**

Replace the entire file with new types matching the JSON endpoint:

```typescript
export interface SeriesEntry {
	title: string;
	slug: string;
	permalink: string;
	date: string;
	summary: string;
	seriesOrder: number;
	companionFiles?: string[];
	testFiles?: string[];
	prerequisites?: number[];
}

export interface SeriesGroup {
	name: string;
	entries: SeriesEntry[];
}

export interface Series {
	id: string;
	title: string;
	description: string;
	postCount: number;
	repoUrl?: string;
	groups: SeriesGroup[];
}

export interface SeriesIndex {
	series: Series[];
}

export interface SeriesCodeFile {
	path: string;
	content: string;
	language: string;
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/fsd42/dev/me
git add src/lib/types/blog.ts src/lib/types/series.ts
git commit -m "feat: update types for blog series JSON endpoint

Replace ISeries/ISeriesEntry with Series/SeriesEntry types.
Add series, tags, seriesOrder to BlogPost type."
```

---

### Task 8: Create Series Service

**Files (me repo):**
- Create: `src/lib/services/series-service.ts`
- Create: `src/lib/services/series-service.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/services/series-service.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchSeriesIndex, fetchSeries } from './series-service';

const mockSeriesIndex = {
	series: [
		{
			id: 'php-fig-standards',
			title: 'PHP-FIG Standards Guide',
			description: 'A guide to PSRs',
			postCount: 15,
			repoUrl: 'https://github.com/jonesrussell/php-fig-guide',
			groups: [
				{
					name: 'Foundation',
					entries: [
						{
							title: 'PSR-1: Basic Coding Standard',
							slug: 'psr-1-basic-coding-standard',
							permalink: 'https://jonesrussell.github.io/blog/psr-1-basic-coding-standard/',
							date: '2025-01-15',
							summary: 'Fundamental coding standards.',
							seriesOrder: 1,
							companionFiles: ['src/PSR1/UserManager.php'],
							testFiles: ['tests/PSR1/UserManagerTest.php']
						}
					]
				}
			]
		},
		{
			id: 'docker-fundamentals',
			title: 'Docker Fundamentals',
			description: 'Docker guide',
			postCount: 5,
			groups: [{ name: 'Main', entries: [] }]
		}
	]
};

describe('series-service', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('fetchSeriesIndex', () => {
		it('fetches and returns series index', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockSeriesIndex)
			});

			const result = await fetchSeriesIndex(mockFetch);
			expect(result.series).toHaveLength(2);
			expect(result.series[0].id).toBe('php-fig-standards');
		});

		it('throws on fetch failure', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
			await expect(fetchSeriesIndex(mockFetch)).rejects.toThrow('HTTP error');
		});

		it('throws on malformed JSON', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ invalid: true })
			});
			await expect(fetchSeriesIndex(mockFetch)).rejects.toThrow('Invalid series data');
		});
	});

	describe('fetchSeries', () => {
		it('returns a single series by id', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockSeriesIndex)
			});

			const result = await fetchSeries(mockFetch, 'php-fig-standards');
			expect(result).not.toBeNull();
			expect(result!.title).toBe('PHP-FIG Standards Guide');
			expect(result!.repoUrl).toBe('https://github.com/jonesrussell/php-fig-guide');
		});

		it('returns null for unknown series', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockSeriesIndex)
			});

			const result = await fetchSeries(mockFetch, 'nonexistent');
			expect(result).toBeNull();
		});
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/fsd42/dev/me && npx vitest run src/lib/services/series-service.test.ts`

Expected: FAIL - module not found

- [ ] **Step 3: Write the implementation**

Create `src/lib/services/series-service.ts`:

```typescript
import type { SeriesIndex, Series } from '$lib/types/series';

const SERIES_JSON_URL = 'https://jonesrussell.github.io/blog/series/index.json';

function validateSeriesIndex(data: unknown): data is SeriesIndex {
	if (!data || typeof data !== 'object') return false;
	const obj = data as Record<string, unknown>;
	if (!Array.isArray(obj.series)) return false;
	return obj.series.every(
		(s: unknown) =>
			s &&
			typeof s === 'object' &&
			typeof (s as Record<string, unknown>).id === 'string' &&
			typeof (s as Record<string, unknown>).title === 'string' &&
			Array.isArray((s as Record<string, unknown>).groups)
	);
}

export async function fetchSeriesIndex(fetchFn: typeof fetch): Promise<SeriesIndex> {
	const response = await fetchFn(SERIES_JSON_URL, {
		headers: { Accept: 'application/json' }
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	if (!validateSeriesIndex(data)) {
		throw new Error('Invalid series data: missing required fields');
	}

	return data;
}

export async function fetchSeries(
	fetchFn: typeof fetch,
	id: string
): Promise<Series | null> {
	const index = await fetchSeriesIndex(fetchFn);
	return index.series.find((s) => s.id === id) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/services/series-service.test.ts`

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/series-service.ts src/lib/services/series-service.test.ts
git commit -m "feat: add series service to fetch structured data from blog JSON endpoint"
```

---

### Task 9: Update Blog Service (RSS Parsing + Slug Fix)

**Files (me repo):**
- Modify: `src/lib/services/blog-service.ts`
- Modify: `src/lib/services/blog-service.test.ts`

- [ ] **Step 1: Write failing tests for new RSS fields**

Add to `src/lib/services/blog-service.test.ts` -- new test cases for series, tags, and slug extraction. The exact test additions depend on the existing test structure, but the key tests are:

```typescript
describe('RSS parsing with series/tag metadata', () => {
	const rssWithSeries = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:blog="https://jonesrussell.github.io/blog/ns" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <item>
      <title>PSR-1: Basic Coding Standard</title>
      <link>https://jonesrussell.github.io/blog/psr-1-basic-coding-standard/</link>
      <pubDate>Wed, 15 Jan 2025 00:00:00 +0000</pubDate>
      <category>PHP</category>
      <blog:series>php-fig-standards</blog:series>
      <blog:seriesOrder>1</blog:seriesOrder>
      <blog:tag>psr</blog:tag>
      <blog:tag>php</blog:tag>
      <description>Test description</description>
    </item>
  </channel>
</rss>`;

	it('parses blog:series from RSS items', () => {
		// Test that series field is populated
	});

	it('parses blog:tag from RSS items', () => {
		// Test that tags field is populated
	});

	it('extracts slug from permalink instead of generating from title', () => {
		// Test that slug is 'psr-1-basic-coding-standard' (from link)
		// NOT 'psr-1-basic-coding-standard' (from generateSlug which would produce same here)
		// Better test: use a title that would generate a different slug
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/services/blog-service.test.ts`

- [ ] **Step 3: Update `parseRSSFeed` in `blog-service.ts`**

Key changes to `src/lib/services/blog-service.ts`:

1. Add slug extraction from `<link>` permalink (extract last path segment):

```typescript
const extractSlugFromLink = (link: string): string => {
	const url = new URL(link);
	const segments = url.pathname.split('/').filter(Boolean);
	return segments[segments.length - 1] || '';
};
```

2. In `parseRSSFeed`, add parsing for `blog:series`, `blog:seriesOrder`, `blog:tag`:

```typescript
const seriesMatches = itemMatch.match(/<blog:series>([\s\S]*?)<\/blog:series>/g) || [];
const series = seriesMatches
	.map(match => {
		const m = match.match(/<blog:series>([\s\S]*?)<\/blog:series>/);
		return m ? m[1].trim() : '';
	})
	.filter(Boolean);

const seriesOrderMatch = itemMatch.match(/<blog:seriesOrder>([\s\S]*?)<\/blog:seriesOrder>/);
const seriesOrder = seriesOrderMatch ? parseInt(seriesOrderMatch[1].trim(), 10) : 0;

const tagMatches = itemMatch.match(/<blog:tag>([\s\S]*?)<\/blog:tag>/g) || [];
const tags = tagMatches
	.map(match => {
		const m = match.match(/<blog:tag>([\s\S]*?)<\/blog:tag>/);
		return m ? m[1].trim() : '';
	})
	.filter(Boolean);
```

3. Use `extractSlugFromLink(link)` instead of `generateSlug(title)` for slug.

4. Add `series`, `seriesOrder`, `tags` to the returned `BlogPost` object.

5. Remove the `generateSlug` export (keep it temporarily if other code uses it, then remove in cleanup).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/services/blog-service.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/blog-service.ts src/lib/services/blog-service.test.ts
git commit -m "feat: parse series/tag metadata from enriched RSS feed

Extract blog:series, blog:seriesOrder, blog:tag from RSS items.
Extract slug from permalink instead of generating from title."
```

---

### Task 10: Update Blog Page to Show Dynamic Series Cards

**Files (me repo):**
- Modify: `src/routes/blog/+page.ts`
- Modify: `src/routes/blog/+page.svelte`

- [ ] **Step 1: Update `+page.ts` to fetch series data**

Replace the PSR-specific imports with series service fetch:

```typescript
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { fetchFeed } from '$lib/services/blog-service';
import { fetchSeriesIndex } from '$lib/services/series-service';
import { canonicalUrl } from '$lib/config/seo';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const POSTS_PER_PAGE = 6;

	let initialPosts = [];
	let serverError = null;
	let hasMore = false;
	let currentPage = 1;
	let totalPages = 1;
	let seriesIndex = { series: [] };

	try {
		const result = await fetchFeed(fetch, { page: 1, pageSize: POSTS_PER_PAGE });
		initialPosts = result.items;
		hasMore = result.hasMore;
		totalPages = result.totalPages ?? 1;
	} catch (e) {
		serverError = e instanceof Error ? e.message : 'Failed to load blog posts';
	}

	try {
		seriesIndex = await fetchSeriesIndex(fetch);
	} catch {
		// Series data is non-critical for blog page; cards just won't show
	}

	return {
		initialPosts,
		serverError,
		hasMore,
		currentPage,
		totalPages,
		seriesIndex,
		canonicalBlog: canonicalUrl(base, '/blog')
	};
};
```

- [ ] **Step 2: Update `+page.svelte` to render dynamic series cards**

Replace the hardcoded PSR `FeaturedSeriesCard` with a loop:

Change:
```svelte
<FeaturedSeriesCard
    title={psrSeries.title}
    description={psrSeries.description}
    seriesId={psrSeries.id}
    totalEntries={getTotalEntries()}
    href="{base}/blog/series/psr"
/>
```

To:
```svelte
{#each data.seriesIndex.series as series (series.id)}
    <FeaturedSeriesCard
        title={series.title}
        description={series.description}
        seriesId={series.id}
        totalEntries={series.postCount}
        href="{base}/blog/series/{series.id}"
    />
{/each}
```

Remove imports:
```typescript
import { psrSeries, getTotalEntries } from '$lib/data/series/psr';
```

- [ ] **Step 3: Verify the page builds**

Run: `npm run build` (or `npm run dev` and check `/me/blog`)

- [ ] **Step 4: Commit**

```bash
git add src/routes/blog/+page.ts src/routes/blog/+page.svelte
git commit -m "feat: replace hardcoded PSR series card with dynamic series cards

Fetch series data from blog JSON endpoint at load time.
All series now auto-generate cards on the blog page."
```

---

### Task 11: Convert Static PSR Series Route to Dynamic Route

**Files (me repo):**
- Delete: `src/routes/blog/series/psr/+page.svelte`
- Delete: `src/routes/blog/series/psr/+page.ts`
- Create: `src/routes/blog/series/[id]/+page.ts`
- Create: `src/routes/blog/series/[id]/+page.svelte`
- Create: `src/routes/blog/series/psr/+page.server.ts` (redirect)

- [ ] **Step 1: Create dynamic route loader `src/routes/blog/series/[id]/+page.ts`**

```typescript
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchSeries } from '$lib/services/series-service';
import { fetchSeriesCode } from '$lib/services/series-code-service';
import { canonicalUrl } from '$lib/config/seo';
import type { SeriesCodeFile } from '$lib/types/series';

interface CodeDataType {
	sourceFiles: SeriesCodeFile[];
	testFiles: SeriesCodeFile[];
}

export const prerender = true;

export const load: PageLoad = async ({ fetch, params }) => {
	const series = await fetchSeries(fetch, params.id);

	if (!series) {
		error(404, { message: `Series "${params.id}" not found` });
	}

	const allEntries = series.groups.flatMap((g) => g.entries);

	// Fetch companion code if series has a repo
	let codeDataMap: Record<string, CodeDataType> = {};
	if (series.repoUrl) {
		const repoSlug = series.repoUrl.replace('https://github.com/', '');
		const codeResults = await Promise.all(
			allEntries.map((entry) =>
				entry.companionFiles?.length || entry.testFiles?.length
					? fetchSeriesCode(fetch, repoSlug, entry.companionFiles ?? [], entry.testFiles ?? [])
					: Promise.resolve({ sourceFiles: [], testFiles: [] })
			)
		);

		allEntries.forEach((entry, i) => {
			codeDataMap[entry.slug] = codeResults[i];
		});
	}

	return {
		series,
		codeDataMap,
		canonical: canonicalUrl(base, `/blog/series/${params.id}`)
	};
};
```

- [ ] **Step 2: Create dynamic route page `src/routes/blog/series/[id]/+page.svelte`**

Adapt from the existing PSR page but use generic series data:

```svelte
<script lang="ts">
	import { base } from '$app/paths';
	import SeriesHeader from '$lib/components/series/SeriesHeader.svelte';
	import SeriesGroup from '$lib/components/series/SeriesGroup.svelte';
	import { loadProgress, suggestedNext } from '$lib/stores/series-progress.svelte';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();

	$effect(() => {
		loadProgress();
	});

	const allEntries = $derived(data.series.groups.flatMap((g) => g.entries));
	const totalEntries = $derived(allEntries.length);
	const suggested = $derived(suggestedNext(data.series.id, allEntries));
</script>

<svelte:head>
	<title>{data.series.title} | Russell Jones</title>
	<meta name="description" content={data.series.description} />
	<link rel="canonical" href={data.canonical} />
</svelte:head>

<div class="series-page">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="{base}/blog">Blog</a>
		<span aria-hidden="true">/</span>
		<span>Series</span>
	</nav>

	<SeriesHeader
		title={data.series.title}
		description={data.series.description}
		repoUrl={data.series.repoUrl}
		seriesId={data.series.id}
		{totalEntries}
	/>

	<div class="series-groups">
		{#each data.series.groups as group (group.name)}
			<SeriesGroup
				{group}
				seriesId={data.series.id}
				repoUrl={data.series.repoUrl}
				codeDataMap={data.codeDataMap}
				suggestedSlug={suggested?.slug ?? null}
			/>
		{/each}
	</div>

	{#if data.series.repoUrl}
		<section class="getting-started" aria-label="Getting started">
			<h2>Getting Started</h2>
			<p>Clone the companion repository to follow along with working examples:</p>
			<pre><code>git clone {data.series.repoUrl}.git
cd {data.series.repoUrl.split('/').pop()}
composer install</code></pre>
			<p class="getting-started-links">
				<a href={data.series.repoUrl} target="_blank" rel="noopener noreferrer">
					View on GitHub
				</a>
			</p>
		</section>
	{/if}
</div>
```

Copy the `<style>` block from the existing `src/routes/blog/series/psr/+page.svelte`.

- [ ] **Step 3: Create redirect from old PSR URL**

Create `src/routes/blog/series/psr/+page.server.ts`:

```typescript
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export function load() {
	redirect(301, `${base}/blog/series/php-fig-standards`);
}
```

Delete the old `+page.svelte` and `+page.ts` from `src/routes/blog/series/psr/`.

- [ ] **Step 4: Verify the routes work**

Run: `npm run dev` and check:
- `/me/blog/series/php-fig-standards` loads with full series data
- `/me/blog/series/psr` redirects to `/me/blog/series/php-fig-standards`

- [ ] **Step 5: Commit**

```bash
git add src/routes/blog/series/
git commit -m "feat: convert static PSR series route to dynamic [id] route

All series now use /blog/series/[id]/ with data from JSON endpoint.
301 redirect from /blog/series/psr/ to /blog/series/php-fig-standards/."
```

---

### Task 12: Update Series Components for New Types

**Files (me repo):**
- Modify: `src/lib/components/series/SeriesHeader.svelte`
- Modify: `src/lib/components/series/SeriesGroup.svelte`
- Modify: `src/lib/components/series/FeaturedSeriesCard.svelte`
- Modify: `src/lib/stores/series-progress.svelte.ts`
- Modify: `src/lib/services/series-code-service.ts`

- [ ] **Step 1: Update `series-code-service.ts` types**

Replace `ISeriesCodeFile` imports with `SeriesCodeFile` from the new types. The function signatures stay the same; only the import path and type name change.

- [ ] **Step 2: Update `series-progress.svelte.ts`**

The progress store uses `seriesId` and entry slugs, not `psrNumber`. Verify the `suggestedNext` function works with the new `SeriesEntry` type (it needs `slug` and potentially `seriesOrder`). Update any `ISeriesEntry` references to `SeriesEntry`.

- [ ] **Step 3: Update component props**

`SeriesHeader.svelte`: Update `repoUrl` prop to be optional (`repoUrl?: string`), since not all series have repos.

`SeriesGroup.svelte`: Update prop types from `ISeriesGroup` to `SeriesGroup`, `ISeriesEntry` to `SeriesEntry`. The `repoUrl` prop becomes optional.

`FeaturedSeriesCard.svelte`: No structural changes needed; it already takes `title`, `description`, `seriesId`, `totalEntries`, `href` as props.

- [ ] **Step 4: Run all component tests**

```bash
npx vitest run src/lib/components/series/
npx vitest run src/lib/stores/series-progress.test.ts
```

Fix any type errors or test failures.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/series/ src/lib/stores/ src/lib/services/series-code-service.ts
git commit -m "feat: update series components and stores for new types

Replace ISeries/ISeriesEntry with Series/SeriesEntry.
Make repoUrl optional for non-code series."
```

---

### Task 13: Delete Hardcoded PSR Data and Update Tests

**Files (me repo):**
- Delete: `src/lib/data/series/psr.ts`
- Delete: `src/lib/data/series/psr.test.ts`
- Modify: `src/lib/types/series.test.ts`
- Modify: `src/lib/components/series/FeaturedSeriesCard.svelte.test.ts`
- Modify: `src/lib/components/series/SeriesHeader.svelte.test.ts`
- Modify: `src/lib/components/series/SeriesGroup.svelte.test.ts`

- [ ] **Step 1: Delete hardcoded data files**

```bash
rm src/lib/data/series/psr.ts src/lib/data/series/psr.test.ts
```

If the `src/lib/data/series/` directory is now empty, remove it too.

- [ ] **Step 2: Update type tests**

Update `src/lib/types/series.test.ts` to test the new `Series`, `SeriesEntry`, `SeriesGroup`, `SeriesIndex` types instead of `ISeries`, `ISeriesEntry`.

- [ ] **Step 3: Update component tests**

Update any test that imports from `$lib/data/series/psr` to use mock data matching the new types instead.

- [ ] **Step 4: Run the full test suite**

```bash
npx vitest run
```

All tests should pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove hardcoded PSR series data

All series data now fetched from blog JSON endpoint.
Update tests to use new types and mock data."
```

---

### Task 14: Full E2E Verification

- [ ] **Step 1: Run unit tests**

```bash
cd /home/fsd42/dev/me && npx vitest run
```

All tests pass.

- [ ] **Step 2: Build the site**

```bash
npm run build
```

Build succeeds with no errors.

- [ ] **Step 3: Run E2E tests**

```bash
npx playwright test
```

All E2E tests pass. If new E2E tests are needed for series pages, add them:

```typescript
test('blog page shows multiple series cards', async ({ page }) => {
	await page.goto('/me/blog');
	const seriesCards = page.locator('[data-testid="series-card"]');
	await expect(seriesCards).toHaveCount(4); // or use a more flexible assertion
});

test('series detail page loads', async ({ page }) => {
	await page.goto('/me/blog/series/php-fig-standards');
	await expect(page.locator('h1')).toContainText('PHP-FIG Standards Guide');
});

test('PSR redirect works', async ({ page }) => {
	await page.goto('/me/blog/series/psr');
	await expect(page).toHaveURL(/php-fig-standards/);
});
```

- [ ] **Step 4: Commit any E2E test additions**

```bash
git add tests/
git commit -m "test: add E2E tests for dynamic series pages"
```
