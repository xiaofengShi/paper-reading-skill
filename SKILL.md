---
name: paper-reading
description: >-
  Read an academic paper deeply and deliver one self-contained visual HTML reading document: global concept map, method or argument flow, mechanism explanations, experiment map, and synthesis. Use for PDF, arXiv, URL, or local papers when the user asks to read, understand, explain, visualize, compare, review, or build on a paper. Ordinary “read this paper” requests use a complete understanding-first read; reviewer critique and research planning are optional lenses.
---

# Paper Reading

Turn a paper into a navigable explanation that lets a reader move from the whole argument to its technical and experimental details. The default outcome is understanding the paper on its own terms. Scientific scrutiny stays present as source discipline; it becomes the organizing lens only when the user asks for review, credibility assessment, comparison, or research planning.

## Choose depth and lens

- **Default: DEEP READ.** “Read this paper,” “仔细读,” and requests for a mind map or diagram mean a complete read. Do not infer a critique-first objective or stop after a preliminary relevance judgment.
- **SCAN** only when the user asks for triage, a quick overview, or whether to read further. Stop after the overview only in this mode.
- **REVIEW lens** when the user asks whether conclusions hold, for weaknesses, or for a reviewer-style assessment. Add the [critique matrix](references/critique-matrix.md) after explaining the paper.
- **RESEARCH lens** when the user supplies an active research question or asks for comparison, reproduction, or next experiments. Add the [research card](references/research-card.md) and, when useful, the [evidence state](references/evidence-state.md).

Read [reading modes](references/reading-modes.md) only when depth or lens is ambiguous. Select the relevant [paper-type protocol](references/paper-types.md) for a theory, benchmark, dataset, survey, empirical, or systems paper.

## Build the reading atlas

Read the paper in passes: inspect the abstract, introduction, overview figures, conclusions, and main results for a provisional map; then read methods, experiments, captions, appendices, and definitions to correct and deepen that map. A provisional map is never the final answer in DEEP READ.

Produce these layers in this reader-facing order inside **one continuous reading document**, adapting diagram type to the paper:

Before the main path, name the ordering principle when several orders coexist (for example, paper section order, model training chronology, and this document's explanation order). State why the reader-facing chapters follow that route and where a cross-cutting system component fits. A final evaluation belongs after training as evidence, not as another training operation. Keep the navigation labels short enough to scan.

1. **Global map:** research problem, setting, prior limitation, main idea, contributions, and where evidence enters. Give a short orientation paragraph and a labeled concept map.
2. **Main path:** method, training/inference pipeline, proof dependency, dataset construction, or benchmark protocol. Show inputs, transformations, decisions, outputs, and feedback loops. Explain each non-obvious arrow.
3. **Mechanism zoom:** unpack the few operations essential to understanding the contribution: definitions, formulas, objective, algorithm, data movement, assumptions, and a small concrete example when useful. Distinguish the author's explanation from your interpretation.
4. **Experiment atlas:** map each major question to its setup, baseline/control, metric, result, and conclusion. Preserve the actual denominator, unit, evaluation setting, and source figure/table. Explain what the reader should notice before discussing limitations.
5. **Synthesis:** explain the specific dependencies or tension that connect this paper's mechanism and evidence. State what its experiments show and the scope of that reading. Avoid a generic “what to remember” recap, repeated figure list, or commentary about the reading document itself. Keep minor source discrepancies near the relevant fact rather than making them the ending. Add a reviewer audit only if the chosen lens needs it.

For every diagram, use [visual-reading](references/visual-reading.md): one question per view, labeled relationships, selective detail, and source anchors. A diagram is a navigation layer, not a replacement for explanations, equations, tables, or the original figures. Do not flatten the paper into one giant graph or force a method flow onto a theory or survey paper.

## Default deliverable

For DEEP READ, deliver **one self-contained HTML file** that a reader can follow from overview to details without opening separate diagram pages or returning to the paper for essential explanations. Put the overview, mechanism diagrams, readable original figure excerpts when useful, formulas, experiment data, worked examples, explanations, and source pointers in the same document. A source pointer is for verification, never the entire content of a card or section; hide PDF page and figure citations in the default HTML reading view and provide an explicit way to reveal them. The audit Markdown retains all references. Show the actual setup, baseline, observation, and interpretation beside each consequential experiment. Embed locally generated graphics and any Archify views into that file; separate JSON, Markdown, and diagram HTML are editable build inputs, not the primary reader-facing output. Keep a Markdown audit source alongside the HTML. For SCAN or when the user explicitly requests another format, match that request.

A reusable renderer for this repository's examples is [render-reading.cjs](scripts/render-reading.cjs); use it when its Markdown/visual inputs fit the paper, or create an equivalent single-file HTML. Its build uses this repository's files and `package.json` dependencies only. Do not require a separately installed local skill, Archify CLI, or a machine-specific path. Pre-rendered interactive HTML may be embedded as an optional input. Do not turn the example's layout into a fixed template for every paper type.

## Evidence and rendering contract

- Tie important facts, nodes, arrows, formulas, and numbers to exact PDF page/section/figure/table/appendix references in the audit source. Keep those references retrievable in the HTML without showing them by default. In a PDF, verify captions and table cells visually when extraction is uncertain. Record source version and conflicting numbers instead of silently resolving them.
- If prose invokes an equation to explain a mechanism, render the full relevant equation beside that explanation, preserve its denominator and masks, and define the variables readers need. Distinguish an algebraically equivalent screen layout from a different objective. If a chart uses values from a paper figure, visibly label it as a redraw or approximation and name the source panel; visibly label embedded original figures as original. Figure identifiers remain readable even when page-number references are hidden.
- Mark **paper statement**, **observed result**, and **reader inference** distinctly. End-to-end comparisons describe system results; controlled ablations can isolate a mechanism. Do not automatically make claim auditing the reader's objective.
- Use a readable Markdown source as the portable audit copy. Derive HTML content from that source and structured figure data; keep figures, numbers, equations, and qualifiers aligned. Important content must remain readable without scripts and offline. Render math as math, not code text.
- Give the first screen paper-specific orientation rather than decorative shapes or generic slogans. For before/after results, show both values on a shared scale, label the metric and unit, and keep the numerical table. Render inline formulas as part of their sentences, with following punctuation in the same inline unit; reserve separate blocks for display formulas. Bundle the math stylesheet and fonts into offline HTML, and retain accessible math semantics. Inspect the final HTML for broken Markdown markers, isolated inline formulas, overflow, and figures whose caption only points elsewhere.
- Archify is an optional renderer for compact interactive structure or workflow views. Paper-reading selects and grounds the diagrams; Archify renders and validates their typed sources. When used, embed the result inside the final HTML as a supplementary exploration view and retain the source JSON as a build input. The main reading path must explain each stage and branch in visible prose or static graphics, including the concrete learning signal or experimental result. Preserve a readable static/Markdown counterpart and links to paper evidence. The reading skill must still work without Archify. See [visual-reading](references/visual-reading.md).
- The response should let a reader answer: What is the whole paper about? How does its central mechanism work? Which experiments test which questions? What do the results actually say? What remains uncertain?
