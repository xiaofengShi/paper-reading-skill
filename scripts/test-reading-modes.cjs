const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { parseReadingHeader } = require('./lib/reading-markdown.cjs');

const root = path.resolve(__dirname, '..');
const render = (source, output) => spawnSync(process.execPath, [path.join(__dirname, 'render-reading.cjs'), source, output], { encoding: 'utf8' });

test('mode labels follow the audit header, independent of filenames, with Brief as the legacy default', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-modes-'));
  try {
    // A legacy filename must not promote a Brief to Deep.
    const source = path.join(dir, 'legacy-deep-read.md');
    const output = path.join(dir, 'reading.html');
    for (const [header, mode, theme] of [
      ['', 'brief', 'forest'],
      ['<!-- paper-reading-mode: deep -->\n', 'deep', 'forest'],
      ['<!-- paper-reading-theme: plum -->\n<!-- paper-reading-mode: brief -->\n', 'brief', 'plum'],
      ['<!-- paper-reading-mode: deep -->\n<!-- paper-reading-theme: cobalt -->\n', 'deep', 'cobalt'],
    ]) {
      fs.writeFileSync(source, `<!-- paper-reading-lang: en -->\n${header}# A source-grounded reading\n\n## The mechanism\n\nThe full explanation remains visible with $x+1$.\n`);
      const result = render(source, output);
      assert.equal(result.status, 0, result.stderr);
      const html = fs.readFileSync(output, 'utf8');
      assert.ok(html.includes(`<meta name="paper-reading-mode" content="${mode}">`));
      assert.ok(html.includes(`<body data-theme="${theme}">`));
      assert.ok(html.includes(` · ${mode === 'deep' ? 'Deep' : 'Brief'} reading atlas</title>`));
      assert.ok(html.includes(`${mode.toUpperCase()} READING ATLAS · ENGLISH`));
      assert.match(html, /The full explanation remains visible with <span class="inline-math">/);
      assert.match(html, /href="#section-1"/);
      assert.doesNotMatch(html, /<!-- paper-reading-(?:mode|theme):/);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('invalid or duplicate mode metadata fails without replacing an existing output', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-mode-errors-'));
  try {
    const source = path.join(dir, 'source.md');
    const output = path.join(dir, 'reading.html');
    fs.writeFileSync(output, 'existing user output');
    for (const header of [
      '<!-- paper-reading-mode: scan -->\n',
      '<!-- paper-reading-mode: DEEP -->\n',
      '<!-- paper-reading-mode:  -->\n',
      '<!-- paper-reading-mode: deep -->\n<!-- paper-reading-mode: brief -->\n',
    ]) {
      fs.writeFileSync(source, `<!-- paper-reading-lang: en -->\n${header}# Paper\n`);
      const result = render(source, output);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Unknown paper-reading mode|Repeated paper-reading mode marker/);
      assert.equal(fs.readFileSync(output, 'utf8'), 'existing user output');
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('each gallery entry declares the same mode in its audit source, HTML, and both homepages', () => {
  const { readings } = JSON.parse(fs.readFileSync(path.join(root, 'readings.json'), 'utf8'));
  const galleries = ['index.html', 'zh.html'].map(name => {
    const html = fs.readFileSync(path.join(root, 'docs', name), 'utf8');
    const items = html.match(/<li data-reading-lang="[^"]+" data-reading-mode="[^"]+">[\s\S]*?<\/li>/g) || [];
    assert.equal(items.length, readings.length, name);
    return items;
  });
  for (const reading of readings) {
    const source = fs.readFileSync(path.join(root, 'examples', `${reading.slug}-deep-read.md`), 'utf8');
    assert.ok(source.includes(`<!-- paper-reading-mode: ${reading.mode} -->`), reading.slug);
    assert.equal(parseReadingHeader(source).mode, reading.mode, reading.slug);
    const html = fs.readFileSync(path.join(root, 'docs', `${reading.slug}-deep-read.html`), 'utf8');
    assert.ok(html.includes(`<meta name="paper-reading-mode" content="${reading.mode}">`), reading.slug);
    for (const gallery of galleries) {
      const item = gallery.find(item => item.includes(`href="${reading.slug}-deep-read.html"`));
      assert.ok(item, reading.slug);
      assert.ok(item.includes(`data-reading-mode="${reading.mode}"`), reading.slug);
      assert.ok(item.includes(reading.mode === 'deep' ? 'Deep Reading' : 'Brief Reading'), reading.slug);
    }
  }
});
