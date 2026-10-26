# Paper Reading Skill：v0.2 发布与反馈材料

状态：本地准备，尚未发布。日期：2026-10-27。下文文案中的新示例链接须在 main 更新、GitHub Pages 部署完成并现场打开后再使用。没有对外发送、提交目录收录或购买推广。

## 面向读者的主张

读过，还能讲清楚。把一篇完整论文交给现有 coding agent，得到一份可以转发的 HTML：主线、机制、公式、原图与实验条件连在一起，原文定位可随时展开。

定位是「可讲解、可核查的深读」，使用场景是组会准备、自学一个机制和审视实验结论。费用来自用户原有 agent 的模型使用；Skill 本身免费，不增加单独的 API key。输入须有完整论文，生成时间取决于论文、模型和工具。

## 中文发布文案草稿

> 论文读完，还是讲不清它究竟做了什么？我更新了开源 Paper Reading Skill，让 coding agent 把完整论文做成一份可分享的深读 HTML。
>
> 新的 LoRA 示例从冻结底座、A/B 两条路径讲起，能手算一次更新，也能调 rank 看参数预算变化；再回到原论文，区分 checkpoint、显存和吞吐的不同分母。末尾有三道理解自测，答案可展开，关键结论保留原文定位。
>
> 支持 Codex、Claude Code、Kimi Code。MIT 开源；模型使用费按你现有 agent 的方式计算。这是阅读辅助，没有做实验复现或真人理解效果研究。
>
> 先看示例，再决定要不要安装：[LoRA 完整阅读](https://xiaofengshi.github.io/paper-reading-skill/lora-deep-read.html)。[仓库与安装](https://github.com/xiaofengShi/paper-reading-skill)。如果试了，最想知道你在哪一段仍需要回到 PDF。

## English launch draft

> Read it. Trace it. Explain it.
>
> Paper Reading Skill helps your coding agent turn a complete research paper into one shareable HTML reading: mechanisms, worked equations, original figures, and experimental conditions, with source locations you can reveal.
>
> The update adds a first-paper workflow, paper-specific understanding checks, and a small runtime package. The new English ResNet reading follows the original post-addition ReLU, works through a residual block, and separates ImageNet protocols from CIFAR results. The Chinese LoRA reading adds a rank/parameter teaching experiment and keeps discrepancies in the source visible.
>
> MIT licensed; works with Codex, Claude Code, and Kimi Code. Your existing agent provides the model access. Source checks and rendering tests are not experimental reproduction or a human comprehension study.
>
> [Read ResNet](https://xiaofengshi.github.io/paper-reading-skill/resnet-deep-read.html) · [Install](https://github.com/xiaofengShi/paper-reading-skill). Feedback on a confusing passage is especially useful.

## 60 秒演示脚本

| 时间 | 画面 | 讲什么 |
|---|---|---|
| 0–10 秒 | LoRA 阅读页标题和全局图 | 「不是只有摘要：先知道整篇论文的论证路径。」 |
| 10–25 秒 | 第03节的公式、手算例与 rank 滑块 | 「把参数变化算出来。滑块是教学算术，不是模拟训练效果。」 |
| 25–40 秒 | 第04节共同尺度的 WikiSQL/MNLI 对照 | 「小参数并不等于所有任务都领先；比较必须保留条件。」 |
| 40–50 秒 | 来源开关，展开一处原文定位 | 「你能查到结论对应哪张表、哪个版本。」 |
| 50–60 秒 | 原生理解自测、主页安装入口 | 「先试着自己讲一遍，再展开答案。欢迎反馈讲不通的地方。」 |

这是录制分镜，尚未录制视频；不要把静态截图称作完成的视频演示。

## 传播顺序与可检验的假设

1. 先发布仓库版本与示例，现场验证匿名打开、移动端入口和安装包。发布动作需仓库维护者授权；本文件不是发布记录。
2. 在本人已有、允许分享工具的渠道发一次具体演示，用实际阅读场景邀请反馈。不要群发私信、刷星或复制到无关社区。
3. 邀请少量实际目标读者尝试自己的论文，记录首次安装、首次成功产物和最具体的理解障碍。邀请或发消息须另有用户明确授权。
4. 再考虑社区目录。2026-10-27 已核查 [Awesome Claude Skills 的贡献规则](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/CONTRIBUTING.md)：强调真实用例、文档、示例与测试。页面同时显示当前仅协作者可创建 PR，不能承诺可直接投稿。skills.sh 的目标网页本次不可访问；但官方CLI的`npx --yes skills find paper-reading`已检索到本项目，显示14 installs。因此已有CLI索引证据，不应重复提交或宣称上榜；计数窗口、去重与自动化占比未知。

验证两项假设：完整经典论文的演示是否比功能列表更容易让目标读者理解用途；更明确的首篇工作流是否减少安装后无产物。它们仍是假设，不能从本次代码测试推断成立。

## 衡量方式

| 环节 | 记录什么 | 不应如何解释 |
|---|---|---|
| 触达 | GitHub 14天访客、views、已公开来源；若有站点数据另列 | GitHub views 不能代表 Pages 阅读次数 |
| 首次成功 | 自愿反馈的首次任务是否完成、agent/模型、耗时边界、失败原因 | clones 不是安装完成，也不是活跃用户 |
| 使用价值 | 能否解释机制与证据、具体误解、是否需要回到 PDF、是否再次使用 | AI 自答题或展开答案不等于真人理解效果 |
| 后续关注 | 同一时间窗口新增 stars、实际反馈、回访 | 总 stars ÷ 当期访客不是转化率 |

先记录基线，再按同样时间窗口复核；低样本只报告计数与个案，不宣布显著提升。未增加追踪脚本、付费推广或自动消息。
