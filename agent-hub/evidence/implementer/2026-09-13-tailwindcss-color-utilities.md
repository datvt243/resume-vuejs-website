# 2026-09-13 — tailwindcss-color-utilities

- Worker: implementer
- Node: `tailwindcss-color-utilities`
- Branch: `feature/tailwindcss-setup` (same ongoing migration branch)
- Status: sealed_pending_verifier

## Task
Node 13 of the Bootstrap→Tailwind migration (operator: "tiếp tục",
standing "tiếp tục cho tới khi xong" directive), continuing from node 12
(SEALED). Next deferred item: "remaining color-semantic utilities
(`.bg-body-tertiary`, `.text-success`/`.text-info`/`.text-danger`,
`.border-success`)", flagged since node 2.

## Survey — corrected an earlier under-count
Prior nodes' surveys of these classes used a Pug-dot-chain-only regex
(`\.text-danger` requiring a literal leading dot), which only ever
matched 5 total usages across 2 files. Re-ran the sweep correctly this
time, covering `class="..."` attribute usage WITHOUT requiring a leading
dot (since inside a quoted attribute, tokens are space-separated, not
dot-prefixed) — found the real scope is much larger: **~20 usages across
14 files**, not 5. Full breakdown by class:
- `.text-danger`: `GroupTags.vue`, `VeeFormGeneralInformationUpdate.vue`,
  6 of the `Frm*.vue` partials (`FrmCurrency`/`FrmArray`/`FrmDatePicker`/
  `FrmCkediter`/`FrmSelect`/`FrmPwd`/`FrmInput`/`FrmTextArea`/`FrmDate` —
  the shared field-error-message paragraph), `PageResetPassword.vue`,
  `PageReference.vue`, `PageAccountSettings.vue`, `Header.vue`.
- `.text-success`: `Header.vue`, `Spinner.vue`, `FrmPwd.vue`,
  `LayoutDefault.vue` (dynamic `:class`).
- `.text-info`: `Header.vue`.
- `.text-warning`, `.text-primary`: `PageReference.vue` (one each).
- `.border-success`: `ItemTemplate.vue` (already correctly left bare/
  deferred per node 10's evidence), `PageGeneralInformation.vue`.
- `.border-danger`: `PageAccountSettings.vue`.
- `.bg-body-tertiary`: `Header.vue`, `Navbar.vue`.

Also found, confirmed NOT in scope:
- `PageHome.vue`'s `text-bg-success-subtle` — grepped Bootstrap's real
  compiled CSS (`node_modules/bootstrap/dist/css/bootstrap.css`) for any
  `text-bg-*-subtle` rule: **does not exist**. Bootstrap only generates
  `.text-bg-{primary,secondary,success,info,warning,danger,light,dark}`
  (solid, no subtle variant combining text+bg). This class is already
  dead/inert in the app today — not a migration target, left untouched
  rather than invented into new behavior.
- `.spinner-border`/`.spinner-border-sm` (`Spinner.vue`) — a real
  Bootstrap component (loading-spinner animation), but a completely
  separate system from color utilities. Logged as a new, separate
  follow-up item, not touched here.

## Key finding: these classes are Bootstrap UTILITIES, not components — different mechanism than every prior node
Checked Bootstrap's real compiled output
(`node_modules/bootstrap/dist/css/bootstrap.css`) for how these classes
are actually emitted:
```css
.text-danger { --bs-text-opacity: 1; color: rgba(var(--bs-danger-rgb), var(--bs-text-opacity)) !important; }
.border-success { --bs-border-opacity: 1; border-color: rgba(var(--bs-success-rgb), var(--bs-border-opacity)) !important; }
.bg-body-tertiary { --bs-bg-opacity: 1; background-color: rgba(var(--bs-tertiary-bg-rgb), var(--bs-bg-opacity)) !important; }
```
All carry `!important` — unlike `.btn`/`.dropdown-menu`/`.badge`/
`.alert`/`.form-control` (Bootstrap COMPONENT classes, no `!important`)
from every prior component node. Since `bootstrap.scss` is still
imported (dual-framework, by design) and none of these class names were
ever renamed away from Bootstrap's own names, **Bootstrap's own
`!important` rule already wins today, unconditionally, regardless of
anything added in this node** — the exact same mechanism as the
`.mt-4` collision found in node `tailwindcss-auth-pages`, just inverted:
there it was an unwanted collision to dodge (via arbitrary values);
here it's a guaranteed-safe dormancy for free.

**Decision**: build the Tailwind-side `@layer components` equivalents
now anyway, WITHOUT `!important`, so they sit fully dormant today (zero
live-visual risk, verified below) and activate automatically the moment
Bootstrap's own CSS is deleted at the final removal node — same
"build now, reuse the same class name, activate later" strategy as
nodes 6-9's `.btn`/`.dropdown-menu`/etc., just with the dormancy
mechanism being cascade weight (`!important` vs none) instead of
`@layer` ordering this time. This resolves the "needs a color/dark-mode
token decision" note carried since node 2 — the actual decision is:
reuse `var(--bs-*)` root-scoped tokens directly (same as every other
color in this migration), no new decision was really needed once the
dormancy mechanism was understood.

## Design
```css
.text-primary   { color: var(--bs-primary); }
.text-success   { color: var(--bs-success); }
.text-info      { color: var(--bs-info); }
.text-warning   { color: var(--bs-warning); }
.text-danger    { color: var(--bs-danger); }
.border-success { border-color: var(--bs-success); }
.border-danger  { border-color: var(--bs-danger); }
.bg-body-tertiary { background-color: var(--bs-tertiary-bg); }
```
All 8 `var(--bs-*)` tokens confirmed root/`[data-bs-theme]`-scoped via
Bootstrap's compiled CSS (same as every prior node's color choices), so
dark mode stays automatic once activated.

Simplified vs Bootstrap's real output (confirmed via grep — none of
these are ever exercised in this app):
- Omitted the `--bs-text-opacity`/`--bs-border-opacity`/`--bs-bg-opacity`
  CSS custom-property indirection — nothing in `src/` ever sets/reads
  those variables, so a flat color value is behaviorally equivalent for
  every current use.
- Omitted the `-emphasis`/`-subtle` variant classes — confirmed unused.

**Zero consumer-file edits needed** — same "keep the class name, change
the CSS source" strategy as every prior component/utility node. All 8
classes added to `tailwind.config.cjs`'s `safelist`.

## Verification
1. `rm -rf dist && npm run build` → `✓ built in 4.78s`, only the
   pre-existing chunk-size warning.
2. `npm run lint` → exit 0, clean.
3. `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
   (111)`.
4. Compiled main CSS bundle (`dist/assets/index-*.css`) checked via
   Python regex: all 8 new dormant rules present
   (`.text-primary{color:var(--bs-primary)}` etc, `.border-success{border-color:var(--bs-success)}`,
   `.border-danger{border-color:var(--bs-danger)}`,
   `.bg-body-tertiary{background-color:var(--bs-tertiary-bg)}`).
5. **Dormancy independently confirmed, not just asserted**: located
   BOTH the new dormant rule and Bootstrap's real `!important` rule for
   `.text-danger` in the same compiled file — mine at an earlier byte
   offset (`.text-danger{color:var(--bs-danger)}`, from `tailwind.css`,
   imported first in `main.ts`), Bootstrap's real one later
   (`.text-danger{--bs-text-opacity: 1;color:rgba(var(--bs-danger-rgb),var(--bs-text-opacity))!important}`,
   from `bootstrap.scss`, imported second) — confirming Bootstrap's
   `!important` rule wins regardless of source order, exactly as
   predicted, zero live-visual change from this diff.
6. Forbidden states: branch = `feature/tailwindcss-setup` (`MAIN_EDIT`
   clear). Node added to `dev-loop.prime-mermaid.md` before this note
   (`ADHOC_WORK` clear). This note exists (`NO_EVIDENCE` clear). No
   `.vue`/`.js`/`.ts` under `haven/` (`CODE_IN_HAVEN` clear).
   `EDIT_UNVERIFIED` avoided — every claim actually run and read back.

## Deferred / follow-up
- `.spinner-border`/`.spinner-border-sm` (`Spinner.vue`) — separate
  component system (loading-spinner animation), not colors. New item,
  not previously logged.
- Final Bootstrap removal — still untouched; this is the node where
  today's dormant rule (this node's 8 classes, plus grid/navbar/
  buttons/dropdowns/badges/alerts/forms from nodes 6-12) all activate
  at once. Real visual QA required then.

## Verification gap, disclosed
No live browser session available this session (same limitation as
nodes 4/7/10/11/12). Mitigated the same way: exhaustive compiled-CSS
presence + dormancy-order checks rather than assumption. Dormancy here
is actually MORE certain than prior nodes' live changes, since it rests
on `!important` cascade weight (unconditional) rather than needing a
live render to confirm visually.

## Hub bytes
before=179179 (from node 12's verifier SEAL note's `hub_bytes_after`) ·
after not yet measured — verifier to measure at SEAL/REOPEN time.

## CORRECTION (post-REOPEN)
Verifier REOPENed on evidence-accuracy grounds
(`evidence/verifier/2026-09-13-tailwindcss-color-utilities-reopen.md`):
the "Survey" section's headline count ("~20 usages across 14 files")
contradicted its own itemized per-class breakdown just below it, which
in fact correctly lists all the real files — the summary line was wrong,
not the underlying list or the code. Independently re-counted:
```
grep -rlE '\b(text-primary|text-success|text-info|text-warning|text-danger|border-success|border-danger|bg-body-tertiary)\b' src --include="*.vue" | wc -l   → 20
grep -rnE '\b(text-primary|text-success|text-info|text-warning|text-danger|border-success|border-danger|bg-body-tertiary)\b' src --include="*.vue" | wc -l   → 27
grep -l "text-danger" src/components/veevalidate/part/Frm*.vue | wc -l                                                                                        → 9
```
Corrected counts: **20 files, 27 occurrences** (not "~20 usages across 14
files"), and **9 of the `Frm*.vue` partials** carry `.text-danger` (not
"6 of") — `FrmCheckbox.vue` is the one partial without it, everything
else in that directory has it. The itemized per-class breakdown further
up in this note already named all 20 files correctly; only the headline
summary sentence was wrong. No code change — the diff itself
(`tailwind.config.cjs`, `src/styles/tailwind.css`) is unaffected and was
independently re-verified as still correct by the same verifier pass
before it REOPENed on this documentation point alone. Re-submitted for
verification.
