# 2026-10-10 - issue-182-bilingual-cv

- Worker: implementer
- Version: 0.1.0
- Node: `issue-182-bilingual-cv` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim, from issue #182): "[ENHANCEMENT] CV song ngữ Việt/Anh (nhập & hiển thị bản tiếng Anh)" — Backend already stores many fields as `{ vi, en }` and `wrapLocalizedText` (`src/utilities/index.ts`) keeps the `en` half when editing — but the UI has nowhere to enter/edit the English version. Proposal: a VI | EN tab/toggle in forms with localized fields; `?lang=en` for the public link and PDF export (`getLocalizedText(value, lang)` already supports `lang`).

## Hub bytes before: 172540

## Branch
`feature/issue-182-bilingual-cv` — created off freshly pulled `staging` (`cf463f2`) via `gh issue develop 182 --checkout --base staging --name feature/issue-182-bilingual-cv` (`feature/` prefix per `doctrine/MEMORY.md` → Git workflow, new feature). Never on `main`/`staging` while editing.

## Backend contract (read, not assumed)
Read from `resume-nodejs-api` `origin/main` (`c397189`), no backend change needed:
- `src/models/part/index.ts` `localizedTextSchema` = `{ vi, en }`; used by `candidate.introduction`, `generalInformation.career`/`careerGoal`, and `description` of education/experience/project/award/certificate — 8 fields.
- `src/candidate_me/index.ts`: `fnGetAboutMe` (public `GET /api/me/:value`) and `fnExportPDF` (`GET /api/v1/download-pdf`) both do `const lang = req.query['lang'] === 'en' ? 'en' : 'vi'` and resolve localized fields to one string (`resolveLocalizedText`, falls back to `vi`).

## Diff
| File | Why |
|---|---|
| `src/utilities/index.ts` | New `EN_FIELD_SUFFIX` (`_en`), `splitLocalizedText` (strict, no cross-language fallback — `getLocalizedText` would show/save the EN text in an empty VI input), `localizedToForm(doc, names)` → `{ name: vi, name_en: en }`, `localizedFromForm(values, names)` → `{ name: { vi, en } }` minus the `_en` key (not a backend field). `wrapLocalizedText` removed (no callers left). `getDownloadCvUrl` gets a 4th `lang` param (`lang=en` only; vi is the backend default, omitted like `classic`). |
| `src/types/model.type.ts` | `withEnglish(item)` → `[{ ...item, lang: 'vi' }, { ...item, name: '<name>_en', label: '<label> (English)', lang: 'en', valid: same rules .notRequired() }]`. |
| `src/models/{education,experience,project,award,certificate,information,generalInformation}.model.ts` | Wrap the 8 localized fields in `...withEnglish(...)`. |
| `src/components/veevalidate/VeeForm.vue` | VI \| EN button group rendered only when a field has `lang`; fields of the other language hidden with `v-show` (stay mounted → values + validation kept); `!` flag on a language button whose fields have errors (a required VI field is otherwise invisible while on EN). |
| `src/pages/dashboard/Page{Education,Experience,Project,Award,Certificate}.vue`, `PageInformation.vue`, `PageGeneralInformation.vue`, `PageImportLinkedin.vue` | Replace the `original*` ref + `getLocalizedText`/`wrapLocalizedText` pair with `Object.assign(document, localizedToForm(...))` on load and `localizedFromForm(...)` on save. LinkedIn import needs it too: its forms use the same models, so `description_en` must be folded before POST. |
| `src/components/cv/CvResumeLayout.vue` | `lang` prop: localized fields via `getLocalizedText(v, lang)` (EN falls back to VI when empty), section titles/labels/"Present"/"No expiration" from a `LABELS.vi/en` map, English text for the generalInformation select options. Also fixes `generalInformation.career` being rendered raw — it is a `{vi, en}` object in the dashboard store, so Preview showed `{ "vi": … }`. |
| `src/composables/useCvLang.ts` (new) | CV content language, persisted in `localStorage` (`cvLang`), same pattern as `useCvTheme`. |
| `src/pages/dashboard/PagePreview.vue` | Language buttons next to theme; passes `:lang`. |
| `src/pages/dashboard/PageInformation.vue` | "Ngôn ngữ CV cho link này" select; public link gets `?lang=en` (omitted for vi). |
| `src/pages/public/PagePublicResume.vue` | Reads `?lang=` (`resolveCvLang`), forwards `lang: 'en'` to `api/me/:slug`, passes `:lang` to the layout. |
| `src/pages/home/PageHome.vue` | Language select next to the CV template buttons; download URL carries `lang`. |
| `src/pages/dashboard/PageAtsCheck.vue` | "Tải CV mẫu này" link now uses the page's existing `lang` select (same language as the ATS check). |
| Specs | `utilities/index.spec.ts` (wrapLocalizedText tests replaced by split/toForm/fromForm + lang URL), `VeeForm.spec.ts` (+4 toggle tests), `CvResumeLayout.spec.ts` (+3 lang tests), new `useCvLang.spec.ts` (4), new `pages/public/PagePublicResume.spec.ts` (2). |

Not touched: `Header.vue` dropdown download link (stays vi/classic — a plain shortcut; the language choice lives on Home/Preview); `ItemTemplate.vue` dashboard cards (show VI, as before); backend.

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run <each new/changed spec>`
- New specs against `staging`'s `PagePublicResume.vue`, `CvResumeLayout.vue`, `VeeForm.vue` (files restored from backup afterwards) — proves the tests catch the missing behaviour
- `npm run test`
- `npm run lint`
- `npm run build`
- `npx vite --port 5199` + `curl` each changed module (compile check), server stopped afterwards
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)

## Output
Per-spec, with the change:
```
 ✓ src/utilities/index.spec.ts (25 tests) 173ms
 ✓ src/components/cv/CvResumeLayout.spec.ts (5 tests) 687ms
 ✓ src/composables/useCvLang.spec.ts (4 tests) 10ms
 ✓ src/pages/public/PagePublicResume.spec.ts (2 tests) 250ms
```
`VeeForm.spec.ts` with the change: `Tests  2 failed | 13 passed (15)` — the 2 failures are the pre-existing flaky "BUG (real, verified)" tests (see below); all 4 new toggle tests pass.

New specs against the `staging` versions of the 3 components:
```
   × PagePublicResume — ?lang > forwards ?lang=en to the API and renders the English labels 509ms
   × PagePublicResume — ?lang > sends no lang param by default or for an unsupported value 45ms
   × CvResumeLayout > lang > defaults to the Vietnamese text and labels 160ms
   × CvResumeLayout > lang > renders the English text, section titles and option labels for lang="en" 77ms
   × VeeForm > VI | EN toggle > shows the VI field by default and swaps to the EN field on toggle, non-localized fields stay visible 44ms
   × VeeForm > VI | EN toggle > keeps both languages in the submitted values and only requires the VI copy 64ms
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 16ms
      Tests  9 failed | 13 passed (22)
```
(the other 2 of the 9 are the flaky VeeForm tests; "defaults to the Vietnamese…" fails on staging because of the raw `career` object bug.)

`npm run test`:
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 1449ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 161ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 515ms
 Test Files  1 failed | 23 passed (24)
      Tests  3 failed | 163 passed (166)
```
Those 3 are the pre-existing flaky tests documented in the #176-178, #177, #180 and #181 notes (1–3 random failures per run on every branch, including unmodified staging).

`npm run lint`: no output after the script header (exit 0).
`npm run build`:
```
✓ built in 4.58s
```
Dev-server compile check (`base=http://localhost:5199/resume-vuejs-website/`): `200` for `VeeForm.vue`, `CvResumeLayout.vue`, `PagePublicResume.vue`, `PagePreview.vue`, `PageInformation.vue`, `PageGeneralInformation.vue`, `PageHome.vue`, `useCvLang.ts`, `model.type.ts`; no `error` lines in the vite log.

No logged-in browser click-through this session (needs a real account on the Render backend), and no live call to the backend with `?lang=en` — the backend's `?lang` handling is from reading its source (see "Backend contract"). Disclosed, not implied.

## Acceptance
| Criterion | Evidence |
|---|---|
| Forms with localized fields have a VI \| EN toggle to enter/edit the English version | VeeForm toggle tests pass (VI shown by default, EN swaps in, non-localized fields always visible); all 8 localized fields wrapped with `withEnglish` |
| Both languages saved as `{ vi, en }`, English optional | VeeForm "keeps both languages…" passes (`summary`/`summary_en` submitted, only VI required); `localizedFromForm` tests; every page's save path uses it |
| Editing doesn't mix languages | `splitLocalizedText({ en: 'hello' })` → `{ vi: '', en: 'hello' }` |
| Public link supports `?lang=en` | `PagePublicResume.spec` forwards `params: { lang: 'en' }`, renders English; share link adds `lang=en` when English is selected |
| PDF export supports `lang` | `getDownloadCvUrl(host, 'ats', 'abc', 'en')` → `…?template=ats&lang=en&token=abc`; used by Home and ATS-check download links |
| Preview can show the English CV | `CvResumeLayout` lang tests (content, titles, option labels, VI fallback) |
| No regression | `Tests  3 failed | 163 passed (166)`, 3 = known flaky VeeForm tests |
| Build green / lint clean | `✓ built in 4.58s` / exit 0 |
| comments per code-comments.md | JSDoc on new exported helpers (`EN_FIELD_SUFFIX`, `splitLocalizedText` — WHY no fallback, `localizedToForm`, `localizedFromForm`, `withEnglish`), file header on `useCvLang.ts` matching `useCvTheme.ts`, short WHY comments (VeeForm toggle/v-show, `OPTION_LABELS_EN`, `career` stored as object, `?lang` in public page header). No history narration beyond the existing `issue #n` header style these files already use. |

## Noticed, not done
- `VeeForm.spec.ts` flaky tests — still no issue for them.
- `Header.vue` download shortcut is always vi/classic.
- The EN copy of a localized field has no length limit beyond what the VI field had (`career` keeps `max(50)`).

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.
