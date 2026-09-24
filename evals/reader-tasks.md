# Reader tasks for the published examples

Use the linked HTML only. Do not provide the PDF, Markdown source, or answer key until the reader finishes. For each question, record the answer, time, backtracking, and whether the reader needed another source. Mark `2` when the answer includes the decisive mechanism and boundary, `1` when it is directionally right but loses an important condition, and `0` when it is missing or wrong. This task set is a protocol for future readers; it is not a report of an independent study.

## Transformer · [HTML](../docs/attention-is-all-you-need-deep-read.html)

1. Why are position information and a causal decoder mask both needed if the model uses attention?
2. In Eq. 1, what does division by $\sqrt{d_k}$ do, and what happens to a future token's weight in masked attention?
3. What do the 28.4 test BLEU and 25.8→24.9 development BLEU results test, respectively? Can they be treated as one matched comparison?
4. What cost or limitation remains after replacing recurrence?

**Answer key.** Position information distinguishes token order without recurrent state; the decoder mask prevents a target position from seeing future targets. Scaling keeps dot products from growing with key dimension in the paper's illustration; a masked future score becomes $-\infty$ and receives zero softmax weight. The 28.4 result is the big model's EN→DE newstest2014 full-system translation score; 25.8→24.9 is an EN→DE newstest2013 development-set ablation changing eight heads to one. They are different evaluations. Unrestricted self-attention has quadratic sequence-length work, and output generation remains autoregressive. See §§02–04 and 06–07.

## DeepSeek-V4.1-Flash · [HTML](../docs/deepseek-v4.1-flash-deep-read.html)

1. Name the three different serving costs in the paper's global map and the intervention aimed at each one.
2. Why do 8B/16B active parameters, 890 bytes per token, and roughly one-eighth persistent KV not combine into a single model-compression ratio?
3. What does changing the agent scaffold for the same checkpoint show, and what does it prevent you from concluding about one cache component?
4. What is approximate about bounded replay?

**Answer key.** CED targets long-prefix prefill computation; CSA2 plus lower-precision storage targets runtime global KV; bounded replay and cache policy target persistent local KV. The values describe computation and two different kinds of storage, with different denominators. Same-checkpoint scaffold differences show that agent score depends on the evaluation setup; predecessor comparisons also vary many model and training choices, so a benchmark gap cannot isolate one cache component. Bounded replay reconstructs only a recent window rather than exact full local history. See §§01–04 and 06–07.

## MiMo-V2.6 · [HTML](../docs/mimo-v2.6-deep-read.html)

1. 为什么报告把训练算力、任务／harness 多样性和评分视为扩展 Agent RL 时相互关联的条件？
2. 在 Eq. 1 中，序列级优势怎样作用到 token？重要性比率、训练遮罩和分母分别做什么？
3. GRS 和 GAR 是前后相接的两个训练阶段吗？它们各自解决什么质量问题？
4. 哪些报告结果描述整套系统的学习趋势，哪些是对 GAR 或 harness 多样性的较窄检查？

**参考答案。** 增加 rollout 算力扩大探索，但任务与 harness 决定能探索什么，评分器决定哪些轨迹转化为有用的学习信号。序列级优势会广播到生成响应的各个 token；重要性比率处理采样策略与当前策略的差异，训练遮罩排除非模型生成片段，分母是组内轨迹的 token 总数。GRS 和 GAR 分别服务不同的代码任务子集，不是串行阶段：GRS 复用离线构建的任务 rubric；GAR 比较当前通过的解答并重新分配正优势。原论文 Fig. 3 展示整体训练趋势，Fig. 8 在仅代码的设置中检验 GAR，Fig. 10 检查留出 harness 的表现。对应 HTML 第 01–03、06 章。

## RAFT · [HTML](../docs/raft-deep-read.html)

1. 作者把领域 SFT 的遗忘拆成哪两条缺口？同一份融合答案分别在数据阶段和训练阶段承担什么角色？
2. 自条件改写后，余弦相似度低于阈值时保留什么答案？这个决定要防止什么问题？
3. 答案条件教师比学生多看到什么？Top-K 集合由谁选出，EMA 权重又平衡哪两项损失？
4. Table 1 与 Table 2 各能支持什么结论？为什么不能据此断言 RAFT 对任意模型和领域都最优？

**参考答案。** 两条缺口是监督与原模型输出不兼容、以及固定目标 SFT 没约束模型在自身前缀上的行为。融合答案既是学生 SFT 的目标，也是教师在学生轨迹上给出软目标时可见的参考上下文。改写与原答案的相似度低于阈值时回退原答案，以减少语义漂移。教师额外看到融合答案与参考提示；教师分布选出 Top-K token，学生和教师都在该集合重归一化；EMA 根据 SFT 与 KL 损失的滑动均值调整 KL 权重。Table 1 是三模型、五领域的整系统比较；Table 2 在 SmolLM3 的三个领域依次比较原始数据 SFT、融合数据 SFT 和完整 RAFT，分别检查数据与在线蒸馏的增益。论文未覆盖更大模型与任意领域，Table 1 也并非每个指标都由 RAFT 领先。对应 HTML 第 01–05 章。

For each paper, the reader should also identify one conclusion that the reported evidence **does not** isolate. Accept a paper-specific boundary explained with the relevant result, not generic skepticism.
