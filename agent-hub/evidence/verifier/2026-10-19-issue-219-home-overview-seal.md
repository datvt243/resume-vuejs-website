# 2026-10-19 - issue-219-home-overview - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-219-home-overview` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-219-home-overview.md`

## Verdict
SEAL

## Isolation proof
Spawned as a separate fresh subagent by the implementer session via the Agent tool, task string "You are a fresh verifier subagent. Invoke the Skill tool with skill \"worker\" and args: verifier ..." with the explicit statement "You did NOT write this diff". This context has no memory of writing `PageHome.vue`.

## Re-run
none — audit-only; note's commands match `doctrine/MEMORY.md`, outputs not truncated, node not outward-facing (operator instructed read-only, no browser/API).

## Cited
- Commands match doctrine: `npm run lint`, `npm run test`, `npm run build` from repo root; Typecheck explicitly "CANNOT RUN — pending add-typecheck-script".
- Lint: `lint_exit=0`. Build: `✓ built in 3.90s` (final). Test: `1 failed | 231 passed (232)`, sole failure `VeeForm.spec.ts > VI | EN toggle`, pre-existing (same as #216/#217/#218 seals); no spec covers PageHome, no `data-*` existed on the page.
- Profile strip: markup description (40px avatar, name, position, success/neutral dot badge, secondary "Cập nhật hồ sơ") + live badge readout.
- KPI tiles: live readout `["Lượt xem hồ sơ","697",…],["Hoàn thành hồ sơ","50%",…],["Đơn ứng tuyển","0",…]` — real data, no delta, no ATS.
- Main row: chart svg rendered with `lg:col-span-2` + "Xem chi tiết"; progressbar `aria-valuenow "50"` (§5.10 thin bar), missing-section list.
- CV card: segmented control `aria-checked` toggles, download href contains "ats"; language select unchanged; "Đính kèm file" `disabled = true`, title "Sắp ra mắt".
- Removals: dev notes/toast/"Mới"/English heading/arrows/opacity/pill/hex/arbitrary values — §10 grep on added lines clean in markup (only `→` inside two code comments), live `arrows: false`.
- No horizontal scroll: 1440 dark scrollWidth 1440, 375 dark scrollWidth 375; screenshots listed (1440 light/dark, 375 dark).
- Comments per code-comments.md: row present (short header description, WHY comments kept, issue-ref comments removed).
- Presentation only: download URL/token/lang logic untouched; only read-only composables (`useVisitStats`, `useCandidate` applications) added, as the issue requested.

## Missing
none

## Forbidden states
None hit. Branch `feature/issue-219-home-overview` (non-main, non-staging) → no MAIN_EDIT. Status left at `sealed_pending_verifier` by implementer (no self-SEAL).

## Seal gate
Only outward action: one operator-approved login click (real auth call) after the 429 window, recorded in the note. No commit/push/merge. Ship via `/ship`.

## Proportionality
Single `src/` file. Removal of file input/handlers follows from the disabled "Đính kèm file" + dev-note toast removal the issue asked for. Dropping the email line is a §4.1 strip-spec judgement, declared. Noticed-not-done items (ConvertToDate warnings, VisitChart tokens) correctly left out.
