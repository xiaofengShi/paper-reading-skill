# Reader tasks for the published examples

Use the linked HTML only. Do not provide the PDF, Markdown source, or answer key until the reader finishes. For each question, record the answer, time, backtracking, and whether the reader needed another source. Mark `2` when the answer includes the decisive mechanism and boundary, `1` when it is directionally right but loses an important condition, and `0` when it is missing or wrong. This task set is a protocol for future readers; it is not a report of an independent study. Add one section per published reading — four questions plus an answer key — and keep counts and wording general rather than naming a fixed number of examples.

## ResNet · [HTML](../docs/resnet-deep-read.html)

1. What is learned by the residual branch, where does the 2015 block place its final ReLU, and when does a zero branch preserve the input?
2. Which ImageNet comparison most directly tests the shortcut without adding parameters? What does its training error diagnose?
3. Why does the 1202-layer CIFAR result separate successful fitting from generalization? Give the relevant error values and run-reporting boundary.
4. Can the 4.49% and 3.57% ImageNet top-5 errors isolate ensemble benefit, or the 2016 identity-mapping analysis be attributed to the 2015 paper?

**Answer key.** The branch learns F(x) around the shortcut; the original unit applies ReLU after F(x)+x, so F=0 is identity for nonnegative x, not arbitrary signed x. Same-depth option-A plain/residual 34-layer models have matched parameter count; Table 2 10-crop validation error is28.54%→25.03%, and Fig. 4 supplies training degradation evidence. The 1202-layer model has <0.1% training error but 7.93% test error; 110-layer mean is 6.61±0.16% over 5 runs, best 6.43%. The authors suggest overfitting, but no corresponding stronger-regularization ablation or 1202 repeated-run uncertainty establishes a general causal account. 4.49% is single-model multi-scale validation, 3.57% six-model test; different protocols prevent a matched estimate. The 2016 propagation/pre-activation work is a separate source, not a theorem or architecture from 2015. See the named mechanism, ImageNet, CIFAR, and later-interpretation chapters; withhold native answer disclosures during an independent diagnostic.

## LoRA · [HTML](../docs/lora-deep-read.html)

1. 为什么冻结 W0、让 B 从零开始，仍能在训练后改变模型行为？合并又依赖什么条件？
2. 设一个 4,096 × 4,096 矩阵，r=8，A、B 一共有多少参数？这能否预测总显存或准确率？
3. 4.7M LoRA 的 WikiSQL 73.4 对全量微调 73.8、MNLI 91.7 对 89.5，各支持什么方向的结论？
4. 为什么不能把 Table 4 的预算标签直接当作唯一的可复现配置？

**参考答案。** A 随机、B=0 使初始 BA=0；任务梯度更新 A、B 后增量可以非零，W0 保持冻结。线性支路允许将缩放后的 BA 加进 W0，合并后保持原前向形状；这不是任意非线性 adapter 都具备的性质。A、B 有 r(d+k)=65,536 个参数，占全矩阵 0.390625%，少256倍；这是单矩阵算术，底座和激活仍在，任务质量需要另测。WikiSQL 验证准确率低0.4个百分点、MNLI高2.2个百分点，需分别看任务、比较条件和典型种子波动，不能说处处领先或统计显著。4.7M 可以对应不同矩阵/rank组合；37.7M 的附录说明与 Table 15 还存在冲突。本页保留冲突，不补造唯一配置。见 HTML 第02–05节。若做独立诊断，先不向读者展示页面末尾的答案 disclosures，也不给本答题键。

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

**参考答案。** 增加 rollout 算力扩大探索，但任务与 harness 决定能探索什么，评分器决定哪些轨迹转化为有用的学习信号。序列级优势广播到响应 token；重要性比率比较当前训练策略与生成时旧策略的概率。Eq. 1 的 M 依正/负优势各自的比率界限门控更新；轨迹导出与 penalty mask 另外排除工具返回等非模型生成片段。每个 prompt 先用组内全部响应 token 数归一化，再对 prompts 求均值（prompt-mean），不是对整个批次全部 token 一次求均值。GRS 和 GAR 分别服务不同的代码任务子集，不是串行阶段：GRS 复用离线构建的任务 rubric；GAR 比较当前通过的解答并重新分配正优势。原论文 Fig. 3 展示整体训练趋势，Fig. 8 在仅代码的设置中检验 GAR，Fig. 10 检查留出 harness 的表现。对应 HTML 第 01–03、06 章。

## RAFT · [HTML](../docs/raft-deep-read.html)

1. 作者把领域 SFT 的遗忘拆成哪两条缺口？同一份融合答案分别在数据阶段和训练阶段承担什么角色？
2. 自条件改写后，余弦相似度低于阈值时保留什么答案？这个决定要防止什么问题？
3. 答案条件教师比学生多看到什么？Top-K 集合由谁选出，EMA 权重又平衡哪两项损失？
4. Table 1 与 Table 2 各能支持什么结论？为什么不能据此断言 RAFT 对任意模型和领域都最优？

**参考答案。** 两条缺口是监督与原模型输出不兼容、以及固定目标 SFT 没约束模型在自身前缀上的行为。融合答案既是学生 SFT 的目标，也是教师在学生轨迹上给出软目标时可见的参考上下文。改写与原答案的相似度低于阈值时直接保留原答案、跳过融合，以减少语义漂移。教师额外看到融合答案与参考提示；教师分布选出 Top-K token，学生和教师都在该集合重归一化；EMA 根据 SFT 与 KL 损失的滑动均值调整 KL 权重。Table 1 是三模型、五领域的整系统比较；Table 2 在 SmolLM3 的三个领域依次比较原始数据 SFT、融合数据 SFT 和完整 RAFT，分别检查数据与整套自适应在线目标的增益，不能拆出答案条件、Top-K、EMA 各自的净效应。论文未覆盖更大模型与任意领域，Table 1 也并非每个指标都由 RAFT 领先。对应 HTML 第 01–05 章。

## MechVQA · [HTML](../docs/mechvqa-deep-read.html)

1. What do the three capability axes measure, how is Avg. defined, and what remains unconfirmed about Total?
2. Which gates turn source drawings into verifiable QA pairs, and how is drawing overlap controlled across the split?
3. What does the MechVL-4B Total score of 84.85 compare with, and which tests can identify narrower contributions from training stages or rewards?
4. What discrepancy appears between Figure 2c and the main tables, and how should a reader handle it?

**Answer key.** Recognition reads explicit information, Reasoning infers structure or geometry, and Judging applies engineering rules. Avg. is the macro mean of ten subtask scores. Total is the reported headline score; a question-weighted interpretation is plausible, but its exact aggregation formula and test subtask counts are not specified, so this reading does not treat that interpretation as a verified definition. Expert image filtering and metadata verification precede question generation, cross-model question validation, multi-model answering, and majority-voted labels. The split keeps each drawing and clustered near duplicates within one partition. The 84.85 Total is a full-system test-set score above the general MLLM baselines in Table 2; Table 3's stage, RL-algorithm, and reward ablations give narrower checks. Figure 2c prints 83.44 at its final point while Tables 2–3 report 84.85; preserve the discrepancy rather than silently equating them. See HTML §§01–05.

## IAR · [HTML](../docs/iar-deep-read.html)

1. Inject、Align、Recover 分别解决无检索文档问答的哪一道问题？Inject 与原始 CPT 的损失接口有何不同？
2. Recover 从哪些候选中选择最终检查点？为什么领域分最高的候选不一定被选中？
3. 主表的“7/8 全指标胜出”与恢复前“8/8 领域增益”分别检验什么？哪个设置是边界情形？
4. BudgetMatch 和评委一致性审计各缩小了哪一种解释空间？它们不能排除什么？

**参考答案。** Inject 用续写、改写、指令化重构密集暴露文档，只对助手目标计损；CPT 对原始文档流做 next-token 预测。Align 用 answer-only QA 对齐接口，Recover 将适应模型与原始指令模型合并，以恢复通用能力。Recover 从四族共 12 个固定候选中先按验证集领域与通用护栏筛选，再在领域优先前沿层内取通用均值较高者，因此未必选领域分最高点。7/8 是完整 IAR 与 Vanilla SFT 的四指标整系统比较；8/8 是恢复前 Inject+Align 相对 Vanilla 的领域结果。CCI 的 Phi 设置是主表边界。BudgetMatch 表明仅匹配训练 token 预算不足以解释全部收益，却不单独证明每个阶段的因果作用；评委一致性审计量化评分仪器的不确定性，不能证明标签是人工金标准，也不能覆盖训练种子鲁棒性。对应 HTML 第 01–05 章。

## DeepSeek-V4.1-Flash 中文 · [HTML](../docs/deepseek-v4.1-flash-zh-deep-read.html)

1. 报告把长程智能体的部署成本拆成哪三类？CED、CSA2、FP4、SWA Bounded Replay 四件套各主要对准哪一类？
2. CSA2 的 Full / Reindex / Reuse 三模式在 main KV、indexer K、Top-K 索引上分别自算还是复用？层次稀疏索引器改变了哪个量的复杂度？
3. SWA Bounded Replay 相对精确重建放弃了什么、换回了什么？为什么作者仍敢把 SWA KV 整类移出持久缓存？
4. 推理力度旋钮的证据链包含哪些环节？哪些结论是报告明确不主张的？

**参考答案。** 三类成本是 prefill 计算（缓存未命中）、运行时全局 KV 存储（HBM）、持久 KV 存储与搬运（SSD/主机内存与带宽）。CED 对 prefill：解码器全局 KV 从第 $L/2$ 层投影，prefill 复杂度 $O(NL)\to O(NL/2 + n_{win}L/2)$；CSA2 对全局 KV 与索引：跨层共享去重；FP4 对存储精度（主 KV 相对 FP8 减半）；Bounded Replay 对持久 KV（去掉 SWA KV 近乎减半 × 全局 KV 1/4 ≈ 1/8）。Full 自算 main KV、indexer K 与 Top-K；Reindex 复用 main KV 与 indexer K、重选 Top-K；Reuse 全部复用；三模式都自算 main Q 与 SWA KV。层次稀疏索引器让深层索引层的每查询打分代价从随上下文线性变为候选池常数。Bounded Replay 放弃的是 SWA 状态的数学等价性（重建态近似、后缀输出依赖命中位置），换回的是整类持久 SWA 存储与 $L\times n_{win}$ 的精确重放开销；敢移出持久缓存的依据是实验显示质量影响可忽略 + 后训练中做同模拟适配。力度旋钮证据链：RL 长度惩罚 → 附录 C 在内部、未封顶且边际收益指数衰减等假设下的局部偏好长度推导 → Figs. 9/12 指定设置的 token 与精度曲线 → Fig. 11 与附录 B.2 的跨脚手架检查。B.2 观察到输出长度单调增加，但精度在中间力度有平台和回落；局部长度推导不能推出任意脚手架精度单调，也不是通用延迟保证。报告明确不主张：实测长度必然线性/单调（推导是局部奖励近似）；分数接近 Fable-5、GPT-6 Astra 不等于在最难任务上匹配前沿能力；多智能体结果为初步；稳健性边界（CSA2 选择错误、近似重建）未完整刻画。对应 HTML 第 01–07 章。

## VISTA · [HTML](../docs/vista-deep-read.html)

1. 为什么“编码一次 + 滑动窗口”会在长程交互里结构性地丢失视觉证据？VISTA 的哪两个组件各补上哪一半？
2. RHAE 公式里的平方惩罚、115% 封顶、$w_\ell=\ell$ 加权与通关上限各起什么作用？“100.00”在这一记分法下意味着什么？
3. 消融阶梯 (iv)→(v) 一跳的分数与动作数各如何变化？这一级同时改了哪两件事，使动作数的变化无法归到单一原因上？
4. 论文的哪些结论不能被这些实验隔离？指出一处并用相关结果解释它的边界。

**参考答案。** 现有 VLM 把每张图编码一次后丢掉原始像素，表示随上下文被截断或摘要化，且编码时不知道什么细节日后关键。VISTA 用无损视觉记忆（每帧含动画中间帧按 turn/frame 原样存档）留住证据，用模型主导的检视（inspect 放大、read_pixels 读像素）在推理当下按问题取回。关卡得分 $S=\min(1.15,(h/a)^2)$：动作数等于人类参考 $h$ 时得满分 100%，更少可到 115% 封顶，翻倍掉到 25%；游戏得分取“加权完成度”与“加权平均分”的较小值，$w_\ell=\ell$ 让靠后关卡更重，因此“100.00”表示所有关卡通关且加权动作效率不低于人类参考（不是效率天花板）。(iv)→(v) 是接口可比阶梯内最大的一跳（RHAE 70.05→94.10，+24.05），支持“证据可达性是关键增量”的读法；观察到同级动作数 23,702→12,261（更早的 (iii) 曾达 28,626）。这一级同时做了两处改动：接入无损记忆与检视，并把每动作自动附带最多 7 帧改为只自动返回最后一帧。因此动作回落不能单独归因于免费检视；可能的解释包括检视替代了试探性动作、自动推帧减少浪费，论文未做因果分解。可指出的边界包括：模型发布晚于公开基准、不能排除训练污染（作者自述）；空间维与时间维检视捆绑测量、未正交分解；“免费检视换掉试探性动作”是读者推断而非论文因果结论；Opus 的 100.00 无重复运行数据。对应 HTML 第 01–05 章。

## OpenDS-World · [HTML](../docs/opensds-world-deep-read.html)

1. 任务定义把哪三类属性立为“真实网页”的正交刻画？它们分别对应信息的哪个侧面，为什么说 OpenDS 测的是“证据获取过程”而非检索质量？
2. 构建流水线的三段各自降低哪种捷径或失效风险？人工验证与人类实测各承担什么角色，仍不能保证什么？
3. “GPT-6 Astra 与 GPT-5.6 Sol 总 token 几乎相同但差 11 个百分点、Gemini 耗 5.22 倍 token 反而更低分”支持什么读法？它不能证明什么？
4. 自然终止率与准确率为什么是两回事？预算触顶的两种形态（调用触顶为主 vs 时间触顶为主）分别说明什么？

**参考答案。** 三类属性：多模态（信息表现形式）、异构格式（组织结构与解析方式）、交互式访问（获取方式：导航、参数、时间索引、图形操作、声明式查询、文件转移等）。静态评测把证据预先放进语料、抹平获取成本，OpenDS 不告知证据位置与获取方式，把搜索-访问-处理-连接的连续过程作为被测能力。锚点、节点多源佐证与问题反演分别降低纯文本起点捷径、单源失效与直接暴露目标的风险，但没有形式化排除所有捷径或其他正确证据路径。共有 10 名独立评审参与证据与任务有效性核验，不合格题目被剔除；这提供质量控制，不保证错误率为零。50 人提供 1000 次独立尝试，21.10%=211/1000；115/200 是至少一人成功的题目比例，两者分母不同。跨模型 token/时间消耗与准确率没有简单排序关系；这些观察提示进一步研究信源选择、工具协调和停止决策，却未操纵同一模型预算，不能确定瓶颈归因或证明增大预算无效。自然终止只表示模型自己停了，答对与否由独立裁判判定（Astra 69% 自然终止仍只有 39% 正确）；调用触顶为主（如 Qwen3.8-Flash 80%）指向搜索无法在预算内收敛，时间触顶为主（如 GLM 5.3 41%）指向单步执行过慢或低产轨迹不及时放弃，两者是不同的执行失败形态。对应 HTML 第 01–05 章。

## OmniDR-Bench · [HTML](../docs/omnidr-bench-deep-read.html)

1. 任务定义与五类既有设定（视频摘要、文本深度研究、开放网页视频搜索、视频深度研究 QA、文图研究报告）的边界由哪几列刻画？"仅靠视频不够、通用网络研究替代不了源视频"这道收录门槛防住什么？
2. 七阶段工作流里"研究锚点"承上启下：它条件化了什么、又把什么显式化成六类跨源关系？共享状态解决的两个长程问题是什么？
3. ARC 的 S5 行为校准为什么用 R1<R2<R3 三级报告而不是直接人工审报告？0.89% 判据不一致率与两轮人工验证（82→60→50 题）各自保证了什么？
4. 评分公式里的饱和阈值 τ、方向封顶 κ 与"守卫式引用 N/A"各防住哪种刷分或误伤路径？"来源数量 98% vs 论断支撑 24%"说明引用维度内部发生了什么？

**参考答案。** 五列：源视频/开放网页/视频检索/长报告/时间链接，仅本任务全占。门槛保证任务同时需要视频的视听时间语境与外部证据，防止退化为纯视频摘要或纯话题研究。锚点把检索从主题级泛搜收敛到视频具体论断/参数/实体（条件化四路检索分支），并把外部证据的支持/矛盾/更新/解释/对比/应用六类关系显式挂到视频时刻；共享状态（时间线+锚点+证据+未解问题+报告数据）减少重复上下文加载并防长程目标漂移。R1<R2<R3 检验判据树对"证据可及性"有响应——若只看视频的报告也能拿高分，说明测的是文风不是研究；0.89% 是 R2 三次评分的判据稳定性，两轮人工验证则保证事实与判据本身的正确性（最终抽检 94%+ 正确），二者测的是不同的可靠性。τ 把高产方向分数变成预算归一化（防止"写不满=全零"），κ 防止高产方向淹没维度分，守卫式 N/A 只有当省略事实的内容增益大于引用分母缩小的收益时才允许转 N/A（防止"省略换分母"刷分）；98% vs 24% 说明引用维度内"找到来源"（数量/多模态材料）与"用上来源"（行内引用落在它支撑的论断旁、引用闭合）断裂——报告把链接堆进末尾 Sources 区而没有做证据整合。对应 HTML 第 01–05 章。

## Dual Exam · [HTML](../docs/dual-exam-deep-read.html)

1. 耦合试点（150 例）的三项审计指标各测什么？为什么 0% 任务成功率加上轨迹审计仍然定不了责——缺的是哪种证据？
2. 双轨设计的两行公式里，Agent 轨道的 T* 与 WM 轨道的 a* 各自固定了什么？"固定"控制了哪种变异、又不能证明什么？
3. 两条轨道"共享规范、各测各的"是什么意思？为什么 Agent 指数 31.3 与 WM 总分 21.7 不可直接比较？
4. "WM 总分第一名不等于某个 Agent 的好搭档"这一读法依据哪组结果？它对选择 Agent–世界模型配对意味着什么？

**参考答案。** 状态一致性测身份/状态保持与请求效果实现；纠正响应测偏差在两步内是否得到针对性响应（不测修复成功）；任务成功测完整目标与约束。定不了责是因为耦合中一方输出即另一方输入，任何失败都可能来自 MA 决策、WM 响应或交互环本身，回溯审计无受控对照。T* 固定参考环境响应机制（环境端变异为零，考动作选择/验证/恢复/完成），a* 固定干预序列（动作端变异为零，考效应实现与状态保持）；固定控制了被固定侧的变异，但不证明参考机制无错（附录 C 区分已验证与未验证检查）。同一不变量（如"物品进指定容器且容器身份不变"）可在两轨各自表达，但任务、指标、聚合规则不同——1088 题题数加权的指数与 8 场景等权的 WM 总分单位与分布都不同。依据：GPT-Image-2 总分 21.7 第一但在具身场景只有 20.9，被 MiniMax H3（具身 53.8）反超；WM 总分按八场景等权，而具体 Agent 实际遭遇的状态-动作分布不同，配对评估须在该对真实交互分布上进行。对应 HTML 第 01–04 章。

## Trustworthy RSI Survey · [HTML](../docs/trustworthy-rsi-survey-deep-read.html)

1. 综述用哪三层的定义把 RSI 与常规自我改进区分开？h 与 B 的功能性区分用什么判据，为什么同一段提示可能分属两层？
2. S1–S4 与 RI 各是什么？"阶段"在这个框架里承担什么分析职能——它本身是不是一种评测？
3. 八组可信性要求如何归并为四主题与三种分析角色？为什么说四主题"不是流程阶段而是检查面"？
4. "26 → 4"的证据漏斗说明什么问题？综述据此为元改进层规定了什么对照设计？为什么任务分数在这一层不构成证据？

**参考答案。** 任务策略 h（含模型+提示+记忆+技能+工具的组合体）、归纳偏置 B（如何构造/筛选策略更新）、偏置更新函数 U（修订 B 并修订自身）。判据是功能性而非载体：执行任务的提示属 h，治理更新的规则属 B（"提交前跑测试"是 h，"挑选纠正轨迹去训练"是 B）；同一模块兼任两职时须对两种效果分别识别。S1 改进诊断、S2 提案生成、S3 提案评估、S4 更新实施，同一过程递归作用于 U 即 RI。阶段是风险定位器：失败与护栏都挂到具体阶段上，但它只是分析框架，不是评测本身。八组要求（有效性/安全对齐/公平/安全隐私/透明/人类控制/问责等）归并为四主题：真实持续改进（有效性角色）、行为约束与公平+系统安全隐私（约束保持角色）、透明可控（有效监督角色）；主题在每个阶段都要被检查，故是"检查面"而非步骤。漏斗：114 项自我改进研究审查中 26 项自称改进了改进器，仅 4 项做同起点等预算对照——元改进声明几乎无法与"改了接受判据"区分。规定配对延续设计：同一起点（h_t/B_t/持久状态）双臂分别用 U_t 与 U_{t+1}，等任务流/权限/预算，产物在同报告任务上评估；因为改 U 可能改掉"什么算改进"，任务分数由被修订的判据产生，循环论证。对应 HTML 第 01–04 章。

For each paper, the reader should also identify one conclusion that the reported evidence **does not** isolate. Accept a paper-specific boundary explained with the relevant result, not generic skepticism.
