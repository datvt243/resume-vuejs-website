# 2026-10-21 - issue-266-i18n-phase1-shared-auth - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-266-i18n-phase1-shared-auth` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence reviewed: `evidence/implementer/2026-10-21-issue-266-i18n-phase1-shared-auth.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh subagent with the task string "verifier \"#266 [BUG] Một số text không chuyển theo ngôn ngữ (i18n) — phase 1 (shared components, dialogs, form parts, services toasts, auth pages) — evidence note: agent-hub/evidence/implementer/2026-10-21-issue-266-i18n-phase1-shared-auth.md (node issue-266-i18n-phase1-shared-auth, branch fix/issue-266-i18n-missing-text)\"". This context has no implementer history and did not write the diff; the diff was not opened (EvidenceOnly).

## Re-run
none (audit only). The note gives verbatim summary lines with no `...`/"truncated", uses the doctrine commands, and covers every criterion. Not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root; Typecheck declared "CANNOT RUN — pending add-typecheck-script". OK |
| Output not truncated | Failure excerpt plus verbatim summary lines (`Tests 1 failed \| 255 passed (256)`, `✓ built in 4.14s`, lint output ends with nothing after the eslint command). OK |
| Branch (NoMainEdit) | `fix/issue-266-i18n-missing-text`, cut from `staging` `1f8cce6`. OK |
| Seal gate | No commit/push/API write; manual check only rendered `#/login`, no submit. N/A |
| Proportionality | 32 files, all inside the operator-approved P1 scope (shared components, dialogs, form parts, services toasts, auth pages). Pre-existing `FrmCurrency.vue:73` `getPlaceholder` bug and the dead `PageRegister.vue` comment block are recorded under "Noticed, not done", not fixed. The Register/Reset yup default-English messages moved to keys, which is in scope because they are auth-page UI text. OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| P1 files have no hardcoded VI UI text | Re-measure with the baseline audit: 476 lines in 38 files (was 568/64); the only P1 hits left are `PageRegister.vue:27-37`, inside a `/* */` block (dead code) |
| Text follows the header VI/EN switch | Playwright on `#/login`: full VI and EN readings of h1, labels, placeholder, validation error, submit, link, `<html lang>`, show-password aria-label; the error already on screen switched without re-validation. New `tr` spec passes |
| VI default unchanged | VI-asserting specs (Toasts, Modal, LoadingGate, VeeForm*, i18n) pass |
| No regressions | `1 failed \| 255 passed (256)` vs staging baseline `1 failed \| 254 passed (255)`. The one failure (`VeeForm.spec.ts > VI \| EN toggle > flags the hidden language…`) is the known pre-existing one, also cited in the issue-262 and issue-251 verifier notes. Build green, lint clean |
| Comments per code-comments.md | 2 added in `i18n/index.ts` (why `t` is exported; one-line JSDoc on `tr`), no issue refs |

## Forbidden states
None hit (MAIN_EDIT, NO_EVIDENCE, EDIT_UNVERIFIED, seal-gate bypass, etc. all clear).

## Missing
None. Phases P2 to P4 remain open on #266 as separate nodes.
