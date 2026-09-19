# 2026-09-14 — tailwindcss-post-ship-review-fixes — SEAL

- Worker: verifier
- Node: `tailwindcss-post-ship-review-fixes`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent whose task explicitly states: "you
are a fresh, isolated subagent verifying node
`tailwindcss-post-ship-review-fixes`... A separate implementer session
wrote this diff, not you — NeverVerifyOwnWork satisfied by construction."
This session's first actions were reading `manifest.yaml`/`SOUL.md`/
`recipes/verify_seal.md` fresh, then reading the implementer's evidence
note before touching any diff content directly. This session wrote no
part of the diff under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state:

1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. **Diff read directly**: `src/pages/auth/PageLogin.vue` is tracked, so
   `git diff` shows the exact change — `<RouterLink>` moved from a block
   below `<VeeForm>` into its `#button` slot, `ms-auto self-center`
   added. `src/styles/tailwind.css` is untracked for the whole migration
   branch (added early, never committed), so there is no historical
   `git diff` for it — read the file directly instead and grepped the
   two specific new rule blocks; both present exactly as quoted in the
   note.
3. **Finding 1, nesting claim**: read `src/components/Navbar.vue` in
   full — confirmed `<div class="container">` really nests INSIDE
   `<nav class="navbar navbar-expand-lg ...">`. Read
   `src/pages/_layouts/Header.vue` in full — confirmed its `v-else`
   (authenticated) branch nests the OPPOSITE way: `.container(v-else)`
   wraps `nav.navbar` from the outside. This exactly matches the note's
   claim that only the unauthenticated header hits the bug.
4. **Finding 1, Bootstrap source claim**: the project's own
   `node_modules/bootstrap` was fully removed by node 16
   (`tailwindcss-bootstrap-removal`), so I could not check
   `node_modules/bootstrap/scss/_navbar.scss` in THIS repo as the task
   instructions assumed. Located a same-major-version (5.3.x) copy of
   `_navbar.scss` on the local machine (a separate, unrelated project's
   `node_modules`) and read it directly: it defines
   `%container-flex-properties { display:flex; flex-wrap:inherit;
   align-items:center; justify-content:space-between; }` and extends it
   onto `> .container, > .container-fluid` (nested inside `.navbar`,
   i.e. a direct-child selector). This is byte-for-byte the same 4
   declarations added to `tailwind.css`'s new `.navbar > .container`
   rule — the fix's reasoning is verified against the real mechanism,
   not just plausible-sounding prose.
5. **Independent visual/numeric reproduction** (did not rely on the
   note's own screenshots): `rm -rf dist && npm run build` (`✓ built in
   3.57s`, only the pre-existing chunk-size warning — matches). Started
   an isolated `npm run dev` on a scratch port, and a SEPARATE headless
   Chrome instance on its own remote-debugging port with its own fresh
   profile (did NOT touch the implementer's/operator's real Chrome on
   port 9888, which was confirmed still live via `curl
   localhost:9888/json/version` but left untouched per the read-only
   instruction). Via raw CDP (`Emulation.setDeviceMetricsOverride` at
   375×812, `Page.navigate` to `/login`, `Runtime.evaluate` +
   `Page.captureScreenshot`):
   - **With the fix** (real compiled CSS): `.navbar-toggler`
     bounding box `x:307, right:363` at a 375px viewport — flush
     against the right edge (12px matches the container's own
     padding). `.navbar > .container` computed `display:flex;
     justify-content:space-between`.
   - **With the fix rule deleted live** (via
     `document.styleSheets[…].deleteRule`, reproducing the pre-fix
     state without editing any file): `.navbar-toggler` bounding box
     jumped to `x:148, right:204` — right next to the 120px-wide brand
     (`x:12–132`), `container` computed `display:block`. This is an
     EXACT match to the note's own cited pre-fix number ("toggler sat
     at x=148"), independently reproduced, not copied from the note.
   - Screenshots of both states confirm this visually: fix present →
     hamburger icon at the far right edge; fix removed → hamburger
     icon crammed next to the brand with a large empty gap on the
     right. Also visually confirms Finding 3: "Quên mật khẩu?" sits to
     the right of the "Login" button on the same row in both
     screenshots.
6. **Finding 2 (autofill)**: read the new `:-webkit-autofill` block in
   `tailwind.css` directly — uses `var(--bs-body-bg)` and
   `var(--bs-body-color)` (theme-tracking custom properties, not a
   hardcoded color), an inset `box-shadow` sized `0 0 0 1000px` to fully
   cover the input, `-webkit-text-fill-color`, and a `600000s`
   `transition-delay`. All three are standard, well-documented real
   techniques for exactly this browser behavior (autofill's UA styling
   overriding author `background-color`/`color` with higher cascade
   precedence) — not fabricated. Could not trigger real Chrome
   autofill in a fresh headless profile with no saved password (same
   limitation any verifier would face without the operator's actual
   saved credential) — relied on the CSS-mechanism check per the task's
   own fallback instruction ("at minimum verify via compiled CSS... and
   reason through the mechanics").
7. **Finding 3, slot pattern claim**: read `src/pages/auth/
   PageLogin.vue` directly — `<VeeForm>` now wraps a `<template
   #button>` containing the `RouterLink`. Grepped `#button` across
   `src/pages/` and `src/components/`: found in `PageCertificate.vue`,
   `PageExperience.vue`, `PageEducation.vue`, `PageReference.vue`,
   `PageAward.vue`, `PageProject.vue`, and
   `VeeFormGeneralInformationUpdate.vue` — all pre-existing, unrelated
   to this diff. Read `VeeForm.vue` — the slot is declared as `<slot
   name="button"></slot>` inside the component itself. Confirms this is
   a real, pre-existing extension point, not invented for this fix.
8. **Compiled CSS in the real main bundle**: identified the entry
   stylesheet from `dist/index.html`'s own `<link>` tag
   (`assets/index-Cw7GjSkR.css`), not a route chunk. Grepped it directly
   for both new rules: `.navbar>.container{display:flex;flex-wrap:
   inherit;align-items:center;justify-content:space-between}` — found,
   verbatim. `:-webkit-autofill` block (`box-shadow:0 0 0 1000px
   var(--bs-body-bg) inset;-webkit-text-fill-color:var(--bs-body-color);
   caret-color:var(--bs-body-color);transition:background-color 600000s
   ease-in-out 0s`) — found, verbatim, exactly once.
9. **`npm run lint`**, re-run myself: exit 0, zero output beyond the npm
   command header — clean, matches the note.
10. **`npm run test`**, re-run myself: `Test Files 16 passed (16)`,
    `Tests 111 passed (111)` — all green this run, including
    `VeeForm.spec.ts`'s 11/11 (inside the documented-flaky band, no
    failure surfaced this run) — matches the note's claim exactly.
11. **Forbidden states** (all 6 checked):
    - `ADHOC_WORK` — node existed on `dev-loop.prime-mermaid.md` at
      IN_PROGRESS before this pass, a worker (implementer) was used.
      Clear.
    - `NO_EVIDENCE` — implementer note exists and was read first. Clear.
    - `EDIT_UNVERIFIED` — every claim above independently re-run and
      read back (build, lint, test, direct file reads, compiled-CSS
      grep, a real Bootstrap source read, and a from-scratch headless
      CDP reproduction with before/after numeric + screenshot evidence),
      not inferred from the note. Clear.
    - `CODE_IN_HAVEN` — `find agent-hub/haven -type f \( -iname "*.vue"
      -o -iname "*.js" -o -iname "*.ts" -o -iname "*.sh" \)` → zero
      matches. Clear.
    - `DIAGRAM_DRIFT` — diagram row existed at IN_PROGRESS matching this
      diff; updated to SEALED as part of this pass, in place, findings
      appended to the end, prior SEALED rows untouched. Clear.
    - `MAIN_EDIT` — branch confirmed `feature/tailwindcss-setup`. Clear.
12. **Seal gate**: no outward-facing action in this diff itself (no
    commit/push/merge in scope of this node) — nothing to gate here;
    merging `feature/tailwindcss-setup` into `staging` remains a
    separate, later `/ship` action.
13. **Proportionality**: `git diff --stat -- src/pages/auth/
    PageLogin.vue` shows a small, targeted 6-insertion/3-deletion change
    (the slot move only); `tailwind.css` gained exactly the two rule
    blocks (plus explanatory comments) described in the 3 findings — no
    unrelated rules, no opportunistic scope creep found elsewhere in the
    file.

## Missing
None. Every claim in the note — the nesting bug's root cause, the
Bootstrap-source justification, the fix's compiled-CSS presence, the
autofill mechanism, and the slot-based UX change — has citable,
independently-reproduced evidence, including one item the note did not
itself provide: a live-recreated "before" state (via CSSOM rule
deletion, not file editing) that reproduces the exact pre-fix pixel
position the note cites.

## Re-run
`full` — reason: this is real, disclosed-as-previously-missed visual/
layout + browser-native styling behavior discovered only via live QA
(the exact residual-risk category flagged since node 4) — worth the
independent-confirmation cost per `doctrine/MEMORY.md`'s "Re-run scope"
exception 2 (outward-facing/higher-risk class of change). Re-ran: `rm
-rf dist && npm run build`, `npm run lint`, `npm run test`, plus a
from-scratch headless-Chrome CDP reproduction of the layout bug
(both fixed and reverted states) and independent greps of the compiled
bundle — none of this reused the note's own numbers except as a
target to independently match.

## Hub bytes
before=203007 (from the implementer note's `## Hub bytes` → `before`
line, itself carried from node 16's verifier SEAL note's
`hub_bytes_after`) · after=209014 (measured via the same 5 categories as
prior notes, AFTER updating this node's PM status to SEALED: root=12393,
doctrine=27207, active diagram=143297 (this SEAL's findings appended in
place to the `tailwindcss-post-ship-review-fixes` row), implementer
bundle=14963, verifier bundle=11154 — no change to recipe/manifest/SOUL
this pass).
