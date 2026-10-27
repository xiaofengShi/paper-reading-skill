const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const renderer = path.resolve(__dirname, 'render-reading.cjs');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl7ZQAAAABJRU5ErkJggg==', 'base64');
const header = '<!-- paper-reading-lang: en -->\n# Integrity\n\n## 01 / Evidence\n\n';

function fixture(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-integrity-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(path.join(dir, 'pixel.png'), pixel);
    run({ dir, source, output, render(body, target = output) {
      fs.writeFileSync(source, header + body);
      const result = spawnSync(process.execPath, [renderer, source, target], { encoding: 'utf8' });
      return { ...result, html: result.status === 0 ? fs.readFileSync(target, 'utf8') : '' };
    } });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function succeeds(result) { assert.equal(result.status, 0, result.stderr); return result.html; }
function fails(result, pattern) { assert.notEqual(result.status, 0, 'expected the build to reject this input'); assert.match(result.stderr, pattern); }

test('reader goals are optional escaped text and evidence disclosures retain rendered math and tables', () => fixture(({ render }) => {
  const item = { number: '01', label: 'Question', text: 'A mechanism', source: 'PDF §1' };
  const map = extra => '```paper-map\n' + JSON.stringify({ items: [item], ...extra }) + '\n```\n';
  const html = succeeds(render(map({ reader: 'Vectors & derivatives', goals: ['Compute <one> example'] }) + '\n<details class="reading-detail">\n<summary>Full evidence</summary>\n\n$$x^2$$\n\n| Run | Value |\n|---|---|\n| A | 42 |\n\n</details>\n'));
  assert.match(html, /class="hero-reader"[\s\S]*?Vectors &amp; derivatives/);
  assert.match(html, /class="hero-goals"[\s\S]*?Compute &lt;one&gt; example/);
  assert.match(html, /<details class="reading-detail">[\s\S]*?class="display-math"[\s\S]*?<table>[\s\S]*?<td>42<\/td>[\s\S]*?<\/details>/);
  assert.doesNotMatch(html, /<details class="reading-detail" open/);
  const legacy = succeeds(render(map({})));
  assert.doesNotMatch(legacy, /<p class="hero-reader"|<div class="hero-goals"/);
  for (const extra of [{ reader: '' }, { goals: [] }, { goals: 'not an array' }, { goals: [''] }, { goals: [3] }]) {
    fails(render(map(extra)), /paper-map/);
  }
}));

test('understanding checks disclose grounded answers without scripts and reject incomplete items', () => fixture(({ render }) => {
  const block = data => '```paper-check\n' + JSON.stringify(data) + '\n```\n';
  const item = { question: 'Why freeze W0?', answer: 'To learn A & B while retaining the base.', source: 'PDF §4', hint: 'Trace the training step.' };
  const html = succeeds(render(block({ title: 'Try it', items: [item] })));
  assert.match(html, /<section class="understanding-check">/);
  assert.match(html, /<details><summary>Reveal a grounded answer<\/summary>/);
  assert.match(html, /To learn A &amp; B while retaining the base\./);
  assert.doesNotMatch(html, /<details open|<script/);
  for (const field of ['question', 'answer', 'source']) {
    fails(render(block({ title: 'Try it', items: [{ ...item, [field]: '' }] })), new RegExp('missing "' + field + '"'));
  }
  fails(render(block({ title: 'Try it', items: [] })), /paper-check needs items/);
  const escaped = succeeds(render(block({ title: '<script>', items: [{ ...item, answer: '<img src=x>' }] })));
  assert.match(escaped, /&lt;img src=x&gt;/);
}));

test('Markdown images with titles, reference links, and parenthesized filenames are embedded', () => fixture(({ dir, render }) => {
  fs.writeFileSync(path.join(dir, 'figure (1).png'), pixel);
  const html = succeeds(render('![Title](pixel.png "Caption")\n\n![Reference][figure]\n\n[figure]: pixel.png "Referenced caption"\n\n![Parentheses](<figure (1).png>)\n'));
  assert.equal((html.match(/<img src="data:image\/png;base64,/g) || []).length, 3);
  assert.match(html, /title="Caption"/);
  assert.match(html, /title="Referenced caption"/);
  assert.doesNotMatch(html, /src="(?:pixel|figure)/);
}));

test('Markdown entities display once in titles, navigation, and alt text while code keeps angle brackets', () => fixture(({ source, output, render }) => {
  render('placeholder');
  fs.writeFileSync(source, '<!-- paper-reading-lang: en -->\n# A &amp; B &lt;C&gt; and `<D>`\n\n## Research &amp; Development\n\n![A &amp; B &lt;C&gt;](pixel.png)\n');
  const result = spawnSync(process.execPath, [renderer, source, output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(output, 'utf8');
  assert.match(html, /<h1>A &amp; B &lt;C&gt; and &lt;D&gt;<\/h1>/);
  assert.match(html, /href="#section-1">Research &amp; Development<\/a>/);
  assert.match(html, /alt="A &amp; B &lt;C&gt;"/);
  assert.doesNotMatch(html, /&amp;amp;|&amp;lt;/);
}));

test('raw HTML images embed regardless of attribute order, case, quoting, and optional alt', () => fixture(({ render }) => {
  const html = succeeds(render('<IMG width="1" ALT=Pixel SRC=\'pixel.png\' title="a > b">\n\n<img class="plain" src=pixel.png>\n'));
  assert.equal((html.match(/data:image\/png;base64,/g) || []).length, 2);
  assert.doesNotMatch(html, /src\s*=\s*['"]?pixel\.png/i);
}));

test('the supported raster formats include JPEG and WebP with case-insensitive extensions', () => fixture(({ dir, render }) => {
  // These are container signatures: this contract test verifies MIME selection
  // and byte-for-byte embedding, rather than a browser image decoder.
  const jpeg = Buffer.from('ffd8ffe000104a46494600010100000100010000ffd9', 'hex');
  const webp = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64');
  fs.writeFileSync(path.join(dir, 'photo.JPG'), jpeg);
  fs.writeFileSync(path.join(dir, 'photo.jpeg'), jpeg);
  fs.writeFileSync(path.join(dir, 'figure.WebP'), webp);
  const html = succeeds(render('![JPEG](photo.JPG)\n\n![JPEG extension](photo.jpeg)\n\n![WebP](figure.WebP)'));
  assert.equal((html.match(/data:image\/jpeg;base64,/g) || []).length, 2);
  assert.ok(html.includes(`data:image/jpeg;base64,${jpeg.toString('base64')}`));
  assert.ok(html.includes(`data:image/webp;base64,${webp.toString('base64')}`));
}));

test('inline, fenced, indented, and escaped code keeps dollar syntax literally', () => fixture(({ render }) => {
  const html = succeeds(render('Inline `$x+y$` and ``$$\\invalid$$`` stay literal.\n\nA multiline code span `starts here\n$$\\invalid$$\nand ends here` also stays literal.\n\n```js\nconst formula = "$x+y$";\nconst invalid = "$$\\invalid$$";\n```\n\n    $x+y$\n\nEscaped \\$z\\$ and real $a+b$，follow.\n\n$$x=y$$\n'));
  assert.match(html, /<code>\$x\+y\$<\/code>/);
  assert.match(html, /<code>\$\$\\invalid\$\$<\/code>/);
  assert.match(html, /<pre><code class="language-js">const formula = &quot;\$x\+y\$&quot;;/);
  assert.match(html, /<pre><code>\$x\+y\$\n<\/code><\/pre>/);
  assert.match(html, /Escaped \$z\$ and real <span class="inline-math">/);
  assert.equal((html.match(/class="inline-math"/g) || []).length, 1);
  assert.equal((html.match(/class="display-math"/g) || []).length, 1);
  assert.match(html, /，<\/span>follow/);
}));

test('image and diagram paths cannot escape through symlinks, absolute paths, or traversal', () => fixture(({ dir, render }) => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-outside-'));
  try {
    fs.writeFileSync(path.join(outside, 'outside.png'), pixel);
    fs.writeFileSync(path.join(outside, 'diagram.html'), '<p>Outside</p>');
    fs.symlinkSync(outside, path.join(dir, 'linked'), 'dir');
    for (const body of ['![Escape](linked/outside.png)', '<!-- archify:linked/diagram.html|Escape -->', `![Absolute](${path.join(dir, 'pixel.png')})`, '![Traversal](../pixel.png)']) {
      fails(render(body), /Visual must stay beside source/);
    }
  } finally { fs.rmSync(outside, { recursive: true, force: true }); }
}));

test('output may never overwrite the Markdown source through a path, symlink, or hard link alias', () => fixture(({ dir, source, render }) => {
  for (const alias of [source, path.join(dir, 'alias.html'), path.join(dir, 'hardlink.html')]) {
    fs.writeFileSync(source, header + 'Keep me.');
    if (alias.endsWith('alias.html')) fs.symlinkSync(source, alias);
    if (alias.endsWith('hardlink.html')) fs.linkSync(source, alias);
    fails(render('Keep me.', alias), /Output must not overwrite the source/);
    assert.equal(fs.readFileSync(source, 'utf8'), header + 'Keep me.');
  }
}));

test('remote and unresolved asset requests fail before output while ordinary external links remain usable', () => fixture(({ dir, output, render }) => {
  const cases = [
    '![Remote](https://example.com/pixel.png)',
    '<img alt="remote" src="//example.com/pixel.png">',
    '<script src="https://example.com/a.js"></script>',
    '<link href="style.css" rel="stylesheet">',
    '<style>.figure { background: url(https://example.com/a.png) }</style>',
    '<style>@import "https://example.com/a.css";</style>',
    '<style>.figure { background: u\\72 l(https://example.com/a.png) }</style>',
    '<svg><use href="https://example.com/fig.svg#part"></use></svg>',
    '<iframe src="https://example.com/"></iframe>',
    '<img src="pixel.png" srcset="pixel.png 1x, https://example.com/pixel.png 2x">',
    '<meta http-equiv="refresh" content="0;url=https://example.com/">',
  ];
  for (const body of cases) {
    fails(render(body), /Offline asset|External resource|Unsupported image source/);
    assert.equal(fs.existsSync(output), false);
  }
  const html = succeeds(render('[Paper source](https://example.com/paper.pdf)\n\n<a href="https://example.com/details">Details</a>'));
  assert.match(html, /href="https:\/\/example.com\/paper.pdf"/);
  assert.match(html, /href="https:\/\/example.com\/details"/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /href="https:\/\/github.com\/xiaofengShi\/paper-reading-skill"/);
}));

test('self-contained SVG/data fragments and inline interactive scripts survive offline validation', () => fixture(({ dir, render }) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><defs><path id="p" d="M0 0L1 1"/></defs><use href="#p"/><style>path { marker-end: url(#p) }</style></svg>';
  fs.writeFileSync(path.join(dir, 'figure.SVG'), svg);
  fs.writeFileSync(path.join(dir, 'diagram.html'), `<html><head><link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet"><style>.icon{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E")}</style></head><body><button id="toggle">Focus</button><script>document.getElementById('toggle').onclick=()=>document.body.classList.toggle('focused');</script>${svg}<a href="https://example.com/paper">Paper</a></body></html>`);
  const html = succeeds(render('![SVG](figure.SVG)\n\n<!-- archify:diagram.html|Explore -->\n'));
  assert.match(html, /data:image\/svg\+xml;base64,/);
  assert.match(html, /<iframe[^>]+sandbox="allow-scripts"/);
  assert.match(html, /classList.toggle/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.match(html, /url\(#p\)/);
  const textOnlyCss = succeeds(render('<style>.label::after { content: "Example \\"url(https://example.com/is-text)\\""; }</style>'));
  assert.match(textOnlyCss, /https:\/\/example.com\/is-text/);
}));

test('SVG image dependencies and embedded iframe resources must also be self-contained', () => fixture(({ dir, render }) => {
  fs.writeFileSync(path.join(dir, 'external.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/pixel.png"/></svg>');
  fails(render('![External SVG](external.svg)'), /Offline asset|External resource/);
  fs.writeFileSync(path.join(dir, 'external.html'), '<html><script src="local.js"></script></html>');
  fails(render('<!-- archify:external.html|External script -->'), /Offline asset|External resource/);
}));

test('invalid real math still fails and teaching examples do not execute custom fences', () => fixture(({ render }) => {
  fails(render('Real $\\unknowncommand$ math.'), /KaTeX parse error/);
  const html = succeeds(render('````markdown\n```paper-chart\n{"type":"bars","rows":[]}\n```\n<!-- archify:missing.html|Example -->\n````\n'));
  assert.match(html, /<pre><code class="language-markdown">/);
  assert.match(html, /paper-chart/);
  assert.match(html, /archify:missing\.html/);
  assert.doesNotMatch(html, /class="archify-disclosure"/);
}));
