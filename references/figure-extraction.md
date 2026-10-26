# Getting figures out of a PDF

A deep read embeds readable excerpts of the paper's own figures. This is the working recipe for turning PDF figure regions into PNG/WebP files beside the audit source, plus the verification method for labels the text layer mangles. The renderer accepts `.png`, `.svg`, `.webp`, `.jpg`, and `.jpeg` (case-insensitive); see [renderer-format](renderer-format.md).

## Naming and placement

For an ordinary reading, put crops in `assets/` beside its Markdown source. For a gallery contribution, use the layout below and name crops for what they show:

```
examples/assets/<slug>-figN-<desc>.png     # original paper figures: vista-fig5-harness-configs.png
examples/assets/<slug>-tableN-<desc>.png   # numeric tables kept as images: vista-table1-system-comparison.png
examples/assets/<slug>-atlas.svg           # editorial redraws, labeled 本文重绘 / redrawn for this reading
```

Keep the paper's figure number in the filename even when the desc slug changes — provenance must survive into the audit source and HTML.

## Crop recipe (PyMuPDF)

Use an available PDF extraction tool first. If PyMuPDF is needed and absent, install it in an isolated environment rather than changing system Python:

```bash
python3 -m venv .paper-pdf-env
.paper-pdf-env/bin/python -m pip install pymupdf
```

Run the following with that environment's Python. Record the source URL/version, PDF SHA-256, page number, and crop rectangle beside the reading. Render only the figure region at high zoom:

```python
import pymupdf as fitz
doc = fitz.open('paper.pdf')
page = doc[0]                      # 0-based index
hits = page.search_for('Figure 1:')  # caption text locates the region
clip = fitz.Rect(70, 60, 545, 380)   # tighten to the figure, usually above/below the caption
pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=clip)  # 3–4× gives ~1400px wide crops
pix.save('examples/assets/slug-fig1-designs.png')
```

Practical notes:

- **Locate captions first.** `page.search_for("Figure N:")` / `"Table N:"` gives an anchor; figures usually sit directly above or beside their caption in a two-column layout. Crop to the figure and exclude the caption when it separates cleanly — the reading document writes its own caption. Keep the caption inside the crop only when the two are inseparable.
- **Two-column pages:** use word coordinates (`page.get_text("words")` returns `x0,y0,x1,y1`) to decide whether the figure is left or right column before building the clip rectangle.
- **Validate every crop before saving:** re-extract text on the clip (`page.get_text("text", clip=clip)`) to confirm the intended content is inside and the neighboring column's text is not; render at zoom 3–4 so line art stays readable in the HTML.
- **Tables** are worth cropping when their numbers carry the evidence (`vista-table1-system-comparison.png`); keep column headers and footnotes inside the clip so the image is self-describing.

## When the text layer mislabels a chart

PDF extraction returns bar labels and values as unordered words. A chart's value labels can therefore look like they belong to the wrong series. Do not guess. Resolve the mapping with coordinates, then record the mapping in the audit source:

1. Pull every word in the chart region with `page.get_text("words")` and print `(text, x0, y0)`.
2. Order the value labels left-to-right (or bottom-to-top for vertical charts) and match them to the legend/category order — a horizontal dashed “reference line” label is often printed at the panel edge and is **not** a bar.
3. Cross-check at least two independent anchors in the paper text (captions, body text, appendix run tables) before committing. In the VISTA reading, for example, the body fixed three of four BabyVision bars (41.0 official / 63.2 VISTA / 92.3 human) and the appendix fixed the VISTA run values, leaving the dashed-line value by elimination.
4. If the mapping remains ambiguous after coordinates and cross-checks, state both readings and mark the conflict — never silently pick one.

## Figure discipline in the reading document

- Every embedded original figure gets a visible prose cue before it: what question the figure answers, which panel/axis/arrow to inspect, and what the reader should learn.
- Label redrawn charts (`本文重绘 · 原论文 Fig. N`, via `paper-chart`'s `origin`) and keep the original nearby when the redraw omits information the original carries.
- Check for orphaned images after rendering — every image should sit under its cue and caption, including ones referenced only inside hidden PDF citations.
