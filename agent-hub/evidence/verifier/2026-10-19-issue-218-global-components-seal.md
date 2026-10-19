# 2026-10-19 - issue-218-global-components - SEAL

- Worker: verifier 0.1.0
- Node: `issue-218-global-components` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-218-global-components.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a separate fresh subagent by the implementer session via the Agent tool, task "verifier \"agent-hub/evidence/implementer/2026-10-19-issue-218-global-components.md\"", with explicit instruction "You did NOT write this diff" and a two-node verdict request. This context has no memory of writing the diff.

## Re-run
none (audit-only; output verbatim, commands match doctrine/MEMORY.md, every criterion cited; not outward-facing). Only read-only greps run (Button/Dropdown callers).

## Cited
- Commands match doctrine: `npm run lint`, `npm run test`, `npm run build` from repo root; Typecheck explicitly CANNOT RUN.
- Lint exit 0; build `✓ built in 3.45s`.
- Tests 1 failed / 230 passed (231 = 228 + 3 new); the failure is `VeeForm.spec.ts > VI | EN toggle`, pre-existing per sealed #216. Toasts.spec 8/8, Modal.spec 14/14.
- Each acceptance row cited: Heading level/description/actions + `.heading` rule removed; Button 4 variants/sizes/icon-only aria-label via `button.lib.js`; NoData §5.8 live; Box card class live; Toasts bottom-right/polite/4s/button close + spec; Modal focus trap + return focus (spec + live 60x Tab, Esc), radius 12px, `data-bs-dismiss="modal"` kept; ListTransition opacity/transform under reduced-motion query, `_transition.scss` deleted as unimported (issue names it); GroupTags `<button aria-label>`; swal/datepicker on tokens (built CSS cited), confirmDelete "Xóa … này?"/"Xóa"/"Hủy" with danger confirm (live); screenshots 1440 light/dark + 375 dark listed.
- Comments per code-comments.md: WHY comments listed, no issue refs.
- §10 grep on added lines: only §5.3's own `disabled:opacity-50`.
- Read-only grep: no `<Button type="submit|button|reset|outline-*">` left after `type` became the variant prop.

## Missing
none

## Forbidden states
None hit. Branch `feature/issue-218-global-components` (non-main) → no MAIN_EDIT. Seal gate: no commit/push/API call (swal cancelled).

## Proportionality
16 consumer migrations are forced by the Button prop change; PageAccountSettings override removal is needed for Box to take effect; swal `html`→`text` is rendering. Out-of-scope items (danger contrast, entity titles, openModalCount, modal size, VeeForm buttons) listed under "Noticed, not done". The Dropdown fix belongs to the separate node `fix-header-user-menu-style-prop` (verdict REOPEN, own note).
