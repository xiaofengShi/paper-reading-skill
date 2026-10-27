// Each README is the audit source for its corresponding static homepage.
const fs = require('node:fs');
const path = require('node:path');
async function main() {
const { marked } = await import('marked');

const root = path.resolve(__dirname, '..');
const site = 'https://xiaofengshi.github.io/paper-reading-skill/';
const repo = 'https://github.com/xiaofengShi/paper-reading-skill';
const sourceBase = `${repo}/blob/main/`;
const readings = JSON.parse(fs.readFileSync(path.join(root, 'readings.json'), 'utf8')).readings;
const pages = [
  { source: 'README.md', output: 'index.html', lang: 'en', other: 'zh.html', otherLabel: '中文', nav: 'Navigation', skip: 'Skip to content', eyebrow: 'AN AGENT SKILL FOR DEEP PAPER READING', example: 'Open a complete reading →', install: 'Try it with your paper ↓', footer: 'Read deeply. Keep the evidence close.' },
  { source: 'README.zh-CN.md', output: 'zh.html', lang: 'zh-CN', other: './', otherLabel: 'English', nav: '主导航', skip: '跳到正文', eyebrow: '面向深度论文阅读的 AGENT SKILL', example: '打开一份完整深读 →', install: '用你自己的论文试试 ↓', footer: '读懂全文，证据就在身边。' },
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
  return html.replace(/<pre>([\s\S]*?)<\/pre>/g, (_, code) => `<div class="copy-block"><button type="button" class="copy-code" hidden>${label}</button><pre>${code}</pre><span class="copy-status" role="status"></span></div>`);
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
function readingsGallery(page) {
  const items = readings.slice().reverse().map(r => {
    const langLabel = r.lang === 'en' ? 'English' : '中文';
    const tool = r.tool ? ` · ${esc(r.tool)}` : '';
    const arxiv = r.arxiv ? ` <a href="https://arxiv.org/abs/${esc(r.arxiv)}">arXiv:${esc(r.arxiv)}</a>.` : '';
    const summary = page.lang === 'en' ? r.summaryEn : r.summaryZh;
    const open = page.lang === 'en' ? 'Open the complete reading →' : '打开完整深读 →';
    return `<li data-reading-lang="${r.lang}"><strong>${esc(r.title)}</strong> · ${langLabel}${tool} — ${esc(summary)}${arxiv} <a href="${esc(r.slug)}-deep-read.html">${open}</a></li>`;
  });
  return `<ul>\n${items.join('\n')}\n</ul>`;
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
  const nav = ['start', 'readings', 'quality'].map(id => {
    const entry = sectionList.find(item => item.id === id);
    if (!entry) throw new Error(`${page.source} needs ${id}`);
    return `<a href="#${id}">${esc(entry.section[0].text)}</a>`;
  }).join('');
  const content = sectionList.map(({section, id}) => {
    const tokens = id === 'readings' ? readingsSectionTokens(section) : section;
    let body = copyBlocks(rewriteLinks(marked.parser(tokens)), page);
    if (id === 'readings') {
      body = `${body}\n${readingsGallery(page)}`;
      const labels = page.lang === 'en' ? ['Reading language', 'All', 'English', '中文'] : ['深读文档语言', '全部', 'English', '中文'];
      const filter = `<fieldset class="gallery-filter" hidden><legend>${labels[0]}</legend>${['all', 'en', 'zh-CN'].map((value, index) => `<button type="button" data-filter="${value}" aria-pressed="${index === 0}">${labels[index+1]}</button>`).join('')}<span class="gallery-status" role="status" aria-atomic="true"></span></fieldset>`;
      body = body.replace('</h2>', `</h2>${filter}`);
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
  <title>Paper Reading Skill — ${page.lang === 'en' ? 'Visual deep reads for research papers' : '把论文读成可视化深读文档'}</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
  <script src="site.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${page.skip}</a>
  <header class="site-header">
    <a class="brand" href="./" aria-label="Paper Reading Skill"><img src="assets/logo.svg" alt="" width="35" height="35"><span>Paper Reading</span></a>
    <nav aria-label="${page.nav}">${nav}<a class="nav-repo" href="${repo}">GitHub ↗</a><a class="lang" href="${page.other}" hreflang="${page.lang === 'en' ? 'zh-CN' : 'en'}">${page.otherLabel}</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy"><p class="eyebrow">${page.eyebrow}</p><h1 id="page-title">${esc(headline)}</h1>${marked.parse(lead)}<div class="hero-actions"><a class="button primary" href="${page.lang === 'en' ? 'resnet-deep-read.html' : 'lora-deep-read.html'}">${page.example}</a><a class="button secondary" href="#start">${page.install}</a></div><p class="works-with">Codex · Claude Code · Kimi Code <span> / MIT · ${page.lang === 'en' ? 'Open source' : '开源'}</span></p></div>
      <figure class="hero-visual">${rewriteLinks(marked.parser([preview]))}<figcaption>${page.lang === 'en' ? 'Editorial preview of the MiMo-V2.6 reading (Chinese); English examples are below.' : 'MiMo-V2.6 中文深读文档的编辑式预览；下方还有英文样例。'}</figcaption></figure>
    </section>
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
