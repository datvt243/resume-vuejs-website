# 2026-09-12 — tailwindcss-dropdown-toast-navbar

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-dropdown-toast-navbar` (new node, node 4 of the
  phased Bootstrap → Tailwind migration, follows
  `tailwindcss-modal-rewrite`)
- Task (verbatim): "tiếp tục cho tới khi xong" (operator — explicit
  instruction to keep going without a stop-and-ask per node)

## Hub bytes before
122851 (root=12393, doctrine=27207, active diagram≈57KB post-node-3,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-3, still
uncommitted).

## Context — why these 3 files together
`Dropdown.vue` and `Toasts.vue` were the last 2 files anywhere in `src`
still doing `import { X } from 'bootstrap'`. `Navbar.vue` doesn't import
Bootstrap JS itself, but its `data-bs-toggle="collapse"` markup only
ever worked because Bootstrap's `Collapse` class registers a *global*
delegated click handler the moment `bootstrap` JS is imported anywhere
in the bundle — so as long as `Dropdown.vue`/`Toasts.vue` kept importing
it, `Navbar.vue` got collapse behavior "for free." Rewriting the other
two without also fixing `Navbar.vue` would have silently broken its
mobile menu toggle the moment this diff landed. Confirmed via
`grep -rl "Navbar" src` that it's a real, live component (used in
`Header.vue`'s unauthenticated branch, for the mobile hamburger toggle
next to Login/Register links) — not dead code.

## Diff
| File | Change |
|---|---|
| `src/components/global/Dropdown.vue` | Removed `import { Dropdown } from 'bootstrap'`. Local `isOpen` ref. `open()`/`close()`/`toggle()`. Click-outside-to-close via a **capture-phase** `document` click listener (see "Design note" below for why capture phase specifically). `keydown` Escape listener. Menu auto-closes on any click inside a slotted item (`@click="close"` on `<ul class="dropdown-menu">`, matches Bootstrap's real behavior). `aria-expanded` now reactive instead of a static `'false'`. `onBeforeUnmount` cleanup. |
| `src/components/Toasts.vue` | Removed `import { Toast } from 'bootstrap'`. Local `visible` ref + `setTimeout`-based 5000ms auto-hide (Bootstrap's default `delay: 5000`) that resets on every `show()` call. Root gets both `:class="{ show }"` and `:style="{ display }"` (pre-emptively, see below). Dismiss button (`data-bs-dismiss="toast"`) handled via the same delegated-click-on-root pattern as `Modal.vue`. `onBeforeUnmount` clears any pending timer. |
| `src/components/Navbar.vue` | No Bootstrap import to remove (never had one) — replaced its dependence on Bootstrap's *global* Collapse handler with a local `expanded` ref, `@click` on the toggler, both `:class`/`:style` bindings on the collapse region, reactive `aria-expanded`. |

Zero consumer files changed for any of the 3 (same external-contract-
preserving pattern as `tailwindcss-modal-rewrite`): `Dropdown.vue`'s
consumers (`PageReference.vue`, `Header.vue`) still just pass the same
props/slots; `Toasts.vue`'s only consumer (`App.vue`) still just calls
`.show()`; `Navbar.vue`'s only consumer (`Header.vue`) still just
renders it with a default slot.

## Design note — why the outside-click listener uses capture phase
A naive `document.addEventListener('click', onDocClick)` (bubble phase,
the default) registered *during* the same click that opens the dropdown
would risk the newly-added listener still firing for that SAME click
event if it hasn't finished bubbling yet — closing the dropdown the
instant it opens. Registering in **capture phase**
(`addEventListener('click', onDocClick, true)`) avoids this: capture
happens top-down before the target/bubble phases, so by the time the
`@click="toggle"` handler runs (bubble phase, after capture already
completed for this event), a listener added to `document`'s capture
phase is already "too late" for the current event and only fires on the
*next* click. Verified this reasoning with a real test (see below)
rather than trusting it, since assumption-over-verification is exactly
what caused `tailwindcss-modal-rewrite`'s bugs.

## Design note — pre-emptive display fix
`tailwindcss-modal-rewrite` discovered that Bootstrap's `.show` class
alone does not set `display: block` (Bootstrap's JS sets that as an
inline style itself). Rather than rediscover the same bug for
`Toasts.vue`/`Navbar.vue`, both got `:class="{ show }"` AND
`:style="{ display }"` from the start.

## Verification — no live browser session available this time
The authenticated tab used for `tailwindcss-modal-rewrite`'s live-CDP
verification had been closed (browser tab lifecycle, not something this
session controls), and no login credentials are available to this
session to create a fresh authenticated one. Rather than skip
interactive-behavior verification entirely, pivoted to writing real
Vitest component tests — the project's own established pattern
(`VeeForm.spec.ts`, `useHelper.spec.ts` already exist) and arguably
stronger evidence than a one-off manual session since it's a permanent,
repeatable regression guard:

- **`src/components/global/Dropdown.spec.ts`** (8 tests, all passing):
  starts closed; opens on toggle click AND STAYS open (the capture-phase
  self-close risk, above, actually tested not just reasoned about);
  closes on a 2nd toggle click; closes on a real `click` event dispatched
  on `document.body` (outside the component); closes on a real
  `keydown` Escape `KeyboardEvent`; closes when a slotted menu item is
  clicked; split mode renders 2 buttons (label + caret) and the caret
  opens the menu; unmounting while open doesn't throw and a
  post-unmount Escape dispatch doesn't throw either (listener cleanup
  confirmed, not assumed).
- **`src/components/Toasts.spec.ts`** (7 tests, all passing, using
  `vi.useFakeTimers()`): starts hidden; `show()` makes it visible with
  the right content; auto-hides at exactly 5000ms; does NOT hide at
  4999ms (off-by-one boundary actually checked); calling `show()` again
  mid-countdown resets the timer — verified precisely (advance 3s,
  call `show()` again, advance 4s more = 7s total elapsed but only 4s
  since the reset → still visible; advance 1 more second = 5s since
  reset → now hidden); dismiss button hides immediately; unmounting
  while visible doesn't throw (pending timer cleared).
- **`src/components/Navbar.spec.ts`** (4 tests, all passing): starts
  collapsed with `aria-expanded="false"`; expands on toggler click with
  `aria-expanded="true"`; collapses again on a 2nd click; slot content
  renders inside the collapse region.

### Test-infrastructure issue found and worked around
`@vue/test-utils@2.4.11`'s `attachTo` option (needed so
`document`-level listeners can actually be reached — a detached wrapper
never bubbles events up to real `document`) calls `app.onUnmount(...)`,
an API that only exists in Vue 3.5+. This repo pins `vue@^3.4.29`
(resolved `3.4.31`) — calling `mount(..., { attachTo: document.body })`
threw `TypeError: app.onUnmount is not a function` on every test.
Worked around by mounting normally and manually
`document.body.appendChild(wrapper.element)` — same effect (the
element is a real `document.body` descendant, so click/keydown events
bubble all the way to `document`) without touching the broken path.
Not a real app bug — purely a test-tooling version mismatch, worth
remembering for any future `.spec.ts` needing `attachTo` on this repo's
current Vue version.

## Command
```
npm run build
```

## Output
```
✓ built in 6.01s
```
Same pre-existing "chunks larger than 500 kB" warning only. Main
`index-*.js` bundle shrank from 350.37 kB → 269.14 kB — Bootstrap's JS
module is now fully tree-shaken out of the build (confirmed separately:
`grep -rl "from 'bootstrap'" src` → zero matches, repo-wide).

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 1 failed | 15 passed (16)`, `Tests 3
  failed | 108 passed (111)`. The 3 failures are all in
  `VeeForm.spec.ts`, confirmed pre-existing and unrelated:
  `git diff --stat -- src/components/veevalidate/` is empty, and
  re-running just that file in isolation produced a *different* failure
  count each time (3, then 2, then 1) — classic timing-flake signature,
  matching prior evidence notes' documented pattern for this same file.

## Acceptance
| Criterion | Evidence |
|---|---|
| Zero `bootstrap` JS imports left anywhere in `src` | `grep -rl "from 'bootstrap'" src` → no matches |
| Zero consumer files changed | `git diff --stat` touches only the 3 target files + 3 new `.spec.ts` files |
| Dropdown open/close/outside-click/Escape/menu-item-click all correct | 8/8 `Dropdown.spec.ts` tests pass |
| Toast show/auto-hide/timer-reset/dismiss all correct | 7/7 `Toasts.spec.ts` tests pass |
| Navbar collapse toggle correct | 4/4 `Navbar.spec.ts` tests pass |
| Build stays green, bundle shrinks (Bootstrap JS gone) | `✓ built in 6.01s`, 350.37kB → 269.14kB |
| No new lint issues | exit 0 |
| No new test regressions | 108/111 passing, the 3 failures pre-existing/flaky/unrelated |

## Noticed, not done
- `Dropdown.vue`'s `text` prop still renders via `v-html` (pre-existing,
  used deliberately by `Header.vue`'s `mesUser` computed for inline
  HTML formatting) — unrelated to the Bootstrap-JS removal, not touched.
- No Popper-based smart positioning for the dropdown menu (disclosed
  simplification, carried over from the original 3-component survey).
- `attachTo`/`app.onUnmount` version mismatch — worth flagging in
  `doctrine/domains/PROJECT.md` as a trap for future `.spec.ts` authors
  on this repo, not fixed here (would mean bumping `@vue/test-utils` or
  `vue`, out of scope).

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-3's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.
