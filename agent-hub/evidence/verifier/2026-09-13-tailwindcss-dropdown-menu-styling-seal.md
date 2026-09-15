# 2026-09-13 — tailwindcss-dropdown-menu-styling (verdict)

- Worker: verifier
- Node: `tailwindcss-dropdown-menu-styling`
- New PM status: SEALED

## Isolation proof
This verdict was produced by a subagent launched via the Agent tool with
task string `/worker verifier "tailwindcss-dropdown-menu-styling"` and an
explicit instruction set that names this as "a fresh, isolated subagent
verifying node `tailwindcss-dropdown-menu-styling`... A separate
implementer session wrote this diff, not you." This session never wrote
any part of `src/styles/tailwind.css` or `tailwind.config.cjs` — it only
read them. `NeverVerifyOwnWork` satisfied by construction (fresh spawn,
no implementer context carried over).

## Reasoning
Per the operator's explicit exhaustive-check instruction (citing the
prior node's REOPEN from sampling), this pass did a FULL independent
re-derivation rather than an audit-only read of the note.

1. **5 new CSS rule groups** — read `src/styles/tailwind.css` directly
   (both files are untracked, so `git diff` shows nothing on them —
   confirmed via `git status --porcelain`; read as whole files instead).
   Found, verbatim, exactly as the note quotes:
   `.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;margin-top:.125rem;...}`,
   `.dropdown-item{...}`, `.dropdown-item:hover,.dropdown-item:focus{...}`,
   `.dropdown-item.disabled,.dropdown-item:disabled{...}`,
   `.dropdown-divider{...}`.
2. **Safelist** — read `tailwind.config.cjs` directly: confirmed
   `dropdown-menu`, `dropdown-item`, `dropdown-divider`, `disabled` are
   present, appended after the prior 22 entries (counted: `btn`,
   `btn-sm`, 8 solid + 8 outline color variants, `btn-group`,
   `btn-group-sm`, `dropdown-toggle`, `dropdown-toggle-split` = 22;
   + 4 new = 26 total).
3. **Central "real live bug" claim, verified independently** — read
   `node_modules/bootstrap/scss/_dropdown.scss` directly (lines 19-70,
   the base `.dropdown-menu` rule): confirmed it declares NO `top`/`left`
   anywhere in its own body; the only `top: 100%; left: 0; margin-top:
   var(--#{$prefix}dropdown-spacer);` block for `.dropdown-menu` is at
   line 65, nested inside `&[data-bs-popper] { ... }`. Grepped the whole
   `node_modules/bootstrap/scss/` tree for `data-bs-popper` — only
   appears inside `_dropdown.scss`, always as an attribute-selector gate,
   never set by any Bootstrap SCSS itself (SCSS can't set runtime
   attributes — only Bootstrap's JS can). Read `src/components/global/
   Dropdown.vue` in full (already rewritten in
   `tailwindcss-dropdown-toast-navbar`) — no `Dropdown` JS class
   instantiation, no `data-bs-popper` anywhere; confirmed with `grep -rn
   "data-bs-popper" src/` across the whole source tree — the string
   appears only inside a code comment in `tailwind.css` describing this
   exact fact, never as an actual attribute set on any element. This
   independently confirms the note's crux claim is real, not
   paraphrase-plausible.
4. **Fresh build** — `rm -rf dist && npm run build` → `✓ built in
   6.16s`, same pre-existing "chunks larger than 500 kB" warning only.
5. **Exhaustive grep of compiled CSS, all 5 groups individually** (not
   sampled), against `dist/assets/index-CWQIeRtl.css`:
   ```
   .dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;margin-top:.125rem;min-width:10rem;padding:.5rem 0;color:var(--bs-body-color);background-color:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color-translucent);border-radius:var(--bs-border-radius, .375rem)}
   .dropdown-item{display:block;width:100%;padding:.25rem 1rem;clear:both;font-weight:400;color:var(--bs-body-color);text-align:inherit;text-decoration:none;white-space:nowrap;background-color:transparent;border:0}
   .dropdown-item:hover,.dropdown-item:focus{color:var(--bs-body-color);background-color:var(--bs-secondary-bg)}
   .dropdown-item.disabled,.dropdown-item:disabled{color:var(--bs-secondary-color, #6c757d);pointer-events:none;background-color:transparent}
   .dropdown-divider{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid var(--bs-border-color-translucent);opacity:1}
   ```
   5/5 present, byte-identical to the note's quoted output. 0 missing.
6. **"Not fully dormant" claim, both halves checked separately**:
   - Byte-offset comparison (Python, exact rule-start anchors): new
     `.dropdown-menu{position:absolute;top:100%...}` starts at offset
     **32929** (exact match to the note's claimed 32929); Bootstrap's
     real `.dropdown-menu{--bs-dropdown-zindex:...}` rule (the one
     carrying the color/border/padding vars that actually shadow mine)
     starts at offset **150422** (note claims 150419 — a 3-byte
     discrepancy, negligible, doesn't change the ordering conclusion:
     mine is still ~117KB earlier in the cascade, so color/padding/
     border stay dormant/shadowed as claimed).
   - Separately: grepped EVERY `.dropdown-menu`-related rule in the
     compiled CSS for `top:`/`left:` occurrences. Found them ONLY in (a)
     my unconditional rule, and (b) every `[data-bs-popper]`-gated
     variant (base direction, `-start`/`-end`, all 6 responsive
     breakpoints, `dropup`/`dropend`/`dropstart`). Zero ungated Bootstrap
     `.dropdown-menu` rule declares `top` or `left` anywhere. This
     confirms the position fix is NOT shadowed and takes effect live —
     a separate question from the byte-offset check above, both now
     independently confirmed.
7. `npm run lint` → exit 0 (`eslint src --ext .js,.ts,.vue`, no output,
   clean).
8. `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
   failed | 108 passed (111)` — same 3 pre-existing `VeeForm.spec.ts`
   failures (`clicking submit on a pristine form calls submitFn anyway`,
   the disabled-attribute assertion, the touching+clearing bug test),
   same test names as every prior sealed node in this series — confirmed
   unrelated (this diff touches nothing under
   `src/components/veevalidate/`).
9. **6 forbidden states** — all clear:
   - `ADHOC_WORK`: node exists on `dev-loop.prime-mermaid.md`, evidence
     note exists. Clear.
   - `NO_EVIDENCE`: implementer note exists and was read in full. Clear.
   - `EDIT_UNVERIFIED`: every claim in this note was independently
     re-derived above, not inferred from the implementer's note. Clear.
   - `CODE_IN_HAVEN`: `find agent-hub/haven -type f \( -name "*.ts" -o
     -name "*.js" -o -name "*.vue" -o -name "*.sh" -o -name "*.cjs" \)`
     → empty. Clear.
   - `DIAGRAM_DRIFT`: PM status was `IN_PROGRESS`, now updated to
     `SEALED` in this same pass (see below). Clear.
   - `MAIN_EDIT`: `git branch --show-current` → `feature/tailwindcss-setup`
     (confirmed directly, not just trusted from the note). Clear.
10. **Seal gate**: no outward-facing action (no commit/push/merge) —
    nothing to approve.
11. **Proportionality**: diff is exactly 2 files (`tailwind.css` +
    `tailwind.config.cjs`), scoped to the dropdown styling task, matches
    node 7's stated scope. No opportunistic extra work.

## Missing
None.

## Re-run
`full` — reason: the operator's task explicitly required exhaustive,
non-sampled independent re-verification given the prior node in this
same series (`tailwindcss-button-component-system`) REOPENed for a
sampled check that missed 7/16 silently-dropped rules. Re-ran: `rm -rf
dist && npm run build`, `npm run lint`, `npm run test`, plus direct
reads of `src/styles/tailwind.css`, `tailwind.config.cjs`, `Dropdown.vue`,
and `node_modules/bootstrap/scss/_dropdown.scss` (not just the compiled
output), plus byte-offset and grep-based cascade analysis not present in
the note's own commands.
