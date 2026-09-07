# Stop walking the filesystem in your CI gates — ask git instead

## Bluesky

Our CI gate scanners walked the filesystem and subtracted a denylist to find repo files. A nested git worktree slipped through and produced 24,780 phantom findings. Fixed it by asking git instead of guessing.

https://jonesrussell.github.io/blog/git-native-repository-file-enumeration/

## LinkedIn

Wrote up a CI gate bug this week that took two fixes to actually close.

Our scanner scripts found "repository files" by walking the filesystem with a RecursiveDirectoryIterator and subtracting a hand-maintained denylist: vendor, node_modules, git, and so on. Nested git worktrees were not on that list. On the primary checkout, that produced 24,780 phantom findings across three gates (18,844 + 5,932 + 4), and a write flag would have committed developer-local worktree paths into a tracked roster file.

The fix replaced the whole approach: git ls-files --cached --others --exclude-standard returns exactly the files that count as repository content, gitignore included, and git never descends into another repository's work tree. One line replaced an entire denylist.

That exposed a second, subtler bug. A pre-push hook run from a linked worktree exports GIT_DIR pointing at the hook's own repository, and that variable overrides the -C flag the scanner relied on to scope its git calls. The fix scrubs every repository-selecting environment variable before running git as a child process.

The general lesson: if a script needs to know what is in a repository, ask git. A denylist only ever encodes what has already broken it once.

https://jonesrussell.github.io/blog/git-native-repository-file-enumeration/

#php #git #softwareengineering #ci #devops

## Facebook

Our CI gate scripts found repository files by walking the filesystem and subtracting a denylist. A nested git worktree was not on that list and produced almost 25,000 phantom findings. Replaced the whole approach with git ls-files and wrote up what broke and why.

https://jonesrussell.github.io/blog/git-native-repository-file-enumeration/

#php #buildinpublic
