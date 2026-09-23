# Paper Reading Skill

**把一篇论文读成一份可视化阅读图谱。** 先掌握全局论证，再沿方法或证明进入关键机制，并结合真实设置与数据理解实验。普通的“读这篇论文”默认生成一份完整、可离线阅读的 HTML 深读文档。

[项目主页 →](https://xiaofengshi.github.io/paper-reading-skill/zh.html) · [阅读 MiMo-V2.6 完整样例 →](https://xiaofengshi.github.io/paper-reading-skill/mimo-v2.6-deep-read.html) · [English](README.md)

![MiMo-V2.6 阅读图谱预览：把论文全局、RL 机制和实验证据连在一起。](docs/assets/atlas-preview.svg)

## 看一份完整深读

[MiMo-V2.6 样例](https://xiaofengshi.github.io/paper-reading-skill/mimo-v2.6-deep-read.html)是一页中文完整文档：从研究问题和训练路径，读到 RL 目标、GRS/GAR 评分、运行系统、MOPD2 与各项实验。它包含完整的关键 Eq. 1、教学算例、紧邻解释的原论文图摘录、数值对照和可选显示的 PDF 定位。交互图只作补充；主要解释不依赖交互也能读懂。

样例基于一份 44 页的本地 PDF 编写，仓库不分发该 PDF。作者后来[更新了在线报告](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/commit/73875d00b30a89ef8cc353a0b60b0e9f9561952d)；样例已采用修正后的 Pro 激活参数数值，其他版本差异尚未逐页核对。

## 你会得到什么

1. **全局认知图。** 研究问题、场景、主要想法、贡献及证据进入的位置。
2. **方法或论证路径。** 输入、阶段、分支、反馈和输出，并解释重要箭头的含义。
3. **机制放大。** 必要的定义、公式、假设，以及有帮助时的具体算例。
4. **实验图谱。** 每个问题对应的设置、对照、指标、观察结果与可支持的解读。
5. **综合理解。** 把方法与证据重新连起来，并把限制放在相应结论旁边。

图负责引导阅读；正文、公式、表格和原论文图承载细节。原文位置默认不显示，但需要核对时可以展开。最终交付是一份离线可读的 HTML，另附作为审计源的 Markdown。

## 开始使用

**Codex 与 Kimi Code：** 把仓库安装为个人 skill，再安装渲染依赖。仓库附带的 HTML 渲染器需要 Node.js 20 或更新版本。

```bash
mkdir -p "$HOME/.agents/skills"
git clone https://github.com/xiaofengShi/paper-reading-skill.git "$HOME/.agents/skills/paper-reading"
npm ci --prefix "$HOME/.agents/skills/paper-reading"
```

**Claude Code：** 改用它的个人 skill 目录。

```bash
mkdir -p "$HOME/.claude/skills"
git clone https://github.com/xiaofengShi/paper-reading-skill.git "$HOME/.claude/skills/paper-reading"
npm ci --prefix "$HOME/.claude/skills/paper-reading"
```

重新打开 agent 会话，附上 PDF 或给出可访问的论文链接，然后说：**“深入阅读这篇论文，给我一份可视化 HTML 文档，讲清主线、重要公式和实验。”** Skill 名称是 `paper-reading`；也可以在 Codex 输入 `$paper-reading`，在 Claude Code 输入 `/paper-reading`，在 Kimi Code 输入 `/skill:paper-reading`。Agent 必须能访问论文并完成科学阅读；本项目提供阅读流程与渲染器，并非把任意 PDF 自动转换成已核实解读的服务。

只有需要快筛时才要求概览；需要审稿或与自己的研究比较时，再要求额外视角。普通读论文请求以理解论文为主。

## 工作方式

[Skill 指令](SKILL.md)引导 agent 依次建立全局认知、重建全文、编写解释并核对来源。[论文类型协议](references/paper-types.md)为实证、系统、基准、数据集、理论和综述论文选择合适图形；[可视化阅读规则](references/visual-reading.md)要求图示与解释、证据对应。[阅读模式](references/reading-modes.md)定义可选的快筛、审稿和研究视角。

仓库附带的[渲染器](scripts/render-reading.cjs)把 Markdown 审计源与本地图形生成单文件 HTML，内嵌图片、图示、KaTeX 数学排版和字体。英文 Markdown 可在首行添加 `<!-- paper-reading-lang: en -->`，让导航和图表标签也使用英文。Archify 可以呈现可选的交互结构图，但构建不依赖 Archify 或其他本地 skill。[MiMo Markdown 源](examples/mimo-v2.6-deep-read.md)及图形输入展示了格式；它们是构建材料，不要求读者分别打开。

本地重建已发布样例：

```bash
npm ci
npm run build:example
npm test
```

## 验证与适用范围

MiMo-V2.6 文档展示了一次完整的实证技术报告深读。渲染测试覆盖行内与独立公式、原文位置开关、原图上下文和数值图行为。这些检查验证排版与生成契约，不等于独立核证每一条科学解读。Skill 已描述其他论文类型的阅读路径，但尚无同等完整的公开样例或跨论文用户评估。

阅读方法参考了[Keshav 的三遍阅读法](https://systems.cs.columbia.edu/ds2-class/papers/keshav-paper.pdf)、[Novak 与 Cañas 的概念图方法](https://cmap.ihmc.us/publications/researchpapers/theoryunderlyingconceptmaps.pdf)及[SciDoc2Diagrammer-MAF](https://aclanthology.org/2024.findings-emnlp.780/)。[Archify](https://github.com/tt-a1i/archify)是可选的交互结构图呈现工具。科学内容仍须对照论文核查。

欢迎在 [GitHub Issues](https://github.com/xiaofengShi/paper-reading-skill/issues)提交问题、缺陷或其他论文类型的样例。项目使用 [MIT 许可证](LICENSE)。

## 维护说明

本文是[中文主页](https://xiaofengshi.github.io/paper-reading-skill/zh.html)的内容源；[README.md](README.md)是默认[英文主页](https://xiaofengshi.github.io/paper-reading-skill/)的内容源。修改任一语言后运行 `npm run build:docs`，将生成的 HTML 与 Markdown 一同提交。主页生成器见 [scripts/build-docs.cjs](scripts/build-docs.cjs)。
