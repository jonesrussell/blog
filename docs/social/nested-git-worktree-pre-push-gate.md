## Bluesky

A stray PHPStan cache in a nested git worktree got scanned as production code, breaking a pre-push gate that was supposed to keep local and CI checks in sync. https://jonesrussell.github.io/blog/nested-git-worktree-pre-push-gate/

## LinkedIn

A pre-push quality gate is only as good as its exclusion rules. In one repo, a nested git worktree left a stray PHPStan cache file on disk. A scanner that excluded vendor and node_modules at any depth, but tmp only at the repo root, picked it up as a real violation — and two gates failed locally while passing in CI. The escape hatch became skipping the hook entirely.

The fix was small: match tmp at any depth like the other exclusions, and add an explicit exclusion for nested worktree checkouts, without widening the exclusion to tracked files that happen to live nearby.

Full writeup on how it broke, the fix, and the tests that guard both directions of the exclusion.

https://jonesrussell.github.io/blog/nested-git-worktree-pre-push-gate/

#softwareengineering #git #ci #testing

## Facebook

How a nested git worktree quietly broke a pre-push code quality gate, and the small fix that closed the gap. https://jonesrussell.github.io/blog/nested-git-worktree-pre-push-gate/

#softwareengineering #git
