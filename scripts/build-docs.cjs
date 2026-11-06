// Each README is the audit source for its corresponding static homepage.
const fs = require('node:fs');
const path = require('node:path');
async function main() {
const { marked } = await import('marked');

const root = path.resolve(__dirname, '..');
const { button, buttonLink } = require('./build-site-assets.cjs')(root, process.argv.includes('--check'));
const site = 'https://xiaofengshi.github.io/paper-reading-skill/';
const repo = 'https://github.com/xiaofengShi/paper-reading-skill';
const sourceBase = `${repo}/blob/main/`;
const readings = JSON.parse(fs.readFileSync(path.join(root, 'readings.json'), 'utf8')).readings;
const pages = [
  { source: 'README.md', output: 'index.html', lang: 'en', other: 'zh.html', otherLabel: '中文', nav: 'Navigation', skip: 'Skip to content', eyebrow: 'AN AGENT SKILL FOR BRIEF & DEEP PAPER READING', example: 'Brief example (English) →', deepExample: 'Deep example (中文) →', install: 'Try it with your paper ↓', footer: 'Read deeply. Keep the evidence close.' },
  { source: 'README.zh-CN.md', output: 'zh.html', lang: 'zh-CN', other: './', otherLabel: 'English', nav: '主导航', skip: '跳到正文', eyebrow: '面向论文导读与深读的 AGENT SKILL', example: 'Brief 导读样例 →', deepExample: 'Deep 深读样例 →', install: '用你自己的论文试试 ↓', footer: '读懂全文，证据就在身边。' },
];

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const rewriteLinks = html => html.replace(/\b(href|src)="([^"]+)"/g, (_, attr, target) => {
  if (target.startsWith('#')) {
    const label = decodeURIComponent(target.slice(1));
    return `${attr}="#${esc(sectionIds[label] || label)}"`;
  }
  if (target.startsWith(site)) return `${attr}="${esc(target.slice(site.length) || './')}"`;
  if (/^(https?:|mailto:|#|data:)/.test(target)) return `${attr}="${target}"`;
  if (target === 'README.md') return `${attr}="./"`;
  if (target === 'README.zh-CN.md') return `${attr}="zh.html"`;
  if (target.startsWith('docs/')) return `${attr}="${esc(target.slice(5))}"`;
  return `${attr}="${sourceBase}${esc(target)}"`;
});

const sectionIds = {
  'Start with one paper': 'start', '从一篇论文开始': 'start',
  'Explore complete readings': 'readings', '阅读完整样例': 'readings',
  'What you get': 'deliverables', '你会得到什么': 'deliverables',
  'The reading method': 'method', '论文阅读方法': 'method',
  'Get started': 'get-started', '开始使用': 'get-started',
  'How it works': 'how-it-works', '工作方式': 'how-it-works',
  'Validation and scope': 'quality', '验证与适用范围': 'quality',
  'Maintainer notes': 'maintainers', '维护说明': 'maintainers',
};
function copyBlocks(html, page) {
  const label = page.lang === 'en' ? 'Copy' : '复制';
  return html.replace(/<pre>([\s\S]*?)<\/pre>/g, (_, code) => `<div class="copy-block">${button(label, { className: 'copy-code', hidden: true })}<pre>${code}</pre><span class="copy-status" role="status"></span></div>`);
}
// The README keeps only a capped index between the readings-index markers;
// the homepage renders the complete gallery from readings.json instead.
function readingsSectionTokens(section) {
  const kept = [];
  let skipping = false;
  for (const token of section) {
    const text = token.text || '';
    if (token.type === 'html' && text.includes('readings-index:start')) { skipping = true; continue; }
    if (token.type === 'html' && text.includes('readings-index:end')) { skipping = false; continue; }
    if (!skipping) kept.push(token);
  }
  return kept;
}
const TAG_ORDER = ['Agent', 'RL', 'Post-training', 'World-Model', 'Multimodal', 'RAG', 'Eval', 'Architecture', 'Survey', 'Claude'];
function readingsGallery(page) {
  const zh = page.lang === 'zh-CN';
  const enriched = readings.slice().reverse().map(r => ({ ...r, tags: Array.isArray(r.tags) ? r.tags : [] }));
  const groups = new Map();
  for (const r of enriched) {
    const key = r.tags[0] || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const order = [...TAG_ORDER.filter(t => groups.has(t)), ...[...groups.keys()].filter(t => !TAG_ORDER.includes(t) && t !== 'Other').sort()];
  if (groups.has('Other')) order.push('Other');
  const items = [];
  for (const key of order) {
    const members = groups.get(key);
    items.push(`<li class="gallery-group" data-group="${esc(key)}"><h3>${esc(key)}</h3><span>${members.length}</span></li>`);
    for (const r of members) {
      const langLabel = r.lang === 'en' ? 'English' : '中文';
      const tool = r.tool ? ` · ${esc(r.tool)}` : '';
      const arxiv = r.arxiv ? ` <a href="https://arxiv.org/abs/${esc(r.arxiv)}">arXiv:${esc(r.arxiv)}</a>.` : '';
      const source = !r.arxiv && r.url ? ` <a href="${esc(r.url)}">${zh ? '原文' : 'Source'}</a>.` : '';
      const summary = zh ? r.summaryZh : r.summaryEn;
      const open = zh ? '打开阅读文档 →' : 'Open the reading →';
      if (!['brief', 'deep'].includes(r.mode)) throw new Error(`${r.slug}: mode must be brief or deep`);
      const modeLabel = r.mode === 'deep' ? 'Deep Reading' : 'Brief Reading';
      const badges = r.tags.map(tag => `<code>${esc(tag)}</code>`).join(' ');
    const details = page.lang === 'en' ? 'About this reading' : '查看阅读简介';
      items.push(`<li data-reading-lang="${r.lang}" data-reading-mode="${r.mode}" data-primary-tag="${esc(key)}" data-tags="${esc(r.tags.join(' '))}"><div class="reading-meta"><span>${langLabel}</span><span class="mode-${r.mode}">${modeLabel}</span>${badges}</div><strong><a href="${esc(r.slug)}-deep-read.html">${esc(r.title)}</a></strong><details><summary>${details}</summary><p>${esc(summary)}${arxiv}${source}${tool}</p></details><a class="reading-open" href="${esc(r.slug)}-deep-read.html">${open}</a></li>`);
    }
  }
  return `<ul id="reading-list">\n${items.join('\n')}\n</ul>`;
}
for (const page of pages) {
  const tokens = marked.lexer(fs.readFileSync(path.join(root, page.source), 'utf8'));
  const title = tokens.shift();
  if (title?.type !== 'html' || !/<h1 align="center">Paper Reading Skill<\/h1>/.test(title.text)) throw new Error(`${page.source} needs one centered H1`);
  const intro = title.text.match(/<p align="center"><strong>([^<]+)<\/strong>\s*([^<]+)<\/p>/);
  if (!intro) throw new Error(`${page.source} needs a centered lead sentence`);

  const hero = [];
  const sections = [];
  let current = hero;
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 2) {
      current = [token];
      sections.push(current);
    } else {
      current.push(token);
    }
  }
  if (sections.length < 5) throw new Error(`${page.source} is missing homepage sections`);

  const preview = hero.find(token => token.type === 'paragraph' && token.text.startsWith('!['));
  if (!preview) throw new Error(`${page.source} needs a preview image`);
  const headline = intro[1].replace(/[.!?。！？]+$/, '');
  const lead = intro[2].trim();
  const summary = `${intro[1]} ${lead}`;
  const description = summary.length > 190 ? `${summary.slice(0, 187)}…` : summary;
  const url = page.lang === 'en' ? site : `${site}zh.html`;
  const sectionList = sections.map((section, index) => ({ section, id: sectionIds[section[0].text] || `section-${index + 1}` }));
  const nav = ['readings', 'start', 'quality'].map(id => {
    const entry = sectionList.find(item => item.id === id);
    if (!entry) throw new Error(`${page.source} needs ${id}`);
    const labels = page.lang === 'en' ? { readings: 'Readings', start: 'Get started', quality: 'Quality' } : { readings: '阅读样例', start: '开始使用', quality: '质量与范围' };
    return `<a href="#${id}">${labels[id]}</a>`;
  }).join('');
  const content = sectionList.map(({section, id}) => {
    const tokens = id === 'readings' ? readingsSectionTokens(section) : section;
    let body = copyBlocks(rewriteLinks(marked.parser(tokens)), page);
    if (id === 'start') {
      const label = page.lang === 'en' ? 'Brief and Deep Reading comparison' : 'Brief 与 Deep Reading 模式对照';
      body = body.replace(/<table>[\s\S]*?<\/table>/g, table => `<div class="mode-comparison" role="region" aria-label="${label}" tabindex="0">${table}</div>`);
    }
    if (id === 'quality') {
      const label = page.lang === 'en' ? 'Validation checks and boundaries' : '验证方式与结论边界';
      body = body.replace(/<table>[\s\S]*?<\/table>/g, table => `<div class="mode-comparison" role="region" aria-label="${label}" tabindex="0">${table}</div>`);
    }
    if (id === 'readings') {
      body = body.replace('</h2>', ` <span class="section-count">${readings.length}</span></h2>`);
      body = `${body}\n${readingsGallery(page)}`;
      const labels = page.lang === 'en' ? ['Reading language', 'All', 'English', '中文'] : ['阅读文档语言', '全部', 'English', '中文'];
      const tagLabels = page.lang === 'en' ? ['Topic', 'All'] : ['主题', '全部'];
      const tagPool = TAG_ORDER.filter(t => readings.some(r => Array.isArray(r.tags) && r.tags.includes(t)));
      const langRow = `<div class="gallery-filter-row" role="group" aria-label="${labels[0]}" data-filter-scope="lang"><span class="gallery-filter-label" aria-hidden="true">${labels[0]}</span>${['all', 'en', 'zh-CN'].map((value, index) => button(labels[index+1], { 'data-filter-kind': 'lang', 'data-filter': value, 'aria-pressed': index === 0 })).join('')}</div>`;
      const tagRow = `<div class="gallery-filter-row" role="group" aria-label="${tagLabels[0]}" data-filter-scope="tag"><span class="gallery-filter-label" aria-hidden="true">${tagLabels[0]}</span>${button(tagLabels[1], { 'data-filter-kind': 'tag', 'data-filter': 'all', 'aria-pressed': true })}${tagPool.map(t => button(t, { 'data-filter-kind': 'tag', 'data-filter': t, 'aria-pressed': false })).join('')}</div>`;
      const en = page.lang === 'en';
      const depthLabel = en ? 'Reading depth' : '阅读深度';
      const modeRow = `<div class="gallery-filter-row" role="group" aria-label="${depthLabel}" data-filter-scope="mode"><span class="gallery-filter-label" aria-hidden="true">${depthLabel}</span>${['all', 'brief', 'deep'].map((value, index) => button([en ? 'All' : '全部', 'Brief', 'Deep'][index], { 'data-filter-kind': 'mode', 'data-filter': value, 'aria-pressed': index === 0 })).join('')}</div>`;
      const controls = `<div class="gallery-controls" hidden><label class="gallery-search">${en ? 'Find a reading' : '查找阅读文档'}<input type="search" aria-controls="reading-list" placeholder="${en ? 'Search title, topic, or arXiv ID' : '搜索标题、主题或 arXiv 编号'}"></label>${button(en ? 'Reset filters' : '重置筛选', { className: 'gallery-reset' })}<fieldset class="gallery-filter"><legend class="visually-hidden">${en ? 'Filter readings' : '筛选阅读文档'}</legend>${langRow}${modeRow}${tagRow}</fieldset><span class="gallery-status" role="status" aria-atomic="true"></span></div>`;
      body = body.replace('<ul id="reading-list">', `${controls}<ul id="reading-list">`);
      body += `<p class="gallery-empty" hidden>${en ? 'No readings found. Change your search or reset the filters above.' : '没有找到匹配的阅读文档。请更换关键词，或使用上方的“重置筛选”。'}</p><nav class="gallery-pagination" aria-label="${en ? 'Reading pages' : '阅读列表分页'}" hidden>${button(en ? '← Previous' : '← 上一页', { 'data-page': 'previous', 'aria-controls': 'reading-list' })}<span class="gallery-page"></span>${button(en ? 'Next →' : '下一页 →', { 'data-page': 'next', 'aria-controls': 'reading-list' })}</nav>`;
    }
    return `<section class="content-section ${id}" id="${id}">\n${body}\n</section>`;
  }).join('\n');
  const html = `<!doctype html>
<html lang="${page.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${site}">
  <link rel="alternate" hreflang="zh-CN" href="${site}zh.html">
  <link rel="alternate" hreflang="x-default" href="${site}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Paper Reading Skill">
  <meta property="og:title" content="Paper Reading Skill">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}assets/atlas-preview.png">
  <meta property="og:locale" content="${page.lang === 'en' ? 'en_US' : 'zh_CN'}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"SoftwareSourceCode",name:"Paper Reading Skill",codeRepository:repo,license:`${repo}/blob/main/LICENSE`,programmingLanguage:"JavaScript",description})}</script>
  <title>Paper Reading Skill — ${page.lang === 'en' ? 'Brief &amp; Deep Reading for research papers' : '论文导读与深读'}</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
  <script src="site.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${page.skip}</a>
  <header class="site-header">
    <a class="brand" href="${page.lang === 'en' ? './' : 'zh.html'}" aria-label="Paper Reading Skill"><img src="assets/logo.svg" alt="" width="35" height="35"><span>Paper Reading</span></a>
    <nav aria-label="${page.nav}">${nav}<a class="nav-repo" href="${repo}">GitHub ↗</a><a class="lang" href="${page.other}" hreflang="${page.lang === 'en' ? 'zh-CN' : 'en'}">${page.otherLabel}</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy"><p class="eyebrow">${page.eyebrow}</p><h1 id="page-title">${esc(headline)}</h1>${marked.parse(lead)}<div class="hero-actions">${buttonLink(page.lang === 'en' ? 'Explore the readings →' : '浏览阅读样例 →', '#readings', true)}${buttonLink(page.lang === 'en' ? 'Use with your paper' : '用自己的论文试试', '#start')}</div><p class="works-with">Codex · Claude Code · Kimi Code <span>MIT · ${page.lang === 'en' ? 'Open source · No separate API key' : '开源 · 无需额外 API Key'}</span></p><div class="hero-examples"><a href="${page.lang === 'en' ? 'resnet-deep-read.html' : 'lora-deep-read.html'}">${page.lang === 'en' ? 'ResNet →' : 'LoRA →'}<span>Brief · ${page.lang === 'en' ? 'English' : '中文'}</span></a><a href="rollback-deep-read.html">Rollback →<span>Deep · 中文</span></a></div></div>
      <figure class="hero-visual"><div class="preview-toolbar"><span>${page.lang === 'en' ? 'Inside a reading' : '阅读文档预览'}</span><span>MiMo-V2.6 · 中文</span></div>${rewriteLinks(marked.parser([preview]))}<figcaption>${page.lang === 'en' ? 'One connected view of the question, mechanism, and evidence.' : '把研究问题、方法机制与实验证据连接起来。'}</figcaption></figure>
    </section>
    <dl class="site-facts" aria-label="${page.lang === 'en' ? 'At a glance' : '项目概览'}"><div><dt>${readings.length}</dt><dd>${page.lang === 'en' ? 'Published readings' : '篇已发布阅读文档'}</dd></div><div><dt>Brief / Deep</dt><dd>${page.lang === 'en' ? 'Choose your reading depth' : '按需选择阅读深度'}</dd></div><div><dt>HTML + Markdown</dt><dd>${page.lang === 'en' ? 'Read offline, check the sources' : '离线阅读，保留可核查的来源'}</dd></div></dl>
    <div class="content-wrap">${content}</div>
  </main>
  <footer class="site-footer"><span>${page.footer} · <a href="${sourceBase}LICENSE">MIT</a></span><span><a href="${repo}">GitHub</a> · <a href="${repo}/issues">Issues</a> · <a href="${page.other}" hreflang="${page.lang === 'en' ? 'zh-CN' : 'en'}">${page.otherLabel}</a></span></footer>
</body>
</html>
`;
  const output = path.join(root, 'docs', page.output);
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(output, 'utf8') !== html) throw new Error(`${page.output} is stale; run npm run build:docs`);
  } else {
    fs.writeFileSync(output, html);
  }
}
// Static discovery metadata follows the actual generated gallery; no invented
// modification dates or traffic trackers are added.
const pageNames = ['index.html', 'zh.html', ...fs.readdirSync(path.join(root, 'docs')).filter(file => file.endsWith('-deep-read.html')).sort()];
const discovery = {
  'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + pageNames.map(file => `  <url><loc>${site}${file === 'index.html' ? '' : file}</loc></url>`).join('\n') + '\n</urlset>\n',
};
for (const [file, content] of Object.entries(discovery)) {
  const output = path.join(root, 'docs', file);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== content) throw new Error(`${file} is stale; run npm run build:docs`);
  } else fs.writeFileSync(output, content);
}

}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
