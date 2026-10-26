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
  const accepted = new Set(['--out', '--title', '--paper', '--lang', '--theme']);
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
  if (!['en', 'zh-CN'].includes(lang)) throw new Error('Supported languages: en, zh-CN.');
  if (!['forest', 'cobalt', 'plum', 'saffron'].includes(theme)) throw new Error('Supported themes: forest, cobalt, plum, saffron.');
  const destination = path.resolve(options['--out']);
  if (fs.existsSync(destination)) throw new Error(`Destination already exists; nothing was changed: ${destination}`);

  const text = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/[\\`*{}\[\]()#+.!|_$]/g, '\\$&');
  const title = text(options['--title']);
  const paperInput = options['--paper'];
  const localInput = paperInput && !/^[a-z][a-z\d+.-]*:\/\//i.test(paperInput) &&
    (/(?:^|[\\/])[^\\/]+\.pdf$/i.test(paperInput) || fs.existsSync(paperInput));
  const paper = paperInput ? text(localInput ? path.resolve(paperInput) : paperInput) : (lang === 'zh-CN' ? '待填写：论文链接或本地 PDF' : 'TODO: paper URL or local PDF');
  const headings = lang === 'zh-CN' ? [
    ['论文身份与覆盖', '核验标题、作者、版本、源链接或本地路径。记录已经读取的章节、附录和缺失材料；无法确认的状态保持 unknown。'],
    ['全局问题与贡献', '用原论文证据说明问题、研究场景、核心想法和主要贡献。此处尚未完成阅读。'],
    ['主路径与设计理由', '重建输入、转换、分支、输出及必要假设；按论文类型选择方法路径、证明依赖或数据构建路径。'],
    ['关键机制与推演', '解释关键变量和完整公式、证明或协议。只在帮助理解时加入明确标注的教学例子，并核对原图。'],
    ['决定性证据', '把主要问题与设置、对照、指标、分母、观察和有边界的解释连接起来；没有实验的论文使用实际证据类型。'],
    ['综合与限制', '说明机制与证据共同支持什么，以及哪些结论仍未确定。完成质量门槛后再把草稿标记为深读成品。'],
  ] : [
    ['Source identity and coverage', 'Verify the title, authors, version, source URL or local path. Record sections and appendices actually read, and missing material. Keep unverified states unknown.'],
    ['Question and contribution', 'Explain the problem, setting, central idea, and contribution from paper evidence. The reading has not been completed yet.'],
    ['Main path and design reasoning', 'Reconstruct inputs, transformations, branches, outputs, and assumptions. Choose a method path, proof dependency, or data construction route that fits the paper.'],
    ['Mechanism and worked explanation', 'Define variables and explain the full relevant equation, proof, or protocol. Label teaching examples and verify original figures where useful.'],
    ['Decisive evidence', 'Connect each major question to its setup, comparator, metric, denominator, observation, and bounded interpretation. Use the paper’s actual evidence type.'],
    ['Synthesis and limits', 'Explain what the mechanism and evidence establish together, and what remains uncertain. Complete the quality gates before marking the draft as a finished deep read.'],
  ];
  const draft = lang === 'zh-CN' ? '未完成草稿 — 尚未深读' : 'UNFINISHED DRAFT — NOT A DEEP READ';
  const warning = lang === 'zh-CN'
    ? '本文件由初始化命令创建。它只包含待办内容，尚未访问或核验论文，不能作为论文解读交付。'
    : 'Created by the initializer. This file contains only TODOs. No paper has been accessed or verified; do not deliver it as a completed reading.';
  const source = `<!-- paper-reading-lang: ${lang} -->\n<!-- paper-reading-theme: ${theme} -->\n# ${draft}: ${title}\n\n> **${draft}.** ${warning}\n\n${lang === 'zh-CN' ? '论文输入' : 'Paper input'}: ${paper}\n\n<!-- Interaction decision: TODO after reconstructing the paper; choose a static or interactive view for a specific reading need. -->\n\n${headings.map(([heading, instruction], i) => `## ${String(i + 1).padStart(2, '0')} / ${heading}\n\nTODO: ${instruction}\n`).join('\n')}`;
  const renderer = path.join(__dirname, 'render-reading.cjs');
  const quote = value => `'${value.replace(/'/g, `'\\''`)}'`;
  const renderCommand = `node ${quote(renderer)} ${quote(path.join(destination, 'reading.md'))} ${quote(path.join(destination, 'reading.html'))}`;
  const brief = lang === 'zh-CN' ? `# 阅读任务说明\n\n状态：**未开始**。初始化仅创建输入文件；它没有下载论文、生成科学结论或完成 HTML。\n\n- 论文：${title}\n- 输入：${paper}\n- 语言：中文\n- 主题：${theme}\n- 审计源：[reading.md](reading.md)\n- 素材目录：assets/\n\n## 发给 Agent 的请求\n\n使用 $paper-reading 深读上述论文。先核验身份、版本和完整材料，按论文类型重建机制与证据，再补全 reading.md。保留原文定位，明确区分论文陈述、观察与读者推断。需要的图片放入 assets/。完成质量门槛与实际 HTML 检查后，再移除草稿标记。材料不足时明确说明缺口。\n\n## 渲染命令\n\n在 skill 目录运行 npm ci 后，可用以下命令预览；占位内容能成功渲染并不代表已完成阅读。\n\n\`\`\`bash\n${renderCommand}\n\`\`\`\n\n质量门槛见安装目录中的 evals/reading-quality.md；输入契约见 references/renderer-format.md。\n` : `# Reading brief\n\nStatus: **not started**. Initialization only creates editable inputs; it does not download a paper, produce scientific conclusions, or complete an HTML atlas.\n\n- Paper: ${title}\n- Input: ${paper}\n- Language: English\n- Theme: ${theme}\n- Audit source: [reading.md](reading.md)\n- Asset directory: assets/\n\n## Request for your agent\n\nUse $paper-reading to read this paper deeply. Verify identity, version, and full source access first. Reconstruct its mechanism and evidence using the appropriate paper-type route, then complete reading.md. Preserve source locations and distinguish paper statements, observations, and reader inferences. Save necessary figures in assets/. Remove the draft warning only after applying the quality gates and inspecting the actual HTML. If source material is missing, report the gap.\n\n## Render command\n\nAfter running npm ci in the installed skill directory, preview with this command. A renderable placeholder is not a completed reading.\n\n\`\`\`bash\n${renderCommand}\n\`\`\`\n\nFind the quality gates at evals/reading-quality.md and the input contract at references/renderer-format.md in the installed skill.\n`;

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
