# 2026-10-19 - issue-220-visits-analytics

- Worker: implementer
- Version: 0.1.0
- Node: `issue-220-visits-analytics` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #220 [UI] Phase 5 — Lượt truy cập + VisitChart theo template Analytics (DESIGN.md §4.2, §5.4, §6; files src/pages/dashboard/PageVisits.vue, src/components/visits/VisitChart.vue). Page header + segmented control Ngày/Tuần/Tháng on the right (§5.7), keep data-interval, fix PageVisits.spec.ts:69 (asserts btn-primary). KPI row: total views in range, top source, top country, with explicit range labels. Chart: --chart-1 (not --bs-primary), solid horizontal gridlines (no stroke-dasharray), 4px rounded bar tops, max 28px, tooltip §6.4, no bare outline: none (VisitChart.vue:161), svg role=img aria-label. Breakdowns Nguồn truy cập / Quốc gia as md:grid-cols-2 cards with share bars. Detail table: pagination (686 rows now), sentence-case headers (Thời gian, Vị trí, Địa chỉ IP), IP font-mono text-fg-2, empty cells '—'. Fix 375px horizontal overflow (scrollWidth 744). Description under title ≤1 sentence. Presentation only; keep data-* specs query; lint+test+build; screenshots 1440 light/dark, 375 dark. URL: https://github.com/datvt243/resume-vuejs-website/issues/220

## Hub bytes before: 186478

## Branch
`feature/issue-220-visits-analytics` — created from freshly pulled `staging` (at `1d7e2eb`, #219 merged) via `gh issue develop 220 --checkout --base staging`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageVisits.vue` | Rebuilt per §4.2. `Heading :level="1"` with one-sentence description ("Mỗi lần ai đó mở hồ sơ công khai qua link chia sẻ.") and, in its actions slot, a §5.7 segmented control (`role="radiogroup"`, `role="radio"` + `aria-checked`, `data-interval` kept, same `interval = o.value` handler). KPI row (`sm:grid-cols-3`): "Lượt xem · {range}" = `stats.total` with hint "Tổng N lượt từ trước tới nay" (makes the 30-day vs all-time difference explicit), "Nguồn hàng đầu · {range}", "Quốc gia hàng đầu · {range}" (top row by count + share %, "—" / "Chưa có dữ liệu" when empty). Chart card (title "Lượt xem theo {ngày/tuần/tháng} · {range}", skeleton until stats). Breakdowns: two §5.1 cards `md:grid-cols-2`, rows sorted by count desc, `truncate` + `title` labels, `tabular-nums` counts, 4px share bar filled with `var(--chart-1)` (scoped `.share-fill`, no arbitrary class). Detail table: replaced `TableDefault` on this page with a native §5.4 table inside an `overflow-x-auto` card — sticky `h-9 text-xs font-medium text-fg-3` headers in sentence case ("Thời gian", "Vị trí", "Địa chỉ IP"), `h-10` rows with bottom hairlines only, hover `bg-surface-2`, time via `Intl.DateTimeFormat('vi-VN')` as `dd/MM/yyyy HH:mm`, location `truncate max-w-xs` + `title`, IP `font-mono text-fg-2`, empty values "—", empty table → `NoData`. Pagination 25 rows/page with "a–b trong N" + "Trang x / y" and "Trước"/"Sau" secondary buttons (disabled at the ends); page clamps if the list shrinks. Removed: long description, `opacity-*`, `my-[1rem]`/`gap-[1rem]`/`mt-[1.5rem]`/`mb-[…]`, `.row/.col-*`, `h6` labels, `btn-group` + `btn-primary`/`btn-outline-primary`. Data reads unchanged (`useVisitStats` interval/stats, `candidate.visits` cache). |
| `src/components/visits/VisitChart.vue` | Styles only (+1 class swap): bars `fill: var(--chart-1)` (was `--bs-primary`), gridlines solid `var(--chart-grid)` (dropped `stroke-dasharray`), baseline + axis text `var(--chart-axis)`, axis `tabular-nums`; bar opacity transition only under `prefers-reduced-motion: no-preference`; `rect:focus { outline: none }` → `rect:focus:not(:focus-visible) { outline: none }` with the `:focus-visible` ring kept (now `--color-accent`, inset 2px); tooltip `@apply rounded border border-line bg-surface p-2 text-xs text-fg shadow-float` (§6.4); tooltip label `opacity-75` → `text-fg-2`. Geometry (4px rounded tops, max 28px, 2px gap, full-height hit areas) and `svg role="img" aria-label` were already correct — unchanged. |
| `src/pages/dashboard/PageVisits.spec.ts` | Mount: real `Heading` (the interval control now lives in its slot; a stub wouldn't render it), `NoData` stubbed, `TableDefault` stub dropped. Updated: table test checks `<table>` + the 3 header texts; totals test checks the KPI range labels instead of the old sentence; line 69 now asserts `aria-checked="true"` on week / `"false"` on day instead of `btn-primary` (DESIGN.md §0.2.4 allows updating a spec that asserts a replaced class). +1 test: 30 cached visits → 25 rows, "—" for an empty location, "1–25 trong 30", "Sau" → 5 rows, "26–30 trong 30", "Sau" disabled. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

Why not `TableDefault`: it hard-codes `capitalize` on header and body cells (Title Case "Thời Gian"), `table-bordered` vertical borders, no pagination, and its date `Convert` expects a number (one Vue warning per row with ISO strings — 697 here). Fixing those belongs to `TableDefault` itself (#221, Phase 6); this page only needed a 3-column read-only table.

## Command
From repo root:
- `npx vitest run src/pages/dashboard/PageVisits.spec.ts src/components/visits/VisitChart.spec.ts`
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
PageVisits.spec.ts + VisitChart.spec.ts:  Tests  11 passed (11)
npm run lint:   lint_exit=0
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Tests  1 failed | 232 passed (233)     (pre-existing failure; 233 = 232 + 1 new pagination test)
npm run build:  ✓ built in 3.60s
```
DESIGN.md §10 grep on added `src/` lines (hex / `[Npx|rem]` / `[var…]` / `opacity-N` / `stroke-dasharray`) → no matches (`grep_exit=1`).

Manual observation (Playwright on the port-9888 debug Chrome, `npm run dev`; not an automated test). Still logged in from the #219 pass; no reloads — HMR swap + sidebar navigation only (to stay clear of the API rate limit hit earlier):
```
Before (staging): 697 <tbody> rows, document height 27905px; 375 dark scrollWidth 375 (the 744px overflow in #220's text was already fixed by #217's shell)
After:
kpis: [["Lượt xem · 30 ngày","650","Tổng 697 lượt từ trước tới nay"],["Nguồn hàng đầu · 30 ngày","Trực tiếp / không rõ","100% lượt xem"],["Quốc gia hàng đầu · 30 ngày","Không rõ","100% lượt xem"]]
segmented: day aria-checked true, week/month false; click week → chart title "Lượt xem theo tuần · 12 tuần", KPI label "Lượt xem · 12 tuần"
bar fill rgb(10,168,122) (= --chart-1 dark #0aa87a); gridline dasharray "none", stroke rgb(39,39,42) (= --chart-grid dark)
svg: role "img", aria-label "Lượt xem theo ngày"
keyboard focus on last column → tooltip "19/10 359 lượt xem"
table: 25 rows, headers [Thời gian, Vị trí, Địa chỉ IP] text-transform none, IP font "Geist Mono", "1–25 trong 697" → Sau → "26–50 trong 697"
share bars 2 (rgb(10,168,122)); document height 1954px (was 27905); 375 dark scrollWidth 375
Vue warnings during the after pass: 0 (the 697 ConvertToDate warnings are gone from this page)
Console errors: 3× HTTP 401 (candidate, visits, visits/stats) = expired access token → the app's refresh-and-retry, data then loaded. No 429.
```
Screenshots (local, gitignored): `.playwright-mcp/220-before-1440-dark.png`, `220-before-1440-light.png`, `220-before-375-dark.png`, `220-after-1440-dark.png` (tooltip visible), `220-after-1440-light.png`, `220-after-375-dark.png`. Theme via the real header toggle.

## Acceptance
| Criterion | Evidence |
|---|---|
| Page header + right-side segmented Ngày/Tuần/Tháng; `data-interval` kept; spec :69 fixed | markup; live `seg`; spec 11/11 |
| KPI row: range total, top source, top country, explicit range labels | live `kpis` |
| Chart: `--chart-1`, solid gridlines, 4px tops ≤28px, §6.4 tooltip, no bare `outline: none`, `svg role=img aria-label` | live computed fill/dash/stroke, svg attrs, tooltip; CSS diff |
| Breakdown cards `md:grid-cols-2` with share bars | markup; live 2 share fills; screenshot |
| Table: pagination, sentence-case headers, mono IP `text-fg-2`, "—" | live table checks; new spec test |
| No 375px overflow | live `sw375: 375` |
| Description ≤ 1 sentence | `Heading` description prop |
| Presentation only; `data-*` kept | no API/store/composable/route changes; `data-interval` kept |
| lint + build green; no new test failure | outputs above |
| Comments per code-comments.md | `PageVisits.vue` header JSDoc condensed (kept the WHY for reading the cache via `computed`); kept the `null = …` breakdown WHY; `/* detail table — §5.4 paginate past 100 rows */`; `.share-fill` `/* single series → chart slot 1 */`; `VisitChart.vue` `/* Mouse focus stays quiet; keyboard focus gets the ring */`; spec `// Heading renders for real…`. No issue refs. |

## Noticed, not done
- `TableDefault.vue` still title-cases headers/cells, uses vertical borders, has no pagination, and its date `Convert` warns on ISO strings — Phase 6 (#221) should fix it for the CRUD pages that still use it.
- Location and referrer are null for every visit in this account (all "Không rõ" / "Trực tiếp / không rõ", IP `::1` = local dev visits), so the breakdowns show a single 100% row. Data, not UI.
- The chart tooltip at the last column sits partly outside the chart card's right edge (still inside the viewport at 1440); clamping it is a small follow-up.

## Seal gate
None in this pass (no commit/push; no login needed). Ship via `/ship` after verifier SEAL.
