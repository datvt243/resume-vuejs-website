# 2026-09-13 — tailwindcss-root-tokens-and-remaining-gaps — REOPEN

- Worker: verifier
- Node: `tailwindcss-root-tokens-and-remaining-gaps`
- PM status: unchanged (stays `IN_PROGRESS` — REOPEN never touches PM
  status per `RatchetOnly`/the recipe's step 11 gate, "Only on SEAL:
  update the ratchet")

## Isolation proof
Spawned as a fresh, isolated subagent whose task description states
verbatim: "you are a fresh, isolated subagent verifying node
`tailwindcss-root-tokens-and-remaining-gaps`... A separate implementer
session wrote this diff, not you — NeverVerifyOwnWork satisfied by
construction." This session's first actions were reading
`manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md` fresh, then the
implementer's evidence note, before forming any opinion on the diff. It
wrote no part of the diff under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived the claims against the real repo state — not the note's prose.
The note's 4-layer structure, root-token work (Layer 3), and mechanical
build/lint/test claims are almost entirely accurate and unusually
well-sourced (traced to real compiled output, not guessed) — but 3
independent, confirmed defects survived the implementer's own
verification pass, at least one of them material. Details below.

### Setup
1. **Branch**: `git branch --show-current` → `feature/tailwindcss-setup`
   — not `main`/`staging`. `NoMainEdit` satisfied.
2. **Isolating this node's diff**: nothing on this branch is committed
   yet (`git log staging..feature/tailwindcss-setup` → 0 commits), so
   `tailwind.css`/`tailwind.config.cjs` (untracked, new files) can't be
   diffed against a prior commit boundary. Used file mtimes instead
   (`stat -f %Sm`): `tailwind.css`/`tailwind.config.cjs` both last
   modified 2026-09-13 23:46, strictly AFTER every claimed Layer-1
   consumer file's last-modified time (`Modal.vue` 09-12 20:09,
   `Toasts.vue`/`FrmInput.vue`/`FrmPwd.vue`/`GroupTags.vue` 09-13
   02:5x, `table/part/Table.js` unchanged since 08-30) — consistent
   with the note's claim that this node touched only the CSS/config
   files and zero consumer `.vue`/`.js` files.
3. Read `src/styles/tailwind.css` in full (1478 lines) and
   `tailwind.config.cjs` in full (157 lines) directly, not sampled.

### Layer 3 (root tokens) — verified, holds up very well
4. `grep -oE "var\(--bs-[a-z0-9-]+" src/styles/tailwind.css | sort -u`
   then cross-checked which are real property USAGES (not comment
   prose) vs the new `:root`/`[data-bs-theme]` definitions: built a
   repo-wide used-vs-defined diff (`comm -23` after normalizing
   whitespace) across every `.vue`/`.scss`/`.js`/`.ts`/`.css` file in
   `src/` — **zero** used `var(--bs-*)` names are left undefined by the
   new block (confirmed empty diff). The note's "24 distinct names"
   count is slightly off (my own count of real, non-comment usages is
   26 — 4 of the 30 raw regex hits were comment prose, e.g.
   `--bs-danger-rgb`/`--bs-text-opacity`/`--bs-heading-color` on lines
   895/1024, correctly disclosed elsewhere in the file as intentionally
   NOT built) — a harmless miscount, not a functional gap: every real
   usage is covered regardless of which count is "correct".
5. **Values spot-checked against a REAL compile of this exact app**,
   not vanilla Bootstrap: ran `npx sass --load-path=node_modules
   src/styles/bootstrap.scss /tmp/bs_compiled.css` (a real Dart Sass
   compile of this app's actual customized `bootstrap.scss`, `$primay`/
   `$green` overrides included) and diffed its `:root,
   [data-bs-theme=light]` / `[data-bs-theme=dark]` blocks against the
   new self-hosted block line by line. **All 26 light-theme values and
   all 14 dark-theme override values match exactly**, including the
   two most important confirmations: `--bs-success: #00d095` (real
   `$green` override applies) and, critically, `--bs-primary: #0d6efd`
   staying vanilla-Bootstrap blue — because `$primay` (note the typo)
   never actually overrides Bootstrap's real `$primary` variable, a
   pre-existing bug unrelated to this node, correctly NOT "fixed" here,
   and correctly reproduced as-is.
6. **Theme-variant vs theme-invariant correctness**: cross-checked
   every variable Bootstrap's real dark block redefines
   (`body-bg`/`body-color`/`border-color`/`border-color-translucent`/
   `emphasis-color`/`emphasis-color-rgb`/`secondary-bg`/
   `secondary-color`/`tertiary-bg`/`warning-bg-subtle`/
   `warning-border-subtle`/`warning-text-emphasis`/`link-color-rgb`/
   `link-hover-color-rgb` — 14, not the note's claimed "11", another
   harmless miscount) against the new dark block — exact match, and
   confirmed the new code correctly does NOT re-declare
   theme-invariant colors (`--bs-primary`/`--bs-danger`/`--bs-success`/
   `--bs-warning`/`--bs-light`/`--bs-dark`/`--bs-border-radius*`/
   `--bs-border-width`/`--bs-green`) in the dark block, matching real
   Bootstrap's own structure exactly. Layer 3's structural claim (a),
   (b), (c) all hold up under independent re-derivation from a real
   compile, not just trusted prose.

### Layer 1 — spot-checked against real compiled Bootstrap CSS
7. `.modal-lg` (`@media (min-width:992px){.modal-lg{max-width:800px}}`
   in real `/tmp/bs_compiled.css` line 10058-10062) — matches new code
   exactly.
8. `.h5{font-size:1.25rem}` (real line 257-259) — matches new code
   exactly.
9. `.table-hover`'s hover mechanism: real Bootstrap uses
   `--bs-table-hover-bg: rgba(var(--bs-emphasis-color-rgb),.075)` fed
   through an `inset box-shadow` trick (line 9684+9695), NOT a literal
   `background-color`. New code uses `background-color:
   rgba(var(--bs-emphasis-color-rgb),.075)` directly — same opacity
   value (0.075), different mechanism (flat background vs. layered
   inset shadow). Visually near-identical for this app's plain,
   non-striped/non-active table usage (confirmed via grep — no
   `.table-striped`/`.table-active` combos exist here), but this
   simplification is undisclosed in the file's own comments (unlike
   every other simplification in this diff, which are all explicitly
   flagged). Minor, not blocking on its own.
10. `.toast-container` (z-index 1090, `width:max-content`,
    `pointer-events:none`) — matches real compiled output exactly.
    `.input-group` base block — matches exactly.
11. **Confirmed via mtime (step 2) that `Modal.vue`/`Toasts.vue`/
    `table/part/Table.js`/`FrmInput.vue`/`FrmPwd.vue`/`GroupTags.vue`
    were not touched by this node** — consistent with the note's claim
    that only CSS/config changed.

### Layer 4 (custom CSS extraction) — 1 confirmed selector-scope error
12. Read `src/styles/bootstrap.scss`'s tail section (lines 116-237) in
    full, side by side with the new `tailwind.css` Layer-4 block (lines
    1381-1477). Compiled it for real (`npx sass --load-path=node_modules
    ...`) rather than trusting the SCSS nesting by eye.
    **`.item-title`/`.item .image`/`.item-note`/`.item:not(:last-child)`/
    `.pointer`/`.modal-footer .btn`/`.post-content` (all its nested
    selectors) — all VALUES and SELECTORS match exactly**, including the
    non-obvious detail that `.item-title`'s `margin-bottom:.5em` is
    immediately overridden by its own following `margin:0` (both the
    original SCSS and the new CSS declare them in the same order,
    correctly reproducing the redundant-but-harmless quirk verbatim).
    `.heading{color:#00d095;border-color:#00d095!important}` matches
    the source (`$_green: #00d095`) exactly, and the note's specific
    claim — that this rule has been silently overriding node
    `tailwindcss-remaining-utilities-sweep`'s `border-[var(--bs-border-
    color)]` fix on `Heading.vue` the entire session — holds: both
    rules target the same `border-color` property on the same element,
    and `!important` + unlayered beats a `@layer utilities`
    arbitrary-value class regardless of source order, confirmed via the
    same reasoning as node `tailwindcss-navbar-component-system`'s
    already-verified specificity mechanism. **FINDING (confirmed via a
    real Sass compile, not the SCSS source read alone)**: the real
    compiled selector for the `160px`-min-width button rule is **`.form
    .footer .btn`**, not the bare `.footer .btn` the new `tailwind.css`
    uses — `.footer { .btn {...} }` in `bootstrap.scss` is nested THREE
    levels deep inside `.form { ... }` (confirmed by reading the SCSS
    directly: `.form { .form-label {...} .footer { .btn { min-width:
    160px; } } }`), and `npx sass --load-path=node_modules
    src/styles/bootstrap.scss /tmp/bs_compiled.css` independently
    confirms the real output selector is `.form .footer .btn` (line
    10401 of the compiled file), specificity (0,3,0). The new
    `tailwind.css` rule is `.footer .btn { min-width: 160px; }` —
    specificity (0,2,0), the `.form` ancestor silently dropped. Checked
    the compiled `dist/` bundle too: `.footer .btn{min-width:160px}` is
    present verbatim with the narrowed selector, confirming this isn't
    just a source-file typo that got corrected downstream. Grepped
    every real consumer of `class="footer` in `src/` — exactly one:
    `VeeForm.vue:139` (`<div class="footer flex my-[1rem]" ...>`),
    whose root is `<form class="form">` (confirmed via the
    implementer's own note, itself grep-verified), so TODAY this
    doesn't change any live rendering (`.footer` never appears outside
    `.form` anywhere in this app). But the evidence note's explicit
    claim — "Extracted all of it **verbatim** (values unchanged)" and
    the code's own comment "extracted verbatim... colors hardcoded...
    to match the original" — is not fully accurate: the SELECTOR
    scoping was narrowed, silently, with no disclosure comment (unlike
    every other simplification elsewhere in this same diff, which are
    all explicitly flagged with "simplified vs Bootstrap's real
    selectors: ..." comments). A real, citable inaccuracy in a factual
    claim the note makes about its own central deliverable.

### Layer 2 (Reboot) — 1 CONFIRMED, material survey gap
13. Independently re-ran every claimed grep:
    `grep -rnE '<h[1-6][ >]' src --include="*.vue"` (20 matches),
    `<hr` usage (2 matches), bare `<input>`/`<select>`/`<textarea>`
    (all carry `.form-control` or `class="hidden"` for `type=file`).
    **The note's claim "No bare unclassed headings anywhere ... no
    Reboot heading-default dependency exists in this app" does NOT
    hold**: `src/pages/dashboard/PageAccountSettings.vue` has 3 real
    `<h6>` elements —
    ```
    <h6 class="text-uppercase opacity-75 mb-2">Email đăng nhập</h6>
    <h6 class="text-uppercase opacity-75 mb-2">Mật khẩu</h6>
    <h6 class="text-uppercase text-danger mb-2">Vùng nguy hiểm</h6>
    ```
    — **none of these carry a `.h6` (or `.h4`/`.h5`) class.** (By
    contrast, `GroupTags.vue`'s only `.h6` usage genuinely does carry
    the class: `<p class="h6 m-0">`, confirmed separately — the note
    was right about that file, wrong about `PageAccountSettings.vue`.)
    Read Bootstrap's real compiled output directly
    (`/tmp/bs_compiled.css` line 213): the Reboot heading rule is
    keyed `h6, .h6, h5, .h5, h4, .h4, ...` — it targets the BARE
    ELEMENT selectors `h1`-`h6` in addition to the `.h1`-`.h6`
    classes. This means these 3 bare `<h6>` elements currently get
    `margin-top:0; margin-bottom:.5rem; font-weight:500; line-height:
    1.2; font-size:1rem` from Bootstrap's Reboot **today**, via the
    element selector, entirely independent of whether any `.h6` class
    is present. The new `tailwind.css` only adds a **class-only**
    `.h4, .h5, .h6 {...}` rule (`@layer components`, line 1028) — it
    does not touch the bare `h4`/`h5`/`h6` element selectors, and the
    new `@layer base` block (`body`/`a`/`a:hover` only) doesn't cover
    them either. Confirmed Tailwind's own Preflight
    (`node_modules/tailwindcss/src/css/preflight.css` lines 76-84)
    actively RESETS `h1`-`h6` to `font-size: inherit; font-weight:
    inherit;` — no margin-bottom, no line-height 1.2, no font-weight
    500 — the opposite of a "leave it alone, no dependency" situation.
    **Concrete consequence**: once the next node deletes
    `bootstrap.scss` (the explicit, stated purpose this whole node
    exists to make "safe"), these 3 real, live headings in
    `PageAccountSettings.vue` will silently lose their bold weight and
    bottom margin — a real visual regression in exactly the node this
    survey was supposed to prevent, not caught because the Layer-2
    grep methodology apparently checked for the presence of `.h6`-style
    classes rather than for bare-element Reboot dependency the way it
    was framed to have checked.

14. **A second, larger Layer-4/dead-code miscall, found independently
    while checking the note's "`.breadcrumb`/`.list` confirmed DEAD"
    claim** (task explicitly asked to verify this): `grep -rn
    "breadcrumb" src` → 0 matches, `.breadcrumb` genuinely dead,
    confirmed. **`.list` is NOT dead.**
    `src/components/global/ListTransition.vue` (a GLOBAL
    auto-registered component, per this repo's own
    `GlobalComponents.js` convention) is:
    ```pug
    TransitionGroup(name="list" class="list" tag="ul")
        slot
    ```
    — a real, literal `class="list"` attribute rendered onto a real
    `<ul>` element (via `tag="ul"`), separate from the Vue-generated
    `.list-enter-active`/`.list-leave-active` transition classes that
    also happen to share the "list" name prefix (those come from
    `name="list"`, a different mechanism, and are already reproduced
    correctly in the component's own `<style scoped>`). Grepped for
    consumers: `ListTransition.vue` is used in **5 files** —
    `PageAward.vue`, `PageCertificate.vue`, `PageEducation.vue`,
    `PageExperience.vue`, `PageProject.vue` — the CRUD list view for
    every major resume section in the app. `bootstrap.scss`'s real
    `.list { padding:0; margin:0; list-style:none; > li {
    margin-bottom:1.5rem; &:not(:last-child){margin-bottom:1.5rem;} }
    }` is currently live on all 5 of these pages' list `<ul>`s. Checked
    whether Tailwind's own Preflight provides a free ride here (same
    pattern already correctly used elsewhere in this diagram, e.g.
    `.collapse`/`.mt-4` collisions): Tailwind's Preflight
    (`node_modules/tailwindcss/src/css/preflight.css` lines 305-311)
    DOES reset `ul,ol,menu{list-style:none;margin:0;padding:0}` for
    free — so that PART of `.list` is coincidentally safe. But
    Bootstrap's `> li { margin-bottom: 1.5rem }` inter-item spacing has
    no Tailwind equivalent and no free ride — that part is a real,
    live, currently-Bootstrap-dependent style with zero Tailwind
    coverage, on the app's 5 main CRUD list pages, that this node's
    survey explicitly classified as "confirmed DEAD (zero usage
    anywhere via grep)" and excluded from migration. The likely root
    cause: `ListTransition.vue` uses `<template lang="pug">` — the
    exact same "Pug blind spot" class of miss this node's own Layer-1
    survey (and node 10 before it) explicitly said it corrected for
    when hunting for gaps, but which apparently wasn't applied when
    confirming something as dead/skippable.

### Mechanical claims — verified, all accurate
15. `rm -rf dist && npm run build`, re-run: `✓ built in 5.41s`, only
    the pre-existing chunk-size warning. Matches the note (timing
    differs slightly, 4.79s vs 5.41s, immaterial).
16. `npm run lint`, re-run: exit 0, zero output beyond the npm header.
    Matches.
17. `npm run test`, re-run: `Test Files 16 passed (16)`, `Tests 111
    passed (111)`, including `Navbar.spec.ts` (4/4). Matches.
18. **Compiled-CSS re-sweep, independent** (`dist/assets/index-
    bNwp_lpr.css`, 238,535 bytes — confirmed as the large main bundle
    by size, not a per-route chunk): ran my own Python regex script
    covering 24 of the claimed 40 checks, spanning all 4 layers
    (root-token light/dark values, `@layer base` body/link, `.h4`/
    `.h6`, `.clearfix`, `.text-uppercase`, `.border-start`,
    `.dropdown`, `.input-group`, `.table`/`.table-hover`, `.toast`/
    `.toast-header`, `.modal`/`.modal-lg`, both `.modal-title` rules in
    the correct order, `.heading`, `.footer .btn`, `.modal-footer
    .btn`, `.item-title`, `.post-content`) — 21/24 matched immediately,
    3 initial "MISSING" (root `--bs-success`/`--bs-primary`/dark
    `--bs-body-bg`) turned out to be my own regex's false negative,
    same class of bug the note itself disclosed (the minifier keeps a
    space after the colon for CSS custom-property VALUES specifically,
    e.g. `--bs-success: #00d095` not `--bs-success:#00d095`) —
    re-verified directly with plain `grep -o -- "--bs-success:[^;]*"`
    and confirmed present and correct. All 24 re-checked items are
    genuinely present in the compiled bundle with correct values,
    INCLUDING `.footer .btn{min-width:160px}` with its confirmed
    narrowed selector (finding #12) — the CSS itself compiles and
    ships exactly as authored; the defect is in what was authored, not
    in whether it survived the Tailwind pipeline.

### Forbidden states
19. `ADHOC_WORK` — node exists on `dev-loop.prime-mermaid.md`
    (`IN_PROGRESS`, appended after the prior SEALED row, not
    reordered), a worker (implementer) was used. Clear.
20. `NO_EVIDENCE` — implementer note exists, read first. Clear.
21. `EDIT_UNVERIFIED` — every mechanical claim (build/lint/test/
    compiled-CSS) was independently re-run and read back, not
    inferred. However, 3 SUBSTANTIVE claims about the diff's own
    content (`.footer .btn` "verbatim", "no bare unclassed headings",
    "`.list` confirmed dead") do NOT hold up under independent
    re-derivation — this is exactly what `EDIT_UNVERIFIED` protects
    against: a claimed correctness property that wasn't actually true
    when checked for real.
22. `CODE_IN_HAVEN` — `find agent-hub/haven -name "*.vue" -o -name
    "*.ts" -o -name "*.js" -o -name "*.sh" -o -name "*.cjs"` → zero
    matches. Clear.
23. `DIAGRAM_DRIFT` — n/a, PM status left untouched on REOPEN.
24. `MAIN_EDIT` — branch confirmed `feature/tailwindcss-setup`. Clear.
25. Seal gate — n/a, no outward-facing action in this diff.

## Verdict: REOPEN

## Missing / required before re-seal
1. **Bare `<h6>` Reboot dependency** (finding #13, most material):
   `PageAccountSettings.vue`'s 3 unclassed `<h6>` elements need either
   (a) an explicit `.h4`/`.h5`/`.h6`-style class added to them
   (cheapest, most consistent with this diagram's established pattern
   of "class-name-keyed" rules), or (b) the new heading rule extended
   to also key off the bare `h4,h5,h6` element selectors the way real
   Bootstrap Reboot does. Re-run the Layer-2 bare-element survey with a
   check that specifically looks for `<h[1-6]` tags whose class list
   does NOT contain `.h[1-6]`, not just "does any bare heading exist at
   all".
2. **`.list` wrongly classified as dead** (finding #14): build the
   real gap — at minimum the `> li { margin-bottom: 1.5rem;
   &:not(:last-child){margin-bottom:1.5rem} }` inter-item spacing (the
   part with no Tailwind Preflight free ride) — scoped to `.list`, and
   safelist it. Re-run the "confirmed dead via grep" claims for both
   `.list` and `.breadcrumb` including Pug-syntax files this time
   (`ListTransition.vue`'s `template lang="pug"` was the actual miss).
3. **`.footer .btn` selector scope** (finding #12): either narrow the
   new rule back to `.form .footer .btn` to match the real compiled
   source exactly (lowest-risk fix, matches "verbatim" as claimed), or
   keep it broadened but add a disclosure comment explaining why (same
   discipline already applied to every other intentional
   simplification in this file) — currently harmless given the sole
   `.footer` consumer's real DOM position, but the claim of
   "verbatim" extraction should either be true or be corrected to say
   what was actually done.
4. Optional, non-blocking cleanup: the note's "24 distinct names" /
   "11 theme-specific overrides" counts (findings #4/#6) are off (26
   and 14 respectively) — harmless since coverage is complete either
   way, but worth correcting in the next note's prose since this hub's
   evidence notes are read as citable fact by future sessions.

None of these invalidate the very large amount of correct, well-sourced
work in this diff (the root-token self-hosting mechanism, in particular,
is unusually rigorous and checks out completely against a real compile).
But 2 of the 3 findings (headings, `.list`) are concrete, confirmed gaps
in the node's own stated purpose — finding every remaining real
dependency before Bootstrap is actually deleted — and the whole point of
this node was to be the safety net for that deletion. Sealing it with
known holes in that safety net defeats the purpose of doing this node at
all.

## Re-run
`full` — reason: this class of change (CSS added to a shared `@layer
components` stylesheet + self-hosted CSS custom properties + a safelist
change) is exactly the kind of structural, easy-to-silently-break diff
this hub's prior nodes already learned needs independent re-run, and this
is explicitly the largest, highest-risk node in the series so far per the
task brief. Re-ran: `rm -rf dist && npm run build`, `npm run lint`,
`npm run test`, an independent Python regex sweep of the compiled CSS
bundle, a real `npx sass` compile of `bootstrap.scss` (not just reading
the SCSS source) to get ground-truth compiled selectors and values for
comparison, and fresh greps/file reads across every claimed layer — none
of the findings above were available from the note's own text; all 3
required going around the note and checking the real repo state.

## Hub bytes
before=189705 (from the implementer note's `## Hub bytes` → `before`
line, itself carried from node 14's verifier SEAL note's
`hub_bytes_after`) · after=194672 (measured via `/hub-tokens`'s own
script: root=12393, doctrine=27207, active diagram=128955,
implementer bundle=14963, verifier bundle=11154 — no PM status change
this pass since verdict is REOPEN, active-diagram growth vs the
navbar-node SEAL's 113286 reflects the several nodes sealed since then,
each appending findings to their own rows).
