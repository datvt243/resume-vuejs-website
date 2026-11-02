# 2026-11-01 — issue-374-skill-edit-rename — REOPEN

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-skill-edit-rename`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-skill-edit-rename-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched by the implementer session with the task "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-skill-edit-rename-plan.md"`. This context has no memory of writing the diff.

## Verdict: REOPEN

## Reason
Criterion 3 says: "An empty name **or** another existing group's name is rejected." The note gives evidence only for the duplicate case: owner `dupMsg: "Đã có nhóm với tên này"`, from typing "Vue ecosystem" into SAP's rename. It gives no output for the empty-name case.
A targeted grep, run only to locate the claim, shows `PageSkills.vue:105` `if (!name) return t('validation.required')`. So the code path exists, but nobody ran it live and read the result back. A static line is not evidence of rejection (`EvidenceOnly`, SOUL invariant 2).
Fix: on the owner account (read-only) or QA, open a rename prompt, clear the input (or enter only spaces), and press confirm. Cite the validation message shown and the fact that the prompt stayed open with no PATCH sent. Then cancel.

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- The commands match `doctrine/MEMORY.md`. Test: `Tests 311 passed (311)`. Build: `✓ built in 3.95s`. Lint: 0. Typecheck: 90, at the baseline of 90. The changed-files grep found nothing (`grep-exit=1`).
- Criterion 1: owner `edit` shows the title "Sửa: …" and prefill TypeScript/3/Languages. The QA run shows `loaded`, edit 200, `countAfterEdit 44` (43 + 1 added, so the skill was replaced, not duplicated), `saved QA-skill2:4:QA-r` and `modalOpen false`.
- Criterion 2: owner `addAfterEdit` shows a blank name and exp, with group preset to SAP.
- Criterion 3, apart from the empty case: owner `rename` prefill and `dupMsg`. QA rename returned 200, the tag became `QA-r2`, the skill moved, and the UI and chips updated without a reload.
- Criterion 4: QA del returned 200. Count went back to 43, tags are `[]`, and after a reload there were 43 badges and no chips, so the QA account was restored.
- Criterion 5: i18n keys are in vi and en. The rename title is interpolated ("Đổi tên nhóm SAP").
- The comments row is present. Supersedes: none, and the other #374 rows on the active diagram are all SEALED pointers. Seal gate: none (no commit or push). The diff is proportional to the node.

## Missing
- Criterion 3: no live evidence that an empty group name is rejected.

## Forbidden hit
none (`EDIT_UNVERIFIED` would apply only if this were sealed as is)

## PM status
Not changed (REOPEN). Under RatchetOnly the row stays `sealed_pending_verifier`. A REOPEN pointer was added to the row text.

## Re-run
none (audit only). The one targeted grep of `PageSkills.vue` (`inputValidator`) ran only to find where the uncited empty-name claim lives. No build, lint, test or live run was repeated.
