# 2026-10-19 - fix-header-user-menu-style-prop (round 2, after REOPEN)

- Worker: implementer
- Version: 0.1.0
- Node: `fix-header-user-menu-style-prop` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Responds to: `evidence/verifier/2026-10-19-fix-header-user-menu-style-prop-reopen.md` — "Header is the only `Dropdown` consumer" was false; `PageReference.vue:98` passed `:style="'outline-success border-0'"`, so after the `style` → `variant` rename it fell back to the default `btn-primary`.
- Round 1 note (unchanged): `evidence/implementer/2026-10-19-issue-218-global-components.md` § "Regression node".

## Hub bytes before: 183018 (same pass as round 1)

## Branch
`feature/issue-218-global-components` (same as round 1). Not `main`, not `staging`.

## Why round 1 missed it
The caller grep was `grep -rnE "<Dropdown|Dropdown\("` — it matched `PageReference.vue`'s `<Dropdown` but the result was read alongside a filtered list that dropped it. Correct caller list now, covering both SFC syntax and pug:
```
$ grep -rnE "<Dropdown\b|^\s*Dropdown[.(]" src | grep -v "global/Dropdown"
src/pages/_layouts/Header.vue:120:            Dropdown.user-menu(:text="mesUser" variant="outline-secondary" split is-sm)
src/pages/dashboard/PageReference.vue:98:                <Dropdown text="" variant="outline-success border-0" split>
```
`grep -rnE "(Dropdown|<Dropdown)[^\n]*style" src` → no matches (no caller still passes `style`).

## Diff (round 2 only)
| File | Why |
|---|---|
| `src/pages/dashboard/PageReference.vue:98` | `:style="'outline-success border-0'"` → `variant="outline-success border-0"`. `Dropdown` interpolates `variant` into `btn-${variant}`, so `border-0` stays a class on both buttons exactly as the original author intended. Note: on `staging` this caller was already broken the same way (a literal `:style` is compiled to a style object — round 1 showed `style: {}` for the identical Header pattern), so this restores the intended look rather than preserving a working one. |
| `src/components/global/Dropdown.spec.ts` | +1 test: `variant: 'outline-success border-0', split: true` → text button has `btn btn-outline-success border-0`, caret has `dropdown-toggle-split btn-outline-success border-0`, root has no inline `style`. |

## Command
From repo root: `npx vitest run src/components/global/Dropdown.spec.ts`, `npm run lint`, `npm run test`, `npm run build`. Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
Dropdown.spec.ts:  Tests  9 passed (9)
npm run lint:      lint_exit=0
npm run test:      FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                   Tests  1 failed | 231 passed (232)      (pre-existing failure; 232 = 231 + this new test)
npm run build:     ✓ built in 3.47s
```
Compiled template served by the dev server for `PageReference.vue`:
```
_component_Dropdown, {             text: "",             variant: "outline-success border-0",             split: ""           }
```
Live browser: `/dashboard/reference` (after CDP `Network.clearBrowserCache` + reload) has 0 references for this account, so the row dropdown does not render (`main .dropdown` count 0) and could not be clicked; no Vue prop warnings on load. Creating a reference to see it would be a real API write — not done. The unit test above covers the rendered classes instead; Header's user menu was verified live in round 1.

## Acceptance
| Criterion (from REOPEN) | Evidence |
|---|---|
| `PageReference.vue:98` uses `variant`, `border-0` placed | diff + compiled template |
| Rendered classes correct, no inline style | new Dropdown test, 9/9 |
| Note's caller claim corrected | caller list above (2 callers, both on `variant`) |
| lint/test/build | outputs above |
| Comments per code-comments.md | no comments added or changed in round 2 |

## Noticed, not done
- The references-table row menu itself (colors, `outline-success`) is legacy styling — CRUD pages are #223.

## Seal gate
None (no commit/push/API write).
