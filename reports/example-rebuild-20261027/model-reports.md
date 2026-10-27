# 三篇模型报告示例重构记录

日期：2026-10-27。范围：DeepSeek-V4.1-Flash 英文/中文两篇与 MiMo-V2.6 中文一篇。基线：`64d9e99259fd39e41d3418c319dcbc1018193310`。三篇 Markdown 已重构并各自临时渲染；尚未完成浏览器交互、窄屏/打印与视觉验收，也未做实验复现或独立人类学习评估。

## 来源与版本

| 示例 | 本次统一主源 | 访问与版本身份 |
|---|---|---|
| DeepSeek 英文 | [官方 PDF 固定上传提交](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/53e70b17d9acb8e0c423f0e4fe5702f25562b63d/DeepSeek_V41_Tech_Report.pdf) | 2026-10-27 获取；51 页；创建 2026-09-10；上传提交 `53e70b17d9acb8e0c423f0e4fe5702f25562b63d` |
| DeepSeek 中文 | 与英文同一下载文件 | 同一版本、同一 SHA-256；不用另一个 arXiv PDF 替换正文主源 |
| MiMo 中文 | [官方 PDF 修订提交](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/resolve/73875d00b30a89ef8cc353a0b60b0e9f9561952d/MiMo_V2_6_technical_report.pdf) | 2026-10-27 获取；44 页；创建 2026-09-22；修订提交 `73875d00b30a89ef8cc353a0b60b0e9f9561952d` |

下载文件 SHA-256：

- DeepSeek：`ba68e2e40408125ae6d2f63a9a241b61c73910691c74ec1a2a7023c851eac08d`。
- MiMo 修订版：`fb81e6e083801b3358f084ed6be953dc23b0d2e434690f4541d5eae03e01e7af`。
- MiMo 原快照：`7fe42601dc952cd2b74996e5a24f8e85eab6fcbf471f73ba95aafd559d4ef39b`，本次从[官方首次上传提交](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/resolve/7b08b5a503deef319e6b371fd5b701526cd05a03/MiMo_V2_6_technical_report.pdf)重新取得。

抓取时仓库 main HEAD 分别为 DeepSeek `314113f8a7dadb388215396ba5fbee2c610a04d6`、MiMo `b61f21852680ee02a29e946e18cf8697f4844061`；正文引用更窄的 PDF 上传/修订提交。DeepSeek 的 [arXiv 条目](https://arxiv.org/abs/2609.19969)仅用于论文身份定位，本次不声称其 PDF 与所用文件字节相同。

## DeepSeek 双语重构

覆盖并重读了部署问题、CED/CSA2/层次索引/FP4、缓存政策与两条 bounded-replay 路径、训练设置、Base/后训练结果、scaffold/effort/多智能体协议，以及附录 B–C 的评测条件与局部数学推导。附录 A 为作者列表，不伪造技术扩展。关键核验位置是 §2.2 Eq. 1、§2.3 Figs. 4–5、§3.2、§4.2.1–4.2.2、Tables 1/3/4/5、Figs. 9/11/12 与 Appendix C Eqs. 13–17。

两种语言沿相同八章主线重建，保留各自语言与主题：

- 首屏声明读者与三项可操作目标，给出第一遍路线；用 query/KV、prefill/decode、HBM/持久缓存、harness/indexer 等术语桥梁降低入口负担。
- 围绕一次回合连接长前缀编码、全局 KV 投影/共享、局部重建、续写。新增可手算的二维投影、token-层工作量、候选块选择、重放窗口与 effort 惩罚/边际收益算例，均标为教学例子。
- 在正文区分 890 B/token 的全局 KV、运行时 1/4 与持久层 1/8 的分母；不将两存储层比率再乘为模型压缩率，不将工作量代理当延迟测量。
- 明确实际 CSA2 模式静态分配，只有 Full 生成新 main KV，Reindex 可重选而不再存 KV；首次全历史扫描与被候选池排除的状态不可恢复的边界可见。
- 原有重要原图均保留；英文补入 Fig. 1/5、Table 3、Fig. 9，与中文图谱对齐。每幅图前有可见读图提示，重绘有来源标签。
- 三处原生 details 分别承载实际层分组/量化细节、完整八行 Table 4 与 Appendix B.1、次要多智能体协议；关键比较、反例、样本数与限制留在可见主线。
- Appendix C 以输入→边际收益/成本配平→偏好长度→与实测曲线比较解释，不把推导当精度数据；保留内部解、未封顶、指数衰减假设。
- 每篇四道理解题包含机制重建、改变 N 的 CED 迁移计算、改变 replay 起点、区分长度模型与实测精度。

纠正的实质问题：

1. 旧中文将 DSH Minimal 说成 DeepSWE 与 TB 2.1 双榜最高。Table 4 的坐标/列头核验结果是 **mini-SWE DeepSWE 74.2、DSH Minimal 72.6**，TB 2.1 则分别为 **90.3、90.6**；两篇现在一致。
2. 旧中文把 effort 精度单调外推至全部脚手架。Appendix B.2 明说跨脚手架精度有平台/回落；两篇均在主线保留此反例，并区分 Fig. 9/12 的指定曲线。
3. 多智能体 ProgramBench 的 516 计划 rollout 不再外推为 FrontierSWE 分母；Almost@1 与 Mean@5、不同截止时间、最强配置的初步比较不合并。
4. Base/最终模型比较不再被称为缓存组件“不伤能力”的单因素证明；保留 SimpleQA、LongBench-V2、HLE、TB 4.0 的对应反例，作者的数据管线归因也未改写成受控因果证据。

## MiMo 重构与资产版本核验

正文统一升级到官方修订 PDF。重读了 §§1–8 中模型/训练身份、Eq. 1、GRS/GAR、行为正则 Eqs. 4–5、环境与 harness 构造、reward-hacking 控制、MOPD2、轨迹/调度/一致性系统、最终主表与开放 9B 实验；相关图注与表格保留值按新源核验。附录 A 仅贡献/致谢，不人为添数学；§7 是本篇的开放资源技术扩展。

逐页文本比较显示旧/新 44 页的唯一文本差异在 p6 Table 1：Pro active 参数由误排 `42T` 改为 `42B`，总参数 `1.02T` 未变。当前正文采用 Pro 1.02T/42B 与 Flash 310B/15B。

七幅既有 WebP 裁图未改动。对其标注的原图所在页，使用 PyMuPDF 1.28.2 默认 72dpi、RGB、无 alpha 渲染，旧/新 source 的整页 `samples` 与页面文本逐一完全相同。这是来源版本的计算同一性检查，不是视觉质量结论；正文开头与 Markdown 注释明确保留旧快照裁图来源。

| 保留资产 | 图与 PDF 页 | 旧=新页面 RGB samples SHA-256 |
|---|---|---|
| `fig3-scaling.webp` | Fig. 3 / p8 | `338765489d5e1e70fe16e5985a0267bf57a1bcf6ecf1300398542a2f0452e405` |
| `fig7-grading.webp` | Fig. 7 / p17 | `d9d45d173bc034cff44d56dbc6b7bc8e7d8a851068b3e3fa4d9354a9ca533846` |
| `fig8-gar.webp` | Fig. 8 / p19 | `5f6d1d9374ee3a1e10f77dcc08f8e7b573771454fe17e5694b040c5244eae771` |
| `fig10-harness.webp` | Fig. 10 / p23 | `c2f7fa6e9f38132e0dca94e82aaafd37041dd63e65a06e6292d76cd93adff400` |
| `fig11-router.webp` | Fig. 11 / p24 | `b1afc0fa7ac55db5fd53d6795131d57ac6166289d0d03ee58070dc4267b932cf` |
| `fig13-mopd2.webp` | Fig. 13 / p25 | `ced92e6b949a42eabd671ef9bc638b34109c2bf7b0ef3ed6683fe261006f3a09` |
| `fig14-infrastructure.webp` | Fig. 14 / p28 | `b406a0205efe863aca9db524e7380cd882ad8e647a248c0c550710d9a504144d` |

实质内容变化：

- 新增首屏读者/学习目标、第一遍路线、prompt/rollout/harness/reward/advantage 桥梁和可见模型身份。
- Eq. 1 增加最小 token 组演算；纠正“遮罩只为屏蔽工具文本”的简化，分开比率门控与轨迹 loss mask；解释 prompt-mean 与组内 token 归一化，保留 Fig. 8 token-mean 对照的协议差异。
- 保留 GRS/GAR 的完整数学与手算，增加通过率门控的长度惩罚 Eq. 4 及教学计算，并解释 Eq. 5 的 token 行为调整与守恒条件；未虚构报告未给出的具体超参数或因果增益。
- 保留两个已有交互 HTML，不修改控制/样式/脚本；在正文说明聚焦阶段/分支能揭示什么，静态主线独立完整。
- Sample Mixer 增加保留组数/接受率/时长到并发需求的可手算桥梁；§7 开放资源增加 input→operation→output→measurement 路径。
- Table 6 的全部 11 项和 Table 7 的全部 21 个 SFT→RL 组合进入两处原生 details；正文保留决定性比较、七 harness 均值、单/多 harness 属于不同训练的边界。
- 新增最终 Table 3 的代表性成绩与困难反例，不把最终 DeepSWE 71.9 与训练曲线 average@3 72.6 相减解释为蒸馏损失；显式保留修订版 CyberGym 环境脚注，避免与别的报告原版 CyberGym 合并。
- 四道理解题包含 GAR 更换质量因子的迁移计算、GRS 全通过组、前缀蒸馏与跨协议证据判断。

## 校验结果与交接边界

三篇均用当前仓库 renderer 输出到 `/tmp/paper-model-rebuild-20261027/`：

```text
node scripts/render-reading.cjs examples/deepseek-v4.1-flash-deep-read.md /tmp/paper-model-rebuild-20261027/deepseek-en.html
node scripts/render-reading.cjs examples/deepseek-v4.1-flash-zh-deep-read.md /tmp/paper-model-rebuild-20261027/deepseek-zh.html
node scripts/render-reading.cjs examples/mimo-v2.6-deep-read.md /tmp/paper-model-rebuild-20261027/mimo.html
node --test scripts/test-renderer-integrity.cjs scripts/test-render-reading.cjs
```

结果：三次渲染成功；相关测试 **30 passed / 0 failed**。初次测试有一项针对 MiMo 原有“组 token 分母”短语的字面断言失败，已在保持新解释语义的情况下恢复该句，未改测试或 renderer。另一次误用不存在的 `scripts/test-reading-language.cjs` 后，以 `rg --files scripts` 找到实际入口并使用上面的现有测试。临时结构检查最终采用标准库 HTMLParser；未引入依赖。

| 临时 HTML | 章节 | 内嵌原图 | 数学表达式 | evidence details | 理解题原生答案 | iframe |
|---|---:|---:|---:|---:|---:|---:|
| DeepSeek 英文 | 8 | 6 | 61 | 3 | 4 | 0 |
| DeepSeek 中文 | 8 | 6 | 62 | 3 | 4 | 0 |
| MiMo 中文 | 7 | 7 | 52 | 2 | 4 | 2 |

结构检查：语言正确、内链锚点无缺失、所有图片 `src` 已内嵌、details 成对、无残留 `$$`、来源链接没有原始 Markdown 泄漏；renderer 的离线资源检查通过。DeepSeek 的表头/数字双语核对，Table 4 同时按 PDF 单词坐标与列头核验。教学算例的算术进行了手算复核。`git diff --check` 对三个分配源文件通过。

| reading-quality 门 | 本次结论与证据 |
|---|---|
| 来源身份/覆盖 | pass（AI 作者来源自查）：固定 PDF、hash、版本差异、方法/结果/相关附录均可访问；具体覆盖见上文 |
| 科学忠实度 | pass（限本次核对的核心机制/公式/保留数值/图注）：DeepSeek Eqs. 1/8–17 与 Tables 1/3–5，MiMo Eqs. 1–5 与 Tables 1/3/6–7；不等于独立科学验证 |
| 主张到证据 | pass（作者自查）：系统比较、针对性对照、曲线与开放资源分开，关键反例和协议边界可见 |
| 读者完整性 | pass（内容合同自查）：两条连续机制主线、术语桥梁、手算、附录/正文扩展操作与迁移题；未测量真实读者理解 |
| 可视选择与交互 | 静态选择/审计理由已写；MiMo 既有控件实际离线指针/键盘操作为 unknown |
| 交付完整性 | 自动结构/资源检查 pass；浏览器打开、窄屏溢出、打印、来源开关实际效果与图像/数学视觉为 unknown |

按 neat-freak 做窄范围事实对齐：代码/renderer 在本任务 out-of-scope，三篇内容 changed-and-verified（以上限定），生成 docs/publish pending，由主任务统一处理；规则与记忆 out-of-scope，未写入；临时 PDF/HTML/测试日志保留供复核。按 ui-ux-pro-max 做有限 UX 指导查询，表格窄屏处理得到相关结果；“progressive disclosure”两次查询未得到可信匹配，该项以仓库 renderer-format 的原生 details 合同为依据，未假称搜索结果支持披露策略。未改共享 UI，也未作正式视觉结论。

本子任务只写三个分配 Markdown 和本记录。没有修改 `docs/`、README、CHANGELOG、共享 renderer、已安装 Skill、MiMo 交互 HTML 或图像资产；没有 commit/push。未读取 `evals/reader-tasks.md` 的答案或历史评审报告。后续由不同作者交叉审阅，再由主任务统一生成 gallery 与完成浏览器验收；本记录不将 AI 自查、结构测试或源版本像素比较称为学习实验或独立人类审核。
