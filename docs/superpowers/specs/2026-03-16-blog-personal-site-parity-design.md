# Blog-to-Personal-Site Content Automation

**Date:** 2026-03-16
**Status:** Draft
**Scope:** Hugo blog (`/home/fsd42/dev/blog`) + SvelteKit personal site (`/home/fsd42/dev/me`)

## Problem

The personal site at `jonesrussell.github.io/me/` consumes blog content via RSS but has significant parity gaps:

1. **3 of 4 series missing** -- waaseyaa (8 posts), docker-fundamentals (5 posts), codified-context (5 posts) have no representation on the personal site.
2. **PSR series is hardcoded** -- 209 lines of manual data in `src/lib/data/series/psr.ts` that must be kept in sync with the blog.
3. **RSS feed lacks series/tag metadata** -- the personal site cannot auto-discover series membership from the feed.
4. **Slug generation diverges** -- personal site generates slugs from titles; blog uses explicit `slug:` frontmatter. Links may already be broken.
5. **No series index page** -- no `/blog/series/` route listing all series.

## Goals

- All content on the personal site is generated from the blog. No manual series cards.
- Adding a new series or post to the blog automatically surfaces it on the personal site.
- PSR series retains its rich features (grouped entries, companion code, progress tracking).
- Any series can opt into rich metadata (groups, companion code) via frontmatter.

## Decisions

| Question | Decision |
|----------|----------|
| Series detail level on personal site | Full series pages with progress tracking and grouped entries for all series (companion code conditional on `repoUrl`) |
| Data transport mechanism | Hugo JSON endpoint (primary) + series/tags in RSS (secondary) |
| Where rich metadata lives | Post frontmatter (`series_group`, `series_order`, `companion_files`, `test_files`, `prerequisites`) |
| Post detail page behavior | Keep local post pages on personal site, use canonical slugs from blog feed/JSON |

## Design

### 1. Blog Frontmatter Schema

Every post in a series gets these new frontmatter fields:

```yaml
# Required for series posts
series_order: 1              # Position within the series (1-based)
series_group: "Foundation"   # Grouping label (e.g., "Foundation", "HTTP Stack")

# Optional enrichment (PSR series uses these, others may not)
companion_files: ["src/PSR1/UserManager.php"]
test_files: ["tests/PSR1/UserManagerTest.php"]
prerequisites: [1, 4]       # series_order values of prerequisite posts
```

Non-series posts are unaffected. The existing `series: ["php-fig-standards"]` frontmatter stays as-is -- it drives Hugo's taxonomy grouping. These new fields add ordering and structure within a series.

For the 3 non-PSR series that don't currently have grouping, `series_group` defaults to `"Main"` until further organization is needed.

**Posts requiring frontmatter changes:** ~33 posts across 4 series (15 PSR, 8 waaseyaa, 5 docker-fundamentals, 5 codified-context).

### 2. Hugo JSON Series Endpoint

A new Hugo layout outputs structured series data at `/blog/series/index.json`.

**Output format:**

```json
{
  "series": [
    {
      "id": "php-fig-standards",
      "title": "PHP-FIG Standards Guide",
      "description": "Recent content in PHP-FIG Standards on Russell Jones' Blog",
      "postCount": 15,
      "repoUrl": "https://github.com/jonesrussell/php-fig-guide",
      "groups": [
        {
          "name": "Foundation",
          "entries": [
            {
              "title": "PSR-1: Basic Coding Standard",
              "slug": "psr-1-basic-coding-standard",
              "permalink": "https://jonesrussell.github.io/blog/psr-1-basic-coding-standard/",
              "date": "2025-01-15",
              "summary": "Fundamental coding standards...",
              "seriesOrder": 1,
              "companionFiles": ["src/PSR1/UserManager.php"],
              "testFiles": ["tests/PSR1/UserManagerTest.php"],
              "prerequisites": [1, 4]
            }
          ]
        }
      ]
    }
  ]
}
```

**Implementation details:**

- Layout file: `layouts/series/list.json` (Hugo taxonomy list template for JSON output)
- Hugo config adds JSON output for the series taxonomy: `[outputs] taxonomy = ['HTML', 'RSS', 'JSON']`
- Taxonomy content files required: create `content/series/_index.md` and per-term files (e.g., `content/series/php-fig-standards/_index.md`) with title/description metadata
- `repoUrl` pulled from a new Hugo data file (`data/series.yaml`) mapping series IDs to repo URLs. The `data/` directory must be created.
- Groups and entries assembled from post frontmatter, sorted by `series_order`
- Posts without `series_group` default to group `"Main"`
- Posts without `series_order` sort by date
- `slug` comes from the post's actual Hugo slug (not generated from title)
- `companionFiles`, `testFiles`, `prerequisites` only present when defined in frontmatter (note: snake_case in frontmatter, camelCase in JSON output)

### 3. RSS Feed Enrichment

Add series metadata to each RSS `<item>` using a custom namespace:

```xml
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:blog="https://jonesrussell.github.io/blog/ns">
  ...
  <item>
    <title>PSR-1: Basic Coding Standard</title>
    ...
    <category>PHP</category>
    <blog:series>php-fig-standards</blog:series>
    <blog:seriesOrder>1</blog:seriesOrder>
    <blog:tag>psr</blog:tag>
    <blog:tag>php</blog:tag>
  </item>
```

Changes to `layouts/_default/rss.xml`:
- Add `xmlns:blog` namespace declaration
- For each post with series frontmatter, emit `<blog:series>` and `<blog:seriesOrder>` elements
- Add `<blog:tag>` elements for tags (currently missing from the feed)

The JSON endpoint is the primary source for structured series data. RSS enrichment provides series membership for post-level grouping/filtering.

**Note:** Hugo's `services.rss.limit` config may cap the number of RSS items. Verify this setting does not exclude series posts. The JSON endpoint is not affected by this limit since it uses its own template.

### 4. Personal Site Refactor

#### New: Series Service (`src/lib/services/series-service.ts`)

Fetches and caches the blog's `/blog/series/index.json` at build time. Returns typed series data. Replaces all imports from `$lib/data/series/psr`.

```typescript
export async function fetchSeriesIndex(fetchFn: typeof fetch): Promise<SeriesIndex>
export async function fetchSeries(fetchFn: typeof fetch, id: string): Promise<Series | null>
```

#### Updated: Blog Service (`src/lib/services/blog-service.ts`)

- Parse `<blog:series>`, `<blog:seriesOrder>`, and `<blog:tag>` from RSS items
- Add `series`, `seriesOrder`, and `tags` fields to `BlogPost` type
- Extract slug from the post's `<link>` permalink instead of generating from title (fixes slug mismatch)
- Drop `generateSlug()` function

#### Updated: Blog Page (`src/routes/blog/+page.svelte`)

- Replace hardcoded `FeaturedSeriesCard` for PSR with a dynamic loop over all series from the series service
- Each series gets an auto-generated card with title, description, post count, and progress tracking

#### Updated: Series Pages

- Replace `/blog/series/psr/` static route with a dynamic `/blog/series/[id]/` route
- `+page.ts` fetches series data from the series service by `id` param
- Groups, entries, progress tracking all work from fetched data
- Companion code fetching (GitHub source) conditionally enabled when the series has a `repoUrl` and entries have `companionFiles`

**URL migration:** The existing PSR series page lives at `/blog/series/psr/` but the blog taxonomy uses `php-fig-standards` as the series ID. The new dynamic route will use `/blog/series/php-fig-standards/`. Add a redirect from `/blog/series/psr/` to `/blog/series/php-fig-standards/` to avoid breaking existing links. In SvelteKit, this can be a `+page.server.ts` at the old path that returns a 301 redirect.

#### Deleted

- `src/lib/data/series/psr.ts` (hardcoded data, fully replaced)

#### Breaking Type Changes

- The existing `ISeries` type uses `psrNumber` for ordering entries. The new schema uses `seriesOrder` as a generic ordering field. All components referencing `psrNumber` must be updated to use `seriesOrder`. The `ISeriesEntry` and `ISeries` interfaces are replaced by the new `SeriesEntry`, `Series`, and `SeriesIndex` types.

#### Updated Types (`src/lib/types/series.ts`)

```typescript
interface SeriesEntry {
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

interface SeriesGroup {
  name: string;
  entries: SeriesEntry[];
}

interface Series {
  id: string;
  title: string;
  description: string;
  postCount: number;
  repoUrl?: string;
  groups: SeriesGroup[];
}

interface SeriesIndex {
  series: Series[];
}
```

### 5. Error Handling & Fallbacks

**Build-time failures:**
- If the blog's `/blog/series/index.json` is unreachable during build, the build fails with a clear error message. No silent fallback to empty data.
- RSS feed fetch errors also fail the build.

**Runtime (client-side "Load More"):**
- Existing error handling with retry UI stays as-is. Series data is prerendered at build time, so it is always present in the HTML.

**Data validation:**
- The series service validates the JSON response structure (checks for required fields). Malformed JSON fails the build with a descriptive error.

**Cache:**
- Series data is fetched once at build time and baked into static HTML. No runtime caching needed for series. The existing 30-minute RSS cache for "Load More" pagination stays.

### 6. Implementation Phases

To avoid deploying a broken intermediate state where the personal site expects data the blog does not yet produce:

**Phase 1: Blog side (deploy first)**
1. Add frontmatter fields to all ~33 series posts
2. Create `data/series.yaml`, `content/series/_index.md`, and per-term `_index.md` files
3. Create `layouts/series/list.json` template
4. Update `hugo.toml` outputs config
5. Enrich RSS template with series/tag elements
6. Build, verify JSON endpoint and RSS output
7. Deploy blog

**Phase 2: Personal site (deploy after blog)**
1. Add series service (`series-service.ts`)
2. Update blog service (RSS parsing, slug extraction)
3. Update types
4. Replace hardcoded series card with dynamic cards
5. Convert static PSR route to dynamic `[id]` route
6. Add redirect from `/blog/series/psr/` to `/blog/series/php-fig-standards/`
7. Delete `psr.ts`
8. Update and run tests
9. Deploy personal site

### 7. Testing Strategy

**Blog side (Hugo):**
- Build the blog with `task build` and verify `/public/series/index.json` exists and is valid JSON
- Spot-check that the JSON contains all 4 series with correct post counts
- Verify RSS feed items include `<blog:series>` elements for series posts

**Personal site -- Unit tests (Vitest):**
- `series-service.ts`: Mock fetch, verify it parses blog JSON correctly, handles malformed JSON, handles fetch errors
- `blog-service.ts`: Update existing RSS parsing tests to verify `series`, `seriesOrder`, `tags` extraction. Test slug extraction from permalink (replacing `generateSlug`)
- Type validation: Verify the `SeriesIndex` type guard rejects incomplete data

**Personal site -- E2E tests (Playwright):**
- Blog page shows series cards for all 4 series (not just PSR)
- Each series card links to `/blog/series/[id]/`
- Series detail page renders groups, entries, progress tracking
- PSR series page still shows companion code sections
- "Load More" pagination still works

**Existing tests:**
- Update any tests that import from `$lib/data/series/psr` to use the new series service
- Update snapshot/component tests for `FeaturedSeriesCard` if props change
