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
    assert.match(html, /<span class="figure-kicker">本文整理的数据图<\/span>/);
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

test('MiMo reader leads with the paper, includes Eq. 1, and names both Fig. 3 redraws', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-mimo-test-'));
  try {
    const source = path.resolve(__dirname, '../examples/mimo-v2.6-deep-read.md');
    const output = path.join(dir, 'mimo.html');
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /id="section-1">01 \/ 研究问题与训练链<\/h2>/);
    assert.doesNotMatch(html, /先分清三种顺序|本页阅读：|论文叙述：|前四步是模型训练/);
    assert.match(html, /从基础模型到最终评测/);
    assert.match(html, /<div class="display-math">[\s\S]*?r_{i,t}M_{i,t}A_i[\s\S]*?<\/div>/);
    assert.ok(html.includes('\\frac{1}{\\sum_{i=1}^{G}|o_i|}'), 'Eq. 1 keeps its group-token denominator');
    assert.match(html, /分母是<strong>该组全部轨迹的 token 总数<\/strong>/);
    assert.match(html, /<span class="figure-kicker">本文重绘 · 原论文 Fig\. 3 右图<\/span>/);
    assert.match(html, /<span class="figure-kicker">本文重绘 · 原论文 Fig\. 3 左图<\/span>/);
    assert.match(html, /id="original-fig-3"/);
    assert.match(html, /这一阶段留下什么/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a figure caption with bold text closes before the next chapter', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-figure-test-'));
  try {
    fs.writeFileSync(path.join(dir, 'pixel.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl7ZQAAAABJRU5ErkJggg==', 'base64'));
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, `# Test Paper

## 01 / Figure

![Figure 13](pixel.png)

*原论文 Fig. 13，PDF p. 25。历史**上下文**决定接下来的一轮。*

## 02 / Next chapter

This chapter stays upright.
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<figure class="paper-figure"><img src="data:image\/png;base64,[^"]+" alt="Figure 13"[^>]*><figcaption>原论文 Fig\. 13<span class="source-ref">，PDF p\. 25<\/span>。历史<strong>上下文<\/strong>决定接下来的一轮。<\/figcaption><\/figure>\s*<h2 id="section-2">02 \/ Next chapter<\/h2>/);
    assert.doesNotMatch(html, /<em>/);
    assert.match(html, /<p>This chapter stays upright\.<\/p>/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
