# 2026-11-15 - issue-420-auth-form-fixes - SEAL

Worker: verifier · Version: 0.1.0 · Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-420-auth-form-fixes`
Note audited: `evidence/implementer/2026-11-15/issue-420-auth-form-fixes-plan.md`
Branch: `fix/issue-420-auth-form-fixes` (dedicated, not main/staging) — `NoMainEdit` ok.

## Isolation proof
Launched via the Agent tool (general-purpose, blank context) by the main /todo session (pass 2) on 2026-11-15 with the prompt "act as the agent-hub VERIFIER ... You did not write this diff"; spawn=fresh. This context holds no implement-pass reasoning; it did not write the diff.

## Re-run
none — note's outputs are cited, commands match `doctrine/MEMORY.md`, not an outward-facing node.

## Criteria
| Criterion | Cited evidence | OK |
|---|---|---|
| #420 register submit-fn returns the promise | Diff row `PageRegister.vue` (arrow returns `handleRegister(...)`); VeeForm awaiting `submitFn` covered by `VeeForm.spec.ts`; real submit not live-checked (prod write) — stated | yes |
| #422 register/forgot/reset use login's extraction | `auth.spec.ts` "%s shows the reason from the new API envelope" ×3 + empty-message/non-API fallback tests, `Tests 11 passed (11)` | yes |
| #425 email trimmed, passwords not | `auth.spec.ts` "trims the email but not the passwords"; yup `.trim()` reachability confirmed in node (`isValidSync` false → true) | yes |
| #429 no token → no form, invalid text + Back to login | Live check: `#/reset-password` forms 0 + link to `#/login`; repeated `?token=` forms 0; `?token=abc` forms 1 | yes |
| #429 forgot vi+en no-email note | Live check row (vi text); `en` value cited from `src/i18n/index.ts` | yes |
| Feature docs auth-login #8, auth-password-reset #1/#3/#4/#6 | Read both docs: Behavior text matches the diff; `## Feature doc changed` backed by recorded operator answers (login OQ 2-3, reset OQ 1-3, 2026-11-07) | yes |
| test / build / lint | `Tests 370 passed (370)`, `✓ built in 3.88s`, `lint=0` | yes |
| Typecheck (baseline ≤ 90) | `78` (staging 81); `services/auth.ts` 14 vs 17 on stashed staging — pre-existing, none added; precedent `evidence/verifier/2026-11-02/issue-375-delete-all-visits-seal.md` (pre-existing hit in touched file also on clean tree accepted) | yes |
| Comments per code-comments.md | 3 one-line WHY comments, no issue refs / WHAT comments | yes |
| Supersedes / Still open | `none` / `none` lines present | yes |

## Checks
- Feature doc line: present. Review: `/code-review medium`, 7 findings, each fixed or given a stated reason; not `security`-labeled.
- Doctrine proposal: none.
- Forbidden states: none hit. Seal gate: n/a (no commit/push/real API write).
- Proportionality: i18n copy edits (`forgotDescription`, `resetInvalidLink`) and yup `.trim()` are justified by review findings tied to #429/#425 — in scope.
- Output: summarized lines but no `...`/truncation of command output; the `…` in the live-check row abbreviates quoted page text only.

## Verdict: SEAL
Feature doc statuses unchanged (fix SEAL; both already `verified`). PR body must also close #422 #425 #429 (per note).
