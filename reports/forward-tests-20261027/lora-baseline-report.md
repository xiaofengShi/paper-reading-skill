# LoRA v2 首次前向运行报告

状态：实际完成指定版本的中文深读 HTML；未修改仓库、未安装到活动技能目录、未外部发布。此报告是一名 AI 作者的前向运行与自查，不是真人理解研究或独立盲评。

- 首个可核实时刻：2026-10-26 16:38:55 UTC（北京时间 2026-10-27 00:38:55）
- 最终功能检查：2026-10-26 16:47:44 UTC（北京时间 2026-10-27 00:47:44）
- 完成功能检查的可核实区间耗时：8 分 49 秒；报告完成于 16:49:30 UTC，从首个可核实时刻至报告为 10 分 35 秒。最初阅读 SKILL 的调用略早于首个带时间的命令，故不把此区间称作精确总耗时。
- 交付 HTML：`/tmp/paper-reading-baseline-forward/lora-deep-read.html`，571,954 bytes
- 审计源：`/tmp/paper-reading-baseline-forward/lora-deep-read.md`，6 章；渲染器报告 10 个 visual slots
- 浏览器检查：25 个 KaTeX 数学节点、2 张原图、6 个章节，桌面/390px 移动版、来源显隐、数据展开、无脚本与断网模式

## 输入与隔离

原论文：Hu 等，LoRA: Low-Rank Adaptation of Large Language Models，arXiv:2106.09685v2。

从 `https://arxiv.org/abs/2106.09685v2` 检查版本记录，再从 `https://arxiv.org/pdf/2106.09685v2` 下载 PDF。下载后实际 PDF 共 26 页，第一页标记 Version 2，页脚明确为 `arXiv:2106.09685v2 [cs.CL] 16 Oct 2021`。文件 SHA-256 为 `e9a0d3128767db616085dc0f4e6e455e672e89af823e8ed1282793682787395a`。PDF metadata 创建时间与 arXiv 修订日不同，身份以版本页脚和指定 URL 核验，不凭 metadata 日期推断新版本。

没有读取仓库已有 LoRA 阅读案例、答案或公开生成 HTML。按 SKILL 打开的 `evals/reader-tasks.md` 自带其他论文参考答案；它不含本次 LoRA 目标答案，但会给出已有案例的文风。这是测试材料隔离的一项瑕疵，已记录，后续没有继续使用该文件。读取的主要材料是 SKILL、本次必需的引用文档、renderer、CSS、package/lock、质量门槛，以及本次指定 PDF。

因为任务禁止修改仓库，将 `scripts/`、`package.json`、`package-lock.json` 和 `assets/reading.css` 复制到 `/tmp/.../skill-runtime/`，在副本执行 `npm ci` 和 renderer。未运行 gallery/example 的构建，没有借用已有案例生成内容。PDF 处理环境位于 `/tmp/.../pdf-env/`。

## 实际完成的科学阅读

阅读主文 pp.1–13，重点核验 §2 的任务目标、§4 的参数化/合并、§5 的实验和 §7 的低秩分析；读相关附录 A–H 的数据与协议，参考文献列表只作导航。所有中央结果均可访问。

页面包括：

1. 冻结底座与任务增量的区别；单矩阵参数比例 r(d+k)/(dk)
2. 含 alpha/r 的前向公式和条件语言建模目标；可手算的 4×3 rank-1 教学例
3. checkpoint、训练显存、吞吐与推理延迟的不同分母
4. Table 4 的完整 GPT-3 对照表；0–100 公共尺度下两项准确率的重绘和数据表
5. GLUE 协议分组、最佳验证表现、种子统计、跨来源基线的解释边界
6. Table 5/6 的矩阵分配与 rank 扫描、Fig.3 原图和子空间相似度、Table 7 的放大解释
7. GPT-2、少数据 MNLI、组合 prefix 等附录证据，保留反例与限制

额外发现并在相关事实旁处理的原文问题：

- p.5 正文“25% speedup”与吞吐量 32.5→43.1 tokens/s 的分母不同；页面保留原数，并计算吞吐 +32.6%、每 token 时间约 −24.6%，不强行将二者视为同一比例。
- Table 4 的 4.7M 不是固定 Wq/Wv,r=1 设置。Table 15 的 MNLI 91.7 对应 Wv,r=2；Wq/Wv,r=1 为 91.3。
- Table 5 caption 的“Wq/Wv overall best”不能代替实际格子：四矩阵预算组 WikiSQL 同为73.7、MNLI 91.7 高于91.3。
- Appendix G p.24 与正文 Eq.4 的相似度/距离关系存在排版代数错误。已将该原式截图核验；正文使用 Eq.4，不把附录错误当成正确公式。

这些是本次 AI 阅读判断，尚未由独立研究者复核。

## 命令与过程证据

可重现的重要命令（均实际执行）如下；读取/复制文件使用的短 Python 脚本和终端读文件命令未逐行重复列出。

```sh
curl -fL --retry 2 'https://arxiv.org/pdf/2106.09685v2' -o /tmp/paper-reading-baseline-forward/materials/lora-2106.09685v2.pdf
shasum -a 256 /tmp/paper-reading-baseline-forward/materials/lora-2106.09685v2.pdf
python3 -m venv /tmp/paper-reading-baseline-forward/pdf-env
/tmp/paper-reading-baseline-forward/pdf-env/bin/pip install pymupdf
# 在 /tmp/paper-reading-baseline-forward/skill-runtime 执行
npm ci
node /tmp/paper-reading-baseline-forward/skill-runtime/scripts/render-reading.cjs /tmp/paper-reading-baseline-forward/lora-deep-read.md /tmp/paper-reading-baseline-forward/lora-deep-read.html
node /tmp/paper-reading-baseline-forward/check-render.cjs
node /tmp/paper-reading-baseline-forward/check-interaction.cjs
npm audit --json
```

PDF 文本提取、页渲染、原图裁切使用 PyMuPDF。裁切位置与所含文字保存在 `logs/crop-provenance.json`；源 PDF/提取文本/metadata 在 `materials/`。自动浏览器检查脚本本身保存在顶层。截图和 JSON 报告在 `logs/`。

## 摩擦、失败和修复

| 摩擦/失败 | 实际处理 | 可复用建议 |
|---|---|---|
| SKILL 要求 fresh checkout 先 npm ci；测试又要求仓库只读 | 复制 renderer/package/lock/CSS 到隔离目录后安装 | 支持外部 runtime 或提供 `run-reading` bootstrap 会减少这种绕路 |
| 系统 Python 无 fitz、pypdf、pdfplumber；bundled runtime 有 pypdf/pdfplumber，但无 fitz | 独立 venv 安装 PyMuPDF | 引用 recipe 只给 `pip install pymupdf`，首次用户仍需自行处理 venv、可执行路径和依赖 |
| 最新 PyMuPDF 首次解析候选下载后回退到兼容版本；安装最终成功 | 使用解析器选择的1.28.2 | 约8秒安装，出现 fitz deprecated 提示，建议 recipe 改 `import pymupdf` |
| npm ci 成功但报告一个 low 风险 | 保留 npm-audit.json，不擅改被测版本 | 锁定 KaTeX0.16.22，advisory GHSA-238p-pmpm-9mq7；本次没有证明可利用 |
| bundled Playwright 包存在，但预期 Chromium 二进制缺失 | 用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` headless 启动 | `logs/browser-check.log` 保存首次失败；不是 renderer 失败 |
| 显示来源后长 SHA-256 撑宽390px页面到522px | 在 Markdown provenance 的 hash 中加入 `<wbr>`，不改 CSS | renderer/CSS 可以默认对 source-ref 的长 token 断行 |
| 第一轮把 lazy image 未加载误判成 complete=false | 显式 eager/decode 等待并滚动检查无脚本场景 | 两张图最终均加载成功；懒加载不是破图 |
| 测试脚本错误将来源控件当 button，30秒超时 | 根据实际 DOM 改为 checkbox，并测试 Space | 实际控件有 label 和焦点样式，键盘功能通过；这是本次测试脚本错误 |
| 平滑锚点滚动时立即检查 heading，初次得到 false | 等待目标进入可视区域后检查 | 实际章节跳转通过，未改变产品行为 |

首次 render 已成功，无 JSON/数学语法修复。第二次 render 仅加入 provenance 长字符断行。未修改被测 renderer。

## 验证结果与边界

| 质量门槛 | 本次结论与证据 |
|---|---|
| 原文身份与覆盖 | pass：指定 v2 PDF、26页，主文与中央附录可读；PDF 页脚与 URL 一致 |
| 科学忠实度 | pass（AI 作者自查）：中心公式、表格/分母和图像对应逐项核对；未做独立同行复核 |
| 主张到证据 | pass（内容自查）：每项核心结论有设置/对照/观察/边界，原文页码保留于审计源与可显示来源层 |
| 独立可读内容 | pass（结构与自查）：页内有机制、完整目标、手算例和关键数据；真人是否读懂 unknown |
| 视觉与交互选择 | pass（结构）：选择静态视图的理由记录在源末注释；来源/数据控件键盘通过；未使用 GLM-5.3-Flash 图像代理，因当前代理工具不提供该模型，不能声称完成指定模型视觉验收 |
| 交付完整性 | pass（自动化+作者看图）：单文件、两图加载、25个数学节点、所有章锚点有效；离线0个HTTP请求，控制台0错误；390px sources on/off 均 bodyWidth=390；无JS仍可读 |

浏览器 `logs/render-check.json` 与 `logs/interaction-check.json` 是最终实际结果。`logs/desktop-first.png`、`mobile-first.png`、`mobile-mechanism.png`、`mobile-experiments.png`、`nojs-section5.png` 为对应截图。print CSS 只检查所有 h2 可见并生成截图，没有验证真实打印分页质量或导出打印PDF。

未验证：真实读者理解、真人偏好、学习时间、原论文实验复现、真实训练显存/吞吐量/延迟、其他浏览器、设备屏幕、全部辅助技术、网络来源日后持续可用性、后续版本模型表现。未因编译或截图成功宣称这些通过。

## 对技能产品的测试结论

此次结果表明，当前技能足以引导代理从新论文材料完成较完整的中文深读，renderer 的输入契约在首次 authoring 中没有导致构建失败。主要人工/代理成本仍在获取与验证证据、依赖准备、页面实际检查；不能把 571KB HTML 的成功生成等同于阅读效果已证实。

最值得改进的是：提供无需理解安装环境的首次运行入口、把 narrow-screen/source toggle 这种真实故障纳入回归检查、提供生成来源元数据与质量记录的轻量脚手架、把公共 reader questions 设计为不给作者答案的测试协议。对于“爆款”目标，这一次测试只能证明功能可行，不能证明它比竞品更有吸引力。
