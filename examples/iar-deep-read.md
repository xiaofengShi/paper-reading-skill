<!-- paper-reading-lang: zh-CN -->
<!-- paper-reading-theme: plum -->
<!-- paper-reading-mode: brief -->
# IAR：把文档“注入”参数，再把通用能力“找回来”

> **阅读定位**：RAG 是文档问答的标准工程答案，但许多部署里检索不可用、不想要（延迟/隐私），或者被故意拿掉，以检验后训练是否改变了模型的参数化知识。这篇论文研究**文档知识内化**（document knowledge internalization）：把一个有界语料库变成可用的参数知识，推理时只看问题、不看原文。作者提出三阶段框架 IAR（Inject → Align → Recover），并用一组刻意分开的对照实验回答：密集文档暴露、QA 对齐、能力恢复各自贡献了什么。原文为 Qian Kou、Xiaofeng Shi（共同一作/共同通讯）、Xiaosong Qiu、Hua Zhou 的 *Inject, Align, Recover: Staged Post-Training for Retrieval-Free Document Knowledge Internalization*（BAAI）。<span class="source-ref">本图谱依据 <a href="https://arxiv.org/abs/2608.20281v1">arXiv:2608.20281v1</a>（2026-08-20）<a href="https://arxiv.org/pdf/2608.20281v1">PDF</a>，SHA-256 <code>a04a9e560b15cbc22942af63e4519fc7640812178e0e4de8f2deaeaac8da3060</code>，共 21 页：正文 §§1–7 + 补充材料 A–G；Figs. 1–4；Tables 1–28。</span>

**首次阅读路线：** 先用第 01 节的三道坎区分“知识接触”“答题接口”“通用保留”；第 02 节把同一段文档送进三种训练任务，再手算损失与恢复选点；第 03 节跟一条答案走完评审；第 04 节用 BudgetMatch、CCI Phi 与扩展基线检查主张；第 05 节的 BPB 小例子解释高起点边界，最后用理解题迁移到新输入。长表与配置可在需要复核时展开。

## 01 / 全局：无检索问答的三道坎

**一句话主线：** 把语料内化进参数，难点不在“学没学”，而在三件事会互相打架——QA 监督覆盖太稀、文档级训练接不上 QA 接口、领域适应会碰坏通用能力；IAR 把三件事拆成三个阶段分别干预，再用分开的对照评估每一步的贡献。（PDF §§1, 3）

问题的设置比 RAG 苛刻：训练用文档派生的 QA 对，测试时模型**只收到问题**，没有任何检索段落。三条最直接的路线各有一个缺口（PDF §1）：**Vanilla SFT** 让模型学会测试时的输入输出格式，但学习信号稀疏——只有被 QA 生成器选中的事实进入损失；**续训（CPT）** 提供密集的文档暴露，却不教模型怎么回答问题；而两条路线都面临**灾难性遗忘**——领域变强、指令遵循和通用基准变弱。

IAR 把这三个缺口变成三个可检验假设，并各配一个阶段（PDF §3“Why Three Stages?”）：**Inject** 检验“更密的文档级监督是否有用”（不是原始续训，而是指令化的文档重构任务）；**Align** 检验“注入的知识能否通过 QA 接口取出来”（answer-only 监督）；**Recover** 检验“适应后的模型能否向原始指令模型回移、找回通用能力”（事后权重合并 + 验证集选点）。论文特意强调：这是**实验分解**而非单一秘方——某一阶段的负结果不波及其他阶段，强 SFT 基线只是“同一种适应预算的另一种花法”。（PDF §3）

```paper-map
{
  "thesis":"无检索文档内化的难点是三个互相耦合的缺口：QA 覆盖稀疏、文档暴露接不上 QA 接口、领域适应碰坏通用能力。IAR 把三者拆成 Inject/Align/Recover 分别干预。",
  "reader":"了解 SFT 与训练/测试划分、第一次接触文档知识内化的读者；本文从目标掩码、权重插值与一个字节归一化算例补足所需数学。",
  "goals":["把一段文档改写成三类 Inject 输入/目标，并指出哪些 token 不计损失","按领域优先规则从一组新候选中选出 Recover 检查点","区分 token 预算对照、恢复前增益与 BPB 诊断各能支持什么结论"],
  "outcome":"在 8 个数据集-模型设置中的 7 个，IAR 在全部四项指标上同时优于 Vanilla SFT：领域 QA 平均 +3.6 点，通用三项（IFEval/MMLU/MSBench）均值平均 +12.1 点。",
  "outcomeSource":"PDF 摘要, §5, Table 1",
  "items":[
    {"number":"01","label":"问题","signal":"检索被拿掉","text":"推理时只有问题、没有原文。SFT 信号稀疏，CPT 不接 QA 接口，两者都会遗忘通用能力。","source":"PDF §1"},
    {"number":"02","label":"机制","signal":"三阶段分解","text":"Inject：续写/改写/指令化重构三类文档生成目标；Align：answer-only QA 监督；Recover：与基模型做事后合并并按领域优先前沿规则选点。","source":"PDF §§3.1–3.3, Fig. 1"},
    {"number":"03","label":"证据","signal":"分离的对照","text":"RQ1 主表（4 模型 × 2 语料）、RQ2 token 预算对照（BudgetMatch）、RQ3 恢复前的 IA 增益、RQ4 Qwen3-8B/14B/32B 缩放，外加 SDFT/LoRA/Replay/FAPM 扩展基线。","source":"PDF §§4–5, Tables 1–3, 21–27"}
  ]
}
```

**核心结果速览（Table 1 主比较）：** CC 语料上，IAR 对四个模型家族在领域准确率和三项通用指标上全胜 Vanilla SFT；CCI 上，Llama、Qwen3-4B、SmolLM3 同样全胜，Phi 是边界情形（IFEval、MSBench 更好，领域与 MMLU 略降）——合计 8 个设置中 7 个全指标胜出。最亮的单点：Qwen3-4B CC 领域准确率 50.5% 对 Vanilla 的 42.4%，同时三项通用指标全部更高。（PDF §5.1, Table 1）

**原论文 Fig. 1 把 IAR 与两条对照路线画在同一版面上，建议对比着读：** 上两条横带是 Vanilla SFT（QA 对 → answer-only 损失 → 事实覆盖稀疏，红色警示）和 CPT+SFT（原文 token 流 → next-token 损失 → 再单独 QA 对齐）；下面的大框是 IAR 三阶段——Inject 的三种文档生成目标（continue 给前缀续写后缀、rewrite 从骨架/大纲重构全文、reconstruct 凭阅读指令重构全文），Align 的 answer-only QA 损失，以及 Recover 的“与基模型合并 → 在领域-通用平面上选前沿点”。右侧三个图标是最终交付物：内化的文档知识、无检索 QA、找回的通用能力。（PDF p. 2, Fig. 1）

![原论文 Fig. 1：IAR 与 Vanilla SFT、CPT+SFT 的对比总览。下框内依次为 Inject（三类文档生成目标）、Align（answer-only QA 损失）、Recover（与基模型合并并选择前沿检查点）。](assets/iar-fig1-overview.png)

*原论文 Fig. 1。<span class="source-ref">PDF p. 2.</span> 注意作者的自述：IAR 不声称发明了新的重构损失，它的增量是“受控的实验分解”。*

## 02 / 三阶段机制：每一步到底做什么

```paper-path
{
  "title":"从原始文档到可部署的无检索 QA 模型",
  "intro":"三个阶段解决三个不同问题；Recover 的选点规则决定最终交付的是哪个检查点，而不是领域分最高的那个。",
  "stages":[
    {"title":"Inject：指令化文档注入","role":"把语料变成密集的监督目标","action":"把清洗后的文档转成三类助手目标损失任务：Continuation（给指令化前缀、预测后缀）、Rewrite（给生成的摘要/大纲/知识骨架、重构完整文档）、指令化重构（给通用阅读指令、重构完整文档）；按整数配比混合（如 1:0:0、1:1:1、1:1:2），提示词 token 全部掩码。","why":"QA 对只覆盖文档事实的一个子集；指令化重构既提供密集暴露，又保留指令-目标边界，不同于没有 QA 接口的原始 token 流 CPT。","output":"注入了文档知识的检查点 θI。","source":"PDF §3.1, Eq. 1, Table 7；附录 B"},
    {"title":"Align：answer-only QA 对齐","role":"把知识接到问答接口上","action":"在文档派生 QA 对上做 answer-only SFT（Eq. 3），从注入检查点 θI 出发得到 θIA；对照组 Vanilla SFT 从原始指令模型 θ0 出发（Eq. 4）。","why":"文档级训练不等于会答题；这一阶段检验注入的知识能否在 QA 接口下被“取出来”。","output":"恢复前的领域适应检查点 θIA（Best IA）。","source":"PDF §3.2, Eqs. 3–4"},
    {"title":"Recover：事后合并恢复","role":"找回被适应碰坏的通用能力","action":"计算任务向量 Δ = θIA − θ0，用 SLERP/Task Arithmetic/TIES/DARE 四族共 12 个固定候选做合并（Eq. 5）；在验证集上按“领域优先前沿”规则选点（τ = 1 个百分点）：先保证领域分不低于 Vanilla −τ，再要求通用均值不低于 Vanilla 且三项中至少两项不逊于 Vanilla −τ，最后在非支配候选里按领域分层、层内取通用均值最大者。","why":"合并把适应“调回”基模型方向，部分恢复遗忘的通用能力；选点规则在测试前固定，使报告的操作点可审计而非事后搜索。","output":"最终 IAR 检查点（Table 16 记录每个设置选中的算子与系数）。","source":"PDF §§3.3, 4.1, E；Tables 15–16"}
  ]
}
```

### 先跟一段文档走过 Inject 和 Align

**教学输入（本文自造，不是实验语料）：** “记录仪 A 每 2 秒采样一次，缓冲区保存 12 条记录。”假设 QA 生成器只问“记录仪 A 的采样间隔是多少？”，Vanilla SFT 的目标答案就是“2 秒”；缓冲区容量这个事实没有进入这条 QA 的目标。Inject 改变的首先是**被监督的文档内容**，再由 Align 改变**调用这些内容的接口**。（对应 PDF §§3.1–3.2、附录 B, Table 7）

| 训练任务 | 输入给模型的用户内容 | 助手目标，也就是计损失的部分 |
|---|---|---|
| Continuation | 续写指令 + “记录仪 A 每 2 秒采样一次，” | “缓冲区保存 12 条记录。” |
| Rewrite | 重构指令 + 骨架“记录仪 A；间隔 2 秒；容量 12 条” | 完整的两事实文档 |
| 指令化重构 | 通用阅读指令，不附原文或骨架 | 完整的两事实文档 |
| Align | “记录仪 A 的采样间隔是多少？” | “2 秒” |

四行都用 chat template，系统和用户 token 都被掩码。Continuation 的前缀虽然提供信息，却不在该行目标里；Rewrite 的骨架也不计损失。指令化重构不能只靠通用提示推导出事实，训练正是在用全文目标更新参数；这与测试时偷偷塞入原文是两件不同的事。测试仍然只有问题。上述表是对论文任务定义的教学实例，不声称每条事实都被成功记住。（PDF §3.1, Eq. 1；附录 B）

**从两个 token 的计算到一般损失。** 为只看清计算，假设目标恰有两个抽象 token，模型给正确 token 的条件概率依次为 $1/2$、$1/4$；目标平均负对数似然是 $[-\ln(1/2)-\ln(1/4)]/2=1.040$ nats。概率越小，代价越大；只除以目标长度，用户提示不参与平均。这就是下式 $\ell_\theta(u,y)$ 在做的事。若过滤后的训练集实际有 6 行重构、3 行续写、3 行改写，其经验份额就是 $1/2,1/4,1/4$；份额由保留下来的行数决定。这个计数例子不规定论文混合标签的排列含义，论文明确的特殊标签是 **1:0:0 = 带阅读提示的纯重构**。

### Inject 与 CPT 的分界线：损失写在哪个接口上

Inject 的损失（Eq. 1）把每种目标 $m$ 的样本视为“指令 $u$ + 文档目标 $y$”的监督对，按**经验采样份额** $\pi_m$ 混合（$\pi_m$ 是实际行数占比，不是自由损失系数），且只对助手目标 $y$ 计损：

$$
\mathcal{L}_{\mathrm{inj}}=\sum_{m\in\mathcal{M}}\pi_m\,\mathbb{E}_{(u,y)\sim\mathcal{D}_m}\big[\ell_\theta(u,y)\big],\qquad \ell_\theta(u,y)=-\frac{1}{|y|}\sum_{t=1}^{|y|}\log p_\theta(y_t\mid u, y_{<t})
$$

而原始续训（Eq. 2）直接对文档流做 next-token 预测，$\mathcal{L}_{\mathrm{CPT}}=-\frac{1}{T}\sum_t\log p_\theta(x_t\mid x_{<t})$，**没有指令-目标边界，也没有 QA 接口**。论文特别说明：配比标签 1:0:0 指“带阅读提示的纯重构 Inject”，不要与原始 CPT 基线混淆。（PDF §3.1, Eqs. 1–2；附录 B, Table 7）

```paper-contrast
{
  "title":"同样是密集文档暴露：原始续训（CPT）与指令化注入（Inject）",
  "intro":"两者都给模型比 QA 更密的文档接触；区别在于监督写在原始 token 流上，还是写在指令-目标边界上。",
  "branches":[
    {"name":"CPT + SFT","lead":"先对原文 token 流做 next-token 预训练，再单独做 QA SFT。","scope":"常规 dense-document 基线；主表从对应 Base 检查点出发。","judge":"文档建模与问答接口分离，知识可能“在参数里却答不出来”。","signal":"主表中 CPT+SFT 通用指标大幅塌陷（如 Llama CC：IFEval 26.4、MMLU 3.7），域内提升有限。","why":"原始流没有指令-目标边界，也无 QA 行为约束；且 Base 初始化与 IAR 的 Instruct 初始化不同，不能单独归因于目标形式（Table 23 的 Instruct-CPT 诊断另行列出）。","source":"PDF §§3.1, 4.2, Table 1；附录 G"},
    {"name":"Inject（IAR 阶段一）","lead":"续写、改写、指令化重构三类助手目标损失任务。","scope":"从指令模型出发，提示词掩码，只对文档目标计损。","judge":"密集暴露与指令接口同时保留：模型在“按指令产出文档内容”中接触全部事实。","signal":"RQ3：恢复前 Best IA 在 8/8 设置上领域准确率超过 Vanilla SFT（+0.4 至 +7.7 点）。","why":"作者机制主张：结构化文档暴露在合并恢复之前就贡献了可测量的领域信号；但最优配比随模型与语料而变，论文不支持“万能配比”。","source":"PDF §5.3, Fig. 3, Tables 26–27"}
  ]
}
```

Align 则把 $u,y$ 换成问题 $q$ 与答案 $a$，从注入检查点出发，优化

$$
\mathcal L_{\mathrm{align}}=-\frac{1}{|a|}\sum_{t=1}^{|a|}\log p_\theta(a_t\mid q,a_{<t}).
$$

所以 Inject 和 Align 不靠不同类型的神奇损失区分，而是靠训练输入、目标覆盖及初始化区分。Vanilla 用同一个 answer-only 损失从原始指令模型出发；IA 从注入模型出发。（PDF §3.2, Eqs. 3–4）

### Recover 的选点规则：交付的不是“领域最高”

先看最简单的 Task Arithmetic 教学例：若两个参数 $\theta_0=(1,2)$、$\theta_{\mathrm{IA}}=(3,0)$，则任务向量 $\Delta=(2,-2)$，取 $\lambda=0.5$ 得 $\theta_R=(2,1)$。改变的是权重，不是把两个模型的回答投票；这个算式也不能预测验证分数。论文 Eq. 5 用 $\theta_R=\theta_0+\lambda\Delta$ 说明这一最简单视角，**SLERP、TIES、DARE 不都等价于给同一个完整向量乘单一系数**。实际 Recover 从固定的 12 候选网格（SLERP $t\in\{0.2,0.3,0.4\}$、Task Arithmetic $w\in\{0.3,0.5,0.7\}$、TIES $d\in\{0.3,0.5,0.7\}$、DARE $dr\in\{0.1,0.3,0.5\}$）中选一个。选择发生在**验证集**上、测试集评估之前，规则为（τ = 1 个百分点）：① 领域可行——$D(c)\geq D(v)-\tau$（$v$ 为 Vanilla SFT）；② 通用护栏——$G(c)\geq G(v)$ 且 IFEval/MMLU/MSBench 中至少两项不低于 Vanilla $-\tau$；③ 领域优先分层——非支配候选中，与最优领域分相差 $\tau$ 以内者属同一层；④ 层内取 $G(c)$ 最大者，再按最小通用改进、同族较小系数打破平局。（PDF §4.1；附录 E）

**完整选点教学例（本文自造，非论文实验）：** 设验证集上的 Vanilla 为领域 $D=49$，三项通用指标均为 40，故 $G=40$；$\tau=1$。四个新候选如下，所有分数单位都是百分点尺度上的 %。

| 候选 | 领域 D | IFEval / MMLU / MSBench | 通用均值 G | 选择过程 |
|---|---:|---|---:|---|
| A | 50.5 | 48 / 48 / 48 | 48 | 可行，非支配，属于最高领域层 |
| B | 50.3 | 49 / 49 / 49 | 49 | 可行，非支配，同层且 G 更高，选中 |
| C | 48.0 | 55 / 55 / 55 | 55 | 刚好过领域门槛 48，非支配，但距最高 D 超过 1 |
| D | 47.9 | 60 / 60 / 60 | 60 | 未过领域门槛，即使 G 最高也先剔除 |

A、B、C 的通用均值与分项护栏都通过；它们互不支配，因为领域更高者通用更低。最高领域是 50.5，同层门槛为 49.5，所以只在 A、B 间比较 G，最终选 B。只提供 $(D,G)$ 而不提供三项指标，通常**不足以**检查分项护栏；这也是论文逐项报告通用指标的原因。（PDF 附录 E）

论文实际选中：CC 上 Llama/Qwen/SmolLM 选 TIES $d=0.3$、Phi 选 Task Arithmetic $w=0.7$；CCI 上 Llama/Phi 选 TIES，Qwen/SmolLM 选 Task Arithmetic。它们的测试分在选择之后才报告。（PDF Table 16）

**原论文 Fig. 4 把这套选择画成了 8 张前沿散点图**（每个数据集-模型设置一幅）：横轴领域 QA、纵轴通用均值，四种颜色/形状对应四族算子，黑线是非支配前沿，黑圈是验证协议选中的候选。三个值得注意的模式：SLERP（蓝）与 Task Arithmetic（橙）沿前沿分布；DARE（紫菱）成片沉在通用低端；被选中的黑圈帮助定位最终报告点，但其测试坐标无需刚好满足验证集上的 τ=1 分层关系，不能反过来用图上的测试坐标重做选择。图中展示的是测试集表现，但仅作诊断，选择早在验证集上完成。（PDF p. 16, Fig. 4；附录 E）

![原论文 Fig. 4：八个设置的 Recover 候选前沿。黑线为 (D, G) 非支配前沿，黑圈为验证协议选中的操作点；DARE 候选普遍沉在通用低端。](assets/iar-fig4-frontiers.png)

*原论文 Fig. 4。<span class="source-ref">PDF p. 16.</span> 注意 CC 四个面板的领域轴在 20–50%、CCI Qwen 面板在 70–75%——高起点设置的“前沿”形态完全不同，对应 04 节的边界讨论。*

## 03 / 数据与评测：分数从哪来、能信到哪

**QA 对是怎么造出来的。** CC（源自 Common Corpus）与 CCI（源自 CCI4.0 系列）使用同一条 anchor-aware 流水线：先从文档块抽取可独立指称的锚点（禁止“该方法”“上述机制”这类回指表达），判断题型适用性，生成自足问题（必须显式命名锚点、脱离原文可懂、禁用“根据原文”），校验后再用同一文档块生成 grounded 答案。测试时模型只收到问题——这是比 RAG 更严格的契约。（PDF §4.2；附录 A–B, Tables 4–5）

<details class="reading-detail">
<summary>展开数据流账目与生成检查</summary>

**数据规模账目（附录 B, Table 6）：** CC 从 4,001 个输入文档出发，文件级过滤掉 48.6%，最终实验用 QA 15,008 条（14,258 训练 + 750 测试）；CCI 从 7,000 个文档出发（仅滤掉 4.4%），最终 11,501 条（10,926 + 575）。作者坦白了两点：两个语料的过滤路径不同，阶段比率只能刻画数据流、不能直接当“数据集质量分”横向比较；这些机器检查（重复、回指、答案-原文重叠）**不能替代人工验证**。（PDF 附录 B, Table 6）


</details>

**评审面板与其可靠性审计（附录 D）：** 领域 QA 用自适应 LLM 评审——两名评委先各自按 $\{0,\,0.5,\,1\}$ 打分（1=核心结论正确，0.5=大体正确但不完整/有瑕疵，0=错误或矛盾），分歧时叫第三名，取中位数；评委组合包括 gpt-oss-120b、MiniMax-M2.5、DeepSeek-V3 系列。作者没有把这当作金标准，而是做了全量审计：343 个结果文件、242,255 条答案记录，前两名评委完全一致率 .707、按 ≥.5 折算的二值一致率 .848、Cohen's $\kappa=.691$、第三名触发率 .297。通用侧：IFEval 与 MMLU 走规则/答案键，MSBench 用固定 200 例子集（来自公开的 iic/ms_bench）加 LLM 评审。每个结果文件配 2,000 次 bootstrap 重采样给出评测采样不确定区间——但论文明言这**不覆盖训练种子鲁棒性**：所有检查点都是单次训练、生成与评审无固定采样种子。（PDF §4.3；附录 C–D, Tables 12–14）

**跟一条答案走完测量（教学票例）：** 模型只见问题，生成答案；评委另外收到“问题、参考答案、模型答案”，不负责给模型补检索。前两名若给 1 与 0，就触发第三名；第三名给 0.5 时，中位数为 0.5。这条记录是“部分正确”，不是 0.5 次模型调用。正文把领域 accuracy 描述为正确或部分正确答案的占比；附录 D 同时审计 domain accuracy 与 mean correctness，二者不能用“平均三名原始分”混称。票例用于说明聚合，不是论文数据。（PDF §4.3；附录 B、D）

**读这份评测的正确姿势（读者视角）：** 领域分和 MSBench 分都是“评审产出的测量值”，不是答案键标签；κ=.691 说明评委间只是实质性一致而非高度一致，小幅分差（如 ±1 点以内）不宜过度解读——τ=1 是论文固定的选择容差；论文没有把 κ 或评审误差换算成这个阈值。（对应 PDF §4.3、附录 D）

## 04 / 实验图谱：四个研究问题各自回答什么

**先保留三个决定解释的对照。** Qwen3-4B CC：Vanilla→IAR 的领域 42.4→50.5，通用三项也升；但 CC Llama 对 BudgetMatch 是领域 40.4→36.5、通用均值约 30.9→41.9，说明 IAR 不总是领域最优。CCI Phi 是另一边界：领域 40.2→39.7、MMLU 53.8→50.2，只有 IFEval 47.8→51.6 和 MSBench 31.5→44.0 改善。CC 扩展基线里 SDFT 的 Llama 领域 39.9 高于 IAR 36.5，LoRA/FAPM 也能赢单项通用指标。主张因此是“强领域优先操作点”，不是全指标支配。（PDF Tables 1–2、21–22）

```paper-experiments
{
  "title":"每个实验能回答的问题",
  "rows":[
    {"question":"RQ1：IAR 是否改善领域-通用操作点？","setup":"Table 1：4 个模型家族 × CC/CCI 两个语料，对照 Base Instruct、Vanilla SFT、Base 初始化的 CPT+SFT；同一评审协议。","observation":"CC 上 IAR 对全部四个家族在四指标上全胜 Vanilla；CCI 上 Llama/Qwen/SmolLM 全胜，Phi 为边界（IFEval 51.6 vs 47.8、MSBench 44.0 vs 31.5 更好，领域 39.7 vs 40.2、MMLU 50.2 vs 53.8 略降）。合计 7/8 设置全指标胜出；平均 +3.6 点领域、+12.1 点通用均值。Qwen3-4B CC 最亮：42.4→50.5 且三项通用全部更高。这是整系统比较，归因要靠 RQ2–RQ4。","source":"PDF §5.1, Table 1"},
    {"question":"RQ2：增益是否只是“多训了 token”？","setup":"Table 2：BudgetMatch 用与 Inject+Align 等 token 量的纯 QA 训练（14/17/21/11 epoch）；对照 Vanilla 与 IAR。","observation":"BudgetMatch 在 CC 上确实变强（领域 +4.9/+4.4），但 CCI Llama 基本不变、CCI Qwen 反降 2.9 点。IAR 相对 BudgetMatch：4 个设置中 3 个领域更高、4 个通用均值全部更高；16 项指标比较赢 14 项（例外：CC Llama 领域、CC Qwen MMLU）。CC Llama 是真正的权衡点：IAR 用 3.9 点领域换 11.0 点通用。结论：token 分配解释 CC 的一部分增益，解释不了分阶段暴露+恢复带来的操作点。","source":"PDF §5.2, Table 2, Fig. 2"},
    {"question":"RQ3：Inject+Align 在恢复之前有没有领域增益？","setup":"Fig. 3 与 Tables 26–27：恢复前 Best IA 与 Vanilla SFT 的领域对比，覆盖 8 个设置与 5 种配比。","observation":"8/8 设置 Best IA 全胜 Vanilla：CC +2.8/+7.7/+5.3/+4.7，CCI +5.6/+6.1/+0.4/+2.3。最优配比不统一：Llama/Phi 偏好 Mixed 1:1:2，Qwen3-4B CC 偏好 1:1:1，CCI 偏好纯重构 1:0:0。论文因此只主张“IA 在恢复前已有领域增益”，不主张万能配方。","source":"PDF §5.3, Fig. 3, Tables 26–27"},
    {"question":"RQ4：恢复模式在更大模型上是否复现？","setup":"Table 3：Qwen3-8B/14B/32B on CC，同选 TIES d=0.3；与 Base/Vanilla/Best IA 对照。","observation":"IAR 领域分保持在 Best IA 的 1.1 点以内（代价 0.7/0.9/1.1），通用均值提升 +14.9/+24.1/+17.8 点，且三项基准各自都涨（如 32B：IFEval +14.0、MMLU +11.5、MSBench +28.0）。Best IA 相对 Vanilla 仍有 +8.8/+5.7/+7.5 领域增益——恢复不是“白捡”，适应与恢复两段的贡献都可见。但恢复是部分的：通用分没有全面回到原始模型水平；且三行同属 CC+同一密度，论文只声称“族内重复模式”，不声称缩放定律。","source":"PDF §5.4, Table 3"},
    {"question":"扩展基线压力测试：IAR 是否被别的方法取代？","setup":"Tables 21–22（CC-only）：SDFT、LoRA、Replay、FAPM 与 IAR 同协议比较。","observation":"SDFT 是强数据配方基线（Llama CC 领域 39.9 > IAR 36.5，IAR 仅在此居第二）；LoRA 与 FAPM 常保住更强的单项通用指标（如 Qwen：Vanilla-FAPM 的 IFEval 83.8、IA-FAPM 的 MSBench 85.0 分别高于 IAR 的 59.8、63.0；这是两个不同 FAPM 起点的指标），但领域内化明显落后。IAR 在 Phi/Qwen/SmolLM 上领域最佳。正确读法：IAR 是强“领域优先”操作点，不是全指标碾压。","source":"PDF §5.1, Tables 21–22；附录 G"},
    {"question":"剪枝式恢复（FAPM）与合并式恢复差在哪？","setup":"Tables 24–25：FAPM 在稀疏度 0.9 下保留任务向量前 10% 条目，分别作用于 Vanilla（Vanilla-FAPM）与 IA（IA-FAPM）检查点。","observation":"FAPM 的通用恢复确实好，但领域列暴露代价：CC Llama 的 Vanilla→Vanilla-FAPM 为 35.5→22.3，CCI Qwen 的 Best IA→IA-FAPM 为 75.5→68.9；其领域行为随恢复操作下降，不能把两个不同起点混为同一前后对照。它回答了“为什么 FAPM 不是 IAR 的即插即用替代”：两者优化的是不同的操作点。","source":"PDF 附录 G, Tables 24–25"}
  ]
}
```

<details class="reading-detail">
<summary>展开八设置主表与两幅数值重绘</summary>

**主表精选（Table 1，单位 %）：** 每格为“领域 / IFEval / MMLU / MSBench”。读法：先看 Vanilla SFT 相对 Base 的遗忘幅度（通用三项齐跌），再看 IAR 拉回来多少、领域付出什么。（PDF §5.1, Table 1）

| 设置 | Vanilla SFT | IAR | 读数 |
|---|---|---|---|
| CC · Llama-3.2-3B | 35.5 / 54.2 / 11.2 / 21.5 | **36.5 / 60.2 / 35.0 / 30.5** | 四指标全胜；MMLU +23.8 |
| CC · Phi-4-mini | 24.4 / 47.8 / 51.0 / 32.5 | **34.1 / 49.0 / 57.0 / 43.0** | 领域 +9.7，最大单点涨幅 |
| CC · Qwen3-4B | 42.4 / 51.1 / 8.8 / 51.0 | **50.5 / 59.8 / 19.5 / 63.0** | 论文点名的最清晰案例 |
| CC · SmolLM3-3B | 32.1 / 35.6 / 10.5 / 25.0 | **37.5 / 40.3 / 25.7 / 29.0** | 四指标全胜 |
| CCI · Llama-3.2-3B | 53.0 / 61.2 / 22.5 / 31.5 | **55.3 / 61.3 / 33.2 / 36.5** | 四指标全胜 |
| CCI · Phi-4-mini | **40.2** / 47.8 / **53.8** / 31.5 | 39.7 / **51.6** / 50.2 / **44.0** | **边界**：通用两项大涨，领域 −0.5、MMLU −3.6 |
| CCI · Qwen3-4B | 75.1 / 45.6 / 26.3 / 49.5 | **76.3 / 76.1 / 64.5 / 70.0** | 高起点（Base 已 70.6）仍全胜，通用均值 +29.7 |
| CCI · SmolLM3-3B | 52.3 / 41.7 / 16.7 / 31.5 | **53.9 / 57.4 / 46.8 / 47.0** | 四指标全胜 |

*依据原论文 Table 1 重排。<span class="source-ref">PDF p. 6.</span> 加粗为该设置占优方；CCI Phi 行刻意保留在主表，说明“恢复”不承诺均匀支配。*

```paper-chart
{"type":"paired","title":"Vanilla SFT → IAR：通用三项的恢复幅度（CCI · Qwen3-4B）","subtitle":"单位：%；该设置通用均值 +29.7 点","origin":"本文重绘 · 原论文 Table 1","note":"同一检查点在同一评测协议下的四指标对照。","source":"PDF p. 6, Table 1","rows":[{"label":"IFEval","before":45.6,"after":76.1},{"label":"MMLU","before":26.3,"after":64.5},{"label":"MSBench","before":49.5,"after":70.0}]}
```

```paper-chart
{"type":"paired","title":"Vanilla SFT → IAR：领域准确率（CC 四家族）","subtitle":"单位：%","origin":"本文重绘 · 原论文 Table 1","note":"领域增益的同时三项通用指标也全部提高（见上表），这是 IAR 操作点的含义。","source":"PDF p. 6, Table 1","rows":[{"label":"Llama-3.2-3B","before":35.5,"after":36.5},{"label":"Phi-4-mini","before":24.4,"after":34.1},{"label":"Qwen3-4B","before":42.4,"after":50.5},{"label":"SmolLM3-3B","before":32.1,"after":37.5}]}
```


</details>

**原论文 Fig. 2 用一张散点图总结 RQ2：** 横轴领域准确率、纵轴通用均值，每个箭头从 BudgetMatch（橙方块）指向 IAR（蓝圆点）。三个箭头向右上走（CCI Qwen 最陡：通用从约 46 拉到约 70），CC Llama 则向左上走——这就是论文说的“3/4 上移右移，CC Llama 用领域换通用”。箭头比表格更直观地说明：IAR 的增益模式随语料而变，不是统一平移。（PDF p. 5, Fig. 2）

![原论文 Fig. 2：BudgetMatch → IAR 的移动。右为领域更高，上为通用更高；IAR 在三个设置上移右移，CC Llama 以 3.9 点领域换 11.0 点通用。](assets/iar-fig2-budgetmatch.png)

*原论文 Fig. 2。<span class="source-ref">PDF p. 5.</span>*

**原论文 Fig. 3 是 RQ3 的证据主体：** 八根柱子是恢复前 Best IA 相对 Vanilla SFT 的领域增益（pp），7 根绿柱、1 根粉紫短柱——唯一的小增益（+0.4）是 CCI Qwen3-4B，即“高起点边界”：原始指令模型在该语料上已有 70.6% 领域分，注入可提升的余量天然有限。附录 F 的 BPB 诊断给出旁证：Qwen3-4B 对 CCI 源文本的条件 bits-per-byte 低于全部三个同侪（配对 95% 区间全为负），与“更强的语料先验”一致——但作者明确限定：这**不能证明**记忆、数据重叠或污染，也不能解释因果。（PDF §5.3, Fig. 3；附录 F, Table 17）

![原论文 Fig. 3：恢复前 Inject+Align 相对 Vanilla SFT 的领域增益（8/8 设置为正）；CCI Qwen3-4B 的 +0.4 pp 是高起点边界情形。](assets/iar-fig3-ia-gains.png)

*原论文 Fig. 3。<span class="source-ref">PDF p. 6.</span>*

<details class="reading-detail">
<summary>展开 Qwen 缩放原表与训练配置来源缺口</summary>

**RQ4 缩放表（Table 3，CC，单位 %）：** 三个尺寸都重复同一签名——领域微降（≤1.1 点）、通用大涨。注意最后一行对照：恢复后的通用分仍低于 Base Instruct，论文据此强调“恢复是部分的”。（PDF §5.4, Table 3）

| 模型 | 方法 | 领域 | IFEval | MMLU | MSBench |
|---|---|---:|---:|---:|---:|
| Qwen3-8B | Base Instruct | 38.5 | 87.6 | 65.3 | 82.5 |
| Qwen3-8B | Vanilla SFT | 48.7 | 56.4 | 14.0 | 52.5 |
| Qwen3-8B | Best IA | 57.5 | 50.6 | 18.5 | 48.5 |
| Qwen3-8B | IAR (TIES d=0.3) | 56.8 | 62.2 | 26.7 | 73.5 |
| Qwen3-14B | Base Instruct | 40.4 | 90.0 | 72.5 | 81.5 |
| Qwen3-14B | Vanilla SFT | 54.8 | 62.9 | 54.5 | 57.0 |
| Qwen3-14B | Best IA | 60.5 | 53.5 | 40.3 | 42.0 |
| Qwen3-14B | IAR (TIES d=0.3) | 59.6 | 67.5 | 67.2 | 73.5 |
| Qwen3-32B | Base Instruct | 47.2 | 87.5 | 74.8 | 84.5 |
| Qwen3-32B | Vanilla SFT | 56.4 | 58.5 | 44.0 | 56.5 |
| Qwen3-32B | Best IA | 63.9 | 53.0 | 63.0 | 44.5 |
| Qwen3-32B | IAR (TIES d=0.3) | 62.8 | 67.0 | 74.5 | 72.5 |

*原论文 Table 3。<span class="source-ref">PDF p. 7.</span> 另注意论文的来源诚实声明：三个缩放行的原始 Inject/Align 训练日志不在档案中，作者拒绝推断其超参，Table 8 的公共配置不覆盖这三行。（PDF 附录 C）*


</details>

## 05 / 附录诊断：高起点到底意味着什么

### BPB 先把不同分词器放到同一个分母上

CCI Qwen3-4B 的原始指令模型已达领域 70.6%，Best IA 只比 Vanilla 高 0.4 点。附录 F 于是另问一个窄问题：**原始检查点是否对这些源文本赋予更高条件概率**。它没有拿模型 QA 正确率反推“见过数据”。（PDF 附录 F, Tables 17–20）

**先算一个共同目标的教学例。** 假设同一段目标是 8 个 UTF-8 字节，模型 A 的各 token 负对数概率总和为 $4\ln2$ nats，模型 B 为 $6\ln2$。除以 $\ln2$ 把 nats 转成 bits，再除以 8 字节，得到 A 为 0.5 BPB、B 为 0.75 BPB，A−B 为 −0.25。两个分词器即便切出不同 token 数，也在给**相同目标字节**计账；直接比较平均 token 困惑度则没有这个共同分母。一般式是

$$
\mathrm{BPB}=\frac{\sum_t-\ln p(x_t\mid x_{<t})}{\ln2\cdot B},
$$

其中 $B$ 是共同目标的 UTF-8 字节数；越低表示该检查点对该条件文本分配的概率越高。例中的 8 字节与概率总和均是教学数值。（PDF 附录 F）

**附录 F 的实际 input → operation → output → measurement：** 575 条 CCI 测试 QA 对应 509 份唯一源文档；去掉两份过短文档，形成 507 段共享的“前缀→目标”续写。操作是在约字节中点、尽量靠近句段边界处切分；四个原始指令检查点都用 teacher forcing 给相同目标计分，不输入问题、答案或 chat template。4096 上下文、2048 stride 的重叠只供上下文，每个目标 token 计一次。输出是每文档 BPB；主测量先在七个领域内取配对 Qwen−同侪差，再等权平均领域，做 10,000 次按领域分层的配对 bootstrap。（PDF 附录 F）

Table 17 的主差值为对 Llama −0.273 [−0.285,−0.261]、Phi −0.220 [−0.231,−0.208]、SmolLM −0.093 [−0.102,−0.084] BPB（95% 区间），七领域方向一致。**可支持**：Qwen 在这批条件源文本上的拟合更强。**不能支持**：为什么更强、是否记忆或污染、BPB 导致 QA 差距；Phi 的 BPB 低于 Llama，CCI QA 却略低，就是“似然不充分解释 QA”的反例。（PDF Table 17 与附录 F 讨论）

### 剪枝恢复为什么要带着领域列看

附录 G 的 FAPM 输入是原始指令权重与适应后权重；操作是在每个张量内按论文所用分数保留前 10% 任务向量条目，其余恢复到原始权重；输出是一个 BF16 检查点，再测同一领域/通用协议。**教学缩影**：一个有 10 项的张量只保留已选中的 1 项 delta，另外 9 项归零；这不是把所有 delta 都缩成 0.1 倍，也不是直接保留最大的 QA 分数。本文不补造论文未在正文给出的条目评分公式。（PDF 附录 G）

测量显示起点必须配对：CC Llama 的 Vanilla 领域 35.5→Vanilla-FAPM 22.3；CCI Qwen 的 Best IA 75.5→IA-FAPM 68.9。通用恢复可以很好，领域保留却更差；因此 FAPM 不能只凭单项通用高分就替代 IAR 的领域优先选点。（PDF Tables 24–25、27）

## 06 / 综合：分解为什么有效，边界在哪里

这篇论文的价值不止是一个更好的分数，而是**把“适应预算”拆成了可审计的三份**。RQ2 显示 token 量本身只解释一部分（CC 的 BudgetMatch 有效、CCI 失效）；RQ3 显示 IA 在恢复之前就有领域增益（8/8 为正；它未单独隔离目标形式、额外 token 与配比选择），但配比要按模型和语料调；RQ4 显示适应与恢复在更大模型上仍然可分——Best IA 先抬高领域，Recover 再用 ≤1.1 点的领域代价换回 14.9–24.1 点的通用均值。三层结论各自有对应的对照组支撑，没有靠单张排名表说话。（PDF §§5.2–5.4）

**正确的整体读法是“前沿”而非“碾压”（论文自己的措辞）：** 在扩展基线下，SDFT 可以在 Llama 上赢得领域分，LoRA 和 FAPM 可以赢得单项通用指标——但它们都不同时占据领域前列；IAR 的定位是“领域优先操作点上最强的通用剖面之一”。部署端到底要领域、要通用、还是都要，仍取决于场景，论文保留边界行（CCI Phi、CC Llama）正是为了说明这一点。（PDF §§5.1, 6）

**证据的仪器边界要一起读：** 领域分与 MSBench 分来自 LLM 评审面板（κ=.691），不是答案键；每设置单次训练、生成与评审无种子，bootstrap 区间只覆盖评测采样不确定性；大分差和小分差仍须结合逐项区间解释，单次训练不能确认训练随机性下的稳健性。高起点 CCI Qwen 的 BPB 诊断只支持“语料先验更强”这一方向性解释，作者明确不主张污染结论——读者也不应替它主张。（PDF §4.3；附录 C–F）

**复现要点清单：** 数据——CC 14,258/750、CCI 10,926/575（anchor-aware 管线，测试仅问题）；训练——Inject 3 epoch（配比按 Table 10：CC Llama/Phi 为 1:1:2、Qwen/SmolLM 为 1:1:1；CCI 除 Qwen 为 1:0:0，其余为 1:1:2；约 19k 行），Align 3 epoch answer-only，共享优化配置 AdamW lr 5×10⁻⁵、cosine warmup 0.05、BF16、有效 batch 64、ZeRO-2、8×A100-40GB（Table 8）；恢复——12 候选固定网格 + τ=1 的领域优先验证集选点（Table 16 记录各设置选中的算子）；评测——自适应三评委 {0, 0.5, 1} 取中位数，IFEval/MMLU 走规则，MSBench 固定 200 例 + 评审；BudgetMatch 对照——epoch 数按 IA token 量匹配（14/17/21/11）。（PDF §§3–4；附录 B–E）


## 07 / 理解检查

先独立作答，再展开答案；这些是学习辅助，没有自动理解分数。

```paper-check
{
  "title": "理解检查：把机制用到新输入",
  "items": [
    {
      "question": "一段新文档含事实 A 与 B，但 QA 训练只问 A。Rewrite 的用户骨架含 A、B，目标为全文。哪些 token 计损失？为什么不能把这一行叫作测试时 RAG？",
      "answer": "只计助手全文目标，系统、重构指令与骨架都掩码；参数在训练时接触两事实。测试契约仍只给问题，若测试再附骨架就改变了 retrieval-free 协议。密集暴露也不保证 B 一定被成功调用。",
      "source": "PDF §§3.1–3.2, Table 7；本文教学文档"
    },
    {
      "question": "新验证集 Vanilla 为 D=60、通用三项均50；候选 X 为 D=61.2、三项均52，Y 为 D=60.5、三项均55，Z 为 D=58.8、三项均70。τ=1，应选谁？",
      "answer": "领域门槛59先排除Z。X/Y都过通用护栏且互不支配；最高领域61.2的同层下限60.2同时容纳X/Y，层内G较大的Y胜出。测试集上更漂亮的点不能重选。",
      "source": "PDF 附录 E；本文选点规则的教学迁移"
    },
    {
      "question": "若一个新报告用两个模型各自的平均 token 困惑度，声称较低者一定污染过 CCI，这个推断有哪两道断点？",
      "answer": "不同分词器的token分母不一致，应在同一源文本目标字节上比较BPB；即便共享字节的BPB更低，也只说明条件拟合更强，完整检查点的容量、语言能力和预训练构成未控制，不能推出污染或QA因果。",
      "source": "PDF 附录 F, Table 17"
    },
    {
      "question": "CC Llama 的 BudgetMatch 领域40.4高于IAR36.5，但IAR通用均值高约11点。这个结果能否推翻IA在恢复前的增益，或证明IAR全指标更好？",
      "answer": "都不能。它说明相近token预算下存在领域/通用权衡；恢复前Best IA对Vanilla为38.3对35.5，是另一个比较。BudgetMatch也不把Inject目标形式与初始化等全部因素单独隔离。",
      "source": "PDF Tables 2、26；§§5.2–5.3"
    }
  ]
}
```

<!-- 交互选择审计：本篇需要同时看见损失掩码、候选过滤与前沿边界。静态输入/目标表、完整选点算例与原 Fig. 4 已显示全部关系；参数滑块会暗示未测量的权重到分数映射，因此不加。可选证据使用原生 details，核心对照与边界保持可见。 -->
