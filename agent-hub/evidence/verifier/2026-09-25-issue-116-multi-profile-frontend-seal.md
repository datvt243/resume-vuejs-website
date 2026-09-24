# 2026-09-25 — issue-116-multi-profile-frontend — SEAL

- Worker: verifier
- Node: `issue-116-multi-profile-frontend`
- New PM status: SEALED

## Isolation proof
Launched as a fresh subagent via the `Agent` tool (this exact spawn's
task string: "verify agent-hub/evidence/implementer/2026-09-25-issue-116-multi-profile-frontend.md",
handed to a brand-new session that read `agent-hub/haven/workers/verifier/manifest.yaml`,
`SOUL.md`, `doctrine/MEMORY.md`, and `recipes/verify_seal.md` from cold —
no prior turns, no memory of the implementer's session that wrote the
diff under review. `NeverVerifyOwnWork` satisfied by construction.

## Reasoning
- **Branch / `MAIN_EDIT`**: `git branch --show-current` = `feature/issue-116-multi-profile`.
  `git merge-base --is-ancestor staging feature/issue-116-multi-profile` →
  ancestor confirmed. `git log staging..feature/issue-116-multi-profile --oneline`
  = exactly 1 commit (`3fb2352`). `git status` = clean working tree, not
  merged into `staging`/`main`. Clear.
- **Diff scope / proportionality**: `git diff --stat staging feature/issue-116-multi-profile`
  = the exact 10 code files the note lists (plus the evidence note and
  diagram row), 566 insertions / 9 deletions. No unrelated files, no
  opportunistic extra fixes.
- **`src/models/profile.model.ts`**: read directly — `name` field's Yup:
  `yup.string().trim().min(1, 'Tên profile không được trống').max(100, 'Tối đa 100 ký tự').required(...)`.
  Cross-checked against backend `resume-nodejs-api/src/candidate_profile/profile/profile.validate.ts`:
  `Joi.string().min(1).max(100).trim().strict().required()`. Matches
  exactly (min/max/trim/required all line up). All 6 `*Ids` field names
  (`educationIds`/`experienceIds`/`projectIds`/`certificateIds`/`awardIds`/`referenceIds`)
  also match `resume-nodejs-api/src/models/profile.model.ts` exactly.
- **`VeeForm.vue` slot bug claim**: read `src/components/veevalidate/VeeForm.vue`'s
  template directly — it renders `<form>` → fields loop → hidden `_id`
  field → footer with only `<slot name="button">`. No default slot
  exists. The claimed bug (checklist markup silently dropped if placed
  as `<VeeForm>`'s default-slot children) is real, not a fabricated
  justification.
- **`PageProfile.vue` fix verified**: the checklist `<div v-for="s in sections">`
  block is a sibling of `<VeeForm>` inside the same `.block-container`
  div, positioned BEFORE the `<VeeForm ref="refVeeForm" ...>` tag — not
  nested inside it. `handleUpdate(values)` does
  `const data = { ...values, ...selectedIds }` before calling
  `updateDoc(data, ...)` — `selectedIds` (a separate `reactive()`, not
  part of vee-validate's own `values`) is genuinely merged into the
  submit payload, not silently lost.
- **`useActiveProfile.ts` vs `useCvTheme.ts`**: same shape — a `ref`
  seeded from `localStorage.getItem`, a `watch` that calls
  `localStorage.setItem`/`removeItem`, a setter function. Plausible,
  consistent with the working precedent. `useActiveProfile.spec.ts` has
  4 real assertions: default-empty, restore-from-storage,
  persist-with-`await Promise.resolve()` (correctly accounts for
  `watch`'s microtask flush), and clear-on-falsy-id.
- **`PageInformation.vue` / `PagePreview.vue`**: diffs read directly —
  `profiles`, `activeProfileId`, `setActiveProfile`, `activeProfile`
  (computed, falls back to `null`) all defined and used consistently, no
  dead code, no undefined references. `PagePreview.vue`'s
  `filterByProfile(list, idsField)` is applied to all 6 sections
  correctly, client-side as claimed.
- **`PagePublicResume.vue` / `_axios`**: `src/services/axios.ts`'s
  `_axios` destructures `{ url, method, params, data, customURL }` from
  its arg and forwards `params` straight into the underlying
  `instanceAxios({...})` call — `params: profileId ? { profile: profileId } : undefined`
  is a genuinely supported option, not fabricated. Backend
  `candidate_me/index.ts` reads `req.query.profile` as a string and
  forwards it into `handlerGetAboutMe` — field name (`profile`) matches
  end to end.
- **`faLayerGroup`**: confirmed both the import (`src/plugins/initFontAwesomeIcon.js`
  import list) and the `library.add(...)` call include it. Used via
  `icon="fa-layer-group"` on `PageProfile.vue`'s `<ItemTemplate>`, which
  builds `['fa-solid', props.icon]` internally — name matches the
  registered icon.
- **Independent re-run** (see `## Re-run` below): `npm run test -- --run`
  → `Test Files  19 passed (19)` / `Tests  131 passed (131)` — exact
  match to the note. `npm run lint` → exit 0, no output — exact match.
  `npm run build` → `✓ built in 3.34s`, new `PageProfile-DUrjYmBP.js`
  chunk (6.46 kB / gzip 2.98 kB), only the pre-existing `VeeForm`
  chunk-size advisory — exact match. Also independently re-ran the
  disclosed dev-server compile check: started `npm run dev`, curled all
  4 touched `.vue` files at the app's real base path
  (`http://localhost:5173/resume-vuejs-website/src/pages/...`, found via
  the dev server's own startup log) — all returned `200` with real
  transformed Vue-SFC output, no compiler-error overlay.
- **Diagram / `DIAGRAM_DRIFT` / `AppendOnly`**: the `issue-116-multi-profile-frontend`
  row was the last row in the PM status table, appended cleanly after
  `issue-8-jwt-httponly-cookie-migration` (and after the prior
  `issue-116-multi-profile-blocked`/`-unblocked-20260920` rows, none of
  which were edited). Updated that row's own status column
  `sealed_pending_verifier` → `SEALED` in place and appended this SEAL
  summary to the end of the same row — no reordering, no other row
  touched.
- **Disclosed limitation accepted**: no live authenticated browser
  click-through this session (same recurring CDP-tab gap noted in prior
  notes) — per this task's own explicit guidance, this is an acceptable
  disclosed limitation for a REOPEN judgment given the code itself is
  internally correct and consistent with the backend contract as
  documented, cross-checked directly against
  `resume-nodejs-api`'s `profile.model.ts`/`profile.validate.ts`/`candidate_me/index.ts`.

## Missing
None — every acceptance criterion in the implementer's note has citable,
independently-re-derived evidence.

## Re-run
`partial` — re-ran `npm run test -- --run`, `npm run lint`, and
`npm run build` from scratch (numbers matched the note exactly), plus an
independent dev-server curl spot-check of the 4 touched `.vue` files
(also matched, once corrected for the app's `/resume-vuejs-website/`
base path). Did not attempt a live authenticated browser click-through —
matches the note's own disclosed limitation, and this task explicitly
authorized not REOPENing solely for that gap given the backend contract
was independently cross-checked by reading `resume-nodejs-api` source
directly.
