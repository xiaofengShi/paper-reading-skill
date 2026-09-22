# Paper-Type Protocols

Different paper types deserve different reading protocols. Identify the type
at triage (Step 2) and apply the matching variant.

## empirical-ml (default)

The SKILL.md workflow as written. Emphasis: ablation completeness, baseline
fairness, statistical reliability.

## agent-system

Papers proposing agent pipelines, tool use, memory, or multi-agent systems.

- De-package the loop: `Query → Planner → Retrieve → Evidence → Critic →
  Answer`. Identify which arrow/module is actually new.
- Budget audit: retrieval calls, tool calls, context tokens, and inference
  cost vs baselines are first-class fairness dimensions.
- Beware of gains that come from more turns/tokens rather than a better
  mechanism.
- Check failure analysis: agent papers live or die by their error taxonomy.

## benchmark

A benchmark paper is an argument about what the field should measure.

- Core claims are about the *data*, not a model: coverage, difficulty,
  contamination resistance, annotation quality, agreement statistics.
- Check the construction pipeline and quality control: how were items made,
  filtered, validated? What fraction was rejected?
- Check what the benchmark *fails* to measure; every benchmark has blind spots.
- Leaderboard results are secondary — the evidence to verify is "this
  benchmark discriminates meaningfully between models".

## theory

- The claim graph is a proof graph: theorem → assumptions → proof technique.
- Verify assumptions first; a strong theorem under unrealistic assumptions is
  a weak contribution.
- Check whether the theory predicts anything falsifiable about practice, and
  whether the paper tests that prediction.
- Evidence classes do not apply; replace Step 4 with assumption auditing.

## dataset

Like benchmark, but the contribution is training data.

- Construction pipeline, licensing, dedup/decontamination, provenance.
- Evidence of utility: controlled experiments training on this data vs
  alternatives, at equal scale.

## survey

- Do not read linearly. Extract the taxonomy and the comparison dimensions.
- The value of a survey is its *map*: routes A/B/C with representative papers.
- Use it to plan further reading: pick 3–5 representative works per route,
  then read those with the empirical-ml protocol.
- Watch for survey bias: what does the taxonomy hide or merge?
