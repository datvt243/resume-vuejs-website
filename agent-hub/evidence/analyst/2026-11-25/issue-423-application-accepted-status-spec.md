# Analyst spec — issue #423 (application status `accepted` + allowed transitions)

- Date: 2026-11-25
- Worker: analyst (spec mode, recipe `haven/workers/analyst/recipes/spec_feature.md`)
- Branch: feature/issue-423-application-accepted-status @ c37845b
- Outcome: spec_ready

## Task (verbatim)
GitHub issue #423 https://github.com/datvt243/resume-vuejs-website/issues/423, "feat(application): status `accepted` + chỉ cho chọn bước chuyển hợp lệ".
Context: Backend datvt243/resume-nodejs-api#410 adds an `accepted` status and enforces status transitions for job applications. (That backend issue is CLOSED as of 2026-11-17.)
Expected, in /dashboard/application (src/pages/dashboard/PageApplication.vue, src/models/application.model.ts, i18n):
- New status `accepted` (vi + en label, its own badge color).
- The status select only offers allowed transitions from the saved status: create: any status; same status: allowed; forward (skips allowed): applied → interview → offer → accepted (accepted only from offer); applied/interview/offer → rejected; accepted and rejected are final (select disabled).
- A 400 from the backend for an invalid transition shows its message.
Follow-up of the operator decision on resume-nodejs-api#410 (2026-11-07).

## Doc path
- Updated: `agent-hub/doctrine/features/job-applications.md` (Behavior 7-9, criteria, edge cases, out of scope, changelog row; Status → draft for the #423 part)
- Updated: `agent-hub/doctrine/features/INDEX.md` (row status)

## Sources read
- `agent-hub/doctrine/domains/PROJECT.md` (grep), `agent-hub/doctrine/MEMORY.md` (test commands), `agent-hub/doctrine/features/INDEX.md`, `agent-hub/doctrine/features/job-applications.md`
- `src/models/application.model.ts`, `src/pages/dashboard/PageApplication.vue`, `src/pages/dashboard/PageApplication.spec.ts`
- `src/components/veevalidate/part/FrmSelect.vue`, `src/components/veevalidate/VeeForm.vue` (field binding), `src/types/model.type.ts`
- `src/services/base.ts`, `src/composables/useDocument.ts` (updateDoc)
- `src/i18n/index.ts` (applicationStatus keys), `DESIGN.md` §5.6 + tokens, `tailwind.config` (info / accent tokens)
- `gh issue view 410 -R datvt243/resume-nodejs-api` (CLOSED; rules confirmed identical to the #423 body)

## Code map
- `src/models/application.model.ts:40-53` — `status` select field; static options for the 4 current statuses, default `applied`. Add `accepted` between offer and rejected.
- `src/pages/dashboard/PageApplication.vue:39-41` — `formFields` computed already rewrites `profileId` options per render; the natural place to also rewrite the `status` field's `options` / `disabled` from `document.status` + `document._id` + `isDuplicating`.
- `src/pages/dashboard/PageApplication.vue:62-67` — `isDuplicating` flag: during Duplicate `document._id` is still the source id, so "is create" = `!document._id || isDuplicating`.
- `src/pages/dashboard/PageApplication.vue:72-82` — `statusMeta` badge map + `getStatusMeta` fallback to `applied`; add `accepted` here (free tokens: `bg-info-subtle text-info` / `bg-accent-subtle text-accent`).
- `src/pages/dashboard/PageApplication.vue:88-138` — `handleUpdate`, `showModalEditDoc` / `showModalCreateDoc` / `showModalDuplicateDoc`; they set `document.status` (the saved status).
- `src/components/veevalidate/part/FrmSelect.vue:37,51` — `useAttrs()` + `v-bind="attrs"` on `<select>`, and VeeForm does `v-bind="el"` (VeeForm.vue:204): a `disabled: true` key on the field config reaches the `<select>`; no VeeForm change needed. Form value still comes from vee-validate state, so a disabled select still submits the saved status.
- `src/services/base.ts:76-110` — `_helper.error` already toasts `err.error.message ?? err.message` (+ details) on any non-2xx; `updateDoc` callback (which closes the modal / updates the list) only runs on success. Behavior 9 is existing behavior to keep.
- `src/i18n/index.ts:273-277` (vi) and `:861-865` (en) — `option.applicationStatus.*`; add `accepted` to both.
- `src/pages/dashboard/PageApplication.spec.ts` — VeeForm is stubbed with `fields` prop, so options/disabled are assertable via `findComponent(VeeForm).props('fields')` (same pattern as the existing profile-options test).

## Questions + answers
No blocking question. The issue + backend #410 fix every transition rule. Choices left open on purpose, each bounded by a measurable rule (not invented behavior):
1. Accepted badge color: issue says "its own badge color" → criterion = different from the other four, from DESIGN.md §5.6 semantic tokens (`info` or `accent` are free). Implementer picks.
2. vi/en label wording: not given in either issue → criterion = key exists in both locales. Implementer picks (e.g. en "Accepted").
Derived (not asked), with reasoning:
3. Duplicate counts as create (any status): it sends `POST application/create`, so the backend applies no transition check.
4. Unknown/legacy saved status → treated as `applied` for options: matches the verified edge case "unknown status shown as Applied"; statuses were always limited to the model's 4 options, so this is a theoretical case.

## Isolation proof
Spawned as a separate analyst subagent with only the issue text, branch name and doc pointer from the main session; no implementer reasoning, diff or plan was provided. All anchors above were grep/line-confirmed in this spawn. No code or diagram touched.
