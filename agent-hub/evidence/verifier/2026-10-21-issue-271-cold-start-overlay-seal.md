# 2026-10-21 - issue-271-cold-start-overlay - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-271-cold-start-overlay` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence reviewed: `evidence/implementer/2026-10-21-issue-271-cold-start-overlay.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh subagent with the task string "verifier \"#271 [ENHANCEMENT] Cold start: show a full-screen loading overlay and block interaction — evidence note: agent-hub/evidence/implementer/2026-10-21-issue-271-cold-start-overlay.md (node issue-271-cold-start-overlay, branch feature/issue-271-cold-start-overlay)\"", resumed once by the coordinator after a rate-limit cut-off. This context has no implementer history and did not write the diff; the diff was not opened (EvidenceOnly).

## Re-run
none (audit only). The note gives verbatim summary lines with no `...`/"truncated", uses the doctrine commands, and covers every criterion. Not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npx vitest run src/components/Spinner.spec.ts`, `npm run test`, `npm run build`, `npm run lint` from repo root; Typecheck declared "CANNOT RUN — pending add-typecheck-script". OK |
| Output not truncated | Verbatim summary lines (`Tests 6 passed (6)`, `Tests 1 failed \| 256 passed (257)`, `✓ built in 3.65s`, lint output ends at the eslint command). OK |
| Branch (NoMainEdit) | `feature/issue-271-cold-start-overlay`, cut from `staging` `44c5509`. OK |
| Seal gate | No commit/push/API write. N/A |
| Proportionality | 4 files: `Spinner.vue`, `App.vue` (`inert`), `Spinner.spec.ts`, `DESIGN.md` §5.9 exception. All inside the node's stated scope; the DESIGN.md edit is needed so the rule doesn't contradict the requested behaviour. Modal Tab-reach and Toasts outside `inert` recorded under "Noticed, not done", not fixed. OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| Full-screen loading during the cold-start notice | Playwright at 3.5s: `cold-start` class, overlay rect `1495×935` = viewport, `bg: rgba(0, 0, 0, 0.5)`, countdown notice text shown |
| No interaction while shown (mouse + keyboard) | `hitIsOverlay: true` over `#email`, `focusBlocked: true`, app root `inert: true` |
| Released when the request ends | After `hide()`: overlay gone, `inert: false`, `canFocus: true`; spec asserts `isColdStart=false` after `hide()` |
| Short requests unchanged | Playwright at 0.5s: no `cold-start`, `inert: false`; spec at 2s |
| No regressions | `1 failed \| 256 passed (257)` vs issue-266 seal baseline `1 failed \| 255 passed (256)` (+1 = new test). The one failure (`VeeForm > VI \| EN toggle > flags the hidden language…`) is the known pre-existing one, also cited in the issue-266/262/251 verifier notes. Build green, lint clean |
| Comments per code-comments.md | 2 `//` WHY comments (expose of `isColdStart`, `.cold-start` CSS block), header/CSS comment corrected, no issue refs |

## Forbidden states
None hit (MAIN_EDIT, NO_EVIDENCE, EDIT_UNVERIFIED, seal-gate bypass, etc. all clear).

## Missing
None.
