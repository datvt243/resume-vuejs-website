# 2026-09-12 — tailwindcss-modal-rewrite

- Worker: implementer
- Version: 0.1.0
- Node: `tailwindcss-modal-rewrite` (new node, node 3 of the phased
  Bootstrap → Tailwind migration, follows `tailwindcss-auth-pages`)
- Task (verbatim): "tiếp tục" (operator, continuing the migration)

## Hub bytes before
116582 (root=12393, doctrine=27207, active diagram≈50KB post-node-2,
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/tailwindcss-setup` (same branch as nodes 1-2, still uncommitted).

## Context — why Modal.vue, and why it's a 1-file diff
The dashboard CRUD pages (Award/Certificate/Education/Experience/Project/
Reference) were the next natural migration target but are all gated
behind `Modal.vue`, which still does `import { Modal } from 'bootstrap'`.
A read-only `Explore` agent + direct reads of `Modal.vue` and
`PageAward.vue` confirmed: all 7 consumers (the 6 CRUD pages +
`VeeFormGeneralInformationUpdate.vue`) only ever call
`refModal.value?.show()`, rely on `data-bs-dismiss="modal"` markup
*inside* Modal's own slot content, and read the same props
(`title`/`size`/`isHiddenFooter`) and slots (default/`footer`). Keeping
that exact contract meant the rewrite only needed to touch
`Modal.vue` itself — confirmed after the fact via
`git diff --stat -- src/components/Modal.vue` showing exactly 1 file.

Plan was written and approved (`ExitPlanMode`) before any edit. Two
fidelity decisions were escalated to the operator via `AskUserQuestion`
first:
1. **Focus handling**: simplified (focus-on-open + ESC-to-close, no
   Tab/Shift+Tab focus-trap) — chosen over a full trap for lower
   risk/complexity, disclosed as a real gap vs Bootstrap, not silently
   dropped.
2. **Backdrop click**: preserve the actual current behavior (clicking
   the backdrop closes the modal), not "fix" it to the apparently
   intended-but-never-working `static` behavior implied by the dead
   `data-backdrop="static"` attribute (Bootstrap 4 name, Bootstrap 5
   ignores it) — SmallestDiff, no silent behavior change.

## Diff
`src/components/Modal.vue` only (69 insertions, 9 deletions):
- Removed `import { Modal } from 'bootstrap'`; replaced `modalBootstrap`
  with `const visible = ref(false)`.
- `show()`/`hide()`: toggle `visible`, manage a module-scope
  `openModalCount` (only touches `body.modal-open` on the 0→1 / 1→0
  edges — handles `PageGeneralInformation.vue`'s 3 simultaneous `Modal`
  instances correctly), register/unregister a `keydown` (Escape) window
  listener, `nextTick()` + focus the panel on open. `show()` is
  idempotent (`if (visible.value) return`, mirroring `hide()`'s existing
  `if (!visible.value) return`).
- Root `<div class="modal draggable">`: added `:class="{ show: visible
  }"` AND `:style="{ display: visible ? 'block' : 'none' }"` (see Real
  bugs below for why both are needed). Removed the dead
  `data-backdrop="static"` attribute (meaningless without Bootstrap's JS
  reading it, and never functional in Bootstrap 5 anyway).
- New `onRootClick` handler on the root div: if the click target's
  closest ancestor matches `[data-bs-dismiss="modal"]`, call `hide()`.
  This is a local replacement for Bootstrap's global delegated dismiss
  listener — since slot content is a real DOM descendant of the root,
  bubbling reaches it, so every consumer's own "Đóng" button keeps
  working without any consumer file changing.
- New backdrop: `<div v-if="visible" class="modal-backdrop show"
  @click="hide()">`, wrapped in `<Teleport to="body">` — the first live
  `<Teleport>` in the codebase (the only other occurrence, in
  `PageInformation.vue`, is commented out). Reuses Bootstrap's existing
  `.modal-backdrop`/`.modal-backdrop.show` CSS as-is — zero new CSS
  anywhere in this diff.
- `onBeforeUnmount`: calls `hide()` if still visible, defensive cleanup
  against a route change while a modal is open leaking global state.

## Real bugs found and fixed via live browser verification
`npm run build`/`lint`/`test` stayed green through all of these — none
of them can catch broken interactive JS behavior. Found by driving a
**real, already-authenticated session** via raw CDP against the
port-9888 debug browser (an existing tab at
`http://localhost:5173/resume-vuejs-website/#/dashboard/certificate`,
confirmed `localStorage.getItem('token')` was a real value — this is the
operator's own live session, not a fresh login):

1. **`.modal.show` does not set `display: block`.** Assumed (incorrectly)
   that Bootstrap's own `.modal.show` CSS rule handled the display
   toggle, matching the "reuse Bootstrap's existing classes" pattern from
   nodes 1-2. Live check after the first build: opened the modal via a
   real click on the "add" button, `getComputedStyle(...).display` read
   back `"none"` even though the `show` class was present. Root cause:
   Bootstrap's `Modal` JS sets `element.style.display = 'block'` as an
   **inline style itself** — the `show` class only drives the fade
   transition's opacity/transform, not display. Fixed by adding
   `:style="{ display: visible ? 'block' : 'none' }"` alongside the
   class. Re-verified: `display: "block"` after the fix, and
   `document.activeElement === modal` became `true` too (the earlier
   `.focus()` call was silently failing because browsers refuse to focus
   a `display:none` element — same root cause, two symptoms).
2. **`show()` wasn't idempotent.** While testing Escape with a since-fixed
   test-harness bug (see below) that made it look like ESC wasn't
   closing the modal, re-clicking "add" while it was (unbeknownst to the
   test) still open called `show()` a second time, incrementing
   `openModalCount` to 2. A single subsequent close only decremented it
   to 1, leaving `body.modal-open` stuck even after the modal was
   visually closed. Fixed by adding `if (visible.value) return` at the
   top of `show()`, mirroring the guard `hide()` already had. This is a
   real hardening independent of how it was triggered (a real user
   double-clicking "add" fast enough could hit the same path).
3. **Test-harness-only issue, not an app bug**: CDP's
   `Input.dispatchKeyEvent` for Escape silently did nothing (likely
   because the tested tab wasn't the OS-foreground tab in the actual
   browser window — Input-domain events route through the real input
   pipeline, not directly to a specific CDP session). Switched to
   directly calling `document.dispatchEvent(new
   KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`, which
   exercises the exact same code path (`document`-level listener) without
   depending on OS focus — this correctly closed the modal, confirming
   `onKeydown`'s own logic was correct all along.

## Verification — live browser (real authenticated session)
Ran `npm run dev` (port 5173), found an existing tab in the port-9888
debug browser already on `#/dashboard/certificate` with a real token —
reused it rather than attempting a fresh login (no test credentials
available to this session; this is the operator's own account,
`votan.it@gmail.com` per project config). Hard-reloaded it
(`Page.reload` with `ignoreCache: true`) to guarantee the fresh build was
loaded (a same-document hash-only navigation, tried first, does NOT
force a JS reload and showed a stale/broken bundle — not a real bug,
a test-technique lesson). Navigated to `#/dashboard/award`, then via raw
CDP (`ws` package, `NODE_PATH` pointed at the repo's `node_modules`):
- Clicked the real "add" button (`button.btn-outline-success.btn-sm`) →
  confirmed `{modalClass: "modal draggable show", modalDisplay: "block",
  backdropPresent: true, bodyHasModalOpen: true, activeElementIsModal:
  true}`.
- Closed via `document.dispatchEvent(new KeyboardEvent('keydown', {key:
  'Escape'}))` → confirmed modal/backdrop/body-class all cleared.
- Reopened, clicked the real backdrop element → confirmed it closes too
  (preserving the operator-approved behavior).
- Reopened, clicked the real dismiss element (`[data-bs-dismiss="modal"]`,
  the X icon in Modal's own header) → confirmed it closes via the new
  delegated handler.
- Toggled/confirmed dark mode (`data-bs-theme="dark"` already active):
  `getComputedStyle(.modal-content).backgroundColor` → `rgb(33, 37, 41)`
  (Bootstrap's standard dark modal background) — confirms the rewrite's
  zero-new-CSS approach correctly stays dark-mode-aware for free.
- Left the real session cleanly closed at the end (never clicked any
  save/delete action inside the form — no real backend data touched or
  mutated by this verification).

## Command
```
npm run build
```

## Output
```
✓ built in 4.95s
```
Same pre-existing "chunks larger than 500 kB" warning only, no new
errors.

Also ran:
- `npm run lint` → clean, exit 0.
- `npm run test` → `Test Files 13 passed (13)`, `Tests 92 passed (92)`.

## Acceptance
| Criterion | Evidence |
|---|---|
| Zero consumer files changed | `git diff --stat` shows only `src/components/Modal.vue` |
| Modal opens correctly (visible, backdrop, scroll lock, focus) | Live CDP: `{modalDisplay:"block", backdropPresent:true, bodyHasModalOpen:true, activeElementIsModal:true}` |
| ESC closes | Live CDP: `document.dispatchEvent(KeyboardEvent('keydown',{key:'Escape'}))` → modal/backdrop/body-class cleared |
| Backdrop click closes (preserved current behavior) | Live CDP: real backdrop element click → same clean-close state |
| Dismiss button (`data-bs-dismiss="modal"`) closes | Live CDP: real element click → same clean-close state |
| Dark mode still correct, zero new CSS | Live CDP: `.modal-content` bg = Bootstrap's standard dark value |
| Build/lint/test stay green | `✓ built in 4.95s`, lint exit 0, 92/92 tests |

## Noticed, not done
- No Tab/Shift+Tab focus-trap (operator decision, disclosed above) —
  real accessibility gap vs Bootstrap's Modal, not a silent regression.
- No scrollbar-width `padding-right` compensation alongside
  `body.modal-open` — minor layout shift when the scrollbar disappears,
  judged not worth the extra code for this node.
- `Dropdown.vue` and `Toasts.vue` are separate, later nodes — not
  touched here.
- Same-document hash-only navigation not forcing a JS reload (a Vite dev
  server / SPA characteristic, not a bug) tripped up the FIRST verification
  attempt — worth remembering for future live-browser checks in this
  migration: always hard-reload (`Page.reload` + `ignoreCache`) an
  already-open tab before trusting what it renders.

## Seal gate
No outward-facing action taken — nothing committed, diff lives in the
working tree on `feature/tailwindcss-setup` alongside nodes 1-2's
still-uncommitted diffs. Committing/pushing/PR into `staging` still
requires `/ship`.
