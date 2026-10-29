# Changelog

## Unreleased — 2026-10-29

- Split reading depth into Brief Reading (default, preserving the existing examples' format) and Deep Reading (full technical reconstruction on request).
- Add a Deep Reading protocol for source coverage, core mechanisms, key derivations, experiment families, and important appendices; require 3 in every applicable depth dimension before delivering a completed Deep.
- Add `--mode brief|deep` to unfinished-reading initialization and a `paper-reading-mode` Markdown header. HTML titles and heroes identify the selected mode; older unmarked sources render as Brief.
- Mark existing gallery entries Brief without changing their paper content, source versions, or URLs, and keep gallery metadata aligned with audit headers.
- Fit wide tables, figures, and equations to printed pages, with page margins and table rows kept together.

## 0.2.0 — 2026-10-27

- Rebuild the 11 readings covered by the reconstruction record with the updated teaching contract: reader goals, worked mechanisms or operation traces, paper-specific checks, and supporting evidence disclosures. Recheck primary sources and correct source-version, equation, evaluator, and benchmark-scope errors; retain dated reconstruction evidence.
- Add a first-paper route in English and Chinese, language filters, copyable commands, and generated sitemap metadata.
- Add an English ResNet v1 reading separating optimization, generalization, evaluation protocols, and later interpretations.
- Add a LoRA v2 reading with source conflicts preserved, input-to-update and merged-weight exploration, a parameter-budget experiment, and four understanding checks.
- Bridge LoRA initialization/subspace analysis and ResNet scalar backpropagation; explain representative appendix operations and keep full supporting evidence in native disclosures.
- Add optional reader prerequisites and learning goals to the reading hero. ResNet now includes five understanding checks.
- Add native `paper-check` answer disclosures and a guide to reconstruct, apply, and assess evidence.
- Add an unfinished-reading initializer, synthetic installation doctor, lightweight runtime packager, and file-hash manifest.
- Support the documented Node 20 runtime through dynamic ESM imports. Upgrade KaTeX to 0.18.2.
- Preserve literal math syntax in code, embed standard Markdown and HTML images, and reject unresolved remote assets.
- Prevent source overwrite aliases, symlink escapes, and packaging back into runtime inputs.
- Add runtime CI on Node 20.18.3, 22, and 24. Automated checks do not establish scientific correctness or human comprehension.

This version includes the source, generated reading artifacts, and dated validation records. Automated checks and AI-assisted source review do not constitute an independent human evaluation.
