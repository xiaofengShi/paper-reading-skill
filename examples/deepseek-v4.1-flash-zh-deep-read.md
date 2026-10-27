<!-- paper-reading-lang: zh-CN -->
<!-- paper-reading-theme: saffron -->
# DeepSeek-V4.1-Flash：跟一段提示走过三类缓存成本

> **阅读定位**：这份图谱阅读 DeepSeek-AI 的 *DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression*，沿着一次智能体回合，从长前缀走到短续写，再判断哪些测量支持这套设计。文中基准成绩均为作者报告，本次没有复现实验。<span class="source-ref">主源：[官方 51 页 PDF，固定上传提交 53e70b17d9acb8e0c423f0e4fe5702f25562b63d](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/53e70b17d9acb8e0c423f0e4fe5702f25562b63d/DeepSeek_V41_Tech_Report.pdf)，访问日期 2026-10-27；PDF 创建日期 2026-09-10；SHA-256 ba68e2e40408125ae6d2f63a9a241b61c73910691c74ec1a2a7023c851eac08d。本篇与英文样例使用完全相同的文件。覆盖 §§1–6、图表图注、评测附录 B 与数学附录 C；附录 A 是作者名单。[arXiv 条目](https://arxiv.org/abs/2609.19969)用于识别论文，本篇不以其 PDF 替换上述固定主源。</span>

```paper-map
{
  "thesis":"长上下文智能体需要分别降低长前缀计算、活跃全局 KV 存储和旧会话恢复的成本；三者不能混成一个压缩率。",
  "reader":"面向知道 token 与 Transformer 注意力、尚未实现稀疏注意力或 KV 服务的读者。正文会补齐缓存术语，并用小算例解释 effort 控制的微积分。",
  "goals":["追踪一回合中哪些状态被计算、共享或重建。","手算一个 CED 投影、稀疏候选选择和有界重放窗口。","为基准成绩补齐脚手架与评测条件，区分局部长度模型和实测精度。"],
  "outcome":"CED、CSA2、FP4 主 KV 与有界重放组成模型和部署的联合设计；完整训练后模型的能力另用具名协议评测。",
  "outcomeSource":"PDF 摘要，§§1–3, 5–6",
  "items":[
    {"number":"01","label":"反复到来的长前缀","signal":"计算","text":"工具调用带回大段上下文。CED 减少需要遍历整段前缀的模型深度。","source":"PDF §§1, 2.2"},
    {"number":"02","label":"正在使用的上下文","signal":"HBM","text":"CSA2 跨层共享全局 KV，FP4 缩小主 KV 条目；报告的全局 KV 为 890 字节/token。","source":"PDF §§2.3–2.4.4, 6"},
    {"number":"03","label":"返回旧会话","signal":"持久缓存","text":"近似重建短命的 SWA 状态，让持久层保留全局 KV 而不再长期存 SWA KV。","source":"PDF §§3.2.1–3.2.2"},
    {"number":"04","label":"生成有用续写","signal":"能力与预算","text":"训练得到 checkpoint；脚手架、推理力度和任务协议决定怎样测量它。","source":"PDF §§4–5, 附录 B–C"}
  ]
}
```

**第一遍路线：** 先沿 §01–04 讲清部署路径，再读 §05–06 分开训练与评测。§07 重建重要附录论证，同时保留反例；§08 用问题检验能否实际应用。完整比较表放在可选展开区，主要比较和限制留在正文。

## 01 / 先把每个字节放对位置

注意力里的 **query**（查询）决定当前 token 想读什么，**key**（键）帮助匹配历史位置，**value**（值）提供内容。**KV cache** 保存历史键值，避免每生成一个 token 都重新计算全部历史。**Prefill** 处理已给定的前缀，**decode** 逐个生成新 token。智能体的 **harness**（脚手架）在模型外提供提示、工具、上下文管理和轮次控制。工具调用后，可能只有很短的新后缀，却带着很长的历史前缀，因此这些成本必须分开。（PDF §§1–2, 5.3.4）

报告将全局稀疏注意力与 **SWA**（滑动窗口注意力）组合：全局 KV 随序列变长，局部 SWA 在窗口固定时有界，却仍需跨层、跨会话占据存储。**HBM** 是活跃序列使用的加速器内存；SSD 或主机内存上的**持久前缀缓存**则让后来的请求恢复旧会话。活跃缓存变小与持久缓存变小有关联，但分母不同。（PDF §§1, 3.2.1）

| 成本 | 对应机制 | 报告量与适用边界 |
|---|---|---|
| 计算长前缀 | 因果编码器—解码器 CED，加解码器 SWA 重放 | 前缀远大于 SWA 窗口时，接近全栈 prefill 工作量的一半；不是所有负载的延迟测量 |
| 保存活跃全局上下文 | CSA2 跨层复用，加 FP4 主 KV 存储 | **890 字节/token**，同等序列长度下约为 **V4-Flash 全局 KV 的 1/4**；局部 SWA 与模型权重另算 |
| 请求之间保存前缀 | 持久层移出 SWA KV，未命中时重建 | 按报告负载和账本，约为 **V4-Flash 持久 KV 的 1/8**；同时包含移除 SWA 与全局 KV 压缩 |

模型有 552B 骨干参数，另有 196B Engram 参数；prefill 每 token 激活 8B 骨干参数，decode 激活 16B。参数量描述容量或计算，字节/token 描述服务状态，不能互相除乘成一个压缩分数。一百万 token 乘 890 字节/token，得到十进制 **890 MB 全局 KV**，还未包括局部状态等内存；这是教学换算，并非实测设备总占用。（PDF §§2.1, 2.4.2, 4.2.1, 6）

**读 Fig. 1(b) 时看存储轴：** 纵轴是对数刻度的全局 KV 字节/token，比较历代模型；Fig. 1(a) 则比较任务成绩。两者并排展示设计目标，不代表缓存组件对精度的独立因果实验。（PDF Fig. 1）

![原论文 Fig. 1：左侧比较智能体基准成绩，右侧以对数刻度比较历代 DeepSeek 模型的全局 KV 字节/token。](assets/ds41-fig1-agentic-kv-per-token.png)

*原论文 Fig. 1，PDF p. 1。890 字节/token 指全局 KV；任务成绩需带上 §06 的独立评测条件。*

## 02 / 跟前缀走过 CED

语言骨干有 **40 层：20 层因果编码器，接 20 层解码器**。这里“因果”表示某位置的编码状态只依赖可见过去，不读未来。CED 改变的是解码器**全局 KV 的来源**：不必让每个提示 token 走完解码器才得到这些缓存，而是从编码器末层投影。解码器各层仍保留自己的 query 和所需的局部 SWA 状态。（PDF §§2.1–2.2, 4.2.1）

**Fig. 3 先顺着文本或图像 embedding 走过编码器，再追踪投影到解码器全局 KV 的箭头。** 解码器的 Full/Reindex/Reuse 标签描述全局分支；保留下来的局部 SWA 路径解释了为什么 prefill 捷径后仍有短段解码器重放。这张图回答“哪些计算没有被省掉”。（PDF Fig. 3）

![原论文 Fig. 3：多模态输入、20 层因果编码器、投影得到的解码器全局 KV，以及标有 CSA2 模式的 20 层解码器。](assets/ds41-fig3-architecture-ced.png)

*原论文 Fig. 3，PDF p. 7。编码器前两层是纯 SWA；剩余编码器层与解码器使用下文所述的 CSA2 分组。*

```paper-path
{
  "title":"一回合：从前缀到续写",
  "stages":[
    {"title":"编码给定上下文","role":"长前缀 prefill","action":"嵌入文本和视觉输入，让前缀经过因果编码器。","why":"长前缀需要深层表示，但每次工具调用后重复全栈计算很贵。","output":"编码器末层隐状态与编码器全局 KV。","source":"PDF §§2.1–2.2, Fig. 3"},
    {"title":"准备解码器全局 KV","role":"CED 投影","action":"解码器 Full 层从编码器末层投影全局 KV；后续解码器层按照静态 CSA2 模式共享。","why":"让解码器读到提示信息，不再要求每个提示 token 走完整个上半栈。","cost":"局部 SWA 仍需要逐层生成自己的状态。","output":"解码器注意力可读取的全局上下文。","source":"PDF §§2.2–2.3.1, 4.2.1"},
    {"title":"重建近期局部状态","role":"有界重放","action":"只让近期窗口经过解码器；编码器 SWA 未命中时，还利用已缓存的全局 KV 补建近期编码器局部状态。","why":"首批 decode 需要局部状态，但为它们保留整类持久存储很贵。","cost":"重建态是近似的，取决于重放边界。","output":"可支持继续生成的 SWA KV。","source":"PDF §3.2.2"},
    {"title":"生成下一回合","role":"自回归 decode","action":"新 token 读取局部 SWA 与选中的全局条目；decode 仍使用全部 40 层。","why":"捷径针对旧前缀，新 token 仍需要完整计算路径。","output":"智能体回复或工具调用；全局前缀状态可留待后续复用。","source":"PDF §§2.2–2.3, 3.2"}
  ]
}
```

对解码器层 $l>L/2$，原论文 Eq. 1 为：

$$
C_l=H_{L/2}W_l^{KV},\qquad Z_l=H_{L/2}W_l^Z.
$$

$L$ 是总层数，$H_{L/2}$ 是编码器末层隐状态，$C_l$ 是全局 KV 条目，$Z_l$ 是压缩权重；投影矩阵逐层不同。实际结合 CSA2 分组时，只有 Full 层生成新的 main KV，公式不表示每个 Reuse 层都另存一份。SWA 键值仍来自当前层自己的隐状态。（PDF §§2.2–2.3.1, Eq. 1）

**教学手算：** 将一个编码器状态缩成 $h=(1,2)$，令 $W^{KV}=(3,4)^T$、$W^Z=(1,-1)^T$，投影得到 $C=11$、$Z=-1$。改变解码器投影即可改变旧 token 的全局条目，不必先产生这个 token 的解码器隐状态。这个小例子只演示依赖方向，省略真实维度和压缩器，不是论文测量。

对前缀长度 $N$ 与 SWA 窗口 $n_{\mathrm{win}}$，论文的工作量估计是：

$$
O(NL)\quad\longrightarrow\quad O(NL/2+n_{\mathrm{win}}L/2).
$$

用模型的 $L=40$、$n_{\mathrm{win}}=128$ 做教学代理量：$N=4096$ 时，原来是 $163840$，新路径是 $84480$ 个 token-层单位，剩下约 51.6%。但 $N=128$ 时两者都是 5120：接近减半依赖 **$N\gg n_{\mathrm{win}}$**。代理量未计入投影、kernel 与搬运成本，不能当作延迟测试。（PDF §§2.2, 4.2.1）

## 03 / CSA2 到底共享什么

全局注意力既需要已存的 **main KV**，也需要决定**读哪些条目**。**Indexer**（索引器）是做选择的轻量评分路径，它的 query/key 与主注意力的 query/KV 角色不同。**Top-K** 是对当前查询打分最高的 K 个条目。CSA2 将“少存一份 KV”与“重新选择读什么”解耦；模式静态分配给层，不由当前输入动态切换。（PDF §2.3）

| 模式 | main KV 与 indexer K | Top-K 条目 | 本层仍需完成 |
|---|---|---|---|
| Full | 生成 main KV，投影出 indexer K | 重新选择 | main Q、indexer Q 与打分、局部 SWA KV、注意力 |
| Reindex | 共享已有 main KV 与 indexer K | 用自己的 indexer Q 重选 | main Q、重新打分、局部 SWA KV、注意力 |
| Reuse | 共享 | 复用该 main KV 的最近一次选择 | main Q、局部 SWA KV、注意力；不再生成 indexer Q 或打分 |

**Fig. 4 横着逐列看：** 绿色是本层计算，黄色是复用最近 Full 层的全局 KV，红色是复用 Top-K 索引。三列都能找到 main Q 和 SWA KV。这解释了为什么共享选择节省索引计算，而共享 KV 节省缓存存储。（PDF Fig. 4）

![原论文 Fig. 4：Full、Reindex、Reuse 的差别在全局 KV 与选择的来源；每层仍保留自己的 query 与 SWA。](assets/ds41-fig4-csa2-modes.png)

*原论文 Fig. 4，PDF p. 10。Reindex 不另存 main KV，也能改变选中的历史条目。*

解码器还使用**层次稀疏索引器**：首个 Full 层给全因果可见范围打分，选自己的 Top-512，同时按每块的最大分数组成更大的候选池。后续 Reindex 只搜索该池，Reuse 继续沿用最近 Top-512。实际候选池至多 $2048\times8=16384$ 个位置。固定池大小约束了深层索引工作量，但首次全历史扫描仍然存在。此限制在后训练中引入，训练与推理采用相同搜索域。（PDF §2.3.2, Fig. 5）

**教学选择：** 四个两位置块的分数是 $(1,9),(8,7),(6,5),(4,3)$，块最大值依次为 $9,8,6,4$。保留两块，就得到前两块中的四个候选位置。后续 Reindex 用自己的 query 重评这四个位置，可选出不同于 Full 层的 Top-2；但第三块一旦排除，其中再相关的位置也无法补回。这说明选择错误的边界，不是论文中的实测失败率。

**Fig. 5 要分开蓝色候选块与绿色最终选择。** 同一个蓝色池可供不同 Reindex 层产出不同绿色 Top-512；候选池本身不是最终注意力集合。（PDF Fig. 5）

![原论文 Fig. 5：解码器 Full 层选候选块，后续 Reindex 层在池内各选自己的 Top-512。](assets/ds41-fig5-hierarchical-sparse-indexer.png)

*原论文 Fig. 5，PDF p. 11。首个 Full 层仍搜索全部因果可见位置。*

<details class="reading-detail">
<summary>实际层分组、压缩器与 FP4 存储细节</summary>

编码器前两层为纯 SWA，剩余 18 层用压缩率 $m=2$，分三组六层，每组 Full 后接五层 Reuse。20 层解码器用 $m=1$，分五组四层：首组以 Full 开始，后四组以 Reindex 开始，每组其余三层为 Reuse。注意力选 512 个全局条目，SWA 窗口为 128。（PDF §4.2.1）

CSA2 去掉前代压缩器相邻条目的重叠输入和绝对位置编码，并从 main KV 投影 indexer K，不再走独立的隐状态压缩路径。主 KV 使用 FP4 E2M1、每 16 通道一个 E4M3 scale，在 RoPE 后量化并在后训练做 QAT；SWA KV 保持 FP8。该格式针对存储，注意力前会反量化，不表示所有权重或计算都用 FP4。（PDF §§2.3, 2.4.4）

</details>

## 04 / 不全存局部状态，缺了怎样恢复

前代在特定提示/输出边界保存 SWA KV，在其部署负载下约占持久缓存一半。V4.1 将编码器 SWA KV 放入短命分布式池，使用 10% 主机 DRAM、分钟级 TTL；全局 KV 仍持久保存至少 72 小时。全局命中而编码器 SWA 缺失时触发重放。解码器 SWA 从不放入前缀缓存，每次 prefill 都要重建。这是相关但触发条件不同的两条路径。（PDF §§3.2.1–3.2.2）

跨 $L$ 层精确恢复局部状态，理论依赖约 $L n_{\mathrm{win}}$ 个 token；**有界重放**只处理最近 $n_{\mathrm{win}}$ 个。重放从 $s$ 开始，查询在 $i$、窗口宽 $W$ 时，可见局部键为：

$$
[\max(s,i-W+1),\ i].
$$

**教学追踪：** 取 $W=4$，重放位置 7–10，故 $s=7$。在 $i=7$，普通 SWA 本可读 4–7，但重放只读到 7；在 $i=9$，只读 7–9 而非 6–9；到 $i=10$，名义窗口已是 7–10。即便最后窗口完整，高层状态仍可能因早先输入被截断而不同，不能据此宣称恢复精确。（PDF §3.2.2）

编码器重放只补建已缓存前缀的 SWA，复用且不覆盖全局 KV；新后缀则生成两类状态。解码器把近期编码器输出传过解码器层，为 decode 准备局部 KV。作者报告观察到的质量影响很小，并在后训练中模拟重放，但状态**不与完整前向数学等价**。长上下文稀疏检索与缓存恢复边界的极端条件，仍是报告明确承认尚未刻画完整的稳健性边界。（PDF §§3.2.2, 6）

持久层有单独账本：去掉 SWA 近乎减半，留下的全局 KV 再压至前代约 1/4，总体约 1/8。不能把**运行时 1/4**与**持久层 1/8**再乘成“模型压缩 32 倍”：它们衡量不同存储层。（PDF §§3.2.1, 6）

## 05 / 把训练与部署分开

报告使用 45T 多模态 token，稀疏注意力从 64K 序列长度开始直接训练，在 34T token 时扩展到 1M 上下文。完整链为**预训练 → SFT → RL → on-policy 蒸馏**。智能体任务由问题、可执行环境、验证器组成；异步 rollout 与超过 40 个领域教师支持后训练。作者称后训练采用标准配方，改进集中于数据与环境构建；这是开发归因陈述，不是对各数据因素的受控增益估计。（PDF §§4.2.2, 5.1–5.2）

Single-Pass mHC 减少残差路径内存流量，Engram 提供条件记忆，DSpark 加速投机解码，视觉与部署基建也同步改变。它们解释实际训练和部署了什么。由于架构、容量、数据与后训练一起改变，最终成绩不是单独针对 CED、CSA2、FP4 或重放的消融。（PDF §§2.4, 3–5）

Table 1 的 Base 比较采用作者内部框架和相同声明设置，但仍比较不同完整模型。例如 V4.1-Flash-Base 对 V4-Pro-Base：HumanEval Pass@1 为 79.4 对 76.8，但 SimpleQA-verified EM 为 **42.3 对 55.2**，LongBench-V2 EM 为 **45.2 对 51.5**。这些反例让“若干维度接近”不至于变成“所有任务相等”，也不能隔离缓存压缩对能力的影响。（PDF §4.3, Table 1）

## 06 / 为每个成绩带上实验条件

三类比较回答不同问题：**Table 3** 比较完整后训练系统，**Table 4** 固定 V4.1 checkpoint 与任务集、改变脚手架，**Fig. 9** 在指定脚手架中改变 effort。结论应始终带着真正变化的变量。（PDF §5.3）

```paper-experiments
{
  "title": "四类比较分别支持什么结论",
  "rows": [
    {
      "question": "完整系统与前代相比怎样？",
      "setup": "Table 3，V4-Flash → V4.1-Flash，具名编码智能体任务",
      "observation": "TB 2.1 Pass@1 82.7→90.6%（+7.9 个百分点）；DeepSWE v1.1 resolved 54.4→74.2%（+19.8）；NL2Repo score 54.2→65.4（+11.2 分）",
      "conclusion": "完整系统在这些行改善；模型、数据与脚手架同时变化，不能归于单组件",
      "source": "PDF Table 3"
    },
    {
      "question": "最难任务是否追平前沿系统？",
      "setup": "Table 3，高难任务与对手",
      "observation": "V4.1 HLE 全量 36.8% / 纯文本 39.1%，Opus-5 全量 56.3%；TB 4.0 31.2% 对 51.8%",
      "conclusion": "编码任务的进步不代表所有困难推理/专家任务追平前沿；HLE 全量和纯文本口径必须分开",
      "source": "PDF Table 3"
    },
    {
      "question": "同一个脚手架是否在两项编码任务上都领先？",
      "setup": "Table 4，同一 V4.1，力度 100",
      "observation": "DeepSWE：mini-SWE 74.2%、DSH Minimal 72.6%、OpenCode 65.5%；TB 2.1：DSH Minimal 90.6%、mini-SWE 90.3%、Codex 84.1%",
      "conclusion": "最优脚手架随任务改变；DSH Minimal 并非 DeepSWE 最高",
      "source": "PDF Table 4, §5.3.4"
    },
    {
      "question": "指定设置增加推理力度时发生什么？",
      "setup": "Fig. 9，力度 25→100",
      "observation": "八项推理平均 67.1→76.3%；DeepSWE 66.0→74.2%；TB 2.1 82.4→90.6%；输出 token 约 2.5 倍",
      "conclusion": "这些设置中的质量—token 交换，不是通用延迟或精度单调性保证",
      "source": "PDF Fig. 9, §5.3.2"
    }
  ]
}
```

Table 4 中，DeepSWE 每题 **8 次采样**，TB 2.1 每题 **3 次**；统一使用 Linux 容器、temperature 1.0、top-p 0.95、1M 上下文、max_steps=500。Table 3 的 V4.1 编码任务使用 DSH Minimal，唯 DeepSWE 使用 mini-SWE；视觉智能体用 Claude Code、512K 上下文；AutomationBench 与 ALE 使用官方脚手架。采样次数不把报告的 Pass@1/resolved 变成 Pass@8 或 Pass@3：重复尝试用于估计单次表现。（PDF §§5.3.1, 5.3.4, Table 4）

**原始 Table 3 要逐行保留指标与脚注。** Codeforces 是 rating，NL2Repo 是 score，ZeroBench-main 报 Pass@5；其余多数行是 Pass@1 或 resolved 百分比。HLE 的 † 标出纯文本子集。视觉任务或 score 不能换名成缓存百分比。（PDF Table 3）

![原论文 Table 3：完整系统在推理、编码智能体、安全、通用与视觉任务上的比较；各行指标不同，并有 HLE 纯文本脚注。](assets/ds41-table3-main-results-comparison.png)

*原论文 Table 3，PDF p. 33。百分比与 score 含义不同；空缺不是零分。*

<details class="reading-detail">
<summary>Table 4 全部八种脚手架设置与附录版本检查</summary>

| 脚手架 | DeepSWE v1.1 resolved（%） | TB 2.1 Pass@1（%） |
|---|---:|---:|
| Claude Code v2.1.251 | 69.8 | 88.0 |
| Codex v0.147.0 | 65.6 | 84.1 |
| OpenCode v1.18.15 | 65.5 | 85.0 |
| Pi v0.84.2 | 66.2 | 86.1 |
| mini-SWE，commit 04d809ceab9d | 74.2 | 90.3 |
| DSH Minimal | 72.6 | 90.6 |
| DSH Standard | 70.5 | 85.8 |
| DSH PTC | 67.6 | 85.8 |

附录 B.1 将一次脚手架试验落到操作：**输入**是基准任务与固定 checkpoint，**操作**是在 Linux 任务容器里执行脚手架原生提示、工具、上下文与轮次循环，**输出**是提交的任务解法，**测量**是每题 8 或 3 次重复尝试的 resolved/Pass@1。mini-SWE 只有 bash 工具；DSH Standard 初始有 26 个工具，PTC 通过 TypeScript 访问 24 个底层工具。工具接口属于改变的实验条件，不能视为可任意互换的包装。（PDF Table 4, 附录 B.1）

附录 Table 5 另比较 Claude Code v2.1.105、v2.1.238、v2.1.251、v2.1.259。DeepSWE 为 68.4、68.7、69.8、68.6%；TB 2.1 为 87.3、88.4、88.0、87.6%。报告均值 68.9/87.8 来自未舍入值。这是版本检查，与跨脚手架家族的比较分开。（PDF 附录 B.1, Table 5）

</details>

报告限制网络、剥离 Git 历史并清理临时构建缓存，但仍观察到寻找环境漏洞的行为。这些措施降低特定泄露路径，不证明所有评测利用或数据污染均已消失。（PDF §5.3.1）

## 07 / 手算 effort 控制的附录论证

力度 $b\in\{1,\ldots,100\}$ 写入系统提示。RL 在共享**题目与力度**的子组 $(x,b)$ 内做奖励均值中心化，不直接将不同力度的回答排在一起比较。长度惩罚改变各子组内的激励：

$$
r^{\mathrm{len}}_{b,j}=-\min\left(C_{\max},k(b)\frac{\ell_{b,j}}{L_{\mathrm{norm}}}\right),\qquad
k(b)=k_0\exp\left(-\frac{b-b_{\min}}{\tau}\right).
$$

$\ell$ 是推理 token 数，$L_{\mathrm{norm}}$ 是参考长度，$C_{\max}$ 是扣分上限，$k_0$ 是起始惩罚系数，力度增加 $\tau$ 会让系数乘上 $e^{-1}$。更高力度减弱对额外推理的惩罚，并不是硬 token 限额。报告的 API low/high/max 分别映射到 50/75/100。（PDF §5.1.4, Eqs. 8–10；§5.3.3）

**先搭微积分桥梁：** 教学参数取 $L_{\mathrm{norm}}=1000$、$k_0=0.2$、$\tau=25$、$b_{\min}=25$，生成 $\ell=1000$ 个 token。若未触发封顶，力度 25 扣 0.2，力度 50 只扣 $0.2/e\approx0.0736$。允许花更多 token，是因为每个额外 token 的奖励成本更低。这些参数用于演算，不是公布的训练超参数。

附录 C 问的是：指数系数为何可能产生平滑长度控制？设 $p_x(\ell)$ 为题目 $x$ 花 $\ell$ 个推理 token 后解出的概率。未封顶区间中，内部偏好长度最大化“解出概率减 token 成本”：

$$
\ell_x^*(b)\in\arg\max_{\ell\ge0}\left[p_x(\ell)-k(b)\ell/L_{\mathrm{norm}}\right],\qquad
p'_x(\ell_x^*)=k(b)/L_{\mathrm{norm}}.
$$

导数是**边际收益**，表示再加一个 token 能提高多少解出概率；最优点令边际收益与边际成本相等。再假设 $p'_x(\ell)\approx a_x e^{-\ell/s_x}$，对等式取对数，得到：

$$
\ell_x^*(b)\approx C_x-s_x\log k_0+\frac{s_x}{\tau}(b-b_{\min}),\qquad
C_x=s_x\log(a_xL_{\mathrm{norm}}).
$$

这叫**仿射**预测，即常数加“斜率 × 力度”。若教学参数 $s_x=200$ token、$\tau=25$ 力度单位，力度增 25，就预测偏好长度增 200 token，前提是两端最优点均在内部且未封顶。（PDF 附录 C, Eqs. 13–17）

这个附录扩展的操作链是：**输入** $(b,x)$ 与局部边际收益模型 → **操作**将边际收益与指数 token 成本配平 → **输出**预测的偏好长度 → **测量**与实际 token 长度和精度曲线对照。推导本身不产生实测精度增益。封顶后边际 token 成本变零，内部解推导便不适用；策略变化、随机生成、多回合轨迹、奖励归一化也是作者注明的限制。（PDF 附录 C）

**Fig. 9 要将实线和虚线一起读：** 实线对应左轴精度，虚线对应右轴 token；三面板是不同任务。下方重绘保留各自起终点，原图保留中间工作点，不能只看最高分。（PDF Fig. 9）

```paper-chart
{"type":"paired","title":"指定设置中，力度 25 → 100","subtitle":"精度单位 %；输出 token 约增至 2.5 倍","origin":"本文重绘 · 原论文 Fig. 9 起终点","source":"PDF §5.3.2, Fig. 9","note":"推理为八个基准均值；DeepSWE 用 mini-SWE，TB 2.1 用 DSH Minimal。三行不是同一个任务。","rows":[{"label":"八项推理平均","before":67.1,"after":76.3},{"label":"DeepSWE v1.1","before":66.0,"after":74.2},{"label":"Terminal-Bench 2.1","before":82.4,"after":90.6}]}
```

![原论文 Fig. 9：力度与精度、平均输出 token 的关系，三面板分别为推理均值、DeepSWE 和 Terminal-Bench 2.1。](assets/ds41-fig9-effort-vs-performance.png)

*原论文 Fig. 9，PDF p. 35。两条纵轴分开读；token 增多不意味着精度同比增加。*

**反例留在主线：** 附录 B.2 明确说 Fig. 11 的六个“脚手架 × 任务”面板中，输出长度都随力度单调增长，但精度在中间力度出现**平台和回落**。Fig. 9 的指定曲线与 Fig. 12 的推理面板较平滑，不能推广为所有脚手架精度单调。附录的局部长度论证与实测分数响应，是不同主张。（PDF 附录 B.2–B.3, Figs. 11–12）

<details class="reading-detail">
<summary>单独看多智能体扩展与测量口径</summary>

§5.3.5 是初步的测试时计算扩展。**输入**为参考解在隐藏测试上至少通过 95% 的 172 道 ProgramBench 题，或 FrontierSWE v2 的 no-GPU 子集。**操作**是 DSH Agent Team：lead 向持久队友委派任务，共享 checkout、信箱和任务板；训练组合任务奖励、协作奖励与 DAG 关键路径延迟惩罚。**输出**为墙钟截止时可用的解法。**测量**上，ProgramBench Almost@1 统计单条 rollout 得分至少 0.95 的比例，FrontierSWE 用 Mean@5，不能合并。（PDF §5.3.5, Fig. 10）

ProgramBench 每题最多三次，每配置计划 516 次 rollout，截止时间 1–12 小时；8 小时的多智能体峰值为 30.04%，单智能体为 20.39%。FrontierSWE 截止时间为 1–20 小时，20 小时 Mean@5 为 32.90% 对 28.20%。报告比较观察到的最强多智能体配置与可用最强单智能体基线，没有给出匹配 token 预算、只改变委派的因果增益；516 也不是文中声明的 FrontierSWE rollout 分母。（PDF §5.3.5）

</details>

## 08 / 重建并检验结论

工程主张现在是一条连续路径：便宜地产生旧前缀全局状态，跨层共享，降低主 KV 存储精度，必要时补建短命局部状态。缓存账本与数学依赖都清楚；任务结果支持**完整训练系统**在具名设置中的可用性，而选择错误、近似重放、高难前沿任务差距与脚手架敏感性应和结论一起带走。（PDF §§2–6, 附录 B–C）

```paper-check
{
  "title":"检验能否实际使用这份解释",
  "items":[
    {"question":"一层处于 Reindex 模式，当前查询可以改变什么，哪些缓存仍共享？它与 Reuse 有何区别？","answer":"Reindex 用自己的 indexer query 重新选择 Top-K，同时共享 main KV 和 indexer K，仍计算 main Q 与局部 SWA KV。Reuse 连最近的 Top-K 选择也共享，不再进行新的索引。","source":"PDF §2.3.1, Fig. 4"},
    {"question":"迁移题：用 CED 工作量代理，取 L=40、N=256、窗口=128，剩下多少比例？可以承诺延迟减半吗？","hint":"分别计算 NL 与 NL/2 + 窗口×L/2。","answer":"代理量是 10240 与 7680 个 token-层单位，剩下 75%。N 只有窗口两倍，接近减半的渐近条件并不强；代理还省略投影、搬运和 kernel 成本，不能承诺延迟比例。","source":"PDF §2.2；按原工作量式构造的教学计算"},
    {"question":"重放从 10 开始，W=4。在 i=11 能读哪些局部位置？后续窗口恢复完整，能否保证所有高层状态精确？","answer":"只能读 10–11，而普通 SWA 可读 8–11。不能保证精确：前面被截断的状态仍会向高层传播，即使之后名义窗口完整，重建仍是近似的。","source":"PDF §3.2.2；教学重放边界"},
    {"question":"能否结合 Table 4 最高分与附录 C，声称 DSH Minimal 两任务都最优，而且力度越大精度总越高？","answer":"不能。DeepSWE 最高是 mini-SWE 74.2%，DSH Minimal 为 72.6%；TB 2.1 才是 DSH Minimal 90.6% 最高。附录 C 只在内部、未封顶等条件下预测局部偏好长度，附录 B.2 明确记录跨脚手架精度的平台和回落；长度单调不等于精度单调。","source":"PDF Table 4, 附录 B.2 与 C"}
  ]
}
```

<!-- 交互决策：静态成本表、原图、模式对照与手算追踪已能暴露依赖；若让读者按输入切换模式，反而会虚构论文机制，因为模式静态分配。原生 details 承载完整脚手架表与次要多智能体协议。本路径无需另加交互工作流。本次校验属于来源/结构检查，不是学习实验、独立人类审核或实验复现。 -->
