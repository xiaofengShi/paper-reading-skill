# Renderer input format

This is the complete input contract for [render-reading.cjs](../scripts/render-reading.cjs). The Markdown audit source it consumes becomes one offline HTML reading page. The build enforces the explicit structural and numeric checks listed below — missing required fields, bad numbers, escaping paths, and malformed blocks throw before any output is written. It cannot check semantic truthfulness: whether a number matches the paper, whether an explanation is right, or whether a reader will understand. Those stay in the human review gates ([evals/reading-quality.md](../evals/reading-quality.md)). Example sources in [examples/](../examples/) are the reference for editorial style — this file is the reference for what the parser accepts.

## File header

The first lines are positional:

```markdown
<!-- paper-reading-lang: en -->
<!-- paper-reading-theme: forest -->
```

- Line 1 is required and must be exactly `<!-- paper-reading-lang: en -->` or `<!-- paper-reading-lang: zh-CN -->`. It sets the HTML `lang`, interface labels, and chart wording.
- Line 2 is optional and must immediately follow line 1. Allowed themes: `forest`, `cobalt`, `plum`, `saffron`. The default is `forest`.
- No other header markers exist. The page title is the text of the first `# h1`; the hero subtitle is the `thesis` of the first `paper-map` (or a generic line if absent). Put exactly one `# h1` at the top of the body — it is lifted out of the article and used in `<title>` and the hero.

## Headings and navigation

- `## h2` headings become the left navigation (ids `section-1…N`, numbered in source order). Keep them short; a `01 / 名称` prefix is convention, not syntax.
- `###` and deeper render inline and are not in the navigation.
- Headings must not end with sentence punctuation (`。.？?！!：:;；`) — a repo test enforces this across all published readings.

## Custom fenced blocks

Place each block at the top level of the Markdown with blank lines around it. The info string must be exactly the keyword; the body is one JSON object. **All string fields are escaped plain text** — no Markdown, HTML, or math inside them. Custom blocks inside a list or blockquote fail with `Custom visual blocks and display math must be at the top level`. Ordinary fenced or indented code and inline code spans are preserved; showing the block syntax inside a Markdown code example does not execute it.

Every block requires a non-empty `source` field on each fact-bearing item; a missing source throws `A visual fact is missing its source`. The source renders as a hidden badge revealed by the “显示原文定位 / Show source locations” toggle.

Required non-empty text fields (empty strings and missing keys are rejected, never rendered as `undefined`): `paper-map` items need `number`, `label`, `text`; `paper-path` needs `title` and stage `title`, `role`, `action`, `why`, `output`; `paper-contrast` needs `title`, `intro` and branch `name`, `lead`, `scope`, `judge`, `signal`, `why`; `paper-experiments` needs `title` and row `question`, `setup`, `observation`; `paper-chart` needs `title` and row `label`. Everything else stays optional: `paper-path.cost`, `paper-experiments.conclusion`, `paper-map.thesis` / `outcome` / `outcomeSource` / `signal`, and chart `subtitle` / `origin` / `note` / `unit` / `domainMax` / `approx`. Note that `signal` is optional on a `paper-map` item but **required** on a `paper-contrast` branch (it is one of the branch fields listed above). The `signal` field on a contrast branch renders under the label “作用机制 / How it works” — describe the mechanism, not a learning effect.

### `paper-map` — whole-paper map cards

```json
{
  "thesis": "One-sentence claim of the paper (hero subtitle; only the first map uses it)",
  "reader": "Optional: relevant background and any prerequisite explained in this reading",
  "goals": ["Optional: one concrete task the reader can attempt afterward"],
  "outcome": "What the work delivers (hero footer line)",
  "outcomeSource": "PDF §§…",
  "items": [
    { "number": "01", "label": "问题", "signal": "short tag", "text": "…", "source": "PDF §1" }
  ]
}
```

`items` is required and non-empty. `number`, `label`, `text`, `source` are used for every item; `thesis`/`outcome`/`outcomeSource`/`signal` matter only on the **first** `paper-map`, which becomes the hero map beside the title. Later maps render as an inline card grid.

Optional `reader` and `goals` appear beside the first map in the title area. `reader` must be non-empty text; `goals` must be a non-empty array of non-empty text. Use a short set of concrete learning tasks, not a claim that understanding has been measured. Existing sources without these fields keep their original layout.

### Optional evidence disclosures

For extended protocols, complete secondary tables, or an advanced derivation, use native HTML with **blank lines around the Markdown inside**:

````markdown
<details class="reading-detail">
<summary>Full comparison table and evaluation conditions</summary>

The detailed explanation, a Markdown table, display math, or a custom block goes here.

</details>
````

Keep these tags at the Markdown top level; do not indent them into a list or quote. Use `###` rather than `##` for headings inside a disclosure so the chapter navigation does not point into closed content. The control works without scripts. Keep the decisive comparison, counterexample, and interpretation visible outside it; disclosures hold supporting detail rather than the explanation needed to understand the conclusion.

### `paper-path` — staged method path

```json
{
  "title": "…",
  "intro": "optional lead-in",
  "stages": [
    {
      "title": "…", "role": "short role tag", "action": "what happens",
      "why": "design reason: the constraint it addresses and the expected mechanism",
      "cost": "optional: cost or assumption introduced",
      "output": "what this stage leaves behind",
      "source": "PDF §…"
    }
  ]
}
```

`stages` is required and non-empty. `cost` is optional and renders as a third “代价 / 假设” card when present — use it for the trade-off or assumption of the design choice, so the path can answer SKILL.md’s constraint / mechanism / cost triad.

### `paper-contrast` — exactly two mechanism branches

```json
{
  "title": "…", "intro": "…",
  "branches": [
    { "name": "…", "lead": "…", "scope": "…", "judge": "…", "signal": "…", "why": "…", "source": "PDF §…" },
    { "name": "…", "lead": "…", "scope": "…", "judge": "…", "signal": "…", "why": "…", "source": "PDF §…" }
  ]
}
```

`branches` must contain exactly two items or the build throws.

### `paper-experiments` — experiment atlas rows

```json
{
  "title": "…",
  "rows": [
    {
      "question": "…",
      "setup": "setup / comparator / metric",
      "observation": "observed result, with denominators and units",
      "conclusion": "optional: the bounded reading the observation supports",
      "source": "PDF §…, Table/Fig…"
    }
  ]
}
```

`rows` is required and non-empty. `conclusion` is optional and renders as a labeled “结论” line under the observation — use it so interpretation stays distinct from the measured result.

### `paper-chart` — three chart types

Shared fields: `type` (required), `title`, `subtitle`, `origin` (kicker above the title; label redraws here, e.g. `本文重绘 · 原论文 Fig. 5`), `source` (required), `note` (figcaption), `rows` (required, non-empty).

- `type: "segments"` — 100% stacked bar. Rows: `{ "label", "value", "unit"? }`. Row values must total 100 ± 0.2 or the build throws.
- `type: "paired"` — before→after dumbbell on a percentage scale. Rows: `{ "label", "before", "after", "approx"? }` with both numbers in [0, 100]. Renders a data table with the delta. Use for percentage metrics only.
- `type: "bars"` — horizontal bars on an arbitrary non-negative numeric domain. Rows: `{ "label", "value", "approx"? }` with finite `value ≥ 0` (negatives throw). Optional `unit` (appended to values and axis), optional `domainMax` (scale maximum; defaults to the largest row value). Renders a data table. Use this for counts, token budgets, BLEU, latency — anything that is not a 0–100 percentage.

Charts carry a visible `origin`/`source` pair and a `<details>` data table so the numbers survive without the graphic.

### `<!-- archify:file.html|title -->` — embedded interactive view

An HTML comment at the top level, not a fence. The file path is relative to the audit source and must stay inside its directory subtree after symlinks are resolved. The page is inlined as an iframe `srcdoc` inside a disclosure; its inline scripts remain available under `sandbox="allow-scripts"`. Optional Google Fonts `<link>` tags are removed so the page uses its system-font fallback. Any other unresolved resource (including remote or relative scripts, images, stylesheets, and CSS `url()` requests) aborts the build. SVG namespaces, fragment references such as `url(#arrowhead)`, embedded data URLs, and ordinary external hyperlinks remain valid.

Embed HTML that is already self-contained: the renderer validates its declared assets rather than fetching or bundling arbitrary websites. It adds a Content Security Policy to the reading and embedded page, including `connect-src 'none'`, to block runtime network requests. Static checks cannot establish that arbitrary inline JavaScript is useful without a network; exercise each interaction in an offline browser before publishing. Interactive views are optional — record why one helps (or why a static view suffices) in a Markdown comment in the audit source, per [visual-reading](visual-reading.md).

## Figures and images

- The special figure treatment requires this exact shape (image, blank line, one italic caption line):

  ```markdown
  ![Alt text describing the figure](assets/paper-fig1.png)

  *原论文 Fig. 1，PDF p. 2。reading notes…*
  ```

  This produces the scrollable `<figure class="paper-figure">` with a reading hint. Markdown image titles (`![Alt](figure.png "Title")`) and reference-style images also work. A multi-line caption, a bold-wrapped caption (`**…**`), or a missing blank line falls back to a bare image — keep captions single-line and wrapped in one `*…*` (or `_…_`). Bold text inside the italic caption is supported.
- Image paths are relative to the audit source and must resolve inside its directory both lexically and after symlinks are resolved (`../`, absolute paths, and symlinks to outside files throw). URL-encoded filenames and parenthesized filenames in normal Markdown syntax are supported. Extensions are case-insensitive: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`. Images are inlined as base64; supported image data URLs may also be used directly. SVG assets are checked for unresolved nested resources.
- Hand-written `<img>` HTML is also inlined, independently of attribute order, quote style, case, or presence of `alt`. Write useful alt text for readers even though the parser does not require it. Preserve display attributes such as `width`, `height`, and `class` as needed. `srcset`/`imagesrcset` are rejected; use one image source for a standalone reading.
- Put a visible reading cue in the prose **before** every original figure; the caption adds provenance and is not the only explanation.

## Offline asset checks

The renderer checks browser asset requests in HTML attributes, inline styles, `<style>` blocks, SVG images, and embedded iframe documents. A regular HTTPS paper link is navigation and remains clickable; it does not make the reading depend on a network. Local images in the Markdown or raw `<img>` tags are embedded. Other source assets must already be embedded: a relative stylesheet or script is a build error, as is a remote asset. Inline SVG fragment references and data URLs remain valid. CSS `@import` and `image-set()` are unsupported; inline the stylesheet and use an embedded `url()` instead. Document bases, redirects, external XML entities, and object/embed resources are rejected.

These are delivery checks, not an HTML sanitization service or a scientific-fidelity check. Use trusted source files. The generated CSP blocks network assets and connections, while allowing the inline styles and scripts needed by self-contained interactive diagrams. It does not prove the meaning or correctness of arbitrary scripts; browser interaction checks remain necessary.

## Source citations

Two mechanisms hide citations until the reader enables the source toggle:

1. **Automatic** — these literal patterns are wrapped as hidden refs: `（PDF…）`, `(PDF…)`, `，PDF p./pp. N[-M]` before `。`, and bare `PDF p./pp. N[-M]` anywhere. The parenthesized forms work with any inner text containing `PDF` (including `PDF §3.2`); bare `§3.2` or `附录 A.3` without the word `PDF` is **not** auto-wrapped.
2. **Manual** — `<span class="source-ref">…</span>` written directly in the Markdown for custom phrasing (e.g. the opening provenance block).

Figure identifiers (`Fig. 5`, `Table 1`) must stay visible even when page numbers are hidden.

## Math

- `$$…$$` on its own line(s) for display math; `$…$` for inline math (single line, no nested `$`). A trailing `，。；：、,.;:` right after the closing `$` is absorbed into the math unit so punctuation stays attached.
- KaTeX renders with `throwOnError` — invalid LaTeX aborts the build. Avoid bare `$` (e.g. prices).
- Keep display math at the top level with blank lines around the block; an inline formula that lands alone in a paragraph usually belongs in a display block.
- Dollar syntax inside inline, fenced, or indented code remains literal, including invalid LaTeX shown as a code example. For a literal dollar in ordinary prose, escape it as `\$`.

## Build errors (quick index)

| Message | Cause |
|---|---|
| `Declare the reading language on the first line…` | missing/malformed lang marker |
| `Unknown paper-reading theme: …` | theme outside the four allowed values |
| JSON `SyntaxError` | malformed block body |
| `paper-map needs items` / `paper-path needs stages` / `paper-experiments needs rows` | empty required array |
| `paper-contrast needs two branches` | branches ≠ 2 |
| `A visual fact is missing its source` | any visual item without `source` |
| `Unknown paper-chart type: …` | `type` not `segments` / `paired` / `bars` |
| `Segments do not total 100: …` | segment values off by more than 0.2 |
| `Invalid before/after for …` / `Invalid bar value for …` | out-of-domain chart number |
| `Visual must stay beside source: …` | image/archify path escaping the source directory, including a symlink escape |
| `Unsupported image: …` / `Unsupported image source: …` | unsupported image extension, MIME type, or remote image URL |
| `Offline asset …` | unresolved image, CSS, script, iframe, or other unsupported asset request |
| `Custom visual blocks and display math must be at the top level` | a custom block is nested in a list or blockquote |
| `Output must not overwrite the source …` | output aliases the Markdown input, including symlinks or hard links |
| KaTeX `ParseError` | invalid LaTeX |

## Understanding checks: `paper-check`

Use a native answer disclosure for paper-specific reconstruct, apply, or evidence questions. It works without JavaScript and does not measure comprehension automatically. See [learning-checks.md](learning-checks.md) for question design.

````markdown
```paper-check
{"title":"Check your understanding","items":[{"question":"What condition makes this mechanism work?","hint":"Optional pointer to the explanation","answer":"Explain the transformation and its necessary condition.","source":"PDF §4, Eq. 3"}]}
```
````

`title` and a non-empty `items` array are required. Every item requires non-empty plain-text `question`, `answer`, and `source`; `hint` is optional but must be non-empty when supplied. Fields are escaped as text. Keep substantial math and derivations in the adjacent explanation. The question stays visible while the answer starts collapsed. Use the normal source-location switch to reveal its source.

## Output placement

For an ordinary reading, any self-contained directory works: keep the audit source and its `assets/` together (the renderer resolves images relative to the source and refuses paths that escape it), and write the HTML wherever the user wants it. The output must be a different file from the Markdown input; symlink and hard-link aliases of the input are also refused. Invoke the renderer from the installed skill directory; source and output may live outside this repository. The footer links to the skill's GitHub repository so a forwarded reading retains its tool provenance; the reading itself remains available offline.

When contributing to this repository's public gallery only:

- Audit source: `examples/<slug>-deep-read.md`; assets beside it in `examples/assets/<slug>-figN-<desc>.png`.
- Built page: `docs/<slug>-deep-read.html` (single offline file).
- `node scripts/build-examples.cjs` renders every `examples/*-deep-read.md`; `npm run build:examples` runs it. Register new readings per [CONTRIBUTING.md](../CONTRIBUTING.md).
