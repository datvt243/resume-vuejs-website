# 2026-09-13 — tailwindcss-root-tokens-and-remaining-gaps — SEAL

- Worker: verifier
- Node: `tailwindcss-root-tokens-and-remaining-gaps`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh, isolated subagent specifically to RE-verify this node
after a prior REOPEN — the spawn prompt states verbatim: "you are a
fresh, isolated subagent RE-verifying node
`tailwindcss-root-tokens-and-remaining-gaps` in the repo ... after a
prior REOPEN with 3 findings. A separate implementer session applied the
corrections, not you — NeverVerifyOwnWork satisfied by construction."
This session's first actions were reading `manifest.yaml`/`SOUL.md`/
`recipes/verify_seal.md` fresh, then reading the prior REOPEN verdict and
the implementer's evidence note (with its appended `## CORRECTION`
section) before touching any diff content. It wrote no part of the
original diff or of the correction. `NeverVerifyOwnWork` satisfied.

## Reasoning
Per the task's own scope and the established precedent
(`2026-09-13-tailwindcss-color-utilities-seal.md`,
`2026-09-13-tailwindcss-spinner-border-seal.md`), this pass independently
re-verified the 3 corrected findings against the real repo state (not
just the correction note's prose), plus a fresh sanity sweep — not a full
repeat of the prior REOPEN's exhaustive 4-layer survey, which already
covered everything else and did not change.

### Setup
1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. Read the prior REOPEN verdict
   (`evidence/verifier/2026-09-13-tailwindcss-root-tokens-and-remaining-gaps-reopen.md`)
   and the implementer's evidence note with its appended `## CORRECTION`
   section, in that order, per `EvidenceOnly`.

### Finding 1 re-check — `.list` fix
3. Read `src/components/global/ListTransition.vue` directly: confirmed
   real Pug `TransitionGroup(name="list" class="list" tag="ul")` —
   `class="list"` really lands on a real `<ul>`.
4. Read `src/styles/tailwind.css` lines 1415-1431 directly: a disclosure
   comment (naming the exact original miss and the fix) precedes
   ```
   .list { padding: 0; margin: 0; list-style: none; }
   .list > li { margin-bottom: 1.5rem; }
   ```
   — both rules present, matching Bootstrap's real compiled values.
5. `grep -n "'list'" tailwind.config.cjs` → line 154, present in the
   safelist array.
6. `rm -rf dist && npm run build`, located the main CSS bundle as the
   file `index.html` actually links (`grep -o 'href="[^"]*\.css"'
   dist/index.html` → `/resume-vuejs-website/assets/index-C87Zbczm.css`
   — NOT `VeeForm-DC9ishga.css`, which is larger on disk (370,539B vs
   238,496B) only because it's a separately Vite-split async-chunk CSS
   file carrying its own duplicated base layers, not the entry bundle;
   confirmed against the prior REOPEN's own precedent of citing the
   entry-linked file by name). Grepped the correct file:
   `grep -o '\.list{padding:0[^}]*}' dist/assets/index-C87Zbczm.css` →
   `.list{padding:0;margin:0;list-style:none}`; `grep -o
   '\.list>li{margin-bottom:1\.5rem}' dist/assets/index-C87Zbczm.css` →
   `.list>li{margin-bottom:1.5rem}`. Both compiled rules present and
   correctly minified.

### Finding 2 re-check — bare `<h6>` fix
7. Read `src/pages/dashboard/PageAccountSettings.vue` directly: 3 real
   `<h6 class="text-uppercase ...">` elements, none carrying `.h4`/`.h5`/
   `.h6`. Confirmed exactly as the correction note describes.
8. Read `src/styles/tailwind.css` lines 1017-1053 directly: the shared
   heading-block selector is now `h6, .h6, h5, .h5, h4, .h4 { margin-top:
   0; margin-bottom: .5rem; font-weight: 500; line-height: 1.2; color:
   inherit; }` (bare elements included, not just classes), and the size
   rule is `h6, .h6 { font-size: 1rem; }` (bare `h6` included).
9. Compiled-CSS check on the correct main bundle:
   `grep -o 'h6,\.h6[^}]*}' dist/assets/index-C87Zbczm.css` →
   `h6,.h6,h5,.h5,h4,.h4{margin-top:0;margin-bottom:.5rem;font-weight:500;line-height:1.2;color:inherit}`
   and `h6,.h6{font-size:1rem}` — both present with the bare-element
   token surviving the Tailwind/PostCSS pipeline exactly as claimed. (A
   second, unrelated pre-existing dormant Bootstrap rule
   `h6,.h6,h5,.h5,h4,.h4,h3,.h3,h2,.h2,h1,.h1{...color:var(--bs-heading-color)}`
   also appears later in the same bundle — real Bootstrap's own Reboot
   rule, unlayered, still shipped since Bootstrap remains installed;
   irrelevant to this node's own rule, which is a separate `@layer
   components` declaration and is what actually matters once Bootstrap
   is deleted in a later node.)

### Finding 3 re-check — `.footer .btn` fix
10. Read `src/styles/tailwind.css` lines 1441-1449 directly: selector is
    now `.form .footer .btn { min-width: 160px; }`, immediately preceded
    by a disclosure comment naming the real 3-level nested SCSS origin
    and explaining why the narrower selector is being kept exact rather
    than broadened, matching the discipline used elsewhere in the file.
11. Compiled-CSS check: `grep -o '\.form \.footer \.btn{[^}]*}'
    dist/assets/index-C87Zbczm.css` → `.form .footer .btn{min-width:160px}`
    — present verbatim in the compiled bundle. (Did not re-run `npx
    sass` against `bootstrap.scss` again — the prior REOPEN pass already
    established the real compiled selector that way and this fix matches
    it exactly; re-deriving it a second time would be repeating already-
    settled ground truth, not new verification.)

### Fresh sanity sweep
12. `rm -rf dist && npm run build` → `✓ built in 5.99s`, only the
    pre-existing "chunks larger than 500 kB" warning (same warning every
    prior node in this series has shown). Clean.
13. `npm run lint` → exit 0, no output beyond the npm command header.
    Clean.
14. `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
    failed | 108 passed (111)` — all 3 failures are in
    `VeeForm.spec.ts` (`clicking submit on a pristine form calls
    submitFn anyway...`, `BUG (real, verified): clicking submit after
    touching+clearing...`, `typing then clearing a required field does
    NOT disable submit`) — exactly the documented, known-flaky set named
    in this task's own instructions (up to 3 failures in that file,
    108-111/111 overall, is expected and not a regression). No failure
    outside `VeeForm.spec.ts`. Not a regression.

### Forbidden states (all 6 checked)
15. `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md`, both the
    implementer's original note, its `## CORRECTION` section, and the
    prior verifier REOPEN note exist. Clear.
16. `NO_EVIDENCE` — read the prior REOPEN note and the implementer's
    corrected note first, per `EvidenceOnly`. Clear.
17. `EDIT_UNVERIFIED` — every one of the 3 corrected claims was
    independently re-derived against the real repo state (direct file
    reads of the 3 source files, a fresh `rm -rf dist && npm run build`,
    and direct greps of the correct compiled CSS bundle identified via
    `dist/index.html`'s own `<link>` tag, not assumed by filename
    pattern). Clear.
18. `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
    "*.ts" -o -name "*.js" -o -name "*.sh" -o -name "*.cjs"` → zero
    matches. Clear.
19. `DIAGRAM_DRIFT` — row was IN_PROGRESS pending this verdict; updated
    to SEALED as part of this pass, in place, findings appended to the
    end. Clear.
20. `MAIN_EDIT` — `git branch --show-current` → `feature/tailwindcss-setup`,
    not `main`/`staging`. Clear (`NoMainEdit` satisfied).
21. Seal gate — no outward-facing action in this diff or this verifier
    pass (no commit/push/merge). Nothing to gate.

## Missing
None. All 3 findings from the prior REOPEN are independently confirmed
fixed against the real repo state and the real compiled CSS bundle, not
just the correction note's prose. The much larger body of work from the
original pass (root-token self-hosting, Layer-1 component rebuilds,
Layer-2 Reboot audit, Layer-4 custom-CSS extraction) was already
independently verified sound by the prior REOPEN pass via a real `npx
sass` compile and is unchanged since (only the 3 named fixes plus their
disclosure comments were added).

## Re-run
`partial` — reason: this is a post-REOPEN re-verification of exactly 3
named, scoped findings, per the task's own instruction and the
established hub precedent (`tailwindcss-color-utilities-seal.md`,
`tailwindcss-spinner-border-seal.md`) — the prior REOPEN pass's full
4-layer survey, its real `npx sass` compile of `bootstrap.scss`, and its
repo-wide `var(--bs-*)` used-vs-defined diff are not re-run here since
nothing in that scope changed. Re-ran: direct reads of the 3 corrected
source locations (`ListTransition.vue`, `PageAccountSettings.vue`,
`tailwind.css`'s `.list`/heading/`.footer` rules), a fresh `rm -rf dist
&& npm run build` + `npm run lint` + `npm run test`, and fresh greps of
the actual entry-linked compiled CSS bundle (re-identified from scratch
via `dist/index.html`, not assumed to have the same hash as the prior
note's citation) for all 3 fixes' compiled output.

## Hub bytes
before=194672 (per task instruction, matching the implementer's own
`## Hub bytes` `before` line carried from the prior REOPEN verifier's
`hub_bytes_after`) · after=198079 (measured via `/hub-tokens`'s own
script, taken after updating PM status in this pass: root=12393,
doctrine=27207, active diagram=132362, implementer bundle=14963,
verifier bundle=11154 — growth vs `before` reflects the diagram row's
SEAL findings just appended in this pass, on top of the growth already
present from the implementer's `## CORRECTION` section and the prior
REOPEN note).
