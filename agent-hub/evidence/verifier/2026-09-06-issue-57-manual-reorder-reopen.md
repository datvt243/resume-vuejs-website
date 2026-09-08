# 2026-09-06 — issue-57-manual-reorder — REOPEN

- Worker: verifier
- Node: `issue-57-manual-reorder`
- New PM status: REOPEN (no ratchet advance — `haven/diagrams/
  dev-loop.prime-mermaid.md` row left at `IN_PROGRESS`, untouched, per
  `RatchetOnly`/recipe step 11 "only on SEAL")

## Isolation proof
Fresh subagent spawned by a separate orchestrating session specifically
to run `/worker verifier "#57"` against
`agent-hub/evidence/implementer/2026-09-06-issue-57-manual-reorder.md`.
This spawn's own task string never included writing any part of the
diff under review — no memory of authoring it, satisfying
`NeverVerifyOwnWork` by construction (per `SKILL.md`'s
"If you WERE launched as a fresh subagent specifically to verify, this
is already satisfied").

## Reasoning
Went through the note's claims and independently re-checked every one
against the real repo (not the note's prose) per the operator's explicit
re-verification instructions, which exceed the recipe's normal
audit-only default — treated as node-specific extra diligence, not a
loosening or tightening of the standard criteria.

| Criterion | Independent check | Result |
|---|---|---|
| Branch dedicated, not main/staging, branched cleanly | `git branch --show-current` → `feature/issue-57-manual-reorder`; `git reflog show feature/issue-57-manual-reorder` → single entry `branch: Created from staging`; `git stash list` → 1 entry, but labeled `On fix/issue-pages-base-path`, unrelated to this branch/session | Confirmed clean |
| Backend has no order field | Read `resume-nodejs-api/src/models/education.model.ts` directly — schema fields: `_id, school, major, startDate, endDate, description, isCurrent, candidateId`. No `order`/`sortIndex` | Confirmed |
| `useManualOrder.ts` design | Read file directly. Storage key: `` `cv-manual-order:${collection}:${candidate.getId \|\| 'anonymous'}` `` — scoped by collection + candidate. `orderedItems` computed: walks `savedOrder` ids, pulls matching item via a `Map`, un-matched saved ids (deleted records) are silently skipped (no push, no crash), then appends any `items.value` entries not consumed from the map (new/untracked records) at the end in natural order. `reorder(newList)` sets `savedOrder.value = ids` (reactive) AND calls `writeSavedOrder` (localStorage), both confirmed in the same function body | Matches the note's description exactly |
| `npx vitest run src/composables/useManualOrder.spec.ts` | Re-ran myself | `✓ 7 tests passed (7)` — matches note |
| Drag wiring in all 3 pages, no backend call | `git diff staging -- src/pages/dashboard/Page{Education,Experience,Project}.vue` read directly | All 3: `draggable="true"`, `@dragstart="onDragStart(...)"`, `@dragover.prevent`, `@drop="onDrop(...)"`, rendering `orderedItems` (not raw `dataList`), `onDrop` calls `reorder(list)`. No `updateDoc`/`updatePatchDoc` call added anywhere in these 3 diffs — confirmed never talks to backend |
| No new dependency | `grep -iE "drag\|sortable\|dnd" package.json` → exit 1, empty | Confirmed |
| Scope-narrowing reasonable + disclosed | `gh issue view 57` — title: "...thứ tự Education/Experience/Project" (3 sections); body's "Phạm vi đề xuất" broadens to 6 (adds Award/Certificate/Reference) | Title-vs-body split is real, not invented. 3-section scope matches the title. Follow-up disclosed in both the evidence note ("Noticed, not done") and the diagram row — not silently dropped. Reasonable |
| `npm run build` | Re-ran | `✓ built in 4.49s`, same 3 chunk sizes as the note (PageEducation 5.44 kB, PageProject 5.98 kB, PageExperience 6.08 kB) |
| `npm run lint` | Re-ran | No output, exit 0 — matches |
| `npm run test -- --run` | Re-ran | `Test Files 12 passed (12)`, `Tests 91 passed (91)` — same count as the note, zero VeeForm flaky failures this run either |
| `git diff staging --stat -- src/components/veevalidate/` | Re-ran | Empty output — confirmed zero changes there this branch, independent of this run's pass/fail state |
| 6 forbidden states | `ADHOC_WORK` no (node exists, IN_PROGRESS, before code); `NO_EVIDENCE` no (note exists); `EDIT_UNVERIFIED` no (every claim re-run above); `CODE_IN_HAVEN` no (only the diagram `.md` touched under `agent-hub/`); `DIAGRAM_DRIFT` no (row added before code, per note); `MAIN_EDIT` no (see branch check above) | All 6 clear |

## New defect found (not in the note, found via direct independent read)
All 3 touched pages render a drag-handle icon:
```html
<span class="drag-handle"><FontAwesomeIcon icon="fa-solid fa-grip-vertical" /></span>
```
`src/plugins/initFontAwesomeIcon.js` — the app's ONLY place that
registers icons into the FontAwesome library — imports and
`library.add()`s a fixed, explicit list of icons. `faGripVertical` is
**not** in that list (checked the full import block and the full
`library.add(...)` call directly, line by line).

Verified this is a real runtime failure, not a false positive: mounted
`FontAwesomeIcon` in a scratch spec with the SAME registered-icon subset
the app actually uses (i.e. `grip-vertical` intentionally excluded,
mirroring `initFontAwesomeIcon.js`) and requested
`icon="fa-solid fa-grip-vertical"`:
```
HTML OUTPUT:
console.error called times: 1
console.error args: [["Could not find one or more icon(s)",{"prefix":"fas","iconName":"grip-vertical"},{}]]
```
The component renders no `<svg>` and logs a `console.error` — this will
happen on every render of every item in Education/Experience/Project in
production, exactly as shipped in this diff. (Scratch spec was written
outside the tracked diff, run, and deleted immediately after — not part
of any evidence artifact, purely my own re-check.)

Impact: the drag handle the note's own diff description calls out
("added ... a grip-icon handle") is invisible with no visual affordance
that the row is draggable, and every list render spams a console error.
The `<li>` itself is still `draggable="true"` so the underlying reorder
mechanism is unaffected — this is a real UI/craft defect in the exact
diff being sealed, not a nitpick, and it was not caught by
build/lint/the new unit tests (none of which mount the actual page
components), nor disclosed anywhere in the evidence note's "Manual
verification" section despite that section explicitly claiming to have
read "the ACTUAL compiled render output of `PageEducation.vue`."

## Missing
- No fix for the unregistered `faGripVertical` icon (import + `library.add`
  in `src/plugins/initFontAwesomeIcon.js`) — a one-line-ish addition,
  smallest possible diff to close this REOPEN.
- No disclosure of this defect in the note despite the note's own claim
  of having inspected the compiled render output.

## Re-run
`full` — re-ran `npx vitest run useManualOrder.spec.ts`, `npm run build`,
`npm run lint`, `npm run test -- --run`, plus an independent scratch
mount test for the FontAwesome icon claim (not in the note at all).
Reason: the operator's task explicitly requested independent re-execution
of every command and direct reads of every touched file for this node,
exceeding the recipe's normal audit-only default — logged here as an
explicit exception per "Re-run scope"'s 3rd case (a per-node call from
the invoking instructions, not a blanket recipe change).
