<p align="center"><img src="docs/assets/logo.svg" alt="" width="64" height="64"></p>
<h1 align="center">Paper Reading Skill</h1>
<p align="center"><strong>Read it. Trace it. Explain it.</strong> Give your coding agent a paper. Get one offline HTML that connects the problem, mechanism, equations, figures, and evidence — with source locations you can check.</p>
<p align="center"><a href="https://xiaofengshi.github.io/paper-reading-skill/">Project website ↗</a> · <a href="https://xiaofengshi.github.io/paper-reading-skill/resnet-deep-read.html">Read a complete example ↗</a> · <a href="#get-started">Get started</a> · <a href="README.zh-CN.md">中文</a></p>

![A preview of the MiMo-V2.6 reading atlas, connecting the paper's global map, RL mechanism, and experiment evidence.](docs/assets/atlas-preview.svg)

## Start with one paper

**Already use Codex?** Run these in your project (Node.js 20+):

```bash
npx --yes skills add xiaofengShi/paper-reading-skill --skill paper-reading --agent codex --copy --yes
(cd .agents/skills/paper-reading && npm ci && npm run doctor)
```

Start a new agent session and paste:

```text
Use $paper-reading in Brief Reading mode to explain https://arxiv.org/abs/2106.09685v2 in English.
I know basic neural networks but am new to LoRA. Explain why it saves
trainable parameters, work through a small example, and distinguish
reported results from interpretation. Save the offline HTML and Markdown
in paper-readings/lora/. Check the full paper before writing.
```

Expect `paper-readings/lora/reading.html` and its Markdown audit source after the agent completes the reading. The agent reads and authors the explanation; the renderer turns that Markdown into HTML. The skill is free and needs no separate API key; your agent's normal model access and charges still apply. [Other agents, installation options, and troubleshooting](#get-started).

### Choose Brief or Deep Reading

| Mode | What you get | How to request it |
|---|---|---|
| **Brief Reading** (default) | The existing focused format: problem, main path, key mechanisms and equations, decisive evidence, and limits | “Read this paper” or “Use Brief Reading” |
| **Deep Reading** | Full technical reconstruction: core mechanisms step by step, key derivations and worked examples, each major experiment and ablation, and relevant appendices | “Use Deep Reading” or “Read this paper deeply” |

Both deliver one offline HTML and its Markdown audit source, with a visible mode label. Deep grows with the paper's complexity and requires complete core coverage and reconstructable explanations; word count alone cannot qualify it. See the [mode comparison](references/reading-modes.md) and [Deep Reading protocol](references/deep-reading.md).

## Explore complete readings

The existing gallery entries are **Brief Reading** examples. Their original `-deep-read` links remain stable; their displayed mode follows the new distinction. Each reading names its intended reader and learning goals, provides a worked mechanism or operation trace, and ends with paper-specific understanding checks. Original figures, equations, and experiment conditions stay beside their explanations; supporting protocols can be expanded without losing the main argument or its limits.

<!-- readings-index:start -->
- **Attention Is All You Need** · English · Brief Reading — Follow encoder and decoder tokens through attention, compute the key equation, then read translation tests, ablations, and parsing transfer. Based on [arXiv:1706.03762](https://arxiv.org/abs/1706.03762). [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/attention-is-all-you-need-deep-read.html)
- **MiMo-V2.6** · 中文 · Brief Reading — Follow the training path through the RL objective, GRS/GAR grading, runtime system, MOPD2, and experiments. [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/mimo-v2.6-deep-read.html)
- **LoRA** · 中文 · Brief Reading — Change an input and trace the low-rank correction through both branches and merged weights. Work from initialization gradients to a two-dimensional subspace example, then inspect the evidence. Four understanding checks, including a new-budget transfer task. Based on [arXiv:2106.09685v2](https://arxiv.org/abs/2106.09685v2). [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/lora-deep-read.html)
- **The Trinity** · 中文 · Brief Reading · ZCode — A method reading of capability-driven recursive self-improvement for multimodal agents: task→capability→harness trees, selective inheritance, Real2Sim2Real with a screening band, and a router reaching ~96% of Oracle. Based on [arXiv:2610.36077v1](https://arxiv.org/abs/2610.36077v1). [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/the-trinity-deep-read.html)
- **Trustworthy RSI Survey** · 中文 · Brief Reading · ZCode — A survey reading of trustworthy recursive self-improvement: the h/B/U definition, the S1–S4/RI stage lens, four trustworthiness themes under three analytical roles, and the evidence funnel from 26 RSI-labeled claims to 4 matched-budget comparisons. Based on [arXiv:2610.35193v1](https://arxiv.org/abs/2610.35193v1). [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/trustworthy-rsi-survey-deep-read.html)
- **Dual Exam** · 中文 · Brief Reading · ZCode — Read the 0%-success coupled pilot, then follow the two controlled tracks: fixed environment responses for Agents (10 configurations, 1,088 items) and fixed action interventions for World Models (400 cases), with explicit aggregation rules and a candid limitations section. Based on [arXiv:2610.31066v1](https://arxiv.org/abs/2610.31066v1). [Open the reading →](https://xiaofengshi.github.io/paper-reading-skill/dual-exam-deep-read.html)

There are **15** published readings so far — [browse the full gallery →](https://xiaofengshi.github.io/paper-reading-skill/#readings)
<!-- readings-index:end -->

The 11 readings covered by the reconstruction record, including LoRA and ResNet, were rebuilt against the updated skill on 2026-10-27. See the [reconstruction and verification record](docs/examples-rebuild-20261027.html) for source versions, worked examples, corrected claims, and validation limits.

## What you get

1. **Whole-paper map** The question, setting, proposed idea, contributions, and where evidence enters.
2. **Method or argument path** Inputs, stages, branches, feedback, and outputs, with consequential arrows explained.
3. **Mechanism close-ups** Definitions, equations, assumptions, and a worked example where it helps.
4. **Experiment atlas** Each question linked to its setup, comparator, metric, observed result, and supported reading.
5. **Connected synthesis** What the method and evidence show together, with limits attached to the affected claims.
6. **Understanding checks** Paper-specific questions about a mechanism, small application, or evidence boundary, with answers you reveal when ready. These are learning aids, not a measured comprehension score.

The diagrams guide reading; prose, formulas, tables, and original figures carry the detail. Source locations stay available for verification but are hidden by default in the HTML. The output is one offline-readable file, with Markdown as its audit source.

## The reading method

The workflow combines established reading and knowledge-mapping ideas with a paper-specific editorial design. Its three checks answer different questions:

1. **Can we reconstruct the paper before explaining it** [Keshav's three-pass approach](https://systems.cs.columbia.edu/ds2-class/papers/keshav-paper.pdf) moves from an overview to the paper's content and then to a detailed reconstruction. The skill uses the first pass to draft a provisional map, the second to follow methods and results, and the third to work through the decisive equations, assumptions, proofs, or experiments. Brief selects the key explanations after checking the source; Deep completes the reconstruction across all substantive parts and relevant appendices.
2. **Does each diagram express a meaningful relationship** [Novak and Cañas's concept-map method](https://cmap.ihmc.us/docs/theory-of-concept-maps) starts with a focus question and connects concepts with labeled relationships and cross-links. Here, a map answers a paper-specific question such as “How does the mechanism change the result?” Arrows say whether they mean data flow, process order, or evidence; the accompanying text explains what they connect.
3. **Can a reader check the explanation against the paper** [SciDoc2Diagrammer-MAF](https://aclanthology.org/2024.findings-emnlp.780/) reports that generated scientific diagrams can be incomplete or unfaithful to their source. This project takes that as a fidelity check: significant figures, formulas, numbers, and arrows must be checked against the source, and each experiment is read with its setup, comparator, metric, and result. It does not implement that paper's diagram-generation algorithm.

These ideas guide five explanatory layers: global map, main path, mechanism, experiment atlas, and synthesis. The [understanding checks](references/learning-checks.md) supplement the explanation when useful. The test of a useful deep read is whether someone can explain the paper's central mechanism and say which evidence supports each important claim, without hunting through the PDF for missing essentials. This is the project's method design, not a claim that the published examples have been validated in a reader study.

The [public reading-quality checks](evals/reading-quality.md) share source, fidelity, evidence, and delivery gates across both modes. Brief requires an explanation score of at least 2 in each applicable dimension; Deep requires 3 in every applicable dimension plus a source-to-explanation coverage record. The [reader tasks and answer keys](evals/reader-tasks.md) make every published example testable by someone who did not write them. A renderer test or an author reviewing their own page is not an independent comprehension study.

## Get started

The quickstart above installs a project-local Codex copy using the [skills CLI](https://github.com/vercel-labs/skills). The bundled renderer needs Node.js 20 or newer. Your agent also needs access to the complete paper and tools to read it.

### Personal installation and other agents

Choose an unused personal skill directory:

| Agent | Personal directory | Explicit invocation |
|---|---|---|
| Codex | `~/.agents/skills/paper-reading` | `$paper-reading` |
| Kimi Code | `~/.agents/skills/paper-reading` | `/skill:paper-reading` |
| Claude Code | `~/.claude/skills/paper-reading` | `/paper-reading` |

For Codex or Kimi Code, clone the repository as follows. For Claude Code, change the first line to `paper_reading_dir="$HOME/.claude/skills/paper-reading"`.

```bash
paper_reading_dir="$HOME/.agents/skills/paper-reading"
mkdir -p "$(dirname "$paper_reading_dir")"
git clone https://github.com/xiaofengShi/paper-reading-skill.git "$paper_reading_dir"
(cd "$paper_reading_dir" && npm ci && npm run doctor)
```

`doctor` renders a small, explicitly synthetic fixture in a temporary directory and checks language, navigation, embedded math fonts, an SVG, and a chart. It does not download or read a paper, and passing it does not verify scientific content.

Start a new agent session, attach a PDF or give an accessible paper URL, and ask: **“Use Brief Reading in English to explain this paper.”** For the expanded mode, ask: **“Use Deep Reading in English. Reconstruct the mechanisms, derive the key equations, interpret the major experiments and ablations, and cover relevant appendices.”** Replace “in English” with your preferred language. With no language cue, the skill defaults to English; a request in Chinese produces Chinese output. The native renderer provides English and Chinese navigation.

For an existing Git clone, review local changes, run `git -C "$paper_reading_dir" pull --ff-only`, then rerun `npm ci` and `npm run doctor` there. CLI-installed copies and lightweight packages may have no Git history: preserve local changes before replacing them with a fresh installation.

### Start a reading directory

An optional initializer creates a place to work. From a project with the quickstart installation:

```bash
node .agents/skills/paper-reading/scripts/init-reading.cjs \
  --out paper-readings/my-paper --title "My paper" \
  --paper "https://arxiv.org/abs/2106.09685v2" --lang en --mode brief
```

This creates `reading.md`, `brief.md`, and an `assets/` directory. Use `--mode deep` to prepare a Deep Reading task. `brief.md` is the task brief in either mode. The Markdown is visibly marked **unfinished**. The command does not fetch the paper, author an explanation, or generate HTML; the agent must complete and check the draft before rendering. An existing destination is refused. Use `--lang zh-CN` for a Chinese draft, or run `npm run init:reading -- --help` inside the installed skill for all options.

### Build a lightweight local package

Build the current two-mode runtime from a repository checkout to install without the public gallery and website. The [v0.2.0 release archive](https://github.com/xiaofengShi/paper-reading-skill/releases/tag/v0.2.0) predates the Brief/Deep distinction. For the current package:

```bash
npm ci
npm run pack:skill
```

The result is `dist/paper-reading/`, including a SHA-256 `manifest.json`, and `dist/paper-reading.tar.gz` when the system `tar` command is available. Copy the whole runtime directory to an unused skill location from the table, then run `npm ci` and `npm run doctor` inside that copy. It includes the renderer, helpers, references, and synthetic check fixture; it excludes `docs/`, `examples/`, dependencies, and tests. Existing package outputs are refused; use `npm run pack:skill -- --out <new-output-parent>` for another build.

### Troubleshooting

| Symptom | What to check |
|---|---|
| Missing `marked` or `katex` | Run `npm ci` inside the installed skill, with its `package-lock.json` present. |
| Missing helper or fixture files | Install the full checkout or generated runtime directory; copying `SKILL.md` alone is insufficient. |
| `ERR_REQUIRE_ESM` with an older installation | Update the skill and reinstall its dependencies. The current renderer supports Node.js 20.18 and newer. |
| Agent cannot find the skill | Confirm its installation directory and start a new session; use the explicit invocation above. |
| Initializer says the destination exists | Choose a new reading directory; the initializer preserves existing files. |
| Agent only has an abstract or inaccessible PDF | Provide the full source or keep the result explicitly incomplete. A summary cannot stand in for a complete deep read. |

The agent performs the scientific reading and authors the Markdown; the renderer converts that Markdown to HTML. An ordinary request selects Brief; an explicit deep-reading request selects Deep. Quick scans use Brief with the requested shorter scope. Review and research comparisons add lenses to the selected mode.

## How it works

The [skill instructions](SKILL.md) guide an agent through orientation, full reconstruction, explanation, and source checking. [Paper-type routes](references/paper-types.md) select suitable views for empirical, systems, benchmark, dataset, theory, and survey papers; [visual-reading rules](references/visual-reading.md) keep diagrams tied to explanations and evidence. [Reading modes](references/reading-modes.md) define Brief and Deep; [Deep Reading](references/deep-reading.md) adds coverage, reconstruction, derivation, and experiment-by-experiment requirements. Review and research are optional lenses.

The bundled [renderer](scripts/render-reading.cjs) turns a Markdown audit source and local visuals into a standalone HTML file with embedded images, diagrams, KaTeX math, and fonts. Every source begins with an explicit language marker, `<!-- paper-reading-lang: en -->` or `<!-- paper-reading-lang: zh-CN -->`, which sets navigation and chart labels. An optional second line chooses one of four built-in visual themes: `<!-- paper-reading-theme: forest -->`, `cobalt`, `plum`, or `saffron`; the default is `forest`. Declare `<!-- paper-reading-mode: brief -->` or `<!-- paper-reading-mode: deep -->` in the same header. The HTML title and hero show that mode; older sources without a mode render as Brief. The author selects a theme for each paper rather than having the renderer guess from its text.

For each paper, the skill judges whether exploring a branch, state change, or feedback loop adds understanding; otherwise it uses a static view. An interactive view can use Archify or self-contained HTML/SVG, with the key explanation still visible without scripts. Neither Archify nor another locally installed skill is required. The [renderer input format](references/renderer-format.md) documents the Markdown contract, [figure extraction](references/figure-extraction.md) covers original figures, and [understanding checks](references/learning-checks.md) describe focused questions with native answer disclosures.

Every published reading ships its Markdown audit source and visual inputs under `examples/`, indexed in [readings.json](readings.json); they are build materials, not separate reading pages.

To rebuild all published examples locally:

```bash
npm ci
npm run doctor
npm run build:examples
npm run check:examples
npm test
```

## Validation and scope

Different checks support different claims:

| Check | What it can establish | Boundary |
|---|---|---|
| Automated structure and rendering checks | Input contracts, language and theme declarations, math, declared embedded assets, chart behavior, and generated-file freshness. | A passing renderer cannot establish scientific correctness or reader understanding. The doctor uses synthetic material. |
| AI-assisted source checks | Trace an explanation's equations, figures, numbers, and claims to an identified paper version; record discrepancies and missing coverage. | Report what was checked and what remains uncertain. These checks are not experimental reproduction or independent human review. |
| Independent reader evaluation | The [reader tasks](evals/reader-tasks.md) provide questions and answer keys for a future evaluation. | No independent reader study has been reported. Answer disclosures and AI answers are not evidence of measured human learning. |

The gallery covers architecture, parameter-efficient adaptation, technical reports, domain fine-tuning, engineering benchmarks, document knowledge internalization, and agent harnesses. Theory and surveys remain outside the current example set. LoRA's small matrix and parameter-count exercises are labeled teaching examples, separate from the paper's reported experiments. The project has not established that its format improves comprehension over other reading methods.

[Archify](https://github.com/tt-a1i/archify) is an optional presentation tool for interactive structure diagrams. Scientific fidelity still depends on reading and checking the source paper.

Questions, bug reports, and examples from other paper types are welcome in [GitHub Issues](https://github.com/xiaofengShi/paper-reading-skill/issues). The project is [MIT licensed](LICENSE).

## Maintainer notes

This README is the English source for the default [project website](https://xiaofengshi.github.io/paper-reading-skill/); [README.zh-CN.md](README.zh-CN.md) is the source for the [Chinese page](https://xiaofengshi.github.io/paper-reading-skill/zh.html). Run `npm run build:docs` after editing either language, and commit the generated HTML together with the Markdown. The site generator is [scripts/build-docs.cjs](scripts/build-docs.cjs).
