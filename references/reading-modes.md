# Reading Modes

Four reading depths. Select exactly one before starting; escalate only when
triage or the user justifies it. Cost grows roughly 10× per level.

## SCAN — is it worth reading?

Read in this order (never start at the first line of the introduction):

```
Title → Abstract → Figure 1 → Conclusion → Main Table → Introduction
```

Answer five questions:

1. **Problem** — what does it actually solve?
2. **Motivation** — why do existing methods fail?
3. **Idea** — what is the single core new idea?
4. **Evidence** — what does it offer as proof?
5. **Relevance** — what does it have to do with the user's research?

Output: the 3-sentence verdict

> Existing XXX methods suffer from XXX. This paper proposes XXX, which solves
> it by XXX. On XXX benchmark it improves over XXX by XXX.

plus `relevance: high|medium|low` and `recommended_depth`. If the 3-sentence
verdict cannot be written, re-scan before escalating.

**Decision after SCAN (exactly one):**

- `A. Not relevant` → stop, record one line in the literature log.
- `B. Reference value` → save metadata + verdict, no deep read.
- `C. Highly relevant` → escalate to UNDERSTAND or beyond.

The most expensive reading habit is spending 40 careful minutes on every
paper. Most papers should be filtered out within 5 minutes.

## UNDERSTAND — how does the method work?

Do not read in page order. Read:

```
Problem → Method Overview → Core Modules → Loss/Training → Experiments → Ablations
```

Build the causal chain:

```
Problem → why prior methods fail → proposed mechanism →
why it should work in principle → which experiment validates it
```

Translate the method into the simplest possible system diagram, then ask:
*which arrow in this diagram is actually new?* Many heavily packaged papers
reduce to one added module (`Retriever → Verifier`) or one added signal
(`Memory → Planner`). De-packaging is the core skill of this mode.

Carry out SKILL.md workflow steps 1–6.

## REVIEW — is it credible?

Add step 7. For every major claim, identify the exact claim, the supporting
experiment, whether the evidence is DIRECT/INDIRECT/WEAK/UNSUPPORTED,
alternative explanations, and missing controls. Then run the full critique
matrix (`references/critique-matrix.md`).

Output focuses on: claim-evidence alignment, fairness findings, and the
ranked list of weaknesses most likely to be attacked by a reviewer.

## RESEARCH — what does it mean for my work?

Add steps 8–9. Everything in REVIEW, plus:

- overlap / difference / conflict / opportunity vs the user's current project
- threat-to-novelty assessment (could this paper absorb the user's contribution?)
- reusable components and potential baselines
- grounded research hypotheses: `Gap → Hypothesis → Minimal Experiment →
  Expected Observation → Interpretation`
- an updated Paper Evidence State (`references/evidence-state.md`) and, if a
  literature base is maintained, an updated comparison-matrix row

## Depth ladder (expected distribution)

| Level | Time | Goal | Fraction of papers |
|---|---|---|---|
| L0 SCAN-lite | 1–2 min | relevant at all? | 100% |
| L1 SCAN | 5–10 min | core idea + verdict | ~30% |
| L2 UNDERSTAND/REVIEW | 30–60 min | method + experiments | ~10% |
| L3 RESEARCH | 2h+ | reproduce / improve / compare | 2–3% |

Reading 100 papers at L2 depth is a failure of triage, not diligence.
