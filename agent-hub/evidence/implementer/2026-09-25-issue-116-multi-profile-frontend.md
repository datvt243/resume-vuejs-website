# 2026-09-25 — issue-116-multi-profile-frontend

- Worker: implementer
- Version: 0.1.0
- Node: `issue-116-multi-profile-frontend` (new node per LAI-13 — does not
  edit the prior `issue-116-multi-profile-blocked`/
  `issue-116-multi-profile-unblocked-20260920` rows)
- Task (verbatim): "#116" (operator, via `/worker implementer`, 3rd item
  of the operator-approved sequence: `/release` → `#8` → this)

## Hub bytes before
136486 (root=7714, doctrine=27207, active diagram=75448, implementer
bundle=14963, verifier bundle=11154 — `wc -c` per category).

## Branch
`feature/issue-116-multi-profile`, cut from `staging` (after `staging`
had already absorbed the merged `#8` PR #149).

## What backend already provides (verified by reading source directly,
`/Users/_david/Workspace/Project/resume/resume-nodejs-api` @ `main`)
- `profile.model.ts`: `{ _id, name, candidateId, educationIds,
  experienceIds, projectIds, certificateIds, awardIds, referenceIds,
  deletedAt }` — each `*Ids` is an ObjectId array referencing existing
  Education/Experience/Project/Certificate/Award/Reference documents (no
  data duplication), matching the issue's own proposed shape exactly.
- Standard CRUD at `/api/v1/profile` (`GET /`, `POST /create`, `PUT
  /update`, `DELETE /delete/:id`, `POST /restore/:id`), same shape as
  every other `candidate_profile/*` collection this app already talks
  to — `useCandidate`/`useDocument`'s generic field-name handling needed
  zero changes, matching the precedent noted in the `#118`
  application-tracker SEAL.
- `ensureDefaultProfile` (`profile.service.ts`): synthesizes a "Tổng hợp"
  profile containing every existing item's `_id` on first `GET /profile`
  if the candidate has zero profiles yet — existing users see no data
  loss, no frontend-side "seed a default" logic needed.
- `candidate_me/index.ts`'s `handlerGetAboutMe`: optional `?profile=<id>`
  query param on the PUBLIC `GET /api/me/:value` — resolves it (must
  belong to the same candidate) and filters each of the 6 sections to
  `_id: { $in: profileDoc.<section>Ids }`; an invalid/foreign/missing id
  falls back to unfiltered (fail-closed, existing share-links unaffected
  by this change).

## Diff
| File | Why |
|---|---|
| `src/models/profile.model.ts` (new) | Only `name` is a VeeForm-driven field — no existing `modelItem.type` fits "multi-select against dynamically-fetched records" (the 6 `*Ids` arrays), and adding one to the shared `VeeForm.vue` would be a much bigger, riskier change than this feature needs. |
| `src/composables/useActiveProfile.ts` (new) + spec | Which profile is "active" for the public link/PDF export — pure frontend choice, persisted to `localStorage`, mirroring `useCvTheme.ts`'s exact pattern (issue #119's precedent for this exact kind of "owner picks a frontend-only preference, no backend field" feature). |
| `src/pages/dashboard/PageProfile.vue` (new) | CRUD page: list (`ItemTemplate` cards showing name + selected-item counts), create/edit/duplicate/delete, mirrors `PageApplication.vue`'s modal+VeeForm structure. **Caught and fixed one bug before it shipped**: first draft put the checklist inside `<VeeForm>`'s default slot — `VeeForm.vue` has no default slot (only `#button`, confirmed by reading its template), so that content would have silently never rendered. Moved the checklist to be a sibling of `<VeeForm>` inside the same `Modal` instead; `selectedIds` (plain reactive state, not part of vee-validate's own values) is merged into VeeForm's `submitFn` payload in `handleUpdate`. |
| `src/plugins/initFontAwesomeIcon.js` | Registered `faLayerGroup` (used as `PageProfile.vue`'s `ItemTemplate` icon) — checked the `fontawesome-icon-registration-gaps` trap first, per `#118`'s own note about checking this before adding a new icon. |
| `src/routers/index.ts`, `src/pages/_layouts/LayoutDefault.vue` | New `profile` route (`/dashboard/profile` → `PageProfile.vue`) + sidebar nav entry, placed right before "Xem trước / Xuất PDF" since it's directly related. |
| `src/pages/dashboard/PageInformation.vue` | Added a profile picker next to the existing copyable public link; `publicLink` computed now appends `?profile=<id>` when a non-default profile is active — same mechanism issue #119 used for `?theme=`. Falls back to "no filter" if the stored id no longer resolves to a real profile (e.g. deleted). |
| `src/pages/dashboard/PagePreview.vue` | Same picker for the PDF-export/print view. Filtering happens CLIENT-SIDE here (not a `?profile=` server round-trip like the public page) — all 6 sections are already loaded into `cvData` for the live dashboard view, so filtering the already-fetched arrays by the active profile's id arrays is simpler than adding a fetch parameter. |
| `src/pages/public/PagePublicResume.vue` | Reads `route.query.profile` (anonymous visitor's URL) and passes it through as the `profile` query param on the existing `GET api/me/:identifier` call — the backend does the actual filtering/validation server-side, this page just forwards an untrusted string through, same discipline as the existing `?theme=` handling in this same file (never trusted directly, backend re-validates ownership). |

## Command
`npm run test -- --run` (repo root)

## Output
```
 Test Files  19 passed (19)
      Tests  131 passed (131)
   Start at  02:38:12
   Duration  1.89s (transform 670ms, setup 0ms, collect 1.82s, tests 485ms, environment 4.89s, prepare 1.19s)
```

`npm run lint` (repo root) — exit 0, no output.

`npm run build` (repo root):
```
✓ built in 3.33s
```
Only the pre-existing chunk-size advisory (`VeeForm` chunk, unrelated).
New `PageProfile` chunk built (6.46 kB / gzip 2.98 kB).

## Manual dev-server check
No live authenticated browser tab available this session (same recurring
gap noted in several prior evidence notes — only extension background
pages reachable on the CDP debug port, no app tab behind it). Started
`npm run dev` and curled each of the 4 touched/new `.vue` files directly
(`PageProfile.vue`, `PageInformation.vue`, `PagePreview.vue`,
`PagePublicResume.vue`) — all returned `200` with real transformed
Vue-SFC output, no compiler-error overlay, confirming they compile at
runtime (not just at build time) — this is how the VeeForm-slot bug
above would have surfaced too, had it not been caught by reading
`VeeForm.vue`'s template first. Real click-through (creating a profile,
checking boxes, confirming the public link/PDF actually filter) is
recommended before fully trusting the UX, disclosed rather than implied.

## Acceptance
| Criterion | Evidence |
|---|---|
| New `profile` model — CRUD, matches backend Joi schema shape | `src/models/profile.model.ts`; backend `profile.validate.ts` read directly, field names match |
| UI to select/create profiles on Dashboard | `src/pages/dashboard/PageProfile.vue`, routed at `/dashboard/profile`, nav entry added |
| Default "Tổng hợp" profile, no data loss for existing users | Backend's `ensureDefaultProfile` already does this — confirmed by reading `profile.service.ts`, no frontend seeding needed |
| Public share-link + PDF export take a profile parameter | `PageInformation.vue`'s `publicLink` appends `?profile=`; `PagePublicResume.vue` forwards it to the backend; `PagePreview.vue` filters client-side for the dashboard PDF/print view |
| Build/lint/test all green | Quoted above — `✓ built in 3.33s`, lint exit 0/no output, `131 passed (131)` |
| All 4 touched/new `.vue` files compile at runtime, not just build time | Dev-server curl check above, all `200` |

## Noticed, not done
- No live click-through this session (see "Manual dev-server check")
  disclosed rather than implied — the operator manually creating a
  profile, checking a few boxes, and confirming the public link/PDF
  export actually reflect the filtered subset is recommended before
  fully trusting this UX in production.
- `PageProfile.vue` has no dedicated component spec (consistent with the
  existing precedent: `PageApplication.vue` shipped without one too —
  `doctrine/domains/PROJECT.md`'s disclosed trap already covers "all Vue
  components except `VeeForm.vue` untested"). Added a real spec for the
  new `useActiveProfile.ts` composable instead, since that's within
  `doctrine/MEMORY.md`'s actual coverage scope (`stores`/`composables`/
  `utilities`).
- Deleting the LAST remaining profile is allowed with no frontend guard —
  intentional: the backend's own `ensureDefaultProfile` re-synthesizes
  "Tổng hợp" the next time `GET /profile` runs, so there's no real data-
  loss risk, matching how the backend itself already handles this case.
- No restore-from-soft-delete UI added for profiles — matches the
  existing app-wide gap (no collection has restore UI yet, confirmed via
  `grep -rl "restore" src/` returning only spec files), not something new
  introduced by this diff.

## Seal gate
No merge into `staging`/`main` yet — this note covers the implementer
pass only (branch pushed, not merged). Merging is a separate outward-
facing step (`/ship`), covered by the operator's earlier blanket "làm đi"
(do all 3, in order) approval for this session's release → #8 → #116
sequence.
