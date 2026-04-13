const { validate, loadSchema } = require('./validate');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// Test: loadSchema returns a compiled validator
console.log('loadSchema');
const validator = loadSchema('mined-seed');
assert(typeof validator === 'function', 'returns a function for a known schema');

let threw = false;
try { loadSchema('nonexistent-schema'); } catch (e) { threw = true; }
assert(threw, 'throws for unknown schema name');

// Test: validate with valid fixture
console.log('validate valid fixture');
const validResult = validate('mined-seed', path.join(__dirname, 'fixtures/valid-mined-seed.json'));
assert(validResult.valid === true, 'valid fixture passes');
assert(validResult.errors === null, 'no errors on valid fixture');

// Test: validate with missing required field
console.log('validate missing required field');
const missingResult = validate('mined-seed', path.join(__dirname, 'fixtures/invalid-mined-seed-missing-source.json'));
assert(missingResult.valid === false, 'missing source fails validation');
assert(Array.isArray(missingResult.errors), 'returns errors array');
assert(missingResult.errors.length > 0, 'errors array is not empty');

// Test: validate with bad enum value
console.log('validate bad enum value');
const badEnumResult = validate('mined-seed', path.join(__dirname, 'fixtures/invalid-mined-seed-bad-enum.json'));
assert(badEnumResult.valid === false, 'bad enum value fails validation');

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
