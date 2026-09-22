# Research Card — Full Schema

One card per paper that survives triage. The card is the *only* final
artifact of the skill. It is deliberately claim-centered, not section-centered.

```yaml
paper:
  title:
  authors:
  venue:          # + year
  source:         # arXiv id / URL / local path
  reading_mode:   # SCAN | UNDERSTAND | REVIEW | RESEARCH

problem:          # one sentence, own words: "When XXX, existing methods XXX because XXX"
core_idea:        # one sentence
core_assumption:  # the assumption the whole paper rests on
minimal_pipeline: A -> B -> C -> D   # de-packaged system diagram in one line

key_contribution: # "Compared with X, they add Y." — one sentence

key_claims:
  - id: C1
    claim:
    mechanism:
    evidence:        # [Table 2, Figure 3, Sec 4.3, Appendix A.2]
    support:         # DIRECT | INDIRECT | WEAK | UNSUPPORTED
    confidence:      # CONFIRMED | LIKELY | UNCLEAR | NOT REPORTED
    caveat:

main_results:
  dataset:
  metric:
  strongest_baseline:
  reported_result:
  absolute_gain:
  relative_gain:
  variance:          # or NOT REPORTED

why_it_works:
  author_explanation:
  independent_interpretation:   # your own causal story — may differ

strongest_evidence:  # the single experiment that most supports the core claim
weakest_point:       # the most important unresolved scientific issue

experimental_fairness:
  model_backbone:    # fair | concern: ...
  data:              # fair | concern: ...
  compute:           # fair | concern: ...
  prompt:            # fair | concern: ...
  retrieval_budget:  # fair | concern: ...
  inference_budget:  # fair | concern: ...

critique:            # see references/critique-matrix.md
  - {dimension, status, observation, why_it_matters, resolving_experiment}

relation_to_existing_work:
  closest_methods:
  actual_difference:

relation_to_user_research:   # RESEARCH mode only; omit when no context
  overlap:
  difference:
  reusable_components:
  potential_baseline:
  threat_to_novelty:
  opportunity:

research_hypotheses:         # RESEARCH mode only
  - gap:
    hypothesis:
    minimal_experiment:
    expected_observation:
    interpretation:

uncertainty:        # everything still unclear or unverified, explicitly listed

next_action:        # one or more of:
                    # IGNORE | SAVE | CITE | COMPARE | USE_AS_BASELINE |
                    # REPRODUCE | INTEGRATE | INVESTIGATE
```

## Rules

- `next_action` is mandatory. Reading terminates in a decision, not prose.
- Every entry under `key_claims` and `main_results` needs an evidence pointer
  (table/figure/section/page) where determinable.
- Anything not stated in the paper is `NOT REPORTED`, never invented.
- The card fits on one screen. If it grows past that, the mode was too deep
  for the paper's value — compress, don't extend.
