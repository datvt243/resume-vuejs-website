# 2026-10-19 - fix-header-user-menu-style-prop - REOPEN

- Worker: verifier 0.1.0
- Node: `fix-header-user-menu-style-prop` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-218-global-components.md` (section "Regression node")
- Verdict: **REOPEN**

## Isolation proof
Same fresh subagent spawn as the #218 verdict (Agent tool, task "verifier \"agent-hub/evidence/implementer/2026-10-19-issue-218-global-components.md\"", told "You did NOT write this diff"). Verdict reached independently from this node's own evidence.

## Re-run
none (audit + read-only grep of `Dropdown` callers).

## Cited
- Header user menu: Vue warn gone, `userBtn` classes `btn btn-outline-secondary` after cache clear; Header.vue:120 passes `variant="outline-secondary"`.

## Missing
- Caller coverage. The note says "Header is the only `Dropdown` consumer". False: `src/pages/dashboard/PageReference.vue:98` has `<Dropdown text="" :style="'outline-success border-0'" split>` (live template, row-control menu in the references table). The prop was renamed `style` → `variant`, so this caller now gets the default `btn-primary` toggle instead of `outline-success border-0`, and the string falls through as an invalid inline `style`. Same bug class as the Header case (the note itself says a literal `:style` is parsed the same way). No browser/test evidence for this page.

## Fix to resubmit
Change PageReference.vue:98 to `variant="outline-success"` (and decide where `border-0` goes, e.g. `btn-size`/class), check the references-table dropdown in the browser (no Vue warn, expected classes), update the note's caller claim.

## Forbidden states
`EDIT_UNVERIFIED` (a caller of the changed prop has no evidence). Branch non-main; no outward action.
