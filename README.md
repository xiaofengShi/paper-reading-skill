# Paper Reading Skill

把论文读成**一份可探索、可追溯的 HTML 深读文档**：先看全局，再顺着方法路径进入关键机制与实验，最后形成有边界的综合理解。普通的“读这篇论文”默认执行完整深读；只有明确要求快筛时才停在概览，审稿式批评和研究规划是按需增加的视角。

## 读者会得到什么

1. **全局认知图**：问题、研究场景、主要想法、贡献和证据所在位置。
2. **方法或论证流程图**：输入、关键步骤、反馈与输出；每条重要箭头有解释。
3. **机制放大**：必要定义、公式、算法、假设和一个便于理解的例子。
4. **实验图谱**：问题 → 设置/对照 → 指标 → 结果 → 能得出的结论；PDF 定位按需显示。
5. **综合理解**：把机制与实验重新连起来，说明已展示的结果、适用范围和仍待回答的问题。

这些层次在**同一份离线可读的 HTML** 中展开，按论文类型选择合适图形：方法论文常用工作流与机制图，理论论文常用定义与证明依赖图，基准论文常用构建流程与测量维度图。图负责导航，解释、公式、原始表格和来源定位仍保留在正文中。

## 使用方式

将仓库复制到 agent 的 skill 目录后，直接说“阅读这篇论文”并给出 PDF、arXiv 链接或本地文件。入口是 [SKILL.md](SKILL.md)。也可以指定任务：

| 请求 | 输出 |
|---|---|
| “完整读这篇论文，给我图谱” | 默认一份完整深读 HTML |
| “快速看看值不值得读” | SCAN，初步全局图与主要结果 |
| “审查证据、找薄弱点” | 完整深读 + REVIEW 视角 |
| “与我的工作比较 / 准备复现” | 完整深读 + RESEARCH 视角 |

如果用户没有给研究目标，skill 不会替用户虚构“要批判这篇论文”的目的，也不会因初步相关性判断而中止已要求的深读。

## MiMo-V2.6 实操样例

[打开 MiMo-V2.6 一体化深读 HTML](docs/mimo-v2.6-deep-read.html)：一页从全局训练路径读到 GRS/GAR、系统架构、MOPD2 和实验。正文直接解释阶段关系、评分公式与算例、实验对照和完整关键数据；原论文图在相关解释旁供核对，两幅 Archify 交互图供进一步探索。页内还有实验索引、数据图、七幅原论文图摘录与 PDF 定位。它参照 [MechVQA 项目页](https://xiaofengshi.github.io/MechVQA/)的单页阅读组织方式，内容与图示针对本论文重新编写。

两幅交互图的**节点、关系、说明与论文来源由 paper-reading 阅读流程整理并写成 JSON**；[Archify](https://github.com/tt-a1i/archify) 将 JSON 渲染成可探索的图。它们不是 Archify 自动读 PDF 的结果。最终 HTML 把这些图与其余正文、数据图、原图摘录放在一起；Archify 只负责结构图的呈现与结构校验，科学内容仍需回到论文核查。

样例依据用户提供的 44 页本地 PDF，页码指 PDF 页码；PDF 未随仓库分发。此文档演示完整阅读形式，不声称对论文发布版本、代码或外部实验做了独立复核。[Markdown 审计源](examples/mimo-v2.6-deep-read.md)、[训练图 JSON](examples/mimo-v2.6.workflow.json)、[评分图 JSON](examples/mimo-v2.6-grading.workflow.json)及对应 Archify HTML 是生成输入，不需要读者逐一打开。

本地重建样例：

```bash
npm ci
npm run build:example
```

构建器 [render-reading.cjs](scripts/render-reading.cjs) 从 Markdown 与仓库内的图形输入生成单文件 HTML，内嵌样式、图像和交互图；公式使用 KaTeX HTML 排版，并保留 MathML 供辅助技术读取。所需字体也内嵌在文件中。PDF 页码等核对信息保留在 Markdown 审计源中；HTML 默认隐藏，顶部的“显示原文定位”可按需展开。样例的两幅 Archify HTML 已作为输入保存在仓库；重建时不调用 Archify，也不依赖本机安装的其他 skill 或机器特定路径。新论文没有 Archify 图时，直接用内联 SVG、HTML 图表或其他合适图形完成阅读文档。运行 `npm test` 可检查行内/独立公式、首屏图谱、出处开关和数据图的生成契约。

## 方法依据与取舍

- [Keshav 的三遍阅读法](https://systems.cs.columbia.edu/ds2-class/papers/keshav-paper.pdf)提供“先全局、再内容、再细节”的阅读节奏。本 skill 在用户要求深读时完成后两遍，不把第一遍筛选当成默认终点。
- [Novak 与 Cañas 的概念图方法](https://cmap.ihmc.us/publications/researchpapers/theoryunderlyingconceptmaps.pdf)启发有标签的关系与跨分支连接；图中的关系必须能被论文文本解释。
- [SciDoc2Diagrammer-MAF](https://aclanthology.org/2024.findings-emnlp.780/)强调从文档到科学图示时的内容选择与忠实性检查。本 skill 要求图、文字和原论文位置能互相核对。
- [Archify](https://github.com/tt-a1i/archify)提供交互展现与确定性的结构/布局验证；图是否科学准确仍需回到论文核查。

## 仓库内容

| 路径 | 用途 |
|---|---|
| [SKILL.md](SKILL.md) | agent 入口与默认行为 |
| [references/visual-reading.md](references/visual-reading.md) | 图形选择、来源锚点、Archify 集成与检查 |
| [references/reading-modes.md](references/reading-modes.md) | 阅读深度与可选视角 |
| [references/paper-types.md](references/paper-types.md) | 不同论文类型的重点 |
| [references/critique-matrix.md](references/critique-matrix.md) | REVIEW 时使用的审稿矩阵 |
| [references/research-card.md](references/research-card.md) | RESEARCH 时可选的便携研究卡 |
| [docs/mimo-v2.6-deep-read.html](docs/mimo-v2.6-deep-read.html) | 一体化深读样例，读者入口 |
| [examples/mimo-v2.6-deep-read.md](examples/mimo-v2.6-deep-read.md) | HTML 的 Markdown 审计源 |

本项目采用 MIT 许可证，见 [LICENSE](LICENSE)。

## 文档维护

[项目网页](docs/index.html)的正文由本 README 生成，避免两份文字分别维护。安装 `package.json` 中的依赖后运行 `npm run build:docs`；生成器见 [scripts/build-docs.cjs](scripts/build-docs.cjs)。
