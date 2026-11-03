// Tutorial wording is explicit; stop if a renderer change invalidates an assumption.
module.exports = function tutorialPresentation(html) {
  const replacements = [
    ['从全局路径到机制与实验的一体化论文深读。', '从数据交付到模型更新与独立评测的数据工程入门教程。'],
    [' · 深读图谱</title>', ' · 数据工程入门教程</title>'],
    ['>PAPER / READING</a>', '>DATA / LEARNING</a>'],
    ['>图解阅读 · 机制与证据</span>', '>智能驾驶 · 数据工程入门</span>'],
    ['>论文深读图谱 · 中文</p>', '>智能驾驶 · 数据工程入门</p>'],
    ['>进入论文图谱 <span', '>从施工样本开始 <span'],
    ['>论文全局图 <span', '>你将掌握的三个环节 <span'],
  ];
  for (const [before, after] of replacements) {
    if (html.split(before).length !== 2) throw new Error(`Review tutorial presentation after renderer changes: ${before}`);
    html = html.replace(before, after);
  }
  return html;
};
