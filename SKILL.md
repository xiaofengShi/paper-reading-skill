---
name: paper-reading
description: >-
  Research-grade paper reading skill. Converts research papers (PDF, arXiv,
  URL, or local file) into evidence-grounded research knowledge — claims,
  mechanisms, evidence strength, fairness checks, weaknesses, and actionable
  research hypotheses — instead of section-by-section summaries. Use when the
  user asks to read, analyze, review, critique, compare, reproduce, or build on
  a research paper; when triaging whether a paper is worth deep reading; when
  doing reviewer-style credibility checks (baseline fairness, ablation
  completeness, evidence sufficiency); when assessing how a paper relates to
  the user's own research (overlap, threats to novelty, reusable components,
  potential baselines); or when maintaining a literature comparison matrix or
  research-card knowledge base. Supports SCAN / UNDERSTAND / REVIEW / RESEARCH
  reading depths with early-stop triage.
---

# Paper Research Skill

Read research papers efficiently and convert them into evidence-grounded
research knowledge.

The goal is NOT to summarize every section. The goal is to determine:

- What problem the paper addresses.
- What the paper actually contributes.
- What scientific claims it makes.
- What evidence supports each important claim.
- Whether the experiments fairly support the conclusions.
- What assumptions and limitations remain.
- How the work relates to the user's research.
- What actionable research hypotheses or experiments follow.

## Core Principle

Always reason using:

```
Problem → Hypothesis → Mechanism → Claim → Evidence → Limitation → Research Implication
```

Do not organize the analysis primarily by paper sections. Prefer
claim-centered and evidence-centered analysis. A successful reading lets a
researcher answer: what does this paper actually add, why should it work, what
evidence says it works, what has not been demonstrated, how does it differ
from the closest work, does it matter for my research, and what should I do
next.

## Reading Modes

Papers are not all worth the same depth. Select (or ask for) exactly one mode
before reading, and stop early when triage says the paper is irrelevant.

| Mode | Purpose | Cost | Output |
|---|---|---|---|
| SCAN | Decide if the paper is worth reading | Very low | Relevance + 3-sentence verdict |
| UNDERSTAND | Understand how the method works | Medium | Method, experiments, claims |
| REVIEW | Reviewer-style credibility audit | Medium-high | Evidence strength, fairness, weaknesses |
| RESEARCH | Serve the user's active research | Highest | Gaps, hypotheses, next experiments |

Infer the mode from the request:

- "What is this paper about?" / "值得读吗" → SCAN (upgrade to UNDERSTAND only if clearly relevant)
- "Explain / walk me through this paper" → UNDERSTAND
- "仔细分析 / is this solid / review it" → UNDERSTAND + REVIEW
- "Compare with my work / I want to reproduce or build on it" → RESEARCH

See `references/reading-modes.md` for per-mode procedures and the
SCAN→UNDERSTAND→REVIEW→RESEARCH escalation policy.

## Workflow

Execute these steps in order. In lighter modes, stop after the step that
satisfies the mode's output contract (SCAN: step 2; UNDERSTAND: step 6;
REVIEW: step 7; RESEARCH: step 9).

### Step 1 — Establish the Reading Objective

Determine why this paper is being read, what research question it may answer,
what aspects matter most, and what details can safely be ignored. Record it:

```yaml
reading_goal:
  mode: RESEARCH            # SCAN | UNDERSTAND | REVIEW | RESEARCH
  purpose: [understand_method, compare_with_my_work, identify_research_gap]
  focus: [memory mechanism, search strategy]
  ignore: [unrelated implementation details]
```

Do not spend equal effort on every part of the paper.

### Step 2 — Triage

Read only: title, abstract, introduction, Figure 1 / method overview, main
result table, conclusion. Produce problem, core idea, main claim, main result,
relevance (high/medium/low), and recommended reading depth.

Then force a 3-sentence summary:

> Existing XXX methods suffer from XXX. This paper proposes XXX, which solves
> it by XXX. On XXX benchmark it improves over XXX by XXX.

If these three sentences cannot be written, the main thread has not been
captured — re-scan before going deeper.

**If relevance is low, stop deep analysis unless explicitly requested.** Most
papers should be filtered out at this stage; that is the point of triage.

### Step 3 — Build the Claim Graph

Do not write section summaries. Extract the major scientific claims and
represent each as:

```
Problem → Hypothesis → Mechanism → Claim → Evidence → Confidence → Caveat
```

```yaml
claims:
  - id: C1
    claim: "Evidence verification improves answer quality"
    mechanism: [remove unsupported evidence, reduce context noise]
    evidence: [Table 2, Ablation Table 4]
    confidence: medium
    caveat: [only evaluated on two QA benchmarks]
```

Do not confuse author statements with experimentally established conclusions.

### Step 4 — Verify Evidence

For every important claim, find the experiment that *directly* tests it and
classify the support:

- `DIRECT` — a controlled comparison isolates the claimed mechanism
  (e.g., No-Memory vs Memory, all else equal).
- `INDIRECT` — end-to-end improvement consistent with the claim, but other
  factors changed simultaneously (prompt, retrieval, backbone, compute, data).
- `WEAK` — single benchmark, single seed, or marginal effect.
- `UNSUPPORTED` — asserted but never tested.

Ask: could another factor explain the reported improvement? An end-to-end
"Ours vs GPT-X" win does not prove that the proposed module is the cause.

### Step 5 — Analyze the Method

Reduce the system to its minimal pipeline: `Input → A → B → C → Output`.
Identify inputs, outputs, new components, learned vs fixed components,
training signals, and inference-time operations. Then answer:

> If all terminology and branding are removed, what is actually new?

Compress the novelty into one sentence: *"Compared with X, they add Y."*
If that sentence cannot be written, the contribution is not yet understood.

### Step 6 — Analyze the Experiments

Experiments decide credibility — spend more effort here than on the method.
Inspect datasets, metrics, baselines, backbones, data budgets, retrieval
budgets, inference budgets, prompts, training compute, random seeds, variance,
and ablations.

- **Baseline fairness**: same backbone, data, retrieval/inference budget,
  prompt, compute?
- **Main table discipline**: read absolute gain, relative gain, variance,
  multi-seed?, consistent across benchmarks? — not just "Ours > baseline".
- **Ablations are the most valuable part**: the main table shows the *system*
  works; ablations show *what* works. If `Base 60 → +Memory 63 → +Critic 64 →
  +Planner 64.2`, the real contribution is Memory.

Do not infer causality from an end-to-end comparison when multiple factors
changed simultaneously.

### Step 7 — Reviewer Critique

Attack the paper along the fixed critique matrix: problem validity, novelty,
necessity of each component, baseline fairness, experimental controls,
evidence sufficiency, ablation completeness, statistical reliability,
generalization, compute/data fairness, reproducibility, hidden assumptions.

Each criticism must be **specific, evidence-grounded, and testable**, stated
as: *Observation → Why it matters → Experiment that could resolve it.*
Never write generic comments like "more experiments are needed."
See `references/critique-matrix.md` for the full matrix.

### Step 8 — Connect to the Research Context

When the user's research context is available, analyze: same problem? same
assumption? same mechanism? what is genuinely different? Then report:

```yaml
relation_to_my_work:
  same_problem: ...
  same_assumption: ...
  different_mechanism: ...
  reusable_components: ...
  potential_baseline: ...
  threat_to_novelty: ...   # could this paper eat the novelty of current work?
  opportunity: ...
```

Never force a connection when none exists.

### Step 9 — Generate Research Opportunities

Only generate opportunities grounded in identified evidence or gaps, in the
form:

```
Gap → Hypothesis → Minimal Experiment → Expected Observation → Interpretation
```

Avoid vague ideas ("add memory", "use RL", "combine the two methods"). Every
paper read this way should end with at least one concrete, falsifiable
hypothesis — over time this turns 100 papers read into 100 research hypotheses.

## Evidence Discipline

- Every important factual statement about the paper carries a source pointer
  when available: page / section / figure / table / appendix.
- Explicitly mark each statement `CONFIRMED` | `LIKELY` | `UNCLEAR` |
  `NOT REPORTED`.
- Never fill missing implementation details through speculation. Write
  "Not established by the paper" instead of guessing.

## Paper Evidence State

For papers that matter (RESEARCH mode, core baselines, reproduction targets),
maintain the analysis as an updatable **Paper Evidence State** rather than a
one-shot summary — new appendices, code, or author responses update the state
instead of restarting the read. See `references/evidence-state.md`.

## Output — Research Card

The final artifact is a Research Card, never a section-by-section summary.
Full schema and a filled example: `references/research-card.md` and
`examples/research-card.example.md`.

```yaml
paper: {title, authors, venue, year}
problem: ...                 # one sentence, in your own words
core_idea: ...               # one sentence
minimal_pipeline: A -> B -> C -> D
key_claims: [{claim, mechanism, evidence, support, confidence, caveat}]
main_results: {dataset, metric, strongest_baseline, reported_result}
why_it_works: {author_explanation, independent_interpretation}
strongest_evidence: ...      # the single experiment that matters most
weakest_point: ...           # the most important unresolved issue
experimental_fairness: {model, data, compute, prompt, retrieval_budget, inference_budget}
relation_to_existing_work: {closest_methods, actual_difference}
relation_to_user_research: {overlap, difference, reusable, baseline, threat_to_novelty, opportunity}
research_hypotheses: [{gap, hypothesis, minimal_experiment, expected, interpretation}]
uncertainty: ...             # what remains unclear or unverified
next_action: [IGNORE | SAVE | CITE | COMPARE | USE_AS_BASELINE | REPRODUCE | INTEGRATE | INVESTIGATE]
```

`next_action` is mandatory: reading must terminate in a decision.

## Multi-Agent Escalation (optional)

When the host supports subagents and the mode is REVIEW or RESEARCH, the work
may be split by role — never "three agents each summarize the whole paper":

- **Reader** — what did the paper actually do? (steps 1–6)
- **Method Critic** — is the innovation real? what are the assumptions? (steps 3, 5, 7)
- **Experiment Critic** — do the experiments support the claims? (steps 4, 6, 7)
- **Research Judge** — what does this mean for the user's research? invoked
  only when Reader and Critics conflict (steps 8–9).

Do not enable multi-agent reading by default — it multiplies cost. Escalation
policy and prompts: `references/multi-agent.md`.

## Paper-Type Protocols

Different paper types use different reading protocols — a theory paper and a
benchmark paper should not be read the same way. See `references/paper-types.md`
for empirical-ML, agent-system, benchmark, theory, dataset, and survey
variants.

## Anti-Patterns

Do not:

- Summarize the paper section by section unless explicitly requested.
- Assume every claimed contribution is experimentally demonstrated.
- Equate higher end-to-end performance with proof of every proposed mechanism.
- Treat the author's interpretation as established fact.
- Invent missing implementation details.
- Spend equal effort on irrelevant sections.
- Generate generic research ideas disconnected from evidence.
- Confuse complexity with novelty.
- Continue deep reading after triage judged the paper irrelevant.

## Memory (long-term use)

When the user keeps a persistent literature base, store by *knowledge type*,
not by paper: concept memory, method memory, evidence memory, comparison
memory (the cross-paper matrix), and research-hypothesis memory. The
comparison matrix — papers × dimensions (memory, planner, verification,
learning, benchmark, ...) — is what reveals research gaps. Update the Paper
Evidence State and the matrix after every RESEARCH-mode read.
