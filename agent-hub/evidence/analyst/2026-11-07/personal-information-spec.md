# analyst — personal-information — 2026-11-07

## Task (verbatim)
document personal-information

## Doc
`agent-hub/doctrine/features/personal-information.md` (existing bulk-backfill draft, re-checked per recipe step 4; one correction to Behavior 3, otherwise not rewritten)

## Sources read
- `agent-hub/haven/workers/analyst/SOUL.md`
- `agent-hub/haven/workers/analyst/recipes/spec_feature.md`
- `agent-hub/doctrine/features/INDEX.md`
- `agent-hub/doctrine/domains/PROJECT.md`
- `agent-hub/doctrine/MEMORY.md`
- `src/pages/dashboard/PageInformation.vue`
- `src/models/information.model.ts` (`modalDefault`, `socialMediaPayload`)
- `src/types/model.type.ts` (`defaultDate`, `defaultPhone`, `defaultDescription`, `withEnglish`)
- `src/components/QrCode.vue`
- `src/composables/useDocument.ts` (`updateDoc`, `updatePatchDoc`)
- `src/composables/useCvTheme.ts` (`DEFAULT_THEME = 'classic'`)
- `src/routers/index.ts` (`createWebHashHistory`)
- `src/components/veevalidate/VeeForm.vue`, `src/components/veevalidate/part/FrmDatePicker.vue`

## Re-check vs code
Discrepancy found (round 1): Behavior 3 listed birthday and phone without "(required)", but both are required — `defaultDate` → `yup.number().required` (`src/types/model.type.ts:127`, used at `src/models/information.model.ts:57`); `defaultPhone` → `.required` (`src/types/model.type.ts:197`, used at `src/models/information.model.ts:68`). Returned needs_input. Operator (2026-11-07): keep both required; correct Behavior 3 (option a). Corrected.
Other items match code: 5 blocks; avatar initials/`U`, disabled "coming soon", no avatar sent; seed + re-seed on `candidate._id` watch; first/last max 15/35, gender/marital `0/1` selects, address max 255, intro `withEnglish` optional; save `!!gender`, `!!marital`, `+new Date(birthday)`, `localizedFromForm(['introduction'])`, `updateDoc` (PUT update / POST create without `_id`; missing id → toast but request still sent); social PATCH via `socialMediaPayload` (drops empties); slug trim/lowercase, regex, 3–50, empty allowed, PATCH, server value applied; share block profile select `v-if profiles.length`, QR `qr-code.png`/`.svg`; link `origin + BASE_URL + router.resolve` hash href with `theme` (≠ classic), `profile` (exists), `lang=en`; empty → no link, QR `v-if="value"`.

## Questions + answers
Operator (2026-11-07): "behavior đúng" after the Behavior 3 correction.
1. Gender/marital are sent as `!!value`. Code check (review 2026-11-06): `FrmSelect` passes the change event to vee-validate, which returns the option's bound value (`getBoundValue`, number `0`/`1`), so a picked Female/Single saves as `false` correctly. Open part: the store holds booleans (`gender: true/false`) but the select options are `0`/`1`, so a seeded boolean matches no option. Does the select show "please select" when editing an existing profile? (Not checked live: needs a signed-in session.) → **Answer (operator 2026-11-07):** Bug: verify signed-in and make the select show the saved value — #432
2. When the candidate id is missing, a red "generic error" toast shows but the request is still sent, and since `updateDoc` has no `_id` it goes out as `POST candidate/create`, not `PUT candidate/update` (`useDocument.ts` `updateDoc`). Should it stop? → **Answer (operator 2026-11-07):** Bug: toast only, no request — #433
3. Social link fields have no URL validation. Intended? → **Answer (operator 2026-11-07):** Change: validate http(s) when filled — #434
4. Birthday: if empty, `+new Date('')` is `NaN`. Is birthday required (and does `defaultDate` enforce it)? → **Answer (operator 2026-11-07):** Intended. Birthday is required (enforced by `defaultDate`), so an empty birthday never reaches the API and NaN isn't sent. #435 closed as not planned.
5. The link is shown as text only — there is no "copy" button. Intended? → **Answer (operator 2026-11-07):** Change: add "Copy" — #436
6. Slug uniqueness is checked only by the backend; the error shown is whatever the backend returns. Fine? → **Answer (operator 2026-11-07):** Intended

## Result
status: verified — every open question answered + operator confirmed Behavior.
`Status: verified — confirmed by operator 2026-11-07, see evidence/analyst/2026-11-07/personal-information-spec.md` set in doc + INDEX row; Issues #63, #116, #117, #119, #182, #432, #433, #434, #436 (#435 closed as not planned, not listed). Behavior describes code today; changes tracked by the issues.

## Isolation proof
Separate spawned agent (Agent tool), blank context. Received only the
dispatch prompt (task, operator's "behavior đúng" confirmation, the
operator's answers + issue numbers) and the coordinator's follow-up with
the operator's decision on the Behavior 3 discrepancy. No implementer
reasoning, no main session transcript. All Behavior items re-checked by
reading code myself.
