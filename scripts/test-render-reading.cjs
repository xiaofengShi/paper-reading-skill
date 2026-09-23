const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const renderer = path.resolve(__dirname, 'render-reading.cjs');

test('inline math stays in prose, display math stays separate, and paired values share one scale', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, `# Test Paper

## 01 / Overview

\`\`\`paper-map
{"thesis":"One idea grounded in the source.","items":[{"number":"01","label":"Input","text":"A source fact.","source":"PDF p. 1"}]}
\`\`\`

**Example:** A has $x+y$, B has $z$. The result stays in one paragraph.

$$x=y+z$$

\`\`\`paper-chart
{"type":"paired","title":"Example","source":"PDF p. 2","rows":[{"label":"Model A","before":60,"after":70},{"label":"Model B","before":70,"after":60}]}
\`\`\`
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<strong>Example:<\/strong> A has <span class="inline-math">[\s\S]*?B has <span class="inline-math">[\s\S]*?The result stays in one paragraph\.<\/p>/);
    assert.equal((html.match(/class="inline-math"/g) || []).length, 2);
    assert.match(html, /class="display-math"/);
    assert.doesNotMatch(html, /\*\*Example:/);
    assert.match(html, /class="hero-sub">One idea grounded in the source/);
    assert.match(html, /class="hero-map"[\s\S]*?A source fact/);
    assert.match(html, /class="pair-track"[\s\S]*?left:60%[\s\S]*?left:70%/);
    assert.match(html, /\+10\.0 个百分点/);
    assert.match(html, /-10\.0 个百分点/);
    assert.doesNotMatch(html, /class="pair-line"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
