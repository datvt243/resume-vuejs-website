# 2026-11-05 - issue-399-form-lang-sync - SEAL
Worker: verifier · Node: `issue-399-form-lang-sync` (haven/diagrams/dev-loop.prime-mermaid.md) · New PM status: SEALED

## Isolation proof
Fresh subagent spawned with its own task string "act as the agent-hub VERIFIER ... You did not write the diff under review, so NeverVerifyOwnWork is satisfied by construction" (run `/worker verifier` flow by hand, note `evidence/implementer/2026-11-05/issue-399-form-lang-sync-plan.md`); this context holds none of the implementer pass's reasoning, only the note.

## Reasoning
- Branch (NoMainEdit): `feature/issue-399-form-lang-sync` off `staging` @ 8c637e4 — not main/staging. Current checkout matches.
- Commands vs doctrine/MEMORY.md: `npm run test`, `npm run build`, `npm run lint`, `npm run typecheck` + single-file `npx vitest run` — all exact doctrine rows.
- Typecheck baseline: cited 90 `error TS` (baseline 90, not above); grep for `useFormLang|VeeForm` in typecheck output → no lines (none in changed files).
- Output not truncated: concrete lines cited (`Tests  353 passed (353)`, `Test Files  55 passed (55)`, `Tests  20 passed (20)`, `✓ built in 4.42s`, `lint exit 0`).
- (1) shared state across forms / survives route change: new spec test (EN in form 1 → unmount → form 2 mounts EN `aria-checked="true"`) in the 20/20 pass; live step 2: Education edit opened on EN after picking EN on Information (`en:true`).
- (2) more prominent selected lang with DESIGN.md tokens, aria-checked + `!` kept: `bg-accent-subtle font-semibold text-accent` tokens; §10 raw-value grep exit=1; computed styles dark + light cited (light #047857 on #ecfdf5 ≈ 5.2:1); existing `flags the hidden language that has a validation error` + aria-checked assertions still pass.
- (3) header UI-language switch untouched: diff lists only useFormLang.ts (new), VeeForm.vue, VeeForm.spec.ts; `git diff --stat` in this checkout confirms only those src files (+ the diagram row).
- Comments per code-comments.md: row present (header + one why-line, no issue refs inline).
- Supersedes / Still open: `none` / `none`; no other non-SEALED #399 row on the active diagram.
- Forbidden states: ADHOC_WORK no (node exists), NO_EVIDENCE no, EDIT_UNVERIFIED no, CODE_IN_HAVEN no, DIAGRAM_DRIFT no (row present, now SEALED), MAIN_EDIT no.
- Seal gate: none needed (no commit/push).
- Proportionality: 3 files, +20/-3 — matches node scope; persistence across reload deliberately not added (listed under Noticed).

## Re-run
none — note is verbatim, commands match doctrine, criteria all cited; not outward-facing, not a release gate.

## Note for /ship
Untracked `.claude/commands/issue-create.md` is in the working tree but not part of this node — keep it out of the #399 commit.
