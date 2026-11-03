# Optional critique matrix

Use for a requested credibility or weakness assessment after explaining the paper. Select relevant dimensions; theory, surveys and empirical work require different evidence. Record `ok | concern | weak | not assessable` with a concrete source location. Missing reporting limits assessment; it is not evidence that an unreported procedure failed.

For a substantive concern state **observation → consequence for the claim → evidence that could resolve it**. Resolution may be a proof repair, protocol clarification, code check or experiment; do not demand experiments for every criticism.

| Dimension | Questions to assess |
| --- | --- |
| Problem and novelty | Is the problem well posed? What changes relative to the closest relevant work? A complex contribution need not fit one sentence to be novel. |
| Design necessity | Which evidence isolates the claimed role of a component? What alternative explanation remains? |
| Comparison fairness | Are data, model class, prompts, training/compute and evaluation budgets comparable where needed? Explain consequential differences. |
| Controls and evidence | Does the test or proof support the strength of the claim? Whole-system gains alone do not isolate component causality. |
| Ablations and sensitivity | Do controls address central contribution claims and consequential parameters? Do not require one experiment per module mechanically. |
| Reliability | Are uncertainty, run variation and statistical tests reported where appropriate? A small incremental gain alone cannot establish necessity or irrelevance. |
| Generalization | Which tasks, domains, scales or assumptions were tested, and where does support end? |
| Cost and trade-offs | Are gains associated with extra compute, data, context or tool calls? Are relevant costs visible? |
| Reproducibility | Are the source, code, data and consequential settings accessible and version-matched? Mark missing items as not reported. |
| Hidden assumptions | Which assumptions are explicit, inherited or tested? For theory, check proof dependencies and scope directly. |

Avoid generic “more experiments” comments without a claim-specific gap. Do not infer that the largest increment is the only contribution: importance depends on uncertainty, cost, interactions and the research question.

```yaml
critique:
  - dimension: comparison_fairness
    status: concern
    observation: "Method uses 10 retrieved documents; baseline uses 5"
    consequence: "The gain may reflect retrieval budget rather than the new module"
    resolving_evidence: "A matched-budget comparison"
```
