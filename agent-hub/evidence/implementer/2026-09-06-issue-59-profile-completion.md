# 2026-09-06 — issue-59-profile-completion

- Worker: implementer
- Version: 0.1.0
- Node: `issue-59-profile-completion`
- Task (verbatim): "#59" via `/todo`, resolved from `gh issue view 59` —
  [ENHANCEMENT] Thanh tiến độ hoàn thiện hồ sơ trên Dashboard.

## Hub bytes before: 90120 (measured late — see "Process note" below)

## Process note — read first, this is a real deviation from the recipe
I wrote the entire code diff (composable + spec + `PageHome.vue` wiring)
**directly on `staging`, before creating a branch or a diagram node** —
skipped `pick_next`'s node-first step and `implement.md` step 0
(`BranchBeforeCode`) entirely. Caught it myself before any commit
(`git status` showed the diff sitting on `staging`), recovered cleanly:
`git stash push -u` → `git checkout -b feature/issue-59-profile-completion
staging` → `git stash pop` → added the diagram node retroactively. No
commit ever touched `staging`, so no history damage — but the sequencing
was wrong and I'm not hiding that. `hub_bytes_before` above was measured
AFTER the fact (post-recovery), not before writing code as the recipe
requires — flagging this explicitly rather than presenting it as if it
were measured on time.

## Branch
`feature/issue-59-profile-completion`, now correctly based on `staging`
(new-feature prefix — kept after merge per `/ship`'s rule).

## Scope decision — smaller than it looks
`PageHome.vue` already had the ENTIRE UI shell for this feature, built
during an earlier session and explicitly marked as a placeholder in its
own comments: `const profileCompletion = 72` with a comment
"tính năng thật chưa có, số liệu mẫu" (real feature doesn't exist yet,
sample data) and template text "Chức năng tính % hồ sơ hoàn thành chưa
có, số liệu trên là số liệu mẫu." This node's real scope is: build the
composable that computes a REAL number, wire it in, and update/remove
the "chưa có" disclaimer since it's no longer accurate — not build a new
UI from scratch.

## Design
`src/composables/useProfileCompletion.ts` (new):
- Per the issue's own suggested approach ("Mỗi model đã tự khai báo
  field nào required qua Yup"), does NOT hardcode a required-field list.
  Calls each model field's real `valid: yup => ...` function (the same
  one `VeeForm.vue` uses for actual form validation) and reads
  `schema.describe().tests` to check for a `required` test — verified
  directly in a throwaway `node -e` before writing the composable:
  `yup.string().required().describe().tests` → `[{name:'required'}]`,
  `yup.string().describe().tests` → `[]`. Real introspection, not a
  guess at Yup's internals.
- **Object sections** (Thông tin cơ bản → `information.model.ts`'s
  `modalDefault`, Thông tin chung → `generalInformation.model.ts`):
  complete only when EVERY required field (found via the introspection
  above) has a filled value in `candidateStore.getCandidate`/
  `getGeneralInformation`.
- **List sections** (education/experience/project/award/certificate/
  reference): complete = has ≥1 record. Fetches each via `useCandidate`
  (same pattern `PagePreview.vue` already uses for all 7 sections) so
  the % is correct even if the user hasn't visited that dashboard
  sub-page yet this session.
- **8 sections weighted equally** (1 point each), NOT by raw
  required-field count. Reasoning: the 2 object sections have 7-9
  required fields each vs. list sections needing just "≥1 record" —
  field-count weighting would make filling only Basic+General Info
  already worth ~74% before touching any CV section, which doesn't
  match the issue's own example ("chưa có Reference, chưa điền
  Certificate" — talking about missing SECTIONS, plural, each mattering
  equally).
- Returns `{ percent, sections, missingSections }` — `sections` includes
  each section's real dashboard route (`to`), used to render clickable
  links to the incomplete sections (issue's 2nd deliverable: "danh sách
  section còn thiếu").

`PageHome.vue`: replaced the hardcoded `72` with
`useProfileCompletion()`, removed the "số liệu mẫu" disclaimer, replaced
the static "Xem hồ sơ →" link with a real missing-sections list (or the
original all-done message when `missingSections` is empty).

## Diff
| File | Why |
|---|---|
| `src/composables/useProfileCompletion.ts` (new) | The real completion-% logic described above. |
| `src/composables/useProfileCompletion.spec.ts` (new) | 8 tests — see below. |
| `src/composables/index.ts` | Added to the barrel export (matches 5 of 6 existing composables' convention). |
| `src/pages/home/PageHome.vue` | Wired the real composable in place of the hardcoded `72`; updated the doc comment; template now shows a real missing-sections list instead of the static disclaimer text. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New PM status row, `IN_PROGRESS` (added retroactively — see Process note). |

## Command
`npm run build` (repo root, exact command from `doctrine/MEMORY.md`)

## Output
```
dist/assets/PageHome-Bdtnlr1r.js                    7.15 kB │ gzip:   3.31 kB
dist/assets/index.esm-B1zl171F.js                  42.53 kB │ gzip:  13.42 kB
...
✓ built in 5.24s
```
`PageHome` chunk grew from 5.21kB → 7.15kB (expected, new logic). A new
`index.esm-*.js` chunk appeared — this is `yup` getting split into its
own shared chunk now that it's imported from a composable outside
`VeeForm.vue`'s own bundle path; `VeeForm-*.js` correspondingly shrank
(997.61kB → 954.96kB). Better code-splitting, not a regression. Same
pre-existing >500kB chunk warning as every prior SEAL.

```
npm run lint
> resume-vuejs-website@1.6.0 lint
> eslint src --ext .js,.ts,.vue
(no output, exit 0)
```
One real finding caught and fixed during this pass: the spec file's
`beforeEach` mock had an unused type-annotation parameter name (`res`
inside `(res: unknown) => void`) — renamed to `_res` to match the
project's `no-unused-vars` allow-pattern. Re-ran lint clean after.

```
npm run test -- --run
 Test Files  1 failed | 10 passed (11)
      Tests  3 failed | 81 passed (84)
```
8 new tests, all passing (`useProfileCompletion.spec.ts`, 1 file). The 3
failures are the SAME pre-existing `VeeForm.spec.ts` failures already
established as unrelated in the last 2 SEALed nodes
(`issue-60-duplicate-item`, and before it `issue-61`) — this branch made
zero changes to `src/components/veevalidate/`.

## New tests (`useProfileCompletion.spec.ts`, 8 tests)
1. Empty `candidateStore` → 0%, all 8 sections missing.
2. "Thông tin cơ bản" flips complete→incomplete when a genuinely
   `.required()` field (`address`) is cleared — proves the yup
   introspection actually drives the result, not a hardcoded list.
3. "Thông tin chung" is complete even with `careerGoal` empty — the one
   field in that model with NO `.required()` — proves the introspection
   correctly excludes non-required fields too (not just "any field
   listed in the model").
4. A list section is complete from a single record regardless of that
   record's own fields (matches the "≥1 record" design, not per-item
   field validation).
5. All 8 sections complete → 100%.
6. 2/8 sections complete → 25% (equal-weighting math, not field-count
   weighting).
7. Every section's `to` matches its real dashboard route.
8. Sanity guard: both object models still declare at least 1 real
   `.required()` field (protects against a future model edit silently
   making every object-section auto-complete).

## Manual verification (UI diff — per `implement.md` step 7)
Same limitation as `issue-60`/`issue-61`'s prior sessions: no real
authenticated login was possible (no test credentials for this
operator's real account, confirmed again this session — a fresh CDP tab
against the dev server had no cached token in `localStorage`). Disclosed
honestly. Substitute evidence:
- `npm run dev` + curl against Vite's transform endpoint: both
  `useProfileCompletion.ts` and `PageHome.vue` return HTTP 200 with zero
  compile errors.
- The 8 unit tests above exercise the actual reactive logic end-to-end
  (mount a real component, real Pinia store, real model files imported —
  not mocked model data) — this is stronger evidence for THIS specific
  diff than a login-gated visual check would have been, since the risk
  here was in the calculation logic, not the DOM/CSS.

## Acceptance
| Criterion | Evidence |
|---|---|
| Node on diagram | `issue-59-profile-completion` row present, `IN_PROGRESS` (added retroactively, disclosed) |
| Branch dedicated, not `main`/`staging` | `git branch --show-current` → `feature/issue-59-profile-completion`; confirmed `staging` itself carries zero commits from this work (`git log staging..HEAD` would show this branch's commit once committed, `staging` untouched) |
| % derived from real required-field data, not hardcoded | `isRequiredField` reads `schema.describe().tests`, verified with a real `node -e` yup check before writing; test #2/#3 above prove it drives real behavior |
| Missing-section list (issue's 2nd deliverable) | `missingSections` + real `to` routes, rendered in `PageHome.vue` |
| Build green | `✓ built in 5.24s` |
| Lint clean | exit 0 (1 real finding caught + fixed during this pass) |
| No test regressions | 8/8 new tests pass; same 3 pre-existing unrelated `VeeForm.spec.ts` failures as the last 2 SEALs |

## Noticed, not done
- The `BranchBeforeCode` process slip itself — already disclosed above
  in full, not repeating here as a separate "bug," just cross-referencing.
- `PageHome.vue`'s comment still references section numbering (1-4) from
  before this change; only updated section 4's own paragraph, didn't
  renumber/rewrite the whole doc comment — out of scope for this node.

## Seal gate
No outward-facing action taken in this pass (no commit, no push, no
merge). Merging this branch into `staging` is a separate `/ship` step,
pending operator approval.
