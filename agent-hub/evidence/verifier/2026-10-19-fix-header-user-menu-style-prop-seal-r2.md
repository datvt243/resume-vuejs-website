# 2026-10-19 - fix-header-user-menu-style-prop - SEAL (round 2)

- Worker: verifier 0.1.0
- Node: `fix-header-user-menu-style-prop` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-fix-header-user-menu-style-prop-r2.md` (round 2), against `evidence/verifier/2026-10-19-fix-header-user-menu-style-prop-reopen.md`
- Verdict: **SEAL**

## Isolation proof
A fresh subagent spawned by the implementer session (Agent tool, task "verifier \"agent-hub/evidence/implementer/2026-10-19-fix-header-user-menu-style-prop-r2.md\"", told "You did NOT write this diff"). This context did not write the diff. It is also a different spawn from the round-1 verifier that issued the REOPEN.

## Re-run
none: audit-only. The only extra checks were read-only greps for `Dropdown` callers (PascalCase, kebab-case, pug, render-fn). They match the note's list exactly: `Header.vue:120` and `PageReference.vue:98`, both on `variant`, and no caller still passes `style`.

## REOPEN points: resolution
| REOPEN point | Resolved by |
|---|---|
| `PageReference.vue:98` still on `:style` | Now `variant="outline-success border-0"`, shown in the note's diff table and in the dev-server compiled template (`variant: "outline-success border-0"`). |
| Where `border-0` goes | Kept inside `variant`. The note explains that `btn-${variant}` puts it on both buttons as the original author intended. |
| No rendering evidence for this caller | New Dropdown test: text button `btn btn-outline-success border-0`, caret `dropdown-toggle-split btn-outline-success border-0`, no inline `style`. 9/9 pass. A live check was not possible because the account has 0 references and creating one would be a real API write. The note states this honestly, and the unit test covers the rendered classes. |
| Note's "only consumer" claim false | Corrected: caller list shows 2 callers, and the note explains how round 1 missed the second. |

## Commands (vs doctrine/MEMORY.md)
`npm run lint` exit 0; `npm run test` 231/232, and the single failure is the pre-existing `VeeForm.spec.ts` VI|EN failure, the same one recorded in round 1 (230/231 + 1 new test). `npm run build` ✓; Typecheck stated as CANNOT RUN. Output is not truncated.

## Comments per code-comments.md
No comments were added or changed in round 2. The `Dropdown.vue:23` why-comment comes from round 1.

## Forbidden states
None. Branch `feature/issue-218-global-components` (not main). No outward action, so the seal gate does not apply. Proportional: 1 caller line + 1 test.
