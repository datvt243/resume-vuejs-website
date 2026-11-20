# Analyst spec — #489 typed `delete` confirm (umbrella for #431, #439, #456)

## Task (verbatim)
Title: Typed `delete` confirmation for account delete, skill-group delete, visits delete-all
Body: Umbrella for three issues that ask for the same thing: reuse the typed `delete` confirmation that single-skill delete already uses.
- Closes #431 — Account delete (/dashboard/account-settings, before DELETE api/v1/candidate). Decided by operator while confirming agent-hub/doctrine/features/account-settings.md.
- Closes #439 — Skills: delete a whole group (and every skill in it). Decided while confirming agent-hub/doctrine/features/cv-skills.md.
- Closes #456 — Visits: "Delete all" on /dashboard/visits hard-deletes every visit (no undo). Decided while confirming agent-hub/doctrine/features/cv-visits.md.
Expected: each of these three dialogs requires typing `delete` before the request is sent, using the same shared confirm as single-skill delete.

## Doc
No new doc — three existing feature docs updated (Behavior sub-item marked "spec complete, not yet implemented/sealed", acceptance criteria, changelog row); INDEX rows got #489.
- `doctrine/features/account-settings.md` (Behavior #4, AC, Out of scope)
- `doctrine/features/cv-skills.md` (Behavior #4 Delete group, AC)
- `doctrine/features/cv-visits.md` (Behavior #10, AC)
Docs keep `Status: verified` for the confirmed backfill; the new items are flagged draft inline (invariant 7).

## Sources read
- agent-hub/doctrine/domains/PROJECT.md (Invariants), doctrine/MEMORY.md (test commands), doctrine/features/INDEX.md + the three docs
- src/lib/swal.lib.js (`confirmDelete` — no input today)
- src/components/veevalidate/VeeFormGeneralInformationUpdate.vue:100-120 (the single-skill typed confirm: inline `Swal.fire`, `input: 'text'`, `inputValidator` exact `'delete'`) + its spec lines 52-55
- src/pages/dashboard/PageAccountSettings.vue:71-81, PageSkills.vue:76-92, PageVisits.vue:35-45 (all three call `confirmDelete`)
- src/pages/dashboard/PageVisits.spec.ts:155-195 (mocks `confirmDelete`, asserts text contains `vĩnh viễn`)
- src/i18n/index.ts (`confirm.typeDelete`, `confirm.typeDeletePlaceholder`, `generalInfo.deleteGroup*`, `visits.deleteAllText`, `account.deleteConfirmText` exist in vi + en)
- DESIGN.md §4.4 (delete confirm asks a specific question)

## Findings
- The "shared confirm" the issue names does not exist yet: single-skill delete inlines its own `Swal.fire`. The spec requires one shared typed confirm used by all four dialogs (how — extend `confirmDelete` or a new helper — is the implementer's call).
- No `PageAccountSettings.spec.ts` exists; AC asks for one (or coverage via the shared confirm's spec).

## Questions + answers
None open. All three behavior choices were already answered by the operator on 2026-11-07 (account-settings Q1, cv-skills Q3 + Q4 English word, cv-visits Q4). Decided without asking, as the non-change default: the existing specific titles and warning texts stay (confirmed Behavior, DESIGN §4.4, existing spec assertion); validation is the existing exact, case-sensitive, untrimmed match. Outcome: spec_ready.

## Isolation proof
Blank-context analyst subagent; got only the issue text and the repo on branch feature/typed-delete-confirm (clean, no diff). No implementer reasoning or diff seen.
