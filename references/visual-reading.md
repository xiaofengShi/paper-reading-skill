# Visual reading

## Choose a view by the reader's question

| Question | Useful view |
| --- | --- |
| How does the argument fit together? | Concept map or argument graph |
| What happens, and in which order? | Workflow or data flow with consequential branches |
| Why should the mechanism or proof work? | Mechanism detail or proof dependency graph |
| What was tested and what does it support? | Experiment/comparison matrix or chart with protocol and scope |

Select only views that make a relationship clearer than prose alone; combine views when complexity warrants it. Use readable labels and meaningful arrows, with adjacent prose or a table carrying the essential explanation. Text-filled cards and navigation lists do not substitute for a needed mechanism illustration. Keep actual navigation in accessible HTML links. Distinguish explanatory reading order from the paper's process; place cross-cutting infrastructure beside what it supports rather than inventing a later phase.

Source consequential paper facts in the audit copy or supported provenance fields. The renderer's block schemas require their documented source fields. Provide a visible cue for an original figure: what question it answers, which panel/axis/path matters and what to learn. This may be concise adjoining prose or a caption that actually explains the figure; a hidden page badge or figure number alone is insufficient. Label quantitative redraws and identify their original figure/panel. Retain an original excerpt when its omitted information changes the reading, and keep decisive numerical rows and conditions accessible.

## Interaction is a choice

Use interaction when changing a parameter, following a data item, selecting a branch or comparing states reveals a paper-specific relationship. If a static diagram, example or table communicates it adequately, use that. No interaction quota or routine justification of every static view is required. For a substantive interactive model, record its intended reader action, teaching assumptions and verification in a compact audit note.

Place a useful interaction beside the relevant explanation. State what to change, what to observe and why; provide a worked default and reset when controls change state. Use labeled native controls, keyboard access and visible focus. Do not rely only on color, animation, hover or tooltips. Avoid autoplay and respect reduced motion. Check relevant boundary inputs. Teaching simulations must remain distinguishable from reported empirical results.

The central relationship, default example and takeaway must remain readable offline, without scripts and in print. Check actual controls with pointer and keyboard at narrow and wide widths. A decorative control adds no explanatory value; simplify it.

## Implementation options

The renderer's `paper-lab` embeds a visible sandboxed HTML experiment. Inline SVG, HTML charts/tables and original figures are also suitable. Optional Archify can supply typed JSON and self-contained workflow views; if used, retain its source and validate it with its documented tools. An equivalent local HTML/SVG implementation is sufficient when it is unavailable. Tool availability alone does not determine the explanation format, and no other skill is required.

Follow the [renderer input contract](renderer-format.md) for syntax, asset embedding and source fields. Structural validation does not check scientific accuracy. Verify the view against the identified paper and confirm that its arrows, values and visible conclusions agree with the surrounding text.
