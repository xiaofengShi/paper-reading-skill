# Deep-read quality checks

This is the release check for a **single-paper DEEP READ**. It applies to the source paper, Markdown audit copy, and final HTML. SCAN is a different deliverable. The check is about a reader understanding the paper, not about how polished the page looks. Record `pass`, `fail`, or `unknown` for each gate with a concrete paper or output location. `Unknown` means the evidence needed to judge is unavailable; it is not a softer pass.

## Gates before delivery

| Gate | Pass condition | Failure that blocks a complete deep read |
|---|---|---|
| Source identity and coverage | Title, version, and central sections are known; methods, decisive results or proofs, captions, and relevant appendices were accessible. | Wrong paper, mixed versions without explanation, or only an abstract/partial extraction while claiming a full read. |
| Scientific fidelity | Central mechanisms, equations, figure identities, denominators, numbers, and conditions agree with the source. Worked examples and redraws are labeled. | An invented step, changed objective, wrong figure, unsupported number, or an unresolved source conflict presented as settled. |
| Claim to evidence | Each major conclusion can be followed through a source observation or proof to a bounded interpretation. Whole-system results are not used as isolated component effects. | A headline conclusion has no supporting test/proof, omits a decisive comparator or condition, or states an inference as the authors' result. |
| Reader completeness | The HTML itself explains the problem, design reason, main mechanism, important formula or proof, and decisive evidence at usable detail. | Essential explanation is replaced by a page number, thumbnail, module list, or decorative diagram that sends the reader back to the PDF. |
| Delivery integrity | One offline HTML opens with working figures, math, real chapter links, correct language, and readable narrow-screen access; Markdown audit source retains provenance. | Broken image or math, false navigation, missing caption context, wrong output language, or content available only in a separate artifact. |

If source coverage is insufficient, request the missing paper material or produce a clearly labeled SCAN only when that matches the user's request. A gate that fails in the generated document requires repair and another check. Do not replace source checking with a confident-sounding summary.

## Depth ratings after the gates

Rate each dimension `0` (absent), `1` (named), `2` (explained), or `3` (a reader can reconstruct and use it). Give the passage or figure that earned the rating. The ratings locate revisions; their sum is not a scientific validity score.

| Dimension | What earns a 3 |
|---|---|
| Whole-paper orientation | The reader can state the problem, contribution, and how the major parts connect without mistaking the reading order for the paper's process. |
| Author's design reasoning | For central choices, the reader can say which constraint motivated the choice, how it is expected to help, and what trade-off or assumption remains. Explicit author rationale and editorial inference are distinguishable. |
| Mechanism or proof | Inputs, transformations, variables, and output are clear enough to work one small example or trace one proof dependency. |
| Evidence interpretation | A major claim is linked to the actual task/protocol, comparator, metric or theorem, observation, and justified scope. |
| Independent readability | Original figures and diagrams have visible reading cues; the reader can answer key questions using the HTML alone, including on a narrow screen. |

For a theory paper, use proof validity and assumptions where a technical report uses experiments. For a survey, use taxonomy evidence and coverage. Do not manufacture experiments, formulas, figures, or alternatives to fill a template.

## Reader check

Give someone who did not write the atlas only its final HTML and the paper-specific questions in [reader-tasks.md](reader-tasks.md). Record the answer, whether the reader reopened the PDF, what they misunderstood, and where they had to backtrack. The supplied answer keys are based on the published examples and are not a substitute for source verification. An author checking their own page or an automated build passing the gates cannot be described as an independent reader study.

This rubric adapts the idea of explicit hard gates and separately judged depth from [DeepPaperNote's public quality rubric](https://github.com/917Dhj/DeepPaperNote/blob/main/evals/note-quality-rubric.md) to this project's single-file visual reading goal. The design-reasoning dimension responds to [PaperForge's author-reasoning emphasis](https://github.com/FeijiangHan/PaperForge); the claim-to-evidence gate responds to [sodalone/paper-reading-skill's traceability practice](https://github.com/sodalone/paper-reading-skill). The criteria and deliverable here are specific to this project.
