#!/usr/bin/env python3
"""
Audit blog posts: apply heuristics and output suggested content-todo rows
and "new posts to create" list. See docs in .cursor/plans (automated post audit).
"""

import re
import sys
from datetime import date
from pathlib import Path

# Fixed constants from plan
SNIPPET_LEN = 800
WORD_COUNT_THRESHOLD_MINIMAL = 250
OLD_DATE_CUTOFF_YEAR = 2022
VERSION_SPECIFIC_CUTOFF_YEAR = 2023
DRAFT_STALE_CUTOFF_YEAR = 2025
REASON_DRAFT_MINIMAL = "draft-minimal"
REASON_DRAFT_STALE = "draft-stale"
REASON_OLD_DATE = "old-date"
REASON_VERSION_SPECIFIC = "version-specific"
REASON_PSR_DRAFT = "psr-draft"
REASON_FRESHNESS_REVIEW = "freshness-review"

# Version/OS patterns (match title or summary, case-insensitive)
VERSION_PATTERNS = [
    re.compile(r"ubuntu\s+20\.04", re.I),
    re.compile(r"\b20\.04\b"),
    re.compile(r"laravel\s+in\s+ubuntu", re.I),
    re.compile(r"\bin\s+ubuntu\s+\d", re.I),
    re.compile(r"php\s+7\.x", re.I),
    re.compile(r"php\s+8\.\d", re.I),
    re.compile(r"laravel\s+[89]\b", re.I),
    re.compile(r"ddev\s+v[12]\b", re.I),
]

SKIP_BODY_PATTERNS = [
    re.compile(r"update\s*\(\s*2025\s*\)", re.I),
    re.compile(r"revised\s+to\s+reflect", re.I),
]


def normalize_line_endings(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def split_frontmatter_and_body(raw: str):
    """Split on ---\\n; return (frontmatter_str, body_str). Normalize CRLF first."""
    raw = normalize_line_endings(raw)
    parts = raw.split("\n---\n", 2)
    if len(parts) < 2:
        return "", raw
    return parts[0].strip(), parts[1].strip()


def parse_frontmatter(fm: str) -> dict:
    """Minimal YAML-like parse for title, date, draft, slug, series, summary."""
    result = {}
    for line in fm.split("\n"):
        if ":" not in line:
            continue
        key, rest = line.split(":", 1)
        key = key.strip().lower()
        rest = rest.strip()
        if key == "title":
            result["title"] = rest.strip('"\'')
        elif key == "date":
            result["date"] = rest.strip('"\'') if rest else None
        elif key == "draft":
            result["draft"] = rest.lower() in ("true", "yes", "1")
        elif key == "slug":
            result["slug"] = rest.strip('"\'')
        elif key == "series":
            # ["php-fig-standards"] or similar
            m = re.search(r'\[(.*?)\]', rest, re.DOTALL)
            if m:
                inner = m.group(1).strip()
                if inner:
                    result["series"] = [s.strip(' "\'') for s in inner.split(",")]
                else:
                    result["series"] = []
            else:
                result["series"] = []
        elif key == "summary":
            result["summary"] = rest.strip('"\'')
    return result


def strip_for_word_count_and_snippet(body: str) -> str:
    """Strip fenced code, HTML comments, images, links; normalize whitespace."""
    # Remove fenced code blocks (```...```)
    body = re.sub(r"```[\s\S]*?```", " ", body)
    # HTML comments
    body = re.sub(r"<!--[\s\S]*?-->", " ", body)
    # Markdown images ![](url) or ![alt](url)
    body = re.sub(r"!\[[^\]]*\]\s*\([^)]*\)", " ", body)
    # Markdown links [text](url)
    body = re.sub(r"\[[^\]]*\]\s*\([^)]*\)", " ", body)
    # Normalize whitespace
    body = re.sub(r"\s+", " ", body).strip()
    return body


def word_count(prose: str) -> int:
    return len(prose.split()) if prose else 0


def get_snippet(prose: str, length: int = SNIPPET_LEN) -> str:
    """First N chars, lowercased for matching."""
    return prose[:length].lower() if prose else ""


def parse_date(s: str | None) -> tuple[int | None, int | None]:
    """Return (year, month) or (None, None) if missing/invalid."""
    if not s or not isinstance(s, str):
        return None, None
    m = re.match(r"(\d{4})-(\d{2})-\d{2}", s.strip())
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def derive_slug(filename_stem: str) -> str:
    """Filename stem -> lowercase, spaces to hyphens, remove non-alphanumeric except hyphen."""
    s = filename_stem.lower().replace(" ", "-")
    return re.sub(r"[^a-z0-9-]", "", s)


def derive_title(filename_stem: str) -> str:
    """Filename stem in title-case (simple: capitalize words)."""
    return filename_stem.replace("-", " ").title()


def is_psr_series(series: list) -> bool:
    return bool(series and "php-fig-standards" in (s.lower() for s in series))


def matches_version_patterns(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    for pat in VERSION_PATTERNS:
        if pat.search(t):
            return True
    return False


def should_skip_already_revised(snippet: str) -> bool:
    for pat in SKIP_BODY_PATTERNS:
        if pat.search(snippet):
            return True
    return False


def suggest_new_post(slug: str, title: str, year: int | None) -> dict | None:
    """Suggest a replacement post entry for version-specific posts."""
    title_lower = title.lower()
    if "ubuntu 20.04" in title_lower or "20.04" in title_lower:
        if "laravel" in title_lower:
            return {
                "suggested_title": "Start Developing with Laravel on Ubuntu 24.04 LTS",
                "suggested_slug": "start-developing-with-laravel-in-ubuntu-24-04",
                "replaces_slug": slug,
                "reason": "Version-specific; Ubuntu 20.04 → current LTS",
            }
    if "drupal" in title_lower and "ddev" in title_lower:
        return {
            "suggested_title": "Use DDEV to Locally Develop with Drupal (current)",
            "suggested_slug": "use-ddev-to-locally-develop-with-drupal-current",
            "replaces_slug": slug,
            "reason": "Update for current DDEV/Drupal",
        }
    return {
        "suggested_title": f"{title} (updated)",
        "suggested_slug": f"{slug}-updated",
        "replaces_slug": slug,
        "reason": "Version-specific; suggest updated post",
    }


def audit_post(filepath: Path, content: str, filename_stem: str) -> tuple[dict | None, dict | None]:
    """
    Return (content_todo_row | None, new_post_suggestion | None).
    Row has: slug, title, status, action, reason, notes, rule_triggered.
    """
    fm_str, body_str = split_frontmatter_and_body(content)
    fm = parse_frontmatter(fm_str)
    slug = fm.get("slug") or derive_slug(filename_stem)
    title = fm.get("title") or derive_title(filename_stem)
    draft = fm.get("draft", False)
    series = fm.get("series") or []
    summary = fm.get("summary") or ""
    date_str = fm.get("date")
    year, _ = parse_date(date_str)
    has_date = year is not None

    prose = strip_for_word_count_and_snippet(body_str)
    words = word_count(prose)
    snippet = get_snippet(prose)

    # Skip: already revised
    if should_skip_already_revised(snippet):
        return None, None

    # PSR published -> skip
    if is_psr_series(series) and not draft:
        return None, None

    # Rule order (first match wins for actionable row)

    # Draft minimal
    if draft and (not has_date or year < DRAFT_STALE_CUTOFF_YEAR) and words < WORD_COUNT_THRESHOLD_MINIMAL:
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "finish or archive",
            "reason": REASON_DRAFT_MINIMAL,
            "notes": "Draft; minimal content; review",
            "rule_triggered": "draft-minimal",
        }, None

    # PSR draft (before generic draft-stale so PSR drafts get psr-draft reason)
    if is_psr_series(series) and draft:
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "finish or archive",
            "reason": REASON_PSR_DRAFT,
            "notes": "PSR draft",
            "rule_triggered": "psr-draft",
        }, None

    # Draft stale
    if draft and has_date and year < DRAFT_STALE_CUTOFF_YEAR and words >= WORD_COUNT_THRESHOLD_MINIMAL:
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "finish or archive",
            "reason": REASON_DRAFT_STALE,
            "notes": "Stale draft; decide",
            "rule_triggered": "draft-stale",
        }, None

    # Version-specific (title or summary) and old
    if has_date and year < VERSION_SPECIFIC_CUTOFF_YEAR and matches_version_patterns(title + " " + summary):
        new_post = suggest_new_post(slug, title, year)
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "replace + 301",
            "reason": REASON_VERSION_SPECIFIC,
            "notes": "Version-specific; suggest new post",
            "rule_triggered": "version-specific",
        }, new_post

    # Published, no date -> outdated
    if not draft and not has_date:
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "update or archive",
            "reason": REASON_OLD_DATE,
            "notes": "Missing date; treat as old",
            "rule_triggered": "old-date",
        }, None

    # Published, date before 2022
    if not draft and has_date and year < OLD_DATE_CUTOFF_YEAR:
        return {
            "slug": slug,
            "title": title,
            "status": "outdated",
            "action": "update or archive",
            "reason": REASON_OLD_DATE,
            "notes": "Old; check tool versions",
            "rule_triggered": "old-date",
        }, None

    # Optional: freshness review (2022-2024, no other signals)
    if not draft and has_date and 2022 <= year <= 2024:
        return {
            "slug": slug,
            "title": title,
            "status": "review",
            "action": "review",
            "reason": REASON_FRESHNESS_REVIEW,
            "notes": "Check freshness",
            "rule_triggered": "freshness-review",
        }, None

    return None, None


def run_audit(posts_dir: Path) -> tuple[list[dict], list[dict]]:
    """Scan posts_dir for *.md; return (content_todo_rows, new_posts)."""
    rows = []
    new_posts = []
    for path in sorted(posts_dir.glob("*.md")):
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            sys.stderr.write(f"Warning: skip {path}: {e}\n")
            continue
        stem = path.stem
        row, new_post = audit_post(path, content, stem)
        if row:
            rows.append(row)
        if new_post:
            new_posts.append(new_post)
    return rows, new_posts


def format_table(rows: list[dict]) -> str:
    """Markdown table: Slug | Title | Status | Action | Reason | Notes."""
    if not rows:
        return "*(No suggested rows)*\n"
    lines = [
        "| Slug | Title | Status | Action | Reason | Notes |",
        "|------|--------|--------|--------|--------|-------|",
    ]
    def cell(s: str) -> str:
        return str(s).replace("|", " ")

    for r in rows:
        title = (r["title"][:50] + "…") if len(r["title"]) > 50 else r["title"]
        lines.append(
            f"| {cell(r['slug'])} | {cell(title)} | {cell(r['status'])} | {cell(r['action'])} | {cell(r['reason'])} | {cell(r['notes'])} |"
        )
    return "\n".join(lines) + "\n"


def format_new_posts(new_posts: list[dict]) -> str:
    if not new_posts:
        return "*(None)*\n"
    lines = [
        "| Suggested title | Suggested slug | Replaces (slug) | Reason |",
        "|-----------------|-----------------|------------------|--------|",
    ]
    for p in new_posts:
        c = lambda s: str(s).replace("|", " ")
        lines.append(
            f"| {c(p['suggested_title'])} | {c(p['suggested_slug'])} | {c(p['replaces_slug'])} | {c(p['reason'])} |"
        )
    return "\n".join(lines) + "\n"


def write_audit_file(rows: list[dict], new_posts: list[dict], out_path: Path, audit_date: str) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    content = f"""# Content audit ({audit_date}) – auto-generated

*Review before copying into docs/content-todo.md.*

## Suggested content-todo rows

{format_table(rows)}

## New posts to create

{format_new_posts(new_posts)}
"""
    out_path.write_text(content, encoding="utf-8")


def main():
    import os
    root = Path(__file__).resolve().parent.parent
    posts_dir = root / "content" / "posts"
    docs_dir = root / "docs"
    dry_run = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes") or "--dry-run" in sys.argv

    if not posts_dir.is_dir():
        sys.stderr.write(f"Posts dir not found: {posts_dir}\n")
        sys.exit(1)

    rows, new_posts = run_audit(posts_dir)
    audit_date = date.today().isoformat()
    out_path = docs_dir / f"content-audit-{audit_date}.md"

    if dry_run:
        print(f"# Content audit ({audit_date}) – dry run\n")
        print("*Review before copying into docs/content-todo.md.*\n")
        print("## Suggested content-todo rows\n")
        print(format_table(rows))
        print("## New posts to create\n")
        print(format_new_posts(new_posts))
        return

    write_audit_file(rows, new_posts, out_path, audit_date)
    print(out_path)


if __name__ == "__main__":
    main()
