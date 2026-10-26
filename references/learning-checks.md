# Understanding checks

A reading can look complete while its reader still cannot explain the mechanism. Add a few focused checks to a DEEP READ when they support the requested understanding. Keep the main explanation visible; answer disclosures supplement it. Do not make questions a prerequisite for accessing the reading or force them into a requested scan.

Choose questions from the actual paper, not a reusable generic quiz:

- **Reconstruct:** trace one input, state, proof dependency, or data item through the mechanism. A good answer needs the consequential transformation and an assumption, not just module names.
- **Apply:** work a small, explicitly labeled teaching example, or change one assumption and predict the consequence. Preserve the paper's actual equation or protocol.
- **Interpret evidence:** name the task, comparator, metric, observed result, and the boundary of the conclusion. Ask whether two reported numbers really share a protocol, or whether an ablation isolates the stated effect.

Use two to four questions if that covers the key learning risks; choose fewer for a narrow request. Write a concise answer that can be checked against a source location and the explanation in the same document. Do not invent unreported results to fill a question. Keep author statements, observations, and editorial reasoning distinguishable.

The renderer's `paper-check` block uses native HTML disclosures and remains usable without JavaScript:

```json
{
  "title": "Check your understanding",
  "items": [
    {
      "question": "A paper-specific question that requires explaining or applying the mechanism",
      "hint": "Optional: the relevant concept or chapter",
      "answer": "A grounded explanation, including the condition or boundary that matters",
      "source": "PDF section, equation, figure, or table checked for this answer"
    }
  ]
}
```

Fields contain plain text. Put substantial formulas and derivations in the adjacent explanation rather than squeezing them into answer labels. The answer is hidden until the reader opens it; the question and optional hint stay visible. These checks are learning aids. No automatic score, checkbox completion, or revealed answer demonstrates human comprehension.

For an independent diagnostic, give a fresh reader only the HTML and questions. Keep answer keys separate until they finish; record their answers and whether they needed the PDF. The repository's [public reader-task protocol](../evals/reader-tasks.md) is for reviewers and future studies, not an answer source the author must load while writing. AI forward tests and AI reader simulations must be identified as such.
