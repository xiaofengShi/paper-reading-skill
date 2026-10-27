# VISTA、IAR、MechVQA 示例重构核验

日期：2026-10-27。基线：`64d9e99259fd39e41d3418c319dcbc1018193310`。本记录由这三篇示例的改写者完成，属于 AI 辅助来源核对和静态交付检查；不是不同作者复核、独立读者研究或实验复现。

本代理只修改 `examples/vista-deep-read.md`、`examples/iar-deep-read.md`、`examples/mechvqa-deep-read.md` 和本报告。没有改共享 renderer、README/CHANGELOG、docs、资产文件或个人安装的 Skill；没有 commit/push。工作区其他作者的并行修改不在本报告的变更范围内。未读取 `evals/reader-tasks.md`、其答案或历史审计。

## 来源身份与取得方式

使用精确 arXiv 版本页确认题名、作者、版本日期；直接下载对应 PDF 和 TeX source 到 `/tmp/paper-reading-agent-research-20261027/`。以 PyMuPDF 取得全部页文本，并从 source archive 直接核对公式、表格、图注和相关附录。没有使用浏览器 UI。

| 示例 | 精确版本 | PDF 页数 | PDF SHA-256 | TeX source archive SHA-256 |
|---|---|---:|---|---|
| VISTA | [2610.02200v1](https://arxiv.org/abs/2610.02200v1)，2026-10-01 | 23 | `40c95e5ebed5f50fe696462177a2561352027ef85fd28293dbd5e2cc221e838a` | `28ab9cc4d51c2152257adab41cee8e81b8b83f04ab54902763fb2431380857b8` |
| IAR | [2608.20281v1](https://arxiv.org/abs/2608.20281v1)，2026-08-20 | 21 | `a04a9e560b15cbc22942af63e4519fc7640812178e0e4de8f2deaeaac8da3060` | `f66f1e586a477b365935583b58bef6b89513b361ea868ec2d50567c9ef0c529f` |
| MechVQA | [2605.30794v2](https://arxiv.org/abs/2605.30794v2)，2026-07-07 | 28 | `07283abb933491a14f347321d7935188ceafd4b686ba9c088ad72d2cc5d4f129` | `ea5b6dfa3bbd8605fd83dee12c53a90b01aba162d3806f4a546d8ce0ed145150` |

下载地址模式分别为 `https://arxiv.org/pdf/<版本>` 与 `https://arxiv.org/src/<版本>`。三份 MD 的来源层也记录了版本、PDF 链接和哈希。PDF 与 archive 均保留在上述临时目录，未把论文文件重新分发进仓库。

### 实际核对范围

- **VISTA**：正文的问题诊断、纯机械 harness、三组件与单回合循环；ARC 25 公开游戏协议、主成绩与全部六级配置；Figs. 1–11 的图注/配置含义及使用到的数值；Table 1、附录 Table 2；附录 A.1–A.6 的基线、推帧/预算、RHAE、工具接口、静态任务提示及人类参照；B.1 重复运行、B.2 逐游戏表、B.3 Fig. 14 的两种静态检视轨迹。源包含全部正文及附录；未执行任何 agent 游戏。
- **IAR**：正文 §§3–6、Eqs. 1–5、Tables 1–3 的全部比较和条件；附录 A–B 的 train/test 契约、QA 构建和损失掩码；C 的超参、实际 token 账目、单次训练和缩放日志缺口；D 的评审和失败/随机性边界；E 的完整选点规则与固定候选网格；F 的 507 个共享续写 BPB 协议和 Table 17；G 的 CPT 初始化诊断、FAPM 操作与 Tables 21–27 中引用的结果。未调用评委 API 或训练/合并模型。
- **MechVQA**：正文 §§3–5 的构建、十任务、训练和评测；Eqs. 1–7；Table 2 的选入行及未胜出子任务、Table 3 的全部消融行；Figs. 1–4 的图注和相关数值；App. A 的限制；B.1 的 Center Mandrel 元数据示例、B.2 Table 5、B.3 定义、B.4/B.5 生成/验证/答案合并提示、B.6 split；C.1–C.4 的参数、reward 权重与自动评测规则。未获得逐条原始 benchmark 输出，未复现训练或投票。

“完整源可访问”与“本次逐项重新核对”分开记录；本次不声称逐行重新验证每条参考文献或全部次要结果。

## 实质性改写

三篇均保留原语言，新增可见读者背景、三个可操作目标、首次阅读路线、连续的机制解释和四个纸张特定理解题。理解题含新输入或协议迁移，答案用原生 disclosure；没有理解分数或“已证明理解提升”的陈述。长表/配置移入 `details.reading-detail`，核心比较、反例和条件仍在可见正文。交互取舍写入 Markdown 审计注释，未加入脚本交互。

### VISTA

- 从“像素为何需要保留”连到 turn/frame 存档、模型决定取证、工具返回图/数值、模型形成可再检验的规则假设。新增三帧教学例，明确取到中间帧不自动证明传送、撞墙等因果规则。
- RHAE 先算两关教学例，再给一般式。完成一关即使达到 115% 关卡封顶，整局仍被 1/3 完成度压到 33.33%；迁移题改为三关、完成前两关，算出 50%。动作总数与封顶分数的含义分开。
- 恢复 Fig. 2 与文字轨迹的并排解释；增加使用现有本地资产的 Figs. 6–9、14，不生成新教学图。原稿六张已引用原图全部保留，现引用十二张。
- 附录 B.3 的代表性静态迷宫/连线题走完“单图→2× 查看/局部放大→读像素→供模型推理→39 题准确率测量”。把空间检视的收益与长期记忆的任务需求分开。
- 在主线保留：(iv)→(v) 同时变动记忆/检视和自动推帧；官方基线接口/停止协议不同；Opus high→xhigh；BabyVision 人类仍较高；公开游戏可能进训练数据。删除“路径本身就解释为何比人类省动作”的过强解释。

### IAR

- 用自造两事实记录仪文档生成 Continue、Rewrite、指令化重构、Align 四行输入/目标；解释掩码与覆盖，而非只列任务名称。两 token 平均 NLL 为 1.040 nats，再连到经验行数份额和一般损失。
- 用两参数 Task Arithmetic 算例解释任务向量，明确四族合并并非都等同于同一完整向量乘一个系数。选点教学表包括 Vanilla、三项通用指标、领域门槛、非支配点、τ 分层和被排除候选；主例选 B，陌生输入题选 Y。
- 附录 F 从 8 字节教学目标计算 0.5/0.75 BPB，再给出 575 QA→509 唯一文档→507 共享续写→逐文档计分→七领域配对统计的完整链。保留“较低 BPB 不能证明记忆、污染或 QA 因果”，以及 Phi/Llama 的反例。
- 附录 G 解释每张量保留前 10% delta 与整体缩放的不同，并对齐 Vanilla→Vanilla-FAPM、Best IA→IA-FAPM 的实际起点。
- 修正原 Fig. 2 解读中 CC Llama 的方向：它是领域下降、通用上升，故箭头应“左上”。修正把不同 FAPM 起点的数字组合为同一前后对照的表述；纠正 SmolLM CC 所选 Inject 配比摘要；把 RQ3 的“独立贡献证明”收窄为恢复前 IA 增益，保留 token/配方/初始化没有完全隔离的边界。
- 原四张图全部保留。长主表与缩放表可选展开；CCI Phi、CC Llama、SDFT/FAPM/LoRA 的反例始终可见。

### MechVQA

- 以 30=18+b 的自造尺寸链区分 Recognition、Geometric Calculation、Anomaly Detection；不是给读者只看分类缩写。
- 把附录 Center Mandrel 的报告元数据用于一个明确标记为教学实例的 view-count 模板，追踪输入→模板/验证→解释与短答→元数据纠错率，再连到不看原图的测试评委。Table 5 未给审计分母，明确不能重建计数或区间。
- 用 8/2 个题目的微/宏聚合例解释为什么分母重要；Total 的精确聚合式未在论文给出，继续标为未确认，未把推断写成论文定义。
- 重写奖励→组内优势→token ratio→clip 的教学顺序。奖励例为 0.79；优势例选 [1,1,0,0] 并明确人口标准差约定；ratio 0.14/0.10=1.4 被上界 1.28 限制，避免把 clip 参数 0.28 读成概率上限。
- 修正原稿 Eq. 2：epsilon_A 位于 `std + epsilon_A` 分母内。旧四响应算例给出的标准差/优势也不准确，改为可手算且约定清晰的组。
- 修正评委失败规则：API 失败排除投票；无法解析先回退显式 0/1，再记 0；全部调用失败才最终 0。剩余有效票出现平局的细节源文未说明，保留缺口。
- 明确 Dynamic Sampling 用正误混合过滤，不能由此推断所有全正确组的复合奖励方差为零。优化器比较同时改变多个设置，不单独识别动态采样/clip 的效果。
- 保留 GC、CJ 未胜出与 reward Full 的 Reasoning 略低于 w/o Qual 的反例；将长度曲线解释收窄到行为诊断。删除 GPT-4o-mini “same-size”的无依据说法。
- 原六张图全部保留，加入完整 Table 3 转录作为可选支持。保留结果内部不一致，并新增训练模块范围、GRPO clip 的原文/表格措辞冲突；不擅自修正论文。

## 实际验证

### 渲染与自动检查

分别执行（输出只写 `/tmp`）：

```bash
node scripts/render-reading.cjs examples/vista-deep-read.md /tmp/paper-reading-agent-research-20261027/vista-deep-read.html
node scripts/render-reading.cjs examples/iar-deep-read.md /tmp/paper-reading-agent-research-20261027/iar-deep-read.html
node scripts/render-reading.cjs examples/mechvqa-deep-read.md /tmp/paper-reading-agent-research-20261027/mechvqa-deep-read.html
node --test scripts/test-renderer-integrity.cjs scripts/test-render-reading.cjs
python3 /tmp/paper-reading-agent-research-20261027/verify_static.py
git diff --check
```

结果：三个渲染成功；现有 renderer 测试 **30 passed / 0 failed**；静态 HTML/算术/选点断言通过；本代理修改的 diff 无空白错误。初次静态算术脚本用浮点精确等号比较 100/3 与等价计算，出现机器精度差；改为有界 `isclose` 后通过，正文算例未因此改值。第一次 VISTA 编辑脚本因重复替换断言提前退出，未写文件，修正后完成重构并重新渲染。

静态检查实际验证了：语言、三个学习目标、四道问题、原始图引用集合未丢失、所有输出图片都有 alt 且内嵌 data URL、章内锚点均有目标、无 KaTeX 错误标记、无未展开 custom fence、作者证据 disclosure 标签配对，以及教学 NLL/RHAE/reward/BPB/微宏聚合/领域优先选点的算术。它没有模拟浏览器布局、点击或学习效果。

| 输出 | 语言 | 章节 | 原稿图数→现图数 | 作者证据展开区 | HTML 字节 |
|---|---|---:|---:|---:|---:|
| `vista-deep-read.html` | zh-CN | 7 | 6→12 | 2 | 3,180,078 |
| `iar-deep-read.html` | zh-CN | 7 | 4→4 | 3 | 1,114,349 |
| `mechvqa-deep-read.html` | en | 7 | 6→6 | 4 | 1,881,979 |

计数用于交付完整性核对，不是内容质量或理解提升分数。机器结果和算术明细在 `/tmp/paper-reading-agent-research-20261027/structural-verification.json`。

### 内容与 Skill 检查

已读仓库 `AGENTS.md`、`SKILL.md`、`references/visual-reading.md`、`renderer-format.md`、`learning-checks.md`、`paper-types.md`、`evals/reading-quality.md` 和相关 README/示例。按三篇实际类型分别处理 agent system、文档后训练系统、benchmark + baseline，没有强套同一训练流水线。

按工作区要求读取并使用 `neat-freak` 做限定范围的事实、重复说法和状态对齐；只核查本三篇与本报告，没有把知识整理扩张为仓库治理或记忆写入。`ui-ux-pro-max` 的两次定向检索返回了不匹配的 Heading Line Balance，未采用或保存该结果；实际采用其本地 `references/quick-reference.md` 的 `progressive-disclosure` 与长 token 换行原则，并依 `paper-reading` renderer 的原生 details 合同安排证据。未改 CSS、主题或 renderer，因此不声称完成 UI 视觉优化。

| 质量门 | 本次状态与证据 |
|---|---|
| 来源身份与覆盖 | pass：完整精确 PDF/source；上表哈希与实际重查范围 |
| 科学忠实性 | pass（作者 AI 辅助核对范围内）：关键机制、公式、新算例、主要结果/条件逐项核对；源文冲突留在相关解释中。待不同作者复核 |
| 主张到证据 | pass（作者检查）：系统结果与组件归因分开；关键反例和协议差异可见 |
| 读者完整性 | pass（作者结构检查）：具体读者/目标、连续路线、计算桥梁、代表性附录操作与迁移题齐备；独立可理解性尚未测量 |
| 视觉选择与交互 | pass（设计记录）：选择静态路径/原图/表，理由在每篇审计注释；原生 disclosure 承载可选证据，无脚本互动 |
| 交付完整性 | unknown（浏览器层）：静态内嵌资源/数学/锚点检查通过，但未打开浏览器验证窄屏、宽屏、来源开关、无脚本阅读或键盘 |

## 明确缺口与交接边界

- **浏览器/视觉未验证**：遵守本次禁止浏览器 UI 和正式视觉结论的范围；没有 GLM-5.3-Flash 视觉分析支撑。不得把渲染、静态 HTML 检查写成正式视觉验收。后续可由获准的不同作者/视觉工作流完成。
- **未做独立读者评测**：四道题和答案只是学习辅助；未用答案自测来声称理解提升。没有读者得分、对照学习实验或模拟真人盲审。
- **未复现实验**：没有训练、模型合并、游戏运行、LLM judge 重评或 benchmark 重跑。
- **论文自身缺口仍在**：MechVQA Total 聚合式、缺失审计分母、有效票平局规则、overlong shaping 细则未给出；训练范围与部分数值有内部措辞/结果冲突。IAR scaling 原始训练日志缺失、单次训练/评委随机性不由 bootstrap 覆盖。VISTA 公开游戏可能进入训练、捆绑消融和 Opus 档位/单次运行边界仍限制推断。这些均未被“补全”成不存在的事实。
- **生产/仓库交付在本代理范围外**：未更新 docs、运行 freshness 全站检查、发布、提交或推送；由主代理统一生成与审核。临时论文、脚本和 HTML 保留，供下一作者核查。

- 父代理 diff 复核发现 MechVQA 新维度链公式的反斜线被 Python 字符串转成换行；已修正为实际 LaTeX `\ne`，重新渲染 MechVQA 并重跑结构检查。最终 MechVQA HTML 为 1,881,979 bytes；Markdown SHA-256 `7767331ec9f68aa02fa24f792b7afbdf5f55dec33e3565a046d523244ffbb495`，HTML SHA-256 `421f943232674470a0ca91581b0355a7dadf2e350fb6435a290d7dc9748abb0f`。
