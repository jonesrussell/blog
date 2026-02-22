#!/usr/bin/env python3
"""
Test heuristics for audit-posts. Run: python3 -m pytest scripts/test_audit_posts.py -v
or: python3 scripts/test_audit_posts.py
"""

import importlib.util
import sys
import unittest
from pathlib import Path

# Load audit-posts.py (hyphen in name, so not importable as module)
_script_dir = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("audit_posts", _script_dir / "audit-posts.py")
_audit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_audit)

audit_post = _audit.audit_post
REASON_DRAFT_MINIMAL = _audit.REASON_DRAFT_MINIMAL
REASON_DRAFT_STALE = _audit.REASON_DRAFT_STALE
REASON_OLD_DATE = _audit.REASON_OLD_DATE
REASON_VERSION_SPECIFIC = _audit.REASON_VERSION_SPECIFIC
REASON_PSR_DRAFT = _audit.REASON_PSR_DRAFT
REASON_FRESHNESS_REVIEW = _audit.REASON_FRESHNESS_REVIEW


def make_body(word_count: int) -> str:
    return " ".join(["word"] * word_count)


class TestAuditHeuristics(unittest.TestCase):
    """Test cases from plan: automated post audit heuristics."""

    def test_1_draft_no_date_100_words(self):
        """Draft, no date, 100 words -> outdated / finish or archive / draft-minimal."""
        content = """---
title: "Test"
draft: true
slug: "test"
---
""" + make_body(100)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_DRAFT_MINIMAL)
        self.assertEqual(row["action"], "finish or archive")
        self.assertIsNone(new_post)

    def test_2_draft_2021_400_words(self):
        """Draft, 2021, 400 words -> outdated / finish or archive / draft-stale."""
        content = """---
title: "Test"
date: 2021-06-15
draft: true
slug: "test"
---
""" + make_body(400)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_DRAFT_STALE)
        self.assertIsNone(new_post)

    def test_3_published_2021_no_version_strings(self):
        """Published 2021, no version strings -> outdated / update or archive / old-date."""
        content = """---
title: "Some Old Post"
date: 2021-03-01
draft: false
slug: "some-old-post"
---
""" + make_body(300)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_OLD_DATE)
        self.assertEqual(row["action"], "update or archive")
        self.assertIsNone(new_post)

    def test_4_published_2021_title_ubuntu_2004(self):
        """Published 2021, title contains Ubuntu 20.04 -> replace + 301 / version-specific + new-post entry."""
        content = """---
title: "Start Developing With Laravel in Ubuntu 20.04"
date: 2021-04-03
draft: false
slug: "start-developing-with-laravel-in-ubuntu-20.04"
---
""" + make_body(200)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_VERSION_SPECIFIC)
        self.assertEqual(row["action"], "replace + 301")
        self.assertIsNotNone(new_post)
        self.assertEqual(new_post["replaces_slug"], "start-developing-with-laravel-in-ubuntu-20.04")
        self.assertTrue("24.04" in new_post["suggested_slug"] or "24" in new_post["suggested_title"])

    def test_5_published_2023_body_update_2025(self):
        """Published 2023, body contains Update (2025) -> skip (no row)."""
        content = """---
title: "Some Post"
date: 2023-01-01
draft: false
slug: "some-post"
---
> **Update (2025)**: This article has been revised to reflect modern npm capabilities.
""" + make_body(100)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNone(row)
        self.assertIsNone(new_post)

    def test_6_psr_series_draft(self):
        """PSR series, draft -> outdated / finish or archive / psr-draft."""
        content = """---
title: "PSR-99: Something"
date: 2024-01-01
draft: true
series: ["php-fig-standards"]
slug: "psr-99-something"
---
""" + make_body(300)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_PSR_DRAFT)
        self.assertIsNone(new_post)

    def test_7_psr_series_published(self):
        """PSR series, published -> skip (no row)."""
        content = """---
title: "PSR-1: Basic Coding Standard"
date: 2025-01-06
draft: false
series: ["php-fig-standards"]
slug: "psr-1-basic-coding-standard"
---
""" + make_body(500)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNone(row)
        self.assertIsNone(new_post)

    def test_8_published_2023_no_signals(self):
        """Published 2023, no other signals -> optional row: review / freshness-review."""
        content = """---
title: "Some Post"
date: 2023-06-01
draft: false
slug: "some-post"
---
""" + make_body(400)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_FRESHNESS_REVIEW)
        self.assertEqual(row["action"], "review")
        self.assertIsNone(new_post)

    def test_9_published_no_date(self):
        """Published, no date -> outdated / update or archive / old-date."""
        content = """---
title: "Post Without Date"
draft: false
slug: "post-without-date"
---
""" + make_body(200)
        row, new_post = audit_post(Path("test.md"), content, "test")
        self.assertIsNotNone(row)
        self.assertEqual(row["reason"], REASON_OLD_DATE)
        self.assertIn("Missing date", row["notes"])
        self.assertIsNone(new_post)


if __name__ == "__main__":
    unittest.main(verbosity=2)
