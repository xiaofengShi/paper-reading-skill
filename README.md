# Paper Reading Skill

把论文读成一份**可探索、可追溯的深度阅读图谱**：先看全局，再顺着方法路径进入关键机制与实验，最后形成有边界的综合理解。普通的“读这篇论文”默认执行完整深读；只有明确要求快筛时才停在概览，审稿式批评和研究规划是按需增加的视角。

## 读者会得到什么

1. **全局认知图**：问题、研究场景、主要想法、贡献和证据所在位置。
2. **方法或论证流程图**：输入、关键步骤、反馈与输出；每条重要箭头有解释。
3. **机制放大**：必要定义、公式、算法、假设和一个便于理解的例子。
4. **实验图谱**：问题 → 设置/对照 → 指标 → 结果 → 能得出的结论，附 PDF 页码与图表号。
5. **综合理解**：把机制与实验重新连起来，说明已展示的结果、适用范围和仍待回答的问题。

这些层次按论文类型选择合适图形：方法论文常用工作流与机制图，理论论文常用定义与证明依赖图，基准论文常用构建流程与测量维度图。图负责导航，解释、公式、原始表格和来源定位仍保留在文字中。

## 使用方式

将仓库复制到 agent 的 skill 目录后，直接说“阅读这篇论文”并给出 PDF、arXiv 链接或本地文件。入口是 [SKILL.md](SKILL.md)。也可以指定任务：

| 请求 | 输出 |
|---|---|
| “完整读这篇论文，给我图谱” | 默认完整深读 |
| “快速看看值不值得读” | SCAN，初步全局图与主要结果 |
| “审查证据、找薄弱点” | 完整深读 + REVIEW 视角 |
| “与我的工作比较 / 准备复现” | 完整深读 + RESEARCH 视角 |

如果用户没有给研究目标，skill 不会替用户虚构“要批判这篇论文”的目的，也不会因初步相关性判断而中止已要求的深读。

## MiMo-V2.6 实操样例

[深读 Markdown](examples/mimo-v2.6-deep-read.md)从全局路径走到 GRS/GAR 机制与实验图谱。两个 Archify 交互图分别展示[训练主线](examples/mimo-v2.6.workflow.html)和[轨迹到学习信号](examples/mimo-v2.6-grading.workflow.html)，相应的 [JSON 源](examples/mimo-v2.6.workflow.json)与[评分图 JSON 源](examples/mimo-v2.6-grading.workflow.json)可以继续编辑。样例依据用户提供的 44 页本地 PDF，页码指 PDF 页码；它演示阅读形式，不声称对论文发布版本、代码或外部实验做了独立复核。

交互图由 [Archify](https://github.com/tt-a1i/archify) 渲染；它提供自包含 HTML、节点聚焦、路径探索和数据源校验。这里借用它表达**紧凑的结构/流程**，但不把科学证据判断交给绘图器。没有 Archify 时，skill 仍可输出 Markdown、Mermaid、SVG 或表格。

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
| [examples/mimo-v2.6-deep-read.md](examples/mimo-v2.6-deep-read.md) | 完整深读样例与来源标注 |

本项目采用 MIT 许可证，见 [LICENSE](LICENSE)。

## 文档维护

[项目网页](docs/index.html)的正文由本 README 生成，避免两份文字分别维护。安装 `package.json` 中的依赖后运行 `npm run build:docs`；生成器见 [scripts/build-docs.cjs](scripts/build-docs.cjs)。
