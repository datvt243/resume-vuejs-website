# 2026-11-02 — issue-375-delete-all-visits — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-375-delete-all-visits`
- Evidence reviewed: `evidence/implementer/2026-11-02/issue-375-delete-all-visits-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh verifier for the resume-vuejs-website repo ... You did not write this diff, so NeverVerifyOwnWork is satisfied" and skill args `verifier "agent-hub/evidence/implementer/2026-11-02/issue-375-delete-all-visits-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
1. **Comments row missing (code-comments.md → Enforcement).** The note's `## Diff` says `PageVisits.vue` gains a "header comment sentence", but `## Acceptance criteria` has no "comments per code-comments.md" row citing it. The standard says a missing row → REOPEN.
2. **Criterion 3, Dashboard card back to 0.** The issue lists "thẻ ở Dashboard đều về 0" explicitly. The note says "not opened live" and relies on "reads the same store `reloadVisits` refills" — reasoning, not evidence (`EvidenceOnly`). The spec proves `reloadVisits` is called, not that the card shows 0.

Fix:
- Item 1: add the row, quoting the added header comment sentence (and any other touched comment) and confirming it follows the rules.
- Item 2: on a QA account (seed + delete as before, restore after), open the Dashboard after the delete without a page reload and cite the card's value; or cite a spec asserting the store's `visitCount`/`visits` are 0 after the delete path and the card source line that reads them.

## Cited (OK)
- Branch `feature/issue-375-delete-all-visits`: not main/staging, no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`: test `55 passed / 337 passed`, lint exit 0, build `✓ built in 3.79s`, typecheck 90 = baseline 90, none in changed files. Not truncated.
- Criterion 1 (button + confirm): spec + live dialog text, screenshots visits-before/confirm.png present.
- Criterion 2 (cancel → no call): spec + live `deletes after cancel: 0`.
- Criterion 3 (table, KPI, stats reload): live table empty, KPI "Tổng 0", spec asserts `reloadStats`.
- Criterion 4 (error → data kept): spec, callback not run; error toast is handleBase's existing path.
- Criterion 5 i18n vi + en (3 keys); criterion 6 spec in PageVisits.spec.ts; criterion 7 QA account qa.minimal, data restored to 0.
- `<Button action="delete">` instead of solid "danger": justified by CLAUDE.md/DESIGN.md §5.3 action rule; accepted.
- Supersedes: none; no other open #375 row. Seal gate: no commit/push. Diff proportional.

## Missing
- "comments per code-comments.md" acceptance row.
- Evidence the Dashboard card shows 0 after delete without reload.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if sealed as is)

## PM status
Not changed (REOPEN). Row stays `sealed_pending_verifier`; REOPEN pointer added to the row text.

## Re-run
none (audit only). Only `gh issue view 375` for the criteria and an `ls` of the screenshots.
