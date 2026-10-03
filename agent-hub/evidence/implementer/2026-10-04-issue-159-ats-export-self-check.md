# 2026-10-04 — issue-159-ats-export-self-check

- **Worker:** implementer
- **Version:** 0.1.0
- **Node:** `issue-159-ats-export-self-check` (new node, appended IN_PROGRESS)
- **Task:** "#159" (operator, via `/todo`)

## Hub bytes before: 152891

## Backend readiness (checked fresh, not assumed)
Issue says backend shipped on `staging` at `ca61614`. Re-checked:
```
cd resume-nodejs-api && git fetch origin
git merge-base --is-ancestor ca61614 origin/main  → origin/main YES
git log --oneline -3 origin/main
16c661f Merge pull request #214 from datvt243/release/v1.10.0
dc79192 chore(release): bump version to v1.10.0
ca61614 Merge pull request #213 from datvt243/211-add-ats-friendly-cv
```
So the feature is on backend `main` (v1.10.0), not just staging → not blocked.
Read real backend source on `origin/main`, not the issue text:
- `src/routers/api/v1/index.ts:37` `router.use('/cv', verifyToken, routeCv)`; `:94` `router.get('/download-pdf', verifyTokenByQuery, fnExportPDF)`
- `src/routers/api/v1/cv.route.ts:70` `router.post('/ats-check', fnAtsCheck)`
- `src/candidate_me/ats-check.ts` — body `lang` ('en' else 'vi'), `template` ('classic' else 'ats'), `jobDescription` (string only); response `data: { score, pages, checks, extractedText, ...(keywordMatch) }`
- `src/services/atsChecks.ts:14-19` `AtsCheckResult { id; passed; severity: 'error'|'warning'; message }`
- `src/services/keywordMatcher.ts:11-15` `{ matched: string[]; missing: string[]; coverage: number }`

## Branch
`feature/issue-159-ats-export-self-check` (off `staging`, created before any file change; `git status` was clean on `staging`).

## Diff
| File | Why |
|---|---|
| `src/types/ats.type.ts` (new) | Checkbox 3: `CvTemplate`, `AtsCheckRequest`, `AtsCheckResult`, `AtsKeywordMatch`, `AtsCheckResponse` — field-for-field match with backend types above |
| `src/utilities/index.ts` | New `getDownloadCvUrl(host, template)` — `ats` → `?template=ats`; `classic` → no query (backend default), so the classic URL is byte-identical to pre-#159 |
| `src/utilities/index.spec.ts` | 3 tests for `getDownloadCvUrl` |
| `src/pages/home/PageHome.vue` | Checkbox 1: Classic / "Tối ưu ATS" toggle in the "Đính kèm CV" block, drives the existing download link via `getDownloadCvUrl`; link to the new ATS page |
| `src/pages/dashboard/PageAtsCheck.vue` (new) | Checkbox 2: template + lang selectors, optional job-description textarea, `handleBase({ method: 'post', url: 'cv/ats-check', data })` (CSRF header added by existing axios interceptor); shows score (color by band), pages, failed count, per-check pass/fail with severity badge, keyword coverage + matched/missing, collapsible extracted text, download link for the selected template. "Classic scores lower" note keyed on the template actually checked (`checkedTemplate`), not the current selection |
| `src/pages/dashboard/PageAtsCheck.spec.ts` (new) | 5 mount tests, `handleBase` mocked: request payload (defaults; trimmed JD + chosen template/lang), rendering of score/badges/keywords, keyword section hidden when absent, download href follows template |
| `src/routers/index.ts` | `ats-check` child route (`requiresAuth`) |
| `src/pages/_layouts/LayoutDefault.vue` | Sidebar entry "Kiểm tra ATS" after "Xem trước / Xuất PDF" |

Only already-registered FontAwesome icons used (`fa-gauge`, `fa-download`, `fa-circle-check`, `fa-circle-xmark`) — `initFontAwesomeIcon.spec.ts` passes.

## Command
From repo root, per `doctrine/MEMORY.md`: `npm run test`, `npm run build`, `npm run lint`.

## Output
```
npm run test
 ✓ src/utilities/index.spec.ts (21 tests) 15ms
 ✓ src/pages/dashboard/PageAtsCheck.spec.ts (5 tests) 66ms
 Test Files  20 passed (20)
      Tests  139 passed (139)

npm run build
dist/assets/PageAtsCheck-CTrfzXz8.js                5.53 kB │ gzip:   2.55 kB
dist/assets/PageHome-BSCXcamv.js                    7.65 kB │ gzip:   3.47 kB
✓ built in 3.68s
(pre-existing "Some chunks are larger than 500 kB" warning for VeeForm chunk, unrelated)

npm run lint
> eslint src --ext .js,.ts,.vue
(no findings printed)
```
Test count: the first `npm run test` this session (134 passed) ran after the 3 `getDownloadCvUrl` tests were added but before `PageAtsCheck.spec.ts` existed → 139 = 134 + 5 page tests; implied pre-diff baseline 131. 0 regressions (20/20 files pass).

First spec run had 4/5 failing `TypeError: cb is not a function` — root cause was the TEST, not the page: `beforeEach(() => handleBaseMock.mockReset())` returns the mock, which vitest runs as a cleanup hook (stack: `callCleanupHooks` in `@vitest/runner`), calling the mock with 0 args. Fixed with a block body + comment. Recorded honestly per `NoSilentFailure`.

## Manual check (dev server) — partial, stated plainly
- `npm run dev` → Vite at `http://localhost:5173/resume-vuejs-website/`; `curl` of `src/pages/dashboard/PageAtsCheck.vue`, `src/pages/home/PageHome.vue`, `src/routers/index.ts` → `200` each; transformed PageAtsCheck contains `cv/ats-check` (2 matches). No compile error.
- CDP drive of the port-9888 debug browser: navigating to `#/dashboard/ats-check` landed on `ATS page hash: #/login` — browser not logged in, auth guard redirected. Did NOT log in (no credentials; would be a real authenticated API call → seal gate). So **no visual click-through of the authenticated pages happened**; the mount tests are the substitute evidence for render + request shape.
- No real call to `POST /api/v1/cv/ats-check` was made from this session.

## Acceptance
| Criterion (issue #159 checkboxes) | Evidence |
|---|---|
| Backend feature live on backend `main` | `origin/main YES`; `16c661f ... release/v1.10.0` |
| 1. Template choice (Classic / ATS) in CV download UI | PageHome toggle; `getDownloadCvUrl` tests `adds template=ats ...` / `omits the query string ...` pass (21/21 in `src/utilities/index.spec.ts`) |
| 2. ATS Self-Check view: score, per-check pass/fail with severity, matched/missing keywords when JD pasted | `PageAtsCheck.spec.ts (5 tests)` ✓ — asserts `72`, `2 tiêu chí chưa đạt`, badges `['Lỗi']`/`['Cảnh báo']`, `50%`, matched `['typescript']`, missing `['vitest']`; payload `{ method: 'post', url: 'cv/ats-check', data: { template: 'ats', lang: 'vi' } }` |
| 3. Types/API client for `template` param + response shape | `src/types/ats.type.ts`, matches backend `atsChecks.ts:14-19` / `keywordMatcher.ts:11-15` |
| Non-breaking: classic download URL unchanged | test `defaults to the classic template with no query string (unchanged pre-#159 URL)` ✓ |
| Build green | `✓ built in 3.68s` |
| Lint clean | `npm run lint` printed no findings |

## Noticed, not done
- `src/pages/_layouts/Header.vue` "Download CV" button still downloads classic only (default, unchanged). Template choice was added on the Dashboard home + ATS page, not in the header (pug, minimal scope). Operator may want a header option later.
- `.claude/CLAUDE.md` "Known Bugs" still lists #8 (JWT in localStorage) as open, but #8 isn't in `gh issue list --state open` and a 2026-09-25 cookie-migration node is SEALED — that table looks stale.
- IDE TS diagnostics flag `Cannot find module './PageAtsCheck.vue'` / `'@/types/ats.type'` in the new spec — same class as existing specs importing `.vue`/`@/types` (no typecheck script exists, see MEMORY.md Typecheck row); vitest resolves them fine.
- Diagram rows `issue-116-multi-profile-unblocked-20260920` / `issue-8-jwt-localstorage-unblocked-20260920` still IN_PROGRESS though superseded by sealed nodes.

## Seal gate
None — no commit, push, merge, or real API call made. Diff is uncommitted on the branch; `/ship` is the operator's separate step.

## Status
`sealed_pending_verifier`
