# 2026-10-25 - issue-314-public-cv-slug-reload

- Worker: implementer
- Version: 0.1.0
- Node: `issue-314-public-cv-slug-reload` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row, appended)
- Task (verbatim, operator): "xong hết thì tiếp tục P3-P4". This pass covers issue #314 "[QC][P3] Trang CV công khai không tải lại khi đổi slug trong cùng tab — hiện CV của người trước".

## Hub bytes before: 82257
(Same tree state as the sibling #315/#316 notes: clean `staging` `3c06ad3`.)

## Branch
`fix/issue-314-public-cv-slug-reload`, created from up-to-date `staging` (`3c06ad3`) via `gh issue develop 314 --base staging --name fix/issue-314-public-cv-slug-reload`. It is checked out in the git worktree `../rv-wt314` (`node_modules` symlinked).

## Acceptance criteria (from #314)
1. Changing only the slug in the same tab (e.g. `#/resume/a` → `#/resume/b`) fetches and shows the new profile.
2. A slug that doesn't exist shows the not-found state, not the previous person's CV.
3. Existing behaviour is kept: `?lang`/`?profile` params, visit POST, no visit on not-found.

## Diff
| File | Why |
|---|---|
| `src/pages/public/PagePublicResume.vue` | Root cause: `const identifier = route.params.slug` was read once and fetched in `onMounted`. Vue Router reuses the component when only a param changes, so nothing ran again. The fetch body is unchanged but moved into `load(identifier)`, driven by `watch(() => route.params.slug, load, { immediate: true })`. `load` resets `loading`/`notFound`/`data` first, so a failed second fetch can't leave the previous CV on screen. One `//` WHY comment. |
| `src/pages/public/PagePublicResume.spec.ts` | New test that mounts a real `<RouterView />`: `/resume/alice` renders alice → push `/resume/bob` → second GET `api/me/bob` and bob is rendered → push `/resume/missing` → no CV, not-found shown. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Appended node row (`IN_PROGRESS`). |

## Command
From the worktree root: `npm run test` · `npm run build` · `npm run typecheck`. Also `npx vitest run src/pages/public/PagePublicResume.spec.ts`, with and without the `.vue` change (`git stash push src/pages/public/PagePublicResume.vue`).

## Output
With the fix: `Tests  6 passed (6)`. These are the 5 existing tests (`?lang`, visit tracking, no visit on not-found) plus the new one.
Without the fix:
```
   × PagePublicResume — slug change in the same tab > refetches when only the slug changes (the router reuses the component) 9ms
      Tests  1 failed | 5 passed (6)
```
`npm run test`: `Tests  1 failed | 278 passed (279)`. The single failure is the pre-existing `VeeForm > VI | EN toggle > flags the hidden language…`, which also fails on `staging` (baseline recorded in `2026-10-25-issue-307-modal-save-close.md`).
`npm run build`: `✓ built in 3.75s`
`npm run typecheck`: `grep -c "error TS"` → `90` (= baseline); `grep PagePublicResume` → no match.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Refetch on slug change | new spec: GET URLs `['api/me/alice', 'api/me/bob']`, `.cv-introduction` → `api/me/bob`; red on the old file |
| 2. Unknown slug → not-found, not stale CV | same spec: after `/resume/missing`, `.cv-introduction` gone and `.no-data` present |
| 3. Existing behaviour kept | the 5 existing tests in the same file pass |
| Tests / build / typecheck | 278 passed + 1 pre-existing failure · `✓ built in 3.75s` · 90 = baseline |
| Comments per code-comments.md | One `//` WHY comment, no `(#N)` |

**Manual browser check: BLOCKED.** The Playwright Chrome window is `visibilityState: "hidden"` (see the #308/#309 notes). The spec drives a real router and the real page.

## Supersedes: none
## Still open: none

## Noticed, not done
- If the slug changes again before the previous request returns, the older response could land last and win. This is unlikely for a manual URL edit and not part of #314; a request token/abort would cover it if it ever matters.

## Seal gate
None (no commit/push).
