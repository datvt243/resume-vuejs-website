# 2026-10-16 - issue-158-import-cv-pdf

- Worker: implementer
- Version: 0.1.0
- Node: `issue-158-import-cv-pdf` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `IN_PROGRESS`). Supersedes `issue-158-import-cv-pdf-waiting-backend` (BLOCKED_ON_BACKEND, 2026-10-05), which is left unedited (LAI-13).
- Task (from issue #158): "[ENHANCEMENT] Import CV từ file PDF (phần còn lại của #120)". Extend the existing import page to accept a PDF upload, reuse the review-before-save flow (map into the existing education/experience forms, never auto-save).

## Hub bytes before: 174390

## Branch
`feature/issue-158-import-cv-pdf`, created off `origin/staging` (`4f353d0`, fetched and pulled this session) via `gh issue develop 158 --checkout --base staging --name feature/issue-158-import-cv-pdf`. Never on `main`/`staging` while editing.

## Backend check (read from the backend repo, not assumed)
`../resume-nodejs-api`: `git fetch`, `origin/main` = `9fa0279` (release v1.12.0). `src/routers/api/v1/candidate.route.ts:176` has `router.post('/parse-cv-pdf', uploadCvPdfParseMiddleware, fnParseCvPdf)`. Its swagger response is `{educations[{school,major,startDate|null,endDate|null,isCurrent,description}], experiences[{company,position,...same}], extractedText}`: the same item shape as `parse-linkedin-export`, plus `extractedText`. Bearer auth, multipart field `file`, PDF ≤ 5MB, 400 on bad input. I did not call the live API; Render deploying `main` is an assumption.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageImportLinkedin.vue` | `SOURCES` map (`linkedin` → `candidate/parse-linkedin-export`, `pdf` → `candidate/parse-cv-pdf`). `handleSelectFile(e, sourceKey='linkedin')` posts to `SOURCES[sourceKey].url`. On success it stores `source` and `extractedText` (otherwise unchanged). Second hidden `<input accept=".pdf,application/pdf">` + "Chọn file PDF CV" button next to the existing .zip button (wrapped in a `flex flex-wrap gap-2` div). Heading → "Nhập CV (LinkedIn / PDF)". Help text: the stale "PDF chưa có endpoint" sentence and the issue #120 link are replaced by a PDF paragraph (5MB limit; best-effort parse: single-column works best, multi-column may miss entries, scanned PDFs can't be read; review every entry). "Nguồn: <label>" line after parsing. `<details>` with `extractedText` in a `<pre>` when present, the same pattern as `PageAtsCheck.vue:166`. Modal titles use `(từ ${SOURCES[source].label})` instead of the hardcoded "(từ LinkedIn)". Save path (`prefill`, `handleSave*`, `updateDoc` POST via `_id = null`) is **unchanged**, so it's the same review-before-save flow. Null `startDate`/`endDate` from the PDF parse already fall back to `f.default` in `prefill`. |
| `src/pages/_layouts/LayoutDefault.vue` | Nav label "Nhập CV từ LinkedIn" → "Nhập CV (LinkedIn / PDF)". Route path/name `import-linkedin` and the file name are kept (renaming them is out of scope and would break bookmarks). |
| `src/pages/dashboard/PageImportLinkedin.spec.ts` (new, 98 lines) | 4 tests (`handleBase`/`useHelper`/`useCandidate`/`useDocument` mocked; Modal/VeeForm/Heading/Button stubbed): (1) PDF → `post candidate/parse-cv-pdf`, `FormData` field `file` = the chosen file; (2) .zip still → `candidate/parse-linkedin-export` (regression); (3) PDF result lists the education + experience entries, "Nguồn: PDF", `<details><pre>` contains the extracted text, modal title "(từ PDF)", and `handleBase` called exactly once (nothing persisted); (4) LinkedIn result shows no `<details>`, "Nguồn: LinkedIn". |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | +1 row (node, `IN_PROGRESS`). |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run src/pages/dashboard/PageImportLinkedin.spec.ts` against the new page
- The same spec with `PageImportLinkedin.vue` replaced by `git show HEAD:` (restored afterwards; `git diff --stat` confirms 58-line diff back)
- `npm run test`
- `npm run lint`
- `npm run build`
- Typecheck: CANNOT RUN (pending add-typecheck-script)
- Pre-existing failure check: `git stash -u` → `npx vitest run src/components/veevalidate/VeeForm.spec.ts` ×3 on clean `4f353d0` → `git stash pop`

## Output
New spec, final code:
```
 ✓ src/pages/dashboard/PageImportLinkedin.spec.ts (4 tests) 34ms
 Test Files  1 passed (1)
      Tests  4 passed (4)
```
New spec against the OLD page (proves the tests exercise the change):
```
   × PageImportLinkedin > POSTs the PDF as multipart field `file` to candidate/parse-cv-pdf 19ms
   × PageImportLinkedin > lists parsed PDF entries for review and shows the extracted text, without saving anything 2ms
   × PageImportLinkedin > hides the extracted-text block for a LinkedIn import (no extractedText) 6ms
      Tests  3 failed | 1 passed (4)
```
(the 1 passing test is the .zip regression check, as expected)

`npm run test` (final code):
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 7ms
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 29 passed (30)
      Tests  1 failed | 202 passed (203)
TEST EXIT 1
```
That one failure is **pre-existing, not from this diff**: on clean `staging` `4f353d0` (my changes stashed) the same spec fails 3/3 runs: `Tests  1 failed | 14 passed (15)`, `AssertionError: expected 'VI' to contain '!'` at `VeeForm.spec.ts:253`. This diff touches no VeeForm/model/validation file. Every other test passes, including the 4 new ones.

`npm run lint`:
```
> resume-vuejs-website@1.16.0 lint
> eslint src --ext .js,.ts,.vue
LINT EXIT 0
```
`npm run build`:
```
✓ 1397 modules transformed.
✓ built in 3.56s
BUILD EXIT 0
```
Typecheck: CANNOT RUN (pending add-typecheck-script)

## Manual / visual check
**Not done.** No dev-server click-through or screenshot this session: the page needs a logged-in session plus the live backend. Rendered-DOM behaviour is covered by the mounted-component spec above (stubs for global components). The layout risk is limited to the 2-button `flex flex-wrap gap-2` row inside `Heading`'s `ms-auto` slot. This is stated as a gap, not claimed as verified.

## Acceptance
| Criterion | Status | Evidence |
|---|---|---|
| User can upload a PDF CV from the import page | ✓ | new input + button; spec test 1 |
| Calls `POST candidate/parse-cv-pdf`, multipart field `file` | ✓ | spec test 1 asserts url/method/`FormData.get('file')` |
| Reuses review-before-save flow, never auto-saves | ✓ | save path unchanged; spec test 3 asserts `handleBase` called once (parse only) |
| `extractedText` shown so the user can copy missed parts | ✓ | `<details><pre>`; spec tests 3/4 |
| LinkedIn import not regressed | ✓ | spec test 2 + 4; test 2 passes on old and new page |
| Build green | ✓ | `BUILD EXIT 0` |
| Lint green | ✓ | `LINT EXIT 0` |
| Tests | ✓ for this diff | 4/4 new pass; 1 pre-existing VeeForm failure proven on clean base |
| Typecheck | CANNOT RUN | pending add-typecheck-script |
| Comments per code-comments.md | ✓ | Only comment touched: the `PageImportLinkedin.vue` header `Description` (inside the existing `/** */` block), rewritten to describe both sources and the no-auto-save WHY. Removed the issue refs (`#120`, `resume-nodejs-api#141`) and the quoted issue text per "no issue/PR refs". No new `//` comments in src. The spec has one `//` (WHY the call count is 1). |

## Noticed, not done
- `src/components/veevalidate/VeeForm.spec.ts:253` "flags the hidden language that has a validation error" fails deterministically on `staging` `4f353d0` (`expected 'VI' to contain '!'`). Most likely from the #182 bilingual-CV or #187 unsaved-modal work that shipped in v1.16.0, though not confirmed. CI (`ci.yml`) runs lint + build only, not `npm run test`, so it went unnoticed. Needs its own node.
- The file/route is still named `PageImportLinkedin` / `import-linkedin` even though it now handles PDF too. A rename is cosmetic and out of scope.
- `src/services/axios.ts:73` comment cites "the LinkedIn-export import upload" as the FormData example. Still accurate, left alone.

## Status
`sealed_pending_verifier`
