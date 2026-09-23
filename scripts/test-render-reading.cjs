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

**Worked example:** A has $A_i$, B has $f_A=1,f_B=0.5$, and $\\lambda=4/3$ remains inline.

中文公式 $A_i$，标点与公式同行。

An observation can be read on its own.（PDF p. 3, Fig. 1）

Another observation stands alone (PDF p. 5, Fig. 2).

*原论文 Fig. 1，PDF p. 4。图示说明留在本页。*

$$x=y+z$$

\`\`\`paper-chart
{"type":"paired","title":"Example","source":"PDF p. 2","rows":[{"label":"Model A","before":60,"after":70},{"label":"Model B","before":70,"after":60}]}
\`\`\`
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<strong>Example:<\/strong> A has <span class="inline-math">[\s\S]*?B has <span class="inline-math">[\s\S]*?The result stays in one paragraph\.<\/p>/);
    assert.equal((html.match(/class="inline-math"/g) || []).length, 6);
    const worked = html.match(/<p><strong>Worked example:<\/strong>[\s\S]*?<\/p>/)?.[0];
    assert.ok(worked, 'worked example remains one paragraph');
    assert.equal((worked.match(/class="inline-math"/g) || []).length, 3);
    assert.match(html, /，<\/span>标点与公式同行。/);
    assert.match(html, /class="display-math"/);
    assert.match(html, /class="katex-html" aria-hidden="true"/);
    assert.match(html, /class="katex-mathml"><math/);
    assert.match(html, /\.katex \.katex-mathml\{clip:/);
    assert.match(html, /\.inline-math \{ display: inline-block;/);
    assert.match(html, /data:font\/woff2;base64,/);
    assert.doesNotMatch(html, /url\(fonts\//);
    assert.doesNotMatch(html, /\*\*Example:/);
    assert.match(html, /class="hero-sub">One idea grounded in the source/);
    assert.match(html, /class="hero-map"[\s\S]*?A source fact/);
    assert.match(html, /class="pair-track"[\s\S]*?left:60%[\s\S]*?left:70%/);
    assert.match(html, /\+10\.0 个百分点/);
    assert.match(html, /-10\.0 个百分点/);
    assert.doesNotMatch(html, /class="pair-line"/);
    assert.match(html, /id="show-sources" type="checkbox"/);
    assert.doesNotMatch(html, /id="show-sources"[^>]*\bchecked\b/);
    assert.match(html, /#show-sources:not\(:checked\) ~ \* \.source-ref/);
    assert.match(html, /An observation can be read on its own\.<span class="source-ref">（PDF p\. 3, Fig\. 1）<\/span>/);
    assert.match(html, /Another observation stands alone <span class="source-ref">\(PDF p\. 5, Fig\. 2\)<\/span>\./);
    assert.match(html, /原论文 Fig\. 1<span class="source-ref">，PDF p\. 4<\/span>。图示说明留在本页。/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
