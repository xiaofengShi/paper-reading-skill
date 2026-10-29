const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const init = path.join(__dirname, 'init-reading.cjs');
const pack = path.join(__dirname, 'pack-skill.cjs');
const run = (file, args = [], options = {}) => spawnSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8', ...options });

test('initializer help and invalid arguments do not create a reading', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-init-'));
  try {
    const destination = path.join(temporary, 'reading');
    const help = run(init, ['--help']);
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /unfinished draft/);
    for (const args of [
      [], ['--out', destination], ['--out', destination, '--title', 'Paper', '--lang', 'fr'],
      ['--out', destination, '--title', 'Paper', '--theme', 'neon'],
      ['--out', destination, '--title', 'Paper', '--mode', 'scan'],
      ['--out', destination, '--title', 'Paper', '--mode', 'deep', '--mode', 'brief'],
      ['--out', destination, '--title', 'Paper', '--unknown', 'x'],
      ['--out', destination, '--title', 'Paper', '--title', 'Second'],
      ['--out', destination, '--title', 'Paper\nAnother line'],
    ]) {
      const result = run(init, args);
      assert.equal(result.status, 1, JSON.stringify(args));
      assert.equal(fs.existsSync(destination), false);
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('Brief and Deep starters in both languages preserve their mode through the task brief and HTML without inventing evidence', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-starters-'));
  try {
    for (const lang of ['en', 'zh-CN']) {
      for (const mode of ['brief', 'deep']) {
        const destination = path.join(temporary, `${lang}-${mode}`);
        const result = run(init, ['--out', destination, '--title', 'A paper <script> & a claim', '--paper', 'https://arxiv.org/abs/1706.03762v7', '--lang', lang, '--theme', 'plum', '--mode', mode]);
        assert.equal(result.status, 0, result.stderr);
        const source = fs.readFileSync(path.join(destination, 'reading.md'), 'utf8');
        const brief = fs.readFileSync(path.join(destination, 'brief.md'), 'utf8');
        assert.ok(source.startsWith(`<!-- paper-reading-lang: ${lang} -->\n<!-- paper-reading-theme: plum -->`));
        assert.ok(source.includes(`<!-- paper-reading-mode: ${mode} -->`));
        assert.ok(brief.includes(mode === 'deep' ? 'Deep Reading' : 'Brief Reading'));
        if (mode === 'deep') assert.ok(source.includes('references/deep-reading.md'));
        assert.match(source, /TODO/);
        assert.doesNotMatch(source, /<script>/);
        assert.doesNotMatch(source, /```paper-(?:chart|experiments)/);
        assert.match(brief, /\$paper-reading/);
        assert.ok(fs.statSync(path.join(destination, 'assets')).isDirectory());
        const output = path.join(destination, 'reading.html');
        const render = run(path.join(__dirname, 'render-reading.cjs'), [path.join(destination, 'reading.md'), output]);
        assert.equal(render.status, 0, render.stderr);
        const html = fs.readFileSync(output, 'utf8');
        assert.ok(html.includes(`<html lang="${lang}">`));
        assert.ok(html.includes(`<meta name="paper-reading-mode" content="${mode}">`));
        assert.ok(html.includes(lang === 'en' ? `${mode.toUpperCase()} READING ATLAS` : mode === 'brief' ? 'BRIEF READING' : '论文深读图谱'));
        assert.match(html, lang === 'en' ? /UNFINISHED DRAFT/ : /未完成草稿/);
        assert.match(html, /href="#section-6"/);
      }
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('initialization refuses an existing destination and preserves its contents', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-existing-'));
  try {
    const destination = path.join(temporary, 'reading');
    fs.mkdirSync(destination);
    const source = path.join(destination, 'reading.md');
    fs.writeFileSync(source, 'user work\n');
    const result = run(init, ['--out', destination, '--title', 'Paper']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists/);
    assert.equal(fs.readFileSync(source, 'utf8'), 'user work\n');
    assert.equal(fs.existsSync(path.join(destination, 'brief.md')), false);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('the runtime package has a verifiable small manifest and works without gallery or build scripts', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-package-'));
  try {
    const result = run(pack, ['--out', temporary]);
    assert.equal(result.status, 0, result.stderr);
    const runtime = path.join(temporary, 'paper-reading');
    const manifest = JSON.parse(fs.readFileSync(path.join(runtime, 'manifest.json'), 'utf8'));
    assert.equal(manifest.package, 'paper-reading-runtime');
    assert.ok(manifest.totalBytes < 1024 * 1024, `runtime grew beyond 1 MiB: ${manifest.totalBytes}`);
    assert.equal(manifest.totalBytes, manifest.files.reduce((sum, file) => sum + file.bytes, 0));
    for (const file of manifest.files) {
      assert.doesNotMatch(file.path, /^(?:docs|examples|node_modules|reports)\//);
      assert.doesNotMatch(file.path, /(?:^|\/)(?:test-|build-|pack-skill\.cjs)/);
      const buffer = fs.readFileSync(path.join(runtime, file.path));
      assert.equal(buffer.length, file.bytes, file.path);
      assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'), file.sha256, file.path);
    }
    const runtimePackage = JSON.parse(fs.readFileSync(path.join(runtime, 'package.json'), 'utf8'));
    assert.deepEqual(Object.keys(runtimePackage.scripts).sort(), ['doctor', 'init:reading', 'render']);
    assert.deepEqual(runtimePackage.dependencies, JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).dependencies);
    assert.equal(fs.existsSync(path.join(runtime, 'examples')), false);
    assert.equal(fs.existsSync(path.join(runtime, 'docs')), false);
    const readerTasks = fs.readFileSync(path.join(runtime, 'evals/reader-tasks.md'), 'utf8');
    assert.doesNotMatch(readerTasks, /\]\(\.\.\/docs\//);
    assert.match(readerTasks, /https:\/\/github\.com\/xiaofengShi\/paper-reading-skill\/blob\/main\/docs\//);
    assert.match(fs.readFileSync(path.join(runtime, 'references/renderer-format.md'), 'utf8'), /\]\(assets\/paper-fig1\.png\)/, 'illustrative image syntax in a fenced code example stays literal');
    // Simulate dependencies installed separately, without network access in the test suite.
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(runtime, 'node_modules'), 'junction');
    const doctor = run(path.join(runtime, 'scripts/doctor.cjs'), [], { cwd: runtime });
    assert.equal(doctor.status, 0, doctor.stderr);
    assert.match(doctor.stdout, /synthetic smoke render passed/);
    const starter = run(path.join(runtime, 'scripts/init-reading.cjs'), ['--out', path.join(temporary, 'first-reading'), '--title', 'Fresh paper']);
    assert.equal(starter.status, 0, starter.stderr);
    assert.match(fs.readFileSync(path.join(temporary, 'first-reading/reading.md'), 'utf8'), /<!-- paper-reading-mode: brief -->/);
    const archive = path.join(temporary, 'paper-reading.tar.gz');
    if (fs.existsSync(archive)) {
      assert.ok(fs.statSync(archive).size > 0);
      const entries = spawnSync('tar', ['-tzf', archive], { encoding: 'utf8' });
      assert.equal(entries.status, 0, entries.stderr);
      assert.match(entries.stdout, /paper-reading\/manifest.json/);
      assert.doesNotMatch(entries.stdout, /paper-reading\/(?:docs|examples|node_modules)\//);
    } else assert.match(result.stdout, /no archive was created/);
    const duplicate = run(pack, ['--out', temporary]);
    assert.equal(duplicate.status, 1);
    assert.match(duplicate.stderr, /Output already exists/);
    assert.equal(fs.readFileSync(path.join(runtime, 'manifest.json'), 'utf8'), JSON.stringify(manifest, null, 2) + '\n');
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('packaging rejects output inside its own runtime inputs before creating files', () => {
  const result = run(pack, ['--out', path.join(root, 'scripts'), '--no-archive']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /outside runtime input directories/);
});

test('packaging rejects symlinked output ancestors inside inputs, including a not-yet-created suffix', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-pack-path-'));
  try {
    const scripts = path.join(temporary, 'scripts');
    fs.mkdirSync(scripts);
    const copiedPack = path.join(scripts, 'pack-skill.cjs');
    fs.copyFileSync(pack, copiedPack);
    const alias = path.join(temporary, 'alias');
    fs.symlinkSync(scripts, alias, 'dir');
    for (const output of [alias, path.join(alias, 'not-created')]) {
      const result = run(copiedPack, ['--out', output, '--no-archive']);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /outside runtime input directories/);
    }
    assert.deepEqual(fs.readdirSync(scripts), ['pack-skill.cjs']);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});
