const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('an installation can check its renderer without downloading a paper or shipping the gallery', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'doctor.cjs')], {
    cwd: path.resolve(__dirname, '..'), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /dependencies, and an offline synthetic smoke render passed/);
  assert.match(result.stdout, /not paper access, scientific accuracy, or reading completeness/);
});
