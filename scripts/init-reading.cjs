#!/usr/bin/env node
// Create editable reading inputs. This command does not read a paper or generate a completed atlas.
const fs = require('node:fs');
const path = require('node:path');

const usage = `Usage: node scripts/init-reading.cjs --out <new-directory> --title <paper-title> [options]

Create reading.md, brief.md, and assets/ in a new directory. Existing targets
are never replaced. The source is a clearly labeled, unfinished draft.

Options:
  --out <directory>   Required. A new directory for this reading.
  --title <title>     Required. The paper title or a provisional title.
  --paper <input>     Paper URL, arXiv ID, or local PDF path (not downloaded).
  --lang <language>   en (default) or zh-CN.
  --theme <theme>     forest (default), cobalt, plum, or saffron.
  --mode <mode>       brief (default) or deep. Selects the reading depth.
  --help             Show this help.

Example:
  node scripts/init-reading.cjs --out paper-readings/transformer --title "Attention Is All You Need" --paper https://arxiv.org/abs/1706.03762v7 --lang en
`;

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    if (args.length !== 1) throw new Error('Use --help on its own.');
    process.stdout.write(usage);
    return;
  }
  const options = {};
  const accepted = new Set(['--out', '--title', '--paper', '--lang', '--theme', '--mode']);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!accepted.has(key)) throw new Error(`Unknown option: ${key}. Run with --help.`);
    if (options[key] !== undefined) throw new Error(`Repeated option: ${key}.`);
    const value = args[i + 1];
    if (!value || value.startsWith('--') || !value.trim()) throw new Error(`Missing value for ${key}.`);
    if (/[\r\n\0]/.test(value)) throw new Error(`${key} must be one line.`);
    options[key] = value.trim();
  }
  for (const key of ['--out', '--title']) {
    if (!options[key]) throw new Error(`Missing ${key}. Run with --help.`);
  }
  const lang = options['--lang'] || 'en';
  const theme = options['--theme'] || 'forest';
  const mode = options['--mode'] || 'brief';
  if (!['en', 'zh-CN'].includes(lang)) throw new Error('Supported languages: en, zh-CN.');
  if (!['forest', 'cobalt', 'plum', 'saffron'].includes(theme)) throw new Error('Supported themes: forest, cobalt, plum, saffron.');
  if (!['brief', 'deep'].includes(mode)) throw new Error('Supported modes: brief, deep.');
  const destination = path.resolve(options['--out']);
  if (fs.existsSync(destination)) throw new Error(`Destination already exists; nothing was changed: ${destination}`);

  const text = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/[\\`*{}\[\]()#+.!|_$]/g, '\\$&');
  const title = text(options['--title']);
  const paperInput = options['--paper'];
  const localInput = paperInput && !/^[a-z][a-z\d+.-]*:\/\//i.test(paperInput) &&
    (/(?:^|[\\/])[^\\/]+\.pdf$/i.test(paperInput) || fs.existsSync(paperInput));
  const paper = paperInput ? text(localInput ? path.resolve(paperInput) : paperInput) : (lang === 'zh-CN' ? '待填写：论文链接或本地 PDF' : 'TODO: paper URL or local PDF');
  // These are editable prompts, not a required chapter structure or diagram quota.
  const headings = lang === 'zh-CN' ? [
    ['问题与贡献', '按读者背景说明问题、研究场景、核心想法和主要贡献；仅在有帮助时用具体场景或图示建立直觉。章节可按论文重组。'],
    ['主路径与设计理由', '连接输入、转换、输出及必要假设；按论文类型选择机制、证明依赖或数据构建路径。'],
    ['关键机制与推演', '解释论文特有的变量、公式、证明或协议；需要时加入标明的教学算例，熟悉基础不重复讲解。'],
    ['决定性证据', '连接问题、设置、对照、指标、观察与结论边界；使用论文实际的证据类型。'],
    ['综合与限制', '说明机制与证据支持什么，哪些仍不确定。可选自测仅在有帮助时加入。'],
    ['资料出处', '集中列出标题、作者或机构、版本、日期和链接。正文解释完整，可用页内编号跳转。'],
  ] : [
    ['Question and contribution', 'Explain the problem, setting, central idea and contribution for the intended reader. Use a concrete situation or illustration when helpful; adapt these headings to the paper.'],
    ['Main path and design reasoning', 'Connect inputs, transformations, outputs and assumptions using the actual mechanism, proof dependency or data construction path.'],
    ['Mechanism and worked explanation', 'Explain paper-specific variables, equations, proofs or protocols. Add labeled examples where useful; do not reteach familiar foundations.'],
    ['Decisive evidence', 'Connect the question, setup, comparator, metric, observation and scope. Use the paper’s actual evidence type.'],
    ['Synthesis and limits', 'Explain what the mechanism and evidence establish and what remains uncertain. Add optional understanding checks only when useful.'],
    ['Sources', 'Collect titles, authors or organizations, versions, dates and URLs. Explain essentials in the body; optional numbered citations link within this document.'],
  ];
  const modeName = mode === 'deep' ? 'Deep Reading' : 'Brief Reading';
  const depthInstruction = lang === 'zh-CN'
    ? (mode === 'deep' ? '遵循 references/deep-reading.md：完整重建核心机制、推导与证据；保留覆盖记录，所有适用深度维度须达到 3。' : '解释主问题、关键机制与公式、决定性证据及限制；次要细节可选择展开。')
    : (mode === 'deep' ? 'Follow references/deep-reading.md: reconstruct core mechanisms, derivations and evidence; retain a coverage record and reach 3 in every applicable depth dimension.' : 'Explain the main question, key mechanisms and equations, decisive evidence and limits; secondary detail may be selective.');
  const readerInstruction = lang === 'zh-CN'
    ? '默认面向具备相关基础、尚未读过此文的科研工作者；按已知读者背景调整必要解释。交付前按 references/learner-experience.md 检查解释缺口与冗余，教程须逐节及沿推荐路线检查。'
    : 'Default to a researcher with relevant foundations who is new to this paper; adapt to the stated background. Use references/learner-experience.md to check gaps and redundancy; for tutorials inspect every chapter and the recommended route.';
  const draft = lang === 'zh-CN' ? '未完成草稿 — 尚未阅读' : 'UNFINISHED DRAFT — NOT A COMPLETED READING';
  const warning = lang === 'zh-CN'
    ? '本文件由初始化命令创建。它只包含待办内容，尚未访问或核验论文，不能作为论文解读交付。'
    : 'Created by the initializer. This file contains only TODOs. No paper has been accessed or verified; do not deliver it as a completed reading.';
  const source = `<!-- paper-reading-lang: ${lang} -->\n<!-- paper-reading-theme: ${theme} -->\n<!-- paper-reading-mode: ${mode} -->\n# ${draft}: ${title}\n\n> **${draft}.** ${warning}\n\n${lang === 'zh-CN' ? '论文输入' : 'Paper input'}: ${paper}\n\nTODO: ${depthInstruction} ${readerInstruction}\n\n<!-- Audit: TODO source identity/version, access/coverage gaps, assumed background, substantive walkthrough repairs and verification limits. Deep also needs its coverage table. Use one compact record; interaction assumptions/checks belong here if relevant. -->\n\n${headings.map(([heading, instruction], i) => `## ${String(i + 1).padStart(2, '0')} / ${heading}\n\nTODO: ${instruction}\n`).join('\n')}`;
  const renderer = path.join(__dirname, 'render-reading.cjs');
  const quote = value => `'${value.replace(/'/g, `'\\''`)}'`;
  const renderCommand = `node ${quote(renderer)} ${quote(path.join(destination, 'reading.md'))} ${quote(path.join(destination, 'reading.html'))}`;
  const brief = lang === 'zh-CN' ? `# 阅读任务说明\n\n状态：**未开始**。初始化仅创建输入文件；它没有下载论文、生成科学结论或完成 HTML。\n\n- 论文：${title}\n- 输入：${paper}\n- 语言：中文\n- 主题：${theme}\n- 模式：${modeName}\n- 审计源：[reading.md](reading.md)\n- 素材目录：assets/\n\n## 发给 Agent 的请求\n\n使用 $paper-reading 按 ${modeName} 模式阅读上述论文。${depthInstruction} ${readerInstruction} 先核验身份、版本和完整材料，按论文类型重建机制与证据，再补全 reading.md。保留原文定位，明确区分论文陈述、观察与读者推断。需要的图片放入 assets/。完成质量门槛与实际 HTML 检查后，再移除草稿标记。材料不足时明确说明缺口。\n\n## 渲染命令\n\n在 skill 目录运行 npm ci 后，可用以下命令预览；占位内容能成功渲染并不代表已完成阅读。\n\n\`\`\`bash\n${renderCommand}\n\`\`\`\n\n质量门槛见安装目录中的 evals/reading-quality.md；输入契约见 references/renderer-format.md。\n` : `# Reading brief\n\nStatus: **not started**. Initialization only creates editable inputs; it does not download a paper, produce scientific conclusions, or complete an HTML atlas.\n\n- Paper: ${title}\n- Input: ${paper}\n- Language: English\n- Theme: ${theme}\n- Mode: ${modeName}\n- Audit source: [reading.md](reading.md)\n- Asset directory: assets/\n\n## Request for your agent\n\nUse $paper-reading in ${modeName} mode. ${depthInstruction} ${readerInstruction} Verify identity, version, and full source access first. Reconstruct its mechanism and evidence using the appropriate paper-type route, then complete reading.md. Preserve source locations and distinguish paper statements, observations, and reader inferences. Save necessary figures in assets/. Remove the draft warning only after applying the quality gates and inspecting the actual HTML. If source material is missing, report the gap.\n\n## Render command\n\nAfter running npm ci in the installed skill directory, preview with this command. A renderable placeholder is not a completed reading.\n\n\`\`\`bash\n${renderCommand}\n\`\`\`\n\nFind the quality gates at evals/reading-quality.md and the input contract at references/renderer-format.md in the installed skill.\n`;

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.mkdirSync(destination); // Fail safely if another process created the target after the preflight.
  fs.mkdirSync(path.join(destination, 'assets'));
  fs.writeFileSync(path.join(destination, 'reading.md'), source, { flag: 'wx' });
  fs.writeFileSync(path.join(destination, 'brief.md'), brief, { flag: 'wx' });
  console.log(`Created unfinished reading inputs: ${destination}`);
  console.log('Files: reading.md, brief.md, assets/');
  console.log('Next: give brief.md and the paper to your agent. This command has not read the paper.');
}

try { main(); } catch (error) {
  console.error(`Cannot initialize reading: ${error.message}`);
  process.exitCode = 1;
}
