# 2026-10-10 - issue-181-delete-confirm-message

- Worker: implementer
- Version: 0.1.0
- Node: `issue-181-delete-confirm-message` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim, from issue #181): "[LOW] Bug: Xác nhận xoá GeneralInformation gõ sai thì im lặng không báo" — `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` — the delete confirmation (Swal) only validates empty input. A typo (e.g. "delet") → dialog closes, nothing deleted, no message. Suggested fix: `inputValidator: v => v !== 'delete' && 'Vui lòng nhập "delete" để xác nhận'`.

## Hub bytes before: 170859

## Branch
`fix/issue-181-delete-confirm-message` — created off `origin/staging` (`85d062a`, fetched this session) via `gh issue develop 181 --base staging --name fix/issue-181-delete-confirm-message`, checked out in a separate git worktree (`../wt-181`, `node_modules` symlinked from the main checkout) because the main checkout holds #179's still-uncommitted sealed diff. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.vue` | `inputValidator`: `if (!value)` → `if (value !== 'delete')`. Same existing message text is returned, so Swal keeps the dialog open and shows it. Cancel still resolves `value` undefined → `_flag` false → no delete (unchanged). 1 line. |
| `src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts` (new) | 2 tests. Mounts the real component (sweetalert2 + `useDocument` mocked, `TableDefault` stubbed to render the row's delete link, `VeeForm.vue` mocked because its barrel imports CKEditor which can't load in jsdom); clicks delete; asserts the captured `inputValidator` rejects `'delet'` and `''` and accepts `'delete'`, and that a confirmed `'delete'` calls `updatePatchDoc` with the row removed. |

## Command
From the worktree root, per `doctrine/MEMORY.md`:
- `npx vitest run src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts`
- Same, with the `.vue` file reverted to `HEAD` (restored from backup afterwards)
- `npm run test`
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` (flakiness check)
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)

## Output
New spec, real fix:
```
 ✓ src/components/veevalidate/VeeFormGeneralInformationUpdate.spec.ts (2 tests) 325ms
      Tests  2 passed (2)
```
New spec, original `.vue`:
```
   × VeeFormGeneralInformationUpdate — delete confirmation > rejects any input other than "delete" with a message instead of closing silently 130ms
      Tests  1 failed | 1 passed (2)
```
`npm run test`:
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 1171ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 277ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 511ms
 Test Files  1 failed | 22 passed (23)
      Tests  3 failed | 146 passed (149)
```
The 3 `VeeForm.spec.ts` failures are the pre-existing flaky tests documented in `evidence/implementer/2026-10-09-issue-176-178-sanitize-html.md` / `2026-10-10-issue-177-forced-logout-redirect.md`. This diff touches neither `VeeForm.vue` nor its spec ("VeeForm untouched" from `git diff --quiet HEAD -- …`); that spec alone on this branch gave `2 failed | 9 passed (11)`, and 1–2 random failures on other branches too.

`npm run build`:
```
✓ built in 4.21s
```
`npm run lint`: exit 0.

No live browser click-through of the real SweetAlert2 dialog this session (needs a logged-in session with General Information rows). The spec checks the validator the component passes to `Swal.fire`; that SweetAlert2 shows a validator's returned string and keeps the popup open is the library's documented `inputValidator` contract — disclosed, not implied as observed.

## Acceptance
| Criterion | Evidence |
|---|---|
| Typo input shows a message instead of closing silently | spec: `inputValidator('delet')` truthy — passes with fix, fails (`× … 130ms`) on original |
| Empty input still rejected | spec: `inputValidator('')` truthy |
| Exact `"delete"` still deletes | spec "deletes the row once \"delete\" is confirmed" — `updatePatchDoc` called with `{ _id: 'c1', personalSkills: [] }` |
| Build green | `✓ built in 4.21s` |
| Lint clean | exit 0 |
| comments per code-comments.md | two short `//` in the new spec (why `VeeForm.vue` is mocked, why the table stub exists). No comments in the `.vue` change. |

## Noticed, not done
- `VeeForm.spec.ts` flakiness — see #180's note; worth its own issue.

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.
