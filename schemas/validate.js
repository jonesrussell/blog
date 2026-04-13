const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = __dirname;

function loadSchema(name) {
  const schemaPath = path.join(SCHEMAS_DIR, `${name}.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema not found: ${schemaPath}`);
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

function validate(schemaName, filePath) {
  const validator = loadSchema(schemaName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const valid = validator(data);
  return {
    valid,
    errors: valid ? null : validator.errors
  };
}

// CLI mode: node schemas/validate.js <schema-name> <file-path>
if (require.main === module) {
  const [schemaName, filePath] = process.argv.slice(2);
  if (!schemaName || !filePath) {
    console.error('Usage: node schemas/validate.js <schema-name> <file-path>');
    console.error('Example: node schemas/validate.js mined-seed data.json');
    process.exit(2);
  }
  const result = validate(schemaName, filePath);
  if (result.valid) {
    console.log(`✓ ${filePath} is valid against ${schemaName}`);
    process.exit(0);
  } else {
    console.error(`✗ ${filePath} failed validation against ${schemaName}:`);
    result.errors.forEach(err => {
      console.error(`  - ${err.instancePath || '(root)'}: ${err.message}`);
    });
    process.exit(1);
  }
}

module.exports = { validate, loadSchema };
