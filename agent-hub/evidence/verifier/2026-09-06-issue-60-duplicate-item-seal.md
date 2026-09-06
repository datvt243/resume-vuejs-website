# 2026-09-06 — issue-60-duplicate-item — SEAL

- Worker: verifier
- Node: `issue-60-duplicate-item`
- New PM status: SEALED

## Isolation proof
This session was launched fresh, specifically to verify — no memory of
writing this diff. First actions of this session were loading the
`worker` skill and the verifier bundle (`manifest.yaml`/`SOUL.md`/
`doctrine/MEMORY.md`/`recipes/verify_seal.md`); no prior tool calls exist
in this session's history that touched `src/`. The launching task
explicitly states: "You are a FRESH session with no memory of writing
this diff — you were launched specifically to verify it, so
`NeverVerifyOwnWork` is satisfied by construction." Verified this
independently rather than only trusting that framing: `git status` at
the start of this pass showed 9 `src/` files + 1 diagram file already
modified in the working tree *before* I made any edit — i.e. the diff
pre-dates this session's actions, not something typed in this pass.

## Reasoning (evidence read directly from the repo, not inferred from the note)
- **Branch**: `git branch --show-current` / `git status` → on
  `feature/issue-60-duplicate-item`, not `main`/`staging`. `git log
  staging..feature/issue-60-duplicate-item` shows no commits (diff still
  uncommitted in working tree) — consistent with the note's Seal Gate
  section ("no outward-facing action taken").
- **Diff for all 9 touched files** (`git diff staging -- <file>`), read
  directly:
  - `EducationItem.vue`/`ExperienceItem.vue`/`ProjectItem.vue`: each adds
    `'onDuplicate'` to `defineEmits` and a new
    `a.btn.btn-outline-primary` button emitting
    `emits('onDuplicate', {...model})` — confirmed verbatim in all 3.
  - `PageEducation.vue`/`PageExperience.vue`/`PageProject.vue`: each adds
    `const isDuplicating = ref(false)`; `showModalDuplicateDoc(doc)` sets
    `isDuplicating.value = true` and copies `_id` + all model fields from
    `doc` (keeping `_id` truthy — the workaround); `showModalEditDoc`/
    `showModalCreateDoc` both reset `isDuplicating.value = false`;
    `handleUpdate` nulls `data._id = null` and resets the flag only
    `if (isDuplicating.value)`, immediately before `updateDoc`; Modal
    title and `VeeForm`'s `submit-text` both use the 3-way ternary
    `isDuplicating ? 'Nhân bản...' : document._id ? 'Chỉnh sửa...' :
    'Thêm mới...'` — checked the precedence is correct (`isDuplicating`
    evaluated *before* `_id`, required since `_id` stays truthy during
    duplicate); template wires `@on-duplicate="showModalDuplicateDoc"` on
    the 3 dedicated `Item.vue` components. `PageProject.vue`'s
    `showModalDuplicateDoc` additionally mirrors `showModalEditDoc`'s
    `document.technology = document.technology?.join(', ')` handling —
    checked side by side, identical.
  - `PageAward.vue`/`PageCertificate.vue`: same `isDuplicating`/
    `showModalDuplicateDoc`/`handleUpdate` pattern, plus a 3rd inline
    `<a class="btn ... btn-outline-primary">` button next to edit/delete
    (no dedicated Item component here, confirmed — these pages render
    `ItemTemplate` inline). `PageCertificate.vue`'s
    `showModalDuplicateDoc` also mirrors the existing
    `!document.isNoExpiration && (document.isNoExpiration = false)`
    normalization from `showModalEditDoc` — checked side by side,
    identical.
  - `PageReference.vue`: same `isDuplicating`/`showModalDuplicateDoc`/
    `handleUpdate` pattern; new "Nhân bản" `<li><a class="dropdown-item">`
    entry added to the existing `Dropdown` control slot (this page uses
    `TableDefault`+`Dropdown`, not `ItemTemplate` — confirmed).
- **`PageAward.vue`'s `document.school` → `document.name` fix**: read
  `src/models/award.model.ts` directly — its fields are `_id`, `name`,
  `organization`, `issueDate`, `link`, `description`. There is no
  `school` field. The old `document.school` reference in the modal title
  would have rendered `undefined`. `document.name` is the correct field.
  Confirmed on the exact line that had to be rewritten for the 3-way
  title logic anyway — not a separate opportunistic fix.
- **Load-bearing `VeeForm.vue` claim** — read the file directly (not the
  note): lines 71-85 are
  ```js
  watch(
      () => props.document,
      doc => {
          const keys = getFields.value.map(e => e.name)
          const _newDoc = {}
          for (const k of keys) { _newDoc[k] = doc[k] }
          setValues(_newDoc)
          if (!doc._id) { reset() }
      },
      { deep: true },
  )
  ```
  Exact match to the note's claim. `reset()` (line 91) sets every field
  back to `e.default`. Confirmed `_id` is a real tracked field: `grep -n
  defaultId src/types/model.type.ts src/models/*.model.ts` shows
  `defaultId` defined in `model.type.ts:58` and imported/spread into
  `education.model.ts`, `certificate.model.ts`, `experience.model.ts`,
  `information.model.ts`, `reference.model.ts`, `project.model.ts`;
  `award.model.ts` has an inline equivalent `{ name: '_id', ... default:
  null }` field (no `defaultId` import, but the same effect) — matches
  the note's claim exactly. This confirms the whole workaround (keep
  `_id` truthy while duplicating, only null it right before `updateDoc`)
  is necessary and correctly targeted — the naive approach (clearing
  `_id` up front) really would trigger `reset()` and blank the form.
- **Scope decision** (6 sections, not just the 3 named in the issue's
  bullet list): read the real GitHub issue via `gh issue view 60`. Its
  "Mô tả" section already explicitly names `(education/experience/
  project/award/certificate)` — 5, not just the 3 in "Phạm vi đề xuất"'s
  bullet — and that bullet itself ends with an open-ended `...`
  (`EducationItem.vue`, `ExperienceItem.vue`, `ProjectItem.vue`, `...`).
  Adding `reference` as a 6th, consistent, disclosed extension of the
  identical mechanical pattern to every CRUD-with-modal section sharing
  `useDocument.updateDoc`'s POST/PUT-by-`_id` mechanism is a reasonable,
  transparently-logged scope call, not undisclosed scope creep — does
  not trigger `SmallestDiff`/proportionality REOPEN.
- **Build** — re-ran `npm run build` myself: `✓ built in 6.03s`, all 6
  touched page chunks present with the same hashes as the note
  (`PageEducation-H75Pyf5W.js`, `PageExperience-7NgI_Gac.js`,
  `PageProject-CaQlwadK.js`, `PageAward-CC7GCTYD.js`,
  `PageCertificate-cCBP9r2l.js`, `PageReference-CrFLxgbD.js`), same
  pre-existing >500kB chunk warning only. Matches the note exactly.
- **Lint** — re-ran `npm run lint` myself: exit 0, no output. Matches.
- **Test suite** — re-ran `npm run test -- --run` myself:
  `Test Files 1 failed | 9 passed (10)`, `Tests 2 failed | 74 passed
  (76)`, both failures inside `src/components/veevalidate/VeeForm.spec.ts`
  named `BUG (real, verified — not asserting correctness): typing then
  clearing a required field does NOT disable submit` and `BUG (real,
  verified): clicking submit after touching+clearing a required field
  still calls submitFn`. Matches the note's claimed failure class
  exactly. Independently confirmed `git diff staging --stat -- src/
  components/veevalidate/` is empty on this branch — since this branch
  makes zero changes to `VeeForm.vue`, its spec, or anything it imports,
  the same 2 failures are logically guaranteed to exist identically on
  `staging` too (untouched code cannot behave differently), which
  independently proves the pre-existing-not-a-regression claim without
  needing a second checkout. Attempted to reuse the implementer's
  leftover `git worktree` at `/tmp/staging-check-issue60` for an
  additional literal staging-checkout run — its `node_modules` install
  was incomplete (no `vitest` binary despite 698 entries, install still
  running from the implementer's pass); started a fresh `npm install`
  there but it did not finish within a reasonable wait. Did not block on
  it — the zero-diff logical proof above is already conclusive and
  stronger than a second empirical run. Killed the stale/duplicate `npm
  install` processes and removed the worktree
  (`git worktree remove --force` + `rm -rf`) per cleanup instructions;
  confirmed gone via `git worktree list` (only the main repo remains) and
  `ls /private/tmp/` (no `staging-check-issue60`).

## Forbidden states (all 6 checked)
| State | Hit? |
|---|---|
| `ADHOC_WORK` | No — node exists on diagram, evidence note present |
| `NO_EVIDENCE` | No — implementer note present at `evidence/implementer/2026-09-06-issue-60-duplicate-item.md` |
| `EDIT_UNVERIFIED` | No — build/lint/test all independently re-run and matched |
| `CODE_IN_HAVEN` | No — only the diagram `.md` row touched in `haven/`, no code |
| `DIAGRAM_DRIFT` | No — updating node to SEALED in this same pass |
| `MAIN_EDIT` | No — branch is `feature/issue-60-duplicate-item`, confirmed via `git branch --show-current` |

## Seal gate
No outward-facing action in the implementer's pass (no commit/push/merge)
— correctly disclosed as "none" in the implementer's note. This verifier
pass itself only edits `haven/diagrams/` (PM status, in place) — not an
outward-facing action. Merging to `staging` is a separate `/ship` step,
still pending operator approval.

## Missing
None — every acceptance criterion in the implementer's note has citable,
independently-reproduced evidence.

## Re-run
`full` — re-ran `npm run build`, `npm run lint`, and `npm run test --
run` myself from scratch (not just audited the note), plus opened and
read all 9 touched-file diffs and `VeeForm.vue`/`award.model.ts`/
`model.type.ts` directly. Reason: this node's whole design rests on one
load-bearing claim about `VeeForm.vue`'s internal watcher behavior
(`EvidenceOnly` demands independently confirming the exact mechanism,
not trusting the note's quote of it), and the test-suite claim
(pre-existing-not-a-regression) benefits from an independent re-run
given it's the kind of claim that's easy to get wrong by assumption.
