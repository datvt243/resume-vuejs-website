# 2026-11-21 - issue-432-433-personal-info-select
- Worker: implementer · Version: 0.1.0
- Node: `issue-432-433-personal-info-select` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#432 + #433 — (1) #432 Personal information: gender/marital select may show 'please select' when editing — store holds gender/marital as booleans but select options in /dashboard/information are 0/1; map boolean ↔ option value both ways. (2) #433 Personal information: don't send the request when the candidate id is missing — currently toast shows but updateDoc still sends POST candidate/create; expected: missing id → toast only, no request. Branch fix/issue-432-433-personal-info-select."
- Issues: https://github.com/datvt243/resume-vuejs-website/issues/432 · https://github.com/datvt243/resume-vuejs-website/issues/433

## Branch
`fix/issue-432-433-personal-info-select` (cut from synced `staging` via `gh issue develop 432 --base staging`; linked to #432 — #433 must be closed by the commit/PR body too, `/ship` only appends `Closes #432` from the branch name)

## Hub bytes before
100277

## Feature doc
`doctrine/features/personal-information.md` — Open questions 1 (#432) and 2 (#433) answered by the operator 2026-11-07 as bugs.

## Feature doc changed
Behavior #3 + "Gender/marital selects show the saved value: the store's `getCandidate` maps the stored booleans to `1`/`0` (#432)"; Behavior #4 + "If the candidate id is missing, only a red generic-error toast shows and no request is sent (#433)"; Changelog row 2026-11-21. Both match the operator's 2026-11-07 answers.

## Finding for #432 — no code change needed
The issue's premise ("store holds booleans, a seeded boolean matches no option") is wrong for what the page reads: `src/stores/candidate.ts:23-24` `getCandidate` already returns `gender`/`marital` as `1`/`0` (`_candidate.gender = _candidate.gender ? 1 : 0`), and `seedFromStore` reads `candidate.getCandidate`. Already unit-tested at `src/stores/candidate.spec.ts:16` ("normalizes gender/marital to 0/1"). Save direction: `VeeForm.onSubmit` passes raw `values` (`VeeForm.vue:149`, no yup cast), select change gives the bound number → `!!0 === false`, `!!1 === true`. A mapping I first added in `seedFromStore` was dead code (the page spec passed without it) and was removed. Verified live (below). Added a page-level spec as a regression guard.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageInformation.vue` | `handleUpdate`: `return` after the missing-id toast (#433) |
| `src/pages/dashboard/PageInformation.spec.ts` | New: (a) store `gender: true, marital: false` → seeded document `1`/`0` (#432 guard); (b) submit with no candidate id → toast once, `updateDoc` not called (#433) |
| `doctrine/features/personal-information.md` | see Feature doc changed |
| `haven/diagrams/dev-loop.prime-mermaid.md` | new node row, IN_PROGRESS |

## Command
From `doctrine/MEMORY.md`: `npx vitest run <path>`, `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Output
Red without fix (`git apply -R` of the `.vue` diff, spec kept):
```
   × PageInformation — personal information > missing candidate id: toast only, no request (#433) 7ms
      Tests  1 failed | 1 passed (2)
```
(the #432 test passes either way — expected, the store already maps; see Finding)
Green with fix: `✓ src/pages/dashboard/PageInformation.spec.ts (2 tests) 24ms` / `Tests  2 passed (2)`
`npm run test` → `Test Files  61 passed (61)` / `Tests  393 passed (393)`
`npm run build` → `✓ built in 3.86s` (pre-existing chunk-size warning only)
`npm run lint` → `lint exit 0`
`npm run typecheck 2>&1 | grep -c "error TS"` → `78` (= baseline 78 in `doctrine/MEMORY.md`); `npm run typecheck 2>&1 | grep "PageInformation"` → no output (no error in changed files)

Live check (Claude-started `npm run dev -- --port 5173 --strictPort`, stopped afterwards; own debug-Chrome window; QA account `qa.minimal@example.com`, read-only on the data — no save):
- hard reload on `#/dashboard/information` → `{"user":"qa.minimal@example.com","gender":["1","Nam"],"marital":["0","Độc thân"]}`
- in-app nav skills → information → `["Nam","Độc thân"]`

## Acceptance
| Criterion | Evidence |
|---|---|
| #432 selects show the saved gender/marital when editing (signed-in) | Live check above: `gender ["1","Nam"]`, `marital ["0","Độc thân"]` after reload and after in-app nav; spec (a) green |
| #432 save maps option → boolean | `VeeForm.vue:149` passes raw values; `handleUpdate` `!!val.gender` unchanged (feature doc Open question 1 code check) |
| #433 missing id → toast only, no request | spec (b): red without fix (`1 failed`), green with fix; `updateDoc` not called |
| matches `features/personal-information.md` Behavior #3, #4 | doc edited per operator answers 2026-11-07 (Feature doc changed) |
| tests/build/lint/typecheck | `393 passed`, `✓ built`, `lint exit 0`, `78` = baseline |
| comments per code-comments.md | no comment added in `.vue`; the spec's one comment (`// VeeForm pulls in CKEditor (not loadable in jsdom)`) copied from `PageAccountSettings.spec.ts:8` |

## Supersedes
none (`grep -n "432\|433" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row)

## Review
`/code-review` not run as a skill; inline pass over `PageInformation.vue` `handleUpdate` + its caller `VeeForm.vue` `onSubmit` (l.144-160): returning `undefined` early is handled the same as a resolved save (VeeForm awaits the result). No findings.

## Noticed, not done
- During the live check the shared debug Chrome had an older tab on `localhost:5173/#/dashboard/skills` (from an earlier server); logging in as qa.minimal in my own window overwrote the origin's `localStorage.user`. That tab's token lives in its own sessionStorage/memory, untouched.

## Seal gate
none (no commit/push; live check was read-only)
