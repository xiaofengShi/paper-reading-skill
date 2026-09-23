// README.md is the audit source; docs/index.html is its static reading view.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const repoBase = 'https://github.com/xiaofengShi/paper-reading-skill/blob/main/';
const body = marked.parse(source).replace(/href="(?!https?:|#|mailto:)([^"]+)"/g, (_, target) => {
  if (target === 'docs/mimo-v2.6-deep-read.html') return 'href="mimo-v2.6-deep-read.html"';
  return `href="${repoBase}${target}"`;
});
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="把论文读成可探索、可追溯的深度阅读图谱。">
  <title>Paper Reading Skill</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a class="skip" href="#main">跳到正文</a>
  <header class="site-header"><a href="#main">Paper Reading Skill</a><span>论文 → 阅读图谱</span></header>
  <main id="main" class="reading-page"><article class="prose">
${body}
  </article></main>
  <footer><a href="https://github.com/xiaofengShi/paper-reading-skill">GitHub 仓库</a></footer>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'docs', 'index.html'), html);
