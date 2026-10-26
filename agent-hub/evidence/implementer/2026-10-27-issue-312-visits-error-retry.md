# 2026-10-27 — issue-312-visits-error-retry

- Worker: implementer · Version: 0.1.0
- Node: `issue-312-visits-error-retry` (`haven/diagrams/dev-loop.prime-mermaid.md`, last row)
- Task (verbatim, issue title): "#312 [QC][P3] Lỗi tải dữ liệu (429/mạng) hiển thị như dữ liệu rỗng; đăng nhập luôn báo chung "Đăng nhập thất bại"" — remaining part after `issue-312-load-error-retry` (SEALED 2026-10-26), its `## Still open`: "Visits page / Dashboard stats still render zeros on a failed load". Operator re-ran `/todo #312` for this part.

## Hub bytes before: 2550745 (`find agent-hub -name '*.md' -o -name '*.yaml' | xargs cat | wc -c` — whole hub, not the per-session read set the earlier note's 85074 measured)

## Branch
`fix/issue-312-visits-error-retry` (off `staging` @ `743e892`, via `gh issue develop 312`).

## Diff
| file | why |
|---|---|
| `src/composables/useVisitStats.ts` | new `loadError` ref, same pattern as `useCandidate`: `true` when `handleBase` never reached the success callback; returned with `getData` |
| `src/composables/useVisits.ts` | after each fetch writes `visitsLoadError: !loaded` into `candidateStore` (pages read the visits only via the store cache, not this composable) |
| `src/pages/_layouts/LayoutDefault.vue` | keeps `useVisits()`'s `getData` and `provide('reloadVisits', …)` — pages retry through it instead of calling `useVisits()` again (would double-fetch on a hard reload, the reason the cache exists) |
| `src/pages/dashboard/PageVisits.vue` | `loadError = statsError || visitsLoadError`; when set, a `role="alert"` card (`NoData` + `Button`, same keys/icons as `LoadingGate`'s error: `error.loadList`, `error.loadListDescription`, `common.retry`) replaces KPIs/chart/breakdowns/table; `retry()` re-runs only what failed. Heading + interval control stay. |
| `src/pages/home/PageHome.vue` | views chart: error card + retry instead of an endless skeleton when stats are null and a load failed; views KPI shows `—` instead of `0` when `visitsLoadError` |
| `src/composables/useVisitStats.spec.ts`, `useVisits.spec.ts` | new test each: failed load → flag true; successful `getData()` → false |
| `src/pages/dashboard/PageVisits.spec.ts` | mock returns `loadError`/`getData`; new test: `visitsLoadError` → alert, no table, Retry calls `reloadVisits` once and not `reloadStats` |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row |

No new i18n keys or icons (reused from the previous node).

## Command
From repo root: `npm run test` · `npm run build` · `npm run lint` · `npm run typecheck`

## Output
- `npx vitest run src/pages/dashboard/PageVisits.spec.ts src/composables/useVisits.spec.ts src/composables/useVisitStats.spec.ts`: `Tests  17 passed (17)` (two earlier runs failed on my `Button` stub — an emitting stub double-fired, a string stub didn't render; switched to `{ template: '<button />' }` as in `LoadingGate.spec.ts`)
- `npm run test`: `Test Files  1 failed | 48 passed (49)` / `Tests  2 failed | 300 passed (302)` — both in `VeeForm.spec.ts` (untouched). Run alone, 3× with the diff stashed and 3× with it: `Tests  1 failed | 18 passed (19)` every time (the #347 VI|EN test); the 2nd ("typing then clearing a required field…") only fails under full-suite load → timing flake, same file, #347.
- `npm run build`: `✓ built in 4.05s`
- `npm run lint`: exit 0
- `npm run typecheck`: 90 `error TS` = baseline. Only hit in touched files: `useVisitStats.ts` TS2352 on `res.data as VisitStats` — present on clean tree (stash) at line 70, now line 73; not new.

## Manual observation (real app, not an automated test)
Dev server → prod API, isolated Playwright context, `qa.minimal@example.com` (read-only, nothing saved). Playwright route made `GET candidate/visits` and `GET candidate/visits/stats` return 500:
- Home (`#/`) → alert `Không tải được dữ liệu / Kiểm tra kết nối mạng rồi thử lại. / Thử lại`.
- Visits (`#/dashboard/visits`) → same alert, `table: false`.
- Route switched to pass-through, clicked "Thử lại" → requests `["stats","visits"]` (one each), alert gone, table shown, KPI `0` (this QA account has no views).
Not checked live: Home's `—` KPI text (my selector picked the profile strip; covered only by reading the template), EN copy.

## Acceptance
| Criterion | Evidence |
|---|---|
| Failed visits/stats load ≠ zero/empty | live alerts on both pages, `table: false` |
| Retry re-runs the failed fetches and recovers | live `["stats","visits"]`, alert gone; `PageVisits.spec` (retries only what failed) |
| No duplicate visits fetch | retry goes through `LayoutDefault`'s provided `getData`, no second `useVisits()` |
| i18n / DESIGN.md: reuse global components | existing keys, `NoData` + `Button`, `role="alert"` |
| Build/lint/typecheck vs baseline | `✓ built in 4.05s`, lint 0, typecheck 90 |
| Comments per code-comments.md | three 1-line why-comments (`loadError`, `visitsLoadError`, `provide`) |

## Supersedes: none
## Still open: none for #312's load-error part — the issue can be closed once released.

## Noticed, not done
- Home: if only the visits list fails but stats load, the chart shows and the KPI shows `—` without its own retry (the KPI links to the Visits page, which has one).

## Seal gate
none (no commit/push; no data written)
