<!-- paper-reading-lang: zh-CN -->
<!-- paper-reading-mode: deep -->
<!-- paper-reading-theme: saffron -->

# HarnessPro 深读：把 Harness 递归自我改进推上性能-成本帕累托前沿

深读对象：HarnessPro: Recursive Harness Self-Improvement with Pareto Optimization for Performance-Cost Trade-offs（arXiv 2610.26770v2，清华、Z.AI、上交、Kling AI 等合作，Pan 与 Feng 等）。前两天的 The Trinity 证明了 Harness 层 RSI 能涨分，但它和同类方法（RHO 等）有个共同的隐痛：**涨分的钱越花越多**——RHO 在 SWE-Bench Pro 上比原始 harness 贵 42.6%。HarnessPro 把问题改成双目标：min(−PR, C) s.t. PR≥PR(h₀)，在无标签（无真值解、无官方测试、无判分器）的设定下，用多智能体管线做递归进化，产出 lite/medium/heavy 三档帕累托代表而非单一 harness。头条结果：GPT-5.5×Codex 上 heavy 档三基准全面超 RHO（平均 +2.0 分）同时成本平均降 26.1%；medium 档在 SWE-Bench Pro 用 RHO 一半的成本保住 79.0 分。方法上的两个关键替换：用**LLM 生成的固定测试**替代 LLM 自偏好判官（失败检出率 41.7%→83.3%），用**归一化加权平方距离选择**替代单一最优（三档部署预算各有代表）。

<!-- Deep Reading coverage
| Source section / object | Role in the argument | Explanation location / status |
| --- | --- | --- |
| §1 问题：RSI 涨分伴随成本上升 | 立论 | §01/§02 explained |
| Table 1 与 RHO/SkillMOO/AHE 定位 | 差异化（Pass+Cost / Harness / label-free / 递归 / Pareto集） | §02 explained |
| §3 三指标与 Eq.(1) 双目标约束 | 问题形式化 | §02 explained（含约束含义） |
| §4.1+Algorithm 1 全流程 | 主机制 | §03 explained（epoch 四阶段逐段） |
| §4.2 Analyzer/Planner/Edit Eq.(2)-(5) | 诊断与候选生成 | §03 explained |
| §4.3 TestSynth Eq.(6)+Fig.2 | 无标签评估核心 | §04 explained（含 recall 证据） |
| Eq.(7) 过滤 / Eq.(8)-(9) 代表选择 | 帕累托选择数学 | §04 explained（逐项展开） |
| §5.1 设置（数据切分/G=3/epoch数/双基座） | 实验前提 | §05 explained |
| Table 2 主结果（双基座×三基准×三档） | 决定性证据 | §05 explained（逐基准） |
| §5.3 进化产物分析（执行档位/hooks/RTK） | 机制解释 | §04 explained |
| §5.4 Fig.4 演化动态 | 递归有效性 | §05 explained（原图矢量不可嵌，数字以文字保留） |
| Table 3 消融 + RHO 变体 | 组件与机制归因 | §05 explained |
| §6 结论 | 边界 | §06 explained |
| 附录 A（DPP/价格/超参）、B/C（提示词/案例）、D（进化 harness 细节） | 复现细节 | secondary omission：细节级材料，关键参数（coreset=10、G=3、epoch 3/4、α/β 语义）已入正文 |
| Fig.1 概览图 | 示意 | HTML 版无位图（仅混淆矩阵图可用），机制以文字与流程卡重构 |
-->

## 01 全景：这篇论文在做什么

Harness 是模型外围的软件运行层——提示、工具与技能、上下文与记忆机制、hooks、验证策略（PDF §3）。RSI 路线用历史执行轨迹诊断问题、指导 harness 更新（RHO、AHE、HarnessFix 等），但现有方法的目标函数里只有通过率：更强的探索与验证带来涨分，也带来 token 与延迟的同步膨胀。HarnessPro 的问题是「递归 harness 自我改进能否**同时**更好又更便宜」，答案是能把整个帕累托前沿往前推。

```paper-map
{
  "thesis": "Harness RSI 的性能增益不必用执行成本购买：在无标签设定下，用固定 LLM 生成测试评估候选、用三档性能-成本优先级并行规划更新、用帕累托过滤加归一化加权平方距离选择代表，递归进化能把帕累托前沿整体推进——GPT-5.5×Codex 上 heavy 档三基准全面超 RHO 且成本平均降 26.1%，medium 档在 SWE-Bench Pro 以 53% 的成本降幅保住接近的通过率。",
  "outcome": "多智能体递归 harness 进化框架（Analyzer/Planner×3/Edit/TestSynth）+ lite/medium/heavy 三档产出 + 双基座三基准验证与组件消融；代码开源。",
  "outcomeSource": "PDF 摘要、§4、§5",
  "items": [
    { "number": "01", "label": "问题", "signal": "双目标", "text": "min(−PR(h), C(h)) s.t. PR(h)≥PR(h₀)：通过率不降是硬约束，成本与通过率同时优化；延迟作辅助指标不进目标（受服务器负载波动影响）。", "source": "PDF §3 Eq.(1)" },
    { "number": "02", "label": "无标签", "signal": "固定测试", "text": "不用真值解/官方测试/判分器：测试合成器从任务描述与初始 harness 轨迹生成测试，一次性生成后全程固定，保证候选间公平比较。", "source": "PDF §4.3 Eq.(6)" },
    { "number": "03", "label": "诊断", "signal": "G 轮联合", "text": "Analyzer 联合检查每任务 G=3 条独立轨迹及其指标，定位失败与可避免开销，输出问题/影响/证据三要素（含轨迹文件路径与事件区间）。", "source": "PDF §4.2 Eq.(2)" },
    { "number": "04", "label": "三档并行", "signal": "I1/I2/I3", "text": "Planner 按三种指令出计划：I1 省成本、I2 平衡、I3 重性能；还看候选间代码 Diff 与彼此诊断，互相借鉴有效机制；Edit 在独立工作区实现并 Git 提交。", "source": "PDF §4.2 Eq.(3)-(5)" },
    { "number": "05", "label": "产出", "signal": "三档代表", "text": "每 epoch 过滤掉低于初始通过率地板或被帕累托支配的候选，再用归一化加权平方距离为三档各选一个代表进入下一轮；最终交付 lite/medium/heavy 三个 harness。", "source": "PDF §4.3 Eq.(7)-(9)" }
  ]
}
```

## 02 定位：在 Harness RSI 谱系里它补哪块

```paper-contrast
{
  "title": "单目标 RSI（RHO）vs 双目标帕累托 RSI（HarnessPro）",
  "intro": "两者都是无标签 harness 进化，差别在目标函数、评估方式与产出形态。",
  "branches": [
    { "name": "RHO 路线", "lead": "以通过率为唯一目标，LLM 自偏好选候选，单轮进化输出单一 harness。", "scope": "轨迹分析指导修订技能与工具；无真值标签但依赖 LLM 判断轨迹优劣。", "judge": "三基准上涨分但成本上升（SWE-Bench Pro +42.6%）；LLM 判官偏乐观，把有缺陷的实现当成功。", "signal": "优化压力全部朝性能方向——更深的探索与更强的验证是唯一被奖励的修改方向。", "why": "目标简单、实现直接；部署成本不敏感时够用。", "source": "PDF §1、§4.3、Table 2" },
    { "name": "HarnessPro（本文）", "lead": "双目标帕累托 + 三档并行规划 + 固定生成测试评估，递归多轮。", "scope": "修改整个 harness（指令/技能/工具/hooks/验证规则）；候选间互看 Diff 与诊断。", "judge": "验证集上过滤（地板+帕累托支配）与三档代表选择；测试集只在进化完全结束后评估一次。", "signal": "三种优先级的计划同时探索性能方向与成本方向，选择机制保证前沿整体推进而非单点变好。", "why": "部署现实需要不同预算档位；但流程更重（多智能体+多轮+测试合成），且评估效度受生成测试上限约束。", "source": "PDF §4、Table 1" }
  ]
}
```

问题形式化只有一行但约束有讲究（Eq. 1）：h₀ 的验证通过率被设为**性能地板**——进化只接受「不比初始差且更便宜」或「更好」的候选，这把「降本」死死限制在不伤性能的区域内，防止退化成无脑砍上下文。成本按 token 计价（未缓存输入/缓存输入/输出分别计价，附录表 4 的价格表），延迟只作辅助指标因为受服务器负载与网络波动影响（PDF §3）。

## 03 主机制：一个 epoch 的四阶段循环

```paper-path
{
  "title": "HarnessPro 的 epoch 循环（Algorithm 1）",
  "intro": "候选集初始化为 {h₀}，每轮先诊断、再并行生成候选、然后在验证集上评估过滤、为三档各选一个代表进入下一轮。",
  "stages": [
    { "title": "数据准备（一次性）", "role": "防泄漏", "action": "任务切 train/val/test；训练侧用 DPP 核选 10 个任务的多样性-难度均衡 coreset；测试合成器对 train∪val 每个任务从描述与 h₀ 轨迹生成测试 𝒮(x)，生成后全程固定。h₀ 在验证集上的通过率定为性能地板。", "why": "三集隔离+测试固定，是后面所有比较公平性的地基；coreset 控制轨迹采集与分析成本。", "output": "𝒟_train(10)、𝒟_val、固定测试族 𝒮、地板 PR_val(h₀)。", "source": "PDF §4.1、§5.1" },
    { "title": "阶段一：轨迹诊断", "role": "找病因", "action": "每个候选 harness 在每个训练任务上独立跑 G=3 次，Analyzer 联合检查全部轨迹与指标（通过/成本/延迟/用token明细/工具调用），输出 z(h,x)：问题、对性能与成本的影响、来源与证据（轨迹文件路径+事件区间）；按任务汇总，超 64K token 则再摘要。", "why": "多轮联合看是为抗随机性——单次尝试的偶然失败/侥幸成功不构成诊断依据。", "cost": "诊断证据分散在长序列里，这是最耗上下文的环节，故有摘要兜底。", "output": "诊断集 𝐳(h) 与指标集 𝐦(h)。", "source": "PDF §4.2 Eq.(2)" },
    { "title": "阶段二：计划与编辑", "role": "开药方", "action": "对每个候选，Planner 依 I1（省成本）/I2（平衡）/I3（重性能）三种指令各出一份计划；输入含候选全文、诊断、指标，以及其他候选的代码 Diff 与诊断——跨候选借鉴；随后 Edit 在独立工作区把每份计划落成可执行 harness 并提交 Git。", "why": "三种优先级同时探索两个方向的前沿；Diff 交叉证据让有效机制在候选间传播；Git 提交保证可追溯可回滚。", "cost": "候选数×3 份计划的编辑与评估开销；Planner 默认不看全轨迹（按需经路径调阅）。", "output": "候选池 𝒞_t（与父代合并为 𝒞̃_t）。", "source": "PDF §4.2 Eq.(3)-(5)" },
    { "title": "阶段三：评估过滤与代表选择", "role": "淘沙", "action": "每个候选在验证集上每任务跑一次、按固定测试判分，得 (PR_val, C_val, L_val)；先滤掉低于地板或被帕累托支配者（Eq. 7），再按归一化加权平方距离为 lite/medium/heavy 各选一个代表（Eq. 8-9）组成下一轮候选集。", "why": "地板+支配过滤保证前沿不倒退；三档代表让搜索始终覆盖不同预算区域而非收敛到单点。", "output": "下一轮 𝒜_{t+1}（至多三个 harness）；epoch 用尽后在测试集上一次性评估。", "source": "PDF §4.3 Eq.(7)-(9)" }
  ]
}
```

进化轮数：Terminal-Bench 2 与 SWE-Bench Pro 各 3 轮、ProgramBench 4 轮；双基座为 GPT-5.5×Codex 0.147.0 与 GLM-5.2×Claude Code 2.1.231（PDF §5.1）。

## 04 机制放大：两个关键替换与进化产物

**替换一：固定生成测试替代 LLM 判官。** RHO 用 LLM 自偏好比较轨迹，但 LLM 判官系统性乐观——常把有缺陷的实现判为成功。HarnessPro 的测试合成器（Eq. 6）对每个任务生成测试 𝒮(x)=TestSynth(x, τ_{h₀}(x))，**从 h₀ 的轨迹生成、之后全程固定**。固定有两个作用：候选间比较的尺子不变；进化无法通过「改判据」伪造进步（这正是 RSI 综述警告的元改进层风险）。效果直接量化：合并训练任务的混淆矩阵显示失败检出率从直接 LLM 判断的 41.7% 升到 83.3%（Fig. 2）。代价是尺子本身有误差——生成测试未覆盖的失败模式会漏检，这个上限在 §06 讨论。

混淆矩阵原文见图：

![Figure 2：LLM 判官 vs 生成测试的混淆矩阵](assets/harnesspro-fig2-confusion.png)

*原论文 Fig. 2，PDF §4.3。阅读时对比两个矩阵的假阴性格（把失败判成成功）：左（LLM 判断）与右（生成测试）的差异就是 41.7%→83.3% 这一行数字的来源。*

**替换二：帕累托代表选择（Eq. 8–9）。** 过滤后的集合 𝒜̃ 上，先按集合内极值归一化两个偏离量：d_perf(h)=(P_max−PR_val(h))/(P_max−P_min)（离最高通过率的距离）、d_cost(h)=(C_val(h)−C_min)/(C_max−C_min)（离最低成本的距离），三档模式各用权重 (α_m, β_m) 取加权平方距离最小者：J_m(h)=α_m·d_perf(h)²+β_m·d_cost(h)²。平方形式偏好「两边都不太差」的折中点（Marler 与 Arara 的加权平方距离法），lite 档 β 权重大、heavy 档 α 权重大。这一步把「输出帕累托集」具体化为三个可部署代表，也让每轮搜索在三档区域各留一个种子。

**进化产物长什么样**（§5.3，回答「降本是不是靠砍上下文」）：进化出的 harness 在 Terminal-Bench 2 与 SWE-Bench Pro 上**按任务描述选择执行档位**（推理力度 + 工具调用预算的组合），三档模式用不同的档位选择规则；运行时 hooks 强制执行预算——medium 档选标准档位时，14 次工具调用后提醒并行调用、避免冗余检查，26 次后聚焦完成与验证，44 次后直接阻断；提醒附加在工具结果尾部、**不破坏提示前缀**以保住缓存命中。静态侧则引入 RTK 式工具输出压缩（折叠重复日志、浓缩长输出）并精简冗余指令。结论：不是一刀切压上下文或降推理力度（消融里「固定低推理力度」性能崩到 62.7），而是动态分配+预算护栏+输出压缩的组合。

## 05 实验图谱（按实验族解读）

```paper-experiments
{
  "title": "五族实验各自回答什么",
  "rows": [
    { "question": "双基座上是否都成立？", "setup": "GPT-5.5×Codex 与 GLM-5.2×Claude Code × 三基准，HarnessPro 三档 vs Vanilla/Dynamic Cheatsheet/ReasoningBank/Sleep-time Compute/RHO/Balance/RHO+Iteration；HarnessPro 报 2-3 次运行均值±样本标准差。", "observation": "GPT-5.5 侧 heavy 档三基准全部最高分：TB2 80.8（RHO 76.3）成本 0.72（RHO 1.09，−33.9%）；SWE Pro 80.7/1.97（RHO 80.0/2.68）；ProgramBench 69.6/2.95（RHO 68.8/3.59，−17.8%）。GLM-5.2 侧同型：TB2 heavy 81.4/0.62 vs RHO 78.0/1.00。", "conclusion": "「更好且更便宜」跨基座、跨基准成立，非单一模型或单一域的巧合。", "source": "PDF §5.2、Table 2" },
    { "question": "三档各值什么预算？", "setup": "同一次进化的三个代表在部署视角对比。", "observation": "SWE Pro：lite 72.3/0.80、medium 79.0/1.26（较 RHO −53.0% 成本、仅 −1.0 分）、heavy 80.7/1.97；lite 档三基准都超 Vanilla 且省 17.7–57.4%。", "conclusion": "medium 是性价比甜点——RHO 级性能对半价；lite 供硬预算约束，heavy 供性能优先。", "source": "PDF §5.2" },
    { "question": "递归多轮有必要吗？", "setup": "Fig.4 逐 epoch 追踪测试集指标（仅可视化，未参与选择）。", "observation": "TB2 heavy 从 epoch1 74.6/0.91 到 epoch3 80.8/0.72 双改善；SWE Pro medium 前两轮升分但成本也涨（70.0/1.57→77.0/1.66），第三轮才双改善到 79.0/1.26；ProgramBench 第 4 轮各档继续降本。", "conclusion": "单轮进化可能只买到「分或钱」之一，双改善常需要多轮递归——这正是它优于 RHO+Iteration（同轮数仍被支配）的地方。", "source": "PDF §5.4、Fig.4" },
    { "question": "组件各自贡献多少？", "setup": "去 Planner / 去测试合成器，双基准三档，附 Cost-of-Pass（每成功任务成本）。", "observation": "去 Planner：SWE medium 79.0→73.0 且成本反升至 1.42；去测试合成器：三档全线掉 3.4–10.0 分（heavy TB2 80.8→74.6）。", "conclusion": "测试合成器是无标签评估的承重墙（掉分最大），Planner 的三档计划质量决定能否找到双改善方向。", "source": "PDF §5.5、Table 3" },
    { "question": "RHO 抄走单个策略能追平吗？", "setup": "给 RHO 加动态路由 / 预算 hooks / 固定低推理力度三种单机制变体。", "observation": "加路由或 hooks 都降本但掉分（SWE 76.0/2.13、75.0/1.75 vs RHO 80.0/2.68）；固定低力度 TB2 掉到 62.7。三个变体全部被 HarnessPro 帕累托支配。", "conclusion": "双改善来自「动态分配+护栏+压缩+精简」的组合与递归选择压力，单机制移植只会单边受益——反证框架归因。", "source": "PDF §5.5、Table 3" }
  ]
}
```

GPT-5.5×Codex 在 Terminal-Bench 2 的完整格局重绘：

```paper-chart
{
  "type": "bars",
  "title": "Terminal-Bench 2：通过率与成本的分离格局",
  "subtitle": "GPT-5.5×Codex；上表通过率(%)，本图并列成本($)以显双目标；HarnessPro 为 3 次运行均值",
  "origin": "本文重绘 · 原论文 Table 2",
  "source": "PDF Table 2",
  "unit": "$/任务",
  "domainMax": 1.3,
  "note": "对应通过率：Vanilla 69.5、Dynamic Cheatsheet 72.9、ReasoningBank 74.6、Sleep-time 74.6、RHO 76.3、RHO+Iter 76.3、Lite 72.9、Medium 76.3、Heavy 80.8。Heavy 以 0.72 美元拿到全场最高 80.8 分，比 RHO 便宜 33.9%。",
  "rows": [
    { "label": "Vanilla", "value": 0.89 },
    { "label": "Dynamic Cheatsheet", "value": 1.06 },
    { "label": "ReasoningBank", "value": 0.99 },
    { "label": "Sleep-time Compute", "value": 1.04 },
    { "label": "RHO", "value": 1.09 },
    { "label": "RHO+Iteration", "value": 0.82 },
    { "label": "HarnessPro-Lite", "value": 0.43 },
    { "label": "HarnessPro-Medium", "value": 0.56 },
    { "label": "HarnessPro-Heavy", "value": 0.72 }
  ]
}
```

SWE-Bench Pro 三档成本-性能档位重绘（对照 RHO 与 Vanilla）：

```paper-chart
{
  "type": "bars",
  "title": "SWE-Bench Pro：三档的预算阶梯",
  "subtitle": "GPT-5.5×Codex；本图为成本($)，括号内为通过率",
  "origin": "本文重绘 · 原论文 Table 2",
  "source": "PDF Table 2",
  "unit": "$/任务",
  "domainMax": 3.0,
  "note": "RHO 2.68(80.0) → Medium 1.26(79.0)：−53.0% 成本仅 −1.0 分；Lite 0.80(72.3) 已超 Vanilla 1.88(59.0) 的性能且不到其一半价格。",
  "rows": [
    { "label": "Vanilla（59.0）", "value": 1.88 },
    { "label": "RHO（80.0）", "value": 2.68 },
    { "label": "RHO+Iteration（80.0）", "value": 1.90 },
    { "label": "Lite（72.3）", "value": 0.80 },
    { "label": "Medium（79.0）", "value": 1.26 },
    { "label": "Heavy（80.7）", "value": 1.97 }
  ]
}
```

## 06 综合评述

三个组件的咬合是本文的设计精髓：**固定生成测试**给了无标签设定一把不变的尺子（失败检出翻倍，且堵住了「改判据伪造进步」的元改进层漏洞）；**三档并行计划**让每轮搜索同时朝两个方向施压，配合**地板+帕累托过滤**，前沿只能整体前移；**代表选择**把帕累托集落成三个可部署产物，也让下一轮搜索保留三个不同区域的种子。消融链完整：去测试合成器掉分最大（尺子不可靠一切白搭）、去 Planner 找不到双改善方向、RHO 移植单机制全部被支配——归因闭环。

边界也同样清楚。其一，评估效度受生成测试上限约束：83.3% 的失败检出意味着约六分之一的失败仍会被当成功，若某候选恰好擅长「过生成测试而非真解任务」，地板与支配过滤都会被误导——论文用测试集官方测试做最终评估兜住了底线，但进化过程中的选择压力确实建立在这把有误差的尺子上。其二，训练 coreset 只有 10 个任务，诊断覆盖面依赖 DPP 选样的代表性；其三，成本按固定价目表折算美元，缓存命中率不同基座差异很大（GLM-5.2 在 ProgramBench 的绝对成本高一个量级），跨基座的成本数字不可直接横比；其四，延迟不进目标但顺带改善，属红利而非保证。与本周线连起来读：The Trinity 证明了 Harness RSI 的能力上限，Trustworthy RSI 综述规定了可信条件，HarnessPro 补上了部署视角的第三块——**自我改进的经济性**，而且它的固定测试恰好是综述「接受有效性」要求的一个工程化样本。

一句话收束：当自我改进的每一步都要花 token，进化目标里就必须有钱的位置——HarnessPro 用一把固定的尺子、三份不同优先级的药方和一套帕累托筛子，让 harness 递归自我改进第一次做到了「更好，而且更便宜」。
