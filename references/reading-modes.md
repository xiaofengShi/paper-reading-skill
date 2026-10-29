# Brief Reading and Deep Reading

There are two reading-depth modes. Both explain the paper on its own terms, preserve source discipline, and default to one offline HTML with a Markdown audit source. REVIEW and RESEARCH are optional lenses applied to the chosen depth.

## Select a mode

| Request | Mode | Reader-facing result |
|---|---|---|
| “Read this paper”, “读这篇论文”, “brief reading”, “make a mind map” | **BRIEF READING (default)** | A focused atlas of the problem, main path, key mechanisms and equations, decisive evidence, and limits, at the existing gallery's level of detail |
| “Quick overview”, “scan”, “worth reading?” | BRIEF READING, with the requested shorter scope | An orientation and principal result; identify any limited source access |
| “Deep reading”, “deep read”, “read deeply”, “深读”, “深入阅读”, “仔细读”, “仔细阅读”, comprehensive technical reconstruction | **DEEP READING** | A full reconstruction using the [Deep Reading protocol](deep-reading.md): mechanisms, derivations, experiments, and relevant appendices |
| “Brief reading + review / compare with my work” | BRIEF + requested lens | The focused explanation plus the requested evidence audit or comparison |
| “Deep reading + review / reproduce / next experiments” | DEEP + requested lens | The full reconstruction plus the requested audit, reproduction detail, or research card |

Follow an explicit mode even when another part of the request adds a lens. Without a depth cue, use Brief and explain the evidence needed for any requested critique or comparison. A small worked example alone does not require Deep. Do not invent a research project or relevance threshold, or ask a routine depth questionnaire. A request to read a paper is enough to begin.

## What changes with depth

| Aspect | Brief Reading | Deep Reading |
|---|---|---|
| Purpose | Understand the main argument and decisive evidence | Reconstruct, work through, and explain the technical argument |
| Source reading | Check the available full paper and details needed for selected claims | Read all substantive main sections and relevant appendices; keep a source-to-explanation coverage record |
| Mechanism | Explain the main path and selected key operations | Rebuild every core operation from input to output, including state, dimensions, dependencies, design reasons, and costs where relevant |
| Math or proof | Full key equation and variable meanings; useful example | Motivation, assumptions, intermediate steps, worked calculation or proof trace, and boundary behavior for each central mathematical component |
| Evidence | Main comparisons with setup, controls, metrics, results, and limits | Interpret every major experiment family, ablation, sensitivity analysis, and consequential negative result; explain comparable rows and decisive conditions |
| Appendices | Bring in details necessary for the selected explanation | Integrate definitions, proofs, protocols, and extensions that affect the central argument; justify omitted secondary material in the audit source |
| Presentation | The existing compact visual atlas | Expanded connected chapters, with diagrams and tables supporting the technical prose |
| Depth threshold | At least 2 in every applicable quality dimension | 3 in every applicable dimension, plus complete core coverage |

These are semantic requirements, not word-count or chapter-count targets. Let length grow with the paper's complexity. More diagrams, a longer abstract, repeated conclusions, or a mode label cannot establish depth.

## Read, explain, and check

1. Identify the exact source and access gaps. An abstract-only source cannot support a completed full-paper atlas in either mode.
2. Orient from the question, central figures, and main results, then read and verify the method, evidence, and needed appendices before drafting.
3. In Brief, choose the details that explain the main argument. In Deep, map all substantive components to their explanations and complete the reconstruction protocol.
4. Apply the shared quality gates and selected mode's depth threshold. Repair missing explanations; do not silently downgrade a requested Deep.
5. Declare `<!-- paper-reading-mode: brief -->` or `<!-- paper-reading-mode: deep -->` beside the source's language/theme markers. The HTML displays the corresponding mode. An optional `--mode brief|deep` initializer prepares an unfinished task in that mode; it does not generate a paper reading.

The existing published readings are Brief Reading examples under this distinction. Their legacy `-deep-read` filenames and URLs remain stable. Deep mode is a generation contract; its presence does not certify that an existing example meets it.
