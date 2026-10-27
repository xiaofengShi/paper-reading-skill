# 示例重构交叉内容审核

日期：2026-10-27。基线：`64d9e99259fd39e41d3418c319dcbc1018193310`。范围：全部 11 篇 `examples/*-deep-read.md`、其作者审计、`evals/reader-tasks.md` 与本轮 gallery 回归断言。审核者未参与这些示例的撰写；本记录是与作者分离的 AI 内容审核，不是独立真人盲评、学习效果测量、实验复现或视觉验收。只新增本报告，没有修改示例、答案键、测试或生成文件。

## 审核结论

**最终内容复查：本报告发现的四处 reader-task 答案键冲突与 OpenDS 局部绝对措辞均已修正，当前没有本审核范围内未解决的阻断项。** 示例正文的来源/算术抽查未发现新的核心机制错误。DeepSeek 双语 §06 已恢复为原生实验图谱，四行观察与协议边界保留一致。下表保留初审发现和修正要求供审计，最终状态见末尾，不代表仍待修改。

本次通过的是下面明确列出的来源与计算检查。没有把“未发现错误”写成逐字、逐表、全引用的科学正确性保证。

## 答案键修正记录

以下定位是初审时的行号；根代理已统一修改，本审核随后读回当前文件确认 K1–K4 全部完成。

| 编号 | 审核时定位 | 冲突与影响 | 精确修改建议 |
|---|---|---|---|
| K1 | `evals/reader-tasks.md:61,66` | MechVQA 问题与答案把 Total 的 question-weighted 聚合当成确定定义；新正文 §03 明确这是未确认推断。原 TeX 定义 Avg 为十子任务均值，却没有给出 Total 的聚合式或精确测试子任务计数。 | 将第 1 题改为 `What do the three capability axes measure, how is Avg. defined, and what remains unconfirmed about Total?`；将答案中对应句改为 `Avg. is the macro mean of ten subtask scores. Total is the reported headline score; a question-weighted interpretation is plausible, but its exact aggregation formula and test subtask counts are not specified, so this reading does not treat that interpretation as a verified definition.` |
| K2 | `evals/reader-tasks.md:84` | DeepSeek 中文键用“Fig.12 八基准单调无退化”作为普遍力度证据链，未带上 Appendix B.2 的跨 harness 平台/下降，也未保留局部长度推导的限制。新双语正文与原 PDF B.2 均明确区分 length 与 accuracy。 | 将“力度旋钮证据链”至下一句之前替换为 `力度旋钮证据链：RL 长度惩罚 → 附录 C 在内部、未封顶且边际收益指数衰减等假设下的局部偏好长度推导 → Figs. 9/12 指定设置的 token—精度曲线 → Fig. 11 与附录 B.2 的跨脚手架检查。B.2 观察到输出长度单调增加，但精度在中间力度有平台和回落；局部长度推导不能推出任意脚手架精度单调，也不是通用延迟保证。`；最后定位改到当前 §01–07。 |
| K3 | `evals/reader-tasks.md:98,102` | OpenDS 键说“10 人独立验证保证”、问题反演防住直接检索，并用跨模型资源关系确定瓶颈；这都比新正文和实际比较设计更强。10 是参与验证的人员总数，不应再暗示每题都被 10 人独立验证。 | 第 2 题改成“构建流水线的三段各自降低哪种捷径或失效风险？人工验证与人类实测各承担什么角色，仍不能保证什么？”；键中相关部分替换为 `锚点、节点多源佐证与问题反演分别降低纯文本起点捷径、单源失效与直接暴露目标的风险，但没有形式化排除所有捷径或其他正确证据路径。共有10名独立评审参与证据与任务有效性核验，不合格题目被剔除；这提供质量控制，不保证错误率为零。50人提供1000次独立尝试，21.10%=211/1000；115/200是至少一人成功的题目比例，两者分母不同。跨模型 token/时间消耗与准确率没有简单排序关系；这些观察提示进一步研究信源选择、工具协调和停止决策，却未操纵同一模型预算，不能确定瓶颈归因或证明增大预算无效。` |
| K4 | `evals/reader-tasks.md:48` | MiMo 键只说训练遮罩排除非模型生成片段，遗漏 Eq.1 的 M 在 §5.1 的重要性比率门控；新正文已正确分开 clip mask 与轨迹 penalty mask。 | 把第 2 题对应答案替换为 `序列级优势广播到响应 token；重要性比率比较当前训练策略与生成时旧策略的概率。Eq.1 的 M 依正/负优势各自的比率界限门控更新；轨迹导出与 penalty mask 另外排除工具返回等非模型生成片段。每个 prompt 先用组内全部响应 token 数归一化，再对 prompts 求均值（prompt-mean），不是对整个批次全部 token 一次求均值。` |

非阻断同步已完成：DeepSeek 中文行 84 的章节定位扩展到 §01–07；RAFT 键明确低相似样本直接保留原答案、跳过融合，以及 Table 2 只隔离整套自适应在线目标，不能拆出答案条件、Top-K、EMA 各自净效应。

**审核自身纠错：** 初审报告曾误称 Transformer 没有第 07 节。重新检查完整标题后确认当前有八章，第 07 章明确为 `Transfer and the attention appendix`；原答案键的 §06–07 定位有效，无需修改。已撤回这一错误建议。

## 正文发现与原有证据保留

**非阻断、已修正：** 初审时 `examples/opensds-world-deep-read.md:73` 的“直接检索答案无法解题，必须…沿证据链走通”，与行 99 允许其他正确路径、行 103 没有形式化保证的限定不一致；行 74 与 286 也把质量控制写成“保证”。最终读回确认这些位置已改为设计意图、降低风险和提供质量控制；Wikidata 映射与锚点视频归档两处也分别改为固定语义指称与固定起始输入，没有继续声称它们保证所有语义/全链路可复现性。

对比基线的图片引用集合：Attention、RAFT、OpenDS、LoRA、ResNet、IAR、MechVQA、VISTA、MiMo、DeepSeek 中文原有原图引用均保留。DeepSeek 英文移除的是原先的 editorial `deepseek-atlas.svg`，原始 Fig.3/4 仍在，并新增 Fig.1/5、Table3、Fig.9；新的成本表、paper-map 与路径仍解释原 SVG 的核心关系，因此未认定为关键证据丢失。DeepSeek 原稿部分数值不再逐项用正文转录，Table3 的完整原图仍保留；此项意味着保留完整表的图像证据，并不代表所有旧表值仍具有独立的文本替代。

已重点确认保留的反例与来源冲突：Attention EN→FR 41.0/41.8；RAFT Phi 的领域/通用权衡、Fig.2b 14.7 与 Table2 14.8；LoRA WikiSQL 方向与 37.7M 配置冲突；ResNet 极深 CIFAR 泛化反例与 ImageNet 协议差异；IAR CCI Phi 与 CC Llama/BudgetMatch；MechVQA GC/CJ 非最优、reward Full 的 Reasoning 非最优、Total 与 Fig.2c 内部冲突；VISTA 捆绑消融/公开游戏/Opus 单次边界；OpenDS 人类与模型协议、跨模型预算非因果；MiMo average@3 曲线与最终表不能相减归因；DeepSeek 困难任务反例、harness 最优项不同与跨 harness 精度回落。

## 实际来源核对范围

先读仓库 `AGENTS.md`、`SKILL.md`、`references/visual-reading.md`、`references/learning-checks.md`、`evals/reading-quality.md`，以及四组本轮作者审计。然后从缓存 PDF/提取文本/TeX 独立核对关键新增机制、公式、分母和修正；未仅以作者审计为通过依据。没有调用 ARS 或其他研究写作流程，也没有网络重取或浏览器操作。

| 示例 | 本次独立来源抽查与数值检查 |
|---|---|
| Attention | 固定 v7 提取文本中的机制/尺度/遮罩与 translation/dev 区别；手算 softmax [0.7310586,0.2689414]、输出 [0.7310586,0.5378828]、位置编码频率、n/d 与 warmup 比值。 |
| RAFT | §3.2 原文明确低相似直接用原答、仅通过样本融合，Qwen3-3B 与评测 Qwen3-32B 的角色；Top-K 同集合重归一化、KL=0.05641878、乘 1.5²=0.12694225；EMA 的滞后反例而非逐步/梯度等重。 |
| OpenDS | 原文人工验证、211/1000 与 115/200、跨模型资源非充分条件；新任务示例与来源/任务分母、weighted 78/200 与错误宏均值 41.65%；中点帧采样、失败执行时间比 42.57/6.34=6.7145。未重走活网页链。 |
| LoRA | 原文初始化/缩放与 Table4 数据；新增标量 SGD B=0.2、重新前向2.4、下一步 A 梯度−0.24；参数65,536与256倍；固定输入 rank-1 前向代数。未运行交互控件。 |
| ResNet | 原文 shortcut/stride2、Table1、Table2 28.54→25.03、4.49与3.57协议；新投影64×128=8,192、形状匹配、ReLU gate 导数3.6。 |
| VISTA | TeX Appendix A.3 完整 RHAE、Fig.5 配置文字、自动七帧→末帧的捆绑变化、重复运行与人类参照；两关33.33%、三关迁移50%；没有用动作回落作单因素因果。 |
| IAR | TeX Inject 输入/目标/mask、1:0:0、附录E固定候选与验证选点、附录F共享字节BPB；新 NLL=1.03972、选点B/Y、BPB0.5/0.75及边界候选；FAPM起点未混用。 |
| MechVQA | TeX §4.1 模块冻结范围、Eq2 epsilon位置、Table3/7、App.C.4 API失败与parse fallback、Total定义缺口；reward0.79、微/宏70/62.5、组优势与1.4→1.28。 |
| DeepSeek 双语 | 同一固定 PDF hash；Table4对应列/原文B.2平台与回落、§2 CED/CSA2和附录C局部推导；中英共同的890B、1/4与1/8、552B+196B、8B/16B、40层、16384候选池、Table4全部8行、主结论与理解题一致。手算11/−1投影、51.5625%与75%工作量、replay窗口、0.2/e与长度斜率。 |
| MiMo | 修订 PDF 的42B active、Eq1分母/§5.1比率mask、GRS/GAR/长度门控；GRS0.72、GAR λ=4/3与4/9+2/9=2/3、长度400扣0.2、Sample Mixer10/60。没有独立重做作者的旧/新版逐页像素同一性检验。 |

独立重算了所有 10 篇不同论文缓存 PDF 的 SHA-256，与各示例/作者审计记录一致；DeepSeek 双语共用一个 PDF。MiMo 新、旧两个 PDF hash 也分别与版本说明一致。该核对确认本地被查文件身份，不等于重新验证上游服务器当前 main 状态。来源正文覆盖由作者记录；本审核是有针对性的源核对，没有逐行复核全文、全部次要表值或外部参考文献。

## 回归断言检查

审核了 `scripts/test-render-reading.cjs` 的本轮 diff：用实际资产 base64 字节代替只识别 MIME 的断言更强；新增 reader/goals/path/四题断言有实际合同依据。RAFT 总结章从5移到6、VISTA原图6→12、DeepSeek中文5→6，属于源结构对齐。DeepSeek英文不再要求 editorial SVG，而检查其6张原图字节，符合当前材料；没有删除 KaTeX 错误、语言或离线来源检查。原有 `experiment-atlas` 断言继续保留。最终独立解析了 DeepSeek 双语新增 `paper-experiments` JSON，确认均含四行，主表增益、困难任务反例、harness 最优项和 effort 端点的数值及限定保持对应；这次结构转换没有引入新科学结论。没有建议通过删去失败断言来制造通过。

## 复查状态与边界

- 最终内容复查：已逐项读回 `evals/reader-tasks.md`，K1–K4、RAFT 补充与 DeepSeek 中文章节定位已完成；OpenDS 所报绝对措辞已改正。当前没有本审核发现的未解决内容冲突。Transformer 章节定位误报已撤回。
- 最终生成HTML、全站 freshness、整套测试由根代理整合；本审核没有重新执行这些命令，不转述为自己已验证。对本报告执行的 `git diff --check` 未报空白错误。
- 根代理报告浏览器发现窄屏问题，并用 `.article pre` 的宽度/水平滚动约束与 `.principle` 的最小宽度/换行规则修复；这是来源于根代理的交付层状态，不是本审核的浏览器实测或科学结论。
- 本审核未验证浏览器窄/宽屏、打印、键盘、来源开关、无脚本实际交互和正式视觉。没有 GLM-5.3-Flash 图像审核，不给视觉合格结论。
- 没有真人理解研究或训练/benchmark重跑。问答disclosure和AI复核不能证明学习提升。

## 交付收尾的小范围补充复核

根代理收尾后，再次只读检查 `assets/reading.css`、`scripts/build-reader-audit.cjs`、`scripts/test-build-docs.cjs` 的小范围 diff，以及 MiMo/DeepSeek 中文的强调标记和 `reports/examples-rebuild-20261027.md`。**未发现新增阻断项。** 此次没有重新全文审读或重做前面的论文来源核对。

- CSS 增加 `.article pre { max-width: 100%; overflow-x: auto; }`，将长代码行限制为块内滚动；`.principle` 增加 `min-width: 0; overflow-wrap: anywhere`，允许网格卡片收缩并断开长工具名。规则符合所报告的溢出成因，未隐藏内容或改动事实；本审核没有运行浏览器，因此不以代码阅读认定视觉验收通过。
- MiMo/DeepSeek 中文把英文术语与中文括注的加粗边界分开；MiMo Fig.13 图注去掉斜体内的嵌套强调。当前文字保留相同术语、前缀输入与监督关系，是 Markdown 显示修复，没有发现数值或科学边界改变。
- 报告从 `reports/` 渲染到 `docs/` 后，原 `../docs/…` 会在项目 Pages URL 中错误地跳到上层 `/docs/`。生成器只把这类 `href` 前缀改成 `./`，符合实际输出位置；保留原有同级报告 `.md`→`.html` 转换，不改外部 URL。
- 新测试保留原有断言，再增加两份报告没有旧前缀、包含阅读链接、链接目标文件存在、项目 URL 根路径正确的检查。独立只读检查当前生成快照：`teaching-update-20261027.html` 有 2 个、`examples-rebuild-20261027.html` 有 11 个阅读链接；全部目标存在，以 `new URL` 解析后均留在 `/paper-reading-skill/`，没有错误 `/docs/` 层。这验证当前链接快照及转换逻辑，没有冒充执行全量测试或 freshness。
- 汇总报告将来源核对、AI 审核、DOM/浏览器检查、正式视觉与真人理解测量区分开，和本审核的内容结论一致。独立从 11 篇 `paper-check` JSON 重数得到 45 题，与汇总一致；其中全量测试和浏览器结果由根代理实际执行并持有证据，本审核没有据此声称自己重跑。
