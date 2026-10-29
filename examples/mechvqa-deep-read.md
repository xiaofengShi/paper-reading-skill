<!-- paper-reading-lang: en -->
<!-- paper-reading-theme: cobalt -->
<!-- paper-reading-mode: brief -->
# MechVQA: a mechanical-drawing benchmark, and the 4B model that tops it

> **Reading orientation.** General multimodal LLMs fail on mechanical engineering drawings in ways that go beyond recognition: dense annotations hide decisive cues, projection rules demand cross-view correspondence, and drafting standards require domain knowledge. This paper contributes both a yardstick and a climber: MechVQA, a 20,778-pair benchmark built under multi-stage quality gates, and MechVL, a 4B domain-specialized model whose SFT→DAPO training ladder reaches a Total score of 84.85, above every open- and closed-source baseline tested. Original paper: Qian Kou, Xiaofeng Shi (equal contribution, co-corresponding), Yulin Li, Xiaosong Qiu, Xinyang Wang, Hua Zhou, Cao Dongxing, *MechVQA: Benchmarking and Enhancing Multimodal LLMs on Comprehensive Mechanical Drawing Understanding* (ICML 2026). <span class="source-ref">This reading uses <a href="https://arxiv.org/abs/2605.30794v2">arXiv:2605.30794v2</a> (7 July 2026), <a href="https://arxiv.org/pdf/2605.30794v2">PDF</a> SHA-256 <code>07283abb933491a14f347321d7935188ceafd4b686ba9c088ad72d2cc5d4f129</code>, 28 pages: main text §§1–6 plus appendices A–C; Figs. 1–18; Tables 1–7.</span>

**First reading path.** Start with the three drawing capabilities in §01, then follow one sheet through the quality gates in §02. In §03, work the small aggregation and judging examples before reading any ranking. In §04, turn one answer into a reward and one reward group into a policy update. In §05, keep the stage ladder and its counterexamples visible; expand full tables only when checking a claim. Finish by changing the drawing, reward group, or evaluation protocol in the understanding checks.

## 01 / The whole paper at a glance

**One-sentence thread:** the authors argue that mechanical drawing understanding fails at three distinct levels — reading dense annotations, reasoning under projection rules, and judging against drafting standards — so they build a benchmark that measures all three levels separately, then show that a small model with domain-targeted post-training can beat much larger general MLLMs on it. (PDF §§1–2, 5)

The problem is not optical character recognition. A mechanical drawing encodes semantics in a compact graphical language: orthographic multi-view projections, dense dimensioning, section views, symbolic notations, and structured text. The paper's diagnosis (PDF §1) names three compounding factors: **high annotation density** (decisive cues are easy to miss), **weak domain priors** (datums, geometric tolerances, roughness conventions), and **unreliable spatial reasoning under projection rules** (the same feature must be tracked across views). Existing adjacent benchmarks cover only slices of this space — rulebook QA, blueprint symbols, AEC floor plans, or physics puzzles — leaving no unified evaluation of recognition, reasoning, and judgment on real part and assembly drawings. (PDF §1, Table 1)

```paper-map
{
  "thesis":"Mechanical drawings break general MLLMs at three levels — dense reading, projection-consistent reasoning, standards-aware judging. MechVQA measures each level separately, and MechVL shows domain post-training improves the measured benchmark performance.",
  "reader":"Readers who know basic VQA and supervised training but are new to mechanical drawings and group-based RL. A dimension-chain example, a reward calculation, and a clipping calculation supply the required bridges.",
  "goals":["Trace a drawing and verified metadata through question validation, answer construction, and test-time scoring","Compute a composite reward and explain how DAPO turns within-prompt comparisons into token-level updates","Separate the benchmark ranking, training-stage ablations, judge behavior, and unmeasured industrial or expert performance"],
  "outcome":"A 3,281-drawing, 20,778-pair benchmark with quality-gated verifiable answers, plus a 4B baseline reaching Total 84.85 — +5.94 over the best open-source and +7.57 over the best closed-source MLLM tested.",
  "outcomeSource":"PDF §§3–5, Tables 1–2",
  "items":[
    {"number":"01","label":"Problem","signal":"3 compounding factors","text":"High annotation density hides decisive cues; weak domain priors mishandle drafting conventions; spatial reasoning fails under strict projection rules. Adjacent benchmarks cover only slices.","source":"PDF §1"},
    {"number":"02","label":"Benchmark","signal":"gates at every step","text":"Expert-filtered drawings, OCR + MLLM metadata with human verification, three QA-generation routes, cross-model question validation, majority-voted answers, and a leakage-controlled 8:1:1 split.","source":"PDF §3, Fig. 2a"},
    {"number":"03","label":"Model & evidence","signal":"SFT → DAPO ×2","text":"MechVL-4B: SFT for schema and grounding, then two-stage self-play DAPO with a format/accuracy/quality reward. Ablations isolate stages, RL algorithm, and reward design.","source":"PDF §§4–5, Tables 2–3"}
  ]
}
```

**A small drawing problem makes the three capabilities concrete.** Teaching sheet, not a benchmark item: one straight dimension chain has total length 30 mm and a first segment of 18 mm. Reading “18 mm” is Recognition. Inferring the unlabeled second segment as $30-18=12$ mm is Geometric Calculation, a Reasoning subtask, provided the two segments exactly partition that total. If another annotation says the second segment is 14 mm, identifying the conflict $18+14\ne30$ is an Anomaly Detection problem. The same pixels can therefore support different questions and labels; difficulty is not an intrinsic property of an image alone. This example supplies its geometry explicitly and does not apply an unstated drafting standard. (PDF §3.2; App. B.3)

**Where the evidence enters:** Table 2 ranks 17 general MLLMs plus MechVL on the test split; Figure 3 breaks scores down by difficulty; Table 3 runs three controlled ablations (training stages, RL algorithm, reward design); Table 5 quantifies how much expert verification changes the metadata the whole pipeline depends on. (PDF §5, App. B.2)

**Original Figure 1 answers two orientation questions at once.** Panel (a), left column: what makes mechanical drawings hard — high-density annotations, cross-view spatial correspondence, and a specialized symbol vocabulary (datum and geometric tolerance, parameter tables, limit dimensions, roughness, technical requirements, title blocks, section symbols). Panel (b), right and bottom: how MechVQA's ten subtasks map onto the three capability axes, each card showing one real example question and its answer — read one card per subtask to calibrate what the benchmark actually asks. (PDF p. 2, Fig. 1)

![Original Fig. 1: (a) challenges of mechanical drawing understanding — dense annotations, projection-constrained spatial relations, specialized domain symbols; (b) MechVQA's taxonomy with one example QA pair per subtask.](assets/mechvqa-fig1-tasks.png)

*Original paper Fig. 1.<span class="source-ref"> PDF p. 2.</span> The example cards are real benchmark items, e.g. Dimension & Annotation asks “What is the diameter of the central hole?” (answer Φ72 mm); Projection & Multi-view asks which section line a section view corresponds to (answer C-C).*

## 02 / Building MechVQA: from drawings to verifiable QA pairs

A benchmark's claims are only as strong as its construction. MechVQA's pipeline is built around a deliberate trade: **answerability and verifiability over brute-force scale**. Every stage has a quality gate with a discard path, and anything that cannot be verified is revised or removed rather than kept for volume. (PDF §3.3)

```paper-path
{
  "title":"From source drawings to the 20,778-pair dataset",
  "intro":"Pre-processing secures trustworthy drawings and metadata; three generation routes produce candidate questions; two voting/validation gates keep only uniquely answerable pairs.",
  "stages":[
    {"title":"Curate and filter drawings","role":"secure source quality","action":"Collect part and assembly drawings from public textbooks, professional handbooks, and design platforms; domain experts remove low-quality, incomplete, or poorly scanned sheets.","why":"The benchmark targets standards-oriented public drawings; broken scans would poison every downstream step.","output":"3,281 high-quality drawing images.","source":"PDF §3.1"},
    {"title":"Extract and verify metadata","role":"build a reliable structured basis","action":"An OCR model (MinerU2.5) extracts textual content; strong closed-source MLLMs infer other metadata fields; mechanically trained graduate students then verify every field under an internal annotation handbook.","why":"Template questions and ground-truth answers are built from this metadata — errors here become wrong labels. Correction-rate analysis (Table 5) shows this gate is not cosmetic.","output":"Expert-verified metadata per drawing.","source":"PDF §3.1, App. B.1–B.2"},
    {"title":"Generate candidate questions","role":"cover the taxonomy","action":"Three sources: (I) free generation — a closed-source MLLM assesses drawing complexity and drafts subtask-labeled questions; (II) template-based without ground truth — subtask-specific templates bind symbols to features; (III) template-based with ground truth — metadata-grounded deterministic templates, expert-built 2D/3D view matching, and CAD-edited anomaly questions.","why":"Free generation gives open coverage; templates give controllable subtask balance; metadata- and expert-grounded items give known answers, including deliberately injected inconsistencies for judging tasks.","output":"Candidate questions with subtask and difficulty labels.","source":"PDF §3.3"},
    {"title":"Cross-model question validation","role":"keep only answerable questions","action":"In iterative rounds, a different model acts as validator: each question is accepted, rewritten to fix violations, or rejected as unanswerable, checking grounding, unique answerability, and subtask consistency.","why":"A question that refers to a nonexistent symbol or admits multiple readings cannot yield a verifiable label.","output":"Validated question set.","source":"PDF §3.3, App. B.5"},
    {"title":"Multi-model answering and majority vote","role":"assign trusted answers","action":"Multiple strong models answer each question; a strong LLM judge compares core semantics and keeps only pairs with a clear majority. All answers carry a detailed explanation plus a short final answer; an expert audit of a stratified retained subset is also used to refine prompts and filters.","why":"No single model is trusted as oracle; agreement is the proxy for correctness, and the explanation scaffold later feeds RL training.","output":"20,778 QA pairs with explanation + final answer.","source":"PDF §3.3–3.4, App. B.4"},
    {"title":"Leakage-controlled split","role":"protect the evaluation","action":"Split 8:1:1 at drawing-group level — all QAs from one drawing stay in one split. Fused CLIP representations (mean text + image embeddings) are clustered so near-duplicate drawing variants land in the same split, stratified over source, subtask, and difficulty; t-SNE visually confirms matched coverage.","why":"Near-duplicate drawings across train and test would inflate scores; the authors still caution that public-source contamination cannot be fully ruled out.","output":"Train/validation/test splits for evaluation and post-training.","source":"PDF §3.4, App. B.6"}
  ]
}
```

**Original Fig. 2a draws this pipeline as three gated zones.** Read left to right: the purple pre-processing zone contains Quality Gate 1 (image filtering, with a discard bin) and Quality Gate 2 (experts check and refine OCR + model-extracted metadata); the green zone is iterative question generation with the Fail/Refine loop feeding back into question generation and Quality Gate 3 discarding failed questions; the orange zone is answer-side validation, where multi-model generation goes through response validation and voting before anything enters the high-quality dataset that feeds SFT and RL training. Note that both the question side and the answer side have their own discard paths — nothing passes on a single model's say-so. (PDF p. 5, Fig. 2a)

![Original Fig. 2a: the MechVQA data construction pipeline — source drawings pass image filtering and expert metadata verification; questions are generated, cross-checked, and refined; answers are generated by multiple models and kept only after voting; the resulting dataset feeds SFT and RL training.](assets/mechvqa-fig2a-pipeline.png)

*Original paper Fig. 2a.<span class="source-ref"> PDF p. 5.</span> Red “Discard” bins are the important arrows: quality control is implemented as deletion, not as a score.*

**Is the expert-verification gate doing real work? Table 5 says yes, with numbers.** Comparing model-extracted metadata against expert-corrected metadata on the audited groups: view counts are corrected in 41.6% of cases (models usually undercount), section views in 37.8% (confused with section-like or directional views), side/top views in 33.0%/31.8% (systematically over-labeled), technical requirements in 43.7% (surface treatments, heat-treatment parameters, chamfer notation), while Table 5 reports a 1.0% correction rate for coarse part-category labels (the surrounding prose says “less than 1%”). The error patterns are systematic, not random — exactly the kind a handbook-guided human pass can fix. (PDF App. B.2, Table 5)

### An appendix example through the construction and measurement chain

App. B.1's metadata example describes a **Center Mandrel** sheet with three views and one section view. Use these reported metadata fields as the input to a representative metadata-grounded template: “How many views are shown?” → “3.” This question/answer pairing is a teaching instantiation of the paper's template route, not a claim that a particular released test row was retrieved. The construction operation binds the verified view count to a deterministic question; the output is a uniquely answerable candidate with an explanation and short final answer. A question such as “Why is this design best?” would lack an intrinsic answer from those fields and should be rejected or revised at question validation. (PDF §3.3; App. B.1, Fig. 6 and Table 4; Apps. B.4–B.5)

The measurement attached to this gate is **metadata correction rate**, not question-answer accuracy: Table 5 compares pre-check and expert-corrected metadata on the audited typical/newstandard groups and reports 41.6% view-count corrections. The table gives rates but no audited-group counts, so this reading cannot reconstruct a numerator or uncertainty interval. Later test-time judging measures whether a model's answer agrees with the constructed reference; it does not recheck the original drawing. This distinction explains why a reliable benchmark needs both a construction gate and a scoring protocol.

**What do the source drawings actually look like? Original Fig. 5 shows typical examples** — assembly sheets with numbered part callouts and BOM tables, spring drawings with technical-requirement blocks, and multi-view part drawings dense with dimensional chains. This is the visual regime the benchmark stresses: decisive information is present, but spread across views, tables, and symbols at high density. (PDF p. 13, Fig. 5)

![Original Fig. 5: example mechanical drawings from MechVQA — assembly and part drawings with multi-view projections, dense dimensioning, BOM tables, and technical-requirement blocks.](assets/mechvqa-fig5-drawing.png)

*Original paper Fig. 5.<span class="source-ref"> PDF p. 13.</span>*

## 03 / The measurement design: what is being counted

**Ten subtasks, three axes, three difficulties.** Recognition covers explicit information: Identification & Counting (IC), Dimension & Annotation (DA), Text & Table (TT), Item Localization (IL). Reasoning covers inference beyond direct reading: Structure Understanding (SU), Geometric Calculation (GC), Assembly Relationship (AR), Projection & Multi-view (PM). Judging covers decisions under engineering rules: Anomaly Detection (AD) and Consistency Judgment (CJ). Each question carries exactly one subtask label and one difficulty label (easy/medium/hard, defined in App. B.3). (PDF §3.2, App. B.3)

**Original Fig. 2b exposes the dataset's shape — and it is intentionally uneven.** The pie chart shows subtask shares: Dimension & Annotation 30.9%, Anomaly Detection 26.0%, Consistency Judgment 16.3%, Geometric Calculation 12.2%, then a long tail (IL 4.1%, PM 3.6%, SU 2.2%, AR 1.9%, IC 1.5%, TT 1.3%). The bars show difficulty counts: 8,138 easy, 7,118 medium, 5,522 hard (summing to 20,778). The right panel (c) previews the training ladder discussed in §§04–05. Keep the skew in mind when reading headline scores: the two judging subtasks plus DA account for nearly three quarters of all questions. (PDF p. 5, Fig. 2b; §3.4)

![Original Figs. 2b–2c: subtask distribution (pie), difficulty counts (bars), and the multi-stage training curve on MechVQA Total score (line).](assets/mechvqa-fig2bc-stats.png)

*Original paper Figs. 2b–2c.<span class="source-ref"> PDF p. 5.</span> The line panel's last point is discussed in §05 — its printed value (83.44) differs from the 84.85 reported in Tables 2–3, a discrepancy flagged there.*

**Why aggregation matters before looking at a headline.** In a teaching test with 8 questions of task A and 2 of task B, scores of 75% and 50% yield question-weighted accuracy $(8\times0.75+2\times0.50)/10=70\%$, but a two-task macro average of $(75+50)/2=62.5\%$. Neither calculation is wrong: they answer different questions about frequent items versus equal-weight tasks. These counts and scores are invented for teaching.

MechVQA explicitly defines **Avg.** as the mean of all ten subtask scores. **Total** is its headline score; a question-weighted reading is plausible from the table and dataset skew, but the paper does not give Total's aggregation formula or the exact test subtask counts. Treat that reading as an inference, not a verified equation. Targeted RL increases the reported Total by 2.90 points (81.95→84.85), and Avg. by 4.14 (79.12→83.26); both improve, but by different amounts. That is enough to motivate reporting both without inventing Total's denominator. (PDF §5.3, Table 3)

**How answers are scored (App. C.4).** The evaluator extracts the content of the model's `<answer>` tag when present (else text after `</think>`, else the full response). Three LLM judges — GPT-OSS-120B, DeepSeek-V3.2, and Kimi-k2, temperature 0.1 — independently score semantic consistency with the ground-truth answer as binary 0/1; the final score is the most frequent vote among valid judges. Crucially, judges see only the question, the ground truth, and the model answer — **not the drawing** — so judging is post-hoc answer verification, not a second attempt at the visual problem. JSON parsing first falls back to a string-level parse for explicit 0/1, then assigns 0 if still unparseable. A failed judge call is marked invalid and excluded; only if all calls fail does the final vote become 0. The appendix does not specify how a tie among remaining valid judges is broken. (PDF App. C.4, Fig. 18)

**A scoring example with a failure (teaching case).** For “How many views?”, the reference is “3”; the model says “There are three views.” Judges compare the core meaning, so wording alone need not cause a failure. Votes 1, 1, and an API failure produce 1 from the two valid judges; the failure is not a third zero vote. Votes 1, 0, and a failure leave a tie whose resolution is not specified in the paper. This example uses App. C.4's operation; it is not an observed benchmark record. Training's continuous accuracy reward and test-time binary correctness are different instruments.

```paper-contrast
{
  "title":"How MechVQA differs from adjacent engineering-VQA data",
  "intro":"Adjacent benchmarks are complementary but scoped to slices; MechVQA's claim is unified coverage of recognition, reasoning, and judging on real part and assembly drawings.",
  "branches":[
    {"name":"Adjacent slices","lead":"Each existing set stresses one facet of engineering-document understanding.","scope":"Rulebook-grounded requirements QA (DesignQA), blueprint symbol recognition (BlueprintSymVL), AEC floor-plan literacy (AECV-Bench), physics-puzzle mechanics (MechBench), tri-view projection reasoning (CReFT-CAD), parametric primitives (PHT-CAD).","judge":"Engineering-drawing analysis is often a small, non-open component within broader suites.","signal":"No single set jointly stresses structured perception, multi-view consistency, and engineering-grade judgment on real mechanical drawings.","why":"Paper's stated gap motivating a dedicated benchmark (Table 1 compares sizes and task focus).","source":"PDF §1, Table 1"},
    {"name":"MechVQA","lead":"One benchmark, three capability axes, ten subtasks, three difficulty levels.","scope":"3,281 real part and assembly drawings with 20,778 QA pairs; includes 2D–3D view matching and expert-edited anomaly items.","judge":"Every QA pair passes cross-model question validation and majority-voted answers; metadata is expert-verified.","signal":"A testbed that can localize failure at reading, reasoning, or judging — not just report one aggregate number.","why":"This is the paper's central benchmark claim (stated as 'the first comprehensive mechanical drawing understanding dataset').","source":"PDF §§1, 3"}
  ]
}
```

## 04 / MechVL: the training ladder behind 84.85

MechVL is deliberately simple in architecture — Qwen3-VL-Instruct-4B with the vision side frozen — and puts all the leverage in post-training. The ladder has three rungs: SFT for grounding and schema, full-data DAPO for reliability, then targeted DAPO that resamples weak subtasks. (PDF §4)

```paper-path
{
  "title":"From Qwen3-VL-4B to MechVL-4B-RL",
  "intro":"SFT creates the reference policy; both RL stages use the same DAPO objective and composite reward — only the sampling distribution changes.",
  "stages":[
    {"title":"Supervised fine-tuning","role":"ground drafting cues and enforce schema","action":"Full-parameter SFT on the LLM module only — vision encoder and projection layers stay frozen — on the MechVQA train split; each instance is (optional drawing, question, target response with rationale + concise final answer), trained with standard causal LM loss (Eq. 1).","why":"The model must first learn the <think>/<answer> schema and convention-consistent mechanical phrasing before RL can score it meaningfully.","output":"Reference policy πref (MechVL-4B-SFT, Total 76.36).","source":"PDF §4.1, Eq. 1"},
    {"title":"Sample a response group","role":"explore per prompt","action":"For each prompt (drawing + question with a verifiable answer), sample G = 10 candidate responses from the old policy.","why":"Group-relative scoring turns each prompt into its own baseline — no separate value critic is needed.","output":"A group of 10 scored responses per prompt.","source":"PDF §4.2, App. C.2"},
    {"title":"Score with the composite reward","role":"define what 'better' means","action":"Each response gets R = λacc·racc + λfmt·rfmt + λqual·rqual (Eq. 6): semantic accuracy against ground truth via LLM judge [0,1], binary format compliance {0,1}, and LLM-judged quality over Logic/Professionalism/Conciseness [0,1] (Eq. 7); weights 0.60/0.10/0.30 by ablation (Table 7).","why":"Strict string matching would give zero reward to correct answers phrased differently; pure accuracy rewards invite degenerate or verbose outputs — format and quality terms counter both.","output":"Scalar reward per response.","source":"PDF §4.2, Eqs. 6–7; App. C.3"},
    {"title":"DAPO update (stage 1, full data)","role":"optimize with stabilized policy gradient","action":"Compute group-relative advantage (Eq. 2), token-level importance ratios (Eq. 3), and a PPO-style surrogate with decoupled clip parameters εlow=0.20, εhigh=0.28 (importance-ratio interval 0.80–1.28) (Eq. 4); Dynamic Sampling discards all-correct or all-wrong groups (Eq. 5); overlong reward shaping handles truncation; no KL penalty to the SFT reference.","why":"Long-form drawing analysis needs stable advantage estimates and informative groups — the method filters groups with no mixture of answer correctness.","output":"MechVL after full-data RL (Total 81.95).","source":"PDF §4.2, Eqs. 2–5; App. C.2"},
    {"title":"Targeted self-play RL (stage 2)","role":"rebalance toward weak subtasks","action":"Run the same objective and reward on a resampled subset with a higher share of underperforming subtasks.","why":"After stage 1, errors concentrate in reasoning-heavy subtasks; focusing updates there reduces capability imbalance rather than chasing the already-strong reading subtasks.","output":"MechVL-4B-RL (Total 84.85).","source":"PDF §4.2, §5.3"}
  ]
}
```

### First turn one response into a reward

Suppose a generated answer receives semantic accuracy $r_{\mathrm{acc}}=0.8$, valid format $r_{\mathrm{fmt}}=1$, and quality scores $(0.6,0.9,0.6)$ for logic, professionalism, and conciseness. **Teaching numbers:** quality is $(0.6+0.9+0.6)/3=0.7$, so the final reward is $0.60(0.8)+0.10(1)+0.30(0.7)=0.79$. A correct answer can lose format credit; a fluent, well-formatted answer can still be technically wrong. The reward combines these distinctions rather than equating long reasoning with correctness.

The general form is

$$
R(x,q,y)=\lambda_{\mathrm{acc}}r_{\mathrm{acc}}(x,q,y)+\lambda_{\mathrm{fmt}}r_{\mathrm{fmt}}(y)+\lambda_{\mathrm{qual}}r_{\mathrm{qual}}(x,q,y),
\qquad
r_{\mathrm{qual}}=\frac{s_{\mathrm{logic}}+s_{\mathrm{prof}}+s_{\mathrm{conc}}}{3}.
$$

Here $x$ is the drawing, $q$ the question, and $y$ a candidate response. Accuracy and quality lie in [0,1] and use LLM judging; format is binary and requires exactly one `<think>…</think>` rationale and one `<answer>…</answer>` span. The selected accuracy/format/quality weights are **0.60/0.10/0.30**. Accuracy is judged semantically, allowing a differently worded correct answer to earn credit. These are training rewards, not the three-judge binary evaluation of §03. (PDF §4.2, Eqs. 6–7; App. C.3)

### Then compare responses to the same prompt

A high raw reward alone does not say whether a sampled response is better than the alternatives for this particular drawing. DAPO centers rewards within the group and divides by their spread. **Teaching group:** with four rewards $[1,1,0,0]$, mean and population standard deviation are both 0.5, so advantages are approximately $[1,1,-1,-1]$ when the small stability constant is negligible. The actual training group size is 10; four is only for hand calculation. (PDF §4.2; App. C.2)

For a prompt $u=(x,q)$ and sampled responses $\{y_i\}_{i=1}^{G}$ from old policy $\pi_{\theta_{\mathrm{old}}}$,

$$
\hat A_{i,t}=\frac{R_i-\operatorname{mean}(\{R_j\}_{j=1}^{G})}{\operatorname{std}(\{R_j\}_{j=1}^{G})+\epsilon_A}.
$$

The same response advantage is used at every token $t$ in that response. The small positive $\epsilon_A$ is **inside the denominator**, stabilizing division when reward spread is small. If all composite rewards are equal, the centered numerator is zero. (PDF §4.2, Eq. 2)

Dynamic Sampling is a separate **answer-correctness filter**: retain a prompt group only when

$$
0<\bigl|\{y_i\mid\mathrm{is\_equivalent}(a,y_i)\}\bigr|<G,
$$

where $a$ is the reference answer. Thus it repeatedly resamples/discards groups whose answers are all correct or all incorrect. Do not equate this filter with a test that the **composite** reward has zero variance: all-correct answers can still differ in format or quality. The paper's implemented condition is the correctness mixture above. (PDF §4.2, Eq. 5)

### Finally limit how far a rewarded token can move in one update

DAPO compares the new and old probability of each sampled token,

$$
r_{i,t}(\theta)=\frac{\pi_\theta(y_{i,t}\mid u,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid u,y_{i,<t})}.
$$

**Clipping bridge (teaching numbers).** If a positive-advantage token goes from old probability 0.10 to new probability 0.14, the ratio is 1.4. With $\epsilon_{\mathrm{high}}=0.28$, the clipped ratio is 1.28; for advantage 1, the surrogate takes $\min(1.4,1.28)=1.28$. It stops rewarding further upward movement on that token in this surrogate. A clip parameter of 0.28 is therefore not a probability limit of 0.28. The lower and upper ratio bounds are $1-0.20=0.80$ and $1+0.28=1.28$.

The full token-aggregated objective is

$$
\mathcal L_{\mathrm{DAPO}}=-\mathbb E_{u,\{y_i\}}\left[
\frac{1}{\sum_{i=1}^{G}|y_i|}
\sum_{i=1}^{G}\sum_{t=1}^{|y_i|}
\min\left(r_{i,t}\hat A_{i,t},\operatorname{clip}(r_{i,t},1-\epsilon_{\mathrm{low}},1+\epsilon_{\mathrm{high}})\hat A_{i,t}\right)
\right].
$$

The denominator counts sampled tokens across the group, not one equal-weight average per response. DAPO also uses overlong reward shaping for length-budget failures and omits an explicit KL penalty to the SFT reference. The paper names this shaping but does not supply a separate numerical shaping rule here, so this reading does not invent one. Together these are the optimizer configuration being tested; Table 3(B) does not separately ablate each technique. (PDF §4.2, Eqs. 3–5)

<details class="reading-detail">
<summary>Training configuration and reward-weight support</summary>

App. C.3 fixes the format weight at 0.10. Accuracy/quality weights 0.75/0.15 produce Total 83.23; 0.45/0.45 produce 83.58; the selected 0.60/0.30 produce 84.85. All three assign a nonzero quality weight, so this table alone cannot establish the value of adding quality from zero; Table 3(C)'s w/o Qual row addresses removal. (PDF Table 7)

SFT: 3 epochs, AdamW lr $10^{-5}$, weight decay 0.01, global batch 64, cosine schedule with 0.1 warmup, ZeRO-3; images capped at 262,144 pixels, longer edge 1,024, sequence 4,096. RL: AdamW lr $10^{-6}$, batch 128, linear schedule, group 10, FSDP with CPU offload. DAPO disables KL, uses low/high clip parameters 0.20/0.28, token averaging, and online filtering. GRPO adds KL weight 0.01, while GSPO uses sequence averaging and clip parameters $3\times10^{-4}/4\times10^{-4}$. Hardware is 8× H800 80GB. These are source settings, not a reproduced training run. (PDF App. C, Table 6)

**Configuration wording conflicts remain.** Section 4.1 explicitly freezes vision encoder and projector, updating all LLM parameters; App. C.1 uses the broader phrase “all model parameters.” This reading follows the explicit module scope of §4.1 rather than silently expanding it. GRPO's prose says clipping 0.2 while Table 6 gives low/high 0.20/0.30; reproduce only after resolving that configuration distinction in the actual training code. (PDF §4.1; App. C.1–C.2)

</details>

## 05 / Experiment atlas: which result answers which question

**Read everything under this protocol:** all models are evaluated on the MechVQA test split with the same three-judge binary protocol of §03, no external tools or retrieval. General-purpose baselines are measured as out-of-domain transfer; MechVL is the in-domain baseline quantifying targeted post-training. Table 2's full matrix has 17 general MLLMs; the table below keeps the strongest and most comparable rows. (PDF §5.1, Table 2)

<details class="reading-detail">
<summary>Selected Table 2 rows and subtask counterexamples</summary>

| Model | DA | IL | SU | GC | AR | PM | AD | CJ | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-VL-4B-Instruct (MechVL's base) | 76.96 | 33.09 | 39.58 | 58.54 | 22.00 | 20.00 | 62.86 | 49.33 | 60.23 |
| Qwen3-VL-32B-Instruct | 86.68 | 56.83 | 62.50 | 76.83 | 62.00 | 48.00 | 75.92 | 69.33 | 76.50 |
| GLM-4.6V (best open-source) | 86.68 | 63.31 | 77.08 | 82.93 | 60.00 | 62.00 | 74.29 | 69.33 | 78.91 |
| GPT-5 | 84.99 | 62.59 | 79.17 | 73.58 | 60.00 | 60.00 | 71.02 | 70.67 | 75.44 |
| Gemini-3-Pro-Preview (best closed-source) | 87.74 | 64.03 | 52.08 | 73.58 | 46.00 | 58.00 | 78.37 | **82.67** | 77.28 |
| Qwen3-VL-Plus | 86.68 | 52.88 | 81.25 | 79.67 | 74.00 | 58.00 | 67.76 | 68.00 | 76.33 |
| Claude-Sonnet-4.5 | 78.65 | 56.12 | 70.83 | 75.20 | 62.00 | 54.00 | 64.90 | 64.00 | 71.20 |
| MechVL-4B-SFT (Ours) | 85.20 | 61.15 | 60.42 | 73.17 | 40.00 | 44.00 | 84.49 | 69.33 | 76.36 |
| **MechVL-4B-RL (Ours)** | **90.70** | **82.01** | **83.33** | 76.83 | **84.00** | **64.00** | **86.94** | 78.67 | **84.85** |

*Selected rows from original Table 2<span class="source-ref">, PDF p. 8</span> (columns IC and TT omitted — MechVL-RL ties with several models there at 88.37 / 97.73; bold marks unique best in the table). Note where RL does **not** win: GC ties Qwen3-VL-32B but is below GLM-4.6V (82.93), and CJ stays below Gemini-3-Pro-Preview — the paper claims best only on DA, IL, SU, AR, PM, AD, plus Total.*

</details>

**The decisive comparisons, with their limits.** On the fixed MechVQA test split and three-judge protocol, MechVL-RL's Total is 84.85 versus GLM-4.6V 78.91 and Gemini-3-Pro-Preview 77.28. This is a domain-trained system against general models evaluated without domain adaptation. The more informative stage control is SFT 76.36 → full-data DAPO 81.95 → targeted DAPO 84.85, with Reasoning means 54.40→70.75→77.04. Yet it does not win every subtask: its GC 76.83 is below GLM's 82.93, and CJ 78.67 is below Gemini's 82.67. No expert upper bound or industrial deployment result is measured. (PDF Tables 2–3; App. A)

```paper-experiments
{
  "title":"What each reported result can answer",
  "rows":[
    {"question":"Does MechVL beat general MLLMs on this benchmark?","setup":"Table 2: 17 open- and closed-source MLLMs plus MechVL, same test split and three-judge protocol.","observation":"MechVL-4B-RL Total 84.85: +5.94 over GLM-4.6V (best open-source, 78.91), +7.57 over Gemini-3-Pro-Preview (best closed-source, 77.28), +8.49 over its own SFT stage (76.36). This is a whole-system comparison — it does not by itself isolate which design choice wins.","source":"PDF §5.2, Table 2"},
    {"question":"Where do the gains sit by difficulty?","setup":"Fig. 3: accuracy on easy/medium/hard subsets (subset sizes differ, so the paper cautions rankings here need not match Total).","observation":"MechVL-4B-RL: 94/79/75 (easy/medium/hard). Versus SFT, RL barely moves easy (92→94) but lifts medium 70→79 and hard 53→75; hard beats the best closed baseline on that subset (Qwen3-VL-Plus, 66) by 9 points. Gains concentrate where reasoning and consistency demands are highest.","source":"PDF §5.2, Fig. 3"},
    {"question":"How much does each training stage contribute?","setup":"Table 3(A): controlled stage ablation — SFT, then +DAPO on full data, then +DAPO targeted — same evaluation.","observation":"Total 76.36 → 81.95 → 84.85; Reasoning mean 54.40 → 70.75 → 77.04; Recognition 83.11 → 86.26 → 89.70; Judging 76.91 → 81.62 → 82.81. This supports the value of the additional reported stages under this setting; without a matched extra-token control, it does not isolate curriculum from extra RL compute.","source":"PDF §5.3, Table 3(A)"},
    {"question":"Does the RL algorithm choice matter?","setup":"Table 3(B): GRPO, GSPO, DAPO under the same initialization and full-data setting.","observation":"DAPO best: Total/Avg. 81.95/79.12 vs GRPO 80.47/74.80 and GSPO 78.77/73.73; the largest margin is on Reasoning (70.75 vs 64.49 and 61.29). The DAPO configuration is strongest here; the comparison changes multiple algorithm settings and does not isolate dynamic sampling or clipping individually.","source":"PDF §5.3, Table 3(B)"},
    {"question":"Does reward design matter, and why?","setup":"Table 3(C) ablates the accuracy term and the quality term in the targeted phase; Fig. 4 tracks response length during training.","observation":"Full reward best (84.85); removing quality drops to 83.44; binary accuracy 82.24; token-level F1 worst at 80.33. Fig. 4 offers a response-length diagnostic alongside that ordering: Acc(F1) collapses responses from ~1.1K to <0.8K tokens (terse, weakly grounded), w/o Qual drifts to ~1.3K (verbose without accuracy gains), Full holds a controlled 1.2K–1.25K band with the best final accuracy.","source":"PDF §5.3, Table 3(C), Fig. 4"},
    {"question":"Is the benchmark's expert verification load-bearing?","setup":"Table 5 (App. B.2): correction rates between model-extracted and expert-corrected metadata on audited groups.","observation":"View counts corrected 41.6%, technical requirements 43.7%, section views 37.8%, side/top views 33.0%/31.8% — all systematic patterns; part category correction is 1.0% in Table 5 (prose says <1%). The structured metadata feeding template questions and ground-truth answers is materially changed by the human pass.","source":"PDF App. B.2, Table 5"}
  ]
}
```

**Reward quality has a trade-off even within the ablation.** Full wins Total 84.85 versus w/o Qual 83.44, but the Reasoning mean is slightly lower, 77.04 versus 77.23. The data support the selected overall operating point, not improvement on every axis. Longer traces alone are also insufficient: w/o Qual produces the longest responses yet has lower Total. (PDF Table 3(C), Fig. 4)

<details class="reading-detail">
<summary>All Table 3 ablation rows</summary>

| Phase and configuration | Recognition | Reasoning | Judging | Total | Avg. |
|---|---:|---:|---:|---:|---:|
| A · SFT | 83.11 | 54.40 | 76.91 | 76.36 | 70.39 |
| A · + DAPO full | 86.26 | 70.75 | 81.62 | 81.95 | 79.12 |
| A · + DAPO targeted | 89.70 | 77.04 | 82.81 | 84.85 | 83.26 |
| B · GRPO full phase | 83.55 | 64.49 | 77.93 | 80.47 | 74.80 |
| B · GSPO full phase | 84.17 | 61.29 | 77.73 | 78.77 | 73.73 |
| B · DAPO full phase | 86.26 | 70.75 | 81.62 | 81.95 | 79.12 |
| C · Acc(0/1) targeted | 86.62 | 71.72 | 79.42 | 82.24 | 79.22 |
| C · Acc(F1) targeted | 85.49 | 65.88 | 79.32 | 80.33 | 76.41 |
| C · w/o Qual targeted | 88.38 | 77.23 | 81.68 | 83.44 | 82.58 |
| C · Full targeted | 89.70 | 77.04 | 82.81 | 84.85 | 83.26 |

All values are reported percentages; axis means and Avg. are macro averages over their corresponding subtasks. This is an atlas transcription of original Table 3, not new measurements. (PDF §5.3, Table 3)

</details>

```paper-chart
{"type":"paired","title":"The training ladder on Total score","subtitle":"Each row is one stage transition; unit: points","origin":"Atlas redraw · original Table 3(A) and Fig. 2c","note":"Stage transitions from controlled ablations; Baseline is Qwen3-VL-4B-Instruct from Table 2.","source":"PDF pp. 8–9, Tables 2–3","rows":[{"label":"Baseline → SFT","before":60.23,"after":76.36},{"label":"SFT → + DAPO (full)","before":76.36,"after":81.95},{"label":"full RL → + DAPO (targeted)","before":81.95,"after":84.85}]}
```

```paper-chart
{"type":"paired","title":"MechVL-4B-RL against the strongest baselines","subtitle":"Total score; unit: points","origin":"Atlas redraw · original Table 2","note":"Whole-system comparison at fixed evaluation protocol.","source":"PDF p. 8, Table 2","rows":[{"label":"vs GLM-4.6V (open-source best)","before":78.91,"after":84.85},{"label":"vs Gemini-3-Pro-Preview (closed-source best)","before":77.28,"after":84.85},{"label":"vs GPT-5","before":75.44,"after":84.85}]}
```

**Original Fig. 3 shows why the difficulty axis matters.** Each bar is one model's easy/medium/hard accuracy. All models drop from easy to hard — harder questions demand cross-view correspondence, stricter constraint satisfaction, and multi-step reasoning — but the spread widens sharply: MechVL-4B-RL (94/79/75) keeps the flattest profile, while GPT-4o-mini is reported at 64/33/26 (its parameter count is not established in this paper). Reading tip: compare MechVL-4B-SFT (92/70/53) with MechVL-4B-RL next to it — the largest measured changes are on medium and hard subsets; this locates the gain without showing that response length itself caused it. (PDF p. 8, Fig. 3)

![Original Fig. 3: per-model accuracy on easy, medium, and hard subsets. MechVL-4B-RL leads at every level and is most balanced; RL's gains concentrate on medium and hard.](assets/mechvqa-fig3-difficulty.png)

*Original paper Fig. 3.<span class="source-ref"> PDF p. 8.</span> The paper itself cautions that subset sizes differ, so this ranking need not match Table 2's Total.*

**Original Fig. 4 adds a behavioral diagnostic to the reward ablation.** It plots response length over RL training steps for four reward designs. Acc(F1) — token-overlap accuracy — collapses from ~1.1K to below 0.8K tokens: overlap feedback rewards terseness over grounding, and it is also the worst final scorer in Table 3(C). w/o Qual climbs to ~1.3K, verbosity without matching accuracy. Full holds a controlled band around 1.2K–1.25K with the best final score — the authors read this as better-calibrated reasoning traces rather than merely longer ones. (PDF p. 9, Fig. 4)

![Original Fig. 4: response-length dynamics under four reward designs during RL training. Acc(F1) collapses toward terse outputs; w/o Qual grows longest; the Full reward stays controlled and scores best.](assets/mechvqa-fig4-reward.png)

*Original paper Fig. 4.<span class="source-ref"> PDF p. 9.</span>*

**Two result discrepancies to carry while reading the numbers.** ① The abstract and §5.2 report MechVL outperforms the strongest closed-source baseline by **7.57** points, but the introduction says it surpasses closed-source baselines “by 6%” — no reported number matches 6%; the 7.57-point gap to Gemini-3-Pro-Preview (77.28) is the one grounded in Table 2. ② Fig. 2c's training curve prints RL(targeted) at **83.44**, while Tables 2 and 3(A) report the targeted-RL model at **84.85** (83.44 coincidentally equals Table 3(C)'s w/o-Qual row). This atlas uses the table values and flags both mismatches rather than silently resolving them. (PDF pp. 2, 5, 8–9)

## 06 / Synthesis: what the evidence supports, and its boundaries

The mechanism and the measurement reinforce each other in a specific way: **the benchmark's own failure diagnosis predicts where training should help, and the ablations confirm it there.** The paper's diagnosis named dense reading, projection reasoning, and standards judging; the training ladder's controlled ablation (Table 3A) shows SFT alone lifts the base model mostly on reading, while RL — with its semantic-accuracy-plus-quality reward — delivers its largest capability gain on Reasoning (54.40 → 77.04 across both stages) and its largest difficulty gain on the hard subset (53 → 75). The reward-dynamics figure then associates reward design with response length; length is not a direct measure of reasoning validity. The stage and reward comparisons support these bounded observations; optimizer components, extra-compute effects, and the causal role of response length are not separately identified. (PDF §§5.2–5.3, Figs. 3–4)

**The evaluation chain deserves a sober read (reader inference, not a paper claim).** Both ends of this work are LLM-mediated: questions and answers are generated and voted on by strong closed-source models (with expert gates), and final scoring uses three LLM judges that never see the drawing. These are different model sets at each end, and the judges do post-hoc answer verification rather than visual re-solving — a reasonable, scalable protocol — but absolute scores still inherit judge behavior, and answer extraction and parse fallback can penalize unusual answer formats, while failed judge calls are excluded unless all fail. The authors also acknowledge the related contamination caveat: public-source drawings plus web-scale pretraining means absolute leakage control is impossible; their mitigation is drawing-level and cluster-level separation. (PDF §§3.4, 5.1, Apps. A, C.4)

**Boundaries the paper states itself (App. A):** drawings come from educational/professional public sources, not proprietary industrial archives — legacy blueprints and company-specific drafting practices are out of scope; the benchmark is 2D-drawing understanding, not 3D CAD reconstruction or STEP/IGES generation; construction still depends on OCR and visual clarity; and **benchmark validation is explicitly incomplete** — no human-expert upper bound or inter-annotator agreement statistics are reported yet, so the remaining gap between MechVL and domain experts is unquantified. Release of original drawings follows the underlying materials' redistribution permissions. (PDF App. A)

<details class="reading-detail">
<summary>Reproduction settings to take back to the source</summary>

**If you reproduce or build on this work:** dataset — 3,281 drawings, 20,778 pairs, 8:1:1 drawing-group split with CLIP-cluster dedup; model — Qwen3-VL-Instruct-4B, vision frozen, LLM-only full-parameter SFT (3 epochs, lr 1e-5, batch 64) then DAPO (group 10, clip parameters 0.20/0.28 (ratio bounds 0.80–1.28), no KL, dynamic sampling, reward 0.60 acc / 0.10 fmt / 0.30 qual), stage 2 upsamples weak subtasks; evaluation — three LLM judges (GPT-OSS-120B, DeepSeek-V3.2, Kimi-k2, temp 0.1) with binary semantic scoring and majority vote; training framework — LLaMA-Factory (SFT) and EasyR1 (RL) on 8× H800. Code: github.com/xiaofengShi/MechVQA. (PDF §§3–5, Apps. B–C)


</details>

## 07 / Understanding checks

Try the changed inputs before revealing the answers. These are learning aids, not measured comprehension scores.

```paper-check
{
  "title": "Check your understanding on a changed input",
  "items": [
    {
      "question": "A new teaching sheet has a straight two-segment chain totaling 22 mm, with first segment 12 mm. It also labels the second segment 11 mm. What must you assume to infer the missing value, and how do reading, calculation, and anomaly detection differ?",
      "answer": "Assume the two segments exactly partition the stated total in the same unit. Reading extracts 12/22/11; geometric calculation gives 22−12=10 mm; anomaly detection identifies 11 as inconsistent with that chain. The task label depends on the question, and an unstated projection or tolerance convention must not be invented.",
      "source": "PDF §3.2; App. B.3; teaching chain in §01"
    },
    {
      "question": "A new response has accuracy 0.5, valid format 1, and three quality scores all 0.8. Under the selected weights, what reward does it get? Is that also its binary test score?",
      "answer": "Reward is 0.60×0.5+0.10×1+0.30×0.8=0.64. It is a continuous training reward. Test scoring separately extracts the final answer and uses binary semantic judgments from three judges; 0.64 does not become the test score.",
      "source": "PDF Eqs. 6–7; App. C.3–C.4"
    },
    {
      "question": "All ten sampled answers are technically correct, but their format and quality rewards differ. Does the paper's Dynamic Sampling keep that group because composite reward variance is nonzero?",
      "answer": "No. Eq. 5 retains only a mixture of correct and incorrect answers, so an all-correct group is discarded/resampled. The correctness gate is distinct from reward normalization; nonzero quality variance does not override it.",
      "source": "PDF §4.2, Eqs. 2 and 5"
    },
    {
      "question": "A new evaluation makes every failed judge call a zero vote and reports a higher Total on a proprietary industrial set. Can its number be inserted into Table 2 as if the protocol were unchanged?",
      "answer": "No. App. C.4 excludes failed calls and returns zero if all fail; changing that rule changes the measuring instrument. The new dataset also changes task distribution and provenance. Report both protocols separately, and do not infer industrial or expert-level performance from the original public-drawing ranking.",
      "source": "PDF §5.1; Apps. A and C.4"
    }
  ]
}
```

<!-- Interaction decision audit: the construction gates, reward-to-advantage transformation, and clipping bounds are fully visible as a static path, worked calculations, and source figures. A probability slider would add unmeasured policy behavior rather than source evidence. Optional details carry wide matrices and configurations; the decisive ranking, subtask counterexamples, and protocol gaps remain visible. No scripted interaction is added. -->
