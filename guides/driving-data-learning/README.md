# 数据交付之后，模型怎样真正学会

面向数据工程初学者的智能驾驶训练教程。无需神经网络或微积分基础。

- 在线阅读：https://xiaofengshi.github.io/paper-reading-skill/driving-data-learning.html
- 打开实验包中的 `reading.html` 可离线阅读并操作三个实验台。
- `reading.md` 是正文源；`assets/` 包含 9 张原创图示和 3 个交互实验台。图示覆盖场景切分、时序、计算图、有效监督、参数更新、累积节奏、反馈与实验对照。
- `labs/` 包含三个教学程序、固定依赖和已运行的参考结果。全部使用人工构造数据，不是实车或生产训练。

## 解压与运行

解压下载的 ZIP，进入解压得到的 `driving-data-learning/` 文件夹，再运行：

```bash
python3 labs/audit_lab.py --out labs/runs/my-audit
python3 labs/math_lab.py
```

这两项只需 Python 3 标准库。`math_lab.py` 会更新本地 `labs/math-results.json`；对账程序拒绝覆盖已有输出目录。

选做的 CPU 训练需要 uv、Python 3.13 和 PyTorch，首次运行会下载依赖：

```bash
uv run --no-project --python 3.13 --with torch==2.15.0 --with numpy==2.5.4 \
  labs/torch_lab.py --out labs/runs/my-torch-run
```

固定依赖见 `labs/requirements.txt`。该实验学习人为设定的线性规则；结果使用单个训练随机种子，不代表一般自动驾驶能力。参考结果在 `labs/runs/audit-verified-20261103/` 和 `labs/runs/torch-verified-20261103/`；不同平台或依赖版本可能带来浮点差异。

## 资料与许可证

第三方研究和官方文档的出处集中在教程第19节。本包不包含第三方论文PDF、私人原件、模型权重或本机审计备份。自有教程代码和图示按仓库MIT许可证提供；第三方资料权利仍属于各自权利人。

## 仓库中重新生成

在 paper-reading-skill 仓库根目录执行 `npm ci` 和 `npm run build:guides`。生成过程需要 Node.js 20+ 与 Python 3；阅读导出的HTML不需要它们。

图示由 `build-visuals.py` 以 Python 标准库生成；`python3 build-visuals.py --check` 可核对 9 张 SVG（8 张新增与 1 张重绘） 的新鲜度。构建教程时会自动生成或检查它们。所有数值均为正文中已有的教学例子，不是新报告的驾驶实验结果。
