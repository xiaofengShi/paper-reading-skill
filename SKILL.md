---
name: paper-reading
description: >-
  Read an academic paper deeply and turn it into a source-linked visual reading atlas: a global concept map, method or argument flow, mechanism explanations, experiment map, and synthesis. Use for PDF, arXiv, URL, or local papers when the user asks to read, understand, explain, visualize, compare, review, or build on a paper. Ordinary “read this paper” requests use a complete understanding-first read; reviewer critique and research planning are optional lenses.
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

Produce these layers in this reader-facing order, adapting diagram type to the paper:

1. **Global map:** research problem, setting, prior limitation, main idea, contributions, and where evidence enters. Give a short orientation paragraph and a labeled concept map.
2. **Main path:** method, training/inference pipeline, proof dependency, dataset construction, or benchmark protocol. Show inputs, transformations, decisions, outputs, and feedback loops. Explain each non-obvious arrow.
3. **Mechanism zoom:** unpack the few operations essential to understanding the contribution: definitions, formulas, objective, algorithm, data movement, assumptions, and a small concrete example when useful. Distinguish the author's explanation from your interpretation.
4. **Experiment atlas:** map each major question to its setup, baseline/control, metric, result, and conclusion. Preserve the actual denominator, unit, evaluation setting, and source figure/table. Explain what the reader should notice before discussing limitations.
5. **Synthesis:** reconnect the mechanism and evidence; state what the paper establishes, its scope, open questions, and useful follow-up paths. Keep limitations next to the conclusion they qualify. Add a brief card or reviewer audit only if the chosen lens needs it.

For every diagram, use [visual-reading](references/visual-reading.md): one question per view, labeled relationships, selective detail, and source anchors. A diagram is a navigation layer, not a replacement for explanations, equations, tables, or the original figures. Do not flatten the paper into one giant graph or force a method flow onto a theory or survey paper.

## Evidence and rendering contract

- Tie important facts, nodes, arrows, formulas, and numbers to exact PDF page/section/figure/table/appendix references. In a PDF, verify captions and table cells visually when extraction is uncertain. Record source version and conflicting numbers instead of silently resolving them.
- Mark **paper statement**, **observed result**, and **reader inference** distinctly. End-to-end comparisons describe system results; controlled ablations can isolate a mechanism. Do not automatically make claim auditing the reader's objective.
- Use a readable Markdown source as the portable audit copy. If producing HTML, derive its substantive content from the same source or structured data; keep figures, numbers, equations, and qualifiers aligned. Important content must remain readable without scripts and offline. Render math as math, not code text.
- Archify is an optional renderer for a compact interactive structure or workflow view. If available, follow its own skill/CLI for typed JSON, validation, and delivery. Preserve a readable static/Markdown counterpart and links to paper evidence. The reading skill must still work without Archify. See [visual-reading](references/visual-reading.md).
- The response should let a reader answer: What is the whole paper about? How does its central mechanism work? Which experiments test which questions? What do the results actually say? What remains uncertain?
