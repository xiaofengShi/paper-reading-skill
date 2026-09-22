# Critique Matrix

Reviewer-mode checklist. For each dimension, record `status: ok | concern |
weak | not assessable` plus the evidence. Every criticism must be stated as:

```
Observation → Why it matters → Experiment that could resolve it
```

Generic comments ("more experiments are needed", "limited to one domain")
without a concrete missing control are forbidden.

## 1. Problem validity

- Is the problem real and well-posed, or a strawman?
- Is the failure of prior work demonstrated or merely asserted?
- Would solving it change anything downstream?

## 2. Novelty

- Compress the delta: "Compared with X, they add Y." If Y cannot be stated in
  one sentence, novelty is unclear.
- Check the closest 2–3 prior methods specifically, not the field in general.
- Distinguish new mechanism vs new combination of known mechanisms vs new
  packaging.

## 3. Necessity of components

- For each proposed module: what breaks when it is removed?
- Ablation slope tells the truth: if `Base 60 → +A 63 → +B 64 → +C 64.2`,
  module A is the contribution; B and C may be complexity.
- Are there modules no ablation isolates at all?

## 4. Baseline fairness

- Same backbone / model class?
- Same training data volume and quality?
- Same retrieval budget, inference-token budget, tool-call budget?
- Same prompts or equally-tuned prompts?
- Same training compute? Same evaluation protocol?
- Are baselines reproduced or copied from papers with different setups?

## 5. Experimental controls

- For each claim, is there a comparison that isolates exactly that variable?
- End-to-end wins with multiple simultaneous changes are INDIRECT evidence.

## 6. Evidence sufficiency

- Does the strongest claim rest on the strongest experiment, or on a
  correlational one?
- Correlation vs causation: does the paper show the mechanism causes the gain,
  or only that the system containing it wins?

## 7. Ablation completeness

- One ablation per claimed contribution, minimally.
- Are hyperparameters of the proposed module swept (update frequency, budget,
  threshold) or only present/absent?
- Are negative results reported?

## 8. Statistical reliability

- Multiple seeds / variance reported?
- Are gains larger than run-to-run noise?
- Significance testing where appropriate?

## 9. Generalization

- Single benchmark or family? Single domain? Single backbone?
- Held-out / out-of-distribution evaluation?
- Does the method scale, or only work at the tested size?

## 10. Compute/data fairness

- Does the proposed system secretly use more FLOPs, more data, more context
  tokens, or more retrieval calls than baselines?
- Is improvement bought with budget rather than mechanism?

## 11. Reproducibility

- Code, data, prompts, hyperparameters, seeds available?
- Appendix sufficient to re-implement without contacting the authors?
- Mark each missing item `NOT REPORTED` — never guess.

## 12. Hidden assumptions

- What must be true of the world/data/model for the method to work?
- Which assumptions are validated, which are silently inherited?
- Many research contributions are precisely *challenging* a hidden assumption
  of prior work — identify the assumption this paper itself makes; it is the
  attack surface for the next paper.

## Output format

```yaml
critique:
  - dimension: baseline_fairness
    status: concern
    observation: "Ours uses a retrieval budget of 10 docs vs 5 for baselines"
    why_it_matters: "gain may come from budget, not the verification module"
    resolving_experiment: "rerun strongest baseline at equal budget"
```
