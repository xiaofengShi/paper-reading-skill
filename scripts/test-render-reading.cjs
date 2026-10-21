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
    fs.writeFileSync(source, `<!-- paper-reading-lang: zh-CN -->
# Test Paper

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
    assert.match(html, /<body data-theme="forest">/);
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
    assert.match(html, /<strong>原论文 Fig\. 7 把两种评分画成并行分支。<\/strong>[\s\S]*?<\/p>\s*<figure class="paper-figure"><div class="figure-hint">/);
    assert.match(html, /<strong>原论文 Fig\. 13 分三层展示这一过程。<\/strong>[\s\S]*?<\/p>\s*<figure class="paper-figure"><div class="figure-hint">/);
    assert.doesNotMatch(html, /原文参数表的一处标注不一致/);
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
    fs.writeFileSync(source, `<!-- paper-reading-lang: zh-CN -->
# Test Paper

## 01 / Figure

![Figure 13](pixel.png)

*原论文 Fig. 13，PDF p. 25。历史**上下文**决定接下来的一轮。*

## 02 / Next chapter

This chapter stays upright.
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<figure class="paper-figure"><div class="figure-hint">↔ 横向滚动查看图内细节<\/div><div class="figure-viewport" tabindex="0" aria-label="↔ 横向滚动查看图内细节"><img src="data:image\/png;base64,[^"]+" alt="Figure 13"[^>]*><\/div><figcaption>原论文 Fig\. 13<span class="source-ref">，PDF p\. 25<\/span>。历史<strong>上下文<\/strong>决定接下来的一轮。<\/figcaption><\/figure>\s*<h2 id="section-2">02 \/ Next chapter<\/h2>/);
    assert.doesNotMatch(html, /<em>/);
    assert.match(html, /<p>This chapter stays upright\.<\/p>/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('an English audit source produces an English reading page with a grounded map and chart', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-en-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, `<!-- paper-reading-lang: en -->
<!-- paper-reading-theme: cobalt -->
# An Example Paper

\`\`\`paper-map
{"thesis":"An idea tested against a baseline.","items":[{"number":"01","label":"Idea","text":"The central mechanism.","source":"PDF p. 2"}]}
\`\`\`

## 01 / Main path

\`\`\`paper-path
{"title":"A two-stage method","stages":[{"title":"Prepare","role":"Input","action":"Collect evidence.","why":"The model needs examples.","output":"Examples for training.","source":"PDF p. 3"},{"title":"Test","role":"Output","action":"Compare outcomes.","why":"The claim needs a baseline.","output":"An observed result.","source":"PDF p. 4"}]}
\`\`\`

\`\`\`paper-chart
{"type":"paired","title":"Result","source":"PDF p. 5, Fig. 1","rows":[{"label":"Method","before":40,"after":60}]}
\`\`\`
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<body data-theme="cobalt">/);
    assert.match(html, /Show source locations/);
    assert.match(html, /Whole-paper map/);
    assert.match(html, /Passed to the next stage/);
    assert.match(html, /What this stage leaves behind/);
    assert.match(html, /View chart data/);
    assert.match(html, /Start <strong>40%<\/strong>/);
    assert.match(html, /End <strong>60%<\/strong>/);
    assert.doesNotMatch(html, /paper-reading-lang: en|跳到正文|论文全局图|起点|交给下一阶段/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a visual fact without a source fails instead of publishing an untraceable diagram', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-source-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, '<!-- paper-reading-lang: en -->\n# Paper\n\n```paper-map\n{"items":[{"number":"01","label":"Claim","text":"An unverified claim."}]}\n```\n');
    assert.throws(() => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' }), /A visual fact is missing its source/);
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a reading source must declare a supported output language', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-language-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, '# Unmarked paper\n');
    assert.throws(() => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' }), /Declare the reading language/);
    fs.writeFileSync(source, '<!-- paper-reading-lang: fr -->\n# Unsupported paper\n');
    assert.throws(() => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' }), /Declare the reading language/);
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown visual theme fails before creating an output', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-theme-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, '<!-- paper-reading-lang: en -->\n<!-- paper-reading-theme: neon -->\n# Paper\n');
    assert.throws(() => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' }), /Unknown paper-reading theme: neon/);
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the two English examples embed their diagrams, original figures, and reading context', () => {
  for (const [file, figure, keyText] of [
    ['attention-is-all-you-need', 'Figure 1', 'Figure 1 is particularly useful here'],
    ['deepseek-v4.1-flash', 'Figure 3', 'The original Figure 3'],
  ]) {
    const html = fs.readFileSync(path.resolve(__dirname, `../docs/${file}-deep-read.html`), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /DEEP READING ATLAS · ENGLISH/);
    assert.match(html, /data:image\/svg\+xml;base64,/);
    assert.match(html, /data:image\/png;base64,/);
    assert.ok(html.includes(keyText), `${file} introduces its original figure in prose`);
    assert.ok(html.includes(figure), `${file} labels the original figure`);
    assert.match(html, /class="experiment-atlas"/);
    assert.match(html, /class="display-math"/);
    assert.doesNotMatch(html, /class="katex-error"/);
  }
});

test('the RAFT example keeps its method, equations, evidence, and figures in one Chinese page', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../docs/raft-deep-read.html'), 'utf8');
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /id="section-5">05 \/ 综合/);
  assert.match(html, /class="reading-path"/);
  assert.match(html, /class="experiment-atlas"/);
  assert.match(html, /class="display-math"/);
  assert.equal((html.match(/data:image\/png;base64,/g) || []).length, 3);
  assert.match(html, /原论文 Fig\. 1 是整个框架的鸟瞰/);
  assert.match(html, /原论文 Fig\. 2 回答/);
  assert.match(html, /原论文 Fig\. 3 提供参数层面的旁证/);
  assert.match(html, /<span class="source-ref">本图谱依据 <a href="https:\/\/arxiv\.org\/abs\/2606\.00147v1">arXiv:2606\.00147v1<\/a>/);
  assert.doesNotMatch(html, /class=“source-ref”|class="katex-error"|file:\/\//);
});

test('the new readings keep their language, theme, source images, and experiment path offline', () => {
  for (const [name, lang, theme, images] of [
    ['mechvqa', 'en', 'cobalt', 6],
    ['iar', 'zh-CN', 'plum', 4],
    ['vista', 'zh-CN', 'cobalt', 6],
    ['deepseek-v4.1-flash-zh', 'zh-CN', 'saffron', 5],
  ]) {
    const html = fs.readFileSync(path.resolve(__dirname, `../docs/${name}-deep-read.html`), 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.match(html, new RegExp(`<body data-theme="${theme}">`));
    assert.match(html, /class="experiment-atlas"/);
    assert.match(html, /class="display-math"/);
    assert.equal((html.match(/<figure class="paper-figure">/g) || []).length, images);
    assert.doesNotMatch(html, /class="katex-error"|src="https?:|PAPER_READING_SLOT_/);
  }
});

test('published reading headings do not end with sentence punctuation', () => {
  const names = fs.readdirSync(path.resolve(__dirname, '../docs'))
    .filter(file => file.endsWith('-deep-read.html'))
    .map(file => file.replace(/-deep-read\.html$/, ''));
  assert.ok(names.length >= 7, `expected published readings, found ${names.length}`);
  for (const name of names) {
    const html = fs.readFileSync(path.resolve(__dirname, `../docs/${name}-deep-read.html`), 'utf8');
    for (const [, heading] of html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      const text = heading.replace(/<[^>]+>/g, '').trim();
      assert.doesNotMatch(text, /[.。?？!！:：]$/, `${name}: ${text}`);
    }
  }
});

test('path stages can name a cost, experiment rows a conclusion, and bars charts carry non-percentage values', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-fields-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, `<!-- paper-reading-lang: zh-CN -->
# Test Paper

## 01 / Fields

\`\`\`paper-path
{"title":"A staged method","stages":[{"title":"Prepare","role":"Input","action":"Collect.","why":"Needs evidence.","cost":"Assumes the frames are complete.","output":"Evidence.","source":"PDF p. 3"}]}
\`\`\`

\`\`\`paper-experiments
{"title":"Results","rows":[{"question":"Does it help?","setup":"Same model.","observation":"Score rises.","conclusion":"The harness contributes, not the base model.","source":"PDF p. 5"}]}
\`\`\`

\`\`\`paper-chart
{"type":"bars","title":"Token cost","unit":"M","source":"PDF p. 6","rows":[{"label":"Text grid","value":71.9},{"label":"Image","value":30.7}]}
\`\`\`
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<dt>代价 \/ 假设<\/dt><dd>Assumes the frames are complete\./);
    assert.match(html, /class="experiment-conclusion"><span>结论<\/span>The harness contributes, not the base model\./);
    assert.match(html, /class="bars-chart"/);
    assert.match(html, /bar-fill" style="width:100%"/);
    assert.match(html, /bar-fill" style="width:42\.7%/);
    assert.match(html, /<strong>71\.9M<\/strong>/);
    assert.match(html, /<span>0<\/span><span>71\.9M<\/span>/);
    assert.match(html, /<th>数值M<\/th>/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('bars charts reject negative values and honor domainMax', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-bars-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    fs.writeFileSync(source, `<!-- paper-reading-lang: en -->
# Paper

## 01 / Chart

\`\`\`paper-chart
{"type":"bars","title":"Scores","unit":"%","domainMax":100,"source":"PDF p. 2","rows":[{"label":"A","value":40},{"label":"B","value":80,"approx":true}]}
\`\`\`
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /bar-fill" style="width:40%"/);
    assert.match(html, /bar-fill" style="width:80%"/);
    assert.match(html, /<strong>≈80%<\/strong>/);
    assert.match(html, /<span>0<\/span><span>100%<\/span>/);
    fs.writeFileSync(source, `<!-- paper-reading-lang: en -->
# Paper

## 01 / Chart

\`\`\`paper-chart
{"type":"bars","title":"Scores","source":"PDF p. 2","rows":[{"label":"A","value":-1}]}
\`\`\`
`);
    assert.throws(() => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' }), /Invalid bar value for A/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('charts reject missing or coerced numbers instead of drawing zeros', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-strict-num-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    const render = body => {
      fs.writeFileSync(source, `<!-- paper-reading-lang: en -->
# Paper

## 01 / Chart

${body}
`);
      return () => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' });
    };
    const chart = rows => `\`\`\`paper-chart
{"type":"bars","title":"T","source":"PDF p. 1","rows":${rows}}
\`\`\`
`;
    assert.throws(render(chart('[{"label":"A"}]')), /Invalid bar value for A/);
    assert.throws(render(chart('[{"label":"A","value":null}]')), /Invalid bar value for A/);
    assert.throws(render(chart('[{"label":"A","value":""}]')), /Invalid bar value for A/);
    assert.throws(render(chart('[{"label":"A","value":"7"}]')), /Invalid bar value for A/);
    assert.throws(render(chart('[]')), /paper-chart needs rows/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"bars","title":"T","domainMax":10,"source":"PDF p. 1","rows":[{"label":"A","value":11}]}
\`\`\`
`), /domainMax 10 is smaller than row values/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"bars","title":"T","domainMax":-5,"source":"PDF p. 1","rows":[{"label":"A","value":1}]}
\`\`\`
`), /Invalid domainMax/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"bars","title":"T","domainMax":null,"source":"PDF p. 1","rows":[{"label":"A","value":1}]}
\`\`\`
`), /Invalid domainMax/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"paired","title":"T","source":"PDF p. 1","rows":[{"label":"A","before":null,"after":50}]}
\`\`\`
`), /Invalid before for A/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"paired","title":"T","source":"PDF p. 1","rows":[{"label":"A","before":10,"after":120}]}
\`\`\`
`), /Invalid after for A/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"paired","title":"T","source":"PDF p. 1","rows":[]}
\`\`\`
`), /paper-chart needs rows/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"segments","title":"T","source":"PDF p. 1","rows":[{"label":"A","value":null},{"label":"B","value":100}]}
\`\`\`
`), /Invalid segment value for A/);
    assert.throws(render(`\`\`\`paper-chart
{"type":"segments","title":"T","source":"PDF p. 1","rows":[]}
\`\`\`
`), /paper-chart needs rows/);
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the renderer accepts audit sources and assets outside the repository', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-external-'));
  try {
    const assets = path.join(dir, 'assets');
    fs.mkdirSync(assets);
    fs.writeFileSync(path.join(assets, 'figure.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl7ZQAAAABJRU5ErkJggg==', 'base64'));
    const source = path.join(dir, 'external-paper.md');
    const output = path.join(dir, 'out', 'external-paper.html');
    fs.mkdirSync(path.dirname(output));
    fs.writeFileSync(source, `<!-- paper-reading-lang: zh-CN -->
# 外部项目阅读

## 01 / 起点

正文与配图共置在用户项目目录中。

![外部配图](assets/figure.png)

*本文配图，位于源文件旁的 assets/。*
`);
    execFileSync(process.execPath, [renderer, source, output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, /data:image\/png;base64,/);
    assert.match(html, /class="paper-figure"/);
    assert.doesNotMatch(html, /src="assets\/|file:\/\//);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('visual blocks reject missing required text fields instead of rendering undefined', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-required-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    const render = body => {
      fs.writeFileSync(source, `<!-- paper-reading-lang: en -->
# Paper

## 01 / Block

${body}
`);
      return () => execFileSync(process.execPath, [renderer, source, output], { stdio: 'pipe' });
    };
    assert.throws(render('```paper-map\n{"items":[{"source":"PDF p. 1"}]}\n```\n'), /paper-map item row 1 is missing "number"/);
    assert.throws(render('```paper-path\n{"title":"T","stages":[{"source":"PDF §3"}]}\n```\n'), /paper-path stage row 1 is missing "title"/);
    assert.throws(render('```paper-path\n{"stages":[{"title":"T","role":"R","action":"A","why":"W","output":"O","source":"PDF p. 1"}]}\n```\n'), /paper-path is missing "title"/);
    assert.throws(render('```paper-contrast\n{"title":"T","intro":"I","branches":[{"source":"PDF p. 1"},{"source":"PDF p. 2"}]}\n```\n'), /paper-contrast branch row 1 is missing "name"/);
    assert.throws(render('```paper-contrast\n{"title":"T","branches":[{"name":"A","lead":"L","scope":"S","judge":"J","signal":"G","why":"Y","source":"PDF p. 1"},{"name":"B","lead":"L","scope":"S","judge":"J","signal":"G","why":"Y","source":"PDF p. 2"}]}\n```\n'), /paper-contrast is missing "intro"/);
    assert.throws(render('```paper-experiments\n{"title":"T","rows":[{"source":"PDF p. 1"}]}\n```\n'), /paper-experiments row 1 is missing "question"/);
    assert.throws(render('```paper-chart\n{"type":"bars","title":"T","rows":[{"label":"","value":1}],"source":"PDF p. 1"}\n```\n'), /paper-chart row 1 is missing "label"/);
    assert.throws(render('```paper-chart\n{"type":"bars","rows":[{"label":"A","value":1}],"source":"PDF p. 1"}\n```\n'), /paper-chart is missing "title"/);
    const missingSource = render('```paper-path\n{"title":"T","stages":[{"title":"T","role":"R","action":"A","why":"W","output":"O"}]}\n```\n');
    assert.throws(missingSource, /A visual fact is missing its source/);
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('paper-contrast labels describe mechanism rather than learning', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-reading-label-test-'));
  try {
    const source = path.join(dir, 'paper.md');
    const output = path.join(dir, 'paper.html');
    const contrast = (lang, theme) => `<!-- paper-reading-lang: ${lang} -->
<!-- paper-reading-theme: ${theme} -->
# Paper

## 01 / Contrast

\`\`\`paper-contrast
{"title":"Two routes","intro":"A neutral comparison.","branches":[{"name":"A","lead":"L","scope":"S","judge":"J","signal":"M","why":"Y","source":"PDF p. 1"},{"name":"B","lead":"L","scope":"S","judge":"J","signal":"M","why":"Y","source":"PDF p. 2"}]}
\`\`\`
`;
    fs.writeFileSync(source, contrast('zh-CN', 'forest'));
    execFileSync(process.execPath, [renderer, source, output]);
    let html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<dt>作用机制<\/dt><dd>M<\/dd>/);
    assert.doesNotMatch(html, /如何进入学习/);
    fs.writeFileSync(source, contrast('en', 'forest'));
    execFileSync(process.execPath, [renderer, source, output]);
    html = fs.readFileSync(output, 'utf8');
    assert.match(html, /<dt>How it works<\/dt><dd>M<\/dd>/);
    assert.doesNotMatch(html, /How it shapes learning/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
