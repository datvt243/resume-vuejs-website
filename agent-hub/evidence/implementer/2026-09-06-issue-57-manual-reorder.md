# 2026-09-06 — issue-57-manual-reorder

- Worker: implementer
- Version: 0.1.0
- Node: `issue-57-manual-reorder`
- Task (verbatim): "#57" via `/todo`, resolved from `gh issue view 57` —
  [ENHANCEMENT] Sắp xếp thủ công (drag-and-drop) thứ tự Education/
  Experience/Project.

## Hub bytes before: 97391

## Branch
`feature/issue-57-manual-reorder`, checked out from `staging` BEFORE any
file was touched (2nd time following this order correctly, after
`issue-59`'s slip).

## Scope decision — verified against real backend, and a real UX risk
1. **Backend has zero order-persistence support.** Read
   `resume-nodejs-api/src/models/education.model.ts` directly — the
   Mongoose schema has no `order`/`sortIndex` field (and the same
   pattern holds for experience/project/award/certificate/reference,
   same author, same shape). The issue's own text admits this needs
   "thay đổi nhỏ ở backend" — out of this repo's scope.
2. **Why NOT a fake drag-then-silently-revert UI.** Unlike `issue-58`/
   `issue-61`/`issue-63` (part of those features had a REAL backend
   endpoint to build the real part against), there is NOTHING backend-
   side here to persist an order value at all. A drag-and-drop UI that
   visually reorders but reverts to the old order on the next fetch/
   reload would be actively worse than no feature — it looks like it
   saved, then silently un-does itself. That's a real trust violation,
   not just an incomplete feature.
3. **Design chosen: genuine browser-local persistence.** `useManualOrder.ts`
   stores the chosen order in `localStorage`, keyed per
   `candidate._id` + collection name. This is NOT a fake/mock — it
   really persists across reloads/tab closes on that browser/device,
   solving the issue's actual stated pain point ("người dùng không có
   cách nào tùy chỉnh thứ tự hiển thị"). The one real limitation
   (doesn't sync across devices) is disclosed in the UI copy ("chỉ lưu
   trên trình duyệt này"), not hidden.
4. **Scoped to Education/Experience/Project only** — the 3 sections
   named in the issue's own TITLE (its description broadens to 6, but
   the title doesn't). These 3 share one consistent UI pattern (a
   dedicated `XItem.vue` wrapper + `ListTransition`). Award/Certificate
   use a different inline-`ItemTemplate` pattern; Reference uses
   `TableDefault` (a SHARED component used by other pages) — extending
   drag support there is a separate, larger-blast-radius task (same
   reasoning as `issue-60` avoiding a shared-component change). Logged
   as explicit follow-up below, not silently dropped.
5. **No new dependency.** `grep -iE "drag|sortable|dnd" package.json` →
   empty. Implemented with native HTML5 drag-and-drop
   (`draggable`/`dragstart`/`dragover`/`drop`), zero new packages.

## Diff
| File | Why |
|---|---|
| `src/composables/useManualOrder.ts` (new) | Generic, collection-agnostic manual-order logic: reads/writes `localStorage`, exposes `orderedItems` (computed, saved order applied, new/untracked records appended at the end) and `reorder(newList)`. |
| `src/composables/useManualOrder.spec.ts` (new) | 7 tests — see below. |
| `src/composables/index.ts` | Added to the barrel export. |
| `src/pages/dashboard/PageEducation.vue` / `PageExperience.vue` / `PageProject.vue` | Wired `useManualOrder`, added `draggable`/`dragstart`/`dragover`/`drop` on each list `<li>` + a grip-icon handle, render `orderedItems` instead of the raw fetched list, disclosure text above the list. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New PM status row, `IN_PROGRESS`. |

No backend touched, no `updateDoc`/`updatePatchDoc` calls added — this
never talks to the server, by design.

## Command
`npm run build` (repo root, exact command from `doctrine/MEMORY.md`)

## Output
```
dist/assets/PageEducation-BGkOGVql.js               5.44 kB │ gzip:   2.57 kB
dist/assets/PageProject-C0iEbyag.js                 5.98 kB │ gzip:   2.76 kB
dist/assets/PageExperience-DtK88eqq.js              6.08 kB │ gzip:   2.76 kB
...
✓ built in 4.43s
```
All 3 chunks grew (new drag logic), same pre-existing >500kB chunk
warning as every prior SEAL.

```
npm run lint
> resume-vuejs-website@1.8.0 lint
> eslint src --ext .js,.ts,.vue
(no output, exit 0)
```

```
npm run test -- --run
 Test Files  12 passed (12)
      Tests  91 passed (91)
```
7 new tests (`useManualOrder.spec.ts`), all pass. This run happened to
have ZERO of the previously-flagged flaky `VeeForm.spec.ts` failures
(observed intermittently in the last several SEALs, 0-3 failures per
run depending on timing) — consistent with them being flaky/pre-existing,
not something this diff touches (`git diff staging --stat -- src/
components/veevalidate/` is empty, confirmed).

## New tests (`useManualOrder.spec.ts`, 7 tests)
1. No saved order → returns the original list unchanged.
2. `reorder()` persists to `localStorage` AND `orderedItems` updates
   reactively (proves the reactivity wiring, not just the storage
   write).
3. A fresh composable instance (simulating a page reload) picks up a
   previously-saved order from `localStorage` on init.
4. Records not present in a saved order (added after the last manual
   sort) get appended at the end, keeping their natural order among
   themselves.
5. A saved id for a now-deleted record is silently dropped, no crash.
6. Storage key is scoped per candidate AND per collection — reordering
   one section's list doesn't touch another's saved order.
7. `localStorage.setItem` throwing (private-mode/quota) doesn't crash
   `reorder()` — in-memory state still updates, only persistence
   silently no-ops.

## Manual verification (UI diff — per `implement.md` step 7)
Same disclosed limitation as the last 3 sessions: no authenticated login
possible (no test credentials). Native HTML5 drag-and-drop is also
notoriously unreliable to simulate via CDP synthetic mouse events even
WITH a session (`dragstart`/`dragover`/`drop` need real OS-level drag
gesture semantics) — so a full click-through wasn't the strongest
available evidence here even in principle. Substitute evidence used
instead:
- `npm run dev` + curl: all 4 touched/new files return HTTP 200, zero
  compile errors.
- Read the ACTUAL compiled render output of `PageEducation.vue`:
  confirmed `draggable: "true"`, `onDragstart: $event => ($setup
  .onDragStart(edu._id))`, and `$setup.orderedItems` are really present
  in the rendered vnode tree — not just source code that looks right.
- The 7 unit tests exercise the actual reorder algorithm end-to-end
  (real splice/insert logic via `reorder()`, real `localStorage`,
  jsdom) — this is stronger evidence for the CORE risk in this diff
  (does the reorder math work, does it persist, does it survive a
  reload) than a visual drag simulation would have been.

## Acceptance
| Criterion | Evidence |
|---|---|
| Node on diagram before code | `issue-57-manual-reorder` row added, `IN_PROGRESS`, before any `src/` file touched |
| Branch dedicated, branched BEFORE code | `git branch --show-current` → `feature/issue-57-manual-reorder`; no repeat of `issue-59`'s slip |
| Backend gap verified, not assumed | `education.model.ts` read directly, confirmed no order field |
| Honest design — no fake server-sync claim | UI copy says "chỉ lưu trên trình duyệt này", composable's own header comment states the same |
| No new dependency | `grep` on `package.json` empty |
| Reorder logic correct incl. edge cases | 7/7 new tests pass (new records, deleted records, storage failure, per-collection scoping) |
| Build green | `✓ built in 4.43s` |
| Lint clean | exit 0, no output |
| No test regressions | 91/91 pass this run; 7 are new, rest match established baseline |

## Noticed, not done
- Award/Certificate (inline `ItemTemplate` pattern) and Reference
  (`TableDefault`, a shared component) — not wired with drag support in
  this node. Explicitly scoped out (see "Scope decision" #4 above), not
  silently dropped. `useManualOrder.ts` itself is already generic enough
  to reuse for those sections; only the drag-UI wiring is missing.
- Did not add a "reset to default order" button — user can currently
  only get back to date-sorted order by clearing that one localStorage
  key manually (or clearing site data). Minor UX gap, not part of the
  issue's stated scope, logged here in case the operator wants it later.

## REOPEN round 1 — fix applied
Verifier REOPENed with a real, cited defect: `fa-solid fa-grip-vertical`
was used in all 3 pages' drag-handle icon but never registered in
`src/plugins/initFontAwesomeIcon.js`'s fixed icon whitelist — confirmed
by the verifier via an empirical component-mount test that produced
`Could not find one or more icon(s)` and rendered no `<svg>`.

Fix: added `faGripVertical` to both the import list and `library.add(...)`
call in `src/plugins/initFontAwesomeIcon.js` — 2-line addition, the
established pattern every other icon in that file already follows.

Verified with the SAME method the verifier used (not just re-reading the
diff): mounted `FontAwesomeIcon` with the real `initFontAwesomeIcon`
plugin installed, icon `fa-solid fa-grip-vertical`, spied on
`console.error`. Result: `wrapper.find('svg').exists()` → `true`,
`console.error` → never called. Re-ran `npm run build` (`✓ built in
6.97s`), `npm run lint` (exit 0), `npm run test -- --run`
(`Test Files 12 passed (12)`, `Tests 91 passed (91)` — all green this
run, including the previously-flaky `VeeForm.spec.ts` file) — all green.

### Real finding, NOT in scope for this node — flagging clearly
While fixing this, checked whether ANY other icon used in the codebase
has the same registration gap. Found 2 more, **already shipped to
production** in earlier, already-SEALED-and-closed issues:
- `fa-solid fa-copy` (issue #60, duplicate button) — used in
  `EducationItem.vue`, `ExperienceItem.vue`, `ProjectItem.vue`,
  `PageAward.vue`, `PageCertificate.vue`, `PageReference.vue` (6 spots).
  Shipped in `v1.6.0`.
- `fa-solid fa-camera` (issue #58, avatar picker button) — used in
  `PageInformation.vue`. Shipped in `v1.8.0`.

Neither is in `initFontAwesomeIcon.js`'s whitelist — same bug class,
already live. Per LAI-13 (regressions/bugs in old SEALED nodes get a
NEW node, never silently folded into an unrelated diff), did **NOT**
fix these here — out of `issue-57`'s scope, and touching them here would
blur which node's evidence covers what. Recommending a separate,
dedicated follow-up node (e.g. `fontawesome-icon-registration-gaps`) to
fix all missing icon registrations in one pass, ideally with a
regression test that iterates every icon string actually used in `src/`
and asserts it resolves — so this class of bug can't silently ship a
4th time.

## Seal gate
No outward-facing action taken in this pass (no commit, no push, no
merge). Merging this branch into `staging` is a separate `/ship` step,
pending operator approval.
