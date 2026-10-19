# 2026-10-19 - issue-221-table-default - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-221-table-default` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-221-table-default.md`

## Verdict
SEAL

## Isolation proof
Spawned as a separate subagent by the implementer session for GitHub issue #221 (branch `feature/issue-221-table-default`, already checked out); I did not write the diff. Task string: "You are a fresh verifier for the resume-vuejs-website agent-hub. ... Invoke the Skill tool with skill \"worker\" and args: verifier \"agent-hub/evidence/implementer/2026-10-19-issue-221-table-default.md\" ...". This context has no memory of editing `TableDefault.vue` or `convert/part/*.js`.

## Re-run
none — audit-only; commands match `doctrine/MEMORY.md`, outputs not truncated, node not outward-facing (no commit/push/deploy).

## Cited
- Commands match doctrine: `npm run lint`, `npm run test`, `npm run build` from repo root, plus targeted `npx vitest run` on `TableDefault.spec.ts` + `VeeFormGeneralInformationUpdate.spec.ts`; Typecheck explicitly "CANNOT RUN — pending add-typecheck-script".
- Lint `lint_exit=0`; build `✓ built in 3.60s` (first failed `@apply text-right` circular-dependency attempt disclosed, final run after every edit); targeted 7/7; full test `1 failed | 237 passed (238)`, sole failure `VeeForm.spec.ts > VI | EN toggle` — same pre-existing failure as the #220/#226 seals (233 + 5 new = 238).
- Card + `overflow-x-auto` + `w-full text-sm`: markup described; live card border 1px; 375 tables scroll inside card (scroll 451 / client 341).
- Header `h-9 text-xs font-medium text-fg-3`, sentence case, sticky: live th 36px / 12px / sticky / text-transform none; slotted "Action" header also 12px.
- Sortable + icon + `aria-sort`: live click → `ascending` + `sort-up`; spec covers asc/desc/off and numeric order `1, 2, 10`.
- Rows `h-10`, bottom hairline, hover `bg-surface-2`, no vertical borders: live row 40px, td border-left 0; `table-bordered` + `.table*` CSS removed.
- Numbers right + `tabular-nums` (live), dates `Intl.DateTimeFormat('vi-VN')` (`toDate.js`), long text `truncate` + `title` (`toText`/`toTruncate`).
- Empty → single colspan `NoData` row: live `/dashboard/reference` + spec.
- Pagination: spec (`pageSize: 2`, range label, disabled ends, no pager on one page); not live-observable (max 17 rows < 25) — disclosed.
- Presentation only: no API/store/composable/route/validation change; no `data-*` existed on TableDefault, `Convert` `data-type` kept. `tbodyMore` index kept as index into `modelValue` (consumer splices by it) — spec asserts `2,0,1` after sort.
- Screenshots 1440 light/dark + 375 dark (before/after) listed; §10 token grep clean (`grep_exit=1`).
- Comments per code-comments.md: row present, WHY comments cited, no issue refs.

## Missing
none

## Forbidden states
None hit. Branch `feature/issue-221-table-default` (non-main, cut from `staging`) → no MAIN_EDIT. Implementer left row IN_PROGRESS (no self-SEAL). Note present (no NO_EVIDENCE). Diagram row now updated (no DIAGRAM_DRIFT).

## Seal gate
No outward action in this pass (no commit/push/merge). Ship via `/ship`.

## Proportionality
Converter changes and sort/pagination are named in the issue ("+ render-fn parts, convert/", "sortable", "Hỗ trợ phân trang"). Legacy `.table*` CSS deletion is dead code whose own comment named these two files as sole consumers (grep-confirmed). `toBoolean` sr-only text is §10 a11y within the touched converter set. GroupTags 375 overflow, consumer markup, PageVisits migration correctly left as noticed-not-done.
