# 2026-10-16 - issue-184-application-profile (blocked)

- Worker: implementer
- Version: 0.1.0
- Node: `issue-184-application-profile` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table, `BLOCKED_ON_BACKEND`)
- Task (from issue #184): "[ENHANCEMENT] Gắn profile CV riêng cho từng application". Application tracker (#118) and multi-profile (#116) exist but aren't connected. Link each application to a CV profile; from an application, open the public link / download the PDF for that profile (`?profile=` already exists). AI tailoring (#122) later.

## Hub bytes before: 175519

## Branch
`feature/issue-184-application-profile`, created off `origin/staging` (`c35d78f`, fetched and pulled this session) via `gh issue develop 184 --checkout --base staging --name feature/issue-184-application-profile`. Only `agent-hub/` files changed; no `src/` diff.

## Why blocked (read from the backend repo, not assumed)
`../resume-nodejs-api`, after `git fetch`: `origin/main` = `9fa0279` (v1.12.0), `origin/staging` = `3b274ab`.
- `src/models/application.model.ts` (identical on both branches): fields `_id, company, position, appliedDate, status, note, jobLink, candidateId, deletedAt`. **No profile field.** Mongoose strict mode drops any unknown field on save.
- `src/candidate_profile/application/application.validate.ts`: `Joi.object({ _id, company, position, appliedDate, status, note, jobLink, candidateId })`. Joi rejects unknown keys by default, so sending `profileId` on create/update would 400, not just get ignored.
- `git grep -i profile` on `src/**/application*` (both branches): only the `candidate_profile/` folder name. No profile reference.
- Backend `staging`'s `253-record-which-cv` (issue #253, OPEN) is about **visits** (`Visit.profileId`), not applications.
- `gh issue list -R datvt243/resume-nodejs-api --search "application in:title" --state open`: none. **No backend issue tracks this.**

A frontend-only workaround (e.g. storing the profile id in `note`, or in `localStorage` per application) was rejected. It would be fake persistence: not shared across devices, and lost or garbled when the note is edited.

## What the backend needs (proposal for a backend issue, not filed)
- `Application.profileId`: ObjectId, ref profile, default `null`.
- Joi: `profileId: Joi.string().hex().length(24).allow(null, '')`, or the project's `_id`-style helper.
- On create/update: store it only if it is a non-deleted profile owned by the same candidate; otherwise reject or null it. Same ownership rule backend #253 proposes for visits.
- `getAll` returns `profileId` (optionally the profile `name`, so the list needs no second lookup).

## Command
No code changed, so no build/test run applies to this outcome. Read-only commands only: `git fetch`, `git show origin/<b>:<path>`, `git grep`, `gh issue view/list` (backend repo).

## Outward-facing actions
None. Filing the backend issue is a seal-gate action; it's left for operator approval (precedent: `issue-158-import-cv-pdf-waiting-backend` filed backend #234 only after "operator-approved").

## Noticed, not done
- `VeeForm.spec.ts:253` pre-existing failure. Still untracked (see `2026-10-16-issue-158-import-cv-pdf.md`).

## Status
`blocked`: waiting on the backend.

## Follow-up (operator-approved, same session)
Operator chose "File backend issue". Done:
- Filed https://github.com/datvt243/resume-nodejs-api/issues/256, "Link each application to a CV profile (Application.profileId)", label `enhancement`, using the proposal above.
- Commented on #184 linking it (https://github.com/datvt243/resume-vuejs-website/issues/184#issuecomment-6214520154).
- Added label `status: waiting-backend` to #184. Read back: `["enhancement","status: waiting-backend"]`.
