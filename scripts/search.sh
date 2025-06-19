#!/bin/bash

# Search script for blog content
# Usage: ./scripts/search.sh "search term"

if [ -z "$1" ]; then
    echo "Usage: task search \"search term\""
    exit 1
fi

grep -r "$1" _posts/ _drafts/ --include="*.md" || echo "No matches found" 