# 2026-10-19 - issue-214-sidebar-visits

- Worker: implementer
- Version: 0.1.0
- Node: `issue-214-sidebar-visits` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #214 [BUG] Sidebar thiếu mục "Lượt truy cập" (/dashboard/visits) — https://github.com/datvt243/resume-vuejs-website/issues/214 (body: route exists in `src/routers/index.ts:107` but is not in the `routers` array of `src/pages/_layouts/LayoutDefault.vue`; add `{ text: 'Lượt truy cập', name: 'visits', to: '/dashboard/visits' }` right after Dashboard)

## Hub bytes before: 179436

## Branch
`fix/issue-214-sidebar-visits` was created via `gh issue develop 214 --base staging` (linked to #214) from `staging` at `3b09545`. It is checked out in a separate git worktree (`scratchpad/wt-214`), so the uncommitted #213 diff in the main checkout stays out of it. This branch is neither `main` nor `staging`.

## Diff
| File | Why |
|---|---|
| `src/pages/_layouts/LayoutDefault.vue` | Add `{ text: 'Lượt truy cập', name: 'visits', to: '/dashboard/visits' }` right after the Dashboard entry in `routers` (one line). The active class already compares `r.to === $route.path`, so no other change is needed. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

No spec added. This is a one-line data entry; `LayoutDefault.vue` (pug, stores, `useVisits`) has no existing spec. It was verified live instead (below).

## Command
From the worktree root:
- `npm run build`
- `npm run test`
- Typecheck: CANNOT RUN — pending add-typecheck-script.
- Manual observation: the one-line change was temporarily copied into the main checkout so the operator's running `npm run dev` on 5173 hot-reloaded it. The sidebar was read via Playwright on the logged-in tab, then the main-checkout file was reverted with `git checkout -- src/pages/_layouts/LayoutDefault.vue`; `git status` afterwards shows that file clean.

## Output
`npm run build`:
```
✓ built in 4.61s
```
`npm run test`:
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 990ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 332ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 313ms
 Test Files  1 failed | 34 passed (35)
      Tests  3 failed | 225 passed (228)
```
These `VeeForm.spec.ts` failures also occur on clean `origin/staging`; see `evidence/implementer/2026-10-19-issue-212-form-select-dark.md`. Which tests fail varies from run to run, and this diff doesn't touch VeeForm.

Live sidebar on `#/dashboard/visits` (manual observation, not an automated test):
```
{"hash":"#/dashboard/visits","links":["Dashboard -> #/","Lượt truy cập [active] -> #/dashboard/visits","Thông tin cơ bản -> #/dashboard/information"],"home":["Dashboard"]}
```
`home` is the active item after navigating to `#/`, which shows Dashboard is still the only active item there.

## Acceptance
| Criterion | Evidence |
|---|---|
| "Lượt truy cập" appears in the sidebar right after Dashboard | live `links[1]` = `Lượt truy cập -> #/dashboard/visits` |
| It is active on `/dashboard/visits` | `[active]` on that item |
| Other active states are unaffected | on `#/`, active = `["Dashboard"]` only |
| Build green | `✓ built in 4.61s` |
| No new test failure | only the flaky `VeeForm.spec.ts`, which also fails on `staging` |
| Comments per code-comments.md | no comments added |

## Noticed, not done
- The visits table logs a Vue warning for every row: `Invalid prop: type check failed for prop "modelValue". Expected Number | Null, got String with value "2026-10-18T19:58:29.865…"`. The date convert component declares `Number` but receives ISO strings. This predates the change and is cosmetic (console only).
- During the live check, an over-broad `pkill -f "vite.*" -P 1` that was meant to stop the throwaway 5174 dev server also stopped the operator's 5173 dev server. The operator has been told to restart `npm run dev`. No code impact.
- `VeeForm.spec.ts` is flaky on `staging` and needs its own issue.
- The nav grouping and active style (DESIGN.md §3) are phase 2 (#217), out of scope here.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.
