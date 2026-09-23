# Visual reading contract

## Choose the view by question

| Reader question | Useful view | Detail beneath it |
|---|---|---|
| What is this paper's story? | Labeled concept map / argument graph | Problem, setting, proposed idea, contributions, evidence locations |
| What happens, and in what order? | Workflow or data flow | Inputs, stages, branches, feedback, training vs inference |
| Why should it work? | Mechanism zoom or proof dependency | Definitions, objective/formula, assumptions, one worked example |
| What was tested? | Experiment atlas / comparison matrix | Question → setup/control → metric → result → interpretation |
| What did we learn? | Claim–evidence links / synthesis map | Scope and qualifiers next to the corresponding conclusion |

A view should answer one named question. Prefer 6–12 primary nodes, readable labels, explicit relation verbs, and a main reading path. Use multiple linked views for a complex paper. Each node/edge that conveys a paper fact needs a local source pointer (page, figure, table, or section); details can live in adjacent text or a node card rather than on an edge. Provide a short “how to read this” caption and a text/table counterpart for every important graphic. Never invent relationships to make a layout look complete.

## Archify integration

Archify's typed JSON and self-contained HTML are useful for compact, explorable workflows, component relationships, data flow, sequences, and lifecycles. Choose its diagram type by the actual paper content. Keep one central path per Archify artifact and put long explanations in its detail cards or the reading document. Use authored links/views for paper locations when supported; otherwise cite the sources in the adjacent Markdown. Retain the source JSON and validate the rendered view using Archify's documented commands. Embed that view into the one final reading HTML; do not hand the reader a set of disconnected diagram pages. Its renderer's validations check diagram structure and layout, **not** whether scientific claims or citations are true; cross-check those against the paper separately.

For concept maps, proof graphs, experiment matrices, and numerical comparisons, use inline SVG, HTML charts/tables, or another suitable renderer when they communicate better. Prefer original paper figures as nearby evidence when they clarify a mechanism or result; label each excerpt with its PDF page and figure number. Do not make Archify a required dependency. The final document should open offline as one file, retain its core explanations and graphics without scripts, render formulas as math, and work on narrow screens and in print. Exported images alone are insufficient for a deep read.

## Final reading checks

- A reader can start at the whole-paper map and follow a clear route to method and experiments.
- Every consequential arrow is explained; the diagram and prose agree.
- Reported metrics include task, metric, direction, unit, baseline/comparator, and evaluation setting. Comparisons across different protocols are not merged.
- The original figure/table remains findable. Record source version and source conflicts.
- Distinguish author intent, measured observation, and your inference. State uncertainty near the affected claim.
