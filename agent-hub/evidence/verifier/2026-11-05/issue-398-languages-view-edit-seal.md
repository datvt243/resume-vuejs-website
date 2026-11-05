# 2026-11-05 — issue-398-languages-view-edit — SEAL (round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-398-languages-view-edit` (haven/diagrams/dev-loop.prime-mermaid.md)
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-398-languages-view-edit-plan.md` (incl. "## Round 2 — response to REOPEN")
- Prior verdict: `evidence/verifier/2026-11-05/issue-398-languages-view-edit-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh, isolated verifier subagent ... This is ROUND 2: a previous verifier REOPENed it ... Judge whether each REOPEN point is now addressed with citable evidence". This differs from both the implementer's task string and the round-1 verifier's spawn ("the prod API is currently returning HTTP 429 ..."). Skill args: `verifier "agent-hub/evidence/implementer/2026-11-05/issue-398-languages-view-edit-plan.md"`. This context has no memory of writing the diff.

## Verdict: SEAL

## REOPEN points, one by one
1. **§10 screenshots (1440 light, 1440 dark, 375 dark)** — addressed. The API was stubbed with Playwright `page.route` and the note says so (auth/refresh + general-information/, no real API call, `unrouteAll` afterwards). Eight files exist in `.playwright-mcp/` (issue-398-view-1440-dark/-1440-light/-375-dark, edit-1440-dark-focus, edit-375-dark, empty-1440-dark, empty-375-dark, longword-375-dark). I opened four of them and they match the note:
   - view-1440-light: bordered list, 4 rows, neutral badges on the right, orange "Sửa" in the header.
   - view-375-dark: the 79-char name wraps to 3 lines and the "Giỏi" badge stays on the right with no overlap.
   - empty-375-dark: dashed NoData box "Chưa có dữ liệu", green "Thêm", and no Edit button in the header.
   - edit-1440-dark-focus: the existing form and table, with a visible focus ring on "Đóng".
   DOM overflow measurements are cited too (`scrollWidth > innerWidth` = false at every viewport).
2. **Keyboard pass** — addressed. Real key presses are cited. The pass found a real bug: Enter on "Sửa" dropped focus to `<body>`. It was fixed by merging Sửa and Đóng into one bound `Button`, and the re-check shows focus stays on the button and comes back to "Sửa" when closing.
3. **Long-text state** — addressed. A 79-char spaced name and a 66-char unbroken name were tested, and the row got `min-w-0 break-words` plus a `shrink-0` badge. The note cites `clientWidth 341 = scrollWidth 341`.
4. **web-design-guidelines pass** — addressed. Findings are listed: the flex `min-w-0` fix, plus the checks that passed. The two rules not applied have reasons (Title Case conflicts with DESIGN.md §1.6; "URL reflects state" was not requested).
5. **Lint exit code** — addressed: `lint exit=0`.

## Gates re-cited after the round-2 fixes
- test: 56 files / 355 tests passed.
- build: `✓ built in 4.22s`.
- typecheck: 90, equal to the baseline of 90; 0 errors in PageLanguages.
- token grep: `exit=1`, so no hard-coded tokens in the diff.
- Commands match `doctrine/MEMORY.md`.

## Round-1 items still OK
- Branch is `feature/issue-398-languages-view-edit` (not main/staging), so no MAIN_EDIT.
- The acceptance rows are backed by the spec (view list, NoData, Edit → form, Close → view).
- The Save/Cancel interpretation was accepted in round 1: per-item modal saves, and the `Modal.vue` dirty-guard handles the discard confirm.
- Data stays in `foreignLanguages`; only existing i18n keys are used; the comments row is present.
- Supersedes: none. Still open: none.

## Forbidden hit
none.
- Seal gate: none (no commit, push or real API write; the API was stubbed).
- Proportionality: still 2 files, and the round-2 changes respond directly to the REOPEN findings.

## Noted, non-blocking (implementer's own "Noticed, not done")
- Pressing "Thêm" in the empty state sends focus to `<body>`, because that button unmounts.
- Deleting the last language and then pressing Đóng hides the toggle.
Both are low impact edge cases. They are candidates for a follow-up issue, not a gap in this node's criteria.

## Re-run
none. This was an audit only, the default per "Re-run scope". I opened the screenshot files only to confirm the cited evidence exists; I did not re-run any command.
