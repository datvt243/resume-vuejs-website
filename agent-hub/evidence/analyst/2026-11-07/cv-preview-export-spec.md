# analyst — cv-preview-export — 2026-11-07

## Task (verbatim)
document cv-preview-export

## Doc
`agent-hub/doctrine/features/cv-preview-export.md` (existing bulk-backfill draft, re-checked per recipe step 4, not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PagePreview.vue`
- `src/components/cv/CvResumeLayout.vue`
- `src/composables/useCvTheme.ts`
- `src/composables/useCvLang.ts (module-scope ref)`
- `src/composables/useActiveProfile.ts (per-call ref)`
- `src/composables/useDownloadCv.ts`
- `src/pages/_layouts/Header.vue` (download button `hidden sm:inline-flex`, no template; account menu: View API + Logout only)
- `src/pages/home/PageHome.vue`
- `src/pages/dashboard/PageAtsCheck.vue`

## Re-check vs code
Behavior 1–9 match code. Preview loads 7 sections + general info + profiles via `useCandidate`; `filterByProfile` client-side, unresolved id → no filter. `resolveTheme` → classic fallback; `resolveCvLang` → only `en` is English. `window.print()`; `cv-print-mode` body class added on mount, removed on unmount. JSON: `toJsonResume(cvData, lang, socialMedia)`, fixed name `resume.json`. `download()`: `isDownloading` guard, `template` only if `ats`, `lang` only if `en`, Content-Disposition name else `cvFileName`, `withLangSuffix`, catch → `error.downloadCv` danger toast. Spec files for every criterion exist. No discrepancy.

## Questions + answers
Operator (2026-11-07): "ok, behavior đúng" (Behavior section confirmed correct).
1. "Export PDF" here prints the browser preview (theme + profile applied), while "Download CV" fetches a server PDF that gets no theme and no profile. The two PDFs can differ. Intended? → **Answer (operator 2026-11-07):** Intended (two kinds of export); the profile part is tracked in #448
2. The layout has no Skills or Languages section, so neither appears in the preview, the print or the JSON's layout data. Intended? → **Answer (operator 2026-11-07):** Change — #440
3. Theme and active profile are per-page refs (not shared live like the CV language): changing them on one page does not update another open page until it re-mounts. Intended? → **Answer (operator 2026-11-07):** Intended
4. JSON export is always `resume.json` (no name, no language suffix), unlike the PDF. Intended? → **Answer (operator 2026-11-07):** Bug: same base name as the PDF + `_VI`/`_EN` — #451
5. The Classic/ATS template choice exists on Home and on the ATS check page; the header button always downloads Classic. Intended? → **Answer (operator 2026-11-07):** Intended
6. The header Download button is hidden below the `sm` breakpoint, and the account menu has no download entry — no download on small phones except via Home. Intended? → **Answer (operator 2026-11-07):** Change: add "Download CV" to the account menu — #452

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/cv-preview-export-spec.md` set in doc + INDEX row; Issues: #55, #116, #119, #182, #440, #448, #451, #452. Behavior unchanged (describes code today; changes tracked by the issues).

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "ok, behavior đúng" confirmation, the
operator's answers + issue numbers). No implementer reasoning, no main
session transcript. All Behavior items re-checked by reading code myself.
