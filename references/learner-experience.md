# Teach the reader before asking them to audit

Brief and Deep control coverage, not assumed expertise. Default to a researcher with the relevant field's usual foundations who has not read this particular paper. Use a stated background without asking a routine questionnaire; this is not a default beginner course.

<span id="mandatory-beginner-walkthrough-for-tutorials"></span>

## Reader calibration and walkthrough

Set the assumed background separately from Brief/Deep depth. For a researcher in the field, spend explanation on this paper's distinctive mechanism, notation, assumptions and evidence rather than reteaching common foundations. For a cross-field reader, add bridges only where their existing expertise stops being sufficient. For an explicitly requested beginner tutorial, introduce necessary basic concepts and intermediate steps. These are audience choices, not additional reading modes. Use the request's cues; do not require the user to choose a preset on every invocation.

Use the smallest explanation that lets this reader follow and assess the argument:

| Kind of information | Treatment |
| --- | --- |
| Paper-specific information needed to reconstruct or judge a claim | Explain in the main path for every audience: object roles, introduced notation, shapes or units where consequential, assumptions, key transformations, decisive comparators and protocol limits. Familiar terminology does not make a novel use self-explanatory. |
| A prerequisite this reader lacks and needs now | Give a brief bridge at first use, extending to one concrete calculation or example when a definition alone does not resolve the gap. Reuse that example rather than restarting it in every chapter. |
| Common foundations already covered by the assumed background | Omit the introductory lesson. If useful to some readers, put a short refresher in a labeled disclosure; a researcher need not reread what training, a gradient or a matrix is unless the paper uses it unusually. |
| Repeated definitions or secondary detail | Merge, remove or link within the document. Retain optional detail only when it answers a distinct question; do not hide essential qualifications or requested Deep reconstruction. |

For example, an ML researcher usually does not need an explanation of backpropagation, but still needs to know why this paper stops a gradient through one branch, which objective remains connected and how that changes the update. A data engineer without ML foundations may also need the input → prediction → loss → update bridge. Neither audience can skip the paper-specific mechanism.

Before drafting, identify which prerequisites this reader can be assumed to know and which missing ones block the central path. After rendering a tutorial, read the whole document and separately follow its recommended route as that reader, including disclosures, figures, code and answers. Check both directions: repair explanation gaps and remove unnecessary instruction. For each addition ask, **would deleting it prevent this reader from reconstructing the mechanism, using the example or judging the evidence and its limits?** If not, shorten, merge or omit it; a distinct secondary purpose may justify a disclosure. Do not explain a term merely because it appears, or impose a fixed word quota that crowds out essential reasoning.

Check consequential ambiguities, calculation steps, dimensions, denominators and code-to-operation links in context. For runnable exercises, include the working directory, necessary files, edit points and expected checks. Recalculate changed examples, confirm Markdown/HTML agreement and exercise affected interactions or code. Keep a compact audit record of assumed background, substantive gaps or redundancies, repairs and verification locations; no per-term ledger is required. Essential gaps for the intended reader block a completed tutorial; absent explanations of already-assumed foundations do not. Keep this process outside the lesson and label author/AI-assisted checking honestly, not as a human study.

## Build a learning path

Start with one recognizable situation and a question the reader can answer after reading. Show the actual object: a sequence of tokens, a vehicle and trajectory, a changing matrix, or a small geometric/proof construction. Explain where to look and what changes. For an unfamiliar central operation, work through a small instance before general notation. Reuse it as the explanation grows; mark invented values as teaching data.

For each difficult idea, connect **situation → picture → concrete operation → technical name → formal detail → evidence**. Adapt this order to the subject rather than manufacturing a simulation for a theorem or decorative art for a survey. A box containing a paragraph is a text card, not a mechanism illustration. Choose spatial arrangement, aligned values, arrows with verbs, or a state change that does explanatory work. Put a prose or table counterpart nearby.

Keep the first reading path short enough to hold in mind. Offer real anchor links to the essential sections; label the remaining material by its purpose. Put extended derivations, full protocols, and audit tables in native disclosures, retaining decisive qualifications and negative results visibly beside their claims. Deep content remains complete and reachable; do not hide the core transformation or evidence needed to understand a claim. Collect source identity and bibliographic URLs at the end. Keep coverage and production history in the audit source; do not make them the opening lesson. Follow [standalone delivery](standalone-delivery.md).

## Make a useful experiment visible

When changing an input exposes the mechanism, place the experiment where that input is first explained. State what to change, what to watch, and why the result changes. Start with a worked default and offer a reset. Show numerical output alongside visual movement; do not rely only on color, animation, hover, or a hidden tooltip. A slider that changes a decorative number is not sufficient. Avoid auto-play and respect reduced motion.

Use the renderer’s `paper-lab` block for a visible, self-contained sandboxed HTML experiment; `archify` remains available for optional supplementary views. Use native controls with labels, keyboard access, visible focus, and comfortable touch targets. Keep the default example and conclusion in static Markdown so offline/no-script/print readers still get the lesson. State when controls are unavailable without JavaScript. A simulated teaching example must never impersonate a paper’s empirical result.

End a local explanation with a small prediction, transfer, or diagnosis question, then reveal a grounded answer. A click or a completed control sequence is not a comprehension measurement.

## Check the experience separately from correctness

Check the first unfamiliar concept in the actual HTML: can the intended reader see its object, follow one operation, understand its terms, and say what the result means before seeing the general formula? Exercise the actual interaction offline, by pointer and keyboard, at narrow and wide widths. Check reset, boundary inputs, static fallback, and print/no-script content. Record these as interface checks. Only an actual reader session can establish where a person struggles; author judgment and passing automation do not establish learning efficacy.
