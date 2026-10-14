# Renderer input format

This is the complete input contract for [render-reading.cjs](../scripts/render-reading.cjs). The Markdown audit source it consumes becomes one offline HTML reading page; every constraint below is enforced by the build, and violations throw before any output is written. Example sources in [examples/](../examples/) are the reference for editorial style — this file is the reference for what the parser accepts.

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

Place each block at the top level of the Markdown with blank lines around it. The info string must be exactly the keyword; the body is one JSON object. **All string fields are escaped plain text** — no Markdown, HTML, or math inside them. A block that ends up inside a table or list fails with `Unresolved visual slot`.

Every block requires a non-empty `source` field on each fact-bearing item; a missing source throws `A visual fact is missing its source`. The source renders as a hidden badge revealed by the “显示原文定位 / Show source locations” toggle.

### `paper-map` — whole-paper map cards

```json
{
  "thesis": "One-sentence claim of the paper (hero subtitle; only the first map uses it)",
  "outcome": "What the work delivers (hero footer line)",
  "outcomeSource": "PDF §§…",
  "items": [
    { "number": "01", "label": "问题", "signal": "short tag", "text": "…", "source": "PDF §1" }
  ]
}
```

`items` is required and non-empty. `number`, `label`, `text`, `source` are used for every item; `thesis`/`outcome`/`outcomeSource`/`signal` matter only on the **first** `paper-map`, which becomes the hero map beside the title. Later maps render as an inline card grid.

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

An HTML comment, not a fence. The file path is relative to the audit source and must stay inside its directory subtree. The page is inlined as an iframe `srcdoc` inside a disclosure; Google Fonts links are stripped so the result works offline. Interactive views are optional — record why one helps (or why a static view suffices) in a Markdown comment in the audit source, per [visual-reading](visual-reading.md).

## Figures and images

- The special figure treatment requires this exact shape (image, blank line, one italic caption line):

  ```markdown
  ![Alt text describing the figure](assets/paper-fig1.png)

  *原论文 Fig. 1，PDF p. 2。reading notes…*
  ```

  This produces the scrollable `<figure class="paper-figure">` with a reading hint. A multi-line caption, a bold-wrapped caption (`**…**`), or a missing blank line silently falls back to a bare image — keep captions single-line and wrapped in one `*…*`.
- Image paths are relative to the audit source and must resolve inside its directory (`../` and absolute paths throw). Supported extensions: `.png`, `.svg`, `.webp` only (`.jpg` and others throw). Images are inlined as base64 — the output HTML has no external assets.
- Hand-written `<img>` HTML is also inlined, but only when it carries `alt="…"` in that exact form.
- Put a visible reading cue in the prose **before** every original figure; the caption adds provenance and is not the only explanation.

## Source citations

Two mechanisms hide citations until the reader enables the source toggle:

1. **Automatic** — these literal patterns are wrapped as hidden refs: `（PDF…）`, `(PDF…)`, `，PDF p./pp. N[-M]` before `。`, and bare `PDF p./pp. N[-M]` anywhere. The parenthesized forms work with any inner text containing `PDF` (including `PDF §3.2`); bare `§3.2` or `附录 A.3` without the word `PDF` is **not** auto-wrapped.
2. **Manual** — `<span class="source-ref">…</span>` written directly in the Markdown for custom phrasing (e.g. the opening provenance block).

Figure identifiers (`Fig. 5`, `Table 1`) must stay visible even when page numbers are hidden.

## Math

- `$$…$$` on its own line(s) for display math; `$…$` for inline math (single line, no nested `$`). A trailing `，。；：、,.;:` right after the closing `$` is absorbed into the math unit so punctuation stays attached.
- KaTeX renders with `throwOnError` — invalid LaTeX aborts the build. Avoid bare `$` (e.g. prices).
- Keep display math at the top level like other blocks; an inline formula that lands alone in a paragraph usually belongs in a display block.

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
| `Visual must stay beside source: …` | image/archify path escaping the source directory |
| `Unsupported image: …` | extension outside png/svg/webp |
| `Unresolved visual slot` / `Unresolved inline math slot` | a block or formula landed inside a table/list and lost its placeholder |
| KaTeX `ParseError` | invalid LaTeX |

## Output placement

- Audit source: `examples/<slug>-deep-read.md`; assets beside it in `examples/assets/<slug>-figN-<desc>.png`.
- Built page: `docs/<slug>-deep-read.html` (single offline file).
- `node scripts/build-examples.cjs` renders every `examples/*-deep-read.md`; `npm run build:examples` runs it. Register new readings per [CONTRIBUTING.md](../CONTRIBUTING.md).
