# Visual reading contract

## Choose the view by question

| Reader question | Useful view | Detail beneath it |
|---|---|---|
| What is this paper's story? | Labeled concept map / argument graph | Problem, setting, proposed idea, contributions, evidence locations |
| What happens, and in what order? | Workflow or data flow | Inputs, stages, branches, feedback, training vs inference |
| Why should it work? | Mechanism zoom or proof dependency | Definitions, objective/formula, assumptions, one worked example |
| What was tested? | Experiment atlas / comparison matrix | Question → setup/control → metric → result → interpretation |
| What did we learn? | Claim–evidence links / synthesis map | Scope and qualifiers next to the corresponding conclusion |

A view should answer one named question. Prefer 6–12 primary nodes, readable labels, explicit relation verbs, and a main reading path. Use multiple linked views for a complex paper. Each node/edge that conveys a paper fact needs a source pointer (page, figure, table, or section) in the audit source and optional HTML provenance layer; page numbers stay hidden during normal reading. Put the meaning of consequential arrows, mechanisms, measured values, comparison conditions, and conclusions in adjacent visible text, figure annotations, or a node card. Provide a short “how to read this” caption and a text/table counterpart for every important graphic. A reader should understand the important claim without opening the PDF; optional source locations let them verify it. Never invent relationships to make a layout look complete.

When a document has both a chronology and an explanatory reading route, distinguish them during planning, then draw only the process the reader needs to understand. Make each arrow's meaning clear from its labels and neighboring explanation. Do not turn editorial route decisions into a reader-facing comparison table unless the user asks. Put cross-cutting infrastructure beside the phase it supports rather than implying that it is a later training phase. Label every quantitative redraw as the document author's redraw, identify the original paper figure and panel, and keep an original excerpt nearby when the original curve or layout carries information the redraw omits.

## Archify integration

Archify's typed JSON and self-contained HTML are useful for compact, explorable workflows, component relationships, data flow, sequences, and lifecycles. Choose its diagram type by the actual paper content. Keep one central path per Archify artifact. Use authored links/views for paper locations when supported; otherwise cite the sources in the adjacent Markdown. If Archify is available, retain the source JSON and validate the rendered view using its documented commands. The reading skill and this repository's build must still work from their own files when Archify or other local skills are absent. Embed any pre-rendered Archify result in the one final reading HTML as a supplementary view after the main annotated explanation; do not make interaction, a list of page numbers, or the standalone viewer the only path to understanding. Its renderer's validations check diagram structure and layout, **not** whether scientific claims or citations are true; cross-check those against the paper separately.

For concept maps, proof graphs, experiment matrices, and numerical comparisons, use inline SVG, HTML charts/tables, or another suitable renderer when they communicate better. Prefer readable original paper figures as nearby evidence when they clarify a mechanism or result; explain their axes, comparison, and takeaway in the document rather than inserting a thumbnail and sending the reader back to the PDF. Include the complete key rows of an experiment when a selective chart would hide its scope. Do not make Archify a required dependency. The final document should open offline as one file, retain its core explanations and graphics without scripts, render formulas as math, and work on narrow screens and in print. Exported images alone are insufficient for a deep read.

Use visual space for information. A global diagram should carry the paper's actual problem and relationships. A comparison chart should share a scale, directly show the values and their change, and retain an accessible data table. An interactive diagram may add exploration, but its key relationships and consequences belong in the visible page. Keep inline equations in prose and use display math for multi-line derivations; verify the generated page contains no raw Markdown emphasis or math delimiters.

## Final reading checks

- A reader can start at the whole-paper map and follow a clear route to method and experiments.
- Every consequential arrow is explained; the diagram and prose agree.
- Reported metrics include task, metric, direction, unit, baseline/comparator, and evaluation setting. Comparisons across different protocols are not merged.
- The original figure/table remains findable. Record source version and source conflicts.
- Distinguish author intent, measured observation, and your inference. State uncertainty near the affected claim.
