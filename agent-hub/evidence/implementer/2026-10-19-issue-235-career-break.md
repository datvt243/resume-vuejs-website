# 2026-10-19 - issue-235-career-break

- Worker: implementer
- Version: 0.1.0
- Node: `issue-235-career-break` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at the end of the table, `IN_PROGRESS`)
- Task (verbatim): #235 feat(experience): tạo/cập nhật career break như LinkedIn. https://github.com/datvt243/resume-vuejs-website/issues/235

## Hub bytes before: 195918

## Branch
`feature/issue-235-career-break`, created from freshly pulled `staging` via `gh issue develop 235 --checkout --base staging` (linked to #235). Not `main`, not `staging`.

## Dependency check
Backend resume-nodejs-api#267 is closed. PR #268 (`267-phn-experience-b-sung` → `staging`) was merged 2026-10-19T10:37Z, and release PR #269 (→ `main`) was merged 2026-10-19T10:48Z. The vi/en labels were copied verbatim from backend `origin/main:src/locales/{vi,en}.ts` (`cv.careerBreak`, `cv.careerBreakTypes.*`).

## Diff
| File | Why |
|---|---|
| `src/types/experience.type.ts` | `isCareerBreak?: boolean`, `careerBreakType?: string`. |
| `src/types/model.type.ts` | Optional `showIf?: (values) => boolean` on `modelItem`. |
| `src/components/veevalidate/VeeForm.vue` | Hides a field while its `showIf(values)` is false. It uses `v-show`, so the field stays mounted (same approach as the VI/EN toggle). `showIf` is stripped from `getFields` so it isn't bound as a DOM attribute. |
| `src/models/experience.model.ts` | `CAREER_BREAK_TYPES` (12 keys, `{vi,en}`) and `experienceTitle(exp, lang)`. New fields `isCareerBreak` (checkbox) and `careerBreakType` (select; when on, required and `oneOf` the 12 keys). `company`/`position` are only `required` when `isCareerBreak` is false (`yup.when`), and hidden while it is on. |
| `src/pages/dashboard/PageExperience.vue` | Payload goes through `careerBreakPayload(val)` (in the model file): `isCareerBreak` is forced to a boolean. A break gets `company`/`position` set to `''`, and a normal entry gets `careerBreakType: ''`, so no stale value from a toggled entry is sent. Modal title and delete confirm use `experienceTitle`. |
| `src/components/experience/ExperienceItem.vue` | List title is `experienceTitle(model)` ("Nghỉ việc tạm thời — <loại>"). The subtitle is the position, which is empty for a break. |
| `src/components/cv/CvResumeLayout.vue` | Experience title is `experienceTitle(exp, lang)`. This covers PagePreview and the public CV. |
| `src/pages/dashboard/PageProfile.vue` | Experience picker title uses `experienceTitle`. |
| `src/models/experience.model.spec.ts` (new) | Schema: a break needs a valid type and skips company/position; a normal entry still requires them. Titles in vi/en. |
| `VeeForm.spec.ts`, `CvResumeLayout.spec.ts` | +1 test each: `showIf` toggles visibility and isn't leaked as an attribute; the CV renders the break title in vi and en. |

`useProfileCompletion.ts` and `PagePreview.vue` were checked and need no change. Completion only counts the list length, and the preview passes data straight to `CvResumeLayout`.

## Command
From repo root:
- `npx vitest run src/models/experience.model.spec.ts src/components/cv/CvResumeLayout.spec.ts src/components/veevalidate/VeeForm.spec.ts`
- Baseline: `git stash -u` → `npx vitest run src/components/veevalidate/VeeForm.spec.ts` ×3 → `git stash pop`
- `npm run test`, `npm run lint`, `npm run build`
- Typecheck: CANNOT RUN (doctrine/MEMORY.md).
- Dev-server compile check: `curl` on the 6 changed source files via http://localhost:5173/resume-vuejs-website/<file>

## Output
`npm run test`:
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn
 Test Files  1 failed | 37 passed (38)
      Tests  2 failed | 246 passed (248)
```
Clean baseline (my diff stashed), `VeeForm.spec.ts` ×3: `2 failed | 15 passed (17)` and `3 failed | 14 passed (17)` (twice). The same tests fail there (`typing then clearing…`, `clicking submit on a pristine form…`, `clicking submit after touching+clearing…`), and which ones fail changes from run to run. So `VeeForm.spec.ts` is flaky on `staging`, and these failures are not caused by this diff. The new tests (`experience.model.spec.ts` 3/3, `CvResumeLayout` career break, `VeeForm` showIf) passed in every run.
`npm run lint`: exit 0.
`npm run build`: `✓ built in 4.89s`.
Dev-server compile: all 6 changed files returned `200`.

## Acceptance
| Criterion | Evidence |
|---|---|
| Create/update a career break sends the correct payload | Round 2: `handleUpdate` now calls `careerBreakPayload`. The spec `builds the payload PageExperience sends` checks that a break with stale `company:'Old'` is sent as `{isCareerBreak:true, careerBreakType:'travel', company:'', position:''}`, and that a normal entry with a stale `careerBreakType` is sent as `{isCareerBreak:false, careerBreakType:''}` with company/position kept. The schema spec accepts the break payload. `_id` decides POST vs PUT as before. **Not exercised live** (see limitation). |
| API 400 shown | No new code: `updateDoc` → `handleBase` already toasts the API error message. Not exercised live. |
| Form: toggle hides/unrequires company/position, shows type select, keeps dates + description | `showIf` on the model plus the VeeForm `showIf` test (real FrmCheckbox toggle → field `display:none` ↔ shown). Schema spec covers the unrequire part. |
| List + preview labels per language | `ExperienceItem` / `CvResumeLayout` use `experienceTitle`. The CvResumeLayout spec checks "Nghỉ việc tạm thời — Du lịch" in vi and "Career break — Travel" in en. |
| Normal entries unchanged | Schema spec: a normal entry still requires company/position. `experienceTitle({company})` returns the company. Old records without the fields → `isCareerBreak` undefined → normal path. |
| Comments per code-comments.md | Added comments: `// LinkedIn's career break types, labels from the backend …` (source of truth = WHY), `// a career break has no company/position … clearing them stops a toggled entry from sending a stale value` (WHY), `// VeeForm hides the field while this returns false (values and validation stay)` (non-obvious contract: v-show, not removal). Round 2 removed the JSDoc on `experienceTitle`, which said WHAT, not WHY. No issue refs, no narrated history. Opt-ins: both OFF. |
| Tests: no new failure | Only the flaky `VeeForm.spec.ts` tests fail, and they fail on the clean baseline too. |

## Limitation (stated plainly)
No live click-through. The Playwright browser at :5173 is logged out and redirected to `#/login`. Logging in or saving would need credentials plus a real API call (seal gate), so the form toggle and payload were checked by unit/component tests only, not on screen.

## Noticed, not done
- `src/utilities/jsonResume.ts` export maps experience to `{ name: e.company, position }`. A career break would export as a work entry with an empty name. JSON Resume has no career-break concept, so this needs a product decision; out of scope.
- The `PageImportLinkedin` experience import doesn't map LinkedIn career breaks.
- `VeeForm.spec.ts` is flaky on `staging` (2–3 of its tests fail at random); this already needs its own issue.

## Seal gate
None in this pass (no commit/push/API write). Ship via `/ship` after verifier SEAL.

## REOPEN round 1 → round 2
Verifier: `evidence/verifier/2026-10-19-issue-235-career-break-reopen.md`. Reasons: (1) no comments row; (2) the payload was proven only by reading the code. Fixes: payload normalization extracted to `careerBreakPayload()` in `src/models/experience.model.ts`, now used by `PageExperience.handleUpdate` and unit-tested. Added the comments row and dropped one WHAT-only JSDoc.
Rerun output:
```
 ✓ src/models/experience.model.spec.ts (4 tests)
 Test Files  1 failed | 37 passed (38)
      Tests  3 failed | 246 passed (249)
```
All 3 failures are in `VeeForm.spec.ts` (`typing then clearing…`, `clicking submit on a pristine form…`, `clicking submit after touching+clearing…`), the same flaky set that also fails on the clean baseline (verifier saw the same in its own baseline run). `npm run lint` exit 0. `npm run build` `✓ built in 4.99s`.
