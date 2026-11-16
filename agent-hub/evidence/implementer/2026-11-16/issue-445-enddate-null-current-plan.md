# 2026-11-16 - issue-445-enddate-null-current

- Worker: implementer · Version: 0.1.0
- Node: `issue-445-enddate-null-current` on `haven/diagrams/dev-loop.prime-mermaid.md` (IN_PROGRESS)
- Branch: `fix/issue-445-timeline-sections-send` (off `staging` @ 2295df0, linked to #445 via `gh issue develop`)
- Task: "#445 Timeline sections: send `endDate: null` when "current" is checked. Problem: When "currently working / studying / still working on it" is checked, the end date is still sent as a timestamp; an empty date becomes `NaN` / `0`. Expected: "Current" checked → `endDate: null` (Experience, Education, Project). Decided by the operator while confirming agent-hub/doctrine/features/cv-timeline-sections.md (2026-11-07)."

## Hub bytes before: 99250

## Feature doc: doctrine/features/cv-timeline-sections.md
Open question 5 answered by the operator 2026-11-07: "Bug: send null — #445". Behavior #2 says "Dates are sent as timestamps (ms)" — the fix narrows that for the current case per the operator's answer; doc not edited here (the answer is already recorded in the doc's Open questions). Suggest the verifier/analyst add the null rule to Behavior #2 on SEAL.

## Acceptance criteria
1. Experience save with `isCurrent: true` → payload `endDate: null`.
2. Education save with `isCurrent: true` → payload `endDate: null`.
3. Project save with `isWorking: true` → payload `endDate: null`.
4. Unchecked → `endDate` still sent as a ms timestamp (unchanged).
5. Displays of a current entry don't read `endDate` (no "01/1970").
6. `npm run test`, `npm run build`, `npm run lint` green; `npm run typecheck` ≤ 78 errors, none in touched files.
7. Comments per code-comments.md.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageExperience.vue:90` | `val.endDate = val.isCurrent ? null : +new Date(val.endDate)` |
| `src/pages/dashboard/PageEducation.vue:82` | same, `isCurrent` |
| `src/pages/dashboard/PageProject.vue:74` | same, the Project flag is `isWorking` (`src/models/project.model.ts:38`) |
| `src/pages/dashboard/PageEducation.spec.ts` (new, REOPEN round 1) | mounts PageEducation with the same stub pattern as PageExperience.spec; submitFn with `isCurrent: true` → `updateDoc` payload `endDate: null` |
| `src/pages/dashboard/PageProject.spec.ts` (new, REOPEN round 1) | same, flag `isWorking: true` |
| `src/pages/dashboard/PageExperience.spec.ts` | VeeForm stub declares `submitFn`; `updateDoc` hoisted mock; new test "sends endDate null when "currently working" is checked" |

Not in this diff: `.claude/skills/issues-ls/SKILL.md` was already modified in the working tree before the branch was cut (operator's own edit) — not part of this task, must not be committed with it.

## Command
- `npx vitest run src/pages/dashboard/PageExperience.spec.ts`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Output
New test, with fix:
```
 Test Files  1 passed (1)
      Tests  4 passed (4)
```
New test with the PageExperience fix reverted (mutation check, then restored):
```
     → expected { _id: 'e1', …(6) } to match object { endDate: null, isCurrent: true }
AssertionError: expected { _id: 'e1', …(6) } to match object { endDate: null, isCurrent: true }
```
### REOPEN round 1 (verifier: criteria 2/3 untested, build output cut)
`npx vitest run src/pages/dashboard/PageEducation.spec.ts src/pages/dashboard/PageProject.spec.ts`, with fix:
```
 ✓ src/pages/dashboard/PageEducation.spec.ts (1 test) 16ms
 ✓ src/pages/dashboard/PageProject.spec.ts (1 test) 16ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
```
Same, with both fixes reverted (sed), then restored from a scratchpad copy:
```
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected { _id: 'x1', …(6) } to match object { endDate: null, isCurrent: true }
AssertionError: expected { _id: 'x1', …(5) } to match object { endDate: null, isWorking: true }
      Tests  2 failed (2)
```
`npm run test` (after restore):
```
 Test Files  58 passed (58)
      Tests  378 passed (378)
```
`npm run build | tail -8` (tail of the run, not elided inside):
```
dist/assets/index-BsLosMRv.js                            415.66 kB │ gzip: 146.30 kB
dist/assets/VeeForm-DGQuK4Xn.js                          993.37 kB │ gzip: 281.68 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.77s
```
`npm run lint` → `lint exit 0`.
`npm run typecheck | grep -c "error TS"` → `78`; `grep -cE "PageExperience|PageEducation|PageProject"` on its errors → `0`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 Experience null | spec "sends endDate null…" passes (4 passed); fails when fix reverted (AssertionError above) |
| 2 Education null | `PageEducation.spec.ts` passes; fails with fix reverted (`…isCurrent: true }` AssertionError above) |
| 3 Project null | `PageProject.spec.ts` passes; fails with fix reverted (`…isWorking: true }` AssertionError above) |
| 4 Unchecked unchanged | ternary else branch is the original `+new Date(val.endDate)` (diff) |
| 5 Display safe | `ExperienceItem.vue:37`, `EducationItem.vue:35`, `ProjectItem.vue:48`, `CvResumeLayout.vue:89,163` all check the flag before `formatDate(endDate)`; `jsonResume.ts:66` uses `isOpenEnded`; list sorts (`useCandidate.ts:111`, `CvResumeLayout.vue:78`) use `startDate`. Editing a current entry: `FrmDatePicker.checkValue` falls back to today for a null value |
| 6 Commands | Tests 378 passed (58 files); ✓ built in 3.77s; lint exit 0; typecheck 78 = baseline, none in touched files |
| 7 Comments per code-comments.md | No comments added or changed |

## Supersedes: none
`grep "445"` on the active diagram: only this node.

## Review
Inline review (diff is 3 one-line edits + 1 test): read all 3 `handleUpdate`s in full and every `endDate` reader in `src/` (listed under Acceptance 5). No correctness findings. Backend acceptance of `endDate: null` not verified live (no API call made) — the feature doc lists backend issues datvt243/resume-nodejs-api#413/#414 for this area.

## Noticed, not done
- Unchecked "current" with a cleared date still sends `+new Date(null)` = `0` / `NaN` — outside #445's "current checked" scope.

## Seal gate: none (no commit/push/API call)
