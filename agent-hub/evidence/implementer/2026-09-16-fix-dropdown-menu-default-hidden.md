# 2026-09-16 — fix-dropdown-menu-default-hidden

- Worker: implementer
- Version: 0.1.0
- Node: `fix-dropdown-menu-default-hidden`
- Task (verbatim, Vietnamese): "kiểm tra lại header dropdown (xin
  chào...)" — re-check the header dropdown (the "Xin chào, ..." user menu).
- Status: sealed_pending_verifier

## Hub bytes before
209190 (root=12569, doctrine=27207, active diagram=143297,
implementer bundle=14963, verifier bundle=11154 — measured on
`origin/staging`'s clean state, before this node's row was appended)

## Branch
`fix/dropdown-menu-default-hidden`, checked out from `origin/staging`.
Independent of 2 other still-unshipped fix branches from this same
session — `fix/register-login-autofill-autocomplete` and
`fix/forgot-password-button-row` — both `git stash`ed before creating
this branch so none of the 3 unrelated diffs mix (`SmallestDiff`).

## Investigation (before writing any diff)
Operator asked to re-check the header's "Xin chào" dropdown (`Header.vue`,
wraps `Dropdown.vue`, shows "View API" / "Logout"). Used the operator's
own already-logged-in session on the port-9888 debug Chrome (confirmed
via `localStorage.getItem("token")`/`"user"` — real account
`votan.it@gmail.com`) to check it live:

1. Navigated to `/dashboard/information` (a real authenticated route).
2. On a **completely fresh page load, before any click**, queried
   `.dropdown-menu`: `getComputedStyle(...).display` = `"block"`,
   `visibility: "visible"`, class list was just `"dropdown-menu"` (no
   `.show`). Confirmed with `Page.captureScreenshot` — "View API"/
   "Logout" are visibly floating over the header on every page load,
   never actually hidden.

**Root cause**, read `src/components/global/Dropdown.vue` and
`src/styles/tailwind.css` directly:
- `Dropdown.vue`'s JS (`isOpen` ref, `open()`/`close()`/`toggle()`,
  document click-outside listener, `Escape` key handler) is fully
  correct — starts `isOpen: false`, adds/removes the `show` class exactly
  when expected.
- The CSS never reacted to that class. `tailwind.css:421-433`'s
  `.dropdown-menu` rule (added at node `tailwindcss-dropdown-menu-styling`,
  migrating off Bootstrap's own dropdown CSS) copied Bootstrap's
  positioning declarations (`position/top/left/z-index/margin-top/...`)
  but never copied the hide-by-default half. Real Bootstrap always pairs
  `.dropdown-menu { display: none; ... }` with `.show { display: block }`
  (a shared utility class) — this repo's port only wrote the "shown"
  declarations, with nothing gating them behind `.show`.
- Confirmed this is a real gap, not a deliberate simplification: the same
  file already does this pattern CORRECTLY for a sibling component —
  `.navbar-collapse:not(.show) { display: none; }` at `tailwind.css:901`
  (node `tailwindcss-navbar-component-system`). `.dropdown-menu` never
  got the equivalent rule.
- Grepped the whole file for `.show` (`grep -n "\.show\b" tailwind.css`):
  only 4 hits, none for `.dropdown-menu` — `.navbar-collapse:not(.show)`,
  a comment reference to `.toast:not(.show)` (intentionally omitted,
  documented reason), a comment reference to `.modal.show`, and
  `.modal-backdrop.show`. No orphaned/misplaced rule elsewhere in the
  file — the dropdown case was genuinely never written.

## Diff
| File | Change | Why |
|---|---|---|
| `src/styles/tailwind.css` | Added `.dropdown-menu:not(.show) { display: none; }` immediately after the existing `.dropdown-menu` rule (`tailwind.css:421-433`) | Restores the missing hide-by-default half of the Bootstrap dropdown pattern, matching the already-correct `.navbar-collapse:not(.show)` rule in the same file |

No changes to `Dropdown.vue` — its JS was already correct; this was
purely a missing CSS rule.

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
✓ built in 3.22s
```
Only the pre-existing "chunks are larger than 500 kB" advisory, no errors.

Also ran:
```
npm run lint    → exit 0, clean (no output beyond the npm command header)
npm run test    → Test Files  16 passed (16) / Tests  111 passed (111)
```

## Manual UI verification (step 7, UI diff — not an automated test)
Used the already-running `npm run dev` (Vite HMR picked up the CSS
change) + port-9888 Chrome debug session on the operator's real logged-in
account. Re-checked the FULL open/close lifecycle via CDP, fresh page
load each time:

```
1. Fresh load, no click:
   classes="dropdown-menu", display="none", visibility="visible"
   (FIXED — was display="block" before this diff)

2. Click the toggle button:
   classes="dropdown-menu show", display="block"
   (menu correctly appears)

3. Click outside (document.body.click()):
   classes="dropdown-menu", display="none"
   (menu correctly disappears again)
```

Screenshots captured at each state (1280x800):
- Fresh load: header is clean, no floating menu (previously showed
  "View API"/"Logout" overlapping the page immediately).
- After toggle click: menu appears correctly positioned below the
  "Xin chào" button, unchanged visually from before this fix (only the
  default-hidden state changed, not the open-state appearance).

## Acceptance
| Criterion | Evidence |
|---|---|
| Dropdown menu hidden by default (not visible until user interacts) | Fresh-load CDP check: `display: "none"` (was `"block"`) |
| Toggle click still opens the menu correctly | `dropdown-menu show`, `display: "block"` after click |
| Click-outside still closes the menu | `dropdown-menu`, `display: "none"` after clicking outside |
| No unrelated change | `git diff --stat`: `tailwind.css \| 3 +++`, 3 insertions only |
| `npm run build` green | `✓ built in 3.22s` |

## Noticed, not done
- `Header.vue:50-56`'s `mesUser` computed destructures `firstName`/
  `lastName` (camelCase) from the user object, but the real stored user
  object (confirmed via `localStorage.getItem("user")`) uses snake_case
  (`first_name`/`last_name`) — so the greeting falls back to showing the
  raw email instead of the actual name. Unrelated to the dropdown-visibility
  bug reported here (this is a data-mapping bug, not a CSS/visibility
  bug) — not fixed, logging as a separate potential follow-up per
  `NoScopeCreep`.
- Did not visually re-check `PageReference.vue`'s split action-menu
  dropdown (the other consumer mentioned in `Dropdown.vue`'s own
  comment) — same shared `.dropdown-menu` CSS class, so the fix applies
  identically, but wasn't individually screenshot-verified this pass
  (out of scope: operator only reported the header dropdown).

## Seal gate
None — no commit/push/merge in this pass. Merging
`fix/dropdown-menu-default-hidden` → `staging` is a separate, later
`/ship` action requiring operator approval.

## Forbidden states check
- `ADHOC_WORK` — node added to `dev-loop.prime-mermaid.md` (`AppendOnly`,
  end of table) before this note. Clear.
- `NO_EVIDENCE` — this note. Clear.
- `EDIT_UNVERIFIED` — build run and read back verbatim; full open/close
  lifecycle re-verified live via CDP with screenshots, not inferred.
  Clear.
- `CODE_IN_HAVEN` — only this note + the diagram row (both `.md`) touched
  under `haven/`/`evidence/`. Clear.
- `DIAGRAM_DRIFT` — diagram row added matching this diff. Clear.
- `MAIN_EDIT` — branch is `fix/dropdown-menu-default-hidden`, cut from
  `origin/staging`, not `main`/`staging` directly. Clear.
