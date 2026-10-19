# 2026-10-19 - issue-221-table-default

- Worker: implementer
- Version: 0.1.0
- Node: `issue-221-table-default` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #221 [UI] Phase 6 — TableDefault. Theo DESIGN.md §5.4. File: src/components/table/TableDefault.vue (+ render-fn parts, convert/). - Bọc trong card, overflow-x-auto, w-full text-sm. - Header h-9 text-xs font-medium text-fg-3, sentence case, sticky; cột sortable có icon + aria-sort. - Row h-10 border-b border-line hover:bg-surface-2; bỏ viền dọc (table-bordered). - Số right-align tabular-nums; ngày Intl.DateTimeFormat('vi-VN'); text dài truncate + title. - Empty (:122 alert alert-warning p-[3rem]) → 1 row colspan dùng NoData mới (phase 3). - Hỗ trợ phân trang (dùng cho phase 5). Ràng buộc: Chỉ đổi presentation — không đụng API, store, composable, routing, validation (DESIGN.md §0.2.4). Giữ các data-* mà spec query. Một PR vào staging. Screenshot before/after ở 1440 light, 1440 dark, 375 dark. npm run lint && npm run test && npm run build xanh; checklist DESIGN.md §10. Part of #211. URL: https://github.com/datvt243/resume-vuejs-website/issues/221

## Hub bytes before: 185601

## Branch
`feature/issue-221-table-default` — created from freshly pulled `staging` (`b354235`, v1.20.0) via `gh issue develop 221 --checkout --base staging --name feature/issue-221-table-default`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/components/table/TableDefault.vue` | §5.4. Wrapper `rounded-md border border-line bg-surface` + inner `overflow-x-auto`; `<table class="data-table w-full text-sm">` (dropped `table-bordered`). Header/body cell styles via scoped `:deep(thead > tr > *)` / `:deep(tbody > tr > *)` `@apply` so cells passed through the `theadMore`/`tbodyMore` slots (e.g. "Action") get the same look: header `sticky top-0 h-9 text-xs font-medium text-fg-3 text-left border-b border-line bg-surface px-3`; rows `h-10 border-b border-line px-3`, last row no border, hover `bg-surface-2`. Removed `capitalize` from header + body cells (sentence case = the model label as written). Every data column is sortable: `<button>` with label + `fa-sort`/`fa-sort-up`/`fa-sort-down` icon (`aria-hidden`), `aria-sort` on the `<th>` (`none`/`ascending`/`descending`), cycle asc → desc → off, `Intl.Collator('vi', { numeric: true })` (numbers compared numerically), select columns sort by their displayed text, empty values always last, focus-visible ring on the button. `type: 'number'` columns: `text-right tabular-nums` (header right-aligned too). `#` column `w-12 text-right tabular-nums text-fg-3` (was inline `style="width: 80px"`). Empty → one `<td colspan="999" class="empty">` with `<NoData />` (was `alert alert-warning p-[3rem]` + `opacity-50`). Pagination: new `pageSize` prop (default 25), footer "a–b trong N · Trang x / y" + "Trước"/"Sau" secondary sm buttons (same `buttonClass` as PageVisits), only when > 1 page; page clamps when the list shrinks, resets to 1 on sort. `tbodyMore` slot's `index` is now `props.modelValue.indexOf(doc)` — `VeeFormGeneralInformationUpdate.vue:111` does `__list.splice(index, 1)`, so a sorted/paged position would delete the wrong item. Kept the 300px min-height (room for the row `Dropdown`, which is `position: absolute` and would be clipped by `overflow-x-auto`) but only when there are rows. Props/slots API otherwise unchanged. |
| `src/components/table/part/Table.js` | Plain `<table>`; dropped `table table-hover` (classes come through attrs). |
| `src/styles/tailwind.css` | Deleted the legacy `.table` / `.table-hover` / `.table-bordered` / `.table-responsive` block — its own comment names `Table.js` + `TableDefault.vue` as sole consumer; grep confirms no other user. Comment on `--bs-border-width` updated (no longer read by `.table`). |
| `src/components/convert/part/toDate.js` | `Intl.DateTimeFormat('vi-VN')` dd/mm/yyyy, `tabular-nums`, "—" when empty/invalid; prop accepts `String` too (ISO strings no longer warn). Dropped the calendar icon wrapped in `opacity-50` (§9 anti-pattern). `formatDate` utility untouched (other callers). |
| `src/components/convert/part/toText.js` / `toTruncate.js` | `block max-w-xs truncate` + full value in `title`; "—" for empty. `toTruncate` no longer slices at 25 chars with `...`. |
| `src/components/convert/part/toBoolean.js` | Icon `aria-hidden` + `sr-only` "Có"/"Không" (icon-only cell had no text). |
| `src/plugins/initFontAwesomeIcon.js` | Register `faSort`, `faSortUp`, `faSortDown`. |
| `src/components/table/TableDefault.spec.ts` (new) | 5 tests: empty → single `colspan` NoData row; labels kept as given + number column right/tabular + "—"; sort asc/desc/off with `aria-sort`, numeric order `1, 2, 10`, `tbodyMore` index = original index (`2,0,1`); pagination with `pageSize: 2` (range label, disabled ends, last page); no pager when one page. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

Not touched: API, stores, composables (`useInitTable` unchanged), routing, validation, consumers (`PageReference.vue`, `VeeFormGeneralInformationUpdate.vue`). No `data-*` attributes existed on TableDefault; `Convert`'s `data-type` span kept.

## Command
From repo root:
- `npx vitest run src/components/table/TableDefault.spec.ts src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts`
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
targeted:       ✓ VeeFormGeneralInformationUpdate.spec.ts (2 tests)  ✓ TableDefault.spec.ts (5 tests)   Tests  7 passed (7)
npm run lint:   lint_exit=0
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Test Files  1 failed | 35 passed (36)
                Tests  1 failed | 237 passed (238)      (pre-existing failure, same test as issue-220/226 notes; 238 = 233 + 5 new)
npm run build:  ✓ built in 3.60s
```
First build attempt failed: `You cannot @apply the text-right utility here because it creates a circular dependency` (scoped rule overriding the header's `text-left`) → replaced with plain `text-align: right` on `:deep(th.text-right)`; rebuilt green (output above is the final run, after every edit).

DESIGN.md §10 token grep on `TableDefault.vue`, `convert/part/*.js`, `part/Table.js` → no matches (`grep_exit=1`).

Manual observation (Playwright on the port-9888 debug Chrome, existing `npm run dev`, logged-in session; not an automated test). Before = my `src/` changes stashed (`git stash push -- src/`), HMR, then `git stash pop`. Theme switched by setting `data-bs-theme` on `<html>` directly (not the header toggle).
```
Before (General information, 375 dark): header text-transform capitalize ("Kỹ Năng", "Năm Kinh Nghiệm"), vertical borders, document scrollWidth 418
After, /dashboard/reference (0 rows): 1 row, td.empty → NoData "Chưa có dữ liệu"; card border 1px; th: h 36px, 12px, sticky, text-transform none, aria-sort "none" on data columns
After, /dashboard/general-information (17 / 5 / 1 rows): row height 40px, td border-left 0px; "#" + "Năm kinh nghiệm" cells text-align right + tabular-nums; "Action" (theadMore <td>) 12px like other headers
Click "Năm kinh nghiệm" sort button → aria-sort "ascending", icon "sort-up", column 1,1,…,2,…,3,3; "#" renumbered 1,2,3…
375 dark: each table scrolls inside its card (scroll 451 / client 341); document scrollWidth still 418 — caused by GroupTags `ul.tag-list` (right edge 418), outside any table, same as before
```
Screenshots (local, gitignored): `.playwright-mcp/221-before-1440-dark.png`, `221-before-1440-light.png`, `221-before-375-dark.png`, `221-before-reference-1440-dark.png`, `221-after-1440-dark.png`, `221-after-1440-light.png`, `221-after-375-dark.png`, `221-after-reference-1440-dark.png`. Pagination was not observable live (largest table has 17 rows < 25) — covered by the spec only.

## Acceptance
| Criterion | Evidence |
|---|---|
| Card, `overflow-x-auto`, `w-full text-sm` | markup; live card border 1px; 375 tables scroll inside card |
| Header `h-9 text-xs font-medium text-fg-3`, sentence case, sticky | live th 36px / 12px / sticky / text-transform none |
| Sortable columns: icon + `aria-sort` | live click → `ascending` + `sort-up`; spec asc/desc/off |
| Rows `h-10 border-b border-line hover:bg-surface-2`, no vertical borders | live row 40px, border-left 0; `table-bordered` + `.table*` CSS removed |
| Numbers right + `tabular-nums`; dates `Intl.DateTimeFormat('vi-VN')`; long text `truncate` + `title` | live exp column; `toDate.js`; `toText`/`toTruncate` |
| Empty → single colspan row with `NoData` | live reference page; spec |
| Pagination | spec (`pageSize: 2`) |
| Presentation only; `data-*` kept | no API/store/composable/route/validation change |
| lint + build green; no new test failure | outputs above |
| Screenshots 1440 light/dark, 375 dark | files above |
| Comments per code-comments.md | `TableDefault.vue` header description; `// sort — asc → desc → off; empty values always last`; `<!-- index into modelValue, not the sorted page: consumers splice by it -->`; CSS WHY lines (dropdown room, `:deep` for slotted cells, override `text-left`); `toDate.js` prop note. No issue refs. |

## Noticed, not done
- `/dashboard/general-information` still overflows at 375px (scrollWidth 418) because of the GroupTags tag list (`GroupTags.vue`), not the table.
- Consumer markup is still legacy: `VeeFormGeneralInformationUpdate.vue` header cell "Action" (English, `style="width: 100px"`, `<td>` inside `<thead>`), delete `a.dropdown-item` without `aria-label`; `PageReference.vue` `mb-[1.5rem]`, `btn-group`. Phases 7/8 (#222/#223).
- Text cells cap at `max-w-xs`, so long skill sentences ("Focus on writing clean, maintainable, and scalable c…") truncate even at 1440 with spare width; full text in `title`.
- Row `:key` is `doc_${doc._id}`; general-information sub-documents may have no `_id` (duplicate `doc_undefined` keys) — pre-existing.
- PageVisits (Phase 5) still uses its own native table; it could move to `TableDefault` now that pagination exists — not done (different column needs: time+IP formatting).
- Keyboard focus ring on sort buttons is from CSS (`focus-visible:outline-accent`) — not verified with a real Tab press in the browser.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.
