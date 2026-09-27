# 2026-09-26 - issue-120-import-cv-pdf-linkedin-recheck-20260926

- Worker: implementer
- Version: 0.1.0
- Node: `issue-120-import-cv-pdf-linkedin-recheck-20260926` (new node per LAI-13 — does not edit the prior `issue-120-import-cv-pdf-linkedin` (2026-09-17) or `issue-120-import-cv-pdf-linkedin-recheck-20260918` rows)
- Task (verbatim, via `/todo`): "issue 120: import CV from PDF or LinkedIn export"

## Hub bytes before: 147702

## Branch
None at write time — no code diff produced (blocked outcome), so no branch was cut then. Matches the established pattern for every prior `issue-120*`/`issue-8*` recheck node in this diagram.

**Correction (2026-09-27, appended not rewritten per the no-delete evidence rule):** this note + the diagram row sat uncommitted on `main`'s working tree until the operator asked for them to be committed. Committed via `chore/issue-120-import-cv-pdf-linkedin-recheck-20260926` off `staging` — same hub-only chore-branch pattern as the `2026-09-18` precedent of the same name (PR #137). No `src/` code involved, so no verifier pass needed for this branch.

## Diff
None.

## Recheck findings
Backend repo checked: `/Users/_david/Workspace/Project/resume/resume-nodejs-api` (`git fetch origin` run first).

Real progress since the 2026-09-18 recheck: backend PR #145 ("141-pdf-linkedin-export-parsing-endpoint", commit `3749a62`, merge commit `0f4b729`, 2026-09-20) adds:
- `POST /api/v1/candidate/parse-linkedin-export` (`src/routers/api/v1/candidate.route.ts`), bearer-auth protected, `multipart/form-data` upload (max 20MB ZIP).
- `src/candidate/parseLinkedInExport.service.ts` — parses LinkedIn's "Data export" ZIP (`Education.csv`/`Positions.csv`) into `{ educations: ParsedEducation[], experiences: ParsedExperience[] }`. Stateless: nothing is persisted server-side, matching the issue's own expectation that the frontend maps results into existing create forms for the user to review before saving.
- Best-effort by design (own code comment: LinkedIn's export header casing/spacing shifts across versions; unparseable dates → `null`, never throws).

**However, this endpoint is only on backend `staging`, not backend `main`** (production, `nodejs-resume-api-ts.onrender.com`) — verified directly:
```
$ git merge-base --is-ancestor 0f4b729 origin/main && echo "ON MAIN: YES" || echo "ON MAIN: NO"
ON MAIN: NO
$ git branch -r --contains 0f4b729
  origin/staging
$ git log -1 --oneline origin/main
b274fd4 Merge pull request #143 from datvt243/release/v1.7.0
```
Same class of gap as the 2026-09-20 `issue-8-jwt-localstorage-recheck-20260920` node (CSRF fix landed on backend `staging` only) — this frontend calls production, not backend `staging`, so building against it now would ship a feature that 404s in production.

**Separately, the "PDF" half of the issue title is still completely unaddressed**: the new endpoint only accepts a LinkedIn export ZIP (`AdmZip` + CSV parsing) — no PDF text-extraction library, endpoint, or route exists anywhere in the backend. `git log --all --oneline --grep="pdf" -i` on the backend shows only unrelated PDF-*export* history (CV download/render), nothing about parsing an uploaded PDF's text back into structured fields. The frontend's own upload-CV endpoint (`/upload-cv`, checked in the 2026-09-17 node) remains store-and-download only.

Frontend checked directly (this repo): `grep -rli "linkedin\|import.*cv\|parse-linkedin\|pdf.*import" src/` → only the pre-existing unrelated `socialMedia.linkedin` URL field in `information.model.ts`/`PageInformation.vue` (and its usages in `PagePreview.vue`/`PagePublicResume.vue`/`CvResumeLayout.vue` rendering that same field) — confirmed via `grep -rni "linkedin" src/models/information.model.ts src/pages/dashboard/PageInformation.vue`, both matches are `name: 'socialMedia.linkedin'`. No import-CV plumbing exists to extend.

No diff created (a frontend page calling a not-yet-in-production endpoint would be a fake diff — it would break for the real user on `datvt243.github.io` even if it worked against backend staging). No verifier pass needed (nothing to verify). Issue #120 stays OPEN; revisit once backend PR #145 reaches backend `main`, and note PDF parsing itself would still need a *separate* backend endpoint even after that.

## Command
Not run — no code changed, `TestsBeforeDone` doesn't apply to a no-diff blocked outcome.

## Output
N/A.

## Acceptance
| Criterion | Evidence |
|---|---|
| Backend re-checked directly, not assumed stale from the 2026-09-18 note | `git fetch origin` + `git log --all --oneline --grep` in `resume-nodejs-api`, commit `3749a62`/merge `0f4b729` found |
| Confirmed reached (or not) backend production `main` | `git merge-base --is-ancestor 0f4b729 origin/main` → `ON MAIN: NO`; `git branch -r --contains 0f4b729` → `origin/staging` only |
| Confirmed PDF-parsing scope is still entirely unaddressed | `git log --all --oneline --grep="pdf" -i` shows only unrelated PDF-export history; endpoint source (`parseLinkedInExport.service.ts`) only reads a ZIP via `AdmZip`, no PDF library anywhere in `package.json` |
| Frontend has no existing plumbing to extend | `grep -rli "linkedin\|import.*cv\|parse-linkedin\|pdf.*import" src/` → only the unrelated `socialMedia.linkedin` field |

## Noticed, not done
- Nothing new outside this node's own scope.

## Seal gate
None — no outward-facing action taken.
