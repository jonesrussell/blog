#!/bin/bash

# Statistics script for blog project
# Shows blog and PHP-FIG guide statistics

echo "=== Blog Statistics ==="
echo "Published posts: $(ls _posts/*.md 2>/dev/null | wc -l)"
echo "Draft posts: $(ls _drafts/*.md 2>/dev/null | wc -l)"
echo "Total words in posts: $(find _posts -name '*.md' -exec wc -w {} + | tail -1 | awk '{print $1}')"
echo ""
echo "=== PHP-FIG Guide ==="
echo "PSR implementations: $(find code/php-fig-guide/src -type d 2>/dev/null | wc -l)" 