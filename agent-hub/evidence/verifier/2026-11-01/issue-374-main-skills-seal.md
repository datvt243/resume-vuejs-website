# 2026-11-01 — issue-374-main-skills — SEAL (REOPEN round 2)

- Worker: verifier · Version: 0.1.0
- Node: `issue-374-main-skills`
- Evidence reviewed: `evidence/implementer/2026-11-01/issue-374-main-skills-plan.md` (incl. "## REOPEN fix (round 2)")
- Previous verdict: `evidence/verifier/2026-11-01/issue-374-main-skills-reopen.md`

## Isolation proof
Separately spawned Agent subagent (fresh context), launched with the task "You are a fresh, isolated verifier subagent; you did not write this diff. This is REOPEN round 2..." plus skill args `verifier "agent-hub/evidence/implementer/2026-11-01/issue-374-main-skills-plan.md"`. Different from the round-1 spawn string. No memory of writing the diff.

## Verdict: SEAL

## Reason
All three round-1 gaps are now closed with citable evidence. A live 200 save is out of scope, as round 1 and the operator agreed: the backend `mainSkills` change (`ef79e0a`) is not on backend `origin/main` (`f6b756e … release/v2.2.4`) yet.

1. **Request shape from the shipped path.** A live QA run (`qa.full@example.com`, separate context) through `PageSkills.saveMainSkills` captured the body `keys ["_id","mainSkills"]`, `req [{"name":"JavaScript (ES6+)"},{"name":"TypeScript"}]`. The API answered with a 400 "mainSkills is not allowed", `modalOpen: 1` and no badge was added. So on rejection, false is returned and the popup stays open. Nothing was saved.
2. **Store update + success path.** New `src/pages/dashboard/PageSkills.spec.ts` covers two cases:
   - "patches mainSkills, updates the store in place and reports success": the payload matches `{ mainSkills: [{ name: 'Vue' }] }`, `setGeneralInformation` is called with `{ mainSkills: [...] }`, and `save` resolves true. It also checks `max: 5`.
   - "reports failure when the API rejects the save": `save` resolves false.
3. **× removal.** `MainSkills.spec.ts` "× on a badge saves the list without that skill" (`[{Vue},{Node}]` → `[{Node}]`).

## Cited (OK)
- Branch `feature/issue-374-skill-badges`: not main or staging, so no MAIN_EDIT.
- Commands match `doctrine/MEMORY.md`:
  - test `Test Files 53 passed (53)` / `Tests 317 passed (317)`
  - build `✓ built in 4.04s`
  - lint 0
  - typecheck 90 (= baseline 90); the changed-files grep is empty (`grep-exit=1`)
  - Output is not truncated.
- Criteria 1-3 and 5: as cited in round 1 (`aboveTabs: true` + screenshot; title, 41 options, SAP filter, "fio" search; `Đã chọn 5/5`, `sixthDisabled true`; i18n vi+en).
- Comments row: doc block on MainSkills, plus a 1-line WHY on `MAIN_SKILLS_MAX` and on the save-result prop.
- Supersedes: none. The other #374 rows are SEALED.
- Seal gate: none (no commit or push).
- Owner account: read-only (the only POST was a token refresh). QA account: rejected requests only, so there was nothing to restore.
- The diff is proportional to the node.

## Missing
none. A live 200 save is explicitly out of scope because the backend release is pending.

## Forbidden hit
none

## Risk carried forward (from note, not blocking)
If the frontend ships before the backend `mainSkills` release reaches backend `main` and Render, every picker "Lưu" returns a 400 toast. Release the backend first.

## PM status
SEALED. The full row is archived to `haven/diagrams/dev-loop-archive.md` and the active row is replaced with a pointer. The pointer rows went over 20, so the 6 oldest were removed: 307, 315, 314, 311, 310 and 336. All 6 are already in the archive.

## Re-run
none (audit only). One targeted grep of the `it(` titles in both spec files and of the PageSkills.spec assertions checked the note's coverage claim. No build, lint, test or live run was repeated.
