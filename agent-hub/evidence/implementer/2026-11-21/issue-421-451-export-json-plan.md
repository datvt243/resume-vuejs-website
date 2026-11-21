# 2026-11-21 - issue-421-451-export-json
- Worker: implementer · Version: 0.1.0
- Node: `issue-421-451-export-json` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#421 Preview: JSON resume export revokes the object URL in the same tick as the click (defer like useDownloadCv.ts) + #451 Export JSON: name the file like the PDF (CV file name + `_VI`/`_EN`)"
- Issues: https://github.com/datvt243/resume-vuejs-website/issues/421 · https://github.com/datvt243/resume-vuejs-website/issues/451

## Branch
`fix/issue-421-451-export-json` (cut from synced `staging` via `gh issue develop 421 --base staging`; linked to #421 — #451 must be closed by the commit/PR body too, `/ship` only appends `Closes #421` from the branch name)

## Hub bytes before
100277

## Feature doc
`doctrine/features/cv-preview-export.md` — Behavior #5 said `resume.json`; Open question 4 was answered by the operator 2026-11-07 as a bug → #451. So the doc was edited to match that decision.

## Feature doc changed
Behavior #5 → `<computed CV file name>_VI|_EN.json` (#8 name with `.json`, suffix per #7); `#421` added to Issues; Changelog row 2026-11-21.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PagePreview.vue` | `handleExportJsonResume`: `a.download = withLangSuffix(cvFileName.value.replace(/\.pdf$/, '.json'), selectedLang.value)` — reuses `useDownloadCv`'s `cvFileName` + `withLangSuffix` (same rules as the PDF, Behavior #7/#8); `setTimeout(() => URL.revokeObjectURL(url))` with the same WHY comment as `useDownloadCv.ts` |
| `src/pages/dashboard/PagePreview.spec.ts` | Expect `Đạt_Võ_VI.json`; new test: revoke not called in click tick, called after `vi.runAllTimers()`; new test: custom name `' My CV '` + EN → `My CV_EN.json`; `mountPage(extra)`; afterEach flushes the deferred revoke before unstubbing `URL` |
| `doctrine/features/cv-preview-export.md` | see Feature doc changed |

## Command
From `doctrine/MEMORY.md`: `npx vitest run <path>`, `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Output
Red without fix (`git stash push src/pages/dashboard/PagePreview.vue`, spec kept):
```
   × PagePreview — JSON Resume export > downloads <CV file name>_<LANG>.json built from the previewed CV 42ms
   × PagePreview — JSON Resume export > revokes the object URL only after the click tick 8ms
   × PagePreview — JSON Resume export > uses the custom CV file name and the English suffix 12ms
      Tests  3 failed | 1 passed (4)
```
Green with fix: `✓ src/pages/dashboard/PagePreview.spec.ts (4 tests) 59ms` / `Tests  4 passed (4)`
`npm run test` → `Test Files  60 passed (60)` / `Tests  391 passed (391)`
`npm run build` → `✓ built in 4.12s` (pre-existing chunk-size warning only)
`npm run lint` → `lint exit 0`
`npm run typecheck 2>&1 | grep -c "error TS"` → `78` (= baseline). `| grep PagePreview` → `src/pages/dashboard/PagePreview.spec.ts(52,23): error TS2683: 'this' implicitly has type 'any'` — line 52 is the pre-existing `function () { const a = this` click mock (unchanged by this diff, already in the 78 baseline).

## Acceptance
| Criterion | Evidence |
|---|---|
| #421: revoke deferred past the click (matches `useDownloadCv.ts`) | diff; spec "revokes the object URL only after the click tick" red→green |
| #451 / Behavior #5+#7+#8: default name `<first>_<last>_VI.json` | spec expects `Đạt_Võ_VI.json`, red→green |
| #451: custom CV file name (trimmed) + `_EN` | spec `My CV_EN.json`, red→green |
| JSON content unchanged (Behavior #5) | existing content assertions + profile-filter test still pass |
| Build/test/lint green | `✓ built in 4.12s`, `391 passed`, `lint exit 0` |
| Typecheck ≤ baseline 78, none new in touched files | `78`; only hit is pre-existing line 52 |
| Comments per code-comments.md | one `//` WHY above the deferred revoke (copied from useDownloadCv.ts); spec comments explain checks; no issue refs in code |
| UI/route loads on `npm run dev` | Not done — no browser pass; covered by the mounted-page spec (real click handler, real composables). Disclosed. |

## Supersedes
none (`grep -n "421\|451" haven/diagrams/dev-loop.prime-mermaid.md` had no prior row)

## Still open
none

## Review
Inline review (`/code-review` not run as a separate pass; diff is 2 code files, callers read: `useDownloadCv.ts` (source of `cvFileName`/`withLangSuffix`), `useHelper.ts` (inject — `useDownloadCv` calling it in PagePreview's setup is valid; toast unused here), `useCvLang.ts` (module-scoped lang ref — why the spec uses `setLang` not localStorage)). Findings: (1) `useDownloadCv()` also creates an unused `isDownloading` ref — negligible, kept to reuse the one name rule rather than duplicate it. (2) Custom name ending in `_vi`/`_en` keeps no extra suffix — same as PDF per Behavior #7. (3) A custom name that itself ends in `.pdf` gives `x.pdf.json` (PDF gives `x.pdf.pdf`) — pre-existing naming quirk, not in scope. No security impact (no new input, file name only).

## Noticed, not done
- `cvFileName` doesn't strip a user-typed `.pdf` extension (see Review 3).

## Seal gate
none — no outward-facing action.
