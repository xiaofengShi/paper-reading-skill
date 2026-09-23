// Each README is the audit source for its corresponding static homepage.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');

const root = path.resolve(__dirname, '..');
const site = 'https://xiaofengshi.github.io/paper-reading-skill/';
const repo = 'https://github.com/xiaofengShi/paper-reading-skill';
const sourceBase = `${repo}/blob/main/`;
const pages = [
  { source: 'README.md', output: 'index.html', lang: 'en', other: 'zh.html', otherLabel: '中文', nav: 'Navigation', skip: 'Skip to content', eyebrow: 'AN AGENT SKILL FOR DEEP PAPER READING', example: 'Open the complete reading →', github: 'View on GitHub ↗', footer: 'Read deeply. Keep the evidence close.' },
  { source: 'README.zh-CN.md', output: 'zh.html', lang: 'zh-CN', other: './', otherLabel: 'English', nav: '主导航', skip: '跳到正文', eyebrow: '面向深度论文阅读的 AGENT SKILL', example: '打开完整深读 →', github: '查看 GitHub ↗', footer: '读懂全文，证据就在身边。' },
];

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const rewriteLinks = html => html.replace(/\b(href|src)="([^"]+)"/g, (_, attr, target) => {
  if (/^(https?:|mailto:|#|data:)/.test(target)) return `${attr}="${target}"`;
  if (target === 'README.md') return `${attr}="./"`;
  if (target === 'README.zh-CN.md') return `${attr}="zh.html"`;
  if (target.startsWith('docs/')) return `${attr}="${esc(target.slice(5))}"`;
  return `${attr}="${sourceBase}${esc(target)}"`;
});

for (const page of pages) {
  const tokens = marked.lexer(fs.readFileSync(path.join(root, page.source), 'utf8'));
  const title = tokens.shift();
  if (title?.type !== 'heading' || title.depth !== 1) throw new Error(`${page.source} needs one leading H1`);

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
  const intro = hero.find(token => token.type === 'paragraph');
  const headline = intro?.text.match(/^\*\*(.+?)\*\*/)?.[1];
  if (!headline) throw new Error(`${page.source} needs a bold lead sentence`);
  const summary = intro.text.replace(/\*\*/g, '');
  const lead = intro.text.replace(/^\*\*.+?\*\*\s*/, '');
  const description = summary.length > 190 ? `${summary.slice(0, 187)}…` : summary;
  const url = page.lang === 'en' ? site : `${site}zh.html`;
  const nav = sections.slice(0, 3).map((section, index) => `<a href="#section-${index + 1}">${esc(section[0].text)}</a>`).join('');
  const content = sections.map((section, index) => `<section class="content-section section-${index + 1}" id="section-${index + 1}">\n${rewriteLinks(marked.parser(section))}\n</section>`).join('\n');
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
  <title>Paper Reading Skill — ${page.lang === 'en' ? 'Visual deep reads for research papers' : '把论文读成可视化深读文档'}</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a class="skip" href="#main">${page.skip}</a>
  <header class="site-header">
    <a class="brand" href="./" aria-label="Paper Reading Skill"><span class="brand-mark" aria-hidden="true">P<span>↗</span></span><span>Paper Reading</span></a>
    <nav aria-label="${page.nav}">${nav}<a class="nav-repo" href="${repo}">GitHub ↗</a><a class="lang" href="${page.other}" hreflang="${page.lang === 'en' ? 'zh-CN' : 'en'}">${page.otherLabel}</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy"><p class="eyebrow">${page.eyebrow}</p><h1 id="page-title">${esc(headline)}</h1>${marked.parse(lead)}<div class="hero-actions"><a class="button primary" href="mimo-v2.6-deep-read.html">${page.example}</a><a class="button secondary" href="${repo}">${page.github}</a></div></div>
      <figure class="hero-visual">${rewriteLinks(marked.parser([preview]))}<figcaption>${page.lang === 'en' ? 'An editorial preview of the published MiMo-V2.6 deep read.' : '已发布的 MiMo-V2.6 深读文档的编辑式预览。'}</figcaption></figure>
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
