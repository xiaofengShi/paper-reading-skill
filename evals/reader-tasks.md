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

## The Trinity · [HTML](../docs/the-trinity-deep-read.html)

1. 论文的 position 是什么转变？支持这个转变的关键对照是哪组数字——同一拓扑下「真实任务课程」与「仿真课程」的差别说明什么？
2. 六协议 Harness 里模块的纯函数约束（无隐藏状态、不动环境）为什么重要？进化只改模块配置、冻结 θ，这把 RSI 的对象放在综述语言（h/B/U）的哪一层？
3. 选择性继承 ⊕ 的合成规则是什么？「父更新严格更优才被采纳」防住哪种失败，对应综述里的哪个声明层级？
4. Router 的三档消融各自加了什么信息？「逼近 Oracle 的 96%」是什么口径，剩下的差距可能来自哪里？

**参考答案。** 从任务驱动特化转向能力驱动组织：异质任务共享底层能力需求。Table 3 中能力树（Sim）56.95/47.26 对能力树（Real）53.44/42.31——同拓扑同继承，仅把课程换成能力聚焦的简化仿真世界即 +3.51/+4.95，说明增益来自「在共享能力上练」而非环境数量（11 个环境对 28 个基准，less is more）。纯函数约束保证模块可验证、可组合、可按版本血缘追溯（宿主能检查接口与证据），不会被隐藏状态破坏复用；进化改的是模块配置的构造与选择规则，属 Harness 层的归纳偏置 B（Creator 的 Base 汇合程序每轮被改写则触及 U），θ 冻结故不属 h 的参数侧。⊕ 右偏并集：本地覆盖父级、父级补位，祖先按记录版本自根组合；「严格更优才继承」在相同验证任务与预算下挡住进化回退，对应综述的后继级声明（继承的改动仍成立）。三档：仅任务公共信息→加能力定义与分支卡→加验证经验记忆；Unseen 从 52.36→58.27→60.96，Oracle 63.61，96% 指完整自路由/Oracle 的分数比；剩余差距来自路由是信息受限的在线决策（未见任务能力标签不可用、记忆只含已验证配置的性能观测），Oracle 则是事后逐实例回看选最优。对应 HTML 第 01–05 章。

## Rollback · Deep Reading · [HTML](../docs/rollback-deep-read.html)

1. 从一条真实失败轨迹开始，追踪参考主干、缓存恢复、首次兄弟分叉、分歧补采样和标签提取。256 的搜索预算以什么为单位，为什么可能超出？新模型发布时，一棵已开始的树如何处理版本？
2. 五档标签下，同一个恢复上下文的两个子树有 2/3 和 1/3 个成功叶子，得到什么标签？如果三个兄弟为 0、0.2、0.4 呢？解释“最高档”为什么不保证高绝对成功率，并说明真实失败轨迹是否丢弃。
3. 对二维教学动作 (0.2, −0.4)、噪声 (0.6, 0.1)，当 flow 时间从 0.25 改为 0.5，插值与训练目标各怎样变化？为什么生成时的积分方向从 1 到 0？
4. 从 150、90、135 次试验重算 Rollback 的三任务宏平均。为什么 57.93% 不等于把所有试验合并的成功率？主表与两个积木消融各能隔离什么，仍不能隔离什么？
5. 64 条冰壶 episode 上 L1 从 19.52 到 12.96，0/40 的积木 reward 假阳性，以及超过三人手工均值，分别支持什么范围的结论？至少用一个位置级退步反例说明平均领先的边界。

**参考答案。** 真实轨迹在动作块边界形成主干，真实结果先回传；根缓存及首次使用时构造的其他缓存允许恢复中间上下文，首次展开两个动作，各 rollout 到成功或深度限额。暂时不同档位的兄弟进入补采样队列，优先补访问不足者，最后按叶子成功比例提取有区分度的组。256 统计生成动作块，已启动 rollout 和原子兄弟对会完成，所以是软预算；每棵树固定开始时的策略与世界模型快照，新版本由后续树使用。2/3 对 1/3 归一化为 1 与 1/2，标签为 5、3；0、0.2、0.4 对应 1、3、5。标签相对组内最优，0.1 也可成为最高档；真实失败仍用于最低档策略训练和真实转移预测，不能套用全零想象组的丢弃规则。时间 0.5 时插值为 (0.4, −0.15)，目标仍为噪声减动作 (0.4, 0.5)，生成从噪声端 1 向动作端 0 积分。主结果对应成功数 104、36、87；等权宏平均约 57.93%，合并 227/375 约 60.53%。主表比较整套方法；冻结模型消融检查关闭适配，直接 reward 消融保留搜索、改用单 rollout 标签；它们不是完整 2×2 因子设计，不能量化所有独立贡献或协同效应。64 条冰壶轨迹也用于共同演化模型适配，L1 下降是当前策略数据上的拟合诊断；0/40 限于八条失败 episode 的重复回放，不证明全局 reward 无误，也不测成功召回；三人对照限于所报执行条件和参与者。反例包括积木 P2 的 Rollback 56% 低于 RISE 80%，或冰壶 P9 的 73.33% 低于 RISE 100%。对应 HTML 第 02–15 章。

## LongZero · [HTML](../docs/longzero-deep-read.html)

1. 为什么「先写长文再出题」会继承要训练的弱点，而「先写规格再展开」能把出题可靠性剥离出来？答案的正确性由哪几层保证？
2. 推理数据与检索数据各训练什么技能？消融中各自的单项损失是什么、2:1 混合为何是唯一全面不降的配置？
3. 不稳定带过滤为什么必要（GRPO 的哪条性质）？它如何让数据难度自动贴合出题者，又如何解释 8B 提升小于 4B-Thinking？
4. 「397B 教师基线不敌自合成数据」说明了什么？8B 在 AA-LCR 的近零分应如何归因？

**参考答案。** 先写长文再出题时，出题与验证都依赖尚不可靠的长上下文推理；先写规格只用到已可靠的短上下文能力（写结构化 JSON、局部一致性），长文本仅在展开环节出现。正确性三层保证：答案在规格中构造即定、程序化忠实门（答案或别名须逐字出现在展开文本，否则弃题）、全虚构实体杜绝参数记忆。推理数据练跨文档串联事实与拒绝相似干扰，检索数据练在近重复回复中精确定位与复现；单项消融中仅推理在 AA-LCR 与 LongReason 低于 Base、仅检索平均反降，2:1 是五基准中四项最佳且全部不低于 Base 的配置。GRPO 组内归一化使全对/全错题优势为零、无梯度；不稳定带（一正一误即留）只保留有学习信号的题，且同一模型出题与过滤使难度随能力演进；8B 保题率仅 13.1%（4B-T 17.7%），合成浪费多、数据更稀且底子弱，故增益小。教师基线说明更强的生成器不保证更好的训练数据——题目难度与策略能力错位时再大的教师也没用；自合成+自过滤天然对齐能力。AA-LCR 输入 72K-115K，YaRN×4 后 131K 窗口扣除输入所剩输出空间太小，思考模型常未给出最终答案就耗尽 token（120/200 无答案），属窗口吞吐约束而非方法失败。对应 HTML 第 01–05 章。

## HarnessPro · [HTML](../docs/harnesspro-deep-read.html)

1. 双目标公式里 s.t. PR(h)≥PR(h₀) 这条约束为什么关键？没有它会退化成什么？
2. 用固定生成测试替代 LLM 判官解决了什么问题、又引入了什么新的上限？「固定」二字承担哪两种作用？
3. 归一化加权平方距离选择（Eq. 8-9）在做什么？为什么用平方距离而不是线性加权和、为什么每轮为三档各留一个代表？
4. 消融中「RHO+动态路由 / +预算 hooks / +固定低力度」全部被支配说明什么？这与「进化出的 harness 靠什么降本」的分析如何互相印证？

**参考答案。** 性能地板把降本限制在不伤通过率的区域内；去掉它，进化会找到无脑砍上下文/降推理力度的捷径（消融里固定低力度 62.7 分即此退化的实证），成本大降性能崩塌。解决：LLM 判官系统性乐观（把缺陷实现判成功），固定测试把失败检出率从 41.7% 提到 83.3%；上限：尺子本身有约六分之一失败漏检，进化中的选择压力建立在这把有误差的尺子上，靠测试集官方测试兜底最终结论。「固定」两用：候选间比较的尺子不变（公平），且进化无法通过改判据伪造进步（堵元改进层漏洞）。Eq.8-9 对过滤集内的通过率与成本按极值归一化成偏离量，三档用不同 (α,β) 权重取加权平方距离最小者；平方形式偏好两边都不太差的折中点而非单边最优；三档各留代表让下一轮搜索覆盖不同预算区域，避免收敛到单点（这正是输出帕累托集而非单一 harness 的机制落点）。说明双改善来自组合机制（按任务选执行档位+运行时预算护栏+RTK 输出压缩+指令精简）与递归选择压力，单个机制移植只能单边受益（降本掉分）；§5.3 的进化产物分析恰好列出这套组合，两组证据互证框架归因。对应 HTML 第 01–05 章。

## A-RSI · [HTML](../docs/a-rsi-deep-read.html)

1. U_w 下降的三种非掌握性原因各举一例？动态重采样给了 U_w 什么免疫力？
2. Eq.6 手算：λ_stop 从 0.3 改 0.9、λ_fmt=0.1 不变，排序保证还成立吗？最坏差值？
3. A-RSI 用 800 任务赢 Continuous 3200 的机制有哪几条？"模型自评 AUC=0.50"说明什么？
4. No-Refresh 为什么没有 S32？死因链条是什么？
5. 长预算审计保留 80% vs 59% 的对比说明什么？不能证明什么？
6. 检测器的时机主张为什么"未确立"？三次决策验算中哪一次最能证明检测器读到了真实状态？

**参考答案。** 全错响应（组内全零优势）、响应分布集中、动态重采样改变可见集合。免疫力：偶发全同组被重采修复，只有系统性枯竭才使 U_w 持续走低。R_c^min=1-0.9=0.1，R_w^max=0+0.1=0.1，差=0——保证失效（λ_fmt+λ_stop=1 恰好踩线）。机制：每池用满 3 窗榨干信号；新池训练准确率 0.35 vs 旧池末 0.57 确认新鲜；整池替换保持窗口内稳定 vs 每窗重置。AUC 0.50=模型自评难度等于抛硬币——选择器可用的难度信号太弱，随机固定配额的多样性优于任何单向偏好。健康门两次失败后停机（S31 时 35 次零信号警告、94/100 正常步）。死因链：信号枯竭→有效更新减少→训练不健康→停机——不是分数意义的"学完了"。80% 保留（vs 59%）说明增益大部分与预算无关（答案改正而非收尾），且与案例分解的 A/B 组自洽；不能证明推理过程正确（B1 的改正也未逐步验证推导），且 20% 流失仍归因于收尾。时机未确立：前两次刷新与每 3 窗固定表重合、固定选择下检测器比定期低 0.30 分；最能证明读状态的是 MiMo 第三池保留决策（0.9868>0.85）与 Qwen/MiMo 同阶段反向决策——但那是末轮离线重放而非训练中执行。对应 HTML 第 01–12 章。

## CausalWAM · [HTML](../docs/causalwam-deep-read.html)

1. 为什么「拟合好演示」不保证动作头只从动作相关潜变量出动作？给出共轭构造的骨架。
2. Prop 1 与 Thm 1 之间差的那一步是什么？「两侧夹逼→逐行取等」的求和论证为什么要求同一个置换 ρ 服务所有动作维？
3. Thm 2 证明里右上零块与 P 可逆分别在哪个环节用掉？为什么「零块+整体可逆」联合排除 P11 奇异？
4. 合成实验里 CWAM 带稀疏与去稀疏的实测差距（R² 0.9957 vs 0.9876、Selected/full 1.704 vs 3.456）远小于与 VAE/dense 的差距——这说明什么、不能说明什么？
5. C-only 保持 84.6% 成功率能否证明「动作只依赖路由 token」？random matched 34.4% 又排除了什么？
6. E 扫描（Table 4）里 E≥2 的 Δ_nuis 反而比 E=1 更紧，机制是什么？这与「定理不假设 regime 演化」如何互相印证？

**参考答案。** 共轭构造：任取可逆 ψ，令 f̂=f∘ψ⁻¹、π̂(ŝ)=π(ψ⁻¹(ŝ),η)，两过程 (o,a) 分布完全相同而 ŝ=ψ(s) 可任意混合桌布与积木坐标——数据侧不可区分，只能从结构侧（约束 π̂ 依赖模式）下手。差的一步是式 3 的支撑稀疏（‖I(J_π̂)‖₀≤‖I(J_π)‖₀）：Prop 1 给逐行下界 ρ(I_i)⊆S_i，稀疏给总数上限，求和夹逼出总数相等，任何一行严格大于都会使总和严格大于而矛盾，故逐行取等；共享 ρ 是 Step 4（Leibniz 行列式选非零对角置换）不依赖动作维 i 的直接后果——若各行各用各的置换，求和论证无法闭合。零块（由式 20+支撑对齐）用来把 P 排成块下三角并保证 P⁻¹ 右上为零，得双向零偏导再升为功能无关；可逆性给出 det P=det P11·det P22≠0 → P11 可逆 → h 的雅可比存在 → h 可逆；若 P11 奇异则块三角下 det P22 也须奇异与整体可逆矛盾。说明：在「按头权选块」的前提下稀疏惩罚的实测增益是收紧性质（Selected/full 减半、R² 微升、Δ 贴零更稳）而非从无到有——理论地位（保证）与实测差距（改进）要分开陈述；不能说明稀疏可有可无：去稀疏版本没有 Thm 1/2 的保证，在更刁钻的真机制（span 退化、更强耦合）下可能失效，本合成环境只是其一。不能证明：默认策略仍保留稠密路径且是 token 级证据非坐标级 I_A、不重训的评估期干预不等于训练分布、充分性≠平时只用；random 34.4% 排除「等量任意 token 都行」的无信息解释，与合成头消融同构，合起来是「路由选出信息充分子集」。机制（页面推断）：e_t 每步 iid 重抽对 nuisance 乘 [0.5,1.5] 因子，E 越大经 W_s 耦合回相关块的可预测 nuisance 痕迹被平均越干净、本底参照越准，而动作机制与 I_A 支撑全环境族不变——定理关心的对象没动，R² 当然不动；这正是「无 regime 假设定理」预言的稳健形状的实证面。对应 HTML 第 01–16 章。

## CUA-Master · [HTML](../docs/cua-master-deep-read.html)

1. 单向流水线与闭世界递归自我改进各自缺什么？CUA-Master 的双环分别补哪一半？
2. 手算：K=3、N=2，应用 A 有 4 条原语、B 有 3 条，A 的 1 条与 B 全部原语前置冲突，合法组合最多几个？
3. 快照回滚：120 步任务第 95 步失败、最近快照在第 90 步，相对从头重跑省多少执行量？这个节省为什么随任务难度放大（Table 3 的比值从 1.29× 涨到 61×）？
4. WeaveBench 模式消融 6.6/11.5/43.9 三个数怎么读？「混合增益来自哪里」的机制证据是什么？
5. 用 Table 6 重构 OSWorld Verified 总分为什么必须剔除 Healthcare？WeaveBench/OSW 2.0 两张域表重构失败说明什么、不说明什么？
6. ALE 并列 25.0 时为什么不能说 CUA-Master 与 Kimi-K3「综合实力相当」？正确的三维表述是什么？

**参考答案。** 单向流水线缺反馈（数据不知道模型弱点，补外环弱点驱动）；闭世界自改缺新知识（任务受限于模型自身，补内环开放世界播种注入外部多样性）。组合数 C(4,2)×C(3,1)=18，含冲突原语的 A 侧二元组 3 种 × B 3 条 = 9 非法，合法 18−9=9——前置条件剪枝大幅缩水组合空间，valid=false 即此类。节省 ≈90 步（前缀由快照恢复只重做约 30 步）；长任务失败越晚整条重跑浪费越大、保前缀价值越高，且长任务本身就是回滚机制（增量快照+最早偏离步定位）的目标场景，所以难度越高比值越大。两单模式显著非零但 43.9 远超两者之和 18.1，增益来自任务内按需切换（CLI 批量算分+GUI 视觉检查），机制证据是 Fig.5 三条轨迹的 Switch 次数（5/8/35）随任务结构走。五域加权和 28954.6/361=80.2 精确命中而含 Healthcare 的任何算法都对不上，说明总分分母未含该 4 任务（论文未披露）；两张表重构失败说明域表与总分口径不一（域标签可能非互斥或子集不同），不说明总分错误——评测协议另有部分得分制，但域表只能读相对强弱不能反推总分。并列的是全通过率单一口径，同分按平均分排 K3 领先 24 分（127.4 vs 103.2）、参数差百倍（2.8T vs 27B）、效率反超（52m vs 79/81m）；正确表述：全通过率持平、平均完成度落后、同分下效率显著更优。对应 HTML 第 01–16 章。

## Axion 1.0 · [HTML](../docs/axion-deep-read.html)

1. RL 奖励手算：4 步链 b=[1,0,1,1]、未提交终答，P 与 R 各多少？b=[1,1,1,1] 但终答错呢？两个结果合起来说明奖励结构鼓励什么？
2. Stage I 的四难化算子为什么对着基座的「成功解法」打而不是对着题目本身打？与 Evol-Instruct 的本质区别是什么？
3. filter-select-compute-verbalize 里「答案在题面之前先算好」倒置解决了什么问题？防泄漏三闸各堵哪条作弊路径？
4. HLE 上 52.2 与 59.1 两个数能读成「训练提升了 6.9 分」吗？正确的读法是什么？
5. Table 2 的 35B BMB 走出 23.5→17.6→35.3 的 V 形。这能证明「两段式是必要的」吗？缺什么对照？
6. SEAL-0 上 35B（62.2）高于 122B（58.6）且为全表最高，能否推出「信息检索任务小模型更优」？

**参考答案。** 轨迹一：P=1/4（j=1 计 1，其余因 b2=0 全零），A=0 → R=max(0, 0.075−0.1)=0；轨迹二：P=1，F=0,A=1 → R=0.3。合起来：全进度但终答错（0.3）优于低进度不收尾（0）——奖励强烈鼓励「做完并提交」，收尾压力大于进度展示压力。因为难化的目标是封掉基座当前的解题策略（组合封一步出答案、范围平移封枚举、参数化封背值、分情况封单一公式），对着失败题加难只是更难、对着成功策略加难才是定向训练信号；Evol-Instruct 盲改题面，Axion 拿着基座的解法瞄准。答案先行让参考验证在构造期一次付清（程序精确比对），训练期检查廉价且无 LLM 判官偏差；三闸：构造库封锁堵「直接查答案表」、闭书剔除堵「背过这题」、题面消毒（不点名数据库+查约束泄漏）堵「从题面猜检索路径」。不能：52.2 是限制访问口径、59.1 是无限制口径，6.9 分衡量外部信息访问的价值而非训练增益；引用任何 HLE 数字必须带口径，否则与 Claude Opus 5 的 63.6 比较方向都会翻转。能证明顺序上 Stage I 干扰（−5.9）、Stage II 修复（+17.7）；不能证明必要——需要混训/逆序等反事实对照，Table 2 自注「not component-removal ablations」。不能：单基准孤立反常+best-of-3 方差+两尺寸基座代次不同（Qwen3.6 vs Qwen3.5）三个混淆；可说的只是大模型没在信息检索上兑现规模优势。对应 HTML 第 01–16 章。

## Rethinking Agentic RL · [HTML](../docs/rethinking-agentic-rl-deep-read.html)

1. 手算：n=20 条采样、c=5 成功，Pass@10 无偏估计是多少？与朴素估计 1−0.75^10 哪个大、为什么？
2. GiGPO 折扣回报手算：三步轨迹 r=(0,1,1)、γ=0.95，R_{i,1} 与 R_{i,3} 各多少？折扣如何服务步级信用分配？
3. 8B DeepCoder 25% 预算下 GRPO-RL 31.5 比基座 42.8 低 11.3 分。能据此说「RL 把模型训坏了吗」？正确的条件化表述是什么？
4. 匹配态上 RL 只在 46.8% 的状态更好、ΔQ=−0.005。有人说「RL 没用」，反驳的最短证据链是什么？
5. BudgetMix 为什么「紧预算增益大、满预算不亏」是设计使然？它与课程学习的机制区别在哪？
6. 论文所有 Pass@T 都是 k=8。部署场景若是单次执行无重试（k=1），Table 1 结论能直接搬吗？

**参考答案。** Pass@10 = 1−C(15,10)/C(20,10) = 1−3003/184756 ≈ 0.984，朴素估计 ≈ 0.944——无偏公式算的是「从 20 条里随机抽 10 条至少含 1 条成功」的超几何概率，成功数分散时抽全失败的组合概率极低；报告 Pass@K 曲线必须说明 n 与 k 的关系。R_{i,1}=0.95+0.9025=1.8525、R_{i,3}=1；早期步折扣累入后续奖励、末步只看自己——同终局不同时序在步级被区分，早犯错压低当时步的折扣回报，这是从终局奖励蒸馏步级信号的机制。不能：同一模型 100% 预算是 66.5 对 56.8（+9.7），只有紧预算（T=2）倒挂；正确表述是「RL 重塑行为分布——宽预算受益、紧预算受损」，BudgetMix 两头都拿到（45.5/66.8）。三步证据链：错误态反转（67.3%、ΔQ=+0.112）→ 错误态续跑终局 +15.6 个百分点 → 成功轨迹 LLR 228 对 26；RL 把改进投在恢复与组合而非首步精度，与扩边界、预算依赖两个宏观现象自洽。训练分布九成样本在紧预算、教会「重试有限时前段保守」，满预算能力由 100% 档维持；机制区别：课程是时间维调度、BudgetMix 是把预算条件化进策略输入——学到带预算接口的策略族而非单一策略。不能：Pass@8 的优势随 K 增大而扩大意味着 K=1 处真实差距比表格更小、反转可能更重；方向结论可参考、幅度须按部署 K 重测——这是引用一切 Pass@K 型表格的通用折扣。对应 HTML 第 01–16 章。

## Claude｜Building agents：何时把子代理折进主循环 · [HTML](../docs/claude-fold-subagents-deep-read.html)

1. 交接保真度手算：f=0.85、6 次交接后端到端保真度多少？业务要求 ≥70% 时最多容忍几次交接？
2. 延迟账本手算：T_turn=3s、单循环 12 回合；多 agent 版编排器 3 回合+4 子代理各 5 回合+6 次交接各 2s——几倍？降级为工具调用后几倍？为什么说降级只是中间站？
3. 渐进披露手算：60 个 skill 全量 3K、描述 90 token、单任务用 4 个——省多少？skill 涨到 200 个时常驻描述层多大、这为什么是 skill-doctor 的治理动机？
4. 三保留条件的 Bloat 判据说「可测的性能退化」。有人主张「上下文 150K 太大必须拆」，哪里不成立？
5. task-flip 手算：100 题 76→79 分，翻转 6 败→胜、9 胜→败。净分对得上吗？怎么处置？
6. 这篇文章的哪些结论会随模型进步过期、哪些不会？给跟进 Claude 文章的读者一条筛选原则。

**参考答案。** F(6)=0.85^6≈0.377；n*=⌊ln0.7/ln0.85⌋=2 次——超过 2 次交接的电话链都在保真度预算外，这是合并高频专家对的量化动机。L_single=36s；L_multi=(3+20)×3+12=81s≈2.25 倍（与客户实测约 2 倍同量级）；降级版≈52s≈1.44 倍——嵌套回合消失但主循环回合膨胀还在，且三个失败模式（独立提示词/有损摘要/嵌套）只消了一个，所以终点是一比一折叠成 skills/工具。C_load=60×90+4×3000=17.4K vs 180K 省 90.3%；N=200 时常驻描述层 18K 已超 N=60 的全部加载——O(N×desc) 项随库增长，skill-doctor 按成本×使用清理就是在压这项。不成立：判据绑定评测分数（Δ_perf）而非上下文长度；150K 不掉分恰是「模型管得比预期多」的证据，拆了反而引入交接税——上下文长度是监控指标，评测分数才是决策变量。对不上：净翻转 (6−9)/100=−3 与总分 +3 矛盾，说明口径有变需核查；按翻转口径 9 回归>6 改善是净回归，应回滚或修复关键链路后再上。会过期：三条件具体边界（模型越强越右移）、80% 等绑定当前提示词存量的数字、单循环纪律成本；不会过期：交接有损（任意 f<1 成立）、接口平方律、评测先行与 flip 方法论、中央审核组织学。筛选原则：绑定「当前模型能力」的数字带时间戳读，绑定「结构性质」的当长期资产积累。对应 HTML 第 01–16 章。

## Drex · [HTML](../docs/drex-deep-read.html)

1. 置信度手算：四选项分布 (0.55, 0.20, 0.15, 0.10) 的 c_choice？noul p(yes)=0.93 的置信度？为什么同一 max 概率下 K 越大置信越高？
2. Cramér 手算：五等级目标 y=5，近错 (0,0,0,0.2,0.8) 与远错 (0.8,0,0,0.2,0) 的 D_C² 各多少？比值说明什么？
3. 温度方向：模型均值置信 95%、准确率 88%——T* 大于还是小于 1？调温后 argmax 会变吗？
4. 「Max 183ms 对 GPT-6 Sol 2.0s 快 11 倍」这个对比有哪些前提该被指出？
5. 翻转率 4.3% 与低置信的关系：按置信 0.5 阈值弃答后还会看到多少翻转？证据链是什么？
6. Max 全分只比公榜低 0.9 而 v2.0 低 8.5——说明什么、不能说明什么？

**参考答案。** 四选：c=(0.55−0.25)/0.75=0.40；noul：c=(0.93−0.5)/0.5=0.86。归一化扣掉随机猜对先验，K 大时先验低所以同一 max 概率置信更高。近错累计 (0,0,0,0.2,1) 偏差平方和 0.04，D_C²=0.04/4=0.01；远错累计 (0.8,0.8,0.8,1,1) 偏差平方和 4×0.64，D_C²=0.64——64 倍，Cramér 把「错误距离」写进损失几何，交叉熵做不到。过信 95>88 → T*>1 平滑降信；argmax 不变（同除正数保序）——温度只修 ECE 不动精度。三前提：任务构成不同（决策请求 vs 开放生成，Sol 的推理花在 Max 不花的闭卷知识上）；183ms 是中位且含网络时间、131k 最坏 2.7s；精度上 Decision Bench 统计等价但 HLE/GPQA 差距大——公平表述是「定义良好选项集上以 1/55 成本换统计等价精度」。翻转集中于低置信与多选项（近平局 (0.51,0.49) 的 c=0.02），按 0.5 阈值滤除后翻转率远低于 4.3%；直接证据：不稳定弃答与等量低置信弃答的剩余精度几乎相同（87.2 vs 87.1），两者筛的是同一批。说明 Max 新域私测泛化一致（新域 56.45 vs v2.0 39.22），「买能力非买榜单」的信号强；不能说明具体私测内容不可见，且 v2.0 与 Max 差四个变量（规模/注意/头/数据），无法归因单一原因——架构归因是论文明列的未做实验。对应 HTML 第 01–16 章。

## AgentBaton · [HTML](../docs/agentbaton-deep-read.html)

1. 成本手算：GLM-only $3.16/任务，30% 进度交接给本地 Qwen，均匀成本假设下省多少？实际省 82.4% 说明成本沿轨迹怎么分布？
2. Qwen→GPT（DeepSWE 30% in-context）73.5%/$6.20 vs GPT-only 68.1%/$5.32——有人说「轻→强也有效」，哪里错了？
3. 三就绪信号判断：实现完整且测试全过，但剩余工作是从头实现第二个独立模块（占一半工作量）——该交接吗？
4. query 路由器训练 99.55% 准确率却只把 1/所有任务分给 Qwen——为什么高准确率≠有用的路由器？
5. MTRouter 逐轮路由理论上每轮最优，为什么被一次性交接击败（省 46.7-86.6% 且精度不输）？
6. Opus→Luna +8.8pp——「便宜模型收尾比强模型好」这个推断哪里站不住？

**参考答案。** 均匀假设：省 30%×$3.16 中的后段 ≈$2.21（70%）；实际 82.4% 说明成本前轻后重（前段实际只花 17.7%）——进度百分比≠成本百分比，贵的大轮在后段（调试/长输出）。精度确实反升但成本 $6.20>$5.32 反贵 16.5%——Qwen 留的烂摊子让 GPT 修了很久；「有效」须精度-成本联合占优，这格精度赢成本输。条件 3 不满足：从头实现第二模块是核心路线实现而非局部修复——不该交；若第二模块只是配置/薄封装则又变局部化可交。路由器学到「预测 Qwen 失败几乎永远对」（基础率高），初始描述缺乏可区分信号时最优策略是永远选保险——训练准确率高≠路由效用。两个税：协调税（每次切换付上下文重传成本）+恢复税（轻模型犯错强模型回来修）——频繁切换制造更多循环，一次性交接只付一次且轻模型在就绪态接棒。三点：单格右尾非普遍（同表 GPT→Luna 只 −1.2%）；同开局换收尾 Opus→Qwen 61.9% vs Opus→Luna 76.1%（+14.2pp 才支持收尾者质量重要）；「更好」须带成本口径。对应 HTML 第 01–16 章。

## 四个 Gemini Agent 通关 Minecraft · [HTML](../docs/gemini-mc-deep-read.html)

1. 吞吐手算：占空比 40%→60%、均值 56.2s 不变——全队每小时多少程序？提速多少？什么代价无法从本数据外推？
2. 三角定位手算：射线 1 P=(17.5,−164.526) u=(0.3237,−0.9461)、射线 2 从 (440,−1350) 方向 (−0.05,−0.9987)——求交点；43m 误差的两个来源？
3. despawn 时钟：auratian 01:49:40Z 溺亡、bulicame 捡完需 2 分钟——最晚何时告警？实际链路几秒？
4. $520 里 91% 输入走缓存——「没有缓存成本翻倍」对不对？量级推演。
5. 「agent 读龙的 phase 编号」——证明通用智能还是作弊？两个说法各错在哪？
6. 与 Voyager（技能库+课程）对照：本文零游戏工具设定的代价与收益各是什么？

**答案。」占空比 D=T_run/T_cycle，D=0.60 → T_cycle=56.2/0.6=93.7s → 全队 153.7 程序/时、提速 50%；代价：22% 报错率可能因压缩思考时间而升（验证占 40% 的一部分），不能外推。Cramer：17.5+0.3237t1=440−0.05t2、−164.526−0.9461t1=−1350−0.9987t2 → 交点 (432,−1376) 邻域 ✓；43m/1300≈3.3% 来源：50ms 离散采样方向估计误差 + 眼睛飞行非严格直线（弧线）。死线 01:54:40Z−2min=01:52:40Z 最晚告警（溺亡后 3 分钟内）；实际告警到回收 34 秒、余量 2.5 分钟。不对：输入 91% 走缓存价（假设 1/4 全价）→ 无缓存 ≈(1.35)/(0.1215+1.2285×0.25)≈3.15 倍而非 2 倍——缓存是长会话经济的必要条件。通用智能错：metadata 是接口透传，人类速通社区从帧画面同样逆向了行为循环——感知通道差异非智力维度；作弊错：服务器禁作弊命令、metadata 是标准 API 规则内信息——正确定性是「代码感知接口下的首次通关」。代价：27 小时、605 死、22% 报错（无课程引导的大量试错）；收益：证据纯度——每个行为可归因于 agent 自身，涌现行为（分工/救援/纠错）在预设框架里不会出现。研究选极简接口，生产选工具增强。对应 HTML 第 01–16 章。

For each paper, the reader should also identify one conclusion that the reported evidence **does not** isolate. Accept a paper-specific boundary explained with the relevant result, not generic skepticism.
