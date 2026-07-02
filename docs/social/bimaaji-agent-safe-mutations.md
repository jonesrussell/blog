# Bimaaji: agent-safe mutations for Waaseyaa

Reference URL: https://jonesrussell.github.io/blog/bimaaji-agent-safe-mutations/

## Bluesky

AI agents shouldn't edit Waaseyaa apps via raw file writes. Bimaaji gives them a structured DSL, AST-safe patches, and sovereignty guardrails. https://jonesrussell.github.io/blog/bimaaji-agent-safe-mutations/ #buildinpublic

## LinkedIn

If you let an AI agent modify your application, it needs more than a text editor.

Raw string replacement on a PHP file passes a lot of tests and still breaks things an hour later in production. The tool has no idea what the file actually represents: the migration is missing, the JSON:API resource never gets the new field, the admin panel still doesn't know it exists, and the community's sovereignty profile never got consulted.

Each of those is a different subsystem. A good agent can write a correct edit to any one of them. What a filesystem-level tool cannot do is coordinate the edit across all of them and verify it is allowed under the community's posture.

Bimaaji is the Waaseyaa package that fixes this. The flow:

Introspection builds an ApplicationGraph the agent reads. The agent writes a task in a structured DSL, not raw PHP. A MutationValidator runs the task against declarative SovereigntyGuardrails that match the community's deployment profile (local, hybrid, cloud). A PatchGenerator turns the validated request into a PatchSet of reviewable diffs, using nikic/php-parser to produce PHP patches that are syntactically valid by construction.

The agent never touches the filesystem. The patch goes to a human (or a higher-level workflow) for acceptance.

This is where Waaseyaa's sovereignty story gets teeth. Community control over AI-driven changes is not a policy document sitting on a wiki. It is a validator in the mutation path. If a mutation violates the profile, it stops at the proposal stage. No files get rewritten first and reverted after.

https://jonesrussell.github.io/blog/bimaaji-agent-safe-mutations/

#softwaredevelopment #php #aiagents #opensource #buildinpublic

## Facebook

Shipped a Waaseyaa package called Bimaaji that lets AI agents modify a Waaseyaa application without the usual risks of letting an agent loose on a codebase.

The short version: agents do not edit files. They submit a structured task, it runs through a validator backed by sovereignty rules declared by the community, and the output is a reviewable patch generated through a PHP AST so it is syntactically valid by construction. Nothing touches disk until a human approves.

The sovereignty piece is what I care about most. Community control over AI changes is not a policy document. It is a validator in the mutation path.

https://jonesrussell.github.io/blog/bimaaji-agent-safe-mutations/

#buildinpublic
