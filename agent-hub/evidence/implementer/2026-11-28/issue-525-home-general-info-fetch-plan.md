# 2026-11-28 - issue-525-home-general-info-fetch

- Worker: implementer · Version: 0.1.0
- Node: `issue-525-home-general-info-fetch` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `fix/issue-525-dashboard-shows-wrong` (off `staging` @ `41ea24e`, created via `gh issue develop 525`)
- Task: "#525 Dashboard shows wrong open-to-work status, position and completion % on a fresh load — `useProfileCompletion.ts` calls `useCandidate` for the six list sections but not for `generalInformation`; `PageHome` only reads `candidate.getGeneralInformation` from the store cache. Fix: add `useCandidate({ field: 'generalInformation', collection: 'general-information' })` next to the other six. Add a spec: a fresh store with the API returning general info gives the right percent. Acceptance: a fresh load of `/` shows the real open-to-work status, position, salary and completion without visiting another page first."

## Hub bytes before: 103030

## Feature doc: doctrine/features/home-overview.md
The fix restores Behavior #2 (strip: desired position, salary line, Open to work badge) and #4 (completion: General information, Skills, Languages read from the general-information document) on a fresh load. Behavior #4's "no new request" means Skills/Languages add no request beyond the General information one; it doesn't say the document is never fetched, so there's no contradiction and the doc is unchanged.

## Prior fixes
`git log --oneline -n 10 -- src/composables/useProfileCompletion.ts` → `0100e3a` (#440 skills/languages), `f09b392` (#403 salary range), `cbeee55` (#266 i18n), `e913fa4` (#59 original). Notes checked: `issue-440-cv-skills-languages-plan.md`, `issue-403-salary-range-plan.md` (both added sections that read `getGeneralInformation`, neither added a fetch). The new spec below shows the cause: with the fix reverted, it fails.

## Diff
| File | Why |
|---|---|
| `src/composables/useProfileCompletion.ts` | +2 lines after the six list `useCandidate` calls: `useCandidate({ field: 'generalInformation', collection: 'general-information' })` with a 1-line WHY comment (PageHome reads that document from the store). Same call shape as `PageSalaryCalculator.vue:17`. `useCandidate` skips the fetch when `generalInformation` is already cached. |
| `src/composables/useProfileCompletion.spec.ts` | +1 test "fetches general information on a fresh store so its 3 sections count (#525)": mock returns a full general-info doc (with one personal skill + one language) for `general-information/` and `[]` for the rest. Asserts the request was made, `percent` = 30 (General info + Skills + Languages = 3/10), and `getGeneralInformation.positionDesired` = `'Dev'`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New node row |

Not mine: `.claude/skills/todo/SKILL.md` was already modified in the working tree before this branch was created (operator's edit, carried over).

## Command (doctrine/MEMORY.md, repo root)
`npm run test` · `npm run lint` · `npm run typecheck` · `npm run build`

## Output
```
# new spec with the fix reverted (git stash of useProfileCompletion.ts)
   × useProfileCompletion > fetches general information on a fresh store so its 3 sections count (#525) 5ms
AssertionError: expected false to be true // Object.is equality
      Tests  1 failed | 11 passed (12)

# with the fix
npx vitest run src/composables/useProfileCompletion.spec.ts
 ✓ src/composables/useProfileCompletion.spec.ts (12 tests) 34ms
      Tests  12 passed (12)

npm run test
 Test Files  70 passed (70)
      Tests  528 passed (528)

npm run lint
> resume-vuejs-website@1.46.0 lint
> eslint src --ext .js,.ts,.vue
lint_exit=0

npm run typecheck | grep -cE "error TS"
74
npm run typecheck | grep useProfileCompletion  → 6 lines, useProfileCompletion.ts(80..85): TS2339 Property 'value' does not exist on type ...

# base (both files stashed)
npm run typecheck | grep -cE "error TS"  → 74
npm run typecheck | grep -c useProfileCompletion  → 6

npm run build
✓ built in 4.01s
```
Typecheck: 74 errors ≤ baseline 75 (doctrine/MEMORY.md). The 6 errors in `useProfileCompletion.ts` already exist on the base (same count, 6). They're on the existing `educations.value`…`references.value` lines (`useCandidate`'s untyped dynamic-key return), moved down 2 lines by this diff. The new line adds none, and the spec file has none.

## Live check
Vite `npm run dev -- --port 5173` (started by me, stopped after) + Playwright MCP, QA account `qa.full@example.com` (never the owner). Logged in, then `location.hash='#/'; location.reload()` (fresh store, as in the issue), with no other page visited after the reload:
- `/` main text: "Nguyễn Văn Full · **Frontend Developer** · **25.000.000** · **Đang mở tìm việc**", completion "**70%** · 7/10 mục đã đủ", missing list only "Giải thưởng, Chứng chỉ, Người tham khảo" (Thông tin chung, Kỹ năng, Ngoại ngữ no longer missing).
- `performance.getEntriesByType('resource')` filtered `general-information` → `["https://nodejs-resume-api-ts.onrender.com/api/v1/general-information/"]`.
These match the issue's "after visiting Thông tin chung" values (Đang mở tìm việc, Frontend Developer, 70% 7/10), now on a fresh load.

## Acceptance
| # | Criterion | Evidence |
|---|---|---|
| 1 | `useProfileCompletion` calls `useCandidate({ field: 'generalInformation', collection: 'general-information' })` | Diff row 1 |
| 2 | Spec: fresh store + API returning general info → right percent | New test, 30%; fails with the fix reverted, passes with it (Output) |
| 3 | Fresh load of `/` shows the real open-to-work status, position, salary and completion | Live check |
| 4 | Matches `features/home-overview.md` Behavior #2 and #4 | Live check (strip + 70% with General info/Skills/Languages counted); existing spec tests for #4 still pass (12/12) |
| 5 | test/lint/build exit 0, typecheck ≤ baseline with none new in changed files | Output |
| - | comments per code-comments.md | One `//` WHY line, no issue ref, no history |

## Supersedes: none
(`grep -n "525" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.)

## Review (inline; same scope as `/code-review medium`: touched files in full + callers)
- Callers: `useProfileCompletion` is only used by `PageHome.vue:45` (+ the barrel re-export `composables/index.ts`). `PageHome.vue:29` reads `candidate.getGeneralInformation`, which the new call fills.
- Double fetch: `useCandidate` checks `candidate.getCandidate.generalInformation != null` in `onBeforeMount`. Once cached (after a visit, or after this fetch), later pages don't refetch. No other component on `/` calls `useCandidate` for `generalInformation` (grep: only the dashboard pages), so there's no concurrent duplicate on `/`.
- Failure path: a failed fetch → `toastError` toast plus an empty `{}` from the getter (`getGeneralInformation` returns `{}` for `[]`/missing). Same as the six list sections, no crash. Existing tests that return `data: []` for every URL still pass.
- API shape: the store getter handles both object and array (`candidate.ts:43-49`). The live API response worked (live check).
- No correctness/security findings.

## Noticed, not done
- The 6 pre-existing TS2339 errors in `useProfileCompletion.ts` come from `useCandidate` returning `[toValue(field)]: result` (dynamic key, union type). Typing that return would clear them across many callers. Separate task.

## Dead ends
none

## Seal gate
none — no commit/push/merge in this pass.
