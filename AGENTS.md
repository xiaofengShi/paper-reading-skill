# Repository guidance

This repository is a paper-reading skill with a CommonJS Node.js renderer and a static gallery. Use Node.js 20 or newer. Check `git status --short` and the relevant diff before editing; preserve unrelated changes. Follow existing scripts and dependencies without installing another workflow framework.

## Commands

Run from the repository root:

```bash
npm ci
npm run doctor
npm test
npm run build:examples
npm run check:examples
npm run build:docs
npm run check:docs
npm run check:audit
npm run init:reading -- --help
npm run pack:skill -- --help
```

`doctor` uses a synthetic smoke fixture, not a real paper. `init:reading` creates unfinished sources, not completed readings. `pack:skill` builds a local runtime directory and optional archive; test packages in temporary locations, never by replacing an active personal installation.

## Sources and generated files

- `SKILL.md` is the execution entry point. `references/` defines reading and rendering contracts; `evals/` defines quality gates and reader tasks.
- `README.md` and `README.zh-CN.md` generate `docs/index.html` and `docs/zh.html` through `npm run build:docs`. Keep their gallery order and factual claims aligned.
- `examples/*-deep-read.md` and their local visual inputs generate `docs/*-deep-read.html` through `npm run build:examples`. Register new readings in both READMEs and add reader tasks in `evals/reader-tasks.md`.
- `reports/*.md` generate matching `docs/*.html` through `npm run build:audit`; retain historical reports as dated snapshots. `check:audit` checks their freshness.
- Change the source, rebuild, and include generated outputs together. Do not hand-edit generated HTML. A local build does not confirm a live GitHub Pages deployment.
- Runtime scripts can depend on `scripts/lib/` and `scripts/fixtures/`; keep those helpers in lightweight packages. Keep `package-lock.json` consistent with `package.json`.

## Reading integrity

- Declare `<!-- paper-reading-lang: en -->` or `<!-- paper-reading-lang: zh-CN -->` on the first source line; use the documented optional theme marker.
- Identify the paper and exact version. Keep reported results, author interpretation, redraws, and teaching examples distinguishable; attach source locations to consequential claims.
- Read the available full source and record missing sections or version conflicts. Do not describe abstract-only or incomplete work as a complete deep read.
- Use understanding checks when they help reconstruct, apply, or assess evidence. Native answer disclosures are learning aids, not comprehension scores.
- Distinguish automated structure checks, AI-assisted source checks, experimental reproduction, and independent human evaluation. Report actual checks and unresolved limits; never infer scientific correctness or human learning from a passing render.
- Verify changed CLI behavior with relevant tests, and run generated-file freshness checks after source changes. Inspect rendered pages at narrow and wide widths when presentation changes.
