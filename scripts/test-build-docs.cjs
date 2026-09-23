const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const docs = path.resolve(__dirname, '../docs');

test('the published homepages expose both languages, the example, and working local links', () => {
  for (const [file, lang, switchTarget, phrase] of [
    ['index.html', 'en', 'zh.html', 'See a complete reading'],
    ['zh.html', 'zh-CN', './', '看一份完整深读'],
  ]) {
    const html = fs.readFileSync(path.join(docs, file), 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.ok(html.includes(phrase));
    assert.ok(html.includes(`href="${switchTarget}"`));
    assert.ok(html.includes('href="mimo-v2.6-deep-read.html"'));
    assert.ok(html.includes('href="https://github.com/xiaofengShi/paper-reading-skill"'));
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
});
