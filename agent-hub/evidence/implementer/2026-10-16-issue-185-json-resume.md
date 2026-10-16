# 2026-10-16 - issue-185-json-resume

- Worker: implementer
- Version: 0.1.0
- Node: `issue-185-json-resume` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `IN_PROGRESS`)
- Task (from issue #185): "[ENHANCEMENT] Xuất/nhập CV theo chuẩn JSON Resume". Export: map candidate → `resume.json`, download. Import: upload `resume.json` → preview → write into the sections (like the LinkedIn import flow). Meant as an alternative import path.

## Hub bytes before: 176255

## Branch
`feature/issue-185-json-resume`, created off `origin/staging` (`8683c91`, fetched and pulled this session) via `gh issue develop 185 --checkout --base staging --name feature/issue-185-json-resume`. Never on `main`/`staging` while editing.

## Scope decision
Frontend-only, no backend needed:
- **Export source:** `PagePreview.vue`'s existing `cvData` computed, which already assembles every section and applies the active-profile filter (#116). The export therefore matches exactly what the preview/PDF shows, and `selectedLang` picks the vi/en text of localized fields.
- **Import target:** the existing review-before-save flow in `PageImportLinkedin.vue`, which only has Education + Experience forms. JSON Resume `work` → experiences and `education` → educations, parsed client-side into the same `{educations, experiences}` shape the backend parse endpoints return. Nothing is saved until the user submits each form.
- **Not imported:** projects/awards/certificates/references/basics. The import page has no review forms for them; adding 4 more modals would roughly double the page and was out of proportion for this diff (see Noticed).
- **Not exported:** skills. `generalInformation.professionalSkillsGroup` holds group names only, not skills, so nothing maps cleanly to JSON Resume `skills`.

## Diff
| File | Why |
|---|---|
| `src/utilities/jsonResume.ts` (new) | `toJsonResume(data, lang, socialMedia)` (v1.0.0 `$schema`, `basics` incl. GitHub/LinkedIn `profiles` + website `url`, `work`, `education`, `projects` with `roles`/`keywords` split from `technology`, `awards`, `certificates`, `references` as "position — company" with the phone deliberately not exported, `meta`). Empty values are dropped (`compact`). Open-ended entries (`isCurrent`/`isWorking`) omit `endDate`, the JSON Resume convention for ongoing. CKEditor HTML → plain text via `htmlToText` (DOMParser, keeps p/li breaks). `fromJsonResume(json)` maps `work` (also legacy `company`) / `education` → import shape. Highlights are appended as "- " lines and courses joined. `isCurrent = startDate && !endDate`. Throws "File không phải JSON Resume hợp lệ" for non-objects, arrays, or objects with no work/education/basics. Date helpers `toIsoDate` (local `YYYY-MM-DD`) and `fromIsoDate` (`YYYY`/`YYYY-MM`/`YYYY-MM-DD` → local ms). |
| `src/pages/dashboard/PagePreview.vue` | "Xuất JSON Resume" button next to "Xuất PDF / In" (both wrapped in a `flex flex-wrap gap-2` div). `handleExportJsonResume()` passes `toJsonResume(cvData, selectedLang, info.socialMedia)` through a Blob, then a `resume.json` download anchor, then `revokeObjectURL`. |
| `src/pages/dashboard/PageImportLinkedin.vue` | `SOURCES.jsonresume` (no URL). Third hidden input `accept=".json,application/json"` + "Chọn file JSON Resume" button. `handleSelectFile(e, 'jsonresume')` runs `JSON.parse(await file.text())`, then `fromJsonResume`, then `applyParsed`, with **no backend call**. Errors toast `bg: 'danger'`: "File JSON không hợp lệ" for a `SyntaxError`, otherwise the thrown message. The LinkedIn/PDF success callback was factored into `applyParsed(sourceKey, data)`, same body as before. Heading → "Nhập CV (LinkedIn / PDF / JSON Resume)", +1 help paragraph linking jsonresume.org/schema. Header `Description` updated to mention the third source. |
| `src/pages/_layouts/LayoutDefault.vue` | Nav label → "Nhập CV (LinkedIn / PDF / JSON)". |
| `src/utilities/jsonResume.spec.ts` (new) | 10 tests: date helpers, `htmlToText`, full export mapping of every section (incl. empty-value dropping, keyword split, ongoing endDate omitted), en/vi fallback, empty CV, import mapping incl. highlights/courses/legacy `company`/ongoing, export→import round-trip, rejection cases, basics-only resume. |
| `src/pages/dashboard/PageImportLinkedin.spec.ts` | **Existing file, additions only**: `toastMock` instead of an inline `vi.fn()`, a `selectJson` helper, +2 tests: JSON Resume parsed with `handleBase` never called, entries listed, "Nguồn: JSON Resume", no `<details>`; invalid JSON and non-resume JSON each toast the right message and show no results. The 4 existing tests are unchanged and still pass. jsdom's `File` has no `.text()` (probed: `typeof file.text === 'undefined'`), so the helper defines it on the test file object; real browsers have it. |
| `src/pages/dashboard/PagePreview.spec.ts` (new) | 2 tests (`useCandidate` mocked per field, `CvResumeLayout` stubbed, `URL.createObjectURL` + `HTMLAnchorElement.prototype.click` spied): clicking "Xuất JSON Resume" downloads `resume.json` (`application/json`) whose basics/work/education come from the store + lists; with `cvActiveProfileId=p1` in localStorage the export contains only the profile's experience (`['Acme']`, not `Hidden Co`). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | +1 row (node, `IN_PROGRESS`). |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run` on each new/changed spec
- Both page specs against `git show HEAD:` versions of `PageImportLinkedin.vue` + `PagePreview.vue` (restored afterwards; `git diff --stat` confirms)
- `npm run test` ×10 on the final code
- `npm run test` ×4 on clean `staging` `8683c91` (`git stash -u` / `pop`)
- `npx vitest run --exclude <2 new spec files>` ×4 on the branch
- VeeForm + the 3 touched specs with `--no-file-parallelism` ×3
- `npm run lint`
- `npm run build`
- Typecheck: CANNOT RUN (pending add-typecheck-script)

## Output
New/changed specs, final code:
```
 ✓ src/utilities/jsonResume.spec.ts (10 tests) 8ms
 ✓ src/pages/dashboard/PageImportLinkedin.spec.ts (6 tests) 55ms
 ✓ src/pages/dashboard/PagePreview.spec.ts (2 tests) 39ms
```
Page specs against the OLD pages (the 4 new page tests fail, the 4 pre-existing import tests pass):
```
   × PagePreview — JSON Resume export > downloads resume.json built from the previewed CV
   × PagePreview — JSON Resume export > follows the active profile filter, like the preview itself
   × PageImportLinkedin > parses a JSON Resume in the browser (no backend call) and lists work/education for review
   × PageImportLinkedin > toasts an error for invalid JSON or a non-JSON-Resume file and shows no results
      Tests  4 failed | 4 passed (8)
```

`npm run lint` initially reported 1 error in my own new spec: `PagePreview.spec.ts 49:85 'this' is defined but never used` (a TS `this:` annotation read as an unused arg by base `no-unused-vars`). I rewrote it as a cast, then:
```
LINT EXIT 0
```
`npm run build`:
```
✓ 1399 modules transformed.
✓ built in 3.58s
BUILD EXIT 0
```
Typecheck: CANNOT RUN (pending add-typecheck-script)

### Full suite: VeeForm failures are timing-dependent, not deterministic
`npm run test` ×10 on the final branch code (224 tests):
- 7 runs: `1 failed | 223 passed`. The failure is `VeeForm > VI | EN toggle > flags the hidden language that has a validation error`.
- 2 runs: `2 failed | 222 passed`. The same test plus one VeeForm "BUG (real, verified …)" test, a different one each time ("typing then clearing a required field does NOT disable submit" / "clicking submit after touching+clearing a required field still calls submitFn").
- 1 run: `224 passed (224)`. So even the VI | EN failure that the #158/#183 notes called "deterministic" is **not**.

Controls:
- Clean `staging` `8683c91` ×4: `1 failed | 209 passed (210)` every time (VI | EN only).
- Branch minus my 2 new spec files ×4: `1 failed | 211 passed (212)` every time.
- VeeForm + my 3 specs, `--no-file-parallelism` ×3: `1 failed | 32 passed (33)` every time.

My reading: the VeeForm tests assert vee-validate's async validation after a fixed `flushPromises()`, so they are sensitive to CPU load. Default Vitest file isolation means my specs' `vi.stubGlobal('URL')` / prototype spy can't leak into `VeeForm.spec.ts`. The extra "BUG" flake showed up only with the full parallel run (34 files vs 32). That is **consistent with load, not proven**: 2/10 on the branch vs 0/4 + 0/4 in the controls is too few runs to rule out chance. No VeeForm file is touched by this diff.

## Manual / visual check
**Not done.**
- No browser click-through. The export download and the JSON import were exercised only in mounted-component specs.
- I did not validate the exported file against the official JSON Resume schema with a validator (no schema validator in the repo; no network fetch of the schema). The field names follow the v1.0.0 schema as I know it.

## Acceptance
| Criterion | Status | Evidence |
|---|---|---|
| Export candidate → `resume.json` download | ✓ | `PagePreview.spec.ts` test 1 (filename, MIME, content) |
| Export follows the CV actually being previewed (profile/lang) | ✓ | spec test 2 (profile filter); `jsonResume.spec.ts` en/vi test |
| Import `resume.json` → preview → save via existing forms (no auto-save) | ✓ | import spec: entries listed, `handleBase` not called (nothing persisted); save path unchanged |
| Invalid file handled | ✓ | import spec test 6 (both error messages) |
| Export→import round-trip | ✓ | `jsonResume.spec.ts` round-trip test |
| LinkedIn/PDF import not regressed | ✓ | 4 pre-existing import tests pass on new code |
| Build green | ✓ | `BUILD EXIT 0` |
| Lint green | ✓ | `LINT EXIT 0` (after fixing my own spec) |
| Tests | ✓ for this diff | 18 new/changed-file tests pass; remaining failures are VeeForm-only and timing-dependent (above) |
| Typecheck | CANNOT RUN | pending add-typecheck-script |
| Comments per code-comments.md | ✓ | `jsonResume.ts`: file-overview `/** */` with the JSON Resume link, JSDoc on each exported function (WHY: local dates, same shape as backend parse, lang fallback), 2 `//` (endDate convention; legacy `company` field). `PageImportLinkedin.vue`: header `Description` updated (no issue refs). Spec: 1 `//` (why `.text()` is stubbed). No issue refs added. |

## Noticed, not done
- **VeeForm.spec.ts timing flakiness** (above): the VI | EN test is not deterministic (passed 1/10). The "BUG" tests flake under full parallel load. Needs its own node; `ci.yml` doesn't run tests at all.
- Import covers only `work`/`education`. Projects/awards/certificates/references would need review forms on the import page. Worth a follow-up issue if wanted.
- No skills section exists to export (`professionalSkillsGroup` holds group names only).

## Status
`sealed_pending_verifier`
