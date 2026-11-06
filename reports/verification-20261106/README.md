# BoardUI 首页优化核验

日期：2026-11-06（Asia/Shanghai）。范围：中英文项目首页、主页构建与轻量包边界。状态：本地实现与功能核验完成，尚未推送或发布。基线提交：`50fdb7beb6115ed76f6125d6bfa97a405ae6e590`。

## 交付变化

- 使用官方 BoardUI Button/ButtonLink、语义颜色 token 与复合字号，在构建时生成静态 HTML；浏览器不加载 React。
- 简化首屏行动入口，统一导航、样例卡片、代码复制与筛选控件；手机端保留全部主导航。
- 在原有搜索、语言/主题筛选与六篇分页之上，增加 Brief/Deep 筛选和一键重置；分组数量随筛选更新。
- 保留现有阅读地址与正文，修复分页焦点出视口、320px 质量表格溢出与打印遗漏隐藏条目。
- 同步中英文内容源与贡献文档；开发依赖不进入轻量 skill 包，生成 CSS 附带完整 BoardUI MIT 声明。

## 已验证

| 检查 | 结果与边界 |
| --- | --- |
| 官方 skill 安装 | `~/.agents/skills/boardui`，版本 `2026.11.5`；五个官方文件逐字节核验，官方 CLI 复核版本 |
| `npm ci` | 在现有 macOS / Node.js 26.12.0 环境完成；npm 提示两个安装脚本未获 allowScripts 覆盖，实际构建使用已安装的平台二进制并成功 |
| `npm test` | 46 项通过；包括生成页面、阅读器、语言/模式合同与轻量包 |
| `doctor` 与生成检查 | `check:docs`、`check:examples`（24 篇）、`check:audit`、`check:guides`、`check:readings` 均通过 |
| 浏览器 | Google Chrome + Playwright：131 项功能检查；中英文各 320、375、768、1024、1440px |
| 筛选与导航 | 深度/语言组合、主题、全目录 arXiv 搜索、空结果、重置、分页与可见焦点 |
| 复制 | 正常 clipboard 写入、权限拒绝时选中完整命令供手动复制 |
| 离线与无脚本 | 本地 file URL、断网、禁用 JavaScript，仍显示全部 24 篇并可键盘展开简介；预览图可加载 |
| 打印与动画 | 打印包含全部 24 篇，隐藏交互控件；减少动态效果设置关闭平滑滚动 |
| 页面请求 | 受测首页无外部网络请求、无 JavaScript pageerror、无文档级横向溢出 |
| 轻量包实际安装 | 临时位置打包后 `npm ci` 仅安装 3 个运行依赖，再运行 doctor 通过；未替换个人活动安装 |
| 独立代码核验 | 代理检查发现的许可与焦点问题已修复；320px 表格问题也已修复。代理核验不代表真人评审 |

[逐项浏览器结果](browser-checks.json) · [浏览器复现脚本](check-homepage.py) · [BoardUI 来源与校验和](../../styles/BOARDUI.md)

## 待完成与边界

- `pending`：GLM-5.3-Flash 正式视觉复核，当前会话无法调用指定模型；截图与几何检查不能替代该验收。
- `pending`：远端推送、GitHub CI 与 Pages 发布/线上验收；本记录不表示线上已更新。
- `unverified`：本次未在 Node.js 20/22/24 或 Safari/Firefox 实机重跑，未做 VoiceOver 或真人可用性研究。
- `out-of-scope`：论文内容正确性、学习效果和个别阅读页面的视觉改造。
- 规则已同步主页源码与构建约定；机器生成记忆只读。未清理历史材料或其他项目。

## 截图

[英文桌面首屏](index-1440-hero.png) · [英文桌面目录](index-1440-gallery.png) · [英文手机首屏](index-375-hero.png) · [英文手机目录](index-375-gallery.png)

[中文桌面首屏](zh-1440-hero.png) · [中文桌面目录](zh-1440-gallery.png) · [中文手机首屏](zh-375-hero.png) · [中文手机目录](zh-375-gallery.png)

## 复现浏览器检查

需要安装 Google Chrome，以及含 `playwright==1.64.1` 的 Python 环境。在仓库根目录的第一个终端运行 `python3 -m http.server 8796 --bind 127.0.0.1 --directory docs`，然后在第二个终端运行 `python3 reports/verification-20261106/check-homepage.py`。脚本使用本机 Chrome，无需另下浏览器；结果和截图写回本目录。
