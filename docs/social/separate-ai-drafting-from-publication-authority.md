## Bluesky

AI can draft a post without holding publication authority. I moved judgment to a local agent while GitHub still gates current source state, records, Hugo, deployment, and social delivery. https://jonesrussell.github.io/blog/separate-ai-drafting-from-publication-authority/ #devops #ai

## LinkedIn

I replaced this blog's hosted AI generator with a local Codex workflow, but I did not move the whole publishing pipeline onto my computer.

The local agent owns judgment: inspect real source, reject weak topics, check for overlap, and draft the article. Versioned scripts and GitHub own publication authority: a short-lived preflight tied to an exact commit, deterministic record validation, a production Hugo build, exact-head merge, Pages verification, and idempotent Buffer delivery.

The result is easier to resume and easier to audit. Every boundary leaves evidence, and changing the drafting agent does not change the publication contract.

https://jonesrussell.github.io/blog/separate-ai-drafting-from-publication-authority/

#devops #automation #githubactions #ai

## Facebook

I moved this blog's AI drafting from a hosted workflow to a local Codex session, while keeping publication authority behind versioned cloud gates. The new design ties preflight to an exact commit, validates a five-file publication transaction, waits for Pages, and reconciles Buffer before another article can start. https://jonesrussell.github.io/blog/separate-ai-drafting-from-publication-authority/ #automation #devops
