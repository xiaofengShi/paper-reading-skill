# Updated Skill forward trial audit

Status: **deliverables generated; first renderer invocation succeeded; scientific content author-checked; independent visual acceptance and literal offline opening unknown**.

This was an actual forward use of the working-tree Skill for the supplied ResNet request, not a renderer fixture, a paper-experiment reproduction, or a comprehension study. Only `/tmp/paper-reading-updated-forward/` received task files. The Skill repository and its shared `node_modules` were not modified by this agent. No commit or push was created.

## Task and outputs

The task was to explain **Deep Residual Learning for Image Recognition, arXiv:1512.03385v1, in English**, for someone who knows basic neural networks but needs to understand why residual learning helps and what the experiments establish. The request required the full paper, one offline HTML reading, a Markdown audit source, paper-specific checks, and separation of optimization, generalization, and later interpretations.

- `reading.html`: final single-file English reading, 805,754 bytes, 9 h2 sections, 10 renderer-reported visuals, 39 browser-observed KaTeX instances, 5 original PDF excerpts, 4 native answer disclosures.
- `reading.md`: English audit source, 33,828 bytes. Essential arguments, assumptions, equations, figures, numerical tables, protocol boundaries, and checks appear in both formats.
- `1512.03385v1.pdf`: pinned 12-page source, 819,383 bytes.
- `paper-full.txt`: full extracted PDF text. All pages were separately read using unsorted extraction as well; sorted two-column text alone was not trusted.
- `assets/`: original Fig. 2, 4, 5, 6, and 7 crops. `figure-crops.json` records PDF pages, point coordinates, clipped text, and hashes.
- `pdf-metadata.json`, `skill-source-hashes.json`, `renderer-attempt-1.json`, `renderer-attempt-2.json`, `static-checks.json`, `browser-observations.json`, `execution-log.md`, and `run-summary.json`: reproducibility and verification evidence.

Exact runtime model ID: **unknown**. The environment's generic GPT-6 assistant description does not expose a verifiable exact model identifier. No model-specific performance claim is made.

## Source identity and coverage

Primary URL: `https://arxiv.org/pdf/1512.03385v1`.

SHA-256: `1e0651b6810ecba34a3dbc5b5b0209226f889004607c1f203540a48d64e5a93a`.

Read all 12 pages: abstract, introduction, related work, residual method, implementation and architectures, ImageNet classification, CIFAR-10 and response analysis, object detection transfer, bibliography, Appendix A detection baseline, Appendix B improvements and competition details, and Appendix C localization. Original plots and relevant captions were inspected, with five figure crops embedded in the reading. Tables were transcribed from the PDF text/rows and cross-checked with adjacent discussion; no curves were digitized.

The primary source is the specified **10 December 2015 v1**, not the latest arXiv version or a later ResNet implementation. The only external historical context was the abstract of He et al., **Identity Mappings in Deep Residual Networks, arXiv:1603.05027v1, 16 March 2016**, opened through the web tool to distinguish the later propagation/pre-activation work. Its full paper and experimental claims were not audited or mixed with the 2015 results.

## Skill identity and live-source drift

Repository HEAD observed at startup: `dc23208687116f6296c08f59f1fcd2ad6f80b6f4`. The working tree was already extensively dirty and was being updated concurrently. This trial therefore does **not** identify HEAD alone as the exercised package.

| File | Initial read/check SHA-256 | Snapshot before renderer attempt 1 |
|---|---|---|
| `SKILL.md` | `15addc68e4f443c1d75401b8cfbb1723fec19fdb13630c994553571c8fcb1ace` | `cbcca3650eeba68e0d3a6253c2408412047b5ba9a743e3575c108bfff4454258` |
| `scripts/render-reading.cjs` | `52f6c0860a96fe23584c09d1d1658117d92705f2dad50fc1404f8134bc759dac` | `0af0805193eaa53feb9bfac7ce6c7a8da09078c72412d3717617c16e3dac199c` |
| `references/renderer-format.md` | `fadf43c3f14d33c381bab625ec68cbb2deb15e5dea1624721953f8d9921a84e5` | Same |

The current Skill was re-read after noticing the drift. Its frontmatter changed from `compatibility` to `metadata.requirements`; the reading workflow still matched the initially read instructions. `skill-source-hashes.json` records the renderer-time SHA-256 values of all referenced reading instructions plus renderer/library/assets/package inputs. This is a live working-tree trial, not a frozen-package comparison; use an immutable copy for a repeatable future comparison.

Read instruction material: root/project README and applicable AGENTS; `SKILL.md`; linked `renderer-format`, `paper-types`, `learning-checks`, `visual-reading`, and `figure-extraction` references. No existing example file, evaluation answer key, or other agent report was opened. The separate `evals/reading-quality.md` file was not consulted under this trial's references-only restriction; this audit does not claim its formal adjudication was performed. Source fidelity and delivery checks below apply the Skill's visible instructions and linked references. No other Skill was invoked under the isolated forward-trial scope.

## Timing and renderer evidence

The observed timing window starts with the first tool clock at **2026-10-26 16:59:51 UTC** (27 October, 00:59:51 Asia/Shanghai). It excludes parent-agent preparation, prior package work, any installation performed before this run, and the user time required to read the result. It includes source access, scientific reading, authoring, image extraction, tool friction, self-review, browser checks, and logging; it is not a CPU benchmark or a measure of human reading time. `run-summary.json` records the final audit timestamp and resulting wall window.

All 12 pages had been read before the figure-extraction completion timestamp **17:02:57.799869 UTC**; that is an upper-bound milestone, not a separately instrumented reading duration.

**First renderer invocation:** 17:07:40.418889 → 17:07:40.727623 UTC, **0.308706291 s**, exit code 0, no stderr. It generated 805,729 bytes, 9 sections, 10 visuals. Time from the first observed tool clock to this first HTML was about **7 min 49.7 s**. The command and raw stdout/stderr are preserved in `renderer-attempt-1.json`.

**Second invocation:** 17:11:58.197269 → 17:11:58.352912 UTC, **0.155663041 s**, exit code 0, no stderr. This followed one editorial wording correction: replaced an instruction to “read the arrows” with an explicit argument relation because the renderer's map is a card/list view. The first render had already succeeded; the rerender was not recovery from a renderer error. Final output is 805,754 bytes. See `renderer-attempt-2.json`.

Node.js was v26.12.0. PyMuPDF 1.26.5 was already available under the system Python 3.9. Existing renderer dependencies were used read-only; no npm install, npm ci, shared dependency edit, doctor, or repository test suite was run. Those would not verify the scientific reading.

## Scientific author self-review

The following were checked against the source and retained explicitly:

- The degradation diagnosis uses **training** error, rather than treating worse held-out accuracy alone as optimization evidence.
- The paper's residual equation is presented with the **after-addition ReLU**. Zero residual is identity only on nonnegative inputs after this gate; learned negative corrections remain possible before addition.
- Residual targets are explanatory notation, not separately supervised labels. Training and inference share the forward blocks; only training adds loss/backpropagation/SGD updates.
- The Jacobian identity-plus-branch explanation is labeled editorial derivation, includes the ReLU gate, and makes no guaranteed non-vanishing-gradient claim. The authors' BN/healthy-gradient argument and open slow-convergence conjecture remain visible.
- Table 2 retains all four numbers and derives −3.51 points for the same-depth 34-layer comparison. Fig. 4's center-crop curves are not merged with Table 2's 10-crop validation.
- Table 3 includes all its architecture rows, shortcut A/B/C distinctions, and the bottleneck change. “More depth” is not treated as the only change between 34 and 50 layers.
- Single-model 10-crop 5.71%, multi-scale validation 4.49%, and six-model test ensemble 3.57% are separate protocols. No unmatched difference is reported as an isolated causal gain.
- The entire ResNet part of CIFAR Table 6 is present, including 110-layer best 6.43%, five-run mean 6.61 ± 0.16%, and 1202-layer 7.93%. The 1202-layer training error below 0.1% is fitting evidence; overfitting is the authors' explanation, not a regularization ablation proved here.
- Detection mAP is distinguished from image-classification error, COCO's +6.0-point/+28.3%-relative result retains its baseline, and backbone replacement is not an identity-shortcut-only ablation. Detector improvements, trainval/test-dev, ensembling, and oracle-class versus predicted-class localization remain separate.
- The segmentation competition announcement is not expanded into an invented mask method or experiment.
- Four checks require mechanism application, optimization evidence interpretation, fitting/generalization separation, and historical/protocol separation. Native disclosures reveal answers; no comprehension badge is assigned.

No independent expert or human reader reviewed these conclusions. Scientific correctness beyond author self-review remains **unknown**, not certified by the renderer. No experiments from either paper were run, and there is no new statistical evidence or superiority claim.

## Delivery checks and boundaries

Static checks on the final HTML found one h1, 9 h2 sections, 5 embedded figures with alt text, 4 native details disclosures, **zero script elements**, no broken local fragments, no external asset attributes, and no external CSS URLs. The CSP includes `connect-src 'none'`. Primary numeric tokens are present in both Markdown and HTML, and important differences were recomputed. See `static-checks.json`; checking token presence supplements rather than replaces manual transcription review.

The actual page was served from a temporary localhost-only server and opened in the in-app browser. At a 1280px viewport, page width was 1265px. At a 390px viewport, page/body width was 375px with sources hidden and with sources revealed, including the full hash. All five figures loaded in the initial rendered artifact after visiting their chapters. The final file's browser DOM showed 39 KaTeX instances, zero scripts, no visible raw dollar delimiters, and no captured console warnings/errors. Long original figures use contained horizontal scrolling on narrow screens. No formal visual quality conclusion is drawn from the screenshots.

The source label could be clicked and its checkbox toggled using keyboard Space; all four answer summaries were expanded with Enter. Chapter links changed the fragment to the intended section and static target IDs exist. Rapid observations during navigation/resizing did not establish precise final scroll alignment; smooth scrolling and/or lazy-image layout changes are plausible contributors, so exact anchor-position acceptance is **unknown**.

**Direct `file://` opening was rejected by the browser security policy**, which permits only HTTP/HTTPS in this surface. No workaround was attempted. Literal direct-file opening and physically disconnected/offline browsing are **unknown**. Embedded-assets/CSP/no-script structure and localhost native interactions provide supporting evidence, not a claim that those unavailable checks occurred.

Formal image/visual acceptance using the workspace's specified **GLM-5.3-Flash** reviewer is **unknown**: that model was not available among this run's tool-supported choices. The author inspected original paper figures for source reading but does not describe that as an independent visual review.

The temporary viewport override was reset, all further browser operations were stopped at the parent's request to avoid shared-browser conflicts, and the agent-owned localhost server was stopped with Ctrl-C (exit 130). No unrelated process was terminated.

## Observed friction

1. `pdftotext` was absent; its `command -v` check ended the initial chained discovery command. Switched to preinstalled PyMuPDF, with no environment installation.
2. Sorted two-column text interleaved prose and plots. Re-read each page using ordinary extraction and inspected original images/captions. The generated full text is not claimed as perfect reading order.
3. The first Fig. 2 crop cut the lower ReLU label and the Fig. 4 crop retained a tiny neighboring caption fragment. Crop coordinates were corrected before first render; crop verification prevented those errors reaching the delivered HTML.
4. The working tree changed during the trial. Recorded both initial and renderer-time hashes and re-read current SKILL instead of calling this an immutable-version run.
5. The subagent cannot create a visible IAB tab; a background tab worked. Direct checkbox `check()` and native input click did not change state; clicking its visible label worked, as did keyboard Space. A button-role locator did not match native summary controls; a DOM-confirmed `details > summary` locator supported native Enter successfully. These are observed tool/control friction, not automatically classified as renderer bugs.
6. Rapid chapter-link observations did not settle the scroll-position question; no precise anchor-alignment pass is claimed.
7. Browser policy prevented literal `file://` verification. Formal visual review, independent comprehension, printing, and physically disconnected browsing remain unavailable/unperformed.

The actual explanation and requested two formats are delivered; the unperformed acceptance checks are retained as explicit limits, not silently converted to passes.
