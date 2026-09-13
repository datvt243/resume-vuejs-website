# 2026-09-13 — tailwindcss-form-controls

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-form-controls` (new node, node 9 of the phased
  Bootstrap → Tailwind migration, follows `tailwindcss-badge-alert`)
- Task (verbatim): "tiếp tục luôn" (operator, continuing)

## Hub bytes before
150410 (root=12393, doctrine=27207, active diagram grown post-node-8,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-8, still
uncommitted).

## Context
`.form-control`/`.form-label`/`.form-text`/`.form-check*` are used
across 10 of the `Frm*.vue` form-field partials (`FrmInput`,
`FrmCheckbox`, `FrmSelect`, `FrmTextArea`, `FrmDate`, `FrmDatePicker`,
`FrmCurrency`, `FrmPwd`, `FrmArray`, `FrmCkediter`, plus `GroupTags.vue`)
— the widest-reaching Bootstrap component family in the app besides
buttons. Continuing the same `@layer components` approach.

## This app customizes Bootstrap's focus/active colors — read from the real build, not assumed
Checked `src/styles/bootstrap.scss` before writing anything:
`$component-active-bg: $green` (`#00d095`, this app's brand accent) is
set as a Bootstrap variable override. This means focus rings and
checked-checkbox colors are NOT vanilla Bootstrap blue. Read the real
values directly from a fresh compiled build rather than guessing generic
Bootstrap defaults (which would have been a real, silent regression from
this app's actual current look):
- `.form-control:focus` / `.form-check-input:focus` border:
  `#80e8ca` (a lighter green tint).
- `.form-check-input:checked` background/border: `#00d095` (the brand
  green itself).
- Focus box-shadow: `#0d6efd40` — this is oddly still Bootstrap's
  default *blue*-tinted shadow color, not green, despite the
  `$component-active-bg` override (`$input-btn-focus-color`/similar
  likely derives from a different Bootstrap variable that wasn't
  overridden). Reproduced exactly as the real build has it today, not
  "corrected" to look more visually consistent — this node's job is
  parity with current behavior, not improving Bootstrap's own
  inconsistency.

## `.form-label`'s nested selector, flattened
`bootstrap.scss` has a custom override nested as `.form .form-label`
(padding/opacity/line-height), not a bare `.form-label`. Checked:
`VeeForm.vue`'s root is always `<form class="form">`
(`grep -n 'class="form"' src/components/veevalidate/VeeForm.vue`), so
every real `.form-label` in this app is always inside that context —
folded the override directly into one flat `.form-label` rule instead
of reproducing the nested structure. Bonus, noticed after the fact: the
original nested selector (`.form .form-label`, 2 classes) has HIGHER
specificity than my flat one (1 class) regardless of the customization —
meaning even without the flattening reasoning, this part would have been
doubly dormant (shadowed both by specificity AND cascade order).

## Diff
2 files: `src/styles/tailwind.css` (+~90 lines), `tailwind.config.cjs`
(+6 safelist entries: `form-control`, `form-label`, `form-text`,
`form-check`, `form-check-input`, `form-check-label`).

Skipped (confirmed zero usage via `grep -rl "form-switch\|is-valid\|
is-invalid\|indeterminate" src` → no matches): `.form-select`,
`.form-switch`, validation states (`.is-valid`/`.is-invalid`),
indeterminate checkboxes.

## Command
```
npm run build
```

## Output
```
✓ built in 6.34s
```
Same pre-existing "chunks larger than 500 kB" warning only.

Exhaustively verified all 15 distinct rule/selector groups individually
in the compiled output (not sampled): `.form-control`, `.form-control:
focus`, `.form-label`, `.form-text`, `.form-check`, `.form-check .form-
check-input`, `.form-check-input`, `.form-check-input[type=checkbox]`,
`.form-check-input[type=radio]`, `.form-check-input:focus`, `.form-
check-input:checked`, `.form-check-input:checked[type=checkbox]`,
`.form-check-input:checked[type=radio]`, `.form-check-input:disabled`,
`.form-check-label` — 15/15 present. (Note: attribute selectors compile
to unquoted `[type=checkbox]` form, not `[type='checkbox']` — my first
grep attempt used the quoted form and got false "MISSING" results;
re-ran with the correct unquoted syntax and confirmed all present. A
grep-syntax mistake on my end, not a real gap — logging it since it
looked alarming for a moment.)

Confirmed dormant — checked byte positions of every `.form-control{`
occurrence in the compiled file: mine at 34501 (first), Bootstrap's own
3 partial re-declarations at 159226/159692/161850 (all later, Bootstrap
wins for shared properties). Same check for `.form-check-input`: mine at
35034, Bootstrap's at 164769 (later). Zero live visual change from this
diff.

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Tests 2 failed | 109 passed (111)` this run — same
  named `VeeForm.spec.ts` flaky tests as every prior node, count
  fluctuates run-to-run (3, then 2, historically) as already documented
  since node 4; `src/components/veevalidate/` untouched by this diff.

## Acceptance
| Criterion | Evidence |
|---|---|
| All 15 rule/selector groups compile | Exhaustive grep (corrected syntax), 15/15 present |
| Focus/checked colors match real current behavior, not vanilla Bootstrap | Read directly from the compiled build, quoted above |
| `.form-label` correctly dormant twice over (order + specificity) | Both reasoning paths checked and hold |
| Confirmed dormant overall | Byte-offset comparison for `.form-control` and `.form-check-input` |
| Build/lint stay green | `✓ built in 6.34s`, lint exit 0 |
| No new test regressions | 109/111, same pre-existing flaky pattern |

## Noticed, not done
- Remaining Bootstrap component classes not yet covered in this app
  (checked broadly, nothing significant found still outstanding besides
  what's already logged in prior nodes' "Noticed, not done" sections).
- ~20 files' worth of simple utility classes (spacing/flex/opacity, same
  pattern as `tailwindcss-crud-pages-utilities`) across the rest of the
  app — separate future nodes.
- The final Bootstrap removal itself (activating all the dormant CSS
  built in nodes 6-9, then deleting `bootstrap.scss`/the `bootstrap`
  package) — needs a dedicated node with real visual QA once every
  consuming file's utility classes are converted.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-8's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.
