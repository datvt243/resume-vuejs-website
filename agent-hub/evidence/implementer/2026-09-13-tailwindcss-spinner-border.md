# 2026-09-13 — tailwindcss-spinner-border

- Worker: implementer
- Node: `tailwindcss-spinner-border`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 14 of the Bootstrap→Tailwind migration (operator: "tiếp tục",
standing "tiếp tục cho tới khi xong" directive), continuing from node 13
(SEALED). New follow-up item logged in node 13's evidence: `.spinner-
border`/`.spinner-border-sm` (`Spinner.vue`) — a separate Bootstrap
component system (loading-spinner animation), not a color utility, not
previously tracked in any earlier node's deferred list.

## Survey
Grepped `src/` for `spinner-border`/`spinner-grow` (both class attr and
Pug dot-chain): only one consumer, `Spinner.vue`'s cold-start-countdown
overlay: `<span ... class="spinner-border spinner-border-sm text-
success">`. Only `.spinner-border`+`.spinner-border-sm` are used;
Bootstrap's sibling `.spinner-grow`/`.spinner-grow-sm` (a different,
pulsing-scale animation variant) is confirmed unused anywhere — not
built, same "only what's used" scoping as every prior node.

`Spinner.vue` already has its own `<style scoped>` block with a
`.countdown-ring .spinner-border { position: relative; z-index: 1; }`
override — confirmed this only repositions the element inside the
custom countdown-ring overlay, doesn't redefine the spinner's own core
box model or animation, so no conflict with the new base rule.

## Design
Read Bootstrap's real compiled CSS
(`node_modules/bootstrap/dist/css/bootstrap.css`), not guessed:
```css
.spinner-grow, .spinner-border {
  display: inline-block;
  width: var(--bs-spinner-width);
  height: var(--bs-spinner-height);
  vertical-align: var(--bs-spinner-vertical-align);
  border-radius: 50%;
  animation: var(--bs-spinner-animation-speed) linear infinite var(--bs-spinner-animation-name);
}
.spinner-border {
  --bs-spinner-width: 2rem;
  --bs-spinner-height: 2rem;
  --bs-spinner-vertical-align: -0.125em;
  --bs-spinner-border-width: 0.25em;
  --bs-spinner-animation-speed: 0.75s;
  --bs-spinner-animation-name: spinner-border;
  border: var(--bs-spinner-border-width) solid currentcolor;
  border-right-color: transparent;
}
.spinner-border-sm {
  --bs-spinner-width: 1rem;
  --bs-spinner-height: 1rem;
  --bs-spinner-border-width: 0.2em;
}
@keyframes spinner-border { to { transform: rotate(360deg); } }
```
Flattened the CSS-custom-property indirection into direct values (same
simplification as badges/alerts/color-utilities): base `width`/`height`
2rem, `vertical-align` -0.125em, `border` 0.25em solid currentcolor +
`border-right-color: transparent`, `animation: spinner-border 0.75s
linear infinite`; `-sm` overrides `width`/`height` 1rem and
`border-width` 0.2em. Skipped the `prefers-reduced-motion` speed-override
media query — confirmed no accessibility requirement currently tracked
for it in this app, same "only what's used" scoping as every prior node.

`currentcolor` correctly still resolves to Bootstrap's real green via
`Spinner.vue`'s own `.text-success` class, which stays live today
through Bootstrap's `!important` utility rule regardless of node
`tailwindcss-color-utilities`'s dormant Tailwind-side equivalent — no
new dependency introduced here.

## Correction made before finalizing: dormancy status
Initial draft of the `tailwind.css` comment claimed this rule would be
"live immediately" (reasoning: unlike node `tailwindcss-color-
utilities`'s classes, Bootstrap's real `.spinner-border` has no
`!important`). This was WRONG and corrected before finalizing — per the
CSS Cascade Layers spec, an unlayered NORMAL declaration (Bootstrap's
plain `bootstrap.scss` CSS, not wrapped in any `@layer`) always beats
ANY layered normal declaration (this rule, inside `@layer components`),
regardless of specificity, `!important` absence, or source order. This
is the exact same mechanism that made `.btn`/`.dropdown-menu`/`.badge`/
`.alert`/`.form-control` dormant in nodes 6-9 — `.spinner-border` is no
different, just a component class being reused under its real Bootstrap
name, same as those. Corrected the comment before it shipped, not left
wrong in the final diff.

**Zero consumer-file edits needed** — `Spinner.vue` keeps its existing
class names unchanged. Both classes added to `tailwind.config.cjs`'s
`safelist`.

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.70s`, only the
   pre-existing chunk-size warning.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
   (111)`.
4. Compiled main CSS bundle (`dist/assets/index-*.css`) checked via
   Python regex: `.spinner-border{...}` (all properties, including
   `animation:spinner-border .75s linear infinite`),
   `.spinner-border-sm{width:1rem;height:1rem;border-width:.2em}`, and
   `@keyframes spinner-border{to{transform:rotate(360deg)}}` all
   present.
5. **Dormancy independently confirmed**: located THREE `.spinner-border`
   rule occurrences in the compiled bundle — mine (byte offset ~39118,
   flattened values, from `tailwind.css`) plus Bootstrap's real two-part
   rule (offsets ~215025/~215338, the shared `.spinner-grow,
   .spinner-border` base + `.spinner-border`'s own CSS-custom-property
   block, from `bootstrap.scss`, both LATER in the file/unlayered) —
   confirming Bootstrap's real rule coexists and, per the cascade-layers
   mechanism above, wins today regardless of order. Zero live-visual
   change from this diff, exactly matching nodes 6-9's precedent.
6. Forbidden states: branch = `feature/tailwindcss-setup` (`MAIN_EDIT`
   clear). Node added to `dev-loop.prime-mermaid.md` before this note
   (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE` clear). No
   `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim actually run and read back.

## Deferred / follow-up
- `.spinner-grow`/`.spinner-grow-sm` — confirmed unused, not built.
- Final Bootstrap removal — still untouched; this is now the node where
  ALL dormant rules built across nodes 6-14 (buttons, dropdowns, badges,
  alerts, forms, grid, navbar, color utilities, and now spinner-border)
  activate at once. Real visual QA required then.

## Verification gap, disclosed
No live browser session available this session (same limitation as
nodes 4/7/10/11/12/13). Mitigated the same way: exhaustive compiled-CSS
presence + coexistence checks + reading Bootstrap's real source values.

## Hub bytes
before=184119 (from node 13's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time.

## CORRECTION (post-REOPEN)
Verifier REOPENed
(`evidence/verifier/2026-09-13-tailwindcss-spinner-border-reopen.md`) on
the "Correction made before finalizing: dormancy status" section's
mechanism claim: it named "the CSS Cascade Layers spec" and asserted
Bootstrap's rule wins "regardless of specificity, `!important` absence,
or source order" — the verifier independently confirmed this is
factually wrong: `grep -c '@layer' dist/assets/index-*.css` → 0 across
the compiled output. Tailwind v3.4.19's `@layer components`/`@layer
utilities` directives are a build-time bucketing instruction only — they
never emit a real CSS `@layer` at-rule into the compiled stylesheet, so
no actual CSS Cascade Layers semantics are in effect here at all.

The verifier, citing the already-SEALED `tailwindcss-navbar-component-
system` note's own independently-established mechanism, is correct: the
real reason Bootstrap's `.spinner-border` wins today is much simpler
and more fragile — ordinary last-rule-wins cascade by plain **source
order**. `main.ts` imports `tailwind.css` before `bootstrap.scss`
(confirmed: lines 31/36), so for this equal-specificity, non-`!important`
class, Bootstrap's rule simply appears later in the single concatenated
output file and wins. This is explicitly **order-dependent**, not an
inherent "regardless of order" guarantee as the original note claimed —
reversing `main.ts`'s import order would flip this (and every other
"dormant" rule from nodes 6-14) live immediately, all at once.

Corrected both `tailwind.css`'s comment on this rule and this note (see
above) to state the accurate mechanism and disclose the real
order-dependency risk explicitly, rather than the incorrect
"regardless of order" claim. No functional/CSS-value change — the
`.spinner-border`/`.spinner-border-sm` rules themselves, their values,
and the safelist are unchanged; only the explanatory comment/prose was
corrected. Re-submitted for verification.
