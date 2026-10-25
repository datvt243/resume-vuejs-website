# 2026-10-25 - issue-307-modal-save-close - SEAL

- Worker: verifier 0.1.0
- Node: `issue-307-modal-save-close` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Note audited: `evidence/implementer/2026-10-25-issue-307-modal-save-close.md`

## Verdict: SEAL

## Isolation proof
Spawned as a fresh subagent with the Agent-tool task string "Run the skill `/worker verifier` ... You are a fresh, separate verifier subagent; you did NOT write this diff." This context holds no implementer turns. Diff not opened (EvidenceOnly).

## Commands vs doctrine/MEMORY.md
`npm run test`, `npm run build`, `npm run typecheck` from repo root: all three present and matching. Outputs not truncated.
- test: `1 failed | 273 passed (274)`. The failure (`VeeForm.spec.ts` VI|EN toggle) is shown to fail the same way on clean `staging` (stash re-run cited). VeeForm is not in the diff, so it doesn't block the seal. It is logged under "Noticed, not done" and needs its own issue.
- build: `✓ built in 3.68s`.
- typecheck: 90 errors = baseline, none in the 8 changed pages.

## Acceptance criteria
| # | Criterion | Evidence cited | Result |
|---|---|---|---|
| 1 | Modal closes after create/edit/duplicate | Playwright `dialogVisible:0`, `afterEditDialog:0`, `afterDupDialog:0` | pass |
| 2 | No second copy | create sent exactly `["POST award/create"]`; edit is `PUT award/update`, rows stayed at 1 | pass |
| 3 | No false "unsaved" prompt | `swalAfterCreateEsc:0`, `swalAfterEditEsc:0` | pass |
| 4 | All 8 pages | `git diff --stat` shows 8 `Page*.vue`, 1 line each, same `updateDoc` success callback (grep cited). Browser run on Award only, as the note says. The other pages have the same `Modal.hide()` path, which matches earlier SEALs (#291, ItemTemplate) that accepted code-level confirmation for identical paths | pass, with a caveat |
| - | #306 re-test | create row shows real data; deletes hit `delete/<real id>` → 200 | pass |
| - | Comments per code-comments.md | "No comments added or changed" | pass |

Caveat on #4: `PageExperience.vue` is a swap (`markSaved()` → `hide()`), not an addition, and has the career-break chooser. It wasn't clicked through. The note explains why `markSaved` is no longer needed (`loadDocument`/`reset()` clear `dirtyBaseline`). QC should click through Experience on release.

## Forbidden states
ADHOC_WORK no (node row exists) · NO_EVIDENCE no · EDIT_UNVERIFIED no (test/build/typecheck read back) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (row present, now SEALED) · MAIN_EDIT no: branch `fix/issue-307-modal-save-close` off `staging` `148b268`.

## Supersedes check (6b)
No other open row for #307 or #306 on the active diagram. `## Supersedes: none` is correct.

## Seal gate
No commit, push or merge in this pass. Real API calls were limited to `[QC]` records, all deleted (cited). Merging goes through `/ship`.

## Proportionality
8 one-line edits plus the diagram row. Nothing outside the node's scope.

## PM status
Row collapsed in place to a SEALED pointer. Full row appended to `haven/diagrams/dev-loop-archive.md`. The 2 oldest pointer rows (`issue-219-home-overview`, `issue-220-visits-analytics`, already in the archive) were removed to keep 20 pointers.

## Re-run: none
Audit-only (default). The note is verbatim, matches doctrine and covers each criterion. Not outward-facing.
