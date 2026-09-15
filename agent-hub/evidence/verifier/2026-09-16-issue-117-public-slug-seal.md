# 2026-09-16 — issue-117-public-slug (verifier verdict)

- Worker: verifier
- Node: `issue-117-public-slug`
- New PM status: SEALED

## Isolation proof
Fresh subagent, spawned specifically to run `/worker verifier
"agent-hub/evidence/implementer/2026-09-16-issue-117-public-slug.md"` —
no memory of the implementer session that wrote this diff. Task prompt
explicitly framed this as an independent verification pass, distinct
from the implementer's own context. `NeverVerifyOwnWork` satisfied by
construction.

## Reasoning
Read the note first (`evidence/implementer/2026-09-16-issue-117-public-slug.md`),
not truncated, no `...` elisions on functional claims. Then independently
re-derived every claim rather than trusting the prose:

1. **Branch**: `git branch --show-current` → `feature/issue-117-public-slug`.
   Not main/staging. `NoMainEdit` clear.
2. **Diff stat**: `git diff --stat origin/staging` on the 3 named files →
   exactly `96 insertions(+), 15 deletions(-)`, matches the note verbatim.
3. **Read all 3 diffs directly** (not just the note's description):
   - `src/routers/index.ts`: single route entry, `/resume/:email` →
     `/resume/:slug` (param rename only), comment updated. Confirmed via
     `grep -n "resume"` — only one match, no duplicate route.
   - `src/pages/public/PagePublicResume.vue`: `route.params.slug` read
     into `identifier`; both `api/me/${identifier}` calls (GET + POST
     visit) updated.
   - `src/pages/dashboard/PageInformation.vue`: `slugFields` (own array,
     not in `modalDefault`), `slugDocument` (reactive, includes `_id`),
     `handleUpdateSlug`, `publicLink` computed all present; submission
     goes through `updatePatchDoc`, not `updateDoc` — confirmed by
     reading the actual `handleUpdateSlug` function body.
4. **Core design claim** (PUT schema excludes `slug`, PATCH schema
   includes it) — re-derived from the sibling backend repo
   (`/Users/_david/Workspace/Project/resume/resume-nodejs-api`), not
   inferred from the frontend note:
   - `git log --oneline -5 origin/main` → `445e57e feat(candidate):
     vanity slug for public profile (#120)` really present, merged via
     PR #123, released v1.5.0 (PR #124). Real, not fabricated.
   - `src/candidate/candidate.validate.ts`: `schemaCandidatePatch`
     declares `slug`; `schemaCandidate` does not.
   - `src/candidate/candidate.controller.ts`: `fnUpdate` (PUT) validates
     against `schemaCandidate`; `fnUpdateFields` (PATCH) validates
     against `schemaCandidatePatch`.
   - `src/config/joi.config.ts`: `getObject = (fields) =>
     Joi.object(fields)` — bare, no `.unknown()` call.
   - `src/utils/valid.ts`: `validateSchema`'s `validationOptions = {
     abortEarly: false }` only — no `stripUnknown`/`allowUnknown`
     anywhere. Joi's documented default (`unknown(false)`) applies, so an
     unrecognized `slug` key really would reject the whole PUT request.
   Core design claim holds end to end.
5. **`VeeForm.vue` `_id` claim**: read the file directly.
   `watch(() => props.document, doc => { ...; setValues(_newDoc); if
   (!doc._id) { reset() } }, { deep: true })` — `reset()` (which calls
   `resetForm` back to each field's `default`) really does run AFTER
   `setValues()` and really is gated on `doc._id` being falsy. Seeding
   `slugDocument` with `_id` to dodge this branch is a real requirement,
   not invented.
6. **Re-ran build/lint/test myself**:
   - `npm run build` → `✓ built in 3.24s`, only the pre-existing
     chunk-size advisory. Matches.
   - `npm run lint` → exit 0, clean. Matches. (Note: `doctrine/MEMORY.md`
     still says lint "reports 95 real errors" as of its 2026-08-20
     snapshot — that line is stale relative to current reality, already
     contradicted by several other recently-sealed nodes' clean lint
     runs this session; not attributable to this diff, not a REOPEN
     trigger.)
   - `npm run test` → 16 files / 111 tests passed. Matches.
7. **CDP live check (port 9888)**: session still up, operator's real
   authenticated session confirmed (`localStorage.token` present,
   `user.email = "votan.it@gmail.com"`). Did NOT touch the operator's
   existing authenticated tab or type/submit into any form — used
   `Target.createTarget`/`Target.closeTarget` for isolated, read-only
   checks only:
   - `.../#/resume/vo-tan-dat` → `.cv-preview .cv-name` = `"Võ Tấn Đạt"`.
   - `.../#/resume/votan.it@gmail.com` → same, still resolves.
   Both wrapped in the dashboard shell since the viewer is logged into
   their own account (pre-existing, documented behavior in the file's own
   comment — not something this diff introduced). Confirms both the
   vanity-slug path and the email-fallback path are genuinely live.
8. **Disclosed finding (a)** — `src/config/joi.config.ts`'s `slug` export:
   `Joi.string().trim().lowercase().min(3).max(50).pattern(slugRegex)`,
   no `.allow('')`. Real — the can't-clear-to-empty claim holds.
9. **Disclosed finding (b)** — `src/App.vue`: `<component :is="...">`
   wraps `<RouterView />` unconditionally in the template; the candidate
   fetch is an async `onMounted` with no `v-if` gating `RouterView` on a
   loaded state. Real — the hard-reload race is architectural, not
   fabricated.
10. **Forbidden states**: all 6 checked, clear (branch non-main, note
    present, build/lint/test read back verbatim not just claimed, no code
    under `haven/`, diagram row matches the diff, no direct main/staging
    edit).
11. **Proportionality**: diff is exactly what the node needs; the one
    unrelated-looking `mb-[3rem]` class addition is spacing to separate
    the new "Link CV công khai" block from the pre-existing social-media
    block, not scope creep.
12. **Seal gate**: none required this pass (no commit/push/merge — note
    correctly states the `staging` merge is a separate later `/ship`
    action).

## Re-run
`full` — re-ran `npm run build`/`npm run lint`/`npm run test` from
scratch, independently re-derived the cross-repo Joi/schema claim by
reading 4 backend source files directly, read `VeeForm.vue` and `App.vue`
in full, and independently re-verified 2 live URLs via a fresh CDP
target. Justified: this node is unusually design-decision-heavy (cross-
repo dependency, a non-obvious schema-based routing choice, a live
production-data mutation earlier in the session) — higher risk than an
ordinary diff, worth the independent-confirmation cost per "Re-run scope"
exception 2/3.

## Verdict
SEAL.
