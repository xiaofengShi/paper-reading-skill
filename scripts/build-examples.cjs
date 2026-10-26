// Render every examples/*-deep-read.md to docs/<name>-deep-read.html.
// Usage: node scripts/build-examples.cjs
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const root = path.resolve(__dirname, '..');
const examplesDir = path.join(root, 'examples');
const docsDir = path.join(root, 'docs');
const renderer = path.join(__dirname, 'render-reading.cjs');

const sources = fs.readdirSync(examplesDir)
  .filter(file => file.endsWith('-deep-read.md'))
  .sort();
if (!sources.length) throw new Error('No examples/*-deep-read.md sources found');

const check = process.argv.includes('--check');
const temporary = check ? fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-examples-')) : null;
try {
  fs.mkdirSync(docsDir, { recursive: true });
  for (const file of sources) {
    const output = `${file.replace(/\.md$/, '')}.html`;
    const target = path.join(temporary || docsDir, output);
    execFileSync(process.execPath, [renderer, path.join(examplesDir, file), target], { stdio: 'pipe' });
    let html = fs.readFileSync(target, 'utf8');
    const canonical = `https://xiaofengshi.github.io/paper-reading-skill/${output}`;
    const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
    // Metadata describes a published gallery page; personal readings have no public URL.
    const metadata = `<link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${title.replace(/"/g, '&quot;')}"><meta property="og:url" content="${canonical}">`;
    html = html.replace('</head>', `${metadata}</head>`);
    if (check) {
      if (!fs.existsSync(path.join(docsDir, output)) || fs.readFileSync(path.join(docsDir, output), 'utf8') !== html) {
        throw new Error(`${output} is stale; run npm run build:examples`);
      }
    } else {
      fs.writeFileSync(target, html);
    }
  }
  console.log(`${check ? 'Checked' : 'Rendered'} ${sources.length} readings in docs/`);
} finally {
  if (temporary) fs.rmSync(temporary, { recursive: true, force: true });
}
