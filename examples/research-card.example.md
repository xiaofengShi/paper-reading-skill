# Example Research Card (filled)

A condensed example for an imaginary agent-memory paper, showing the expected
granularity. Note the evidence pointers, the support classes, and the explicit
`NOT REPORTED` markers.

```yaml
paper:
  title: "MemGuide: Persistent Trajectory Memory for Long-Horizon Agents"
  authors: "A. Doe et al."
  venue: "arXiv preprint"
  source: "arXiv:2601.00001"
  reading_mode: RESEARCH

problem: >
  Long-horizon agents cannot reuse experience across tasks because raw
  trajectories are too long and too noisy to inject into context.

core_idea: >
  Compress successful trajectories into retrievable "skill memories" and let
  the planner retrieve them at decision time.

core_assumption: >
  Retaining historical successful trajectories improves future task
  performance. (Validated only indirectly — see C1.)

minimal_pipeline: >
  Trajectory → Compressor → Memory store → Retriever → Planner → Actor

key_contribution: >
  Compared with vanilla ReAct+RAG, they add a compressed skill-memory store
  with a retrieval-gated planner.

key_claims:
  - id: C1
    claim: "Skill memory improves cross-task adaptation"
    mechanism: [reuse of verified sub-plans, reduced exploration]
    evidence: ["Table 2 (main)", "Table 4 (ablation)"]
    support: DIRECT          # Table 4: w/ vs w/o memory, all else equal
    confidence: CONFIRMED
    caveat: ["only two QA-style benchmarks", "single backbone"]
  - id: C2
    claim: "The critic module further improves success rate"
    mechanism: [filtering noisy memories before storage]
    evidence: ["Table 4 (rows 3–4)"]
    support: WEAK            # +0.8, within run variance
    confidence: UNCLEAR
    caveat: ["no multi-seed runs", "variance not reported"]

main_results:
  dataset: "HotpotQA-hard, GAIA-subset"
  metric: "success rate"
  strongest_baseline: "ReAct+RAG (64.1)"
  reported_result: "68.2"
  absolute_gain: "+4.1"
  relative_gain: "6.4%"
  variance: NOT REPORTED

why_it_works:
  author_explanation: "Memory provides reusable priors for similar tasks."
  independent_interpretation: >
    Most of the gain likely comes from the memory store alone; the critic and
    reflection modules add 1.1 points combined (Table 4) and may be system
    complexity rather than mechanism.

strongest_evidence: "Table 4, row 1 vs 2 — isolated memory ablation (+3.0)"
weakest_point: >
  No control for the extra context tokens that retrieval injects; the gain may
  partly be a budget effect rather than a memory effect.

experimental_fairness:
  model_backbone: fair
  data: fair
  compute: "concern: ours uses ~1.4× inference tokens (Appendix C)"
  prompt: fair
  retrieval_budget: "concern: baselines capped at 5 docs, ours at 10"
  inference_budget: "concern: see compute"

critique:
  - dimension: ablation_completeness
    status: weak
    observation: "no sweep of memory update frequency; only present/absent"
    why_it_matters: "cannot tell whether the update rule matters or any memory works"
    resolving_experiment: "sweep update frequency {per-step, per-task, never}"

relation_to_existing_work:
  closest_methods: ["ReAct+RAG", "ExpeL"]
  actual_difference: "retrieval happens at planner level, not actor level"

relation_to_user_research:
  overlap: "memory-guided retrieval"
  difference: "we maintain an evidence state; they store raw compressed trajectories"
  reusable_components: ["trajectory compressor prompt (Appendix B)"]
  potential_baseline: yes
  threat_to_novelty: "low — no skill compilation, no evidence-state abstraction"
  opportunity: "test whether evidence-state memory beats raw-trajectory memory at equal budget"

research_hypotheses:
  - gap: "no equal-budget comparison of memory representations"
    hypothesis: "evidence-state memory dominates raw-trajectory memory when retrieval budget is fixed"
    minimal_experiment: "both memory types, 5-doc cap, HotpotQA-hard, 3 seeds"
    expected_observation: "evidence-state wins on precision-heavy tasks"
    interpretation: "if it does not win, representation is not the bottleneck — budget is"

uncertainty:
  - "memory update rule details NOT REPORTED in main text; check appendix/code"
  - "critic training signal unclear (Sec 3.4)"

next_action: [SAVE, COMPARE, USE_AS_BASELINE]
```
