# Teach the reader before asking them to audit

Brief and Deep control coverage, not assumed expertise. Default to an interested practitioner who has not studied this particular mechanism. Use a stated background without asking a routine questionnaire.

## Mandatory beginner walkthrough for tutorials

Apply this by default when producing a tutorial, including a Deep tutorial. Assume limited background in this topic, not inability to read code or use the reader's existing professional knowledge. Respect explicit expertise or scope; do not impose machine-learning prerequisites on unrelated subjects. Infer a reasonable starting point from the request and state it briefly, without a routine questionnaire.

Before drafting, identify the prerequisites needed to understand the central path. After rendering, read the actual document from beginning to end as that intended reader, including disclosures, figures, code and answers. Separately follow the recommended first-reading route in its stated order: a route can fail even when the full chapter order works. Locate and repair gaps rather than merely listing them in a review.

| Check at each relevant passage | Required repair when the reader would get stuck |
| --- | --- |
| What is this object, and what changes? | Distinguish inputs, targets, internal representations, configurable quantities and produced artifacts before relying on their names. In an ML tutorial, distinguish data, features, labels, parameters, training, inference and evaluation where needed. |
| What does this term or symbol mean here? | Explain unfamiliar terms and acronyms where first used; disambiguate reused words such as model/sampling/loss weight or regression task/regression test. A distant glossary is insufficient. |
| Can I follow one operation without the prerequisite course? | Reuse a small concrete example across adjacent stages; show intermediate values, dimensions, units and denominators, then connect them to the general form. Defining symbols or giving a final number alone is insufficient. |
| Why does this result justify the next step? | Explain the local reason and limits in plain language. For example, compare nearby parameter values before introducing a gradient; do not imply every training update improves unseen data. |
| Can I understand this comparison? | Explain the metric direction, baseline, population, protocol and uncertainty as needed. Distinguish expected counts from guarantees, repeated exposure from unique coverage, and fitting from generalization. |
| Can I perform the suggested action? | Connect code to the explained operation; specify inputs, working directory, concrete edit points, expected output and how to inspect it. Separate optional tooling from the core reading. |

Place necessary bridges in the main path. Put advanced derivations or secondary checks in labeled disclosures, preserving decisive assumptions and requested depth. Avoid expanding every term into a detached encyclopedia: add the explanation needed for this argument, reuse it, and remove redundant restatements. An attractive layout or a larger glossary does not repair a missing conceptual step.

Recheck the repaired passages in context, recalculate changed examples, confirm Markdown/HTML agreement and exercise affected interactions or code. Keep a short audit comment or companion record with reader assumptions and `chapter/passage → gap → repair → verification or unresolved limit`. Essential gaps must be repaired before claiming the tutorial is complete. Do not expose this production ledger throughout the lesson. This is an author/AI-assisted walkthrough, not a real beginner session or evidence of learning gains.

## Build a learning path

Start with one recognizable situation and a question the reader can answer after reading. Show the actual object: a sequence of tokens, a vehicle and trajectory, a changing matrix, or a small geometric/proof construction. Explain where to look and what changes. Then work through a small instance before general notation. Reuse that instance as the explanation grows; mark invented values as teaching data.

For each difficult idea, connect **situation → picture → concrete operation → technical name → formal detail → evidence**. Adapt this order to the subject rather than manufacturing a simulation for a theorem or decorative art for a survey. A box containing a paragraph is a text card, not a mechanism illustration. Choose spatial arrangement, aligned values, arrows with verbs, or a state change that does explanatory work. Put a prose or table counterpart nearby.

Keep the first reading path short enough to hold in mind. Offer real anchor links to the essential sections; label the remaining material by its purpose. Put extended derivations, full protocols, and audit tables in native disclosures, retaining decisive qualifications and negative results visibly beside their claims. Deep content remains complete and reachable; do not hide the core transformation or evidence needed to understand a claim. Collect source identity and bibliographic URLs at the end. Keep coverage and production history in the audit source; do not make them the opening lesson. Follow [standalone delivery](standalone-delivery.md).

## Make a useful experiment visible

When changing an input exposes the mechanism, place the experiment where that input is first explained. State what to change, what to watch, and why the result changes. Start with a worked default and offer a reset. Show numerical output alongside visual movement; do not rely only on color, animation, hover, or a hidden tooltip. A slider that changes a decorative number is not sufficient. Avoid auto-play and respect reduced motion.

Use the renderer’s `paper-lab` block for a visible, self-contained sandboxed HTML experiment; `archify` remains available for optional supplementary views. Use native controls with labels, keyboard access, visible focus, and comfortable touch targets. Keep the default example and conclusion in static Markdown so offline/no-script/print readers still get the lesson. State when controls are unavailable without JavaScript. A simulated teaching example must never impersonate a paper’s empirical result.

End a local explanation with a small prediction, transfer, or diagnosis question, then reveal a grounded answer. A click or a completed control sequence is not a comprehension measurement.

## Check the experience separately from correctness

Check the first unfamiliar concept in the actual HTML: can the intended reader see its object, follow one operation, understand its terms, and say what the result means before seeing the general formula? Exercise the actual interaction offline, by pointer and keyboard, at narrow and wide widths. Check reset, boundary inputs, static fallback, and print/no-script content. Record these as interface checks. Only an actual reader session can establish where a person struggles; author judgment and passing automation do not establish learning efficacy.
