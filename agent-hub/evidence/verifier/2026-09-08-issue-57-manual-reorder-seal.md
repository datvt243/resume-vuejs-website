# 2026-09-08 — issue-57-manual-reorder — SEAL

- Worker: verifier
- Node: `issue-57-manual-reorder`
- New PM status: SEALED (row updated IN PLACE from `IN_PROGRESS` → `SEALED`
  in `haven/diagrams/dev-loop.prime-mermaid.md`, per `AppendOnly` — not
  reordered/moved)

## Isolation proof
Fresh subagent spawned specifically to run `/worker verifier "#57"` against
`agent-hub/evidence/implementer/2026-09-06-issue-57-manual-reorder.md`
(re-verification of a REOPEN fix). This spawn's own task string never
included writing any part of the diff or the fix under review — no memory
of authoring `useManualOrder.ts`, the 3 page wirings, or the
`initFontAwesomeIcon.js` fix. `NeverVerifyOwnWork` satisfied by
construction (per `SKILL.md`: "If you WERE launched as a fresh subagent
specifically to verify, this is already satisfied"). This is also a
**second, independent** re-verification pass distinct from the one that
wrote `2026-09-06-issue-57-manual-reorder-reopen.md` — that prior REOPEN
verdict was read as background/history only, not trusted as this pass's
own evidence; every claim below was re-derived from the repo directly.

## Reasoning
Read the CURRENT implementer note fresh (including its new "REOPEN round 1
— fix applied" section) and independently re-checked every claim against
the real repo — did not assume anything from the prior REOPEN note except
as background on what was originally wrong.

### REOPEN fix — re-verified independently, not trusted from the note
| Check | Method | Result |
|---|---|---|
| `faGripVertical` imported | Read `src/plugins/initFontAwesomeIcon.js` directly | `faGripVertical` present in the `@fortawesome/free-solid-svg-icons` import block (line 39) |
| `faGripVertical` registered | Same file | Present as the last arg to `library.add(...)` (line 77) |
| Icon actually renders, no console error | Wrote my own throwaway spec (`src/plugins/__verifier-throwaway-icon-check.spec.ts`, NOT copied from the implementer's or prior verifier's test) — mounted the real `FontAwesomeIcon` component with the real `initFontAwesomeIcon` plugin installed via `global.plugins`, `icon="fa-solid fa-grip-vertical"`, spied on `console.error` | `npx vitest run src/plugins/__verifier-throwaway-icon-check.spec.ts` → `✓ 1 test passed`; assertions inside: `wrapper.find('svg').exists()` → `true`, `console.error` spy → never called. File deleted immediately after (`rm`, confirmed via `git status --short` showing no trace) |

### Everything else — re-verified from scratch, not just the icon fix
| Check | Method | Result |
|---|---|---|
| Branch | `git branch --show-current` (my own session) | `feature/issue-57-manual-reorder` — not main/staging |
| Backend has no order field | Read `resume-nodejs-api/src/models/education.model.ts` directly | Schema fields: `_id, school, major, startDate, endDate, description, isCurrent, candidateId`. No `order`/`sortIndex`. Matches note's claim |
| `useManualOrder.ts` logic sound | Read the full file directly | `storageKey` computed as `` cv-manual-order:${collection}:${candidate.getId \|\| 'anonymous'} `` — scoped per collection+candidate. `orderedItems`: builds a `Map` of current items by `_id`, walks `savedOrder` pulling matches (deleted-record ids silently skipped via `Map.get` returning undefined, no crash), then appends any items left in the map (new/untracked) in natural order. `reorder()` sets both the reactive `savedOrder` ref AND calls `writeSavedOrder` (try/catch around `localStorage.setItem`, silently no-ops on quota/private-mode failure). Real read-through, not zero-verification — logic is sound and matches the note's description exactly |
| `useManualOrder.spec.ts` | `npx vitest run src/composables/useManualOrder.spec.ts` (my own run) | `✓ 7 tests passed (7)` |
| Drag wiring, no backend call | `git diff staging -- src/pages/dashboard/PageEducation.vue` read directly | `useManualOrder('education', dataList)` wired, `onDragStart`/`onDrop` implemented via splice+insert then `reorder(list)`, `<li v-for="edu in orderedItems">` with `draggable`/`@dragstart`/`@dragover.prevent`/`@drop`, disclosure text "Kéo-thả để sắp xếp thứ tự hiển thị (chỉ lưu trên trình duyệt này)." No `updateDoc`/`updatePatchDoc`/axios call added — confirmed by reading the full diff, not grepping for absence |
| `npm run build` | Re-ran myself | `✓ built in 4.93s`; chunk sizes: `PageEducation 5.44 kB`, `PageProject 5.98 kB`, `PageExperience 6.08 kB` — match the note exactly; same pre-existing >500kB `VeeForm` chunk warning |
| `npm run lint` | Re-ran myself | `eslint src --ext .js,.ts,.vue` → no output, exit 0 |
| `npm run test -- --run` | Re-ran myself | `Test Files 12 passed (12)`, `Tests 91 passed (91)` — matches note; zero VeeForm flakiness this run |
| Pre-existing icon-gap disclosure (`fa-copy`, `fa-camera`) | `grep -n "faCopy\|faCamera" src/plugins/initFontAwesomeIcon.js` → empty. `grep -rn "fa-copy\|fa-camera" src --include="*.vue"` | Confirmed real: `fa-solid fa-copy` used in 6 files (`EducationItem.vue`, `ExperienceItem.vue`, `ProjectItem.vue`, `PageAward.vue`, `PageCertificate.vue`, `PageReference.vue`), `fa-solid fa-camera` in `PageInformation.vue` — none registered. Both already shipped (issue #60/v1.6.0, issue #58/v1.8.0 per the note) |
| 6 forbidden states | `ADHOC_WORK` no (node existed before code, evidence written); `NO_EVIDENCE` no (implementer note + this note); `EDIT_UNVERIFIED` no (every claim above independently re-run/re-read, not just trusted); `CODE_IN_HAVEN` no (`git status` before this pass showed only `dev-loop.prime-mermaid.md` + evidence `.md` files touched under `agent-hub/`, no `.ts`/`.js`/`.vue` leaked there); `DIAGRAM_DRIFT` no (row now updated to SEALED matching the real, verified diff); `MAIN_EDIT` no (branch confirmed above) | All 6 clear |

### On the `fa-copy`/`fa-camera` disclosure — judged reasonable, not a blocker
This is a genuinely disciplined call, not scope-creep avoidance dressed up
as diligence:
1. Both bugs are the SAME class as the one just fixed here (unregistered
   FontAwesome icon → invisible + console error), but they live in
   **already-SEALED, already-shipped** nodes (issue #60, issue #58) — not
   part of this diff's touched files.
2. Per `LAI-13` (bugs/regressions found in old SEALED nodes get their OWN
   new node, never silently folded into an unrelated diff), fixing them
   here would blur which node's evidence covers what, and would violate
   `SmallestDiff`/proportionality (recipe step 9) — this diff's job is
   `issue-57`'s drag reorder + its own REOPEN fix, not a general icon-audit
   sweep.
3. The disclosure is not silent — it's explicit in the note (with exact
   file lists and issue/version provenance) and recommends a concrete
   follow-up node name (`fontawesome-icon-registration-gaps`). That is the
   correct outcome of finding an out-of-scope bug while working: name it,
   don't fix it here, don't bury it either.
4. This does not block SEAL. Blocking on it would mean punishing correct
   scope discipline, which is backwards.

## Missing
None.

## Re-run
`full` — re-ran `npx vitest run src/composables/useManualOrder.spec.ts`,
`npm run build`, `npm run lint`, `npm run test -- --run`, plus my own new
throwaway FontAwesome mount test (not reused from the prior REOPEN pass).
Reason: the operator's task explicitly requested independent re-execution
of every command, a fresh empirical test for the REOPEN fix specifically,
and a from-scratch read-through of the underlying feature logic (not just
auditing the note) — this exceeds the recipe's normal audit-only default,
logged as the 2nd/3rd exception cases in "Re-run scope" (outward-risk node
with a prior REOPEN history + an explicit per-node instruction).

## Hub bytes before / after
`hub_bytes_before=97391` (from the implementer note's own "Hub bytes
before" line, reused per recipe step 13 — unchanged since this same figure
was already carried through the round-1 REOPEN pass, which made no
diagram-byte-affecting change).
`hub_bytes_after=101241` (measured via the `/hub-tokens` per-session-total
formula, AFTER updating the diagram row to SEALED in step 11).
