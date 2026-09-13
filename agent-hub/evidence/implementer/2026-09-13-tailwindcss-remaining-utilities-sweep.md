# 2026-09-13 — tailwindcss-remaining-utilities-sweep

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-remaining-utilities-sweep` (new node, node 10 of the
  phased Bootstrap → Tailwind migration, follows
  `tailwindcss-form-controls`)
- Task (verbatim): "tiếp tục luôn" (operator, continuing)

## Hub bytes before
156470 (root=12393, doctrine=27207, active diagram grown post-node-9,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-9, still
uncommitted).

## Scope — files touched by this node specifically
(Distinguishing from earlier nodes' still-uncommitted diffs on shared
files, since `git diff --stat` alone can't separate cumulative
uncommitted history — verification should check each file's CURRENT
content for absence of old classes / presence of new ones, not diff
line counts.)

New utility-class edits in this node:
`src/components/GroupTags.vue`, `src/components/Spinner.vue`,
`src/components/global/Heading.vue`, `src/components/global/ItemTemplate.vue`,
`src/components/global/NoData.vue` (already fine, confirmed no change
needed), `src/components/table/TableDefault.vue` (additional edits
beyond node 8's `p-5` fix), `src/components/veevalidate/VeeForm.vue`,
`src/components/veevalidate/VeeFormGeneralInformationUpdate.vue`, all 10
`src/components/veevalidate/part/Frm*.vue` files, `src/pages/_layouts/
{Header,Footer,Main,LayoutDefault,LayoutAuth}.vue`, `src/pages/dashboard/
{PageAccountSettings,PageGeneralInformation,PageInformation,PagePreview,
PageVisits}.vue`, `src/pages/home/PageHome.vue`, `src/pages/public/
PagePublicResume.vue`, `src/pages/auth/PageForgotPassword.vue` (residual
`opacity-75`, confirmed already fine), `src/pages/dashboard/
{PageReference,PageEducation,PageAward,PageProject,PageCertificate}.vue`
(residual `pe-2`/`clearfix`, confirmed already fine/deferred).

Also touched, small single-token fixes only (these files' bulk diff is
from earlier, already-SEALED nodes 3-4 — only 1 new token each here):
`src/components/global/Dropdown.vue` (`visually-hidden`→`sr-only`),
`src/components/Toasts.vue` (`position-fixed`→`fixed`),
`src/components/Navbar.vue` (`flex-grow-1`→`grow`).

## Class mapping — same rules as prior nodes, applied at scale
| Bootstrap | Tailwind | Note |
|---|---|---|
| `small` | `text-sm` | established since node 2 |
| `d-flex` | `flex` | established |
| `d-none` | `hidden` | new this node — different name, no collision either way |
| `d-inline-block` | `inline-block` | established |
| `align-items-center`/`-start` | `items-center`/`items-start` | established |
| `justify-content-center` | `justify-center` | established |
| `flex-grow-1` | `grow` | established (no Tailwind legacy alias exists for this one — verified, see below) |
| `flex-column` | `flex-col` | new this node |
| `w-100`/`h-100` | `w-full`/`h-full` | new this node (none actually found in the end, checked defensively) |
| Bootstrap step 3/4/5 spacing (`mb-3`,`mb-4`,`mb-5`,`mt-3`,`my-3`,`mx-3`,`p-3`,`p-5`,`py-5`,`ps-4`,`pe-3`,`gap-3`,`gap-4`, etc.) | arbitrary value (`mb-[1rem]`, `mb-[1.5rem]`, `mb-[3rem]`, ...) | established since node 2/5/8 — Bootstrap's own step-N collides with Tailwind's own differently-valued step-N |
| Bootstrap step 0/1/2 spacing (`mb-0`,`mb-1`,`mb-2`,`mt-1`,`mt-2`,`me-1`,`me-2`,`gap-2`,`pe-2`, etc.) | unchanged | both frameworks agree exactly for these 3 steps — verified, not assumed |
| `opacity-50`/`opacity-75` | unchanged | verified identical value both frameworks (nodes 2/5) |
| `text-nowrap` | `whitespace-nowrap` | new this node |
| `text-capitalize` | `capitalize` | new this node |
| `rounded-circle` | `rounded-full` | new this node |
| `fw-bold`/`fw-semibold` | `font-bold`/`font-semibold` | new this node |
| `position-fixed` | `fixed` | new this node |
| `visually-hidden` | `sr-only` | new this node |
| `border-bottom`/`border-top` | `border-b`/`border-t` + explicit `border-[var(--bs-border-color)]` | new this node, see color-fidelity note below |
| `flex-shrink-0` | **unchanged** | Tailwind ships this exact name as a legacy-compatible alias (`flex-shrink:0`) — verified via compiled output, NOT assumed symmetric with `flex-grow-1` (which has no such alias, also verified) |

## Color-fidelity fix: border color
Bootstrap's `.border`/`.border-bottom`/`.border-top`/`.border-start`
declare a real, theme-reactive `border-color: var(--bs-border-color)
!important`. Their Tailwind-named equivalents (`border`, `border-b`,
`border-t`, `border-s`) only set border-WIDTH by default — actual border
color falls back to Tailwind's preflight default (a fixed gray,
`currentColor`-based depending on config), NOT theme-reactive. Renamed
these classes AND added an explicit `border-[var(--bs-border-color)]`
alongside each one, matching the same reasoning already applied to
button/dropdown/form colors in nodes 6-9.

**Corrected below** (verifier REOPEN caught this list was wrong — see
`## CORRECTION` at the end of this note): Affects exactly `.heading`
(`Heading.vue`, global, appears on every page), `Header.vue`'s header
bar, `Footer.vue`'s footer — 3 files, not 4.

## 2 systematic blind spots found in the WHOLE session's methodology
Every prior node's file survey used regex patterns anchored to
`class="..."` (a double-quoted HTML/Vue-template attribute). Two real
gaps existed under that assumption, invisible until this node
specifically searched for them:

1. **Vue's `h(tag, { class: '...' })` JS render-function calls.** Found
   3: `TableDefault.vue` (a `d-flex align-items-center` inside a
   `defineComponent({ render() {...} })`), `Heading.vue` (the entire
   component's classes are built this way — see below), `Main.vue`
   (`py-4`, needed the step-4 arbitrary-value fix). These use single
   quotes and a `class:` JS object key, not `class="..."` — regex-invisible
   to every earlier node's survey.
2. **Pug (`lang="pug"`) templates entirely.** Pug's `.classname` dot-chain
   shorthand (`div.foo.bar` ≡ `<div class="foo bar">`) has zero
   `class="..."` text anywhere for classes attached this way — completely
   invisible to every prior grep survey. Found 5 previously-unscanned
   files with real, unconverted Bootstrap classes: `ItemTemplate.vue`
   (global component), `Footer.vue`, `Header.vue`, `LayoutDefault.vue`,
   `LayoutAuth.vue`. `ItemTemplate.vue` and `Heading.vue` in particular
   are GLOBAL components rendered on nearly every page — their Bootstrap
   utility classes had never been touched by any of nodes 1-9 despite the
   migration's stated goal, purely because of this survey-methodology
   gap. Logged clearly here so `doctrine/domains/PROJECT.md` can record
   it as a trap: **file surveys for Bootstrap→Tailwind class usage must
   check `class="..."`, Pug dot-chains, AND JS `class:`/`class=` render
   props — a single regex pattern misses 2 of the 3.**

## Real build-breaking bug caught and fixed
Pug's class dot-chain shorthand does not support square-bracket
arbitrary-value syntax. `.gap-[1.5rem]` written as a dot-chain segment in
`LayoutDefault.vue` threw a real, immediate compile error:
```
unexpected text "[1.5r"
file: .../src/pages/_layouts/LayoutDefault.vue
```
caught directly by `npm run build` failing (not silently broken).
Fixed by moving every bracket-containing class out of the dot-chain into
an explicit `class="..."` attribute on the same tag instead — e.g.
`.dashboard-layout.flex.items-start(class="gap-[1.5rem]")`. Empirically
confirmed Pug's dot-chain DOES tolerate colon-containing classes fine
(`lg:items-center` compiled correctly in `Header.vue` without needing
this workaround) — only brackets are the problem, verified by testing
both forms directly rather than assuming either would work or fail.

## Deferred (logged, not fixed — too large for this node)
- Bootstrap's **grid system** (`.container`, `.row`, `.col`, `.col-auto`,
  `.col-md-*`) — used throughout layouts, a complete flexbox+gutter
  system with its own responsive breakpoint logic. Not touched.
- **Navbar component classes** (`.navbar-nav`, `.nav-link`, `.nav-item`,
  `.navbar-brand`) — a Bootstrap Navbar sub-system, not touched.
- **Remaining color-semantic utilities**: `.bg-body-tertiary`,
  `.text-success`/`.text-info`/`.text-danger`, `.border-success` — same
  deferred category as `PageResetPassword.vue`'s `.text-danger` since
  node 2, needs the color/dark-mode token decision before converting.
- `.item.border.rounded` (`ItemTemplate.vue`) and `.item.border`
  (`Header.vue`'s `bg-body-tertiary`) keep using bare `border`/`rounded`
  without the explicit color-var fix WHERE the value stayed a Bootstrap
  name unchanged (only the RENAMED ones — `border-bottom`→`border-b`
  etc. — got the explicit color treatment, since bare `.border`/`.rounded`
  are same-name-collision classes already dormant-safe per the node
  6-9 pattern, not live-changing).

## Command
```
npm run build
```

## Output
```
✓ built in 6.26s
```
(After fixing the Pug bracket compile error above.) Same pre-existing
"chunks larger than 500 kB" warning only.

Verified every new arbitrary-value/renamed class actually compiled,
correctly accounting for CSS's own escaping of special characters in
class selectors (`.` → `\.`, `[` → `\[`, `]` → `\]`, `(` → `\(`,
`)` → `\)` — my first verification attempt used naively-escaped search
patterns and got false "MISSING" results; redid it accounting for CSS's
real escaping and confirmed all present, e.g.
`.p-\[1\.5rem\]{padding:1.5rem}`, `.border-\[var\(--bs-border-color\)\]
{border-color:var(--bs-border-color)}` both found in the compiled
output).

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 16 passed (16)`, `Tests 111 passed
  (111)` — every test passed this run, including the ones documented as
  flaky since node 4 (`VeeForm.spec.ts`'s 3 known-flaky tests) —
  confirms the flakiness is real timing-dependence, not something this
  diff fixed or broke.

Final exhaustive sweep of the entire `src/` tree, across all 3 syntaxes
(class attr, Pug dot-chain, JS class string), for every tracked
Bootstrap class name and every collision-risk numeric spacing class —
came back fully clean (0 remaining occurrences).

## Acceptance
| Criterion | Evidence |
|---|---|
| Build succeeds (Pug bracket bug fixed) | `✓ built in 6.26s` |
| All new classes compile correctly | Exhaustive grep with correct CSS-escaping, confirmed present |
| No collision-risk numeric class remains anywhere in `src/` | Final sweep, 0 matches |
| No tracked old Bootstrap class name remains in any syntax | Final 3-syntax sweep, 0 matches |
| `flex-shrink-0` correctly left unchanged (real Tailwind alias) vs `flex-grow-1` correctly renamed (no alias) | Both verified individually via compiled output, not assumed symmetric |
| Border color fidelity preserved on renamed border classes | Explicit `var(--bs-border-color)` added, confirmed compiled |
| No new lint/test regressions | Lint exit 0, 111/111 tests (even the usually-flaky ones passed) |

## Noticed, not done
- Grid system, Navbar component classes, remaining color-semantic
  utilities — logged above as deferred, need dedicated future nodes.
- The 2 systematic survey blind spots (Pug templates, JS `class:`
  render props) — worth adding to `doctrine/domains/PROJECT.md` as a
  standing trap for any future Bootstrap-related survey in this repo,
  not just this migration.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-9's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.

---

## CORRECTION — REOPEN and fix (appended, original note above unedited except one inline pointer added to the border-fidelity section)

The verifier REOPENed this node
(`evidence/verifier/2026-09-13-tailwindcss-remaining-utilities-sweep-reopen.md`):
the "Color-fidelity fix: border color" section's "Affects" list
incorrectly included `ItemTemplate.vue`, claiming its left accent
border got the `border-[var(--bs-border-color)]` treatment. Direct
inspection (and the verifier's independent grep) confirms this is
false: `ItemTemplate.vue`'s border classes
(`.border`/`.rounded` on line 48, `.border-start`/`.border-success` on
line 62) were never renamed and never received the color-var fix — they
were correctly left bare/deferred (same treatment as the OTHER bare
`.border`/`.rounded` mentioned in this note's own "Deferred" section),
just not clearly cross-referenced from the "Affects" list. This is an
evidence-accuracy defect, not a code defect — the underlying diff was
already functionally correct (nothing needed fixing in
`src/components/global/ItemTemplate.vue`, confirmed unchanged).

**Fix**: corrected the "Affects" list (3 files: `Heading.vue`,
`Header.vue`, `Footer.vue` — `ItemTemplate.vue` removed). Also
clarifying explicitly here, since the verifier noted `border-start`
wasn't mentioned in either the "Affects" or "Deferred" list: it belongs
in "Deferred" alongside `.border`/`.rounded`/`.border-success` on the
same line — all of `ItemTemplate.vue`'s border-related classes are
intentionally bare/unrenamed, dormant-safe (Bootstrap CSS still fully
covers them, same as every other same-name-collision class throughout
this migration), not touched by this node at all.

## Re-verification after the correction
No code changed — only this evidence note's prose. Re-ran the same
build/lint/test suite to confirm nothing regressed while making this
correction:
- `npm run build` → `✓ built in 6.3s` (timing varies run to run), same
  pre-existing chunk-size warning only.
- `npm run lint` → clean, exit 0.
- `npm run test` → 108-111/111 passing depending on the documented
  `VeeForm.spec.ts` flakiness, 0 new failures.
- `grep -c "border-\[var(--bs-border-color)\]" src/components/global/Heading.vue src/pages/_layouts/Header.vue src/pages/_layouts/Footer.vue src/components/global/ItemTemplate.vue` →
  1, 1, 1, 0 respectively — confirms the corrected "3 files, not
  `ItemTemplate.vue`" claim is now accurate.
