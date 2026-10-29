# Rollback 阅读任务记录

已完成中文 **Deep Reading**。输入为 [Hugging Face 论文页](https://huggingface.co/papers/2610.36068)，规范来源为 arXiv:2610.36068v1 的 25 页 PDF，涵盖正文及附录 A–G。

- [离线 HTML](reading.html)：正文、公式、原图、结果表与自检答案。
- [Markdown 审计源](reading.md)：唯一内容源，含逐项来源覆盖记录。
- [来源记录](provenance.json)：论文版本、PDF 哈希、原图裁切坐标与署名、Skill 提交。
- [验证记录](verification.json)：数值核对、页面检查、深度自评与实际验证范围。

本阅读未加入公共示例库。原图使用 CC BY 4.0，图像、公式与字体在 HTML 内嵌；只有打开论文等外部链接时才需要网络。

重新生成 HTML：

```bash
node /Users/baai/.agents/skills/paper-reading/scripts/render-reading.cjs reading.md reading.html
```

在本目录执行上述命令，需 Node.js 20+ 及本机 Skill 已安装依赖。该命令仅重新渲染已有内容，不会重新读论文或复现机器人实验。
