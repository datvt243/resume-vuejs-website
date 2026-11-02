# 2026-11-01 — issue-374-skill-edit-rename — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-skill-edit-rename` (REOPEN round 2)
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-skill-edit-rename-plan.md`, including its `## REOPEN fix (round 2)` section
- Previous verdict: `evidence/verifier/2026-11-01/issue-374-skill-edit-rename-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context). It was launched with the task "You are a fresh, isolated verifier subagent; you did not write this diff. This is REOPEN round 2..." and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-skill-edit-rename-plan.md"`. That task string differs from the implementer's own task, and this context has no memory of writing the diff.

## Verdict: SEAL

## Reason
The one gap from round 1 is now closed. Criterion 3 requires an empty group name to be rejected. The round-2 section gives live output from the owner account (read-only): `{"empty":{"msg":"Vui lòng nhập","promptOpen":true},"spaces":{"msg":"Vui lòng nhập","promptOpen":true},"patches":[],"headings":["Languages","Vue ecosystem","SAP"]}`. Both the empty and the whitespace-only input were rejected. The prompt stayed open, a request listener caught no PATCH or PUT, and the group headings did not change. Round 2 made no code change, so the round-1 test, build, lint, typecheck and live outputs still apply to the same diff.

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`. Test: `Tests 311 passed (311)`. Build: `✓ built in 3.95s`. Lint: 0. Typecheck: 90, at the baseline of 90. The changed-files grep returned nothing (`grep-exit=1`). No output is cut.
- Criterion 1: owner `edit` shows the title "Sửa: …" and prefill TypeScript/3/Languages. The QA run shows edit 200, `countAfterEdit 44` (replaced, not duplicated), `saved QA-skill2:4:QA-r` and `modalOpen false`.
- Criterion 2: owner `addAfterEdit` shows a blank form, with the group preset to SAP.
- Criterion 3: the rename prompt is pre-filled. The duplicate name is rejected (`dupMsg`). The empty and spaces cases are rejected (round 2). The QA rename returned 200, the tag and skill moved, and the UI and chips updated without a reload.
- Criterion 4: QA delete returned 200. The account is back to 43 skills with tags `[]`, and the same holds after a reload.
- Criterion 5: i18n keys are in vi and en, and the strings use interpolation.
- The comments row is present. Supersedes: none. Seal gate: none (no commit or push, and only QA data was written and then restored). The diff is proportional to the node.

## Missing
none

## Forbidden hit
none

## PM status
Moved from sealed_pending_verifier to SEALED. The full row was appended to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced with a pointer. That took the active file to 21 pointers, so the oldest one (`issue-317-reload-redirect`, whose full row is already in the archive) was deleted to bring it back to 20.

## Re-run
none (audit only). No build, lint, test or live run was repeated.
