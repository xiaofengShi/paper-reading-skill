# Paper Reading Skill

**Turn a research paper into one visual reading atlas.** Start with the whole argument, follow the method or proof, work through important mechanisms, and read the experiments with their actual settings and numbers. The default request, “read this paper,” produces a complete, self-contained HTML deep read.

[Project website →](https://xiaofengshi.github.io/paper-reading-skill/) · [Explore the MiMo-V2.6 deep read →](https://xiaofengshi.github.io/paper-reading-skill/mimo-v2.6-deep-read.html) · [中文说明](README.zh-CN.md)

![A preview of the MiMo-V2.6 reading atlas, connecting the paper's global map, RL mechanism, and experiment evidence.](docs/assets/atlas-preview.svg)

## See a complete reading

The [MiMo-V2.6 example](https://xiaofengshi.github.io/paper-reading-skill/mimo-v2.6-deep-read.html) is a Chinese-language single page that moves from the research problem and training path to the RL objective, GRS/GAR grading, runtime system, MOPD2, and experiments. It includes the complete relevant Eq. 1, worked examples, original figure excerpts beside their explanations, numerical comparisons, and optional PDF locations. Interactive diagrams are supplementary; the main explanation remains readable without them.

The example was authored from a 44-page local PDF. The PDF itself is not redistributed here. The authors later [updated the online report](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/commit/73875d00b30a89ef8cc353a0b60b0e9f9561952d); the example incorporates the corrected Pro active-parameter figure, while other version differences have not been checked page by page.

## What you get

1. **Whole-paper map.** The question, setting, proposed idea, contributions, and where evidence enters.
2. **Method or argument path.** Inputs, stages, branches, feedback, and outputs, with consequential arrows explained.
3. **Mechanism close-ups.** Definitions, equations, assumptions, and a worked example where it helps.
4. **Experiment atlas.** Each question linked to its setup, comparator, metric, observed result, and supported reading.
5. **Connected synthesis.** What the method and evidence show together, with limits attached to the affected claims.

The diagrams guide reading; prose, formulas, tables, and original figures carry the detail. Source locations stay available for verification but are hidden by default in the HTML. The output is one offline-readable file, with Markdown as its audit source.

## Get started

**Codex and Kimi Code:** install the repository as a personal skill, then install its rendering dependencies. Node.js 20 or newer is required for the bundled HTML renderer.

```bash
mkdir -p "$HOME/.agents/skills"
git clone https://github.com/xiaofengShi/paper-reading-skill.git "$HOME/.agents/skills/paper-reading"
npm ci --prefix "$HOME/.agents/skills/paper-reading"
```

**Claude Code:** use its personal skills directory instead.

```bash
mkdir -p "$HOME/.claude/skills"
git clone https://github.com/xiaofengShi/paper-reading-skill.git "$HOME/.claude/skills/paper-reading"
npm ci --prefix "$HOME/.claude/skills/paper-reading"
```

Start a new agent session, attach a PDF or give an accessible paper URL, and ask: **“Read this paper deeply. Give me one visual HTML reading document that explains the main path, important equations, and experiments.”** The skill is named `paper-reading`; you can also invoke it explicitly as `$paper-reading` in Codex, `/paper-reading` in Claude Code, or `/skill:paper-reading` in Kimi Code. The agent needs access to the paper and must do the scientific reading; this repository supplies the workflow and renderer, not a service that automatically converts an arbitrary PDF into a verified explanation.

Ask for a quick scan only when you want triage. Ask for a review or research comparison when you want those additional lenses. An ordinary request to read a paper stays understanding-first.

## How it works

The [skill instructions](SKILL.md) guide an agent through orientation, full reconstruction, explanation, and source checking. [Paper-type routes](references/paper-types.md) select suitable views for empirical, systems, benchmark, dataset, theory, and survey papers; [visual-reading rules](references/visual-reading.md) keep diagrams tied to explanations and evidence. [Reading modes](references/reading-modes.md) define the optional scan, review, and research lenses.

The bundled [renderer](scripts/render-reading.cjs) turns a Markdown audit source and local visuals into a standalone HTML file with embedded images, diagrams, KaTeX math, and fonts. English audit sources start with `<!-- paper-reading-lang: en -->` to render English navigation and chart labels. Archify can render optional interactive structure views, but neither Archify nor another locally installed skill is required. The [MiMo Markdown source](examples/mimo-v2.6-deep-read.md) and its visual inputs show the format; they are build materials, not separate reading pages.

To rebuild the published example locally:

```bash
npm ci
npm run build:example
npm test
```

## Validation and scope

The MiMo-V2.6 document demonstrates one complete empirical technical-report read. Renderer tests cover inline and display math, source-location visibility, figure context, and numerical chart behavior. These checks verify rendering contracts; they do not independently certify every scientific interpretation. Other paper types are described in the skill but do not yet have equally complete public examples or cross-paper user evaluation.

The reading method draws on [Keshav’s three-pass approach](https://systems.cs.columbia.edu/ds2-class/papers/keshav-paper.pdf), [Novak and Cañas’s concept maps](https://cmap.ihmc.us/publications/researchpapers/theoryunderlyingconceptmaps.pdf), and [SciDoc2Diagrammer-MAF](https://aclanthology.org/2024.findings-emnlp.780/). [Archify](https://github.com/tt-a1i/archify) is an optional presentation tool for interactive structure diagrams. Scientific fidelity still depends on reading and checking the source paper.

Questions, bug reports, and examples from other paper types are welcome in [GitHub Issues](https://github.com/xiaofengShi/paper-reading-skill/issues). The project is [MIT licensed](LICENSE).

## Maintainer notes

This README is the English source for the default [project website](https://xiaofengshi.github.io/paper-reading-skill/); [README.zh-CN.md](README.zh-CN.md) is the source for the [Chinese page](https://xiaofengshi.github.io/paper-reading-skill/zh.html). Run `npm run build:docs` after editing either language, and commit the generated HTML together with the Markdown. The site generator is [scripts/build-docs.cjs](scripts/build-docs.cjs).
