# 2026-09-16 — fix-ckeditor-light-theme-colors

- Worker: implementer
- Version: 0.1.0
- Node: `fix-ckeditor-light-theme-colors`
- Task (verbatim, Vietnamese): "chỉnh lại text editor cho light theme" —
  fix the rich-text editor (CKEditor, "Giới thiệu bản thân" field) for
  light theme.
- Status: sealed_pending_verifier

## Hub bytes before
209190 (root=12569, doctrine=27207, active diagram=143297,
implementer bundle=14963, verifier bundle=11154 — measured on
`origin/staging`'s clean state, before this node's row was appended)

## Branch
`fix/ckeditor-light-theme-colors`, checked out from `origin/staging`.
Independent of 3 other still-unshipped fix branches from this same
session — `fix/register-login-autofill-autocomplete`,
`fix/forgot-password-button-row`, `fix/dropdown-menu-default-hidden` —
each `git stash`ed before creating this branch so none of the 4 unrelated
diffs mix (`SmallestDiff`).

## Investigation (before writing any diff)
Used the operator's own already-logged-in session on the port-9888 debug
Chrome (real account `votan.it@gmail.com`) to check the "Giới thiệu bản
thân" CKEditor field on `/dashboard/information` live:

1. Confirmed current app theme via `document.documentElement.getAttribute
   ("data-bs-theme")` = `"light"`.
2. Read `.ck-toolbar`/`.ck-editor__editable` computed styles:
   `backgroundColor: rgb(33,37,41)` (dark), `color: rgb(33,37,41)` — text
   color computed to the EXACT SAME value as the background. Confirmed
   with `Page.captureScreenshot`: a dark box floating in an otherwise
   all-white/light page — visually broken and functionally unreadable
   (typed text would be invisible against its own background).

**Root cause**, read `src/components/ckeditor/custom.scss` and
`src/components/ckeditor/CKEditor.vue` in full, then
`node_modules/ckeditor5/dist/ckeditor5.css` to confirm CKEditor5's own
variable semantics:
- `custom.scss` is CKEditor5's own official "dark theme" CSS-variable
  sample (recognizable boilerplate), applied unconditionally on a bare
  `:root` selector — never gated behind `[data-bs-theme='dark']` the way
  every other themed rule in `tailwind.css` is.
- `--ck-color-base-background: var(--bs-dark)` (line 2) is the direct
  cause. `--bs-dark` is a FIXED, theme-invariant token (`#212529`
  always — confirmed via `tailwind.css`'s root-token block, node
  `tailwindcss-root-tokens-and-remaining-gaps`), unlike the app's real
  theme-reactive tokens (`--bs-body-bg`/`--bs-tertiary-bg`/etc., which
  flip between the `[data-bs-theme='light']`/`[data-bs-theme='dark']`
  blocks).
- Confirmed `--ck-color-base-background` is CKEditor5's own MASTER token
  by reading `node_modules/ckeditor5/dist/ckeditor5.css` directly:
  `.ck.ck-editor__main > .ck-editor__editable { background: var(--ck-color-base-background); }`
  (line ~2865), and `--ck-color-toolbar-background`/
  `--ck-color-dropdown-panel-background`/`--ck-color-input-background`/
  etc. all derive from `--ck-custom-background` (also hardcoded to
  `var(--bs-dark)`, line 11) — so this ONE wrong assignment darkened the
  entire editor chrome (toolbar + content + dropdowns + inputs) at once,
  regardless of the app's actual theme.
- `--ck-color-text: hsl(0, 0%, 98%)` (line 20) and
  `--ck-color-input-text: hsl(0, 0%, 98%)` (line 67) are ALSO fixed
  (near-white), so in dark theme they'd coincidentally look fine against
  the (also fixed) dark background, but in light theme the surrounding
  app switches `--bs-body-color` to dark text — the editor's own
  hardcoded near-white text never followed, though what's actually
  rendered is inherited/cascaded body color (`#212529`, matching
  `--bs-dark` exactly in this app's light palette) rather than the
  broken `--ck-color-text` value itself, which is why the live measurement
  showed background==text (both `#212529`) instead of white-on-dark.

## Diff
| File | Change | Why |
|---|---|---|
| `src/components/ckeditor/custom.scss` | `--ck-color-base-background`/`--ck-custom-background`: `var(--bs-dark)` → `var(--bs-tertiary-bg)` | Master surface token — same reactive token `.auth-card` (node `tailwindcss-auth-pages`) and `.dropdown-menu` (node `fix-dropdown-menu-default-hidden`, this session) already use for a "card-like" surface distinct from the page background |
| | `--ck-custom-foreground`: `hsl(255, 3%, 18%)` → `var(--bs-secondary-bg)` | Drives hover/toggled-on button backgrounds inside the toolbar — same reactive token `.dropdown-item:hover` already uses, avoids the same dark-on-dark class of bug on hover/active states |
| | `--ck-color-text`/`--ck-color-input-text`: `hsl(0, 0%, 98%)` → `var(--bs-body-color)` | Makes the editor's text color track the app's real theme instead of a fixed near-white value |

5 lines changed total (`git diff --stat`: `custom.scss \| 10 +++++-----`,
5 insertions/5 deletions — each is a 1-line value swap, not a
restructure). Did NOT touch `--ck-color-focus-border` (blue accent,
theme-neutral, not part of the reported symptom), disabled-input colors,
tooltip colors, or `--ck-color-widget-editable-focus-background` (nested
widget focus, e.g. table cells — a separate, smaller pre-existing
dark-theme quirk, out of scope for this report) — logged below under
"Noticed, not done" instead of fixed inline, per `NoScopeCreep`.

## Command
```
npm run build
```

## Output
```
> resume-vuejs-website@1.9.0 build
> vite build

vite v5.3.2 building for production...
transforming...
✓ 1304 modules transformed.
rendering chunks...
computing gzip size...
...
✓ built in 3.23s
```
Only the pre-existing "chunks are larger than 500 kB" advisory, no errors.

Also ran:
```
npm run lint    → exit 0, clean
npm run test    → Test Files  16 passed (16) / Tests  111 passed (111)
```

## Manual UI verification (step 7, UI diff — not an automated test)
Used the already-running `npm run dev` (Vite HMR picked up the SCSS
change) + port-9888 Chrome debug session on the operator's real logged-in
account, `/dashboard/information`, the real "Giới thiệu bản thân" field
(existing real content, not fabricated).

```
LIGHT theme: toolbarBg/contentBg = rgb(248,249,250)  (= #f8f9fa = --bs-tertiary-bg light)
             contentColor        = rgb(33,37,41)     (= #212529 = --bs-body-color light)
             pageBg              = rgb(255,255,255)  (page background, for contrast reference)

DARK theme:  toolbarBg/contentBg = rgb(43,48,53)      (= #2b3035 = --bs-tertiary-bg dark)
             contentColor        = rgb(222,226,230)   (= #dee2e6 = --bs-body-color dark)
             pageBg              = rgb(33,37,41)       (page background, for contrast reference)
```
Both themes now show correct, readable contrast (editor surface distinct
from page background, text clearly legible), and the editor tracks the
theme toggle in both directions. Screenshots captured in both themes
confirm this visually — real existing bio content visible and legible in
both.

**Incident during verification, disclosed per `NoSilentFailure`**: an
early live check used `document.execCommand("insertText", ...)` to type
throwaway test text into the editable field to sanity-check readability,
which landed in the operator's REAL "Giới thiệu bản thân" field (not a
scratch/test field — this app has no dedicated test fixture page).
Caught immediately; reloaded the page before any submit/save action was
triggered. Re-read the field's content after reload: matched the
operator's original real bio verbatim, confirming no backend write
occurred and the accidental edit was fully discarded. Switched to a
non-destructive method (`getComputedStyle` reads only) for the rest of
verification.

## Acceptance
| Criterion | Evidence |
|---|---|
| Editor readable/consistent in LIGHT theme | `contentBg rgb(248,249,250)` vs `contentColor rgb(33,37,41)` — clear contrast, tracks `--bs-tertiary-bg`/`--bs-body-color` light values |
| Editor readable/consistent in DARK theme (no regression) | `contentBg rgb(43,48,53)` vs `contentColor rgb(222,226,230)` — clear contrast, tracks dark values |
| No unrelated change | `git diff --stat`: `custom.scss \| 10 +++++-----`, exactly 5 value swaps |
| `npm run build` green | `✓ built in 3.23s` |
| Real operator data unaffected | Post-incident reload confirmed original bio content intact, no save/submit occurred |

## Noticed, not done
- `--ck-color-widget-editable-focus-background: var(--ck-custom-white)`
  (nested editable regions, e.g. table-cell/image-caption focus) is
  hardcoded solid white regardless of theme — a smaller, separate
  dark-theme quirk (white flash box when focusing a nested widget in dark
  mode). Not part of the reported "light theme" symptom, not fixed here.
- Disabled-input colors (`--ck-color-input-disabled-*`) and tooltip
  colors (`--ck-color-tooltip-*`) are also still fixed/theme-invariant —
  low-visibility edge cases (disabled fields, hover tooltips), not
  reported, not fixed here.
- Did not re-verify `PageAccountSettings.vue` or any other page that
  might also render a CKEditor instance beyond `PageInformation.vue`'s
  "Giới thiệu bản thân" field — same shared `custom.scss`, so the fix
  applies identically, but wasn't individually screenshot-verified (out
  of scope: operator only reported the one editor they were looking at).

## Seal gate
None — no commit/push/merge in this pass. Merging
`fix/ckeditor-light-theme-colors` → `staging` is a separate, later
`/ship` action requiring operator approval.

## Forbidden states check
- `ADHOC_WORK` — node added to `dev-loop.prime-mermaid.md` (`AppendOnly`,
  end of table) before this note. Clear.
- `NO_EVIDENCE` — this note. Clear.
- `EDIT_UNVERIFIED` — build run and read back verbatim; both-theme colors
  confirmed live via CDP with screenshots, not inferred. Clear.
- `CODE_IN_HAVEN` — only this note + the diagram row (both `.md`) touched
  under `haven/`/`evidence/`. Clear.
- `DIAGRAM_DRIFT` — diagram row added matching this diff. Clear.
- `MAIN_EDIT` — branch is `fix/ckeditor-light-theme-colors`, cut from
  `origin/staging`, not `main`/`staging` directly. Clear.
