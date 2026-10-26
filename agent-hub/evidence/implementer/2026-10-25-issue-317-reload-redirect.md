# 2026-10-25 - issue-317-reload-redirect

- Worker: implementer
- Version: 0.1.0
- Node: `issue-317-reload-redirect` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #317 "[QC][P3] Reload ở Dashboard (#/) bị chuyển sang trang đã mở trước đó".

## Hub bytes before: 82257
(Same tree state as the sibling #314/#315/#316 notes: clean `staging` `3c06ad3`.)

## Branch
`fix/issue-317-reload-redirect`, created from up-to-date `staging` (`3c06ad3`) via `gh issue develop 317 --base staging --name fix/issue-317-reload-redirect`. It is checked out in the git worktree `../rv-wt317` (`node_modules` symlinked).

## Acceptance criteria (from #317)
1. Reloading any authenticated URL, including the dashboard home `#/`, stays on that URL.
2. Deep links are respected.
3. Post-login landing still works. A logged-in user who opens `/login`/`/register` still gets to the dashboard, the job the old mount redirect did for those pages.

## Root cause
`src/routers/index.ts` `beforeEach` stored every path except `/` in `localStorage['current-page']`. `src/App.vue`'s `onMounted` then did `router.push(current-page || '/dashboard/information')` whenever the user was authenticated, overriding whatever URL was loaded. For any non-root URL the stored value equals the loaded one, so nothing visibly changed; for `/` it doesn't, so the user was moved. QC also saw this on login: landing on `/dashboard/information` instead of the requested route.

## Diff
| File | Why |
|---|---|
| `src/App.vue` | Removed the unconditional `router.push(current-page …)` block, plus the `useRouter` import and `router` const that only it used. The candidate fetch on mount is unchanged. |
| `src/routers/index.ts` | Removed the `current-page` write in `beforeEach`. Its only reader was the block above (`grep -rn "current-page" src` → nothing left). |
| `src/composables/useAuthRedirect.ts` | This composable already owns the auth-driven redirects (the forced-logout → `/login` watch). After `router.isReady()`, if authenticated and the route is `login`/`register` → `push('/dashboard/information')`. That keeps what the old redirect did for guest-only pages, and it is the same target `services/auth.ts` login uses. Header doc comment extended to describe this. |
| `src/composables/useAuthRedirect.spec.ts` | Added the `/` (requiresAuth) route to the test router, plus 3 tests: reload at `/` stays at `/`; logged-in at `/login` → `/dashboard/information`; logged-out at `/login` stays. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck` · `npx eslint` on the 3 changed source files. Also `npx vitest run src/composables/useAuthRedirect.spec.ts`, with and without the composable change (`git stash push src/composables/useAuthRedirect.ts`).

## Output
With the fix: `Tests  6 passed (6)` (3 existing + 3 new).
Without the composable change:
```
   × useAuthRedirect > sends a logged-in user who opens /login to the dashboard 5ms
      Tests  1 failed | 5 passed (6)
```
`npm run test`: `Tests  1 failed | 280 passed (281)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`).
`npm run build`: `✓ built in 3.68s`
`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline); `grep -E "App.vue|useAuthRedirect|routers/index"` → no match.
`npx eslint src/App.vue src/composables/useAuthRedirect.ts src/routers/index.ts`: no output (clean).
`grep -rn "current-page" src` → `no current-page left`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Reload keeps the URL (incl. `#/`) | The override is gone: the diff removes the `App.vue` push, and `grep` shows no `current-page` left. Spec "keeps the loaded URL on a reload, including the dashboard home" → stays at `/`. Caveat: that spec passes on the old composable too, because the bug lived in `App.vue`. `App.vue` has no spec harness (layouts, stores, spinner), so criterion 1 rests on the removal itself. |
| 2. Deep links respected | Same removal: nothing pushes on mount for non-guest routes. The existing spec "does not navigate while auth stays valid" keeps `/dashboard/information`. |
| 3. Logged-in `/login`/`/register` → dashboard; login flow | New spec (red on the old composable, green now); logged-out stays on `/login`; `services/auth.ts:52` login push unchanged |
| Tests / build / typecheck / lint | 280 passed + 1 pre-existing failure · `✓ built in 3.68s` · 90 = baseline · eslint clean |
| Comments per code-comments.md | Doc comment extended with the behaviour (no `(#N)`); removed a Vietnamese WHAT comment with its dead block |

**Manual browser check: BLOCKED.** The Playwright Chrome window is `visibilityState: "hidden"` (see the #308/#309 notes). QC reproduced the bug in the browser earlier today (#317). The reload on `#/` should be re-checked by hand at release.

## Supersedes: none
## Still open: none

## Noticed, not done
- Existing users keep a stale `current-page` key in `localStorage`. It is harmless now that nothing reads it, so it isn't worth a cleanup line.

## Seal gate
None (no commit/push).
