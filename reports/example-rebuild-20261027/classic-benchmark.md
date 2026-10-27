# Classic and benchmark example reconstruction

Date: 2026-10-27. Author scope: `examples/attention-is-all-you-need-deep-read.md`, `examples/raft-deep-read.md`, and `examples/opensds-world-deep-read.md`. Starting repository HEAD: `64d9e99259fd39e41d3418c319dcbc1018193310`; the working tree was clean before this author's changes. No commit, push, personal skill installation, shared renderer, README, generated `docs/`, or original visual asset was changed by this author.

This is a source and reconstruction log, not a learning-effect score or independent reader evaluation. The new repository `SKILL.md`, visual-reading, renderer-format, learning-checks, paper-types, and reading-quality contracts were read before writing. `evals/reader-tasks.md`, its answers, and historical audits were not read.

## Source identity and coverage

| Reading | Fixed paper source | Downloaded PDF SHA-256 | Source coverage used for this reconstruction |
|---|---|---|---|
| Attention Is All You Need | [arXiv:1706.03762v7](https://arxiv.org/pdf/1706.03762v7), revised 2023-08-02, 15 pages | `bdfaa68d8984f0dc02beaca527b76f207d99b666d31d1da728ee0728182df697` | Abstract, §§1–7, Eqs. 1–3, Tables 1–4, and the attention-visualization appendix Figs. 3–5 captions/text. Original Fig. 1 and existing editorial SVG were checked as source inputs. |
| RAFT | [arXiv:2606.00147v1](https://arxiv.org/pdf/2606.00147v1), 2026-05-29, 19 pages | `152118d76720a8083be878871579c7141c862ee7a0833e8e7155f974f47aec6e` | Abstract, §§1–6, Eqs. 1–12, Tables 1–4, references relevant to CCI4.0, and appendices A–H. Existing Figs. 1–3 were inspected for labels, axes, paths, and displayed values. Additional Fig. 4–8 claims were checked against their source discussion/captions, not new experimental runs. |
| OpenDS-World | [arXiv:2610.30181v1](https://arxiv.org/pdf/2610.30181v1), arXiv record 2026-10-19; PDF cover 2026-10-20; 30 pages | `55e1f307c37dd53b0cc5ad6deef7bf3caadc4cc3d3c8f868132fe477811d8204` | Abstract, §§1–5, Tables 1–8, appendices B–E, with appendix A identified as acknowledgments. Related figure captions/discussions through Fig. 16 were read; existing original Figs. 1/2/3/5 were inspected for their actual content. Bibliography entries were not treated as independently verified external sources. |

The version-specific arXiv HTML for all three papers was also fetched for availability and section identity. Full PDFs were downloaded to `/tmp/paper-reading-classic-20261027/` and extracted with the bundled Python runtime's `pypdf`; rotated-figure text warnings were resolved for the claims used here by source captions and existing original image inspection. This was source-content checking, not formal rendered-page visual acceptance.

## Attention reconstruction

- Added a visible reader contract and three concrete goals, plus first-pass links to architecture, calculation, and evidence.
- Added a source/target teaching trace with shifted `<bos>, I, am` decoder inputs and `I, am, <eos>` targets. It explains why the mask includes the diagonal, why removing the shift leaks the target, and why parallel teacher-forced training does not imply parallel generation.
- Extended Eq. 1 into an actual value-vector output; bridged square-root scaling using the paper's independent-component variance illustration; added position-vector and complexity-ratio calculations with explicit assumptions.
- Added source/target matrix-shape distinctions, embedding scaling/weight sharing, and the contiguous-versus-dilated convolution path condition.
- Expanded the parsing transfer into input → structural generation → F1 measurement, with actual WSJ data, inference, split, and comparator conditions. Expanded the appendix into token/head selection → extracted attention weights → bounded diagnostic interpretation.
- Kept the 41.8 Table 2/abstract versus 41.0 §6.1 EN→FR conflict visible. Kept base's 38.1 counterexample, dev-versus-test and checkpoint-averaging boundaries, all previous reported key values, and both existing visual inputs. Corrected the Transformer training-cost presentation to retain the source table's spanning cost cells rather than assigning an unreported separate language-pair cost.
- Added four understanding checks including changed value vectors and an invalid cross-protocol BLEU subtraction. Optimizer detail is native-disclosed; decisive mechanism and comparator conditions remain visible.

## RAFT reconstruction and factual repairs

- Added visible reader/goals and a first-pass route. A single explicitly fictional QA sample now links filtered/fused supervision to two distinct trajectories: teacher-forced SFT and current-student rollout KL. Appendix H's tensor concatenation and trajectory-logit alignment are explained operationally; loss EMA is distinguished from a teacher-parameter EMA.
- Corrected a model-role error: PDF §3.2 specifies **Qwen3-3B as the fusion model**. Qwen3-32B is one of the **D-Acc evaluation judges** in §4.1. Appendix D does not identify its fusion-quality judges sufficiently to assume they are the same evaluation panel.
- Added numerical bridges for cosine thresholding, token cross-entropy, teacher-selected Top-K renormalization, KL `0.0564` and the `T=1.5` compensated `0.1269`, plus a counterexample showing truncated KL does not directly constrain retained mass or the full tail.
- Corrected EMA overstatement: the ratio balances smoothed scalar loss scales, not exact per-step losses or gradients. A current-loss/EMA mismatch example makes the lag visible. The publication's hyperparameters are still present.
- Added operational appendix C–D fusion scoring and appendix G retention arithmetic. Phi-4-mini's MS-Bench `31.5 → 43.2`, base `52.5`, FAPM `53.6`, and domain trade-off stay visible outside disclosures; the complete existing Avg table, ablation table, curves, original images, and parameter scan values remain available.
- Preserved **Fig. 2b SFT 14.7/58.5 versus Table 2 fused-data SFT 14.8/58.5** as an unexplained within-version discrepancy. Their proximity is not identity; the text no longer silently merges them or attributes a precise cross-figure gain to a single component. The original-data SFT `13.1/55.0` remains distinct.
- Calibrated Table 2 to isolate the complete adaptive on-policy objective, not every internal component. MMLU source prose's “within 2 percentage points” is not used as a strict bound: the same appendix gives base `52.7` and a minimum `50.3`, a `2.4`-point difference. The original `50.3–54.3` range remains.
- Added four checks, including changed EMA/current losses, Top-K mass transfer, and interpreting the Phi retention/trade-off. No new experimental observations were invented.

## OpenDS reconstruction and factual repairs

- Added visible reader/goals, a first-pass route, and the distinction between forward construction and inverse discovery by a solver.
- Expanded the actual Fig. 2 instance into a source-specific operation table: *Dimetrodon grandis* / Q86209734 → Deep Time scene 30 → smallest single-specimen trilobite → related February 2024 podcast/paper → fifth geographic block Sibumasu → Satun Geopark → official `ugg_id = ASTH01`. This reconstructs the paper's example; the live path was not independently re-executed.
- Added appendix B's access-operation taxonomy and a task-level union calculation; explained why tool identities, tool-call counts, evidence entries, and access labels are different units.
- Corrected coverage denominators: the 787 annotated entries and evidence-attribute statistics exclude the separately supplied anchor video. Fig. 5's Other formats `79/200 tasks = 39.5%` is distinct from `108/787 entries = 13.72%`. Its parenthesized bar counts are tasks, not entries.
- Added appendix C's midpoint video-frame sampling and a narrowed-window teaching calculation, then a 100-call-limit → tool-disabled finalization → answer-judge trace. The judge receives question, reference, candidate, execution status/error, rather than only two answer strings. It scores the final answer, not every edge of the agent's discovered trajectory.
- Corrected Claude Fable's name to **5.1**. Corrected Fig. 1's description to an overall accuracy bar chart rather than a difficulty curve or individual-human distribution.
- Added weighted accuracy `78/200 = 39.0%`, the invalid unweighted group mean `41.65%`, and human attempt-versus-task-solvability denominators `211/1000` versus `115/200`.
- Preserved all existing main ranking, cost, failure, tool-transition, budget, and human-calibration numbers; supporting diagnostic rows now use native disclosures. Human/model protocol differences, natural termination versus correctness, and counterexamples to simple consumption rankings remain visible.
- Replaced unsupported claims that more budget is ineffective, the question construction is inherently cheat-proof, or audio universally makes models worse. Added overlapping-category/small-denominator cautions with actual appendix measurements: audio `16/32 = 50%` for Gemini/Fable and declarative query `8/13 = 61.54%` for Astra. Added appendix E's nonmonotonic source-count/tool-call medians and failure-time-share calculation `42.57/6.34 ≈ 6.71`, explicitly limited to recorded tool-execution time.
- Added four checks including a new API access-label union and new grouped-accuracy counts. RSI remains a proposed use of the benchmark, not a reported training improvement.

## Local verification

Executed from the repository root:

```bash
node scripts/render-reading.cjs examples/attention-is-all-you-need-deep-read.md /tmp/paper-reading-classic-20261027/attention.html
node scripts/render-reading.cjs examples/raft-deep-read.md /tmp/paper-reading-classic-20261027/raft.html
node scripts/render-reading.cjs examples/opensds-world-deep-read.md /tmp/paper-reading-classic-20261027/opensds.html
python3 /tmp/paper-reading-classic-20261027/validate.py
git diff --check -- examples/attention-is-all-you-need-deep-read.md examples/raft-deep-read.md examples/opensds-world-deep-read.md
```

All three renders and the checks passed. Renderer outputs: Attention 8 sections/9 visual blocks; RAFT 6/20; OpenDS 6/12. A separate HTML-parser check found all 16/14/15 chapter/route fragment links resolve, no duplicate IDs, all 2/3/4 figure images embedded with nonempty alt text, balanced authored evidence disclosures, correct paper hashes retained, four answer disclosures per paper, no heading-terminal punctuation, no KaTeX errors, and no leftover display-math delimiters. The renderer’s offline checks found no unresolved asset dependencies in these files. The verification script independently recomputed the added attention/position, KL/temperature, retention, grouped-accuracy, failed-call-time, and frame-midpoint calculations. Results are recorded locally in `/tmp/paper-reading-classic-20261027/validation.json`.

## Explicit gaps and boundaries

- No browser UI, pointer/keyboard interaction, narrow/wide viewport, print, script-disabled browser, or formal visual acceptance was performed, per task boundary. The HTML parser and renderer checks do not establish those properties in an actual browser. No GLM Flash visual acceptance is claimed.
- No independent reader, cross-author scientific review, learning-effect measurement, model training, benchmark rerun, or live OpenDS evidence-chain replay was performed by this author. Four native answer disclosures are learning aids only.
- Attention's EN→FR 41.0/41.8 conflict remains unresolved in the fixed PDF. Appendix attention plots are diagnostic examples, not causal explanations or task-wide linguistic evaluations.
- RAFT's 14.7/14.8 SFT naming/value conflict remains unresolved. Fusion-quality judge identities/count, maximum fusion rounds, exact sentence-encoder identity, and some inference/training implementation details are not specified by the passages reconstructed here; this is a deep reading, not a claim of a complete executable reproduction recipe.
- OpenDS's arXiv/PDF-cover dates differ by one day while the byte hash fixes one source. Live intermediate web resources can drift. Actual image-context limits depend on each run configuration; defaults alone do not prove every historical run used an identical setting. Grouped evidence results overlap and are observational.
- Parent integration must rebuild `docs/` and run repository-wide checks; these generated files were deliberately not touched in this author scope.
