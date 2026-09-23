# MiMo-V2.6：一篇关于扩大 Agent 强化学习的技术报告

> **阅读定位**：从全局训练链、关键学习信号到实验与基础设施，完整理解这篇报告。原文为 LLM-Core Xiaomi 的 *MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement*，本样例依据用户提供的 44 页 PDF（SHA-256：`7fe42601dc952cd2b74996e5a24f8e85eab6fcbf471f73ba95aafd559d4ef39b`）。页码均指该 PDF 的页码。PDF 未随仓库分发；外部代码和更新版本未核验。

## 01 / 先把整篇论文装进脑中

**一句话主线：**作者认为，长时程 Agent RL 要继续扩展，不能只加训练算力；还需要多样化的可交互任务和 harness，以及能区分“同样通过测试、但质量不同”的评分信号。报告围绕这三条轴组织系统设计与实验。（PDF pp. 3, 8–9, 16）

```paper-map
{
  "items": [
    {"number":"01", "label":"训练计算", "text":"大批量、长轨迹、异步 rollout，让 RL 可以持续探索。", "source":"PDF pp. 8–9"},
    {"number":"02", "label":"任务与环境", "text":"代码、通用、视觉和安全任务，加上多种 agent harness。", "source":"PDF pp. 9–16, 22–23"},
    {"number":"03", "label":"评分计算", "text":"GRS/GAR 在二值测试之外区分解法质量与行为。", "source":"PDF pp. 16–19"}
  ]
}
```

**训练阶段**从多模态预训练出发，经过 Agent 中期训练、短 SFT、混合任务 RL，再用 MOPD2 整合不同领域教师的能力。下面的图是读全文的导航；它表示阶段关系，并不暗示每个阶段只运行一次。（PDF pp. 3, 7–9, 24–26）

<!-- archify:mimo-v2.6.workflow.html|全局训练路径 -->

这张图中最值得追的箭头是进入 RL 的两种支持：**任务与 harness 提供轨迹**，**grader 把轨迹转成更有信息量的学习信号**。后面的实验分别检查训练趋势、评分、跨 harness 迁移和稳定性；最终模型总分不能单独归因于其中一条箭头。（PDF pp. 8, 16–26）

## 02 / 一轮 RL：轨迹、评分、更新

报告的典型训练步含 **1,568 个 prompts × 每题 16 条 rollout**，约 25,000 条序列，合计 2.7–3.7B 训练 token。任务来自混合数据源；Agent 与环境交互生成轨迹，测试与 grader 产生奖励/优势，训练再把序列级信号用于 token 级更新。Eq. 1 还包含重要性比率与 token mask。（PDF p. 8, Eq. 1）

训练计算并非全用来更新权重。Fig. 3 给出的 **Pro RL** 成本分配如下；这是报告中该运行的预算切面，不应外推成所有模型的固定比例。（PDF pp. 8–9, Fig. 3）

```paper-chart
{"type":"segments","title":"Pro 的 RL 计算花在哪里","unit":"%","source":"PDF pp. 8–9, Fig. 3","rows":[{"label":"Rollout / 探索","value":43.8},{"label":"Grader / 判断","value":12.7},{"label":"Training / 更新","value":43.5}]}
```

报告把 Agent 运行拆成 **Sample → Sequence → Context → Segment** 四级：一个题目可生成多条执行序列；一条序列可有多个并发对话上下文；一个 segment 是一轮消息、模型生成或工具结果。只有模型生成的部分进入损失。Penalty Module 能在合适层级遮罩或调整 advantage，避免把环境故障当作模型犯错。（PDF pp. 26–27）

## 03 / 核心机制：GRS 与 GAR 不在同一条串行流水线上

二值测试只回答“过没过”，无法区分通过者的实现质量。论文采用两种互补方法，**分别作用于不同的代码任务子集**：高通过率任务的一部分使用 GRS，其余代码任务主要依赖 GAR。先理解这个分工，再看公式和实验会容易得多。（PDF p. 16, Fig. 7）

<!-- archify:mimo-v2.6-grading.workflow.html|轨迹如何变成学习信号 -->

![论文 Fig. 7：左侧 GRS 离线生成 rubric 并在训练时复用；右侧 GAR 在线比较同组轨迹、重分配优势。](assets/fig7-grading.webp)

*原论文 Fig. 7，PDF p. 17。上面的交互图帮助沿训练路径阅读；这张原图保留作者对两条机制的原始画法。*

### GRS：提前建立任务专属的质量尺

离线阶段，grader 结合任务说明、仓库与多条尝试，写出**解决方案质量**和**解题行为质量**两套 rubric。训练时，新轨迹逐条得到两个分数，最终奖励为（PDF pp. 17–18, Eq. 2）：

$$R_i = R_i^{\mathrm{test}}\,S_i^{\mathrm{sol}}\,S_i^{\mathrm{beh}}.$$

如果测试未通过，奖励仍为零；若都通过，rubric 仍能给出质量差异。作者特别说明，rubric 依据任务要求，不会把某条成功轨迹的偶然做法硬设为所有解法的必要条件。（PDF pp. 17–18）

### GAR：在线比较同组解法，重分配正向学习权重

GAR 在混合成功/失败的 rollout group 中，联合查看任务、仓库、补丁与测试。它比较通过解的方案适合度、实现准确性、改动最小性、副作用和代码工艺；确认依赖泄露答案的轨迹先被归零。接着，它用质量因子降低较差通过解的正 advantage，并把释放的正向权重重新分给更好的通过解。未截断形式保持通过解的正 advantage 总量；实际实现还限制放大因子，并使最终组均值为零。（PDF p. 18, Eq. 3）

**直观想象：**A 与 B 都通过测试，A 只修改必要代码并验证结果，B 添加宽泛兼容分支。二值测试视两者相同，GAR 则倾向于让 A 获得更多正向学习权重。这是帮助理解机制的假设例子，并非论文中的具体样本。

## 04 / 工程系统：为什么大批量混合任务可以跑起来

大批量并发会同时推高 Agent 运行数量、轨迹体积和训练数据搬运量。Fig. 14 把系统画成两条路径：**控制面**用轻量 metadata 调度，**数据面**把 token、MoE 路由、top-p 索引和多模态 payload 存入分布式存储，到 pack 阶段按训练 rank 取所需片段。Harness Pool 用持久多租户 actor 承载多种 agent/harness。（PDF pp. 27–29, Fig. 14）

![论文 Fig. 14：Sample Mixer、Harness Pool、Payload Porter、Inference Engine 与 Training Engine 的关系。](assets/fig14-infrastructure.webp)

*原论文 Fig. 14，PDF p. 28。读图时先沿“采样 → harness/推理 → 轨迹存储 → 训练”走主线，再看控制面和数据面的分离。*

Sample Mixer 解决混合任务的**组成稳定性**：25 个数据源的平均生成 token 和活动 rollout 时长分别相差约 90× 与 66×。更慢、通过率更低的来源需要不同并发与调度预算，才能在每步训练里贡献目标份额。作者用自适应并发、调度、预测式 dispatch 与 replay 共同处理这一点。（PDF pp. 29–31, Fig. 15–16）

## 05 / RL 之后：MOPD2 如何合并能力

混合 RL 后，MOPD2 使用不同领域的教师。可验证任务可由 mixRL 教师提供监督，开放域任务则可用合成演示训练的 SFT 教师。**Standard MOPD**让学生从任务 prompt 完整 rollout；**Prefix-Conditioned OPD**从教师轨迹或 SFT 数据抽取历史前缀，让学生从每个前缀自己生成一轮，再接受相应教师的 token 级监督。（PDF pp. 24–25, Fig. 13）

![论文 Fig. 13：领域教师、完整学生 rollout 与前缀条件蒸馏的两条路径。](assets/fig13-mopd2.webp)

*原论文 Fig. 13，PDF p. 25。SFT 数据提供的是历史**上下文**，而不是固定的学生续写目标；这是理解前缀蒸馏的关键。*

## 06 / 实验图谱：按问题找图，不按排行榜跳结论

下面先把主要实验放在同一张索引里。每一行只回答它实际测试的问题；想看曲线、原图和边界，再沿本节往下读。

```paper-experiments
{
  "title":"每项实验分别回答什么？",
  "rows":[
    {"question":"RL 扩展后表现如何？","setup":"Pro 与 Flash 各自沿累计训练成本跟踪 DeepSWE average@3。","observation":"分别从 58.4→72.6、48.7→65.7；这是整体训练趋势。","source":"PDF p. 8, Fig. 3"},
    {"question":"GAR 改变了什么？","setup":"Flash code-only RL；同一配置比较有无 GAR。","observation":"pass rate 后续仍增长，turn 大致稳定，token 增长较缓。","source":"PDF pp. 18–19, Fig. 8"},
    {"question":"跨 harness 能迁移吗？","setup":"4 个训练 mini-harness；另看 3 个 held-out harness。","observation":"后者平均 pass@1 约 50%→66%，范围限于这 3 个外壳。","source":"PDF p. 23, Fig. 10"},
    {"question":"为什么冻结 router？","setup":"两条 Pro RL 运行只改变 router 是否冻结；另做参数恢复。","observation":"冻结时负载统计更平稳；恢复 router 参数后负载恢复。","source":"PDF pp. 23–24, Fig. 11"},
    {"question":"开放资源能做什么？","setup":"9B SFT 起点上分别做领域 GRPO，并另测多 harness 代码任务。","observation":"Table 6 的 11 项和 Table 7 的 21 项均报告超过各自 SFT 基线。","source":"PDF pp. 34–36, Tables 6–7"}
  ]
}
```

### 训练计算：同一模型随 RL 训练推进如何变化？

Fig. 3 用 DeepSWE v1.1 **average@3** 对累计 RL 成本作图。Pro 从 58.4 到 72.6，Flash 从 48.7 到 65.7，分别提高 14.2 和 17.0 个百分点。这是各自运行的训练趋势；它不能隔离训练计算、环境多样性或 grader 中任何单一机制的贡献。（PDF p. 8, Fig. 3）

```paper-chart
{"type":"paired","title":"DeepSWE v1.1 · average@3","subtitle":"每个模型与自己的 RL 起点比较；单位：%","source":"PDF p. 8, Fig. 3；正文数值四舍五入至一位小数","rows":[{"label":"MiMo-V2.6-Pro","before":58.4,"after":72.6},{"label":"MiMo-V2.6-Flash","before":48.7,"after":65.7}]}
```

![论文 Fig. 3：DeepSWE 随累计 RL 成本的曲线，以及 Pro/Flash 的训练、rollout、grader 成本切分。](assets/fig3-scaling.webp)

*原论文 Fig. 3，PDF p. 8。左图横轴是累计成本，右图是成本组成；两个切面不可混为一个因果实验。*

### 在线评分：GAR 是否改变训练动态？

Fig. 8 是更有针对性的对照：MiMo-V2.6-Flash 的 **code-only RL**，batch 128、token-mean loss，比较有无 GAR。报告称有 GAR 的 pass rate 后续仍增长，turn 数大致稳定，token 长度增长较缓。曲线未提供可直接引用的精确终点表值，因此这里描述趋势，不从图像臆造差值。（PDF pp. 18–19, Fig. 8）

![论文 Fig. 8：有无 GAR 的 pass rate、turn 数和总 token 长度曲线。](assets/fig8-gar.webp)

*原论文 Fig. 8，PDF p. 19。三幅图要一起读：表现变化与轨迹长度变化是同一对照中的不同观察量。*

### 多 harness：能力能否迁移到没参加训练的外壳？

Fig. 10 将 **4 个训练 mini-harness** 和 **3 个 held-out harness** 分开显示。后者的平均 pass@1 大约从 50% 升到 66%，说明该 DeepSWE 设置下的提升并非只停留在训练外壳。这个结论只覆盖图中三个 held-out harness，不自动推广到任意 agent 框架。（PDF p. 23, Fig. 10）

```paper-chart
{"type":"paired","title":"Held-out harness 的平均 pass@1","subtitle":"近似读数；单位：%","source":"PDF p. 23, Fig. 10 与相邻正文","rows":[{"label":"训练前 → 训练后","before":50,"after":66,"approx":true}]}
```

![论文 Fig. 10：训练 harness 与 held-out harness 上的 DeepSWE pass@1。](assets/fig10-harness.webp)

*原论文 Fig. 10，PDF p. 23。粗橙线是组内均值；不要把左、右两组的曲线混成同一种测试。*

### 稳定性：为什么冻结 MoE router？

Fig. 11 比较的两条 Pro RL 运行只在 router 是否冻结上不同。可训练 router 的第 9 层负载 CV 从约 0.78 到 2.0、峰值负载从 6× 到 16×、冷专家比例从 0.5% 到 22%；冻结后这些统计大致平稳。论文还把 step-20 checkpoint 的 router 参数恢复到 RL 前值：负载恢复，而 benchmark 表现不变。这一步帮助定位负载崩塌与 router 漂移的关系。（PDF pp. 23–24, Fig. 11）

### 开放资源与最终模型：分清两个实验层级

Table 6 从同一个 **Distill-Qwen-9B SFT checkpoint** 出发，分别在四个领域做 GRPO；报告的 11 项指标均高于 SFT。下图展示其中两项，保留各自的指标协议。Table 7 另做多 harness 代码实验，报告 3 种代码评测 × 7 个 harness 的 21 个组合均比 SFT 好。两张表属于开放小模型资源实验，不是 Pro/Flash 大规模混合 RL 的消融。（PDF pp. 34–36, Table 5–7）

```paper-chart
{"type":"paired","title":"开放小模型：SFT → 领域 RL","subtitle":"不同任务与 avg@n 协议分行展示；单位：%","source":"PDF p. 35, Table 6","rows":[{"label":"SWE-bench Verified · avg@3","before":61.1,"after":66.2},{"label":"Terminal Bench 2.1 · avg@1","before":37.1,"after":52.8}]}
```

最终模型 Table 3 则汇总 Pro/Flash 与前代、其他模型在多领域 benchmark 的表现。它展示整条训练链之后的能力，不可据此单独算出 GRS、GAR、多 harness 或 MOPD2 的增益。读表时必须逐行看任务、模型、指标和评测协议。（PDF pp. 25–26, Table 3）

## 07 / 读完后应留下怎样的认识

**可带走的系统图像：**训练吞吐决定能探索多少长轨迹；环境和 harness 决定探索空间与交互差异；GRS/GAR 决定通过测试之外还能学到什么；基础设施把这些异质轨迹稳定送到训练；MOPD2 再汇合不同领域的能力。（PDF pp. 3, 8–19, 24–32）

**实验各回答各的问题：**Fig. 3 是整体训练趋势，Fig. 8 看 GAR 的定向比较，Fig. 10 看跨 harness 迁移，Fig. 11 看 router 稳定性，Table 6–7 看开放小模型资源。把它们并置，能理解报告的设计逻辑；把它们相加为“某个单一模块带来全部提升”则超出了证据。（PDF pp. 8, 18–26, 34–36）

**原文的一处数字冲突：**PDF p. 3 写 Pro 为 1.02T 总参数、42B active parameters；p. 6 的 Table 1 却写 42T active parameters。本阅读文档保留两处原文，并把后者视为疑似表内笔误；不拿这个冲突值继续计算。

**下一步读原文：**想看训练目标，读 pp. 8–9 的 Eq. 1；想核查两种 grader，读 pp. 16–19 的 Fig. 7、Eq. 2–3、Fig. 8；想看规模化实现，读 pp. 26–32 的 Fig. 14–16；想看开放复现资源，读 pp. 33–36 的 Table 4–7。若要复现或审稿，还需继续核查代码、数据和具体评测协议。
