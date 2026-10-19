# 2026-10-19 - issue-219-home-overview

- Worker: implementer
- Version: 0.1.0
- Node: `issue-219-home-overview` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #219 [UI] Phase 4 — Trang chủ theo template Overview (DESIGN.md §4.1, §5.2, §5.10, §7; file src/pages/home/PageHome.vue). Profile strip one row: 40px avatar, name, desired position, open-to-work badge (success + dot) / neutral, secondary 'Cập nhật hồ sơ'. KPI row 3 tiles, real data only: Lượt xem (visitCount, no delta), Hoàn thành hồ sơ % (useProfileCompletion), Đơn ứng tuyển (useCandidate('applications')); no ATS KPI. Main row lg:grid-cols-3: compact visits chart lg:col-span-2 + 'Xem chi tiết' link; 'Hoàn thiện hồ sơ' card with thin progress bar (§5.10) replacing the ring + list of missing sections. CV card: file row, segmented control for template, language select, download button. 'Đính kèm file mới' disabled + tooltip 'Sắp ra mắt'; remove dev-note copy (:184 'đang chờ backend…', toast :103, :148), 'Mới' badge, English 'PROFILE INFORMATION', trailing → (:116,149,177,199,205), opacity-*, rounded-pill, hex, arbitrary spacing. Presentation only; keep data-* specs query; lint+test+build; screenshots 1440 light/dark, 375 dark. URL: https://github.com/datvt243/resume-vuejs-website/issues/219

## Hub bytes before: 185347

## Branch
`feature/issue-219-home-overview` — created from freshly pulled `staging` (at `59087ad`, #218 merged) via `gh issue develop 219 --checkout --base staging`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/pages/home/PageHome.vue` | Only file changed. Template rebuilt per §4.1, all token classes, whole scoped `<style>` block removed (it held the ring, gradients, `rgba(0,208,149,…)`, `#fff`, opacity text). Details below. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

`PageHome.vue`, top to bottom:
- `h1.sr-only` "Tổng quan" (one h1 per page, §8; the strip below is the visible header). Placed outside the `space-y-6` wrapper so it adds no top gap.
- **Profile strip** (`section` card, one `flex-wrap` row): 40px `rounded-full` avatar (`bg-accent-subtle text-accent` initials, or `<img alt="">`), name `text-md font-semibold truncate`, position `text-sm text-fg-2` (empty → "Chưa có vị trí mong muốn"), §5.6 badge — success `bg-success-subtle text-success` + 6px `bg-success` dot "Đang mở tìm việc", else neutral `bg-surface-2 text-fg-2` + `bg-fg-3` dot "Không tìm việc"; "Cập nhật hồ sơ" = `RouterLink` with `buttonClass({variant:'secondary'})`. Email line dropped (not in §4.1's strip spec).
- **KPI row** `grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6`, §5.2 tiles, each a `RouterLink` (detail page exists): "Lượt xem hồ sơ" = `candidate.visitCount` (`Intl.NumberFormat('vi-VN')`, no delta), "Hoàn thành hồ sơ" = `useProfileCompletion().percent` + hint `N/8 mục đã đủ` (links to the first missing section), "Đơn ứng tuyển" = `useCandidate({ field: 'applications', collection: 'application' })` length (same call as `PageApplication.vue`). Zero shows "0" with its hint (§5.2). No ATS tile.
- **Main row** `grid gap-6 lg:grid-cols-3`: visits card `lg:col-span-2` (§5.1 header `h-12 border-b`, `h2` "Lượt xem 30 ngày", "Xem chi tiết" link) rendering the existing `VisitChart` from `useVisitStats()` (default interval `day` = last 30 days) with the range total; `h-56 bg-surface-2 rounded motion-safe:animate-pulse` skeleton until stats arrive. "Hoàn thiện hồ sơ" card: §5.10 bar `h-1.5 rounded-full bg-surface-2` + `bg-brand` fill + `%` `text-sm font-medium`, `role="progressbar"` with `aria-valuenow/min/max` + `aria-label`; "Còn thiếu N mục" + section links, or "Hồ sơ đã đủ các mục bắt buộc."
- **CV card**: header `h2` "CV của bạn" + ghost "Kiểm tra điểm ATS"; file row (icon tile, `cvFileName`, meta "Tạo tự động từ hồ sơ, luôn là bản mới nhất"); §5.7 segmented control (`role="radiogroup"`, buttons `role="radio"` + `aria-checked`, `bg-surface-2 p-0.5` / selected `bg-surface text-fg shadow-sm`); language `select.form-select` (unchanged `useCvLang`); "Đính kèm file" secondary button `disabled` + `aria-describedby` → sr-only "Sắp ra mắt", wrapped in `span[title="Sắp ra mắt"]` so the hover tooltip still shows on a disabled button; "Tải CV" = the page's single primary (anchor, same `downloadCVUrl` / `download` as before).
- Removed: file `<input>`, `triggerFilePicker`/`handleSelectFile`/`selectedFileName`, the dev-note toast and `useHelper` import (the button is disabled, so the picker can't open); dev-note paragraphs; "Mới" badge; "Profile Information" heading; all `→`; `rounded-pill`; `opacity-*`; `mb-[3rem]`/`gap-[…]`; the long itviec-history header comment (replaced with a short description).
- Unchanged logic: `getDownloadCvUrl(_host, cvTemplate, auth.getToken, selectedLang)`, `cvFileName`, `useCvLang`, `useProfileCompletion`, the `visitCount` cache read.

New data calls on this page: `useVisitStats` (GET `candidate/visits/stats`, same as `/dashboard/visits`) and `useCandidate` applications (GET `application/`, skipped when cached) — both read-only, both requested by the issue.

## Command
From repo root:
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
`npm run lint` → `lint_exit=0` (also after the h1 move).

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
      Tests  1 failed | 231 passed (232)
```
Pre-existing failure (proven on `staging` in `issue-216-ui-tokens`). No spec covers `PageHome.vue` (none exists); no `data-*` attributes were on this page.

`npm run build` → `✓ built in 3.90s` (final, after the h1 move).

DESIGN.md §10 grep on added `src/` lines (hex / `[Npx|rem]` / `opacity-N` / `rounded-pill` / `→`) → only `→` inside two code comments (header description, token comment); none in rendered markup. `main` text check in the browser: `arrows: false`.

Manual observation (Playwright on the port-9888 debug Chrome, `npm run dev`; not an automated test):
- The session had expired again. My first re-login attempt hit **HTTP 429** on `auth/login`, `auth/refresh`, `candidate/visits`, `reference/` — rate limiting caused by my own repeated page reloads during the #218/#219 checks. I stopped all API traffic, waited 10 minutes, then logged in exactly once (operator approved clicking Login with Chrome's autofill earlier in this session for these checks): `loginStatus: [200]`. After that, navigation was by sidebar clicks/HMR only, no reloads.
- Before: diff stashed (= `staging`), `#/` reached by sidebar click, old layout confirmed (`.profile-card` present).
- After (diff restored, HMR swapped the page, remounted via sidebar):
```
h1 "Tổng quan" (sr-only); badge "Không tìm việc"
kpis: [["Lượt xem hồ sơ","697","Tổng số lần hồ sơ công khai được mở"],["Hoàn thành hồ sơ","50%","4/8 mục đã đủ"],["Đơn ứng tuyển","0","Đang theo dõi"]]
chart svg rendered, skeleton gone; progressbar aria-valuenow "50", fill 147.32px
segmented: Classic aria-checked true → click "Tối ưu ATS" → [false, true], download href contains "ats"
"Đính kèm file" disabled = true, wrapper title "Sắp ra mắt"; no "→" in <main>
1440 dark scrollWidth 1440; 375 dark scrollWidth 375
first section top - main top = 24px (= main py-6) after moving the sr-only h1
```
- Console during the after pass: 0 errors; 697 Vue warnings, all `Invalid prop: type check failed for prop "modelValue". Expected Number | Null, got String` from `<ConvertToDate>` inside `TableDefault` on `/dashboard/visits` (one per visit row) — I passed through that page to remount the home page. Pre-existing, not from `PageHome.vue`.
- Screenshots (local, gitignored, full page): `.playwright-mcp/219-before-1440-dark.png`, `219-before-1440-light.png`, `219-before-375-dark.png`, `219-after-1440-dark.png`, `219-after-1440-light.png`, `219-after-375-dark.png`. Theme via the real header toggle.

## Acceptance
| Criterion | Evidence |
|---|---|
| Profile strip one row: 40px avatar, name, position, success/neutral dot badge, secondary "Cập nhật hồ sơ" | markup above; screenshot; badge text read live |
| 3 KPI tiles, real data, no delta, no ATS | live `kpis` readout |
| Main row: compact chart `lg:col-span-2` + "Xem chi tiết"; completion card with thin progress bar + missing list | live chart/progress readout; screenshot |
| CV card: file row, segmented template, language select, download | live segmented + href check |
| "Đính kèm file" disabled + "Sắp ra mắt"; dev notes / toast removed | live `disabled`/`title`; removed code listed |
| No "Mới", English heading, `→`, opacity, pill, hex, arbitrary values | grep + live `arrows:false` |
| Presentation only; `data-*` kept | download URL/token/lang logic untouched; only read-only composables added as the issue asks; no `data-*` existed |
| lint + build green; no new test failure | outputs above |
| Screenshots 1440 light/dark, 375 dark | files listed |
| Comments per code-comments.md | Header JSDoc rewritten to a short description (what the page shows + data sources); `// backend has no avatar field yet; render it once it exists` (kept WHY, shortened); `/* profile strip */`-style section markers (4); kept the `?token=` WHY comment; CV card `/* … */` (why the PDF needs no upload). Removed the issue-ref comments (`issue #159`, `issue #182`, `issue #59`). |

## Noticed, not done
- `/dashboard/visits` table: `ConvertToDate` expects `Number | Null` but visits carry ISO strings → one Vue warning per row (697 here). Phase 5/6 territory (#220/#221) or its own bug.
- The backend rate-limits fast enough that ~a dozen reloads in a few minutes lock out login/refresh for a while — worth knowing for future browser checks (prefer sidebar navigation + HMR over reloads).
- `VisitChart` still uses `--bs-primary` bars, dashed gridlines, `outline: none` — Phase 5 (#220).
- KPI "Lượt xem hồ sơ" (all-time `visitCount`, 697) and the chart total (last 30 days, 650) are different ranges; labels say which, but #211's audit flagged the mismatch — fine now that both are labelled.

## Seal gate
One operator-approved action: a single Login click in the debug browser (real auth call) after the 429 window. No commit/push. Ship via `/ship` after verifier SEAL.
