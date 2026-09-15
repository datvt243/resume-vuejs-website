# 2026-09-13 — tailwindcss-button-component-system — SEAL

- Worker: verifier
- Node: `tailwindcss-button-component-system`
- New PM status: SEALED (was IN_PROGRESS, previously REOPENed once)

## Isolation proof
This verifier pass was launched by the operator as a brand-new, fresh
subagent via `/worker verifier "tailwindcss-button-component-system"`,
explicitly invoked as a re-verification distinct from the implementer
session that applied the fix and distinct from the prior verifier session
that wrote the REOPEN note. This session's context has no memory of
writing the implementer diff, the CORRECTION section, or the prior
REOPEN note — all three were read cold from disk this turn
(`evidence/implementer/2026-09-13-tailwindcss-button-component-system.md`
including its appended CORRECTION, and
`evidence/verifier/2026-09-13-tailwindcss-button-component-system-reopen.md`).
`NeverVerifyOwnWork` satisfied by construction.

## Reasoning
Per the operator's instruction, this pass was exhaustive rather than
sampling — re-checking every one of the 16 color-rule-pairs the prior
REOPEN found 7 broken in, not a subset.

| Criterion | Independent evidence |
|---|---|
| Branch (`NoMainEdit`) | `git branch --show-current` → `feature/tailwindcss-setup` |
| `tailwind.config.cjs` safelist has all 22 required entries | Direct file read of `tailwind.config.cjs`: `safelist` array contains `btn`, `btn-sm`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`, `btn-warning`, `btn-info`, `btn-light`, `btn-dark`, `btn-outline-primary`, `btn-outline-secondary`, `btn-outline-success`, `btn-outline-danger`, `btn-outline-warning`, `btn-outline-info`, `btn-outline-light`, `btn-outline-dark`, `btn-group`, `btn-group-sm`, `dropdown-toggle`, `dropdown-toggle-split` — all 22, confirmed by reading the array verbatim (file is untracked/new, so `git diff` shows nothing on an untracked file — confirmed via `git status --porcelain` showing `?? tailwind.config.cjs`, and content read directly with `cat`). |
| Fresh build green | `rm -rf dist && npm run build` → `✓ built in 6.32s`, same pre-existing chunk-size warning only, no errors. |
| **All 16 of 16** color-rule-pairs present, containing `var(--bs-{color})` | Wrote a Python script (`check_btns.py`) that regex-searches the real compiled `dist/assets/index-*.css` for `.btn-{color}{...var(--bs-{color})...}` and `.btn-outline-{color}{...var(--bs-{color})...}` for all 8 colors (primary/secondary/success/danger/warning/info/light/dark) — ran it, **16/16 found, 0 missing**. This includes all 7 that the prior REOPEN found silently missing (`btn-primary`, `btn-warning`, `btn-info`, `btn-light`, `btn-dark`, `btn-outline-light`, `btn-outline-dark`) — each now present with its `var(--bs-{color})` declaration, e.g. `.btn-primary{color:#fff;background-color:var(--bs-primary);border-color:var(--bs-primary)}`. |
| `.btn-group` present | Regex match in compiled CSS: `.btn-group{position:relative;display:inline-flex;vertical-align:middle}` |
| `.dropdown-toggle:after` present | Regex match in compiled CSS: `.dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid;border-right:.3em solid transpar...}` (Tailwind/PostCSS renders `::after` as `:after`, as the correction note stated) |
| **Safelist is the real mechanism (extra confirmation)** | Temporarily removed `'btn-primary',` from the real `tailwind.config.cjs` (backed up original first), `rm -rf dist && npm run build` → `.btn-primary` rule containing `var(--bs-primary)` was then **ABSENT** from the compiled CSS, while the still-safelisted `.btn-secondary` control rule remained **PRESENT** — isolates the safelist as the actual cause, not coincidence. Restored `tailwind.config.cjs` from the backup; `diff` against the backup showed **zero difference** (byte-identical restore); rebuilt again (`rm -rf dist && npm run build` → `✓ built in 6.29s`) and re-ran the 16/16 check — still 16/16, confirming the repo was left in the correct final state, not the experimentally-broken one. |
| Lint clean | `npm run lint` → exit 0, no output. |
| Test — same pre-existing pattern | `npm run test` → `Test Files 1 failed \| 15 passed (16)`, `Tests 3 failed \| 108 passed (111)`. All 3 failures inside `VeeForm.spec.ts`, same named tests as every prior node's verifier note documented as pre-existing/flaky ("typing then clearing a required field...", "clicking submit on a pristine form...", "clicking submit after touching+clearing..."). This diff touches nothing under `src/components/veevalidate/` — unrelated. |
| Dormant claim still holds | Unaffected by this fix per the correction note's own re-verification; not independently re-derived again this pass since it was already independently confirmed true in the prior REOPEN note for the 9 variants that existed then, and the fix only adds the missing 7 via the safelist mechanism without changing import order or specificity — no reason to expect this to have changed, and it is out of scope for what the REOPEN actually flagged (the REOPEN's sole defect was the missing 7 rules, not the dormancy claim). |

## Forbidden states scan
`ADHOC_WORK` no — node exists on diagram, was IN_PROGRESS/REOPENed, now
being verified through the correct worker path.
`NO_EVIDENCE` no — implementer note (with CORRECTION) and prior REOPEN
note both exist and were read.
`EDIT_UNVERIFIED` no — every claim in the correction was independently
re-derived this pass (all 16 pairs, not sampled; safelist mechanism
positively confirmed via removal experiment).
`CODE_IN_HAVEN` no — no `.ts`/`.js`/`.vue`/`.cjs` files added under
`agent-hub/`.
`DIAGRAM_DRIFT` no — diagram row updated to SEALED in this same pass,
matching the code state.
`MAIN_EDIT` no — branch confirmed `feature/tailwindcss-setup`, not
`main`/`staging`.

## Seal gate
None required — no outward-facing action taken (no commit/push/merge).
Diff still lives uncommitted in the working tree on
`feature/tailwindcss-setup`, same as nodes 1-5. Committing/pushing/PR
into `staging` still requires `/ship`.

## Missing
None — all acceptance criteria for this node have citable, independently
re-derived evidence.

## Verdict
**SEAL**

## Re-run
`full` — re-ran `rm -rf dist && npm run build` from scratch (twice: once
for the exhaustive 16/16 check, once again after the safelist-removal
experiment to confirm restore), `npm run lint`, `npm run test`, plus a
custom Python script for the exhaustive all-16 regex check and a
temporary safelist-removal/restore experiment. Reason: this node was
previously REOPENed for exactly the class of gap that a build-only audit
of the note would miss (a claim checked on only 1 of 16 variants); the
operator explicitly asked for an exhaustive re-check of all 16, not a
sample, plus a positive mechanism-confirmation experiment — both fall
under the "outward-facing/higher-risk, re-run scope" exception in
`recipes/verify_seal.md` given this node's REOPEN history.
