# 2026-11-21 - issue-401-project-type-experience

- Worker: implementer · Version: 0.1.0
- Node: `issue-401-project-type-experience` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS → sealed_pending_verifier)
- Task (verbatim title): "#401 feat(project): phân loại project company/personal và chọn Experience liên kết" — add `type` (company/personal, default personal) and `experienceId` (select from the candidate's experiences, shown + required only for company, `null` for personal) to the project form; show the type and linked Experience; i18n vi/en. AC: company requires an Experience, personal hides it; legacy project (no `type`) shows as personal and edits normally; API 4xx (invalid Experience) shown on the right field; tests for the new model/form. Backend dependency datvt243/resume-nodejs-api#361 is CLOSED (PR #366 → staging 2026-11-05, released v2.6.0 PR #369).
- Status: sealed_pending_verifier

## Branch
`feature/issue-401-project-type-experience`. Created by `gh issue develop 401 --checkout --base staging --name feature/issue-401-project-type-experience` right after `git fetch origin && git checkout staging && git pull origin staging` ("Already up to date."). It is linked to #401, and `git branch --show-current` returns `feature/issue-401-project-type-experience`. The name follows the repo's own `feature/issue-<n>-<slug>` habit (e.g. `feature/issue-405-cv-filename`). The issue title is Vietnamese, so the 3-word kit slug would have been unreadable.
The `.claude/skills/todo/SKILL.md` modification was already uncommitted on `staging` before this task. It was the operator's and is not part of this diff.

## Hub bytes before: 100309
(measured with the `evidence/README.md` command just before adding this node's diagram row)

## Feature doc: `doctrine/features/cv-timeline-sections.md` (Behavior #10, Q8–13 answered by the operator 2026-11-21, analyst pass 0 `evidence/analyst/2026-11-21/project-type-experience-spec.md`, spec_ready, no open questions)

## Acceptance criteria clarified: none
(Round 1 changed the doc's `validation.required` to `validation.selectRequired`; the verifier REOPENed on that. Round 2 reverted it, so the code now matches the doc line 49 as written. See `## Round 2`.)

## Diff
| File | Why |
|---|---|
| `src/models/project.model.ts` | Adds `PROJECT_TYPES` and a `type` select (options `option.projectType.*`, `oneOf`, required, default `personal`). Adds an `experienceId` select: empty `options` (filled by the page), `string().nullable()` plus `.when('type', company → required('validation.selectRequired'))`, `showIf: type === 'company'`. |
| `src/pages/dashboard/PageProject.vue` | `useCandidate({ field: 'experiences', collection: 'experience' })`. `experienceOptions` holds non-career-break experiences as `{ text: 'Company — Position', value: _id }`. `formFields` changed from `shallowRef(model)` to a computed that injects those options (the same pattern as `PageApplication` `profileId`). `handleUpdate` sends `experienceId = null` when type ≠ company and passes an `onError` that calls `experienceErrorOf`. For a company project that maps `BAD_REQUEST` (message), and `VALIDATION_ERROR` whose details are all `experienceId`, to `refVeeForm.setFieldError('experienceId', msg)` and returns true so no toast shows; anything else returns false and toasts. `normalizeProjectType()` runs in edit and duplicate: missing `type` becomes `personal`, and an `experienceId` that is not among the options becomes `''`. The card `#sub` slot gets a type badge (`badgeClass('info')` for company, `neutral` for personal) and, for company, "Company · Position" from the linked experience or a muted `crud.project.experienceRemoved`. |
| `src/services/base.ts` | `_helper.error` first calls the optional `props.onError(err)` and returns early (no toast) when it returns true. |
| `src/composables/useDocument.ts` | `updateDoc(values, callback, onError?)` forwards `onError` to `handleBase`. |
| `src/components/veevalidate/VeeForm.vue` | exposes vee-validate's `setFieldError`. |
| `src/i18n/index.ts` | `field.projectType`, `field.linkedExperience`, `option.projectType.{company,personal}`, `crud.project.experienceRemoved` — vi + en. |
| `src/models/project.model.spec.ts` (new) | 3 tests: type default/options; `showIf`; schema (`company` + `''` rejected with `validation.selectRequired`, `personal` + `''`/`null` ok, `company` + `e1` ok, `type: 'other'` rejected). |
| `src/pages/dashboard/PageProject.spec.ts` | The `useCandidate` mock now answers `experiences` (one job and one career break). The ProjectItem stub renders `#sub`, and the VeeForm stub exposes `setFieldError`. 5 new tests: options exactly `[{ text: 'Acme Corp — Frontend Developer', value: 'e1' }]`; personal sends `experienceId: null`, company keeps `e1`; a legacy project opens as `personal`, a missing link becomes `''`, and a duplicate keeps `e1`; `BAD_REQUEST` puts "X" on the field (onError → true), `VALIDATION_ERROR` puts "Y" on the field, a `name` detail or `INTERNAL_ERROR` returns false (toast), and a personal project's `BAD_REQUEST` returns false; the cards show Personal/Company badges, "Acme Corp · Frontend Developer", and "Kinh nghiệm liên kết đã bị xoá". |
| `src/services/base.spec.ts` | 1 new test: `onError → true` gets the error and no toast shows; `onError → false` still toasts. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row added |

(The `doctrine/features/{INDEX,cv-timeline-sections}.md` edits and `evidence/analyst/2026-11-21/` come from the analyst's pass 0, not from this diff.)

## Command
From `doctrine/MEMORY.md`, repo root: `npx vitest run <file>` (×3), `npm run test`, `npm run lint`, `npm run build`, `npm run typecheck`.

## Output (final run, after all edits)
```
npx vitest run src/models/project.model.spec.ts       Tests  3 passed (3)
npx vitest run src/pages/dashboard/PageProject.spec.ts ✓ (8 tests)  Tests  8 passed (8)
npx vitest run src/services/base.spec.ts               Tests  8 passed (8)

npm run test
 Test Files  62 passed (62)
      Tests  412 passed (412)
npm run lint   → eslint src --ext .js,.ts,.vue, no output, lint exit=0
npm run build  → ✓ built in 4.25s (only the existing >500 kB chunk warning)
npm run typecheck → grep -cE "error TS" = 78 (baseline 78)
```
Honest notes:
- The first `project.model.spec.ts` run failed (`1 failed | 2 passed`). The test itself was wrong: whole-object `isValid` on a partial object failed on unrelated fields (`link` required). I switched to per-field `validateAt`; the code did not change.
- Typecheck lists 17 `src/services/base.ts` errors. That file is in this diff, but every error is on an existing untyped signature: lines 12/16/44/66/69/76 are the parameters of `handleBase`, `handleFrameFetch`, `_helper` and its `success`/`error` arrows, and lines 24/25/34/99 are property reads on `{}`. All of it was already there before. The total equals the 78 baseline, so this diff adds no new error. The other changed files have 0 errors (`grep -E "project|PageProject|useDocument|VeeForm|i18n"` matches only base.ts lines).

## Live check
I started Vite on 5173 myself (`npm run dev -- --port 5173 --strictPort`), plus my own debug Chrome on 9888 with a fresh `--user-data-dir` in the scratchpad. I logged in as `qa.minimal@example.com` (QA account; it has 1 job and 1 career break) and opened `#/dashboard/project` (0 projects):
```
New project:  experienceId select visible=false → choose type=company → visible=true
  type options: ["|Vui lòng chọn","company|Công ty","personal|Cá nhân"], default value personal
  experience options: ["|Vui lòng chọn","6adf41272987df4de8b08a6a|Laidon Group — Frontend Developer (SAPUI5 / TypeScript)"]   ← career break excluded
Save → POST project/create  sent {type:"company", experienceId:"6adf41272987df4de8b08a6a"}  → 201, response data.type "company"
  card: "QA401 Company project Frontend dev 11/2026 - 12/2026 Công ty Laidon Group · Frontend Developer (SAPUI5 / TypeScript) Công nghệ: Vue, TS ..."
Reload → Edit: select value 6adf41272987df4de8b08a6a, form values {type:"company", experienceId:"6adf…"}
Real backend invalid-experience error (Playwright rewrote the outgoing PUT body's experienceId to aaaaaaaaaaaaaaaaaaaaaaaa):
  PUT project/update → 400 {"success":false,"error":{"code":"BAD_REQUEST","message":"Kinh nghiệm làm việc đã chọn không tồn tại hoặc đã bị xoá"}}
  #experienceId-error = "Kinh nghiệm làm việc đã chọn không tồn tại hoặc đã bị xoá"; toast region (role=status, Toasts.vue) empty; modal stays open
Change to personal → experience select hidden → PUT project/update sent {type:"personal", experienceId:null} → 200; card shows "Cá nhân", no experience line
Cleanup: deleted the test project (DELETE 200, 0 projects left). Afterwards I stopped my Vite and Chrome (ports 5173/9888 free).
```
Detours (not product bugs):
- The first save stayed disabled because my script had not filled the required `link` field. I checked with the form's own schema `validate` → `["link: validation.required"]`; this is existing behavior and unrelated to #401.
- An earlier attempt injected a fake `<option>` into the DOM. That left the field `undefined`, which is a test artifact, so I replaced it with the request rewrite above.

Not checked live:
- The deleted-experience card note against real data, since I would have had to delete qa.minimal's job. The spec covers it.
- A `VALIDATION_ERROR` naming `experienceId`. The frontend's own yup rule stops that request before it is sent; the spec covers it.

## Acceptance
| Criterion | Evidence |
|---|---|
| (#401 l.49) model spec: type default `personal` + options; `showIf`; schema company+'' rejected, personal+'' accepted | `project.model.spec.ts` 3 passed (message `validation.selectRequired`, see Acceptance criteria clarified) |
| (#401 l.50) page spec: options from the store; personal → `experienceId: null`; company keeps `e1` + `type`; legacy Edit → `type === 'personal'` | `PageProject.spec.ts` tests "sends experienceId null…" and "opens a legacy project as personal…" — 8 passed |
| (#401 l.51) manual: Experience select hidden → appears on Company; no request until it is chosen (Save stays disabled); POST body `type:'company'` + id; edit to Personal → PUT `experienceId: null` | Live check above. While the experience was empty, Save was disabled (`meta.valid` false) and no request went out. The required message only appears after the field is touched, and the headless run did not capture that text. |
| (#401 l.52) career break excluded, label "Company — Position"; BAD_REQUEST → message on the field, no toast; VALIDATION_ERROR experienceId → field, no toast; any other error → toast | spec tests "offers only real jobs…" and "puts experience save errors under the field…", plus `base.spec.ts` onError test. Live: a real 400 BAD_REQUEST shown under the field, toast region empty |
| (#401 l.53) card: company + e1 → Company badge + "Acme Corp · Frontend Developer"; company + gone → badge + "Experience removed"; no type → Personal | spec test "shows the type badge…"; live card "Công ty Laidon Group · Frontend Developer…", then "Cá nhân" |
| (#401 l.54) none of CvResumeLayout / PagePreview / PagePublicResume / jsonResume touched | `git diff --stat -- <those 4> | wc -l` → 0 |
| (#401 l.55) new keys in vi + en; lint, build, test pass; typecheck ≤ 78, none from this diff | 5 keys × vi + en; lint exit 0; built; 412 passed; 78 = baseline (base.ts errors predate this diff, see Output) |
| Edge l.66 deleted link → Edit shows company with no Experience, save requires a new choice | `normalizeProjectType` clears an id that is not in the options; spec asserts `{type:'company', experienceId:''}`; the required rule blocks the save |
| Edge l.67 no experiences → empty select, save blocked | options `[]` + required rule (not separately tested) |
| Edge l.68 duplicate keeps type + experienceId | spec `showModalDuplicateDoc` → `{type:'company', experienceId:'e1'}` |
| comments per code-comments.md | all WHY, `//` one-liners, no `(#N)`: `// options are filled in at runtime from the candidate's experiences (PageProject)`, `// a project can only belong to a real job, not a career break`, `// the backend's "experience not found" 400 names no field; on a company project it can only be about experienceId`, `// legacy projects have no type; a link to a deleted (or career-break) experience must be re-picked`, base.ts `// a caller that shows the error itself … returns true to skip the toast`, VeeForm `// lets the page put a server-side save error under its field` |

## Supersedes: none
`grep -n "#401" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row.

## Still open: none

## Review
I did not run `/code-review medium` as a skill. Instead I reviewed inline: the touched files in full plus their callers (every `updateDoc`/`handleBase` caller still passes ≤ 2 args or no `onError`, so their behavior is unchanged; other `useCandidate({ field: 'experiences' })` users follow the same pattern).
1. **Correctness, accepted by the spec:** for a company project, any `BAD_REQUEST` on save is treated as the experience error. Operator Q10a chose this. The backend's project create/update throws no other `BAD_REQUEST` for a valid session.
2. **Correctness, low risk, not changed:** `normalizeProjectType` runs against whatever `experiences` are loaded when the modal opens. If the user opens Edit before the experiences list has loaded (first visit, slow API), a valid link reads as missing and gets cleared to `''`. Nothing is lost silently: the select shows empty and the required rule forces a re-pick. The list loads on page mount, at the same time as the projects list that has to exist before an Edit button can be clicked. Listed under Noticed.
3. **Correctness:** when `onError` claims an error, the token-logout check is skipped. It only ever claims `BAD_REQUEST`/`VALIDATION_ERROR`, never a token code, so this is fine.
4. **Cleanup:** `linkedExperience(edu)` is called twice per company card in the template. It is a trivial `find`, so not worth a computed map.

## Noticed, not done
- Possible race in the Edit pre-fill (Review 2). If it shows up, gate `normalizeProjectType` on the experiences having loaded.
- `project.model.ts` `link` is required (`defaultLink`), so a project cannot be saved without a link. This is existing behavior and outside #401.

## Round 2 — REOPEN fix (verdict `evidence/verifier/2026-11-21/issue-401-project-type-experience-reopen.md`)
1. **Criterion rewrite reverted.** `src/models/project.model.ts`: the `experienceId` `.when(company → required(...))` and the `type` `required(...)` both use `_mesRequired` (`'validation.required'`) again; `grep -c selectRequired src/models/project.model.ts` → `0`. `project.model.spec.ts` now asserts `rejects.toThrow('validation.required')`. The feature doc is unchanged, so no `## Feature doc changed` line is needed.
2. **Live proof of the required error under the field.** I started Vite on 5173 and my own debug Chrome on 9888 again, logged in as `qa.minimal@example.com`, opened `#/dashboard/project` → Thêm dự án, and set type=company. I picked the experience, then put the select back to "Vui lòng chọn":
```
{"positionErrorOnBlur":null,"fieldError":"Vui lòng nhập","ariaInvalid":"true","saveDisabled":true}
requests to project/* after a forced Save click: []
```
Screenshot (scratchpad `issue-401-required-error.png`): "Kinh nghiệm liên kết *" has a red border and "Vui lòng nhập" with the error icon under it; Save is disabled. The form only validates on change, never on blur (`positionErrorOnBlur: null` on a plain required text field), so touching and leaving an untouched select shows nothing. That is existing VeeForm/vee-validate behavior and outside #401. Nothing was saved. Afterwards I stopped my Vite and Chrome (`lsof` on 5173/9888 → 0).
3. **Typecheck: the base.ts errors predate this diff, measured.** I made a clean worktree of `origin/staging` @ `1a4ea7b` (node_modules symlinked), ran `npx vue-tsc --noEmit`, and removed the worktree afterwards:
```
staging 1a4ea7b : total error TS = 78, src/services/base.ts = 17
this branch     : total error TS = 78, src/services/base.ts = 17
```

### Output (round 2, verbatim)
```
$ npx vitest run src/models/project.model.spec.ts src/pages/dashboard/PageProject.spec.ts src/services/base.spec.ts
 ✓ src/models/project.model.spec.ts (3 tests) 3ms
 ✓ src/services/base.spec.ts (8 tests) 4ms
 ✓ src/pages/dashboard/PageProject.spec.ts (8 tests) 85ms
 Test Files  3 passed (3)
      Tests  19 passed (19)
$ npm run test
 Test Files  62 passed (62)
      Tests  412 passed (412)
$ npm run lint
exit=0
$ npm run build
✓ built in 3.83s
$ npm run typecheck | grep -cE "error TS"
78
$ npm run typecheck | grep -E "error TS" | grep -vE "^src/services/base.ts" | grep -E "project|PageProject|useDocument|VeeForm|i18n/index"
       0
```
(The lines above are filtered with `grep` to the result lines; the commands are shown exactly as run.)

### Acceptance rows updated by round 2
| Criterion | Evidence |
|---|---|
| (#401 l.49) schema rejects `{ type: 'company', experienceId: '' }` with `validation.required` | `project.model.spec.ts` `rejects.toThrow('validation.required')`, 3 passed |
| (#401 l.51) saving company without an Experience shows the required error under it, no request sent | live: `fieldError "Vui lòng nhập"`, `aria-invalid "true"`, Save disabled, `requests: []`, screenshot |
| typecheck ≤ 78, none in changed files | 78 = staging 78; base.ts 17 = staging 17; 0 in the other changed files |
