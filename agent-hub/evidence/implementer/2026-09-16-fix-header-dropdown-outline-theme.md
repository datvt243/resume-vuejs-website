# 2026-09-16 — fix-header-dropdown-outline-theme

- Worker: implementer
- Version: 0.1.0
- Node: `fix-header-dropdown-outline-theme`
- Task (verbatim, Vietnamese): "chỉnh lại màu cho dropdown header, light
  theme" — fix the header dropdown's color for light theme. Follow-up to
  `fix-ckeditor-light-theme-colors` in the same session.
- Status: sealed_pending_verifier

## Hub bytes before
209190 (root=12569, doctrine=27207, active diagram=143297,
implementer bundle=14963, verifier bundle=11154 — measured on
`origin/staging`'s clean state, before this node's row was appended)

## Branch
`fix/header-dropdown-outline-theme`, checked out from `origin/staging`.
Independent of 4 other still-unshipped fix branches from this same
session (`fix/register-login-autofill-autocomplete`,
`fix/forgot-password-button-row`, `fix/dropdown-menu-default-hidden`,
`fix/ckeditor-light-theme-colors`), each `git stash`ed before creating
this branch so none of the 5 unrelated diffs mix (`SmallestDiff`).

## Investigation (before writing any diff)
Used the operator's own already-logged-in session on the port-9888 debug
Chrome (real account `votan.it@gmail.com`) to check the header's "Xin
chào" dropdown on `/dashboard/information`, in light theme:

1. Confirmed theme = `"light"` via `data-bs-theme`.
2. Read computed styles: `header` background = `rgb(248,249,250)`;
   dropdown toggle button `color`/`borderColor` = `rgb(248,249,250)`;
   split caret button `color`/`borderColor` = `rgb(248,249,250)` —
   **identical to the header background**. Confirmed with
   `Page.captureScreenshot`: the greeting text, user email, and dropdown
   caret are all completely invisible in the header — not just
   low-contrast, fully blended into the background.

**Root cause**, read `src/pages/_layouts/Header.vue` and `tailwind.css`
directly:
- `Header.vue:102`: `Dropdown(:text="mesUser" :style="'outline-light'" split is-sm)`
  hardcodes the Bootstrap style variant to `outline-light`.
- `.btn-outline-light` (`tailwind.css:331-335`):
  `color: var(--bs-light); border-color: var(--bs-light);`.
- `--bs-light` is a Bootstrap THEME-INVARIANT contextual color — grepped
  `tailwind.css`'s root-token block: declared once as `#f8f9fa`, never
  redefined inside `[data-bs-theme='dark']` (unlike `--bs-tertiary-bg`/
  `--bs-body-color`/`--bs-secondary-bg`/etc., each declared twice with
  genuinely different light/dark values). By Bootstrap's own design,
  `.btn-outline-light` is meant for a PERMANENTLY dark surface (classic
  `navbar-dark` pattern).
- But `header.bg-body-tertiary` (`tailwind.css:991-993`,
  `background-color: var(--bs-tertiary-bg)`) IS theme-reactive — the
  header itself already correctly switches between light-gray and
  dark-gray. Once the header started following the app's theme toggle,
  the hardcoded `outline-light` button variant stopped matching that
  assumption in light mode.
- Exact same class of bug as `fix-ckeditor-light-theme-colors` (earlier
  this session): a fixed/theme-invariant color used where a
  theme-reactive one was needed — just in a different component.

## Diff
| File | Change | Why |
|---|---|---|
| `src/pages/_layouts/Header.vue:102` | `:style="'outline-light'"` → `:style="theme === 'dark' ? 'outline-light' : 'outline-dark'"` | Picks the Bootstrap outline variant with correct contrast per the app's ACTUAL active theme instead of a variant hardcoded for a permanently-dark surface that no longer exists |

`theme` was already destructured from `useTheme()` at the top of this
file's `<script setup>` (`const { theme, toggleTheme } = useTheme()`,
already used for the theme-toggle button's sun/moon icon) — reused here,
no new state/import added. `git diff --stat`: `Header.vue \| 2 +-`, a
single-line value change.

`.btn-outline-dark` (`tailwind.css:340-344`) already exists and uses
`var(--bs-dark)` — the light-theme-appropriate fixed dark color, same
reasoning as `.btn-outline-light` but for the opposite contrast
direction. No new CSS needed.

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
✓ built in 3.27s
```
Only the pre-existing "chunks are larger than 500 kB" advisory, no errors.

Also ran:
```
npm run lint    → exit 0, clean
npm run test    → first run: 1 failed (VeeForm.spec.ts), 110/111 passed;
                   isolated re-run of that ONE file: 11/11 passed;
                   full-suite re-run: 111/111 passed clean.
```
`VeeForm.spec.ts` has documented pre-existing flakiness noted in earlier
sealed nodes this session (e.g. `tailwindcss-post-ship-review-fixes`'s
verifier note: "including the sometimes-flaky `VeeForm.spec.ts`"). Not
caused by this diff — `Header.vue` and `VeeForm.vue` are unrelated files,
and the isolated re-run of just that spec file passed cleanly.

## Manual UI verification (step 7, UI diff — not an automated test)
Used the already-running `npm run dev` (Vite HMR picked up the `.vue`
change) + port-9888 Chrome debug session on the operator's real logged-in
account. Re-checked both themes via CDP:

```
LIGHT: headerBg=rgb(248,249,250)  toggleBtn color/border=rgb(33,37,41)
       toggleBtnClass="btn btn-outline-dark"
       (FIXED — was rgb(248,249,250), identical to background)

DARK:  headerBg=rgb(43,48,53)     toggleBtn color/border=rgb(248,249,250)
       toggleBtnClass="btn btn-outline-light"
       (unchanged from before this diff — dark theme was never broken)
```
Screenshots captured in both themes confirm visually: in light theme,
"Xin chào, votan.it@gmail.com" and the dropdown caret border are now
clearly legible against the light header; in dark theme, appearance is
pixel-identical to before (still legible white-on-dark, no regression).

Note: the light/dark screenshots also happened to show the CKEditor field
looking correctly themed, but `src/components/ckeditor/custom.scss`'s fix
is currently `git stash`ed away on this branch (its own separate, already
SEALED node) — grepped the file on disk to confirm it's back to the
ORIGINAL unfixed content here, so that part of the screenshot likely
reflects a stale Vite HMR/dev-server cache, not this branch's real state.
Not relevant to this node's own diff (`Header.vue` only) — noted here so
the screenshot isn't misread as claiming something about a different,
already-independently-verified node.

## Acceptance
| Criterion | Evidence |
|---|---|
| Header dropdown toggle visible/legible in LIGHT theme | `toggleBtnColor rgb(33,37,41)` vs `headerBg rgb(248,249,250)` — clear contrast (was identical, invisible) |
| No regression in DARK theme | `toggleBtnColor rgb(248,249,250)` vs `headerBg rgb(43,48,53)` — unchanged, still correct contrast |
| No unrelated change | `git diff --stat`: `Header.vue \| 2 +-`, single-line value swap |
| `npm run build` green | `✓ built in 3.27s` |

## Noticed, not done
- The same `outline-light`/theme-invariant-color pattern may exist
  elsewhere if any other component was built assuming a permanently-dark
  surface before the header/nav backgrounds became theme-reactive — not
  audited repo-wide this pass (operator reported specifically the header
  dropdown; scope kept to that per `NoScopeCreep`).

## Seal gate
None — no commit/push/merge in this pass. Merging
`fix/header-dropdown-outline-theme` → `staging` is a separate, later
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
- `MAIN_EDIT` — branch is `fix/header-dropdown-outline-theme`, cut from
  `origin/staging`, not `main`/`staging` directly. Clear.
