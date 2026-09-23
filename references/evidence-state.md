# Paper Evidence State

A Paper Evidence State records how the reading atlas changes as new evidence arrives —
appendices, released code, author responses, reproduction attempts, follow-up
papers.

## Schema

```yaml
paper_state:
  paper: {title, id}
  version: 3                  # increments on every evidence update
  last_updated: 2026-09-23
  questions:
    Q1:
      question: "Does the memory mechanism improve adaptation?"
      claims: [C1]
      evidence: [E1, E2]
      status: PARTIALLY_SUPPORTED   # UNSUPPORTED | PARTIALLY_SUPPORTED | SUPPORTED | REFUTED
      uncertainty:
        - "no control for additional context tokens"
  claims:
    C1: {claim: ..., support: INDIRECT, confidence: LIKELY}
  evidence_log:
    - id: E1
      source: "Table 3, arXiv v1"
      type: ablation
      added_in_version: 1
    - id: E2
      source: "official repo, memory.py::update_memory"
      type: code
      added_in_version: 2
      note: "'dynamic update' is a fixed rule, not learned"
```

## Update rule

```
Paper Evidence State_t  +  new evidence  →  Paper Evidence State_{t+1}
```

Every update must record: what changed, which claim's support class moved and
why, and the evidence source. Statuses may move in both directions — newly
released code can *lower* confidence as easily as raise it.

## Paper ↔ Code cross-reading

When code is available, claims become checkable. For each mechanistic claim,
find the implementing function and verify what "dynamic", "learned", or
"adaptive" concretely means. Code is often more honest than the paper: record
discrepancies between the paper's language and the implementation in the
evidence log.

## Why it matters

A folder of per-paper summaries becomes a write-only pile. A set of evidence
states keyed by *research question* becomes a living map of what is known,
what is merely claimed, and what is still open — which is exactly where new
research hypotheses come from.
