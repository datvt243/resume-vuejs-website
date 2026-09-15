# 2026-09-16 — issue-117-public-slug

- Worker: implementer
- Version: 0.1.0
- Node: `issue-117-public-slug`
- Task (verbatim): "#117" (operator, via `/todo`) — GitHub issue #117,
  "[ENHANCEMENT] Slug tùy chỉnh cho link public thay vì dùng email"
- Status: sealed_pending_verifier

## Hub bytes before
231033 (root=12569, doctrine=27207, active diagram=165140 [measured from
`origin/staging`'s clean state before this node's row was appended],
implementer bundle=14963, verifier bundle=11154)

## Branch
`feature/issue-117-public-slug`, checked out from `origin/staging`.
`feature/*` naming per convention (new feature, kept after merge) — not
`fix/*` since this isn't a bugfix.

## Issue text (summary)
`/resume/:email` (issue #56) exposes the candidate's email directly on a
public URL — privacy risk, scrapeable for spam/phishing. Proposed: a
unique `publicSlug` field, `/resume/:slug` route preferring the slug with
`/resume/:email` kept as a backward-compatible fallback, and explicitly
noted the backend needs a separate issue for the new field + lookup
endpoint.

## Was this actually blocked? (checked before assuming so)
The issue's own text says backend work "cần issue backend riêng" (needs
a separate backend issue) — rather than treat this as an automatic
`blocked` outcome (per the `issue-8-jwt-localstorage-recheck` precedent:
always re-check a cross-repo dependency directly, don't infer staleness),
checked the sibling backend repo at
`/Users/_david/Workspace/Project/resume/resume-nodejs-api`:

```
git log --oneline -5 origin/main
39d7a24 Merge pull request #124 from datvt243/release/v1.5.0
a34e687 chore(release): bump version to v1.5.0
8a572fe Merge pull request #123 from datvt243/feat/issue-120-vanity-slug
445e57e feat(candidate): vanity slug for public profile (#120)
```

The backend ALREADY shipped exactly this (its own issue #120, SEALED
2026-09-14, went through 2 verify rounds, released as v1.5.0, merged to
backend `main` — that repo has its own `deploy.yml` workflow). Read the
commit (`git show 445e57e`) in full to get the real contract:

- `Candidate.slug`: unique, sparse, lowercase, URL-safe, `min(3).max(50)`,
  pattern `^[a-z0-9]+(-[a-z0-9]+)*$` (`src/config/regex.config.ts`'s
  `slugRegex`, `src/config/joi.config.ts`'s `slug` validator).
- Editable via the EXISTING `PATCH /api/v1/candidate/update`
  (`schemaCandidatePatch`, `fnUpdateFields`).
- `GET /api/me/:value` (route/param name unchanged in Express code, just
  now polymorphic) resolves by `slug` FIRST, falls back to `email` — real
  backward compatibility, not something the frontend needs to reimplement
  with 2 routes.
- Duplicate slug → `ConflictError` (409) via the existing generic
  Mongo-duplicate-key handler (real unique index).

**Conclusion: NOT blocked.** Implemented the frontend side against this
real, already-released contract.

## Diff
| File | Change | Why |
|---|---|---|
| `src/routers/index.ts` | `/resume/:email` → `/resume/:slug` (param rename only, same single route entry), comment updated | Matches the backend's real slug-first/email-fallback semantics on ONE path segment — no separate fallback route needed, an old `/resume/<email>` link still matches this exact route pattern unchanged |
| `src/pages/public/PagePublicResume.vue` | `const email = route.params.email` → `const identifier = route.params.slug`; both `api/me/${...}` calls updated; doc comment updated | Passes the URL segment straight through — works for slug OR email, matching the backend |
| `src/pages/dashboard/PageInformation.vue` | Added `slugFields` (own array), `slugDocument` (reactive, seeded `onMounted`), `handleUpdateSlug` (via `updatePatchDoc`), `publicLink` computed, new "Link CV công khai" template block | Lets the user view/set their slug; see design notes below for why this is a SEPARATE small form, not added to the main one |

`git diff --stat`: 3 files, 96 insertions / 15 deletions.

## Design note: why `slug` is NOT in `modalDefault`/the main form
Traced the actual HTTP path before writing any UI: `PageInformation.vue`'s
main "Thông tin cơ bản" form submits via `updateDoc` → `useDocument.ts`
sends **PUT** `candidate/update` when `_id` is truthy. Read the backend's
`fnUpdate` (PUT handler, `src/candidate/candidate.controller.ts`) — it
validates against `schemaCandidate`, a **different, stricter** schema
(`src/candidate/candidate.validate.ts`) that does **not** declare `slug`.
Joi's default `unknown(false)` (confirmed: `getObject()` is a bare
`Joi.object(fields)`, `validateSchema`'s options are only
`{ abortEarly: false }`, no `stripUnknown`/`allowUnknown` override) means
an unknown key in the payload rejects the WHOLE request — sending `slug`
through the main form would break saving firstName/lastName/etc. too, not
just silently drop the slug.

This is the EXACT same failure class already documented at the top of
`PageInformation.vue` itself for the `avatar` field (issue #63) — same
file, pre-existing comment, independently re-confirmed here for `slug`
rather than assumed from the comment alone (read `schemaCandidate`,
`schemaCandidatePatch`, `fnUpdate`, `fnUpdateFields`, and `getObject`/
`validateSchema` directly in the backend repo).

`slug` IS accepted by `schemaCandidatePatch` (`PATCH candidate/update`,
`fnUpdateFields`) — so it's implemented as its own small form using
`updatePatchDoc`, exactly mirroring the already-live `socialMediaFields`/
`handleUpdateSocialNetwork` pattern in the same file.

## Design note: `slugDocument._id`, not just `{ slug: '' }`
`VeeForm.vue`'s own `watch(() => props.document, doc => { setValues(...);
if (!doc._id) reset() })` only takes the `setValues()` branch (the one
that actually seeds vee-validate's real internal state) when `doc._id` is
truthy — otherwise it immediately calls `reset()`, which would wipe the
seeded slug back to the field's `default: ''`. Verified this by reading
`VeeForm.vue` directly rather than assuming the `socialMediaFields`
pattern (which uses a different, DOM-attribute-only `field.value` trick,
NOT `:document`) would transfer unchanged. `slugDocument` therefore
includes `_id` (seeded from `_candidate._id` in `onMounted`) purely to
satisfy this branch — `_id` is never included in `slugFields` itself, so
it's never part of the submitted `values`; `handleUpdateSlug` passes `_id`
separately, matching `handleUpdateSocialNetwork`'s existing pattern.

## Self-caught bug: `publicLink` computed used the wrong base
First version used `window.location.pathname` (the CURRENT page's path,
e.g. `/dashboard/information`) instead of the app's deployed base path,
producing a broken preview link
(`.../dashboard/information#/resume/<slug>` instead of
`.../#/resume/<slug>`). Caught via live CDP check (see Verification),
fixed to `import.meta.env.BASE_URL` (Vite's own runtime constant for the
configured `base`, `vite.config.ts:6` — `/resume-vuejs-website/`),
rebuilt, re-verified correct.

## Command
```
npm run build
```
(run twice — once before the `publicLink` fix, once after)

## Output
```
> resume-vuejs-website@1.9.0 build
> vite build
...
✓ built in 3.24s
```
(second build, after the `publicLink` fix: `✓ built in 3.37s`) — both
runs only the pre-existing "chunks are larger than 500 kB" advisory, no
errors.

Also ran:
```
npm run lint    → exit 0, clean
npm run test    → Test Files  16 passed (16) / Tests  111 passed (111)
```

## Manual UI verification (step 7, UI diff — not an automated test)
All performed live via CDP (port 9888) against the operator's own
already-authenticated real session (`votan.it@gmail.com`), which talks to
the REAL production backend (`https://nodejs-resume-api-ts.onrender.com`
— confirmed via `.env.development.local`'s `VITE_API_URL` override,
takes precedence over `.env.development`'s `localhost:3001`, and no
process listens on 3001 in this sandbox anyway).

1. **Section renders**: navigated to `/dashboard/information`, confirmed
   headings `["Ảnh đại diện","Thông tin cơ bản","Liên kết mạng xã hội",
   "Link CV công khai"]` — new section present.
2. **Initial state** (before any change): slug input empty, `publicLink`
   correctly fell back to email: `.../#/resume/votan.it@gmail.com`.
3. **Set a slug, submit**: typed `votan-test-slug-temp`, clicked "Cập
   nhật" in the slug block specifically — toast `"Updated successfully"`,
   `publicLink` updated to `.../#/resume/votan-test-slug-temp`.
4. **Persistence**: reloaded the dashboard (normal SPA re-visit) — slug
   input showed the saved value, confirming a real server round-trip.
5. **Public page via slug**: navigated to
   `.../#/resume/votan-test-slug-temp` — resolved correctly,
   `.cv-name` = `"Võ Tấn Đạt"` (the real candidate).
6. **Backward compatibility**: navigated to
   `.../#/resume/votan.it@gmail.com` — ALSO still resolved correctly to
   the same candidate, proving the email-fallback path is genuinely
   exercised, not just assumed from reading the backend source.
7. **Clear-to-empty limitation, found and disclosed**: attempted to clear
   the slug back to `""` via the UI — appeared to succeed (input showed
   empty after a reload) but a direct backend query
   (`GET /api/me/votan.it@gmail.com`) proved the slug was STILL
   `"votan-test-slug-temp"` server-side; the earlier "empty" reading was
   a stale local candidate-store cache, not a real clear. Reproduced
   directly with a raw `fetch(...PATCH.../candidate/update..., {slug:
   ""})`: backend returns
   `{"success":false,"errors":{"slug":"slug must not be empty"}}` — Joi's
   `min(3)` rejects an empty string, and the schema has no `.allow('')`
   exception. **There is currently no way to clear a previously-set slug
   back to empty through this endpoint** — a real backend gap, not
   something fixable from this repo.
8. **Disclosed to the operator immediately** (per `NoSilentFailure` — did
   not silently leave the real account with a junk test value, and did
   not guess what the operator would want): used `AskUserQuestion`.
   Operator chose to set a real, meaningful slug (`vo-tan-dat`) via the
   app's own new UI instead. Re-verified after: backend confirms
   `slug:"vo-tan-dat"` (direct `GET /api/me/votan.it@gmail.com` query),
   public page `.../#/resume/vo-tan-dat` resolves correctly.
9. **Second real bug found, pre-existing, NOT introduced by this diff,
   NOT fixed (out of scope)**: a genuine hard reload landing directly on
   `/dashboard/information` (simulated via `Page.navigate` to
   `about:blank` then the target hash URL — a real full SPA reboot, not
   an internal navigation) shows the ENTIRE form empty, including
   `firstName` — a field this diff never touched:
   ```
   EARLY (t=300ms): {"firstName":"","github":"","slug":""}
   LATE  (t=3.3s):  {"firstName":"","github":"","slug":""}
   ```
   Root cause: `App.vue`'s candidate-hydration fetch (`onMounted`, async,
   `GET candidate/:email`) does not block `<RouterView>` from rendering
   child routes — nested pages' own one-time `onMounted` seeding can run
   before the fetch resolves, capture an empty snapshot, and never
   re-seed once the real data arrives (no reactive watch on the store,
   by design — same one-shot pattern used by `document[k]=_candidate[k]`
   for the main form and now `slugDocument`). Proving this with
   `firstName` (untouched by this diff, previously always shown correct
   in every earlier test THIS SESSION — because every earlier test
   reused an already-warm SPA instance, never a genuine hard reload
   directly on a nested route) isolates this as a pre-existing,
   architecture-level gap, not something this diff introduced.
   Confirmed the NORMAL user flow is unaffected: landed on `/` after
   login, waited for the candidate fetch, THEN navigated via a real SPA
   link click to "Thông tin cơ bản" — `firstName:"Võ"`, `slug:"vo-tan-dat"`
   both correct. Recommended as a separate follow-up GitHub issue;
   operator did not ask for a fix in this task, not filed here.

## Acceptance
| Criterion (from issue #117) | Evidence |
|---|---|
| Field for a unique custom slug, editable by the user | "Link CV công khai" section, `slug` field, PATCH round-trip confirmed live (steps 3-4, 8) |
| `/resume/:slug` route resolves by slug | Step 5 |
| `/resume/:email` kept as backward-compatible fallback for old links | Step 6 — same route, same backend, both work |
| No unrelated change | `git diff --stat`: 3 files, 96 insertions / 15 deletions, all directly serving this feature |
| `npm run build` green | `✓ built in 3.37s` (final build) |

## Noticed, not done
1. **Backend: cannot clear `slug` back to empty** (step 7) — Joi
   `min(3)`, no `.allow('')`. Needs a backend-side fix (separate repo,
   separate issue) — a `PATCH` accepting `slug: null`/`''` as an explicit
   "unset" signal, or a dedicated unset endpoint. Not fixable from this
   frontend repo.
2. **Pre-existing hard-reload data race on nested dashboard routes**
   (step 9) — affects the whole `PageInformation.vue` page (and likely
   any other dashboard page following the same one-shot `onMounted`
   seeding pattern from the Pinia store), not specific to `slug`. A real
   fix would mean either blocking `<RouterView>` on the candidate fetch
   in `App.vue`, or making consuming components reactively watch the
   store instead of snapshotting once — a materially bigger, unrelated
   change. Recommended as its own GitHub issue, not filed by this task.
3. No "copy to clipboard" button was added for the public link preview
   (plain text only) — not part of the issue's stated scope, avoided as
   scope creep.

## Seal gate
None — no commit/push/merge in this pass. Merging
`feature/issue-117-public-slug` → `staging` is a separate, later `/ship`
action requiring operator approval.

## Forbidden states check
- `ADHOC_WORK` — node added to `dev-loop.prime-mermaid.md` (`AppendOnly`,
  end of table) before this note. Clear.
- `NO_EVIDENCE` — this note. Clear.
- `EDIT_UNVERIFIED` — build/lint/test run and read back verbatim; every
  functional claim (PATCH round-trip, public route resolution, backward
  compat, the clear-to-empty limitation, the hard-reload race) verified
  live against the real backend, not inferred. Clear.
- `CODE_IN_HAVEN` — only this note + the diagram row (both `.md`) touched
  under `haven/`/`evidence/`. Clear.
- `DIAGRAM_DRIFT` — diagram row added matching this diff. Clear.
- `MAIN_EDIT` — branch is `feature/issue-117-public-slug`, cut from
  `origin/staging`, not `main`/`staging` directly. Clear.
