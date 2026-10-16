# 2026-10-10 - issue-186-visit-stats

- Worker: implementer
- Version: 0.1.0
- Node: `issue-186-visit-stats` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `IN_PROGRESS`)
- Task (verbatim, from issue #186): "[ENHANCEMENT] Thống kê lượt xem CV chi tiết (theo ngày, nguồn) — Trang Visits hiện chỉ có số đếm lượt xem CV public. Đề xuất: Biểu đồ lượt xem theo ngày/tuần. Nguồn truy cập (referrer), profile nào được xem (`?profile=`). Cần backend lưu thêm timestamp/referrer cho mỗi visit (`POST /api/me/:value/visit`)."

## Hub bytes before: 174011

## Branch
`feature/issue-186-visit-stats`, created off `origin/staging` (`41f03e9`, fetched and pulled this session) via `gh issue develop 186 --checkout --base staging --name feature/issue-186-visit-stats`. Never on `main`/`staging` while editing.

## Scope decision (read from the backend repo, not assumed)
Checked `../resume-nodejs-api` (`git fetch`, then `git grep` on both branches):
- `GET /api/v1/candidate/visits/stats` (`visitStats.service.ts`): `{interval, tz, from, to, total, series[{bucket,count}] zero-filled, countries[{country,count}], sources[{source,count}]}`, query `interval=day|week|month`, `from`/`to` local `YYYY-MM-DD`, `tz` IANA, ≤400 buckets. Present on backend **`origin/main` AND `origin/staging`**.
- Referrer: `POST /api/me/:email/visit` reads `req.body.referrer`, stores the hostname only (`normalizeReferrer`). `visit.model.ts` `referrer` field is on backend **`origin/staging` only, not `origin/main`**.
- Per-profile (`?profile=`): not stored anywhere in the backend.

So in scope: chart (day/week/month) + source and country breakdowns from the stats endpoint, plus sending `document.referrer` on the visit POST. **Out of scope:** the per-profile breakdown (needs backend work first). Not sure which backend branch Render deploys. If it's `main`, every source shows as "Trực tiếp / không rõ" until the backend releases referrer tracking. The frontend handles `source: null` explicitly.

## Diff
| File | Why |
|---|---|
| `src/composables/useVisitStats.ts` (new) | `useVisitStats()`: `interval` ref (default `day`), `stats` ref; `watch(interval, getData, {immediate:true})` → `handleBase` GET `candidate/visits/stats` with `{interval, from, tz}` (`tz` = browser zone). `visitStatsFrom(interval, tz, now)`: 30 days / 12 ISO weeks from a Monday / 12 calendar months, with "today" computed in `tz`, the same zone the backend buckets by. `formatBucket` (`DD/MM`, `Tuần N`, `MM/YYYY`), `INTERVAL_LABELS`. Not cached on candidateStore (interval-dependent, one page). |
| `src/components/visits/VisitChart.vue` (new) | SVG bar chart, no new dependency. Single series → one hue, no legend. `--bs-primary` was validated with the dataviz skill's `validate_palette.js` against both surfaces (output below). Rounded 4px tops, square baseline, 2px gaps, bar width capped at 28px, dashed recessive gridlines, axis max rounded to 1/2/5 steps. Full-height hit targets (wider than bars) with hover, keyboard focus and `aria-label` "<bucket>: N lượt xem"; tooltip shows the exact count and the other bars dim. Drawn at the container's measured pixel width (`clientWidth` on mount + `ResizeObserver`), not a scaled viewBox, so 11px axis text stays 11px on a phone. X labels thin out per interval (44px for `DD/MM`, 56px for `Tuần NN`/`MM/YYYY`). |
| `src/pages/dashboard/PageVisits.vue` | Interval toggle (`Theo ngày/tuần/tháng`), total "N lượt xem trong 30 ngày / 12 tuần / 12 tháng gần nhất", `VisitChart`, two breakdown lists (Nguồn truy cập, Quốc gia) with count, % and a thin share bar. `null` → "Trực tiếp / không rõ" / "Không rõ". Empty → "Chưa có lượt xem trong khoảng này.". The existing per-visit table stays below as the table view, under a new "Chi tiết từng lượt" heading. Header JSDoc +1 sentence. |
| `src/pages/public/PagePublicResume.vue` | Visit POST now sends `data: { referrer: document.referrer }` (1 line). The backend reduces it to a hostname; on a backend without the field the body is ignored. |
| `src/composables/useVisitStats.spec.ts` (new) | 6 tests: `visitStatsFrom` per interval incl. tz date-line (HCM vs UTC) and the year boundary; `formatBucket`; fetch params + stored response; refetch on interval change. |
| `src/components/visits/VisitChart.spec.ts` (new) | 6 tests: bars per non-zero bucket and hit target per bucket; aria-labels; hover tooltip + dim + leave; nice y max (13 → 0/5/10/15/20); label thinning at 30 buckets; all-zero series renders no NaN. |
| `src/pages/dashboard/PageVisits.spec.ts` (new) | 4 tests (`useVisitStats` mocked; TableDefault/VisitChart/Heading stubbed): no chart before stats but table kept; total + null labels + `(75%)`; empty breakdown messages; interval toggle. |
| `src/pages/public/PagePublicResume.spec.ts` | **Existing file, additions only** (+36/−0): new `describe('PagePublicResume — visit tracking')` reusing the file's `mountAt` (real router): POST carries `document.referrer`; direct visit sends `''`; no POST when the profile isn't found. The 2 existing `?lang` tests are unchanged. |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run <each new/changed spec>` (repeated)
- The page specs with `PageVisits.vue` / `PagePublicResume.vue` checked out at `HEAD` (restored after; `git diff --stat` confirms)
- `npm run test` ×3 (final code)
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script
- `node scripts/validate_palette.js "#0d6efd" --mode light|dark --surface …` (dataviz skill)
- Visual: Vite dev server (`--port 5199`) serving a throwaway `chart-preview.html` at repo root that mounts the real `VisitChart.vue` with the real `tailwind.css` and synthetic series. Screenshots via headless Chrome. The file was deleted afterwards and the server stopped; `git status` shows no trace.

## Output
New specs on the final code (3 consecutive runs):
```
      Tests  12 passed (12)          # useVisitStats.spec.ts + VisitChart.spec.ts
 ✓ src/pages/dashboard/PageVisits.spec.ts (4 tests) 32ms
 ✓ src/pages/public/PagePublicResume.spec.ts (5 tests) 31ms
```
Page specs against the original page files at `HEAD`:
```
   × PagePublicResume — visit tracking > records the visit with the page referrer so the backend can attribute the source 7ms
   × PagePublicResume — visit tracking > sends an empty referrer for a direct visit 4ms
      Tests  2 failed | 3 passed (5)
   × PageVisits > shows the total and labels null source/country instead of leaving them blank 6ms
   × PageVisits > shows an empty message for a breakdown with no rows 3ms
   × PageVisits > switches interval from the toggle 3ms
```
(The base-passing ones are "no POST when not found", "table kept before stats", and the 2 pre-existing `?lang` tests.)

`npm run test` ×3, final code:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  1 failed | 198 passed (199)
```
(identical all 3 runs). One earlier run, before the PageVisits/referrer specs existed, also showed `BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn`. Both are `VeeForm.spec.ts`, a file this diff doesn't touch. Both are documented as pre-existing on base: VI | EN in `2026-10-10-issue-187-unsaved-modal-warning.md` (6/6 base runs), the touch+clear ones as known flaky in `2026-10-10-issue-181-delete-confirm-message.md`.

`npm run build`: `✓ built in 3.80s`. `npm run lint`: exit 0.

Palette validator (`#0d6efd`):
```
Palette (light, surface #ffffff, categorical): 1 slots  → ALL CHECKS PASS (Contrast vs surface all 1 >= 3:1)
Palette (dark, surface #212529, categorical): 1 slots   → ALL CHECKS PASS (Contrast vs surface all 1 >= 3:1)
```

Visual check (headless Chrome screenshots, viewed this session):
- Desktop 760px, light + dark, day/week/month: no label collisions, all 12 week/month labels shown, day labels every 2nd, tooltip "01/10 · 12 lượt xem" with the other bars dimmed.
- Found and fixed through screenshots: (1) a scaled `viewBox` would have shrunk axis text to ~5px on a phone → switched to measured width; (2) at 328px the week labels collided ("Tuần 30Tuần 32") → per-interval label spacing; (3) 64px spacing over-thinned the desktop week labels → 56px.
- Headless Chrome enforces a 500px minimum viewport (DOM dump: `DBG inner=500 svg=468`), so the phone render was done by constraining the container to 328px (= 360 − 2×16 gutter): `DBG … svg=328`, labels every 3rd week / 3rd month / 5th day, no overlap.
- Not visually checked: `PageVisits.vue` itself (toggle, total, breakdown lists) inside the real logged-in dashboard. It needs a backend session. Covered by `PageVisits.spec.ts` only.

## Acceptance
| Criterion | Evidence |
|---|---|
| Chart of visits by day/week (+ month) | `VisitChart.spec.ts` 6/6; `useVisitStats.spec.ts` fetch + refetch-on-interval; screenshots per interval; PageVisits toggle spec (fails on HEAD) |
| Referrer source breakdown | PageVisits spec "labels null source/country…" (fails on HEAD); public page sends `document.referrer` (2 specs fail on HEAD) |
| Per-profile breakdown | **Not done, out of scope.** The backend stores no profile id per visit (checked in `../resume-nodejs-api`), so it needs a backend change. See Noticed #1 |
| Accessible / not color-only | single series (no legend needed), aria-labels per bucket, keyboard focus, table view kept, contrast validated light+dark |
| Phone width works | 328px container screenshot, no overlap or overflow |
| Build green | `✓ built in 3.80s` |
| Lint clean | exit 0 |
| comments per code-comments.md | `useVisitStats.ts`: file JSDoc (why not cached), JSDoc on `visitStatsFrom` (why tz) and `formatBucket`. `VisitChart.vue`: header JSDoc (single hue/no legend, table view), JSDoc on measured width, `niceMax`, `barPath`; `//` for bar-width cap, label spacing, hit target. `PageVisits.vue`: +1 header sentence, one `//` (what null means). Specs: none beyond names. All WHY, no issue refs |

## Seal gate
none — no commit/push/merge/real API call. Backend repo was only read (`git fetch` + `git grep`/`git show`), nothing written there.

## Noticed, not done
1. Per-profile visit stats need the backend to store the viewed profile id on `Visit` (the public page already knows `route.query.profile`). Worth a backend issue, then a follow-up here.
2. Referrer tracking is on backend `staging` only. Until the backend releases it, production sources will all be "Trực tiếp / không rõ" (assuming Render deploys backend `main`, which I haven't verified).
3. Process slip, caught and fixed: my first search for existing visit specs (`grep --include=*.spec.ts`) failed on a zsh glob error and returned nothing, so I overwrote the existing `PagePublicResume.spec.ts`. `git status` showing `M` instead of `??` exposed it. I restored it from `HEAD` and appended my tests (+36/−0, original 2 tests intact).
4. Test-only oddity, not explained: in `useVisitStats.spec.ts` the mocked `handleBase` saw one extra zero-argument call after the real 3-argument call (the call-count assertion of 1 had already passed). It doesn't come from the composable (every real call passes 3 args). The mock uses `cb?.()` to tolerate it.
