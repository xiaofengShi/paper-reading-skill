// Build one offline reading page from a Markdown audit source and local visuals.
// Usage: node scripts/render-reading.cjs input.md output.html
const fs = require('node:fs');
const path = require('node:path');
const katex = require('katex');
const { auditHtml, auditCss, createAssets, assertDistinctOutput, policyMeta, withOfflinePolicy } = require('./lib/offline-assets.cjs');
const { parseReadingHeader, renderReadingMarkdown, escapeMarkdownText } = require('./lib/reading-markdown.cjs');

async function main() {
// Dynamic import supports Marked's ESM distribution on every supported Node 20.
const { Marked } = await import('marked');

const [sourceArg, outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) {
  console.error('Usage: node scripts/render-reading.cjs input.md output.html');
  process.exit(2);
}
const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);
assertDistinctOutput(sourcePath, outputPath);
const { localFile, imageData } = createAssets(sourcePath);
const source = fs.readFileSync(sourcePath, 'utf8');
const { lang, theme, mode, body: prepared } = parseReadingHeader(source);
const labels = {
  'zh-CN': {
    why: '为什么需要', last: '这一阶段留下什么', next: '交给下一阶段',
    scope: '用于哪些任务', judge: '怎样判断', signal: '作用机制', value: '关键价值',
    question: '研究问题', setup: '设置 / 对照', observation: '观察', conclusion: '结论', cost: '代价 / 假设', chart: '本文整理的数据图',
    start: '起点', end: '终点', change: '变化', points: '个百分点', chartData: '查看图表数据', item: '项目',
    openDiagram: '展开辅助交互图：', explore: '可选交互', diagramNote: '按图中提示调整控件；本页的机制解释、算例与实验证据不依赖交互。',
    wholeMap: '论文全局图', description: '从全局路径到机制与实验的一体化论文深读。', titleSuffix: '深读图谱',
    skip: '跳到正文', topbar: '原文证据驱动的深读图谱', showSources: '显示原文定位', startReading: '开始阅读', inspectFigure: '↔ 横向滚动查看图内细节',
    defaultThesis: '从全局路径到关键机制与实验证据。', enter: '进入论文图谱', nav: '本文目录', route: '阅读路径',
    footer: '单文件阅读版', back: '返回顶部', pathKicker: '方法路径', contrastKicker: '机制对照', experimentKicker: '实验图谱', heroKicker: '论文深读图谱 · 中文',
    checkKicker: '理解自测', checkAnswer: '展开参考答案', reader: '适合谁读', goals: '读完可以尝试',
  },
  en: {
    why: 'Why it matters', last: 'What this stage leaves behind', next: 'Passed to the next stage',
    scope: 'Where it applies', judge: 'How it is judged', signal: 'How it works', value: 'Why it matters',
    question: 'Research question', setup: 'Setup / comparator', observation: 'Observation', conclusion: 'Conclusion', cost: 'Cost / assumption', chart: 'Chart prepared for this reading',
    start: 'Start', end: 'End', change: 'Change', points: 'percentage points', chartData: 'View chart data', item: 'Item',
    openDiagram: 'Explore interactive diagram: ', explore: 'Optional interaction', diagramNote: 'Follow the controls in the view. The mechanism, worked example, and evidence remain readable without interaction.',
    wholeMap: 'Whole-paper map', description: 'A visual deep read from the global path to mechanisms and experiments.', titleSuffix: 'Deep reading atlas',
    skip: 'Skip to content', topbar: 'A source-grounded reading atlas', showSources: 'Show source locations', startReading: 'Start reading', inspectFigure: '↔ Scroll sideways to read the figure',
    defaultThesis: 'From the global path to mechanisms and experimental evidence.', enter: 'Enter the reading atlas', nav: 'Contents', route: 'Reading path',
    footer: 'Single-file reading page', back: 'Back to top', pathKicker: 'METHOD PATH', contrastKicker: 'MECHANISM COMPARISON', experimentKicker: 'EXPERIMENT ATLAS', heroKicker: 'DEEP READING ATLAS · ENGLISH',
    checkKicker: 'CHECK YOUR UNDERSTANDING', checkAnswer: 'Reveal a grounded answer', reader: 'Who this is for', goals: 'After reading, try to',
  },
};
const t = { ...labels[lang] };
if (mode === 'brief') Object.assign(t, lang === 'zh-CN' ? {
  description: '串起问题、主路径、关键机制与决定性证据的论文导读。',
  titleSuffix: '论文导读 · Brief', topbar: '原文证据驱动的论文导读', heroKicker: '论文导读 · BRIEF READING · 中文',
} : {
  description: 'A focused reading of the problem, main path, key mechanisms, and decisive evidence.',
  titleSuffix: 'Brief reading atlas', topbar: 'A source-grounded reading atlas', heroKicker: 'BRIEF READING ATLAS · ENGLISH',
});
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
auditCss(katexCss, 'KaTeX stylesheet');
auditCss(css, 'reading stylesheet');
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sourceBadge = source => {
  if (!source) throw new Error('A visual fact is missing its source');
  return `<span class="source-badge">${esc(source)}</span>`;
};
const strictNumber = (value, message) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(message);
  return value;
};
const requireText = (value, message) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
  return value;
};
const requireRowText = (row, fields, kind, index) => {
  for (const field of fields) requireText(row[field], `${kind} row ${index + 1} is missing "${field}"`);
};

function validateMap(data) {
  if (!Array.isArray(data.items) || !data.items.length) throw new Error('paper-map needs items');
  data.items.forEach((x, i) => requireRowText(x, ['number', 'label', 'text'], 'paper-map item', i));
  if (data.reader !== undefined) requireText(data.reader, 'paper-map has an empty "reader"');
  if (data.goals !== undefined) {
    if (!Array.isArray(data.goals) || !data.goals.length) throw new Error('paper-map needs a non-empty "goals" array');
    data.goals.forEach(goal => requireText(goal, 'paper-map has an empty goal'));
  }
}
function renderMap(data) {
  validateMap(data);
  return `<div class="principle-grid" role="list">${data.items.map(x =>
    `<article class="principle" role="listitem"><span class="principle-number">${esc(x.number)}</span><h3>${esc(x.label)}</h3><p>${esc(x.text)}</p>${sourceBadge(x.source)}</article>`
  ).join('')}</div>`;
}
function renderPath(data) {
  if (!Array.isArray(data.stages) || !data.stages.length) throw new Error('paper-path needs stages');
  requireText(data.title, 'paper-path is missing "title"');
  data.stages.forEach((s, i) => requireRowText(s, ['title', 'role', 'action', 'why', 'output'], 'paper-path stage', i));
  return `<figure class="reading-path"><figcaption><span class="figure-kicker">${t.pathKicker}</span><strong>${esc(data.title)}</strong>${data.intro ? `<p>${esc(data.intro)}</p>` : ''}</figcaption><ol>${data.stages.map((s, i) =>
    `<li><span class="path-index">${String(i + 1).padStart(2, '0')}</span><div class="path-content"><div class="path-title"><h3>${esc(s.title)}</h3><span>${esc(s.role)}</span></div><p>${esc(s.action)}</p><dl><div><dt>${t.why}</dt><dd>${esc(s.why)}</dd></div>${s.cost ? `<div><dt>${t.cost}</dt><dd>${esc(s.cost)}</dd></div>` : ''}<div><dt>${i === data.stages.length - 1 ? t.last : t.next}</dt><dd>${esc(s.output)}</dd></div></dl>${sourceBadge(s.source)}</div></li>`
  ).join('')}</ol></figure>`;
}
function renderContrast(data) {
  if (!Array.isArray(data.branches) || data.branches.length !== 2) throw new Error('paper-contrast needs two branches');
  requireText(data.title, 'paper-contrast is missing "title"');
  requireText(data.intro, 'paper-contrast is missing "intro"');
  data.branches.forEach((b, i) => requireRowText(b, ['name', 'lead', 'scope', 'judge', 'signal', 'why'], 'paper-contrast branch', i));
  return `<figure class="mechanism-contrast"><figcaption><span class="figure-kicker">${t.contrastKicker}</span><strong>${esc(data.title)}</strong><p>${esc(data.intro)}</p></figcaption><div class="contrast-grid">${data.branches.map((b, i) =>
    `<section class="contrast-branch b${i}"><h3>${esc(b.name)}</h3><p class="contrast-lead">${esc(b.lead)}</p><dl><div><dt>${t.scope}</dt><dd>${esc(b.scope)}</dd></div><div><dt>${t.judge}</dt><dd>${esc(b.judge)}</dd></div><div><dt>${t.signal}</dt><dd>${esc(b.signal)}</dd></div><div><dt>${t.value}</dt><dd>${esc(b.why)}</dd></div></dl>${sourceBadge(b.source)}</section>`
  ).join('')}</div></figure>`;
}
function renderExperiments(data) {
  if (!Array.isArray(data.rows) || !data.rows.length) throw new Error('paper-experiments needs rows');
  requireText(data.title, 'paper-experiments is missing "title"');
  data.rows.forEach((r, i) => requireRowText(r, ['question', 'setup', 'observation'], 'paper-experiments', i));
  return `<figure class="experiment-atlas"><figcaption><span class="figure-kicker">${t.experimentKicker}</span><strong>${esc(data.title)}</strong></figcaption><div class="experiment-head" aria-hidden="true"><span>${t.question}</span><span>${t.setup}</span><span>${t.observation}</span></div><div class="experiment-rows">${data.rows.map((r, i) =>
    `<article class="experiment-row"><div class="experiment-question"><span>${String(i + 1).padStart(2, '0')}</span><strong>${esc(r.question)}</strong></div><p>${esc(r.setup)}</p><div><p>${esc(r.observation)}</p>${r.conclusion ? `<p class="experiment-conclusion"><span>${t.conclusion}</span>${esc(r.conclusion)}</p>` : ''}${sourceBadge(r.source)}</div></article>`
  ).join('')}</div></figure>`;
}
function renderCheck(data) {
  requireText(data.title, 'paper-check is missing "title"');
  if (!Array.isArray(data.items) || !data.items.length) throw new Error('paper-check needs items');
  data.items.forEach((item, i) => {
    requireRowText(item, ['question', 'answer', 'source'], 'paper-check item', i);
    if (item.hint !== undefined) requireText(item.hint, `paper-check item row ${i + 1} has an empty "hint"`);
  });
  return `<section class="understanding-check"><p class="figure-kicker">${t.checkKicker}</p><h3>${esc(data.title)}</h3><ol>${data.items.map(item => `<li><p class="check-question">${esc(item.question)}</p>${item.hint ? `<p class="check-hint">${esc(item.hint)}</p>` : ''}<details><summary>${t.checkAnswer}</summary><p>${esc(item.answer)}</p>${sourceBadge(item.source)}</details></li>`).join('')}</ol></section>`;
}
function renderChart(data) {
  if (!Array.isArray(data.rows) || !data.rows.length) throw new Error('paper-chart needs rows');
  requireText(data.title, 'paper-chart is missing "title"');
  data.rows.forEach((r, i) => requireText(r.label, `paper-chart row ${i + 1} is missing "label"`));
  const header = `<div class="figure-head"><div><span class="figure-kicker">${esc(data.origin || t.chart)}</span><h3>${esc(data.title)}</h3>${data.subtitle ? `<p>${esc(data.subtitle)}</p>` : ''}</div>${sourceBadge(data.source)}</div>`;
  const note = data.note ? `<figcaption class="data-note">${esc(data.note)}</figcaption>` : '';
  if (data.type === 'segments') {
    const values = data.rows.map(r => strictNumber(r.value, `Invalid segment value for ${r.label}`));
    if (values.some(v => v < 0)) throw new Error(`Invalid segment value for ${data.rows.find((r, i) => values[i] < 0).label}`);
    const sum = values.reduce((n, v) => n + v, 0);
    if (Math.abs(sum - 100) > 0.2) throw new Error(`Segments do not total 100: ${sum}`);
    const bar = `<div class="segments" role="img" aria-label="${esc(data.rows.map(r => `${r.label} ${r.value}${data.unit || ''}`).join(lang === 'zh-CN' ? '；' : '; '))}">${data.rows.map((r, i) => `<span class="segment s${i}" style="width:${Number(r.value)}%"></span>`).join('')}</div>`;
    const legend = `<div class="segment-legend">${data.rows.map((r, i) => `<div><span class="swatch s${i}"></span><span>${esc(r.label)}</span><strong>${esc(r.value)}${esc(data.unit || '')}</strong></div>`).join('')}</div>`;
    return `<figure class="data-figure">${header}${bar}${legend}${note}</figure>`;
  }
  if (data.type === 'paired') {
    const rows = data.rows.map(r => {
      for (const key of ['before', 'after']) {
        const v = strictNumber(r[key], `Invalid ${key} for ${r.label}`);
        if (v < 0 || v > 100) throw new Error(`Invalid ${key} for ${r.label}`);
      }
      const before = r.before;
      const after = r.after;
      const delta = after - before;
      const change = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`;
      const prefix = r.approx ? '≈' : '';
      const aria = lang === 'zh-CN' ? `起点 ${prefix}${before}%，终点 ${prefix}${after}%，变化 ${prefix}${change} 个百分点` : `${t.start} ${prefix}${before}%, ${t.end} ${prefix}${after}%, ${t.change} ${prefix}${change} ${t.points}`;
      return `<div class="pair-row"><div class="pair-label">${esc(r.label)}</div><div class="pair-track" role="img" aria-label="${esc(aria)}"><span class="pair-connector" style="left:${Math.min(before, after)}%;width:${Math.abs(delta)}%"></span><span class="pair-point before" style="left:${before}%"></span><span class="pair-point after" style="left:${after}%"></span></div><div class="pair-values"><span><i class="pair-symbol before" aria-hidden="true"></i>${t.start} <strong>${prefix}${before}%</strong></span><span><i class="pair-symbol after" aria-hidden="true"></i>${t.end} <strong>${prefix}${after}%</strong></span><span class="pair-delta">${prefix}${change} ${t.points}</span></div></div>`;
    }).join('');
    const tableHead = lang === 'zh-CN' ? `<th>项目</th><th>起点（%）</th><th>终点（%）</th><th>变化（百分点）</th>` : `<th>${t.item}</th><th>${t.start} (%)</th><th>${t.end} (%)</th><th>${t.change} (${t.points})</th>`;
    const table = `<details class="chart-table"><summary>${t.chartData}</summary><table><thead><tr>${tableHead}</tr></thead><tbody>${data.rows.map(r => { const delta = r.after - r.before; return `<tr><th>${esc(r.label)}</th><td>${r.approx?'≈':''}${esc(r.before)}</td><td>${r.approx?'≈':''}${esc(r.after)}</td><td>${r.approx?'≈':''}${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</td></tr>`; }).join('')}</tbody></table></details>`;
    return `<figure class="data-figure">${header}<div class="paired-chart">${rows}<div class="pair-axis" aria-hidden="true"><span>0%</span><span>100%</span></div></div>${table}${note}</figure>`;
  }
  if (data.type === 'bars') {
    const rows = data.rows.map(r => {
      const value = strictNumber(r.value, `Invalid bar value for ${r.label}`);
      if (value < 0) throw new Error(`Invalid bar value for ${r.label}`);
      return { label: r.label, value, approx: r.approx };
    });
    const maxRow = rows.reduce((m, r) => Math.max(m, r.value), 0);
    let domain = maxRow;
    if (data.domainMax !== undefined) {
      domain = strictNumber(data.domainMax, `Invalid domainMax: ${String(data.domainMax)}`);
      if (domain <= 0) throw new Error(`Invalid domainMax: ${domain}`);
      if (rows.some(r => r.value > domain)) throw new Error(`domainMax ${domain} is smaller than row values`);
    }
    const scale = domain > 0 ? domain : 1;
    const unit = data.unit || '';
    const bars = rows.map(r => {
      const width = Math.round((r.value / scale) * 10000) / 100;
      const prefix = r.approx ? '≈' : '';
      const aria = lang === 'zh-CN' ? `${r.label}：${prefix}${r.value}${unit}` : `${r.label}: ${prefix}${r.value}${unit}`;
      return `<div class="bar-row"><div class="bar-label">${esc(r.label)}</div><div class="bar-track" role="img" aria-label="${esc(aria)}"><span class="bar-fill" style="width:${width}%"></span></div><div class="bar-values"><strong>${prefix}${esc(r.value)}${esc(unit)}</strong></div></div>`;
    }).join('');
    const tableHead = lang === 'zh-CN' ? `<th>项目</th><th>数值${esc(unit)}</th>` : `<th>${t.item}</th><th>Value${esc(unit)}</th>`;
    const table = `<details class="chart-table"><summary>${t.chartData}</summary><table><thead><tr>${tableHead}</tr></thead><tbody>${rows.map(r => `<tr><th>${esc(r.label)}</th><td>${r.approx ? '≈' : ''}${esc(r.value)}</td></tr>`).join('')}</tbody></table></details>`;
    return `<figure class="data-figure">${header}<div class="bars-chart">${bars}<div class="bar-axis" aria-hidden="true"><span>0</span><span>${esc(domain)}${esc(unit)}</span></div></div>${table}${note}</figure>`;
  }
  throw new Error(`Unknown paper-chart type: ${data.type}`);
}
function renderArchify(relative, title) {
  // Archify's optional Google Fonts can fall back to system fonts. Other
  // unresolved resources are build errors; scripts keep working inside srcdoc.
  const html = withOfflinePolicy(auditHtml(fs.readFileSync(localFile(relative), 'utf8'), { context: relative, stripGoogleFonts: true }));
  return `<details class="archify-disclosure"><summary>${t.openDiagram}${escapeMarkdownText(title, esc)} <span>${t.explore}</span></summary><figure class="archify-figure"><iframe title="${escapeMarkdownText(title, esc)}" srcdoc="${esc(html)}" sandbox="allow-scripts" loading="lazy"></iframe><figcaption>${t.diagramNote}</figcaption></figure></details>`;
}

const reading = renderReadingMarkdown(Marked, prepared, {
  esc, imageData, katex, labels: t, renderArchify,
  blocks: { 'paper-map': renderMap, 'paper-path': renderPath, 'paper-contrast': renderContrast, 'paper-experiments': renderExperiments, 'paper-chart': renderChart, 'paper-check': renderCheck },
});
const { heroMap, sections, title, visualCount } = reading;
const body = auditHtml(reading.body, { context: 'reading', imageData });
const nav = sections.map(s => `<a href="#${s.id}">${escapeMarkdownText(s.heading, esc)}</a>`).join('');
const heroVisual = heroMap ? `<div class="hero-map"><p class="hero-map-title">${t.wholeMap} <span>01 — ${String(heroMap.items.length).padStart(2, '0')}</span></p><ol>${heroMap.items.map(x => `<li><span class="hero-map-index">${esc(x.number)}</span><div><div class="hero-map-heading"><strong>${esc(x.label)}</strong>${x.signal ? `<b>${esc(x.signal)}</b>` : ''}</div><p>${esc(x.text)}</p>${sourceBadge(x.source)}</div></li>`).join('')}</ol>${heroMap.outcome ? `<div class="hero-map-outcome"><span aria-hidden="true">↳</span><div><strong>${esc(heroMap.outcome)}</strong>${heroMap.outcomeSource ? sourceBadge(heroMap.outcomeSource) : ''}</div></div>` : ''}</div>` : '';
const readerGuide = `${heroMap?.reader ? `<p class="hero-reader"><strong>${t.reader}</strong> · ${esc(heroMap.reader)}</p>` : ''}${heroMap?.goals ? `<div class="hero-goals"><p>${t.goals}</p><ul>${heroMap.goals.map(goal => `<li>${esc(goal)}</li>`).join('')}</ul></div>` : ''}`;
const output = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">${policyMeta}<meta name="paper-reading-mode" content="${mode}"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeMarkdownText(title, esc)}${lang === 'zh-CN' ? '：' : ': '}${t.description}"><title>${escapeMarkdownText(title, esc)} · ${t.titleSuffix}</title><style>${katexCss}\n${css}</style></head>
<body data-theme="${theme}"><a class="skip-link" href="#content">${t.skip}</a><input class="source-toggle" id="show-sources" type="checkbox"><header class="topbar"><a class="brand" href="#top">PAPER / READING</a><span>${t.topbar}</span><label class="source-toggle-label" for="show-sources">${t.showSources}</label><a href="#content">${t.startReading} ↘</a></header><div id="top" class="hero"><div class="hero-inner"><div class="hero-copy"><p class="eyebrow">${t.heroKicker}</p><h1>${escapeMarkdownText(title, esc)}</h1><p class="hero-sub">${esc(heroMap?.thesis || t.defaultThesis)}</p>${readerGuide}<a class="hero-link" href="#section-1">${t.enter} <span aria-hidden="true">↘</span></a></div>${heroVisual}</div></div><div class="reading-shell"><nav class="toc" aria-label="${t.nav}"><div class="toc-title">${t.route}</div>${nav}</nav><main id="content" class="article"><div class="article-inner">${body}</div></main></div><footer class="page-footer"><span><a href="https://github.com/xiaofengShi/paper-reading-skill">Paper Reading Skill</a> · ${t.footer}</span><a href="#top">${t.back} ↑</a></footer></body></html>`;
const cleanOutput = output.replace(/[ \t]+$/gm, '');
fs.writeFileSync(outputPath, cleanOutput);
console.log(`Built ${outputPath} (${Buffer.byteLength(cleanOutput)} bytes, ${sections.length} sections, ${visualCount} visuals)`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
