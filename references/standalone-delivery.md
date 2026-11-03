# Independent reading and sharing

## Default document contract

The reading is the explanation itself. The reader should not need the source PDF, an earlier chat, another app, or a local workspace to understand the important mechanism and evidence. Explain the essential mechanism, assumptions and decisive comparisons at the [intended reader's level](learner-experience.md). Independent reading assumes that stated background; it does not require reteaching the field. If only a source location is available, fill the explanation or explicitly bound the incomplete claim.

Write directly about the subject. Avoid a running comparison between “the original article says” and “I add.” Use concise labels such as **teaching example**, **reported experiment**, or **design suggestion** when provenance changes the meaning. Preserve necessary author/study attribution and the limits beside the claim. Independent readability does not mean presenting someone else’s findings as your own.

End with a **Sources / 资料出处** section containing titles, authors or organizations, exact versions/dates and URLs as available. Optional compact body citations should link to those entries in the same document. For example, `[1](#ref-1)` in the explanation and `<span id="ref-1">[1]</span>` beside the full entry at the end work with the renderer. Check every anchor. Source location badges remain optional audit detail; they do not replace the final bibliography. Put retrieval history, version checks, hashes, coverage and verification limits in audit comments or companion records rather than interrupting the lesson.

## Sharing contract when requested

Use the existing authorized publication destination when appropriate. Keep one clear title, intended audience, short entry route and complete core explanation. Deliver a real hosted reading URL, not merely a repository blob URL or `file://` path. Make necessary code/data downloads available where the text refers to them; a command using `labs/...` is unusable without the corresponding files and a working-directory instruction. Distinguish a single offline reading file from a downloadable runnable experiment bundle. Pin the dependencies actually tested, and state numerical tolerance or platform limits when relevant.

Build the public bundle from an explicit file list. Include authored explanations, diagrams, minimal teaching code, necessary result data and suitable licenses. Do not copy a working directory wholesale: exclude credentials, absolute private paths, local browser/session artifacts, backups, caches, downloaded third-party papers and unpublished materials. Cite third-party papers instead of redistributing them unless permission/license and need are established. Source references inside the reading must remain complete.

Apply the [delivery quality checks](../evals/reading-quality.md), including relevant controls and downloads. After publication verify the target deployment revision and fetch/open the actual URL; HTTP 200 alone does not prove that the right revision, controls or download bytes are present. Report local checks, hosted checks, content review and unperformed human evaluations separately. A fresh AI review is not an independent human review, a vehicle test or experimental reproduction.
