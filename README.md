# Paper Research Skill — Evidence-Grounded Paper Reading for AI Agents

[![Website](https://img.shields.io/badge/Project-Website-216158.svg)](https://xiaofengshi.github.io/paper-reading-skill/)
[![Skill](https://img.shields.io/badge/Format-Agent%20Skill-4B8BB2.svg)](SKILL.md)
[![Agents](https://img.shields.io/badge/Agents-Codex%20%C2%B7%20Claude%20Code%20%C2%B7%20Kimi%20Code-6b31e3.svg)](#-installation)
[![License](https://img.shields.io/badge/License-MIT-0f766e.svg)](LICENSE)
[![Cite](https://img.shields.io/badge/Cite-CITATION.cff-b31b1b.svg)](CITATION.cff)

## 🌐 Project Homepage

**[Visit the Paper Research Skill homepage →](https://xiaofengshi.github.io/paper-reading-skill/)**

<https://xiaofengshi.github.io/paper-reading-skill/>

Explore the methodology, the four reading modes, the workflow, the multi-agent
architecture, and the installation guide.

---

> A cross-agent skill that turns paper reading from *summarizing* into
> *evidence-grounded research analysis* — claims, mechanisms, evidence
> strength, fairness checks, weaknesses, and actionable research hypotheses.

> 🚧 **Status:** v0.1 — the core skill, reference protocols, and templates are
> complete and usable. Paper-type expansions and memory tooling are evolving.

---

## 📖 Introduction

Most "paper reader" prompts produce a second-hand abstract. Research needs
something else: *what does this paper claim, what evidence supports each
claim, is the evidence fair, what remains unproven, and what should I do
about it?*

**Paper Research Skill** encodes a disciplined reading methodology as an
agent skill:

- 🧭 **Claim-centered, not section-centered** — every paper is decomposed into
  `Problem → Hypothesis → Mechanism → Claim → Evidence → Limitation → Research Implication`.
- 🪜 **Four reading depths** — SCAN / UNDERSTAND / REVIEW / RESEARCH, with
  early-stop triage so irrelevant papers cost minutes, not hours.
- 🔬 **Evidence verification** — every claim is classified
  `DIRECT / INDIRECT / WEAK / UNSUPPORTED`, with a fixed reviewer-style
  critique matrix (baseline fairness, ablation completeness, statistical
  reliability, …).
- 🃏 **Research Cards, not summaries** — the output is a one-screen structured
  card that always ends in a decision (`next_action`).
- 🔄 **Paper Evidence State** — an updatable understanding state that absorbs
  appendices, code, and author responses over time instead of a write-once summary.
- 🤝 **Optional multi-agent escalation** — Reader / Method Critic / Experiment
  Critic / Research Judge, invoked by role, not by section.

## 🏆 The Four Reading Modes

| Mode | Question it answers | Cost | Output |
|---|---|---|---|
| **SCAN** | Is it worth reading? | ~5–10 min | 3-sentence verdict + relevance |
| **UNDERSTAND** | How does the method work? | ~30–60 min | Minimal pipeline + causal chain |
| **REVIEW** | Is it credible? | +critique | Claim–evidence alignment + weaknesses |
| **RESEARCH** | What does it mean for *my* work? | 2h+ | Gaps, hypotheses, next experiments |

Expected distribution over 100 papers: **100 SCAN → ~30 deep-scan → ~10
UNDERSTAND/REVIEW → 2–3 RESEARCH**. Reading every paper at full depth is a
triage failure, not diligence.

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────┐
│ Layer 1 — Workflow        Scan → Understand → Verify →     │
│                           Critique    (fixed discipline)   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ Layer 2 — Evidence State  Claim ↔ Evidence ↔ Confidence    │
│                           ↔ Uncertainty (living state)     │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ Layer 3 — Research Agent  Compare / Challenge / Connect /  │
│                           Hypothesize (open judgment)      │
└────────────────────────────────────────────────────────────┘
```

The workflow constrains *how* to read scientifically; the evidence state
tracks *what is currently known*; the agent decides *what is worth pursuing
next*.

## 📂 Repository Structure

```
paper-reading-skill/
├── SKILL.md                        # the skill — entry point for agents
├── references/
│   ├── reading-modes.md            # SCAN / UNDERSTAND / REVIEW / RESEARCH procedures
│   ├── critique-matrix.md          # 12-dimension reviewer checklist
│   ├── research-card.md            # full Research Card schema
│   ├── evidence-state.md           # Paper Evidence State schema + update rule
│   ├── paper-types.md              # per-type protocols (empirical, agent, benchmark, …)
│   └── multi-agent.md              # Reader/Critic/Judge roles + escalation policy
├── examples/
│   └── research-card.example.md    # a filled Research Card
├── docs/                           # GitHub Pages project homepage
├── CITATION.cff
└── LICENSE
```

## 🚀 Installation

Copy the skill into your agent's skill directory:

```bash
# Claude Code / Kimi Code (user scope)
git clone https://github.com/xiaofengShi/paper-reading-skill.git
cp -r paper-reading-skill ~/.agents/skills/paper-reading

# or project scope
cp -r paper-reading-skill <your-project>/.claude/skills/paper-reading
```

Then just ask, e.g.:

- *"用 SCAN 模式过一下这篇 arXiv:xxxx.xxxxx，值不值得精读？"*
- *"仔细分析这篇论文，我要把它作为 baseline"* → UNDERSTAND + REVIEW
- *"和我的方法比较一下这篇工作，有没有 novelty 威胁？"* → RESEARCH

## 🧪 Methodology in One Paragraph

Read in passes, not in pages. Triage first (title → abstract → Figure 1 →
main table → conclusion) and stop early for irrelevant papers. For the rest,
build a claim graph, classify the evidence behind each claim, audit fairness
and ablations like a reviewer, compress the novelty into *"Compared with X,
they add Y"*, connect the paper to your own research (overlap, difference,
threat to novelty, opportunity), and finish with a Research Card that ends in
a concrete `next_action` — plus one falsifiable research hypothesis per paper
that matters.

## 📚 Related Work

The methodology distilled in this skill follows the classic three-pass
reading tradition and extends it with claim–evidence alignment, evidence
states, and agent-native memory, designed for LLM agents such as Codex,
Claude Code, and Kimi Code.

## 📝 Citation

If this skill is useful in your work, you can cite the repository:

```bibtex
@misc{shi2026paperresearchskill,
  title  = {Paper Research Skill: Evidence-Grounded Paper Reading for AI Agents},
  author = {Xiaofeng Shi},
  year   = {2026},
  url    = {https://github.com/xiaofengShi/paper-reading-skill}
}
```

Machine-readable metadata: [CITATION.cff](CITATION.cff).

## 📄 License

[MIT](LICENSE) © 2026 Xiaofeng Shi
