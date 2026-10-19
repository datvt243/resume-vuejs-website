# 2026-10-19 - issue-212-form-select-dark

- Worker: implementer
- Version: 0.1.0
- Node: `issue-212-form-select-dark` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #212 [BUG] <select> không đọc được ở dark mode (nền trắng, chữ trắng). Nguyên nhân: `.form-select` bị bỏ khi port Bootstrap → Tailwind (src/styles/tailwind.css:540 ghi 'confirmed unused via grep') nhưng đang dùng ở PageHome.vue, PagePreview.vue, PageAtsCheck.vue, PageInformation.vue. Hướng sửa: thêm `.form-select` (+ `.form-select-sm`) vào @layer components đọc var(--bs-*) giống .form-control, thêm vào safelist. URL: https://github.com/datvt243/resume-vuejs-website/issues/212

## Hub bytes before: 177499

## Branch
`fix/issue-212-form-select-dark` — created from freshly pulled `staging` via `gh issue develop 212 --checkout --base staging` (linked to #212). Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/styles/tailwind.css` | Add `.form-select`, `.form-select:focus`, `.form-select-sm` in `@layer components`, reading `var(--bs-*)` like `.form-control` (same focus colors as `.form-control`). Add `color-scheme: light` / `color-scheme: dark` to the two theme blocks so the native select arrow and open option list follow the theme. Remove `.form-select` from the "Skipped (confirmed unused)" comment, which was wrong. |
| `tailwind.config.cjs` | Safelist `form-select`, `form-select-sm` next to `form-control` (house rule: every hand-written component class is safelisted). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

All 5 usages are `class="form-select form-select-sm w-auto"` (`grep -rn "form-select" src --include=*.vue` → 5 lines: PageHome, PagePreview, PageAtsCheck, PageInformation ×2). No `.vue` file changed.

## Command
From repo root:
- `npm run test`
- `npx vitest run src/components/veevalidate/VeeForm.spec.ts` (on this branch and on a clean `origin/staging` worktree, to prove the failures pre-exist)
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script (diff touches no `.ts`/`.vue` anyway).

## Output
`npm run test` (this branch):
```
 Test Files  1 failed | 34 passed (35)
      Tests  3 failed | 225 passed (228)
```
Failures, all in `src/components/veevalidate/VeeForm.spec.ts`:
```
× VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit
× VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true
× VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn
```
`npx vitest run src/components/veevalidate/VeeForm.spec.ts` on clean `origin/staging` worktree (no diff applied):
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 340ms
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 78ms
      Tests  2 failed | 13 passed (15)
```
Same spec on this branch alone: `Tests  2 failed | 13 passed (15)`. The failing set changes between runs on both branches, so the spec is timing-flaky and already failing on `staging`. PR #208's body also lists a VeeForm failure that was already there. A CSS-only diff cannot change jsdom form logic.

`npm run build`:
```
✓ built in 5.67s
```
Compiled CSS contains the class: `grep -c "form-select" dist/assets/index-BV1yHvIc.css` → `1`.

Manual observation (Playwright on the `npm run dev` tab, not an automated test): a `<select class="form-select form-select-sm w-auto">` was injected into the login page and its computed style read at each theme:
```
dark:  { scheme: "dark",  bg: "rgb(33, 37, 41)",   color: "rgb(222, 226, 230)", border: "rgb(73, 80, 87)" }
light: { scheme: "light", bg: "rgb(255, 255, 255)", color: "rgb(33, 37, 41)",    border: "rgb(222, 226, 230)" }
```
Screenshot `.playwright-mcp/shots/212-dark.png` (local, gitignored via `.git/info/exclude`) shows a dark select with light text. Before the fix, the prod screenshots `vp-ats-1440.png` and `vp-preview-1440.png` show a white select with near-white text. The real pages weren't checked on the dev server because the dev tab isn't logged in; only the class was tested in isolation.

## Acceptance
| Criterion | Evidence |
|---|---|
| Select readable in dark mode (bg dark, text light) | computed `dark: bg rgb(33, 37, 41), color rgb(222, 226, 230)` above |
| Light mode unchanged-looking (white bg, dark text) | computed `light: bg rgb(255, 255, 255), color rgb(33, 37, 41)` |
| Class survives Tailwind purge | `grep -c "form-select" dist/assets/index-BV1yHvIc.css` → `1` + safelist entries |
| Build green | `✓ built in 5.67s` |
| Tests: no new failure | Only `VeeForm.spec.ts` fails, and it also fails on clean `origin/staging` (output above) |
| Comments per code-comments.md | One `/* */` above `.form-select` explaining WHY the native arrow is kept and why `color-scheme` matters. No issue refs, no narration. The outdated "Skipped" comment was corrected rather than left wrong. |

## Noticed, not done
- `VeeForm.spec.ts` is flaky / failing on `staging` (different tests fail each run). Needs its own issue.
- `color-scheme` also makes other native controls (scrollbars, date/number inputs, checkbox) follow dark mode. This is intended (DESIGN.md §2.1 sets `color-scheme` per theme), but it is visible beyond selects.
- Focus color `#0d6efd40` (Bootstrap blue) is copied from `.form-control` for consistency; the token rework is #216.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.
