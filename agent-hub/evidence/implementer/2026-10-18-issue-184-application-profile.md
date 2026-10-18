# 2026-10-18 - issue-184-application-profile-unblocked-20261018

- Worker: implementer
- Version: 0.1.0
- Node: `issue-184-application-profile-unblocked-20261018` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at the end of the PM table, `IN_PROGRESS`). New node per LAI-13; the 2026-10-16 `issue-184-application-profile` row stays `BLOCKED_ON_BACKEND`.
- Task (verbatim): "#184 [ENHANCEMENT] Gắn profile CV riêng cho từng application — Link each application to a CV profile; from an application open the public link / download PDF for that profile (?profile= already exists). Backend resume-nodejs-api#256 shipped in v1.13.0: Application.profileId (24-hex | null | '' to unlink), 400 application.profileNotFound if not owned/deleted, omitted on update keeps link, GET returns profileId."

## Hub bytes before: 176797

## Branch
`feature/issue-184-application-profile` (already linked to #184 via `gh issue develop`, pulled, then fast-forwarded to `staging` `554a692`; it had 0 commits of its own ahead of `staging`). No edits on `main`/`staging`.

## Backend facts relied on (read from `../resume-nodejs-api` `origin/main`, not assumed)
- `1a2a228` (v1.13.0, backend #256 CLOSED 2026-10-16): `Application.profileId` ObjectId default `null`; Joi `profileId: string 24-hex, allow(null, '')`; create/update 400 `application.profileNotFound` for a profile that is not a non-deleted Profile of the caller; omitted on update keeps the current link.
- `GET /api/me/:identifier/download-pdf` (`src/candidate_me/public-pdf.ts:73`) reads `?profile=`, ATS template only, refuses private CVs.
- Owner `GET /api/v1/download-pdf` (`fnExportPDF`, `src/candidate_me/index.ts:315`) calls `handlerGetAboutMe({ identifier: email, lang })` with **no** `profileId`. It ignores `?profile=`, so it can't serve a per-profile PDF.

## Diff
| File | Why |
|---|---|
| `src/models/application.model.ts` | New `profileId` select field (default `''`, `yup.string().nullable()`); options filled at runtime. `FrmSelect`'s built-in empty option (`value=""`) = unlink, which the backend accepts. |
| `src/pages/dashboard/PageApplication.vue` | `formFields` is now a `computed` that injects the candidate's profiles (`useCandidate({ field: 'profiles', collection: 'profile' })`, same as `PageInformation`/`PagePreview`) as select options. `getProfileLinks(item)`: when the application's `profileId` resolves to an existing profile, it renders a profile-name badge, the public CV link (`router.resolve('public-resume', ?profile=)`, slug → email fallback like `PageInformation.publicLink`), and the public ATS PDF (`api/me/:identifier/download-pdf?template=ats&profile=`). `handleUpdate` drops `profileId` when it points to a profile no longer in the list, so editing an application whose profile was soft-deleted doesn't 400; the backend then keeps the stored link. |
| `src/pages/dashboard/PageApplication.spec.ts` (new) | 4 tests: select options come from profiles; links render only when the profile exists (none for `null` or a deleted id); email fallback with no slug; save omits a since-deleted `profileId` but keeps a valid one. |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npx vitest run src/pages/dashboard/PageApplication.spec.ts`
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
`npx vitest run src/pages/dashboard/PageApplication.spec.ts` (final):
```
      Tests  4 passed (4)
```
`npm run test` (final diff):
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 7ms
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 227 passed (228)
```
`npm run build`:
```
✓ built in 9.26s
```
`npm run lint` (after renaming an unused arg in the spec; the first run reported `PageApplication.spec.ts 70:81 'v' is defined but never used`):
```
> resume-vuejs-website@1.18.0 lint
> eslint src --ext .js,.ts,.vue

lint exit=0
```

## Acceptance
| Criterion | Evidence |
|---|---|
| Each application can be linked to a CV profile (create/edit/unlink) | `profileId` select in `application.model.ts`; options from profiles. Test "fills the profile select options" passes. Unlinking = `FrmSelect` empty option `""`, which backend Joi `allow(null, '')` accepts. |
| From an application, open the public link for that profile | Test "shows public link + PDF only for an application whose profile still exists": `#/cv/dat-vo?profile=p1` |
| From an application, download the PDF for that profile | Same test: href matches `api/me/dat-vo/download-pdf?template=ats&profile=p1`. **Limitation:** ATS template only and public CVs only (see shortcut comment + Noticed). |
| No regression from a deleted profile | Test "omits a since-deleted profile on save" passes; no links for `profileId: 'gone'` |
| Test suite | 227/228. The one failure is `VeeForm > VI \| EN toggle`, which already failed before this diff and was accepted in the #158, #183 and #185 seals. The diff touches no VeeForm file. |
| Build | `✓ built in 9.26s` |
| Lint | `npm run lint` exit 0, no findings |
| Typecheck | CANNOT RUN — pending add-typecheck-script |
| Comments per code-comments.md | 3 comments added, all WHY: model `// options are filled in at runtime…; '' unlinks` (1 sentence, `//`); page `/** */` JSDoc on `getProfileLinks` with a `shortcut:` limit line; `// A since-deleted profile would 400; omitting the field…` (1 sentence). No issue refs. |
| Manual UI check | **NOT DONE.** It would need a real login against the live API (no test credentials in this session). The rendered DOM is covered by the mounted-component spec instead. This is not a click-through. |

## Noticed, not done
- Backend owner `GET /api/v1/download-pdf` ignores `?profile=`. A per-profile PDF for a **private** CV, or in the classic template, needs a backend change (pass `profileId` into `handlerGetAboutMe` in `fnExportPDF`). Not filed; filing is a seal-gate action.
- #184 still carries the `status: waiting-backend` label, which is now stale. Removing it is a GitHub write left for the operator.
- `VeeForm.spec.ts` "VI | EN toggle" failure is still untracked.
- Did not verify that production (Render) is actually running backend v1.13.0. That needs an authenticated real API call.

## Seal gate
None. Nothing was committed, pushed or merged, and no real API call was made. `/ship` is a separate step.

## Status
`sealed_pending_verifier`
