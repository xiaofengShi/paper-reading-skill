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

## MechVQA · [HTML](../docs/mechvqa-deep-read.html)

1. What do the three capability axes measure, and why do the ten subtasks make Total and Avg. different summaries?
2. Which gates turn source drawings into verifiable QA pairs, and how is drawing overlap controlled across the split?
3. What does the MechVL-4B Total score of 84.85 compare with, and which tests can identify narrower contributions from training stages or rewards?
4. What discrepancy appears between Figure 2c and the main tables, and how should a reader handle it?

**Answer key.** Recognition reads explicit information, Reasoning infers structure or geometry, and Judging applies engineering rules. Total is question-weighted while Avg. is the macro mean of ten subtask scores; uneven subtask counts make them differ. Expert image filtering and metadata verification precede question generation, cross-model question validation, multi-model answering, and majority-voted labels. The split keeps each drawing and clustered near duplicates within one partition. The 84.85 Total is a full-system test-set score above the general MLLM baselines in Table 2; Table 3's stage, RL-algorithm, and reward ablations give narrower checks. Figure 2c prints 83.44 at its final point while Tables 2–3 report 84.85; preserve the discrepancy rather than silently equating them. See HTML §§01–05.

## IAR · [HTML](../docs/iar-deep-read.html)

1. Inject、Align、Recover 分别解决无检索文档问答的哪一道问题？Inject 与原始 CPT 的损失接口有何不同？
2. Recover 从哪些候选中选择最终检查点？为什么领域分最高的候选不一定被选中？
3. 主表的“7/8 全指标胜出”与恢复前“8/8 领域增益”分别检验什么？哪个设置是边界情形？
4. BudgetMatch 和评委一致性审计各缩小了哪一种解释空间？它们不能排除什么？

**参考答案。** Inject 用续写、改写、指令化重构密集暴露文档，只对助手目标计损；CPT 对原始文档流做 next-token 预测。Align 用 answer-only QA 对齐接口，Recover 将适应模型与原始指令模型合并，以恢复通用能力。Recover 从四族共 12 个固定候选中先按验证集领域与通用护栏筛选，再在领域优先前沿层内取通用均值较高者，因此未必选领域分最高点。7/8 是完整 IAR 与 Vanilla SFT 的四指标整系统比较；8/8 是恢复前 Inject+Align 相对 Vanilla 的领域结果。CCI 的 Phi 设置是主表边界。BudgetMatch 表明仅匹配训练 token 预算不足以解释全部收益，却不单独证明每个阶段的因果作用；评委一致性审计量化评分仪器的不确定性，不能证明标签是人工金标准，也不能覆盖训练种子鲁棒性。对应 HTML 第 01–05 章。

For each paper, the reader should also identify one conclusion that the reported evidence **does not** isolate. Accept a paper-specific boundary explained with the relevant result, not generic skepticism.
