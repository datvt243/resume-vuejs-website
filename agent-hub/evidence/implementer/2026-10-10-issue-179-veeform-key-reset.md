# 2026-10-10 - issue-179-veeform-key-reset

- Worker: implementer
- Version: 0.1.0
- Node: `issue-179-veeform-key-reset` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim, from issue #179): "[LOW] Bug: VeeForm — key field gõ sai (el.nam) và resetAfterSave reset sai default" — 1) `src/components/veevalidate/VeeForm.vue:132` `:key="el.nam"` typo → every field key is `undefined`. 2) `VeeForm.vue:112` `resetAfterSave` calls `resetForm()` with no values → form goes to `{}` instead of `model.default` (same date→NaN bug `reset()` already fixes). Suggested fix: `:key="el.name"`; replace `resetForm()` with `reset()`.

## Hub bytes before: 170859

## Branch
`fix/issue-179-veeform-key-reset` — created off freshly pulled `staging` (`85d062a`) via `gh issue develop 179 --checkout --base staging`. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `src/components/veevalidate/VeeForm.vue` | `:key="el.nam"` → `:key="el.name"` (template v-for); `onSubmit` `resetAfterSave` branch: `resetForm()` → `reset()` (the existing per-field-default reset). 2 lines. |
| `src/components/veevalidate/VeeForm.spec.ts` | existing "resetAfterSave clears the form back to defaults" test only asserted the `name` field (default `''`), so it passed with the bug. Now also edits `age` and asserts it returns to its non-empty model default `'n/a'`. |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts`
- Same, with `reset()` temporarily reverted to `resetForm()` (file restored from backup afterwards) — proves the test catches the bug
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)

## Output
Spec, real fix:
```
 ✓ src/components/veevalidate/VeeForm.spec.ts (11 tests) 67ms
      Tests  11 passed (11)
```
Spec, fix reverted:
```
   × VeeForm > resetAfterSave clears the form back to defaults right after a valid submit 7ms
      Tests  1 failed | 10 passed (11)
```
`npm run test`:
```
 Test Files  22 passed (22)
      Tests  147 passed (147)
```
`npm run build`:
```
✓ built in 3.82s
```
`npm run lint`: exit 0.

The `:key` fix has no dedicated test (Vue key behaviour isn't observable without forcing a field-list reorder); it is a pure typo fix verified by build + lint + the diff itself. No browser click-through this session — disclosed, not implied.

## Acceptance
| Criterion | Evidence |
|---|---|
| v-for key uses the field name | diff line `:key="el.name"` |
| resetAfterSave restores each field's `model.default` | spec asserts `age` → `'n/a'` after submit; passes with fix, fails (`× … 7ms`) with `resetForm()` |
| No regression | `Tests  147 passed (147)` |
| Build green | `✓ built in 3.82s` |
| Lint clean | exit 0 |
| comments per code-comments.md | one 2-line `//` in the spec explaining WHY `age` is asserted (non-empty default). No issue refs, no history narration. |

## Noticed, not done
- The 3 previously flaky `VeeForm.spec.ts` "BUG (real, verified)" tests passed in this run (147/147) — still considered flaky per earlier notes, not touched.
- `resetForm` is still destructured from `useForm` and used by `reset()` — not dead.

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.
