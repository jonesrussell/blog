---
title: "Building a contact database for Indigenous harvesting authority governance"
date: 2026-03-27
categories: [projects]
tags: [python, data, indigenous, scraping]
summary: "How I built a two-notebook pipeline using ISC profiles and community website scraping to collect governance contacts for ~637 First Nations communities across Canada."
slug: "indigenous-harvesters"
draft: false
devto: true
---

Ahnii!

Reaching First Nations band offices is harder than it should be. Phone numbers are scattered across government portals, community websites, and PDFs. Email addresses are buried on leadership pages — when they exist at all. I needed a structured contact database for Indigenous harvesting authority governance across ON, AB, SK, MB, and BC, so I built one.

This post covers the two-notebook pipeline I wrote to collect that data, how it connects to the [North Cloud](https://northcloud.one) source-manager API, and the extraction patterns that make it work at scale.

## Why ISC Profiles Are the Right Starting Point

[Indigenous Services Canada](https://www.sac-isc.gc.ca/) maintains a First Nations profiles directory. Each community registered with INAC has a band number, and each band number maps to a predictable URL:

```text
https://fnp-ppn.aadnc-aandc.gc.ca/fnp/Main/Search/FNMain.aspx?BAND_NUMBER={band_number}
```

The profile pages are public, structured HTML, and contain the data I needed: official name, mailing address, phone, fax, website URL, and tribal council affiliation. North Cloud already holds a list of 637 First Nations communities, each with their INAC band number — so the pipeline starts by fetching that list, not by guessing URLs.

```python
def fetch_all_communities() -> list[dict]:
    """Fetch all First Nations communities from NC source-manager."""
    all_communities: list[dict] = []
    offset = 0
    limit = 200
    while True:
        resp = httpx.get(
            f"{NC_BASE_URL}/api/v1/communities",
            params={"limit": limit, "offset": offset, "type": "first_nation"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        communities = data.get("communities", []) or []
        all_communities.extend(communities)
        if len(communities) < limit:
            break
        offset += limit
    return all_communities
```

This pages through the NC API with a 200-record limit until it has the full list. From there, the notebook filters to communities that have an INAC band number and scrapes each ISC profile with a 1-second polite delay.

The scraper sends a descriptive `User-Agent` header so ISC can see what the traffic is:

```python
with httpx.Client(
    headers={"User-Agent": "MinooCommunityEnricher/0.1 (+https://minoo.app; Indigenous data enrichment)"},
    follow_redirects=True,
) as client:
    for community in tqdm(targets, desc="ISC Profiles"):
        profile = scrape_isc_profile(client, community)
        profiles.append(profile)
        time.sleep(REQUEST_DELAY)
```

Each profile gets parsed from HTML using [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/), then assembled into a dataclass. Addresses come back as a single string like `978 TASHMOO AVENUE, SARNIA, ON` — the notebook splits those into street, city, and province components before export.

ISC profiles give you band office contacts. They don't give you the Chief, the councillors, or anyone's email — that's what the second notebook handles.

## Discovering Leadership Pages on Community Websites

The second notebook starts where the first one ends: a CSV of community websites extracted from ISC profiles. For each website, it fetches the homepage, discovers relevant internal pages, and extracts leadership and contact information.

Page discovery uses two classification strategies: URL path patterns and link text. These are ported directly from the Go code already in North Cloud's crawler.

```python
LEADERSHIP_PATH_PATTERNS = [
    "chief-and-council", "chief-council", "chiefandcouncil",
    "leadership", "leaders", "council", "chief",
    "governance", "band-council", "elected-officials",
]

CONTACT_PATH_PATTERNS = [
    "contact", "contact-us", "contactus",
    "band-office", "bandoffice", "office",
    "location", "find-us", "get-in-touch",
]
```

The classifier checks the URL path first, then falls back to the visible link text. A page is only followed if it's on the same domain, which prevents the scraper from wandering into tribal council or government sites.

Once on a leadership or contact page, the extraction layer scans rendered text for names, roles, emails, and phone numbers. Roles are matched with regex in priority order so `Deputy Chief` doesn't get confused with `Chief`:

```python
ROLE_PATTERNS = [
    (re.compile(r"(?i)\bdeputy\s+chief\b"), "deputy_chief"),
    (re.compile(r"(?i)\bchief\b"), "chief"),
    (re.compile(r"(?i)\bcouncill?ors?\b"), "councillor"),
    (re.compile(r"(?i)\bband\s+manager\b"), "band_manager"),
    (re.compile(r"(?i)\bexecutive\s+director\b"), "executive_director"),
    (re.compile(r"(?i)\bsecretary\b"), "secretary"),
    (re.compile(r"(?i)\btreasurer\b"), "treasurer"),
]
```

After a name is identified, the extractor scans the next five lines for a matching email or phone. That window-scan approach works surprisingly well on the simple two-column layouts most band office sites use.

The output is two tables: one for individual leaders (name, role, email, phone, community), and one for band office contacts (address, phone, toll-free, fax, email, social media). Both export to CSV and JSON for NC import. The notebooks are for bulk enrichment; keeping the database current needs something more durable.

## Feeding the Data into North Cloud

The notebooks are for exploration and bulk enrichment. The `src/harvest/` package handles the ongoing pipeline. Each harvester implements a three-method protocol:

```python
class Harvester(Protocol):
    name: str
    source_type: str  # "structured" or "api"

    def source_registration(self) -> dict[str, Any]: ...
    def fetch(self) -> Iterator[dict[str, Any]]: ...
    def transform(self, raw: dict[str, Any]) -> list[dict[str, Any]]: ...
```

The runner registers the harvester as a source in NC, calls `fetch()` to get raw records, passes each through `transform()`, wraps the results in envelopes, and delivers them to NC's ingest endpoint. The envelope format matches Minoo's `PayloadValidator` contract: `payload_id`, `version`, `source`, `entity_type`, `source_url`, `data`, and optional taxonomy metadata.

The CLI brings it together:

```bash
harvest run <harvester-name> --nc-url https://api.northcloud.one --nc-token $NC_JWT_TOKEN
```

Add `--dry-run` to preview what would be delivered without writing anything to NC. The pipeline is simple enough; the sites it crawls are not.

## What Makes This Harder Than Ordinary Web Scraping

Community websites vary enormously. Some have clean, semantic HTML with labeled council tables. Others are WordPress installs from 2012 where names, titles, and phone numbers appear in different columns, different pages, or nowhere at all. A few communities have no website, only the ISC profile.

The data quality review in each notebook flags these gaps explicitly. Communities that have a Chief listed but no councillors extracted are surfaced so they can be reviewed manually. Emails that don't match the standard pattern get flagged. Postal codes are validated against the Canadian format. The goal isn't perfect automation — it's automation that tells you clearly where it fell short.

That's the foundation for keeping this database current as governance changes.

Baamaapii
