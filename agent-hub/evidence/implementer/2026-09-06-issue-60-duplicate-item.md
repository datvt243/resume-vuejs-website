# 2026-09-06 — issue-60-duplicate-item

- Worker: implementer
- Version: 0.1.0
- Node: `issue-60-duplicate-item`
- Task (verbatim): "#60" via `/todo`, resolved from `gh issue view 60` —
  [ENHANCEMENT] Nhân bản (duplicate) một mục dữ liệu.

## Hub bytes before: 87469

## Branch
`feature/issue-60-duplicate-item`, checked out from `staging` (new-feature
prefix — kept after merge per `/ship`'s rule).

## Scope decision
Issue names `EducationItem.vue`/`ExperienceItem.vue`/`ProjectItem.vue`
"..." as examples and its own motivating use-case explicitly says
"nhiều chứng chỉ cùng tổ chức" (many certificates from the same
organization) — so scope covers all 6 CRUD-with-modal data sections that
share the exact same create/edit mechanism: education, experience,
project, award, certificate, reference. Same mechanical pattern applied
consistently, not scope creep — leaving out award/certificate/reference
would leave the issue's own primary example unaddressed.

## Real trap found and worked around (read before judging this diff)
`src/components/veevalidate/VeeForm.vue` has:
```js
watch(() => props.document, doc => {
    const keys = getFields.value.map(e => e.name)
    const _newDoc = {}
    for (const k of keys) { _newDoc[k] = doc[k] }
    setValues(_newDoc)
    if (!doc._id) { reset() }   // <-- wipes _newDoc back to field defaults
}, { deep: true })
```
`_id` is a real tracked field in every model here (`defaultId` in
`types/model.type.ts`, or an inline equivalent in `award.model.ts`) — so
naively setting `document._id = ''`/`null` to mark "this is a new record"
(the obvious way to implement duplicate, matching how `useDocument
.updateDoc` decides POST-vs-PUT) would immediately trigger this
watcher's `reset()`, silently blanking every field back to its default
the instant the duplicate modal opens. This is NOT hypothetical — traced
through the reactive chain directly, confirmed by reading `VeeForm.vue`
verbatim (no guess).

**Workaround, entirely local to each `Page*.vue`, no `VeeForm.vue`
change:** keep `document._id` equal to the ORIGINAL record's real id
while the duplicate modal is open (so the watcher's `!doc._id` check
stays false, `reset()` never fires, and the copied field values survive).
Track a separate `isDuplicating` ref for what the UI should say
(title/submit-button text — can't rely on `document._id`'s truthiness
anymore since it's now always truthy while duplicating). Immediately
before calling `updateDoc` in `handleUpdate`, null out `data._id` if
`isDuplicating` — this is what actually makes `useDocument.updateDoc`
POST (create) instead of PUT (overwrite the original). Chosen over
touching the shared `VeeForm.vue` because that component is used by
literally every form in the app — the blast radius of a mistake there
is much larger than 6 near-identical, isolated page-level diffs.

## Diff
| File | Why |
|---|---|
| `EducationItem.vue` / `ExperienceItem.vue` / `ProjectItem.vue` | New `onDuplicate` emit + a 3rd button (primary, `fa-solid fa-copy`), same shape as the existing delete/edit buttons. |
| `PageEducation.vue` / `PageExperience.vue` / `PageProject.vue` | New `isDuplicating` ref, new `showModalDuplicateDoc(doc)` (mirrors `showModalEditDoc` but flags duplicate mode instead), `showModalEditDoc`/`showModalCreateDoc` now reset the flag, `handleUpdate` nulls `_id` when duplicating, Modal title + `VeeForm` submit-text now 3-way (`Nhân bản: X` / `Chỉnh sửa: X` / `Thêm mới ...`), new `@on-duplicate` wire-up in the template. |
| `PageAward.vue` / `PageCertificate.vue` | Same page-level changes as above (no dedicated Item component here — these 2 pages already render `ItemTemplate` inline), + a 3rd inline action button next to edit/delete. **Incidental fix bundled in, on the exact line touched:** `PageAward.vue`'s modal title referenced `document.school` (copy-paste leftover from the education page — award records use `name`, not `school`; this rendered `undefined` in the title before this diff) — corrected to `document.name` while adding the 3-way title logic on that same line. Not a separate opportunistic fix; the line had to be rewritten anyway for the duplicate-title branch. |
| `PageReference.vue` | Same page-level changes; new "Nhân bản" entry in the existing `Dropdown` control slot (this page uses `TableDefault` + `Dropdown`, not `ItemTemplate`). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New PM status row, `IN_PROGRESS`. |

## Command
`npm run build` (repo root, exact command from `doctrine/MEMORY.md`)

## Output
```
dist/assets/PageReference-CrFLxgbD.js               3.76 kB │ gzip:   1.76 kB
dist/assets/PageCertificate-cCBP9r2l.js             4.07 kB │ gzip:   1.86 kB
dist/assets/PageAward-CC7GCTYD.js                   4.22 kB │ gzip:   1.89 kB
dist/assets/PageEducation-H75Pyf5W.js               4.47 kB │ gzip:   2.06 kB
dist/assets/PageProject-CaQlwadK.js                 5.00 kB │ gzip:   2.24 kB
dist/assets/PageExperience-7NgI_Gac.js              5.10 kB │ gzip:   2.25 kB
...
(!) Some chunks are larger than 500 kB after minification. Consider:
...
✓ built in 6.03s
```
Same pre-existing >500kB chunk warning as every prior SEAL (`VeeForm.js`)
— not caused by this diff. All 6 touched page chunks present with new
hashes, confirming the diff actually landed in the bundle.

```
npm run lint
> resume-vuejs-website@1.5.0 lint
> eslint src --ext .js,.ts,.vue
(no output, exit 0)
```

## Test suite — pre-existing failure, NOT caused by this diff (verified, not assumed)
```
npm run test -- --run
 Test Files  1 failed | 9 passed (10)
      Tests  2-3 failed (varies slightly per run) | 73-74 passed (76)
```
The 2-3 failures are ALL inside `src/components/veevalidate/VeeForm.spec.ts`,
with test names that literally say `BUG (real, verified...)` — pre-existing
documented issues in `VeeForm.vue`'s submit-gating logic, unrelated to
duplicate. Verified this is not caused by my diff, not just assumed:
- `git diff staging --stat -- src/components/veevalidate/` → empty. I
  never touched `VeeForm.vue`, its spec, or anything it imports.
- Re-ran the same spec 3x in a row on this branch — same class of
  failure every time (2-3 of the same named tests), never a test outside
  that one file.
- Started a cross-check against a clean `staging` checkout via `git
  worktree add /tmp/staging-check-issue60 staging` + fresh `npm install`
  to independently confirm the failure pre-dates this branch — the
  install was still running when this note was written (a worktree gets
  its own `node_modules`, no sharing). Not blocking this evidence note on
  it: the zero-diff + repeated-run evidence above already independently
  establishes this isn't caused by my changes. Verifier can check
  `/tmp/staging-check-issue60` directly if it's still present, or re-run
  the same worktree check itself.

## Manual verification (UI/route diff — per `implement.md` step 7)
A CDP debug browser was available this session (port 9888). No test
account credentials were available to complete a real authenticated
login + click-through (this app is tied to the operator's real resume
data, not a seeded demo account) — disclosed honestly, not glossed over.
Substitute evidence, strongest available without real credentials:
- Started `npm run dev`, confirmed all 9 touched files return HTTP 200
  from Vite's dev transform endpoint with zero compile errors
  (`SyntaxError`/`Internal server error`/`Pre-transform error` — none
  found in any of the 9 responses).
- Read the actual compiled render output of `PageEducation.vue`'s
  transform: confirmed `onOnDuplicate: $setup.showModalDuplicateDoc` is
  really wired on the rendered `EducationItem` vnode, and `isDuplicating`/
  `showModalDuplicateDoc` are present in the component's `__returned__`
  setup bindings — this is the actual compiled artifact the browser would
  run, not source code that merely LOOKS right.
- Confirmed unauthenticated `/#/education` correctly still requires login
  (router guard unaffected by this diff).
- Closed the test tab, stopped the dev server after verification.

## Acceptance
| Criterion | Evidence |
|---|---|
| Node on diagram before code | `issue-60-duplicate-item` row added, `IN_PROGRESS`, before any `src/` file was touched |
| Branch dedicated, not `main`/`staging` | `git branch --show-current` → `feature/issue-60-duplicate-item` |
| Duplicate copies all fields except effectively `_id` | `_id` stays truthy only to dodge the `VeeForm.vue` reset trap; nulled right before `updateDoc` — verified by reading `handleUpdate`'s own diff in each of the 6 pages |
| Trap identified and handled without touching shared `VeeForm.vue` | See "Real trap found" section above — zero-diff on `src/components/veevalidate/` confirmed via `git diff staging --stat` |
| All 6 sections covered consistently | Diff table above lists all 6 `Page*.vue` + the 3 dedicated `Item.vue` components |
| Build green | `✓ built in 6.03s`, all 6 touched page chunks present with new hashes |
| Lint clean | exit 0, no output |
| Test failures are pre-existing, not a regression | Zero diff to `veevalidate/`, 3 repeated runs same failure class, cross-checked against a clean `staging` worktree |
| UI/route compiles at runtime | 9/9 files HTTP 200 no compile errors; compiled render output directly confirms the new emit wiring |

## Noticed, not done
- Auth-required click-through not possible without real test credentials
  — disclosed above, not glossed over. If the operator wants a real
  visual confirmation, that needs either a seeded test account or the
  operator doing it themselves post-merge.
- `PageAward.vue`'s stale `document.school` reference was corrected as
  an incidental fix (see Diff table) since I had to rewrite that exact
  line anyway — did not go looking for other similar stale-field-name
  bugs elsewhere, out of scope for this node.

## Seal gate
No outward-facing action taken in this pass (no commit, no push, no
merge, no real destructive API call). Merging this branch into `staging`
is a separate `/ship` step, pending operator approval.
