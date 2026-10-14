# Contributing a new reading

Checklist for publishing one more deep read. The renderer enforces its own input contract in [references/renderer-format.md](references/renderer-format.md); this file is about wiring a finished reading into the repository.

## 1. Build materials

- Audit source: `examples/<slug>-deep-read.md`, beginning with `<!-- paper-reading-lang: … -->` (and an optional theme line).
- Original figures and redraws: `examples/assets/<slug>-figN-<desc>.png` (see [references/figure-extraction.md](references/figure-extraction.md)).
- Record the interaction decision (why an interactive view helps, or why a static view suffices) in a Markdown comment in the audit source.

## 2. Render

```bash
npm ci                 # once per checkout: installs marked + katex
npm run doctor         # smoke render that verifies fonts embed
npm run build:examples # renders every examples/*-deep-read.md into docs/
```

`build:examples` globs `examples/*-deep-read.md`, so a new source is picked up automatically; do not hand-edit `package.json` for each reading.

## 3. Register the reading

- [README.md](README.md) and [README.zh-CN.md](README.zh-CN.md): add one bullet in the sample-readings list (keep the list in the same order in both files) and adjust any count wording that names a fixed number of examples.
- [evals/reader-tasks.md](evals/reader-tasks.md): add one section with four reader questions and an answer key, following the existing entries.
- Keep wording count-neutral (“the published examples”) so future additions do not require sweeping edits.

## 4. Verify

```bash
npm test               # renderer contracts + per-reading checks (discovers docs/*-deep-read.html)
npm run check:docs     # homepage build in sync with the READMEs
npm run check:audit    # reader-audit report in sync with evals/
```

Then apply the release gates in [evals/reading-quality.md](evals/reading-quality.md) to the source, the audit copy, and the HTML before announcing the reading. A passing build is not an independent reader study; say so plainly in the delivery notes.

## 5. Install location (optional)

Install by cloning or copying the **full checkout** into the skills directory (e.g. `~/.agents/skills/paper-reading/`), then run `npm ci` there. A partial copy must include at least `SKILL.md`, `references/`, `evals/`, `scripts/`, `assets/`, `examples/` with its `assets/` (the doctor smoke-renders an example and its figures), `package.json`, **and `package-lock.json`** — `npm ci` fails without the lockfile. Keep the install in sync when the renderer or references change.
