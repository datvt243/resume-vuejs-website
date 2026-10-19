# 2026-10-19 - issue-222-forms - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-222-forms` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-222-forms.md`

## Verdict
SEAL

## Isolation proof
Spawned as a separate subagent by the implementer session for GitHub issue #222 (branch `feature/issue-222-forms`, already checked out); I did not write the diff. Task string: "You are a fresh verifier for the resume-vuejs-website agent-hub. ... Invoke the Skill tool with skill \"worker\" and args: verifier \"agent-hub/evidence/implementer/2026-10-19-issue-222-forms.md\" ...". This context has no memory of editing `VeeForm.vue`, `Frm*.vue`, `FormSection.vue` or the dashboard pages.

## Re-run
none — audit-only; commands match `doctrine/MEMORY.md`, outputs not truncated, node not outward-facing (no commit/push/deploy).

## Cited
- Commands match doctrine: `npx vitest run src/components/veevalidate`, `npm run lint`, `npm run test`, `npm run build` from repo root; Typecheck explicitly "CANNOT RUN — pending add-typecheck-script".
- Lint `lint_exit=0`; build `✓ built in 3.61s` (final run after every edit incl. the invalid-focus CSS fix); veevalidate 18/19; full test `1 failed | 239 passed (240)`, sole failure `VeeForm.spec.ts > VI | EN toggle` — same pre-existing failure as the #220/#221 seals (238 + 2 new = 240).
- Stripe `lg:grid-cols-3` + title/description + card, `max-w-4xl`: new `FormSection.vue`; live section lists on all three pages; screenshots.
- Label `text-sm font-medium`, help `text-xs text-fg-3`, input `h-8`: CSS diff on shared legacy classes; live 13px/500/opacity 1, input 32px (was 0.75 / 38px).
- Error `border-danger` + icon message + `aria-invalid`/`aria-describedby`: live error state on "Tên", focused-invalid border bug found and fixed (rgb(220,38,38)).
- Sticky action bar, Hủy ghost + Lưu primary, spinner while submitting, centered button gone: live footer (sticky, flex-end, [Hủy, Lưu thay đổi]); real "Hủy" click restores "Tấn Đạt"; spec test for disabled + `aria-busy` while pending.
- `btn-success` spec queries fixed: 8 selectors → `button[data-submit]` (issue said 9; note explains one was `:not([data-lang])` variant), grep shows none left.
- type/autocomplete/inputmode: live attribute dump; `defaultPhone` deliberately no autocomplete (reused for references' numbers) — reasoned.
- PageInformation: "Chọn ảnh" disabled + "Sắp ra mắt", "chờ backend" text false, selects labelled + 32px, 375 scrollWidth 375 (/general-information 418 → 360 via GroupTags wrap); §10 grep `grep_exit=1`.
- PageAccountSettings: live `h6` count 0, label class instead.
- Presentation only: API/stores/composables/routing/yup untouched; `data-lang` kept, `data-submit` added.
- Comments per code-comments.md: row present, WHY-only comments listed, no new issue refs.
- Screenshots before/after × 1440 light/dark + 375 dark listed (local, gitignored).

## Missing
none

## Forbidden states
None hit. Branch `feature/issue-222-forms` (non-main, cut from `staging`) → no MAIN_EDIT. Implementer left row IN_PROGRESS (no self-SEAL). Note present (no NO_EVIDENCE). Diagram row updated in place (no DIAGRAM_DRIFT).

## Seal gate
No outward action in this pass (no commit/push/merge, "Hủy" only resets local form state). Ship via `/ship`.

## Proportionality
GroupTags wrap is the 375 overflow fix the issue asks for. Account-settings disabled "Đổi email"/"Đổi mật khẩu" + "Sắp ra mắt" replace the removed backend dev notes per §7. DESIGN.md one-line pointer to `FormSection` is required by §0.1.2 for new components. Dead avatar preview code removed only because the button became disabled. Validation-message copy ("how to fix") correctly left out under "no validation change" and disclosed.

## Observations (not blocking)
- Auth pages share VeeForm + restyled CSS but were not visually checked (disclosed; Phase 9 #224).
- `doctrine/MEMORY.md` Lint row still says "95 real errors" while every recent note reports `lint_exit=0` — stale doctrine, separate fix.
