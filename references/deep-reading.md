# Deep Reading protocol

Read this protocol when Deep Reading is selected. Use [reading modes](reading-modes.md) to distinguish it from Brief and [paper-type routes](paper-types.md) to select the actual evidence and operations. The goal is a reader being able to reconstruct the paper's technical argument using the HTML.

## 1. Map coverage before drafting

Read all substantive main sections, captions, table notes, and relevant appendices in the identified version. Inventory the central contributions, mechanisms, equations or theorems, experiment families, and important appendix extensions. Record missing source access immediately.

Keep a compact source-to-explanation table inside a Markdown audit comment. For each substantive source section or object, record its role, the chapter or passage that explains it, and its status: explained, secondary omission with a reason, or unavailable. Group related objects when one explanation covers them. References and administrative material need no separate entries. This record is an audit aid, not a reader-facing checklist or evidence of understanding.

```markdown
<!-- Deep Reading coverage
| Source section / object | Role in the argument | Explanation location / status |
| --- | --- | --- |
| TODO: exact section / equation / experiment | TODO: why it matters | TODO: chapter or missing coverage |
-->
```

Any unavailable core mechanism, decisive experiment, or required proof blocks a completed Deep Reading. Say what is missing instead of filling it from an abstract or another version. Secondary omissions must not remove a condition, negative result, or extension that changes the central interpretation.

## 2. Reconstruct each core mechanism

For every core mechanism, build a connected explanation of:

- The problem or constraint it addresses and the prior approach needed to understand that choice. Discuss an alternative only when supported by the paper or needed for explanation; label editorial reconstruction.
- Inputs, outputs, intermediate states, and transformations. Where relevant, identify shapes, units, masks, normalization, data or gradient flow, and what is learned versus fixed.
- How it connects to the other components, with training, inference, and evaluation kept distinct. Explain consequential branches and feedback.
- Why the authors expect the operation to help, which assumption makes that reasoning work, and what cost or failure mode remains.
- A representative input → operation → output trace or small worked example when the operation can be made concrete. Label teaching values and distinguish them from reported measurements.

Do not stop at a module list, flow-chart caption, or “this improves performance.” A compact diagram may orient the reader; prose and calculations must make its important arrows reconstructable.

## 3. Develop the mathematics or proof

For each central objective, equation, or theorem, explain the question it answers before presenting its formal expression. Define variables with their roles, dimensions or units, and state assumptions and conditioning. Show the consequential intermediate steps and why each follows; preserve denominators, constraints, masks, and loss support.

Then work a small calculation or proof dependency through to its output. Explain what changing a key parameter does and which boundary case breaks or changes the interpretation. For an optimization objective, distinguish the quantity being optimized from how it is estimated and updated. For a proof, connect assumptions and lemmas to the conclusion and its scope.

Do not invent a derivation the source does not provide. Label an explanatory derivation or teaching calculation as yours and verify its algebra. When the paper supplies only an empirical design or withholds implementation detail, explain that level of evidence. Papers without mathematical contributions use their actual operations and protocols; do not manufacture equations to satisfy a template.

## 4. Interpret the evidence by experiment family

Give each major experimental question enough space to explain its setup, data/split, comparator, metric and direction, unit and denominator, budget or harness conditions, key observations, bounded interpretation, and remaining uncertainty. Keep comparable numerical rows together with their baselines; a score list is insufficient.

Separate whole-system comparisons, controlled component ablations, sensitivity/scale/cost studies, and diagnostic examples. Explain which design question each can answer. Include consequential negative results, plateaus, exceptions, and trade-offs beside the affected claim. A compressed experiment matrix can index these explanations but cannot replace them.

Integrate relevant appendix protocols, additional controls, proofs, or extensions at the point where they affect interpretation. Secondary full tables may use native disclosures; the decisive comparator and reasoning must stay visible. Theory and survey papers use proof dependencies or taxonomy/coverage evidence in place of experiments.

## 5. Verify reconstruction before delivery

Use as many connected chapters as the argument needs. The five atlas layers are an organizing sequence, not five short cards or a length ceiling. Do not pad with repeated summaries, generic background, or speculative future work. Both modes keep the same scientific fidelity and offline delivery requirements.

Apply [reading quality checks](../evals/reading-quality.md). Every applicable depth dimension must score **3**, with concrete passages as evidence, and the coverage record must have no unresolved core omission. Repair a dimension scored 0–2 before calling the output a completed Deep Reading. Word count, a successful render, or a declared `deep` marker cannot substitute for this review.

Use paper-specific understanding checks when helpful to test reconstruction, a changed-input calculation, or the distinction between two evidence claims. Treat author or AI checks as author/AI checks; they do not establish independent human comprehension or experimental reproduction.
