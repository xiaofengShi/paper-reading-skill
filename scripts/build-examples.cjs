// Render every examples/*-deep-read.md to docs/<name>-deep-read.html.
// Usage: node scripts/build-examples.cjs
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const examplesDir = path.join(root, 'examples');
const docsDir = path.join(root, 'docs');
const renderer = path.join(__dirname, 'render-reading.cjs');

const sources = fs.readdirSync(examplesDir)
  .filter(file => file.endsWith('-deep-read.md'))
  .sort();
if (!sources.length) throw new Error('No examples/*-deep-read.md sources found');

fs.mkdirSync(docsDir, { recursive: true });
for (const file of sources) {
  const output = `${file.replace(/\.md$/, '')}.html`;
  execFileSync(process.execPath, [renderer, path.join(examplesDir, file), path.join(docsDir, output)], { stdio: 'inherit' });
}
console.log(`Rendered ${sources.length} readings into docs/`);
