const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const docs = path.resolve(__dirname, '../docs');

test('the published homepages expose both languages, six complete readings, and working local links', () => {
  for (const [file, lang, switchTarget, phrase, method, install] of [
    ['index.html', 'en', 'zh.html', 'Explore complete readings', 'The reading method', 'Get started'],
    ['zh.html', 'zh-CN', './', '阅读完整样例', '论文阅读方法', '开始使用'],
  ]) {
    const html = fs.readFileSync(path.join(docs, file), 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.ok(html.includes(phrase));
    assert.ok(html.includes(`<h2>${method}</h2>`));
    assert.ok(html.includes(`<h2>${install}</h2>`));
    assert.ok(html.includes(`href="#section-3">${method}</a>`));
    assert.ok(html.includes(`href="#section-4">${install}</a>`));
    assert.ok(html.includes(`href="${switchTarget}"`));
    assert.ok(html.includes('href="#section-1"'));
    for (const name of ['mimo-v2.6', 'attention-is-all-you-need', 'deepseek-v4.1-flash', 'raft', 'mechvqa', 'iar']) {
      assert.ok(html.includes(`${name}-deep-read.html`), `${file} is missing ${name}`);
    }
    assert.ok(html.includes('src="assets/logo.svg"'));
    assert.ok(html.includes('href="#section-4"'));
    assert.doesNotMatch(html, /<li><strong>[^<]*[.。]<\/strong>/);
    for (const [, heading] of html.matchAll(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g)) {
      assert.doesNotMatch(heading.trim(), /[.。?？!！:：]$/);
    }
    assert.ok(html.includes('href="https://github.com/xiaofengShi/paper-reading-skill"'));
    for (const resource of ['reading-quality.md', 'reader-tasks.md']) {
      assert.ok(html.includes(`href="https://github.com/xiaofengShi/paper-reading-skill/blob/main/evals/${resource}"`));
    }
    assert.ok(html.includes('skills add xiaofengShi/paper-reading-skill --skill paper-reading --agent codex --copy --yes'));
    assert.ok(html.includes('rel="canonical"'));
    assert.ok(html.includes('hreflang="zh-CN"'));
    assert.ok(html.includes('hreflang="en"'));
    assert.doesNotMatch(html, /(?:href|src)="docs\//);
    for (const [, target] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      if (/^(?:https?:|mailto:)/.test(target) || target === './') continue;
      assert.ok(fs.existsSync(path.join(docs, target)), `${file} points to missing ${target}`);
    }
    for (const [, anchor] of html.matchAll(/href="#(section-\d+)"/g)) {
      assert.ok(html.includes(`id="${anchor}"`), `${file} is missing ${anchor}`);
    }
  }
  assert.ok(fs.existsSync(path.join(docs, 'assets/atlas-preview.png')));
  assert.ok(fs.existsSync(path.join(docs, 'assets/logo.svg')));
});

test('the published reader audit links its quality resources to GitHub', () => {
  const html = fs.readFileSync(path.join(docs, 'reader-audit.html'), 'utf8');
  for (const resource of ['reading-quality.md', 'reader-tasks.md']) {
    assert.ok(html.includes(`href="https://github.com/xiaofengShi/paper-reading-skill/blob/main/evals/${resource}"`));
  }
});

test('editorial maps explain paper relationships without depicting dead chapter controls', () => {
  for (const file of [
    path.join(docs, 'assets/atlas-preview.svg'),
    path.resolve(docs, '../examples/assets/attention-atlas.svg'),
    path.resolve(docs, '../examples/assets/deepseek-atlas.svg'),
  ]) {
    const svg = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(svg, /READING PATH|0[1-7]\s+(?:Whole|The whole|RL learning|GRS|Runtime|MOPD2|Experiments|CED|CSA2|Replay|Training|Evaluation)/);
    assert.match(svg, /PAPER QUESTION|SYSTEM QUESTION/);
  }
  for (const file of ['attention-is-all-you-need-deep-read.html', 'deepseek-v4.1-flash-deep-read.html']) {
    const html = fs.readFileSync(path.join(docs, file), 'utf8');
    assert.match(html, /<nav class="toc"/);
    assert.match(html, /href="#section-1"/);
  }
});
