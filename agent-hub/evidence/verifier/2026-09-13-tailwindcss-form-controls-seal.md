# 2026-09-13 — tailwindcss-form-controls — SEAL

- Worker: verifier
- Node: `tailwindcss-form-controls`
- New PM status: SEALED

## Isolation proof
Spawned as a fresh, isolated subagent specifically for this verification
(Agent-tool task string: `worker verifier "tailwindcss-form-controls"`,
description "resume-vuejs-website verifier"). This session did not write
the implementer diff under review — no prior context of authoring
`src/styles/tailwind.css`/`tailwind.config.cjs` for this node exists in
this conversation. `NeverVerifyOwnWork` satisfied by construction.

## Reasoning
- Read the implementer note `evidence/implementer/2026-09-13-tailwindcss-form-controls.md`
  in full (not the diff first).
- Command matches `doctrine/MEMORY.md` (`npm run build` from repo root,
  this project has no separate test-only requirement for a build-only
  node). Output not truncated — full `✓ built in 6.34s` line quoted.
- Independently read `src/styles/tailwind.css` (untracked, `git diff`
  shows nothing on it): confirmed all 6 new rule groups present verbatim
  — `.form-control`, `.form-control:focus`, `.form-label`, `.form-text`,
  `.form-check`, `.form-check .form-check-input`, `.form-check-input`
  (+ `[type=checkbox]`/`[type=radio]`/`:focus`/`:checked`/
  `:checked[type=checkbox]`/`:checked[type=radio]`/`:disabled`),
  `.form-check-label`.
- Independently read `tailwind.config.cjs` safelist array: counted 38
  total entries — the 6 new form entries (`form-control`, `form-label`,
  `form-text`, `form-check`, `form-check-input`, `form-check-label`) sit
  alongside the prior 32 (20 btn/dropdown + 6 badge/alert), matching the
  note's "6 new entries alongside prior 32" claim.
- Independently read `src/styles/bootstrap.scss`: confirmed `$green:
  #00d095` (line 11) and `$component-active-bg: $green` (line 13) really
  are set — not just asserted by the note. This substantiates the
  hardcoded `#00d095` checked-state color and rules out a silent
  vanilla-Bootstrap-blue regression.
- Independently grepped `bootstrap.scss` for the `.form-label` rule:
  lines 154-155 show `.form { .form-label { padding: {left:5px;
  right:5px;} opacity:0.75; line-height:1; } }` — genuinely nested under
  `.form` in SCSS (compiles to `.form .form-label`), not a bare
  top-level `.form-label`. Independently grepped
  `src/components/veevalidate/VeeForm.vue`: line 130 is
  `<form class="form">`, confirming the component's root really carries
  the `.form` class the flattening argument depends on.
- Fresh `rm -rf dist && npm run build` → `✓ built in 6.46s`, same
  pre-existing "chunks larger than 500 kB" warning only, no new
  warnings/errors.
- Exhaustively grepped `dist/assets/index-CbKlwyG7.css` for all 15
  claimed rule/selector groups individually (not sampled), using the
  unquoted attribute-selector form (`form-check-input[type=checkbox]{`,
  not `[type='checkbox']`) per the note's own correction: all 15 present
  with non-zero occurrence counts —
  `.form-control{`×4, `.form-control:focus{`×1, `.form-label{`×3,
  `.form-text{`×1, `.form-check{`×1, `.form-check .form-check-input{`×1,
  `.form-check-input{`×7, `.form-check-input[type=checkbox]{`×1,
  `.form-check-input[type=radio]{`×1, `.form-check-input:focus{`×2,
  `.form-check-input:checked{`×2,
  `.form-check-input:checked[type=checkbox]{`×2,
  `.form-check-input:checked[type=radio]{`×2,
  `.form-check-input:disabled{`×1, `.form-check-label{`×4.
- Verified "fully dormant" myself via byte-offset comparison (not
  trusting the note's numbers): `grep -bo` on the fresh build gave
  `.form-control{` at offsets 34501/159229/159695/161853, and
  `.form-check-input{` at 35034/164568/164708/164772/166608/167020/167576.
  Read the raw bytes at offset 34501 and 35034 directly and confirmed
  they carry this node's distinctive property lists
  (`.form-control{display:block;width:100%;padding:.375rem .75rem...`
  and `.form-check-input{flex-shrink:0;width:1em;height:1em...`) — i.e.
  the FIRST occurrence of each selector in the compiled file is this
  node's new rule, and every later occurrence of the same selector is a
  separate Bootstrap-own declaration (Bootstrap wins the cascade for
  shared properties, later wins in CSS). Confirms zero live visual
  change, same conclusion as the note (my own re-run additionally found
  6 later Bootstrap `.form-check-input` occurrences vs the note's single
  citation — more evidence for dormancy, not less; byte offsets differ
  from the note's by a few bytes only, consistent with a fresh build's
  differing content hash and not a discrepancy in substance).
- `npm run lint` → exit 0, clean.
- `npm run test` → `Test Files 1 failed | 15 passed (16)` /
  `Tests 3 failed | 108 passed (111)`, all 3 failures in the same named
  `VeeForm.spec.ts` tests documented as pre-existing flaky since node 4
  (`clicking submit on a pristine form...`, `BUG (real, verified):
  clicking submit after touching+clearing...`, plus a third in the same
  file) — within the 108-109/111 fluctuation band the note and prior
  nodes describe. `src/components/veevalidate/` untouched by this diff.
- Branch check: `git branch --show-current` → `feature/tailwindcss-setup`
  (not `main`/`staging`). `NoMainEdit` satisfied.
- Proportionality: diff is scoped to 2 files
  (`src/styles/tailwind.css`, `tailwind.config.cjs`) matching exactly
  what the node describes; the `TableDefault.vue` `p-5`→`p-[3rem]` fix
  already present in the working tree was carried from node 8 (already
  verified there), not new to this diff — no opportunistic scope creep
  found.
- 6 forbidden states, all clear:
  - `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md`, worker
    (implementer) was used.
  - `NO_EVIDENCE` — implementer note exists and is complete.
  - `EDIT_UNVERIFIED` — independently re-ran build/lint/test, all
    verbatim output quoted above.
  - `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
    "*.ts" -o -name "*.js" -o -name "*.sh" -o -name "*.cjs"` → zero
    matches.
  - `DIAGRAM_DRIFT` — node row updated in place to SEALED with these
    findings appended.
  - `MAIN_EDIT` — branch confirmed `feature/tailwindcss-setup`, not
    `main`/`staging`.
- Seal gate: none needed — no outward-facing action taken (nothing
  committed/pushed; diff still lives in the working tree, matching the
  note's own "Seal gate: none" declaration).

## Missing
None.

## Re-run
`full` — re-ran `rm -rf dist && npm run build`, `npm run lint`, and
`npm run test` from scratch (not audit-only), because this diff touches
a Bootstrap-component-family CSS layer with a documented prior REOPEN in
this same node series (`tailwindcss-button-component-system`) caused by
under-sampling — the series' own stated risk profile calls for
independent re-derivation here, not audit-only trust.
