# 2026-10-26 — issue-312-load-error-retry

- Worker: implementer · Version: 0.1.0
- Node: `issue-312-load-error-retry` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim, issue title): "#312 [QC][P3] Lỗi tải dữ liệu (429/mạng) hiển thị như dữ liệu rỗng; đăng nhập luôn báo chung "Đăng nhập thất bại"" — remaining part after `issue-312-load-login-errors` (SEALED 2026-10-25, its `## Still open`): "an in-page error state (DESIGN.md) with a 'Thử lại' button that re-runs the fetch, distinct from the empty state".

## Hub bytes before: 85074

## Branch
`fix/issue-312-load-error-retry` (off `staging` @ `89db59f`, via `gh issue develop 312`).

## Scope decision
Operator (AskUserQuestion): "8 trang danh sách" — Education, Experience, Project, Award, Certificate, Reference, Application, Profile. Visits/Dashboard (`useVisits`/`useVisitStats`) explicitly out of scope.

## Diff
| file | why |
|---|---|
| `src/composables/useCandidate.ts` | new `loadError` ref: `getData` sets it to `true` when `handleBase` never reached the success callback (HTTP error, `success:false`, network/timeout), `false` otherwise; returned alongside `getData` |
| `src/components/global/LoadingGate.vue` | list variant: new `error` prop + `retry` event; when not busy and `error`, renders a `role="alert"` card using `NoData` (warning icon, `error.loadList` / `error.loadListDescription`) with a `Button` "Thử lại" that emits `retry`, instead of the empty-state slot. Form variant untouched. |
| `src/pages/dashboard/Page{Education,Experience,Project,Award,Certificate,Reference,Application,Profile}.vue` | destructure `loadError, getData` from the page's own list `useCandidate`, and `<LoadingGate v-else :error="loadError" @retry="getData">` (1–2 lines each) |
| `src/i18n/index.ts` | `common.retry`, `error.loadList`, `error.loadListDescription` in both `vi` and `en` |
| `src/plugins/initFontAwesomeIcon.js` | register `faRotateRight` (caught by `initFontAwesomeIcon.spec.ts`; `faTriangleExclamation` was already registered) |
| `src/components/global/LoadingGate.spec.ts` | new test: `error` → alert shown, slot hidden, button emits `retry` once |
| `src/composables/useCandidate.spec.ts` | new test: failed load → `loadError` true; successful `getData()` → false |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended |

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/components/global/LoadingGate.spec.ts src/composables/useCandidate.spec.ts`: `Tests  17 passed (17)` (first run had my stub emitting `click` twice — test artifact, stub simplified)
- `npm run test` (first full run): `initFontAwesomeIcon.spec.ts` failed — `components/global/LoadingGate.vue -> "rotate-right"` not registered → added `faRotateRight`.
- `npm run test` (final): `Test Files  1 failed | 48 passed (49)` / `Tests  1 failed | 298 passed (299)` — only `VeeForm.spec.ts > VI | EN toggle …`, tracked as #347 (fails on clean `staging`).
- `npm run build`: `✓ built in 3.83s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline; `useCandidate.ts` 3 errors on clean `staging` (stash) and 3 with the diff — pre-existing implicit-any at lines 72/80/83, none new.

## Manual observation (real app, not an automated test)
Dev server → prod API, isolated Playwright context, `qa.minimal@example.com` (read-only, nothing saved). Playwright route made only `GET /api/v1/education/` return 500:
- Education page → alert text `Không tải được dữ liệu Kiểm tra kết nối mạng rồi thử lại. Thử lại`; the empty-state text ("Chưa có…") not shown.
- Route removed, clicked "Thử lại" → exactly one `GET education/`, alert gone, page shows the real state (`Chưa có học vấn nào … Thêm học vấn` — this QA account has no education).
Not checked live: the other 7 pages (same 1-line wiring, same composable) and the EN copy on screen.

## Acceptance
| Criterion | Evidence |
|---|---|
| Failed load ≠ empty state | live alert text, `emptyShown: false` |
| Retry re-runs the fetch and recovers | live `reqs: ["GET"]`, alert gone; `useCandidate.spec` |
| All 8 list pages wired | diff table (8 pages) |
| i18n in vi + en | `src/i18n/index.ts` keys; typecheck 90 (en typed `typeof vi`) |
| DESIGN.md: error states designed, reuse global components | reuses `NoData` + `Button`, `role="alert"` |
| Build/lint/typecheck vs baseline | `✓ built in 3.83s`, lint 0, typecheck 90 |
| Comments per code-comments.md | two 1-line why-comments (`loadError`, `error` prop) |

## Supersedes: none
## Still open
- Visits page / Dashboard stats still render zeros on a failed load (operator scoped them out); #312 can be closed with that noted, or a follow-up issue opened.

## Noticed, not done
- `useCandidate` callers that use it only as a cache read (e.g. `PageProfile`'s `educations`, `PageApplication`'s `profiles`) don't surface `loadError` — they're secondary lists, not the page's own list.

## Seal gate
none (no commit/push; no data written)
