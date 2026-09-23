// Build one offline reading page from a Markdown audit source and local visuals.
// Usage: node scripts/render-reading.cjs input.md output.html
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');
const katex = require('katex');

const [sourceArg, outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) {
  console.error('Usage: node scripts/render-reading.cjs input.md output.html');
  process.exit(2);
}
const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);
const sourceDir = path.dirname(sourcePath);
const source = fs.readFileSync(sourcePath, 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../assets/reading.css'), 'utf8');
const katexCssFile = require.resolve('katex/dist/katex.min.css');
let katexCss = fs.readFileSync(katexCssFile, 'utf8');
let embeddedFonts = 0;
katexCss = katexCss.replace(/src:url\(fonts\/([^)]*\.woff2)\) format\("woff2"\),url\(fonts\/[^)]*\.woff\) format\("woff"\),url\(fonts\/[^)]*\.ttf\) format\("truetype"\)/g, (_, file) => {
  embeddedFonts++;
  const font = fs.readFileSync(path.resolve(path.dirname(katexCssFile), 'fonts', file));
  return `src:url(data:font/woff2;base64,${font.toString('base64')}) format("woff2")`;
});
if (!embeddedFonts || /url\(fonts\//.test(katexCss)) throw new Error('KaTeX fonts were not fully embedded');
const slots = [];
const slot = html => {
  const id = `PAPER_READING_SLOT_${slots.length}_END`;
  slots.push(html);
  return `\n\n${id}\n\n`;
};
const inlineSlots = [];
const inlineSlot = html => {
  const id = `PAPERREADINGINLINE${inlineSlots.length}END`;
  inlineSlots.push(html);
  return id;
};
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const localFile = relative => {
  const absolute = path.resolve(sourceDir, relative.trim());
  if (!absolute.startsWith(sourceDir + path.sep)) throw new Error(`Visual must stay beside source: ${relative}`);
  return absolute;
};
const imageData = relative => {
  const file = localFile(relative);
  const mime = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : null;
  if (!mime) throw new Error(`Unsupported image: ${relative}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};
const sourceBadge = source => `<span class="source-badge">${esc(source)}</span>`;

function renderMap(data) {
  if (!Array.isArray(data.items) || !data.items.length) throw new Error('paper-map needs items');
  return `<div class="principle-grid" role="list">${data.items.map(x =>
    `<article class="principle" role="listitem"><span class="principle-number">${esc(x.number)}</span><h3>${esc(x.label)}</h3><p>${esc(x.text)}</p>${sourceBadge(x.source)}</article>`
  ).join('')}</div>`;
}
function renderPath(data) {
  if (!Array.isArray(data.stages) || !data.stages.length) throw new Error('paper-path needs stages');
  return `<figure class="reading-path"><figcaption><span class="figure-kicker">GUIDED PATH</span><strong>${esc(data.title)}</strong><p>${esc(data.intro)}</p></figcaption><ol>${data.stages.map((s, i) =>
    `<li><span class="path-index">${String(i + 1).padStart(2, '0')}</span><div class="path-content"><div class="path-title"><h3>${esc(s.title)}</h3><span>${esc(s.role)}</span></div><p>${esc(s.action)}</p><dl><div><dt>为什么需要</dt><dd>${esc(s.why)}</dd></div><div><dt>${i === data.stages.length - 1 ? '这一阶段留下什么' : '交给下一阶段'}</dt><dd>${esc(s.output)}</dd></div></dl>${sourceBadge(s.source)}</div></li>`
  ).join('')}</ol></figure>`;
}
function renderContrast(data) {
  if (!Array.isArray(data.branches) || data.branches.length !== 2) throw new Error('paper-contrast needs two branches');
  return `<figure class="mechanism-contrast"><figcaption><span class="figure-kicker">MECHANISM COMPARISON</span><strong>${esc(data.title)}</strong><p>${esc(data.intro)}</p></figcaption><div class="contrast-grid">${data.branches.map((b, i) =>
    `<section class="contrast-branch b${i}"><h3>${esc(b.name)}</h3><p class="contrast-lead">${esc(b.lead)}</p><dl><div><dt>用于哪些任务</dt><dd>${esc(b.scope)}</dd></div><div><dt>怎样判断</dt><dd>${esc(b.judge)}</dd></div><div><dt>如何进入学习</dt><dd>${esc(b.signal)}</dd></div><div><dt>关键价值</dt><dd>${esc(b.why)}</dd></div></dl>${sourceBadge(b.source)}</section>`
  ).join('')}</div></figure>`;
}
function renderExperiments(data) {
  if (!Array.isArray(data.rows) || !data.rows.length) throw new Error('paper-experiments needs rows');
  return `<figure class="experiment-atlas"><figcaption><span class="figure-kicker">EXPERIMENT ATLAS</span><strong>${esc(data.title)}</strong></figcaption><div class="experiment-head" aria-hidden="true"><span>研究问题</span><span>设置 / 对照</span><span>观察</span></div><div class="experiment-rows">${data.rows.map((r, i) =>
    `<article class="experiment-row"><div class="experiment-question"><span>${String(i + 1).padStart(2, '0')}</span><strong>${esc(r.question)}</strong></div><p>${esc(r.setup)}</p><div><p>${esc(r.observation)}</p>${sourceBadge(r.source)}</div></article>`
  ).join('')}</div></figure>`;
}
function renderChart(data) {
  const header = `<div class="figure-head"><div><span class="figure-kicker">${esc(data.origin || '本文整理的数据图')}</span><h3>${esc(data.title)}</h3>${data.subtitle ? `<p>${esc(data.subtitle)}</p>` : ''}</div>${sourceBadge(data.source)}</div>`;
  const note = data.note ? `<figcaption class="data-note">${esc(data.note)}</figcaption>` : '';
  if (data.type === 'segments') {
    const sum = data.rows.reduce((n, r) => n + Number(r.value), 0);
    if (Math.abs(sum - 100) > 0.2) throw new Error(`Segments do not total 100: ${sum}`);
    const bar = `<div class="segments" role="img" aria-label="${esc(data.rows.map(r => `${r.label} ${r.value}${data.unit || ''}`).join('；'))}">${data.rows.map((r, i) => `<span class="segment s${i}" style="width:${Number(r.value)}%"></span>`).join('')}</div>`;
    const legend = `<div class="segment-legend">${data.rows.map((r, i) => `<div><span class="swatch s${i}"></span><span>${esc(r.label)}</span><strong>${esc(r.value)}${esc(data.unit || '')}</strong></div>`).join('')}</div>`;
    return `<figure class="data-figure">${header}${bar}${legend}${note}</figure>`;
  }
  if (data.type === 'paired') {
    const rows = data.rows.map(r => {
      for (const key of ['before', 'after']) if (!(Number.isFinite(Number(r[key])) && Number(r[key]) >= 0 && Number(r[key]) <= 100)) throw new Error(`Invalid ${key} for ${r.label}`);
      const before = Number(r.before);
      const after = Number(r.after);
      const delta = after - before;
      const change = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`;
      const prefix = r.approx ? '≈' : '';
      return `<div class="pair-row"><div class="pair-label">${esc(r.label)}</div><div class="pair-track" role="img" aria-label="${esc(`起点 ${prefix}${before}%，终点 ${prefix}${after}%，变化 ${prefix}${change} 个百分点`)}"><span class="pair-connector" style="left:${Math.min(before, after)}%;width:${Math.abs(delta)}%"></span><span class="pair-point before" style="left:${before}%"></span><span class="pair-point after" style="left:${after}%"></span></div><div class="pair-values"><span><i class="pair-symbol before" aria-hidden="true"></i>起点 <strong>${prefix}${before}%</strong></span><span><i class="pair-symbol after" aria-hidden="true"></i>终点 <strong>${prefix}${after}%</strong></span><span class="pair-delta">${prefix}${change} 个百分点</span></div></div>`;
    }).join('');
    const table = `<details class="chart-table"><summary>查看图表数据</summary><table><thead><tr><th>项目</th><th>起点（%）</th><th>终点（%）</th><th>变化（百分点）</th></tr></thead><tbody>${data.rows.map(r => { const delta = Number(r.after) - Number(r.before); return `<tr><th>${esc(r.label)}</th><td>${r.approx?'≈':''}${esc(r.before)}</td><td>${r.approx?'≈':''}${esc(r.after)}</td><td>${r.approx?'≈':''}${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</td></tr>`; }).join('')}</tbody></table></details>`;
    return `<figure class="data-figure">${header}<div class="paired-chart">${rows}<div class="pair-axis" aria-hidden="true"><span>0%</span><span>100%</span></div></div>${table}${note}</figure>`;
  }
  throw new Error(`Unknown paper-chart type: ${data.type}`);
}
function renderArchify(relative, title) {
  let html = fs.readFileSync(localFile(relative), 'utf8');
  // Archify's fonts are optional; remove those requests from the one-file reader.
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '')
    .replace(/<noscript>\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*<\/noscript>/g, '');
  return `<details class="archify-disclosure"><summary>展开辅助交互图：${esc(title)} <span>节点聚焦与路径探索</span></summary><figure class="archify-figure"><iframe title="${esc(title)}" srcdoc="${esc(html)}" sandbox="allow-scripts" loading="lazy"></iframe><figcaption>交互图用于探索结构；本页的阅读路径、机制解释和实验数据可直接阅读。</figcaption></figure></details>`;
}

let prepared = source;
let heroMap = null;
prepared = prepared.replace(/```paper-map\s*\n([\s\S]*?)\n```/g, (_, json) => {
  const data = JSON.parse(json);
  if (!Array.isArray(data.items) || !data.items.length) throw new Error('paper-map needs items');
  if (!heroMap) { heroMap = data; return ''; }
  return slot(renderMap(data));
});
prepared = prepared.replace(/```paper-path\s*\n([\s\S]*?)\n```/g, (_, json) => slot(renderPath(JSON.parse(json))));
prepared = prepared.replace(/```paper-contrast\s*\n([\s\S]*?)\n```/g, (_, json) => slot(renderContrast(JSON.parse(json))));
prepared = prepared.replace(/```paper-experiments\s*\n([\s\S]*?)\n```/g, (_, json) => slot(renderExperiments(JSON.parse(json))));
prepared = prepared.replace(/```paper-chart\s*\n([\s\S]*?)\n```/g, (_, json) => slot(renderChart(JSON.parse(json))));
prepared = prepared.replace(/<!-- archify:([^|>]+)\|([^>]+) -->/g, (_, file, title) => slot(renderArchify(file, title.trim())));
prepared = prepared.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => slot(`<div class="display-math">${katex.renderToString(math.trim(), {output:'htmlAndMathml',displayMode:true,throwOnError:true})}</div>`));
prepared = prepared.replace(/\$([^$\n]+)\$([，。；：、,.;:]?)/g, (_, math, punctuation) => inlineSlot(`<span class="inline-math">${katex.renderToString(math.trim(), {output:'htmlAndMathml',throwOnError:true})}${esc(punctuation)}</span>`));
const sourceRef = label => inlineSlot(`<span class="source-ref">${esc(label)}</span>`);
prepared = prepared.replace(/（PDF[^）]+）/g, sourceRef);
prepared = prepared.replace(/\(PDF[^)]+\)/g, sourceRef);
prepared = prepared.replace(/，PDF pp?\.\s*\d+(?:[–-]\d+)?(?=。)/g, sourceRef);
prepared = prepared.replace(/PDF pp?\.\s*\d+(?:[–-]\d+)?/g, sourceRef);
prepared = prepared.replace(/^!\[([^\]\n]*)\]\(([^)\n]+)\)\r?\n\r?\n\*([^\n]+)\*$/gm, (_, alt, relative, caption) =>
  slot(`<figure class="paper-figure"><img src="${imageData(relative)}" alt="${esc(alt)}" loading="lazy" decoding="async"><figcaption>${marked.parseInline(caption, {gfm:true})}</figcaption></figure>`));
let body = marked.parse(prepared, {gfm:true});
slots.forEach((html, i) => { body = body.replace(`<p>PAPER_READING_SLOT_${i}_END</p>`, html); });
if (/PAPER_READING_SLOT_\d+_END/.test(body)) throw new Error('Unresolved visual slot');
inlineSlots.forEach((html, i) => { body = body.replaceAll(`PAPERREADINGINLINE${i}END`, html); });
if (/PAPERREADINGINLINE\d+END/.test(body)) throw new Error('Unresolved inline math slot');
body = body.replace(/<img src="([^"]+)" alt="([^"]*)">/g, (_, relative, alt) => {
  return `<img src="${imageData(relative)}" alt="${alt}" loading="lazy" decoding="async">`;
});
const sections = [];
body = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, heading) => {
  const id = `section-${sections.length + 1}`;
  sections.push({id, heading:heading.replace(/<[^>]*>/g,'')});
  return `<h2 id="${id}">${heading}</h2>`;
});
const title = (body.match(/<h1>([\s\S]*?)<\/h1>/) || [,'Paper Reading'])[1].replace(/<[^>]*>/g,'');
body = body.replace(/<h1>[\s\S]*?<\/h1>/, '');
const nav = sections.map(s => `<a href="#${s.id}">${esc(s.heading)}</a>`).join('');
const heroVisual = heroMap ? `<div class="hero-map"><p class="hero-map-title">论文全局图 <span>01 — ${String(heroMap.items.length).padStart(2, '0')}</span></p><ol>${heroMap.items.map(x => `<li><span class="hero-map-index">${esc(x.number)}</span><div><div class="hero-map-heading"><strong>${esc(x.label)}</strong>${x.signal ? `<b>${esc(x.signal)}</b>` : ''}</div><p>${esc(x.text)}</p>${sourceBadge(x.source)}</div></li>`).join('')}</ol>${heroMap.outcome ? `<div class="hero-map-outcome"><span aria-hidden="true">↳</span><div><strong>${esc(heroMap.outcome)}</strong>${heroMap.outcomeSource ? sourceBadge(heroMap.outcomeSource) : ''}</div></div>` : ''}</div>` : '';
const output = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(title)}：从全局路径到机制与实验的一体化论文深读。"><title>${esc(title)} · 深读图谱</title><style>${katexCss}\n${css}</style></head>
<body><a class="skip-link" href="#content">跳到正文</a><input class="source-toggle" id="show-sources" type="checkbox"><header class="topbar"><a class="brand" href="#top">PAPER / READING</a><span>原文证据驱动的深读图谱</span><label class="source-toggle-label" for="show-sources">显示原文定位</label><a href="#content">开始阅读 ↘</a></header><div id="top" class="hero"><div class="hero-inner"><div class="hero-copy"><p class="eyebrow">DEEP READING ATLAS</p><h1>${esc(title)}</h1><p class="hero-sub">${esc(heroMap?.thesis || '从全局路径到关键机制与实验证据。')}</p><a class="hero-link" href="#section-1">进入论文图谱 <span aria-hidden="true">↘</span></a></div>${heroVisual}</div></div><div class="reading-shell"><nav class="toc" aria-label="本文目录"><div class="toc-title">阅读路径</div>${nav}</nav><main id="content" class="article"><div class="article-inner">${body}</div></main></div><footer class="page-footer"><span>Paper Reading Skill · 单文件阅读版</span><a href="#top">返回顶部 ↑</a></footer></body></html>`;
const cleanOutput = output.replace(/[ \t]+$/gm, '');
fs.writeFileSync(outputPath, cleanOutput);
console.log(`Built ${outputPath} (${Buffer.byteLength(cleanOutput)} bytes, ${sections.length} sections, ${slots.length} visuals)`);
