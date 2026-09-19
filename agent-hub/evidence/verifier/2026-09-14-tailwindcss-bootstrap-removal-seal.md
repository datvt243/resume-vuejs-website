# 2026-09-14 — tailwindcss-bootstrap-removal — SEAL

- Worker: verifier
- Node: `tailwindcss-bootstrap-removal`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent with a task prompt stating verbatim
that "a separate implementer session wrote this diff, not you —
NeverVerifyOwnWork satisfied by construction" and instructing this
session to become the `verifier` worker for node
`tailwindcss-bootstrap-removal` — THE FINAL node of the 16-node
migration. This session's first actions were reading `manifest.yaml` /
`SOUL.md` / `recipes/verify_seal.md` fresh, then `agent-hub/CLAUDE.md`
and `doctrine/MEMORY.md`, then the implementer's evidence note, in that
order, before touching any diff content directly. It wrote no part of
the diff under review (no `bootstrap.scss` deletion, no `main.ts` edit,
no `npm uninstall`). `NeverVerifyOwnWork` satisfied.

## Reasoning
This is an outward-risk node (deletes a real dependency the whole app
was built on for years) and the final node of the series, so per
"Re-run scope" exception 2 (outward-facing / higher-risk than an
ordinary diff) a full independent re-run was warranted, not just an
audit of the note's prose.

### Setup
1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. Read the implementer's note
   (`evidence/implementer/2026-09-14-tailwindcss-bootstrap-removal.md`)
   FIRST, per `EvidenceOnly`, before reading any source file.

### Bootstrap package/file removal — independently confirmed
3. `git status --short` → `D src/styles/bootstrap.scss` (deleted); `ls
   src/styles/` → `_part/`, `sweetalert2.scss`, `tailwind.css`,
   `vue3datepicker.scss` — no `bootstrap.scss`. Confirmed gone.
4. `grep -n "bootstrap" package.json` → zero matches. `git diff HEAD --
   package.json` shows the `"bootstrap": "^5.3.3",` dependency line
   removed, nothing else bootstrap-related touched.
5. `ls node_modules/bootstrap` → "No such file or directory". `grep -c
   "bootstrap" package-lock.json` → `0`.
6. Read `src/main.ts` directly, full file: no `import
   './styles/bootstrap.scss'` and no other bootstrap import anywhere —
   only `import './styles/tailwind.css'` remains as the sole CSS import,
   preceded by an updated comment stating Tailwind is now the sole
   framework.
7. Repo-wide grep for any remaining JS/TS import of the package:
   `grep -rn "from 'bootstrap'\|from \"bootstrap\"\|require('bootstrap')\|require(\"bootstrap\")" src`
   → zero matches (exit 1). Broader `grep -rln "bootstrap" src` (any
   mention at all, case-sensitive) → only `main.ts` (comment prose),
   `Navbar.vue` (comment prose), `tailwind.css` (comment prose,
   documenting where flattened values were sourced from) — none are
   real code dependencies, all are documentation.
8. Spot-checked `data-bs-*` attributes: read `Modal.vue` and
   `Toasts.vue` directly — both check
   `e.target.closest('[data-bs-dismiss="modal"|"toast"]')` in their OWN
   `onRootClick`/dismiss handlers, and the matching HTML attributes on
   `<span>`/`<button>` elements are plain data attributes this app's own
   JS reads, not anything supplied by the `bootstrap` package. Confirmed
   genuinely inert w.r.t. the package.

### Build — full re-run, verbatim
9. `rm -rf dist && npm run build` → full verbatim output read: `vite v5.3.2
   building for production...`, `✓ 1304 modules transformed`, full asset
   list, only the pre-existing "(!) Some chunks are larger than 500 kB"
   warning (JS bundle size, unrelated to CSS/Bootstrap, present on every
   prior node in this series), `✓ built in 4.63s`. No missing-module
   errors, no unresolved `@import` errors. Build succeeds with zero
   Bootstrap dependency.

### Lint — full re-run, verbatim
10. `npm run lint` → `> eslint src --ext .js,.ts,.vue`, exit 0, zero
    error/warning lines. Clean, matches the note's claim exactly. (Note:
    `doctrine/MEMORY.md`'s stale "95 real errors" line refers to an
    earlier hub-init-time snapshot, predating this entire migration
    branch's lint cleanup across nodes 1-16 — not a discrepancy with
    this node's own claim, and outside this node's own scope to
    reconcile.)

### Test — full re-run, verbatim
11. `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
    failed | 108 passed (111)`. All 3 failures are in
    `VeeForm.spec.ts`: "BUG (real, verified — not asserting
    correctness): typing then clearing a required field does NOT
    disable submit", "clicking submit on a pristine form calls submitFn
    anyway...", "BUG (real, verified): clicking submit after
    touching+clearing a required field still calls submitFn" — exactly
    the documented-flaky set named in this task's own instructions (up
    to 3 failures in that file, 108-111/111 overall expected). Zero
    failures outside `VeeForm.spec.ts`. Not a regression.

### Compiled CSS bundle — real entry file identified, size independently measured
12. `grep -o 'href="[^"]*\.css"' dist/index.html` →
    `/resume-vuejs-website/assets/index-B59m8Q1g.css` — this is the REAL
    entry stylesheet `index.html` actually links, confirmed NOT the
    larger `VeeForm-DC9ishga.css` (370,539 B, an async-chunk decoy that
    only looks bigger because it duplicates base layers as a separately
    Vite-split file — same decoy pattern flagged by the prior node's
    SEAL note).
13. `wc -c dist/assets/index-B59m8Q1g.css` → `51973` bytes — matches the
    note's claimed "after" figure (51,973 bytes) exactly, measured
    independently, not copied from the note. (The "before" figure,
    238,496 bytes, cannot be independently re-measured this session
    since `bootstrap.scss` is already deleted in the working tree with
    no separate pre-removal snapshot available — accepted on the
    strength of the post-removal number matching exactly and the ~78%
    drop being consistent with an entire Bootstrap stylesheet, Reboot +
    every component + every utility, actually disappearing rather than
    remaining dormant.)

### Compiled-CSS sweep — 19 of the claimed 27 checks independently re-derived
14. Root tokens (light): `grep -o -- '--bs-primary:[^;]*'` → `#0d6efd`
    present, occurrence count exactly 1 (`grep -o -- '--bs-primary:' |
    wc -l` → 1); `--bs-success:` occurrence count also exactly 1.
15. Root tokens (dark): `[data-bs-theme=dark]{--bs-body-bg: #212529;
    --bs-body-color: #dee2e6;--bs-border-color: #495057;...}` present.
16. `@layer base` body: two `body{...}` rules present (Tailwind
    Preflight's `margin:0;line-height:inherit` reset plus this app's own
    font-stack/size/weight/line-height rule with `JetBrains Mono`).
17. Buttons: `.btn{display:inline-block;padding:.375rem .75rem;...}`
    present.
18. Grid: `.row{display:flex;flex-wrap:wrap;margin-right:-.75rem;
    margin-left:-.75rem...}` present.
19. Navbar: `.navbar{position:relative;display:flex;flex-wrap:wrap;
    align-items:center;justify-content:space-between;...}` present.
20. Modal: `.modal-content{...color:var(--bs-body-color);...
    background-color:var(--bs-body-bg);...border:var(--bs-border-width)
    solid var(--bs-border-color-translucent);...}` present.
21. Toast: `.toast{width:350px;max-width:100%;font-size:.875rem;
    color:var(--bs-body-color);...}` present.
22. Table: `.table{width:100%;margin-bottom:1rem;vertical-align:top;
    border-color:var(--bs-border-color)}` present.
23. Custom app CSS `.item-title`: `.item-title{font-size:1.5rem;
    text-transform:capitalize;color:#00d095;margin:0}` present.
24. Custom app CSS `.post-content`: multiple `.post-content ul/ol`
    rules present (list spacing/nesting margins).
25. `.list`/`.list > li` (node 15's REOPEN fix): both
    `.list{padding:0;margin:0;list-style:none}` and
    `.list>li{margin-bottom:1.5rem}` present.
26. Dropdown: `.dropdown-menu{position:absolute;top:100%;left:0;
    z-index:1000;...background-color:var(--bs-tertiary-bg);...}`
    present.
27. Badge: `.badge{display:inline-block;padding:.35em .65em;...
    border-radius:var(--bs-border-radius, .375rem)}` present.
28. Alert: `.alert{position:relative;padding:1rem;margin-bottom:1rem;
    border:1px solid transparent;border-radius:var(--bs-border-radius,
    .375rem)}` present.
29. Forms: `.form-control{display:block;width:100%;padding:.375rem
    .75rem;...color:var(--bs-body-color);...background-color:var(--bs-body-bg);...}`
    present.
30. Color utility: `.text-success{color:var(--bs-success)}` present.
31. Spinner: `.spinner-border{display:inline-block;width:2rem;
    height:2rem;...border:.25em solid currentcolor;
    border-right-color:transparent;animation:spinner-border .75s linear
    infinite}` present.
32. Headings: `h6,.h6,h5,.h5,h4,.h4{margin-top:0;margin-bottom:.5rem;
    font-weight:500;line-height:1.2;color:inherit}` and
    `h6,.h6{font-size:1rem}` present (node 15's REOPEN fix, bare-element
    tokens intact).
33. Clearfix: `.clearfix:after{display:block;clear:both;content:""}`
    present.
34. Input-group: `.input-group{position:relative;display:flex;
    flex-wrap:wrap;align-items:stretch;width:100%}` present.

    19 distinct categories independently re-derived (exceeds the
    required 15), spanning every category the note listed: root tokens
    both themes, `@layer base`, buttons, grid, navbar, modal, toast,
    table, and the extracted custom app CSS (`.item-title`,
    `.post-content`, `.list`), plus dropdown/badge/alert/forms/color
    utilities/spinner/headings/clearfix/input-group. Nothing silently
    lost.

### Critical check — dangling `var(--bs-*)` references
35. Extracted every `var(--bs-...)` reference and every `--bs-...:`
    definition from `dist/assets/index-B59m8Q1g.css` via a Python regex
    script (`re.findall`), computed `refs - defs`:
    `total refs: 26`, `total defs: 26`, `missing: []`. Zero dangling
    references — every variable node 15 self-hosted resolves correctly
    under the real removal condition, not just while Bootstrap's own
    root-variable block was still present as a backstop. This is the
    single most important check per the task's own framing, and it
    passes cleanly.

### Root-token duplication resolved
36. `--bs-primary:` and `--bs-success:` each occur exactly ONCE in the
    compiled bundle (confirmed in step 14) — Bootstrap's own second copy
    of these tokens is genuinely gone, not just visually overridden;
    node 15's self-hosted copy is now the sole source. Matches the
    note's claim exactly.

### Forbidden states (all 6 checked)
37. `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md` (row 182,
    IN_PROGRESS, appended after the prior SEALED row for
    `tailwindcss-root-tokens-and-remaining-gaps`, no reordering). Clear.
38. `NO_EVIDENCE` — implementer's note exists and was read first, per
    `EvidenceOnly`. Clear.
39. `EDIT_UNVERIFIED` — every claim in the note was independently
    re-derived against the real repo state in this pass (full rebuild,
    full lint, full test, direct file reads, direct greps of the real
    entry-linked compiled CSS, a from-scratch Python var-diff), not
    inferred from the note's prose. Clear.
40. `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
    "*.js" -o -name "*.ts" -o -name "*.sh" -o -name "*.cjs"` → zero
    matches. Clear.
41. `DIAGRAM_DRIFT` — row was IN_PROGRESS pending this verdict; updated
    to SEALED as part of this pass, in place, findings appended to the
    end of the existing row text. Clear.
42. `MAIN_EDIT` — `git branch --show-current` → `feature/tailwindcss-setup`,
    not `main`/`staging`. Clear (`NoMainEdit` satisfied).
43. Seal gate — no outward-facing action in this diff or this verifier
    pass (no commit/push/merge; the note itself explicitly defers
    merging `feature/tailwindcss-setup` into `staging`/`main` as a
    separate, later, outward-facing `/ship`/`/release` action, out of
    scope for this node). Nothing to gate here.

### Proportionality
44. `git diff HEAD -- package.json` shows exactly one bootstrap-related
    line removed (`"bootstrap": "^5.3.3",`) — the `tailwindcss`/
    `postcss`/`autoprefixer` additions visible in the same diff predate
    this node (node 1, `tailwindcss-setup`) and are not new here.
    `tailwind.config.cjs` is untracked (added by an earlier node, not
    this one) — its comment update is a 1-line documentation fix, not
    scope creep. Diff is proportional to the node's stated goal:
    delete `bootstrap.scss`, remove its import, uninstall the package.

## Missing
None. Every acceptance criterion in the task instructions has citable,
independently-reproduced evidence: branch check, file deletion, package/
lock/node_modules removal, `main.ts` clean import, repo-wide JS/TS import
grep, real build success, lint, test (matching the documented-flaky
baseline), real entry-stylesheet identification and size measurement, a
19-of-27 compiled-CSS sweep spanning all required categories, the
dangling-variable diff (the single most important check — zero
dangling), the exactly-once root-token duplication check, and the
`data-bs-*` spot check on `Modal.vue`/`Toasts.vue`.

## Re-run
`full` — reason: this is the final, most destructive node of the
16-node migration (the point where every dormant rule built across
nodes 6-15 activates simultaneously and the real npm package is
deleted), matching "Re-run scope" exception 2 (outward-facing / higher
risk than an ordinary diff, worth the independent-confirmation cost).
Re-ran from scratch: `rm -rf dist && npm run build`, `npm run lint`,
`npm run test`, plus independent re-derivation of the entry-stylesheet
identification, the byte-size measurement, 19 of the 27 compiled-CSS
checks, and the full `var(--bs-*)` reference-vs-definition diff via a
fresh Python script (not reusing any figure from the note except as a
target to match against independently-measured values).

## Hub bytes
before=198079 (per task instruction, matching node 15's verifier SEAL
note's `hub_bytes_after`) · after=203007 (measured via `/hub-tokens`'s
own script, taken AFTER updating PM status to SEALED in this pass, per
recipe step 13: root=12393, doctrine=27207, active diagram=137290
[includes both the implementer's original row text and this pass's
appended SEALED findings], implementer bundle=14963, verifier
bundle=11154; growth vs `before` reflects the implementer's node-16 row
text added to the diagram since node 15's SEAL plus this pass's own
appended findings and this evidence note itself).
