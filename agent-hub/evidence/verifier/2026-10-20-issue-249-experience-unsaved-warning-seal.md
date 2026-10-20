# 2026-10-20 - issue-249-experience-unsaved-warning - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-249-experience-unsaved-warning` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-20-issue-249-experience-unsaved-warning.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh verifier subagent with the task string `/worker verifier "#249 [BUG] Kinh nghiệm: sửa + lưu xong, đóng modal vẫn báo \"chưa lưu\" — evidence note: ... (node issue-249-experience-unsaved-warning, branch fix/issue-249-experience-unsaved-warning)"`, with the instruction "You did NOT write the diff under review". This context did not have the implementer session's history.

## Re-run
none. Audit only. The note's output is quoted without truncation, its commands match `doctrine/MEMORY.md` (test + build, Typecheck marked CANNOT RUN), and the node is not outward-facing (no commit, push or deploy).

## Cited
- Commands: `npm run test`, `npm run build`, Typecheck "CANNOT RUN — pending add-typecheck-script". These match doctrine/MEMORY.md.
- Successful save makes the form clean: new VeeForm spec (`markSaved()` → `isDirty()` false). PageExperience calls it from the `updateDoc` success callback.
- Failed save still prompts: `markSaved()` runs only from the `handleBase` success callback, and `.catch` never calls it. This rests on a code-path citation, with no automated test. Accepted because the note states the gap openly.
- Editing again after a save prompts again: the same spec's second `setValue` gives `isDirty()` true.
- Build: `✓ built in 3.69s`.
- No new test failures: 249 passed and 1 failed. The failing test (`VeeForm.spec.ts:287`, VI | EN error flag) also failed 3 out of 3 runs with the diff stashed, so it existed before this diff.
- Comments per code-comments.md: one one-line why-comment on `markSaved()`. The row is present.
- Branch: `fix/issue-249-experience-unsaved-warning`, not main or staging.

## Missing
None blocking. The manual UI click-through was not done, and the note says so explicitly. The unit spec plus the code path covers the criteria.

## Forbidden states
ADHOC_WORK no (the node exists). NO_EVIDENCE no. EDIT_UNVERIFIED no. CODE_IN_HAVEN no (haven only has a diagram row). DIAGRAM_DRIFT no (the row is updated to SEALED in place). MAIN_EDIT no.

## Seal gate
Not applicable. No commit, push or API call. Shipping goes through `/ship`.

## Proportionality
The diff covers 3 source files (+26) and adds one diagram row. The same bug on other CRUD pages and the duplicate-flow `_id` risk were noted but not fixed, which is correct scoping.
