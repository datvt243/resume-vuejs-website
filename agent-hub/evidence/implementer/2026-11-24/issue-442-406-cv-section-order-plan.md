# 2026-11-24 - issue-442-406-cv-section-order

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-442-406-cv-section-order` (IN_PROGRESS)
- Branch: `feature/issue-442-406-cv-section-order` (off `staging` @ `c2c5051`, synced `git pull origin staging` → "Already up to date.", linked to #442 via `gh issue develop`)
- Task: #442 "feat(cv): lưu thứ tự kéo thả Education / Project lên backend; Experience luôn sort theo thời gian" + #406 "feat(cv): sort project trong CV/PDF theo loại company → personal" (`/todo #442, #406`)
- Status: **sealed_pending_verifier**
- Analyst pass 0: `evidence/analyst/2026-11-24/issue-442-406-cv-section-order-spec.md` — spec_ready after operator answered Q14–18 (all recommended; Q17 → follow-up datvt243/resume-nodejs-api#502 opened by the main session with operator approval). Backend deps #413 / #361 CLOSED.

## Hub bytes before
100395

## Feature doc
`agent-hub/doctrine/features/cv-timeline-sections.md` — Behavior #12 (#442), #13 (#406), acceptance rows "(#442)", "(#406)", "(#442, #406)".

## Feature doc changed
None by the implementer (analyst wrote it this run).

## Acceptance criteria clarified
- "(#442) `PageProject.spec.ts` / `PageEducation.spec.ts` covers: drop B onto A sends `PUT …/reorder {ids:['B','A']}`, rendered order B, A; on failure A, B again; success no toast, failure error toast" → the PUT / revert / toast behavior lives in the shared `useCandidate.reorder` (one copy instead of two page copies), and both page specs mock `useCandidate`. So: page specs cover "drop B onto A calls `reorder` with [B, A], renders B, A, writes nothing to localStorage"; `src/composables/useCandidate.spec.ts` covers the PUT url/body, `toast: null` + `toastError` set, optimistic render, revert on failure, `order = index` written to the store.
- "(#442) `PageExperience.spec.ts` covers … entries render newest `startDate` first" → the page spec mocks `useCandidate`, so the date sort is covered by `useCandidate.spec.ts` "sorts fetched list results by startDate descending" (existing) + `sectionOrder.spec.ts` `compareEntries` (experiences have no `order`; backend has no `experience/reorder`). Page spec covers no `draggable="true"` and no `common.dragToSort` text.
- "(#406) comparator spec … `[{personal,2024},{company,2020},{company,2023},{no type,2025}]` → company 2023, company 2020, no-type 2025, personal 2024" — used verbatim.

## Diff
| File | Why |
|---|---|
| `src/utilities/sectionOrder.ts` (new) | `compareEntries` = `order` asc (missing → after all ordered) → date desc (`startDate ?? issueDate ?? appliedDate ?? 0`, moved from useCandidate); `compareProjects` = `order` → `type` company before personal/missing → date desc (#406, #442 Behavior #12/#13) |
| `src/utilities/sectionOrder.spec.ts` (new) | 6 tests: the spec's 4-project case, order wins, unordered after ordered, missing startDate last, equal order → type then date, issueDate/appliedDate fallback |
| `src/composables/useCandidate.ts` | `sortData` uses `compareProjects` for field `projects`, else `compareEntries` (dashboard + Preview get the backend order); `collection` resolved once (same heuristic); `addRecordToList` keeps the existing `order` when the update response has none (`data.order ?? old.order`); new `reorder(list)`: optimistic render → `PUT <collection>/reorder { ids }` via `handleBase` (`toast: null, toastError: toast`) → success: `order = index` on the entries + store; failure: previous list back (only if the shown list wasn't replaced meanwhile); a drop while a reorder is in flight is ignored (review finding 1) |
| `src/composables/useCandidate.spec.ts` | 4 tests under `#442 backend order`: PUT/body/no success toast/optimistic/order index/store; failure reverts list + store; edited entry with `order: 0` keeps its place, new entry goes after ordered; second drop during an in-flight reorder ignored |
| `src/pages/dashboard/PageEducation.vue`, `PageProject.vue` | `useManualOrder` removed; `v-for` over `dataList`; `onDrop` calls `useCandidate`'s `reorder` |
| `src/pages/dashboard/PageExperience.vue` | drag-and-drop removed (no `draggable`, handle, hint, drag CSS); plain `<li>` per entry |
| `src/pages/dashboard/Page{Education,Project}.spec.ts` | mock `useCandidate` now has `reorder`; new test drop B onto A → `reorder([B, A])`, render B, A, `localStorage.setItem` not called; Project: drop on itself → no `reorder` |
| `src/pages/dashboard/PageExperience.spec.ts` | new test: no `[draggable="true"]`, no `common.dragToSort` text |
| `src/components/cv/CvResumeLayout.vue` | `projects` computed sorted with `compareProjects` (Preview + public page); no group headings |
| `src/components/cv/CvResumeLayout.spec.ts` | new test: `[personal 2024, company 2020]` → company first; with `order [0,1]` → given order; only one "Dự án" section title |
| `src/composables/useManualOrder.ts`, `.spec.ts` | deleted; export dropped from `src/composables/index.ts` |
| `src/i18n/index.ts` | `common.dragToSort` vi "Kéo thả để sắp xếp." / en "Drag and drop to reorder." (no "this browser only") |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row added (IN_PROGRESS) |

Not mine: `.claude/skills/todo/SKILL.md` was already modified before this run (gitStatus at session start). `agent-hub/doctrine/features/{INDEX,cv-timeline-sections,public-resume}.md` + the analyst note are the analyst's.

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
Final run (after review fixes):
```
 Test Files  69 passed (69)
      Tests  497 passed (497)
```
```
 ✓ src/utilities/sectionOrder.spec.ts (6 tests) 2ms
 ✓ src/composables/useCandidate.spec.ts (20 tests) 27ms
 ✓ src/components/cv/CvResumeLayout.spec.ts (9 tests) 70ms
 ✓ src/pages/dashboard/PageExperience.spec.ts (6 tests) 67ms
 ✓ src/pages/dashboard/PageEducation.spec.ts (4 tests) 67ms
 ✓ src/pages/dashboard/PageProject.spec.ts (10 tests) 96ms
 Test Files  6 passed (6)
      Tests  55 passed (55)
```
After the spec assertion change (`setItem` not called): `npx vitest run src/pages/dashboard/PageProject.spec.ts src/pages/dashboard/PageEducation.spec.ts` → `Tests  14 passed (14)`.
Lint: `> eslint src --ext .js,.ts,.vue` → exit 0 (`lint=0`).
Build: `✓ built in 3.85s` (only the existing >500 kB chunk warning).
Typecheck: `npm run typecheck 2>&1 | grep -c "error TS"` → `78` (baseline 78). Errors in changed files — all pre-existing (same 3 on staging, lines shifted):
```
src/composables/useCandidate.ts(68,44): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/composables/useCandidate.ts(76,57): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/composables/useCandidate.ts(80,13): error TS7053: Element implicitly has an 'any' type ...
```
Staging (`git stash`) run: `78`, and `useCandidate.ts(72,44) TS7006`, `(80,57) TS7006`, `(83,13) TS7053` — same three. An intermediate version produced 79 (new TS7053 at `(80,49)` on `result.value[_findIndex].order`) → fixed with a cast, back to 78.
Earlier failures read back: first lint had 4 errors (`'ref' is defined but never used` ×2 in page specs, unused `a`/`b` in a type in `sectionOrder.spec.ts`) → fixed. First run after the race fix: `× useCandidate > #442 backend order > reorder puts the old order back when the request fails` (ref returns a proxy, `result.value === list` false) → compare against the value read back from the ref → green.

`grep -rn "cv-manual-order\|useManualOrder" src; echo "grep_exit=$?"` → no lines, `grep_exit=1`.

### Live check (operator approved, QA account `qa.full@example.com`, Vite on :5173 started by me and stopped after, debug Chrome :9888 via Playwright)
- `/dashboard/project` before: `["SimpleMDG","Personal Portfolio","AiHR – Human Resource Management System"]`; dragstart on last row, drop on first → after: `["AiHR – Human Resource Management System","SimpleMDG","Personal Portfolio"]`.
- Network: `{"m":"PUT","url":"https://nodejs-resume-api-ts.onrender.com/api/v1/project/reorder","s":200,"body":"{\"ids\":[\"6adf41182987df4de8b08a44\",\"6adf41192987df4de8b08a46\",\"6adf41192987df4de8b08a48\"]}"}`.
- Toasts after drop: `["Đăng nhập thành công"]` only (the login toast still on screen) — no reorder toast. Hint text: `"Kéo thả để sắp xếp."`. `localStorage` keys starting `cv-manual-order`: `[]`.
- Reload → `afterReload: ["AiHR – Human Resource Management System","SimpleMDG","Personal Portfolio"]`. (First reload attempt failed with `Failed to fetch dynamically imported module …/PageProject.vue`; `curl` of that URL → `200`; second reload fine — dev-server hiccup, not app code.)
- `/dashboard/preview` Projects section: `{"t":"DỰ ÁN","items":["AiHR – Human Resource Management System","SimpleMDG","Personal Portfolio"]}`.
- Public page `http://localhost:5173/resume-vuejs-website/#/resume/qa-full-2zd2` (new tab): `{"t":"DỰ ÁN","items":["AiHR – Human Resource Management System","SimpleMDG","Personal Portfolio"]}`.
- `/dashboard/experience`: `{"draggable":0,"hint":false,"items":18}`.
- Education NOT checked live: qa.full has 1 education (memory `qa-test-accounts`), nothing to reorder; same `useCandidate.reorder` code path, covered by `useCandidate.spec.ts` "reorder puts the old order back…" (`education/reorder` url) + `PageEducation.spec.ts`.
- The QA account's project order is now changed (AiHR first) — test data, left as is.

## Acceptance
| Criterion | Evidence |
|---|---|
| (#442) drop B onto A → `PUT …/reorder {ids:[B,A]}`, render B, A; failure → A, B; no success toast, error toast on failure; no `cv-manual-order` setItem (clarified above) | `PageProject.spec.ts (10 tests)` + `PageEducation.spec.ts (4 tests)` pass ("dropping B onto A reorders to B, A and writes nothing to localStorage"); `useCandidate.spec.ts (20 tests)` pass: "reorder shows the new order at once, PUTs every id, stores order = index, no success toast" (asserts `{ method:'put', url:'project/reorder', data:{ ids:['B','A'] } }`, `props.toast` null, `toastError` function), "reorder puts the old order back when the request fails" (`education/reorder`, list + store A, B); live PUT 200 above |
| (#442) Experience: no `draggable="true"`, no dragToSort text; newest first | `PageExperience.spec.ts (6 tests)` pass ("has no drag-and-drop and no \"drag to sort\" hint"); live `draggable:0, hint:false`; date sort: `useCandidate.spec.ts` "sorts fetched list results by startDate descending" + `compareEntries` tests |
| (#442) edited entry with `order: 0` and response without `order` keeps position; new entry after ordered ones | `useCandidate.spec.ts` "an edited entry keeps its place even though the update response has no order; a new one goes last" pass |
| (#442) `grep -rn "cv-manual-order\|useManualOrder" src` no hits; composable + spec removed; export dropped | `grep_exit=1`, no lines; diff stat shows both files deleted; `src/composables/index.ts` export list without `useManualOrder` |
| (#442) Manual on qa.full: drag last project to top → PUT 200, no toast; reload → still top; Preview + public link first; Experience no handle | Live check above. Education live: not done (1 entry) — stated above |
| (#406) comparator spec cases | `sectionOrder.spec.ts (6 tests)` pass — the spec's input verbatim, order wins, unordered after ordered, missing startDate last |
| (#406) `CvResumeLayout.spec.ts`: company first without order; given order with `[0,1]`; no group heading | `CvResumeLayout.spec.ts (9 tests)` pass ("lists company projects first, newest first, unless the user set an order, with no type headings") |
| (#442, #406) keys in both vi/en; lint, build, test pass; typecheck ≤ 78, none in changed files | `dragToSort` changed in both (`src/i18n/index.ts:74`, `:661`), no new keys; lint exit 0; `✓ built in 3.85s`; `Tests 497 passed (497)`; typecheck `78`, the 3 hits in `useCandidate.ts` pre-exist on staging (cited above) |
| Behavior #12: Preview uses dashboard order | Preview reads via `useCandidate` → `sortData`; live Preview order matches dashboard |
| Behavior #13: no group headings (Q14) | CvResumeLayout spec asserts section titles `['Dự án']` only; no template change besides the sorted list |
| comments per code-comments.md | Added comments (all WHY, `//` single sentence, `/** */` file overview, no issue refs): `sectionOrder.ts` header + 3 `//` (date fallback, unordered-last, legacy type); `useCandidate.ts` "the update response has no `order`, keep the entry's place", "saves a dragged list order …; a failed save puts the old order back", "a second drop while the first save is in flight could land in the wrong order", "an entry saved meanwhile already replaced the shown list — keep that one"; `CvResumeLayout.vue` "the manual order, else company projects first, newest first". `grep -rn "#[0-9]" src/utilities/sectionOrder.ts src/composables/useCandidate.ts` → no hits. Removed the old Vietnamese `useManualOrder` comments with the code |

## Supersedes
none — `grep "442\|406" haven/diagrams/dev-loop.prime-mermaid.md` before adding the node → no rows.

## Still open
none.

## Review
`/code-review medium` (background fork) returned 10 findings:
1. Overlapping reorders can overwrite each other → **fixed** (in-flight guard + revert only if shown list unchanged + success applies `order` by id to the current list); test "ignores a second drop while the first reorder is still saving".
2. Experiences sorted by `order` first → **false positive**: backend has no `experience/reorder` (Behavior #12, 404), experiences never get `order`; with no `order` `compareEntries` is pure date desc.
3. CvResumeLayout educations/awards/certs in raw API order on the public page → **false positive** for this spec: the public API already lists `order` asc then `startDate` desc (Behavior #12 contract) = `compareEntries`; spec only asks CvResumeLayout to sort projects.
4. `getData` stores unsorted API data → pre-existing, out of scope → Noticed.
5. `{ order: old.order, ...data }` erased by `order: null` in response → **fixed** (`{ ...data, order: data.order ?? old.order }`).
6. New entry pinned last after a reorder → **intended** (Behavior #12: "appears after all entries that have an `order`").
7. Old `cv-manual-order:*` keys not removed → **intended** (Q16: removal allowed, not required).
8. `onDrop` duplicated in PageEducation/PageProject → pre-existing duplication → Noticed.
9. `sortData` branches on field name `projects` → kept (smallest diff; one branch) → Noticed.
10. CvResumeLayout experiences comparator NaN on missing startDate → pre-existing, untouched → Noticed.

## Noticed, not done
- `useCandidate.getData` writes the unsorted API list into the store (review 4).
- `onDrop` drag logic duplicated in `PageEducation.vue` / `PageProject.vue` (review 8).
- `sortData` picks the comparator by field name; a `compare` prop would scale better if more sections get special rules (review 9).
- `CvResumeLayout` experiences sort `b.startDate - a.startDate` gives NaN for a missing `startDate` (review 10).
- Download CV / ATS project order without `order` differs from Preview until datvt243/resume-nodejs-api#502 (accepted gap, Q17).

## Seal gate
Outward-facing actions this run, both operator-approved in session: backend follow-up issue datvt243/resume-nodejs-api#502 (Q17 answer), and the live reorder writes to the QA account (`PUT project/reorder` 200, AskUserQuestion "Yes, run it on qa.full"). No commit/push — that's `/ship`.

## REOPEN round 1 (2026-11-24)
Verifier REOPEN (`evidence/verifier/2026-11-24/issue-442-406-cv-section-order-reopen.md`): acceptance "(#442, #406) `npm run typecheck` ≤ 78 errors and none in changed files" — 3 pre-existing errors remained in the touched `src/composables/useCandidate.ts`.

Fix (`src/composables/useCandidate.ts` only): `removeRecordById` filters `(result.value as Record<string, any>[])`; `addRecordToList` works on `const list = result.value as Record<string, any>[]` (findIndex / replace / push / `sortData(list)`), the earlier inline cast removed. No behavior change.

Output (verbatim):
- `npm run typecheck 2>&1 | grep -c "error TS"` → `75`
- `npm run typecheck 2>&1 | grep "error TS" | grep -E "sectionOrder|useCandidate|CvResumeLayout|PageEducation|PageProject|PageExperience|composables/index|i18n/index"; echo "changed_hits_exit=$?"` → no lines, `changed_hits_exit=1` (the pattern also matches the touched spec files)
- `npm run test` → `Test Files  69 passed (69)` / `Tests  497 passed (497)`
- `npx vitest run src/composables/useCandidate.spec.ts` → `Tests  20 passed (20)`
- `npm run lint` → `lint=0`
- `npm run build` → `✓ built in 3.85s`

Acceptance row updated: typecheck `75` (≤ 78), **none in changed files**. Doctrine proposal: `Typecheck` baseline `78 errors on staging @ 13383c8` → `75` after this node merges (verifier decides per verify_seal 11f).
