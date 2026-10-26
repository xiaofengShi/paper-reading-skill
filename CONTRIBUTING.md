# Contributing a new reading

Use this checklist to add a reading to the gallery. [SKILL.md](SKILL.md) defines the reading workflow, [evals/reading-quality.md](evals/reading-quality.md) defines its quality gates, and [references/renderer-format.md](references/renderer-format.md) defines the renderer contract. Use Node.js 20 or newer and run `npm ci` from the repository root.

## 1. Read and author the source

- Audit source: `examples/<slug>-deep-read.md`, beginning with `<!-- paper-reading-lang: … -->` (and an optional theme line).
- Record the exact paper title, version or date, source URL, and any missing coverage. Do not mix results from different versions without identifying them.
- Original figures and redraws: keep inputs in `examples/assets/`, identify their source locations, and distinguish original excerpts from author-created teaching examples. See [references/figure-extraction.md](references/figure-extraction.md).
- Record the interaction decision (why an interactive view helps, or why a static view suffices) in a Markdown comment in the audit source.
- When useful, add a few paper-specific understanding checks: reconstruct a mechanism, apply it to a small example, or distinguish evidence claims. The native `paper-check` block reveals answers without JavaScript; see [references/learning-checks.md](references/learning-checks.md). Keep the main explanation available without answering questions. These are learning aids, not measured comprehension scores.

For a private working draft, `npm run init:reading -- --help` shows how to create a new directory with `reading.md`, `brief.md`, and `assets/`. The initializer marks the source unfinished and refuses an existing destination. It does not fetch a paper, author a reading, or render HTML. Complete and check that draft before adapting it into a gallery source.

## 2. Render

```bash
npm ci
npm run doctor
npm run build:examples
npm run check:examples
```

`doctor` uses a small synthetic fixture to check the renderer, math fonts, and embedded assets. It does not validate a paper. `build:examples` discovers every `examples/*-deep-read.md` and renders it into `docs/`; no per-reading package script is needed. `check:examples` rebuilds in a temporary directory and rejects stale generated pages. Do not edit the generated HTML by hand.

## 3. Register the reading

- [README.md](README.md) and [README.zh-CN.md](README.zh-CN.md): add one gallery bullet in each language, keeping the same order and source/version information.
- [evals/reader-tasks.md](evals/reader-tasks.md): add paper-specific reader questions and an answer key following the existing entries. These evaluation tasks are separate from the optional checks embedded in the reading.
- Keep wording count-neutral (“the published examples”) so future additions do not require sweeping edits.

Rebuild the homepages from the READMEs:

```bash
npm run build:docs
```

## 4. Verify the reading and generated files

```bash
npm test
npm run check:examples
npm run check:docs
npm run check:audit
```

`check:audit` compares the HTML pages in `docs/` with the Markdown reports at the root of `reports/`; run `npm run build:audit` after changing those reports. Commit generated pages together with their inputs.

Apply the reading-quality gates to the actual source and HTML: check equations, numeric claims, figure context, experiment conditions, claim-to-evidence links, and source coverage. Inspect the page in a browser at wide and narrow widths and with scripts disabled. Automated structural checks do not certify scientific correctness. Label AI-assisted source checks as such and record their coverage and unresolved discrepancies. Neither AI answers nor embedded answer disclosures constitute an independent human comprehension study.

## 5. Verify a lightweight installation

```bash
npm run pack:skill
```

The local build produces `dist/paper-reading/` with a SHA-256 `manifest.json` and, when system `tar` is available, `dist/paper-reading.tar.gz`. It includes runtime scripts, their helpers, references, assets, the small doctor fixture, `package.json`, and `package-lock.json`. It excludes the gallery, website, tests, and installed dependencies. Existing outputs are refused; use `npm run pack:skill -- --out <new-output-parent>` to keep earlier builds.

Copy the whole generated runtime tree to a new, temporary location, run `npm ci` and `npm run doctor` there, and test a starter with `npm run init:reading -- --help`. Do not copy only `SKILL.md`, omit the lockfile, or modify an active personal skill directory as part of a package test. A local archive is not a published release, and a local website build is not a deployment.
