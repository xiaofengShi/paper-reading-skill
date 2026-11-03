# Brief and Deep Reading quality checks

This is the release check for a single-paper **Brief Reading or Deep Reading**. It applies to the source paper and delivered explanation; HTML-specific checks apply when HTML is the requested/default format. Both modes share the scientific-fidelity and delivery gates; their explanation depth differs. The check is about a reader understanding the paper, not about how polished the page looks. Record the selected mode, then `pass`, `fail`, or `unknown` for each gate with a concrete paper or output location. `Unknown` means the evidence needed to judge is unavailable; it is not a softer pass.

## Gates before delivery

| Gate | Pass condition | Failure that blocks the selected reading |
|---|---|---|
| Source identity and coverage | Title, version, and central sections are known; methods, decisive results or proofs, captions, and relevant appendices were accessible. | Wrong paper, mixed versions without explanation, or only an abstract/partial extraction while claiming a full read. |
| Scientific fidelity | Central mechanisms, equations, figure identities, denominators, numbers, and conditions agree with the source. Worked examples and redraws are labeled. | An invented step, changed objective, wrong figure, unsupported number, or an unresolved source conflict presented as settled. |
| Claim to evidence | Each major conclusion can be followed through a source observation or proof to a bounded interpretation. Whole-system results are not used as isolated component effects. | A headline conclusion has no supporting test/proof, omits a decisive comparator or condition, or states an inference as the authors' result. |
| Reader completeness | The HTML itself explains the problem, design reason, main mechanism, important formula or proof, and decisive evidence at usable detail for its stated reader. Prerequisite bridges match the stated background; consequential appendix extensions explain the operation. | Essential explanation is replaced by a page number, thumbnail, unexplained technical vocabulary, module list, or decorative diagram that sends the reader back to the PDF. |
| Visual choice and interaction (where used) | Views clarify a substantive relationship; essential graphics have a text/table counterpart. Controls, if used, reveal a meaningful change and work offline with pointer and keyboard; core content remains readable without scripts. | A necessary relationship is unclear, a figure lacks explanatory context, controls fail, or essential facts are available only through interaction. Static presentation and unavailable optional tools are not failures by themselves. |
| Delivery integrity | The requested format works. Default HTML has embedded assets, working math/links, correct language and narrow-screen access; its Markdown audit source retains provenance. | Broken image or math, false navigation, missing caption context, wrong output language, or core explanation available only in a separate artifact, or unverified output claimed as checked. |
| Mode honesty | The declared mode agrees with requested depth and, for HTML, its visible label. Gallery metadata agrees with the source. | A requested Deep silently becomes Brief, or existing Brief content is relabeled Deep without reconstruction. |
| Deep coverage (Deep only) | The audit source maps all substantive main sections and relevant appendices, core mechanisms, central math/proofs, and major experiment families to concrete explanations; secondary omissions are justified. | Missing coverage record, unresolved core omission, or an important ablation, negative result, proof, or appendix contribution reduced to a name and source pointer. |

If source coverage is insufficient, obtain the missing paper material or report the precise gap. A limited overview may be delivered as Brief only when it matches the user's request; retain the incomplete status of a requested Deep. A gate that fails in the generated document requires repair and another check. Do not replace source checking with a confident-sounding summary.

## Audience and independent reading

Apply [reader calibration and walkthrough](../references/learner-experience.md#reader-calibration-and-walkthrough): default to a researcher new to this paper, inspect essential reasoning and remove redundant background. For tutorials check every chapter and the recommended route, including examples and instructions. Essential gaps for that audience fail reader completeness; omission of already-assumed foundations does not. Record substantive repairs or remaining gaps compactly; no term-by-term ledger is required.

Apply [independent delivery](../references/standalone-delivery.md): the core explanation must work without reopening the PDF or chat. Bibliographic entries belong in a final Sources section; verify body citation anchors. Keep necessary attribution, assumptions and evidence limits beside the affected claims.

When sharing is requested and authorized, verify the real hosted revision, links and any runnable downloads. Check that the public file list excludes private material and local-only dependencies. Distinguish a prepared package, repository blob and live reading URL.

## Depth ratings after the gates

Rate each dimension `0` (absent), `1` (named), `2` (explained), or `3` (a reader can reconstruct and use it). Give the passage or figure that earned the rating. The ratings locate revisions; their sum is not a scientific validity score.

- **Brief Reading:** every applicable dimension must reach at least **2** for the selected main argument. A list of modules or scores does not count as explanation.
- **Deep Reading:** every applicable dimension must reach **3**, and Deep coverage must pass. For dimensions with multiple central components, check each component; one detailed example cannot compensate for unexplained core operations or experiment families. Scores of 0–2 require revision before delivery as a completed Deep.
- Mark a dimension inapplicable only with a paper-specific reason. Adapt mechanism/proof and evidence to the paper type; do not omit a difficult dimension by calling it inapplicable. A renderer cannot assess these semantic thresholds.

| Dimension | What earns a 3 |
|---|---|
| Whole-paper orientation | The reader can state the problem, contribution, and how the major parts connect without mistaking the reading order for the paper's process. |
| Author's design reasoning | For central choices, the reader can say which constraint motivated the choice, how it is expected to help, and what trade-off or assumption remains. Explicit author rationale and editorial inference are distinguishable. |
| Mechanism or proof | Inputs, transformations, variables, and output are clear enough to work one small example or trace one proof dependency. |
| Evidence interpretation | A major claim is linked to the actual task/protocol, comparator, metric or theorem, observation, and justified scope. |
| Independent readability | Original figures and diagrams have visible reading cues; the reader can answer key questions using the HTML alone, including on a narrow screen. |

For a theory paper, use proof validity and assumptions where a technical report uses experiments. For a survey, use taxonomy evidence and coverage. Do not manufacture experiments, formulas, figures, or alternatives to fill a template.

## Optional independent reader check

When a reader evaluation is requested and a participant is available, give someone who did not write the atlas only its final HTML and the paper-specific questions in [reader-tasks.md](reader-tasks.md). Record the answer, whether the reader reopened the PDF, what they misunderstood, and where they had to backtrack. The supplied answer keys are based on the published examples and are not a substitute for source verification. An author checking their own page or an automated build passing the gates cannot be described as an independent reader study.

The ratings are editorial judgments, not observed learning outcomes.

This rubric adapts the idea of explicit hard gates and separately judged depth from [DeepPaperNote's public quality rubric](https://github.com/917Dhj/DeepPaperNote/blob/main/evals/note-quality-rubric.md) to this project's single-file visual reading goal. The design-reasoning dimension responds to [PaperForge's author-reasoning emphasis](https://github.com/FeijiangHan/PaperForge); the claim-to-evidence gate responds to [sodalone/paper-reading-skill's traceability practice](https://github.com/sodalone/paper-reading-skill). The criteria and deliverable here are specific to this project.
