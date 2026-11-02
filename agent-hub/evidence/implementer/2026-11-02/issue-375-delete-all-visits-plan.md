# 2026-11-02 - issue-375-delete-all-visits

- Worker: implementer · Version: 0.1.0
- Node: `issue-375-delete-all-visits`
- Branch: `feature/issue-375-delete-all-visits` (off synced `staging` @ v1.37.0, via `gh issue develop 375`)
- Issue: https://github.com/datvt243/resume-vuejs-website/issues/375
- Task: "Lượt truy cập: button 'Xóa tất cả' (hard-delete toàn bộ visits)". Backend endpoint `DELETE api/v1/candidate/visits` is live (backend PR #346, released in v2.3.0, issue #345 CLOSED).

## Hub bytes before
84563

## Approach
- `PageVisits.vue` gets a "Xóa tất cả" `<Button action="delete">` (secondary + red, per the `action` rule in .claude/CLAUDE.md) in the Heading slot next to the SegmentedControl. The issue said "variant danger"; I chose the secondary + delete action instead because CLAUDE.md/DESIGN.md §5.3 now color action buttons that way and a solid red fill in a page header is louder than the rest of the page. The confirm button inside the dialog is still solid danger (confirmDelete).
- Disabled when `loadError || !dataList.length`.
- Click → `confirmDelete` (title "Xóa tất cả lượt truy cập?", text "{count} lượt truy cập sẽ bị xóa vĩnh viễn và không thể khôi phục.") → `handleBase({ method: 'delete', url: 'candidate/visits' }, { loading, toast }, cb)`. The success toast is the server message (handleBase default).
- Success callback → `reloadVisits?.()` (injected from LayoutDefault, refills candidateStore visits/visitCount — the Dashboard card reads the same store) + `reloadStats()` (KPIs, chart, breakdowns). handleBase only runs the callback on success, so an API error leaves the data as is (error toast from handleBase).
- i18n: `visits.deleteAll`, `visits.deleteAllTitle`, `visits.deleteAllText` in both vi and en.

## Diff
- `src/pages/dashboard/PageVisits.vue`: imports, `deleteAll()`, the Button. No comment added or changed (round 2 removed the header sentence round 1 added, since it said WHAT, not WHY).
- `src/i18n/index.ts`: 3 keys × vi/en.
- `src/pages/dashboard/PageVisits.spec.ts`: Button registered in mounts; 4 new specs — confirm → DELETE candidate/visits + both reloads; cancel → no API call; API failure (callback never runs) → no reload; disabled with no visits.

## Command + output (read back)
- `npx vitest run src/pages/dashboard/PageVisits.spec.ts` → `✓ src/pages/dashboard/PageVisits.spec.ts (10 tests)`, `Tests 10 passed (10)` (first run: 4 failed because the global Button wasn't registered in the spec mount; fixed by registering it).
- `npm run test` → `Test Files 55 passed (55)`, `Tests 337 passed (337)`.
- `npm run lint` → exit 0.
- `npm run build` → `✓ built in 3.79s`.
- `npm run typecheck` → 90 `error TS` lines = baseline 90; grep for PageVisits / i18n/index → none.

## Live check (Playwright, separate browser.newContext, dev origin localhost:5173, prod API)
- Account: qa.minimal@example.com (QA, never the owner). It had 0 visits; I seeded 2 with `POST /api/me/qa.minimal@example.com/visit` ×2 (each `{"success":true,...}`), API count → 2.
- Output read back:
  - `rows before: 2, enabled: true`
  - `dialog: Xóa tất cả lượt truy cập? | 2 lượt truy cập sẽ bị xóa vĩnh viễn và không thể khôi phục.`
  - `deletes after cancel: 0`
  - `DELETE 200 {"success":true,"message":"Xoá toàn bộ lượt ghé thăm thành công","data":{"deletedCount":2}}`
  - `table after: Chưa có lượt truy cập Chia sẻ link hồ sơ công khai để bắt đầu ghi nhận.`
  - `kpi hint: Tổng 0 lượt từ trước tới nay` (was "Tổng 2 lượt" in the before screenshot)
  - `button disabled after: true`
- Screenshots: scratchpad visits-before.png (button placed right of the interval toggle, red outline), visits-confirm.png, visits-after.png.
- Data restored: qa.minimal is back at 0 visits, its original state.

## Acceptance criteria
- [x] Button on the visits page, confirm before delete — spec + live.
- [x] Cancel → no API call — spec + live (`deletes after cancel: 0`).
- [x] Success → table, KPIs, chart, breakdowns reload without a page reload — live table + KPI hint; stats reload asserted in spec. Dashboard card: proven live in round 2 (below).
- [x] API error → data kept — spec (callback not run → no reload); error toast is handleBase's existing behavior.
- [x] i18n vi + en.
- [x] Spec in PageVisits.spec.ts.
- [x] Tested on a QA account.

## Supersedes
none

## Noticed, not done
- Before stats load, the KPI tile shows "0" (`stats?.total ?? 0`) instead of a skeleton — pre-existing, outside this issue.

## Round 2 (after REOPEN `evidence/verifier/2026-11-02/issue-375-delete-all-visits-reopen.md`)
1. Comments: `git diff src/pages/dashboard/PageVisits.vue | grep -E "^[-+] \*"` → `no comment lines changed`. The diff adds/changes no comment in any file, so code-comments.md has nothing to apply.
   - [x] Comments per `doctrine/standards/code-comments.md` — none added/changed.
2. Dashboard card live (Playwright, separate newContext, qa.minimal; seeded 1 visit via `POST /api/me/qa.minimal@example.com/visit` → success). Output read back:
   - `home before: Lượt xem hồ sơ 1`
   - `DELETE 200 {"deletedCount":1}`
   - `home after (SPA nav, no page reload): Lượt xem hồ sơ 0`
   - Screenshot: scratchpad home-after.png. qa.minimal back at 0 visits (original state).
3. Re-run: `npm run test` → `Test Files 55 passed (55)`, `Tests 337 passed (337)`; `npm run lint` exit 0; `npm run build` → `✓ built in 3.76s`; `npm run typecheck` → 90 (baseline).

status: sealed_pending_verifier
