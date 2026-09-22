# Multi-Agent Escalation

Optional architecture for hosts that support subagents. The default is a
single agent running the SKILL.md workflow; multi-agent reading multiplies
cost and should be earned by the paper's importance.

## Roles

Roles differ by *question*, not by section. Never assign "summarize section X"
— that reproduces the anti-pattern at higher cost.

- **Reader** — "What did the paper actually do?" Runs workflow steps 1–6 and
  drafts the claim graph.
- **Method Critic** — "Is the innovation real?" Audits novelty compression
  ("compared with X they add Y"), core assumptions, component necessity.
- **Experiment Critic** — "Do the experiments support the claims?" Runs
  claim-evidence alignment (DIRECT/INDIRECT/WEAK/UNSUPPORTED) and the
  critique matrix.
- **Research Judge** — "What does this mean for our research?" Resolves
  conflicts between Reader and Critics, then runs steps 8–9.

## Escalation policy

```
SCAN       → Reader
UNDERSTAND → Reader
REVIEW     → Reader + Experiment Critic
RESEARCH   → Reader + Method Critic + Experiment Critic
Conflict   → Research Judge (only when roles disagree)
```

The Judge is not a default stage — it exists to adjudicate, e.g. when the
Reader reports strong evidence and the Experiment Critic classifies the same
claim as INDIRECT.

## Data flow

```
Paper
  ↓
Reader  →  Claim Graph
              ↙        ↘
    Method Critic   Experiment Critic
              ↘        ↙
           (conflict?) → Research Judge
              ↓
         Research Card
```

The claim graph is the shared artifact: Critics annotate and attack it, they
do not re-read the whole paper from scratch. This keeps cost proportional to
the paper's importance rather than to the number of agents.
