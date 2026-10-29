// readings.json is the single source of truth for the published readings.
// This script regenerates the capped reading list inside README.md and
// README.zh-CN.md between the readings-index markers, and validates every
// entry against examples/ and docs/. The full gallery lives on the homepage,
// which scripts/build-docs.cjs renders from the same JSON.
const fs = require('node:fs');
const path = require('node:path');
const { parseReadingHeader } = require('./lib/reading-markdown.cjs');

const root = path.resolve(__dirname, '..');
const site = 'https://xiaofengshi.github.io/paper-reading-skill/';
const CAP = 6;
const START = '<!-- readings-index:start -->';
const END = '<!-- readings-index:end -->';

function load() {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'readings.json'), 'utf8'));
  if (!Array.isArray(data.readings) || data.readings.length === 0) throw new Error('readings.json needs a non-empty readings array');
  const seen = new Set();
  for (const r of data.readings) {
    for (const key of ['slug', 'title', 'lang', 'date', 'summaryEn', 'summaryZh']) {
      if (!r[key] || typeof r[key] !== 'string') throw new Error(`reading ${r.slug || '(missing slug)'} lacks ${key}`);
    }
    if (!/^(en|zh-CN)$/.test(r.lang)) throw new Error(`${r.slug}: lang must be en or zh-CN`);
    if (!['brief', 'deep'].includes(r.mode)) throw new Error(`${r.slug}: mode must be brief or deep`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) throw new Error(`${r.slug}: date must be YYYY-MM-DD`);
    if (seen.has(r.slug)) throw new Error(`${r.slug}: duplicate slug`);
    seen.add(r.slug);
    const source = path.join(root, 'examples', `${r.slug}-deep-read.md`);
    if (!fs.existsSync(source)) throw new Error(`${r.slug}: examples/${r.slug}-deep-read.md is missing`);
    const header = parseReadingHeader(fs.readFileSync(source, 'utf8'));
    if (header.lang !== r.lang) throw new Error(`${r.slug}: lang marker in examples/ is ${header.lang}, readings.json says ${r.lang}`);
    if (header.mode !== r.mode) throw new Error(`${r.slug}: mode marker in examples/ is ${header.mode}, readings.json says ${r.mode}`);
    if (!fs.existsSync(path.join(root, 'docs', `${r.slug}-deep-read.html`))) throw new Error(`${r.slug}: docs/${r.slug}-deep-read.html is missing`);
  }
  return data.readings;
}

// Pinned entries keep their JSON order; the remaining slots go to the most
// recent entries so the README list stays capped as readings accumulate.
function selected(readings) {
  const pinned = readings.filter(r => r.pinned);
  const rest = readings.filter(r => !r.pinned).slice().reverse();
  return [...pinned, ...rest].slice(0, CAP);
}

function bulletEn(r) {
  const meta = r.tool ? ` · ${r.tool}` : '';
  const arxiv = r.arxiv ? ` Based on [arXiv:${r.arxiv}](https://arxiv.org/abs/${r.arxiv}).` : '';
  return `- **${r.title}** · ${r.lang === 'en' ? 'English' : '中文'} · ${r.mode === 'deep' ? 'Deep Reading' : 'Brief Reading'}${meta} — ${r.summaryEn}${arxiv} [Open the reading →](${site}${r.slug}-deep-read.html)`;
}
function bulletZh(r) {
  const meta = r.tool ? ` · ${r.tool}` : '';
  const arxiv = r.arxiv ? ` 依据 [arXiv:${r.arxiv}](https://arxiv.org/abs/${r.arxiv})。` : '';
  return `- **${r.title}** · ${r.lang === 'en' ? 'English' : '中文'} · ${r.mode === 'deep' ? 'Deep Reading' : 'Brief Reading'}${meta} — ${r.summaryZh}${arxiv}[打开阅读文档 →](${site}${r.slug}-deep-read.html)`;
}

function block(readings, lang) {
  const pick = selected(readings);
  const bullets = pick.map(lang === 'en' ? bulletEn : bulletZh).join('\n');
  const total = readings.length;
  if (lang === 'en') {
    return [START, bullets, '', `There are **${total}** published readings so far — [browse the full gallery →](${site}#readings)`, END].join('\n');
  }
  return [START, bullets, '', `目前已发布 **${total}** 篇阅读文档——[浏览完整画廊 →](${site}zh.html#readings)`, END].join('\n');
}

function rewrite(file, blockText) {
  const p = path.join(root, file);
  const source = fs.readFileSync(p, 'utf8');
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (start === -1 || end === -1 || end < start) throw new Error(`${file} is missing the readings-index markers`);
  if (source.indexOf(START, start + 1) !== -1) throw new Error(`${file} has duplicate readings-index markers`);
  const updated = source.slice(0, start) + blockText + source.slice(end + END.length);
  if (process.argv.includes('--check')) {
    if (source !== updated) throw new Error(`${file} readings index is stale; run npm run build:readings`);
  } else {
    fs.writeFileSync(p, updated);
  }
}

const readings = load();
rewrite('README.md', block(readings, 'en'));
rewrite('README.zh-CN.md', block(readings, 'zh'));
if (!process.argv.includes('--check')) console.log(`readings index regenerated: ${readings.length} readings, README shows ${selected(readings).length}`);
