# 11 篇示例的新 Skill 重构与验证

日期：2026-10-27。范围：现有 **11 篇阅读、10 篇不同论文**，保留 4 篇英文与 7 篇中文。重构基线为本地提交 `64d9e99`，使用该版本的 Skill、教学桥梁、原生证据展开与理解检查契约。没有用固定模型批量生成来冒充受控评测，也没有从公开答案键反向编写正文。

**内容重构已完成。** 每篇说明读者与三个学习目标，沿具体机制或操作读到证据和限制；共 45 道原生理解题，包含换输入、换预算或换协议的迁移题。计数只用于交付核对，不代表质量分数或理解提升。

## 打开重构后的阅读

| 阅读与语言 | 固定来源 | 这次可实际跟算或追踪的内容 |
|---|---|---|
| [LoRA · 中文](../docs/lora-deep-read.html) | arXiv 2106.09685v2 | 初始化后第一次 SGD 参数变化、第二次梯度；矩阵前向、合并、子空间与预算 |
| [ResNet · English](../docs/resnet-deep-read.html) | arXiv 1512.03385v1 | 标量反传到向量桥梁；56×56×64 到 28×28×128 的 shortcut，投影 8,192 个权重 |
| [Transformer · English](../docs/attention-is-all-you-need-deep-read.html) | arXiv 1706.03762v7 | shifted decoder 与 mask 的 token 表；数值注意力输出、位置编码、复杂度与 parsing |
| [DeepSeek · English](../docs/deepseek-v4.1-flash-deep-read.html) | 官方 51 页 PDF，上传提交 53e70b1 | CED 投影/工作量、CSA2 候选选择、近似重放、effort 边际成本；完整协议 |
| [DeepSeek · 中文](../docs/deepseek-v4.1-flash-zh-deep-read.html) | 与英文同一 PDF / SHA-256 | 相同八章与关键数值，分清计算、运行 KV、持久 KV 和脚手架效应 |
| [MiMo · 中文](../docs/mimo-v2.6-deep-read.html) | 官方修订 44 页 PDF，提交 73875d0 | token 更新、GRS/GAR、长度门控、Sample Mixer、前缀蒸馏及开放 9B 实验 |
| [RAFT · 中文](../docs/raft-deep-read.html) | arXiv 2606.00147v1 | 同一问答的 SFT 与当前学生 rollout 两条轨迹；Top-K KL、EMA 滞后、保持率 |
| [MechVQA · English](../docs/mechvqa-deep-read.html) | arXiv 2605.30794v2 | 尺寸链到任务标签；元数据到答案与评委；reward、组优势和 ratio clipping |
| [IAR · 中文](../docs/iar-deep-read.html) | arXiv 2608.20281v1 | 文档到 Inject/Align 目标；Recover 验证选点、BPB 字节分母和 FAPM |
| [VISTA · 中文](../docs/vista-deep-read.html) | arXiv 2610.02200v1 | 三帧取证、RHAE 两关/三关计算；静态迷宫从检视到 39 题测量 |
| [OpenDS · 中文](../docs/opensds-world-deep-read.html) | arXiv 2610.30181v1 | 论文原任务的跨源链；访问标签并集、视频帧中点、加权准确率与执行预算 |

LoRA 与 ResNet 在紧接本轮之前已按新契约完成第一轮教学升级，本轮重新核对固定原源并补齐实际参数更新/维度变化，不通过无意义的表面改写增加篇幅。其他九篇重构了主线、推演和理解题。所有关键原图保留；DeepSeek 英文以成本表、全局图和路径替代旧编辑 SVG，并补齐与中文一致的原图；VISTA 接入已有的六张补充原图。原稿由不同 Agent 产生的标签已从入口移除，避免把本轮人工指令下的 AI 重构描述成未经修改的模型样本。

## 纠正了哪些内容问题

- **来源与角色：** RAFT 的融合模型是原文 §3.2 的 Qwen3-3B；D-Acc 评估的 Qwen3-32B 承担另一角色。MiMo 统一修订版的 Pro 1.02T 总参数 / 42B 激活参数。
- **公式与测量：** MechVQA 优势归一化的 epsilon 位于分母，API 失败的评委从投票中排除；Total 的精确聚合未在源文明确给出。MiMo 比率门控与非生成片段遮罩分开解释。
- **图表与配置：** IAR 的 CC Llama 箭头是左上，FAPM 的不同起点不混成一组对照；OpenDS 图 5 的任务/证据条目分母与起始视频范围分开。
- **主张范围：** DeepSeek 的 mini-SWE 在 DeepSWE 得 74.2%，DSH Minimal 为 72.6%，后者只在 TB 2.1 领先；跨脚手架 effort 精度存在平台和回落。EMA 不保证逐步损失或梯度相等，跨模型预算消耗不能确定增加预算的因果效果。

论文自身的矛盾继续就地可见：Transformer 英法 41.0/41.8、RAFT 14.7/14.8、LoRA 37.7M 配置、MechVQA Fig.2c 与主表等，均没有替作者补造唯一答案。完整长表可展开，决定结论的反例和条件保留在主线。

MiMo 旧/新两版 44 页逐页文本仅 p6 Table 1 的 42T→42B 不同。七幅保留裁图所在页的文本与 72dpi RGB 渲染字节逐一相同；正文保留旧裁图 provenance，数值与公式统一新主源。该检查确认来源内容同一性，不是视觉审美结论。

## 审核与验证

作者核对与内容审核分开执行。另一位未参与撰写的 AI 审核者重新计算关键新增算例、复核十份不同论文的源文件 SHA-256，检查关键原源、反例与双语一致性。发现并修正四处旧答案键冲突：MechVQA Total、DeepSeek effort 边界、OpenDS 人工验证/预算归因、MiMo 比率遮罩；同时校准 OpenDS 局部绝对措辞。最终复查没有留下该审核发现的阻断项。这不是真人盲审或全文逐字正确性保证。

本轮执行环境为 Node.js v26.12.0；没有在本机额外运行 Node 20/22/24 矩阵。

| 检查 | 实际结果与边界 |
|---|---|
| 全量自动测试 | `npm test`：42 passed，0 failed。旧 gallery 断言按新结构同步，保留实验图谱要求，并加强实际原图字节、读者/目标与四题断言 |
| 示例构建 | 11 篇均成功生成；源文件语言、三个目标、45 道题与基线/新源哈希记录在 manifest |
| 原源与算术 | 四组作者复核及跨作者 AI 抽查；SGD、投影、attention、KL、EMA、RHAE、BPB、reward、加权分母等复算通过；不是训练或 benchmark 重跑 |
| 宽屏浏览器 | 1280px 下 11 页无整页横向溢出；实际滚动到原图并展开 VISTA 支持证据后全部图片加载；无缺失片段锚点或 KaTeX 错误 |
| 窄屏浏览器 | 390px 下 11 页默认及支持证据展开/来源显示状态均无整页横向溢出；每页用键盘展开一题答案及全部支持证据，来源开关生效 |
| 本轮页面修复 | VISTA 工具代码块改为局部横向滚动；OpenDS 长工具名在卡片内换行，修后重新验证全部页面 |
| 交互回归 | MiMo 两个辅助交互可展开，键盘聚焦 GRS、点击聚焦混合 RL/GAR；LoRA 输入追踪由现有自动代数测试覆盖，前一提交已完成控件浏览器操作 |
| 生成新鲜度与工具检查 | `check:examples`、`check:docs`、`check:audit` 均通过；`doctor` 离线合成样例与 Skill `quick_validate.py` 通过；`git diff --check` 通过 |
| 入口与链接 | 中英文入口及本报告在 390px 下无整页横向溢出，各有 11 个不同阅读链接；浏览器实际从中文入口进入本报告再打开 LoRA 成功；生成报告中的阅读链接修正为相对当前 `docs` 目录 |

交付前执行的命令：

```bash
npm run build:examples
npm test
npm run build:docs
npm run build:audit
npm run check:examples
npm run check:docs
npm run check:audit
npm run doctor
python3 /Users/xiaofeng/.codex/skills/skill-creator/scripts/quick_validate.py .
git diff --check
```

第一轮自动测试暴露旧页面断言，已按真实源结构修正并保留原有完整性要求；后续全量 42/42 通过。第一轮窄屏检查确实找到 VISTA/OpenDS 两处溢出，修复后 11 页全部复测通过。初次图片加载检查把未进入视口/折叠区的 lazy 图片识别为未加载，随后实际逐图滚动并展开支持区确认，不把懒加载误报为缺图。

## 证据文件与未验证项

可复核材料在仓库 `reports/example-rebuild-20261027/`：

- `classic-benchmark.md`：Transformer、RAFT、OpenDS 的固定源、范围、算例和原文冲突。
- `model-reports.md`：DeepSeek 双语、MiMo 的固定提交、公式协议与版本同一性。
- `agent-research.md`：VISTA、IAR、MechVQA 的 PDF/TeX、算术与覆盖。
- `lora-resnet.md`：两篇的重新取源和新增操作推演。
- `cross-review.md`：分离作者的 AI 核查、四项答案键修正和复查闭环。
- `manifest.json`：Skill 契约及 11 份基线/新源的 SHA-256、语言、目标和题数。
- `browser-checks.json`、`delivery-page-checks.json` 与 `gallery.png`：浏览器布局、原生控件、图片加载及交付入口的证据。

核心正文、公式和原图由 renderer 内嵌，构建检查拒绝未解析的外部资源；本轮没有执行真实断网重载、禁用脚本重载或打印预览。没有开展真人理解前后测，也没有复现论文训练、游戏、评委调用或活网页证据链。工作区要求的 GLM-5.3-Flash 图像分析工具当前不可用，所以只报告实际 DOM/布局/交互与截图证据，不给正式视觉验收或审美评分。

本轮在本地完成源、生成页面和审计记录。没有推送远端、部署 Pages、创建 release 或改写历史评估快照。热度和传播效果尚未测量。
