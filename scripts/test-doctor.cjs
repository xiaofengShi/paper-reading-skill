const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('a fresh installation can render an offline example through the doctor command', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'doctor.cjs')], {
    cwd: path.resolve(__dirname, '..'), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /dependencies, and one offline example render passed/);
});
