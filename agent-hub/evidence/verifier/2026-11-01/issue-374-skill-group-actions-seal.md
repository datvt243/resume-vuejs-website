# 2026-11-01 — issue-374-skill-group-actions — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-skill-group-actions`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-skill-group-actions-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched by the implementer session with the instruction "You are a fresh, isolated verifier subagent spawned by the implementer session — you did not write this diff" and skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-skill-group-actions-plan.md"`. No memory of writing the diff.

## Verdict: SEAL

## Cited
- Branch `feature/issue-374-skill-badges` — not main/staging, no MAIN_EDIT. New node because `issue-374-skill-badges` is already SEALED (RatchetOnly respected).
- Commands match `doctrine/MEMORY.md`: test `Tests 311 passed (311)` (+ targeted 21 / 22), build `✓ built in 3.77s`, lint 0, typecheck 90 (= baseline), grep over all changed src files empty (`grep-exit=1`). Not truncated.
- C1: owner headings 16px/600 + aria names `Thêm kỹ năng vào nhóm X` / `Xóa nhóm X`.
- C2: owner preset map `{"SAP":"SAP","Backend":"Backend","headerAdd":""}`; QA `preset:"QA-374d"` x2.
- C3: QA dialogText with count, `del:200`, `afterDeleteNoReload:[]`, `afterReload:[]`. Backend issue not needed — group is a string array on general-information, PATCH accepted (200); reasoning plus live proof given.
- C4: dividers borderTop 0/1/1px; screenshot.
- C5: QA `placeholder:"Nhập tên nhóm"`; `form.newTag` used only by `GroupTags.vue`.
- C6: QA `modalOpenAfterSave:false` x2.
- C7: stale-data root cause shown live (before: stale list until reload; after: list/chips update, `sentSkillCount 43` = 43+2-2).
- C8: i18n keys vi+en with `{name}`/`{count}`, parity spec in the 311.
- Comments: targeted grep of added comment lines — all WHY, no `(#N)` refs.
- Supersedes: none; no other open #374 row on the active diagram. Seal gate: none (no commit/push); live writes only on QA account, restored (43 skills, no tags).
- Proportionality: extras (required group, used-name options, empty tag groups, in-place saves) each serve a criterion (API rejects empty group; preset needs the option; empty new tag group must show to be "Add"-able; C3/C7). Modal-close change also reaches personal skills / foreign languages — same shared component, matches the generic ask, disclosed.

## Missing
none

## Forbidden hit
none

## PM status
`issue-374-skill-group-actions` → SEALED. Full row appended to `haven/diagrams/dev-loop-archive.md`; active row replaced with pointer; oldest pointer (`issue-316-404-page`, full row already in archive) pruned to keep 20.

## Re-run
none (audit only). One `git diff -U0 -- src` grep of added comment lines to check the code-comments row; no build/lint/test/typecheck re-run.
