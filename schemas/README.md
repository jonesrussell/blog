# Spec-Kitty: Content Pipeline Schemas

JSON Schema contracts for every artifact in the content pipeline. Each schema validates the output of one pipeline stage and the input of the next.

## Schemas

| Schema | Stage Gate | Validates |
|---|---|---|
| `mined-seed.json` | Mine → Curate | Output of mining, input to curation |
| `curated-item.json` | Curate → Produce | Output of curation, input to production |

Future schemas (M2-M3):
- `draft.json` — Blog post frontmatter before PR
- `social-bundle.json` — Social copy package before distribution
- `distribution-package.json` — Full distribution record
- `analytics-feedback.json` — Post-distribution performance data

## Validator

Single-file Node.js utility using Ajv.

### CLI usage

```bash
# Validate a file against a schema
node schemas/validate.js mined-seed path/to/data.json

# Exit codes: 0 = valid, 1 = invalid, 2 = usage error
```

### Programmatic usage

```javascript
const { validate, loadSchema } = require('./validate');

// Validate a file
const result = validate('mined-seed', '/tmp/seed.json');
console.log(result.valid);    // true or false
console.log(result.errors);   // null or array of Ajv errors

// Get a compiled validator function
const validator = loadSchema('mined-seed');
const isValid = validator({ source: 'git-commit', ... });
```

### Running tests

```bash
npm test
```

## Where validation happens

- **Claude Code skills:** content-mine and content-curate validate before creating/updating issues
- **GitHub Actions:** content-mine.yml validates mined seeds before issue creation
- **CI (M4):** validate-schemas.yml will check artifacts in PRs

## Fixtures

Test fixtures live in `schemas/fixtures/`. Each schema has at least one valid and one invalid fixture used by the test suite.
